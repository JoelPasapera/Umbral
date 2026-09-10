/**
 * Libros y materiales de cada curso.
 *
 * Los siete cursos traen el mismo juego —dos libros y tres materiales— para
 * que la sección se vea pareja y se pueda trabajar sobre ella. Es el mismo
 * andamio que las convocatorias de examen.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUÉ HAY QUE REEMPLAZAR AQUÍ
 *
 *   `url`    — todas apuntan a `ejemplo.pe`. No invento direcciones reales que
 *              no puedo comprobar; un enlace roto es peor que ninguno.
 *   `titulo` — nombres genéricos de hueco. Cuando pongas el material de verdad,
 *              ponle su nombre de verdad: "Teoría de Álgebra" no le dice a
 *              nadie qué va a encontrar dentro.
 *
 * Lo que **no** hay que hacer es dejar `licencia: 'propia'` y colgar detrás el
 * escaneo de un libro de editorial. Esa etiqueta declara que el material es de
 * la academia, y es lo que `domain/catalogo.js` comprueba para dejarlo pasar.
 * Si el material es de un tercero, la licencia correcta es `permiso` y hay que
 * decir dónde está archivado ese permiso. Las fichas de la colección de
 * editorial siguen en `libros.js`, bloqueadas hasta que se resuelva de dónde
 * salen; no son estas.
 * ────────────────────────────────────────────────────────────────────────────
 */

/** Los siete cursos que llevan estante. Ver `fixtures.js`. */
const CURSOS = [
  { id: 'habilidad-matematica', nombre: 'Habilidad matemática' },
  { id: 'aritmetica', nombre: 'Aritmética' },
  { id: 'algebra', nombre: 'Álgebra' },
  { id: 'geometria', nombre: 'Geometría' },
  { id: 'trigonometria', nombre: 'Trigonometría' },
  { id: 'fisica', nombre: 'Física' },
  { id: 'quimica', nombre: 'Química' },
];

/** Dos libros por curso. */
const LIBROS_POR_CURSO = [
  { sufijo: 'tomo-1', titulo: (c) => `Libro de ${c} · Tomo I`, subtitulo: (c) => `Teoría y problemas de ${c.toLocaleLowerCase('es')}`, minutos: 240 },
  { sufijo: 'tomo-2', titulo: (c) => `Libro de ${c} · Tomo II`, subtitulo: (c) => `Continuación del temario de ${c.toLocaleLowerCase('es')}`, minutos: 240 },
];

/** Tres materiales por curso, en el orden en que se usan al estudiar. */
const MATERIALES_POR_CURSO = [
  { sufijo: 'teoria', titulo: (c) => `Teoría de ${c}`, detalle: 'Los conceptos del temario, con ejemplos resueltos.', minutos: 30 },
  { sufijo: 'practica', titulo: (c) => `Práctica dirigida de ${c}`, detalle: 'Ejercicios para resolver después de leer la teoría.', minutos: 45 },
  { sufijo: 'solucionario', titulo: (c) => `Solucionario de ${c}`, detalle: 'Los mismos ejercicios, paso a paso.', minutos: 40 },
];

const comun = (curso) => ({
  cursoId: curso.id,
  temaId: null,
  licencia: 'propia',
  fuente: 'Elaborado por la academia',
});

export const LIBROS_DE_CURSO = CURSOS.flatMap((curso) =>
  LIBROS_POR_CURSO.map((l) => ({
    ...comun(curso),
    id: `lc-${curso.id}-${l.sufijo}`,
    tipo: 'libro',
    origen: 'academia',
    titulo: l.titulo(curso.nombre),
    subtitulo: l.subtitulo(curso.nombre),
    minutos: l.minutos,
    url: `https://ejemplo.pe/libros/${curso.id}-${l.sufijo}`,
  })));

export const MATERIALES_DE_CURSO = CURSOS.flatMap((curso) =>
  MATERIALES_POR_CURSO.map((m) => ({
    ...comun(curso),
    id: `mc-${curso.id}-${m.sufijo}`,
    tipo: 'enlace',
    origen: 'academia',
    titulo: m.titulo(curso.nombre),
    detalle: m.detalle,
    minutos: m.minutos,
    url: `https://ejemplo.pe/materiales/${curso.id}-${m.sufijo}`,
  })));

export const RECURSOS_DE_CURSO = [...LIBROS_DE_CURSO, ...MATERIALES_DE_CURSO];
