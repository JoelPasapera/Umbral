/**
 * Ámbito de academia.
 *
 * Aquí vive el aislamiento entre academias, y es lo único de todo el proyecto
 * que no puede fallar ni una vez: una academia que ve el material de otra no es
 * un error que se corrige, es un cliente que se pierde y una conversación que
 * no se recupera.
 *
 * La decisión fue ponerlo en el código y no en la base de datos. Eso quita la
 * red de seguridad que da un motor con políticas de fila, así que hace falta
 * otra: **desde el resto del Worker no se puede escribir SQL.** No es una
 * convención escrita en un documento —esas se saltan a las tres semanas, con
 * prisa y de buena fe— sino tres cosas que se sostienen entre sí:
 *
 *   1. Este módulo es el único que llama a `prepare`. Lo vigila
 *      `pruebas/ambito.test.mjs`, que lee el código fuente y falla si aparece
 *      un `prepare(` en cualquier otro archivo.
 *   2. Las tablas se declaran abajo con su regla de ámbito. Una tabla que no
 *      esté declarada no se puede consultar: lanza.
 *   3. El identificador de academia sale siempre de la sesión y nunca de los
 *      parámetros. Si alguien manda `academiaId` en la petición, se ignora; y
 *      si lo mete en los filtros, lanza en vez de obedecer.
 *
 * Los valores viajan siempre como parámetros ligados. Los nombres de tabla y
 * de columna se comprueban contra el esquema declarado antes de tocar la
 * cadena de SQL, porque esos no se pueden ligar.
 */

/**
 * Cómo se acota cada tabla.
 *
 *   'academia'  — filas de una sola academia. Nunca se cruzan.
 *   'compartida'— filas de la academia más el banco base que trae el producto.
 *                 Sin esto, una academia recién contratada abre la aplicación
 *                 vacía el primer día.
 *   'global'    — sin dueño: el temario del examen, el catálogo de academias.
 *                 Leer esto no filtra nada de nadie.
 *   'propia'    — filas de un solo usuario, acotadas además por la academia.
 */
const TABLAS = Object.freeze({
  academias: { ambito: 'global', columnas: ['id', 'nombre', 'codigo_alumno', 'codigo_profesor', 'plan', 'creada'] },
  usuarios: {
    ambito: 'academia',
    columnas: ['id', 'academia_id', 'correo', 'nombre', 'rol', 'clave_hash', 'sal', 'iteraciones',
      'anio_nacimiento', 'consintio_apoderado', 'acepto_terminos', 'intentos_fallidos',
      'bloqueado_hasta', 'creado'],
  },
  sesiones: {
    ambito: 'academia',
    columnas: ['token_hash', 'usuario_id', 'academia_id', 'creada', 'expira'],
  },
  identidades_google: { ambito: 'academia', columnas: ['sub', 'usuario_id', 'academia_id', 'vinculada'] },
  materiales: {
    ambito: 'compartida',
    columnas: ['id', 'academia_id', 'tipo', 'titulo', 'subtitulo', 'detalle', 'origen', 'licencia',
      'permiso_ref', 'fuente', 'universidad_id', 'curso_id', 'tema_id', 'minutos', 'url',
      'publicado', 'archivado', 'creado'],
  },
  // Los datos de admisión no son de nadie: el corte de San Marcos es el mismo
  // para todas las academias. Por eso son globales y no se acotan.
  admision_datos: {
    ambito: 'global',
    columnas: ['universidad_id', 'proceso', 'carrera_id', 'carrera', 'area', 'vacantes',
      'postulantes', 'corte', 'fuente', 'obtenido', 'avisos', 'confirmado', 'confirmado_por'],
  },
  admision_fechas: {
    ambito: 'global',
    columnas: ['universidad_id', 'proceso', 'fecha', 'areas', 'fuente', 'obtenido', 'confirmado'],
  },
  admision_huellas: { ambito: 'global', columnas: ['url', 'huella', 'visto'] },
  preguntas: {
    ambito: 'compartida',
    columnas: ['id', 'academia_id', 'enunciado', 'opciones', 'correcta', 'explicacion',
      'curso_id', 'tema_id', 'dificultad', 'publicado', 'archivado', 'creado'],
  },
});

/** Identificador de la biblioteca común que trae el producto. */
export const BASE = 'base';

/** Cuánto dura una sesión sin actividad. */
export const VIDA_SESION = 30 * 24 * 60 * 60 * 1000;

const VALIDO = /^[a-z_][a-z0-9_]*$/;

/**
 * Comprueba que una tabla existe en el esquema declarado y devuelve su regla.
 * @param {string} tabla
 */
function reglaDe(tabla) {
  const regla = TABLAS[tabla];
  if (!regla) throw new Error(`Tabla no declarada en el ámbito: ${tabla}`);
  return regla;
}

/**
 * Comprueba que las columnas existen antes de meterlas en la cadena de SQL.
 * Los nombres de columna no se pueden ligar como parámetros, así que la única
 * defensa es que salgan del esquema y no de la petición.
 *
 * @param {string} tabla
 * @param {string[]} columnas
 */
function exigirColumnas(tabla, columnas) {
  const { columnas: validas } = reglaDe(tabla);
  for (const c of columnas) {
    if (!VALIDO.test(c) || !validas.includes(c)) {
      throw new Error(`Columna desconocida en ${tabla}: ${c}`);
    }
  }
}

/**
 * Construye el trozo `WHERE` con el filtro de academia ya dentro.
 *
 * @param {string} tabla
 * @param {object} filtros
 * @param {string} academiaId
 * @returns {{ sql:string, valores:unknown[] }}
 */
function donde(tabla, filtros, academiaId) {
  const { ambito } = reglaDe(tabla);
  const claves = Object.keys(filtros ?? {});
  exigirColumnas(tabla, claves);

  // La academia sale de la sesión. Si viene en los filtros es que alguien la
  // está pasando desde la petición, y eso es justo el agujero que este módulo
  // existe para tapar: se para aquí en vez de obedecer.
  if (claves.includes('academia_id')) {
    throw new Error('La academia sale de la sesión, nunca de los filtros.');
  }

  const trozos = [];
  const valores = [];

  if (ambito === 'academia' || ambito === 'propia') {
    trozos.push('academia_id = ?');
    valores.push(academiaId);
  } else if (ambito === 'compartida') {
    trozos.push('(academia_id = ? OR academia_id = ?)');
    valores.push(academiaId, BASE);
  }

  for (const clave of claves) {
    trozos.push(`${clave} = ?`);
    valores.push(filtros[clave]);
  }

  return { sql: trozos.length ? ` WHERE ${trozos.join(' AND ')}` : '', valores };
}

/**
 * Devuelve un acceso a la base ligado a una academia.
 *
 * Quien recibe esto no puede consultar fuera de su academia aunque quiera:
 * no hay ningún método que acepte SQL.
 *
 * @param {D1Database} db
 * @param {{ academiaId:string, usuarioId?:string }} sesion
 */
export function ambito(db, sesion) {
  const academiaId = sesion?.academiaId;
  if (!academiaId) throw new Error('No se puede abrir un ámbito sin academia.');

  const consultar = (sql, valores) => db.prepare(sql).bind(...valores);

  return {
    academiaId,

    /** @param {string} tabla @param {object} [filtros] */
    async uno(tabla, filtros = {}) {
      const w = donde(tabla, filtros, academiaId);
      return consultar(`SELECT * FROM ${tabla}${w.sql} LIMIT 1`, w.valores).first();
    },

    /** @param {string} tabla @param {object} [filtros] @param {{orden?:string, limite?:number}} [op] */
    async todos(tabla, filtros = {}, op = {}) {
      const w = donde(tabla, filtros, academiaId);
      let sql = `SELECT * FROM ${tabla}${w.sql}`;
      if (op.orden) {
        exigirColumnas(tabla, [op.orden]);
        sql += ` ORDER BY ${op.orden}`;
      }
      if (op.limite) sql += ` LIMIT ${Number(op.limite) | 0}`;
      const { results } = await consultar(sql, w.valores).all();
      return results ?? [];
    },

    /** @param {string} tabla @param {object} [filtros] */
    async contar(tabla, filtros = {}) {
      const w = donde(tabla, filtros, academiaId);
      const fila = await consultar(`SELECT COUNT(*) AS n FROM ${tabla}${w.sql}`, w.valores).first();
      return Number(fila?.n ?? 0);
    },

    /**
     * Inserta poniendo la academia él mismo. Si el valor viene en el objeto,
     * lanza: una fila creada con la academia de otro es una fuga silenciosa que
     * no se descubre hasta que alguien la ve en su pantalla.
     *
     * @param {string} tabla @param {object} valores
     */
    async insertar(tabla, valores) {
      const { ambito: reglaAmbito } = reglaDe(tabla);
      if ('academia_id' in valores) {
        throw new Error('La academia la pone el ámbito, no quien inserta.');
      }
      const fila = reglaAmbito === 'global' ? { ...valores } : { ...valores, academia_id: academiaId };
      const claves = Object.keys(fila);
      exigirColumnas(tabla, claves);

      const huecos = claves.map(() => '?').join(', ');
      await consultar(
        `INSERT INTO ${tabla} (${claves.join(', ')}) VALUES (${huecos})`,
        claves.map((c) => fila[c]),
      ).run();
      return fila;
    },

    /** @param {string} tabla @param {object} cambios @param {object} filtros */
    async actualizar(tabla, cambios, filtros) {
      const claves = Object.keys(cambios);
      if (!claves.length) return 0;
      if (claves.includes('academia_id')) throw new Error('Una fila no cambia de academia.');
      exigirColumnas(tabla, claves);

      const w = donde(tabla, filtros, academiaId);
      const asignaciones = claves.map((c) => `${c} = ?`).join(', ');
      const r = await consultar(
        `UPDATE ${tabla} SET ${asignaciones}${w.sql}`,
        [...claves.map((c) => cambios[c]), ...w.valores],
      ).run();
      return r?.meta?.changes ?? 0;
    },

    /** @param {string} tabla @param {object} filtros */
    async borrar(tabla, filtros) {
      const w = donde(tabla, filtros, academiaId);
      const r = await consultar(`DELETE FROM ${tabla}${w.sql}`, w.valores).run();
      return r?.meta?.changes ?? 0;
    },
  };
}

/**
 * Acceso sin academia, para lo que ocurre antes de que exista una sesión:
 * resolver un código de invitación y buscar una cuenta por correo al entrar.
 *
 * Es deliberadamente diminuto. Cada método que se añada aquí es un método que
 * no pasa por el filtro de academia, así que la lista corta es la garantía.
 *
 * @param {D1Database} db
 */
export function sinSesion(db) {
  return {
    /** @param {string} codigo */
    async academiaPorCodigo(codigo) {
      const limpio = String(codigo ?? '').trim().toUpperCase();
      if (!limpio) return null;
      const fila = await db
        .prepare('SELECT * FROM academias WHERE codigo_alumno = ? OR codigo_profesor = ? LIMIT 1')
        .bind(limpio, limpio)
        .first();
      if (!fila) return null;
      return { academia: fila, rol: fila.codigo_profesor === limpio ? 'coordinacion' : 'estudiante' };
    },

    /**
     * Busca una cuenta por correo en todas las academias.
     *
     * Es el único sitio del Worker que mira fuera de una academia, y tiene que
     * serlo: al entrar todavía no se sabe de cuál es la persona. Devuelve solo
     * lo que hace falta para comprobar la clave y abrir la sesión.
     *
     * @param {string} correo
     */
    async cuentaPorCorreo(correo) {
      const limpio = String(correo ?? '').trim().toLowerCase();
      if (!limpio) return null;
      return db.prepare('SELECT * FROM usuarios WHERE correo = ? LIMIT 1').bind(limpio).first();
    },

    /** @param {string} sub identificador estable de Google */
    async cuentaPorGoogle(sub) {
      return db
        .prepare('SELECT u.* FROM identidades_google g JOIN usuarios u ON u.id = g.usuario_id WHERE g.sub = ? LIMIT 1')
        .bind(String(sub ?? ''))
        .first();
    },

    /**
     * Resuelve una sesión a partir del testigo. Devuelve la academia, que es de
     * donde salen todos los ámbitos: por eso esta consulta no puede estar
     * acotada por academia sin caer en una circularidad.
     *
     * @param {string} tokenHash
     */
    async sesionPorTestigo(tokenHash) {
      return db
        .prepare(`SELECT s.usuario_id, s.academia_id, s.expira, u.rol, u.nombre, u.correo
                  FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
                  WHERE s.token_hash = ? LIMIT 1`)
        .bind(tokenHash)
        .first();
    },

    /** @param {object} fila */
    async crearSesion(fila) {
      await db
        .prepare('INSERT INTO sesiones (token_hash, usuario_id, academia_id, creada, expira) VALUES (?, ?, ?, ?, ?)')
        .bind(fila.token_hash, fila.usuario_id, fila.academia_id, fila.creada, fila.expira)
        .run();
      return fila;
    },

    /** @param {string} tokenHash */
    async cerrarSesion(tokenHash) {
      await db.prepare('DELETE FROM sesiones WHERE token_hash = ?').bind(tokenHash).run();
    },

    /** Crea la cuenta. La academia viene de haber resuelto un código, no de la petición. */
    async crearUsuario(fila) {
      const claves = Object.keys(fila);
      exigirColumnas('usuarios', claves);
      const huecos = claves.map(() => '?').join(', ');
      await db
        .prepare(`INSERT INTO usuarios (${claves.join(', ')}) VALUES (${huecos})`)
        .bind(...claves.map((c) => fila[c]))
        .run();
      return fila;
    },

    /** Marca los intentos fallidos de una cuenta concreta. */
    async marcarIntento(usuarioId, intentos, bloqueadoHasta) {
      await db
        .prepare('UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?')
        .bind(intentos, bloqueadoHasta, usuarioId)
        .run();
    },
  };
}

/**
 * Acceso a los datos de admisión.
 *
 * Vive aquí y no en `admision/` porque este módulo es el único que puede tocar
 * la base: es lo que sostiene el aislamiento entre academias, y una excepción
 * "solo para esto" acaba siendo tres. Que estas tablas sean globales no cambia
 * la regla; la hace más fácil de cumplir.
 *
 * @param {D1Database} db
 */
export function admision(db) {
  return {
    /** Lo confirmado por una persona, que es lo único que ve un alumno. */
    async publicados(universidadId) {
      const { results } = await db.prepare(
        `SELECT carrera, area, proceso, vacantes, postulantes, corte, fuente, confirmado
         FROM admision_datos WHERE universidad_id = ? AND confirmado IS NOT NULL
         ORDER BY proceso DESC, carrera`,
      ).bind(universidadId).all();
      return results ?? [];
    },

    /** Lo que espera confirmación. Solo para el panel. */
    async enCuarentena() {
      const { results } = await db.prepare(
        'SELECT * FROM admision_datos WHERE confirmado IS NULL ORDER BY proceso DESC, carrera',
      ).all();
      return results ?? [];
    },

    /** Los cortes ya confirmados, para comparar con los recién leídos. */
    async cortesAnteriores(universidadId) {
      const { results } = await db.prepare(
        'SELECT carrera_id, corte, proceso FROM admision_datos '
        + 'WHERE universidad_id = ? AND confirmado IS NOT NULL',
      ).bind(universidadId).all();
      return new Map((results ?? []).map((f) => [f.carrera_id, { corte: f.corte, proceso: f.proceso }]));
    },

    /**
     * Guarda una lectura en cuarentena.
     *
     * Un dato que vuelve a leerse pierde la confirmación anterior: la persona
     * confirmó aquel número, no este.
     */
    async guardarLectura(registro, avisos) {
      await db.prepare(
        `INSERT INTO admision_datos
           (universidad_id, proceso, carrera_id, carrera, area, vacantes, postulantes, corte,
            fuente, obtenido, avisos, confirmado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
         ON CONFLICT(universidad_id, proceso, carrera_id) DO UPDATE SET
           vacantes = excluded.vacantes, postulantes = excluded.postulantes,
           corte = excluded.corte, obtenido = excluded.obtenido,
           avisos = excluded.avisos, confirmado = NULL`,
      ).bind(
        registro.universidadId, registro.proceso, registro.carreraId, registro.carrera,
        registro.area, registro.vacantes, registro.postulantes, registro.corte,
        registro.fuente, registro.obtenido, JSON.stringify(avisos ?? []),
      ).run();
    },

    /**
     * Confirmar es lo único que hace visible un dato para un alumno. Admite
     * corregir la cifra al confirmarla: quien mira el acta suele ver el dígito
     * que el OCR leyó mal, y obligarle a otro paso para arreglarlo garantiza
     * que no lo arregle.
     */
    async confirmar({ universidadId, proceso, carreraId, por, ahora, correcciones = {} }) {
      const r = await db.prepare(
        `UPDATE admision_datos SET confirmado = ?, confirmado_por = ?,
           vacantes = COALESCE(?, vacantes), postulantes = COALESCE(?, postulantes),
           corte = COALESCE(?, corte)
         WHERE universidad_id = ? AND proceso = ? AND carrera_id = ? AND confirmado IS NULL`,
      ).bind(
        ahora, por, correcciones.vacantes ?? null, correcciones.postulantes ?? null,
        correcciones.corte ?? null, universidadId, proceso, carreraId,
      ).run();
      return r?.meta?.changes ?? 0;
    },

    /** Una jornada del cronograma, también en cuarentena. */
    async guardarFecha(f) {
      await db.prepare(
        `INSERT INTO admision_fechas (universidad_id, proceso, fecha, areas, fuente, obtenido, confirmado)
         VALUES (?, ?, ?, ?, ?, ?, NULL)
         ON CONFLICT(universidad_id, proceso, fecha) DO UPDATE SET
           areas = excluded.areas, obtenido = excluded.obtenido, confirmado = NULL`,
      ).bind(f.universidadId, f.proceso, f.fecha, f.areas, f.fuente, f.obtenido).run();
    },

    /** El cronograma ya confirmado. */
    async fechasPublicadas(universidadId) {
      const { results } = await db.prepare(
        'SELECT proceso, fecha, areas, fuente FROM admision_fechas '
        + 'WHERE universidad_id = ? AND confirmado IS NOT NULL ORDER BY fecha',
      ).bind(universidadId).all();
      return results ?? [];
    },

    async huellaDe(url) {
      const fila = await db.prepare('SELECT huella FROM admision_huellas WHERE url = ?').bind(url).first();
      return fila?.huella ?? null;
    },

    async anotarHuella(url, huella, visto) {
      await db.prepare(
        'INSERT INTO admision_huellas (url, huella, visto) VALUES (?, ?, ?) '
        + 'ON CONFLICT(url) DO UPDATE SET huella = excluded.huella, visto = excluded.visto',
      ).bind(url, huella, visto).run();
    },
  };
}

export const TABLAS_DECLARADAS = TABLAS;
