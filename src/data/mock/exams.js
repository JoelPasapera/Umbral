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

import { cursosDelArea, areaVerificada, AREAS_UNMSM } from './temario.js';

const DIA = 86_400_000;

/**
 * Los pesos ya no se escriben a mano: salen del temario oficial, donde el
 * examen reparte preguntas y no porcentajes redondos. Habilidad matemática
 * vale 10 preguntas y trigonometría 2; un alumno que se mata con trigonometría
 * está gastando su tiempo en el curso que menos pesa.
 */
const cursosPorArea = (areaId) =>
  cursosDelArea(areaId).map(({ cursoId, nombre, peso, preguntas, puntos, temas, detallado }) => ({
    cursoId, nombre, peso, preguntas, puntos, temas, detallado,
  }));



const UNIVERSIDADES = [
  {
    id: 'unmsm',
    nombre: 'Universidad Nacional Mayor de San Marcos',
    sigla: 'UNMSM',
    ciudad: 'Lima',
    proximoExamen: 94,
    carreras: [
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'B', corte: 72 },
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: 84 },
      { id: 'derecho', nombre: 'Derecho', area: 'E', corte: 76 },
      { id: 'economia', nombre: 'Economía', area: 'D', corte: 69 },
    ],
  },
  {
    id: 'uni',
    nombre: 'Universidad Nacional de Ingeniería',
    sigla: 'UNI',
    ciudad: 'Lima',
    proximoExamen: 118,
    carreras: [
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'B', corte: 78 },
      { id: 'industrial', nombre: 'Ingeniería Industrial', area: 'B', corte: 75 },
      { id: 'software', nombre: 'Ingeniería de Software', area: 'B', corte: 80 },
      { id: 'arquitectura', nombre: 'Arquitectura', area: 'B', corte: 71 },
    ],
  },
  {
    id: 'unfv',
    nombre: 'Universidad Nacional Federico Villarreal',
    sigla: 'UNFV',
    ciudad: 'Lima',
    proximoExamen: 76,
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: 79 },
      { id: 'psicologia', nombre: 'Psicología', area: 'E', corte: 66 },
      { id: 'contabilidad', nombre: 'Contabilidad', area: 'D', corte: 61 },
    ],
  },
  {
    id: 'unalm',
    nombre: 'Universidad Nacional Agraria La Molina',
    sigla: 'UNALM',
    ciudad: 'Lima',
    proximoExamen: 103,
    carreras: [
      { id: 'agronomia', nombre: 'Agronomía', area: 'B', corte: 62 },
      { id: 'alimentaria', nombre: 'Industrias Alimentarias', area: 'B', corte: 65 },
      { id: 'biologia', nombre: 'Biología', area: 'A', corte: 67 },
    ],
  },
  {
    id: 'unsa',
    nombre: 'Universidad Nacional de San Agustín',
    sigla: 'UNSA',
    ciudad: 'Arequipa',
    proximoExamen: 88,
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: 81 },
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'B', corte: 68 },
      { id: 'derecho', nombre: 'Derecho', area: 'E', corte: 72 },
    ],
  },
  {
    id: 'unt',
    nombre: 'Universidad Nacional de Trujillo',
    sigla: 'UNT',
    ciudad: 'Trujillo',
    proximoExamen: 97,
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: 80 },
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'B', corte: 70 },
      { id: 'educacion', nombre: 'Educación', area: 'E', corte: 55 },
    ],
  },
  {
    id: 'unsaac',
    nombre: 'Universidad Nacional de San Antonio Abad del Cusco',
    sigla: 'UNSAAC',
    ciudad: 'Cusco',
    proximoExamen: 110,
    carreras: [
      { id: 'turismo', nombre: 'Turismo', area: 'E', corte: 58 },
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'B', corte: 67 },
      { id: 'enfermeria', nombre: 'Enfermería', area: 'A', corte: 69 },
    ],
  },
  {
    id: 'unprg',
    nombre: 'Universidad Nacional Pedro Ruiz Gallo',
    sigla: 'UNPRG',
    ciudad: 'Lambayeque',
    proximoExamen: 82,
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: 77 },
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'B', corte: 64 },
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
    area: carrera.area,
    areaNombre: AREAS_UNMSM[carrera.area]?.nombre ?? carrera.area,
    // Cuando los pesos de esa área no están verificados contra el temario
    // publicado, la interfaz lo dice en vez de aparentar precisión.
    pesosVerificados: areaVerificada(carrera.area),
    cursos: cursosPorArea(carrera.area),
  };
}

export const META_POR_DEFECTO = { universidadId: 'unmsm', carreraId: 'sistemas' };
