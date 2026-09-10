/**
 * Catálogo de la biblioteca.
 *
 * Tres decisiones viven aquí, y las tres tienen consecuencias fuera del código.
 *
 * 1. **La licencia es una puerta, no una intención.** Un material sin licencia
 *    admisible no se muestra, y da igual quién lo subiera. Una biblioteca de
 *    escaneos de editoriales es el hallazgo legal que hundió al sitio que se
 *    auditó antes de empezar esto; la única forma de no repetirlo es que el
 *    código no permita guardarlo, porque una norma escrita en un documento se
 *    salta sola en cuanto alguien tiene prisa.
 *
 * 2. **Un solo catálogo con filtros, no tres catálogos.** Un examen resuelto de
 *    San Marcos es a la vez de origen "examen", de curso "álgebra" y de
 *    universidad "UNMSM". Con tres secciones separadas habría que elegir dónde
 *    vive o duplicarlo; con filtros que se combinan, aparece en las tres.
 *
 * 3. **Los cursos se ordenan por peso del examen, no alfabéticamente.**
 *    Habilidad matemática vale 10 preguntas y Trigonometría 2 en la misma
 *    área. Una lista alfabética les da el mismo tamaño y hace que el profesor
 *    reparta su esfuerzo mal.
 *
 * Puro: sin DOM, sin red, sin reloj.
 */

import { normalizar } from './texto.js';

/**
 * Licencias bajo las que un material puede estar en la biblioteca.
 *
 * No es una lista de tipos de archivo: es la respuesta a "¿por qué tenemos
 * derecho a mostrar esto?". Cada material tiene que contestarla.
 */
export const LICENCIAS = Object.freeze({
  propia: 'Producido por la academia o por Umbral',
  'dominio-publico': 'Sin derechos vigentes o publicado como dominio público',
  oficial: 'Publicado por la propia universidad para el postulante',
  permiso: 'Con permiso por escrito del titular, archivado',
});

/** Las tres colecciones por procedencia. */
export const ORIGENES = Object.freeze({
  editorial: 'Biblioteca especializada',
  academia: 'Preparación preuniversitaria',
  examen: 'Practica y evalúate',
});

/**
 * Un material que solo enlaza a un sitio ajeno no necesita licencia propia: no
 * estamos alojando nada. Pero sí tiene que declarar a dónde apunta, porque un
 * enlace a una carpeta compartida con escaneos es alojarlo con un paso de por
 * medio, y eso ya se ha visto.
 */
const TIPOS_QUE_ALOJAN = new Set(['resumen', 'video', 'documento']);

/** Sitios donde un enlace es, en la práctica, un escaneo alojado por otro. */
const DESTINOS_OPACOS = [/drive\.google\./i, /mega\.nz/i, /mediafire\./i, /1fichier\./i, /\.zippyshare\./i];

/**
 * Cuánto pesa un curso en el examen.
 *
 * El temario lo expresa en preguntas y la meta en proporción, según de dónde
 * venga la lista. Como aquí solo se usa para repartir un total, cualquiera de
 * las dos sirve y no hace falta que quien llame se preocupe de convertirla.
 *
 * @param {{preguntas?:number, peso?:number}} curso
 * @returns {number}
 */
const pesoDe = (curso) => Number(curso?.preguntas ?? curso?.peso) || 0;

/**
 * @typedef {object} Problema
 * @property {'rechazo'|'aviso'} nivel
 * @property {string} campo
 * @property {string} mensaje
 */

/**
 * Decide si un material puede estar en la biblioteca.
 *
 * @param {object} material
 * @returns {{ admisible: boolean, problemas: Problema[] }}
 */
export function admisible(material) {
  const problemas = [];
  const rechazo = (campo, mensaje) => problemas.push({ nivel: 'rechazo', campo, mensaje });
  const aviso = (campo, mensaje) => problemas.push({ nivel: 'aviso', campo, mensaje });

  const licencia = String(material?.licencia ?? '').trim();
  const tipo = String(material?.tipo ?? '').trim();
  const url = String(material?.url ?? '');

  if (!licencia) {
    rechazo('licencia', 'No declara bajo qué derecho se muestra.');
  } else if (!(licencia in LICENCIAS)) {
    rechazo('licencia', `Licencia desconocida: "${licencia}".`);
  }

  if (!String(material?.fuente ?? '').trim()) {
    rechazo('fuente', 'No dice de dónde salió. Sin eso no se puede comprobar la licencia.');
  }

  if (licencia === 'permiso' && !String(material?.permisoRef ?? '').trim()) {
    rechazo('permisoRef', 'Dice tener permiso pero no señala dónde está archivado.');
  }

  if (!(String(material?.origen ?? '') in ORIGENES)) {
    rechazo('origen', 'No declara a qué colección pertenece.');
  }

  if (TIPOS_QUE_ALOJAN.has(tipo) && licencia === 'dominio-publico' && !String(material?.anio ?? '').trim()) {
    aviso('anio', 'Se declara de dominio público sin año: conviene poder justificarlo.');
  }

  if (DESTINOS_OPACOS.some((p) => p.test(url))) {
    rechazo('url', 'Apunta a una carpeta compartida. Enlazar un escaneo ajeno es alojarlo con un paso de por medio.');
  }

  return { admisible: !problemas.some((p) => p.nivel === 'rechazo'), problemas };
}

/**
 * Fichas creadas a las que solo les falta resolver la licencia.
 *
 * Existe porque un libro que la academia quiere ofrecer y todavía no puede es
 * información útil, no basura: es la lista de gestiones pendientes. Se enseña
 * en el panel del profesor y nunca al alumno. Lo que falla por el destino del
 * enlace no entra aquí: eso no se arregla con un papel, se arregla alojándolo
 * donde toque.
 *
 * @param {object[]} materiales
 * @returns {{material:object, falta:string[]}[]}
 */
export function pendientesDeLicencia(materiales) {
  const SUBSANABLES = new Set(['licencia', 'permisoRef', 'fuente']);
  return materiales
    .map((material) => ({ material, revision: admisible(material) }))
    .filter(({ revision }) =>
      !revision.admisible
      && revision.problemas
        .filter((p) => p.nivel === 'rechazo')
        .every((p) => SUBSANABLES.has(p.campo)))
    .map(({ material, revision }) => ({
      material,
      falta: revision.problemas.filter((p) => p.nivel === 'rechazo').map((p) => p.mensaje),
    }));
}

/**
 * Los libros agrupados por curso, en el orden de peso del examen.
 *
 * Un libro no se lista suelto entre resúmenes de doce minutos: el alumno que
 * busca un tomo de seiscientas páginas y el que busca una ficha de repaso no
 * están haciendo lo mismo. Por eso van en su propia agrupación, con el curso
 * como encabezado.
 *
 * @param {object[]} materiales
 * @param {{cursoId:string, nombre:string}[]} cursos ya ordenados por peso
 * @returns {{cursoId:string, nombre:string, libros:object[]}[]}
 */
export function librosPorCurso(materiales, cursos, conEstante = null) {
  const libros = materiales.filter((m) => m.tipo === 'libro');
  // Un curso con estante vacío no se esconde. Es tentador esconderlo porque
  // "no hay nada", pero entonces la persona no sabe si el curso no tiene
  // libro o si la aplicación no lo contempla, y son cosas muy distintas.
  const mostrar = (cursoId) =>
    conEstante ? conEstante.has(cursoId) : libros.some((m) => m.cursoId === cursoId);

  return cursos
    .filter((curso) => mostrar(curso.cursoId))
    .map((curso) => ({
      cursoId: curso.cursoId,
      nombre: curso.nombre,
      libros: libros.filter((m) => m.cursoId === curso.cursoId),
    }));
}

/**
 * Los exámenes publicados, agrupados por convocatoria y del más reciente al
 * más antiguo.
 *
 * Un examen pasado es el material más valioso que existe para preparar una
 * admisión —es la pregunta que salió, con el reparto y el nivel reales—, así
 * que tiene agrupación propia y no se mezcla con los resúmenes.
 *
 * @param {object[]} materiales
 * @returns {{proceso:string, piezas:object[]}[]}
 */
export function examenesPorProceso(materiales) {
  const examenes = materiales.filter((m) => m.tipo === 'examen');
  const procesos = [...new Set(examenes.map((m) => m.proceso))].sort().reverse();
  return procesos.map((proceso) => ({
    proceso,
    convocatorias: examenes.filter((m) => m.proceso === proceso),
  }));
}

/**
 * Deja solo lo que puede mostrarse. Se aplica en el servidor y no en la vista:
 * un filtro que vive en el cliente se salta cambiando la petición.
 *
 * @param {object[]} materiales
 * @returns {object[]}
 */
export const soloAdmisibles = (materiales) => materiales.filter((m) => admisible(m).admisible);

/**
 * Filtra por las tres dimensiones a la vez. Cualquiera puede venir vacía, y
 * entonces esa dimensión no restringe nada.
 *
 * @param {object[]} materiales
 * @param {{ origen?:string, cursoId?:string, universidadId?:string, busqueda?:string }} filtros
 * @returns {object[]}
 */
export function filtrar(materiales, { origen, cursoId, universidadId, busqueda } = {}) {
  let lista = materiales;

  if (origen) lista = lista.filter((m) => m.origen === origen);
  // El filtro de curso es estricto, sin excepción para los exámenes.
  //
  // Los exámenes tuvieron una excepción aquí —un examen completo toca todos
  // los cursos, así que parecía mal esconderlo— y el resultado fue que seis
  // exámenes de admisión aparecían en Estudiar como material de trigonometría.
  // Esta función la usan dos pantallas y la excepción solo tenía sentido en
  // una. La biblioteca resuelve su caso donde le corresponde: alimenta su
  // sección de exámenes con una lista aparte, sin filtro de curso.
  if (cursoId) lista = lista.filter((m) => m.cursoId === cursoId);
  // Un material sin universidad sirve para todas: la teoría de exponentes es
  // la misma para San Marcos que para la UNI.
  if (universidadId) {
    lista = lista.filter((m) => !m.universidadId || m.universidadId === universidadId);
  }

  // Se busca sobre el texto normalizado: sin tildes y sin mayúsculas. En un
  // teléfono casi nadie escribe las tildes, y un buscador que exige "álgebra"
  // con tilde para encontrar Álgebra no sirve para nada.
  const termino = normalizar(busqueda);
  if (termino) {
    lista = lista.filter((m) =>
      normalizar([m.titulo, m.subtitulo, m.detalle, m.fuente].filter(Boolean).join(' ')).includes(termino));
  }

  return lista;
}

/**
 * Las tres colecciones con lo que hay dentro de cada una.
 *
 * @param {object[]} materiales
 * @returns {{ origen:string, nombre:string, elementos:number }[]}
 */
export const porOrigen = (materiales) =>
  Object.entries(ORIGENES).map(([origen, nombre]) => ({
    origen,
    nombre,
    elementos: materiales.filter((m) => m.origen === origen).length,
  }));

/**
 * Los cursos del examen con su material, ordenados por lo que pesan.
 *
 * Devuelve `pesoExamen` además del recuento, y esa es la diferencia entre una
 * sección que dice "0 elementos" y otra que dice "cubre el 11% del examen y no
 * tiene nada". La primera solo informa de que la aplicación está vacía; la
 * segunda le dice al profesor por dónde empezar.
 *
 * @param {object[]} materiales
 * @param {{cursoId:string, nombre:string, preguntas:number}[]} cursos del área de la meta
 * @returns {{cursoId:string, nombre:string, elementos:number, preguntas:number, pesoExamen:number}[]}
 */
export function porCurso(materiales, cursos) {
  const total = cursos.reduce((suma, c) => suma + pesoDe(c), 0) || 1;

  return cursos
    .map((curso) => ({
      cursoId: curso.cursoId,
      nombre: curso.nombre,
      peso: pesoDe(curso),
      pesoExamen: pesoDe(curso) / total,
      elementos: materiales.filter((m) => m.cursoId === curso.cursoId).length,
    }))
    .sort((a, b) => b.peso - a.peso || a.nombre.localeCompare(b.nombre, 'es'));
}
