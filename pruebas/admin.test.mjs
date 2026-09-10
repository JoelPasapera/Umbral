import { responder } from '../src/data/mock/fixtures.js';
import { calcularCobertura } from '../src/domain/coverage.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };
const falla = async (n, accion, fragmento) => {
  try { await accion(); ok(n, false, '→ no lanzó error'); }
  catch (e) { ok(n, !fragmento || e.message.includes(fragmento), `→ "${e.message}"`); }
};

const est = await responder('auth/entrar', { correo: 'estudiante@umbral.pe', clave: 'admision2027' });
const adm = await responder('auth/entrar', { correo: 'admin@umbral.pe', clave: 'catalogo2027' });

// --- Autorización en cada acción, no solo al abrir ---
await falla('un estudiante no abre el panel', () => responder('admin/panel', { token: est.token }), 'profesores');
await falla('un estudiante no crea preguntas',
  () => responder('admin/pregunta/crear', { token: est.token, enunciado: 'x' }), 'profesores');
await falla('un estudiante no archiva', () => responder('admin/archivar', { token: est.token, id: 'm-1' }), 'profesores');
await falla('un estudiante no publica',
  () => responder('admin/publicar', { token: est.token, id: 'm-1', publicado: false }), 'profesores');
await falla('un token inventado no sirve', () => responder('admin/panel', { token: 'falso' }), 'sesión');
await falla('sin token tampoco', () => responder('admin/panel', {}), 'sesión');

// --- Validación al escribir ---
const T = adm.token;
const buena = {
  token: T, cursoId: 'trigonometria', temaId: 'identidades', dificultad: 0.4, publicado: true,
  enunciado: 'Simplifica la expresión', opciones: ['a', 'b', 'c', 'd'], correcta: 1,
  explicacion: 'Porque sí.',
};
await falla('exige explicación', () => responder('admin/pregunta/crear', { ...buena, explicacion: '' }), 'explicación');
await falla('exige cuatro alternativas',
  () => responder('admin/pregunta/crear', { ...buena, opciones: ['a', 'b', 'c'] }), 'cuatro');
await falla('rechaza alternativas repetidas',
  () => responder('admin/pregunta/crear', { ...buena, opciones: ['a', 'a', 'c', 'd'] }), 'distintas');
await falla('rechaza dificultad fuera de rango',
  () => responder('admin/pregunta/crear', { ...buena, dificultad: 4 }), 'entre 0 y 1');
await falla('rechaza enlaces que no son http',
  () => responder('admin/material/crear', { token: T, titulo: 'x', cursoId: 'fisica', temaId: 't', url: 'javascript:alert(1)' }),
  'http');

// --- Normalización al entrar, no al pintar ---
const sucia = await responder('admin/pregunta/crear', {
  ...buena, enunciado: '  Cuál es el \u0007valor de x  ',
});
ok('limpia caracteres de control y espacios', sucia.enunciado === 'Cuál es el valor de x', `→ "${sucia.enunciado}"`);

// --- Archivar es reversible ---
const antes = await responder('admin/panel', { token: T });
await responder('admin/archivar', { token: T, id: sucia.id });
const durante = await responder('admin/panel', { token: T });
ok('archivar quita de la lista viva', durante.preguntas.length === antes.preguntas.length - 1);
ok('archivar también despublica', durante.archivados > 0);
await responder('admin/restaurar', { token: T, id: sucia.id });
const despues = await responder('admin/panel', { token: T });
ok('restaurar lo devuelve', despues.preguntas.length === antes.preguntas.length);

// --- Reordenar en una sola operación ---
// Se crean materiales propios: los del banco base no son de esta academia y
// el reordenar los rechaza, que es justo lo que debe hacer.
const propios = [];
for (const n of [1, 2, 3]) {
  const m = await responder('admin/material/crear', {
    token: T, titulo: `Material propio ${n}`, cursoId: 'trigonometria', temaId: 'identidades',
    tipo: 'enlace', url: 'https://ejemplo.pe/', publicado: true,
  });
  propios.push(m.id);
}
const r = await responder('admin/reordenar', { token: T, ids: propios });
ok('reordena de una vez', r.aplicados === 3);
await falla('rechaza un orden con elementos fantasma',
  () => responder('admin/reordenar', { token: T, ids: [...propios, 'no-existe'] }), 'ya no existen');

// --- Registro de cambios ---
const panel = await responder('admin/panel', { token: T });
ok('queda registro de quién hizo qué',
  panel.registro.length > 0 && panel.registro[0].quien === 'admin@umbral.pe',
  `→ ${panel.registro.length} entradas`);

// --- Lo del banco base se ve pero no se toca ---
const base = panel.materiales.find((m) => m.editable === false);
ok('el banco base es visible para el panel', Boolean(base), base ? `→ "${base.titulo}"` : '');
await falla('el banco base no se puede archivar',
  () => responder('admin/archivar', { token: T, id: base.id }), 'no existe');

// --- Cobertura ---
const meta = await responder('meta/activa', {});
const cob = calcularCobertura(meta, panel.preguntas, panel.materiales);
ok('detecta cursos sin preguntas',
  cob.cursos.some((c) => c.estado === 'sin-preguntas'),
  `→ ${cob.cursos.filter((c) => c.estado === 'sin-preguntas').length} cursos`);
ok('ordena por urgencia', cob.cursos[0].urgencia >= cob.cursos.at(-1).urgencia);
ok('mide qué parte del examen queda ciega', cob.pesoSinMedir > 0 && cob.pesoSinMedir <= cob.pesoTotal,
  `→ ${Math.round((cob.pesoSinMedir / cob.pesoTotal) * 100)}% del examen`);
ok('detecta temas con preguntas y sin material', Array.isArray(cob.temasHuerfanos));
ok('un curso bien surtido sale como completo',
  cob.cursos.some((c) => c.estado === 'completo'),
  `→ ${cob.cursos.filter((c) => c.estado === 'completo').map((c) => c.nombre).join(', ')}`);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
