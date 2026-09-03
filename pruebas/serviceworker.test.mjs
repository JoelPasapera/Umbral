/**
 * El service worker no se puede ejecutar en Node, pero sí se puede auditar.
 * Estas comprobaciones vigilan justo los errores que dejan a los usuarios
 * clavados en una versión vieja o con el teléfono lleno.
 */
import { readFileSync } from 'node:fs';

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

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
