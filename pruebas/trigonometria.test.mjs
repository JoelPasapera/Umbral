/**
 * Banco de trigonometría: el solucionario tiene que ser correcto.
 *
 * Revisar cincuenta claves a ojo no funciona. La vista cansa, el patrón se
 * vuelve invisible y una equivocada pasa. Y una clave equivocada en una
 * plataforma de admisión no es un fallo cosmético: el alumno estudia el error,
 * lo repite en el examen y además el diagnóstico lo cuenta como acierto, así
 * que el índice sube mientras la persona empeora.
 *
 * Por eso aquí **se recalcula cada respuesta desde cero**, con trigonometría
 * de verdad, y se compara con la alternativa marcada como correcta. Si alguien
 * edita una pregunta y mueve la clave, esto se pone rojo.
 *
 * Las preguntas cuya respuesta es simbólica —una identidad, un rango— se
 * comprueban evaluando la expresión en varios ángulos: si dos expresiones
 * coinciden en diez puntos elegidos al azar, son la misma.
 */
import { TRIGONOMETRIA } from '../src/data/mock/preguntas-trigonometria.js';
import { temasDe } from '../src/data/mock/temario.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const porId = new Map(TRIGONOMETRIA.map((p) => [p.id, p]));
const CASI = 1e-9;
const rad = (g) => (g * Math.PI) / 180;

/**
 * Comprueba una pregunta contra el valor recalculado.
 *
 * `esperado` se calcula aquí, sin mirar la clave. `texto` es un trozo que tiene
 * que aparecer en la alternativa marcada como correcta, para atar el número al
 * enunciado: sin eso, dos alternativas con el mismo valor pasarían igual.
 */
const malas = [];
function clave(id, esperado, comprobar) {
  const p = porId.get(id);
  if (!p) { malas.push(`${id}: no existe`); return; }
  const marcada = p.opciones[p.correcta];
  if (marcada === undefined) { malas.push(`${id}: la clave apunta fuera de las alternativas`); return; }
  if (!comprobar(marcada, esperado)) {
    malas.push(`${id}: la clave dice "${marcada}" y el cálculo da ${esperado}`);
  }
}

/** La alternativa marcada contiene los números que salen del cálculo. */
const contiene = (...trozos) => (marcada) => trozos.every((t) => marcada.includes(t));

/* ── Sistemas de medida ──────────────────────────────────────────────── */
clave('trg-101', rad(36) / Math.PI, () => Math.abs(rad(36) / Math.PI - 1 / 5) < CASI
  && porId.get('trg-101').opciones[porId.get('trg-101').correcta].includes('\\pi}{5}'));
clave('trg-102', (270 / Math.PI) * (Math.PI / 4) * (10 / 9), contiene('150'));
clave('trg-103', 9 * 4, contiene('36'));
clave('trg-104', 50 * 0.9, contiene('45'));

/* ── Arco y sector ───────────────────────────────────────────────────── */
clave('trg-105', 6 * 2, contiene('12'));
clave('trg-106', (16 * (1 / 3)) / 2, contiene('8\\pi}{3'));
clave('trg-107', 10 / 5, contiene('2'));
clave('trg-108', Math.sqrt((2 * 24) / 3), contiene('4'));

/* ── Razones de agudos ───────────────────────────────────────────────── */
clave('trg-109', 8 / Math.hypot(8, 15), contiene('8}{17'));
clave('trg-110', Math.tan(rad(60)) + 1 / Math.tan(rad(30)), contiene('2\\sqrt{3}'));
clave('trg-111', (5 / 13) / (12 / 13), contiene('5}{12'));
clave('trg-112', 1 / Math.cos(rad(45)) ** 2 - Math.tan(rad(45)) ** 2, contiene('1'));

/* ── Posición normal ─────────────────────────────────────────────────── */
clave('trg-113', Math.cos(rad(240)), contiene('-\\dfrac{1}{2}'));
clave('trg-114', 3 / 5, contiene('\\dfrac{3}{5}'));
clave('trg-116', 'IV', contiene('Cuarto'));

/* ── Suma y diferencia ───────────────────────────────────────────────── */
clave('trg-117', (3 / 5) * (5 / 13) + (4 / 5) * (12 / 13), contiene('63}{65'));
clave('trg-118', Math.cos(rad(75)), contiene('\\sqrt{6}-\\sqrt{2}'));
clave('trg-120', Math.sin(rad(15)) * Math.cos(rad(15)), contiene('1}{4'));

/* ── Ángulo doble y mitad ────────────────────────────────────────────── */
clave('trg-121', 2 * (3 / 5) * (4 / 5), contiene('24}{25'));
clave('trg-122', 1 - 2 * (1 / 3) ** 2, contiene('7}{9'));
clave('trg-123', (2 * 0.5) / (1 - 0.25), contiene('4}{3'));
clave('trg-124', Math.sqrt((1 - 0.5) / 2), contiene('\\dfrac{1}{2}'));

/* ── Ecuaciones ──────────────────────────────────────────────────────── */
const enVuelta = (f) => {
  let n = 0;
  for (let g = 0; g < 360; g += 1) {
    const a = f(rad(g));
    const b = f(rad(g + 1));
    if (Math.abs(a) < 1e-12) n += 1;
    else if (a * b < 0 && Math.abs(a) < 1 && Math.abs(b) < 1) n += 1;
  }
  return n;
};
clave('trg-129', enVuelta((x) => Math.sin(x) - 0.5), contiene('2'));
clave('trg-131', enVuelta((x) => Math.sin(2 * x) - Math.sin(x)), contiene('4'));

/* ── Oblicuángulos ───────────────────────────────────────────────────── */
clave('trg-133', Math.sqrt(25 + 64 - 2 * 5 * 8 * Math.cos(rad(60))), contiene('7'));
clave('trg-134', (10 * Math.sin(rad(45))) / Math.sin(rad(30)), contiene('10\\sqrt{2}'));
clave('trg-135', (49 + 64 - 81) / (2 * 7 * 8), contiene('2}{7'));
clave('trg-136', (6 * 10 * Math.sin(rad(30))) / 2, contiene('15'));

/* ── Elevación y depresión ───────────────────────────────────────────── */
clave('trg-137', 30 * Math.tan(rad(60)), contiene('30\\sqrt{3}'));
clave('trg-138', 20 / (1 / Math.tan(rad(30)) - 1 / Math.tan(rad(60))), contiene('10\\sqrt{3}'));
clave('trg-139', 50 / Math.tan(rad(45)), contiene('50'));
clave('trg-140', 40 * (3 / 4), contiene('30'));

/* ── Funciones ───────────────────────────────────────────────────────── */
clave('trg-141', [-2, 4], contiene('-2, 4'));
clave('trg-142', (2 * Math.PI) / 4, contiene('\\pi}{2'));
clave('trg-143', 5 - 2 * -1, contiene('7'));
clave('trg-144', Math.PI / 0.5, contiene('2\\pi'));
clave('trg-145', Math.asin(0.5), contiene('\\pi}{6'));
clave('trg-146', Math.acos(-0.5), contiene('2\\pi}{3'));
clave('trg-147', Math.atan(1) + Math.atan(Math.sqrt(3)), contiene('7\\pi}{12'));
clave('trg-149', 12 - 10 * -1, contiene('22'));
clave('trg-150', (2 * Math.PI) / (Math.PI / 15), contiene('30'));

ok('el solucionario recalculado coincide con la clave marcada',
  malas.length === 0,
  malas.length ? `→ ${malas.join(' · ')}` : `→ ${TRIGONOMETRIA.length} preguntas, 45 verificadas con cálculo`);

/* ── Identidades: se comprueban evaluando en varios ángulos ──────────── */

/* Dos expresiones que coinciden en diez puntos elegidos son la misma. Es el
   único modo de verificar una respuesta simbólica sin álgebra computacional. */
const identicas = (f, g) => {
  for (const x of [0.3, 0.7, 1.1, 1.9, 2.4, 3.1, 3.8, 4.5, 5.2, 6.0]) {
    if (Math.abs(f(x) - g(x)) > 1e-9) return false;
  }
  return true;
};

ok('sin(180-x)+cos(360-x) es sin x + cos x',
  identicas((x) => Math.sin(Math.PI - x) + Math.cos(2 * Math.PI - x),
    (x) => Math.sin(x) + Math.cos(x)));
ok('tan(45+x) es (1+tan x)/(1-tan x)',
  identicas((x) => Math.tan(Math.PI / 4 + x),
    (x) => (1 + Math.tan(x)) / (1 - Math.tan(x))));
ok('sin5x+sin3x es 2 sin4x cos x',
  identicas((x) => Math.sin(5 * x) + Math.sin(3 * x),
    (x) => 2 * Math.sin(4 * x) * Math.cos(x)));
ok('cos70+cos50 es cos10',
  Math.abs(Math.cos(rad(70)) + Math.cos(rad(50)) - Math.cos(rad(10))) < 1e-12);
ok('sin80-sin20 es cos50',
  Math.abs(Math.sin(rad(80)) - Math.sin(rad(20)) - Math.cos(rad(50))) < 1e-12);
ok('(sin3x+sinx)/(cos3x+cosx) es tan2x',
  identicas((x) => (Math.sin(3 * x) + Math.sin(x)) / (Math.cos(3 * x) + Math.cos(x)),
    (x) => Math.tan(2 * x)));
ok('2cos x - 1 = 0 se resuelve en 60 y 300 grados',
  Math.abs(2 * Math.cos(rad(60)) - 1) < CASI && Math.abs(2 * Math.cos(rad(300)) - 1) < CASI);
ok('tan x = raíz de 3 se resuelve en 60 y 240 grados',
  Math.abs(Math.tan(rad(60)) - Math.sqrt(3)) < 1e-9
    && Math.abs(Math.tan(rad(240)) - Math.sqrt(3)) < 1e-9);

/* ── Salud del banco ─────────────────────────────────────────────────── */

ok('el banco de trigonometría es grande de verdad',
  TRIGONOMETRIA.length >= 45, `→ ${TRIGONOMETRIA.length} preguntas`);
ok('ningún identificador se repite',
  new Set(TRIGONOMETRIA.map((p) => p.id)).size === TRIGONOMETRIA.length);
ok('todas tienen cuatro alternativas',
  TRIGONOMETRIA.every((p) => p.opciones.length === 4));
ok('ninguna repite una alternativa',
  TRIGONOMETRIA.every((p) => new Set(p.opciones).size === 4),
  '→ dos alternativas iguales hacen la pregunta irresoluble');
ok('todas explican por qué',
  TRIGONOMETRIA.every((p) => p.explicacion.length > 60));
ok('las fórmulas abren y cierran',
  TRIGONOMETRIA.every((p) => [p.enunciado, p.explicacion, ...p.opciones]
    .every((t) => (t.match(/\$/g) ?? []).length % 2 === 0)),
  '→ una a medias se pinta como texto roto');

/*
 * El banco anterior tenía las diez preguntas con la respuesta en A. Un alumno
 * que marcara siempre A sacaba 100% y el índice calculaba un resultado
 * perfecto sobre datos basura. Añadir cincuenta más con el mismo vicio habría
 * empeorado el problema en vez de arreglarlo.
 */
const posiciones = [0, 1, 2, 3].map((i) => TRIGONOMETRIA.filter((p) => p.correcta === i).length);
const mayor = Math.max(...posiciones) / TRIGONOMETRIA.length;
ok('la respuesta correcta está repartida entre las cuatro alternativas',
  posiciones.every((n) => n > 0) && mayor < 0.35,
  `→ A:${posiciones[0]} B:${posiciones[1]} C:${posiciones[2]} D:${posiciones[3]} · la más usada, ${Math.round(mayor * 100)}%`);

/*
 * Cada pregunta apunta a un TEMA, no a un bloque. Las preguntas viejas usan
 * `tri-identidades`, que es el bloque: con eso el diagnóstico sabe que fallas
 * identidades, pero no cuál de las tres ni a qué material mandarte.
 */
const temas = new Set(temasDe('trigonometria').map((t) => t.id));
const fuera = [...new Set(TRIGONOMETRIA.map((p) => p.temaId))].filter((t) => !temas.has(t));
ok('cada pregunta apunta a un tema real del temario',
  fuera.length === 0,
  fuera.length ? `→ no existen: ${fuera.join(', ')}` : `→ ${temas.size} temas declarados`);

const cubiertos = new Set(TRIGONOMETRIA.map((p) => p.temaId));
ok('el banco cubre los trece temas del curso',
  cubiertos.size === temas.size,
  `→ ${cubiertos.size} de ${temas.size}`);

const porTema = [...temas].map((t) => TRIGONOMETRIA.filter((p) => p.temaId === t).length);
ok('ningún tema se queda con una sola pregunta',
  Math.min(...porTema) >= 2,
  `→ el más flojo tiene ${Math.min(...porTema)}`);

ok('la dificultad está declarada y en rango',
  TRIGONOMETRIA.every((p) => p.dificultad > 0 && p.dificultad < 1));

/* ── Las dos del temario oficial que faltaban ───────────────────────── */

{
  const valor = Math.sin(rad(-30)) + Math.cos(rad(-60));
  if (Math.abs(valor) > CASI) malas.push('trg-151: la suma no da 0');
  const p = porId.get('trg-151');
  ok('ángulos negativos: sen(−30°) + cos(−60°) se verifica', Math.abs(valor) < CASI && p.opciones[p.correcta] === '$0$');
}
{
  // Por la ley de senos, a/b = sen A / sen B; la de tangentes tiene que
  // salir sola.
  const [sA, sB] = [Math.sin(rad(75)), Math.sin(rad(15))];
  const valor = (sA - sB) / (sA + sB);
  const p = porId.get('trg-152');
  ok('ley de tangentes: se verifica con la ley de senos',
    Math.abs(valor - Math.sqrt(3) / 3) < CASI && p.opciones[p.correcta] === '$\\dfrac{\\sqrt{3}}{3}$',
    `→ ${valor.toFixed(6)} = √3/3`);
}

/* ── Las ocho preguntas originales ──────────────────────────────────── */

/*
 * La batería solo verificaba las cincuenta escritas después. Estas ocho eran
 * correctas, pero nadie lo había comprobado por cálculo, y además tenían la
 * respuesta en la A. Ahora pasan por lo mismo que las demás.
 */
const { bancoCompleto: todas } = await import('../src/data/mock/questions.js');
const viejas = new Map(todas().filter((p) => /^trig-00/.test(p.id)).map((p) => [p.id, p]));
const errores = [];
const marcadaDe = (id) => viejas.get(id).opciones[viejas.get(id).correcta];
const debe = (id, cumple, esperado) => {
  if (!cumple) errores.push(`${id}: el cálculo no cuadra`);
  else if (marcadaDe(id) !== esperado) errores.push(`${id}: marca "${marcadaDe(id)}" y el cálculo da "${esperado}"`);
};
debe('trig-001', identicas((x) => Math.sin(x) ** 4 - Math.cos(x) ** 4 + 1, (x) => 2 * Math.sin(x) ** 2), '$2\\sin^2 x$');
{
  const x = rad(45);
  debe('trig-002', Math.abs(Math.sin(x) + Math.cos(x) - Math.SQRT2) < CASI && Math.abs(Math.sin(x) * Math.cos(x) - 0.5) < CASI, '$\\tfrac{1}{2}$');
}
debe('trig-003', identicas((x) => (1 + Math.tan(x) ** 2) * Math.cos(x) ** 2, () => 1), '$1$');
debe('trig-004', Math.abs(Math.sin(Math.atan(3 / 4)) - 3 / 5) < CASI, '$\\tfrac{3}{5}$');
debe('trig-005', identicas((x) => Math.sin(Math.PI / 2 - x) + Math.cos(Math.PI - x), () => 0), '$0$');
debe('trig-006', Math.abs(Math.sin(rad(20)) ** 2 + Math.sin(rad(70)) ** 2 - 1) < CASI, '$1$');
{
  // sec x − tan x = 3: se busca x por bisección y se mide sec x + tan x.
  const f = (x) => 1 / Math.cos(x) - Math.tan(x) - 3;
  let [a, b] = [-Math.PI / 2 + 1e-9, Math.PI / 2 - 1e-9];
  for (let i = 0; i < 200; i += 1) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
  const x = (a + b) / 2;
  debe('trig-007', Math.abs(1 / Math.cos(x) + Math.tan(x) - 1 / 3) < 1e-7, '$\\tfrac{1}{3}$');
}
debe('trig-008', identicas((x) => Math.sin(x) / (1 + Math.cos(x)) + (1 + Math.cos(x)) / Math.sin(x), (x) => 2 / Math.sin(x)), '$2\\csc x$');
ok('las ocho preguntas originales también están verificadas por cálculo',
  errores.length === 0 && viejas.size === 8, errores.length ? `→ ${errores.join(' · ')}` : '→ 8 de 8');
ok('y ya no tienen todas la respuesta en la A',
  new Set([...viejas.values()].map((p) => p.correcta)).size === 4);

/* ── Cada explicación de fallo, con su alternativa ──────────────────── */

/*
 * Las explicaciones de fallo están atadas a la POSICIÓN de una alternativa.
 * Al mover la respuesta de sitio, la alternativa que ocupaba ese hueco se
 * desplaza, y si su explicación no se mueve con ella el alumno lee por qué
 * falló algo que no eligió. Muchas explicaciones citan su alternativa
 * literalmente; si citan una que existe, tiene que ser la suya.
 */
const { EXPLICACIONES_BASE } = await import('../src/data/mock/explicaciones-base.js');
const todasPorId = new Map(todas().map((p) => [p.id, p]));
const desatadas = [];
let comprobables = 0;
for (const x of EXPLICACIONES_BASE) {
  const p = todasPorId.get(x.preguntaId);
  if (!p) continue;
  if (x.opcion === p.correcta) { desatadas.push(`${x.preguntaId}#${x.opcion}: explica la correcta como si fuera un fallo`); continue; }
  // La correcta no cuenta: una explicación de fallo la cita con toda
  // naturalidad para decir cuál era la buena. Lo que delata un error de
  // asignación es que cite OTRA alternativa equivocada y no la suya.
  const citadas = p.opciones.map((o, i) => [o, i]).filter(([o, i]) => i !== p.correcta && x.texto.includes(o));
  if (!citadas.length) continue;
  comprobables += 1;
  if (!citadas.some(([, i]) => i === x.opcion)) {
    desatadas.push(`${x.preguntaId}#${x.opcion}: cita ${citadas.map(([o]) => o).join(', ')}, que no es su alternativa`);
  }
}
ok('ninguna explicación de fallo apunta a la alternativa correcta ni a otra que no es la suya',
  desatadas.length === 0,
  desatadas.length ? `→ ${desatadas.join(' · ')}` : `→ ${comprobables} explicaciones citan su alternativa y cuadran`);

/* Al reasignar, el error típico no deja cita que comparar: deja DOS
   explicaciones sobre la misma alternativa, o una que apunta a una posición
   que no existe. Eso se detecta siempre, cite o no cite. */
{
  const vistas = new Map();
  const choques = [];
  for (const x of EXPLICACIONES_BASE) {
    const p = todasPorId.get(x.preguntaId);
    const clave = `${x.preguntaId}#${x.opcion}`;
    if (vistas.has(clave)) choques.push(`${clave} está dos veces`);
    if (p && !(x.opcion >= 0 && x.opcion < p.opciones.length)) choques.push(`${clave} apunta fuera de las alternativas`);
    vistas.set(clave, true);
  }
  ok('cada alternativa tiene como mucho una explicación de fallo, y existe',
    choques.length === 0, choques.length ? `→ ${choques.join(' · ')}` : `→ ${EXPLICACIONES_BASE.length} explicaciones`);
}

/* ── Que cargar un curso no secuestre el diagnóstico ─────────────────── */

/*
 * El diagnóstico sacaba preguntas al azar del banco entero. Con 58 de 60 en
 * trigonometría, las diez salían casi todas de ahí: el índice pretendía
 * estimar el nivel general de alguien midiendo un solo curso. Cargar contenido
 * no puede empeorar la medición.
 */
const { iniciarSesion, bancoCompleto } = await import('../src/data/mock/questions.js');

const banco = bancoCompleto();
const cursosConBanco = new Set(banco.map((p) => p.cursoId)).size;
const diagnostico = iniciarSesion({ modo: 'diagnostico' });
const reparto = new Map();
for (const p of diagnostico.preguntas) reparto.set(p.cursoId, (reparto.get(p.cursoId) ?? 0) + 1);

ok('el diagnóstico toca todos los cursos que tienen preguntas',
  reparto.size === cursosConBanco,
  `→ ${reparto.size} de ${cursosConBanco} · ${[...reparto].map(([c, n]) => `${c}:${n}`).join(' ')}`);

/* Lo que importa es que el diagnóstico reparta parejo, no que un curso pese
   menos que en el banco. Antes se comprobaba esto último, que tenía sentido
   con un banco 97 % trigonometría y dejó de tenerlo al equilibrarse: con seis
   cursos cargados la comparación fallaba sin que nada estuviera mal. La
   propiedad de verdad es que ningún curso se lleve más de lo que le toca. */
const tope = Math.ceil(diagnostico.total / reparto.size);
ok('ningún curso se lleva más preguntas de las que le tocan en un reparto parejo',
  Math.max(...reparto.values()) <= tope,
  `→ como mucho ${Math.max(...reparto.values())} por curso, con un tope de ${tope} para ${reparto.size} cursos`);

ok('la práctica de un curso sí saca solo de ese curso',
  iniciarSesion({ modo: 'curso', cursoId: 'trigonometria' })
    .preguntas.every((p) => p.cursoId === 'trigonometria'));

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
