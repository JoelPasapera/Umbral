/**
 * Sella el service worker con la huella de lo que precarga.
 *
 * Existe por un fallo que no da ningún error y por eso es de los peores: se
 * publica una versión nueva, no se sube `VERSION`, y los navegadores que ya
 * habían entrado siguen sirviendo el código viejo desde su caché. La página
 * carga, no se rompe nada visible, y la funcionalidad nueva simplemente no
 * existe para quien ya era usuario. Pasó con la biblioteca: el índice llegaba
 * fresco con el enlace y el `main.js` salía de la caché sin la ruta.
 *
 * Ahora la versión se calcula del contenido: cambiar un archivo precargado
 * cambia la huella. `pruebas/serviceworker.test.mjs` compara y se pone rojo si
 * no coinciden, así que olvidarse deja de ser posible.
 *
 * Uso:  node herramientas/sellar.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const SW = `${RAIZ}service-worker.js`;

/** Lee la lista de precarga del propio service worker: una sola fuente. */
export function rutasPrecargadas(fuente) {
  const bloque = fuente.slice(fuente.indexOf('const PRECARGA = ['), fuente.indexOf('];', fuente.indexOf('const PRECARGA = [')));
  return [...bloque.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
}

/**
 * Huella del contenido precargado más la del propio service worker sin su
 * línea de versión, que si no se muerde la cola.
 */
export function huellaDe(raiz, fuente) {
  const hash = createHash('sha256');
  for (const ruta of rutasPrecargadas(fuente).sort()) {
    try {
      hash.update(ruta).update(readFileSync(raiz + ruta));
    } catch {
      hash.update(`${ruta}:ausente`);
    }
  }
  hash.update(fuente.replace(/const VERSION = '[^']*';/, ''));
  return hash.digest('hex').slice(0, 10);
}

export const versionDe = (fuente) => fuente.match(/const VERSION = '([^']*)';/)?.[1] ?? null;

if (import.meta.url === `file://${process.argv[1]}`) {
  const fuente = readFileSync(SW, 'utf8');
  const nueva = `v${huellaDe(RAIZ, fuente)}`;
  const anterior = versionDe(fuente);

  if (anterior === nueva) {
    console.log(`Ya está sellado: ${nueva}`);
  } else {
    writeFileSync(SW, fuente.replace(/const VERSION = '[^']*';/, `const VERSION = '${nueva}';`));
    console.log(`Sellado: ${anterior} → ${nueva}`);
    console.log('Los navegadores que ya entraron descargarán la versión nueva.');
  }
}
