/**
 * Generación de preguntas.
 *
 * Este módulo hace de servidor. Cuando exista el backend real, se reemplaza
 * por una función que llama al modelo; el contrato no cambia.
 *
 * Tres cosas viven aquí y no pueden vivir en el cliente:
 *
 * 1. **La clave del modelo.** Nunca sale del servidor. El navegador manda
 *    texto y recibe candidatas.
 *
 * 2. **El presupuesto.** Una factura variable sin techo es riesgo existencial
 *    para una academia pequeña. El tope es mensual, por academia, y se
 *    comprueba antes de gastar, no después.
 *
 * 3. **La cola de revisión.** Nada generado se publica solo. Va a borradores,
 *    lo aprueba un profesor, y queda marcado como generado para poder
 *    revertirlo si más adelante se descubre que estaba mal.
 */

import { revisarLote } from '../../domain/generation.js';

/** Consumo por academia. En producción es una tabla con corte mensual. */
const presupuestos = new Map();

/** Cola de borradores por academia. */
const colas = new Map();

const TOPE_MENSUAL = 200;
const COSTE_POR_LOTE = 10;

const presupuestoDe = (academiaId) =>
  presupuestos.get(academiaId) ?? { usado: 0, tope: TOPE_MENSUAL, mes: new Date().toISOString().slice(0, 7) };

const colaDe = (academiaId) => {
  if (!colas.has(academiaId)) colas.set(academiaId, []);
  return colas.get(academiaId);
};

/** @param {{ academiaId: string }} params */
export function estadoPresupuesto({ academiaId }) {
  const p = presupuestoDe(academiaId);
  return { ...p, restante: Math.max(0, p.tope - p.usado), lotes: Math.floor((p.tope - p.usado) / COSTE_POR_LOTE) };
}

/**
 * El modelo, simulado.
 *
 * Devuelve a propósito una mezcla de candidatas buenas y rotas: sin eso, la
 * puerta de validación no se estaría probando contra nada. Un modelo real
 * produce exactamente este tipo de fallos.
 */
function modeloSimulado(material, cursoId, temaId, cantidad) {
  const fragmento = material.slice(0, 80).replace(/\s+/g, ' ').trim();

  const plantillas = [
    {
      enunciado: 'Si $\\sec x - \\tan x = 5$, ¿cuánto vale $\\sec x + \\tan x$?',
      opciones: ['$\\tfrac{1}{5}$', '$5$', '$25$', '$\\tfrac{1}{25}$'],
      correcta: 0,
      explicacion:
        'Porque $\\sec^2 x - \\tan^2 x = 1$ se factoriza como $(\\sec x - \\tan x)(\\sec x + \\tan x) = 1$. Si el primer factor vale 5, el segundo es su inverso.',
      dificultad: 0.33,
    },
    {
      enunciado: 'Reduce la expresión $\\cos^4 x - \\sin^4 x$.',
      opciones: ['$\\cos 2x$', '$\\sin 2x$', '$1$', '$2\\cos^2 x$'],
      correcta: 0,
      explicacion:
        'Es una diferencia de cuadrados: $(\\cos^2 x - \\sin^2 x)(\\cos^2 x + \\sin^2 x)$. El segundo paréntesis vale 1 y el primero es la identidad del coseno del ángulo doble.',
      dificultad: 0.41,
    },
    // Rota a propósito: alternativas repetidas.
    {
      enunciado: '¿Cuál es el valor de $\\tan 45^\\circ$?',
      opciones: ['$1$', '$1$', '$0$', '$\\sqrt{2}$'],
      correcta: 0,
      explicacion: 'En el triángulo notable de 45 grados los catetos son iguales, así que el cociente vale 1.',
      dificultad: 0.8,
    },
    // Rota a propósito: fórmula sin cerrar.
    {
      enunciado: 'Calcula $\\sin 30^\\circ + \\cos 60^\\circ',
      opciones: ['$1$', '$0$', '$\\tfrac{1}{2}$', '$2$'],
      correcta: 0,
      explicacion: 'Ambas razones valen un medio, así que la suma es uno.',
      dificultad: 0.7,
    },
    // Rota a propósito: sin explicación.
    {
      enunciado: 'Si $\\sin x = \\tfrac{3}{5}$ y $x$ está en el primer cuadrante, ¿cuánto vale $\\cos x$?',
      opciones: ['$\\tfrac{4}{5}$', '$\\tfrac{3}{4}$', '$\\tfrac{5}{4}$', '$\\tfrac{5}{3}$'],
      correcta: 0,
      explicacion: '',
      dificultad: 0.6,
    },
    // Sospechosa: copiada del material.
    {
      enunciado: fragmento,
      opciones: ['Verdadero', 'Falso', 'Depende del caso', 'No se puede saber'],
      correcta: 0,
      explicacion: 'Se deduce directamente de lo que dice el texto sobre el tema tratado en la sección.',
      dificultad: 0.5,
    },
    // Sospechosa: la correcta es mucho más larga que las demás.
    {
      enunciado: '¿Qué caracteriza a una identidad trigonométrica?',
      opciones: [
        'Que se cumple para todo valor del ángulo en el que ambos lados están definidos, a diferencia de una ecuación',
        'Que tiene solución',
        'Que es falsa',
        'Que solo vale en el primer cuadrante',
      ],
      correcta: 0,
      explicacion:
        'Porque una identidad es válida en todo el dominio, mientras que una ecuación solo se cumple para ciertos valores.',
      dificultad: 0.55,
    },
  ];

  return plantillas.slice(0, cantidad).map((p) => ({ ...p, cursoId, temaId }));
}

/**
 * Genera un lote de candidatas a partir de material de la academia.
 *
 * @param {{ academiaId:string, material:string, cursoId:string, temaId:string,
 *           cantidad?:number, cursos:string[], banco?:object[] }} params
 */
export function generarPreguntas({
  academiaId, material, cursoId, temaId, cantidad = 7, cursos, banco = [],
}) {
  const texto = String(material ?? '').trim();
  if (texto.length < 120) {
    throw new Error('Pega al menos un párrafo de material: con menos, el modelo se inventa las preguntas.');
  }
  if (!cursos.includes(cursoId)) throw new Error('Ese curso no está en el temario de la academia.');
  if (!String(temaId ?? '').trim()) throw new Error('Indica el tema: sin él no se puede recomendar material después.');

  // El presupuesto se comprueba ANTES de gastar. Comprobarlo después es
  // descubrir la factura cuando ya no se puede evitar.
  const presupuesto = presupuestoDe(academiaId);
  if (presupuesto.usado + COSTE_POR_LOTE > presupuesto.tope) {
    throw new Error(
      `Se agotó el presupuesto de generación de este mes (${presupuesto.tope} créditos). Se renueva el día 1.`,
    );
  }

  const brutas = modeloSimulado(texto, cursoId, String(temaId).trim(), cantidad);
  const revision = revisarLote(brutas, { cursos, banco, fuente: texto });

  presupuestos.set(academiaId, { ...presupuesto, usado: presupuesto.usado + COSTE_POR_LOTE });

  const cola = colaDe(academiaId);
  let contador = cola.length;
  const nuevas = revision.aceptadas.map((r) => ({
    id: `g-${academiaId}-${(contador += 1)}`,
    estado: 'borrador',
    avisos: r.problemas,
    generado: Date.now(),
    ...r.candidata,
  }));
  cola.push(...nuevas);

  return {
    resumen: revision.resumen,
    descartadas: revision.rechazadas.map((r) => ({
      enunciado: r.candidata.enunciado.slice(0, 90),
      motivos: r.problemas.filter((p) => p.nivel === 'rechazo').map((p) => p.mensaje),
    })),
    borradores: nuevas,
    presupuesto: estadoPresupuesto({ academiaId }),
  };
}

/** @param {{ academiaId: string }} params */
export function cola({ academiaId }) {
  return { borradores: colaDe(academiaId).filter((b) => b.estado === 'borrador') };
}

/**
 * Aprobar o descartar. Devuelve la pregunta lista para publicarse.
 * @param {{ academiaId:string, id:string, decision:'aprobar'|'descartar', cambios?:object }} params
 */
export function decidir({ academiaId, id, decision, cambios = {} }) {
  const cola = colaDe(academiaId);
  const borrador = cola.find((b) => b.id === id && b.estado === 'borrador');
  if (!borrador) throw new Error('Ese borrador ya no está pendiente.');

  if (decision === 'descartar') {
    borrador.estado = 'descartado';
    return { id, publicada: null };
  }

  Object.assign(borrador, cambios);
  borrador.estado = 'aprobado';

  return {
    id,
    publicada: {
      enunciado: borrador.enunciado,
      opciones: borrador.opciones,
      correcta: borrador.correcta,
      explicacion: borrador.explicacion,
      cursoId: borrador.cursoId,
      temaId: borrador.temaId,
      dificultad: borrador.dificultad,
      // Queda marcada de por vida: si mañana se descubre que una tanda salió
      // mal, se pueden encontrar todas y retirarlas.
      origen: 'generado',
      publicado: false,
    },
  };
}

export const COSTE = Object.freeze({ COSTE_POR_LOTE, TOPE_MENSUAL });
