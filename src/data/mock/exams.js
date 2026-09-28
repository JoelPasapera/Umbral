/**
 * Catálogo de exámenes.
 *
 * Cada carrera define sus propios pesos por curso, porque no es lo mismo
 * postular a Ingeniería que a Derecho: en una, trigonometría vale nueve puntos
 * del examen y en la otra no entra. Sin esto el índice de preparación sería el
 * mismo para todos, que es tanto como no tener índice.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * EL CORTE Y LA FECHA, QUE SON LO QUE MÁS IMPORTA DE ESTE ARCHIVO
 *
 * **Ninguna carrera trae corte todavía, y es a propósito.** Aquí había números
 * de 0 a 100 escritos a mano, presentados con la frase "puntaje de ingreso más
 * bajo, último proceso conocido". No salían de ningún acta. Y sobre ellos la
 * pantalla principal calculaba su titular —"te faltan 14 puntos"—, mientras la
 * de Admisión decía, con razón, que el corte no estaba cargado. Las dos
 * pantallas se contradecían y la que mentía era la más visible.
 *
 * Para cargar un corte real se escribe tal como viene en el acta, en sus
 * propias unidades, y la conversión a la escala de 0 a 100 la hace `examen()`:
 *
 *     corte: { puntos: 1187, maximo: 1800, proceso: '2026-II',
 *              fuente: 'https://admision.unmsm.edu.pe/…/acta.pdf' }
 *
 * Sin `fuente` no se acepta: un corte sin decir de dónde sale es un rumor con
 * formato de número, y este producto se vende sobre no dar de esos.
 *
 * **La fecha sale del cronograma oficial**, en `admision.js`, y no de aquí.
 * Antes era "hoy más 94 días", así que la cuenta atrás no se movía nunca.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { cursosDelArea, areaVerificada, AREAS_UNMSM } from './temario.js';
import { fechaDeExamen } from './admision.js';

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
    carreras: [
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'B', corte: null },
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: null },
      { id: 'derecho', nombre: 'Derecho', area: 'E', corte: null },
      { id: 'economia', nombre: 'Economía', area: 'D', corte: null },
    ],
  },
  {
    id: 'uni',
    nombre: 'Universidad Nacional de Ingeniería',
    sigla: 'UNI',
    ciudad: 'Lima',
    carreras: [
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'B', corte: null },
      { id: 'industrial', nombre: 'Ingeniería Industrial', area: 'B', corte: null },
      { id: 'software', nombre: 'Ingeniería de Software', area: 'B', corte: null },
      { id: 'arquitectura', nombre: 'Arquitectura', area: 'B', corte: null },
    ],
  },
  {
    id: 'unfv',
    nombre: 'Universidad Nacional Federico Villarreal',
    sigla: 'UNFV',
    ciudad: 'Lima',
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: null },
      { id: 'psicologia', nombre: 'Psicología', area: 'E', corte: null },
      { id: 'contabilidad', nombre: 'Contabilidad', area: 'D', corte: null },
    ],
  },
  {
    id: 'unalm',
    nombre: 'Universidad Nacional Agraria La Molina',
    sigla: 'UNALM',
    ciudad: 'Lima',
    carreras: [
      { id: 'agronomia', nombre: 'Agronomía', area: 'B', corte: null },
      { id: 'alimentaria', nombre: 'Industrias Alimentarias', area: 'B', corte: null },
      { id: 'biologia', nombre: 'Biología', area: 'A', corte: null },
    ],
  },
  {
    id: 'unsa',
    nombre: 'Universidad Nacional de San Agustín',
    sigla: 'UNSA',
    ciudad: 'Arequipa',
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: null },
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'B', corte: null },
      { id: 'derecho', nombre: 'Derecho', area: 'E', corte: null },
    ],
  },
  {
    id: 'unt',
    nombre: 'Universidad Nacional de Trujillo',
    sigla: 'UNT',
    ciudad: 'Trujillo',
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: null },
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'B', corte: null },
      { id: 'educacion', nombre: 'Educación', area: 'E', corte: null },
    ],
  },
  {
    id: 'unsaac',
    nombre: 'Universidad Nacional de San Antonio Abad del Cusco',
    sigla: 'UNSAAC',
    ciudad: 'Cusco',
    carreras: [
      { id: 'turismo', nombre: 'Turismo', area: 'E', corte: null },
      { id: 'civil', nombre: 'Ingeniería Civil', area: 'B', corte: null },
      { id: 'enfermeria', nombre: 'Enfermería', area: 'A', corte: null },
    ],
  },
  {
    id: 'unprg',
    nombre: 'Universidad Nacional Pedro Ruiz Gallo',
    sigla: 'UNPRG',
    ciudad: 'Lambayeque',
    carreras: [
      { id: 'medicina', nombre: 'Medicina Humana', area: 'A', corte: null },
      { id: 'sistemas', nombre: 'Ingeniería de Sistemas', area: 'B', corte: null },
    ],
  },
];

const fechaISO = (marca) => (marca === null ? null : new Date(marca).toISOString());

/**
 * El corte del acta, pasado a la escala de 0 a 100 del índice.
 *
 * Se guarda en las unidades del acta —puntos sobre un máximo— porque así es
 * como lo copia quien lo carga, y copiarlo convertido a mano es donde entra el
 * error. Sin fuente no se usa: se devuelve `null`, que la pantalla sabe decir.
 *
 * @param {{puntos:number, maximo:number, proceso:string, fuente:string}|null} corte
 */
export function corteEnEscala(corte) {
  const valido = corte && corte.puntos > 0 && corte.maximo > 0 && corte.puntos <= corte.maximo
    && String(corte.fuente ?? '').startsWith('https://');
  if (!valido) return { corte: null, corteFuente: null, corteUrl: null };
  return {
    corte: Math.round((corte.puntos / corte.maximo) * 1000) / 10,
    corteFuente: `Último ingresante ${corte.proceso}: ${corte.puntos} de ${corte.maximo} puntos`,
    corteUrl: corte.fuente,
  };
}

/** El primer día de examen de una universidad, entre todas sus áreas. */
function primeraFecha(u) {
  const fechas = u.carreras
    .map((c) => fechaDeExamen({ universidadId: u.id, area: c.area, carreraId: c.id }))
    .filter((f) => f !== null);
  return fechas.length ? Math.min(...fechas) : null;
}

/** Lista para elegir: solo lo necesario para pintar la pantalla. */
export function catalogo() {
  return UNIVERSIDADES.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    sigla: u.sigla,
    ciudad: u.ciudad,
    // La fecha más temprana de la universidad, del cronograma oficial. Null si
    // no se conoce: la pantalla dice "por confirmar" en vez de inventarla.
    fecha: fechaISO(primeraFecha(u)),
    carreras: u.carreras.map((c) => ({
      id: c.id, nombre: c.nombre, area: c.area, corte: corteEnEscala(c.corte).corte,
    })),
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
    fecha: fechaISO(fechaDeExamen({ universidadId: universidad.id, area: carrera.area, carreraId: carrera.id })),
    ...corteEnEscala(carrera.corte),
    area: carrera.area,
    areaNombre: AREAS_UNMSM[carrera.area]?.nombre ?? carrera.area,
    // Cuando los pesos de esa área no están verificados contra el temario
    // publicado, la interfaz lo dice en vez de aparentar precisión.
    pesosVerificados: areaVerificada(carrera.area),
    cursos: cursosPorArea(carrera.area),
  };
}

export const META_POR_DEFECTO = { universidadId: 'unmsm', carreraId: 'sistemas' };
