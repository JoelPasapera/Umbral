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
import { admision, metaActiva } from '../../data/repositories/goal.repo.js';
import { intentos } from '../../data/repositories/practice.repo.js';
import { calcularPreparacion } from '../../domain/readiness.js';
import { vistaDeError } from '../../ui/components/estado.js';

const estado = {
  datos: null,
  preparacion: null,
  // Abierta de entrada la del reparto, que es donde están las barras y lo que
  // la persona viene a mirar. Las demás se despliegan al pulsarlas.
  abiertas: new Set(['reparto']),
  cargando: true,
  error: null,
};
let raiz = null;

const DIA = 86_400_000;

const pct = (f) => `${Math.round(f * 100)}%`;

const fechaLarga = (marca) => new Date(marca).toLocaleDateString('es-PE', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});

const fechaCorta = (marca) => new Date(marca).toLocaleDateString('es-PE', {
  day: 'numeric', month: 'short', timeZone: 'UTC',
});

/**
 * Marca de procedencia.
 *
 * Va pegada al dato y no en una nota al pie. Una advertencia que hay que ir a
 * buscar no la lee nadie, y el problema de un corte de ejemplo es justo que
 * parece de verdad.
 */
const SELLOS = {
  oficial: { clase: 'sello--firme', texto: 'Dato oficial' },
  estimado: { clase: 'sello--tibio', texto: 'Sin contrastar' },
  falta: { clase: 'sello--ejemplo', texto: 'Todavía no lo tenemos' },
};

const sello = (estadoDato, fuente = null) => {
  const s = SELLOS[estadoDato] ?? SELLOS.falta;
  const marca = el('span', { clase: ['sello', s.clase], texto: s.texto });
  if (!fuente) return marca;
  // La fuente va pegada al sello: un dato que dice ser oficial y no enseña de
  // dónde sale es exactamente igual de creíble que uno inventado.
  return el('span', { clase: 'sello-con-fuente' }, [
    marca,
    el('a', { clase: 'enlace sello__fuente', texto: 'Ver fuente ↗', attrs: { href: fuente, target: '_blank', rel: 'noopener noreferrer' } }),
  ]);
};

/**
 * Una sección plegable.
 *
 * La cabecera es un botón de verdad y no un `div` con un `click`: así se llega
 * con el tabulador, se activa con la barra espaciadora y un lector de pantalla
 * anuncia si está abierta o cerrada. `aria-expanded` es lo que lo dice.
 */
function plegable(clave, titulo, marca, contenido) {
  const abierta = estado.abiertas.has(clave);
  return el('section', { clase: ['admision__bloque', abierta && 'admision__bloque--abierta'] }, [
    el('button', {
      clase: 'plegable__cabecera',
      type: 'button',
      attrs: { 'aria-expanded': abierta ? 'true' : 'false' },
      on: {
        click: () => {
          if (abierta) estado.abiertas.delete(clave);
          else estado.abiertas.add(clave);
          pintar();
        },
      },
    }, [
      el('span', { clase: 'plegable__flecha', texto: abierta ? '▾' : '▸', attrs: { 'aria-hidden': 'true' } }),
      el('span', { clase: 'rotulo plegable__titulo', texto: titulo }),
      marca,
    ]),
    abierta && el('div', { clase: 'plegable__cuerpo' }, contenido()),
  ]);
}

/** Cuándo es el examen, cuánto falta y cuándo se inscribe uno. */
function cronograma() {
  const c = estado.datos.cronograma;
  const area = estado.datos.reparto.area;
  const ahora = Date.now();

  const laTuya = c.jornadas.find((j) => j.areas.includes(area));
  const dias = laTuya ? Math.ceil((laTuya.fecha - ahora) / DIA) : null;

  return [
    laTuya && el('div', { clase: 'cuenta-atras' }, [
      el('p', { clase: 'cuenta-atras__cifra' }, [
        el('strong', { texto: String(Math.max(0, dias)) }),
        el('span', { clase: 'cuenta-atras__unidad', texto: dias === 1 ? ' día' : ' días' }),
      ]),
      el('p', {
        clase: 'cuenta-atras__nota',
        texto: dias > 0
          ? `Tu área rinde el ${fechaLarga(laTuya.fecha)}.`
          : `Tu jornada era el ${fechaLarga(laTuya.fecha)}. Revisa la convocatoria vigente.`,
      }),
    ]),

    el('ul', { clase: 'jornadas' }, c.jornadas.map((j) => el('li', {
      clase: ['jornada', j.areas.includes(area) && 'jornada--tuya'],
    }, [
      el('div', {}, [
        el('span', { clase: 'jornada__fecha', texto: fechaLarga(j.fecha) }),
        j.detalle && el('p', { clase: 'jornada__detalle', texto: j.detalle }),
      ]),
      el('span', { clase: 'jornada__areas', texto: `Área ${j.areas.join(' y ')}` }),
    ]))),

    // La inscripción va aquí y no en los pasos porque tiene fecha propia y es
    // lo único de esta pantalla que se puede perder por no mirarla a tiempo.
    el('h3', { clase: 'admision__subtitulo', texto: 'Hasta cuándo puedes inscribirte' }),
    el('p', {
      clase: 'admision__destacado',
      texto: 'El plazo depende de la letra inicial de tu primer apellido. Fuera de él no hay excepción.',
    }),
    el('ul', { clase: 'plazos' }, c.inscripcion.map((i) => el('li', {
      clase: ['plazo', i.abierto && 'plazo--abierto', i.cerrado && 'plazo--cerrado'],
    }, [
      el('span', { clase: 'plazo__letras', texto: i.letras }),
      el('span', { clase: 'plazo__fechas', texto: `${fechaCorta(i.desde)} — ${fechaCorta(i.hasta)}` }),
      el('span', {
        clase: 'plazo__estado',
        texto: i.abierto ? 'Abierto ahora' : (i.cerrado ? 'Cerrado' : 'Aún no abre'),
      }),
    ]))),
  ];
}

/**
 * Cómo se reparten los puntos y cuánto de cada curso tienes asegurado.
 *
 * Dos capas en la misma barra, y esa es la idea entera:
 *
 *   · la capa clara mide **cuánto vale el curso** en tu examen;
 *   · la capa sólida mide **cuánto de eso llevas** según tu práctica.
 *
 * Así el hueco entre las dos es, literalmente, los puntos que estás dejando
 * sobre la mesa. Un curso pequeño que dominas deja poco hueco; uno grande a
 * medias deja mucho, aunque tu porcentaje en él sea mejor. Eso es lo que
 * decide dónde conviene poner las horas, y no se ve mirando porcentajes
 * sueltos.
 *
 * Un curso sin evidencia suficiente **no se pinta a 0%**. `readiness.js`
 * devuelve `null` en ese caso a propósito, y pintarlo vacío diría que no sabes
 * nada cuando lo que pasa es que no lo hemos medido. Se dice "sin datos".
 */
function reparto() {
  const r = estado.datos.reparto;
  const mayor = r.cursos[0]?.puntos || 1;

  const dominios = new Map();
  for (const c of estado.preparacion?.cursos ?? []) dominios.set(c.cursoId, c.dominio);

  const medidos = r.cursos.filter((c) => dominios.has(c.cursoId));
  const asegurados = medidos.reduce((s, c) => s + (c.puntos * dominios.get(c.cursoId).valor) / 100, 0);
  const enJuego = medidos.reduce((s, c) => s + c.puntos, 0);

  return [
    el('p', { clase: 'admision__destacado' }, [
      el('strong', { texto: `${r.preguntas} preguntas · ${r.puntos} puntos · área ${r.area}. ` }),
      el('span', { texto: `Cada pregunta vale ${r.porPregunta} puntos, valga el curso que valga.` }),
    ]),

    medidos.length > 0 && el('div', { clase: 'asegurado' }, [
      el('p', { clase: 'asegurado__cifra' }, [
        el('strong', { texto: String(Math.round(asegurados)) }),
        el('span', { clase: 'asegurado__unidad', texto: ` de ${enJuego} puntos` }),
      ]),
      el('p', {
        clase: 'asegurado__nota',
        // No se suman los cursos sin medir: hacerlo daría un número más alto y
        // más falso. Se dice cuántos quedan fuera y por qué.
        texto: medidos.length === r.cursos.length
          ? 'Es lo que tu práctica dice que tienes asegurado hoy.'
          : `Contando solo los ${medidos.length} cursos de ${r.cursos.length} donde ya hay práctica suficiente `
            + 'para estimar. Los demás no se suman: no se han medido.',
      }),
    ]),

    el('ul', { clase: 'reparto' }, r.cursos.map((c) => {
      const dominio = dominios.get(c.cursoId);
      const anchoExamen = Math.round((c.puntos / mayor) * 1000) / 10;

      return el('li', { clase: ['reparto__fila', !dominio && 'reparto__fila--sinDatos'] }, [
        el('span', { clase: 'reparto__curso', texto: c.nombre }),
        // `el` no admite `style` como propiedad: va por `attrs`. Puesto como
        // propiedad se ignora en silencio y todas las barras salen iguales.
        el('span', { clase: 'reparto__barra' }, [
          el('span', { clase: 'reparto__jugo', attrs: { style: `width:${anchoExamen}%` } }, [
            dominio && el('span', {
              clase: 'reparto__dominio',
              attrs: { style: `width:${Math.round(dominio.valor)}%` },
            }),
          ]),
        ]),
        el('span', {
          clase: ['reparto__tuyo', !dominio && 'reparto__tuyo--sinDatos'],
          texto: dominio ? `${Math.round(dominio.valor)}%` : 'sin datos',
        }),
        el('span', { clase: 'reparto__puntos', texto: `${c.puntos} pts` }),
      ]);
    })),

    el('p', { clase: 'reparto__leyenda' }, [
      el('span', { clase: 'reparto__muestra reparto__muestra--jugo' }),
      el('span', { texto: 'lo que vale el curso   ' }),
      el('span', { clase: 'reparto__muestra reparto__muestra--dominio' }),
      el('span', { texto: 'lo que llevas asegurado' }),
    ]),
  ];
}

/**
 * Los cortes y las cifras del proceso.
 *
 * Aquí se dice lo que no se sabe. Circulan listas de puntajes en blogs, pero
 * mezclan convocatorias y no se pueden contrastar; ponerlas sería darle a un
 * postulante una cifra falsa sobre la que va a calcular cuánto le falta, y ese
 * cálculo es de lo que vive Umbral.
 */
function cifras() {
  const { cortes, cifras: delProceso } = estado.datos;

  return [
    el('ul', { clase: 'cifras' }, (delProceso ?? []).map((c) => el('li', { clase: 'cifra' }, [
      el('p', { clase: 'cifra__etiqueta', texto: c.etiqueta }),
      el('p', { clase: 'cifra__valor', texto: c.valor }),
      el('p', { clase: 'cifra__detalle', texto: c.detalle }),
      sello(c.estado, c.fuente),
    ]))),

    // Con el acta confirmada se pintan los cortes; sin ella, el hueco. La
    // pantalla nunca inventa la cifra intermedia.
    cortes?.estado === 'oficial' && el('ul', { clase: 'cortes' }, cortes.filas.map((c) => el('li', { clase: 'corte' }, [
      el('span', { clase: 'corte__carrera', texto: c.carrera }),
      el('span', { clase: 'corte__dato', texto: `${c.corte} pts` }),
      el('span', { clase: 'corte__dato corte__dato--suave', texto: `${c.vacantes} vacantes` }),
      el('span', { clase: 'corte__dato corte__dato--suave', texto: `${c.porVacante} por vacante` }),
    ]))),

    cortes?.estado === 'falta' && el('div', { clase: 'hueco' }, [
      el('div', { clase: 'admision__titular' }, [
        el('h3', { clase: 'hueco__titulo', texto: 'El puntaje de corte de tu carrera' }),
        sello('falta'),
      ]),
      el('p', { clase: 'hueco__motivo', texto: cortes.motivo }),
      el('a', {
        clase: 'boton boton--secundario',
        texto: `${cortes.dondeEtiqueta} ↗`,
        attrs: { href: cortes.donde, target: '_blank', rel: 'noopener noreferrer' },
      }),
    ]),
  ];
}

/** Los trámites, que es donde se cae la gente por un papel. */
function pasos() {
  return [
    el('ol', { clase: 'pasos' }, estado.datos.pasos.map((p, i) => el('li', { clase: 'paso' }, [
      el('span', { clase: 'paso__numero', texto: String(i + 1) }),
      el('div', {}, [
        el('p', { clase: 'paso__titulo', texto: p.titulo }),
        el('p', { clase: 'paso__detalle', texto: p.detalle }),
      ]),
    ]))),
  ];
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
    el('p', {
      clase: 'admision-cabecera__nota',
      texto: 'Cada dato dice de dónde sale y enlaza a su fuente. Lo que todavía no tenemos aparece '
        + 'declarado como hueco, no rellenado con una cifra aproximada.',
    }),
    plegable('cronograma', 'Cuándo es', sello(estado.datos.cronograma.estado, estado.datos.cronograma.fuente), cronograma),
    plegable('reparto', 'A qué te enfrentas', sello(estado.datos.reparto.estado, estado.datos.reparto.fuente), reparto),
    plegable('cifras', 'Contra qué compites', sello(estado.datos.cortes.estado), cifras),
    plegable('pasos', 'Qué pasos siguen', null, pasos),
  ]));
}

async function cargar() {
  estado.cargando = true;
  estado.error = null;
  pintar();
  try {
    // La preparación se calcula aquí con el mismo `calcularPreparacion` que usa
    // la pantalla de meta. Recalcularla con otra fórmula daría dos números
    // distintos para lo mismo, y el alumno no sabría a cuál creer.
    const [datos, meta, historial] = await Promise.all([
      admision(),
      metaActiva().catch(() => null),
      intentos().catch(() => []),
    ]);
    estado.datos = datos;
    estado.preparacion = meta ? calcularPreparacion(historial, meta, Date.now()) : null;
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
