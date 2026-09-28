/**
 * El respaldo de fórmulas. Importa porque es lo que ve el alumno cuando el
 * motor de composición no carga: wifi de colegio con el CDN bloqueado, proxy
 * corporativo, o el CDN caído. Sin esto leería "$\sin^2 20^\circ$".
 */
import { formulaLegible, tieneFormula } from '../src/ui/components/math.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };
const igual = (entrada, esperado) => {
  const salida = formulaLegible(entrada);
  ok(entrada.padEnd(32), salida === esperado, `→ ${salida}`);
};

igual('\\sin^2 20^\\circ + \\sin^2 70^\\circ', 'sin² 20° + sin² 70°');
igual('\\tfrac{1}{2}', '1/2');
igual('\\dfrac{\\sin x}{1 + \\cos x}', '(sin x)/(1 + cos x)');
igual('\\sqrt{2}', '√2');
igual('4\\ \\text{m/s}^2', '4 m/s²');
igual('\\sec x - \\tan x = 3', 'sec x - tan x = 3');
igual('2\\csc x', '2 csc x');
igual('x^{10}', 'x¹⁰');
igual('\\pi r^2', 'π r²');

ok('detecta que hay fórmula', tieneFormula('vale $x^2$ aquí'));
ok('no ve fórmulas donde no hay', !tieneFormula('cuesta 20 soles'));

// Lo esencial: nunca deben quedar marcas de LaTeX a la vista del alumno.
const muestras = ['\\sin^2 20^\\circ', '\\dfrac{a}{b}', '\\sqrt{x}', '\\text{kg}', '\\times'];
ok('el respaldo no deja barras de LaTeX', muestras.every((m) => !formulaLegible(m).includes('\\')));
ok('el respaldo no deja llaves', muestras.every((m) => !/[{}]/.test(formulaLegible(m))));

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
