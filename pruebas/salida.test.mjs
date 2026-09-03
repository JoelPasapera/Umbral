import { encolar, pendientes, vaciar, limpiar } from '../src/core/outbox.js';

/** Almacenamiento falso: por eso la cola se puede probar sin navegador. */
const almacen = (() => {
  const mapa = new Map();
  return {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
  };
})();

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

limpiar(almacen);
ok('arranca vacía', pendientes(almacen).length === 0);

encolar({ id: 'a', tipo: 'practica/responder', carga: { opcion: 1 } }, almacen);
encolar({ id: 'b', tipo: 'practica/responder', carga: { opcion: 2 } }, almacen);
ok('guarda lo encolado', pendientes(almacen).length === 2);

encolar({ id: 'a', tipo: 'practica/responder', carga: { opcion: 9 } }, almacen);
ok('no duplica el mismo id', pendientes(almacen).length === 2);

let vistos = [];
let r = await vaciar(async (e) => { vistos.push(e.id); }, almacen);
ok('envía todo cuando hay red', r.enviados === 2 && r.quedan === 0);
ok('respeta el orden de llegada', vistos.join('') === 'ab', `→ ${vistos.join('')}`);
ok('la cola queda vacía', pendientes(almacen).length === 0);

encolar({ id: 'c', tipo: 't', carga: {} }, almacen);
encolar({ id: 'd', tipo: 't', carga: {} }, almacen);
r = await vaciar(async () => { throw new Error('sin red'); }, almacen);
ok('sin red no pierde nada', r.enviados === 0 && r.quedan === 2);
ok('cuenta el reintento', pendientes(almacen)[0].intentos === 1);

vistos = [];
r = await vaciar(async (e) => { vistos.push(e.id); if (e.id === 'd') throw new Error('corte'); }, almacen);
ok('se detiene en el primer fallo', r.enviados === 1 && r.quedan === 1, `→ envió ${vistos.join('')}`);
ok('lo enviado no se reintenta', pendientes(almacen)[0].id === 'd');

almacen.setItem('umbral:salida', '{ esto no es json');
ok('sobrevive a datos corruptos', pendientes(almacen).length === 0);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
