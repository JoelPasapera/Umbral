/**
 * Aislamiento entre academias.
 *
 * Es la prueba más importante de todo el proyecto para un producto vendido a
 * varias academias. Una fuga de datos de un cliente a otro no es un fallo:
 * es el final del negocio. Todo lo demás se puede arreglar con un despliegue.
 *
 * La regla que se verifica una y otra vez: **la academia sale de la sesión,
 * nunca de lo que manda el cliente.**
 */
import { responder } from '../src/data/mock/fixtures.js';
import { ROLES, alcanza, resolverCodigo } from '../src/data/mock/tenants.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };
const debeFallar = async (n, accion, fragmento) => {
  try { await accion(); ok(n, false, '→ no lanzó error'); }
  catch (e) { ok(n, !fragmento || e.message.includes(fragmento), `→ "${e.message}"`); }
};

const entrar = (correo, clave) => responder('auth/entrar', { correo, clave });

const rumboDueno = await entrar('admin@umbral.pe', 'catalogo2027');
const rumboAlumno = await entrar('estudiante@umbral.pe', 'admision2027');
const sigmaDueno = await entrar('coordinacion@sigma.pe', 'sigma2027xx');
const sigmaAlumna = await entrar('alumna@sigma.pe', 'sigma2027xx');

/* --- Identidad --- */
ok('cada cuenta pertenece a su academia',
  rumboDueno.usuario.academiaId === 'rumbo' && sigmaDueno.usuario.academiaId === 'sigma');
ok('los roles llegan al cliente',
  rumboAlumno.usuario.rol === ROLES.ALUMNO && sigmaDueno.usuario.rol === ROLES.DUENO);
ok('la jerarquía de roles funciona',
  alcanza(ROLES.DUENO, ROLES.PROFESOR) && !alcanza(ROLES.ALUMNO, ROLES.PROFESOR));

/* --- Nadie entra sin código --- */
await debeFallar('no se puede registrar sin código',
  () => responder('auth/registrar', {
    correo: 'intruso@x.pe', clave: 'clave12345', nombre: 'X',
    anioNacimiento: 2000, aceptaTerminos: true,
  }), 'código');
await debeFallar('un código inventado no vale',
  () => resolverCodigo('NO-EXISTE'), 'no es válido');

/* --- El rol y la academia no se pueden pedir --- */
const trepador = await responder('auth/registrar', {
  correo: 'trepa@x.pe', clave: 'clave12345', nombre: 'T', anioNacimiento: 2000,
  aceptaTerminos: true, codigoAcademia: 'RUMBO-2027',
  rol: ROLES.DUENO, esAdmin: true, academiaId: 'sigma',
});
ok('no se puede pedir el rol al registrarse', trepador.rol === ROLES.ALUMNO, `→ ${trepador.rol}`);
ok('no se puede elegir la academia al registrarse', trepador.academiaId === 'rumbo',
  `→ ${trepador.academiaId}`);

/* --- El panel solo muestra lo propio --- */
const panelRumbo = await responder('admin/panel', { token: rumboDueno.token });
const panelSigma = await responder('admin/panel', { token: sigmaDueno.token });
ok('cada panel dice de qué academia es',
  panelRumbo.academia === 'Academia Rumbo' && panelSigma.academia === 'Academia Sigma');
ok('el material de Sigma no aparece en el panel de Rumbo',
  !panelRumbo.materiales.some((m) => m.academiaId === 'sigma'));
ok('el material de Rumbo no aparece en el panel de Sigma',
  !panelSigma.materiales.some((m) => m.academiaId === 'rumbo'));

/* --- Conociendo el identificador tampoco --- */
const suyoDeSigma = panelSigma.materiales[0].id;
await debeFallar('otra academia no puede archivar lo tuyo',
  () => responder('admin/archivar', { token: rumboDueno.token, id: suyoDeSigma }), 'no existe');
await debeFallar('otra academia no puede despublicar lo tuyo',
  () => responder('admin/publicar', { token: rumboDueno.token, id: suyoDeSigma, publicado: false }), 'no existe');
await debeFallar('otra academia no puede reordenar lo tuyo',
  () => responder('admin/reordenar', { token: rumboDueno.token, ids: [suyoDeSigma] }), 'no existen');

// El mensaje no debe confirmar que el elemento existe en otro sitio: eso ya
// sería una fuga, aunque no se pueda tocar.
let mensaje = '';
try { await responder('admin/archivar', { token: rumboDueno.token, id: suyoDeSigma }); }
catch (e) { mensaje = e.message; }
ok('el error no revela que existe en otra academia',
  !/otra|ajena|academia|permiso/i.test(mensaje), `→ "${mensaje}"`);

/* --- Lo que crea una academia queda en la suya --- */
const creada = await responder('admin/material/crear', {
  token: sigmaDueno.token, titulo: 'Prueba de fuga', cursoId: 'algebra', temaId: 't',
  tipo: 'enlace', url: 'https://ejemplo.pe/', publicado: true,
});
ok('lo creado hereda la academia del que lo crea', creada.academiaId === 'sigma');
const rumboTrasCrear = await responder('admin/panel', { token: rumboDueno.token });
ok('lo nuevo de Sigma no aparece en Rumbo',
  !rumboTrasCrear.materiales.some((m) => m.id === creada.id));

/* --- El alumno ve lo suyo más el banco base --- */
const verRumbo = await responder('estudio/materiales', { token: rumboAlumno.token });
const verSigma = await responder('estudio/materiales', { token: sigmaAlumna.token });
ok('el alumno de Rumbo no ve material de Sigma',
  !verRumbo.some((m) => m.titulo.includes('Sigma')), `→ ${verRumbo.length} materiales`);
ok('la alumna de Sigma sí ve el suyo',
  verSigma.some((m) => m.titulo.includes('Sigma')), `→ ${verSigma.length} materiales`);
ok('las dos academias ven el banco base',
  verRumbo.length > 0 && verSigma.length > verRumbo.length);
await debeFallar('sin sesión no se ve nada',
  () => responder('estudio/materiales', {}), 'sesión');

/* --- Presupuesto de IA por academia --- */
const presuRumbo = await responder('ia/presupuesto', { token: rumboDueno.token });
const material = 'Una identidad trigonometrica es una igualdad valida para todo valor del angulo en el que ambos miembros estan definidos. Las identidades pitagoricas salen de la circunferencia unitaria y de ellas se derivan las demas.';
await responder('ia/generar', {
  token: sigmaDueno.token, material, cursoId: 'algebra', temaId: 'exponentes',
});
const presuRumboDespues = await responder('ia/presupuesto', { token: rumboDueno.token });
ok('gastar en una academia no consume el presupuesto de otra',
  presuRumbo.usado === presuRumboDespues.usado, `→ Rumbo sigue en ${presuRumboDespues.usado}`);

const colaSigma = await responder('ia/cola', { token: sigmaDueno.token });
const colaRumbo = await responder('ia/cola', { token: rumboDueno.token });
ok('los borradores generados no cruzan de academia',
  colaSigma.borradores.length > 0 && colaRumbo.borradores.length === 0,
  `→ Sigma ${colaSigma.borradores.length}, Rumbo ${colaRumbo.borradores.length}`);
await debeFallar('otra academia no puede aprobar tus borradores',
  () => responder('ia/decidir', {
    token: rumboDueno.token, id: colaSigma.borradores[0].id, decision: 'aprobar',
  }), 'pendiente');

/* --- Un alumno no gestiona contenido --- */
await debeFallar('un alumno no abre el panel',
  () => responder('admin/panel', { token: rumboAlumno.token }), 'profesores');
await debeFallar('un alumno no genera preguntas',
  () => responder('ia/generar', { token: rumboAlumno.token, material, cursoId: 'algebra', temaId: 't' }),
  'profesores');

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
