/**
 * El temario. Es la columna vertebral del producto: sin él, "te falta
 * trigonometría" no es accionable. Lo que se protege aquí es que los datos
 * cuadren con el examen real y que los identificadores no diverjan.
 */
import {
  TEMARIO_UNMSM, AREAS_UNMSM, cursosDelArea, totalTemas, temasDe,
  cursosDeMatematica, areaVerificada, PUNTOS_POR_PREGUNTA,
} from '../src/data/mock/temario.js';
import { examen } from '../src/data/mock/exams.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

// --- Cuadra con el examen real ---
// Fuente: 10 actitudinales (fuera del cómputo), 10 de habilidad verbal,
// 10 de habilidad lógico-matemática y 70 de conocimientos.
for (const [id, area] of Object.entries(AREAS_UNMSM)) {
  const total = Object.values(area.preguntas).reduce((a, b) => a + b, 0);
  ok(`área ${id} suma 90 preguntas`, total === 90, `→ ${total}`);
  ok(`área ${id} da 10 a habilidad verbal y 10 a matemática`,
    area.preguntas['habilidad-verbal'] === 10 && area.preguntas['habilidad-matematica'] === 10);
}
ok('cada pregunta vale 20 puntos', PUNTOS_POR_PREGUNTA === 20);
ok('solo el área verificada se declara verificada',
  areaVerificada('D') && !areaVerificada('B'),
  '→ no se aparenta precisión que no se tiene');

// --- Los cursos de matemática están cargados ---
const mate = cursosDeMatematica();
ok('están los cinco cursos de matemática', mate.length === 5, `→ ${mate.map((c) => c.nombre).join(', ')}`);
ok('todos tienen bloques', mate.every((c) => c.bloques.length > 0));
const temasTotales = mate.reduce((s, c) => s + totalTemas(c.cursoId), 0);
ok('hay temario suficiente', temasTotales > 120, `→ ${temasTotales} temas`);

for (const c of mate) {
  const temas = temasDe(c.cursoId);
  ok(`${c.nombre}: los temas llevan su bloque`.padEnd(46),
    temas.every((t) => t.bloqueId && t.bloque && t.cursoId === c.cursoId),
    `→ ${temas.length} temas`);
}

// --- Identificadores únicos: si chocan, el diagnóstico mezcla temas ---
const todosLosIds = mate.flatMap((c) => temasDe(c.cursoId)).map((t) => t.id);
ok('los identificadores de tema no se repiten', new Set(todosLosIds).size === todosLosIds.length);
const idsBloque = Object.values(TEMARIO_UNMSM).flatMap((c) => c.bloques.map((b) => b.id));
ok('los identificadores de bloque no se repiten', new Set(idsBloque).size === idsBloque.length);

// --- El peso llega al examen ---
const sistemas = examen({ universidadId: 'unmsm', carreraId: 'sistemas' });
ok('el examen trae las preguntas de cada curso', sistemas.cursos.every((c) => c.preguntas > 0));
ok('los puntos son preguntas por veinte', sistemas.cursos.every((c) => c.puntos === c.preguntas * 20));
ok('los cursos vienen ordenados por peso',
  sistemas.cursos[0].preguntas >= sistemas.cursos.at(-1).preguntas,
  `→ de ${sistemas.cursos[0].preguntas} a ${sistemas.cursos.at(-1).preguntas} preguntas`);
ok('el examen dice a qué área pertenece', sistemas.area === 'B' && Boolean(sistemas.areaNombre));

// --- Lo que no está cargado se declara, no se finge ---
const sinDetalle = sistemas.cursos.filter((c) => !c.detallado);
ok('los cursos sin temario se marcan', sinDetalle.length > 0 && sinDetalle.every((c) => c.temas === 0),
  `→ ${sinDetalle.length} cursos pendientes de cargar`);
ok('los cursos con temario declaran cuántos temas tienen',
  sistemas.cursos.filter((c) => c.detallado).every((c) => c.temas > 0));

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
