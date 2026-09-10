/**
 * Catálogo de la biblioteca.
 *
 * Lo que se protege aquí es, sobre todo, que la decisión legal no dependa de
 * que alguien se acuerde. La biblioteca del sitio que se auditó antes de
 * empezar esto se llenó de escaneos de editoriales sin que nadie lo decidiera:
 * fueron llegando. Si la puerta de licencia se rompe, se rompe en silencio y no
 * se nota hasta que llega una carta.
 */
import {
  LICENCIAS, ORIGENES, admisible, soloAdmisibles, filtrar, porOrigen, porCurso,
  librosPorCurso, pendientesDeLicencia, examenesPorProceso,
} from '../src/domain/catalogo.js';
import { EXAMENES } from '../src/data/mock/examenes.js';
import { LIBROS } from '../src/data/mock/libros.js';
globalThis.localStorage ??= { _d: new Map(), getItem(k) { return this._d.get(k) ?? null; }, setItem(k, v) { this._d.set(k, String(v)); }, removeItem(k) { this._d.delete(k); } };
import { listarMateriales } from '../src/data/mock/library.js';
import { cursosDelArea } from '../src/data/mock/temario.js';

/* Buena parte de esta batería comprueba el recurso que sirve la aplicación y
   no una copia de la lógica, así que la sesión se abre aquí arriba. */
const { responder } = await import('../src/data/mock/fixtures.js');
const sesion = await responder('auth/entrar', { correo: 'estudiante@umbral.pe', clave: 'admision2027' });

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const BUENO = {
  id: 'm-1', tipo: 'resumen', cursoId: 'algebra', temaId: 'alg-reales',
  origen: 'academia', licencia: 'propia', fuente: 'Elaborado por la academia',
  titulo: 'Teoría de exponentes',
};

const rev = (cambios) => admisible({ ...BUENO, ...cambios });
const rechaza = (nombre, cambios, campo) => {
  const r = rev(cambios);
  const p = r.problemas.find((x) => x.nivel === 'rechazo' && x.campo === campo);
  ok(nombre, !r.admisible && Boolean(p), p ? `→ "${p.mensaje}"` : '→ no lo detectó');
};

/* --- La puerta de licencia --- */

ok('un material con licencia y fuente entra', rev({}).admisible && rev({}).problemas.length === 0);

rechaza('rechaza el que no declara licencia', { licencia: '' }, 'licencia');
rechaza('rechaza una licencia inventada', { licencia: 'gratis' }, 'licencia');
rechaza('rechaza el que no dice de dónde salió', { fuente: '' }, 'fuente');
rechaza('rechaza el que dice tener permiso sin señalar dónde está',
  { licencia: 'permiso', permisoRef: '' }, 'permisoRef');
rechaza('rechaza el que no declara colección', { origen: 'otros' }, 'origen');

/* El caso concreto que hundió al sitio anterior: un enlace a una carpeta
   compartida es alojar un escaneo ajeno con un paso de por medio. */
rechaza('rechaza el enlace a una carpeta de Drive',
  { tipo: 'enlace', url: 'https://drive.google.com/drive/folders/abc123' }, 'url');
rechaza('rechaza el enlace a Mega', { tipo: 'enlace', url: 'https://mega.nz/file/xyz' }, 'url');

ok('un enlace a un sitio propio sí pasa',
  rev({ tipo: 'enlace', url: 'https://ejemplo.pe/apuntes' }).admisible);

const sinAnio = rev({ licencia: 'dominio-publico', fuente: 'Euclides', anio: '' });
ok('avisa del dominio público sin año, pero lo deja pasar',
  sinAnio.admisible && sinAnio.problemas.some((p) => p.nivel === 'aviso' && p.campo === 'anio'));

ok('las cuatro licencias admitidas están documentadas',
  Object.keys(LICENCIAS).length === 4 && Object.values(LICENCIAS).every((d) => d.length > 20),
  `→ ${Object.keys(LICENCIAS).join(', ')}`);
ok('las tres colecciones son las que se pidieron',
  Object.keys(ORIGENES).join(',') === 'editorial,academia,examen');

ok('soloAdmisibles quita lo que no pasa la puerta',
  soloAdmisibles([BUENO, { ...BUENO, id: 'm-2', licencia: '' }]).length === 1);

/* --- Los filtros se combinan --- */

const CATALOGO = [
  { ...BUENO, id: 'a', origen: 'academia', cursoId: 'algebra' },
  { ...BUENO, id: 'b', origen: 'examen', cursoId: 'algebra', universidadId: 'unmsm' },
  { ...BUENO, id: 'c', origen: 'examen', cursoId: 'geometria', universidadId: 'uni' },
  { ...BUENO, id: 'd', origen: 'editorial', cursoId: 'geometria' },
];

ok('sin filtros no se restringe nada', filtrar(CATALOGO, {}).length === 4);
ok('filtra por colección', filtrar(CATALOGO, { origen: 'examen' }).length === 2);
ok('filtra por curso', filtrar(CATALOGO, { cursoId: 'geometria' }).length === 2);
ok('los filtros se combinan en vez de sustituirse',
  filtrar(CATALOGO, { origen: 'examen', cursoId: 'algebra' }).map((m) => m.id).join('') === 'b');
ok('el material sin universidad sirve para todas las universidades',
  filtrar(CATALOGO, { universidadId: 'unmsm' }).map((m) => m.id).join('') === 'abd',
  '→ un examen de la UNI no aparece, la teoría general sí');

ok('un mismo material cae en las tres dimensiones a la vez',
  filtrar(CATALOGO, { origen: 'examen' }).some((m) => m.id === 'b')
    && filtrar(CATALOGO, { cursoId: 'algebra' }).some((m) => m.id === 'b')
    && filtrar(CATALOGO, { universidadId: 'unmsm' }).some((m) => m.id === 'b'),
  '→ por eso es un catálogo y no tres');

/* --- El peso del examen, que es lo que sustituye a "0 elementos" --- */

const CURSOS = [
  { cursoId: 'habilidad-matematica', nombre: 'Habilidad matemática', preguntas: 10 },
  { cursoId: 'trigonometria', nombre: 'Trigonometría', preguntas: 2 },
  { cursoId: 'algebra', nombre: 'Álgebra', preguntas: 4 },
];

const agrupados = porCurso(CATALOGO, CURSOS);
ok('los cursos salen ordenados por peso, no alfabéticamente',
  agrupados.map((c) => c.cursoId).join(' > ') === 'habilidad-matematica > algebra > trigonometria');
ok('el curso más pesado va primero aunque esté vacío',
  agrupados[0].elementos === 0 && agrupados[0].pesoExamen > agrupados[1].pesoExamen,
  `→ ${agrupados[0].nombre}: ${Math.round(agrupados[0].pesoExamen * 100)}% del examen, sin material`);
ok('el peso se reparte sobre el total y suma 1',
  Math.abs(agrupados.reduce((s, c) => s + c.pesoExamen, 0) - 1) < 1e-9);

const colecciones = porOrigen(CATALOGO);
ok('las tres colecciones traen su recuento',
  colecciones.length === 3 && colecciones.find((o) => o.origen === 'examen').elementos === 2);
ok('una colección vacía se declara vacía, no desaparece',
  porOrigen([]).length === 3 && porOrigen([]).every((o) => o.elementos === 0));

/* --- El catálogo real --- */

ok('todo el catálogo que trae el producto pasa la puerta',
  listarMateriales({}).every((m) => admisible(m).admisible),
  `→ ${listarMateriales({}).length} materiales`);

ok('ninguno enlaza a una carpeta compartida',
  listarMateriales({}).every((m) => !/drive\.google|mega\.nz|mediafire/i.test(m.url ?? '')));

ok('todos declaran de dónde salieron',
  listarMateriales({}).every((m) => String(m.fuente ?? '').trim().length > 0));

/* Las facetas se comprueban contra el recurso que sirve la aplicación. Antes
   había aquí una segunda implementación de lo mismo en library.js: pasaba en
   verde sin que la aplicación la ejecutara nunca, así que no demostraba nada
   sobre lo que ve una persona. */
const facetas = await responder('biblioteca/catalogo', { token: sesion.token });
/* El filtro de colecciones se quitó de la pantalla: eran tres pastillas cuyo
   único efecto era acotar la lista suelta del final. El origen sigue en el
   dominio porque es la declaración de procedencia de cada material. */
ok('el servidor ya no manda el filtro de colecciones',
  facetas.origenes === undefined);
/* --- El buscador --- */

/*
 * La biblioteca tenía la búsqueda cableada hasta el servidor y nunca dibujaba
 * la caja: construida y sin alcanzar. Y la primera versión distinguía tildes,
 * que en un teléfono la deja inservible — casi nadie las escribe.
 */
const conTilde = await responder('biblioteca/catalogo', { token: sesion.token, busqueda: 'trigonometría' });
const sinTilde = await responder('biblioteca/catalogo', { token: sesion.token, busqueda: 'trigonometria' });
const enMayus = await responder('biblioteca/catalogo', { token: sesion.token, busqueda: 'TRIGONOMETRIA' });
const cuenta = (r) => r.lista.length + r.libros.reduce((n, e) => n + e.libros.length, 0);
ok('buscar sin tilde encuentra lo mismo que con tilde',
  cuenta(sinTilde) === cuenta(conTilde) && cuenta(conTilde) > 0,
  `→ ${cuenta(conTilde)} resultados en los dos casos`);
ok('y da igual mayúsculas', cuenta(enMayus) === cuenta(conTilde));

ok('la búsqueda alcanza también a los exámenes',
  (await responder('biblioteca/catalogo', { token: sesion.token, busqueda: '2025-II' }))
    .examenes.flatMap((p) => p.convocatorias).length > 0);

ok('una búsqueda sin coincidencias no devuelve nada, no lo devuelve todo',
  cuenta(await responder('biblioteca/catalogo', { token: sesion.token, busqueda: 'zzzznoexiste' })) === 0);

/* --- La fuga que encontró la auditoría --- */

/* Los exámenes tuvieron una excepción en el filtro de curso, y como esa
   función la usan dos pantallas, seis exámenes de admisión acabaron listados
   en Estudiar como material de trigonometría. */
const enEstudiar = await responder('estudio/materiales', { token: sesion.token, cursoId: 'trigonometria' });
ok('Estudiar no lista exámenes de admisión como material de un curso',
  !enEstudiar.some((m) => m.tipo === 'examen'),
  `→ ${enEstudiar.filter((m) => m.tipo === 'examen').length} colados de ${enEstudiar.length}`);
ok('Estudiar solo trae el curso que se le pide',
  enEstudiar.length > 0 && enEstudiar.every((m) => m.cursoId === 'trigonometria'));

/* Sin filtro de curso es donde de verdad dolía: los 72 exámenes entraban con
   `cursoId` en nulo y la pantalla reventaba al ordenar por nombre de curso.
   La primera comprobación que escribí siempre pasaba un curso y lo tapaba. */
const todoEstudiar = await responder('estudio/materiales', { token: sesion.token });
ok('Estudiar tampoco los lista cuando no se filtra por curso',
  !todoEstudiar.some((m) => m.tipo === 'examen'),
  `→ ${todoEstudiar.length} materiales, ninguno examen`);
ok('nada de lo que llega a Estudiar carece de curso',
  todoEstudiar.every((m) => Boolean(m.cursoId)),
  '→ ordena por curso: uno sin curso no se puede colocar');

/* Y la biblioteca sigue enseñándolos aunque se filtre por curso, que era lo
   que la excepción quería conseguir. */
const filtradaPorCurso = await responder('biblioteca/catalogo', { token: sesion.token, cursoId: 'algebra' });
ok('la biblioteca sí conserva sus exámenes al filtrar por curso',
  filtradaPorCurso.examenes.length > 0,
  `→ ${filtradaPorCurso.examenes.length} convocatorias`);

/* --- Los libros --- */

ok('hay fichas de libro para seis cursos de ciencias',
  new Set(LIBROS.map((l) => l.cursoId)).size === 6,
  `→ ${[...new Set(LIBROS.map((l) => l.cursoId))].join(', ')}`);
/* Habilidad matemática vale 10 preguntas de 90 en las cuatro áreas, más que
   ningún otro curso, y no tiene un solo libro. Queda escrito aquí para que se
   note cada vez que alguien corra las pruebas. */
ok('habilidad matemática sigue sin libro, y es el curso que más pesa',
  !LIBROS.some((l) => l.cursoId === 'habilidad-matematica'),
  '→ pendiente de elegir texto');
ok('cada ficha dice de qué va, no solo el tomo',
  LIBROS.every((l) => l.subtitulo && l.subtitulo.length > 10));
ok('los identificadores de libro no se repiten',
  new Set(LIBROS.map((l) => l.id)).size === LIBROS.length);

/* Esta es la que importa: mientras la licencia no esté resuelta, ni un solo
   alumno ve estos libros, por mucho que la ficha exista y tenga buen aspecto. */
ok('ninguna ficha sin licencia llega al alumno',
  soloAdmisibles(LIBROS).length === 0, `→ ${LIBROS.length} fichas, 0 visibles`);
ok('ninguna ficha trae un enlace a una carpeta compartida',
  LIBROS.every((l) => !l.url));

const cola = pendientesDeLicencia(LIBROS);
ok('las fichas aparecen como gestión pendiente, no desaparecen',
  cola.length === LIBROS.length, `→ ${cola.length} esperando licencia`);
ok('la cola dice qué le falta a cada una',
  cola.every((c) => c.falta.length > 0), `→ "${cola[0].falta[0]}"`);

/* Un enlace a Drive no es una gestión pendiente: no se arregla con un papel. */
ok('lo que falla por el destino del enlace no entra en la cola',
  pendientesDeLicencia([{ ...BUENO, tipo: 'libro', url: 'https://drive.google.com/file/d/abc/view' }]).length === 0);

const estantes = librosPorCurso(
  [{ ...BUENO, tipo: 'libro', cursoId: 'algebra' }, { ...BUENO, id: 'x', tipo: 'resumen', cursoId: 'algebra' }],
  CURSOS,
);
ok('los libros van agrupados por curso y aparte de los resúmenes',
  estantes.length === 1 && estantes[0].libros.length === 1);
ok('un curso sin libros no genera un estante vacío',
  librosPorCurso([], CURSOS).length === 0);

/* La siembra copia campo a campo, así que es fácil que uno nuevo se quede por
   el camino. Ya pasó con la licencia —la biblioteca apareció vacía sin decir
   por qué— y con el subtítulo. */
const servido = await responder('biblioteca/catalogo', { token: sesion.token });
const librosServidos = servido.libros.flatMap((c) => c.libros);
ok('la siembra no se come ningún campo del libro',
  librosServidos.length > 0
    && librosServidos.every((l) => l.titulo && l.subtitulo && l.fuente && l.licencia),
  `→ ${librosServidos.length} libros servidos enteros`);
ok('al alumno no se le cuentan las gestiones pendientes', servido.pendientes === 0);

/* --- Exámenes publicados --- */

ok('los exámenes sí llegan al alumno: los publica la propia universidad',
  soloAdmisibles(EXAMENES).length === EXAMENES.length,
  `→ ${EXAMENES.length} piezas, todas con licencia oficial`);
ok('todos tienen enlace',
  EXAMENES.every((e) => e.url && e.url.startsWith('https://')));
ok('ninguno enlaza a una carpeta compartida',
  EXAMENES.every((e) => !/drive\.google|mega\.nz|mediafire/i.test(e.url)));

const procesos = examenesPorProceso(EXAMENES);
ok('van del más reciente al más antiguo',
  procesos[0].proceso > procesos[procesos.length - 1].proceso,
  `→ ${procesos.map((p) => p.proceso).join(' ')}`);
ok('cada proceso trae su convocatoria con las dos acciones',
  procesos.every((p) => p.convocatorias.length > 0 && p.convocatorias.every((c) => c.examenId && c.url)),
  '→ practicar dentro de la aplicación y el PDF fuera');

/* Aquí había una comprobación que exigía lo contrario: que `filtrar` dejara
   pasar los exámenes con cualquier filtro de curso. Estaba en verde y lo que
   protegía era el fallo — seis exámenes listados en Estudiar como material de
   trigonometría. El filtro es estricto y la excepción vive donde le toca, en
   la biblioteca, que alimenta su sección de exámenes con una lista aparte. */
ok('el filtro de curso es estricto y no hace excepciones por tipo',
  filtrar([...EXAMENES, { ...BUENO, cursoId: 'algebra' }], { cursoId: 'geometria' }).length === 0,
  '→ una excepción aquí la heredan todas las pantallas que usan esta función');

/* --- Los estantes de curso --- */

const CON_ESTANTE = new Set(['algebra', 'quimica', 'habilidad-matematica']);
const conVacios = librosPorCurso(
  [{ ...BUENO, tipo: 'libro', cursoId: 'algebra' }],
  [...CURSOS, { cursoId: 'quimica', nombre: 'Química', preguntas: 3 }],
  CON_ESTANTE,
);
ok('el estante de un curso sin libro no se esconde',
  conVacios.some((e) => e.cursoId === 'quimica' && e.libros.length === 0),
  '→ si no, no se sabe si falta el libro o falta el curso');
ok('un curso fuera de la lista de estantes no aparece',
  !conVacios.some((e) => e.cursoId === 'trigonometria'));
ok('habilidad matemática lleva estante aunque no tenga libro',
  conVacios.some((e) => e.cursoId === 'habilidad-matematica'),
  '→ es el curso que más pesa del examen');

const servidoCat = facetas;
/* La rejilla de 18 cursos del área se quitó y volvió con otra forma: solo los
   cursos con material, con su peso y su recuento, y un panel al pulsarlos. El
   porcentaje de cobertura no volvió: eso lo hace `coverage.js` en el panel. */
ok('el servidor ya no manda la cobertura del examen',
  facetas.pesoSinMaterial === undefined,
  '→ el panel ya lo calcula con coverage.js');
ok('la rejilla de cursos trae solo los que llevan estante, no los 18 del área',
  facetas.cursos.length < cursosDelArea('D').length && facetas.cursos.length >= 7,
  `→ ${facetas.cursos.length} de ${cursosDelArea('D').length}`);
ok('cada curso trae su peso y sus dos recuentos',
  facetas.cursos.every((c) => typeof c.pesoExamen === 'number'
    && typeof c.libros === 'number' && typeof c.materiales === 'number'));
ok('los recuentos no dependen de los filtros activos',
  (await responder('biblioteca/catalogo', { token: sesion.token, cursoId: 'algebra' }))
    .cursos.length === facetas.cursos.length,
  '→ si salieran de la lista filtrada, elegir uno pondría los demás a cero');

ok('el servidor manda un estante por cada curso de ciencias',
  servidoCat.libros.length >= 7,
  `→ ${servidoCat.libros.map((e) => e.nombre).join(', ')}`);
ok('y ninguno de letras se cuela',
  !servidoCat.libros.some((e) => ['Lenguaje', 'Habilidad verbal', 'Literatura'].includes(e.nombre)));
ok('los exámenes llegan agrupados por convocatoria',
  servidoCat.examenes.length > 0,
  `→ ${servidoCat.examenes.map((p) => p.proceso).join(' ')}`);

/* --- Los recursos de cada curso --- */

const { LIBROS_DE_CURSO, MATERIALES_DE_CURSO } = await import('../src/data/mock/recursos-curso.js');

/* Los siete cursos traen el mismo juego para que la sección se vea pareja. Si
   uno se queda corto al editar, vuelven los huecos sin que nadie lo note. */
const librosDe = new Map();
for (const l of LIBROS_DE_CURSO) librosDe.set(l.cursoId, (librosDe.get(l.cursoId) ?? 0) + 1);
const materialesDe = new Map();
for (const m of MATERIALES_DE_CURSO) materialesDe.set(m.cursoId, (materialesDe.get(m.cursoId) ?? 0) + 1);

ok('los siete cursos tienen libros',
  librosDe.size === 7 && new Set(librosDe.values()).size === 1,
  `→ ${[...new Set(librosDe.values())][0]} cada uno`);
ok('y todos tienen materiales',
  materialesDe.size === 7 && new Set(materialesDe.values()).size === 1,
  `→ ${[...new Set(materialesDe.values())][0]} cada uno`);
ok('cada uno con sus propios enlaces, no los de otro curso',
  [...LIBROS_DE_CURSO, ...MATERIALES_DE_CURSO].every((r) => r.url.includes(r.cursoId)),
  '→ al reemplazar por los buenos no se pisan entre cursos');

/* Un material sin duración pintaba "undefined min" en Estudiar: no lanza y se
   ve en pantalla. */
ok('todo recurso declara cuánto cuesta',
  [...LIBROS_DE_CURSO, ...MATERIALES_DE_CURSO].every((r) => Number(r.minutos) > 0));

ok('todos pasan la puerta de licencia',
  soloAdmisibles([...LIBROS_DE_CURSO, ...MATERIALES_DE_CURSO]).length
    === LIBROS_DE_CURSO.length + MATERIALES_DE_CURSO.length);

/* En el panel de un curso salen sus dos listas, no las de otro. */
const panelAlgebra = await responder('biblioteca/catalogo', { token: sesion.token, cursoId: 'algebra' });
ok('el panel de un curso trae sus libros y sus materiales',
  panelAlgebra.libros.find((e) => e.cursoId === 'algebra')?.libros.length > 0
    && panelAlgebra.lista.filter((m) => m.cursoId === 'algebra').length > 0);
ok('y nada de otro curso',
  panelAlgebra.lista.every((m) => m.cursoId === 'algebra'));

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
