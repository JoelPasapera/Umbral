/**
 * Toda la matemática, en LaTeX.
 *
 * Dos comprobaciones distintas, y la segunda es la que de verdad protege.
 *
 * **Que nada matemático quede fuera de `$…$`.** Una potencia escrita como `x^2`
 * en texto plano sale literalmente así en pantalla, con el acento circunflejo a
 * la vista. No lanza ningún error y se ve mal en el único sitio donde el
 * producto tiene que verse bien.
 *
 * **Que el LaTeX que hay sea válido.** Estar entre dólares no basta: una llave
 * sin cerrar o una orden mal escrita hace que KaTeX se rinda y deje la fórmula
 * cruda. Como KaTeX se carga de la red y aquí no hay, se comprueba lo que se
 * puede comprobar leyendo: llaves equilibradas, órdenes conocidas, argumentos
 * completos y nada vacío.
 *
 * Lo que NO se toca es la prosa. "El coseno es negativo en el segundo
 * cuadrante" es castellano y tiene que seguir siéndolo; convertirlo en
 * `$\\cos$` haría el texto ilegible. Fórmula es `\\cos x`, no la palabra.
 */
import { bancoCompleto } from '../src/data/mock/questions.js';
import { EXPLICACIONES_BASE } from '../src/data/mock/explicaciones-base.js';
import { catalogoCompleto } from '../src/data/mock/library.js';
import { temasDe } from '../src/data/mock/temario.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

/** Todo el contenido con matemática posible, etiquetado para poder señalarlo. */
const TEXTOS = [];
for (const p of bancoCompleto()) {
  TEXTOS.push([`${p.id} enunciado`, p.enunciado], [`${p.id} explicación`, p.explicacion]);
  p.opciones.forEach((o, i) => TEXTOS.push([`${p.id} alternativa ${'ABCD'[i]}`, o]));
}
for (const e of EXPLICACIONES_BASE) TEXTOS.push([`${e.preguntaId}#${e.opcion}`, e.texto]);
for (const m of catalogoCompleto()) TEXTOS.push([`${m.id} título`, m.titulo], [`${m.id} detalle`, m.detalle]);
for (const c of ['trigonometria', 'algebra', 'geometria', 'aritmetica', 'fisica', 'quimica']) {
  for (const t of temasDe(c)) TEXTOS.push([`tema ${t.id}`, t.nombre]);
}

/* ── 1. Nada matemático fuera de $…$ ─────────────────────────────────── */

/*
 * Detrás del nombre de una función tiene que venir algo que parezca
 * matemática: un paréntesis, un número o UNA sola letra. Sin ese matiz, "sin
 * calcular nada" se confunde con el seno de c, y "el coseno" con `cos` seguido
 * de "eno". Las dos cosas pasaron al escribir esta batería.
 */
const SOSPECHAS = [
  [/\b(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|log|ln)\b\s*\^?\s*(\(|\d|[a-zA-Z](?![a-zA-ZáéíóúñÁÉÍÓÚÑ]))/,
    'una razón o función escrita en texto plano'],
  [/[a-zA-Z0-9]\s*\^\s*[0-9a-zA-Z]/, 'una potencia con acento circunflejo'],
  [/[a-zA-Z0-9][²³⁴]/, 'un superíndice suelto'],
  [/\b\d+\s*\/\s*\d+\b/, 'una fracción con barra'],
  [/√/, 'una raíz con símbolo'],
  [/\d+\s*°/, 'grados con el símbolo'],
  [/π/, 'pi con el símbolo'],
  [/≤|≥|≠|∞|±/, 'un símbolo matemático suelto'],
];

/** Quita lo que ya está dentro de fórmulas: eso está bien por definición. */
const soloProsa = (t) => String(t ?? '').replace(/\$[^$]*\$/g, ' ');

const sueltos = [];
for (const [donde, texto] of TEXTOS) {
  const prosa = soloProsa(texto);
  for (const [patron, que] of SOSPECHAS) {
    const m = prosa.match(patron);
    if (m) { sueltos.push(`${donde}: ${que} → "${m[0].trim()}"`); break; }
  }
}
ok('ninguna fórmula queda escrita en texto plano',
  sueltos.length === 0,
  sueltos.length ? `→ ${sueltos.slice(0, 4).join(' · ')}` : `→ ${TEXTOS.length} textos revisados`);

/* ── 2. El LaTeX que hay es válido ───────────────────────────────────── */

ok('los delimitadores abren y cierran',
  TEXTOS.every(([, t]) => (String(t ?? '').match(/\$/g) ?? []).length % 2 === 0),
  '→ uno impar deja media fórmula cruda en pantalla');

const formulas = [];
for (const [donde, texto] of TEXTOS) {
  for (const m of String(texto ?? '').matchAll(/\$([^$]*)\$/g)) formulas.push([donde, m[1]]);
}
ok('hay fórmulas de verdad que revisar', formulas.length > 100, `→ ${formulas.length} fórmulas`);

const vacias = formulas.filter(([, f]) => !f.trim());
ok('ninguna fórmula está vacía', vacias.length === 0,
  vacias.length ? `→ ${vacias.map(([d]) => d).join(', ')}` : '');

const desequilibradas = formulas.filter(([, f]) => {
  let nivel = 0;
  for (const ch of f) {
    if (ch === '{') nivel += 1;
    else if (ch === '}') nivel -= 1;
    if (nivel < 0) return true;
  }
  return nivel !== 0;
});
ok('las llaves de cada fórmula están equilibradas',
  desequilibradas.length === 0,
  desequilibradas.length ? `→ ${desequilibradas.map(([d, f]) => `${d}: ${f}`).slice(0, 3).join(' · ')}`
    : '→ una sin cerrar hace que KaTeX se rinda y deje la fórmula cruda');

/**
 * Órdenes que KaTeX entiende y que este proyecto usa.
 *
 * La lista es cerrada a propósito: si alguien escribe `\\dfrack` por error, o
 * usa una orden de LaTeX completo que KaTeX no implementa, la fórmula se
 * queda sin pintar y nadie se entera hasta abrir esa pregunta concreta. Al
 * añadir contenido con una orden nueva, se añade aquí y se comprueba de paso
 * que KaTeX la soporta.
 */
const CONOCIDAS = new Set([
  'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'arcsin', 'arccos', 'arctan', 'log', 'ln',
  'dfrac', 'tfrac', 'frac', 'sqrt', 'cdot', 'times', 'div', 'pm',
  'left', 'right', 'langle', 'rangle', 'lbrace', 'rbrace',
  'pi', 'theta', 'alpha', 'beta', 'gamma', 'phi', 'circ', 'infty',
  'text', 'mathrm', 'le', 'ge', 'ne', 'approx', 'quad',
  // Lógica, conjuntos, numeración y conteo, para Aritmética.
  'overline', 'rightarrow', 'leftrightarrow', 'wedge', 'vee', 'neg', 'cap', 'cup', 'dbinom',
  // Conjuntos numéricos, para Álgebra.
  'mathbb',
  // Operadores definidos y puntos suspensivos, para Habilidad matemática.
  'ast', 'ldots',
  // Ángulos con nombre, para Geometría.
  'angle',
  // Magnitudes y unidades, para Física.
  'mu', 'Omega', 'rho', 'Delta', 'lambda',
]);

const raras = [];
for (const [donde, f] of formulas) {
  for (const [, orden] of f.matchAll(/\\([a-zA-Z]+)/g)) {
    if (!CONOCIDAS.has(orden)) raras.push(`${donde}: \\${orden}`);
  }
}
ok('todas las órdenes están en la lista de las que KaTeX soporta',
  raras.length === 0,
  raras.length ? `→ ${[...new Set(raras)].slice(0, 5).join(' · ')}`
    : `→ ${new Set(formulas.flatMap(([, f]) => [...f.matchAll(/\\([a-zA-Z]+)/g)].map((m) => m[1]))).size} órdenes distintas`);

/* `\dfrac` y `\sqrt` sin sus argumentos se pintan mal en vez de fallar. */
const mancos = formulas.filter(([, f]) =>
  /\\(dfrac|tfrac|frac)(?!\s*\{)/.test(f) || /\\sqrt(?!\s*[{[])/.test(f));
ok('las fracciones y raíces traen sus argumentos',
  mancos.length === 0,
  mancos.length ? `→ ${mancos.map(([d, f]) => `${d}: ${f}`).slice(0, 3).join(' · ')}` : '');

/* `\left` y `\right` van siempre en pareja; uno solo rompe el renderizado. */
/* Se cuentan como órdenes enteras: `\\rightarrow` y `\\leftrightarrow` empiezan
   igual que `\\right` y `\\left` pero son otra cosa, y contarlos como subcadena
   daba por desparejada una flecha de lógica. Lo destapó el banco de
   Aritmética, el primero que usa flechas. */
const parejas = formulas.filter(([, f]) =>
  (f.match(/\\left(?![a-zA-Z])/g) ?? []).length !== (f.match(/\\right(?![a-zA-Z])/g) ?? []).length);
ok('cada \\left tiene su \\right',
  parejas.length === 0,
  parejas.length ? `→ ${parejas.map(([d]) => d).slice(0, 3).join(', ')}` : '');

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
