/**
 * Entrada con Google.
 *
 * Lo que se protege aquí es una sola regla, y es la que sostiene todo el
 * modelo multiacademia: **Google autentica, no registra.** Si entrar con
 * Google creara la cuenta sola, cualquiera con una cuenta de Google entraría y
 * vería el material por el que paga una academia.
 */
import { responder } from '../src/data/mock/fixtures.js';

/** Fabrica un ID token con la forma real: cabecera, carga y firma. */
const credencial = (carga) =>
  `eyJhbGciOiJSUzI1NiJ9.${Buffer.from(JSON.stringify(carga)).toString('base64url')}.firma`;
const CONOCIDA = credencial({ sub: 'g-1001', email: 'estudiante@umbral.pe', given_name: 'Joel', email_verified: true });
const NUEVA = credencial({ sub: 'g-2002', email: 'camila@ejemplo.pe', given_name: 'Camila', email_verified: true });

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };
const falla = async (n, accion, fragmento) => {
  try { await accion(); ok(n, false, '→ no lanzó error'); }
  catch (e) { ok(n, !fragmento || e.message.includes(fragmento), `→ "${e.message}"`); }
};

// --- Sin credencial válida no pasa nada ---
await falla('sin credencial no entra nadie', () => responder('auth/google', {}), 'credencial');
await falla('una credencial inventada se rechaza',
  () => responder('auth/google', { credencial: 'esto-no-es-un-jwt' }), 'formato');
await falla('un correo sin verificar se rechaza',
  () => responder('auth/google', {
    credencial: credencial({ sub: 'g-9', email: 'x@ejemplo.pe', email_verified: false }),
  }), 'verificado');

// --- Identidad ya vinculada: entra directo ---
const conocida = await responder('auth/google', { credencial: CONOCIDA });
ok('una identidad conocida entra sin más', conocida.necesitaCodigo === false && Boolean(conocida.token));
ok('y entra a su propia academia', conocida.usuario.academiaId === 'rumbo',
  `→ ${conocida.usuario.academia}`);

// --- Identidad nueva: NO se crea nada ---
const nueva = await responder('auth/google', { credencial: NUEVA });
ok('una identidad nueva no entra sola', nueva.necesitaCodigo === true);
ok('no devuelve sesión, solo un pase', !nueva.token && Boolean(nueva.pase),
  '→ el pase no da acceso a nada');
ok('devuelve el perfil para saludar', Boolean(nueva.perfil?.nombre));

// El pase no sirve como token de sesión en ninguna parte.
ok('el pase no vale como sesión', (await responder('auth/sesion', { token: nueva.pase })) === null);
await falla('el pase no abre el panel',
  () => responder('admin/panel', { token: nueva.pase }), 'sesión');

// --- Completar exige lo mismo que el registro normal ---
await falla('sin código de academia no se completa',
  () => responder('auth/google/completar', {
    pase: nueva.pase, anioNacimiento: 2007, aceptaTerminos: true, permisoApoderado: true,
  }), 'código');
await falla('con un código inventado tampoco',
  () => responder('auth/google/completar', {
    pase: nueva.pase, codigoAcademia: 'NO-EXISTE', anioNacimiento: 2007,
    aceptaTerminos: true, permisoApoderado: true,
  }), 'código');
await falla('sin aceptar términos tampoco',
  () => responder('auth/google/completar', {
    pase: nueva.pase, codigoAcademia: 'RUMBO-2027', anioNacimiento: 2007, aceptaTerminos: false,
  }), 'términos');
await falla('un menor de 14 tampoco',
  () => responder('auth/google/completar', {
    pase: nueva.pase, codigoAcademia: 'RUMBO-2027', anioNacimiento: new Date().getFullYear() - 12,
    aceptaTerminos: true,
  }), '14 años');

// --- Con todo en regla, entra ---
const listo = await responder('auth/google/completar', {
  pase: nueva.pase, codigoAcademia: 'RUMBO-2027',
  anioNacimiento: new Date().getFullYear() - 17, aceptaTerminos: true, permisoApoderado: true,
});
ok('con el código completo se crea la cuenta', Boolean(listo.token) && listo.usuario.nombre === 'Camila');
ok('el código decide la academia', listo.usuario.academiaId === 'rumbo');
ok('el rol lo decide el código, no Google', listo.usuario.rol === 'alumno');

// --- El pase es de un solo uso ---
await falla('el pase no se puede reutilizar',
  () => responder('auth/google/completar', {
    pase: nueva.pase, codigoAcademia: 'RUMBO-2027', anioNacimiento: 2005, aceptaTerminos: true,
  }), 'venció');

// --- La segunda vez ya entra directo ---
const vuelta = await responder('auth/google', { credencial: NUEVA });
ok('la siguiente vez entra sin pedir nada', vuelta.necesitaCodigo === false,
  `→ ${vuelta.usuario.nombre} de ${vuelta.usuario.academia}`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
