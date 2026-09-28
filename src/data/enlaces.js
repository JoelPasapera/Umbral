/**
 * Enlaces.
 *
 * **El único archivo que hay que tocar para poner o cambiar un enlace.** Cada
 * línea es un hueco: a la izquierda su identificador, en medio el enlace entre
 * comillas, y a la derecha qué es. Pegas la dirección entre las comillas y
 * listo; no hay que tocar títulos, licencias ni nada más.
 *
 *     'ex-unmsm-2026-1-area-d': 'https://drive.google.com/file/d/1AbC…/view',
 *
 * Un hueco vacío no rompe nada: la pantalla dice "pendiente" en ese sitio en
 * vez de llevar al alumno a una página que no existe.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * TRES COSAS QUE CONVIENE SABER UNA VEZ
 *
 * **Enlaces de archivo sí, de carpeta no.** Un enlace a un archivo de Drive
 * (`drive.google.com/file/d/…`) funciona. Uno a una carpeta
 * (`drive.google.com/drive/folders/…`) se rechaza y no se muestra: deja al
 * alumno en un listado donde tiene que buscar, y una carpeta compartida es
 * justo como se montan las bibliotecas de escaneos. Para dar acceso a un
 * archivo: botón derecho en Drive → Compartir → "Cualquier persona con el
 * enlace" → Copiar enlace.
 *
 * **Si te equivocas de identificador, la prueba te avisa.** `pruebas/enlaces
 * .test.mjs` falla si hay una línea que no corresponde a ningún material: un
 * enlace pegado bajo un nombre mal escrito no aparecería nunca y no daría
 * ningún error.
 *
 * **Los libros de editorial no están aquí.** Las 21 fichas de `libros.js`
 * siguen esperando que se resuelva de dónde salen —licencia digital,
 * sustitución por dominio público o material propio—. Hasta entonces no se
 * muestran aunque tengan enlace, así que ponerles hueco aquí solo invitaría a
 * pegar algo que no llegaría a verse.
 * ────────────────────────────────────────────────────────────────────────────
 */

/** @type {Record<string, string>} */
export const ENLACES = {
  // ── Exámenes y simulacros, en la página de quien los publica ──────────

  // UNMSM · Universidad Nacional Mayor de San Marcos
  'ex-unmsm-2026-2': 'https://sacooliveros.edu.pe/academias/solucionarios/san-marcos', // 2026-II · Examen de admisión 2026-II
  'ex-unmsm-2026-1': 'https://savia.school/solucionario-2026-san-marcos/',     // 2026-I · Examen de admisión 2026-I
  'ex-unmsm-2026-1-examenes': 'https://savia.school/descargar-examenes-admision-san-marcos-2026-i/', // 2026-I · Exámenes oficiales 2026-I para descargar
  'ex-unmsm-archivo-trilce': 'https://www.trilce.edu.pe/academia/solucionarios-san-marcos', // Años anteriores · Solucionarios de exámenes anteriores
  'ex-unmsm-simulacro-2027-1': 'https://admision.unmsm.edu.pe/portal/simulacro-presencial-2027-i/', // 2027-I · Simulacro presencial oficial 2027-I

  // UNI · Universidad Nacional de Ingeniería
  'ex-uni-archivo': 'https://www.trilce.edu.pe/academia/solucionarios-uni',    // Años anteriores · Solucionarios de exámenes de admisión de la UNI

  // UNAC · Universidad Nacional del Callao
  'ex-unac-archivo': 'https://sacooliveros.edu.pe/academias/solucionarios/callao', // Años anteriores · Solucionarios de exámenes de admisión de la UNAC

  // ── Recursos de cada curso ────────────────────────────────────────────

  // geometria
  'lc-geometria-playfair': 'https://archive.org/details/elementsofgeomet00john', // Elements of Geometry
  'mc-geometria-khan': 'https://es.khanacademy.org/math/geometria-pe-pre-u',   // Geometría · Preparación para la educación superior

  // trigonometria
  'lc-trigonometria-blackburn': 'https://www.gutenberg.org/files/32973/32973-pdf.pdf', // Elements of Plane Trigonometry
  'lc-trigonometria-openstax': 'https://espanol.libretexts.org/Bookshelves/Matematicas/Algebra/Libro%3A_Algebra_y_Trigonometria_(OpenStax)', // Álgebra y trigonometría · OpenStax
  'mc-trigonometria-khan': 'https://es.khanacademy.org/math/trigonometria-pe-pre-u', // Trigonometría · Preparación para la educación superior
  'mc-trigonometria-khan-alg2': 'https://es.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:trig', // Trigonometría en Álgebra 2

  // habilidad-matematica
  'lc-habilidad-matematica-rp5': 'https://repositorio.minedu.gob.pe/handle/20.500.12799/7926', // Resolvamos problemas 5 · cuaderno de trabajo
  'lc-habilidad-matematica-rp5-docente': 'https://repositorio.minedu.gob.pe/handle/20.500.12799/5835', // Resolvamos problemas 5 · manual para el docente
  'mc-habilidad-matematica-khan': 'https://es.khanacademy.org/math/razonamiento-matematico-pe-pre-u', // Razonamiento matemático · Preparación para la educación superior
  'mc-habilidad-matematica-khan-hub': 'https://es.khanacademy.org/math/matematicas-preparacion-educacion-superior', // Matemáticas · Preparación para la educación superior

  // aritmetica
  'lc-aritmetica-rp5': 'https://repositorio.minedu.gob.pe/handle/20.500.12799/6867', // Resolvamos problemas 5 · edición 2020
  'mc-aritmetica-khan': 'https://es.khanacademy.org/math/aritmetica-pe-pre-u', // Aritmética · Preparación para la educación superior

  // algebra
  'lc-algebra-openstax': 'https://espanol.libretexts.org/Bookshelves/Matematicas/Algebra/Libro%3A_Algebra_y_Trigonometria_(OpenStax)', // Álgebra y trigonometría · OpenStax
  'lc-algebra-precalculo': 'https://openstax.org/details/books/prec%C3%A1lculo-2ed', // Precálculo 2ed · OpenStax
  'mc-algebra-khan-1': 'https://es.khanacademy.org/math/algebra-i-pe-pre-u',   // Álgebra I · Preparación para la educación superior
  'mc-algebra-khan-2': 'https://es.khanacademy.org/math/algebra-ii-pe-pre-u',  // Álgebra II · Preparación para la educación superior

  // fisica
  'lc-fisica-openstax-2': 'https://openstax.org/details/books/f%C3%ADsica-universitaria-volumen-2', // Física universitaria · volumen 2
  'lc-fisica-openstax-3': 'https://openstax.org/details/books/f%C3%ADsica-universitaria-volumen-3', // Física universitaria · volumen 3
  'mc-fisica-khan': 'https://es.khanacademy.org/science/ciencias-preparacion-educacion-superior/fisica-pe-pre-u', // Física · Preparación para la educación superior
  'mc-fisica-khan-ciencias': 'https://es.khanacademy.org/science/ciencias-preparacion-educacion-superior', // Ciencias · Preparación para la educación superior

  // quimica
  'lc-quimica-openstax': 'https://openstax.org/details/books/qu%C3%ADmica-2ed', // Química 2ed · OpenStax
  'mc-quimica-khan': 'https://es.khanacademy.org/science/quimica-pe-pre-u',    // Química · Preparación para la educación superior

  // ── Materiales sueltos de la biblioteca ───────────────────────────────
  'enl-trig-identidades': 'https://archive.org/details/planetrigonometr01lone', // Trigonometría · Plana
  'vid-trig-razones': 'https://es.khanacademy.org/math/trigonometry',          // Razones trigonométricas en el triángulo rectángulo
  'enl-fis-problemas': 'https://es.khanacademy.org/science/ciencias-preparacion-educacion-superior/fisica-pe-pre-u', // Banco de problemas de cinemática
  'enl-alg-exponentes': 'https://archive.org/details/elementsofalgebr00eule',  // Álgebra · Elementos
  'enl-hm-cantidad': 'https://sacooliveros.edu.pe/academias/solucionarios/san-marcos', // Preguntas de cantidad en los últimos exámenes
  'enl-unmsm-prospecto': 'https://www.gob.pe/institucion/unmsm/informes-publicaciones/1889987-reglamento-de-admision', // Reglamento de Admisión de la UNMSM
  'enl-geo-euclides': 'https://www.gutenberg.org/files/21076/21076-h/21076-h.htm', // Geometría · Elementos I–IV
};

/**
 * El enlace de un material, o `null` si su hueco está vacío.
 *
 * `null` y no la cadena vacía, porque la pantalla distingue "no hay enlace" de
 * "hay uno" y una cadena vacía en un `href` recarga la página actual, que es
 * justo lo que no debe pasar al pulsar "Abrir".
 *
 * @param {string} id
 * @returns {string|null}
 */
export function enlaceDe(id) {
  const url = String(ENLACES[id] ?? '').trim();
  return url || null;
}

/** Cuántos huecos siguen vacíos, para poder decirlo con una cifra. */
export const pendientes = () => Object.values(ENLACES).filter((u) => !String(u).trim()).length;
