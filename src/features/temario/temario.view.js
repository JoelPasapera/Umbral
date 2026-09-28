/**
 * Temario.
 *
 * Es la pantalla que le pone suelo a todo lo demás. Antes el producto decía
 * "te falta trigonometría", que no es accionable. Con el temario oficial
 * cargado puede decir "de los 13 temas de trigonometría que entran, no has
 * tocado transformaciones de suma a producto".
 *
 * El orden lo decide el examen, no el alfabeto: los cursos van por número de
 * preguntas. Un alumno que se mata con trigonometría, que en su área vale dos
 * preguntas, está gastando su tiempo mal, y esta pantalla se lo enseña.
 */

import { el, montar } from '../../core/dom.js';
import { leer } from '../../core/store.js';
import { metaActiva } from '../../data/repositories/goal.repo.js';
import { intentos } from '../../data/repositories/practice.repo.js';
import { temasDe, TEMARIO_UNMSM } from '../../data/mock/temario.js';
import { estadoVacio } from '../../ui/components/estado.js';

const estado = { raiz: null, meta: null, porTema: new Map(), abierto: null };

/** Cuántas respuestas hay de cada tema. */
function contarPorTema(historial) {
  const mapa = new Map();
  for (const intento of historial) {
    const clave = intento.temaId;
    if (!mapa.has(clave)) mapa.set(clave, { total: 0, aciertos: 0 });
    const registro = mapa.get(clave);
    registro.total += 1;
    if (intento.acerto) registro.aciertos += 1;
  }
  return mapa;
}

function pastilla(curso) {
  if (!curso.detallado) {
    return el('span', { clase: 'tema-pastilla tema-pastilla--pendiente', texto: 'Temario por cargar' });
  }
  const temas = temasDe(curso.cursoId);
  const tocados = temas.filter((t) => estado.porTema.has(t.id) || estado.porTema.has(t.bloqueId)).length;
  const clase = tocados === 0 ? 'sin' : tocados < temas.length / 2 ? 'poco' : 'bien';
  return el('span', { clase: `tema-pastilla tema-pastilla--${clase}` }, [
    el('b', { texto: String(tocados) }),
    el('span', { texto: `de ${temas.length} temas practicados` }),
  ]);
}

function bloque(b, cursoId) {
  const temas = b.temas.map((nombre, i) => {
    const id = `${b.id}-${i + 1}`;
    const registro = estado.porTema.get(id) ?? estado.porTema.get(b.id);
    const nivel = registro ? Math.round((registro.aciertos / registro.total) * 100) : null;

    return el('li', { clase: 'tema' }, [
      el('span', {
        clase: ['tema__marca', registro && (nivel >= 65 ? 'tema__marca--bien' : 'tema__marca--flojo')],
        attrs: { 'aria-hidden': 'true' },
      }),
      el('span', { clase: 'tema__nombre', texto: nombre }),
      registro
        ? el('span', { clase: 'tema__nivel', texto: `${nivel}%` })
        : el('span', { clase: 'tema__pendiente', texto: 'sin practicar' }),
    ]);
  });

  return el('section', { clase: 'bloque' }, [
    el('h3', { clase: 'bloque__titulo' }, [
      el('span', { texto: b.nombre }),
      el('span', { clase: 'bloque__conteo', texto: `${b.temas.length}` }),
    ]),
    el('ul', { clase: 'temas' }, temas),
  ]);
}

function tarjetaCurso(curso) {
  const abierto = estado.abierto === curso.cursoId;
  const temario = TEMARIO_UNMSM[curso.cursoId];

  // El nombre del curso es el encabezado de nivel dos: sin él, los bloques
  // (nivel tres) colgaban directamente del título de la página.
  const cabecera = el('button', {
    clase: ['curso-temario__cabecera', abierto && 'curso-temario__cabecera--abierta'],
    type: 'button',
    attrs: { 'aria-expanded': abierto ? 'true' : 'false', disabled: !curso.detallado },
    on: {
      click: () => {
        estado.abierto = abierto ? null : curso.cursoId;
        pintar();
      },
    },
  }, [
    el('div', { clase: 'curso-temario__grupo' }, [
      el('h2', { clase: 'curso-temario__nombre', texto: curso.nombre }),
      el('span', {
        clase: 'curso-temario__peso',
        texto: `${curso.preguntas} ${curso.preguntas === 1 ? 'pregunta' : 'preguntas'} del examen · ${curso.puntos} puntos`,
      }),
    ]),
    pastilla(curso),
  ]);

  const cuerpo = abierto && temario
    ? el('div', { clase: 'curso-temario__cuerpo' }, temario.bloques.map((b) => bloque(b, curso.cursoId)))
    : null;

  return el('article', { clase: 'curso-temario' }, [cabecera, cuerpo]);
}

function pintar() {
  const { meta } = estado;
  const conTemario = meta.cursos.filter((c) => c.detallado);
  const sinTemario = meta.cursos.filter((c) => !c.detallado);

  const nodos = [
    el('header', { clase: 'temario-cabecera' }, [
      el('p', { clase: 'rotulo', texto: `${meta.sigla} · ${meta.areaNombre}` }),
      el('h1', { clase: 'temario-cabecera__titulo', texto: 'Temario del examen' }),
      el('p', {
        clase: 'temario-cabecera__nota',
        texto:
          'Ordenado por cuántas preguntas vale cada curso en tu área, no por orden alfabético. Es la diferencia entre estudiar mucho y estudiar donde cuenta.',
      }),
    ]),
  ];

  if (!meta.pesosVerificados) {
    nodos.push(
      el('p', { clase: 'aviso-pesos' }, [
        el('strong', { texto: 'Pesos estimados. ' }),
        el('span', {
          texto:
            'El reparto de preguntas de esta área todavía no está verificado contra el prospecto publicado. Los temas sí lo están.',
        }),
      ]),
    );
  }

  nodos.push(
    el('div', { clase: 'cursos-temario' }, conTemario.map(tarjetaCurso)),
  );

  if (sinTemario.length) {
    nodos.push(
      el('section', { clase: 'pendientes' }, [
        el('h2', { clase: 'pendientes__titulo', texto: 'Cursos con el temario por cargar' }),
        el('p', {
          clase: 'pendientes__nota',
          texto: 'Cuentan en tu examen y en tu preparación, pero todavía no tienen el desglose por tema.',
        }),
        el('ul', { clase: 'pendientes__lista' }, sinTemario.map((c) =>
          el('li', {}, [
            el('span', { texto: c.nombre }),
            el('span', { clase: 'pendientes__peso', texto: `${c.preguntas} preg.` }),
          ]),
        )),
      ]),
    );
  }

  montar(estado.raiz, el('div', { clase: 'temario' }, nodos));
}

export async function render() {
  estado.raiz = el('div');
  estado.abierto = null;

  try {
    const [meta, historial] = await Promise.all([metaActiva(), intentos().catch(() => [])]);
    estado.meta = meta;
    estado.porTema = contarPorTema(historial);
  } catch (error) {
    montar(estado.raiz, estadoVacio({
      titulo: 'No se pudo cargar el temario',
      cuerpo: error.message,
      accion: { texto: 'Volver a mi meta', href: '#/meta' },
    }));
    return estado.raiz;
  }

  // El curso que más preguntas vale se abre solo: es donde hay que mirar.
  estado.abierto = estado.meta.cursos.find((c) => c.detallado)?.cursoId ?? null;
  pintar();
  return estado.raiz;
}
