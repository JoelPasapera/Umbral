import { listarMateriales, abrirResumen } from '../src/data/mock/library.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const todos = listarMateriales({});
ok('el catálogo tiene material', todos.length >= 10, `→ ${todos.length}`);
ok('el listado no arrastra las páginas', todos.every(m => !('paginas' in m)));
ok('el listado sí trae el conteo', todos.every(m => typeof m.totalPaginas === 'number'));
ok('todo material declara su tema', todos.every(m => Boolean(m.temaId)));

const trig = listarMateriales({ cursoId: 'trigonometria' });
ok('filtra por curso', trig.length === 4 && trig.every(m => m.cursoId === 'trigonometria'), `→ ${trig.length}`);

const busqueda = listarMateriales({ busqueda: 'comunidad' });
ok('busca por fuente', busqueda.length === 3, `→ ${busqueda.length}`);
ok('la búsqueda ignora mayúsculas', listarMateriales({ busqueda: 'COMUNIDAD' }).length === 3);
ok('los datos de ejemplo no usan marcas de terceros',
  !JSON.stringify(listarMateriales({})).match(/Lumbreras|Pamer|ADUNI|Trilce|Pit[áa]goras/i));

const r = abrirResumen({ id: 'res-trig-identidades' });
ok('el resumen trae sus páginas', r.paginas.length === 6, `→ ${r.paginas.length}`);
ok('cada página separa miniatura y original',
  r.paginas.every(p => p.miniatura && p.pagina && p.miniatura !== p.pagina));
ok('cada página tiene texto alternativo', r.paginas.every(p => p.alternativo));

try { abrirResumen({ id: 'enl-trig-identidades' }); ok('un enlace no se abre como resumen', false); }
catch { ok('un enlace no se abre como resumen', true); }

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
