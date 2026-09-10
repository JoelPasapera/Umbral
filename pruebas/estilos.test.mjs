/**
 * Choques de nombre entre hojas de estilo.
 *
 * Existe por un fallo concreto: la biblioteca llamó `ficha` a sus tarjetas de
 * material, y `ficha` ya era el cuadrado de 44 píxeles del icono en base.css.
 * Las once tarjetas se metieron dentro de un icono y la pantalla salió
 * ilegible. Nada avisó: el CSS no da error al reutilizar un nombre, y como el
 * bloque no se redefinía, comparar hoja contra hoja tampoco lo veía.
 *
 * La firma del fallo es precisa y por eso se puede vigilar: una pantalla que
 * define `bloque__elemento` sin definir `bloque`, cuando `bloque` existe en la
 * hoja compartida. Eso significa que está heredando un estilo que no escribió
 * y que casi nunca es el que quiere.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const raiz = fileURLToPath(new URL('../src/', import.meta.url));
const clasesDe = (texto) => new Set([...texto.matchAll(/\.([a-zA-Z][\w-]*)\s*[,{:.\s]/g)].map((m) => m[1]));

const compartidas = clasesDe(readFileSync(`${raiz}ui/base.css`, 'utf8'));

const hojas = readdirSync(`${raiz}features`, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(`${raiz}features/${d.name}`)
    .filter((f) => f.endsWith('.css'))
    .map((f) => ({ pantalla: d.name, ruta: `${raiz}features/${d.name}/${f}` })));

const robados = [];
for (const { pantalla, ruta } of hojas) {
  const propias = clasesDe(readFileSync(ruta, 'utf8'));
  for (const clase of propias) {
    const bloque = clase.split('__')[0];
    if (bloque === clase) continue;
    if (compartidas.has(bloque) && !propias.has(bloque)) {
      robados.push(`${pantalla}: .${clase} hereda .${bloque} de base.css`);
    }
  }
}

ok('ninguna pantalla hereda por accidente un bloque de base.css',
  robados.length === 0,
  robados.length ? `→ ${robados.join(' · ')}` : `→ ${hojas.length} hojas revisadas`);

/*
 * Una hoja con las llaves descuadradas no da error: el navegador se come lo
 * que puede y descarta el resto en silencio. Pasó al borrar una sección con
 * una expresión regular: se llevó los selectores y dejó los cuerpos sueltos,
 * y estas comprobaciones seguían en verde con la hoja rota.
 */
const rotas = [];
for (const { pantalla, ruta } of [...hojas, { pantalla: 'base', ruta: `${raiz}ui/base.css` }, { pantalla: 'tokens', ruta: `${raiz}ui/tokens.css` }]) {
  const texto = readFileSync(ruta, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const abre = (texto.match(/\{/g) ?? []).length;
  const cierra = (texto.match(/\}/g) ?? []).length;
  if (abre !== cierra) rotas.push(`${pantalla}: ${abre} abiertas, ${cierra} cerradas`);
  // Un cuerpo sin selector: una línea de propiedad justo después de un cierre.
  if (/\}\s*\n\s*\n?\s*[a-z-]+\s*:\s*[^;{]+;/.test(texto)) rotas.push(`${pantalla}: hay un cuerpo sin selector`);
}
ok('ninguna hoja tiene las llaves descuadradas ni cuerpos sueltos',
  rotas.length === 0,
  rotas.length ? `→ ${rotas.join(' · ')}` : `→ ${hojas.length + 2} hojas revisadas`);

/* Una variable que no existe no da error: simplemente no pinta. */
const tokens = new Set([...readFileSync(`${raiz}ui/tokens.css`, 'utf8').matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]));
const inventados = [];
for (const { pantalla, ruta } of [...hojas, { pantalla: 'base', ruta: `${raiz}ui/base.css` }]) {
  for (const [, token] of readFileSync(ruta, 'utf8').matchAll(/var\((--[\w-]+)/g)) {
    if (!tokens.has(token)) inventados.push(`${pantalla}: ${token}`);
  }
}
ok('ninguna hoja usa un token que no existe',
  inventados.length === 0,
  inventados.length ? `→ ${inventados.join(' · ')}` : `→ ${tokens.size} tokens declarados`);

/*
 * Funciones llamadas que no existen.
 *
 * Al borrar una sección con una expresión regular se llevó por delante tres
 * funciones de la biblioteca que otras seguían llamando. El archivo se analiza
 * sin error —las declaraciones se resuelven al ejecutar, no al leer— así que
 * todo seguía en verde y la pantalla reventaba al abrir una universidad.
 * Ninguna prueba pinta las vistas, y por eso hace falta mirarlo así.
 */
const palabrasClave = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'typeof', 'function', 'await', 'super',
  'async', 'var', 'let', 'const', 'new', 'delete', 'void', 'do', 'else', 'try', 'in', 'of',
  'instanceof', 'yield', 'import', 'export', 'class', 'this',
]);
const globales = new Set([
  'String', 'Number', 'Boolean', 'Array', 'Object', 'Set', 'Map', 'WeakMap', 'Math', 'JSON',
  'Date', 'Promise', 'Error', 'RegExp', 'Symbol', 'BigInt', 'parseInt', 'parseFloat', 'isNaN',
  'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'setTimeout', 'clearTimeout',
  'requestAnimationFrame', 'cancelAnimationFrame', 'queueMicrotask', 'fetch', 'structuredClone',
  'FormData', 'Image', 'Blob', 'URL', 'URLSearchParams', 'IntersectionObserver', 'MutationObserver',
  'AbortController', 'CustomEvent', 'Event', 'Intl', 'alert', 'confirm', 'prompt',
]);

const huerfanas = [];
const vistas = readdirSync(`${raiz}features`, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(`${raiz}features/${d.name}`)
    .filter((f) => f.endsWith('.js'))
    .map((f) => ({ pantalla: d.name, ruta: `${raiz}features/${d.name}/${f}` })));

for (const { pantalla, ruta } of vistas) {
  // Solo se quitan los comentarios. Intentar recortar también las cadenas con
  // expresiones regulares salía peor: una plantilla con `${...}` no casaba
  // entera y el recorte se comía código de verdad, incluidas las
  // declaraciones que esta comprobación busca.
  const texto = readFileSync(ruta, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');

  const declaradas = new Set([
    ...[...texto.matchAll(/(?:function|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]),
    ...[...texto.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]),
    ...[...texto.matchAll(/import\s*\{([^}]*)\}/g)].flatMap((m) =>
      m[1].split(',').map((x) => x.split(' as ').pop().trim())),
    ...[...texto.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from/g)].map((m) => m[1]),
    ...[...texto.matchAll(/(?:\(|,)\s*\{?\s*([A-Za-z_$][\w$]*)\s*(?:\}|,|\)|=)/g)].map((m) => m[1]),
    ...[...texto.matchAll(/[{,]\s*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g)].map((m) => m[1]),
  ]);

  // Sin espacio antes del paréntesis: una llamada se escribe `foo(`, mientras
  // que el texto "Resultados (12)" de una plantilla lleva espacio y así no se
  // confunde con una función.
  for (const [, nombre] of texto.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\(/g)) {
    if (palabrasClave.has(nombre) || globales.has(nombre) || declaradas.has(nombre)) continue;
    huerfanas.push(`${pantalla}: ${nombre}()`);
  }
}

ok('ninguna vista llama a una función que no existe',
  huerfanas.length === 0,
  huerfanas.length ? `→ ${[...new Set(huerfanas)].join(' · ')}` : `→ ${vistas.length} archivos revisados`);

/* `el` filtra los hijos falsos y `montar` tiene que hacer lo mismo, o un
   condicional que no se cumple acaba escrito como "false" en la pantalla. */
const dom = readFileSync(`${raiz}core/dom.js`, 'utf8');
const cuerpoMontar = dom.slice(dom.indexOf('export function montar'));
ok('montar filtra los hijos falsos igual que el()',
  /!== false/.test(cuerpoMontar.slice(0, 600)));

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
