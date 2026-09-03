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
