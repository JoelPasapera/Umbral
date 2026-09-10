/**
 * Entrada con Google, de verdad.
 *
 * Usa Google Identity Services, la biblioteca oficial. El flujo real es:
 *
 *   1. Se carga el script de Google.
 *   2. Google dibuja **su propio botón**. No es capricho: su documentación
 *      exige que el botón sea el suyo, y además así el diálogo se abre siempre.
 *      Un botón propio que llama a `prompt()` lo bloquean muchos navegadores
 *      por política de terceros, y entonces no pasa nada al pulsarlo.
 *   3. La persona elige su cuenta en el diálogo de Google.
 *   4. Google devuelve un *ID token*: un JWT firmado por ellos.
 *   5. Ese JWT se manda al servidor, que **tiene que verificar la firma**
 *      contra las claves públicas de Google antes de creer una sola palabra.
 *
 * Sobre el paso 5: un JWT sin verificar es texto que cualquiera puede escribir.
 * Confiar en su contenido sin comprobar la firma equivale a dejar que el
 * visitante diga quién es.
 */

import { GOOGLE_CLIENT_ID, googleConfigurado } from '../data/config.js';

const SCRIPT = 'https://accounts.google.com/gsi/client';

/**
 * Cuánto se espera a que Google dibuje su botón antes de dar por hecho que
 * algo está mal configurado.
 */
const ESPERA_MAXIMA = 4000;

let cargando = null;

function cargarScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (cargando) return cargando;

  cargando = new Promise((listo, fallo) => {
    const etiqueta = document.createElement('script');
    etiqueta.src = SCRIPT;
    etiqueta.async = true;
    etiqueta.defer = true;
    etiqueta.onload = () => listo(window.google);
    etiqueta.onerror = () => fallo(new Error('No se pudo cargar el servicio de Google.'));
    document.head.append(etiqueta);
  });
  return cargando;
}

/**
 * Dibuja el botón oficial de Google dentro de `contenedor`.
 *
 * @param {HTMLElement} contenedor
 * @param {(credencial: string) => void} alRecibir recibe el ID token
 * @param {(mensaje: string) => void} alFallar
 */
export async function montarBotonGoogle(contenedor, alRecibir, alFallar) {
  if (!googleConfigurado()) {
    alFallar('Falta configurar el identificador de cliente de Google.');
    return;
  }

  let google;
  try {
    google = await cargarScript();
  } catch (error) {
    alFallar(error.message);
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: ({ credential }) => {
      if (credential) alRecibir(credential);
      else alFallar('Google no devolvió ninguna credencial.');
    },
    // Sin selección automática: entrar en la cuenta de otro por descuido, en
    // un teléfono compartido o una cabina, es un accidente caro.
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  google.accounts.id.renderButton(contenedor, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    text: 'continue_with',
    logo_alignment: 'left',
    locale: 'es',
    width: Math.min(contenedor.clientWidth || 340, 400),
  });

  // Si el origen no está entre los autorizados, Google no avisa: escribe un
  // error en la consola y **no dibuja nada**. Para quien configura esto, el
  // síntoma es un hueco en blanco y ninguna pista. Aquí se detecta el hueco y
  // se dice exactamente qué revisar.
  vigilarQueAparezca(contenedor, alFallar);
}

function vigilarQueAparezca(contenedor, alFallar) {
  const desde = Date.now();

  const revisar = () => {
    if (contenedor.querySelector('iframe, div[role="button"]')) return;
    if (Date.now() - desde < ESPERA_MAXIMA) {
      setTimeout(revisar, 400);
      return;
    }
    alFallar(
      `Google no dibujó el botón. Casi siempre es que este origen no está ` +
        `autorizado: añade "${window.location.origin}" a los Orígenes autorizados ` +
        `de JavaScript de tu cliente OAuth, sin barra final y con el puerto exacto. ` +
        `Los cambios tardan unos minutos en aplicarse.`,
    );
  };

  setTimeout(revisar, 600);
}

/** Cierra la sesión del lado de Google, para que no reaparezca sola. */
export function olvidarGoogle() {
  window.google?.accounts?.id?.disableAutoSelect?.();
}

export { googleConfigurado };
