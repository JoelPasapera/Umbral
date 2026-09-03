/**
 * Datos de ejemplo.
 *
 * No son cifras pintadas a mano: son intentos reales que pasan por el mismo
 * cálculo que usará producción. Si el algoritmo cambia, esta pantalla cambia
 * con él, que es exactamente lo que queremos de una maqueta.
 *
 * Este archivo desaparece el día que se conecte el backend. Nada más del
 * proyecto lo importa.
 */

import { iniciarSesion, responderPregunta, cerrarSesion, bancoCompleto } from './questions.js';
import { listarMateriales, abrirResumen, catalogoCompleto } from './library.js';
import { catalogo, examen, META_POR_DEFECTO } from './exams.js';
import { estadoReto, sembrarRacha } from './daily.js';
import {
  panelCompleto, crearPregunta, editarPregunta, crearMaterial,
  cambiarPublicacion, archivar, restaurar, reordenar, sembrar,
  contenidoVisible, BASE,
} from './admin.js';
import { generarPreguntas, cola as colaIA, decidir as decidirIA, estadoPresupuesto } from './ai.js';
import { usuarioDeSesion as quienEs } from './auth.js';
import {
  registrarCuenta,
  iniciarSesion as autenticar,
  usuarioDeSesion,
  cerrarSesionServidor,
  recuperarClave,
  confirmarAdmin,
} from './auth.js';

const DIA = 86_400_000;
const AHORA = Date.now();

/** Pesos del examen de admisión, área de ciencias básicas. */
const CURSOS = [
  { cursoId: 'aritmetica', nombre: 'Aritmética', peso: 10, acierto: 0.72 },
  { cursoId: 'algebra', nombre: 'Álgebra', peso: 10, acierto: 0.78 },
  { cursoId: 'geometria', nombre: 'Geometría', peso: 9, acierto: 0.55 },
  { cursoId: 'trigonometria', nombre: 'Trigonometría', peso: 9, acierto: 0.26 },
  { cursoId: 'fisica', nombre: 'Física', peso: 11, acierto: 0.42 },
  { cursoId: 'quimica', nombre: 'Química', peso: 9, acierto: 0.61 },
  { cursoId: 'biologia', nombre: 'Biología', peso: 7, acierto: 0.7 },
  { cursoId: 'lenguaje', nombre: 'Lenguaje', peso: 8, acierto: 0.74 },
  { cursoId: 'literatura', nombre: 'Literatura', peso: 5, acierto: 0.66 },
  { cursoId: 'historia', nombre: 'Historia del Perú', peso: 7, acierto: 0.58 },
  { cursoId: 'geografia', nombre: 'Geografía', peso: 5, acierto: 0.63 },
  { cursoId: 'civica', nombre: 'Educación cívica', peso: 5, acierto: null },
  { cursoId: 'filosofia', nombre: 'Filosofía', peso: 5, acierto: null },
];

/** Generador reproducible: la maqueta se ve igual en cada recarga. */
function aleatorio(semilla) {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function generarIntentos() {
  const random = aleatorio(20260902);
  const intentos = [];

  for (const curso of CURSOS) {
    if (curso.acierto === null) continue;
    const cantidad = 22 + Math.floor(random() * 26);

    for (let i = 0; i < cantidad; i += 1) {
      const dificultad = 0.25 + random() * 0.6;
      // La práctica se concentra en las últimas semanas: el cuadrado sesga hacia lo reciente.
      const antiguedad = Math.floor(random() ** 2 * 70);
      const probabilidad = curso.acierto * (0.6 + 0.8 * dificultad);
      intentos.push({
        temaId: `${curso.cursoId}-t${1 + Math.floor(random() * 6)}`,
        cursoId: curso.cursoId,
        acerto: random() < Math.min(probabilidad, 0.97),
        dificultad,
        fecha: AHORA - antiguedad * DIA,
      });
    }
  }
  return intentos;
}

/** Meta elegida por usuario. En producción es una columna del perfil. */
const metas = new Map();
const metaDe = (usuarioId) => metas.get(usuarioId) ?? META_POR_DEFECTO;

// Constancia de ejemplo para que la racha no arranque vacía en la maqueta.
sembrarRacha('u-1', [1, 2, 3, 5, 6, 9, 10, 11, 12, 16, 17, 20]);

const INTENTOS = generarIntentos();

// El panel arranca con el catálogo que ya usan las otras pantallas.
sembrar([
  ...bancoCompleto().map((q) => ({
    enunciado: q.enunciado, opciones: q.opciones, correcta: q.correcta,
    explicacion: q.explicacion, cursoId: q.cursoId, temaId: q.temaId,
    dificultad: q.dificultad, publicado: true, creado: Date.now(),
  })),
  ...catalogoCompleto().map((m) => ({
    tipo: m.tipo, titulo: m.titulo, detalle: m.detalle, fuente: m.fuente ?? null,
    cursoId: m.cursoId, temaId: m.temaId, minutos: m.minutos, url: m.url ?? null,
    paginas: m.paginas ?? null, publicado: true, creado: Date.now(),
  })),
], BASE);

// Sigma arranca con su propio contenido, distinto. Sin dos academias con datos
// diferentes, una prueba de aislamiento no demuestra nada.
sembrar([
  {
    tipo: 'enlace', titulo: 'Separata interna de Sigma', detalle: 'Material propio de la academia.',
    fuente: 'Academia Sigma', cursoId: 'algebra', temaId: 'exponentes', minutos: 30,
    url: 'https://drive.google.com/', publicado: true, creado: Date.now(),
  },
], 'sigma');

const TAREAS = {
  trigonometria: {
    titulo: 'Identidades trigonométricas',
    detalle: 'Fallaste 7 de las últimas 10 de este tema.',
    preguntas: 12,
    minutos: 8,
  },
};

const RECURSOS = {
  'meta/activa': ({ usuarioId }) => examen(metaDe(usuarioId ?? 'u-1')),
  'meta/catalogo': () => catalogo(),
  'meta/elegir': ({ usuarioId, universidadId, carreraId }) => {
    const elegido = examen({ universidadId, carreraId });
    metas.set(usuarioId ?? 'u-1', { universidadId, carreraId });
    return elegido;
  },
  'reto/estado': ({ usuarioId }) => estadoReto({ usuarioId: usuarioId ?? 'u-1' }),
  'practica/intentos': () => [...INTENTOS, ...INTENTOS_DE_SESION],
  // La academia sale de la sesión, no de lo que mande el cliente: si viajara
  // en la petición, cualquiera podría gastar el presupuesto de otra.
  'ia/generar': async (params) => {
    const usuario = await exigirAdmin(params.token);
    const meta = examen(metaDe(usuario.id));
    const panel = await panelCompleto({ token: params.token });
    return generarPreguntas({
      ...params,
      academiaId: usuario.academiaId,
      cursos: meta.cursos.map((c) => c.cursoId),
      banco: panel.preguntas,
    });
  },
  'ia/cola': async (params) => {
    const usuario = await exigirAdmin(params.token);
    return colaIA({ academiaId: usuario.academiaId });
  },
  'ia/decidir': async (params) => {
    const usuario = await exigirAdmin(params.token);
    const resultado = decidirIA({ ...params, academiaId: usuario.academiaId });
    if (resultado.publicada) await crearPregunta({ token: params.token, ...resultado.publicada });
    return resultado;
  },
  'ia/presupuesto': async (params) => {
    const usuario = await exigirAdmin(params.token);
    return estadoPresupuesto({ academiaId: usuario.academiaId });
  },
  'admin/panel': (params) => panelCompleto(params),
  'admin/pregunta/crear': (params) => crearPregunta(params),
  'admin/pregunta/editar': (params) => editarPregunta(params),
  'admin/material/crear': (params) => crearMaterial(params),
  'admin/publicar': (params) => cambiarPublicacion(params),
  'admin/archivar': (params) => archivar(params),
  'admin/restaurar': (params) => restaurar(params),
  'admin/reordenar': (params) => reordenar(params),
  'auth/registrar': (params) => registrarCuenta(params),
  'auth/entrar': (params) => autenticar(params),
  'auth/sesion': (params) => usuarioDeSesion(params),
  'auth/salir': (params) => cerrarSesionServidor(params),
  'auth/recuperar': (params) => recuperarClave(params),
  'auth/admin': (params) => confirmarAdmin(params),
  'estudio/materiales': async ({ token, ...filtros }) => {
    const usuario = await quienEs({ token });
    if (!usuario) throw new Error('Tu sesión venció. Vuelve a entrar.');
    return filtrarMateriales(contenidoVisible(usuario.academiaId, 'materiales'), filtros);
  },
  'estudio/resumen': (params) => abrirResumen(params),
  'practica/iniciar': (params) => iniciarSesion(params),
  'practica/responder': (params) => responderPregunta(params),
  'practica/cerrar': (params) => {
    const resumen = cerrarSesion(params);
    INTENTOS_DE_SESION.push(...resumen.intentos);
    return resumen;
  },
  'practica/siguiente': ({ cursoId }) =>
    TAREAS[cursoId] ?? {
      titulo: 'Diagnóstico rápido',
      detalle: 'Diez preguntas para ubicar tu nivel en este curso.',
      preguntas: 10,
      minutos: 7,
    },
};

/**
 * Filtra la lista visible por curso y búsqueda, y le quita las páginas: el
 * listado no necesita cargar seis imágenes por resumen para pintar un título.
 */
function filtrarMateriales(lista, { cursoId, busqueda }) {
  let salida = lista;
  if (cursoId) salida = salida.filter((m) => m.cursoId === cursoId);

  const termino = String(busqueda ?? '').trim().toLocaleLowerCase('es');
  if (termino) {
    salida = salida.filter((m) =>
      [m.titulo, m.detalle, m.fuente].filter(Boolean).join(' ').toLocaleLowerCase('es').includes(termino));
  }
  return salida.map(({ paginas, ...resto }) => ({ ...resto, totalPaginas: paginas?.length ?? 0 }));
}

/** Autoriza y devuelve al usuario. La generación es acción de administración. */
async function exigirAdmin(token) {
  const usuario = await quienEs({ token });
  if (!usuario) throw new Error('Tu sesión venció. Vuelve a entrar.');
  if (usuario.esAdmin !== true) {
    throw new Error('Esta acción es solo para profesores y coordinación.');
  }
  return usuario;
}

/** Intentos que la persona genera durante esta visita. Aquí sustituyen a una tabla. */
const INTENTOS_DE_SESION = [];

/**
 * @param {string} recurso
 * @param {object} params
 */
export async function responder(recurso, params) {
  const manejador = RECURSOS[recurso];
  if (!manejador) throw new Error(`Recurso no disponible: ${recurso}`);
  await new Promise((listo) => setTimeout(listo, 180));
  return manejador(params);
}
