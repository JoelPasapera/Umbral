/**
 * Admisión.
 *
 * Responde a lo que un postulante no sabe y no puede averiguar practicando:
 * cuándo es el examen, cómo se reparten los puntos, qué corte hay que pasar y
 * qué pasos administrativos hay por delante. Practicar te dice cómo vas; esta
 * pantalla te dice contra qué.
 *
 * Ocupa el sitio que tenía "Meta" en la barra, y la meta se fue a "Perfil". La
 * razón es de uso: la meta se elige una vez y se consulta poco; la información
 * de admisión se mira constantemente durante los meses de preparación.
 *
 * **Cada dato dice de dónde sale.** El reparto del examen viene del temario
 * contrastado contra el prospecto. Las cifras y las fechas son de ejemplo
 * mientras el raspador no esté funcionando, y la pantalla lo dice en cada
 * tarjeta en vez de presentarlas como ciertas. Un corte inventado que parezca
 * real es peor que no dar ninguno: sobre esa cifra se calcula cuánto le falta a
 * la persona, y ese número es de lo que vive Umbral.
 */

import { el, montar } from '../../core/dom.js';
import { admision } from '../../data/repositories/goal.repo.js';
import { vistaDeError } from '../../ui/components/estado.js';

const estado = { datos: null, cargando: true, error: null };
let raiz = null;

const DIA = 86_400_000;

const pct = (f) => `${Math.round(f * 100)}%`;

const fechaLarga = (marca) => new Date(marca).toLocaleDateString('es-PE', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

/**
 * Marca de procedencia.
 *
 * Va pegada al dato y no en una nota al pie. Una advertencia que hay que ir a
 * buscar no la lee nadie, y el problema de un corte de ejemplo es justo que
 * parece de verdad.
 */
const sello = (estadoDato) => (estadoDato === 'verificado'
  ? el('span', { clase: 'sello sello--firme', texto: 'Verificado con el prospecto' })
  : el('span', { clase: 'sello sello--ejemplo', texto: 'Dato de ejemplo' }));

/** Cuándo es el examen y cuánto falta. */
function cronograma() {
  const { cronograma: jornadas, reparto } = estado.datos;
  if (!jornadas?.length) return null;

  const laTuya = jornadas.find((j) => j.areas.includes(reparto.area));
  const ahora = Date.now();

  return el('section', { clase: 'admision__bloque' }, [
    el('div', { clase: 'admision__titular' }, [
      el('h2', { clase: 'rotulo', texto: 'Cuándo es' }),
      sello(jornadas[0].estado),
    ]),
    laTuya && el('p', { clase: 'admision__destacado' }, [
      el('strong', { texto: `Tu área rinde el ${fechaLarga(laTuya.fecha)}. ` }),
      el('span', {
        texto: laTuya.fecha > ahora
          ? `Quedan ${Math.ceil((laTuya.fecha - ahora) / DIA)} días.`
          : 'Esa fecha ya pasó: revisa la convocatoria vigente.',
      }),
    ]),
    el('ul', { clase: 'jornadas' }, jornadas.map((j) => el('li', {
      clase: ['jornada', j.areas.includes(reparto.area) && 'jornada--tuya'],
    }, [
      el('span', { clase: 'jornada__fecha', texto: fechaLarga(j.fecha) }),
      el('span', { clase: 'jornada__areas', texto: `Áreas ${j.areas.join(', ')}` }),
    ]))),
  ]);
}

/**
 * Cómo se reparten los puntos.
 *
 * Es la sección más útil de la pantalla y la única que no depende de ninguna
 * convocatoria. Un postulante que ve que Habilidad matemática vale 200 puntos y
 * Trigonometría 40 deja de repartir su tiempo a partes iguales, que es el error
 * que más caro sale.
 */
function reparto() {
  const r = estado.datos.reparto;
  const mayor = r.cursos[0]?.puntos || 1;

  return el('section', { clase: 'admision__bloque' }, [
    el('div', { clase: 'admision__titular' }, [
      el('h2', { clase: 'rotulo', texto: 'A qué te enfrentas' }),
      sello(r.estado),
    ]),
    el('p', { clase: 'admision__destacado' }, [
      el('strong', { texto: `${r.preguntas} preguntas · ${r.puntos} puntos · área ${r.area}. ` }),
      el('span', { texto: `Cada pregunta vale ${r.porPregunta} puntos, valga el curso que valga.` }),
    ]),
    el('ul', { clase: 'reparto' }, r.cursos.map((c) => el('li', { clase: 'reparto__fila' }, [
      el('span', { clase: 'reparto__curso', texto: c.nombre }),
      // Barra proporcional al curso más pesado: la comparación se ve antes de
      // leer ninguna cifra, que es de lo que se trata.
      el('span', { clase: 'reparto__barra' }, [
        // `el` no admite `style` como propiedad: va por `attrs`, que sí llega
        // al nodo. Puesto como propiedad se ignoraba en silencio y la barra
        // salía con el mismo ancho para todos los cursos.
        el('span', {
          clase: 'reparto__relleno',
          attrs: { style: `width:${Math.round((c.puntos / mayor) * 1000) / 10}%` },
        }),
      ]),
      el('span', { clase: 'reparto__puntos', texto: `${c.puntos} pts` }),
      el('span', { clase: 'reparto__peso', texto: pct(c.peso) }),
    ]))),
  ]);
}

/** El corte de tu carrera y a cuánto conviene apuntar. */
function cortes() {
  const { cifras, tuCarrera } = estado.datos;
  if (!cifras?.length) return null;

  return el('section', { clase: 'admision__bloque' }, [
    el('div', { clase: 'admision__titular' }, [
      el('h2', { clase: 'rotulo', texto: 'Qué hay que sacar' }),
      sello(cifras[0].estado),
    ]),
    tuCarrera && el('div', { clase: 'objetivo' }, [
      el('p', { clase: 'objetivo__carrera', texto: tuCarrera.carrera }),
      el('p', { clase: 'objetivo__cifra' }, [
        el('strong', { texto: String(tuCarrera.objetivo) }),
        el('span', { clase: 'objetivo__unidad', texto: ' puntos para ir sobrado' }),
      ]),
      el('p', {
        clase: 'objetivo__nota',
        // Apuntar justo al corte es apuntar a fallar por poco: el corte se
        // mueve entre convocatorias y nadie sabe hacia dónde.
        texto: `El último corte conocido fue ${tuCarrera.corte}. El corte se mueve entre convocatorias, `
          + 'así que apuntar justo a él es apuntar a quedarse fuera por dos preguntas.',
      }),
    ]),
    el('ul', { clase: 'cortes' }, cifras.map((c) => el('li', {
      clase: ['corte', c.carreraId === tuCarrera?.carreraId && 'corte--tuya'],
    }, [
      el('span', { clase: 'corte__carrera', texto: c.carrera }),
      el('span', { clase: 'corte__dato', texto: `${c.corte} pts` }),
      el('span', { clase: 'corte__dato corte__dato--suave', texto: `${c.vacantes} vacantes` }),
      el('span', { clase: 'corte__dato corte__dato--suave', texto: `${c.porVacante} por vacante` }),
    ]))),
  ]);
}

/** Los trámites, que es donde se cae la gente por un papel. */
function pasos() {
  return el('section', { clase: 'admision__bloque' }, [
    el('h2', { clase: 'rotulo', texto: 'Qué pasos siguen' }),
    el('ol', { clase: 'pasos' }, estado.datos.pasos.map((p, i) => el('li', { clase: 'paso' }, [
      el('span', { clase: 'paso__numero', texto: String(i + 1) }),
      el('div', {}, [
        el('p', { clase: 'paso__titulo', texto: p.titulo }),
        el('p', { clase: 'paso__detalle', texto: p.detalle }),
      ]),
    ]))),
  ]);
}

function pintar() {
  if (!raiz) return;
  if (estado.cargando && !estado.datos) {
    return montar(raiz, el('p', { clase: 'cargando', texto: 'Abriendo admisión…', attrs: { role: 'status' } }));
  }
  if (estado.error) return montar(raiz, vistaDeError(estado.error));

  montar(raiz, el('div', { clase: 'admision' }, [
    el('header', { clase: 'admision-cabecera' }, [
      el('p', { clase: 'rotulo', texto: `Convocatoria ${estado.datos.proceso}` }),
      el('h1', { clase: 'admision-cabecera__titulo', texto: 'Admisión' }),
    ]),
    // Se dice arriba y una sola vez, además del sello de cada tarjeta.
    !estado.datos.hayDatosReales && el('p', { clase: 'admision__aviso' }, [
      el('strong', { texto: 'Las fechas y los puntajes son de ejemplo. ' }),
      el('span', {
        texto: 'Todavía no hay datos verificados de la convocatoria. El reparto de puntos del examen sí es real: '
          + 'sale del temario contrastado con el prospecto.',
      }),
    ]),
    reparto(),
    cortes(),
    cronograma(),
    pasos(),
  ]));
}

async function cargar() {
  estado.cargando = true;
  estado.error = null;
  pintar();
  try {
    estado.datos = await admision();
  } catch (error) {
    estado.error = error.message;
  } finally {
    estado.cargando = false;
    pintar();
  }
}

export async function render() {
  raiz = el('div', {});
  cargar();
  return raiz;
}

export function descartar() {
  raiz = null;
  estado.datos = null;
}
