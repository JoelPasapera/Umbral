/**
 * Estado compartido, mínimo y explícito.
 *
 * No es un framework reactivo. Guarda lo que de verdad cruza pantallas
 * (sesión, meta activa) y avisa a quien se suscriba. Todo lo demás vive
 * dentro de su funcionalidad y muere con ella.
 */

const estado = {
  sesion: null,
  meta: null,
  preparacion: null,
};

const observadores = new Set();

/** @returns {Readonly<typeof estado>} copia superficial: nadie muta el estado por accidente */
export function leer() {
  return Object.freeze({ ...estado });
}

/**
 * @param {Partial<typeof estado>} cambios
 */
export function escribir(cambios) {
  let hubocambio = false;
  for (const [clave, valor] of Object.entries(cambios)) {
    if (!(clave in estado)) {
      console.warn(`Clave desconocida en el estado: ${clave}`);
      continue;
    }
    if (estado[clave] !== valor) {
      estado[clave] = valor;
      hubocambio = true;
    }
  }
  if (hubocambio) for (const observador of observadores) observador(leer());
}

/**
 * @param {(estado: Readonly<typeof estado>) => void} observador
 * @returns {() => void}
 */
export function observar(observador) {
  observadores.add(observador);
  return () => observadores.delete(observador);
}
