/**
 * Ayudantes de DOM.
 *
 * Existe una sola regla y este archivo la hace cumplir: el texto que viene
 * de datos se asigna con `textContent`, nunca con `innerHTML`. Por eso `el()`
 * no acepta HTML como cadena. Sin esa puerta, no hay inyección posible, y el
 * navegador puede correr con una política de seguridad estricta.
 */

/**
 * @param {string} etiqueta
 * @param {object} [props] clase, texto, atributos (attrs) y manejadores (on)
 * @param {(Node|string|null|false)[]} [hijos]
 * @returns {HTMLElement}
 */
export function el(etiqueta, props = {}, hijos = []) {
  const nodo = document.createElement(etiqueta);
  const { clase, texto, attrs, on, ...resto } = props;

  if (clase) nodo.className = Array.isArray(clase) ? clase.filter(Boolean).join(' ') : clase;
  if (texto !== undefined && texto !== null) nodo.textContent = String(texto);
  for (const [nombre, valor] of Object.entries(attrs ?? {})) {
    if (valor === false || valor === null || valor === undefined) continue;
    nodo.setAttribute(nombre, valor === true ? '' : String(valor));
  }
  for (const [evento, manejador] of Object.entries(on ?? {})) {
    nodo.addEventListener(evento, manejador);
  }
  Object.assign(nodo, resto);

  for (const hijo of hijos) {
    if (hijo === null || hijo === undefined || hijo === false) continue;
    nodo.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
  }
  return nodo;
}

/**
 * Reemplaza el contenido de un contenedor. Vacía primero para que los
 * escuchadores de los nodos viejos se recojan con ellos.
 * @param {HTMLElement} contenedor
 * @param {...Node} nodos
 */
export function montar(contenedor, ...nodos) {
  contenedor.replaceChildren(...nodos);
}

/** @param {string} selector @returns {HTMLElement|null} */
export const buscar = (selector) => document.querySelector(selector);
