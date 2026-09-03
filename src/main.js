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
registrar('meta', () => import('./features/meta/meta.view.js'), { privada: true });
registrar('practicar', () => import('./features/practicar/practicar.view.js'), { privada: true });
registrar('estudiar', () => import('./features/estudiar/estudiar.view.js'), { privada: true });
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

function marcarNavegacion() {
  const actual = window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'meta';
  for (const enlace of document.querySelectorAll('.navegacion__enlace')) {
    const destino = enlace.getAttribute('href').replace(/^#\/?/, '');
    if (destino === actual) enlace.setAttribute('aria-current', 'page');
    else enlace.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange', marcarNavegacion);
marcarNavegacion();

iniciarConexion(async (envio) => {
  await pedir(envio.tipo, envio.carga);
});
registrarServiceWorker();

iniciar(buscar('#contenido'));
