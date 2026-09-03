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
    temaId: 'identidades',
    titulo: 'Identidades trigonométricas',
    detalle: 'Las nueve identidades que aparecen en casi todo examen, con ejemplos resueltos.',
    minutos: 12,
    paginas: paginas(6),
  },
  {
    id: 'enl-trig-identidades',
    tipo: 'enlace',
    cursoId: 'trigonometria',
    temaId: 'identidades',
    titulo: 'Trigonometría — capítulo de identidades',
    detalle: 'Teoría y problemas resueltos.',
    fuente: 'Aporte de la comunidad',
    url: 'https://drive.google.com/',
    minutos: 45,
  },
  {
    id: 'res-trig-reduccion',
    tipo: 'resumen',
    cursoId: 'trigonometria',
    temaId: 'reduccion',
    titulo: 'Reducción al primer cuadrante',
    detalle: 'Cómo pasar cualquier ángulo a uno que sepas calcular.',
    minutos: 9,
    paginas: paginas(4),
  },
  {
    id: 'vid-trig-razones',
    tipo: 'video',
    cursoId: 'trigonometria',
    temaId: 'razones',
    titulo: 'Razones trigonométricas en el triángulo rectángulo',
    detalle: 'Explicación desde cero, con los triángulos notables.',
    fuente: 'Canal de Umbral',
    url: 'https://www.youtube.com/',
    minutos: 18,
  },
  {
    id: 'res-fis-cinematica',
    tipo: 'resumen',
    cursoId: 'fisica',
    temaId: 'cinematica',
    titulo: 'Movimiento rectilíneo uniformemente variado',
    detalle: 'Las cuatro fórmulas y cuándo usa cada una.',
    minutos: 10,
    paginas: paginas(5),
  },
  {
    id: 'enl-fis-problemas',
    tipo: 'enlace',
    cursoId: 'fisica',
    temaId: 'cinematica',
    titulo: 'Banco de problemas de cinemática',
    detalle: 'Ciento veinte ejercicios con solucionario.',
    fuente: 'Banco abierto de problemas',
    url: 'https://drive.google.com/',
    minutos: 60,
  },
  {
    id: 'res-geo-triangulos',
    tipo: 'resumen',
    cursoId: 'geometria',
    temaId: 'triangulos',
    titulo: 'Ángulos en el triángulo',
    detalle: 'Interiores, exteriores y la propiedad que más se usa en admisión.',
    minutos: 8,
    paginas: paginas(4),
  },
  {
    id: 'enl-alg-exponentes',
    tipo: 'enlace',
    cursoId: 'algebra',
    temaId: 'exponentes',
    titulo: 'Álgebra — teoría de exponentes',
    detalle: 'Capítulo completo con práctica dirigida.',
    fuente: 'Aporte de la comunidad',
    url: 'https://drive.google.com/',
    minutos: 40,
  },
  {
    id: 'res-qui-nomenclatura',
    tipo: 'resumen',
    cursoId: 'quimica',
    temaId: 'nomenclatura',
    titulo: 'Nomenclatura inorgánica',
    detalle: 'Óxidos, hidróxidos, ácidos y sales en una sola tabla.',
    minutos: 14,
    paginas: paginas(7),
  },
  {
    id: 'enl-len-comprension',
    tipo: 'enlace',
    cursoId: 'lenguaje',
    temaId: 'comprension',
    titulo: 'Comprensión de lectura — estrategias',
    detalle: 'Cómo atacar un texto largo con el reloj en contra.',
    fuente: 'Guía de la comunidad',
    url: 'https://drive.google.com/',
    minutos: 30,
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
export const catalogoCompleto = () => MATERIALES;

export function listarMateriales({ cursoId, busqueda }) {
  let lista = MATERIALES;
  if (cursoId) lista = lista.filter((m) => m.cursoId === cursoId);

  const termino = String(busqueda ?? '').trim().toLocaleLowerCase('es');
  if (termino) {
    lista = lista.filter((m) =>
      [m.titulo, m.detalle, m.fuente].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(termino),
    );
  }
  return lista.map(enResumen);
}

/** @param {{ id: string }} params */
export function abrirResumen({ id }) {
  const material = MATERIALES.find((m) => m.id === id && m.tipo === 'resumen');
  if (!material) throw new Error('Ese resumen no existe.');
  return material;
}

/** Cursos que tienen material, para no ofrecer filtros vacíos. */
export function cursosConMaterial() {
  return [...new Set(MATERIALES.map((m) => m.cursoId))];
}
