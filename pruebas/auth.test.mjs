import {
  registrarCuenta, iniciarSesion, usuarioDeSesion,
  cerrarSesionServidor, recuperarClave, confirmarAdmin, CUENTA_DEMO,
} from '../src/data/mock/auth.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };
const falla = async (n, accion, fragmento) => {
  try { await accion(); ok(n, false, '→ no lanzó error'); }
  catch (e) { ok(n, !fragmento || e.message.includes(fragmento), `→ "${e.message}"`); }
};

const ANIO = new Date().getFullYear();
const base = {
  nombre: 'Prueba', aceptaTerminos: true, anioNacimiento: ANIO - 20,
  codigoAcademia: 'RUMBO-2027',
};

// --- Registro ---
await falla('rechaza correo mal formado',
  () => registrarCuenta({ ...base, correo: 'no-es-correo', clave: 'clave12345' }), 'formato');
await falla('rechaza contraseña corta',
  () => registrarCuenta({ ...base, correo: 'a@b.pe', clave: 'corta' }), '8 caracteres');
await falla('exige aceptar los términos',
  () => registrarCuenta({ ...base, aceptaTerminos: false, correo: 'b@b.pe', clave: 'clave12345' }), 'términos');

// --- Edad ---
await falla('bloquea a menores de 14',
  () => registrarCuenta({ ...base, anioNacimiento: ANIO - 12, correo: 'c@b.pe', clave: 'clave12345' }), '14 años');
await falla('pide permiso del apoderado entre 14 y 17',
  () => registrarCuenta({ ...base, anioNacimiento: ANIO - 16, correo: 'd@b.pe', clave: 'clave12345' }), 'apoderado');
const menor = await registrarCuenta({
  ...base, anioNacimiento: ANIO - 16, permisoApoderado: true, correo: 'e@b.pe', clave: 'clave12345',
});
ok('acepta a un menor con permiso', menor.id !== undefined);

// --- Datos que salen al cliente ---
ok('el usuario público no lleva contraseña ni sal',
  !('resumen' in menor) && !('sal' in menor) && !('clave' in menor));
ok('el usuario público no revela el año de nacimiento', !('anioNacimiento' in menor));

// --- Privilegios ---
const trepador = await registrarCuenta({
  ...base, correo: 'f@b.pe', clave: 'clave12345', esAdmin: true, is_admin: true, rol: 'dueno',
});
ok('no se puede pedir ser administrador al registrarse', trepador.esAdmin === false);
ok('el rol lo decide el código, no la petición', trepador.rol === 'alumno', `→ ${trepador.rol}`);

// --- Nadie entra sin invitación ---
await falla('sin código de academia no hay cuenta',
  () => registrarCuenta({ ...base, codigoAcademia: undefined, correo: 'h@b.pe', clave: 'clave12345' }),
  'código');
await falla('un código inventado no sirve',
  () => registrarCuenta({ ...base, codigoAcademia: 'NO-EXISTE', correo: 'i@b.pe', clave: 'clave12345' }),
  'código');

// --- Entrar ---
await falla('duplicar correo no se permite',
  () => registrarCuenta({ ...base, correo: 'f@b.pe', clave: 'clave12345' }), 'Ya existe');

const { token, usuario } = await iniciarSesion(CUENTA_DEMO);
ok('la cuenta de prueba entra', usuario.correo === CUENTA_DEMO.correo);
ok('la sesión resuelve al usuario', (await usuarioDeSesion({ token }))?.id === usuario.id);
ok('el administrador se pregunta al servidor', (await confirmarAdmin({ token })).esAdmin === false);

// --- Fuga por mensajes ---
let mensajeInexistente = '', mensajeClaveMala = '';
try { await iniciarSesion({ correo: 'nadie@x.pe', clave: 'x' }); } catch (e) { mensajeInexistente = e.message; }
try { await iniciarSesion({ correo: CUENTA_DEMO.correo, clave: 'incorrecta' }); } catch (e) { mensajeClaveMala = e.message; }
ok('no revela si el correo existe', mensajeInexistente === mensajeClaveMala, `→ "${mensajeInexistente}"`);

const r1 = await recuperarClave({ correo: CUENTA_DEMO.correo });
const r2 = await recuperarClave({ correo: 'nadie@x.pe' });
ok('la recuperación responde siempre igual', r1.mensaje === r2.mensaje);

// --- Bloqueo por intentos ---
const victima = 'g@b.pe';
await registrarCuenta({ ...base, correo: victima, clave: 'clave12345' });
let bloqueado = '';
for (let i = 0; i < 6; i += 1) {
  try { await iniciarSesion({ correo: victima, clave: 'mala' }); } catch (e) { bloqueado = e.message; }
}
ok('bloquea tras varios intentos', bloqueado.includes('Demasiados intentos'), `→ "${bloqueado}"`);
await falla('el bloqueo aguanta aunque la clave sea buena',
  () => iniciarSesion({ correo: victima, clave: 'clave12345' }), 'Demasiados');

// --- Salir ---
await cerrarSesionServidor({ token });
ok('el token deja de valer al salir', (await usuarioDeSesion({ token })) === null);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
