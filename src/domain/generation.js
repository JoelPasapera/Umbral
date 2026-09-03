/**
 * Validación de preguntas generadas.
 *
 * Un modelo produce con total seguridad una pregunta cuya respuesta correcta
 * está mal. Esta puerta no puede detectar eso —hace falta un profesor—, pero
 * sí puede detectar todo lo demás, y ahí está su valor: el tiempo del profesor
 * es el recurso caro del sistema. Si tiene que descartar a mano cuatro
 * candidatas rotas por cada buena, la función no se usa.
 *
 * Dos niveles de severidad, a propósito:
 *
 *   rechazo — está estructuralmente rota. No llega a la cola de revisión.
 *   aviso   — es sospechosa pero puede ser válida. Llega marcada, para que el
 *             profesor mire justo ahí en vez de leerlo todo con la misma
 *             atención.
 *
 * Puro: sin DOM, sin red, sin reloj.
 */

/** Longitud mínima de coincidencia literal con la fuente para sospechar copia. */
const COPIA_MINIMA = 60;

/** Similitud por encima de la cual dos enunciados se consideran el mismo. */
const UMBRAL_DUPLICADO = 0.72;

const LIMITES = {
  enunciado: [15, 1200],
  opcion: [1, 500],
  explicacion: [30, 2000],
  tema: [2, 60],
  dificultad: [0.05, 0.95],
};

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Similitud de Jaccard sobre trigramas de palabras. Barata y suficiente. */
function similitud(a, b) {
  const trigramas = (texto) => {
    const palabras = normalizar(texto).split(' ').filter(Boolean);
    if (palabras.length < 3) return new Set(palabras);
    return new Set(palabras.slice(0, -2).map((_, i) => palabras.slice(i, i + 3).join(' ')));
  };
  const x = trigramas(a);
  const y = trigramas(b);
  if (!x.size || !y.size) return 0;

  let comunes = 0;
  for (const t of x) if (y.has(t)) comunes += 1;
  return comunes / (x.size + y.size - comunes);
}

/** Detecta si el enunciado es un trozo copiado literalmente de la fuente. */
function copiaLiteral(enunciado, fuente) {
  if (!fuente) return false;
  const limpio = normalizar(enunciado);
  const origen = normalizar(fuente);
  for (let i = 0; i + COPIA_MINIMA <= limpio.length; i += 20) {
    if (origen.includes(limpio.slice(i, i + COPIA_MINIMA))) return true;
  }
  return false;
}

/** Las fórmulas tienen que abrir y cerrar. Una a medias se pinta como basura. */
const formulasEquilibradas = (texto) => (String(texto ?? '').match(/\$/g) ?? []).length % 2 === 0;

const entre = (valor, [minimo, maximo]) => valor >= minimo && valor <= maximo;

/**
 * @typedef {object} Problema
 * @property {'rechazo'|'aviso'} nivel
 * @property {string} campo
 * @property {string} mensaje
 */

/**
 * Revisa una pregunta candidata.
 *
 * @param {object} candidata
 * @param {{ cursos: string[], banco?: {enunciado:string}[], fuente?: string }} contexto
 * @returns {{ aceptada: boolean, problemas: Problema[], candidata: object }}
 */
export function revisarCandidata(candidata, { cursos, banco = [], fuente = '' }) {
  const problemas = [];
  const rechazo = (campo, mensaje) => problemas.push({ nivel: 'rechazo', campo, mensaje });
  const aviso = (campo, mensaje) => problemas.push({ nivel: 'aviso', campo, mensaje });

  const enunciado = String(candidata.enunciado ?? '').trim();
  const opciones = Array.isArray(candidata.opciones) ? candidata.opciones.map((o) => String(o).trim()) : [];
  const explicacion = String(candidata.explicacion ?? '').trim();
  const correcta = Number(candidata.correcta);
  const dificultad = Number(candidata.dificultad);

  /* --- Estructura: si falla, no llega al profesor --- */

  if (!entre(enunciado.length, LIMITES.enunciado)) {
    rechazo('enunciado', 'El enunciado está vacío o es desproporcionado.');
  }
  if (opciones.length !== 4) {
    rechazo('opciones', `Tiene ${opciones.length} alternativas en vez de cuatro.`);
  }
  if (opciones.some((o) => !entre(o.length, LIMITES.opcion))) {
    rechazo('opciones', 'Hay alternativas vacías o demasiado largas.');
  }
  if (new Set(opciones.map(normalizar)).size !== opciones.length) {
    rechazo('opciones', 'Hay alternativas repetidas.');
  }
  if (!Number.isInteger(correcta) || correcta < 0 || correcta >= opciones.length) {
    rechazo('correcta', 'No marca cuál es la alternativa correcta.');
  }
  if (!entre(explicacion.length, LIMITES.explicacion)) {
    rechazo('explicacion', 'Falta la explicación o es demasiado corta para enseñar algo.');
  }
  if (!cursos.includes(candidata.cursoId)) {
    rechazo('cursoId', `El curso "${candidata.cursoId}" no está en el temario de esta academia.`);
  }
  if (!entre(String(candidata.temaId ?? '').trim().length, LIMITES.tema)) {
    rechazo('temaId', 'Falta el tema, y sin tema no se puede recomendar material.');
  }
  if (!Number.isFinite(dificultad) || !entre(dificultad, LIMITES.dificultad)) {
    rechazo('dificultad', 'La dificultad estimada está fuera de rango.');
  }

  for (const [campo, texto] of [['enunciado', enunciado], ['explicacion', explicacion]]) {
    if (!formulasEquilibradas(texto)) {
      rechazo(campo, 'Hay una fórmula sin cerrar: se pintaría como texto roto.');
    }
  }
  if (opciones.some((o) => !formulasEquilibradas(o))) {
    rechazo('opciones', 'Hay una alternativa con una fórmula sin cerrar.');
  }

  /* --- Sospechas: llegan marcadas, decide el profesor --- */

  if (copiaLiteral(enunciado, fuente)) {
    aviso('enunciado', 'Parece copiado literalmente del material, no redactado como pregunta.');
  }

  const parecida = banco
    .map((p) => ({ p, s: similitud(enunciado, p.enunciado) }))
    .sort((a, b) => b.s - a.s)[0];
  if (parecida && parecida.s >= UMBRAL_DUPLICADO) {
    aviso('enunciado', `Se parece mucho a una pregunta que ya existe (${Math.round(parecida.s * 100)}%).`);
  }

  if (opciones.length === 4 && correcta >= 0 && correcta < 4) {
    const laCorrecta = opciones[correcta];
    const otras = opciones.filter((_, i) => i !== correcta);
    // Una correcta mucho más larga que el resto es el sesgo clásico de estas
    // preguntas: se acierta por longitud, sin saber el tema.
    const largoOtras = otras.reduce((s, o) => s + o.length, 0) / otras.length;
    if (laCorrecta.length > largoOtras * 2 && laCorrecta.length > 24) {
      aviso('opciones', 'La alternativa correcta es mucho más larga que las demás: se acierta sin saber.');
    }
    // Lo que se busca aquí es la explicación que solo repite la respuesta:
    // "la respuesta es 1/5". La primera versión de esta comprobación exigía
    // conectores causales y marcaba explicaciones correctas que razonaban sin
    // decir "porque" — un falso positivo cuesta atención del profesor, que es
    // justo el recurso que esta puerta existe para proteger.
    const limpia = normalizar(explicacion);
    const soloRepite =
      explicacion.length < 70 &&
      (limpia.includes(normalizar(laCorrecta)) || /^(la )?(respuesta|alternativa|opcion) /.test(limpia));
    if (soloRepite) {
      aviso('explicacion', 'La explicación repite la respuesta en vez de explicar el paso.');
    }
  }

  const conRechazo = problemas.some((p) => p.nivel === 'rechazo');
  return {
    aceptada: !conRechazo,
    problemas,
    candidata: {
      ...candidata,
      enunciado,
      opciones,
      explicacion,
      correcta,
      dificultad,
      origen: 'generado',
    },
  };
}

/**
 * Revisa un lote y separa lo aprovechable de lo descartado.
 *
 * @param {object[]} candidatas
 * @param {{ cursos: string[], banco?: object[], fuente?: string }} contexto
 */
export function revisarLote(candidatas, contexto) {
  const revisadas = candidatas.map((c) => revisarCandidata(c, contexto));

  // Un lote puede traer dos candidatas casi idénticas entre sí. Se compara
  // cada una con las anteriores del propio lote, no solo con el banco.
  const aceptadas = [];
  const duplicadasEnLote = [];
  for (const r of revisadas.filter((x) => x.aceptada)) {
    const choca = aceptadas.some((a) => similitud(a.candidata.enunciado, r.candidata.enunciado) >= UMBRAL_DUPLICADO);
    if (choca) duplicadasEnLote.push(r);
    else aceptadas.push(r);
  }

  return {
    aceptadas,
    rechazadas: revisadas.filter((x) => !x.aceptada),
    duplicadasEnLote,
    resumen: {
      recibidas: candidatas.length,
      aceptadas: aceptadas.length,
      rechazadas: revisadas.filter((x) => !x.aceptada).length,
      duplicadas: duplicadasEnLote.length,
      conAviso: aceptadas.filter((a) => a.problemas.length > 0).length,
    },
  };
}

export const CONSTANTES_GENERACION = Object.freeze({ UMBRAL_DUPLICADO, COPIA_MINIMA });
export { similitud };
