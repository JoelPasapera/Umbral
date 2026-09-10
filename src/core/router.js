/**
 * Enrutador por hash.
 *
 * Hash y no History API a propósito: el sitio se sirve como archivos estáticos
 * y así funciona sin ninguna regla de reescritura en el servidor. Cada ruta
 * carga su módulo con `import()` dinámico, de modo que el código de una
 * pantalla solo se descarga cuando alguien entra en ella.
 */

import { publicar, EVENTOS } from './bus.js';
import { montar } from './dom.js';

const rutas = new Map();
let contenedor = null;
let rutaActual = null;
let descartarVista = null;

/**
 * @param {string} ruta
 * @param {() => Promise<{ render: (params: object) => Node|Promise<Node>, descartar?: () => void }>} cargar
 * @param {{ privada?: boolean }} [opciones]
 */
export function registrar(ruta, cargar, opciones = {}) {
  rutas.set(ruta, { cargar, privada: opciones.privada === true });
}

/**
 * Función que decide si hay sesión. La inyecta `main.js` para que el enrutador
 * no dependa de cómo se autentica la aplicación.
 * @type {null | (() => Promise<boolean>)}
 */
let haySesion = null;

/** @param {() => Promise<boolean>} comprobar */
export function protegerCon(comprobar) {
  haySesion = comprobar;
}

function rutaDesdeHash() {
  const bruto = window.location.hash.replace(/^#\/?/, '');
  const [camino, consulta] = bruto.split('?');
  return {
    camino: camino || 'meta',
    params: Object.fromEntries(new URLSearchParams(consulta ?? '')),
  };
}

async function resolver() {
  const { camino, params } = rutaDesdeHash();
  const entrada = rutas.get(camino);

  if (!entrada) {
    window.location.hash = '#/meta';
    return;
  }

  // Guardián. Si la ruta es privada y no hay sesión, se recuerda a dónde
  // quería ir la persona para devolverla ahí después de entrar.
  if (entrada.privada && haySesion && !(await haySesion())) {
    window.location.hash = `#/entrar?volver=${encodeURIComponent(camino)}`;
    return;
  }

  if (typeof descartarVista === 'function') descartarVista();
  descartarVista = null;
  rutaActual = camino;

  contenedor.setAttribute('aria-busy', 'true');
  try {
    const modulo = await entrada.cargar();
    if (rutaActual !== camino) return;
    montar(contenedor, await modulo.render(params));
    descartarVista = modulo.descartar ?? null;
    contenedor.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
    publicar(EVENTOS.RUTA_CAMBIADA, camino);
  } catch (error) {
    console.error(`No se pudo abrir la vista "${camino}"`, error);
    const { vistaDeError } = await import('../ui/components/estado.js');
    montar(contenedor, vistaDeError());
  } finally {
    contenedor.removeAttribute('aria-busy');
  }
}

/** @param {HTMLElement} destino */
export function iniciar(destino) {
  contenedor = destino;
  window.addEventListener('hashchange', resolver);
  resolver();
}

export const rutaVigente = () => rutaActual;
