/**
 * Fichas de libros por curso.
 *
 * Contenido, no maquinaria. Son fichas de catálogo: dicen qué libro es, de qué
 * curso y en qué tomo. Nombrar un libro en un catálogo es lo que hace cualquier
 * biblioteca del mundo y no tiene ningún problema.
 *
 * **Ninguna trae `url`, y la licencia está sin resolver a propósito.** Mientras
 * eso siga así, `domain/catalogo.js` no las enseña a ningún alumno y aparecen
 * en el panel del profesor como lo que son: gestiones pendientes. Se resuelve
 * de una de estas tres formas, por ficha:
 *
 *   1. La editorial concede una licencia digital al centro. Entonces la ficha
 *      pasa a `licencia: 'permiso'` con la referencia del contrato archivado, y
 *      el archivo se aloja donde lo controle la academia, no en un Drive
 *      personal.
 *   2. Se sustituye por una obra equivalente en dominio público, y la ficha
 *      pasa a `licencia: 'dominio-publico'` con el año.
 *   3. Se sustituye por material escrito por los profesores de la academia, y
 *      pasa a `licencia: 'propia'`.
 *
 * Lo que no es una opción es dejar la licencia en blanco y poner el enlace
 * igual. Un enlace a una carpeta compartida con el escaneo de un tomo es
 * distribuirlo, y la academia responde por ello, no quien lo subió.
 *
 * Los cursos son los siete de ciencias. Habilidad matemática está aunque el
 * listado de partida no la traía: son 10 preguntas de 90 en las cuatro áreas,
 * el curso que más pesa del examen entero.
 */

/** @type {{cursoId:string, titulo:string, subtitulo:string}[]} */
const FICHAS = [
  { cursoId: 'fisica', titulo: 'Física · Tomo I', subtitulo: 'Una visión analítica del movimiento' },
  { cursoId: 'fisica', titulo: 'Física · Tomo II', subtitulo: 'Una visión analítica del movimiento' },
  { cursoId: 'fisica', titulo: 'Física · Tomo III', subtitulo: 'Una visión analítica del movimiento' },
  { cursoId: 'fisica', titulo: 'Problemas resueltos · Vol. I', subtitulo: 'Problemas resueltos de Física' },
  { cursoId: 'fisica', titulo: 'Problemas resueltos · Vol. II', subtitulo: 'Problemas resueltos de Física' },

  { cursoId: 'quimica', titulo: 'Química · Tomo I', subtitulo: 'Análisis de principios y aplicaciones' },
  { cursoId: 'quimica', titulo: 'Química · Tomo II', subtitulo: 'Análisis de principios y aplicaciones' },
  { cursoId: 'quimica', titulo: 'Problemas resueltos · Vol. I', subtitulo: 'Problemas resueltos de Química' },
  { cursoId: 'quimica', titulo: 'Problemas resueltos · Vol. II', subtitulo: 'Problemas resueltos de Química' },

  { cursoId: 'algebra', titulo: 'Álgebra · Tomo I', subtitulo: 'Álgebra y principios del análisis' },
  { cursoId: 'algebra', titulo: 'Álgebra · Tomo II', subtitulo: 'Álgebra y principios del análisis' },
  { cursoId: 'algebra', titulo: 'Problemas resueltos · Tomo I', subtitulo: 'Problemas resueltos de Álgebra' },
  { cursoId: 'algebra', titulo: 'Problemas resueltos · Tomo II', subtitulo: 'Problemas resueltos de Álgebra' },

  { cursoId: 'aritmetica', titulo: 'Aritmética · Libro I', subtitulo: 'Análisis del número y sus aplicaciones' },
  { cursoId: 'aritmetica', titulo: 'Solucionario · Libro I', subtitulo: 'Problemas resueltos de Aritmética' },

  { cursoId: 'geometria', titulo: 'Geometría · Tomo I', subtitulo: 'Una visión de la planimetría' },
  { cursoId: 'geometria', titulo: 'Geometría · Tomo II', subtitulo: 'Una visión de la estereometría' },
  { cursoId: 'geometria', titulo: 'Problemas resueltos · Tomo I', subtitulo: 'Problemas resueltos de Geometría' },
  { cursoId: 'geometria', titulo: 'Problemas resueltos · Tomo II', subtitulo: 'Problemas resueltos de Geometría' },

  { cursoId: 'trigonometria', titulo: 'Trigonometría · Libro I', subtitulo: 'Plana y esférica e introducción al cálculo' },
  { cursoId: 'trigonometria', titulo: 'Problemas resueltos · Libro I', subtitulo: 'Problemas resueltos de Trigonometría' },
];

const identificador = (ficha, indice) =>
  `lib-${ficha.cursoId}-${String(indice + 1).padStart(2, '0')}`;

/**
 * Las fichas listas para sembrar.
 *
 * `licencia` va vacía y no es un olvido: es el estado real de cada una y el
 * único campo que falta para que el libro llegue al alumno.
 */
export const LIBROS = FICHAS.map((ficha, i) => ({
  id: identificador(ficha, i),
  tipo: 'libro',
  cursoId: ficha.cursoId,
  temaId: null,
  origen: 'editorial',
  licencia: '',
  fuente: '',
  titulo: ficha.titulo,
  subtitulo: ficha.subtitulo,
  url: null,
}));
