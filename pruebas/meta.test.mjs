/**
 * Catálogo y cambio de meta. Lo que se protege: que cambiar de carrera cambie
 * de verdad el cálculo, no solo el título de la pantalla.
 */
import { catalogo, examen, META_POR_DEFECTO } from '../src/data/mock/exams.js';
import { calcularPreparacion } from '../src/domain/readiness.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const lista = catalogo();
ok('hay universidades', lista.length >= 8, `→ ${lista.length}`);
ok('todas tienen carreras', lista.every((u) => u.carreras.length > 0),
  `→ ${lista.reduce((n, u) => n + u.carreras.length, 0)} carreras`);
ok('cada carrera declara su corte', lista.every((u) => u.carreras.every((c) => typeof c.corte === 'number')));

const sistemas = examen({ universidadId: 'unmsm', carreraId: 'sistemas' });
const derecho = examen({ universidadId: 'unmsm', carreraId: 'derecho' });

ok('los pesos cambian con la carrera',
  sistemas.cursos.find((c) => c.cursoId === 'lenguaje').peso !==
    derecho.cursos.find((c) => c.cursoId === 'lenguaje').peso,
  `→ lenguaje pesa ${sistemas.cursos.find((c) => c.cursoId === 'lenguaje').peso} en Sistemas y ` +
    `${derecho.cursos.find((c) => c.cursoId === 'lenguaje').peso} en Derecho`);

ok('un curso puede no entrar en un examen',
  !derecho.cursos.some((c) => c.cursoId === 'trigonometria'),
  '→ trigonometría no entra en Derecho');

ok('cada examen suma cien de peso',
  [sistemas, derecho].every((e) => e.cursos.reduce((s, c) => s + c.peso, 0) === 100));

// El cálculo tiene que dar distinto para el mismo historial
const DIA = 86400000, AHORA = Date.now();
const historial = [
  ...Array.from({ length: 40 }, (_, i) => ({ cursoId: 'lenguaje', temaId: 't', acerto: true, dificultad: 0.5, fecha: AHORA - i * DIA / 4 })),
  ...Array.from({ length: 40 }, (_, i) => ({ cursoId: 'algebra', temaId: 't', acerto: false, dificultad: 0.5, fecha: AHORA - i * DIA / 4 })),
];
const a = calcularPreparacion(historial, sistemas, AHORA);
const b = calcularPreparacion(historial, derecho, AHORA);
ok('el mismo historial da índices distintos según la carrera',
  a.indice !== null && b.indice !== null && Math.abs(a.indice - b.indice) > 1,
  `→ ${a.indice.toFixed(1)} en Sistemas contra ${b.indice.toFixed(1)} en Derecho`);

ok('la meta por defecto existe en el catálogo',
  Boolean(examen(META_POR_DEFECTO)));

try { examen({ universidadId: 'unmsm', carreraId: 'inexistente' }); ok('rechaza carreras que no existen', false); }
catch { ok('rechaza carreras que no existen', true); }
try { examen({ universidadId: 'nope', carreraId: 'sistemas' }); ok('rechaza universidades que no existen', false); }
catch { ok('rechaza universidades que no existen', true); }

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
