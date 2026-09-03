/**
 * Service worker.
 *
 * Sirve para una cosa concreta: que la app abra en dos segundos y siga
 * funcionando en el micro, en el túnel, o con megas agotados.
 *
 * Todo el archivo está escrito contra un solo riesgo. Un service worker mal
 * hecho es la única pieza capaz de dejar a los usuarios clavados en una
 * versión vieja para siempre, sin que nadie se entere. Por eso:
 *
 *   - La versión está en la primera línea. Cambiarla borra lo viejo.
 *   - El HTML nunca se sirve desde caché sin preguntar a la red primero.
 *   - Cuando hay versión nueva se avisa a la pestaña; no se impone sola.
 *   - El caché de imágenes tiene tope; si no, llena el teléfono del usuario.
 */

const VERSION = 'v6';
const SHELL = `shell-${VERSION}`;
const DATOS = `datos-${VERSION}`;
const IMAGENES = `imagenes-${VERSION}`;
const EXTERNOS = `externos-${VERSION}`;

const TOPE_IMAGENES = 120;

const PRECARGA = [
  './',
  './index.html',
  './manifest.json',
  './src/main.js',
  './src/core/router.js',
  './src/core/dom.js',
  './src/core/store.js',
  './src/core/bus.js',
  './src/core/conexion.js',
  './src/core/outbox.js',
  './src/ui/tokens.css',
  './src/ui/base.css',
  './src/features/meta/meta.css',
  './src/features/practicar/practicar.css',
  './src/features/estudiar/estudiar.css',
  './src/features/entrar/entrar.css',
  './src/features/perfil/perfil.css',
  './src/features/admin/admin.css',
  './src/features/terminos/terminos.css',
  './src/features/elegir/elegir.css',
  './src/core/sesion.js',
  './src/ui/components/iconos.js',
  './src/ui/components/estado.js',
  './src/features/entrar/validacion.js',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(SHELL).then((cache) =>
      // addAll falla entero si un recurso falla. Los añadimos de uno en uno
      // para que un archivo movido no deje la instalación a medias.
      Promise.all(
        PRECARGA.map((ruta) =>
          cache.add(ruta).catch((error) => console.warn('No precargado:', ruta, error.message)),
        ),
      ),
    ),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const vigentes = new Set([SHELL, DATOS, IMAGENES, EXTERNOS]);
      const nombres = await caches.keys();
      await Promise.all(nombres.filter((n) => !vigentes.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

/** La pestaña pide tomar el control cuando el usuario acepta actualizar. */
self.addEventListener('message', (evento) => {
  if (evento.data === 'activar-ahora') self.skipWaiting();
});

async function recortar(nombre, tope) {
  const cache = await caches.open(nombre);
  const claves = await cache.keys();
  if (claves.length <= tope) return;
  // Las claves llegan en orden de inserción: las primeras son las más viejas.
  await Promise.all(claves.slice(0, claves.length - tope).map((k) => cache.delete(k)));
}

const guardable = (respuesta) => respuesta && respuesta.ok && respuesta.type !== 'opaque';

/** Red primero, caché como red de seguridad. Para datos y navegación. */
async function redPrimero(peticion, nombreCache) {
  const cache = await caches.open(nombreCache);
  try {
    const respuesta = await fetch(peticion);
    if (guardable(respuesta)) cache.put(peticion, respuesta.clone());
    return respuesta;
  } catch (error) {
    const guardada = await cache.match(peticion);
    if (guardada) return guardada;
    throw error;
  }
}

/** Caché primero. Para lo que no cambia: fuentes, imágenes, librerías con versión. */
async function cachePrimero(peticion, nombreCache, tope) {
  const cache = await caches.open(nombreCache);
  const guardada = await cache.match(peticion);
  if (guardada) return guardada;

  const respuesta = await fetch(peticion);
  if (guardable(respuesta)) {
    await cache.put(peticion, respuesta.clone());
    if (tope) recortar(nombreCache, tope);
  }
  return respuesta;
}

/** Sirve lo guardado al instante y renueva por detrás. Para el código de la app. */
async function servirYRenovar(peticion, nombreCache) {
  const cache = await caches.open(nombreCache);
  const guardada = await cache.match(peticion);

  const enCurso = fetch(peticion)
    .then((respuesta) => {
      if (guardable(respuesta)) cache.put(peticion, respuesta.clone());
      return respuesta;
    })
    .catch(() => null);

  return guardada ?? enCurso.then((r) => r ?? Promise.reject(new Error('sin red y sin copia')));
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento;

  // Nunca tocamos nada que no sea una lectura simple. Un POST guardado en
  // caché es una respuesta equivocada a una acción que sí ocurrió.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    evento.respondWith(
      redPrimero(request, SHELL).catch(() => caches.match('./index.html')),
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    // Fuentes y librerías con versión en la URL: no cambian nunca.
    evento.respondWith(cachePrimero(request, EXTERNOS));
    return;
  }

  if (request.destination === 'image') {
    evento.respondWith(cachePrimero(request, IMAGENES, TOPE_IMAGENES));
    return;
  }

  if (url.pathname.includes('/api/')) {
    evento.respondWith(redPrimero(request, DATOS));
    return;
  }

  evento.respondWith(servirYRenovar(request, SHELL));
});
