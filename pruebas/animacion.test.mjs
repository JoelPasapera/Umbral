/**
 * Reglas del único movimiento de la aplicación. Se prueban porque son
 * decisiones de producto, no de estilo: cuándo se anima, desde dónde, y qué
 * pasa si la persona pidió menos movimiento.
 */
const mapa = new Map();
globalThis.localStorage = {
  getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
  setItem: (k, v) => mapa.set(k, String(v)),
  removeItem: (k) => mapa.delete(k),
};
let quieto = false;
globalThis.window = { matchMedia: () => ({ matches: quieto }) };
globalThis.performance = { now: () => 0 };
const pendientes = [];
globalThis.requestAnimationFrame = (fn) => pendientes.push(fn);

const { animarIndice, indiceAnterior, recordarIndice } =
  await import('../src/features/meta/animacion.js');

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };
const nodo = () => ({ textContent: '', style: {} });

// --- Memoria entre visitas ---
ok('sin visita previa no hay valor', indiceAnterior() === null);
recordarIndice(55);
ok('recuerda el índice visto', indiceAnterior() === 55);
mapa.set('umbral:indice-visto', 'basura');
ok('sobrevive a un valor corrupto', indiceAnterior() === null);
recordarIndice(55);

// --- Solo se anima si cambió ---
pendientes.length = 0;
const c1 = nodo();
ok('sin cambio no devuelve diferencia', animarIndice({ cifra: c1, relleno: null, desde: 58, hasta: 58 }) === null);
ok('sin cambio no arranca animación', pendientes.length === 0);
ok('sin cambio deja el valor puesto', c1.textContent === '58');

// --- Con cambio, arranca desde el anterior ---
pendientes.length = 0;
const c2 = nodo(); const r2 = nodo();
const dif = animarIndice({ cifra: c2, relleno: r2, desde: 55, hasta: 58 });
ok('devuelve la diferencia', dif === 3, `→ ${dif}`);
ok('arranca en el valor anterior, no en cero', c2.textContent === '55', `→ ${c2.textContent}`);
ok('el relleno arranca en el ancho anterior', r2.style.width === '55%', `→ ${r2.style.width}`);
ok('programa la animación', pendientes.length === 1);

// --- Primera visita: sin punto de partida, no se anima ---
pendientes.length = 0;
const c3 = nodo();
ok('la primera visita no cuenta desde cero',
  animarIndice({ cifra: c3, relleno: null, desde: null, hasta: 58 }) === null && c3.textContent === '58');
ok('la primera visita no anima nada', pendientes.length === 0);

// --- Movimiento reducido: ninguno, no uno rápido ---
quieto = true;
pendientes.length = 0;
const c4 = nodo(); const r4 = nodo();
const dif4 = animarIndice({ cifra: c4, relleno: r4, desde: 55, hasta: 58 });
ok('con movimiento reducido no hay animación', pendientes.length === 0);
ok('pero el valor final sí llega', c4.textContent === '58' && r4.style.width === '58%');
ok('y la diferencia se sigue informando', dif4 === 3);
quieto = false;

// --- También baja ---
const c5 = nodo();
ok('informa también cuando baja',
  animarIndice({ cifra: c5, relleno: null, desde: 61, hasta: 58 }) === -3,
  '→ un producto que solo enseña las subidas es un halago, no una medición');

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
