/**
 * Pantalla de meta: dónde estás respecto a tu examen.
 *
 * El índice va sobre una superficie oscura y propia. Es una decisión de
 * jerarquía, no de adorno: es el único dato del producto que justifica que
 * alguien abra la app, y antes competía de tú a tú con once filas de curso.
 */

import { el, montar } from '../../core/dom.js';
import { escribir } from '../../core/store.js';
import { calcularPreparacion, diasHasta } from '../../domain/readiness.js';
import { metaActiva } from '../../data/repositories/goal.repo.js';
import { intentos, siguienteTarea, retoDeHoy } from '../../data/repositories/practice.repo.js';
import { tarjetaReto } from './reto.js';

const entero = (valor) => Math.round(valor);
const CURSOS_VISIBLES = 5;

const estado = { raiz: null, resultado: null, meta: null, tarea: null, reto: null, todos: false };

function cabecera(meta, dias) {
  return el('header', { clase: 'meta-cabecera' }, [
    el('div', { clase: 'meta-cabecera__grupo' }, [
      el('p', { clase: 'meta-cabecera__rotulo', texto: 'Tu meta' }),
      el('h1', { clase: 'meta-cabecera__carrera', texto: meta.carrera }),
      el('p', { clase: 'meta-cabecera__universidad' }, [
        el('span', { texto: `${meta.universidad} · ` }),
        el('a', { clase: 'enlace', texto: 'Cambiar', attrs: { href: '#/elegir' } }),
      ]),
    ]),
    el('div', { clase: 'cuenta-atras' }, [
      el('span', { clase: 'cuenta-atras__n', texto: String(Math.max(dias, 0)) }),
      el('span', { clase: 'cuenta-atras__t', texto: dias === 1 ? 'día para el examen' : 'días para el examen' }),
    ]),
  ]);
}

/**
 * La escala. Muestra tres cosas a la vez: dónde estás, cuánta incertidumbre
 * hay en esa estimación, y dónde está la línea que hay que cruzar.
 */
function escala(indice, margen, corte, alcanza) {
  const izquierda = Math.max(0, indice - margen);
  const ancho = Math.min(100 - izquierda, margen * 2);

  return el('div', { clase: 'escala', attrs: { 'aria-hidden': 'true' } }, [
    el('div', {
      clase: `escala__relleno escala__relleno--${alcanza ? 'alcanza' : 'falta'}`,
      attrs: { style: `width:${indice}%` },
    }),
    el('div', { clase: 'escala__banda', attrs: { style: `left:${izquierda}%;width:${ancho}%` } }),
    corte !== null && el('div', { clase: 'escala__corte', attrs: { style: `left:${corte}%` } }),
    corte !== null &&
      el('div', {
        clase: 'escala__etiqueta',
        texto: `Corte ${corte}`,
        attrs: { style: `left:${Math.min(Math.max(corte, 12), 88)}%` },
      }),
  ]);
}

function indicador(resultado) {
  if (resultado.estado === 'insuficiente') {
    return el('section', { clase: 'indicador indicador--sin-datos' }, [
      el('p', { clase: 'indicador__vacio-titulo', texto: 'Todavía no puedo estimar tu nivel' }),
      el('p', {
        clase: 'indicador__vacio-cuerpo',
        texto:
          'Necesito verte resolver más preguntas antes de darte un número. Uno inventado no te sirve de nada.',
      }),
    ]);
  }

  const indice = entero(resultado.indice);
  const margen = resultado.margen / 2;
  const alcanza = resultado.corte !== null && resultado.brecha >= 0;
  const brecha = entero(Math.abs(resultado.brecha ?? 0));

  const veredicto = el('p', {
    clase: ['veredicto', alcanza ? 'veredicto--alcanza' : 'veredicto--falta'],
  });
  if (resultado.corte !== null) {
    veredicto.append(
      document.createTextNode(alcanza ? 'Estás ' : 'Te faltan '),
      el('strong', { texto: `${brecha} puntos` }),
      document.createTextNode(
        alcanza
          ? ' por encima del último corte conocido. Mantén el ritmo.'
          : ' para el último corte conocido de esta carrera.',
      ),
    );
  }

  return el('section', { clase: 'indicador' }, [
    el('p', { clase: 'indicador__rotulo', texto: 'Preparación estimada' }),
    el('div', { clase: 'indicador__fila' }, [
      el('span', { clase: 'indicador__cifra', texto: String(indice) }),
      el('span', { clase: 'indicador__de', texto: 'de 100' }),
    ]),
    el('p', { clase: 'indicador__margen', texto: `Margen de error de ${entero(margen)} puntos` }),
    escala(indice, margen, resultado.corte, alcanza),
    el('div', { clase: 'escala__extremos' }, [el('span', { texto: '0' }), el('span', { texto: '100' })]),
    resultado.corte !== null && veredicto,
  ]);
}

function filaCurso(curso, posicion) {
  const valor = entero(curso.dominio.valor);
  const nivel = valor < 40 ? 'critico' : valor < 65 ? 'medio' : 'bueno';

  return el('li', { clase: `curso curso--${nivel}` }, [
    el('span', { clase: 'curso__orden', texto: String(posicion) }),
    el('div', {}, [
      el('p', { clase: 'curso__nombre', texto: curso.nombre }),
      el('span', { clase: 'curso__barra' }, [
        el('span', { clase: 'curso__relleno', attrs: { style: `width:${valor}%` } }),
      ]),
    ]),
    el('div', { clase: 'curso__cifras' }, [
      el('span', { clase: 'curso__valor', texto: String(valor) }),
      el('span', {
        clase: 'curso__recupera',
        texto: `+${curso.puntosEnJuego.toFixed(1)} pts`,
      }),
    ]),
  ]);
}

function panelCursos() {
  const { resultado } = estado;
  const lista = estado.todos ? resultado.cursos : resultado.cursos.slice(0, CURSOS_VISIBLES);
  const ocultos = resultado.cursos.length - lista.length;

  const nodos = [
    el('h2', { clase: 'panel__titulo', texto: 'Dónde estás perdiendo puntos' }),
    el('p', {
      clase: 'panel__nota',
      texto: 'Ordenado por cuántos puntos del examen puedes recuperar en cada curso.',
    }),
    el('ul', { clase: 'cursos' }, lista.map((c, i) => filaCurso(c, i + 1))),
  ];

  if (ocultos > 0 || estado.todos) {
    nodos.push(
      el('button', {
        clase: 'ver-mas',
        type: 'button',
        texto: estado.todos ? 'Ver solo los primeros' : `Ver los ${ocultos} cursos restantes`,
        on: {
          click: () => {
            estado.todos = !estado.todos;
            pintar();
          },
        },
      }),
    );
  }

  if (resultado.sinDatos.length) {
    nodos.push(
      el('p', { clase: 'sin-datos' }, [
        el('span', { texto: `Sin datos todavía: ${resultado.sinDatos.map((c) => c.nombre).join(', ')}. ` }),
        el('span', { texto: `Cubren el ${entero((1 - resultado.cobertura) * 100)}% del examen.` }),
      ]),
    );
  }

  return el('section', { clase: 'panel' }, nodos);
}

function bloqueTarea(curso, tarea) {
  return el('section', { clase: 'tarea' }, [
    el('p', { clase: 'tarea__rotulo', texto: 'Lo siguiente' }),
    el('h2', { clase: 'tarea__titulo', texto: tarea.titulo }),
    el('p', { clase: 'tarea__detalle', texto: tarea.detalle }),
    el('a', {
      clase: 'boton boton--ancho',
      texto: `Empezar · ${tarea.preguntas} preguntas, ${tarea.minutos} min`,
      attrs: { href: `#/practicar?curso=${encodeURIComponent(curso.cursoId)}` },
    }),
  ]);
}

function pintar() {
  const { meta, resultado, tarea } = estado;
  const columnaIzquierda = [indicador(resultado)];

  if (resultado.estado === 'estimado' && tarea) {
    columnaIzquierda.push(bloqueTarea(resultado.cursos[0], tarea));
  } else if (resultado.estado === 'insuficiente') {
    columnaIzquierda.push(
      el('section', { clase: 'tarea' }, [
        el('p', { clase: 'tarea__rotulo', texto: 'Empieza por aquí' }),
        el('h2', { clase: 'tarea__titulo', texto: 'Diagnóstico inicial' }),
        el('p', {
          clase: 'tarea__detalle',
          texto: 'Treinta preguntas repartidas entre los cursos de tu examen.',
        }),
        el('a', {
          clase: 'boton boton--ancho',
          texto: 'Empezar · 30 preguntas, 25 min',
          attrs: { href: '#/practicar?modo=diagnostico' },
        }),
      ]),
    );
  }

  if (estado.reto) columnaIzquierda.push(tarjetaReto(estado.reto));

  const columnaDerecha = [];
  if (resultado.estado === 'estimado') {
    columnaDerecha.push(panelCursos());
    if (meta.corte !== null) columnaDerecha.push(el('p', { clase: 'fuente', texto: meta.corteFuente }));
  }

  montar(
    estado.raiz,
    el('div', { clase: 'meta' }, [
      cabecera(meta, diasHasta(meta.fecha, Date.now())),
      el('div', { clase: 'meta-rejilla' }, [
        el('div', {}, columnaIzquierda),
        columnaDerecha.length ? el('div', {}, columnaDerecha) : null,
      ]),
    ]),
  );
}

/** @param {object} _params */
export async function render(_params) {
  const [meta, historial] = await Promise.all([metaActiva(), intentos()]);
  const resultado = calcularPreparacion(historial, meta, Date.now());
  escribir({ meta, preparacion: resultado });

  const [tarea, reto] = await Promise.all([
    resultado.estado === 'estimado' && resultado.cursos[0]
      ? siguienteTarea(resultado.cursos[0].cursoId)
      : null,
    retoDeHoy().catch(() => null),
  ]);

  Object.assign(estado, { raiz: el('div'), meta, resultado, tarea, reto, todos: false });
  pintar();
  return estado.raiz;
}
