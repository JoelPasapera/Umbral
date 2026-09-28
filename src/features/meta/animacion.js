/**
 * El movimiento del índice.
 *
 * Es el único movimiento no trivial de toda la aplicación, y está aquí por una
 * razón concreta: responde a la única pregunta que el producto contesta. Cuando
 * alguien termina de practicar y vuelve, ve su número moverse. Sin eso, la
 * pantalla se limita a mostrar otra cifra y nadie sabe si lo que acaba de hacer
 * sirvió de algo.
 *
 * Tres reglas que lo mantienen honesto:
 *
 * 1. **Solo se anima si cambió.** Repetir la cuenta atrás en cada visita
 *    convierte un momento en un tic.
 * 2. **Arranca del valor anterior, no de cero.** Contar desde cero sugiere que
 *    empiezas de nuevo cada día, que es justo lo contrario de lo que mide.
 * 3. **Con movimiento reducido, no hay movimiento.** No una versión rápida:
 *    ninguna.
 */

const CLAVE = 'umbral:indice-visto';
const DURACION = 850;

const prefiereQuieto = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** Suavizado de salida: rápido al principio, se posa al final. */
const posarse = (t) => 1 - (1 - t) ** 3;

/** @returns {number|null} el índice que esta persona vio la última vez */
export function indiceAnterior() {
  const guardado = Number(localStorage.getItem(CLAVE));
  return Number.isFinite(guardado) && guardado > 0 ? guardado : null;
}

/** @param {number} valor */
export function recordarIndice(valor) {
  localStorage.setItem(CLAVE, String(Math.round(valor)));
}

/**
 * Anima la cifra y el relleno de la escala desde el valor anterior al actual.
 *
 * @param {{ cifra: HTMLElement, relleno: HTMLElement|null, desde: number|null, hasta: number }} params
 * @returns {number|null} la diferencia, si la hubo
 */
export function animarIndice({ cifra, relleno, desde, hasta }) {
  const destino = Math.round(hasta);
  const origen = desde === null ? destino : Math.round(desde);
  const diferencia = destino - origen;

  const fijar = (valor) => {
    cifra.textContent = String(Math.round(valor));
    if (relleno) relleno.style.width = `${valor}%`;
  };

  if (diferencia === 0 || prefiereQuieto()) {
    fijar(destino);
    return diferencia === 0 ? null : diferencia;
  }

  fijar(origen);
  const inicio = performance.now();

  const paso = (ahora) => {
    const avance = Math.min((ahora - inicio) / DURACION, 1);
    fijar(origen + (destino - origen) * posarse(avance));
    if (avance < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);

  return diferencia;
}
