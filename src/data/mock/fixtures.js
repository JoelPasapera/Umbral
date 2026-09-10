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
import { catalogoCompleto } from './library.js';
import { catalogo, examen, META_POR_DEFECTO } from './exams.js';
import { estadoReto, sembrarRacha } from './daily.js';
import {
  panelCompleto, crearPregunta, editarPregunta, crearMaterial,
  cambiarPublicacion, archivar, restaurar, reordenar, sembrar,
  contenidoVisible, BASE,
} from './admin.js';
import { generarPreguntas, cola as colaIA, decidir as decidirIA, estadoPresupuesto, cobrar } from './ai.js';
import {
  sembrarBase,
  explicacionDeFallo,
  generarExplicaciones,
  colaExplicaciones,
  decidirExplicacion,
} from './explicaciones.js';
import { EXPLICACIONES_BASE } from './explicaciones-base.js';
import { cursosDeMatematica } from './temario.js';
import { UNIVERSIDADES } from './universidades.js';
import { datosDeAdmision } from './admision.js';
import {
  soloAdmisibles, filtrar as filtrarCatalogo, porCurso,
  librosPorCurso, pendientesDeLicencia, examenesPorProceso,
} from '../../domain/catalogo.js';
import { usuarioDeSesion as quienEs } from './auth.js';
import {
  registrarCuenta,
  iniciarSesion as autenticar,
  usuarioDeSesion,
  entrarConGoogle,
  completarConGoogle,
  cerrarSesionServidor,
  recuperarClave,
  confirmarAdmin,
} from './auth.js';

const DIA = 86_400_000;
const AHORA = Date.now();

// Las explicaciones del banco base vienen con Umbral, ya revisadas. En
// producción esto es una migración, no una llamada.
sembrarBase(EXPLICACIONES_BASE);

/**
 * Historial de ejemplo. Los identificadores de curso vienen del temario real:
 * si divergen, el diagnóstico deja de encontrar las respuestas y todos los
 * cursos aparecen "sin datos".
 */
const CURSOS = [
  { cursoId: 'habilidad-matematica', acierto: 0.64 },
  { cursoId: 'habilidad-verbal', acierto: 0.71 },
  { cursoId: 'aritmetica', acierto: 0.72 },
  { cursoId: 'algebra', acierto: 0.78 },
  { cursoId: 'geometria', acierto: 0.55 },
  { cursoId: 'trigonometria', acierto: 0.26 },
  { cursoId: 'fisica', acierto: 0.42 },
  { cursoId: 'quimica', acierto: 0.61 },
  { cursoId: 'biologia', acierto: 0.7 },
  { cursoId: 'lenguaje', acierto: 0.74 },
  { cursoId: 'literatura', acierto: 0.66 },
  { cursoId: 'historia-peru', acierto: 0.58 },
  { cursoId: 'geografia', acierto: 0.63 },
  { cursoId: 'economia', acierto: 0.6 },
  // Sin practicar: la interfaz debe decirlo, no rellenarlo.
  { cursoId: 'civica', acierto: null },
  { cursoId: 'filosofia', acierto: null },
  { cursoId: 'historia-universal', acierto: null },
  { cursoId: 'psicologia', acierto: null },
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
  // Se copia el material entero y solo se le quita el identificador, que lo
  // pone el panel al sembrarlo.
  //
  // Antes esto era una lista de campos, y esa lista se comió tres cosas: la
  // licencia —y la biblioteca apareció vacía sin decir por qué—, el subtítulo,
  // y el proceso de cada examen. Un campo nuevo en el catálogo no tiene por
  // qué acordarse de venir aquí a apuntarse.
  ...catalogoCompleto().map(({ id: _id, ...m }) => ({ ...m, publicado: true, creado: Date.now() })),
], BASE);

// Sigma arranca con su propio contenido, distinto. Sin dos academias con datos
// diferentes, una prueba de aislamiento no demuestra nada.
sembrar([
  {
    tipo: 'enlace', titulo: 'Separata interna de Sigma', detalle: 'Material propio de la academia.',
    origen: 'academia', licencia: 'propia', fuente: 'Elaborado por la Academia Sigma',
    cursoId: 'algebra', temaId: 'exponentes', minutos: 30,
    url: 'https://ejemplo.pe/separata-sigma', publicado: true, creado: Date.now(),
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

  /**
   * Todo lo que necesita saber un postulante sobre el examen al que va.
   *
   * El área y la carrera salen de su meta, no de la petición: la pantalla no
   * tiene que preguntárselo porque el sistema ya lo sabe.
   */
  'admision/datos': async ({ token, universidadId }) => {
    const usuario = await quienEs({ token });
    if (!usuario) throw new Error('Tu sesión venció. Vuelve a entrar.');
    const meta = metaDe(usuario.id);
    const suExamen = examen(meta);
    return datosDeAdmision({
      universidadId: universidadId ?? meta?.universidadId ?? 'unmsm',
      area: suExamen?.area ?? 'B',
      carreraId: meta?.carreraId ?? null,
    });
  },
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
  'ia/explicar': async (params) => {
    const usuario = await exigirAdmin(params.token);
    const pregunta = bancoCompleto().find((p) => p.id === params.preguntaId);
    const resultado = generarExplicaciones({
      academiaId: usuario.academiaId,
      pregunta,
      cobrar: (creditos) =>
        cobrar({ academiaId: usuario.academiaId, creditos, concepto: 'explicar esta pregunta' }),
    });
    return { ...resultado, presupuesto: estadoPresupuesto({ academiaId: usuario.academiaId }) };
  },
  'ia/explicaciones/cola': async (params) => {
    const usuario = await exigirAdmin(params.token);
    return colaExplicaciones({ academiaId: usuario.academiaId });
  },
  'ia/explicaciones/decidir': async (params) => {
    const usuario = await exigirAdmin(params.token);
    return decidirExplicacion({ academiaId: usuario.academiaId, ...params });
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
  'auth/google': (params) => entrarConGoogle(params),
  'auth/google/completar': (params) => completarConGoogle(params),
  'auth/sesion': (params) => usuarioDeSesion(params),
  'auth/salir': (params) => cerrarSesionServidor(params),
  'auth/recuperar': (params) => recuperarClave(params),
  'auth/admin': (params) => confirmarAdmin(params),
  'estudio/materiales': async ({ token, ...filtros }) => {
    const usuario = await quienEs({ token });
    if (!usuario) throw new Error('Tu sesión venció. Vuelve a entrar.');
    return filtrarMateriales(contenidoVisible(usuario.academiaId, 'materiales'), filtros);
  },
  'biblioteca/catalogo': async ({ token, ...filtros }) => {
    const usuario = await quienEs({ token });
    if (!usuario) throw new Error('Tu sesión venció. Vuelve a entrar.');

    const todo = contenidoVisible(usuario.academiaId, 'materiales');
    const visibles = soloAdmisibles(todo);
    const cursos = examen(metaDe(usuario.id)).cursos;
    const lista = filtrarCatalogo(visibles, filtros);
    const porPeso = porCurso(lista, cursos);

    // Los exámenes no cuelgan de ningún curso: una convocatoria los toca
    // todos. Por eso su sección responde a la universidad y a la búsqueda,
    // pero no al filtro de curso, que la vaciaría sin motivo.
    const { cursoId: _sinCurso, ...filtrosDeExamen } = filtros;
    const paraExamenes = filtrarCatalogo(visibles, filtrosDeExamen);

    // Qué cursos llevan estante de libros: los que ya tienen alguna ficha
    // —aunque todavía no se pueda mostrar— más los cinco de matemática, que
    // son la base del examen y su hueco es información, no ausencia.
    const conEstante = new Set([
      ...todo.filter((m) => m.tipo === 'libro').map((m) => m.cursoId),
      ...cursosDeMatematica().map((c) => c.cursoId),
    ]);

    return {
      lista: lista.filter((m) => m.tipo !== 'libro' && m.tipo !== 'examen')
        .map(({ paginas, ...resto }) => ({ ...resto, totalPaginas: paginas?.length ?? 0 })),
      libros: librosPorCurso(lista, porPeso, conEstante),
      // Recuentos de la rejilla de cursos, sobre el catálogo SIN filtrar: si
      // salieran de la lista filtrada, elegir un curso pondría los demás a
      // cero y la rejilla dejaría de servir para nada.
      cursos: porCurso(visibles, cursos)
        .filter((c) => conEstante.has(c.cursoId))
        .map((c) => ({
          cursoId: c.cursoId,
          nombre: c.nombre,
          pesoExamen: c.pesoExamen,
          libros: visibles.filter((m) => m.cursoId === c.cursoId && m.tipo === 'libro').length,
          materiales: visibles.filter((m) => m.cursoId === c.cursoId && m.tipo !== 'libro' && m.tipo !== 'examen').length,
        })),
      examenes: examenesPorProceso(paraExamenes),
      universidades: UNIVERSIDADES.map((u) => ({
        ...u,
        // Cuántas convocatorias tiene cargadas. Cero es información: dice que
        // esa universidad está en el mapa pero todavía sin material, y eso es
        // distinto de que no exista.
        convocatorias: visibles.filter((m) => m.tipo === 'examen' && m.universidadId === u.id).length,
      })),
      // Las gestiones pendientes son cosa de quien puede resolverlas. Un alumno
      // no gana nada sabiendo qué libro no se puede ofrecer todavía.
      pendientes: usuario.esAdmin === true ? pendientesDeLicencia(todo).length : 0,
    };
  },
  'estudio/resumen': async ({ token, id }) => {
    // Se busca en el contenido que de verdad se le sirve a esta academia, no
    // en el catálogo de origen.
    //
    // El visor llevaba roto desde antes de tocarlo: la siembra reasigna los
    // identificadores al cargar el catálogo en el panel, así que el que tiene
    // el navegador nunca coincidía con el de la lista original y abrir un
    // resumen respondía "Ese resumen no existe". Buscar aquí lo arregla y de
    // paso pone la frontera donde corresponde: un alumno no puede abrir el
    // resumen de otra academia aunque acierte el identificador.
    const usuario = await quienEs({ token });
    if (!usuario) throw new Error('Tu sesión venció. Vuelve a entrar.');

    const material = contenidoVisible(usuario.academiaId, 'materiales')
      .find((m) => m.id === id && m.tipo === 'resumen');
    if (!material) throw new Error('Ese resumen ya no está disponible.');
    return material;
  },
  'practica/iniciar': (params) => iniciarSesion(params),
  'practica/responder': ({ token, ...params }) => {
    const veredicto = responderPregunta(params);
    if (veredicto.acerto) return veredicto;

    // La academia sale de la sesión, nunca de la petición: si el cliente
    // mandase su academiaId podría leer las explicaciones de otra.
    const usuario = quienEs({ token });
    const explicacion = explicacionDeFallo({
      preguntaId: veredicto.preguntaId,
      opcion: Number(params.opcion),
      academiaId: usuario?.academiaId ?? null,
    });

    // Sin explicación para esa opción no pasa nada: el alumno ve lo de
    // siempre. La funcionalidad entra pregunta a pregunta.
    return explicacion ? { ...veredicto, porQueFallaste: explicacion.texto } : veredicto;
  },
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
function filtrarMateriales(lista, filtros) {
  // La puerta de licencia se aplica aquí, en el servidor, y no en la vista: un
  // filtro que vive en el cliente se salta cambiando la petición.
  //
  // Y se descarta lo que no pertenece a ningún curso. Estudiar ordena el
  // material por el diagnóstico, o sea por curso: algo con `cursoId` en nulo
  // —un examen de admisión, que los toca todos— no tiene sitio en esa lista.
  // Colarse ahí no solo desordenaba: reventaba la pantalla entera al intentar
  // comparar el nombre de un curso inexistente. Eso vive en la biblioteca,
  // dentro de su universidad.
  let salida = filtrarCatalogo(soloAdmisibles(lista), filtros).filter((m) => Boolean(m.cursoId));
  const { busqueda } = filtros;

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
