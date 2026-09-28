/**
 * Fórmulas matemáticas.
 *
 * KaTeX pesa unos 280 KB entre script, hoja y fuentes. El original lo cargaba
 * en cada visita aunque solo se usara en una pantalla. Aquí se descarga la
 * primera vez que aparece una fórmula de verdad, y nunca más.
 *
 * El texto se parte por los delimitadores `$` y solo los trozos internos pasan
 * por KaTeX. Todo lo demás se inserta con `textContent`, así que un enunciado
 * con `<script>` dentro no puede hacer nada.
 */

const CDN = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist';
let cargando = null;

/** @returns {boolean} */
export const tieneFormula = (texto) => /\$[^$]+\$/.test(String(texto ?? ''));

const SUPERINDICES = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','x':'ˣ','+':'⁺','-':'⁻' };

/** Envuelve en paréntesis solo si hace falta: "1/2" se lee, "sin x/1 + cos x" no. */
const agrupar = (parte) => (/[\s+\-]/.test(parte.trim()) ? `(${parte.trim()})` : parte.trim());

const REEMPLAZOS = [
  // El grado va antes que nada: "^\circ" es un símbolo, no un exponente.
  [/\^\s*\\circ\b/g, '°'],
  [/\\[dt]?frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, a, b) => `${agrupar(a)}/${agrupar(b)}`],
  [/\\sqrt\{([^{}]+)\}/g, (_, x) => `√${agrupar(x)}`],
  [/\\text\{([^{}]+)\}/g, '$1'],
  [/\\(sin|cos|tan|sec|csc|cot|log|ln|max|min)\b/g, ' $1'],
  [/\\circ\b/g, '°'],
  [/\\cdot\b/g, '·'],
  [/\\times\b/g, '×'],
  [/\\div\b/g, '÷'],
  [/\\pm\b/g, '±'],
  [/\\pi\b/g, 'π'],
  [/\\theta\b/g, 'θ'],
  [/\\alpha\b/g, 'α'],
  [/\\beta\b/g, 'β'],
  [/\\leq\b/g, '≤'],
  [/\\geq\b/g, '≥'],
  [/\\neq\b/g, '≠'],
  [/\\infty\b/g, '∞'],
  [/\\left|\\right/g, ''],
  [/\\,|\\;|\\!|\\ /g, ' '],
];

/**
 * Convierte LaTeX a texto legible.
 *
 * Es el respaldo cuando el motor de fórmulas no carga: wifi de colegio con
 * el CDN bloqueado, proxy corporativo, o el CDN caído. Sin esto el alumno
 * lee "$\\sin^2 20^\\circ$", que no es un respaldo sino basura. Con esto
 * lee "sin² 20°", que se entiende perfectamente.
 *
 * @param {string} formula sin los delimitadores
 * @returns {string}
 */
export function formulaLegible(formula) {
  let texto = String(formula);
  for (const [patron, cambio] of REEMPLAZOS) texto = texto.replace(patron, cambio);

  // Exponentes: ^2 y ^{12} pasan a superíndices cuando existe el carácter.
  texto = texto.replace(/\^\{([^{}]+)\}|\^(\S)/g, (entero, llaves, suelto) => {
    const contenido = llaves ?? suelto;
    const superindice = [...contenido].map((c) => SUPERINDICES[c] ?? null);
    return superindice.every(Boolean) ? superindice.join('') : `^${contenido}`;
  });

  return texto
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

async function cargarKatex() {
  if (window.katex) return window.katex;
  if (cargando) return cargando;

  cargando = new Promise((listo, fallo) => {
    const hoja = document.createElement('link');
    hoja.rel = 'stylesheet';
    hoja.href = `${CDN}/katex.min.css`;
    document.head.append(hoja);

    const script = document.createElement('script');
    script.src = `${CDN}/katex.min.js`;
    script.defer = true;
    script.onload = () => listo(window.katex);
    script.onerror = () => fallo(new Error('No se pudo cargar el motor de fórmulas'));
    document.head.append(script);
  });

  return cargando;
}

/**
 * Escribe `texto` dentro de `destino`, componiendo las fórmulas si las hay.
 *
 * Siempre deja primero la versión en texto plano. Si KaTeX tarda o falla, se
 * queda esa: la pregunta se lee igual, solo que sin componer. Nunca hay un
 * hueco en blanco donde debería haber un enunciado.
 *
 * @param {HTMLElement} destino
 * @param {string} texto
 */
export async function escribirConFormulas(destino, texto) {
  const contenido = String(texto ?? '');

  if (!tieneFormula(contenido)) {
    destino.textContent = contenido;
    return;
  }

  // Primero la versión legible sin depender de nada externo. Si KaTeX llega,
  // la sustituye por la compuesta; si no, esto es lo que queda y se entiende.
  destino.textContent = contenido.replace(/\$([^$]+)\$/g, (_, f) => formulaLegible(f));

  let katex;
  try {
    katex = await cargarKatex();
  } catch (error) {
    console.warn('Fórmulas sin componer:', error.message);
    return;
  }

  const fragmento = document.createDocumentFragment();
  for (const trozo of contenido.split(/(\$[^$]+\$)/g)) {
    if (!trozo) continue;
    if (trozo.startsWith('$') && trozo.endsWith('$') && trozo.length > 2) {
      const span = document.createElement('span');
      try {
        katex.render(trozo.slice(1, -1), span, { throwOnError: false, displayMode: false });
      } catch {
        span.textContent = trozo;
      }
      fragmento.append(span);
    } else {
      fragmento.append(document.createTextNode(trozo));
    }
  }
  destino.replaceChildren(fragmento);
}
