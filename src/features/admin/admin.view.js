/**
 * Panel de administración.
 *
 * Abre por los huecos, no por un listado. La razón es directa: en este
 * producto, un curso sin preguntas hace que el estudiante vea "todavía no
 * puedo estimar tu nivel". El panel enseña esa consecuencia antes que nada.
 */

import { el, montar } from '../../core/dom.js';
import { calcularCobertura } from '../../domain/coverage.js';
import { metaActiva } from '../../data/repositories/goal.repo.js';
import * as admin from '../../data/repositories/admin.repo.js';
import { estadoVacio } from '../../ui/components/estado.js';
import { vistaGenerar, cargarGenerar, conectarGenerar } from './generar.js';

const estado = { raiz: null, datos: null, meta: null, vista: 'huecos', error: null, ocupado: false, deshacer: null };

const ETIQUETA_ESTADO = {
  'sin-preguntas': 'Sin preguntas',
  'pocas-preguntas': 'Faltan preguntas',
  'sin-material': 'Sin material',
  completo: 'Listo',
};

const TONO = {
  'sin-preguntas': 'critico',
  'pocas-preguntas': 'medio',
  'sin-material': 'medio',
  completo: 'bueno',
};

function nombreCurso(cursoId) {
  return estado.meta?.cursos.find((c) => c.cursoId === cursoId)?.nombre ?? cursoId;
}

async function conError(accion) {
  estado.error = null;
  estado.ocupado = true;
  pintar();
  try {
    await accion();
    estado.datos = await admin.panel();
  } catch (error) {
    estado.error = error.message;
  } finally {
    estado.ocupado = false;
    pintar();
  }
}

/* ---------- Vista de huecos ---------- */

function filaHueco(curso) {
  const tono = TONO[curso.estado];
  return el('li', { clase: 'hueco' }, [
    el('div', { clase: 'hueco__principal' }, [
      el('span', { clase: 'hueco__curso', texto: curso.nombre }),
      el('span', {
        clase: 'hueco__detalle',
        texto: `${curso.preguntas} preguntas · ${curso.materiales} materiales · pesa ${curso.peso}% del examen`,
      }),
    ]),
    el('span', { clase: `hueco__estado hueco__estado--${tono}`, texto: ETIQUETA_ESTADO[curso.estado] }),
  ]);
}

function vistaHuecos() {
  const cobertura = calcularCobertura(estado.meta, estado.datos.preguntas, estado.datos.materiales);
  const porcentaje = Math.round((cobertura.pesoSinMedir / cobertura.pesoTotal) * 100);

  const bloques = [
    el('section', { clase: 'consecuencia' }, [
      el('p', { clase: 'consecuencia__cifra', texto: `${porcentaje}%` }),
      el('p', {
        clase: 'consecuencia__texto',
        texto:
          porcentaje > 0
            ? 'del examen no se puede medir con el contenido actual. Los alumnos verán ese porcentaje como "sin datos" en su preparación.'
            : 'Todos los cursos tienen preguntas suficientes para diagnosticar.',
      }),
    ]),
    el('h2', { clase: 'admin__titulo', texto: 'Cobertura por curso' }),
    el('ul', { clase: 'huecos' }, cobertura.cursos.map(filaHueco)),
  ];

  if (cobertura.temasHuerfanos.length) {
    bloques.push(
      el('h2', { clase: 'admin__titulo', texto: 'Temas sin dónde estudiar' }),
      el('p', {
        clase: 'admin__nota',
        texto:
          'Tienen preguntas pero ningún material. El alumno falla, ve la explicación y no puede profundizar.',
      }),
      el(
        'ul',
        { clase: 'huerfanos' },
        cobertura.temasHuerfanos.map((t) =>
          el('li', { clase: 'huerfano' }, [
            el('span', { texto: `${nombreCurso(t.cursoId)} · ${t.temaId}` }),
            el('span', { clase: 'huerfano__conteo', texto: `${t.preguntas} preguntas` }),
          ]),
        ),
      ),
    );
  }

  return bloques;
}

/* ---------- Vista de catálogo ---------- */

function filaItem(item) {
  const nombre = item.titulo ?? item.enunciado;
  return el('li', { clase: 'item' }, [
    el('div', { clase: 'item__principal' }, [
      el('span', {
        clase: `item__marca item__marca--${item.publicado ? 'vivo' : 'borrador'}`,
        texto: item.publicado ? 'Publicado' : 'Borrador',
      }),
      el('span', { clase: 'item__nombre', texto: nombre }),
      el('span', {
        clase: 'item__meta',
        texto: `${nombreCurso(item.cursoId)} · ${item.temaId}`,
      }),
    ]),
    el('div', { clase: 'item__acciones' }, [
      el('button', {
        clase: 'enlace',
        type: 'button',
        texto: item.publicado ? 'Ocultar' : 'Publicar',
        on: { click: () => conError(() => admin.publicar(item.id, !item.publicado)) },
      }),
      el('button', {
        clase: 'enlace enlace--peligro',
        type: 'button',
        texto: 'Archivar',
        on: {
          click: () =>
            conError(async () => {
              await admin.archivar(item.id);
              // Criterio 6.3: deshacer antes que confirmar. Un aviso que se lee
              // protege más que un cuadro de confirmación que se acepta sin leer.
              estado.deshacer = { id: item.id, nombre };
            }),
        },
      }),
    ]),
  ]);
}

function vistaCatalogo() {
  const todo = [...estado.datos.preguntas, ...estado.datos.materiales];
  if (!todo.length) {
    return [
      estadoVacio({
        titulo: 'El catálogo está vacío',
        cuerpo: 'Empieza por los cursos marcados en rojo en la pestaña "Qué falta".',
        principal: false,
      }),
    ];
  }
  return [
    el('h2', { clase: 'admin__titulo', texto: `Catálogo (${todo.length})` }),
    estado.datos.archivados > 0 &&
      el('p', {
        clase: 'admin__nota',
        texto: `${estado.datos.archivados} elementos archivados. Nada se borra: archivar se puede deshacer.`,
      }),
    el('ul', { clase: 'items' }, todo.map(filaItem)),
  ];
}

/* ---------- Vista de registro ---------- */

function vistaRegistro() {
  if (!estado.datos.registro.length) {
    return [el('p', { clase: 'admin__nota', texto: 'Todavía no hay cambios registrados.' })];
  }
  return [
    el('h2', { clase: 'admin__titulo', texto: 'Quién cambió qué' }),
    el(
      'ul',
      { clase: 'registro' },
      estado.datos.registro.map((r) =>
        el('li', { clase: 'registro__linea' }, [
          el('span', { clase: 'registro__quien', texto: r.quien }),
          el('span', { texto: `${r.accion}: ${r.detalle}` }),
          el('span', {
            clase: 'registro__cuando',
            texto: new Date(r.cuando).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }),
          }),
        ]),
      ),
    ),
  ];
}

const VISTAS = {
  huecos: vistaHuecos,
  generar: () => vistaGenerar(estado.meta?.cursos ?? []),
  catalogo: vistaCatalogo,
  registro: vistaRegistro,
};
const PESTANAS = [
  ['huecos', 'Qué falta'],
  ['generar', 'Generar'],
  ['catalogo', 'Catálogo'],
  ['registro', 'Cambios'],
];

function barraDeshacer() {
  if (!estado.deshacer) return null;
  const { id, nombre } = estado.deshacer;
  return el('div', { clase: 'deshacer', attrs: { role: 'status' } }, [
    el('span', { clase: 'deshacer__texto', texto: `Archivado: ${nombre}` }),
    el('button', {
      clase: 'deshacer__accion',
      type: 'button',
      texto: 'Deshacer',
      on: {
        click: () =>
          conError(async () => {
            await admin.restaurar(id);
            estado.deshacer = null;
          }),
      },
    }),
    el('button', {
      clase: 'deshacer__cerrar',
      type: 'button',
      texto: 'Descartar aviso',
      attrs: { 'aria-label': 'Descartar aviso' },
      on: { click: () => { estado.deshacer = null; pintar(); } },
    }),
  ]);
}

function pintar() {
  const navegacion = el(
    'nav',
    { clase: 'admin__pestanas', attrs: { 'aria-label': 'Secciones del panel' } },
    PESTANAS.map(([id, texto]) =>
      el('button', {
        clase: ['admin__pestana', estado.vista === id && 'admin__pestana--activa'],
        type: 'button',
        texto,
        attrs: { 'aria-current': estado.vista === id ? 'page' : null },
        on: {
          click: async () => {
            estado.vista = id;
            if (id === 'generar') await cargarGenerar().catch(() => {});
            pintar();
          },
        },
      }),
    ),
  );

  montar(
    estado.raiz,
    el('div', { clase: 'admin envoltura' }, [
      el('header', { clase: 'admin__cabecera' }, [
        el('h1', { clase: 'admin__h1', texto: 'Panel de contenido' }),
        el('p', { clase: 'admin__sub', texto: estado.datos?.academia ?? '' }),
      ]),
      navegacion,
      estado.error &&
        el('p', { clase: 'mensaje mensaje--error', texto: estado.error, attrs: { role: 'alert' } }),
      estado.ocupado && el('p', { clase: 'admin__nota', texto: 'Guardando…' }),
      barraDeshacer(),
      ...VISTAS[estado.vista](),
    ]),
  );
}

export async function render() {
  estado.raiz = el('div');
  estado.vista = 'huecos';
  estado.error = null;

  conectarGenerar(pintar);
  try {
    [estado.meta, estado.datos] = await Promise.all([metaActiva(), admin.panel()]);
    await cargarGenerar();
  } catch (error) {
    montar(
      estado.raiz,
      estadoVacio({
        titulo: 'No puedes abrir este panel',
        cuerpo: error.message,
        accion: { texto: 'Volver a mi meta', href: '#/meta' },
      }),
    );
    return estado.raiz;
  }

  pintar();
  return estado.raiz;
}
