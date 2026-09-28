/**
 * Extracción de cifras desde el texto de un documento.
 *
 * Recibe texto plano —el que devuelve el OCR de una imagen o la lectura de un
 * PDF— y saca de ahí las filas de carrera, vacantes, postulantes y corte.
 *
 * Está separado del raspado a propósito. Bajar el archivo necesita red y un
 * modelo; leer el texto no necesita nada, así que esta parte se prueba entera
 * sin conexión con textos guardados. Es la mitad del trabajo que puede tener
 * pruebas de verdad, y es donde se cometen los errores.
 *
 * **Lo que este archivo NO hace es decidir si un número es correcto.** Eso es
 * `domain/admision.js`, y después una persona. Aquí solo se lee lo que hay,
 * incluso cuando es absurdo: un corte de 4.200 se extrae tal cual y se rechaza
 * más adelante, porque tapar el disparate aquí escondería que el OCR falla.
 */

/** Un número peruano: 1.234 o 1,234 o 1234. */
const CIFRA = String.raw`\d{1,3}(?:[.,]\d{3})*|\d+`;

const aNumero = (texto) => {
  const limpio = String(texto ?? '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.');
  const n = Number(limpio);
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Normaliza el nombre de una carrera a un identificador estable.
 * "Ingeniería de Sistemas" → "ingenieria-de-sistemas"
 */
export const idDeCarrera = (nombre) => String(nombre ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Cómo nombra San Marcos cada área en las cabeceras de sus actas. */
const AREAS = [
  { letra: 'A', patron: /\b[áa]rea\s*A\b|ciencias\s+de\s+la\s+salud/i },
  { letra: 'B', patron: /\b[áa]rea\s*B\b|ciencias\s+b[áa]sicas/i },
  { letra: 'C', patron: /\b[áa]rea\s*C\b|ingenier[íi]as?\b/i },
  { letra: 'D', patron: /\b[áa]rea\s*D\b|ciencias\s+econ[óo]micas/i },
  { letra: 'E', patron: /\b[áa]rea\s*E\b|humanidades/i },
];

/**
 * El área del documento, sacada de su cabecera.
 *
 * Devuelve `null` cuando no aparece, y eso es lo correcto: antes el raspador
 * recorría las cuatro áreas releyendo la misma tabla, así que producía cuatro
 * copias de cada carrera con un área distinta cada una. La deduplicación se
 * quedaba con la primera y **toda carrera terminaba etiquetada como área A**,
 * incluidas las ingenierías. Sin cabecera es mejor no saberlo: un área nula la
 * rechaza la puerta, y una inventada se publica.
 *
 * @param {string} texto
 * @returns {string|null}
 */
export function areaDe(texto) {
  const cabecera = String(texto ?? '').slice(0, 600);
  const encontradas = AREAS.filter((a) => a.patron.test(cabecera));
  // Dos áreas en la misma cabecera significa que no se sabe de cuál es.
  return encontradas.length === 1 ? encontradas[0].letra : null;
}

/**
 * Filas de "carrera · vacantes · postulantes · corte".
 *
 * El OCR devuelve las tablas como líneas sueltas donde las columnas quedaron
 * separadas por espacios de anchura imprevisible. Por eso se busca el patrón
 * "texto seguido de tres números al final de la línea" en vez de intentar
 * reconstruir columnas: reconstruirlas exige saber dónde estaban, y eso no
 * sobrevive a una imagen torcida.
 *
 * @param {string} texto
 * @param {{ proceso:string, area:string, fuente:string, obtenido?:number }} contexto
 */
export function filasDeCarrera(texto, contexto) {
  // Si quien llama no sabe el área, se lee del propio documento. Nunca se
  // rellena con un valor por defecto.
  const area = contexto.area ?? areaDe(texto);

  const patron = new RegExp(
    String.raw`^\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ().,\-\s/]{6,80}?)\s+(${CIFRA})\s+(${CIFRA})\s+(${CIFRA})\s*$`,
    'gm',
  );

  const filas = [];
  for (const m of String(texto ?? '').matchAll(patron)) {
    const carrera = m[1].replace(/\s+/g, ' ').trim();
    // Una línea de encabezado también encaja con el patrón; se descarta por el
    // nombre, no por la posición, porque el OCR se salta líneas.
    if (/^(carrera|escuela|total|área|area|codigo|código)\b/i.test(carrera)) continue;

    filas.push({
      universidadId: 'unmsm',
      proceso: contexto.proceso,
      area,
      carrera,
      carreraId: idDeCarrera(carrera),
      vacantes: aNumero(m[2]),
      postulantes: aNumero(m[3]),
      corte: aNumero(m[4]),
      fuente: contexto.fuente,
      obtenido: contexto.obtenido ?? Date.now(),
    });
  }
  return filas;
}

/**
 * Meses en español, con las dos grafías de septiembre.
 *
 * Antes esto era una lista y el número salía de la posición, restando uno a
 * partir de "setiembre". Funcionaba para la fecha y mentía en el nombre: un
 * examen del 4 de octubre quedaba guardado como "setiembre". La fecha era
 * correcta, pero el nombre es lo que lee una persona, y presentarse un mes
 * antes no es un detalle. Un mapa explícito no puede tener ese fallo.
 */
const MESES = new Map([
  ['enero', 0], ['febrero', 1], ['marzo', 2], ['abril', 3], ['mayo', 4], ['junio', 5],
  ['julio', 6], ['agosto', 7], ['septiembre', 8], ['setiembre', 8],
  ['octubre', 9], ['noviembre', 10], ['diciembre', 11],
]);

/** El nombre canónico de cada mes, por número. */
const NOMBRE_DEL_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const mesDe = (nombre) => MESES.get(String(nombre).toLowerCase()) ?? NaN;

/**
 * Fechas de examen por área.
 *
 * El portal las publica en frases del tipo "Sábado 7 de marzo: Área D". Se
 * extrae el día, el mes y las áreas mencionadas en la misma línea.
 *
 * El año **no** aparece casi nunca en esas frases, así que entra por contexto y
 * no se adivina: adivinarlo pone el examen a doce meses de distancia y el
 * contador de días de la pantalla de meta se vuelve una broma.
 *
 * @param {string} texto
 * @param {{ año:number }} contexto
 */
export function fechasDeExamen(texto, { año, fuente = null }) {
  const patron = new RegExp(
    String.raw`(\d{1,2})\s+de\s+(${[...MESES.keys()].join('|')})[^\n:]*:?\s*([^\n]*)`,
    'gi',
  );

  const fechas = [];
  for (const m of String(texto ?? '').matchAll(patron)) {
    const dia = Number(m[1]);
    const mes = mesDe(m[2]);
    if (!Number.isFinite(dia) || !Number.isFinite(mes) || dia < 1 || dia > 31) continue;

    const areas = [...new Set([...m[3].matchAll(/[áa]rea\s+([A-E])\b/gi)].map((a) => a[1].toUpperCase()))];
    if (!areas.length) continue;

    fechas.push({
      fecha: Date.UTC(año, mes, dia),
      dia,
      mes: NOMBRE_DEL_MES[mes],
      areas,
      fuente,
      textoOriginal: m[0].replace(/\s+/g, ' ').trim(),
    });
  }
  return fechas.sort((a, b) => a.fecha - b.fecha);
}

/**
 * Total de vacantes de la convocatoria, si el documento lo declara.
 * Sirve de contraste: si la suma de las filas se aleja mucho del total
 * publicado, la lectura se dejó carreras por el camino.
 *
 * @param {string} texto
 * @returns {number|null}
 */
export function totalDeVacantes(texto) {
  const m = String(texto ?? '').match(new RegExp(String.raw`(${CIFRA})\s+vacantes`, 'i'));
  if (!m) return null;
  const n = aNumero(m[1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Contrasta la lectura contra el total publicado.
 *
 * Es la comprobación que caza el fallo más silencioso del OCR: no leer mal una
 * cifra, sino saltarse filas enteras. Las que sí leyó son correctas, así que
 * ninguna validación por fila lo detecta.
 *
 * @param {{vacantes:number}[]} filas
 * @param {number|null} totalPublicado
 */
export function cuadraElTotal(filas, totalPublicado) {
  if (!totalPublicado) return { comprobable: false };
  const suma = filas.reduce((s, f) => s + (Number(f.vacantes) || 0), 0);
  const desvio = Math.abs(suma - totalPublicado) / totalPublicado;
  return {
    comprobable: true,
    suma,
    totalPublicado,
    cuadra: desvio <= 0.02,
    mensaje: desvio <= 0.02
      ? null
      : `Las filas leídas suman ${suma} vacantes y el documento declara ${totalPublicado}: la lectura se saltó carreras.`,
  };
}
