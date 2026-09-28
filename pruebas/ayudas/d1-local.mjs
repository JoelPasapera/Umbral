/**
 * D1 local para las pruebas.
 *
 * D1 es SQLite, así que esto no simula un motor: presenta la misma API que
 * expone Cloudflare —`prepare().bind().first()/all()/run()`— sobre el SQLite
 * que trae Node 22. El SQL que se prueba aquí es el mismo que corre en
 * producción, y el esquema se carga del mismo archivo que se despliega.
 *
 * Lo único que no cubre es la latencia y los límites de la plataforma. Todo lo
 * demás —tipos, restricciones, claves ajenas, el comportamiento de un UPDATE
 * que no encuentra filas— es de verdad.
 */

import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ESQUEMA = fileURLToPath(new URL('../../worker/src/esquema.sql', import.meta.url));

/**
 * @returns {{ DB: object, cerrar: Function, cruda: object }}
 */
export function baseDePrueba() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(ESQUEMA, 'utf8'));

  const DB = {
    prepare(sql) {
      return {
        bind(...valores) {
          const limpios = valores.map((v) => (v === undefined ? null : v));
          return {
            async first() {
              return sqlite.prepare(sql).get(...limpios) ?? null;
            },
            async all() {
              return { results: sqlite.prepare(sql).all(...limpios), success: true };
            },
            async run() {
              const r = sqlite.prepare(sql).run(...limpios);
              return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
            },
          };
        },
      };
    },
  };

  return { DB, cruda: sqlite, cerrar: () => sqlite.close() };
}

/** Dos academias con datos distintos: sin eso, una prueba de aislamiento no demuestra nada. */
export function sembrarAcademias(sqlite, ahora = Date.now()) {
  const insertar = sqlite.prepare(
    'INSERT INTO academias (id, nombre, codigo_alumno, codigo_profesor, plan, creada) VALUES (?, ?, ?, ?, ?, ?)',
  );
  insertar.run('rumbo', 'Academia Rumbo', 'RUMBO-2027', 'RUMBO-PROF', 'base', ahora);
  insertar.run('sigma', 'Academia Sigma', 'SIGMA-2027', 'SIGMA-PROF', 'base', ahora);

  const material = sqlite.prepare(
    `INSERT INTO materiales (id, academia_id, tipo, titulo, origen, licencia, fuente, curso_id, publicado, archivado, creado)
     VALUES (?, ?, 'resumen', ?, 'academia', 'propia', ?, 'algebra', 1, 0, ?)`,
  );
  material.run('m-rumbo', 'rumbo', 'Separata interna de Rumbo', 'Elaborado por Rumbo', ahora);
  material.run('m-sigma', 'sigma', 'Separata interna de Sigma', 'Elaborado por Sigma', ahora);
  material.run('m-base', 'base', 'Teoría de exponentes', 'Banco base de Umbral', ahora);
}
