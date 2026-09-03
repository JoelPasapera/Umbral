/**
 * Administración.
 *
 * La regla que gobierna el archivo: **cada función empieza autorizando**.
 * No hay una comprobación al abrir el panel y luego confianza. Si alguien
 * llama a estas funciones desde la consola sin un token de administrador,
 * fallan igual.
 *
 * Las otras tres decisiones vienen de errores concretos de la versión
 * anterior:
 *
 * - Borrar es archivar. Nada desaparece de verdad, así que un clic accidental
 *   se deshace. La versión anterior borraba en firme tras un `confirm()`.
 *
 * - Reordenar es una sola operación. La anterior hacía dos escrituras por
 *   página, en serie: ochenta viajes de ida y vuelta para un resumen de
 *   cuarenta páginas, y si se cortaba a medias el resumen quedaba roto.
 *
 * - El texto se normaliza al entrar, no al pintar. La anterior tenía una tabla
 *   que reparaba acentos rotos al mostrarlos, mientras la base de datos seguía
 *   con los datos corruptos.
 */

import { usuarioDeSesion } from './auth.js';
import { gestionaContenido } from './tenants.js';

/** Identificador de la biblioteca común que trae el producto. */
export const BASE = 'base';

/** Estado del catálogo administrable. Aquí sustituye a las tablas. */
const preguntas = [];
const materiales = [];
const registro = [];

let contador = 0;
const nuevoId = (prefijo) => `${prefijo}-${(contador += 1)}`;

/**
 * Autoriza o corta. Devuelve el usuario para poder registrar quién hizo qué.
 * @param {string} token
 */
async function autorizar(token) {
  const usuario = await usuarioDeSesion({ token });
  if (!usuario) throw new Error('Tu sesión venció. Vuelve a entrar.');
  if (!gestionaContenido(usuario.rol)) {
    throw new Error('Esta acción es solo para profesores y coordinación.');
  }
  return usuario;
}

/**
 * Busca un elemento **dentro de la academia de quien pregunta**.
 *
 * Esta función es la frontera entre clientes. Si buscara por id a secas, el
 * profesor de una academia podría publicar, archivar o reordenar el contenido
 * de otra con solo conocer un identificador. Nunca se busca sin academia.
 */
function buscarEnAcademia(id, academiaId) {
  const encontrado =
    preguntas.find((p) => p.id === id) ?? materiales.find((m) => m.id === id);
  if (!encontrado || encontrado.academiaId !== academiaId) return null;
  return encontrado;
}

/**
 * Normaliza texto al guardarlo.
 *
 * Quita caracteres de control, recorta, y unifica la forma Unicode. Esto
 * último es lo que evita los acentos rotos: si entra bien, no hay nada que
 * reparar después.
 */
function limpiar(valor, maximo) {
  return String(valor ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maximo);
}

function anotar(usuario, accion, detalle) {
  registro.unshift({
    quien: usuario.correo,
    academiaId: usuario.academiaId,
    accion,
    detalle,
    cuando: Date.now(),
  });
  registro.length = Math.min(registro.length, 200);
}

/**
 * Lo que el panel debe *ver*: lo propio más el banco base.
 *
 * El banco base tiene que contarse aunque no se pueda editar. Si no, la
 * cobertura le diría a una academia "no tienes preguntas de trigonometría"
 * cuando sus alumnos sí las están practicando, y mandaría a su profesor a
 * redactar contenido que ya existe.
 */
const vivos = (lista, academiaId) =>
  lista
    .filter((x) => !x.archivado && (x.academiaId === academiaId || x.academiaId === BASE))
    .map((x) => ({ ...x, editable: x.academiaId === academiaId }));

/* ---------- Lectura ---------- */

/** @param {{ token:string }} params */
export async function panelCompleto({ token }) {
  const usuario = await autorizar(token);
  const mio = (x) => x.academiaId === usuario.academiaId;
  return {
    academia: usuario.academia,
    rol: usuario.rol,
    preguntas: vivos(preguntas, usuario.academiaId),
    materiales: vivos(materiales, usuario.academiaId),
    archivados: [...preguntas, ...materiales].filter((x) => mio(x) && x.archivado).length,
    registro: registro.filter((r) => r.academiaId === usuario.academiaId).slice(0, 20),
  };
}

/* ---------- Preguntas ---------- */

function validarPregunta(datos) {
  const enunciado = limpiar(datos.enunciado, 1200);
  const opciones = (Array.isArray(datos.opciones) ? datos.opciones : []).map((o) => limpiar(o, 500));
  const explicacion = limpiar(datos.explicacion, 2000);
  const correcta = Number(datos.correcta);

  if (!enunciado) throw new Error('Escribe el enunciado.');
  if (opciones.length !== 4 || opciones.some((o) => !o)) throw new Error('Completa las cuatro alternativas.');
  if (new Set(opciones).size !== 4) throw new Error('Las cuatro alternativas deben ser distintas.');
  if (!Number.isInteger(correcta) || correcta < 0 || correcta > 3) {
    throw new Error('Marca cuál es la alternativa correcta.');
  }
  if (!explicacion) throw new Error('Escribe la explicación. Sin ella el alumno falla y no aprende por qué.');
  if (!datos.cursoId) throw new Error('Elige el curso.');
  if (!limpiar(datos.temaId, 60)) throw new Error('Escribe el tema.');

  const dificultad = Number(datos.dificultad);
  if (!Number.isFinite(dificultad) || dificultad <= 0 || dificultad >= 1) {
    throw new Error('La dificultad va entre 0 y 1: es la proporción de alumnos que la acierta.');
  }

  return {
    enunciado,
    opciones,
    correcta,
    explicacion,
    cursoId: datos.cursoId,
    temaId: limpiar(datos.temaId, 60),
    dificultad,
    publicado: datos.publicado === true,
    // La procedencia se conserva de por vida. Si mañana se descubre que una
    // tanda generada salió mal, hay que poder encontrarlas todas y retirarlas.
    origen: datos.origen === 'generado' ? 'generado' : 'manual',
  };
}

/** @param {{ token:string } & object} params */
export async function crearPregunta({ token, ...datos }) {
  const usuario = await autorizar(token);
  const limpia = validarPregunta(datos);
  // La academia sale del usuario autenticado, nunca de `datos`.
  const pregunta = {
    id: nuevoId('q'),
    ...limpia,
    academiaId: usuario.academiaId,
    archivado: false,
    creado: Date.now(),
  };
  preguntas.push(pregunta);
  anotar(
    usuario,
    pregunta.origen === 'generado' ? 'aprobó una pregunta generada' : 'creó una pregunta',
    pregunta.enunciado.slice(0, 60),
  );
  return pregunta;
}

/** @param {{ token:string, id:string } & object} params */
export async function editarPregunta({ token, id, ...datos }) {
  const usuario = await autorizar(token);
  const pregunta = buscarEnAcademia(id, usuario.academiaId);
  if (!pregunta || pregunta.archivado || !pregunta.opciones) {
    throw new Error('Esa pregunta no existe.');
  }
  Object.assign(pregunta, validarPregunta({ ...pregunta, ...datos }));
  anotar(usuario, 'editó una pregunta', pregunta.enunciado.slice(0, 60));
  return pregunta;
}

/* ---------- Material ---------- */

/** @param {{ token:string } & object} params */
export async function crearMaterial({ token, ...datos }) {
  const usuario = await autorizar(token);
  const titulo = limpiar(datos.titulo, 160);
  if (!titulo) throw new Error('Escribe el título.');
  if (!datos.cursoId) throw new Error('Elige el curso.');
  if (!limpiar(datos.temaId, 60)) throw new Error('Escribe el tema.');

  let url = null;
  if (datos.tipo !== 'resumen') {
    try {
      const parseada = new URL(String(datos.url));
      if (!['http:', 'https:'].includes(parseada.protocol)) throw new Error('protocolo');
      url = parseada.href;
    } catch {
      throw new Error('El enlace tiene que empezar por http o https.');
    }
  }

  const material = {
    id: nuevoId('m'),
    academiaId: usuario.academiaId,
    tipo: datos.tipo ?? 'enlace',
    titulo,
    detalle: limpiar(datos.detalle, 500),
    fuente: limpiar(datos.fuente, 100) || null,
    cursoId: datos.cursoId,
    temaId: limpiar(datos.temaId, 60),
    minutos: Math.max(1, Math.min(Number(datos.minutos) || 10, 600)),
    url,
    publicado: datos.publicado === true,
    archivado: false,
    creado: Date.now(),
  };
  materiales.push(material);
  anotar(usuario, 'agregó material', titulo);
  return material;
}

/* ---------- Publicar, archivar, restaurar ---------- */

/** @param {{ token:string, id:string, publicado:boolean }} params */
export async function cambiarPublicacion({ token, id, publicado }) {
  const usuario = await autorizar(token);
  const item = buscarEnAcademia(id, usuario.academiaId);
  if (!item || item.archivado) throw new Error('Ese elemento no existe.');
  item.publicado = publicado === true;
  anotar(usuario, publicado ? 'publicó' : 'ocultó', item.titulo ?? item.enunciado?.slice(0, 60));
  return item;
}

/**
 * Archivar en vez de borrar.
 *
 * Nada se pierde, así que no hace falta un `confirm()` que la gente acepta sin
 * leer. Si se equivocó, restaura.
 *
 * @param {{ token:string, id:string }} params
 */
export async function archivar({ token, id }) {
  const usuario = await autorizar(token);
  const item = buscarEnAcademia(id, usuario.academiaId);
  if (!item) throw new Error('Ese elemento no existe.');
  item.archivado = true;
  item.publicado = false;
  anotar(usuario, 'archivó', item.titulo ?? item.enunciado?.slice(0, 60));
  return { id, restaurable: true };
}

/** @param {{ token:string, id:string }} params */
export async function restaurar({ token, id }) {
  const usuario = await autorizar(token);
  const item = buscarEnAcademia(id, usuario.academiaId);
  if (!item) throw new Error('Ese elemento no existe.');
  item.archivado = false;
  anotar(usuario, 'restauró', item.titulo ?? item.enunciado?.slice(0, 60));
  return item;
}

/**
 * Reordena en una sola operación.
 *
 * Recibe el orden completo y lo aplica de golpe. La versión anterior mandaba
 * dos escrituras por elemento, en serie, y dejaba el conjunto inconsistente si
 * se cortaba a la mitad.
 *
 * @param {{ token:string, ids:string[] }} params
 */
export async function reordenar({ token, ids }) {
  const usuario = await autorizar(token);
  if (!Array.isArray(ids)) throw new Error('Orden no válido.');

  const encontrados = ids.map((id) => buscarEnAcademia(id, usuario.academiaId));
  if (encontrados.some((x) => !x)) throw new Error('El orden incluye elementos que ya no existen.');

  encontrados.forEach((item, indice) => {
    item.orden = (indice + 1) * 10;
  });
  anotar(usuario, 'reordenó', `${ids.length} elementos`);
  return { aplicados: ids.length };
}

/** Semilla para que el panel no arranque vacío en la maqueta. */
export function sembrar(items, academiaId) {
  for (const item of items) {
    const base = { archivado: false, academiaId, ...item };
    if (item.opciones) preguntas.push({ id: nuevoId('q'), ...base });
    else materiales.push({ id: nuevoId('m'), ...base });
  }
}

/* ---------- Lo que ve el alumno ---------- */

/**
 * Contenido visible para un alumno de esta academia.
 *
 * Une dos fuentes a propósito: lo que publicó su academia y el banco base que
 * trae Umbral. Sin el banco base, una academia recién contratada abre la
 * aplicación vacía el primer día y el alumno concluye que no sirve. Con él,
 * arranca funcionando y la academia va sustituyendo con lo suyo.
 */
export function contenidoVisible(academiaId, tipo) {
  const lista = tipo === 'preguntas' ? preguntas : materiales;
  return lista.filter(
    (x) => !x.archivado && x.publicado && (x.academiaId === academiaId || x.academiaId === BASE),
  );
}

/** Identificador de la biblioteca común que trae el producto. */
