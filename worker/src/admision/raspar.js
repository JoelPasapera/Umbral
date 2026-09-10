/**
 * El raspador.
 *
 * Corre en el Worker, no en el navegador. Dos razones, y la primera es
 * insalvable: desde `umbral-buc.pages.dev` un `fetch` a `admision.unmsm.edu.pe`
 * lo bloquea el navegador por CORS, y la OCA no va a añadir una cabecera para
 * nosotros. La segunda es de buena vecindad: se pasa una vez al día desde un
 * solo sitio, no una vez por alumno que abre la aplicación.
 *
 * El recorrido:
 *
 *   1. Se trae el portal y se compara su huella con la de ayer. **Si no
 *      cambió, se para aquí.** Es el ahorro grande: casi todos los días no
 *      cambia nada, y no bajar cincuenta PDFs para descubrirlo es la
 *      diferencia entre ser un visitante y ser una molestia.
 *   2. Se localiza la convocatoria vigente, cuya dirección cambia cada ciclo.
 *   3. Se bajan sus documentos y se pasan por OCR. En este portal las fechas y
 *      las vacantes están pintadas dentro de JPGs, así que sin OCR no hay nada
 *      que leer.
 *   4. Se extraen las cifras y **se validan**.
 *   5. Lo que sobrevive va a una cola de revisión. **Nada se publica solo.**
 *
 * Ese último paso no es prudencia de más. El OCR confunde un 1 con un 7 y el
 * número resultante es perfectamente creíble: no hay error que capturar, solo
 * una cifra equivocada con buena pinta. Y el corte alimenta `readiness.js`, que
 * produce el único número del que vive Umbral. Publicar sin que nadie mire
 * convierte "te faltan 14 puntos" en una mentira que el alumno no puede
 * detectar, y ahí se acaba el producto.
 */

import { PORTAL, convocatoriasEn, documentosEn, huellaDePagina } from './descubrir.js';
import { filasDeCarrera, fechasDeExamen, totalDeVacantes, cuadraElTotal } from './extraer.js';
import { revisarTanda } from '../../../src/domain/admision.js';
import { admision } from '../ambito.js';

/** Cuántos documentos se bajan por pasada. Un tope, no un objetivo. */
const TOPE_DOCUMENTOS = 25;

/** Nos identificamos. Un raspador anónimo no le da a nadie a quién escribir. */
const AGENTE = 'UmbralBot/1.0 (+https://umbral.pe/bot) contacto por la web';

/**
 * Texto de un documento.
 *
 * Los PDF traen su texto dentro cuando no son un escaneo. Las imágenes hay que
 * pasarlas por un modelo, y para eso está Workers AI, que corre en la misma
 * plataforma y no necesita otra clave ni otro proveedor.
 *
 * @param {{url:string, tipo:string}} doc
 * @param {object} env
 * @returns {Promise<string>}
 */
async function textoDe(doc, env) {
  const respuesta = await fetch(doc.url, { headers: { 'User-Agent': AGENTE } });
  if (!respuesta.ok) throw new Error(`${respuesta.status} al bajar ${doc.url}`);

  // El cuerpo se lee UNA vez y se guarda. La versión anterior lo consumía para
  // intentar el PDF y después llamaba a `clone()` para el OCR, que lanza
  // "Body has already been consumed". El efecto era que justo los PDF
  // escaneados —los que necesitan OCR, o sea la mayoría de las actas— morían
  // ahí en vez de caer al camino de imagen.
  const bytes = new Uint8Array(await respuesta.arrayBuffer());

  if (doc.tipo === 'pdf') {
    // Un PDF de texto se lee directo. Uno escaneado devuelve casi nada.
    const crudo = new TextDecoder('latin1').decode(bytes);
    const trozos = [...crudo.matchAll(/\((?:[^()\\]|\\.)*\)/g)].map((m) => m[0].slice(1, -1));
    const texto = trozos.join(' ').replace(/\\(\d{3}|.)/g, ' ');
    if (texto.trim().length > 200) return texto;
  }

  const imagen = [...bytes];
  const salida = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
    image: imagen,
    prompt: 'Transcribe literalmente todo el texto y todas las tablas de esta imagen. '
      + 'No interpretes, no resumas y no completes lo que no se lea con claridad: '
      + 'donde no puedas leer un número, escribe ???. Conserva las filas en líneas separadas.',
    max_tokens: 4096,
  });
  return String(salida?.response ?? '');
}

/**
 * Una pasada completa.
 *
 * @param {object} env con DB (D1) y AI (Workers AI)
 * @param {{ forzar?: boolean, ahora?: number }} [opciones]
 */
export async function pasada(env, { forzar = false, ahora = Date.now() } = {}) {
  const portal = await fetch(PORTAL, { headers: { 'User-Agent': AGENTE } });
  if (!portal.ok) return { estado: 'portal-caido', codigo: portal.status };

  const html = await portal.text();
  const huella = await huellaDePagina(html);

  const almacen = admision(env.DB);
  const previa = await almacen.huellaDe(PORTAL);

  if (!forzar && previa === huella) {
    return { estado: 'sin-cambios', huella };
  }

  const convocatorias = convocatoriasEn(html);
  if (!convocatorias.length) {
    // Que no aparezca ninguna es señal de que el portal se rediseñó. Se avisa
    // en vez de devolver una tanda vacía como si no hubiera novedades: lo
    // segundo se confunde con "todo en orden" y el raspador queda muerto sin
    // que nadie lo note.
    return { estado: 'sin-convocatorias', aviso: 'El portal cambió de forma: revisa `descubrir.js`.' };
  }

  const vigente = convocatorias[0];
  const paginaConv = await fetch(vigente.url, { headers: { 'User-Agent': AGENTE } });
  const htmlConv = paginaConv.ok ? await paginaConv.text() : '';
  const documentos = documentosEn(htmlConv, vigente.url).slice(0, TOPE_DOCUMENTOS);

  const año = Number(vigente.proceso.slice(0, 4));
  const filas = [];
  const fechas = [];
  const ilegibles = [];
  let totalPublicado = null;

  for (const doc of documentos) {
    try {
      const texto = await textoDe(doc, env);
      totalPublicado ??= totalDeVacantes(texto);
      fechas.push(...fechasDeExamen(texto, { año, fuente: doc.url }));
      // El área sale de la cabecera del propio documento. Recorrer las áreas
      // aquí producía cuatro copias de cada carrera con un área inventada.
      filas.push(...filasDeCarrera(texto, { proceso: vigente.proceso, fuente: doc.url, obtenido: ahora }));
    } catch (error) {
      ilegibles.push({ url: doc.url, motivo: error.message });
    }
  }

  const anteriores = await almacen.cortesAnteriores('unmsm');

  const revision = revisarTanda(filas, { anteriores });
  const total = cuadraElTotal(revision.aRevisar.map((r) => r.registro), totalPublicado);

  await almacen.anotarHuella(PORTAL, huella, ahora);
  for (const { registro, problemas } of revision.aRevisar) {
    await almacen.guardarLectura(registro, problemas);
  }
  // Las fechas también se guardaban... o eso creía: se extraían y se
  // devolvían en el resultado, pero nadie las escribía. La tabla existía
  // vacía y el cronograma no habría aparecido nunca.
  for (const f of fechas) {
    await almacen.guardarFecha({
      universidadId: 'unmsm', proceso: vigente.proceso, fecha: f.fecha,
      areas: f.areas.join(','), fuente: f.fuente ?? vigente.url, obtenido: ahora,
    });
  }

  return {
    estado: 'raspado',
    convocatoria: vigente.proceso,
    documentos: documentos.length,
    ilegibles,
    fechas,
    total,
    ...revision.resumen,
    // Se dice en el resultado para que no se olvide: esto está en una cola,
    // no en la aplicación.
    publicado: 0,
    aviso: revision.resumen.aRevisar > 0
      ? `${revision.resumen.aRevisar} filas esperan que alguien las confirme. Ningún alumno las ve todavía.`
      : null,
  };
}
