/**
 * Banco de Álgebra: el solucionario tiene que ser correcto y único.
 *
 * Cada respuesta se recalcula aquí desde cero, sin mirar la clave: los
 * sistemas se resuelven por eliminación, los polinomios se dividen con
 * Ruffini, los problemas de programación lineal recorren los vértices de su
 * región, las raíces complejas se comprueban evaluando. Después se exige que
 * la alternativa marcada sea la ÚNICA que coincide con el cálculo.
 *
 * Para las preguntas de "¿cuál de estas…?", la prueba declara cada
 * alternativa junto a su versión calculable y comprueba primero que esas
 * alternativas son exactamente las del banco. Así la verificación no puede
 * despegarse del texto que ve el alumno.
 */
import { ALGEBRA } from '../src/data/mock/preguntas-algebra.js';
import { temasDe } from '../src/data/mock/temario.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const porId = new Map(ALGEBRA.map((p) => [p.id, p]));
const CASI = 1e-9;
const malas = [];

/**
 * Valor numérico de una alternativa en LaTeX, o null si no es un número.
 * Entiende enteros, decimales con coma, fracciones, raíces y sumas de ellos.
 * Evalúa solo después de comprobar que no queda nada más que aritmética.
 */
function valorDe(opcion) {
  const t0 = String(opcion).trim();
  if (!/^\$[^$]*\$$/.test(t0)) return null;
  let t = t0.slice(1, -1).replace(/\{,\}/g, '.');
  t = t.replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
  t = t.replace(/(\d)\\sqrt\{([^{}]+)\}/g, '$1*Math.sqrt($2)');
  t = t.replace(/\\sqrt\{([^{}]+)\}/g, 'Math.sqrt($1)');
  if (/[^\d\s+\-*/().]/.test(t.replace(/Math\.sqrt/g, ''))) return null;
  try {
    const v = Function(`"use strict"; return (${t});`)();
    return Number.isFinite(v) ? v : null;
  } catch { return null; }
}

function numero(id, valor) {
  const p = porId.get(id);
  if (!p) { malas.push(`${id}: no existe`); return; }
  const valores = p.opciones.map(valorDe);
  const marcada = valores[p.correcta];
  const coinciden = valores.filter((v) => v !== null && Math.abs(v - valor) < CASI).length;
  if (marcada === null || Math.abs(marcada - valor) > CASI) {
    malas.push(`${id}: la clave dice "${p.opciones[p.correcta]}" y el cálculo da ${valor}`);
  } else if (coinciden !== 1) {
    malas.push(`${id}: ${coinciden} alternativas valen ${valor}`);
  }
}

function texto(id, esperado) {
  const p = porId.get(id);
  if (!p) { malas.push(`${id}: no existe`); return; }
  if (p.opciones[p.correcta] !== esperado) {
    malas.push(`${id}: la clave dice "${p.opciones[p.correcta]}" y el cálculo da "${esperado}"`);
  } else if (p.opciones.filter((o) => o === esperado).length !== 1) {
    malas.push(`${id}: la respuesta aparece repetida`);
  }
}

/** Para "¿cuál de estas…?": exactamente una alternativa cumple la propiedad. */
function cual(id, candidatos, cumple) {
  const p = porId.get(id);
  if (!p) { malas.push(`${id}: no existe`); return; }
  const declarados = candidatos.map(([t]) => t).sort().join('|');
  if (declarados !== [...p.opciones].sort().join('|')) {
    malas.push(`${id}: las alternativas de la prueba no son las del banco`);
    return;
  }
  const buenas = candidatos.filter(([, d]) => cumple(d)).map(([t]) => t);
  if (buenas.length !== 1) malas.push(`${id}: ${buenas.length} alternativas cumplen`);
  else if (p.opciones[p.correcta] !== buenas[0]) malas.push(`${id}: la clave dice "${p.opciones[p.correcta]}" y cumple "${buenas[0]}"`);
}

/* ── Utilidades de cálculo, escritas aquí ────────────────────────────── */

const intervalo = (a, cerradoA, b, cerradoB) => {
  const izq = a === -Infinity ? '\\langle -\\infty' : (cerradoA ? `[${a}` : `\\langle ${a}`);
  const der = b === Infinity ? '+\\infty \\rangle' : (cerradoB ? `${b}]` : `${b} \\rangle`);
  return `$${izq}, ${der}$`;
};
const punto = (x, y) => `$(${x}, ${y})$`;
const evaluar = (coefs, x) => coefs.reduce((s, c) => s * x + c, 0);
const ruffini = (coefs, r) => {
  const q = [coefs[0]];
  for (let i = 1; i < coefs.length; i += 1) q.push(coefs[i] + q.at(-1) * r);
  return { cociente: q.slice(0, -1), resto: q.at(-1) };
};
const multiplicar = (a, b) => {
  const r = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; }));
  return r;
};
const raicesCuadratica = (a, b, c) => {
  const d = b * b - 4 * a * c;
  if (d < 0) return [];
  return [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)];
};
const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i += 1) r = (r * (n - k + i)) / i; return r; };
const enteros = (desde, hasta) => [...Array(hasta - desde + 1).keys()].map((i) => i + desde);
const mul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
const potC = (z, n) => { let r = [1, 0]; for (let i = 0; i < n; i += 1) r = mul(r, z); return r; };
const complejo = ([re, im]) => {
  if (im === 0) return `$${re}$`;
  const parte = im === 1 ? 'i' : im === -1 ? '- i' : im < 0 ? `- ${-im}i` : `${im}i`;
  if (re === 0) return `$${im === 1 ? 'i' : im === -1 ? '-i' : `${im}i`}$`;
  return `$${re} ${parte.startsWith('-') ? parte : `+ ${parte}`}$`;
};

/** Resuelve un sistema lineal cuadrado por eliminación de Gauss. */
function gauss(m) {
  const a = m.map((f) => [...f]);
  const n = a.length;
  for (let c = 0; c < n; c += 1) {
    const piv = a.slice(c).reduce((best, f, i) => (Math.abs(f[c]) > Math.abs(a[best][c]) ? c + i : best), c);
    [a[c], a[piv]] = [a[piv], a[c]];
    for (let f = 0; f < n; f += 1) {
      if (f === c) continue;
      const k = a[f][c] / a[c][c];
      for (let j = c; j <= n; j += 1) a[f][j] -= k * a[c][j];
    }
  }
  return a.map((f, i) => f[n] / f[i]);
}

/** Vértices de una región del plano dada por restricciones a·x + b·y ≤ c. */
function vertices(restricciones) {
  const vs = [];
  for (let i = 0; i < restricciones.length; i += 1) {
    for (let j = i + 1; j < restricciones.length; j += 1) {
      const [a1, b1, c1] = restricciones[i];
      const [a2, b2, c2] = restricciones[j];
      const det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < CASI) continue;
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      if (restricciones.every(([a, b, c]) => a * x + b * y <= c + CASI)) vs.push([x, y]);
    }
  }
  return vs;
}

/* ── Reales, intervalos, valor absoluto y complejos ──────────────────── */

numero('alg-101', (2 ** 5 * 2 ** -3) / 2 ** -1);
numero('alg-102', Math.sqrt(50) + Math.sqrt(18) - Math.sqrt(8));
{
  // A = [-2, 5⟩ y B = ⟨1, 8]. Cada extremo recuerda si está incluido.
  const A = { a: -2, ca: true, b: 5, cb: false };
  const B = { a: 1, ca: false, b: 8, cb: true };
  const a = Math.max(A.a, B.a);
  const b = Math.min(A.b, B.b);
  const ca = (A.a === a ? A.ca : true) && (B.a === a ? B.ca : true);
  const cb = (A.b === b ? A.cb : true) && (B.b === b ? B.cb : true);
  texto('alg-103', intervalo(a, ca, b, cb));
}
numero('alg-104', enteros(-10, 10).filter((n) => n > -3 && n <= 4).length);
{
  const sols = [(3 + 7) / 2, (3 - 7) / 2];
  if (!sols.every((x) => Math.abs(2 * x - 3) === 7)) malas.push('alg-105: las soluciones no cumplen');
  else numero('alg-105', sols[0] + sols[1]);
}
numero('alg-106', enteros(-20, 20).filter((x) => Math.abs(x - 1) < 3).length);
texto('alg-107', complejo(mul([2, 3], [1, -1])));
texto('alg-108', complejo(potC([0, 1], 2027 % 4)));
numero('alg-109', Math.hypot(6, -8));
{
  const [re, im] = mul([3, 4], [3, -4]);
  if (im !== 0) malas.push('alg-110: el producto por el conjugado no es real');
  else numero('alg-110', re);
}

/* ── Ecuaciones e inecuaciones ───────────────────────────────────────── */

numero('alg-111', 10 / (1 / 2 + 1 / 3));
numero('alg-112', Math.max(...raicesCuadratica(1, -7, 10)));
{
  const t = raicesCuadratica(1, -5, 4);
  numero('alg-113', t.reduce((n, v) => n + (v > 0 ? 2 : v === 0 ? 1 : 0), 0));
}
{
  const t = raicesCuadratica(1, -13, 36);
  const reales = t.flatMap((v) => (v > 0 ? [Math.sqrt(v), -Math.sqrt(v)] : v === 0 ? [0] : []));
  numero('alg-114', reales.reduce((s, x) => s + x * x, 0));
}
{
  // 3x - 4 > 2x + 1  ⟺  x > 5: abierto en el borde, sin cota por arriba.
  const borde = (1 + 4) / (3 - 2);
  texto('alg-115', intervalo(borde, false, Infinity, false));
}
numero('alg-116', enteros(-20, 20).filter((x) => x * x - x - 6 < 0).length);

/* ── Sistemas y programación lineal ──────────────────────────────────── */

{
  const [x, y] = gauss([[1, 1, 10], [1, -1, 4]]);
  numero('alg-117', x * y);
}
numero('alg-118', gauss([[1, 1, 1, 6], [1, -1, 0, 1], [0, 1, -1, 1]])[0]);
numero('alg-119', 2 * -1 - 3 * 1);
{
  const det = 2 * -1 - 3 * 1;
  const detY = 2 * -1 - 8 * 1;
  const y = detY / det;
  const [xG, yG] = gauss([[2, 3, 8], [1, -1, -1]]);
  if (Math.abs(y - yG) > CASI) malas.push('alg-120: Cramer y Gauss no coinciden');
  else numero('alg-120', y);
  void xG;
}
cual('alg-121', [
  ['$(3, 2)$', [3, 2]], ['$(1, 2)$', [1, 2]], ['$(2, 3)$', [2, 3]], ['$(0, 0)$', [0, 0]],
], ([x, y]) => x + y <= 4 && y > x);
numero('alg-122', enteros(0, 5).flatMap((x) => enteros(0, 5).map((y) => [x, y])).filter(([x, y]) => x + y <= 2).length);
numero('alg-123', Math.max(...vertices([[1, 1, 4], [1, 0, 3], [-1, 0, 0], [0, -1, 0]]).map(([x, y]) => 3 * x + 2 * y)));
numero('alg-124', Math.min(...vertices([[-1, -1, -6], [1, 0, 4], [-1, 0, 0], [0, -1, 0]]).map(([x, y]) => 2 * x + 5 * y)));

/* ── Expresiones y polinomios ────────────────────────────────────────── */

{
  const [a, b] = raicesCuadratica(1, -5, 6); // a + b = 5 y ab = 6
  numero('alg-125', a * a + b * b);
}
numero('alg-126', 3 * (2 * 0 - 1) - 2 * (0 - 4));
{
  // Exponente de x, comprobado evaluando en x = 2.
  const valor = ((2 ** 3) ** 4 * 2 ** -2) / 2 ** 5;
  numero('alg-127', Math.log2(valor));
}
numero('alg-128', 0.5 ** -3 + 4 ** 0.5);
numero('alg-129', 6 / Math.sqrt(3));
numero('alg-130', Math.sqrt(7 + 4 * Math.sqrt(3)));
numero('alg-131', Math.max(...[[4, 2], [2, 5], [0, 0]].map(([a, b]) => a + b)));
numero('alg-132', evaluar([2, -3, 1], 2) + evaluar([2, -3, 1], -1));
{
  const producto = multiplicar([2, 3], [1, -1, 4]); // de mayor a menor grado
  numero('alg-133', producto[producto.length - 3]);
}
numero('alg-134', multiplicar([1, 2, 0], [3, -1]).reduce((s, c) => s + c, 0));
numero('alg-135', ruffini([1, -2, 3, -4], 2).resto);
numero('alg-136', ruffini([2, 1, -5, 3], -1).cociente.reduce((s, c) => s + c, 0));
numero('alg-137', evaluar([1, 0, 0, -3, 0, 1], -1));
{
  const k = enteros(-10, 10).filter((kk) => evaluar([1, kk, -6], 2) === 0);
  if (k.length !== 1) malas.push(`alg-138: ${k.length} valores de k`);
  else numero('alg-138', k[0]);
}
cual('alg-139', [
  ['$x + 1$', -1], ['$x - 4$', 4], ['$x - 3$', 3], ['$x + 2$', -2],
], (raiz) => evaluar([1, -6, 11, -6], raiz) === 0);
{
  const a = enteros(-10, 10).filter((aa) => evaluar([1, 0, aa, -4], 1) === 0);
  if (a.length !== 1) malas.push(`alg-140: ${a.length} valores de a`);
  else numero('alg-140', a[0]);
}
{
  const x = (3 + Math.sqrt(5)) / 2; // cumple x + 1/x = 3
  if (Math.abs(x + 1 / x - 3) > CASI) malas.push('alg-141: la x elegida no cumple la condición');
  else numero('alg-141', x * x + 1 / (x * x));
}
numero('alg-142', comb(4, 2) * 2 ** 2);
{
  const raices = [-3, -2, -1, 0, 1, 2, 3].filter((r) => evaluar([1, 0, -1, 0], r) === 0);
  numero('alg-143', raices.length);
}
numero('alg-144', 53 ** 2 - 47 ** 2);
{
  // Cada candidato como sus raíces con multiplicidad; el MCD toma las comunes
  // con la menor.
  const P = { 1: 1, '-1': 1 };
  const Q = { '-1': 2 };
  const mcd = {};
  for (const r of Object.keys(P)) if (Q[r]) mcd[r] = Math.min(P[r], Q[r]);
  const clave = (m) => JSON.stringify(Object.keys(m).sort().map((r) => [r, m[r]]));
  cual('alg-145', [
    ['$x - 1$', { 1: 1 }], ['$(x + 1)^{2}$', { '-1': 2 }], ['$x + 1$', { '-1': 1 }], ['$x^{2} - 1$', { 1: 1, '-1': 1 }],
  ], (m) => clave(m) === clave(mcd));
}
{
  const P = { 2: 1, '-2': 1 };
  const Q = { '-3': 1, 2: 1 };
  const mcm = { ...P };
  for (const r of Object.keys(Q)) mcm[r] = Math.max(mcm[r] ?? 0, Q[r]);
  numero('alg-146', Object.values(mcm).reduce((s, m) => s + m, 0));
}
{
  const raices = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const todas = raices.every((z) => {
    const [re, im] = potC(z, 4);
    return Math.abs(re - 1) < CASI && Math.abs(im) < CASI;
  });
  if (!todas) malas.push('alg-147: alguna de las cuatro no es raíz');
  else numero('alg-147', raices.length);
}
{
  // Mínimo de raíces reales para grado n con coeficientes reales: n mod 2. Se
  // comprueba que se alcanza: x^5 + x + 1 cruza el eje una sola vez.
  let cruces = 0;
  for (let x = -10; x < 10; x += 0.01) {
    if (Math.sign(evaluar([1, 0, 0, 0, 1, 1], x)) !== Math.sign(evaluar([1, 0, 0, 0, 1, 1], x + 0.01))) cruces += 1;
  }
  if (cruces !== 1) malas.push(`alg-148: el ejemplo cruza ${cruces} veces`);
  else numero('alg-148', 5 % 2);
}
{
  const [r, s] = raicesCuadratica(2, -6, 3);
  numero('alg-149', r + s + r * s);
}
{
  const raices = [-6, -3, -2, -1, 1, 2, 3, 6].filter((r) => evaluar([1, -4, 1, 6], r) === 0);
  if (raices.length !== 3) malas.push(`alg-150: se encontraron ${raices.length} raíces enteras`);
  else numero('alg-150', raices.reduce((s, x) => s + x, 0));
}

/* ── Funciones ───────────────────────────────────────────────────────── */

texto('alg-151', intervalo(3, true, Infinity, false));
{
  const h = 4 / 2;
  texto('alg-152', intervalo(evaluar([1, -4, 7], h), true, Infinity, false));
}
{
  const m = (11 - 5) / (3 - 1);
  numero('alg-153', 5 - m * 1);
}
texto('alg-154', punto(6 / 2, 0));
{
  const h = 6 / 2;
  texto('alg-155', punto(h, evaluar([1, -6, 5], h)));
}
numero('alg-156', Math.min(...enteros(-50, 50).map((x) => Math.abs(x - 2) + 3)));
const PUNTOS = [0.5, 1, 1.7, 2, 3.2];
cual('alg-157', [
  ['$f(x) = x^{3}$', (x) => x ** 3], ['$f(x) = x^{2} + 1$', (x) => x ** 2 + 1],
  ['$f(x) = x + 1$', (x) => x + 1], ['$f(x) = x^{3} + x$', (x) => x ** 3 + x],
], (f) => PUNTOS.every((x) => Math.abs(f(-x) - f(x)) < CASI));
cual('alg-158', [
  ['$f(x) = x^{2}$', (x) => x ** 2], ['$f(x) = |x|$', (x) => Math.abs(x)],
  ['$f(x) = x^{3} - x$', (x) => x ** 3 - x], ['$f(x) = x^{2} + x$', (x) => x ** 2 + x],
], (f) => PUNTOS.every((x) => Math.abs(f(-x) + f(x)) < CASI));
texto('alg-159', intervalo(4 / 2, true, Infinity, false));
{
  const malla = enteros(-20, 20).map((i) => i / 2);
  cual('alg-160', [
    ['$f(x) = -3x + 4$', (x) => -3 * x + 4], ['$f(x) = 2x + 1$', (x) => 2 * x + 1],
    ['$f(x) = x^{2}$', (x) => x ** 2], ['$f(x) = |x|$', (x) => Math.abs(x)],
  ], (f) => malla.slice(1).every((x, i) => f(x) < f(malla[i])));
}
{
  const malla = enteros(-20, 20).map((i) => i / 2);
  const inyectiva = (f) => new Set(malla.map((x) => f(x).toFixed(9))).size === malla.length;
  cual('alg-161', [
    ['$f(x) = x^{2}$', (x) => x ** 2], ['$f(x) = 2x - 5$', (x) => 2 * x - 5],
    ['$f(x) = |x|$', (x) => Math.abs(x)], ['$f(x) = x^{2} - 1$', (x) => x ** 2 - 1],
  ], inyectiva);
  const enSuDominio = enteros(0, 40).map((i) => i / 2);
  const esInyectiva = new Set(enSuDominio.map((x) => x ** 2)).size === enSuDominio.length;
  if (!esInyectiva) malas.push('alg-162: x² no resultó inyectiva en [0, +∞⟩');
  else texto('alg-162', 'Sí: en ese dominio, dos valores distintos de $x$ nunca tienen la misma imagen');
}
numero('alg-163', (9 + 6) / 3);
{
  // 2x + 1 = 3(x - 3)  ⟹  x = 10, y se comprueba que f(10) = 3.
  const x = (1 + 9) / (3 - 2);
  if (Math.abs((2 * x + 1) / (x - 3) - 3) > CASI) malas.push('alg-164: la inversa no devuelve 3');
  else numero('alg-164', x);
}
numero('alg-165', Math.log2(32) - 1);
numero('alg-166', Math.log(27) / Math.log(9));
numero('alg-167', Math.log2(8) + Math.log(81) / Math.log(3));
{
  const validas = raicesCuadratica(1, 1, -12).filter((x) => x + 2 > 0 && x - 1 > 0);
  if (validas.length !== 1) malas.push(`alg-168: ${validas.length} soluciones válidas`);
  else numero('alg-168', validas[0]);
}
numero('alg-169', (29 - 5) / 2);
numero('alg-170', 50 * 2 ** 5);

ok('el solucionario recalculado coincide con la clave marcada, y es único',
  malas.length === 0,
  malas.length ? `→ ${malas.join(' · ')}` : `→ ${ALGEBRA.length} preguntas verificadas por cálculo`);

/* ── Salud del banco ─────────────────────────────────────────────────── */

ok('ningún identificador se repite', new Set(ALGEBRA.map((p) => p.id)).size === ALGEBRA.length);
ok('todas tienen cuatro alternativas distintas',
  ALGEBRA.every((p) => p.opciones.length === 4 && new Set(p.opciones).size === 4));
ok('todas explican por qué', ALGEBRA.every((p) => p.explicacion.length > 60));
ok('las fórmulas abren y cierran',
  ALGEBRA.every((p) => [p.enunciado, p.explicacion, ...p.opciones].every((t) => (t.match(/\$/g) ?? []).length % 2 === 0)));
ok('la dificultad está declarada y en rango', ALGEBRA.every((p) => p.dificultad > 0 && p.dificultad < 1));

const posiciones = [0, 1, 2, 3].map((i) => ALGEBRA.filter((p) => p.correcta === i).length);
const mayor = Math.max(...posiciones) / ALGEBRA.length;
ok('la respuesta correcta está repartida entre las cuatro alternativas',
  posiciones.every((n) => n > 0) && mayor < 0.35,
  `→ A:${posiciones[0]} B:${posiciones[1]} C:${posiciones[2]} D:${posiciones[3]} · la más usada, ${Math.round(mayor * 100)}%`);

const temas = new Set(temasDe('algebra').map((t) => t.id));
const fuera = [...new Set(ALGEBRA.map((p) => p.temaId))].filter((t) => !temas.has(t));
ok('cada pregunta apunta a un tema real del temario', fuera.length === 0,
  fuera.length ? `→ no existen: ${fuera.join(', ')}` : '');
const porTema = [...temas].map((t) => ALGEBRA.filter((p) => p.temaId === t).length);
ok('el banco cubre todos los temas del curso', porTema.every((n) => n > 0),
  `→ ${porTema.filter((n) => n > 0).length} de ${temas.size}`);
ok('ningún tema se queda con una sola pregunta', Math.min(...porTema) >= 2,
  `→ el más flojo tiene ${Math.min(...porTema)}`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
