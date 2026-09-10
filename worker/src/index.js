/**
 * La única puerta.
 *
 * El Worker habla el mismo contrato que ya hablaba el simulado: un recurso por
 * nombre y un objeto de parámetros. Eso no es casualidad ni comodidad: es lo
 * que permite que la misma batería de pruebas corra contra los dos y que el
 * backend no pueda desviarse sin que algo se ponga rojo.
 *
 * Lo que aquí se hace y en el simulado no se podía hacer:
 *   · el testigo viaja en la cabecera Authorization, no en el cuerpo;
 *   · `academiaId` y `esAdmin` salen de la base, no de lo que diga el cliente;
 *   · los secretos viven en las variables cifradas de la plataforma y nunca
 *     llegan al navegador.
 */

import {
  registrar, entrar, salir, sesionActual, exigirSesion, exigirAdmin, ErrorDeUso,
} from './auth.js';
import { pasada } from './admision/raspar.js';
import { admision } from './ambito.js';
import { versionPublica } from '../../src/domain/admision.js';

/** Orígenes que pueden llamar. Cualquier otro recibe un no. */
const permitidos = (env) =>
  String(env.ORIGENES_PERMITIDOS ?? '').split(',').map((o) => o.trim()).filter(Boolean);

function cabeceras(peticion, env) {
  const origen = peticion.headers.get('Origin') ?? '';
  const lista = permitidos(env);
  const base = {
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin',
    // Las respuestas llevan datos de una persona concreta: no las guarda nadie.
    'Cache-Control': 'no-store',
  };
  if (origen && lista.includes(origen)) {
    base['Access-Control-Allow-Origin'] = origen;
    base['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    base['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    base['Access-Control-Max-Age'] = '86400';
  }
  return base;
}

const responder = (cuerpo, estado, cabs) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: cabs });

/**
 * El testigo va en la cabecera y no en el cuerpo, para que no acabe en los
 * registros de acceso ni en el historial del navegador.
 */
const testigoDe = (peticion) => {
  const cab = peticion.headers.get('Authorization') ?? '';
  return cab.startsWith('Bearer ') ? cab.slice(7).trim() : '';
};

/**
 * Recursos servidos por el Worker.
 *
 * Los que todavía no están aquí los sigue atendiendo el simulado en el
 * navegador. La migración va recurso a recurso y esta tabla es la frontera:
 * lo que está en ella ya no se puede falsear desde el cliente.
 */
const RECURSOS = {
  'auth/registrar': ({ env, params, ahora }) => registrar(env.DB, params, ahora),
  'auth/entrar': ({ env, params, ahora }) => entrar(env.DB, params, ahora),
  'auth/salir': ({ env, testigo }) => salir(env.DB, testigo),
  'auth/sesion': ({ env, testigo, ahora }) => sesionActual(env.DB, testigo, ahora),

  /* Prueba de vida del aislamiento: devuelve de qué academia cree el servidor
     que eres. No lo dice el cliente y por eso sirve para comprobarlo. */
  /* Lo que espera confirmación. Solo para el panel. */
  'admision/cola': async ({ env, testigo, ahora }) => {
    await exigirAdmin(env.DB, testigo, ahora);
    return { pendientes: await admision(env.DB).enCuarentena() };
  },

  /* Confirmar es lo único que hace visible un dato para un alumno. */
  'admision/confirmar': async ({ env, params, testigo, ahora }) => {
    const { sesion } = await exigirAdmin(env.DB, testigo, ahora);
    const cambios = await admision(env.DB).confirmar({
      universidadId: params.universidadId, proceso: params.proceso, carreraId: params.carreraId,
      por: sesion.usuarioId, ahora, correcciones: params,
    });
    if (!cambios) throw new ErrorDeUso('Ese dato ya no está pendiente.', 409);
    return { confirmado: true };
  },

  /* Lo que ve un alumno: solo lo confirmado, y siempre con su fuente. */
  'admision/datos': async ({ env, params, testigo, ahora }) => {
    await exigirSesion(env.DB, testigo, ahora);
    const almacen = admision(env.DB);
    const universidadId = params.universidadId ?? 'unmsm';

    // Pasa por `versionPublica` y no se devuelven las filas crudas. La función
    // existía y solo la ejecutaba una prueba: en verde sin que la aplicación la
    // corriera nunca, así que no demostraba nada sobre lo que ve una persona.
    // Además calcula los postulantes por vacante, que es la cifra que se
    // entiende sin hacer una división mental.
    const filas = await almacen.publicados(universidadId);
    return {
      datos: filas.map(versionPublica),
      // El cronograma también se servía... o eso parecía: se guardaba en su
      // tabla y ningún recurso lo leía.
      cronograma: (await almacen.fechasPublicadas(universidadId)).map((f) => ({
        ...f, areas: String(f.areas).split(',').filter(Boolean),
      })),
    };
  },

  'auth/ambito': async ({ env, testigo, ahora }) => {
    const { sesion, datos } = await exigirSesion(env.DB, testigo, ahora);
    return {
      academiaId: sesion.academiaId,
      esAdmin: sesion.esAdmin,
      materiales: await datos.contar('materiales', { publicado: 1 }),
    };
  },
};

export default {
  /**
   * La pasada diaria del raspador.
   *
   * Deja lo leído en cuarentena y no publica nada. Lo que sale de aquí lo
   * confirma una persona desde el panel, porque el OCR se equivoca en silencio
   * y el corte alimenta el índice del que vive el producto.
   *
   * @param {{cron:string}} evento
   * @param {object} env
   */
  async scheduled(evento, env, ctx) {
    ctx.waitUntil(pasada(env).then(
      (r) => console.log('raspado', JSON.stringify(r)),
      (e) => console.error('el raspado falló', e),
    ));
  },

  /**
   * @param {Request} peticion
   * @param {{ DB: D1Database, ORIGENES_PERMITIDOS: string }} env
   */
  async fetch(peticion, env) {
    const cabs = cabeceras(peticion, env);

    if (peticion.method === 'OPTIONS') return new Response(null, { status: 204, headers: cabs });
    if (peticion.method !== 'POST') return responder({ error: 'Método no permitido.' }, 405, cabs);
    if (!cabs['Access-Control-Allow-Origin']) {
      return responder({ error: 'Origen no autorizado.' }, 403, cabs);
    }

    let cuerpo;
    try {
      cuerpo = await peticion.json();
    } catch {
      return responder({ error: 'El cuerpo no es JSON.' }, 400, cabs);
    }

    const manejar = RECURSOS[cuerpo?.recurso];
    if (!manejar) return responder({ error: 'Recurso desconocido.' }, 404, cabs);

    try {
      const datos = await manejar({
        env,
        params: cuerpo.params ?? {},
        testigo: testigoDe(peticion),
        ahora: Date.now(),
      });
      return responder(datos, 200, cabs);
    } catch (error) {
      // Solo salen los mensajes escritos para que los lea una persona. Un fallo
      // inesperado no cuenta por dentro qué tabla ni qué consulta se rompió.
      if (error instanceof ErrorDeUso) {
        return responder({ error: error.message }, error.estado, cabs);
      }
      console.error('fallo no previsto', error);
      return responder({ error: 'No se pudo completar la operación.' }, 500, cabs);
    }
  },
};
