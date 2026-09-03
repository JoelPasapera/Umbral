/**
 * Reto diario.
 *
 * Existe por una razón que no es la gamificación: **es la única evidencia que
 * corrige el servidor.** La práctica libre lleva las respuestas en el paquete
 * para funcionar sin conexión, y por eso pesa 0.4 en el cálculo. El reto se
 * corrige aquí, no se puede mirar antes, y pesa 1.
 *
 * De ahí salen las reglas:
 *   - Uno por día, sin repeticiones. Repetir hasta acertar destruiría el valor
 *     del dato, que es lo único que justifica su peso.
 *   - Se ataca lo que peor llevas. No es trivia al azar: son cinco preguntas
 *     de los cursos donde estás perdiendo más puntos.
 *   - Si ya lo hiciste, se muestra el resultado y no se deja rehacer.
 */

const DIA = 86_400_000;

/** Intentos por usuario y día. En producción es una tabla con clave única. */
const historial = new Map();

const claveDia = (fecha = Date.now()) => new Date(fecha).toISOString().slice(0, 10);
const claveUsuario = (usuarioId, dia) => `${usuarioId}|${dia}`;

/**
 * Racha: días consecutivos con el reto terminado, contando desde hoy o desde
 * ayer. Se admite ayer para que la racha no se rompa a medianoche de alguien
 * que estudió hasta tarde.
 *
 * @param {string} usuarioId
 * @param {number} ahora
 */
export function calcularRacha(usuarioId, ahora = Date.now()) {
  const dias = [];
  for (let i = 0; i < 365; i += 1) {
    const dia = claveDia(ahora - i * DIA);
    if (historial.has(claveUsuario(usuarioId, dia))) dias.push(dia);
    else if (i > 0 || dias.length) break;
  }

  const hoy = claveDia(ahora);
  const ayer = claveDia(ahora - DIA);
  const activa = dias[0] === hoy || dias[0] === ayer;

  // Últimos 28 días, para mostrar constancia sin depender de un contador
  // frágil que castiga un solo día perdido.
  const calendario = Array.from({ length: 28 }, (_, i) => {
    const dia = claveDia(ahora - (27 - i) * DIA);
    return { dia, hecho: historial.has(claveUsuario(usuarioId, dia)) };
  });

  const total = calendario.filter((d) => d.hecho).length;
  return { actual: activa ? dias.length : 0, calendario, ultimos28: total };
}

/**
 * Estado del reto de hoy.
 * @param {{ usuarioId: string }} params
 */
export function estadoReto({ usuarioId }) {
  const registro = historial.get(claveUsuario(usuarioId, claveDia()));
  return {
    hecho: Boolean(registro),
    resultado: registro ? { aciertos: registro.aciertos, total: registro.total } : null,
    racha: calcularRacha(usuarioId),
  };
}

/**
 * Elige las preguntas del día.
 *
 * `debiles` llega ordenado por puntos recuperables; se toman preguntas de los
 * tres primeros cursos. Si no hay diagnóstico todavía, se reparte.
 *
 * @param {object[]} banco
 * @param {string[]} debiles
 * @param {number} cantidad
 * @param {string} semilla
 */
export function elegirPreguntasDelDia(banco, debiles, cantidad, semilla) {
  const prioritarios = new Set(debiles.slice(0, 3));
  const puntuar = (p) => (prioritarios.has(p.cursoId) ? 0 : 1);

  let s = [...semilla].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 7);
  const azar = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);

  return [...banco]
    .map((p) => ({ p, orden: puntuar(p) + azar() }))
    .sort((a, b) => a.orden - b.orden)
    .slice(0, cantidad)
    .map(({ p }) => p);
}

/**
 * Registra el resultado. Idempotente por diseño: si ya existe el del día, se
 * devuelve el que había.
 *
 * @param {{ usuarioId: string, aciertos: number, total: number }} params
 */
export function registrarReto({ usuarioId, aciertos, total }) {
  const dia = claveDia();
  const clave = claveUsuario(usuarioId, dia);
  if (historial.has(clave)) return { ...historial.get(clave), repetido: true };

  const registro = { dia, aciertos, total, cuando: Date.now() };
  historial.set(clave, registro);
  return { ...registro, repetido: false, racha: calcularRacha(usuarioId) };
}

/** Solo para la maqueta: siembra días pasados para que la racha se vea. */
export function sembrarRacha(usuarioId, diasAtras) {
  for (const i of diasAtras) {
    const dia = claveDia(Date.now() - i * DIA);
    historial.set(claveUsuario(usuarioId, dia), { dia, aciertos: 3, total: 5, cuando: Date.now() });
  }
}
