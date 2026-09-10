/**
 * Punto de entrada. Registra las rutas y arranca el enrutador.
 *
 * Cada ruta se carga con import() dinámico: el navegador solo descarga el
 * código de la pantalla en la que la persona entra. Añadir una funcionalidad
 * es añadir una línea aquí y una carpeta en /features.
 */

import { registrar, iniciar } from './core/router.js';
import { buscar } from './core/dom.js';
import { esSimulado } from './data/client.js';
import { iniciarConexion, registrarServiceWorker } from './core/conexion.js';
import { protegerCon } from './core/router.js';
import { haySesion } from './core/sesion.js';
import { pedir } from './data/client.js';

registrar('entrar', () => import('./features/entrar/entrar.view.js'));
registrar('terminos', () => import('./features/terminos/terminos.view.js'));
// La meta vive dentro de Perfil, pero su ruta sigue existiendo: hay enlaces
// guardados y la pantalla de elegir vuelve aquí al terminar.
registrar('meta', () => import('./features/meta/meta.view.js'), { privada: true });
registrar('admision', () => import('./features/admision/admision.view.js'), { privada: true });
registrar('practicar', () => import('./features/practicar/practicar.view.js'), { privada: true });
registrar('estudiar', () => import('./features/estudiar/estudiar.view.js'), { privada: true });
registrar('temario', () => import('./features/temario/temario.view.js'), { privada: true });
registrar('biblioteca', () => import('./features/biblioteca/biblioteca.view.js'), { privada: true });
registrar('elegir', () => import('./features/elegir/elegir.view.js'), { privada: true });
registrar('perfil', () => import('./features/perfil/perfil.view.js'), { privada: true });
registrar('admin', () => import('./features/admin/admin.view.js'), { privada: true });

protegerCon(haySesion);

const TEMA_GUARDADO = 'umbral:tema';
const temaGuardado = localStorage.getItem(TEMA_GUARDADO);
if (temaGuardado) document.documentElement.dataset.tema = temaGuardado;

buscar('#cambiar-tema')?.addEventListener('click', () => {
  const oscuro =
    document.documentElement.dataset.tema === 'noche' ||
    (!document.documentElement.dataset.tema &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  const siguiente = oscuro ? 'papel' : 'noche';
  document.documentElement.dataset.tema = siguiente;
  localStorage.setItem(TEMA_GUARDADO, siguiente);
});

if (esSimulado()) buscar('#aviso-simulado')?.removeAttribute('hidden');

const PUBLICAS = new Set(['entrar', 'terminos']);

function marcarNavegacion() {
  const actual = window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'meta';
  for (const enlace of document.querySelectorAll('.navegacion__enlace')) {
    const destino = enlace.getAttribute('href').replace(/^#\/?/, '');
    if (destino === actual) enlace.setAttribute('aria-current', 'page');
    else enlace.removeAttribute('aria-current');
  }

  // En las pantallas públicas no hay dónde navegar todavía: enseñar una barra
  // con cuatro secciones inaccesibles es prometer algo que no se puede tocar.
  const dentro = !PUBLICAS.has(actual);
  buscar('#barra')?.toggleAttribute('hidden', !dentro);
  buscar('#navegacion-movil')?.toggleAttribute('hidden', !dentro);
}
window.addEventListener('hashchange', marcarNavegacion);
marcarNavegacion();

import { suscribir, EVENTOS } from './core/bus.js';
import { leer, observar } from './core/store.js';

function pintarAcademia() {
  const sesion = leer().sesion;
  const nodo = buscar('#barra-academia');
  if (nodo) nodo.textContent = sesion?.academia ?? '';
}
observar(pintarAcademia);
suscribir(EVENTOS.SESION_CAMBIO, pintarAcademia);

iniciarConexion(async (envio) => {
  await pedir(envio.tipo, envio.carga);
});
registrarServiceWorker();

iniciar(buscar('#contenido'));
