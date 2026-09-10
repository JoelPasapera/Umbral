/**
 * Utilidades de texto compartidas por las puertas de validación.
 *
 * Viven aparte porque las usan dos módulos que no deben conocerse entre sí:
 * `generation.js` valida preguntas y `explicacion.js` valida explicaciones de
 * fallo. Duplicar estas tres funciones habría dejado dos copias que divergen
 * en cuanto alguien afine una.
 *
 * Puro: sin DOM, sin red, sin reloj.
 */

/**
 * Deja el texto comparable: sin tildes, sin signos, sin mayúsculas y con un
 * solo espacio entre palabras.
 * @param {string} texto
 * @returns {string}
 */
export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Similitud de Jaccard sobre trigramas de palabras. Barata y suficiente.
 * @param {string} a
 * @param {string} b
 * @returns {number} entre 0 y 1
 */
export function similitud(a, b) {
  const trigramas = (texto) => {
    const palabras = normalizar(texto).split(' ').filter(Boolean);
    if (palabras.length < 3) return new Set(palabras);
    return new Set(palabras.slice(0, -2).map((_, i) => palabras.slice(i, i + 3).join(' ')));
  };
  const x = trigramas(a);
  const y = trigramas(b);
  if (!x.size || !y.size) return 0;

  let comunes = 0;
  for (const t of x) if (y.has(t)) comunes += 1;
  return comunes / (x.size + y.size - comunes);
}

/**
 * Las fórmulas tienen que abrir y cerrar. Una a medias se pinta como basura.
 * @param {string} texto
 * @returns {boolean}
 */
export const formulasEquilibradas = (texto) =>
  (String(texto ?? '').match(/\$/g) ?? []).length % 2 === 0;

/**
 * @param {number} valor
 * @param {[number, number]} rango
 * @returns {boolean}
 */
export const entre = (valor, [minimo, maximo]) => valor >= minimo && valor <= maximo;
