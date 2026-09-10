/**
 * Cobertura de contenido.
 *
 * El espejo de `readiness.js`. Aquel mide lo que sabe el estudiante; este mide
 * lo que le falta al catálogo para poder medirlo.
 *
 * La conexión es directa y por eso vale la pena: un curso sin preguntas
 * suficientes hace que el estudiante vea "todavía no puedo estimar tu nivel".
 * Un tema con preguntas pero sin material lo deja fallando sin dónde estudiar.
 * Las dos cosas son huecos del catálogo, no del alumno, y hasta ahora nadie
 * se los enseñaba a quien puede arreglarlos.
 *
 * Puro: sin DOM, sin red, sin reloj propio.
 */

/** Preguntas publicadas por debajo de las cuales un curso no se puede diagnosticar. */
const MINIMO_PREGUNTAS = 8;

/** @typedef {{ cursoId:string, temaId:string, publicado:boolean }} Pieza */

/**
 * @typedef {object} HuecoCurso
 * @property {string} cursoId
 * @property {string} nombre
 * @property {number} peso
 * @property {number} preguntas
 * @property {number} materiales
 * @property {'sin-preguntas'|'pocas-preguntas'|'sin-material'|'completo'} estado
 * @property {number} urgencia peso del examen que queda sin medir
 */

/**
 * @param {import('./readiness.js').Examen} examen
 * @param {Pieza[]} preguntas
 * @param {Pieza[]} materiales
 * @returns {{
 *   cursos: HuecoCurso[],
 *   temasHuerfanos: {cursoId:string, temaId:string, preguntas:number}[],
 *   pesoSinMedir: number,
 *   pesoTotal: number
 * }}
 */
export function calcularCobertura(examen, preguntas, materiales) {
  const publicadas = preguntas.filter((p) => p.publicado);
  const disponibles = materiales.filter((m) => m.publicado);

  const contar = (lista, cursoId) => lista.filter((x) => x.cursoId === cursoId).length;

  const cursos = examen.cursos.map((curso) => {
    const nPreguntas = contar(publicadas, curso.cursoId);
    const nMateriales = contar(disponibles, curso.cursoId);

    let estado = 'completo';
    if (nPreguntas === 0) estado = 'sin-preguntas';
    else if (nPreguntas < MINIMO_PREGUNTAS) estado = 'pocas-preguntas';
    else if (nMateriales === 0) estado = 'sin-material';

    return {
      cursoId: curso.cursoId,
      nombre: curso.nombre,
      peso: curso.peso,
      preguntas: nPreguntas,
      materiales: nMateriales,
      estado,
      urgencia: estado === 'completo' ? 0 : curso.peso,
    };
  });

  // Temas donde el alumno puede fallar y no tiene dónde estudiar. Es el hueco
  // más frustrante de todos: le decimos que va mal y lo dejamos ahí.
  const temasConMaterial = new Set(disponibles.map((m) => `${m.cursoId}/${m.temaId}`));
  const conteoTemas = new Map();
  for (const p of publicadas) {
    const clave = `${p.cursoId}/${p.temaId}`;
    conteoTemas.set(clave, (conteoTemas.get(clave) ?? 0) + 1);
  }

  const temasHuerfanos = [...conteoTemas.entries()]
    .filter(([clave]) => !temasConMaterial.has(clave))
    .map(([clave, cantidad]) => {
      const [cursoId, temaId] = clave.split('/');
      return { cursoId, temaId, preguntas: cantidad };
    })
    .sort((a, b) => b.preguntas - a.preguntas);

  const pesoTotal = examen.cursos.reduce((s, c) => s + c.peso, 0);
  const pesoSinMedir = cursos
    .filter((c) => c.estado === 'sin-preguntas' || c.estado === 'pocas-preguntas')
    .reduce((s, c) => s + c.peso, 0);

  return {
    cursos: cursos.sort((a, b) => b.urgencia - a.urgencia || a.nombre.localeCompare(b.nombre, 'es')),
    temasHuerfanos,
    pesoSinMedir,
    pesoTotal,
  };
}

export const CONSTANTES_COBERTURA = Object.freeze({ MINIMO_PREGUNTAS });
