/**
 * Datos de admisión: la puerta que separa lo raspado de lo publicable.
 *
 * El raspado sale de imágenes y PDFs pasados por OCR. Eso significa que un "1"
 * puede leerse como "7", que una columna puede desplazarse una fila, y que la
 * cifra resultante tiene una forma perfectamente creíble. No hay ningún error;
 * simplemente el número está mal.
 *
 * Aquí eso no es un inconveniente: es peligroso. **El corte alimenta
 * `readiness.js`**, que produce el único número del que vive Umbral. Un corte
 * mal leído convierte "te faltan 14 puntos" en una mentira con dos decimales de
 * confianza, y el alumno no tiene forma de saberlo. Por eso este módulo existe
 * y por eso nada raspado se publica solo.
 *
 * Tres niveles, y la diferencia importa:
 *
 *   rechazo — imposible. No entra ni a revisión: un corte de 4.200 sobre un
 *             máximo de 1.800 no es dudoso, es basura.
 *   aviso   — posible pero raro. Entra a revisión marcado, con el motivo.
 *   limpio  — entra a revisión sin marcas. **También espera confirmación**,
 *             porque "plausible" no es "correcto" y solo alguien que mire el
 *             acta puede decir la diferencia.
 *
 * Puro: sin DOM, sin red, sin reloj.
 */

/**
 * Las cinco áreas que convoca San Marcos.
 *
 * El temario del proyecto declara cuatro (A, B, D, E) y le falta la C. Aquí se
 * aceptan las cinco a propósito: rechazar un acta real de área C tiraría datos
 * buenos, y el hueco está en el temario, no en el acta. Queda una prueba que lo
 * señala para que no se olvide.
 */
export const AREAS_UNMSM = Object.freeze(['A', 'B', 'C', 'D', 'E']);

/** 90 preguntas por 20 puntos. Ver `PUNTOS_POR_PREGUNTA` en el temario. */
export const PUNTAJE_MAXIMO = 1800;

/**
 * Nadie ingresa con un puntaje irrisorio: por debajo de esto el número está
 * mal leído, no es un corte bajo.
 */
const CORTE_MINIMO_CREIBLE = 200;

/** Vacantes por carrera en una convocatoria. Fuera de aquí, el dato está mal. */
const VACANTES = [1, 400];

/**
 * Cuánto puede moverse un corte entre convocatorias sin que sea sospechoso.
 *
 * Es la comprobación que caza los errores de OCR que superan todas las demás.
 * Un corte se mueve unas decenas de puntos entre ciclos; si salta un tercio, o
 * la carrera cambió de golpe o un dígito se leyó mal, y las dos cosas exigen
 * que alguien mire.
 */
const SALTO_SOSPECHOSO = 0.25;

/**
 * @typedef {object} Problema
 * @property {'rechazo'|'aviso'} nivel
 * @property {string} campo
 * @property {string} mensaje
 */

/**
 * @typedef {object} Registro
 * @property {string} universidadId
 * @property {string} proceso        p. ej. "2027-I"
 * @property {string} carreraId
 * @property {string} carrera
 * @property {string} area           A, B, D o E
 * @property {number} vacantes
 * @property {number} postulantes
 * @property {number} corte          puntaje del último ingresante
 * @property {string} fuente         URL del documento del que salió
 * @property {number} obtenido       cuándo se raspó
 */

const numero = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);

/**
 * Revisa un registro raspado.
 *
 * @param {Registro} registro
 * @param {{ anterior?: Registro|null, areasValidas?: string[] }} [contexto]
 * @returns {{ publicable: boolean, problemas: Problema[] }}
 */
export function revisarRegistro(registro, { anterior = null, areasValidas = AREAS_UNMSM } = {}) {
  const problemas = [];
  const rechazo = (campo, mensaje) => problemas.push({ nivel: 'rechazo', campo, mensaje });
  const aviso = (campo, mensaje) => problemas.push({ nivel: 'aviso', campo, mensaje });

  const vacantes = numero(registro?.vacantes);
  const postulantes = numero(registro?.postulantes);
  const corte = numero(registro?.corte);

  /* --- Procedencia. Sin esto no se puede comprobar nada a mano --- */

  if (!String(registro?.fuente ?? '').startsWith('http')) {
    rechazo('fuente', 'No dice de qué documento salió. Sin eso nadie puede contrastarlo.');
  }
  if (!String(registro?.carrera ?? '').trim()) {
    rechazo('carrera', 'No dice de qué carrera es.');
  }
  if (!areasValidas.includes(String(registro?.area ?? ''))) {
    rechazo('area', `Área desconocida: "${registro?.area}".`);
  }
  if (!/^\d{4}-(I|II)$/.test(String(registro?.proceso ?? ''))) {
    rechazo('proceso', `Convocatoria con formato raro: "${registro?.proceso}".`);
  }

  /* --- Lo imposible --- */

  if (!Number.isFinite(corte)) {
    rechazo('corte', 'El corte no se pudo leer.');
  } else if (corte > PUNTAJE_MAXIMO) {
    rechazo('corte', `Un corte de ${corte} supera el máximo del examen (${PUNTAJE_MAXIMO}).`);
  } else if (corte < CORTE_MINIMO_CREIBLE) {
    rechazo('corte', `Un corte de ${corte} es demasiado bajo para ser real: el dígito está mal leído.`);
  }

  if (!Number.isFinite(vacantes) || vacantes < VACANTES[0] || vacantes > VACANTES[1]) {
    rechazo('vacantes', `${registro?.vacantes} vacantes no es una cifra posible para una carrera.`);
  }
  if (!Number.isFinite(postulantes)) {
    rechazo('postulantes', 'El número de postulantes no se pudo leer.');
  } else if (Number.isFinite(vacantes) && postulantes < vacantes) {
    // Sobran vacantes alguna vez, pero en San Marcos y con estas cifras casi
    // siempre significa que las dos columnas se cruzaron al leerlas.
    rechazo('postulantes', `Hay menos postulantes (${postulantes}) que vacantes (${vacantes}): las columnas se cruzaron.`);
  }

  /* --- Lo sospechoso. Entra, pero marcado --- */

  if (anterior && Number.isFinite(corte) && Number.isFinite(numero(anterior.corte)) && anterior.corte > 0) {
    const salto = Math.abs(corte - anterior.corte) / anterior.corte;
    if (salto > SALTO_SOSPECHOSO) {
      aviso('corte', `El corte salta ${Math.round(salto * 100)}% respecto a ${anterior.proceso} (${anterior.corte} → ${corte}). Comprueba el dígito.`);
    }
  }

  if (Number.isFinite(vacantes) && Number.isFinite(postulantes) && vacantes > 0) {
    const porVacante = postulantes / vacantes;
    if (porVacante > 60) {
      aviso('postulantes', `${Math.round(porVacante)} postulantes por vacante es muchísimo. Comprueba que no sobre un dígito.`);
    }
  }

  return { publicable: !problemas.some((p) => p.nivel === 'rechazo'), problemas };
}

/**
 * Revisa una tanda entera y la reparte.
 *
 * Además de mirar cada fila, comprueba la tanda contra sí misma: una carrera
 * repetida significa que la lectura saltó o repitió una fila, y entonces no se
 * puede confiar en ninguna de las dos.
 *
 * @param {Registro[]} registros
 * @param {{ anteriores?: Map<string, Registro> }} [contexto]
 */
export function revisarTanda(registros, { anteriores = new Map() } = {}) {
  const vistas = new Map();
  const revisados = registros.map((r) => {
    const revision = revisarRegistro(r, { anterior: anteriores.get(r.carreraId) ?? null });
    const clave = `${r.proceso}:${r.carreraId}`;
    if (vistas.has(clave)) {
      revision.problemas.push({
        nivel: 'rechazo',
        campo: 'carreraId',
        mensaje: 'Esta carrera aparece dos veces en la misma tanda: la lectura repitió o saltó una fila.',
      });
      revision.publicable = false;
    }
    vistas.set(clave, true);
    return { registro: r, ...revision };
  });

  const aRevisar = revisados.filter((r) => r.publicable);
  const descartados = revisados.filter((r) => !r.publicable);

  return {
    aRevisar,
    descartados,
    resumen: {
      leidos: registros.length,
      aRevisar: aRevisar.length,
      descartados: descartados.length,
      conAviso: aRevisar.filter((r) => r.problemas.length > 0).length,
    },
  };
}

/**
 * Lo que un alumno puede ver de un dato de admisión.
 *
 * Va siempre con la fecha y la fuente. Un corte sin decir de cuándo es y de
 * dónde salió no es un dato: es un rumor con formato de tabla, y este producto
 * se vende sobre no dar de esos.
 *
 * @param {object} fila fila ya confirmada por una persona
 */
export const versionPublica = (fila) => ({
  carrera: fila.carrera,
  area: fila.area,
  proceso: fila.proceso,
  vacantes: fila.vacantes,
  postulantes: fila.postulantes,
  corte: fila.corte,
  porVacante: fila.vacantes > 0 ? Math.round((fila.postulantes / fila.vacantes) * 10) / 10 : null,
  fuente: fila.fuente,
  confirmado: fila.confirmado,
});

export const LIMITES_ADMISION = Object.freeze({
  PUNTAJE_MAXIMO, CORTE_MINIMO_CREIBLE, VACANTES, SALTO_SOSPECHOSO,
});
