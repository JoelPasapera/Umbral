/**
 * Reto diario. Lo que se protege aquí es la honestidad del índice: el reto es
 * la única evidencia corregida por el servidor, y por eso pesa el doble y
 * medio que la práctica libre. Si se pudiera repetir o mirar antes, ese peso
 * dejaría de estar justificado.
 */
import { iniciarSesion, responderPregunta, cerrarSesion } from '../src/data/mock/questions.js';
import { estadoReto, calcularRacha, sembrarRacha, registrarReto } from '../src/data/mock/daily.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const DEBILES = ['trigonometria', 'fisica', 'geometria'];

// --- El reto ataca lo que peor llevas ---
const s = iniciarSesion({ modo: 'diario', debiles: DEBILES, usuarioId: 'test-1' });
ok('el reto son cinco preguntas', s.total === 5, `→ ${s.total}`);
const cursos = new Set(s.preguntas.map((p) => p.cursoId));
ok('vienen de los cursos flojos', [...cursos].every((c) => DEBILES.includes(c)),
  `→ ${[...cursos].join(', ')}`);
ok('no filtra la respuesta', s.preguntas.every((p) => !('correcta' in p)));

// --- Es el mismo durante todo el día ---
const s2 = iniciarSesion({ modo: 'diario', debiles: DEBILES, usuarioId: 'test-1' });
ok('el reto del día no cambia entre llamadas',
  JSON.stringify(s.preguntas.map((p) => p.id)) === JSON.stringify(s2.preguntas.map((p) => p.id)));

// --- Distinto para cada persona ---
const otro = iniciarSesion({ modo: 'diario', debiles: DEBILES, usuarioId: 'test-2' });
ok('cada persona recibe su propio reto',
  JSON.stringify(s.preguntas.map((p) => p.id)) !== JSON.stringify(otro.preguntas.map((p) => p.id)));

// --- Los intentos quedan marcados como verificados ---
for (const p of s.preguntas) {
  responderPregunta({ sesionId: s.sesionId, preguntaId: p.id, opcion: 0, segundos: 15 });
}
const r = cerrarSesion({ sesionId: s.sesionId });
ok('los intentos del reto van verificados', r.intentos.every((i) => i.verificado === true));
ok('el resumen dice que era el reto', r.modo === 'diario');

// --- La práctica libre NO va verificada ---
const libre = iniciarSesion({ cursoId: 'trigonometria', usuarioId: 'test-1' });
responderPregunta({ sesionId: libre.sesionId, preguntaId: libre.preguntas[0].id, opcion: 0, segundos: 9 });
const rl = cerrarSesion({ sesionId: libre.sesionId });
ok('la práctica libre no va verificada', rl.intentos.every((i) => i.verificado === false));

// --- Uno al día, sin repetir ---
const antes = registrarReto({ usuarioId: 'test-1', aciertos: 1, total: 5 });
ok('registrar dos veces el mismo día no cuenta dos veces', antes.repetido === true);
ok('el estado dice que ya está hecho', estadoReto({ usuarioId: 'test-1' }).hecho === true);

// --- Racha ---
sembrarRacha('test-3', [0, 1, 2, 3]);
const racha = calcularRacha('test-3');
ok('cuenta días consecutivos', racha.actual === 4, `→ ${racha.actual}`);
ok('el calendario cubre 28 días', racha.calendario.length === 28);

sembrarRacha('test-4', [0, 1, 5, 6, 7]);
ok('un hueco corta la racha pero no el historial',
  calcularRacha('test-4').actual === 2 && calcularRacha('test-4').ultimos28 === 5,
  `→ racha ${calcularRacha('test-4').actual}, historial ${calcularRacha('test-4').ultimos28}`);

sembrarRacha('test-5', [1, 2, 3]);
ok('la racha aguanta si hiciste el de ayer', calcularRacha('test-5').actual === 3,
  '→ no se rompe a medianoche');

sembrarRacha('test-6', [4, 5, 6]);
ok('sin actividad reciente la racha es cero', calcularRacha('test-6').actual === 0);
ok('pero el historial se conserva', calcularRacha('test-6').ultimos28 === 3);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
