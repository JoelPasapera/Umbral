/**
 * Pantalla de práctica.
 *
 * Es el motor del sistema: cada respuesta genera evidencia y la evidencia
 * mueve el índice de la pantalla de meta. Por eso al terminar publica un
 * evento en el bus; `meta/` lo escucha sin que ninguna de las dos se importe.
 */

import { el, montar } from '../../core/dom.js';
import { publicar, EVENTOS } from '../../core/bus.js';
import { escribirConFormulas } from '../../ui/components/math.js';
import { iniciar, responder, cerrar, retoDeHoy } from '../../data/repositories/practice.repo.js';
import { invalidar } from '../../data/repositories/goal.repo.js';
import { estadoVacio } from '../../ui/components/estado.js';
import { leer } from '../../core/store.js';

const estado = {
  sesion: null,
  indice: 0,
  seleccion: null,
  veredicto: null,
  desde: 0,
  aciertos: 0,
  raiz: null,
};

let soltarTeclado = null;

const preguntaActual = () => estado.sesion?.preguntas[estado.indice] ?? null;

function progreso() {
  const hechas = estado.indice + (estado.veredicto ? 1 : 0);
  return el('div', { clase: 'practica-progreso' }, [
    el('p', {
      clase: 'practica-progreso__texto',
      texto: `Pregunta ${estado.indice + 1} de ${estado.sesion.total}`,
    }),
    el('div', { clase: 'practica-progreso__pista', attrs: { 'aria-hidden': 'true' } }, [
      el('div', {
        clase: 'practica-progreso__avance',
        attrs: { style: `width:${(hechas / estado.sesion.total) * 100}%` },
      }),
    ]),
  ]);
}

function opcion(texto, indice) {
  const marcada = estado.seleccion === indice;
  const resuelto = Boolean(estado.veredicto);
  const esCorrecta = resuelto && indice === estado.veredicto.correcta;
  const esFalloPropio = resuelto && marcada && !estado.veredicto.acerto;

  const boton = el('button', {
    clase: [
      'opcion',
      marcada && !resuelto && 'opcion--marcada',
      esCorrecta && 'opcion--correcta',
      esFalloPropio && 'opcion--fallada',
    ],
    type: 'button',
    attrs: {
      'aria-pressed': marcada ? 'true' : 'false',
      disabled: resuelto,
    },
    on: {
      click: () => {
        if (estado.veredicto) return;
        estado.seleccion = indice;
        pintar();
      },
    },
  });

  boton.append(
    el('span', { clase: 'opcion__letra', texto: 'ABCD'[indice], attrs: { 'aria-hidden': 'true' } }),
  );
  const cuerpo = el('span', { clase: 'opcion__texto' });
  escribirConFormulas(cuerpo, texto);
  boton.append(cuerpo);

  if (esCorrecta) boton.append(el('span', { clase: 'opcion__marca', texto: 'Correcta' }));
  if (esFalloPropio) boton.append(el('span', { clase: 'opcion__marca', texto: 'Tu respuesta' }));

  return boton;
}

function bloqueVeredicto() {
  const { acerto, explicacion } = estado.veredicto;
  const cuerpo = el('p', { clase: 'veredicto-practica__cuerpo' });
  escribirConFormulas(cuerpo, explicacion);

  return el(
    'section',
    {
      clase: ['veredicto-practica', acerto ? 'veredicto-practica--bien' : 'veredicto-practica--mal'],
      attrs: { role: 'status' },
    },
    [
      el('p', {
        clase: 'veredicto-practica__titulo',
        texto: acerto ? 'Correcto' : 'Repasa este paso',
      }),
      cuerpo,
    ],
  );
}

async function enviar() {
  if (estado.seleccion === null || estado.veredicto) return;
  const pregunta = preguntaActual();
  const segundos = Math.round((Date.now() - estado.desde) / 1000);

  estado.veredicto = await responder({
    sesionId: estado.sesion.sesionId,
    preguntaId: pregunta.id,
    opcion: estado.seleccion,
    segundos,
  });
  if (estado.veredicto.acerto) estado.aciertos += 1;
  pintar();
}

async function avanzar() {
  if (estado.indice + 1 >= estado.sesion.total) return terminar();
  estado.indice += 1;
  estado.seleccion = null;
  estado.veredicto = null;
  estado.desde = Date.now();
  pintar();
}

async function terminar() {
  const resumen = await cerrar(estado.sesion.sesionId);
  invalidar();
  publicar(EVENTOS.INTENTO_REGISTRADO, resumen);

  const porcentaje = Math.round((resumen.aciertos / resumen.total) * 100);
  const minutos = Math.max(1, Math.round(resumen.segundos / 60));

  montar(
    estado.raiz,
    el('section', { clase: 'resumen' }, [
      el('p', { clase: 'resumen__rotulo', texto: 'Sesión terminada' }),
      el('p', { clase: 'resumen__cifra', texto: `${resumen.aciertos}/${resumen.total}` }),
      el('p', {
        clase: 'resumen__detalle',
        texto: `${porcentaje}% de aciertos en ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}.`,
      }),
      el('p', {
        clase: 'resumen__nota',
        texto:
          resumen.modo === 'diario'
            ? 'Corregido en el servidor: estas respuestas pesan el máximo en tu preparación.'
            : 'Práctica libre: estas respuestas cuentan, pero menos que las del reto diario.',
      }),
      resumen.racha?.actual > 0 &&
        el('p', {
          clase: 'resumen__racha',
          texto: `${resumen.racha.actual} ${resumen.racha.actual === 1 ? 'día seguido' : 'días seguidos'} con el reto hecho.`,
        }),
      el('a', { clase: 'boton boton--ancho', texto: 'Volver a mi meta', attrs: { href: '#/meta' } }),
    ]),
  );
}

function pintar() {
  const pregunta = preguntaActual();
  const enunciado = el('h1', { clase: 'practica-enunciado' });
  escribirConFormulas(enunciado, pregunta.enunciado);

  const acciones = estado.veredicto
    ? el('button', {
        clase: 'boton boton--ancho',
        type: 'button',
        texto:
          estado.indice + 1 >= estado.sesion.total ? 'Ver resultado' : 'Siguiente pregunta',
        on: { click: avanzar },
      })
    : el('button', {
        clase: 'boton boton--ancho',
        type: 'button',
        texto: 'Comprobar',
        attrs: { disabled: estado.seleccion === null },
        on: { click: enviar },
      });

  montar(
    estado.raiz,
    el('div', { clase: 'practica' }, [
      progreso(),
      el('div', { clase: 'practica__tarjeta' }, [
      enunciado,
      el(
        'div',
        { clase: 'opciones', attrs: { role: 'group', 'aria-label': 'Alternativas' } },
        pregunta.opciones.map(opcion),
      ),
      estado.veredicto && bloqueVeredicto(),
      acciones,
      ]),
      el('p', {
        clase: 'practica-ayuda',
        texto: 'Teclas 1 a 4 para elegir, Enter para continuar.',
      }),
    ]),
  );
}

function atajos(evento) {
  if (evento.target.matches('input, textarea')) return;
  const numero = Number(evento.key);
  if (numero >= 1 && numero <= 4 && !estado.veredicto) {
    const pregunta = preguntaActual();
    if (numero <= pregunta.opciones.length) {
      evento.preventDefault();
      estado.seleccion = numero - 1;
      pintar();
    }
    return;
  }
  if (evento.key === 'Enter') {
    evento.preventDefault();
    if (estado.veredicto) avanzar();
    else enviar();
  }
}

/** @param {{ curso?: string, modo?: string }} params */
export async function render(params) {
  estado.raiz = el('div');

  // El reto diario es uno al día. Repetirlo hasta acertar destruiría el valor
  // del dato, que es justo lo que justifica que pese más que la práctica libre.
  if (params.modo === 'diario') {
    const hoy = await retoDeHoy().catch(() => null);
    if (hoy?.hecho) {
      montar(
        estado.raiz,
        estadoVacio({
          titulo: 'Ya hiciste el reto de hoy',
          cuerpo: `Sacaste ${hoy.resultado.aciertos} de ${hoy.resultado.total}. Mañana hay uno nuevo, con preguntas de tus cursos más flojos.`,
          accion: { texto: 'Volver a mi meta', href: '#/meta' },
        }),
      );
      return estado.raiz;
    }
  }

  const debiles = (leer().preparacion?.cursos ?? []).map((c) => c.cursoId);
  const sesion = await iniciar({ cursoId: params.curso, modo: params.modo, debiles });

  Object.assign(estado, {
    sesion,
    indice: 0,
    seleccion: null,
    veredicto: null,
    desde: Date.now(),
    aciertos: 0,
  });

  if (!sesion.total) {
    montar(
      estado.raiz,
      estadoVacio({
        titulo: 'Todavía no hay preguntas de este curso',
        cuerpo: 'Elige otro curso desde tu meta mientras preparamos estas.',
        accion: { texto: 'Volver a mi meta', href: '#/meta' },
      }),
    );
    return estado.raiz;
  }

  pintar();
  document.addEventListener('keydown', atajos);
  soltarTeclado = () => document.removeEventListener('keydown', atajos);
  return estado.raiz;
}

/** El enrutador la llama al salir: sin esto el atajo de teclado sobreviviría a la pantalla. */
export function descartar() {
  soltarTeclado?.();
  soltarTeclado = null;
  estado.sesion = null;
}
