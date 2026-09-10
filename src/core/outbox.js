/**
 * Bandeja de salida.
 *
 * Lo que haces sin conexión no se pierde: se guarda y se manda cuando vuelve
 * la señal. Pensado para el caso real de practicar en el micro y llegar a casa
 * con el progreso intacto.
 *
 * El almacenamiento entra como parámetro para poder probar esto sin navegador.
 * Es la razón de que el archivo no importe nada.
 */

const CLAVE = 'umbral:salida';
const TOPE = 500;

/** @typedef {{ id: string, tipo: string, carga: object, creado: number, intentos: number }} Envio */

/**
 * @param {Storage} [almacen]
 * @returns {Envio[]}
 */
export function pendientes(almacen = localStorage) {
  try {
    const bruto = JSON.parse(almacen.getItem(CLAVE) ?? '[]');
    return Array.isArray(bruto) ? bruto : [];
  } catch {
    almacen.removeItem(CLAVE);
    return [];
  }
}

function escribir(lista, almacen) {
  almacen.setItem(CLAVE, JSON.stringify(lista.slice(-TOPE)));
}

/**
 * Añade un envío. Si ya existe uno con el mismo id, no lo duplica: reintentar
 * el mismo intento de práctica dos veces no debe contar dos veces.
 *
 * @param {{ id: string, tipo: string, carga: object }} envio
 * @param {Storage} [almacen]
 * @returns {Envio[]}
 */
export function encolar(envio, almacen = localStorage) {
  const lista = pendientes(almacen);
  if (lista.some((e) => e.id === envio.id)) return lista;
  lista.push({ ...envio, creado: Date.now(), intentos: 0 });
  escribir(lista, almacen);
  return lista;
}

/**
 * Intenta enviar todo lo pendiente, en orden.
 *
 * Se detiene en el primer fallo en vez de seguir: si la red está caída, seguir
 * intentando los cien restantes solo gasta batería. Lo ya enviado se borra.
 *
 * @param {(envio: Envio) => Promise<void>} enviar
 * @param {Storage} [almacen]
 * @returns {Promise<{ enviados: number, quedan: number }>}
 */
export async function vaciar(enviar, almacen = localStorage) {
  const lista = pendientes(almacen);
  let enviados = 0;

  while (lista.length) {
    const envio = lista[0];
    try {
      await enviar(envio);
      lista.shift();
      enviados += 1;
      escribir(lista, almacen);
    } catch {
      envio.intentos += 1;
      escribir(lista, almacen);
      break;
    }
  }

  return { enviados, quedan: lista.length };
}

/** @param {Storage} [almacen] */
export function limpiar(almacen = localStorage) {
  almacen.removeItem(CLAVE);
}
