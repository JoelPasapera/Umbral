import { validarRegistro, validarEntrada } from '../src/features/entrar/validacion.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const ANIO = new Date().getFullYear();
const bueno = {
  codigoAcademia: 'RUMBO-2027',
  nombre: 'Joel', correo: 'joel@ejemplo.pe', clave: 'admision2027',
  claveRepetida: 'admision2027', anioNacimiento: String(ANIO - 18), terminos: true,
};

ok('un registro completo pasa', validarRegistro(bueno) === null);

// El fallo que motivó esta prueba: un correo válido rechazado.
for (const correo of ['joel@ejemplo.pe', 'a.b-c@sub.dominio.edu.pe', 'JOEL@Ejemplo.PE', 'x1@y.co']) {
  ok(`acepta "${correo}"`, validarRegistro({ ...bueno, correo }) === null);
}
for (const correo of ['', 'sin-arroba', 'a@b', 'a b@c.pe', 'a@@b.pe']) {
  const r = validarRegistro({ ...bueno, correo });
  ok(`rechaza "${correo}"`, r?.campo === 'correo', `→ "${r?.mensaje}"`);
}

// Confirmación de contraseña
ok('exige repetir la contraseña',
  validarRegistro({ ...bueno, claveRepetida: '' })?.campo === 'claveRepetida');
const distinta = validarRegistro({ ...bueno, claveRepetida: 'admision2028' });
ok('detecta contraseñas distintas', distinta?.campo === 'claveRepetida', `→ "${distinta?.mensaje}"`);
ok('el mensaje dice qué pasa', distinta?.mensaje.includes('no coinciden'));

ok('rechaza contraseña corta', validarRegistro({ ...bueno, clave: 'corta', claveRepetida: 'corta' })?.campo === 'clave');
ok('exige año de nacimiento', validarRegistro({ ...bueno, anioNacimiento: '' })?.campo === 'anioNacimiento');
ok('rechaza año imposible', validarRegistro({ ...bueno, anioNacimiento: '2099' })?.campo === 'anioNacimiento');
ok('exige aceptar términos', validarRegistro({ ...bueno, terminos: false })?.campo === 'terminos');

// Orden de los avisos: primero lo que se lee arriba
ok('exige el código de academia', validarRegistro({ ...bueno, codigoAcademia: '' })?.campo === 'codigoAcademia');
ok('avisa del código antes que de nada',
  validarRegistro({ ...bueno, codigoAcademia: '', correo: 'malo' })?.campo === 'codigoAcademia');
ok('avisa del correo antes que de la contraseña',
  validarRegistro({ ...bueno, correo: 'malo', clave: 'x', claveRepetida: 'y' })?.campo === 'correo');

// Entrada
ok('entrar con datos completos pasa', validarEntrada({ correo: 'a@b.pe', clave: 'x' }) === null);
ok('entrar sin correo avisa', validarEntrada({ clave: 'x' })?.campo === 'correo');
ok('entrar sin contraseña avisa', validarEntrada({ correo: 'a@b.pe' })?.campo === 'clave');

// Los nombres que valida el módulo tienen que existir en el formulario. Este
// desajuste ya causó un fallo: la validación buscaba "aceptaTerminos" y la
// casilla se llamaba "terminos", así que nadie podía registrarse.
const { readFileSync } = await import('node:fs');
const vista = readFileSync(new URL('../src/features/entrar/entrar.view.js', import.meta.url), 'utf8');
const modulo = readFileSync(new URL('../src/features/entrar/validacion.js', import.meta.url), 'utf8');
const enFormulario = new Set([
  ...[...vista.matchAll(/nombre: '(\w+)'/g)].map((m) => m[1]),
  ...[...vista.matchAll(/casilla\('(\w+)'/g)].map((m) => m[1]),
]);
const huerfanos = [...new Set([...modulo.matchAll(/datos\.(\w+)/g)].map((m) => m[1]))]
  .filter((c) => !enFormulario.has(c));
ok('todo campo validado existe en el formulario', huerfanos.length === 0,
  huerfanos.length ? `→ sobran: ${huerfanos.join(', ')}` : `→ ${enFormulario.size} campos`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
