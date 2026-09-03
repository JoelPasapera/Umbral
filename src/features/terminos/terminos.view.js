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

const SECCIONES = [
  {
    titulo: 'Qué guardamos',
    parrafos: [
      'Tu nombre, tu correo y tu año de nacimiento. El año lo pedimos solo para saber si necesitas permiso de un apoderado; no guardamos tu fecha completa.',
      'Tus respuestas de práctica: qué pregunta, si acertaste y cuándo. Es lo que permite calcular tu preparación. Sin eso la aplicación no puede hacer su trabajo.',
      'Nada más. No pedimos tu documento, ni tu teléfono, ni tu colegio, ni tu dirección.',
    ],
  },
  {
    titulo: 'Qué no hacemos',
    parrafos: [
      'No vendemos tus datos ni los compartimos con anunciantes.',
      'No publicamos tu puntaje ni tu nombre en ninguna lista visible para otras personas.',
      'No te mandamos correos que no hayas pedido.',
    ],
  },
  {
    titulo: 'Tus datos son tuyos',
    parrafos: [
      'Puedes descargarlos cuando quieras desde tu perfil, en un archivo que se abre en cualquier computadora.',
      'Puedes pedir que borremos tu cuenta y todo lo asociado. Se borra de verdad, no se oculta.',
    ],
  },
  {
    titulo: 'Si eres menor de edad',
    parrafos: [
      'Necesitas el permiso de tu padre, madre o apoderado para crear una cuenta. Al registrarte confirmas que lo tienes.',
      'No aceptamos cuentas de menores de 14 años.',
      'Tu apoderado puede pedirnos ver o borrar tus datos.',
    ],
  },
  {
    titulo: 'Sobre el número de preparación',
    parrafos: [
      'Es una estimación a partir de tus respuestas, con su margen de error a la vista. No es una predicción de si vas a ingresar.',
      'El puntaje de corte que mostramos es el de un proceso de admisión anterior. Cambia cada año y no lo controlamos.',
      'Cuando no tenemos datos suficientes lo decimos, en vez de inventar un número.',
    ],
  },
  {
    titulo: 'Sobre el material de estudio',
    parrafos: [
      'Publicamos material de libre distribución y aportes de la comunidad.',
      'Si eres autor o editorial y encuentras algo tuyo que no debería estar, escríbenos y lo retiramos.',
    ],
  },
  {
    titulo: 'Uso de la aplicación',
    parrafos: [
      'La cuenta es personal. No la compartas.',
      'Si detectamos que alguien manipula sus respuestas para inflar su preparación, se lo perjudica solo a esa persona, pero podemos reiniciar su historial.',
      'Podemos cerrar cuentas que usen la aplicación para acosar o perjudicar a otros.',
    ],
  },
];

export async function render() {
  return el('div', { clase: 'terminos envoltura' }, [
    el('header', { clase: 'terminos__cabecera' }, [
      el('h1', { clase: 'terminos__titulo', texto: 'Términos y privacidad' }),
      el('p', {
        clase: 'terminos__nota',
        texto: 'Corto y en lenguaje llano, porque un documento que nadie lee no informa a nadie.',
      }),
    ]),
    ...SECCIONES.flatMap((seccion) => [
      el('h2', { clase: 'terminos__seccion', texto: seccion.titulo }),
      ...seccion.parrafos.map((texto) => el('p', { clase: 'terminos__parrafo', texto })),
    ]),
    el('p', {
      clase: 'terminos__pie',
      texto: 'Borrador pendiente de revisión legal. No lo tomes como documento definitivo.',
    }),
    el('a', { clase: 'boton boton--secundario', texto: 'Volver', attrs: { href: '#/perfil' } }),
  ]);
}
