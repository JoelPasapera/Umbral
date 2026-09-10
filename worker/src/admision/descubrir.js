/**
 * Descubrimiento en el portal de la Oficina Central de Admisión.
 *
 * El paso previo a raspar nada: averiguar **dónde** está la convocatoria de
 * este ciclo. No se puede escribir la dirección a mano porque cambia cada vez.
 * Comprobado sobre el portal real:
 *
 *   · el ciclo vigente cuelga de `/portal/admision2027-i/`;
 *   · el de 2024-II vive en `/Website20242/`, otra ruta y otro sitio;
 *   · la portada es WordPress con Elementor y casi todo su contenido son
 *     imágenes: las fechas y las vacantes están pintadas dentro de JPGs.
 *
 * De ahí que este módulo no intente entender nada. Solo hace dos cosas, y las
 * dos son robustas porque no dependen de la maquetación:
 *
 *   1. Localiza los enlaces que parecen una convocatoria, por el patrón del
 *      año y el número de proceso en la dirección.
 *   2. Recoge los documentos —PDFs e imágenes— que luego pasarán por OCR.
 *
 * Interpretar lo que dicen es trabajo de `extraer.js`, y confirmarlo es trabajo
 * de una persona.
 */

/** El portal desde el que arranca todo. */
export const PORTAL = 'https://admision.unmsm.edu.pe/portal/';

/** `admision2027-i` → `2027-I`. También pilla `Website20242` → `2024-II`. */
const NOMBRES = [
  { patron: /admision(\d{4})-(i{1,2})\b/i, año: 1, romano: 2 },
  { patron: /website(\d{4})(\d)\b/i, año: 1, arabigo: 2 },
];

/**
 * Saca la convocatoria de una dirección, o null si no parece una.
 * @param {string} url
 * @returns {string|null} p. ej. "2027-I"
 */
export function convocatoriaDe(url) {
  const texto = String(url ?? '');
  for (const n of NOMBRES) {
    const m = texto.match(n.patron);
    if (!m) continue;
    const año = m[n.año];
    const numero = n.romano ? m[n.romano].toUpperCase() : (m[n.arabigo] === '2' ? 'II' : 'I');
    if (!/^I{1,2}$/.test(numero)) continue;
    return `${año}-${numero}`;
  }
  return null;
}

/** Ordena "2027-I" por delante de "2026-II". */
const comoNumero = (proceso) => {
  const [año, romano] = String(proceso).split('-');
  return Number(año) * 10 + (romano === 'II' ? 2 : 1);
};

/**
 * Todas las convocatorias enlazadas desde una página, de la más nueva a la más
 * vieja.
 *
 * @param {string} html
 * @param {string} base para resolver las direcciones relativas
 * @returns {{ proceso:string, url:string }[]}
 */
export function convocatoriasEn(html, base = PORTAL) {
  const vistas = new Map();
  for (const [, href] of String(html ?? '').matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    let url;
    try { url = new URL(href, base).href; } catch { continue; }
    const proceso = convocatoriaDe(url);
    // Se queda con la primera dirección de cada convocatoria: el portal repite
    // el mismo enlace en el menú de escritorio y en el de móvil.
    if (proceso && !vistas.has(proceso)) vistas.set(proceso, url);
  }
  return [...vistas.entries()]
    .map(([proceso, url]) => ({ proceso, url }))
    .sort((a, b) => comoNumero(b.proceso) - comoNumero(a.proceso));
}

/** Extensiones que vale la pena descargar para leerlas. */
const LEIBLES = /\.(pdf|jpe?g|png|webp)(\?|$)/i;

/**
 * Los documentos de una página que pueden contener datos.
 *
 * Incluye imágenes a propósito: en este portal las fechas y las vacantes están
 * dentro de los JPGs del carrusel, así que ignorarlas dejaría fuera justo lo
 * que se busca.
 *
 * @param {string} html
 * @param {string} base
 * @returns {{ url:string, tipo:'pdf'|'imagen' }[]}
 */
export function documentosEn(html, base = PORTAL) {
  const vistos = new Set();
  const salida = [];
  const fuentes = [
    ...String(html ?? '').matchAll(/href\s*=\s*["']([^"']+)["']/gi),
    ...String(html ?? '').matchAll(/src\s*=\s*["']([^"']+)["']/gi),
  ];

  for (const [, ruta] of fuentes) {
    let url;
    try { url = new URL(ruta, base).href; } catch { continue; }
    if (!LEIBLES.test(url) || vistos.has(url)) continue;
    // El logotipo y los iconos del tema no traen datos y sí traen ruido.
    if (/logo|icon|favicon|cropped-|arrow/i.test(url)) continue;
    vistos.add(url);
    salida.push({ url, tipo: /\.pdf(\?|$)/i.test(url) ? 'pdf' : 'imagen' });
  }
  return salida;
}

/**
 * Huella de una página, para saber si cambió sin tener que entenderla.
 *
 * Es la parte del vigilante que no puede equivocarse: detectar que algo se
 * movió es fiable, interpretar qué dice no lo es. Se normalizan los espacios
 * para que un salto de línea distinto no cuente como cambio.
 *
 * @param {string} html
 * @returns {Promise<string>}
 */
export async function huellaDePagina(html) {
  const limpio = String(html ?? '').replace(/\s+/g, ' ').trim();
  const bytes = new TextEncoder().encode(limpio);
  const resumen = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(resumen), (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
