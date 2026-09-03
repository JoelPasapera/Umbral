/**
 * Cálculo de preparación.
 *
 * Este módulo es puro: no toca el DOM, ni la red, ni el reloj del sistema
 * (la fecha entra como parámetro). Eso lo hace verificable con pruebas y
 * es la razón de que viva separado de todo lo demás.
 *
 * La regla que gobierna el archivo entero: preferimos decir "no sé" antes
 * que dar un número inventado. Un postulante que confía en un 61 falso se
 * lleva el golpe el día del examen.
 */

/** Prior Beta(2,2): sin evidencia, la estimación arranca en 50 y no en 0 ni 100. */
const PRIOR_ACIERTOS = 2;
const PRIOR_FALLOS = 2;

/** Días tras los cuales una respuesta pesa la mitad. Lo que practicaste en marzo no dice mucho de agosto. */
const VIDA_MEDIA_DIAS = 45;

/**
 * Cuánto pesa un intento que el servidor no corrigió.
 *
 * La práctica sin conexión lleva las respuestas en el paquete, así que se
 * puede mirar la solución antes de contestar. No lo prohibimos: practicar en
 * el micro vale más que la pureza del dato. Pero cuenta menos, y el
 * diagnóstico que fija el número oficial sigue siendo solo en línea.
 */
const PESO_NO_VERIFICADO = 0.4;

/** Evidencia ponderada mínima por curso para publicar una estimación. */
const EVIDENCIA_MINIMA_CURSO = 12;

/** Evidencia ponderada mínima en total para publicar el índice global. */
const EVIDENCIA_MINIMA_GLOBAL = 60;

const DIA_MS = 86_400_000;

/**
 * Peso por antigüedad. Decaimiento exponencial con la vida media de arriba.
 * @param {number} dias
 * @returns {number} entre 0 y 1
 */
function pesoPorAntiguedad(dias) {
  if (!Number.isFinite(dias) || dias < 0) return 1;
  return Math.pow(0.5, dias / VIDA_MEDIA_DIAS);
}

/**
 * Peso por dificultad.
 *
 * `dificultad` es la proporción de postulantes que acierta la pregunta
 * (0.9 = casi todos la sacan, 0.2 = muy pocos). Acertar una difícil es
 * información fuerte; acertar una fácil casi no dice nada. Fallar una
 * fácil sí dice mucho.
 *
 * @param {number} dificultad entre 0 y 1
 * @param {boolean} acerto
 * @returns {number} entre 0.5 y 2
 */
function pesoPorDificultad(dificultad, acerto) {
  const p = Math.min(Math.max(Number(dificultad) || 0.5, 0.05), 0.95);
  const informacion = acerto ? 1 - p : p;
  return 0.5 + 1.5 * informacion;
}

/**
 * Ancho del intervalo de credibilidad al 90% de una Beta(a, b).
 * Aproximación normal, suficiente para decidir si mostramos el número.
 * @param {number} a
 * @param {number} b
 * @returns {number} ancho en puntos de 0 a 100
 */
function anchoIntervalo(a, b) {
  const n = a + b;
  const varianza = (a * b) / (n * n * (n + 1));
  return 2 * 1.645 * Math.sqrt(varianza) * 100;
}

/**
 * @typedef {object} Intento
 * @property {string} temaId
 * @property {string} cursoId
 * @property {boolean} acerto
 * @property {number} dificultad proporción de acierto poblacional, 0 a 1
 * @property {number} fecha timestamp en milisegundos
 * @property {boolean} [verificado] falso si se corrigió en el propio teléfono
 */

/**
 * @typedef {object} Estimacion
 * @property {number|null} valor 0 a 100, o null si no hay evidencia suficiente
 * @property {number} evidencia intentos ponderados acumulados
 * @property {number} margen ancho del intervalo al 90%, en puntos
 * @property {'estimado'|'insuficiente'} estado
 */

/**
 * Estima el dominio de un conjunto de intentos.
 * @param {Intento[]} intentos
 * @param {number} ahora timestamp
 * @param {number} evidenciaMinima
 * @returns {Estimacion}
 */
export function estimarDominio(intentos, ahora, evidenciaMinima) {
  let aciertos = PRIOR_ACIERTOS;
  let fallos = PRIOR_FALLOS;
  let evidencia = 0;

  for (const intento of intentos) {
    const dias = (ahora - intento.fecha) / DIA_MS;
    const confianza = intento.verificado === false ? PESO_NO_VERIFICADO : 1;
    const antiguedad = pesoPorAntiguedad(dias) * confianza;
    const peso = antiguedad * pesoPorDificultad(intento.dificultad, intento.acerto);
    if (intento.acerto) aciertos += peso;
    else fallos += peso;
    evidencia += antiguedad;
  }

  const margen = anchoIntervalo(aciertos, fallos);

  if (evidencia < evidenciaMinima) {
    return { valor: null, evidencia, margen, estado: 'insuficiente' };
  }

  return {
    valor: (aciertos / (aciertos + fallos)) * 100,
    evidencia,
    margen,
    estado: 'estimado',
  };
}

/**
 * @typedef {object} PesoCurso
 * @property {string} cursoId
 * @property {string} nombre
 * @property {number} peso proporción del examen que ocupa este curso
 */

/**
 * @typedef {object} Examen
 * @property {string} id
 * @property {string} universidad
 * @property {string} carrera
 * @property {string} fecha ISO
 * @property {number|null} corte último puntaje de corte conocido, 0 a 100
 * @property {string} corteFuente de dónde salió el corte
 * @property {PesoCurso[]} cursos
 */

/**
 * @typedef {object} CursoEvaluado
 * @property {string} cursoId
 * @property {string} nombre
 * @property {number} peso
 * @property {Estimacion} dominio
 * @property {number} puntosEnJuego cuánto sube el índice global si este curso llega a 100
 */

/**
 * Calcula el índice de preparación para un examen concreto.
 *
 * Los cursos sin evidencia suficiente no se inventan: quedan fuera del
 * promedio y su peso se redistribuye, pero se reportan aparte para que la
 * interfaz pueda decir "de esto todavía no sé nada".
 *
 * @param {Intento[]} intentos
 * @param {Examen} examen
 * @param {number} ahora timestamp
 * @returns {{
 *   indice: number|null,
 *   estado: 'estimado'|'insuficiente',
 *   margen: number,
 *   evidencia: number,
 *   cobertura: number,
 *   cursos: CursoEvaluado[],
 *   sinDatos: CursoEvaluado[],
 *   corte: number|null,
 *   brecha: number|null
 * }}
 */
export function calcularPreparacion(intentos, examen, ahora) {
  const porCurso = new Map();
  for (const curso of examen.cursos) porCurso.set(curso.cursoId, []);
  for (const intento of intentos) {
    if (porCurso.has(intento.cursoId)) porCurso.get(intento.cursoId).push(intento);
  }

  const evaluados = examen.cursos.map((curso) => {
    const dominio = estimarDominio(porCurso.get(curso.cursoId), ahora, EVIDENCIA_MINIMA_CURSO);
    return {
      cursoId: curso.cursoId,
      nombre: curso.nombre,
      peso: curso.peso,
      dominio,
      puntosEnJuego: dominio.valor === null ? 0 : ((100 - dominio.valor) * curso.peso) / 100,
    };
  });

  const conDatos = evaluados.filter((c) => c.dominio.estado === 'estimado');
  const sinDatos = evaluados.filter((c) => c.dominio.estado === 'insuficiente');

  const pesoCubierto = conDatos.reduce((suma, c) => suma + c.peso, 0);
  const pesoTotal = evaluados.reduce((suma, c) => suma + c.peso, 0) || 1;
  const evidencia = evaluados.reduce((suma, c) => suma + c.dominio.evidencia, 0);

  const base = {
    cursos: conDatos.sort((a, b) => b.puntosEnJuego - a.puntosEnJuego),
    sinDatos,
    cobertura: pesoCubierto / pesoTotal,
    evidencia,
    corte: examen.corte,
  };

  if (evidencia < EVIDENCIA_MINIMA_GLOBAL || pesoCubierto === 0) {
    return { ...base, indice: null, estado: 'insuficiente', margen: 100, brecha: null };
  }

  const indice = conDatos.reduce((suma, c) => suma + c.dominio.valor * c.peso, 0) / pesoCubierto;
  const margen = conDatos.reduce((suma, c) => suma + c.dominio.margen * c.peso, 0) / pesoCubierto;

  return {
    ...base,
    indice,
    estado: 'estimado',
    margen,
    brecha: examen.corte === null ? null : indice - examen.corte,
  };
}

/**
 * Días que faltan para el examen. Cuenta días de calendario, no fracciones,
 * para que "falta 1 día" no aparezca cuando faltan 30 horas.
 * @param {string} fechaISO
 * @param {number} ahora
 * @returns {number}
 */
export function diasHasta(fechaISO, ahora) {
  const objetivo = new Date(fechaISO);
  const hoy = new Date(ahora);
  const a = Date.UTC(objetivo.getUTCFullYear(), objetivo.getUTCMonth(), objetivo.getUTCDate());
  const b = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  return Math.round((a - b) / DIA_MS);
}

export const CONSTANTES = Object.freeze({
  PESO_NO_VERIFICADO,
  VIDA_MEDIA_DIAS,
  EVIDENCIA_MINIMA_CURSO,
  EVIDENCIA_MINIMA_GLOBAL,
});
