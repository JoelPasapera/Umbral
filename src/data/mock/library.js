/**
 * Catálogo de estudio.
 *
 * Dos decisiones de forma que arrastran consecuencias:
 *
 * 1. Cada material declara su `temaId`. Sin eso no se puede decir "esto es lo
 *    que te falta"; solo se puede listar carpetas, que es lo que hacía la
 *    versión anterior.
 *
 * 2. Los resúmenes guardan `miniatura` y `pagina` por separado. El original
 *    usaba la imagen completa también para la tira de miniaturas y descargaba
 *    seis fotos de varios megas para pintar recuadros de 56 píxeles.
 */

import { soloAdmisibles, filtrar } from '../../domain/catalogo.js';
import { LIBROS } from './libros.js';
import { EXAMENES } from './examenes.js';
import { RECURSOS_DE_CURSO } from './recursos-curso.js';

/** Marcador de posición mientras no hay imágenes reales. Pesa unos 300 bytes. */
const marcador = (n, ancho, alto, tono) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}">` +
      `<rect width="${ancho}" height="${alto}" fill="${tono}"/>` +
      `<text x="${ancho / 2}" y="${alto / 2}" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="Georgia,serif" font-size="${Math.round(alto / 6)}" fill="#8b8577">${n}</text></svg>`,
  );

const paginas = (cantidad) =>
  Array.from({ length: cantidad }, (_, i) => ({
    numero: i + 1,
    miniatura: marcador(i + 1, 56, 70, '#e3dfd4'),
    pagina: marcador(`Página ${i + 1}`, 800, 1000, '#f6f4ee'),
    alternativo: `Página ${i + 1} del resumen`,
  }));

const MATERIALES = [
  {
    id: 'res-trig-identidades',
    tipo: 'resumen',
    cursoId: 'trigonometria',
    temaId: 'tri-identidades',
    origen: 'academia',
    licencia: 'propia',
    fuente: 'Elaborado por la academia',
    titulo: 'Identidades trigonométricas',
    detalle: 'Las nueve identidades que aparecen en casi todo examen, con ejemplos resueltos.',
    minutos: 12,
    paginas: paginas(6),
  },
  {
    id: 'enl-trig-identidades',
    tipo: 'libro',
    cursoId: 'trigonometria',
    temaId: 'tri-identidades',
    origen: 'editorial',
    licencia: 'dominio-publico',
    titulo: 'Trigonometría · Plana',
    subtitulo: 'Tratado clásico de trigonometría plana y esférica',
    detalle: 'Teoría y problemas resueltos.',
    fuente: 'Plane Trigonometry, S. L. Loney (1893)',
    url: 'https://ejemplo.pe/material',
    minutos: 45,
  },
  {
    id: 'res-trig-reduccion',
    tipo: 'resumen',
    cursoId: 'trigonometria',
    temaId: 'tri-normal',
    origen: 'academia',
    licencia: 'propia',
    fuente: 'Elaborado por la academia',
    titulo: 'Reducción al primer cuadrante',
    detalle: 'Cómo pasar cualquier ángulo a uno que sepas calcular.',
    minutos: 9,
    paginas: paginas(4),
  },
  {
    id: 'vid-trig-razones',
    tipo: 'video',
    cursoId: 'trigonometria',
    temaId: 'tri-angulos',
    origen: 'academia',
    licencia: 'propia',
    titulo: 'Razones trigonométricas en el triángulo rectángulo',
    detalle: 'Explicación desde cero, con los triángulos notables.',
    fuente: 'Clase grabada de la academia',
    url: 'https://www.youtube.com/',
    minutos: 18,
  },
  {
    id: 'res-fis-cinematica',
    tipo: 'resumen',
    cursoId: 'fisica',
    temaId: 'fis-cinematica',
    origen: 'academia',
    licencia: 'propia',
    fuente: 'Elaborado por la academia',
    titulo: 'Movimiento rectilíneo uniformemente variado',
    detalle: 'Las cuatro fórmulas y cuándo usa cada una.',
    minutos: 10,
    paginas: paginas(5),
  },
  {
    id: 'enl-fis-problemas',
    tipo: 'enlace',
    cursoId: 'fisica',
    temaId: 'fis-cinematica',
    origen: 'examen',
    licencia: 'oficial',
    universidadId: 'unmsm',
    titulo: 'Banco de problemas de cinemática',
    detalle: 'Ciento veinte ejercicios con solucionario.',
    fuente: 'Examen de admisión UNMSM publicado por la universidad',
    url: 'https://ejemplo.pe/material',
    minutos: 60,
  },
  {
    id: 'res-geo-triangulos',
    tipo: 'resumen',
    cursoId: 'geometria',
    temaId: 'geo-basica',
    origen: 'academia',
    licencia: 'propia',
    fuente: 'Elaborado por la academia',
    titulo: 'Ángulos en el triángulo',
    detalle: 'Interiores, exteriores y la propiedad que más se usa en admisión.',
    minutos: 8,
    paginas: paginas(4),
  },
  {
    id: 'enl-alg-exponentes',
    tipo: 'libro',
    cursoId: 'algebra',
    temaId: 'alg-expresiones',
    origen: 'editorial',
    licencia: 'dominio-publico',
    titulo: 'Álgebra · Elementos',
    subtitulo: 'Los fundamentos del álgebra, del entero a la ecuación',
    detalle: 'Capítulo completo con práctica dirigida.',
    fuente: 'Elements of Algebra, L. Euler (1770)',
    url: 'https://ejemplo.pe/material',
    minutos: 40,
  },
  {
    id: 'res-qui-nomenclatura',
    tipo: 'resumen',
    cursoId: 'quimica',
    temaId: 'qui-nomenclatura',
    origen: 'academia',
    licencia: 'propia',
    fuente: 'Elaborado por la academia',
    titulo: 'Nomenclatura inorgánica',
    detalle: 'Óxidos, hidróxidos, ácidos y sales en una sola tabla.',
    minutos: 14,
    paginas: paginas(7),
  },
  {
    id: 'enl-len-comprension',
    tipo: 'enlace',
    cursoId: 'lenguaje',
    temaId: 'len-comprension',
    origen: 'academia',
    licencia: 'propia',
    titulo: 'Comprensión de lectura — estrategias',
    detalle: 'Cómo atacar un texto largo con el reloj en contra.',
    fuente: 'Guía de la academia',
    url: 'https://ejemplo.pe/material',
    minutos: 30,
  },
  {
    id: 'res-hm-inductivo',
    tipo: 'resumen',
    cursoId: 'habilidad-matematica',
    temaId: 'hm-cambio',
    origen: 'academia',
    licencia: 'propia',
    titulo: 'Razonamiento inductivo: del caso pequeño a la fórmula',
    detalle: 'El método que resuelve la mitad de las preguntas de habilidad matemática.',
    fuente: 'Elaborado por la academia',
    minutos: 15,
    paginas: paginas(5),
  },
  {
    id: 'enl-hm-cantidad',
    tipo: 'enlace',
    cursoId: 'habilidad-matematica',
    temaId: 'hm-cantidad',
    origen: 'examen',
    licencia: 'oficial',
    universidadId: 'unmsm',
    titulo: 'Preguntas de cantidad en los últimos exámenes',
    detalle: 'Máximos y mínimos, pesadas y cortes, tal como salieron.',
    fuente: 'Exámenes de admisión UNMSM publicados por la universidad',
    url: 'https://ejemplo.pe/examenes',
    minutos: 60,
  },
  {
    id: 'enl-unmsm-prospecto',
    tipo: 'enlace',
    cursoId: 'habilidad-matematica',
    temaId: 'hm-datos',
    origen: 'examen',
    licencia: 'oficial',
    universidadId: 'unmsm',
    titulo: 'Prospecto de admisión: temario y reglas del examen',
    detalle: 'La fuente contra la que se verifica el temario de la aplicación.',
    fuente: 'Prospecto oficial UNMSM',
    url: 'https://ejemplo.pe/prospecto',
    minutos: 40,
  },
  {
    id: 'enl-geo-euclides',
    tipo: 'libro',
    cursoId: 'geometria',
    temaId: 'geo-basica',
    origen: 'editorial',
    licencia: 'dominio-publico',
    anio: '1908',
    titulo: 'Geometría · Elementos I–IV',
    subtitulo: 'Una visión de la planimetría, desde el postulado',
    detalle: 'La geometría del examen sale casi entera de aquí.',
    fuente: 'Euclides, edición de Heath (1908), dominio público',
    url: 'https://ejemplo.pe/elementos',
    minutos: 90,
  },
];

/**
 * Las páginas viajan con el catálogo de siembra para que el panel las guarde.
 * El listado del alumno las descarta antes de enviarlas.
 */
const enResumen = ({ paginas: _p, ...resto }) => ({ ...resto, totalPaginas: _p?.length ?? 0 });

/**
 * @param {{ cursoId?: string, busqueda?: string }} params
 */
/** Catálogo completo, con páginas. Solo se usa para sembrar. */
export const catalogoCompleto = () => [...MATERIALES, ...LIBROS, ...EXAMENES, ...RECURSOS_DE_CURSO];

export function listarMateriales({ cursoId, busqueda, origen, universidadId }) {
  let lista = filtrar(soloAdmisibles(MATERIALES), { cursoId, origen, universidadId });

  const termino = String(busqueda ?? '').trim().toLocaleLowerCase('es');
  if (termino) {
    lista = lista.filter((m) =>
      [m.titulo, m.detalle, m.fuente].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(termino),
    );
  }
  return lista.map(enResumen);
}

/** @param {{ id: string }} params */
/** Cursos que tienen material, para no ofrecer filtros vacíos. */
export function cursosConMaterial() {
  return [...new Set(MATERIALES.map((m) => m.cursoId))];
}
