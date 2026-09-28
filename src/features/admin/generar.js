/**
 * Generar preguntas desde el material de la academia.
 *
 * La pantalla está organizada alrededor de una idea: el tiempo del profesor es
 * el recurso caro. Por eso lo descartado automáticamente se muestra plegado y
 * en pequeño —solo para que sepa que la puerta trabajó— y lo que llega a
 * revisión aparece con el aviso concreto de dónde mirar, no con un genérico
 * "revisa esto".
 */

import { el } from '../../core/dom.js';
import * as ia from '../../data/repositories/ai.repo.js';

const estado = {
  material: '',
  cursoId: '',
  temaId: '',
  generando: false,
  error: null,
  ultimo: null,
  borradores: [],
  presupuesto: null,
  editando: null,
};

let repintar = () => {};

/** @param {() => void} fn */
export function conectarGenerar(fn) {
  repintar = fn;
}

export async function cargarGenerar() {
  const [cola, presupuesto] = await Promise.all([ia.borradores(), ia.presupuesto()]);
  estado.borradores = cola.borradores;
  estado.presupuesto = presupuesto;
}

async function generar() {
  estado.error = null;
  estado.generando = true;
  repintar();
  try {
    estado.ultimo = await ia.generar({
      material: estado.material,
      cursoId: estado.cursoId,
      temaId: estado.temaId,
    });
    estado.presupuesto = estado.ultimo.presupuesto;
    await cargarGenerar();
  } catch (error) {
    estado.error = error.message;
  } finally {
    estado.generando = false;
    repintar();
  }
}

async function decidir(id, decision, cambios) {
  estado.error = null;
  try {
    await ia.decidir(id, decision, cambios);
    estado.editando = null;
    await cargarGenerar();
  } catch (error) {
    estado.error = error.message;
  }
  repintar();
}

function medidor() {
  const p = estado.presupuesto;
  if (!p) return null;
  const usado = Math.round((p.usado / p.tope) * 100);
  return el('div', { clase: 'medidor' }, [
    el('div', { clase: 'medidor__fila' }, [
      el('span', { clase: 'medidor__texto', texto: 'Presupuesto de generación este mes' }),
      el('span', { clase: 'medidor__cifra', texto: `${p.restante} de ${p.tope}` }),
    ]),
    el('div', { clase: 'medidor__pista', attrs: { 'aria-hidden': 'true' } }, [
      el('div', { clase: 'medidor__usado', attrs: { style: `width:${usado}%` } }),
    ]),
    el('p', {
      clase: 'medidor__nota',
      texto: p.lotes > 0
        ? `Te alcanza para ${p.lotes} tandas más. Se renueva el día 1.`
        : 'Se agotó. Se renueva el día 1; mientras tanto puedes revisar lo que ya está en cola.',
    }),
  ]);
}

function formulario(cursos) {
  const area = el('textarea', {
    clase: 'generar__area',
    id: 'material',
    value: estado.material,
    attrs: {
      rows: 7,
      placeholder: 'Pega aquí el texto de tu boletín, separata o examen anterior.',
    },
    on: { input: (e) => { estado.material = e.target.value; } },
  });

  const curso = el('select', {
    clase: 'generar__control',
    id: 'curso-gen',
    on: { change: (e) => { estado.cursoId = e.target.value; } },
  }, [
    el('option', { value: '', texto: 'Elige el curso' }),
    ...cursos.map((c) => el('option', { value: c.cursoId, texto: c.nombre })),
  ]);
  curso.value = estado.cursoId;

  const tema = el('input', {
    clase: 'generar__control',
    id: 'tema-gen',
    value: estado.temaId,
    attrs: { placeholder: 'Tema, por ejemplo: identidades', maxlength: 60 },
    on: { input: (e) => { estado.temaId = e.target.value; } },
  });

  const sinCredito = estado.presupuesto && estado.presupuesto.lotes < 1;

  return el('section', { clase: 'generar' }, [
    el('h2', { clase: 'admin__titulo', texto: 'Generar preguntas desde tu material' }),
    el('p', {
      clase: 'admin__nota',
      texto:
        'Se redactan borradores a partir del texto que pegues. Nada se publica sin que tú lo apruebes, y todo queda marcado como generado.',
    }),
    el('label', { clase: 'campo__etiqueta', texto: 'Material', attrs: { for: 'material' } }),
    area,
    el('div', { clase: 'generar__fila' }, [
      el('label', { clase: 'solo-lectores', texto: 'Curso', attrs: { for: 'curso-gen' } }),
      curso,
      el('label', { clase: 'solo-lectores', texto: 'Tema', attrs: { for: 'tema-gen' } }),
      tema,
      el('button', {
        clase: 'boton',
        type: 'button',
        texto: estado.generando ? 'Redactando…' : 'Generar borradores',
        attrs: { disabled: estado.generando || sinCredito },
        on: { click: generar },
      }),
    ]),
    medidor(),
  ]);
}

function resumenUltimo() {
  if (!estado.ultimo) return null;
  const { resumen, descartadas } = estado.ultimo;

  return el('section', { clase: 'lote' }, [
    el('p', { clase: 'lote__titulo' }, [
      el('strong', { texto: `${resumen.aceptadas} a revisión` }),
      document.createTextNode(
        ` · ${resumen.rechazadas} descartadas por la validación · ${resumen.duplicadas} repetidas dentro de la tanda`,
      ),
    ]),
    descartadas.length &&
      el('details', { clase: 'lote__detalle' }, [
        el('summary', { texto: 'Ver qué se descartó y por qué' }),
        el('ul', { clase: 'lote__lista' }, descartadas.map((d) =>
          el('li', {}, [
            el('span', { clase: 'lote__enunciado', texto: d.enunciado }),
            el('span', { clase: 'lote__motivo', texto: d.motivos.join(' · ') }),
          ]),
        )),
      ]),
  ]);
}

function borrador(b) {
  const editando = estado.editando === b.id;

  const avisos = b.avisos.length
    ? el('ul', { clase: 'borrador__avisos' }, b.avisos.map((a) =>
        el('li', { texto: a.mensaje })))
    : null;

  const opciones = el('ol', { clase: 'borrador__opciones' }, b.opciones.map((o, i) =>
    el('li', { clase: i === b.correcta ? 'borrador__opcion--correcta' : '', texto: o })));

  const cuerpo = [
    el('p', { clase: 'borrador__enunciado', texto: b.enunciado }),
    opciones,
    el('p', { clase: 'borrador__explicacion', texto: b.explicacion }),
    el('p', {
      clase: 'borrador__meta',
      texto: `${b.cursoId} · ${b.temaId} · dificultad estimada ${b.dificultad}`,
    }),
  ];

  if (editando) {
    const campo = el('textarea', {
      clase: 'generar__area',
      value: b.explicacion,
      attrs: { rows: 4, 'aria-label': 'Explicación' },
    });
    cuerpo.push(
      el('div', { clase: 'borrador__editar' }, [
        el('p', { clase: 'campo__etiqueta', texto: 'Corrige la explicación antes de aprobar' }),
        campo,
        el('button', {
          clase: 'boton',
          type: 'button',
          texto: 'Guardar y aprobar',
          on: { click: () => decidir(b.id, 'aprobar', { explicacion: campo.value }) },
        }),
      ]),
    );
  }

  return el('li', { clase: ['borrador', b.avisos.length && 'borrador--avisado'] }, [
    avisos,
    ...cuerpo,
    !editando &&
      el('div', { clase: 'borrador__acciones' }, [
        el('button', {
          clase: 'boton',
          type: 'button',
          texto: 'Aprobar',
          on: { click: () => decidir(b.id, 'aprobar') },
        }),
        el('button', {
          clase: 'boton boton--secundario',
          type: 'button',
          texto: 'Corregir explicación',
          on: { click: () => { estado.editando = b.id; repintar(); } },
        }),
        el('button', {
          clase: 'enlace enlace--peligro',
          type: 'button',
          texto: 'Descartar',
          on: { click: () => decidir(b.id, 'descartar') },
        }),
      ]),
  ]);
}

/** @param {{cursoId:string,nombre:string}[]} cursos */
export function vistaGenerar(cursos) {
  const nodos = [formulario(cursos)];

  if (estado.error) {
    nodos.push(el('p', { clase: 'mensaje mensaje--error', texto: estado.error, attrs: { role: 'alert' } }));
  }

  const resumen = resumenUltimo();
  if (resumen) nodos.push(resumen);

  if (estado.borradores.length) {
    nodos.push(
      el('h2', { clase: 'admin__titulo', texto: `Pendientes de revisar (${estado.borradores.length})` }),
      el('p', {
        clase: 'admin__nota',
        texto: 'Lo marcado en ámbar es donde conviene que mires. El resto pasó la validación sin peros.',
      }),
      el('ul', { clase: 'borradores' }, estado.borradores.map(borrador)),
    );
  }

  return nodos;
}
