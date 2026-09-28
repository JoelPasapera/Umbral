/**
 * Criterios como prueba.
 *
 * Un criterio que no está automatizado es una sugerencia. Esto convierte en
 * fallo de construcción los puntos de CRITERIOS.md que se pueden verificar
 * leyendo el código.
 *
 * Cada comprobación cita su criterio para que, cuando falle, se sepa por qué
 * existe y no se borre por molesta.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const RAIZ = new URL('../', import.meta.url).pathname;

function archivos(dir, extensiones) {
  const salida = [];
  for (const entrada of readdirSync(join(RAIZ, dir))) {
    const relativo = join(dir, entrada);
    const completo = join(RAIZ, relativo);
    if (statSync(completo).isDirectory()) salida.push(...archivos(relativo, extensiones));
    else if (extensiones.includes(extname(entrada))) salida.push(relativo);
  }
  return salida;
}

const leer = (ruta) => readFileSync(join(RAIZ, ruta), 'utf8');
const hojas = archivos('src', ['.css']);
const guiones = archivos('src', ['.js']);

let fallos = 0;
const ok = (criterio, nombre, cumple, extra = '') => {
  console.log(`${cumple ? '  ok  ' : 'FALLO '} ${criterio}  ${nombre} ${extra}`);
  if (!cumple) fallos++;
};

/* 1.1 — un solo archivo tiene colores */
const conColor = hojas.filter((h) => /#[0-9a-fA-F]{3,6}\b/.test(leer(h)) && !h.endsWith('tokens.css'));
ok('1.1', 'solo tokens.css define colores', conColor.length === 0,
  conColor.length ? `→ también: ${conColor.join(', ')}` : `→ ${hojas.length} hojas revisadas`);

/* 3.7 — nada por debajo de 12px */
const pequenos = hojas.filter((h) => /font-size:\s*(?:[0-9]|1[01])px/.test(leer(h)));
ok('3.7', 'ningún texto por debajo de 12px', pequenos.length === 0,
  pequenos.length ? `→ ${pequenos.join(', ')}` : '');

/* 6.8 — sin temporizadores permanentes */
const conIntervalo = guiones.filter((g) => /setInterval\s*\(/.test(leer(g)));
ok('6.8', 'sin temporizadores permanentes', conIntervalo.length === 0,
  conIntervalo.length ? `→ ${conIntervalo.join(', ')}` : '');

/* 8.8 — todo enlace lleva href */
const sinHref = [];
for (const g of guiones) {
  const texto = leer(g);
  for (const coincidencia of texto.matchAll(/el\(\s*'a'\s*,/g)) {
    // Ventana fija: una plantilla con ${...} dentro cierra llaves antes de
    // tiempo, así que no sirve buscar el cierre del objeto.
    const ventana = texto.slice(coincidencia.index, coincidencia.index + 400);
    const hasta = ventana.indexOf("el('", 4);
    if (!/href/.test(hasta > 0 ? ventana.slice(0, hasta) : ventana)) sinHref.push(g);
  }
}
ok('8.8', 'todo enlace tiene href', sinHref.length === 0,
  sinHref.length ? `→ ${[...new Set(sinHref)].join(', ')}` : '');

/* 9.8 — no se bloquea pegar */
const bloqueanPegar = guiones.filter((g) => /'paste'|onpaste/.test(leer(g)));
ok('9.8', 'no se bloquea pegar en los campos', bloqueanPegar.length === 0,
  bloqueanPegar.length ? `→ ${bloqueanPegar.join(', ')}` : '');

/* 13.4 — ningún dato personal en el código */
const PATRONES_PERSONALES = [
  /\b9\d{8}\b/,                       // celular peruano
  /\b\d{8}\b(?=\s*(?:DNI|dni))/,      // documento
  // Correos reales. Se excluyen los dominios de ejemplo y las versiones de
  // paquete tipo "katex@0.16.11", que llevan arroba y no son un contacto.
  /[\w.+-]+@(?!\d)(?!umbral\.pe|ejemplo\.pe|sigma\.pe|b\.pe|x\.pe)[\w.-]+\.[a-zA-Z]{2,}/,
];
const conDatos = [];
for (const g of [...guiones, ...hojas]) {
  const texto = leer(g);
  if (PATRONES_PERSONALES.some((p) => p.test(texto))) conDatos.push(g);
}
ok('13.4', 'sin datos personales en el código', conDatos.length === 0,
  conDatos.length ? `→ ${conDatos.join(', ')}` : '');

/* 13.4b — ningún secreto en el repositorio.
   El identificador de cliente de Google es público y puede estar en el código.
   El *client secret* no: quien lo tenga puede suplantar a la aplicación ante
   Google. Empieza por "GOCSPX-" y es fácil pegarlo por error al copiar los dos
   valores del mismo diálogo. */
const PATRONES_SECRETO = [
  /GOCSPX-[\w-]{10,}/,                    // secreto de cliente de Google
  /sk-[A-Za-z0-9]{20,}/,                   // clave de API tipo OpenAI
  /service_role/,                          // clave de servicio de Supabase
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,    // clave privada
];
const conSecreto = [];
for (const archivo of [...guiones, ...hojas, 'index.html', 'portada.html', 'service-worker.js']) {
  const texto = leer(archivo);
  if (PATRONES_SECRETO.some((p) => p.test(texto))) conSecreto.push(archivo);
}
ok('13.4b', 'ningún secreto en el repositorio', conSecreto.length === 0,
  conSecreto.length ? `→ revisa: ${conSecreto.join(', ')}` : '→ el ID de cliente sí puede estar; el secreto no');

/* 13.4c — la identidad del propietario no aparece en el repositorio.
 *
 * Es una condición del proyecto, y se llegó a colar: el usuario de ejemplo y
 * dos pruebas llevaban su nombre. Esta guarda no puede contener el nombre que
 * busca, porque entonces sería ella quien lo publicara en el repositorio; por
 * eso guarda solo la huella SHA-256 de cada palabra y compara huellas.
 *
 * Las direcciones de despliegue quedan fuera a propósito: el `canonical` de
 * GitHub Pages lleva el usuario de la cuenta por cómo funciona ese servicio, y
 * cambiarlo rompe el posicionamiento. Eso se resuelve con dominio propio, no
 * con código.
 */
const { createHash } = await import('node:crypto');
const HUELLAS_VEDADAS = new Set(['a6761ccff1191f3ee53acada', 'bfe35e274efcae53d6457538']);
const huella = (palabra) => createHash('sha256').update(palabra).digest('hex').slice(0, 24);

const conIdentidad = [];
const todosLosTextos = [...guiones, ...hojas, 'index.html', 'portada.html',
  ...readdirSync(new URL('./', import.meta.url)).filter((f) => f.endsWith('.mjs')).map((f) => `pruebas/${f}`)];
for (const archivo of todosLosTextos) {
  let texto;
  try { texto = leer(archivo); } catch { continue; }
  // Fuera las direcciones: ahí el nombre de usuario viene impuesto por el
  // servicio de alojamiento, ver arriba.
  const sinEnlaces = texto.replace(/https?:\/\/[^\s'"<>)]+/g, ' ');
  const palabras = sinEnlaces.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-zñ]+/g) ?? [];
  if (palabras.some((w) => HUELLAS_VEDADAS.has(huella(w)))) conIdentidad.push(archivo);
}
ok('13.4c', 'la identidad del propietario no aparece en el repositorio', conIdentidad.length === 0,
  conIdentidad.length ? `→ revisa: ${conIdentidad.join(', ')}` : `→ ${todosLosTextos.length} archivos revisados`);

/* Una tarjeta grande sin imagen hace que el enlace compartido salga con un
   hueco en WhatsApp y en redes. Pasaba en el índice y no en la portada. */
const sinImagen = ['index.html', 'portada.html'].filter((f) => {
  const h = leer(f);
  return /twitter:card" content="summary_large_image"/.test(h) && !/property="og:image"/.test(h);
});
ok('9.x', 'toda página con tarjeta grande trae su imagen', sinImagen.length === 0,
  sinImagen.length ? `→ revisa: ${sinImagen.join(', ')}` : '');

/* 12.6 — la caché nunca responde a una escritura */
const sw = leer('service-worker.js');
ok('12.6', 'la caché ignora todo lo que no sea GET', /request\.method !== 'GET'/.test(sw));

/* 1.7 — los componentes no traen margen propio hacia arriba a la izquierda */
const conMargenSuelto = hojas.filter((h) => /margin:\s*-/.test(leer(h)) && !h.endsWith('base.css'));
ok('1.7', 'sin márgenes negativos improvisados', conMargenSuelto.length === 0,
  conMargenSuelto.length ? `→ ${conMargenSuelto.join(', ')}` : '');

/* 7.4 — se respeta la preferencia de movimiento reducido */
ok('7.4', 'se respeta prefers-reduced-motion',
  hojas.some((h) => /prefers-reduced-motion/.test(leer(h))));

/* 8.12 — existe el enlace para saltar al contenido */
ok('8.12', 'existe enlace para saltar al contenido', /salto-contenido/.test(leer('index.html')));

/* 8.11 — el documento declara idioma */
ok('8.11', 'el documento declara idioma', /<html lang="es"/.test(leer('index.html')));

/* 10.2 — ningún mensaje interno llega a pantalla */
const JERGA = /\b(undefined|null pointer|stack trace|SQL|\.sql|NaN|500 Internal)\b/;
const conJerga = guiones.filter((g) => {
  const textos = [...leer(g).matchAll(/texto:\s*'([^']{4,})'/g)].map((m) => m[1]);
  return textos.some((t) => JERGA.test(t));
});
ok('10.2', 'sin mensajes internos en pantalla', conJerga.length === 0,
  conJerga.length ? `→ ${conJerga.join(', ')}` : '');

console.log(
  fallos
    ? `\n${fallos} criterios incumplidos. Están en CRITERIOS.md con su porqué.`
    : '\nTODAS PASAN',
);
process.exit(fallos ? 1 : 0);
