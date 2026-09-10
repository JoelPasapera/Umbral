/**
 * El service worker no se puede ejecutar en Node, pero sí se puede auditar.
 * Estas comprobaciones vigilan justo los errores que dejan a los usuarios
 * clavados en una versión vieja o con el teléfono lleno.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sw = readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

ok('declara una versión', /const VERSION = '[^']+'/.test(sw));
ok('borra las cachés viejas al activarse', sw.includes('caches.delete'));
ok('ignora todo lo que no sea GET', /request\.method !== 'GET'/.test(sw));
ok('la navegación pide a la red primero', /request\.mode === 'navigate'[\s\S]{0,200}redPrimero/.test(sw));
ok('no guarda respuestas opacas', /type !== 'opaque'/.test(sw));
ok('no guarda respuestas con error', /respuesta\.ok/.test(sw));
ok('las imágenes tienen tope', /TOPE_IMAGENES/.test(sw) && /recortar\(/.test(sw));
ok('no se impone solo', !/skipWaiting\(\)\s*;?\s*\n?\s*\}\)?\s*;?\s*$/m.test(sw.split('addEventListener')[1] ?? ''));
ok('espera permiso para activarse', /activar-ahora/.test(sw) && /self\.skipWaiting/.test(sw));
ok('la precarga tolera archivos ausentes', /cache\.add\(ruta\)\.catch/.test(sw));

const rutas = [...sw.matchAll(/'\.\/(src\/[^']+|index\.html|manifest\.json)'/g)].map(m => m[1]);
const { existsSync } = await import('node:fs');
const faltan = rutas.filter(r => !existsSync(new URL(`../${r}`, import.meta.url)));
ok('todo lo precargado existe', faltan.length === 0, faltan.length ? `→ falta ${faltan.join(', ')}` : `→ ${rutas.length} archivos`);

// En local no debe registrarse: si lo hiciera, cada cambio tardaría dos
// recargas en verse y se perseguirían fantasmas.
const conexion = readFileSync(new URL('../src/core/conexion.js', import.meta.url), 'utf8');
ok('no se registra en local', /HOSTS_LOCALES/.test(conexion) && /unregister\(\)/.test(conexion));
ok('limpia las cachés viejas al desactivarse en local', /caches\.delete/.test(conexion));
ok('se puede forzar con ?sw para probar sin conexión', /has\('sw'\)/.test(conexion));


/* --- Que lo publicado llegue de verdad al navegador --- */

/*
 * El fallo que estas tres comprobaciones vigilan no da ningún error: se publica
 * una versión nueva, la caché sigue sirviendo la vieja, la página carga bien y
 * la funcionalidad nueva simplemente no existe para quien ya era usuario. Pasó
 * con la biblioteca. Se descubrió porque el botón no hacía nada.
 */
const { huellaDe, versionDe, rutasPrecargadas } = await import('../herramientas/sellar.mjs');
const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const fuenteSW = readFileSync(`${RAIZ}service-worker.js`, 'utf8');

ok('la versión de la caché coincide con lo que precarga',
  versionDe(fuenteSW) === `v${huellaDe(RAIZ, fuenteSW)}`,
  versionDe(fuenteSW) === `v${huellaDe(RAIZ, fuenteSW)}`
    ? `→ ${versionDe(fuenteSW)}`
    : '→ cambió un archivo precargado: corre `node herramientas/sellar.mjs`');

const indice = readFileSync(`${RAIZ}index.html`, 'utf8');
const hojasDelIndice = [...indice.matchAll(/<link rel="stylesheet" href="\.\/([^"]+)"/g)].map((m) => m[1]);
const precargadas = new Set(rutasPrecargadas(fuenteSW));
const sinPrecargar = hojasDelIndice.filter((h) => !precargadas.has(h));
ok('toda hoja de estilo del índice está precargada',
  sinPrecargar.length === 0,
  sinPrecargar.length ? `→ falta: ${sinPrecargar.join(', ')}` : `→ ${hojasDelIndice.length} hojas`);

const ausentes = rutasPrecargadas(fuenteSW).filter((r) => r && !existsSync(RAIZ + r));
ok('no se precarga ningún archivo que no exista',
  ausentes.length === 0,
  ausentes.length ? `→ ${ausentes.join(', ')}` : '→ todas las rutas resuelven');

/*
 * El bucle cerrado: el navegador guarda el propio service-worker.js en su caché
 * HTTP, así que nunca llega a leer que hay una versión nueva y sigue sirviendo
 * el shell viejo indefinidamente. Sellar la versión no arregla eso, porque el
 * archivo que la declara es justo el que no se relee.
 */
const cabeceras = readFileSync(`${RAIZ}_headers`, 'utf8');
const bloqueSW = cabeceras.slice(cabeceras.indexOf('/service-worker.js'));
ok('el service worker se declara sin caché para Cloudflare Pages',
  /no-cache/.test(bloqueSW.split('\n').slice(0, 3).join('\n')));
ok('el índice se revalida en cada visita',
  /\/index\.html\n\s*Cache-Control: no-cache/.test(cabeceras));

/*
 * Que exista el aviso de versión nueva no basta si nadie llega a dispararlo.
 * Con enrutador por hash, moverse entre pantallas no es una navegación, así que
 * el navegador no comprueba el service worker por su cuenta: hay que pedírselo.
 */

ok('la aplicación pregunta por versión nueva al volver a la pestaña',
  /visibilitychange/.test(conexion) && /registro\.update\(\)/.test(conexion));
ok('y también al recuperar la conexión',
  /addEventListener\('online', revisarVersion\)/.test(conexion));
ok('la consulta va limitada para no repetirse en cada cambio de foco',
  /ultimaConsulta/.test(conexion));
ok('hay aviso con botón cuando queda una versión esperando',
  /registro\.waiting/.test(conexion) && /activar-ahora/.test(conexion));

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
