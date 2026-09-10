/**
 * Explicaciones de fallo.
 *
 * Dos cosas se protegen aquí. La primera es el alumno: un texto que le diga
 * que acertó cuando falló, o que delate cómo se redactó, no puede llegar a su
 * pantalla ni por descuido. La segunda es la factura de la academia: si la
 * caché deja de funcionar, el coste pasa de ser por pregunta a ser por alumno,
 * y la funcionalidad se vuelve inviable sin que nadie lo note hasta que llega
 * el recibo.
 */
import {
  claveExplicacion,
  opcionesFallables,
  revisarExplicacion,
  revisarLoteExplicaciones,
} from '../src/domain/explicacion.js';
import {
  sembrarBase,
  explicacionDeFallo,
  generarExplicaciones,
  colaExplicaciones,
  decidirExplicacion,
} from '../src/data/mock/explicaciones.js';
import { EXPLICACIONES_BASE } from '../src/data/mock/explicaciones-base.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const PREGUNTA = {
  id: 'trig-001',
  opciones: ['$2\\sin^2 x$', '$2\\cos^2 x$', '$1$', '$\\sin 2x$'],
  correcta: 0,
  explicacion: 'Es una diferencia de cuadrados: el segundo paréntesis vale 1 y queda $2\\sin^2 x$.',
};

// Habla de la alternativa que explica: es lo que la distingue de un consejo
// genérico, y la puerta lo comprueba.
const BUENA =
  'Llegaste a $2\\cos^2 x$ porque invertiste el orden de la diferencia de cuadrados y con ese cambio de signo el 1 se junta con el otro término. Repasa cuál de los dos va delante en el enunciado.';

const rev = (cambios) =>
  revisarExplicacion({ preguntaId: 'trig-001', opcion: 1, texto: BUENA, ...cambios }, { pregunta: PREGUNTA });

const rechaza = (nombre, cambios, campo) => {
  const r = rev(cambios);
  const p = r.problemas.find((x) => x.nivel === 'rechazo' && x.campo === campo);
  ok(nombre, !r.aceptada && Boolean(p), p ? `→ "${p.mensaje}"` : '→ no lo detectó');
};

/* --- La clave: es lo que convierte el coste por alumno en coste por pregunta --- */

ok('la clave junta pregunta y opción',
  claveExplicacion('trig-001', 2) === 'trig-001#2');
ok('la misma opción da siempre la misma clave → dos alumnos, un solo texto',
  claveExplicacion('trig-001', 2) === claveExplicacion('trig-001', 2));
ok('opciones distintas no comparten clave',
  claveExplicacion('trig-001', 1) !== claveExplicacion('trig-001', 2));
ok('la clave rechaza una opción que no es índice',
  (() => { try { claveExplicacion('trig-001', 'b'); return false; } catch { return true; } })());

ok('solo se explican las alternativas falladas → la correcta no lleva explicación de fallo',
  JSON.stringify(opcionesFallables(PREGUNTA)) === JSON.stringify([1, 2, 3]));

/* --- Rechazos: no llegan ni a la cola del profesor --- */

ok('una explicación correcta pasa sin avisos',
  rev({}).aceptada && rev({}).problemas.length === 0);

rechaza('rechaza la que felicita al alumno que falló',
  { texto: 'Acertaste el planteamiento entero, solo faltó rematar la cuenta final con algo más de cuidado antes de marcar.' },
  'texto');
rechaza('rechaza la que delata cómo se redactó',
  { texto: 'Esta explicación la generó un modelo de lenguaje a partir del material de tu academia, y por eso conviene que la contrastes con tu profesor de aula.' },
  'texto');
rechaza('rechaza la que repite la solución general que ya está en pantalla',
  { texto: PREGUNTA.explicacion + ' Es una diferencia de cuadrados y el segundo paréntesis vale 1.' },
  'texto');
rechaza('rechaza la fórmula sin cerrar', { texto: `${BUENA} Queda $2\\cos^2 x` }, 'texto');
rechaza('rechaza la vacía', { texto: '' }, 'texto');
rechaza('rechaza la que señala la alternativa correcta', { opcion: 0 }, 'opcion');
rechaza('rechaza la alternativa que no existe', { opcion: 7 }, 'opcion');
rechaza('rechaza la que es de otra pregunta', { preguntaId: 'trig-002' }, 'preguntaId');

/* --- Avisos: llegan marcadas y decide el profesor --- */

const breve = rev({ texto: 'Te equivocaste de signo al operar con el $\\cos$ del enunciado y por eso saliste con el término cambiado.' });
ok('avisa de la demasiado breve, pero la deja pasar',
  breve.aceptada && breve.problemas.some((p) => p.nivel === 'aviso'));

const generica = rev({
  texto: 'Conviene repasar el tema con calma antes de volver a intentarlo, porque el procedimiento se apoya en identidades que hay que tener bien memorizadas de antemano.',
});
ok('avisa de la que no habla de la alternativa elegida',
  generica.aceptada && generica.problemas.some((p) => p.nivel === 'aviso' && p.mensaje.includes('genérica')));

/* --- El fallo que no se ve leyendo de una en una --- */

const lote = revisarLoteExplicaciones(
  [1, 2, 3].map((opcion) => ({ preguntaId: 'trig-001', opcion, texto: BUENA })),
  { pregunta: PREGUNTA },
);
ok('el mismo párrafo servido a tres alternativas: solo sobrevive uno',
  lote.aceptadas.length === 1 && lote.repetidas.length === 2,
  `→ ${lote.aceptadas.length} aceptada, ${lote.repetidas.length} repetidas`);
ok('la repetida dice de qué alternativa es copia',
  lote.repetidas.every((r) => r.problemas.some((p) => p.mensaje.includes('alternativa'))));

/* --- El banco base --- */

sembrarBase(EXPLICACIONES_BASE);

ok('el banco base trae explicaciones ya revisadas',
  EXPLICACIONES_BASE.length > 0, `→ ${EXPLICACIONES_BASE.length} alternativas explicadas`);

const revisadas = EXPLICACIONES_BASE.map((e) =>
  revisarExplicacion(e, {
    pregunta: { id: e.preguntaId, opciones: ['a', 'b', 'c', 'd'], correcta: -1, explicacion: '' },
  }));
ok('ninguna del banco base pasaría hoy por rota',
  revisadas.every((r) => !r.problemas.some((p) => p.nivel === 'rechazo' && p.campo === 'texto')),
  '→ longitud, fórmulas cerradas, sin felicitar y sin delatar el origen');

ok('ninguna del banco base explica una alternativa repetida',
  new Set(EXPLICACIONES_BASE.map((e) => claveExplicacion(e.preguntaId, e.opcion))).size
    === EXPLICACIONES_BASE.length);

ok('una alternativa del banco base tiene su explicación',
  explicacionDeFallo({ preguntaId: 'trig-001', opcion: 1 })?.origen === 'base');
ok('una alternativa sin explicar devuelve nada, y eso es normal',
  explicacionDeFallo({ preguntaId: 'trig-003', opcion: 1 }) === null);
ok('la academia recién contratada ya tiene las del banco base sin gastar nada',
  explicacionDeFallo({ preguntaId: 'trig-007', opcion: 1, academiaId: 'academia-nueva' })?.origen === 'base');

/* --- Generar, revisar y publicar --- */

const PREGUNTA_PROPIA = {
  id: 'propia-001',
  enunciado: 'Si $2x + 6 = 10$, ¿cuánto vale $x$?',
  opciones: ['$2$', '$8$', '$4$', '$16$'],
  correcta: 0,
  explicacion: 'Restas 6 a los dos lados y queda $2x = 4$, así que $x = 2$.',
};

const gastado = [];
const cobrarFalso = (creditos) => { gastado.push(creditos); };

const primera = generarExplicaciones({
  academiaId: 'rumbo', pregunta: PREGUNTA_PROPIA, cobrar: cobrarFalso,
});
ok('se cobra una vez por alternativa que falta, no por pregunta',
  gastado[0] === 3, `→ cobró ${gastado[0]} por 3 alternativas`);
ok('la puerta filtra lo que el modelo devolvió roto',
  primera.rechazadas.length > 0 && primera.borradores.length > 0,
  `→ ${primera.borradores.length} a revisión, ${primera.rechazadas.length} descartadas`);

const borrador = colaExplicaciones({ academiaId: 'rumbo' }).borradores[0];
ok('lo generado espera en la cola y el alumno todavía no lo ve',
  Boolean(borrador)
    && explicacionDeFallo({ preguntaId: borrador.preguntaId, opcion: borrador.opcion, academiaId: 'rumbo' }) === null);

decidirExplicacion({ academiaId: 'rumbo', id: borrador.id, decision: 'aprobar' });
ok('tras aprobarlo el alumno de esa academia sí lo ve',
  explicacionDeFallo({ preguntaId: borrador.preguntaId, opcion: borrador.opcion, academiaId: 'rumbo' })?.origen
    === 'propia');
ok('y el alumno de otra academia no',
  explicacionDeFallo({ preguntaId: borrador.preguntaId, opcion: borrador.opcion, academiaId: 'sigma' }) === null);

const otro = colaExplicaciones({ academiaId: 'rumbo' }).borradores[0];
decidirExplicacion({ academiaId: 'rumbo', id: otro.id, decision: 'descartar' });
ok('lo descartado no llega a verse nunca',
  explicacionDeFallo({ preguntaId: otro.preguntaId, opcion: otro.opcion, academiaId: 'rumbo' }) === null);
ok('no se puede decidir dos veces sobre el mismo borrador',
  (() => {
    try { decidirExplicacion({ academiaId: 'rumbo', id: otro.id, decision: 'aprobar' }); return false; }
    catch { return true; }
  })());

/* Esta es la prueba que sostiene la economía entera de la funcionalidad: una
   alternativa aprobada no se vuelve a pagar jamás, la pidan las veces que la
   pidan. Sin esto el coste vuelve a ser por alumno y la funcionalidad no le
   sirve a una academia pequeña. */
const aprobada = { preguntaId: borrador.preguntaId, opcion: borrador.opcion };
generarExplicaciones({ academiaId: 'rumbo', pregunta: PREGUNTA_PROPIA, cobrar: cobrarFalso });
generarExplicaciones({ academiaId: 'rumbo', pregunta: PREGUNTA_PROPIA, cobrar: cobrarFalso });
const pedidas = colaExplicaciones({ academiaId: 'rumbo' }).borradores
  .map((b) => claveExplicacion(b.preguntaId, b.opcion));
ok('la alternativa ya aprobada no se vuelve a pedir ni a pagar nunca',
  !pedidas.includes(claveExplicacion(aprobada.preguntaId, aprobada.opcion))
    && gastado[gastado.length - 1] < 3,
  `→ tercera petición: cobró ${gastado[gastado.length - 1]} de 3 alternativas`);
ok('tampoco se paga dos veces por una que ya está esperando en la cola',
  new Set(pedidas).size === pedidas.length);

const sinCredito = () => { throw new Error('Faltan créditos'); };
ok('sin presupuesto no se redacta nada',
  (() => {
    try {
      generarExplicaciones({ academiaId: 'pobre', pregunta: PREGUNTA_PROPIA, cobrar: sinCredito });
      return false;
    } catch { return colaExplicaciones({ academiaId: 'pobre' }).borradores.length === 0; }
  })());

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
