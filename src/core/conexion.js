/**
 * Estado de conexión y ciclo de vida de la aplicación instalada.
 *
 * Dos avisos y ninguna imposición: si no hay red se dice, y si hay versión
 * nueva se ofrece. Nunca se recarga la página por su cuenta — hacerlo mientras
 * alguien contesta una pregunta le borra la respuesta a medio escribir.
 */

import { publicar, suscribir, EVENTOS } from './bus.js';
import { el, buscar } from './dom.js';
import { vaciar, pendientes } from './outbox.js';

export const hayRed = () => navigator.onLine;

function aviso(id, texto, accion) {
  document.getElementById(id)?.remove();
  const nodo = el('div', { clase: `aviso aviso--${id}`, attrs: { id, role: 'status' } }, [
    el('span', { texto }),
    accion &&
      el('button', {
        clase: 'aviso__accion',
        type: 'button',
        texto: accion.texto,
        on: { click: accion.al },
      }),
  ]);
  // Dentro del punto de referencia de avisos: fuera de un landmark, el
  // contenido queda huérfano para quien navega con lector de pantalla.
  (document.getElementById('avisos') ?? document.body).append(nodo);
  return nodo;
}

function quitarAviso(id) {
  document.getElementById(id)?.remove();
}

function pintarEstadoRed() {
  if (hayRed()) {
    quitarAviso('aviso-sin-red');
    return;
  }
  const cola = pendientes().length;
  aviso(
    'aviso-sin-red',
    cola
      ? `Sin conexión. ${cola} ${cola === 1 ? 'respuesta guardada' : 'respuestas guardadas'} para enviar después.`
      : 'Sin conexión. Puedes seguir estudiando y practicando.',
  );
}

/**
 * @param {(envio: object) => Promise<void>} enviar
 */
export function iniciarConexion(enviar) {
  pintarEstadoRed();

  window.addEventListener('offline', () => {
    pintarEstadoRed();
    publicar(EVENTOS.RED_CAMBIO, false);
  });

  window.addEventListener('online', async () => {
    pintarEstadoRed();
    publicar(EVENTOS.RED_CAMBIO, true);
    const { enviados } = await vaciar(enviar);
    if (enviados) {
      const nodo = aviso('aviso-sincronizado', `${enviados} ${enviados === 1 ? 'respuesta enviada' : 'respuestas enviadas'}.`);
      setTimeout(() => nodo.remove(), 4000);
      publicar(EVENTOS.INTENTO_REGISTRADO, { sincronizado: enviados });
    }
  });

  suscribir(EVENTOS.INTENTO_REGISTRADO, () => {
    if (!hayRed()) pintarEstadoRed();
  });
}

const HOSTS_LOCALES = ['localhost', '127.0.0.1', '[::1]', ''];

/**
 * Registra el service worker y avisa cuando hay una versión nueva esperando.
 *
 * En local no se registra, y además desinstala cualquiera que quedara de una
 * sesión anterior. La razón es dolorosa y concreta: el modo sin conexión sirve
 * el código guardado y lo renueva por detrás, así que después de cambiar un
 * archivo la primera recarga sigue mostrando el código viejo. En producción es
 * lo correcto; mientras programas te hace perseguir fantasmas.
 *
 * Para probar el modo sin conexión en local, añade `?sw` a la dirección.
 */
export function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const enLocal = HOSTS_LOCALES.includes(window.location.hostname);
  const forzado = new URLSearchParams(window.location.search).has('sw');

  if (enLocal && !forzado) {
    navigator.serviceWorker.getRegistrations().then(async (registros) => {
      if (!registros.length) return;
      await Promise.all(registros.map((r) => r.unregister()));
      if (window.caches) {
        const nombres = await caches.keys();
        await Promise.all(nombres.map((n) => caches.delete(n)));
      }
      console.info('Modo sin conexión desactivado en local. Recarga para ver la versión nueva.');
      aviso('aviso-version', 'Se limpió la copia guardada. Recarga para ver los últimos cambios.', {
        texto: 'Recargar',
        al: () => window.location.reload(),
      });
    });
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registro = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });

      const proponerActualizacion = (esperando) =>
        aviso('aviso-version', 'Hay una versión nueva de Umbral.', {
          texto: 'Actualizar',
          al: () => {
            esperando.postMessage('activar-ahora');
            quitarAviso('aviso-version');
          },
        });

      if (registro.waiting) proponerActualizacion(registro.waiting);

      registro.addEventListener('updatefound', () => {
        const nuevo = registro.installing;
        nuevo?.addEventListener('statechange', () => {
          if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
            proponerActualizacion(nuevo);
          }
        });
      });

      let recargando = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recargando) return;
        recargando = true;
        window.location.reload();
      });
    } catch (error) {
      console.warn('Modo sin conexión no disponible:', error.message);
    }
  });
}

export { buscar };
