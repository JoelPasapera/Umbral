/**
 * Claves y testigos.
 *
 * Todo sale de Web Crypto, que existe igual en un Worker y en Node 22. Eso
 * permite que las mismas pruebas corran contra el mismo código sin simulacros
 * ni dobles.
 *
 * No hay bcrypt ni argon2 en el borde, así que la derivación es PBKDF2-SHA256,
 * que es lo que ofrece la plataforma. El número de iteraciones se guarda en la
 * fila del usuario y no aquí: así se puede subir con el tiempo sin invalidar
 * las cuentas de quien se registró antes.
 */

/** Coste actual. Se guarda con cada cuenta, ver arriba. */
export const ITERACIONES = 210_000;

const cod = new TextEncoder();

const aHex = (buffer) =>
  Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');

const bytesAleatorios = (n) => crypto.getRandomValues(new Uint8Array(n));

/** Sal nueva para una cuenta nueva. */
export const salNueva = () => aHex(bytesAleatorios(16));

/**
 * Deriva la clave. Devuelve hexadecimal para poder guardarla como texto.
 *
 * @param {string} clave
 * @param {string} sal
 * @param {number} iteraciones
 * @returns {Promise<string>}
 */
export async function derivar(clave, sal, iteraciones = ITERACIONES) {
  const material = await crypto.subtle.importKey('raw', cod.encode(clave), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: cod.encode(sal), iterations: iteraciones, hash: 'SHA-256' },
    material,
    256,
  );
  return aHex(bits);
}

/**
 * Compara en tiempo constante.
 *
 * Comparar con `===` filtra por dónde empieza a diferir, y con suficientes
 * intentos eso se convierte en la clave. Cuesta cuatro líneas evitarlo.
 *
 * @param {string} a @param {string} b
 */
export function igualConstante(a, b) {
  const x = cod.encode(String(a ?? ''));
  const y = cod.encode(String(b ?? ''));
  if (x.length !== y.length) return false;
  let diferencia = 0;
  for (let i = 0; i < x.length; i += 1) diferencia |= x[i] ^ y[i];
  return diferencia === 0;
}

/**
 * @param {string} clave
 * @param {{clave_hash:string, sal:string, iteraciones:number}} fila
 */
export async function claveCorrecta(clave, fila) {
  if (!fila?.clave_hash || !fila?.sal) return false;
  const derivada = await derivar(clave, fila.sal, fila.iteraciones || ITERACIONES);
  return igualConstante(derivada, fila.clave_hash);
}

/** Testigo de sesión: 256 bits de azar, sin ninguna estructura que adivinar. */
export const testigoNuevo = () => aHex(bytesAleatorios(32));

/**
 * Huella del testigo, que es lo único que se guarda.
 *
 * Aquí no hace falta PBKDF2: el testigo ya es aleatorio de 256 bits, así que no
 * hay nada que adivinar por fuerza bruta y un SHA-256 basta. Encarecerlo solo
 * añadiría trabajo a cada petición.
 *
 * @param {string} testigo
 */
export async function huella(testigo) {
  return aHex(await crypto.subtle.digest('SHA-256', cod.encode(String(testigo ?? ''))));
}

/** Identificadores de fila, legibles y sin colisión práctica. */
export const idNuevo = (prefijo) => `${prefijo}-${aHex(bytesAleatorios(9))}`;
