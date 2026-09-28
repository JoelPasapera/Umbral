/**
 * Banco de Física: el solucionario tiene que ser correcto y único.
 *
 * Las numéricas se recalculan desde las leyes físicas, sin mirar la clave. Las
 * conceptuales se comprueban con un modelo pequeño del fenómeno:
 *
 *   · el imán partido, como una cadena de imanes diminutos que se corta;
 *   · las líneas de campo, evaluando el campo de un dipolo cerca de cada polo;
 *   · la energía del oscilador, siguiendo el movimiento a lo largo de un ciclo;
 *   · Bernoulli, despejando la presión en el tramo rápido.
 *
 * Dos detalles técnicos que en los demás bancos no hacían falta:
 *
 *   · las alternativas pueden ir en notación científica, así que se entienden
 *     las potencias de diez;
 *   · la comparación es RELATIVA. Con una tolerancia absoluta, todas las
 *     alternativas del orden de $10^{-19}$ valdrían "casi cero" y saldrían
 *     iguales entre sí: la comprobación de unicidad dejaría de servir justo
 *     donde más falta hace.
 */
import { FISICA as F } from '../src/data/mock/preguntas-fisica.js';
import { temasDe } from '../src/data/mock/temario.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const porId = new Map(F.map((p) => [p.id, p]));
const malas = [];

/** Igualdad relativa: sirve igual para 2000 que para 3,3 · 10⁻¹⁹. */
const igual = (a, b) => a === b || Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b));

function valorDe(opcion) {
  const t0 = String(opcion).trim();
  if (!/^\$[^$]*\$$/.test(t0)) return null;
  let t = t0.slice(1, -1).replace(/\{,\}/g, '.').replace(/\^\{\\circ\}/g, '');
  t = t.replace(/10\^\{(-?\d+)\}/g, '(10**($1))').replace(/\\cdot/g, '*');
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
  const coinciden = valores.filter((v) => v !== null && igual(v, valor)).length;
  if (marcada === null || !igual(marcada, valor)) {
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

const g = 10;
const rad = (x) => (x * Math.PI) / 180;
const grados = (x) => (x * 180) / Math.PI;
/** Redondeo a una cifra razonable para quitar el ruido de la coma flotante. */
const limpio = (x) => Number(x.toPrecision(12));

/* ── Cinemática ──────────────────────────────────────────────────────── */

numero('fis-101', Math.hypot(6, 8));
{
  // Unidades como exponentes de [longitud, tiempo]; A = x / t².
  const requerido = [1 - 0, 0 - 2];
  const candidatos = [
    ['$\\text{m/s}^{2}$', [1, -2]], ['$\\text{m/s}$', [1, -1]],
    ['$\\text{m}$', [1, 0]], ['$\\text{m} \\cdot \\text{s}^{2}$', [1, 2]],
  ];
  const p = porId.get('fis-102');
  const declarados = candidatos.map(([t]) => t).sort().join('|');
  const buenos = candidatos.filter(([, e]) => e[0] === requerido[0] && e[1] === requerido[1]);
  if (declarados !== [...p.opciones].sort().join('|')) malas.push('fis-102: las alternativas no coinciden');
  else if (buenos.length !== 1) malas.push(`fis-102: ${buenos.length} unidades cumplen`);
  else texto('fis-102', buenos[0][0]);
}
numero('fis-103', (30 + 30) / (1 + 2));
{
  const x = (t) => 3 * t * t - 2 * t + 1;
  numero('fis-104', (x(3) - x(1)) / (3 - 1));
}
{
  // Se simula el frenado paso a paso, sin fórmula.
  let [v, d] = [20, 0];
  const dt = 1e-5;
  while (v > 0) { d += v * dt - 0.5 * 4 * dt * dt; v -= 4 * dt; }
  numero('fis-105', Math.round(d * 100) / 100);
}
numero('fis-106', 0.5 * g * 3 ** 2);
{
  const vy = 50 * 0.6;
  numero('fis-107', (vy * vy) / (2 * g));
}
numero('fis-108', (120 * 2 * Math.PI) / 60);

/* ── Dinámica ────────────────────────────────────────────────────────── */

numero('fis-109', 20 / 5);
numero('fis-110', limpio(0.3 * 10 * g));
numero('fis-111', limpio(200 * 0.1));
numero('fis-112', (30 * 2) / 1.5);
numero('fis-113', limpio((0.02 * 400) / (0.02 + 3.98)));
{
  const factor = 1 / 3 ** 2;
  const nombre = factor === 1 / 9 ? 'Se reduce a la novena parte' : '?';
  texto('fis-114', nombre);
}

/* ── Trabajo y energía ───────────────────────────────────────────────── */

numero('fis-115', limpio(50 * 10 * Math.cos(rad(60))));
numero('fis-116', (80 * g * 15) / 20);
numero('fis-117', 0.5 * 4 * 5 ** 2);
numero('fis-118', Math.sqrt((0.5 * 2 * 3 ** 2 + 16) / (0.5 * 2)));
numero('fis-119', Math.sqrt(2 * g * 20));
numero('fis-120', limpio(Math.sqrt((0.5 * 800 * 0.2 ** 2) / (0.5 * 0.5))));

/* ── Fenómenos térmicos ──────────────────────────────────────────────── */

numero('fis-121', (9 / 5) * 25 + 32);
numero('fis-122', limpio(2 * 1.2e-5 * 100 * 1000));
numero('fis-123', 500 * 1 * (80 - 20));
numero('fis-124', 200 * 80);

/* ── Fluidos ─────────────────────────────────────────────────────────── */

numero('fis-125', limpio(3 / 0.002));
numero('fis-126', (1000 * g * 12) / 1000);
numero('fis-127', (10000 * 10) / 500);
numero('fis-128', limpio(1000 * g * 0.004));
numero('fis-129', (20 * 3) / 5);
{
  // Bernoulli en horizontal: P₂ = P₁ + ½ρ(v₁² − v₂²), con v₂ > v₁.
  const [P1, rho, v1, v2] = [200000, 1000, 2, 6];
  const P2 = P1 + 0.5 * rho * (v1 ** 2 - v2 ** 2);
  texto('fis-130', P2 < P1 ? 'Menor' : P2 > P1 ? 'Mayor' : 'Igual');
}

/* ── Electricidad y magnetismo ───────────────────────────────────────── */

numero('fis-131', 36 / 2 ** 2);
numero('fis-132', limpio((9e9 * 2e-6) / 3 ** 2));
numero('fis-133', 1 / (1 / 6 + 1 / 3));
numero('fis-134', 0.5 * 4 * 10 ** 2);
numero('fis-135', 2 * 15);
numero('fis-136', 4 * 60);
numero('fis-137', 1 / (1 / 6 + 1 / 6 + 1 / 6));
numero('fis-138', (100 * 5 * 30) / 1000);
{
  // Un imán como cadena de imanes diminutos, cada uno con su sur y su norte.
  // Se corta por la mitad y se miran los extremos de cada trozo.
  const cadena = Array.from({ length: 10 }, () => ['S', 'N']);
  const trozos = [cadena.slice(0, 5), cadena.slice(5)];
  const completos = trozos.every((t) => t[0][0] === 'S' && t.at(-1)[1] === 'N');
  texto('fis-139', completos ? 'Dos imanes, cada uno con su polo norte y su polo sur' : '?');
}
{
  // Campo de un dipolo con el norte hacia +x. Cerca del norte, el campo
  // apunta hacia fuera del imán; cerca del sur, hacia dentro.
  const campo = ([x, y]) => {
    const r = Math.hypot(x, y);
    const mx = 1;
    const producto = (mx * x) / r;
    return [(3 * producto * (x / r) - mx) / r ** 3, (3 * producto * (y / r)) / r ** 3];
  };
  const cercaNorte = campo([2, 0])[0] > 0;
  const cercaSur = campo([-2, 0])[0] > 0;
  texto('fis-140', cercaNorte && cercaSur ? 'Del polo norte al polo sur' : 'Del polo sur al polo norte');
}
numero('fis-141', limpio(2e-6 * 5e4 * 0.3));
numero('fis-142', limpio((4 * Math.PI * 1e-7 * 10) / (2 * Math.PI * 0.2)));
numero('fis-143', limpio(Math.abs(0.1 - 0.5) / 0.2));
numero('fis-144', (220 * 50) / 200);

/* ── Oscilaciones, ondas y luz ───────────────────────────────────────── */

numero('fis-145', 2 * Math.PI * Math.sqrt(2 / 50));
{
  const T = (L) => 2 * Math.PI * Math.sqrt(L / g);
  const factor = T(4) / T(1);
  texto('fis-146', Math.abs(factor - 2) < 1e-12 ? 'Se duplica' : '?');
}
numero('fis-147', limpio(0.5 * 400 * 0.1 ** 2));
{
  // Se sigue un ciclo y se mira en qué posición la cinética es máxima.
  const [A, w] = [0.1, 3];
  let mejor = { ec: -1, x: null };
  for (let i = 0; i <= 10000; i += 1) {
    const t = (i / 10000) * ((2 * Math.PI) / w);
    const x = A * Math.cos(w * t);
    const v = -A * w * Math.sin(w * t);
    if (v * v > mejor.ec) mejor = { ec: v * v, x };
  }
  texto('fis-148', Math.abs(mejor.x) < 1e-3 ? 'En la posición de equilibrio' : '?');
}
numero('fis-149', 4 * 50);
numero('fis-150', 10 * Math.log10(100));
numero('fis-151', 1 / (1 / 10 - 1 / 30));
{
  const senoR = (1 * 0.8) / (4 / 3);
  // El ángulo notable de seno 0,6 es 37° (en rigor, 36,87°).
  numero('fis-152', Math.round(grados(Math.asin(senoR))));
}

/* ── Física moderna ──────────────────────────────────────────────────── */

numero('fis-153', limpio(6.6e-34 * 5e14));
numero('fis-154', 80 * 0.5 ** (15 / 5));
numero('fis-155', limpio(8 / Math.sqrt(1 - 0.6 ** 2)));
numero('fis-156', limpio(100 * Math.sqrt(1 - 0.8 ** 2)));

ok('el solucionario recalculado coincide con la clave marcada, y es único',
  malas.length === 0,
  malas.length ? `→ ${malas.join(' · ')}` : `→ ${F.length} preguntas verificadas desde las leyes físicas`);

/* ── Salud del banco ─────────────────────────────────────────────────── */

ok('ningún identificador se repite', new Set(F.map((p) => p.id)).size === F.length);
ok('todas tienen cuatro alternativas distintas', F.every((p) => p.opciones.length === 4 && new Set(p.opciones).size === 4));
ok('todas explican por qué', F.every((p) => p.explicacion.length > 60));
ok('las fórmulas abren y cierran',
  F.every((p) => [p.enunciado, p.explicacion, ...p.opciones].every((t) => (t.match(/\$/g) ?? []).length % 2 === 0)));
ok('la dificultad está declarada y en rango', F.every((p) => p.dificultad > 0 && p.dificultad < 1));

const posiciones = [0, 1, 2, 3].map((i) => F.filter((p) => p.correcta === i).length);
const mayor = Math.max(...posiciones) / F.length;
ok('la respuesta correcta está repartida entre las cuatro alternativas',
  posiciones.every((n) => n > 0) && mayor < 0.35,
  `→ A:${posiciones[0]} B:${posiciones[1]} C:${posiciones[2]} D:${posiciones[3]} · la más usada, ${Math.round(mayor * 100)}%`);

/* El temario de Física se cargó del reglamento de admisión en esta misma
   entrega: se comprueba que existe y que el banco lo cubre entero. */
const temas = new Set(temasDe('fisica').map((t) => t.id));
ok('el temario de Física está cargado', temas.size === 28, `→ ${temas.size} temas en 10 bloques`);
const fuera = [...new Set(F.map((p) => p.temaId))].filter((t) => !temas.has(t));
ok('cada pregunta apunta a un tema real del temario', fuera.length === 0,
  fuera.length ? `→ no existen: ${fuera.join(', ')}` : '');
const porTema = [...temas].map((t) => F.filter((p) => p.temaId === t).length);
ok('el banco cubre todos los temas del curso', porTema.every((n) => n > 0),
  `→ ${porTema.filter((n) => n > 0).length} de ${temas.size}`);
ok('ningún tema se queda con una sola pregunta', Math.min(...porTema) >= 2,
  `→ el más flojo tiene ${Math.min(...porTema)}`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
