/**
 * Configuración que depende del despliegue.
 *
 * Estos valores no son secretos: el identificador de cliente de Google es
 * público por diseño y va en el navegador. Lo que sí es secreto —el *client
 * secret*— nunca aparece aquí ni en ningún archivo del cliente.
 */

/**
 * Identificador de cliente OAuth de Google.
 *
 * Vacío por defecto y **a propósito**. Mientras esté vacío, el botón de
 * "Continuar con Google" aparece deshabilitado y explica que falta
 * configurarlo. Nunca simula una entrada: un botón que finge autenticarte y
 * te crea una sesión de verdad es una puerta trasera, no una maqueta.
 *
 * Para conseguirlo, en la consola de Google Cloud:
 *
 *   1. Crea un proyecto y abre "APIs y servicios" › "Credenciales".
 *   2. Configura la pantalla de consentimiento (tipo Externo).
 *   3. Crea unas credenciales de "ID de cliente de OAuth", tipo
 *      "Aplicación web".
 *   4. En "Orígenes autorizados de JavaScript" añade cada dominio desde el que
 *      se va a servir la aplicación, incluido `http://localhost:8080` para
 *      desarrollo. El origen tiene que coincidir exactamente: puerto incluido,
 *      sin barra final.
 *   5. Copia el identificador —termina en `.apps.googleusercontent.com`— y
 *      pégalo abajo.
 *
 * Si además usas Supabase como backend, activa Google en Authentication ›
 * Providers y pega ahí el mismo identificador junto con el secreto.
 */
// Pega aquí el ID de cliente. Termina en .apps.googleusercontent.com
//
// ⚠ El *secreto* del cliente (empieza por GOCSPX-) NO va aquí ni en ningún
//   archivo del repositorio. Con esta implementación no hace falta para nada;
//   si algún día usas Supabase Auth, va en su panel. Hay una prueba que falla
//   si aparece un secreto en el código.
export const GOOGLE_CLIENT_ID = '715805687462-3plh70g9mtqeclajs74lnlmv0kpj03q0.apps.googleusercontent.com';

export const googleConfigurado = () => GOOGLE_CLIENT_ID.trim().length > 0;

/**
 * Dirección del Worker. Vacío mientras no esté desplegado: con esto vacío la
 * aplicación entera sigue funcionando contra el simulado, así que desplegar y
 * no desplegar son los dos estados normales, no uno roto.
 *
 * Es pública por diseño, como el ID de cliente de Google: solo dice a dónde
 * llamar. Los secretos viven en las variables cifradas de Cloudflare y no
 * aparecen en ningún archivo de este repositorio.
 */
export const API = '';

/**
 * Recursos que ya atiende el servidor.
 *
 * La migración va uno a uno y esta lista es la frontera. Mover un recurso aquí
 * es la única acción necesaria: los repositorios no cambian porque el contrato
 * es el mismo a los dos lados.
 */
export const RECURSOS_EN_SERVIDOR = [
  'auth/registrar',
  'auth/entrar',
  'auth/salir',
  'auth/sesion',
];
