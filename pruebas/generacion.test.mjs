/**
 * Puerta de validación. Lo que se protege aquí es el tiempo del profesor: si
 * tiene que descartar a mano cuatro candidatas rotas por cada buena, no usa la
 * función. Y al revés: un falso positivo le hace mirar donde no hace falta.
 */
import { revisarCandidata, revisarLote, similitud } from '../src/domain/generation.js';
import { generarPreguntas, estadoPresupuesto, cola, decidir, COSTE } from '../src/data/mock/ai.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const CURSOS = ['trigonometria', 'fisica'];
const buena = {
  enunciado: 'Si $\\sec x - \\tan x = 5$, ¿cuánto vale $\\sec x + \\tan x$?',
  opciones: ['$\\tfrac{1}{5}$', '$5$', '$25$', '$\\tfrac{1}{25}$'],
  correcta: 0,
  explicacion: 'Porque $\\sec^2 x - \\tan^2 x = 1$ se factoriza como producto de los dos binomios, así que uno es el inverso del otro.',
  cursoId: 'trigonometria', temaId: 'identidades', dificultad: 0.33,
};

const rev = (cambios, ctx = {}) => revisarCandidata({ ...buena, ...cambios }, { cursos: CURSOS, ...ctx });
const rechaza = (nombre, cambios, campo) => {
  const r = rev(cambios);
  const p = r.problemas.find((x) => x.nivel === 'rechazo' && x.campo === campo);
  ok(nombre, !r.aceptada && Boolean(p), p ? `→ "${p.mensaje}"` : '→ no lo detectó');
};

ok('una candidata correcta pasa sin avisos',
  rev({}).aceptada && rev({}).problemas.length === 0);

// --- Rechazos automáticos: no llegan al profesor ---
rechaza('rechaza tres alternativas', { opciones: ['a', 'b', 'c'] }, 'opciones');
rechaza('rechaza alternativas repetidas', { opciones: ['$1$', '$1$', '$2$', '$3$'] }, 'opciones');
rechaza('rechaza sin explicación', { explicacion: '' }, 'explicacion');
rechaza('rechaza sin marcar la correcta', { correcta: 9 }, 'correcta');
rechaza('rechaza curso fuera del temario', { cursoId: 'gastronomia' }, 'cursoId');
rechaza('rechaza sin tema', { temaId: '' }, 'temaId');
rechaza('rechaza dificultad imposible', { dificultad: 3 }, 'dificultad');
rechaza('rechaza fórmula sin cerrar', { enunciado: 'Calcula $\\sin 30^\\circ + 1' }, 'enunciado');
rechaza('rechaza alternativa con fórmula rota', { opciones: ['$1', '$2$', '$3$', '$4$'] }, 'opciones');

// --- Avisos: llegan marcados, decide el profesor ---
const larga = rev({
  opciones: ['Se cumple para todo valor del ángulo en el que ambos miembros están definidos', 'Sí', 'No', 'A veces'],
});
ok('avisa si la correcta es mucho más larga',
  larga.aceptada && larga.problemas.some((p) => p.campo === 'opciones'));

const repite = rev({ explicacion: 'La respuesta es $\\tfrac{1}{5}$.' });
ok('avisa si la explicación solo repite la respuesta',
  repite.problemas.some((p) => p.campo === 'explicacion'), `→ ${repite.problemas.length} aviso(s)`);

// Falso positivo que la primera versión producía: razonar sin decir "porque".
const razona = rev({
  explicacion: 'Es una diferencia de cuadrados: el segundo paréntesis vale 1 y el primero es la identidad del ángulo doble.',
});
ok('no avisa de una explicación que razona sin decir "porque"',
  razona.aceptada && razona.problemas.length === 0, '→ sin falso positivo');

const fuente = 'Una identidad trigonometrica es una igualdad que se cumple para todo valor del angulo en el que ambos miembros estan definidos y se usa constantemente.';
const copiada = rev({ enunciado: fuente }, { fuente });
ok('avisa si el enunciado es copia literal del material',
  copiada.problemas.some((p) => p.campo === 'enunciado'));

const dup = rev({}, { banco: [{ enunciado: buena.enunciado }] });
ok('avisa si ya existe una pregunta casi igual',
  dup.problemas.some((p) => p.campo === 'enunciado'));

// --- Lote ---
const lote = revisarLote([buena, { ...buena }, { ...buena, opciones: ['a', 'b'] }], { cursos: CURSOS });
ok('el lote descarta duplicadas entre sí',
  lote.resumen.aceptadas === 1 && lote.resumen.duplicadas === 1 && lote.resumen.rechazadas === 1,
  `→ ${lote.resumen.aceptadas} aceptada, ${lote.resumen.duplicadas} duplicada, ${lote.resumen.rechazadas} rechazada`);

ok('la similitud distingue textos distintos',
  similitud('el gato se sentó en la alfombra', 'la fórmula de la energía cinética') < 0.2);

// --- Presupuesto ---
const material = 'Una identidad trigonometrica es una igualdad valida para todo valor del angulo en el que ambos miembros estan definidos. Las identidades pitagoricas salen de la circunferencia unitaria.';
const antes = estadoPresupuesto({ academiaId: 'presu' });
generarPreguntas({ academiaId: 'presu', material, cursoId: 'trigonometria', temaId: 'identidades', cursos: CURSOS });
const despues = estadoPresupuesto({ academiaId: 'presu' });
ok('generar consume presupuesto', despues.usado === antes.usado + COSTE.COSTE_POR_LOTE,
  `→ ${despues.usado} de ${despues.tope}`);

for (let i = 0; i < 25; i += 1) {
  try { generarPreguntas({ academiaId: 'presu', material, cursoId: 'trigonometria', temaId: 't', cursos: CURSOS }); } catch { /* esperado */ }
}
let mensaje = '';
try { generarPreguntas({ academiaId: 'presu', material, cursoId: 'trigonometria', temaId: 't', cursos: CURSOS }); }
catch (e) { mensaje = e.message; }
ok('el presupuesto tiene techo duro', mensaje.includes('presupuesto'), `→ "${mensaje}"`);
ok('el gasto nunca pasa del tope', estadoPresupuesto({ academiaId: 'presu' }).usado <= COSTE.TOPE_MENSUAL);

// --- Material insuficiente ---
let corto = '';
try { generarPreguntas({ academiaId: 'x', material: 'poco texto', cursoId: 'trigonometria', temaId: 't', cursos: CURSOS }); }
catch (e) { corto = e.message; }
ok('exige material suficiente', corto.includes('párrafo'), `→ "${corto}"`);

// --- Nada se publica sin aprobación ---
generarPreguntas({ academiaId: 'flujo', material, cursoId: 'trigonometria', temaId: 'identidades', cursos: CURSOS });
const pend = cola({ academiaId: 'flujo' }).borradores;
ok('lo generado queda en borradores', pend.length > 0 && pend.every((b) => b.estado === 'borrador'));
const aprobada = decidir({ academiaId: 'flujo', id: pend[0].id, decision: 'aprobar' });
ok('al aprobar sale marcada como generada', aprobada.publicada.origen === 'generado');
ok('al descartar no publica nada',
  decidir({ academiaId: 'flujo', id: pend[1].id, decision: 'descartar' }).publicada === null);
let repetida = '';
try { decidir({ academiaId: 'flujo', id: pend[0].id, decision: 'aprobar' }); }
catch (e) { repetida = e.message; }
ok('no se puede aprobar dos veces', repetida.includes('pendiente'));

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
