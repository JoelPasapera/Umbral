/**
 * Términos y privacidad. Criterio 13.6.
 *
 * En lenguaje llano y corto. Un documento de seis páginas que nadie lee no es
 * transparencia, es cobertura legal disfrazada. Lo que hay aquí es lo que de
 * verdad hace la aplicación, dicho en frases que un chico de dieciséis años
 * entiende sin ayuda.
 *
 * Antes de publicar hay que someterlo a revisión legal peruana. El texto es un
 * borrador honesto, no un documento validado.
 */

import { el } from '../../core/dom.js';

import { PRIVACIDAD, TERMINOS, AVISO_BORRADOR } from '../../data/legal.js';

const bloques = (documento) =>
  documento.secciones.flatMap((seccion) => [
    el('h2', { clase: 'terminos__seccion', texto: seccion.titulo }),
    ...seccion.parrafos.map((texto) => el('p', { clase: 'terminos__parrafo', texto })),
  ]);

export async function render() {
  return el('div', { clase: 'terminos envoltura' }, [
    el('header', { clase: 'terminos__cabecera' }, [
      el('h1', { clase: 'terminos__titulo', texto: 'Términos y privacidad' }),
      el('p', {
        clase: 'terminos__nota',
        texto: 'Corto y en lenguaje llano, porque un documento que nadie lee no informa a nadie.',
      }),
      // Las versiones públicas son las que valen ante Google y las tiendas.
      el('p', { clase: 'terminos__enlaces' }, [
        el('a', { clase: 'enlace', texto: 'Ver la política de privacidad pública', attrs: { href: './privacidad.html' } }),
      ]),
    ]),
    el('p', { clase: 'terminos__pie', texto: AVISO_BORRADOR }),
    el('h2', { clase: 'terminos__grupo', texto: PRIVACIDAD.titulo }),
    ...bloques(PRIVACIDAD),
    el('h2', { clase: 'terminos__grupo', texto: TERMINOS.titulo }),
    ...bloques(TERMINOS),
    el('a', { clase: 'boton boton--secundario', texto: 'Volver', attrs: { href: '#/perfil' } }),
  ]);
}
