/**
 * Universidades y convocatorias.
 *
 * Dos cosas se vigilan aquí. Una es que las dos listas de universidades —el
 * registro y el catálogo de metas— no se separen con el tiempo, porque están
 * en archivos distintos y nada obliga a mantenerlas iguales.
 *
 * La otra es más importante: que una práctica de examen no sirva preguntas que
 * no son de ese examen. Rellenar con otras haría que el alumno saliera creyendo
 * que ya sabe cómo fue la convocatoria, y eso es peor que no poder practicarla.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { UNIVERSIDADES, universidadPorId, rutaLogo } from '../src/data/mock/universidades.js';
import { EXAMENES } from '../src/data/mock/examenes.js';
import { catalogo } from '../src/data/mock/exams.js';
import { iniciarSesion } from '../src/data/mock/questions.js';
import { soloAdmisibles, examenesPorProceso } from '../src/domain/catalogo.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

/* --- El registro --- */

ok('están las doce universidades estatales', UNIVERSIDADES.length === 12,
  `→ ${UNIVERSIDADES.map((u) => u.sigla).join(' ')}`);
ok('ninguna sigla se repite',
  new Set(UNIVERSIDADES.map((u) => u.sigla)).size === UNIVERSIDADES.length);
ok('ningún identificador se repite',
  new Set(UNIVERSIDADES.map((u) => u.id)).size === UNIVERSIDADES.length);
ok('todas traen nombre completo y nombre corto',
  UNIVERSIDADES.every((u) => u.nombre.length > 15 && u.nombreCorto.length > 5));
ok('el nombre corto cabe en un botón',
  UNIVERSIDADES.every((u) => u.nombreCorto.length <= 42),
  `→ el más largo: ${Math.max(...UNIVERSIDADES.map((u) => u.nombreCorto.length))} caracteres`);
/* --- Los logotipos --- */

ok('todas apuntan a su logotipo por convención',
  UNIVERSIDADES.every((u) => u.logo === rutaLogo(u.id)),
  '→ soltar el archivo en la carpeta basta, sin tocar código');

const RAIZ = fileURLToPath(new URL('../', import.meta.url));
ok('la carpeta de logotipos existe con sus instrucciones',
  existsSync(`${RAIZ}imagenes/universidades/LEEME.md`));

/* Informativo, no un fallo: la pantalla se ve entera con la marca tipográfica
   y los archivos se pueden ir poniendo de uno en uno. */
const puestos = UNIVERSIDADES.filter((u) => existsSync(RAIZ + u.logo.replace('./', '')));
console.log(`  --   logotipos en la carpeta: ${puestos.length} de ${UNIVERSIDADES.length}`
  + (puestos.length ? ` (${puestos.map((u) => u.sigla).join(', ')})` : ' — dibujan su sigla'));

/* Esta sí es un fallo: un archivo con nombre que no corresponde a ninguna
   universidad no lo va a ver nadie, y quien lo puso creerá que sí. */
import { readdirSync } from 'node:fs';
const enCarpeta = readdirSync(`${RAIZ}imagenes/universidades`)
  .filter((f) => /\.(svg|png|webp)$/i.test(f))
  .map((f) => f.replace(/\.[^.]+$/, ''));
const sobrantes = enCarpeta.filter((n) => !universidadPorId(n));
ok('ningún archivo de la carpeta sobra o está mal nombrado',
  sobrantes.length === 0,
  sobrantes.length ? `→ nadie los verá: ${sobrantes.join(', ')}` : '→ los nombres coinciden con los identificadores');
ok('se puede buscar una por identificador', universidadPorId('unmsm')?.sigla === 'UNMSM');
ok('un identificador inventado devuelve nada', universidadPorId('inventada') === null);

/* Las dos listas viven en archivos distintos y nada las obliga a coincidir. */
const enMetas = catalogo().map((u) => u.id);
const huerfanas = enMetas.filter((id) => !universidadPorId(id));
ok('toda universidad del catálogo de metas está en el registro',
  huerfanas.length === 0,
  huerfanas.length ? `→ faltan en el registro: ${huerfanas.join(', ')}` : `→ ${enMetas.length} comprobadas`);

/* --- Las convocatorias --- */

ok('todas las convocatorias tienen enlace al PDF',
  EXAMENES.every((e) => e.url?.startsWith('https://')),
  `→ ${EXAMENES.length} convocatorias`);

/* La sección se ve homogénea porque las doce traen la misma rejilla. Si una se
   queda corta al editar los datos, la pantalla vuelve a tener huecos sin que
   nadie se entere hasta verla. */
const porCasa = new Map();
for (const e of EXAMENES) porCasa.set(e.universidadId, (porCasa.get(e.universidadId) ?? 0) + 1);
ok('las doce universidades tienen convocatorias',
  porCasa.size === UNIVERSIDADES.length,
  `→ ${porCasa.size} de ${UNIVERSIDADES.length}`);
ok('todas tienen las mismas, para que la sección se vea pareja',
  new Set(porCasa.values()).size === 1,
  `→ ${[...new Set(porCasa.values())][0]} cada una`);
ok('cada universidad tiene sus propios enlaces, no los de otra',
  EXAMENES.every((e) => e.url.includes(e.universidadId)),
  '→ al reemplazar por los buenos no se pisan entre casas');
ok('todas se le pueden mostrar al alumno: las publica la universidad',
  soloAdmisibles(EXAMENES).length === EXAMENES.length);
ok('todas apuntan a una universidad del registro',
  EXAMENES.every((e) => universidadPorId(e.universidadId)));

/* El identificador de fila lo reasigna el panel al sembrar; este no cambia, y
   es el que viaja en la dirección que la persona puede guardar. */
ok('el identificador de convocatoria es estable y legible',
  EXAMENES.every((e) => e.examenId && !e.examenId.startsWith('m-') && e.examenId === e.id.replace(/^ex-/, '')),
  `→ ${EXAMENES[0].examenId}`);
ok('ninguno se repite',
  new Set(EXAMENES.map((e) => e.examenId)).size === EXAMENES.length);

const agrupadas = examenesPorProceso(EXAMENES);
ok('van del proceso más reciente al más antiguo',
  agrupadas[0].proceso > agrupadas[agrupadas.length - 1].proceso,
  `→ ${agrupadas.map((p) => p.proceso).join(' ')}`);
ok('cada proceso trae su convocatoria',
  agrupadas.every((p) => p.convocatorias.length > 0));

/* --- La práctica de un examen --- */

const vacia = iniciarSesion({ modo: 'examen', examenId: 'unmsm-2026-1-area-d' });
ok('un examen sin preguntas cargadas devuelve una sesión vacía',
  vacia.total === 0,
  '→ y la pantalla lo dice en vez de disimularlo');
ok('no se rellena con preguntas de otro sitio',
  vacia.preguntas.length === 0,
  '→ presentarlas como si fueran de esa convocatoria sería inventarse el examen');
ok('la sesión recuerda de qué examen es', vacia.examenId === 'unmsm-2026-1-area-d');

/* El respaldo al banco entero sí es correcto en los demás modos: quedarse sin
   preguntas de un curso y servir otras es un mal menor. */
const porCurso = iniciarSesion({ modo: 'curso', cursoId: 'curso-que-no-existe' });
ok('en los otros modos sí hay respaldo, y eso está bien',
  porCurso.total > 0,
  `→ ${porCurso.total} preguntas`);

/* --- La pertenencia de cada examen --- */

/*
 * Presentados sin universidad, estos exámenes no solo eran ambiguos: eran
 * engañosos. Un alumno que apunta a la UNI podía mirar seis convocatorias de
 * San Marcos y creer que le servían, cuando la estructura y el reparto de
 * preguntas son otros. La sigla tiene que llegar siempre, no solo cuando se ha
 * filtrado antes.
 */
ok('cada convocatoria dice de qué universidad es',
  EXAMENES.every((e) => e.universidadId && universidadPorId(e.universidadId)));

globalThis.localStorage ??= {
  _d: new Map(),
  getItem(k) { return this._d.get(k) ?? null; },
  setItem(k, v) { this._d.set(k, String(v)); },
  removeItem(k) { this._d.delete(k); },
};
const { responder } = await import('../src/data/mock/fixtures.js');
const sesion = await responder('auth/entrar', { correo: 'estudiante@umbral.pe', clave: 'admision2027' });

const sinFiltrar = await responder('biblioteca/catalogo', { token: sesion.token });
const convocatorias = sinFiltrar.examenes.flatMap((p) => p.convocatorias);
ok('sin filtrar por universidad, la pertenencia llega igual',
  convocatorias.length > 0 && convocatorias.every((c) => c.universidadId),
  `→ ${convocatorias.length} convocatorias, todas con universidad`);

/* La sigla se dibuja a partir de esta lista, así que tiene que venir entera
   aunque se esté filtrando: si no, la tarjeta se quedaría sin etiqueta. */
const filtrada = await responder('biblioteca/catalogo', { token: sesion.token, universidadId: 'unmsm' });
/* Las doce se pintan siempre, sin recorte ni botón de "ver más": esconder la
   mitad obligaba a pulsar para descubrir si la tuya estaba. Y el desplegable
   de cada una necesita el registro entero para dibujarse. */
ok('las doce viajan siempre, también al filtrar',
  filtrada.universidades.length === UNIVERSIDADES.length
    && sinFiltrar.universidades.length === UNIVERSIDADES.length,
  '→ ninguna se recorta');
ok('cada tarjeta sabe cuántos exámenes tiene sin abrirla',
  sinFiltrar.universidades.every((u) => typeof u.convocatorias === 'number'),
  `→ ${sinFiltrar.universidades.filter((u) => u.convocatorias > 0).length} con material de ${UNIVERSIDADES.length}`);
ok('filtrar por una universidad deja solo sus convocatorias',
  filtrada.examenes.flatMap((p) => p.convocatorias).every((c) => c.universidadId === 'unmsm'));

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
