/**
 * Contraste. Criterio 4.1.
 *
 * Calcula el cociente de contraste de cada pareja que existe de verdad en la
 * interfaz, en los dos temas, y falla si baja del mínimo. Se hace leyendo
 * `tokens.css`, así que cambiar un color y romper la legibilidad rompe también
 * la construcción.
 *
 * Umbrales de la norma:
 *   4.5:1  texto normal
 *   3.0:1  texto grande (18.66px en negrita o 24px) y bordes de controles
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/ui/tokens.css', import.meta.url), 'utf8');

/** Extrae los tokens de un bloque concreto. */
function tokensDe(selector) {
  const bloque = css.slice(css.indexOf(selector));
  const cuerpo = bloque.slice(bloque.indexOf('{') + 1, bloque.indexOf('}'));
  const salida = {};
  for (const [, nombre, valor] of cuerpo.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const limpio = valor.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(limpio)) salida[nombre] = limpio;
  }
  return salida;
}

const canal = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

function luminancia(hex) {
  const n = hex.replace('#', '');
  const completo = n.length === 3 ? [...n].map((c) => c + c).join('') : n;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(completo.slice(i, i + 2), 16));
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Parejas que existen de verdad en la interfaz. Cada una lleva su umbral y una
 * nota de dónde aparece, para que al fallar se sepa qué pantalla se rompe.
 */
// La lista se escribió a mano y se dejó combinaciones fuera: la auditoría
// automática encontró contrastes bajos en parejas que aquí no estaban. Cada
// superficie nueva obliga a revisar esta lista entera.
const PAREJAS = [
  ['tinta', 'papel', 4.5, 'texto de cuerpo sobre la página'],
  ['tinta', 'papel-elevado', 4.5, 'texto dentro de una tarjeta'],
  ['grafito', 'papel-elevado', 4.5, 'títulos en tarjeta'],
  ['tinta-suave', 'papel-elevado', 4.5, 'texto secundario en tarjeta'],
  ['tinta-suave', 'papel', 4.5, 'texto secundario sobre la página'],
  ['tinta-tenue', 'papel-elevado', 4.5, 'notas y metadatos en tarjeta'],
  ['tinta-tenue', 'papel', 4.5, 'notas y metadatos sobre la página'],
  ['tinta-tenue', 'papel-hundido', 4.5, 'notas sobre superficie hundida'],
  ['tinta-suave', 'papel-hundido', 4.5, 'texto secundario sobre hundido'],
  ['tinta', 'papel-hundido', 4.5, 'texto de cuerpo sobre hundido'],
  ['linea-fuerte', 'papel', 3.0, 'bordes sobre la página'],
  ['rojo', 'papel-elevado', 4.5, 'cuenta atrás y avisos'],
  ['rojo', 'rojo-fondo', 4.5, 'mensaje de error'],
  ['pino', 'pino-fondo', 4.5, 'mensaje de acierto'],
  ['ocre', 'ocre-fondo', 4.5, 'aviso de nivel medio'],
  ['destacado-tinta', 'destacado-fondo', 4.5, 'cifra del índice'],
  ['destacado-tenue', 'destacado-fondo', 4.5, 'rótulos del índice'],
  ['rojo-realce', 'destacado-fondo', 4.5, 'puntos que faltan, resaltados'],
  ['pino-realce', 'destacado-fondo', 4.5, 'puntos de ventaja, resaltados'],
  ['papel', 'grafito', 4.5, 'texto del botón principal'],
  ['linea-fuerte', 'papel-elevado', 3.0, 'borde de campo de formulario'],
  ['rojo', 'papel', 3.0, 'anillo de foco sobre la página'],
  ['rojo', 'papel-elevado', 3.0, 'anillo de foco en tarjeta'],
  ['rojo-sobre-destacado', 'destacado-fondo', 3.0, 'relleno de la escala'],
  ['pino-sobre-destacado', 'destacado-fondo', 3.0, 'relleno de la escala al alcanzar'],
  ['destacado-linea', 'destacado-fondo', 1.2, 'pista de la escala'],
];

let fallos = 0;
const temas = [
  ['papel', tokensDe(':root')],
  ['noche', tokensDe("[data-tema='noche']")],
];

for (const [nombreTema, tokens] of temas) {
  console.log(`\n── tema ${nombreTema} ${'─'.repeat(40 - nombreTema.length)}`);
  for (const [frente, fondo, minimo, donde] of PAREJAS) {
    if (!tokens[frente] || !tokens[fondo]) {
      console.log(`  ??   ${frente} / ${fondo} — token ausente en este tema`);
      continue;
    }
    const ratio = contraste(tokens[frente], tokens[fondo]);
    const cumple = ratio >= minimo;
    if (!cumple) fallos++;
    console.log(
      `${cumple ? '  ok  ' : 'FALLO '} ${(frente + ' / ' + fondo).padEnd(34)} ` +
        `${ratio.toFixed(2)}:1  (mín ${minimo})  ${cumple ? '' : '← ' + donde}`,
    );
  }
}

console.log(
  fallos
    ? `\n${fallos} parejas por debajo del mínimo. Criterio 4.1 de CRITERIOS.md.`
    : '\nTODAS PASAN',
);
process.exit(fallos ? 1 : 0);
