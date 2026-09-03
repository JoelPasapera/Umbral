/**
 * Catálogo de exámenes.
 *
 * Cada carrera define sus propios pesos por curso, porque no es lo mismo
 * postular a Ingeniería que a Derecho: en una, trigonometría vale nueve puntos
 * del examen y en la otra no entra. Sin esto el índice de preparación sería el
 * mismo para todos, que es tanto como no tener índice.
 *
 * Los puntajes de corte son del último proceso conocido. Cambian cada año y no
 * los controlamos: por eso van con su fuente al lado, siempre visible.
 */

const DIA = 86_400_000;

/** Bloques de cursos reutilizables. Un cambio en el temario se hace una vez. */
const CIENCIAS = [
  { cursoId: 'aritmetica', nombre: 'Aritmética', peso: 10 },
  { cursoId: 'algebra', nombre: 'Álgebra', peso: 10 },
  { cursoId: 'geometria', nombre: 'Geometría', peso: 9 },
  { cursoId: 'trigonometria', nombre: 'Trigonometría', peso: 9 },
  { cursoId: 'fisica', nombre: 'Física', peso: 11 },
  { cursoId: 'quimica', nombre: 'Química', peso: 9 },
  { cursoId: 'biologia', nombre: 'Biología', peso: 7 },
  { cursoId: 'lenguaje', nombre: 'Lenguaje', peso: 8 },
  { cursoId: 'literatura', nombre: 'Literatura', peso: 5 },
  { cursoId: 'historia', nombre: 'Historia del Perú', peso: 7 },
  { cursoId: 'geografia', nombre: 'Geografía', peso: 5 },
  { cursoId: 'civica', nombre: 'Educación cívica', peso: 5 },
  { cursoId: 'filosofia', nombre: 'Filosofía', peso: 5 },
];

const SALUD = [
  { cursoId: 'biologia', nombre: 'Biología', peso: 16 },
  { cursoId: 'quimica', nombre: 'Química', peso: 14 },
  { cursoId: 'fisica', nombre: 'Física', peso: 9 },
  { cursoId: 'aritmetica', nombre: 'Aritmética', peso: 9 },
  { cursoId: 'algebra', nombre: 'Álgebra', peso: 8 },
  { cursoId: 'geometria', nombre: 'Geometría', peso: 6 },
  { cursoId: 'trigonometria', nombre: 'Trigonometría', peso: 5 },
  { cursoId: 'lenguaje', nombre: 'Lenguaje', peso: 9 },
  { cursoId: 'literatura', nombre: 'Literatura', peso: 5 },
  { cursoId: 'historia', nombre: 'Historia del Perú', peso: 7 },
  { cursoId: 'geografia', nombre: 'Geografía', peso: 4 },
  { cursoId: 'civica', nombre: 'Educación cívica', peso: 4 },
  { cursoId: 'filosofia', nombre: 'Filosofía', peso: 4 },
];

const LETRAS = [
  { cursoId: 'lenguaje', nombre: 'Lenguaje', peso: 15 },
  { cursoId: 'literatura', nombre: 'Literatura', peso: 11 },
  { cursoId: 'historia', nombre: 'Historia del Perú', peso: 13 },
  { cursoId: 'geografia', nombre: 'Geografía', peso: 9 },
  { cursoId: 'civica', nombre: 'Educación cívica', peso: 9 },
  { cursoId: 'filosofia', nombre: 'Filosofía', peso: 9 },
  { cursoId: 'aritmetica', nombre: 'Aritmética', peso: 12 },
  { cursoId: 'algebra', nombre: 'Álgebra', peso: 9 },
  { cursoId: 'geometria', nombre: 'Geometría', peso: 7 },
  { cursoId: 'biologia', nombre: 'Biología', peso: 3 },
  { cursoId: 'quimica', nombre: 'Química', peso: 3 },
];

const AREAS = { ciencias: CIENCIAS, salud: SALUD, letras: LETRAS };

const UNIVERSIDADES = [
  {
    id: 'unmsm',
    nombre: 'Universidad Nacional Mayor de San Marcos',
    sigla: 'UNMSM',
    ciudad: 'Lima',
    proximoExamen: 94,
    carreras: [
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'ciencias', corte: 72 },
      { id: 'medicina', nombre: 'Medicina Humana', area: 'salud', corte: 84 },
      { id: 'derecho', nombre: 'Derecho', area: 'letras', corte: 76 },
      { id: 'economia', nombre: 'Economía', area: 'letras', corte: 69 },
    ],
  },
  {
    id: 'uni',
    nombre: 'Universidad Nacional de Ingeniería',
    sigla: 'UNI',
    ciudad: 'Lima',
    proximoExamen: 118,
    carreras: [
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'ciencias', corte: 78 },
      { id: 'industrial', nombre: 'Ingeniería Industrial', area: 'ciencias', corte: 75 },
      { id: 'software', nombre: 'Ingeniería de Software', area: 'ciencias', corte: 80 },
      { id: 'arquitectura', nombre: 'Arquitectura', area: 'ciencias', corte: 71 },
    ],
  },
  {
    id: 'unfv',
    nombre: 'Universidad Nacional Federico Villarreal',
    sigla: 'UNFV',
    ciudad: 'Lima',
    proximoExamen: 76,
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'salud', corte: 79 },
      { id: 'psicologia', nombre: 'Psicología', area: 'letras', corte: 66 },
      { id: 'contabilidad', nombre: 'Contabilidad', area: 'letras', corte: 61 },
    ],
  },
  {
    id: 'unalm',
    nombre: 'Universidad Nacional Agraria La Molina',
    sigla: 'UNALM',
    ciudad: 'Lima',
    proximoExamen: 103,
    carreras: [
      { id: 'agronomia', nombre: 'Agronomía', area: 'ciencias', corte: 62 },
      { id: 'alimentaria', nombre: 'Industrias Alimentarias', area: 'ciencias', corte: 65 },
      { id: 'biologia', nombre: 'Biología', area: 'salud', corte: 67 },
    ],
  },
  {
    id: 'unsa',
    nombre: 'Universidad Nacional de San Agustín',
    sigla: 'UNSA',
    ciudad: 'Arequipa',
    proximoExamen: 88,
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'salud', corte: 81 },
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'ciencias', corte: 68 },
      { id: 'derecho', nombre: 'Derecho', area: 'letras', corte: 72 },
    ],
  },
  {
    id: 'unt',
    nombre: 'Universidad Nacional de Trujillo',
    sigla: 'UNT',
    ciudad: 'Trujillo',
    proximoExamen: 97,
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'salud', corte: 80 },
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'ciencias', corte: 70 },
      { id: 'educacion', nombre: 'Educación', area: 'letras', corte: 55 },
    ],
  },
  {
    id: 'unsaac',
    nombre: 'Universidad Nacional de San Antonio Abad del Cusco',
    sigla: 'UNSAAC',
    ciudad: 'Cusco',
    proximoExamen: 110,
    carreras: [
      { id: 'turismo', nombre: 'Turismo', area: 'letras', corte: 58 },
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'ciencias', corte: 67 },
      { id: 'enfermeria', nombre: 'Enfermería', area: 'salud', corte: 69 },
    ],
  },
  {
    id: 'unprg',
    nombre: 'Universidad Nacional Pedro Ruiz Gallo',
    sigla: 'UNPRG',
    ciudad: 'Lambayeque',
    proximoExamen: 82,
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'salud', corte: 77 },
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'ciencias', corte: 64 },
    ],
  },
];

/** Lista para elegir: solo lo necesario para pintar la pantalla. */
export function catalogo() {
  return UNIVERSIDADES.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    sigla: u.sigla,
    ciudad: u.ciudad,
    dias: u.proximoExamen,
    carreras: u.carreras.map((c) => ({ id: c.id, nombre: c.nombre, area: c.area, corte: c.corte })),
  }));
}

/**
 * Arma el examen completo a partir de universidad y carrera.
 * @param {{ universidadId: string, carreraId: string }} params
 */
export function examen({ universidadId, carreraId }) {
  const universidad = UNIVERSIDADES.find((u) => u.id === universidadId);
  if (!universidad) throw new Error('Esa universidad no está en el catálogo.');

  const carrera = universidad.carreras.find((c) => c.id === carreraId);
  if (!carrera) throw new Error('Esa carrera no está en esta universidad.');

  return {
    id: `${universidad.id}-${carrera.id}`,
    universidadId: universidad.id,
    carreraId: carrera.id,
    universidad: universidad.nombre,
    sigla: universidad.sigla,
    carrera: carrera.nombre,
    fecha: new Date(Date.now() + universidad.proximoExamen * DIA).toISOString(),
    corte: carrera.corte,
    corteFuente: `Puntaje de ingreso más bajo en ${carrera.nombre}, último proceso conocido`,
    cursos: AREAS[carrera.area],
  };
}

export const META_POR_DEFECTO = { universidadId: 'unmsm', carreraId: 'sistemas' };
