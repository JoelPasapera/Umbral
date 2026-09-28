/**
 * Banco de Geometría: el solucionario tiene que ser correcto y único.
 *
 * Siempre que se puede, la respuesta se obtiene construyendo la figura con
 * coordenadas en vez de aplicando el teorema que la pregunta evalúa. Si se
 * comprobara el teorema de la bisectriz usando el teorema de la bisectriz, un
 * error en la fórmula pasaría las dos veces. Aquí se coloca el triángulo con
 * sus tres lados, se traza la dirección que parte el ángulo en dos y se mide
 * dónde corta: el teorema tiene que salir solo.
 *
 * Después se exige, como en los demás bancos, que la alternativa marcada sea
 * la ÚNICA que coincide con el cálculo.
 */
import { GEOMETRIA as G } from '../src/data/mock/preguntas-geometria.js';
import { temasDe } from '../src/data/mock/temario.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const porId = new Map(G.map((p) => [p.id, p]));
const CASI = 1e-9;
const malas = [];

function valorDe(opcion) {
  const t0 = String(opcion).trim();
  if (!/^\$[^$]*\$$/.test(t0)) return null;
  let t = t0.slice(1, -1).replace(/\{,\}/g, '.').replace(/\^\{\\circ\}/g, '');
  t = t.replace(/(\d)\\pi/g, '$1*Math.PI').replace(/\\pi/g, 'Math.PI');
  t = t.replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
  t = t.replace(/(\d)\\sqrt\{([^{}]+)\}/g, '$1*Math.sqrt($2)').replace(/\\sqrt\{([^{}]+)\}/g, 'Math.sqrt($1)');
  if (/[^\d\s+\-*/().]/.test(t.replace(/Math\.(sqrt|PI)/g, ''))) return null;
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
  const coinciden = valores.filter((v) => v !== null && Math.abs(v - valor) < 1e-7).length;
  if (marcada === null || Math.abs(marcada - valor) > 1e-7) {
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

/* ── Herramientas de construcción ────────────────────────────────────── */

const grados = (rad) => (rad * 180) / Math.PI;
const radianes = (g) => (g * Math.PI) / 180;
const resta = (a, b) => [a[0] - b[0], a[1] - b[1]];
const suma = (a, b) => [a[0] + b[0], a[1] + b[1]];
const escala = (a, k) => [a[0] * k, a[1] * k];
const largo = (a) => Math.hypot(...a);
const distancia = (a, b) => largo(resta(a, b));
const unitario = (a) => escala(a, 1 / largo(a));
const angulo = (v, p, q) => {
  const [a, b] = [resta(p, v), resta(q, v)];
  return grados(Math.acos((a[0] * b[0] + a[1] * b[1]) / (largo(a) * largo(b))));
};
const punto = (x, y) => `$(${x}, ${y})$`;
const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i += 1) r = (r * (n - k + i)) / i; return r; };

/**
 * Un triángulo a partir de sus tres lados: B en el origen, C sobre el eje X y
 * A por encima. `a` es el lado opuesto a A (BC), `b` a B (AC) y `c` a C (AB).
 */
function triangulo(a, b, c) {
  const x = (c * c - b * b + a * a) / (2 * a);
  return { A: [x, Math.sqrt(c * c - x * x)], B: [0, 0], C: [a, 0] };
}

/** Área por coordenadas (fórmula del cordón), sin Herón. */
const areaCoordenadas = ([p, q, r]) => Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1])) / 2;

/* ── Ángulos, triángulos, perpendiculares y paralelas ────────────────── */

numero('geo-101', 180 - (90 - 25));
numero('geo-102', (180 / (2 + 7)) * 2);
numero('geo-103', 180 - 48 - 67);
numero('geo-104', 130 - 70);
numero('geo-105', [...Array(30).keys()].filter((x) => x > 9 - 5 && x < 9 + 5).length);
{
  // AB = 7 (opuesto a C), BC = 10 (opuesto a A), AC = 12 (opuesto a B).
  const { A, B, C } = triangulo(10, 12, 7);
  const angulos = { A: angulo(A, B, C), B: angulo(B, A, C), C: angulo(C, A, B) };
  const mayor = Object.entries(angulos).sort((x, y) => y[1] - x[1])[0][0];
  texto('geo-106', `$\\angle ${mayor}$`);
}
numero('geo-107', Math.sqrt(13 ** 2 - 5 ** 2));
numero('geo-108', 90 - 35);
{
  const x = (10 + 30) / (5 - 3);
  if (3 * x + 10 !== 5 * x - 30) malas.push('geo-109: los ángulos no salen iguales');
  else numero('geo-109', x);
}
numero('geo-110', 180 - 70);
{
  const x = (6 + 4) / (3 - 1);
  numero('geo-111', 3 * x - 4);
}
{
  // Un ángulo cualquiera de 50°: se coloca un punto de su bisectriz a 7 de un
  // lado y se mide su distancia al otro.
  const mitad = radianes(25);
  const t = 7 / Math.sin(mitad);
  const P = [t * Math.cos(mitad), t * Math.sin(mitad)];
  const lado2 = [Math.cos(2 * mitad), Math.sin(2 * mitad)];
  numero('geo-112', Math.abs(P[0] * lado2[1] - P[1] * lado2[0]));
}

/* ── Polígonos, circunferencia y puntos notables ─────────────────────── */

numero('geo-113', 180 * (8 - 2));
numero('geo-114', comb(10, 2) - 10);
{
  // Arco de 110° entre P1 y P2; vértice del ángulo en el arco opuesto.
  const en = (g) => [Math.cos(radianes(g)), Math.sin(radianes(g))];
  numero('geo-115', angulo(en(235), en(0), en(110)));
  numero('geo-116', angulo(en(270), en(0), en(180)));
}
{
  const [a, b, c] = [10, 8, 6];
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  numero('geo-117', (a * b * c) / (4 * area));
  numero('geo-118', area / s);
}
{
  const [A, B, C] = [[0, 0], [10, 2], [3, 9]];
  const M = escala(suma(B, C), 0.5);
  const Gc = escala(suma(suma(A, B), C), 1 / 3);
  numero('geo-119', (distancia(A, Gc) / distancia(A, M)) * 18);
}
{
  // Se calculan los cuatro puntos notables de un triángulo escaleno y se
  // busca el único que equidista de los tres vértices.
  const [A, B, C] = [[0, 0], [8, 0], [2, 6]];
  const [a, b, c] = [distancia(B, C), distancia(A, C), distancia(A, B)];
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  const cuadrado = (P) => P[0] ** 2 + P[1] ** 2;
  const O = [
    (cuadrado(A) * (B[1] - C[1]) + cuadrado(B) * (C[1] - A[1]) + cuadrado(C) * (A[1] - B[1])) / d,
    (cuadrado(A) * (C[0] - B[0]) + cuadrado(B) * (A[0] - C[0]) + cuadrado(C) * (B[0] - A[0])) / d,
  ];
  const Gc = escala(suma(suma(A, B), C), 1 / 3);
  const I = escala(suma(suma(escala(A, a), escala(B, b)), escala(C, c)), 1 / (a + b + c));
  const H = resta(escala(Gc, 3), escala(O, 2));
  const candidatos = { 'El circuncentro': O, 'El incentro': I, 'El baricentro': Gc, 'El ortocentro': H };
  const equidistan = Object.entries(candidatos).filter(([, P]) => {
    const ds = [A, B, C].map((V) => distancia(P, V));
    return Math.max(...ds) - Math.min(...ds) < 1e-9;
  });
  if (equidistan.length !== 1) malas.push(`geo-120: ${equidistan.length} puntos equidistan`);
  else texto('geo-120', equidistan[0][0]);
}

/* ── Semejanza y relaciones métricas ─────────────────────────────────── */

numero('geo-121', (10 * 6) / 4);
numero('geo-122', (4 * 6) / 3);
numero('geo-123', (18 * 10) / 4);
numero('geo-124', (10 * 9) / 6);
numero('geo-125', Math.hypot(9, 12));
numero('geo-126', Math.sqrt(10 ** 2 - 6 ** 2));
{
  // AB = 6 y AC = 9, BC = 10. Se traza la bisectriz por dirección, sin usar
  // el teorema, y se mide dónde corta a BC.
  const { A, B, C } = triangulo(10, 9, 6);
  const direccion = suma(unitario(resta(B, A)), unitario(resta(C, A)));
  const t = -A[1] / direccion[1];
  const D = suma(A, escala(direccion, t));
  numero('geo-127', distancia(B, D));
}
{
  // Lados 6 y x, base 3 + 5 = 8. Se busca x construyendo el triángulo y
  // exigiendo que la bisectriz caiga a 3 del extremo.
  let mejor = null;
  for (let x = 2.01; x < 14; x += 0.01) {
    if (6 + x <= 8 || 6 + 8 <= x || x + 8 <= 6) continue;
    const { A, B, C } = triangulo(8, x, 6);
    const dir = suma(unitario(resta(B, A)), unitario(resta(C, A)));
    const D = suma(A, escala(dir, -A[1] / dir[1]));
    const error = Math.abs(distancia(B, D) - 3);
    if (!mejor || error < mejor[1]) mejor = [x, error];
  }
  numero('geo-128', Math.round(mejor[0] * 100) / 100);
}
{
  const { A } = triangulo(8, 6, 4);
  numero('geo-129', distancia(A, [4, 0]));
}
{
  const [R, P, Q] = [[0, 0], [10, 0], [0, 24]];
  if (Math.abs(distancia(P, Q) - 26) > CASI) malas.push('geo-130: la hipotenusa no mide 26');
  else numero('geo-130', distancia(R, escala(suma(P, Q), 0.5)));
}
{
  // Hipotenusa de 13 sobre el eje, pie de la altura a 4 de un extremo; la
  // altura es la que hace recto el ángulo del vértice.
  const h = Math.sqrt(4 * 9);
  const V = [4, h];
  if (Math.abs(angulo(V, [0, 0], [13, 0]) - 90) > 1e-9) malas.push('geo-131: el ángulo no es recto');
  else numero('geo-131', h);
}
{
  // Circunferencia de radio 5 y un punto exterior sobre el eje, a la
  // distancia que hace que la tangente mida 6. Se busca la secante cuyo
  // segmento exterior mide 4 y se mide entera.
  const r = 5;
  const d = Math.sqrt(36 + r * r);
  let encontrada = null;
  for (let g = 0; g < 90 && !encontrada; g += 0.0005) {
    const u = [-Math.cos(radianes(g)), Math.sin(radianes(g))];
    const P = [d, 0];
    const bq = 2 * (P[0] * u[0] + P[1] * u[1]);
    const cq = d * d - r * r;
    const disc = bq * bq - 4 * cq;
    if (disc < 0) continue;
    const t1 = (-bq - Math.sqrt(disc)) / 2;
    const t2 = (-bq + Math.sqrt(disc)) / 2;
    if (Math.abs(Math.min(t1, t2) - 4) < 1e-4) encontrada = Math.max(t1, t2);
  }
  if (encontrada === null) malas.push('geo-132: no se encontró la secante');
  else numero('geo-132', Math.round(encontrada * 1000) / 1000);
}

/* ── Áreas ───────────────────────────────────────────────────────────── */

numero('geo-133', (2 * 3) ** 2 / 3 ** 2);
numero('geo-134', ((3 * 4 * 7) / 2) / ((4 * 7) / 2));
{
  const t = triangulo(14, 15, 13);
  numero('geo-135', areaCoordenadas([t.A, t.B, t.C]));
}
numero('geo-136', ((8 + 14) / 2) * 5);
numero('geo-137', Math.PI * 14);
numero('geo-138', 2 * 3.14 * 0.30 * 50);
numero('geo-139', Math.PI * 6 ** 2);
numero('geo-140', Math.PI * 6 ** 2 * (60 / 360));

/* ── Poliedros ───────────────────────────────────────────────────────── */

numero('geo-141', 2 * 5);
numero('geo-142', Math.hypot(2, 3, 6));
{
  const n = 6;
  const [v, c] = [n + 1, n + 1];
  if (v + c - 2 !== 2 * n) malas.push('geo-143: Euler no cuadra');
  else numero('geo-143', 2 * n);
}
numero('geo-144', Math.hypot(0 - 3, 0 - 0, 4 - 0));
numero('geo-145', 6 * 5 ** 2);
numero('geo-146', 4 * ((6 * 5) / 2));
numero('geo-147', (6 ** 2 * 5) / 3);
numero('geo-148', ((5 * 6) / 2) * 10);

/* ── Sólidos de revolución ───────────────────────────────────────────── */

numero('geo-149', Math.PI * 3 ** 2 * 10);
numero('geo-150', 2 * Math.PI * 4 * 7);
numero('geo-151', (Math.PI * 3 ** 2 * 4) / 3);
numero('geo-152', Math.hypot(6, 8));
numero('geo-153', (4 / 3) * Math.PI * 3 ** 3);
numero('geo-154', (2 * 1) ** 3 / 1 ** 3);
numero('geo-155', 4 * Math.PI * 5 ** 2);
numero('geo-156', Math.PI * 3 * 5);
numero('geo-157', Math.PI * 3 ** 2 * 5);
numero('geo-158', (Math.PI * 3 ** 2 * 4) / 3);

/* ── Geometría analítica ─────────────────────────────────────────────── */

numero('geo-159', distancia([1, 2], [7, 10]));
texto('geo-160', punto((-2 + 6) / 2, (5 + -1) / 2));
numero('geo-161', (12 - 3) / (4 - 1));
{
  const b = 5 - 2 * 1;
  texto('geo-162', `$y = 2x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$`);
}
numero('geo-163', -1 / (2 / 3));
numero('geo-164', 5 + 1);
{
  const entre = (m1, m2) => {
    const g = Math.abs(grados(Math.atan(m1) - Math.atan(m2)));
    return Math.min(g, 180 - g);
  };
  numero('geo-165', Math.round(entre(1, -1) * 1e9) / 1e9);
  numero('geo-166', Math.round(entre(Math.sqrt(3), 0) * 1e9) / 1e9);
}
numero('geo-167', Math.sqrt((-6 / 2) ** 2 + (8 / 2) ** 2 - 0));
texto('geo-168', punto(-2, 3));
texto('geo-169', punto(0, 8 / 4));
texto('geo-170', `$x = -${12 / 4}$`);
numero('geo-171', 2 * Math.sqrt(25));
numero('geo-172', Math.sqrt(25 - 9));

ok('el solucionario recalculado coincide con la clave marcada, y es único',
  malas.length === 0,
  malas.length ? `→ ${malas.join(' · ')}` : `→ ${G.length} preguntas, casi todas construyendo la figura`);

/* ── Salud del banco ─────────────────────────────────────────────────── */

ok('ningún identificador se repite', new Set(G.map((p) => p.id)).size === G.length);
ok('todas tienen cuatro alternativas distintas', G.every((p) => p.opciones.length === 4 && new Set(p.opciones).size === 4));
ok('todas explican por qué', G.every((p) => p.explicacion.length > 60));
ok('las fórmulas abren y cierran',
  G.every((p) => [p.enunciado, p.explicacion, ...p.opciones].every((t) => (t.match(/\$/g) ?? []).length % 2 === 0)));
ok('la dificultad está declarada y en rango', G.every((p) => p.dificultad > 0 && p.dificultad < 1));

const posiciones = [0, 1, 2, 3].map((i) => G.filter((p) => p.correcta === i).length);
const mayor = Math.max(...posiciones) / G.length;
ok('la respuesta correcta está repartida entre las cuatro alternativas',
  posiciones.every((n) => n > 0) && mayor < 0.35,
  `→ A:${posiciones[0]} B:${posiciones[1]} C:${posiciones[2]} D:${posiciones[3]} · la más usada, ${Math.round(mayor * 100)}%`);

const temas = new Set(temasDe('geometria').map((t) => t.id));
const fuera = [...new Set(G.map((p) => p.temaId))].filter((t) => !temas.has(t));
ok('cada pregunta apunta a un tema real del temario', fuera.length === 0,
  fuera.length ? `→ no existen: ${fuera.join(', ')}` : '');
const porTema = [...temas].map((t) => G.filter((p) => p.temaId === t).length);
ok('el banco cubre todos los temas del curso', porTema.every((n) => n > 0),
  `→ ${porTema.filter((n) => n > 0).length} de ${temas.size}`);
ok('ningún tema se queda con una sola pregunta', Math.min(...porTema) >= 2,
  `→ el más flojo tiene ${Math.min(...porTema)}`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
