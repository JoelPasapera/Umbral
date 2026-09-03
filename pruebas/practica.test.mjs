import { iniciarSesion, responderPregunta, cerrarSesion } from '../src/data/mock/questions.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const s = iniciarSesion({ cursoId: 'trigonometria' });
ok('la sesión trae preguntas', s.total === 8, `→ ${s.total}`);
ok('ninguna pregunta filtra la respuesta',
  s.preguntas.every(p => !('correcta' in p) && !('explicacion' in p) && !('dificultad' in p)));

const v1 = responderPregunta({ sesionId: s.sesionId, preguntaId: s.preguntas[0].id, opcion: 0, segundos: 20 });
const v2 = responderPregunta({ sesionId: s.sesionId, preguntaId: s.preguntas[0].id, opcion: 3, segundos: 5 });
ok('reenviar no cambia el veredicto', v1.acerto === v2.acerto);

try {
  responderPregunta({ sesionId: s.sesionId, preguntaId: 'no-existe', opcion: 0, segundos: 1 });
  ok('rechaza preguntas ajenas a la sesión', false);
} catch { ok('rechaza preguntas ajenas a la sesión', true); }

responderPregunta({ sesionId: s.sesionId, preguntaId: s.preguntas[1].id, opcion: 2, segundos: 40 });
const r = cerrarSesion({ sesionId: s.sesionId });
ok('el cierre devuelve intentos utilizables',
  r.intentos.length === 2 && r.intentos.every(i => i.cursoId && typeof i.dificultad === 'number'));

try { cerrarSesion({ sesionId: s.sesionId }); ok('la sesión cerrada ya no existe', false); }
catch { ok('la sesión cerrada ya no existe', true); }

const d = iniciarSesion({ modo: 'diagnostico' });
ok('el diagnóstico mezcla cursos', new Set(d.preguntas.map(p => p.cursoId)).size > 1,
  `→ ${new Set(d.preguntas.map(p => p.cursoId)).size} cursos`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
