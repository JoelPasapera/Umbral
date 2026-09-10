import { listarMateriales } from '../src/data/mock/library.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const todos = listarMateriales({});
ok('el catálogo tiene material', todos.length >= 10, `→ ${todos.length}`);
ok('el listado no arrastra las páginas', todos.every(m => !('paginas' in m)));
ok('el listado sí trae el conteo', todos.every(m => typeof m.totalPaginas === 'number'));
ok('todo material declara su tema', todos.every(m => Boolean(m.temaId)));

const trig = listarMateriales({ cursoId: 'trigonometria' });
ok('filtra por curso', trig.length === 4 && trig.every(m => m.cursoId === 'trigonometria'), `→ ${trig.length}`);

const busqueda = listarMateriales({ busqueda: 'dominio público' });
const porFuente = listarMateriales({ busqueda: 'Euclides' });
ok('busca por fuente', porFuente.length === 1, `→ ${porFuente.length}`);
ok('la búsqueda ignora mayúsculas', listarMateriales({ busqueda: 'EUCLIDES' }).length === porFuente.length);
ok('la búsqueda respeta las tildes de la fuente', busqueda.length >= 1, `→ ${busqueda.length}`);
ok('los datos de ejemplo no usan marcas de terceros',
  !JSON.stringify(listarMateriales({})).match(/Lumbreras|Pamer|ADUNI|Trilce|Pit[áa]goras/i));

/*
 * El visor se comprueba contra el recurso del servidor, no contra el catálogo
 * de origen. Esa es la razón por la que estaba roto: la siembra reasigna los
 * identificadores al cargar el catálogo en el panel, y el que tiene el
 * navegador no es el de la lista original. Probar la lista original pasaba en
 * verde mientras abrir un resumen respondía "Ese resumen no existe".
 */
globalThis.localStorage ??= {
  _d: new Map(),
  getItem(k) { return this._d.get(k) ?? null; },
  setItem(k, v) { this._d.set(k, String(v)); },
  removeItem(k) { this._d.delete(k); },
};
const { responder } = await import('../src/data/mock/fixtures.js');
const sesion = await responder('auth/entrar', { correo: 'estudiante@umbral.pe', clave: 'admision2027' });

const servidos = await responder('estudio/materiales', { token: sesion.token });
const unResumen = servidos.find((m) => m.tipo === 'resumen');
const r = await responder('estudio/resumen', { token: sesion.token, id: unResumen.id });
ok('un resumen servido se puede abrir con el identificador que recibió el navegador',
  r.paginas.length > 0, `→ ${r.paginas.length} páginas`);
ok('cada página separa miniatura y original',
  r.paginas.every((p) => p.miniatura && p.pagina && p.miniatura !== p.pagina));
ok('cada página tiene texto alternativo', r.paginas.every((p) => p.alternativo));

const unEnlace = servidos.find((m) => m.tipo === 'enlace');
ok('un enlace no se abre como resumen', await (async () => {
  try { await responder('estudio/resumen', { token: sesion.token, id: unEnlace.id }); return false; }
  catch { return true; }
})());

/*
 * Y la frontera. Tiene que probarse con material PROPIO de una academia: el
 * banco base lo ven las dos por diseño, así que usarlo para esto no demuestra
 * nada y pasa en verde aunque la frontera no exista.
 */
const jefaSigma = await responder('auth/entrar', { correo: 'coordinacion@sigma.pe', clave: 'sigma2027xx' });
const suyo = await responder('admin/material/crear', {
  token: jefaSigma.token, titulo: 'Resumen interno de Sigma', cursoId: 'algebra',
  temaId: 'exponentes', tipo: 'resumen', publicado: true,
});
const alumnaSigma = await responder('auth/entrar', { correo: 'alumna@sigma.pe', clave: 'sigma2027xx' });

ok('la alumna de Sigma abre el suyo', await (async () => {
  try { await responder('estudio/resumen', { token: alumnaSigma.token, id: suyo.id }); return true; }
  catch { return false; }
})());
ok('y un alumno de Rumbo no, aunque acierte el identificador', await (async () => {
  try { await responder('estudio/resumen', { token: sesion.token, id: suyo.id }); return false; }
  catch { return true; }
})());

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
