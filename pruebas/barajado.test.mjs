/**
 * Alternativas barajadas.
 *
 * El banco original tenía las diez preguntas con la respuesta en A. Marcar
 * siempre A daba 100%, y el índice de preparación —el único número del que
 * vive Umbral— calculaba un resultado perfecto sobre datos basura.
 *
 * Barajar es fácil. Lo que se rompe es la corrección: en cuanto el orden de
 * pantalla deja de coincidir con el del archivo, comparar la posición pulsada
 * con la clave del archivo da por buena la respuesta equivocada, y buscar la
 * explicación de fallo por posición le cuenta al alumno por qué falló algo que
 * no eligió. Esta batería comprueba las tres cosas, y la última es la que
 * justifica el trabajo: que marcar siempre A deje de funcionar.
 */
import { iniciarSesion, responderPregunta, bancoCompleto } from '../src/data/mock/questions.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const banco = new Map(bancoCompleto().map((p) => [p.id, p]));

/* ── La corrección se hace contra lo que el alumno vio ───────────────── */

let bienCorregidas = 0;
let malCorregidas = 0;
let bienIluminadas = 0;
let total = 0;

for (let vuelta = 0; vuelta < 40; vuelta += 1) {
  const s = iniciarSesion({ modo: 'curso', cursoId: 'trigonometria' });
  for (const vista of s.preguntas) {
    const original = banco.get(vista.id);
    const buena = original.opciones[original.correcta];
    const posicionBuena = vista.opciones.indexOf(buena);

    // Pulsar el botón donde de verdad está la buena tiene que ser acierto.
    const v = responderPregunta({ sesionId: s.sesionId, preguntaId: vista.id, opcion: posicionBuena, segundos: 10 });
    total += 1;
    if (v.acerto) bienCorregidas += 1;
    if (v.correcta === posicionBuena) bienIluminadas += 1;
  }

  const s2 = iniciarSesion({ modo: 'curso', cursoId: 'trigonometria' });
  for (const vista of s2.preguntas) {
    const original = banco.get(vista.id);
    const buena = original.opciones[original.correcta];
    const posicionMala = vista.opciones.findIndex((o) => o !== buena);
    const v = responderPregunta({ sesionId: s2.sesionId, preguntaId: vista.id, opcion: posicionMala, segundos: 10 });
    if (v.acerto) malCorregidas += 1;
  }
}

ok('pulsar donde está la buena cuenta como acierto',
  bienCorregidas === total, `→ ${bienCorregidas} de ${total}`);
ok('pulsar cualquier otra cuenta como fallo',
  malCorregidas === 0, `→ ${malCorregidas} fallos dados por buenos`);
ok('la pantalla ilumina el botón donde está la buena, no su sitio en el archivo',
  bienIluminadas === total, `→ ${bienIluminadas} de ${total}`);

/* ── Las alternativas cambian de sitio ───────────────────────────────── */

/*
 * La misma pregunta, en muchas sesiones, tiene que enseñar la buena en sitios
 * distintos. Se mira cualquier pregunta que salga y no una concreta: en un
 * bucle todas las sesiones nacen en el mismo milisegundo y la selección de
 * preguntas usa la hora, así que salen siempre las mismas ocho. Eso no le pasa
 * a un alumno, cuyas sesiones distan segundos.
 */
const sitiosDe = new Map();
const vecesDe = new Map();
for (let i = 0; i < 60; i += 1) {
  const s = iniciarSesion({ modo: 'curso', cursoId: 'trigonometria' });
  for (const vista of s.preguntas) {
    const original = banco.get(vista.id);
    if (!sitiosDe.has(vista.id)) sitiosDe.set(vista.id, new Set());
    sitiosDe.get(vista.id).add(vista.opciones.indexOf(original.opciones[original.correcta]));
    vecesDe.set(vista.id, (vecesDe.get(vista.id) ?? 0) + 1);
  }
}
/*
 * Solo se exige variedad a las preguntas vistas bastantes veces. Esta prueba
 * fallaba de forma intermitente: si el milisegundo cambiaba al final del
 * bucle, entraba una pregunta nueva vista una o dos veces, que no puede
 * enseñar tres posiciones por mucho que se baraje. Una prueba que falla a
 * veces enseña a ignorar el rojo, que es peor que no tenerla.
 */
const vistasDeSobra = [...sitiosDe].filter(([id]) => vecesDe.get(id) >= 12);
const conVariedad = vistasDeSobra.filter(([, sitios]) => sitios.size >= 3).length;
const [unaId, susSitios] = vistasDeSobra[0] ?? ['—', new Set()];
ok('la buena cambia de posición entre sesiones',
  vistasDeSobra.length > 0 && conVariedad === vistasDeSobra.length,
  `→ ${conVariedad} de ${vistasDeSobra.length} preguntas la enseñaron en 3 o más sitios · ${unaId}: ${[...susSitios].map((i) => 'ABCD'[i]).sort().join(', ')}`);

ok('barajar no pierde ni duplica alternativas',
  bancoCompleto().slice(0, 20).every((p) => {
    const s = iniciarSesion({ modo: 'curso', cursoId: p.cursoId });
    const vista = s.preguntas.find((x) => x.id === p.id);
    return !vista || [...vista.opciones].sort().join('|') === [...p.opciones].sort().join('|');
  }));

/* ── La explicación de fallo es la de lo que eligió ──────────────────── */

/*
 * Las explicaciones están escritas para "la alternativa B del archivo". Con
 * el orden barajado, buscarlas por posición en pantalla le contaría al alumno
 * por qué falló una alternativa que no eligió. Se comprueba devolviendo la
 * alternativa original y mirando que coincida con la que pulsó.
 */
let coinciden = 0;
let miradas = 0;
for (let i = 0; i < 30; i += 1) {
  const s = iniciarSesion({ modo: 'curso', cursoId: 'trigonometria' });
  for (const vista of s.preguntas) {
    const original = banco.get(vista.id);
    const pulsada = vista.opciones.findIndex((o) => o !== original.opciones[original.correcta]);
    const v = responderPregunta({ sesionId: s.sesionId, preguntaId: vista.id, opcion: pulsada, segundos: 10 });
    miradas += 1;
    if (original.opciones[v.opcionOriginal] === vista.opciones[pulsada]) coinciden += 1;
  }
}
ok('la alternativa original devuelta es la que el alumno pulsó',
  coinciden === miradas, `→ ${coinciden} de ${miradas}`);

/* ── La estrategia de marcar siempre A deja de funcionar ─────────────── */

let aciertosConA = 0;
let respondidas = 0;
for (let i = 0; i < 80; i += 1) {
  const s = iniciarSesion({ modo: 'curso', cursoId: 'trigonometria' });
  for (const vista of s.preguntas) {
    const v = responderPregunta({ sesionId: s.sesionId, preguntaId: vista.id, opcion: 0, segundos: 5 });
    respondidas += 1;
    if (v.acerto) aciertosConA += 1;
  }
}
const tasa = aciertosConA / respondidas;
ok('marcar siempre A acierta lo que marca el azar, no el 100%',
  tasa > 0.15 && tasa < 0.35,
  `→ ${Math.round(tasa * 100)}% en ${respondidas} respuestas · con cuatro alternativas, el azar da 25%`);

/* ── Ningún banco con una clave que se pueda memorizar ──────────────── */

/*
 * Si la clave rota A, B, C, D, A…, basta con contar para acertar. Las
 * sesiones barajan, pero el banco se puede exportar o imprimir. La guarda
 * nació en el banco de Habilidad matemática, que tenía dieciséis tramos así;
 * al aplicarla a los demás aparecieron más, en bancos que ya estaban
 * entregados. Por eso vive aquí, para todos los cursos a la vez.
 */
const porCurso = new Map();
for (const p of bancoCompleto()) {
  if (!porCurso.has(p.cursoId)) porCurso.set(p.cursoId, []);
  porCurso.get(p.cursoId).push(p.correcta);
}
const conRotacion = [...porCurso].map(([curso, seq]) => {
  let tramos = 0;
  for (let i = 3; i < seq.length; i += 1) {
    const c = seq.slice(i - 3, i + 1);
    if (new Set(c).size === 4 && c.every((x, k) => k === 0 || x === (c[k - 1] + 1) % 4)) tramos += 1;
  }
  return [curso, tramos];
}).filter(([, t]) => t > 2);
ok('ningún banco tiene una clave que rote de forma predecible',
  conRotacion.length === 0,
  conRotacion.length ? `→ ${conRotacion.map(([c, t]) => `${c}: ${t} tramos`).join(', ')}` : `→ ${porCurso.size} cursos revisados`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
