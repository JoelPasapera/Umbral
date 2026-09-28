/**
 * Que cada pantalla se pinte, y que pulsar no reviente.
 *
 * Es la batería que faltaba. Las demás comprueban dominio y servidor, que es
 * donde vive la lógica, pero ninguna llegaba a construir un árbol de nodos. Por
 * eso pasó desapercibido que la biblioteca llamara a tres funciones borradas: se
 * publicó una pantalla que reventaba al abrir una universidad, con 516
 * comprobaciones en verde.
 *
 * No mira el aspecto. Mira que nada lance y que no acabe escrito "undefined" en
 * la pantalla, que es como se ve un campo que no llegó.
 */
import { Nodo } from './ayudas/dom-minimo.mjs';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

/*
 * Las vistas cargan sus datos en una promesa que nadie espera: `render`
 * devuelve el nodo y la carga sigue por detrás. Si algo lanza ahí, Node mata
 * el proceso y se pierde todo lo que venía después, incluido el nombre de la
 * comprobación que iba a fallar. Recogerlo lo convierte en un fallo con
 * nombre, que es lo que sirve para arreglarlo.
 */
const sueltos = [];
process.on('unhandledRejection', (error) => {
  sueltos.push(error?.message ?? String(error));
});
const reposar = () => new Promise((r) => setTimeout(r, 60));

const raiz = new URL('../src/', import.meta.url).pathname;
const { responder } = await import(`${raiz}data/mock/fixtures.js`);
const sesion = await responder('auth/entrar', { correo: 'estudiante@umbral.pe', clave: 'admision2027' });
localStorage.setItem('umbral:sesion', sesion.token);
localStorage.setItem('umbral:usuario', JSON.stringify(sesion.usuario));

/* Un texto con "undefined" o "[object Object]" es un campo que no llegó y que
   nadie comprobó. Se ve en pantalla y no lanza ningún error. */
const sano = (t) => !/undefined|\[object |NaN/.test(t);

const PANTALLAS = ['meta', 'admision', 'temario', 'estudiar', 'biblioteca', 'practicar', 'perfil', 'admin', 'entrar'];

/*
 * Antes bastaba con que `render` devolviera algo, y una pantalla atascada en
 * "Abriendo…" pasaba con un solo nodo. Ahora se espera a que los datos lleguen
 * y se exige contenido: quedarse en el mensaje de carga es un fallo, no un
 * estado válido.
 */
for (const pantalla of PANTALLAS) {
  try {
    const modulo = await import(`${raiz}features/${pantalla}/${pantalla}.view.js`);
    const nodo = await modulo.render({});
    for (let i = 0; i < 6; i += 1) await reposar();

    const cargando = /Abriendo|Cargando/.test(nodo.textContent) && nodo.todos().length < 5;
    ok(`se pinta ${pantalla}`,
      Boolean(nodo) && sano(nodo.textContent) && !cargando,
      cargando ? '→ se quedó en el mensaje de carga'
        : (sano(nodo.textContent) ? `→ ${nodo.todos().length} nodos` : '→ hay un hueco sin rellenar'));
    modulo.descartar?.();
  } catch (error) {
    ok(`se pinta ${pantalla}`, false, `→ ${error.message}`);
  }
}

/* --- Admisión: que enseñe lo que tiene que enseñar --- */

try {
  const modulo = await import(`${raiz}features/admision/admision.view.js`);
  const nodo = await modulo.render({});
  for (let i = 0; i < 6; i += 1) await reposar();
  let texto = nodo.textContent;

  const secciones = ['A qué te enfrentas', 'Contra qué compites', 'Cuándo es', 'Qué pasos siguen'];
  ok('Admisión trae sus cuatro secciones',
    secciones.every((x) => texto.includes(x)),
    `→ ${secciones.filter((x) => texto.includes(x)).length} de ${secciones.length}`);

  /* Las secciones están plegadas y se abren al pulsarlas, así que hay que
     abrirlas para ver su contenido. Es también lo que hay que comprobar: una
     cabecera que no despliega deja la pantalla en cuatro títulos. */
  const cabeceras = () => nodo.todos().filter((n) => n.className?.includes('plegable__cabecera'));
  ok('las cabeceras son botones, no divs con un click',
    cabeceras().length === 4 && cabeceras().every((b) => b.tagName === 'BUTTON'),
    '→ así se llega con el tabulador y se activa con la barra espaciadora');
  ok('cada una declara si está abierta',
    cabeceras().every((b) => ['true', 'false'].includes(b.getAttribute('aria-expanded'))));

  const antes = nodo.todos().length;
  for (const b of cabeceras()) {
    if (b.getAttribute('aria-expanded') === 'false') { b.disparar('click'); await reposar(); }
  }
  ok('abrirlas todas trae más contenido a la pantalla',
    nodo.todos().length > antes, `→ ${antes} → ${nodo.todos().length} nodos`);

  /* Cada dato dice de dónde sale. Un corte de ejemplo que parezca real es peor
     que no dar ninguno: sobre esa cifra se calcula cuánto le falta a la
     persona, y ese número es el producto. */
  texto = nodo.textContent;
  ok('el cronograma se marca como oficial y enseña su fuente',
    texto.includes('Dato oficial') && texto.includes('Ver fuente'));
  ok('lo que viene de prensa se marca como sin contrastar', texto.includes('Sin contrastar'));
  /* Declarar el hueco es lo que impide que alguien rellene el corte con una
     cifra de blog y el alumno calcule sobre ella cuánto le falta. */
  ok('el corte que falta se declara como hueco, no se rellena',
    texto.includes('Todavía no lo tenemos') && texto.includes('Actas oficiales'));
  ok('la cuenta atrás da los días que faltan de verdad',
    /\d+\s*d[ií]as?/.test(texto));

  /* `el` no admite `style` como propiedad, solo por `attrs`. Puesto mal se
     ignora en silencio y todas las barras salen del mismo ancho. */
  const jugo = nodo.todos().filter((n) => n.className === 'reparto__jugo');
  const anchos = new Set(jugo.map((b) => b.getAttribute('style')));
  ok('la capa del peso del examen es proporcional',
    jugo.length > 0 && anchos.size > 1,
    `→ ${jugo.length} barras, ${anchos.size} anchos distintos`);

  /* La segunda capa es tu preparación. Un curso sin evidencia NO lleva capa:
     pintarlo a 0% diría que no sabes nada cuando lo que pasa es que no se ha
     medido, y `readiness.js` devuelve null ahí justamente para no decirlo. */
  const dominio = nodo.todos().filter((n) => n.className === 'reparto__dominio');
  ok('la capa de tu preparación solo aparece donde hay datos',
    dominio.length > 0 && dominio.length < jugo.length,
    `→ ${dominio.length} cursos medidos de ${jugo.length}`);
  ok('los cursos sin medir lo dicen en vez de marcar cero',
    texto.includes('sin datos'));
  ok('y se dice cuántos puntos llevas asegurados',
    /\d+\s+de\s+\d+\s+puntos/.test(texto));
  modulo.descartar?.();
} catch (error) {
  ok('Admisión trae sus cuatro secciones', false, `→ ${error.message}`);
}

/* --- Los clics de la biblioteca, que es donde reventó --- */

const biblioteca = await import(`${raiz}features/biblioteca/biblioteca.view.js`);
const vista = await biblioteca.render({});
for (let i = 0; i < 6; i += 1) await reposar();

const boton = (etiqueta) => vista.todos()
  .filter((n) => n.tagName === 'BUTTON')
  .find((b) => b.textContent.includes(etiqueta));

for (const [que, etiqueta] of [
  ['una universidad', 'UNMSM'],
  ['un curso', 'Trigonometría'],
]) {
  try {
    const b = boton(etiqueta);
    if (!b) { ok(`abrir ${que}`, false, `→ no aparece el botón "${etiqueta}"`); continue; }
    b.disparar('click');
    for (let i = 0; i < 6; i += 1) await reposar();
    ok(`abrir ${que}`, sano(vista.textContent), `→ ${vista.todos().length} nodos`);
    b.disparar('click');
    for (let i = 0; i < 6; i += 1) await reposar();
    ok(`y cerrar ${que}`, sano(vista.textContent));
  } catch (error) {
    ok(`abrir ${que}`, false, `→ ${error.message}`);
  }
}

/* --- Estudiar: abrir un resumen --- */

/*
 * El visor llevaba roto: la siembra reasigna los identificadores al cargar el
 * catálogo, y el servidor los buscaba en la lista de origen, así que abrir
 * cualquier resumen respondía "Ese resumen no existe". Ninguna prueba pulsaba
 * nada, y pintar la pantalla no bastaba: el fallo solo aparece al abrir.
 */
try {
  const estudiar = await import(`${raiz}features/estudiar/estudiar.view.js`);
  const pantalla = await estudiar.render({});
  await reposar(); await reposar();

  const pulsables = pantalla.todos().filter((n) => n.tagName === 'BUTTON' || n.tagName === 'A');
  let rompio = null;
  for (const p of pulsables.slice(0, 20)) {
    try { p.disparar('click'); await reposar(); }
    catch (error) { rompio = `${p.textContent.slice(0, 30).trim()} → ${error.message}`; break; }
  }
  ok('pulsar en Estudiar no lanza', rompio === null, rompio ? `→ ${rompio}` : `→ ${pulsables.length} elementos`);
  ok('y no queda ningún hueco sin rellenar',
    sano(pantalla.textContent), '→ un "undefined min" no lanza pero se ve');
  estudiar.descartar?.();
} catch (error) {
  ok('pulsar en Estudiar no lanza', false, `→ ${error.message}`);
}

/* El campo de búsqueda tiene que sobrevivir al repintado: si se reconstruyera
   en cada tecla, el navegador le quitaría el foco y no se podría escribir. */
try {
  const campo = vista.todos().find((n) => n.tagName === 'INPUT');
  campo.value = 'euclides';
  campo.disparar('input');
  await new Promise((r) => setTimeout(r, 400));
  ok('buscar desde el campo no rompe nada', sano(vista.textContent));
  ok('el campo sobrevive al repintado', vista.todos().includes(campo),
    '→ si se recreara, se perdería el foco en cada tecla');
} catch (error) {
  ok('buscar desde el campo no rompe nada', false, `→ ${error.message}`);
}

await reposar();
ok('ninguna pantalla lanza por detrás mientras carga',
  sueltos.length === 0,
  sueltos.length ? `→ ${[...new Set(sueltos)].join(' · ')}` : '');

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
