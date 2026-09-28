/**
 * Universidades estatales.
 *
 * Registro único: la sigla, el nombre y la ciudad de cada una viven aquí y en
 * ningún otro sitio. `pruebas/universidades.test.mjs` comprueba que toda
 * universidad del catálogo de metas exista también aquí, para que las dos
 * listas no puedan separarse con el tiempo.
 *
 * **Los logotipos.** El campo `logo` de cada ficha apunta por convención a
 * `imagenes/universidades/<id>.svg`. Suelta ahí el archivo y aparece solo; no
 * hay que tocar código. Mientras no esté, el botón dibuja la sigla como marca
 * tipográfica y la pantalla se ve entera igual, así que se pueden ir poniendo
 * de uno en uno en vez de esperar a tenerlos todos.
 *
 * Las instrucciones de formato y de dónde sacarlos están en el LEEME de esa
 * carpeta. Lo único que conviene recordar aquí: un escudo universitario es una
 * marca registrada, y usarlo para identificar a esa universidad en un listado
 * es legítimo, pero dar a entender que la universidad respalda Umbral no lo es.
 */

/** Ruta por convención. El identificador manda: cambiarlo mueve el archivo. */
export const rutaLogo = (id) => `./imagenes/universidades/${id}.svg`;

/**
 * @typedef {object} Universidad
 * @property {string} id
 * @property {string} sigla       Como la conoce todo el mundo
 * @property {string} nombre      Nombre completo y oficial
 * @property {string} nombreCorto Cómo se escribe cuando no cabe entero
 * @property {string} ciudad
 * @property {string|null} logo   Ruta a la imagen, o null para la marca tipográfica
 */

/** @type {Universidad[]} */
export const UNIVERSIDADES = [
  { id: 'unmsm', sigla: 'UNMSM', nombre: 'Universidad Nacional Mayor de San Marcos', nombreCorto: 'Univ. Nacional Mayor de San Marcos', ciudad: 'Lima', logo: rutaLogo('unmsm') },
  { id: 'uni', sigla: 'UNI', nombre: 'Universidad Nacional de Ingeniería', nombreCorto: 'Universidad Nacional de Ingeniería', ciudad: 'Lima', logo: rutaLogo('uni') },
  { id: 'unac', sigla: 'UNAC', nombre: 'Universidad Nacional del Callao', nombreCorto: 'Univ. Nacional del Callao', ciudad: 'Callao', logo: rutaLogo('unac') },
  { id: 'unfv', sigla: 'UNFV', nombre: 'Universidad Nacional Federico Villarreal', nombreCorto: 'Univ. Nacional Federico Villarreal', ciudad: 'Lima', logo: rutaLogo('unfv') },
  { id: 'unalm', sigla: 'UNALM', nombre: 'Universidad Nacional Agraria La Molina', nombreCorto: 'Univ. Nacional Agraria La Molina', ciudad: 'Lima', logo: rutaLogo('unalm') },
  { id: 'une', sigla: 'UNE', nombre: 'Universidad Nacional de Educación Enrique Guzmán y Valle', nombreCorto: 'Univ. Nac. de Educación (La Cantuta)', ciudad: 'Lima', logo: rutaLogo('une') },
  { id: 'unt', sigla: 'UNT', nombre: 'Universidad Nacional de Trujillo', nombreCorto: 'Universidad Nacional de Trujillo', ciudad: 'Trujillo', logo: rutaLogo('unt') },
  { id: 'unprg', sigla: 'UNPRG', nombre: 'Universidad Nacional Pedro Ruiz Gallo', nombreCorto: 'Univ. Nac. Pedro Ruiz Gallo (Lambayeque)', ciudad: 'Lambayeque', logo: rutaLogo('unprg') },
  { id: 'unp', sigla: 'UNP', nombre: 'Universidad Nacional de Piura', nombreCorto: 'Universidad Nacional de Piura', ciudad: 'Piura', logo: rutaLogo('unp') },
  { id: 'unc', sigla: 'UNC', nombre: 'Universidad Nacional de Cajamarca', nombreCorto: 'Universidad Nacional de Cajamarca', ciudad: 'Cajamarca', logo: rutaLogo('unc') },
  { id: 'unsa', sigla: 'UNSA', nombre: 'Universidad Nacional de San Agustín', nombreCorto: 'Univ. Nac. de San Agustín (Arequipa)', ciudad: 'Arequipa', logo: rutaLogo('unsa') },
  { id: 'unsaac', sigla: 'UNSAAC', nombre: 'Universidad Nacional de San Antonio Abad del Cusco', nombreCorto: 'Univ. Nac. San Antonio Abad (Cusco)', ciudad: 'Cusco', logo: rutaLogo('unsaac') },
];

/** @param {string} id */
export const universidadPorId = (id) => UNIVERSIDADES.find((u) => u.id === id) ?? null;
