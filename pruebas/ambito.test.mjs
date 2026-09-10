/**
 * Aislamiento entre academias y sesión en el servidor.
 *
 * Esta batería es la contrapartida de haber puesto el aislamiento en el código
 * en vez de en la base de datos. Al elegirlo así se renunció a que el motor lo
 * garantice, y estas comprobaciones son lo que ocupa ese sitio: si alguna se
 * pone roja, una academia puede ver el material de otra.
 *
 * Corre contra SQLite de verdad, con el mismo esquema que se despliega.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ambito, sinSesion, TABLAS_DECLARADAS, BASE } from '../worker/src/ambito.js';
import { registrar, entrar, quienEs, salir, exigirSesion, exigirAdmin } from '../worker/src/auth.js';
import { derivar, claveCorrecta, igualConstante, huella, testigoNuevo, salNueva } from '../worker/src/claves.js';
import { baseDePrueba, sembrarAcademias } from './ayudas/d1-local.mjs';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };
const lanza = async (fn) => { try { await fn(); return false; } catch { return true; } };

const { DB, cruda } = baseDePrueba();
const AHORA = Date.UTC(2026, 8, 8);
sembrarAcademias(cruda, AHORA);

/* --- La regla que sostiene todo lo demás --- */

const raiz = fileURLToPath(new URL('../worker/src/', import.meta.url));
/* Recorre también las subcarpetas. En la primera versión solo miraba la raíz,
   y `admision/raspar.js` se le escapó con sus consultas dentro. Una guarda que
   no mira donde crece el código deja de ser una guarda. */
const recorrer = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  (e.isDirectory() ? recorrer(`${dir}${e.name}/`) : [`${dir}${e.name}`]));

const fueraDeAmbito = recorrer(raiz)
  .filter((f) => f.endsWith('.js') && !f.endsWith('ambito.js'))
  .filter((f) => /\.prepare\s*\(/.test(readFileSync(f, 'utf8')))
  .map((f) => f.replace(raiz, ''));
ok('nadie escribe SQL fuera de ambito.js',
  fueraDeAmbito.length === 0,
  fueraDeAmbito.length ? `→ revisa: ${fueraDeAmbito.join(', ')}` : '→ 1 solo archivo toca la base');

/* --- El ámbito no deja consultar fuera de la academia --- */

const rumbo = ambito(DB, { academiaId: 'rumbo' });
const sigma = ambito(DB, { academiaId: 'sigma' });

const deRumbo = await rumbo.todos('materiales');
const deSigma = await sigma.todos('materiales');

ok('cada academia ve lo suyo',
  deRumbo.some((m) => m.id === 'm-rumbo') && deSigma.some((m) => m.id === 'm-sigma'));
ok('Rumbo no ve el material de Sigma',
  !deRumbo.some((m) => m.id === 'm-sigma'), `→ ${deRumbo.length} materiales`);
ok('Sigma no ve el material de Rumbo',
  !deSigma.some((m) => m.id === 'm-rumbo'));
ok('las dos ven el banco base',
  deRumbo.some((m) => m.id === 'm-base') && deSigma.some((m) => m.id === 'm-base'));

ok('buscar por id ajeno no lo encuentra',
  (await rumbo.uno('materiales', { id: 'm-sigma' })) === null,
  '→ conocer el identificador no sirve de nada');
ok('contar tampoco cruza la frontera', (await rumbo.contar('materiales')) === deRumbo.length);

/* Los tres intentos de saltarse el filtro pasando la academia a mano. */
ok('mandar academia_id en los filtros lanza en vez de obedecer',
  await lanza(() => rumbo.todos('materiales', { academia_id: 'sigma' })));
ok('mandar academia_id al insertar lanza',
  await lanza(() => rumbo.insertar('materiales', { id: 'x', academia_id: 'sigma', tipo: 'resumen', titulo: 'x', curso_id: 'algebra', creado: AHORA })));
ok('una fila no puede cambiarse de academia',
  await lanza(() => rumbo.actualizar('materiales', { academia_id: 'sigma' }, { id: 'm-rumbo' })));

ok('una tabla no declarada no se puede consultar',
  await lanza(() => rumbo.todos('sqlite_master')));
ok('una columna que no existe no llega al SQL',
  await lanza(() => rumbo.todos('materiales', { 'id = 1 OR 1': 1 })),
  '→ los nombres se validan contra el esquema, los valores van ligados');
ok('no se abre un ámbito sin academia', await lanza(() => ambito(DB, {})));

/* --- Escribir también queda dentro --- */

await rumbo.insertar('materiales', {
  id: 'm-nuevo', tipo: 'resumen', titulo: 'Nuevo de Rumbo', origen: 'academia',
  licencia: 'propia', fuente: 'Rumbo', curso_id: 'algebra', publicado: 1, archivado: 0, creado: AHORA,
});
ok('lo creado hereda la academia del ámbito',
  (await rumbo.uno('materiales', { id: 'm-nuevo' }))?.academia_id === 'rumbo');
ok('y no aparece en la otra academia',
  (await sigma.uno('materiales', { id: 'm-nuevo' })) === null);
ok('borrar no alcanza a las filas de otra',
  (await rumbo.borrar('materiales', { id: 'm-sigma' })) === 0
    && (await sigma.uno('materiales', { id: 'm-sigma' })) !== null);
ok('actualizar tampoco',
  (await rumbo.actualizar('materiales', { titulo: 'secuestrado' }, { id: 'm-sigma' })) === 0);

ok('todas las tablas declaran su regla de ámbito',
  Object.values(TABLAS_DECLARADAS).every((t) => ['academia', 'compartida', 'global', 'propia'].includes(t.ambito)),
  `→ ${Object.keys(TABLAS_DECLARADAS).length} tablas`);

/* --- Claves --- */

const sal = salNueva();
const derivada = await derivar('admision2027', sal);
ok('la clave no se guarda, se deriva', derivada !== 'admision2027' && derivada.length === 64);
ok('la misma clave con distinta sal da distinta derivación',
  (await derivar('admision2027', salNueva())) !== derivada);
ok('la clave correcta se reconoce',
  await claveCorrecta('admision2027', { clave_hash: derivada, sal, iteraciones: 210000 }));
ok('la incorrecta no',
  !(await claveCorrecta('admision2028', { clave_hash: derivada, sal, iteraciones: 210000 })));
ok('la comparación no delata por dónde falla',
  igualConstante('abc', 'abc') && !igualConstante('abc', 'abd') && !igualConstante('abc', 'abcd'));
ok('del testigo solo se guarda su huella',
  (await huella('testigo-1')) !== 'testigo-1' && (await huella('testigo-1')) === (await huella('testigo-1')));
ok('dos testigos nunca coinciden', testigoNuevo() !== testigoNuevo());

/* --- Registro y sesión --- */

const base = {
  nombre: 'Estudiante', clave: 'admision2027', anioNacimiento: 2005,
  consintioApoderado: false, aceptoTerminos: true,
};

const nueva = await registrar(DB, { ...base, correo: 'nueva@ejemplo.pe', codigoAcademia: 'RUMBO-2027' }, AHORA);
ok('el código de alumno da una cuenta de estudiante',
  nueva.usuario.rol === 'estudiante' && nueva.usuario.academiaId === 'rumbo' && !nueva.usuario.esAdmin);

const jefa = await registrar(DB, { ...base, correo: 'jefa@ejemplo.pe', codigoAcademia: 'SIGMA-PROF' }, AHORA);
ok('el código de profesor da una cuenta que administra',
  jefa.usuario.esAdmin && jefa.usuario.academiaId === 'sigma',
  '→ el papel lo decide el código, no la petición');

ok('un código inventado no crea nada',
  await lanza(() => registrar(DB, { ...base, correo: 'x@ejemplo.pe', codigoAcademia: '123' }, AHORA)));
ok('el mismo correo no se registra dos veces',
  await lanza(() => registrar(DB, { ...base, correo: 'nueva@ejemplo.pe', codigoAcademia: 'RUMBO-2027' }, AHORA)));
ok('una clave corta no pasa',
  await lanza(() => registrar(DB, { ...base, correo: 'z@ejemplo.pe', clave: 'corta', codigoAcademia: 'RUMBO-2027' }, AHORA)));
ok('sin aceptar los términos no se registra',
  await lanza(() => registrar(DB, { ...base, correo: 'z@ejemplo.pe', aceptoTerminos: false, codigoAcademia: 'RUMBO-2027' }, AHORA)));
ok('un menor sin permiso de apoderado no se registra',
  await lanza(() => registrar(DB, { ...base, correo: 'z@ejemplo.pe', anioNacimiento: 2012, codigoAcademia: 'RUMBO-2027' }, AHORA)));
ok('un menor con permiso sí',
  (await registrar(DB, { ...base, correo: 'menor@ejemplo.pe', anioNacimiento: 2012, consintioApoderado: true, codigoAcademia: 'RUMBO-2027' }, AHORA)).usuario.id.length > 0);

/* La derivación de la clave nunca sale, ni siquiera a su dueño. */
ok('la respuesta no lleva la clave ni la sal',
  !JSON.stringify(nueva).match(/clave_hash|"sal"|iteraciones/i));

const sesionAbierta = await entrar(DB, { correo: 'nueva@ejemplo.pe', clave: 'admision2027' }, AHORA);
ok('se entra con la clave correcta', Boolean(sesionAbierta.token));
ok('el testigo no se parece al anterior', sesionAbierta.token !== nueva.token);

ok('el correo que no existe y la clave mala dan el mismo mensaje',
  await (async () => {
    const m = async (datos) => { try { await entrar(DB, datos, AHORA); return null; } catch (e) { return e.message; } };
    return (await m({ correo: 'nadie@ejemplo.pe', clave: 'x' })) === (await m({ correo: 'nueva@ejemplo.pe', clave: 'mala' }));
  })(),
  '→ si no, el formulario dice qué correos tienen cuenta');

/* --- Lo que el cliente ya no puede falsear --- */

const dentro = await quienEs(DB, sesionAbierta.token, AHORA);
ok('la academia sale de la sesión', dentro.academiaId === 'rumbo');
ok('esAdmin sale de la sesión y no de la petición', dentro.esAdmin === false);

const { datos: suyo } = await exigirSesion(DB, sesionAbierta.token, AHORA);
ok('el ámbito de la sesión ya viene ligado a su academia', suyo.academiaId === 'rumbo');
ok('un alumno no entra al panel', await lanza(() => exigirAdmin(DB, sesionAbierta.token, AHORA)));
ok('la coordinación sí', (await exigirAdmin(DB, jefa.token, AHORA)).sesion.esAdmin === true);

ok('un testigo inventado no abre nada', (await quienEs(DB, 'testigo-falso', AHORA)) === null);
ok('sin testigo tampoco', (await quienEs(DB, '', AHORA)) === null);

const VENCIDA = AHORA + 31 * 24 * 60 * 60 * 1000;
ok('una sesión vencida deja de valer', (await quienEs(DB, sesionAbierta.token, VENCIDA)) === null);
ok('y se borra en vez de quedarse ahí',
  (await sinSesion(DB).sesionPorTestigo(await huella(sesionAbierta.token))) === null);

const otra = await entrar(DB, { correo: 'nueva@ejemplo.pe', clave: 'admision2027' }, AHORA);
await salir(DB, otra.token);
ok('al salir el testigo deja de servir de inmediato',
  (await quienEs(DB, otra.token, AHORA)) === null);

/* --- Fuerza bruta --- */

const victima = await registrar(DB, { ...base, correo: 'victima@ejemplo.pe', codigoAcademia: 'RUMBO-2027' }, AHORA);
ok('la cuenta nueva entra sin problema', Boolean(victima.token));
for (let i = 0; i < 5; i += 1) {
  try { await entrar(DB, { correo: 'victima@ejemplo.pe', clave: `intento-${i}` }, AHORA); } catch { /* previsto */ }
}
const bloqueada = await (async () => {
  try { await entrar(DB, { correo: 'victima@ejemplo.pe', clave: 'admision2027' }, AHORA); return null; }
  catch (e) { return e.message; }
})();
ok('a los cinco intentos la cuenta se bloquea un rato',
  Boolean(bloqueada?.includes('intentos')), `→ "${bloqueada}"`);
ok('y con la clave correcta se vuelve a entrar cuando pasa el bloqueo',
  Boolean((await entrar(DB, { correo: 'victima@ejemplo.pe', clave: 'admision2027' }, AHORA + 16 * 60 * 1000)).token));

/* --- El banco base es de todas y de ninguna --- */

ok(`el identificador del banco común es "${BASE}"`, BASE === 'base');

/* --- Las tablas de admisión --- */

/* Lo raspado entra en cuarentena: `confirmado` en NULL significa que nadie ha
   mirado esa fila, y mientras siga así no se le sirve a ningún alumno. */
cruda.prepare(`INSERT INTO admision_datos
  (universidad_id, proceso, carrera_id, carrera, area, vacantes, postulantes, corte, fuente, obtenido)
  VALUES ('unmsm','2027-I','sistemas','Ingeniería de Sistemas','B',45,1234,1187,'https://ejemplo.pe/a.pdf',?)`)
  .run(AHORA);
const enCuarentena = cruda.prepare(
  'SELECT COUNT(*) AS n FROM admision_datos WHERE confirmado IS NULL').get();
ok('lo raspado entra sin confirmar', Number(enCuarentena.n) === 1,
  '→ y así no se le sirve a ningún alumno');

ok('la misma carrera no se duplica al volver a raspar',
  (() => {
    try {
      cruda.prepare(`INSERT INTO admision_datos
        (universidad_id, proceso, carrera_id, carrera, area, vacantes, postulantes, corte, fuente, obtenido)
        VALUES ('unmsm','2027-I','sistemas','Ingeniería de Sistemas','B',45,1234,1187,'https://ejemplo.pe/a.pdf',?)`)
        .run(AHORA);
      return false;
    } catch { return true; }
  })(),
  '→ la clave es (universidad, proceso, carrera)');

cruda.prepare('INSERT INTO admision_huellas (url, huella, visto) VALUES (?, ?, ?)')
  .run('https://admision.unmsm.edu.pe/portal/', 'abc123', AHORA);
ok('la huella del portal se guarda para comparar mañana',
  cruda.prepare('SELECT huella FROM admision_huellas WHERE url = ?')
    .get('https://admision.unmsm.edu.pe/portal/').huella === 'abc123');

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
