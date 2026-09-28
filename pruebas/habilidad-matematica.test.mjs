/**
 * Banco de Habilidad matemática: el solucionario tiene que ser correcto y único.
 *
 * Aquí casi nada se resuelve con una fórmula, así que casi nada se comprueba
 * con una. Cada respuesta se busca por su cuenta:
 *
 *   · el cruce del lobo, la cabra y la col, recorriendo todos los estados;
 *   · el centro del cuadrado mágico, probando todas las disposiciones;
 *   · los silogismos, enumerando todos los modelos que cumplen las premisas;
 *   · las verdades y mentiras, probando cada combinación;
 *   · los diagramas de flujo, ejecutándolos.
 *
 * Después se exige que la alternativa marcada sea la ÚNICA que coincide. Una
 * pregunta de lógica con dos alternativas defendibles es la que más discusión
 * genera en un aula, y la que más daño hace en un diagnóstico.
 */
import { HABILIDAD_MATEMATICA as HM } from '../src/data/mock/preguntas-habilidad-matematica.js';
import { temasDe } from '../src/data/mock/temario.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const porId = new Map(HM.map((p) => [p.id, p]));
const CASI = 1e-9;
const malas = [];

/** Valor numérico de una alternativa: enteros, decimales, grados, π, raíces. */
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

const punto = (x, y) => `$(${x}, ${y})$`;
const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i += 1) r = (r * (n - k + i)) / i; return r; };
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Todas las permutaciones de una lista. */
function* permutaciones(xs) {
  if (xs.length <= 1) { yield xs; return; }
  for (let i = 0; i < xs.length; i += 1) {
    for (const resto of permutaciones([...xs.slice(0, i), ...xs.slice(i + 1)])) yield [xs[i], ...resto];
  }
}

/* ── Cantidad ────────────────────────────────────────────────────────── */

numero('hm-101', Math.max(...[...Array(21).keys()].map((a) => a * (20 - a))));
numero('hm-102', Math.max(...[...Array(1201).keys()].map((i) => (i / 100) * (12 - i / 100))));
{
  let k = 0;
  while (3 ** k < 9) k += 1;
  numero('hm-103', k);
}
{
  const pera = 3 / 2; // en manzanas
  const melon = 4 * pera;
  numero('hm-104', 2 * melon);
}
{
  // Se buscan TODOS los cuadrados mágicos con backtracking: dan la suma de
  // la fila y el valor del centro sin suponer nada.
  const sumas = new Set();
  const centros = new Set();
  const lineas = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const celdas = Array(9).fill(0);
  const usado = Array(10).fill(false);
  const poner = (i) => {
    if (i === 9) {
      const s = lineas.map((l) => l.reduce((acc, k) => acc + celdas[k], 0));
      if (s.every((x) => x === s[0])) { sumas.add(s[0]); centros.add(celdas[4]); }
      return;
    }
    for (let n = 1; n <= 9; n += 1) {
      if (usado[n]) continue;
      usado[n] = true; celdas[i] = n;
      // Poda: la primera fila fija la suma de todas las demás.
      const fila = Math.floor(i / 3);
      const cierraFila = i % 3 === 2;
      const s0 = celdas[0] + celdas[1] + celdas[2];
      if (!cierraFila || fila === 0 || celdas[fila * 3] + celdas[fila * 3 + 1] + celdas[fila * 3 + 2] === s0) poner(i + 1);
      usado[n] = false;
    }
  };
  poner(0);
  if (sumas.size !== 1 || centros.size !== 1) malas.push(`hm-105/106: sumas ${[...sumas]}, centros ${[...centros]}`);
  else { numero('hm-105', [...sumas][0]); numero('hm-106', [...centros][0]); }
}
numero('hm-107', 60 / 6 - 1);
numero('hm-108', 60 / 6);
numero('hm-109', [1, 2, 3, 4, 5, 6].reduce((s, x) => s + x, 0) - (1 + 2 + 3));
{
  let fichas = 0;
  for (let a = 0; a <= 6; a += 1) for (let b = a; b <= 6; b += 1) fichas += 1;
  numero('hm-110', fichas);
}
texto('hm-111', DIAS[(0 + 31) % 7]);
texto('hm-112', DIAS[(2 + 100) % 7]);
{
  const hanoi = (n) => (n === 0 ? 0 : 2 * hanoi(n - 1) + 1);
  numero('hm-113', hanoi(4));
}
{
  // Búsqueda en anchura sobre los 16 estados: bit 0 hombre, 1 lobo, 2 cabra,
  // 3 col; 0 es la orilla de partida y 1 la de llegada.
  const lado = (s, b) => (s >> b) & 1;
  const valido = (s) => {
    const h = lado(s, 0);
    if (lado(s, 1) === lado(s, 2) && lado(s, 1) !== h) return false;
    if (lado(s, 2) === lado(s, 3) && lado(s, 2) !== h) return false;
    return true;
  };
  const distancia = new Map([[0, 0]]);
  const cola = [0];
  while (cola.length) {
    const s = cola.shift();
    const h = lado(s, 0);
    for (const carga of [null, 1, 2, 3]) {
      if (carga !== null && lado(s, carga) !== h) continue;
      let t = s ^ 1;
      if (carga !== null) t ^= 1 << carga;
      if (!valido(t) || distancia.has(t)) continue;
      distancia.set(t, distancia.get(s) + 1);
      cola.push(t);
    }
  }
  numero('hm-114', distancia.get(15));
}

/* ── Cambio ──────────────────────────────────────────────────────────── */

numero('hm-115', (12 - 1) * (5 / (6 - 1)));
numero('hm-116', (4 * 24) / 8 + 1);
numero('hm-117', [...Array(20).keys()].reduce((s, k) => s + (2 * k + 1), 0));
{
  const regla = (n) => 3 * n + 1;
  if (![4, 7, 10].every((v, i) => v === regla(i + 1))) malas.push('hm-118: la regla no genera los datos');
  else numero('hm-118', regla(10));
}
{
  const [h, m] = [3, 30];
  const angulo = Math.abs((30 * h + 0.5 * m) - 6 * m);
  numero('hm-119', Math.min(angulo, 360 - angulo));
}
{
  const marca = 8 * 60 + 4 * 60 + 4 * 3;
  texto('hm-120', `${Math.floor(marca / 60)}:${String(marca % 60).padStart(2, '0')}`);
}
{
  const op = (a, b) => 2 * a - b;
  numero('hm-121', op(op(3, 1), 4));
}
numero('hm-122', (12 + 8) / (3 - 1));

/* ── Forma ───────────────────────────────────────────────────────────── */

{
  const [x, y] = [2, 3];
  texto('hm-123', punto(-y, x));
}
{
  const [x, y] = [1 + 3, -2 + 4];
  texto('hm-124', punto(x, -y));
}
numero('hm-125', Math.hypot(6, 8));
{
  const caminos = Array.from({ length: 3 }, () => Array(4).fill(0));
  for (let f = 0; f <= 2; f += 1) {
    for (let c = 0; c <= 3; c += 1) {
      caminos[f][c] = f === 0 || c === 0 ? 1 : caminos[f - 1][c] + caminos[f][c - 1];
    }
  }
  numero('hm-126', caminos[2][3]);
}
numero('hm-127', Math.max(1, 6 / 2));
{
  // Esquinas A, B, C, D y centro O; lados y medias diagonales.
  const aristas = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'O'], ['O', 'C'], ['B', 'O'], ['O', 'D']];
  const grado = {};
  for (const [u, v] of aristas) { grado[u] = (grado[u] ?? 0) + 1; grado[v] = (grado[v] ?? 0) + 1; }
  const impares = Object.values(grado).filter((g) => g % 2).length;
  const trazos = Math.max(1, impares / 2);
  if (impares !== 4 || trazos !== 2) malas.push(`hm-128: ${impares} impares y ${trazos} trazos`);
  else texto('hm-128', 'No: tiene cuatro vértices impares y necesita dos trazos');
}
numero('hm-129', [1, 2, 3, 4].reduce((s, k) => s + (5 - k) ** 2, 0));
numero('hm-130', comb(3 + 2, 2));
{
  // Se reflejan los vértices del hexágono sobre ejes cada 15° y se cuentan
  // los que dejan la figura igual.
  const vertices = [...Array(6).keys()].map((k) => [Math.cos((k * Math.PI) / 3), Math.sin((k * Math.PI) / 3)]);
  const clave = ([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`.replace(/-0\.000000/g, '0.000000');
  const original = new Set(vertices.map(clave));
  let ejes = 0;
  for (let k = 0; k < 12; k += 1) {
    const t = (k * Math.PI) / 12;
    const [c, s] = [Math.cos(2 * t), Math.sin(2 * t)];
    const reflejados = vertices.map(([x, y]) => [c * x + s * y, s * x - c * y]);
    if (reflejados.every((p) => original.has(clave(p)))) ejes += 1;
  }
  numero('hm-131', ejes);
}
texto('hm-132', punto(2, 5));
{
  let dosCaras = 0;
  for (let x = 0; x < 3; x += 1) for (let y = 0; y < 3; y += 1) for (let z = 0; z < 3; z += 1) {
    const pintadas = [x, y, z].filter((c) => c === 0 || c === 2).length;
    if (pintadas === 2) dosCaras += 1;
  }
  numero('hm-133', dosCaras);
}
{
  const n = 6;
  const [v, c] = [2 * n, n + 2];
  if (v + c - 2 !== 3 * n) malas.push('hm-134: Euler no cuadra');
  else numero('hm-134', 3 * n);
}
numero('hm-135', 9 * (30 / 2 - 9));
{
  const r = (10 * Math.PI) / (2 * Math.PI);
  numero('hm-136', Math.PI * r * r);
}
numero('hm-137', (20 * 25) / 50);
{
  const contactos = 2;
  texto('hm-138', contactos % 2 === 0 ? 'Horario' : 'Antihorario');
}
numero('hm-139', (3 / 2) * 8);
numero('hm-140', 20 * (3 / 2) ** 2);

/* ── Datos ───────────────────────────────────────────────────────────── */

texto('hm-141', `${((40 - 25) / 25) * 100} %`);
numero('hm-142', 0.25 * 360);
{
  let partidos = 0;
  for (let a = 0; a < 8; a += 1) for (let b = a + 1; b < 8; b += 1) partidos += 1;
  numero('hm-143', partidos);
}
{
  let equipos = 32;
  let partidos = 0;
  while (equipos > 1) { partidos += equipos / 2; equipos /= 2; }
  numero('hm-144', partidos);
}
{
  // ¿Qué datos fijan x? Se buscan soluciones enteras y se mira si x varía.
  const determina = (cumple) => {
    const xs = new Set();
    for (let x = -20; x <= 20; x += 1) for (let y = -20; y <= 20; y += 1) if (cumple(x, y)) xs.add(x);
    return xs.size === 1;
  };
  const I = (x, y) => x + y === 10;
  const II = (x, y) => x - y === 2;
  const soloI = determina(I);
  const soloII = determina(II);
  const juntos = determina((x, y) => I(x, y) && II(x, y));
  if (soloI || soloII || !juntos) malas.push('hm-145: la suficiencia no es la esperada');
  else texto('hm-145', 'Los dos datos juntos');
}
{
  const ladoPorArea = [...Array(100).keys()].filter((l) => l > 0 && l * l === 49);
  const ladoPorPerimetro = [...Array(100).keys()].filter((l) => l > 0 && 4 * l === 28);
  if (ladoPorArea.length === 1 && ladoPorPerimetro.length === 1) texto('hm-146', 'Cualquiera de los dos por separado');
  else malas.push('hm-146: algún dato no basta por sí solo');
}
{
  const cantidades = [5, 4, 3];
  // Peor caso sin par: una de cada color.
  numero('hm-147', cantidades.length + 1);
  // Peor caso sin los tres colores: todas las de los dos más abundantes.
  numero('hm-148', cantidades.reduce((s, x) => s + x, 0) - Math.min(...cantidades) + 1);
}
{
  // Modelos de 3 elementos; cada uno es médico (1), profesional (2) y/o
  // deportista (4). Una conclusión vale si se cumple en TODOS los modelos que
  // cumplen las premisas.
  const M = 1; const P = 2; const D = 4;
  const modelos = [];
  for (let a = 0; a < 8; a += 1) for (let b = 0; b < 8; b += 1) for (let c = 0; c < 8; c += 1) modelos.push([a, b, c]);
  const premisas = (m) => m.every((x) => !(x & M) || (x & P)) && m.some((x) => (x & P) && (x & D));
  const validos = modelos.filter(premisas);
  const vale = (conclusion) => validos.every(conclusion);
  const algunos = vale((m) => m.some((x) => (x & M) && (x & D)));
  const ninguno = vale((m) => !m.some((x) => (x & M) && (x & D)));
  const todosDP = vale((m) => m.every((x) => !(x & D) || (x & P)));
  if (algunos || ninguno || todosDP) malas.push('hm-149: alguna conclusión específica resultó válida');
  else texto('hm-149', 'No se puede concluir nada sobre médicos y deportistas');
}
{
  const filas = [];
  for (const L of [true, false]) for (const S of [true, false]) if ((!L || S) && !S) filas.push(L);
  if (filas.length !== 1 || filas[0] !== false) malas.push('hm-150: la lluvia no queda determinada');
  else texto('hm-150', 'No llovió');
}
{
  const menores = new Set();
  for (const orden of permutaciones(['Ana', 'Beto', 'Carla', 'Diego'])) {
    const edad = Object.fromEntries(orden.map((n, i) => [n, i]));
    if (edad.Ana > edad.Beto && edad.Carla < edad.Beto && edad.Diego > edad.Ana) menores.add(orden[0]);
  }
  if (menores.size !== 1) malas.push(`hm-151: ${menores.size} posibles menores`);
  else texto('hm-151', [...menores][0]);
}
{
  const vecinos = new Set();
  for (const fila of permutaciones(['Luis', 'Marta', 'Nora', 'Óscar', 'Pablo'])) {
    const pos = Object.fromEntries(fila.map((n, i) => [n, i]));
    const junto = (a, b) => Math.abs(pos[a] - pos[b]) === 1;
    if ((pos.Luis === 0 || pos.Luis === 4) && junto('Luis', 'Marta') && pos.Nora === 2 && !junto('Óscar', 'Nora')) {
      const suyos = fila.filter((n) => junto(n, 'Pablo')).sort((a, b) => a.localeCompare(b, 'es'));
      vecinos.add(suyos.length === 2 ? `Entre ${suyos[0]} y ${suyos[1]}` : 'En un extremo');
    }
  }
  if (vecinos.size !== 1) malas.push(`hm-152: ${vecinos.size} respuestas posibles`);
  else texto('hm-152', [...vecinos][0]);
}
{
  const culpables = ['Andrés', 'Bruno', 'Carlos'].filter((c) => {
    const dichos = [c === 'Bruno', c !== 'Bruno', c !== 'Carlos'];
    return dichos.filter(Boolean).length === 1;
  });
  if (culpables.length !== 1) malas.push(`hm-153: ${culpables.length} culpables posibles`);
  else texto('hm-153', culpables[0]);
}
{
  const soluciones = [];
  for (const a of [true, false]) for (const b of [true, false]) {
    // Lo que dice alguien es verdad exactamente cuando esa persona es veraz.
    if ((!b) === a && (a && b) === b) soluciones.push([a, b]);
  }
  const nombre = ([a, b]) => (a && b ? 'Los dos dicen la verdad' : !a && !b ? 'Los dos mienten'
    : a ? 'A dice la verdad y B miente' : 'A miente y B dice la verdad');
  if (soluciones.length !== 1) malas.push(`hm-154: ${soluciones.length} soluciones`);
  else texto('hm-154', nombre(soluciones[0]));
}
{
  // Un árbol mínimo: el parentesco sale de la distancia al antepasado común.
  const padreDe = { yo: 'padre', padre: 'abuelo', tio: 'abuelo', otro: 'tio' };
  const antepasados = (x) => { const r = [x]; while (padreDe[r.at(-1)]) r.push(padreDe[r.at(-1)]); return r; };
  const [a, b] = [antepasados('yo'), antepasados('otro')];
  const comun = a.find((x) => b.includes(x));
  const clave = `${a.indexOf(comun)},${b.indexOf(comun)}`;
  const NOMBRES = { '1,1': 'Mi hermano', '2,1': 'Mi tío', '1,2': 'Mi sobrino', '2,2': 'Mi primo' };
  texto('hm-155', NOMBRES[clave]);
}
{
  const hijas = 1; // una hermana basta para los dos hijos
  numero('hm-156', 2 + 2 + hijas);
}
{
  let x = 1;
  while (x < 50) x = 2 * x + 1;
  numero('hm-157', x);
}
{
  let n = 13;
  let pasos = 0;
  while (n !== 1) { n = n % 2 === 0 ? n / 2 : n + 1; pasos += 1; }
  numero('hm-158', pasos);
}

ok('el solucionario recalculado coincide con la clave marcada, y es único',
  malas.length === 0,
  malas.length ? `→ ${malas.join(' · ')}` : `→ ${HM.length} preguntas resueltas por búsqueda y cálculo`);

/* ── Salud del banco ─────────────────────────────────────────────────── */

ok('ningún identificador se repite', new Set(HM.map((p) => p.id)).size === HM.length);
ok('todas tienen cuatro alternativas distintas', HM.every((p) => p.opciones.length === 4 && new Set(p.opciones).size === 4));
ok('todas explican por qué', HM.every((p) => p.explicacion.length > 60));
ok('las fórmulas abren y cierran',
  HM.every((p) => [p.enunciado, p.explicacion, ...p.opciones].every((t) => (t.match(/\$/g) ?? []).length % 2 === 0)));
ok('la dificultad está declarada y en rango', HM.every((p) => p.dificultad > 0 && p.dificultad < 1));

const posiciones = [0, 1, 2, 3].map((i) => HM.filter((p) => p.correcta === i).length);
const mayor = Math.max(...posiciones) / HM.length;
ok('la respuesta correcta está repartida entre las cuatro alternativas',
  posiciones.every((n) => n > 0) && mayor < 0.35,
  `→ A:${posiciones[0]} B:${posiciones[1]} C:${posiciones[2]} D:${posiciones[3]} · la más usada, ${Math.round(mayor * 100)}%`);

/* Sin un patrón que se pueda memorizar: si la clave rotara A, B, C, D, A…,
   bastaría con contar para acertar. Las sesiones barajan, pero el banco se
   puede exportar o imprimir. */
let rachas = 0;
for (let i = 3; i < HM.length; i += 1) {
  const cuatro = [HM[i - 3], HM[i - 2], HM[i - 1], HM[i]].map((p) => p.correcta);
  if (new Set(cuatro).size === 4 && cuatro.every((c, k) => k === 0 || c === (cuatro[k - 1] + 1) % 4)) rachas += 1;
}
ok('la clave no sigue una rotación que se pueda memorizar',
  rachas < HM.length / 4, `→ ${rachas} tramos de rotación perfecta`);

const temas = new Set(temasDe('habilidad-matematica').map((t) => t.id));
const fuera = [...new Set(HM.map((p) => p.temaId))].filter((t) => !temas.has(t));
ok('cada pregunta apunta a un tema real del temario', fuera.length === 0,
  fuera.length ? `→ no existen: ${fuera.join(', ')}` : '');
const porTema = [...temas].map((t) => HM.filter((p) => p.temaId === t).length);
ok('el banco cubre todos los temas del curso', porTema.every((n) => n > 0),
  `→ ${porTema.filter((n) => n > 0).length} de ${temas.size}`);
ok('ningún tema se queda con una sola pregunta', Math.min(...porTema) >= 2,
  `→ el más flojo tiene ${Math.min(...porTema)}`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
