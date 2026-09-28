/**
 * Banco de Aritmética: el solucionario tiene que ser correcto y único.
 *
 * Cada respuesta se recalcula aquí desde cero —tablas de verdad por fuerza
 * bruta, divisores contados uno a uno, dados enumerados— sin mirar la clave
 * del banco. Después se comprueban dos cosas:
 *
 *   1. que la alternativa marcada valga lo que da el cálculo;
 *   2. que sea la ÚNICA que lo vale. Si dos alternativas coinciden con la
 *      respuesta, la pregunta es irresoluble aunque la clave "esté bien", y
 *      el alumno que eligió la otra queda marcado como error sin haberlo
 *      cometido.
 *
 * Una clave equivocada en una plataforma de admisión no es cosmética: el
 * alumno estudia el error, lo repite en el examen, y encima el diagnóstico lo
 * cuenta como acierto, así que el índice sube mientras la persona empeora.
 */
import { ARITMETICA } from '../src/data/mock/preguntas-aritmetica.js';
import { temasDe } from '../src/data/mock/temario.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const porId = new Map(ARITMETICA.map((p) => [p.id, p]));
const CASI = 1e-9;

/* ── Utilidades de cálculo, escritas aquí y no importadas ────────────── */

const mcd = (a, b) => (b === 0 ? Math.abs(a) : mcd(b, a % b));
const mcm = (...xs) => xs.reduce((a, b) => (a * b) / mcd(a, b));
const esPrimo = (n) => n > 1 && [...Array(Math.floor(Math.sqrt(n)) + 1).keys()].slice(2).every((d) => n % d !== 0);
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
const combinaciones = (n, k) => factorial(n) / (factorial(k) * factorial(n - k));
const media = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const mediana = (xs) => {
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};
const varianzaPoblacional = (xs) => media(xs.map((x) => (x - media(xs)) ** 2));
const implica = (a, b) => !a || b;
const VF = (b) => (b ? 'V' : 'F');
const fraccion = (n, d) => `$\\dfrac{${n}}{${d}}$`;

/**
 * El valor numérico de una alternativa escrita en LaTeX.
 * Entiende enteros, decimales con coma, fracciones y raíces cuadradas.
 * Devuelve null para lo que no es un número, como "Baja un 4 %".
 */
function valorDe(opcion) {
  let t = String(opcion).trim();
  if (!t.startsWith('$') || !t.endsWith('$')) return null;
  t = t.slice(1, -1).trim().replace(/\{,\}/g, '.');
  let m;
  if ((m = t.match(/^(-?\d+(?:\.\d+)?)$/))) return Number(m[1]);
  if ((m = t.match(/^\\dfrac\{(-?\d+)\}\{(\d+)\}$/))) return Number(m[1]) / Number(m[2]);
  if ((m = t.match(/^(\d*)\\sqrt\{(\d+)\}$/))) return (m[1] ? Number(m[1]) : 1) * Math.sqrt(Number(m[2]));
  return null;
}

const malas = [];

/** La marcada vale `valor`, y ninguna otra lo vale. */
function numero(id, valor) {
  const p = porId.get(id);
  if (!p) { malas.push(`${id}: no existe`); return; }
  const valores = p.opciones.map(valorDe);
  const marcada = valores[p.correcta];
  const coinciden = valores.filter((v) => v !== null && Math.abs(v - valor) < CASI).length;
  if (marcada === null || Math.abs(marcada - valor) > CASI) {
    malas.push(`${id}: la clave dice "${p.opciones[p.correcta]}" y el cálculo da ${valor}`);
  } else if (coinciden !== 1) {
    malas.push(`${id}: ${coinciden} alternativas valen ${valor}; la pregunta es irresoluble`);
  }
}

/** La marcada es exactamente `esperado`, y ninguna otra lo es. */
function texto(id, esperado) {
  const p = porId.get(id);
  if (!p) { malas.push(`${id}: no existe`); return; }
  if (p.opciones[p.correcta] !== esperado) {
    malas.push(`${id}: la clave dice "${p.opciones[p.correcta]}" y el cálculo da "${esperado}"`);
  } else if (p.opciones.filter((o) => o === esperado).length !== 1) {
    malas.push(`${id}: la respuesta aparece repetida entre las alternativas`);
  }
}

/* ── Lógica y conjuntos ──────────────────────────────────────────────── */

{
  let verdaderas = 0;
  for (const p of [true, false]) for (const q of [true, false]) {
    if (implica(p, q) && implica(q, p)) verdaderas += 1;
  }
  numero('ari-101', verdaderas);
}
{
  const falsas = [];
  for (const p of [true, false]) for (const q of [true, false]) for (const r of [true, false]) {
    if (!implica(p && !q, r)) falsas.push(`${VF(p)}, ${VF(q)}, ${VF(r)}`);
  }
  if (falsas.length !== 1) malas.push(`ari-102: hay ${falsas.length} asignaciones que la hacen falsa`);
  else texto('ari-102', falsas[0]);
}
numero('ari-103', 15 + 12 - 5);
numero('ari-104', 2 ** 4 - 1);

/* ── Naturales ───────────────────────────────────────────────────────── */

numero('ari-105', (50 + 14) / 2);
numero('ari-106', 72 / (1 + 2 + 3));
numero('ari-107', 2 ** 10 - 10 ** 2);
numero('ari-108', Number(Math.cbrt(0.008).toFixed(12)));
numero('ari-109', [...Array(10000).keys()].filter((n) => String(n).length === 3).length);
{
  const sumas = new Set();
  for (let a = 1; a <= 9; a += 1) for (let b = 1; b <= 9; b += 1) {
    if (10 * a + b + 10 * b + a === 132) sumas.add(a + b);
  }
  if (sumas.size !== 1) malas.push(`ari-110: las soluciones no dan una sola suma (${[...sumas]})`);
  else numero('ari-110', [...sumas][0]);
}

/* ── Enteros y divisibilidad ─────────────────────────────────────────── */

numero('ari-111', -3 - (-7) + (-2) * (-4));
numero('ari-112', Math.max(...[...Array(201).keys()].map((i) => i - 100).filter((x) => 3 * x - 5 < 16)));
numero('ari-113', 257 % 12);
{
  const cifras = [...Array(10).keys()].filter((a) => (500 + 10 * a + 3) % 11 === 0);
  if (cifras.length !== 1) malas.push(`ari-114: ${cifras.length} cifras cumplen`);
  else numero('ari-114', cifras[0]);
}
numero('ari-115', [...Array(361).keys()].filter((d) => d > 0 && 360 % d === 0).length);
numero('ari-116', [...Array(40).keys()].filter((n) => n > 20 && esPrimo(n)).length);
numero('ari-117', mcd(84, 126));
numero('ari-118', mcd(391, 299));
numero('ari-119', mcm(12, 18, 30));
{
  const minutos = 8 * 60 + mcm(6, 8, 10);
  texto('ari-120', `${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, '0')}`);
}

/* ── Racionales ──────────────────────────────────────────────────────── */

{
  const irreducibles = [[21, 35], [14, 49], [18, 24], [15, 28]].filter(([n, d]) => mcd(n, d) === 1);
  if (irreducibles.length !== 1) malas.push(`ari-121: ${irreducibles.length} son irreducibles`);
  else texto('ari-121', fraccion(...irreducibles[0]));
}
numero('ari-122', [...Array(12).keys()].filter((n) => n > 0 && mcd(n, 12) === 1).length);
{
  // 2/3 + 3/4 - 1/6, con enteros para no arrastrar error de coma flotante.
  const n = 2 * 4 * 6 + 3 * 3 * 6 - 1 * 3 * 4;
  const d = 3 * 4 * 6;
  const g = mcd(n, d);
  texto('ari-123', fraccion(n / g, d / g));
}
{
  const orden = [[3, 5], [5, 8], [2, 3]].sort((a, b) => a[0] / a[1] - b[0] / b[1]);
  texto('ari-124', `$${orden.map(([n, d]) => `\\dfrac{${n}}{${d}}`).join(' < ')}$`);
}
{
  const g = mcd(36, 99);
  texto('ari-125', fraccion(36 / g, 99 / g));
}
{
  let n = 7;
  let cifras = 0;
  while (n % 40 !== 0 && cifras < 30) { n *= 10; cifras += 1; }
  numero('ari-126', cifras);
}

/* ── Razones, proporciones y porcentajes ─────────────────────────────── */

numero('ari-127', 7 * (45 / (3 + 5 + 7)));
numero('ari-128', (64 / (3 + 5)) * 3);
numero('ari-129', (6 * 20) / 8);
numero('ari-130', (900 / (2 + 3 + 4)) * 4);
numero('ari-131', 0.2 * 0.3 * 500);
{
  const cambio = Math.round((1.2 * 0.8 - 1) * 100);
  texto('ari-132', cambio === 0 ? 'Igual' : `${cambio > 0 ? 'Sube' : 'Baja'} un ${Math.abs(cambio)} %`);
}
{
  const general = (n) => n * (n + 1);
  const dados = [2, 6, 12, 20, 30];
  if (!dados.every((x, i) => x === general(i + 1))) malas.push('ari-133: la regla no genera los términos dados');
  else numero('ari-133', general(6));
}
{
  const fib = [1, 1];
  while (fib.length < 7) fib.push(fib.at(-1) + fib.at(-2));
  numero('ari-134', fib[6]);
}
numero('ari-135', 5 + (20 - 1) * 3);
numero('ari-136', [0, 1, 2, 3, 4, 5].reduce((s, i) => s + 3 * 2 ** i, 0));
texto('ari-137', `S/ ${2000 * 0.05 * 3}`);
texto('ari-138', `S/ ${(20 * 10 + 30 * 15) / (20 + 30)}`);

/* ── Estadística ─────────────────────────────────────────────────────── */

numero('ari-139', media([4, 7, 7, 10, 12]));
numero('ari-140', mediana([3, 9, 5, 12, 7, 1]));
{
  // Dos métodos distintos tienen que coincidir; si no, la pregunta dependería
  // de qué convención enseñó cada academia.
  const datos = [...Array(11).keys()].map((i) => i + 1);
  const porPosicion = datos[(datos.length + 1) / 4 - 1];
  const porMitades = mediana(datos.slice(0, Math.floor(datos.length / 2)));
  if (porPosicion !== porMitades) malas.push('ari-141: los métodos de cuartil no coinciden');
  else numero('ari-141', porPosicion);
}
numero('ari-142', mediana([5, 10, 15, 20, 25, 30, 35, 40, 45]));
numero('ari-143', varianzaPoblacional([2, 4, 6]));
numero('ari-144', Math.sqrt(varianzaPoblacional([1, 3, 5, 7, 9])));
numero('ari-145', 10 / (4 + 6 + 10 + 5));
numero('ari-146', 3 + 7 + 5);

/* ── Conteo y probabilidad ───────────────────────────────────────────── */

{
  const letras = 'AMOR'.split('');
  const perm = (xs) => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perm([...xs.slice(0, i), ...xs.slice(i + 1)]).map((r) => [x, ...r])));
  numero('ari-147', new Set(perm(letras).map((p) => p.join(''))).size);
}
numero('ari-148', combinaciones(7, 3));
{
  let casos = 0;
  for (let a = 1; a <= 6; a += 1) for (let b = 1; b <= 6; b += 1) if (a + b === 7) casos += 1;
  numero('ari-149', casos / 36);
}
{
  // Se enumeran todos los pares posibles de bolas, sin fórmula.
  const urna = ['R', 'R', 'R', 'A', 'A'];
  let pares = 0;
  let rojos = 0;
  for (let i = 0; i < urna.length; i += 1) for (let j = i + 1; j < urna.length; j += 1) {
    pares += 1;
    if (urna[i] === 'R' && urna[j] === 'R') rojos += 1;
  }
  numero('ari-150', rojos / pares);
}

ok('el solucionario recalculado coincide con la clave marcada, y es único',
  malas.length === 0,
  malas.length ? `→ ${malas.join(' · ')}` : `→ ${ARITMETICA.length} preguntas verificadas por cálculo`);

/* ── Salud del banco ─────────────────────────────────────────────────── */

ok('ningún identificador se repite', new Set(ARITMETICA.map((p) => p.id)).size === ARITMETICA.length);
ok('todas tienen cuatro alternativas distintas',
  ARITMETICA.every((p) => p.opciones.length === 4 && new Set(p.opciones).size === 4));
ok('todas explican por qué', ARITMETICA.every((p) => p.explicacion.length > 60));
ok('las fórmulas abren y cierran',
  ARITMETICA.every((p) => [p.enunciado, p.explicacion, ...p.opciones]
    .every((t) => (t.match(/\$/g) ?? []).length % 2 === 0)));
ok('la dificultad está declarada y en rango',
  ARITMETICA.every((p) => p.dificultad > 0 && p.dificultad < 1));

const posiciones = [0, 1, 2, 3].map((i) => ARITMETICA.filter((p) => p.correcta === i).length);
const mayor = Math.max(...posiciones) / ARITMETICA.length;
ok('la respuesta correcta está repartida entre las cuatro alternativas',
  posiciones.every((n) => n > 0) && mayor < 0.35,
  `→ A:${posiciones[0]} B:${posiciones[1]} C:${posiciones[2]} D:${posiciones[3]} · la más usada, ${Math.round(mayor * 100)}%`);

const temas = new Set(temasDe('aritmetica').map((t) => t.id));
const fuera = [...new Set(ARITMETICA.map((p) => p.temaId))].filter((t) => !temas.has(t));
ok('cada pregunta apunta a un tema real del temario',
  fuera.length === 0, fuera.length ? `→ no existen: ${fuera.join(', ')}` : '');

const porTema = [...temas].map((t) => ARITMETICA.filter((p) => p.temaId === t).length);
ok('el banco cubre todos los temas del curso',
  porTema.every((n) => n > 0), `→ ${porTema.filter((n) => n > 0).length} de ${temas.size}`);
ok('ningún tema se queda con una sola pregunta',
  Math.min(...porTema) >= 2, `→ el más flojo tiene ${Math.min(...porTema)}`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
