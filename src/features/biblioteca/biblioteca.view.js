/**
 * Biblioteca.
 *
 * Un catálogo con tres filtros que se combinan, no tres catálogos. Un examen
 * resuelto de San Marcos es a la vez de la colección "practica y evalúate", del
 * curso "álgebra" y de la universidad UNMSM: con secciones separadas habría que
 * elegir dónde vive; así aparece en las tres y existe una sola vez.
 *
 * `estudiar/` sigue siendo la puerta principal y ordena por diagnóstico —"esto
 * es lo que te falta"—. Esta pantalla es para cuando la persona ya sabe qué
 * busca. Las dos leen el mismo catálogo y ninguna importa a la otra.
 *
 * La lista de cursos no está escrita aquí: viene del temario del examen de la
 * meta, ordenada por lo que pesa cada curso. Cuando se carguen los trece cursos
 * que faltan, aparecen solos.
 */

import { el, montar } from '../../core/dom.js';
import { catalogo } from '../../data/repositories/library.repo.js';
import { estadoVacio, vistaDeError } from '../../ui/components/estado.js';

const estado = {
  filtros: { cursoId: '', universidadId: '', busqueda: '' },
  datos: null,
  cargando: true,
  error: null,
};

let raiz = null;
let resultados = null;
let buscador = null;

const porcentaje = (fraccion) => `${Math.round(fraccion * 100)}%`;

async function cargar() {
  estado.cargando = true;
  estado.error = null;
  pintar();
  try {
    const filtros = {};
    for (const [clave, valor] of Object.entries(estado.filtros)) {
      if (valor) filtros[clave] = valor;
    }
    estado.datos = await catalogo(filtros);
  } catch (error) {
    estado.error = error.message;
  } finally {
    estado.cargando = false;
    pintar();
  }
}

function alternar(clave, valor) {
  estado.filtros[clave] = estado.filtros[clave] === valor ? '' : valor;
  cargar();
}

/** Universidades cuyo logotipo no está en la carpeta. Ver `marcaDe` abajo. */
const sinLogo = new Set();

/**
 * El escudo de la universidad, o su sigla si el archivo todavía no está.
 *
 * El campo `logo` apunta por convención a `imagenes/universidades/<id>.svg`,
 * así que soltar el archivo ahí basta para que aparezca. Mientras no esté, la
 * imagen falla, `onerror` la sustituye por la marca tipográfica y se apunta el
 * fallo en `sinLogo`: los filtros repintan esta rejilla a cada pulsación, y sin
 * esa nota se pediría el mismo archivo ausente una y otra vez durante toda la
 * sesión.
 */
function marcaDe(u) {
  const sigla = el('span', {
    clase: 'casa__marca',
    texto: u.sigla.slice(0, 6),
    attrs: { 'aria-hidden': 'true' },
  });

  if (!u.logo || sinLogo.has(u.id)) return sigla;

  // La sustitución ocurre dentro de un contenedor y no sobre el propio nodo:
  // si el archivo falta y el error llega antes de montar el árbol, un
  // `replaceWith` sobre un nodo todavía sin padre no hace nada y se queda la
  // imagen rota en pantalla. `replaceChildren` sobre el contenedor funciona
  // igual esté montado o no.
  const hueco = el('span', { clase: 'casa__hueco' });

  // `alt` vacío a propósito: la sigla y el nombre van escritos justo debajo, y
  // un lector de pantalla que los lea tres veces no ayuda a nadie.
  const imagen = el('img', {
    clase: 'casa__logo',
    attrs: { src: u.logo, alt: '', width: '40', height: '40' },
    on: {
      error: () => {
        sinLogo.add(u.id);
        hueco.replaceChildren(sigla);
      },
    },
  });

  hueco.append(imagen);
  return hueco;
}

/**
 * Una universidad como botón.
 *
 * El nombre completo va debajo de la sigla porque la sigla es como la nombra
 * todo el mundo, pero fuera de su región no siempre se reconoce.
 */
function universidad(u) {
  const activa = estado.filtros.universidadId === u.id;

  return el('li', { clase: 'casas__casilla' }, [
    el('button', {
      clase: ['casa', activa && 'casa--activa', u.convocatorias === 0 && 'casa--vacia'],
      type: 'button',
      attrs: { 'aria-pressed': activa ? 'true' : 'false', title: u.nombre },
      on: { click: () => alternar('universidadId', u.id) },
    }, [
      marcaDe(u),
      el('span', { clase: 'casa__sigla', texto: u.sigla }),
      el('span', { clase: 'casa__nombre', texto: u.nombreCorto }),
      // El recuento va en la tarjeta para no tener que abrir doce y descubrir
      // que once están vacías. Cero también se escribe: que una universidad
      // esté en el mapa sin material es información, no ausencia.
      el('span', {
        clase: ['casa__cuenta', u.convocatorias === 0 && 'casa__cuenta--vacia'],
        texto: u.convocatorias === 0
          ? 'Sin exámenes'
          : `${u.convocatorias} ${u.convocatorias === 1 ? 'examen' : 'exámenes'}`,
      }),
    ]),
  ]);
}

function universidades() {
  const todas = estado.datos.universidades ?? [];
  if (!todas.length) return null;
  const elegida = todas.find((u) => u.id === estado.filtros.universidadId);

  // Todas a la vista, sin recorte ni botón de "ver más": son doce y caben.
  // Esconder la mitad obligaba a pulsar para descubrir si la tuya está.
  return el('section', { clase: 'bloque-casas' }, [
    el('h2', { clase: 'rotulo', texto: 'Universidades' }),
    el('p', {
      clase: 'bloque-casas__pista',
      texto: 'Pulsa una para ver sus exámenes y simulacros, y filtrar el resto de la biblioteca por ella.',
    }),
    el('ul', { clase: 'casas' }, todas.map(universidad)),
    // El panel va DEBAJO de la rejilla entera, nunca dentro.
    //
    // Estuvo dentro, como una casilla que abarcaba todas las columnas, y el
    // resultado fue que al pulsar una universidad la rejilla recolocaba las
    // doce para hacerle sitio: la pulsada saltaba a su propia fila y las de
    // después se iban al otro lado del panel. Nada debe moverse por elegir
    // algo; solo resaltarse lo elegido.
    elegida && el('div', { clase: 'casas__panel' }, examenesDe(elegida)),
  ]);
}

function ficha(m) {
  return el('li', { clase: 'recurso' }, [
    el('p', { clase: 'recurso__titulo', texto: m.titulo }),
    m.detalle && el('p', { clase: 'recurso__detalle', texto: m.detalle }),
    el('p', { clase: 'recurso__pie' }, [
      el('span', { texto: m.fuente }),
      m.minutos && el('span', { texto: ` · ${m.minutos} min` }),
    ]),
  ]);
}

/**
 * El buscador.
 *
 * Se crea una sola vez y vive fuera de lo que se repinta. Si estuviera dentro,
 * cada tecla reconstruiría el campo, el navegador le quitaría el foco al
 * quitarlo del documento y no se podría escribir más de una letra.
 *
 * La espera de 250 ms es para no pedir al servidor en cada pulsación: quien
 * escribe "trigonometría" dispararía catorce peticiones y solo importa la
 * última.
 */
function crearBuscador() {
  let temporizador = null;
  const campo = el('input', {
    clase: 'buscador__campo',
    attrs: {
      type: 'search',
      id: 'biblioteca-buscar',
      placeholder: 'Buscar un libro, un examen o un material',
      autocomplete: 'off',
    },
    on: {
      input: () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => {
          estado.filtros.busqueda = campo.value.trim();
          cargar();
        }, 250);
      },
    },
  });

  return {
    campo,
    nodo: el('div', { clase: 'buscador' }, [
      el('label', {
        clase: 'solo-lectores',
        texto: 'Buscar en la biblioteca',
        attrs: { for: 'biblioteca-buscar' },
      }),
      campo,
    ]),
  };
}

/** Un libro: título, de qué va, y el botón para abrirlo. */
function libro(m) {
  return el('li', { clase: 'libro' }, [
    el('div', { clase: 'libro__texto' }, [
      el('p', { clase: 'libro__titulo', texto: m.titulo }),
      m.subtitulo && el('p', { clase: 'libro__subtitulo', texto: m.subtitulo }),
      m.fuente && el('p', { clase: 'libro__fuente', texto: m.fuente }),
    ]),
    m.url
      ? el('a', {
        clase: 'boton boton--secundario libro__abrir',
        texto: 'Abrir libro ↗',
        attrs: { href: m.url, target: '_blank', rel: 'noopener noreferrer' },
      })
      : null,
  ]);
}

/**
 * Los exámenes de una universidad, dentro de su panel.
 *
 * Van con su universidad y no sueltos porque un examen no existe en abstracto:
 * existe por convocatoria de una casa concreta, con su estructura y su reparto
 * de preguntas. Sueltos eran engañosos — quien apunta a la UNI podía mirar seis
 * convocatorias de San Marcos y darlas por suyas.
 */
function examenesDe(u) {
  const convocatorias = (estado.datos.examenes ?? [])
    .flatMap((p) => p.convocatorias.map((x) => ({ ...x, proceso: p.proceso })))
    .filter((x) => x.universidadId === u.id);

  const titulo = el('h3', { clase: 'panel__titulo', texto: `Exámenes y simulacros · ${u.sigla}` });
  if (!convocatorias.length) {
    return [titulo, el('p', { clase: 'estante__vacio', texto: `${u.sigla} todavía no tiene exámenes cargados.` })];
  }

  return [
    titulo,
    el('div', { clase: 'examenes' }, convocatorias.map((x) =>
      el('article', { clase: 'convocatoria' }, [
        el('p', { clase: 'convocatoria__proceso', texto: x.proceso }),
        el('p', { clase: 'convocatoria__area', texto: `Área ${x.area}` }),
        // Practicar es dentro de la aplicación y cuenta para el diagnóstico.
        // El PDF es fuera y no cuenta, porque Umbral no ve lo que haces con él.
        // Por eso uno es botón sólido y el otro un enlace discreto.
        el('a', {
          clase: 'boton convocatoria__practicar',
          texto: 'Practicar',
          attrs: { href: `#/practicar?examen=${encodeURIComponent(x.examenId)}` },
        }),
        el('a', {
          clase: 'convocatoria__pdf',
          attrs: { href: x.url, target: '_blank', rel: 'noopener noreferrer' },
        }, [
          el('span', { texto: 'Examen' }),
          el('span', { clase: 'convocatoria__accion', texto: 'PDF ↗' }),
        ]),
      ]))),
  ];
}

/**
 * Marca corta de un curso: "Habilidad matemática" → HM, "Álgebra" → ALG.
 *
 * Se deriva del nombre en vez de mantener una tabla, para que un curso nuevo
 * del temario tenga la suya sin que nadie se acuerde de añadirla.
 */
function siglaCurso(nombre) {
  const plano = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const palabras = String(nombre ?? '').split(/\s+/).filter(Boolean);
  if (palabras.length > 1) return palabras.map((w) => plano(w[0])).join('');
  return plano(palabras[0] ?? '').slice(0, 3);
}

/**
 * Un curso como botón, con la misma forma que una universidad.
 *
 * La rejilla no está escrita a mano: son los cursos con ficha de libro más los
 * cinco de matemática del temario, ordenados por lo que pesan en el examen.
 * Cargar un curso nuevo hace aparecer su tarjeta sola.
 */
function curso(c) {
  const activa = estado.filtros.cursoId === c.cursoId;
  const total = c.libros + c.materiales;
  return el('li', { clase: 'casas__casilla' }, [
    el('button', {
      clase: ['casa', activa && 'casa--activa', total === 0 && 'casa--vacia'],
      type: 'button',
      attrs: { 'aria-pressed': activa ? 'true' : 'false' },
      on: { click: () => alternar('cursoId', c.cursoId) },
    }, [
      el('span', { clase: 'casa__marca', texto: siglaCurso(c.nombre), attrs: { 'aria-hidden': 'true' } }),
      el('span', { clase: 'casa__sigla', texto: c.nombre }),
      // El peso del examen en lugar de un nombre largo: es lo que decide dónde
      // conviene invertir el tiempo, y no aparece en ninguna otra pantalla.
      el('span', { clase: 'casa__nombre', texto: `${Math.round(c.pesoExamen * 100)}% del examen` }),
      el('span', {
        clase: ['casa__cuenta', total === 0 && 'casa__cuenta--vacia'],
        texto: total === 0 ? 'Sin material' : `${total} ${total === 1 ? 'recurso' : 'recursos'}`,
      }),
    ]),
  ]);
}

/** Los libros y los materiales del curso abierto, en dos listas separadas. */
function contenidoDe(c) {
  const libros = (estado.datos.libros ?? []).find((e) => e.cursoId === c.cursoId)?.libros ?? [];
  const materiales = (estado.datos.lista ?? []).filter((m) => m.cursoId === c.cursoId);
  const nada = (que) => el('p', { clase: 'estante__vacio', texto: `Todavía no hay ${que} de ${c.nombre.toLocaleLowerCase('es')}.` });

  return [
    el('h3', { clase: 'panel__titulo', texto: c.nombre }),
    el('h4', { clase: 'panel__seccion', texto: 'Libros' }),
    libros.length ? el('ul', { clase: 'estante__lista' }, libros.map(libro)) : nada('libros'),
    el('h4', { clase: 'panel__seccion', texto: 'Materiales' }),
    materiales.length ? el('ul', { clase: 'biblioteca__lista' }, materiales.map(ficha)) : nada('materiales'),
  ];
}

/** La rejilla de cursos, con el mismo comportamiento que la de universidades. */
function cursos() {
  const todos = estado.datos.cursos ?? [];
  if (!todos.length) return null;
  const abierto = todos.find((c) => c.cursoId === estado.filtros.cursoId);

  return el('section', { clase: 'bloque-casas' }, [
    el('h2', { clase: 'rotulo', texto: 'Cursos' }),
    el('p', {
      clase: 'bloque-casas__pista',
      texto: 'Ordenados por lo que pesan en tu examen, no alfabéticamente. Pulsa uno para ver sus libros y materiales.',
    }),
    el('ul', { clase: 'casas' }, todos.map(curso)),
    // Debajo de la rejilla, nunca dentro: si el panel fuera una casilla más,
    // abrirlo recolocaría todas las tarjetas para hacerle sitio.
    abierto && el('div', { clase: 'casas__panel' }, contenidoDe(abierto)),
  ]);
}

/** La lista suelta solo aparece cuando hay algo escrito en el buscador. */
const hayBusqueda = () => Boolean(estado.filtros.busqueda);

function pintar() {
  if (!resultados) return;

  if (estado.cargando && !estado.datos) {
    return montar(resultados, el('p', { clase: 'cargando', texto: 'Abriendo la biblioteca…', attrs: { role: 'status' } }));
  }
  if (estado.error) return montar(resultados, vistaDeError(estado.error));

  montar(resultados,
    universidades(),
    cursos(),
    estado.datos.pendientes > 0 &&
      el('p', { clase: 'biblioteca__pendientes' }, [
        el('strong', { texto: `${estado.datos.pendientes} fichas de libro esperan licencia. ` }),
        el('span', { texto: 'Están creadas y no se muestran a ningún alumno hasta que se resuelva de dónde salen.' }),
      ]),
    // La lista suelta solo sale al buscar o al elegir colección. Con un curso
    // abierto repetiría lo que el panel ya enseña, que es exactamente la
    // redundancia que tenía antes la rejilla de cursos.
    hayBusqueda() && el('h2', { clase: 'rotulo', texto: `Resultados (${estado.datos.lista.length})` }),
    hayBusqueda() && (estado.datos.lista.length
      ? el('ul', { clase: 'biblioteca__lista' }, estado.datos.lista.map(ficha))
      : estadoVacio({
          titulo: 'Nada coincide con estos filtros',
          cuerpo: 'Quita alguno de los filtros activos para ver más material.',
          principal: false,
          accion: {
            texto: 'Quitar los filtros',
            al: () => {
              estado.filtros = { cursoId: '', universidadId: '', busqueda: '' };
              if (buscador) buscador.campo.value = '';
              cargar();
            },
          },
        })),
  );
}

export async function render() {
  buscador = crearBuscador();
  resultados = el('div', { clase: 'biblioteca__resultados' });

  raiz = el('div', {}, [
    el('div', { clase: 'biblioteca' }, [
      el('header', { clase: 'biblioteca-cabecera' }, [
        el('p', { clase: 'rotulo', texto: 'Catálogo completo' }),
        el('h1', { clase: 'biblioteca-cabecera__titulo', texto: 'Biblioteca' }),
        el('p', {
          clase: 'biblioteca-cabecera__nota',
          texto: 'Elige una universidad para ver sus exámenes, o busca directamente lo que necesites.',
        }),
        buscador.nodo,
      ]),
      resultados,
    ]),
  ]);

  cargar();
  return raiz;
}

export function descartar() {
  raiz = null;
  resultados = null;
  buscador = null;
  estado.datos = null;
  estado.filtros = { cursoId: '', universidadId: '', busqueda: '' };
}
