/**
 * Reto de hoy y constancia.
 *
 * Sobre la racha, una decisión deliberada. La versión anterior mostraba
 * "0 DÍAS · RACHA ACTUAL · No pares", que es presión sobre un público que ya
 * llega con bastante. Aquí:
 *
 *   - La cifra de racha aparece, porque motiva, pero sin lenguaje de amenaza.
 *   - Al lado va el calendario de 28 días, que muestra constancia real y no se
 *     destruye por un día perdido.
 *   - Si la racha se rompe, el texto dice "empiezas de nuevo", no "la perdiste".
 *
 * Un contador frágil que castiga un día malo hace que la gente abandone
 * justo cuando más falta le hace volver.
 */

import { el } from '../../core/dom.js';

const DIAS_LETRA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function calendario(dias) {
  const celdas = dias.map((d) => {
    const fecha = new Date(`${d.dia}T12:00:00Z`);
    return el('span', {
      clase: ['constancia__dia', d.hecho && 'constancia__dia--hecho'],
      attrs: {
        title: `${DIAS_LETRA[fecha.getUTCDay()]} ${fecha.getUTCDate()} · ${d.hecho ? 'practicaste' : 'sin práctica'}`,
      },
    });
  });
  return el('div', { clase: 'constancia__grid', attrs: { 'aria-hidden': 'true' } }, celdas);
}

/**
 * @param {{ hecho: boolean, resultado: object|null, racha: object }} estado
 */
export function tarjetaReto(estado) {
  const { racha } = estado;

  const cabecera = el('div', { clase: 'reto__cabecera' }, [
    el('div', {}, [
      el('p', { clase: 'reto__rotulo', texto: 'Reto de hoy' }),
      el('p', {
        clase: 'reto__nota',
        texto: 'Cinco preguntas de tus cursos más flojos. Las corrige el servidor, así que cuentan el doble.',
      }),
    ]),
    racha.actual > 0 &&
      el('div', { clase: 'reto__racha' }, [
        el('span', { clase: 'reto__racha-n', texto: String(racha.actual) }),
        el('span', {
          clase: 'reto__racha-t',
          texto: racha.actual === 1 ? 'día seguido' : 'días seguidos',
        }),
      ]),
  ]);

  const cuerpo = estado.hecho
    ? [
        el('p', { clase: 'reto__hecho' }, [
          el('strong', { texto: `${estado.resultado.aciertos} de ${estado.resultado.total}` }),
          document.createTextNode(' hoy. Vuelve mañana por el siguiente.'),
        ]),
      ]
    : [
        el('a', {
          clase: 'boton boton--ancho',
          texto: 'Empezar el reto · 5 preguntas',
          attrs: { href: '#/practicar?modo=diario' },
        }),
      ];

  const constancia = el('div', { clase: 'constancia' }, [
    el('div', { clase: 'constancia__fila' }, [
      el('span', { clase: 'constancia__titulo', texto: 'Últimas 4 semanas' }),
      el('span', {
        clase: 'constancia__conteo',
        texto: `${racha.ultimos28} de 28 días`,
      }),
    ]),
    calendario(racha.calendario),
    racha.actual === 0 &&
      racha.ultimos28 > 0 &&
      el('p', {
        clase: 'constancia__aliento',
        texto: 'Hoy empiezas de nuevo. Lo que ya practicaste sigue contando.',
      }),
  ]);

  return el('section', { clase: ['reto', estado.hecho && 'reto--hecho'] }, [
    cabecera,
    ...cuerpo,
    constancia,
  ]);
}
