/**
 * Pantalla de estudio.
 *
 * El orden no es alfabético ni por carpetas: lo dicta el diagnóstico. Si
 * fallas trigonometría, trigonometría va arriba. Para eso lee `preparacion`
 * del estado compartido, que la pantalla de meta ya calculó.
 *
 * Si alguien entra directo a esta ruta sin pasar por meta, el estado está
 * vacío y la lista cae a orden alfabético. Degradar, nunca romper.
 */

import { el, montar } from '../../core/dom.js';
import { leer } from '../../core/store.js';
import { materiales, resumen } from '../../data/repositories/library.repo.js';
import { icono } from '../../ui/components/iconos.js';
import { estadoVacio } from '../../ui/components/estado.js';

const ETIQUETA = { resumen: 'Resumen', enlace: 'Material', video: 'Video' };

const estado = { raiz: null, busqueda: '', filtro: null, visor: null };
let soltarTeclado = null;

/** Orden de cursos según lo que más puntos hace perder. */
function prioridadDeCursos() {
  const preparacion = leer().preparacion;
  if (!preparacion?.cursos?.length) return null;
  const orden = new Map();
  preparacion.cursos.forEach((curso, i) => orden.set(curso.cursoId, i));
  return { orden, nivel: new Map(preparacion.cursos.map((c) => [c.cursoId, c.dominio.valor])) };
}

function nombreCurso(cursoId) {
  const meta = leer().meta;
  return meta?.cursos.find((c) => c.cursoId === cursoId)?.nombre ?? cursoId;
}

function tarjeta(material) {
  const marca = el('span', { clase: 'material__icono' }, [icono(material.tipo)]);

  const meta = [el('span', { texto: ETIQUETA[material.tipo] ?? 'Material' })];
  if (material.fuente) meta.push(el('span', { texto: material.fuente }));
  meta.push(el('span', { texto: `${material.minutos} min` }));

  const cuerpo = el('div', {}, [
    el('p', { clase: 'material__titulo', texto: material.titulo }),
    el('p', { clase: 'material__detalle', texto: material.detalle }),
    el('div', { clase: 'material__meta' }, meta),
  ]);

  const esResumen = material.tipo === 'resumen';
  const accion = el('span', {
    clase: 'material__accion',
    texto: esResumen ? `${material.totalPaginas} páginas` : 'Abrir',
  });

  const fila = esResumen
    ? el('button', { clase: 'material', type: 'button', on: { click: () => abrirVisor(material.id) } },
        [marca, cuerpo, accion])
    : el('a', {
        clase: 'material',
        attrs: { href: material.url, target: '_blank', rel: 'noopener noreferrer' },
      }, [marca, cuerpo, accion]);

  return el('li', {}, [fila]);
}

function grupo(cursoId, lista, nivel) {
  const encabezado = [el('h2', { clase: 'grupo__titulo', texto: nombreCurso(cursoId) })];
  let clase = '';

  if (typeof nivel === 'number') {
    const valor = Math.round(nivel);
    clase = valor < 40 ? 'critico' : valor < 65 ? 'medio' : 'bueno';
    encabezado.push(
      el('span', { clase: 'grupo__nivel' }, [
        el('span', { texto: 'Vas en' }),
        el('b', { texto: String(valor) }),
      ]),
    );
  }

  return el('section', { clase: ['grupo', clase && `grupo--${clase}`] }, [
    el('div', { clase: 'grupo__cabecera' }, encabezado),
    el('ul', { clase: 'materiales' }, lista.map(tarjeta)),
  ]);
}

async function pintarLista() {
  const lista = await materiales({ busqueda: estado.busqueda });
  const prioridad = prioridadDeCursos();

  const porCurso = new Map();
  for (const material of lista) {
    if (!porCurso.has(material.cursoId)) porCurso.set(material.cursoId, []);
    porCurso.get(material.cursoId).push(material);
  }

  const cursos = [...porCurso.keys()].sort((a, b) => {
    if (!prioridad) return nombreCurso(a).localeCompare(nombreCurso(b), 'es');
    const pa = prioridad.orden.has(a) ? prioridad.orden.get(a) : 999;
    const pb = prioridad.orden.has(b) ? prioridad.orden.get(b) : 999;
    return pa - pb;
  });

  const buscador = el('input', {
    clase: 'buscador',
    type: 'search',
    value: estado.busqueda,
    attrs: {
      placeholder: 'Buscar tema, libro o academia',
      'aria-label': 'Buscar material de estudio',
    },
    on: {
      input: (evento) => {
        estado.busqueda = evento.target.value;
        clearTimeout(buscador.dataset.temporizador);
        buscador.dataset.temporizador = setTimeout(pintarLista, 200);
      },
    },
  });

  const cabecera = el('header', { clase: 'estudiar-cabecera' }, [
    el('div', { clase: 'estudiar-cabecera__grupo' }, [
      el('h1', { clase: 'estudiar-cabecera__titulo', texto: 'Qué estudiar' }),
      el('p', {
        clase: 'estudiar-cabecera__nota',
        texto: prioridad
          ? 'Ordenado por los cursos donde pierdes más puntos.'
          : 'Abre tu meta primero para que ordene según tu nivel.',
      }),
    ]),
    buscador,
  ]);

  const contenido = cursos.length
    ? [el('div', { clase: 'grupos' },
        cursos.map((cursoId) => grupo(cursoId, porCurso.get(cursoId), prioridad?.nivel.get(cursoId))))]
    : [
        estadoVacio({
          titulo: 'Nada coincide con esa búsqueda',
          cuerpo: 'Prueba con el nombre del tema, del curso o de la fuente.',
          principal: false,
        }),
      ];

  montar(estado.raiz, el('div', { clase: 'estudiar envoltura' }, [cabecera, ...contenido]));

  if (document.activeElement !== buscador && estado.busqueda) {
    buscador.focus();
    buscador.setSelectionRange(estado.busqueda.length, estado.busqueda.length);
  }
}

/* ---------- Visor de resúmenes ---------- */

function pintarVisor() {
  const { material, indice } = estado.visor;
  const pagina = material.paginas[indice];

  const imagen = el('img', {
    clase: 'visor__pagina',
    attrs: {
      src: pagina.pagina,
      alt: pagina.alternativo,
      decoding: 'async',
      fetchpriority: 'high',
    },
  });

  // Adelanta la siguiente página para que el salto sea instantáneo.
  const siguiente = material.paginas[indice + 1];
  if (siguiente) new Image().src = siguiente.pagina;

  const tira = el(
    'div',
    { clase: 'visor__tira', attrs: { 'aria-label': 'Páginas' } },
    material.paginas.map((p, i) =>
      el('button', {
        clase: ['visor__mini', i === indice && 'visor__mini--activa'],
        type: 'button',
        attrs: { 'aria-label': `Ir a la página ${p.numero}`, 'aria-current': i === indice },
        on: { click: () => { estado.visor.indice = i; pintarVisor(); } },
      }, [
        el('img', { attrs: { src: p.miniatura, alt: '', loading: 'lazy', decoding: 'async' } }),
      ]),
    ),
  );

  montar(
    estado.raiz,
    el('div', { clase: 'visor envoltura' }, [
      el('div', { clase: 'visor__barra' }, [
        el('button', {
          clase: 'boton boton--secundario',
          type: 'button',
          texto: 'Volver',
          on: { click: cerrarVisor },
        }),
        el('p', { clase: 'visor__titulo', texto: material.titulo }),
      ]),
      imagen,
      el('div', { clase: 'visor__controles' }, [
        el('button', {
          clase: 'boton boton--secundario',
          type: 'button',
          texto: 'Anterior',
          attrs: { disabled: indice === 0 },
          on: { click: () => mover(-1) },
        }),
        el('p', {
          clase: 'visor__contador',
          texto: `${indice + 1} de ${material.paginas.length}`,
        }),
        el('button', {
          clase: 'boton boton--secundario',
          type: 'button',
          texto: 'Siguiente',
          attrs: { disabled: indice === material.paginas.length - 1 },
          on: { click: () => mover(1) },
        }),
      ]),
      tira,
    ]),
  );
}

function mover(paso) {
  const total = estado.visor.material.paginas.length;
  const destino = Math.min(Math.max(estado.visor.indice + paso, 0), total - 1);
  if (destino === estado.visor.indice) return;
  estado.visor.indice = destino;
  pintarVisor();
}

async function abrirVisor(id) {
  const material = await resumen(id);
  estado.visor = { material, indice: 0 };
  pintarVisor();
}

function cerrarVisor() {
  estado.visor = null;
  pintarLista();
}

function atajos(evento) {
  if (!estado.visor || evento.target.matches('input, textarea')) return;
  if (evento.key === 'ArrowLeft') mover(-1);
  if (evento.key === 'ArrowRight') mover(1);
  if (evento.key === 'Escape') cerrarVisor();
}

/** @param {{ curso?: string }} params */
export async function render(params) {
  estado.raiz = el('div');
  estado.busqueda = '';
  estado.visor = null;
  if (params.curso) estado.filtro = params.curso;

  await pintarLista();
  document.addEventListener('keydown', atajos);
  soltarTeclado = () => document.removeEventListener('keydown', atajos);
  return estado.raiz;
}

export function descartar() {
  soltarTeclado?.();
  soltarTeclado = null;
  estado.visor = null;
}
