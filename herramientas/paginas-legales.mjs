/**
 * Genera `privacidad.html` y `terminos.html` a partir de `src/data/legal.js`.
 *
 * Son páginas estáticas y públicas a propósito: Google, y cualquier tienda de
 * aplicaciones, exigen que la política de privacidad sea accesible sin cuenta
 * y en una URL propia. Una política detrás de un login no le sirve a nadie, y
 * Google la rechaza.
 *
 * Se generan en vez de escribirse a mano para que nunca diverjan del texto que
 * la aplicación muestra por dentro. Correr tras cualquier cambio en legal.js:
 *
 *     node herramientas/paginas-legales.mjs
 */
import { writeFileSync } from 'node:fs';
import { PRIVACIDAD, TERMINOS, CONTACTO, AVISO_BORRADOR } from '../src/data/legal.js';

const escapar = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function pagina({ titulo, entrada, secciones }, archivo, otra) {
  const cuerpo = secciones
    .map(
      (s) =>
        `  <section class="bloque">\n    <h2>${escapar(s.titulo)}</h2>\n` +
        s.parrafos.map((p) => `    <p>${escapar(p)}</p>`).join('\n') +
        `\n  </section>`,
    )
    .join('\n\n');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(titulo)} · Umbral</title>
<meta name="description" content="${escapar(entrada.slice(0, 155))}">
<meta name="robots" content="index, follow">
<link rel="icon" href="./icono.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400..800&display=swap">
<link rel="stylesheet" href="./src/ui/tokens.css">
<link rel="stylesheet" href="./legal.css">
</head>
<body>
<header class="cabecera">
  <a class="marca" href="./portada.html">
    <svg viewBox="0 0 60 42" aria-hidden="true"><path d="M19 36 L19 20 A11 11 0 0 1 41 20 L41 36" fill="none" stroke="currentColor" stroke-width="5"/><rect x="0" y="36" width="60" height="3.5" fill="currentColor" opacity=".5"/></svg>
    <span>Umbral</span>
  </a>
</header>

<main class="documento">
  <h1>${escapar(titulo)}</h1>
  <p class="entrada">${escapar(entrada)}</p>
  <p class="borrador">${escapar(AVISO_BORRADOR)}</p>

${cuerpo}

  <section class="bloque">
    <h2>Contacto</h2>
    <p>Para cualquier consulta sobre esta página o sobre tus datos, escribe a <a href="mailto:${CONTACTO}">${CONTACTO}</a>.</p>
  </section>

  <nav class="pie">
    <a href="./${otra.archivo}">${escapar(otra.titulo)}</a>
    <a href="./portada.html">Inicio</a>
  </nav>
</main>
</body>
</html>
`;
}

const privacidad = { archivo: 'privacidad.html', titulo: PRIVACIDAD.titulo };
const terminos = { archivo: 'terminos.html', titulo: TERMINOS.titulo };

writeFileSync('privacidad.html', pagina(PRIVACIDAD, privacidad.archivo, terminos));
writeFileSync('terminos.html', pagina(TERMINOS, terminos.archivo, privacidad));

console.log('privacidad.html y terminos.html generados desde src/data/legal.js');
