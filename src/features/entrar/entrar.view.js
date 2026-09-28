/**
 * Entrada, registro y recuperación.
 *
 * Una lección que costó un fallo real: **nunca leas los valores del formulario
 * del DOM en el momento de enviarlos.** La versión anterior redibujaba la
 * pantalla para mostrar "Entrando…" y después leía los campos, que ya eran
 * inputs nuevos y vacíos. El correo llegaba en blanco y la app respondía
 * "formato no válido" con un correo perfectamente escrito. El mismo fallo
 * rompía el inicio de sesión.
 *
 * Ahora los valores se capturan del evento `submit` con `FormData`, antes de
 * que nada se redibuje, y se guardan en el estado para que un error no borre
 * lo que la persona ya había escrito.
 */

import { el, montar } from '../../core/dom.js';
import { establecerSesion } from '../../core/sesion.js';
import { entrar, registrar, recuperar, entrarConGoogle, completarConGoogle } from '../../data/repositories/auth.repo.js';
import { montarBotonGoogle, googleConfigurado } from '../../core/google.js';
import { validarRegistro, validarEntrada } from './validacion.js';
import { CUENTA_DEMO, CODIGOS_DEMO } from '../../data/mock/auth.js';

const estado = {
  raiz: null,
  modo: 'entrar',
  volver: 'meta',
  error: null,
  campoConError: null,
  aviso: null,
  ocupado: false,
  valores: {},
  google: null,
};

const ANIO = new Date().getFullYear();

function marcaUmbral() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 60 42');
  svg.setAttribute('class', 'marca');
  svg.setAttribute('aria-hidden', 'true');

  const arco = document.createElementNS(NS, 'path');
  arco.setAttribute('d', 'M19 36 L19 20 A11 11 0 0 1 41 20 L41 36');
  arco.setAttribute('fill', 'none');
  arco.setAttribute('stroke', 'currentColor');
  arco.setAttribute('stroke-width', '5');

  const linea = document.createElementNS(NS, 'rect');
  linea.setAttribute('x', '0');
  linea.setAttribute('y', '36');
  linea.setAttribute('width', '60');
  linea.setAttribute('height', '3.5');
  linea.setAttribute('fill', 'var(--rojo)');

  svg.append(arco, linea);
  return svg;
}

/**
 * Un campo. El valor sale del estado, no del DOM: así sobrevive a que la
 * pantalla se vuelva a dibujar.
 */
function campo({ nombre, etiqueta, tipo = 'text', ayuda, ...attrs }) {
  const conError = estado.campoConError === nombre;
  const esClave = tipo === 'password';
  const control = el('input', {
    clase: ['campo__control', conError && 'campo__control--error'],
    id: nombre,
    name: nombre,
    type: tipo,
    value: estado.valores[nombre] ?? '',
    attrs: {
      ...attrs,
      'aria-invalid': conError ? 'true' : null,
      'aria-describedby': ayuda ? `${nombre}-ayuda` : null,
    },
  });

  // Ver la contraseña que escribiste no es una comodidad: en un teléfono, con
  // el teclado tapando media pantalla, es la diferencia entre entrar y
  // rendirse al tercer intento.
  const envoltura = esClave
    ? el('div', { clase: 'campo__con-boton' }, [
        control,
        el('button', {
          clase: 'campo__ojo',
          type: 'button',
          texto: 'Ver',
          attrs: { 'aria-label': 'Mostrar u ocultar la contraseña' },
          on: {
            click: (evento) => {
              const visible = control.type === 'text';
              control.type = visible ? 'password' : 'text';
              evento.target.textContent = visible ? 'Ver' : 'Ocultar';
              control.focus();
            },
          },
        }),
      ])
    : control;

  return el('div', { clase: 'campo' }, [
    el('label', { clase: 'campo__etiqueta', texto: etiqueta, attrs: { for: nombre } }),
    envoltura,
    ayuda && el('p', { clase: 'campo__ayuda', texto: ayuda, attrs: { id: `${nombre}-ayuda` } }),
  ]);
}

function casilla(nombre, texto, enlace) {
  const entrada = el('input', { type: 'checkbox', id: nombre, name: nombre });
  entrada.checked = estado.valores[nombre] === true;
  const cuerpo = el('span', { texto });
  if (enlace) {
    cuerpo.append(
      document.createTextNode(' '),
      el('a', {
        clase: 'enlace',
        texto: enlace.texto,
        attrs: { href: enlace.href, target: '_blank', rel: 'noopener' },
      }),
    );
  }
  return el('label', { clase: 'casilla' }, [entrada, cuerpo]);
}

/** Lee el formulario entero de una vez, antes de tocar nada. */
function leerFormulario(formulario) {
  const datos = Object.fromEntries(new FormData(formulario));
  // Las casillas sin marcar no aparecen en FormData: hay que ponerlas a mano.
  for (const entrada of formulario.querySelectorAll('input[type=checkbox]')) {
    datos[entrada.name] = entrada.checked;
  }
  return datos;
}

function mostrarProblema({ campo: nombre, mensaje }) {
  estado.error = mensaje;
  estado.campoConError = nombre;
  estado.ocupado = false;
  pintar();
  document.getElementById(nombre)?.focus();
}

function cambiarModo(modo) {
  estado.modo = modo;
  estado.error = null;
  estado.campoConError = null;
  estado.aviso = null;
  pintar();
}

const irADestino = () => {
  window.location.hash = `#/${estado.volver}`;
};

/* ---------- Acciones ---------- */

async function accionEntrar(datos) {
  const problema = validarEntrada(datos);
  if (problema) return mostrarProblema(problema);

  estado.error = null;
  estado.campoConError = null;
  estado.ocupado = true;
  pintar();

  try {
    const usuario = await entrar({ correo: String(datos.correo).trim(), clave: datos.clave });
    establecerSesion(usuario);
    irADestino();
  } catch (error) {
    mostrarProblema({ campo: 'clave', mensaje: error.message });
  }
}

async function accionRegistrar(datos) {
  const problema = validarRegistro(datos);
  if (problema) return mostrarProblema(problema);

  estado.error = null;
  estado.campoConError = null;
  estado.ocupado = true;
  pintar();

  const correo = String(datos.correo).trim();
  try {
    await registrar({
      nombre: datos.nombre,
      correo,
      clave: datos.clave,
      codigoAcademia: datos.codigoAcademia,
      anioNacimiento: Number(datos.anioNacimiento),
      aceptaTerminos: datos.terminos === true,
      permisoApoderado: datos.apoderado === true,
    });
    const usuario = await entrar({ correo, clave: datos.clave });
    establecerSesion(usuario);
    irADestino();
  } catch (error) {
    mostrarProblema({ campo: 'correo', mensaje: error.message });
  }
}

async function accionRecuperar(datos) {
  const correo = String(datos.correo ?? '').trim();
  if (!correo) return mostrarProblema({ campo: 'correo', mensaje: 'Escribe tu correo.' });

  estado.error = null;
  estado.campoConError = null;
  estado.ocupado = true;
  pintar();

  try {
    const { mensaje } = await recuperar(correo);
    estado.aviso = mensaje;
    estado.ocupado = false;
    pintar();
  } catch (error) {
    mostrarProblema({ campo: 'correo', mensaje: error.message });
  }
}

/* ---------- Formularios ---------- */

/**
 * Zona de entrada con Google.
 *
 * El botón lo dibuja Google, no nosotros: su documentación lo exige y, sobre
 * todo, es lo único que abre el diálogo de forma fiable. Un botón propio que
 * llama a `prompt()` lo bloquean muchos navegadores y entonces no pasa nada al
 * pulsarlo, que es la peor versión posible.
 *
 * Si falta el identificador de cliente, aquí aparece un aviso y no un botón
 * que finge. Un botón que simula autenticarte y te crea una sesión real es una
 * puerta trasera, no una maqueta.
 */
function zonaGoogle() {
  const hueco = el('div', { clase: 'entrar__google', attrs: { id: 'google-boton' } });

  if (!googleConfigurado()) {
    return el('div', { clase: 'entrar__proveedores' }, [
      el('p', { clase: 'entrar__sin-google' }, [
        el('strong', { texto: 'Entrar con Google no está activo todavía. ' }),
        el('span', { texto: 'Falta configurar el identificador de cliente en src/data/config.js.' }),
      ]),
      el('p', { clase: 'entrar__separador' }, [el('span', { texto: 'entra con tu correo' })]),
    ]);
  }

  // El botón se monta después de que el nodo esté en el documento: Google
  // necesita medirlo para dibujarlo.
  queueMicrotask(() => {
    montarBotonGoogle(hueco, recibirCredencial, (mensaje) => {
      hueco.replaceChildren(el('p', { clase: 'entrar__sin-google', texto: mensaje }));
    });
  });

  return el('div', { clase: 'entrar__proveedores' }, [
    hueco,
    el('p', { clase: 'entrar__separador' }, [el('span', { texto: 'o con tu correo' })]),
  ]);
}

/** Llega el ID token firmado por Google. */
async function recibirCredencial(credencial) {
  estado.error = null;
  estado.campoConError = null;
  estado.ocupado = true;
  pintar();

  try {
    const respuesta = await entrarConGoogle({ credencial });

    if (respuesta.necesitaCodigo) {
      // Google autentica, no registra: falta saber de qué academia es.
      estado.google = { pase: respuesta.pase, perfil: respuesta.perfil };
      estado.modo = 'completar';
      estado.ocupado = false;
      pintar();
      document.getElementById('codigoAcademia')?.focus();
      return;
    }

    establecerSesion(respuesta.usuario);
    irADestino();
  } catch (error) {
    mostrarProblema({ campo: 'correo', mensaje: error.message });
  }
}

async function accionCompletar(datos) {
  if (!String(datos.codigoAcademia ?? '').trim()) {
    return mostrarProblema({ campo: 'codigoAcademia', mensaje: 'Escribe el código que te dio tu academia.' });
  }
  if (!datos.anioNacimiento) {
    return mostrarProblema({ campo: 'anioNacimiento', mensaje: 'Escribe tu año de nacimiento.' });
  }
  if (datos.terminos !== true) {
    return mostrarProblema({ campo: 'terminos', mensaje: 'Tienes que aceptar los términos y la política de privacidad.' });
  }

  estado.error = null;
  estado.ocupado = true;
  pintar();

  try {
    const usuario = await completarConGoogle({
      pase: estado.google.pase,
      codigoAcademia: datos.codigoAcademia,
      anioNacimiento: Number(datos.anioNacimiento),
      aceptaTerminos: true,
      permisoApoderado: datos.apoderado === true,
    });
    establecerSesion(usuario);
    irADestino();
  } catch (error) {
    mostrarProblema({ campo: 'codigoAcademia', mensaje: error.message });
  }
}

function formularioCompletar() {
  return [
    el('p', { clase: 'entrar__nota' }, [
      el('strong', { texto: `Hola, ${estado.google.perfil.nombre}. ` }),
      el('span', { texto: 'Tu cuenta de Google está lista. Falta saber de qué academia eres.' }),
    ]),
    campo({
      nombre: 'codigoAcademia',
      etiqueta: 'Código de tu academia',
      autocapitalize: 'characters',
      maxlength: 32,
      ayuda: 'Te lo da tu profesor. Entrar con Google no salta este paso.',
    }),
    campo({
      nombre: 'anioNacimiento',
      etiqueta: 'Año de nacimiento',
      tipo: 'number',
      min: 1930,
      max: ANIO,
      ayuda: 'Solo el año, para saber si necesitas permiso de un apoderado.',
    }),
    casilla('apoderado', 'Si soy menor de 18, tengo permiso de mi padre, madre o apoderado.'),
    casilla('terminos', 'Acepto los términos de uso y la política de privacidad.', {
      texto: 'Leerlos', href: '#/terminos',
    }),
    el('button', {
      clase: 'boton boton--ancho',
      type: 'submit',
      texto: estado.ocupado ? 'Creando…' : 'Entrar a mi academia',
      attrs: { disabled: estado.ocupado, 'aria-busy': estado.ocupado ? 'true' : null },
    }),
    el('div', { clase: 'entrar__enlaces' }, [
      el('button', {
        clase: 'enlace',
        type: 'button',
        texto: 'Usar otra cuenta',
        on: { click: () => { estado.google = null; cambiarModo('entrar'); } },
      }),
    ]),
  ];
}

function formularioEntrar() {
  return [
    zonaGoogle(),
    campo({ nombre: 'correo', etiqueta: 'Correo', tipo: 'email', autocomplete: 'email' }),
    campo({
      nombre: 'clave',
      etiqueta: 'Contraseña',
      tipo: 'password',
      autocomplete: 'current-password',
    }),
    el('button', {
      clase: 'boton boton--ancho',
      type: 'submit',
      texto: estado.ocupado ? 'Entrando…' : 'Entrar',
      attrs: { disabled: estado.ocupado },
    }),
    el('div', { clase: 'entrar__enlaces' }, [
      el('button', {
        clase: 'enlace',
        type: 'button',
        texto: 'Olvidé mi contraseña',
        on: { click: () => cambiarModo('recuperar') },
      }),
      el('button', {
        clase: 'enlace',
        type: 'button',
        texto: 'Crear una cuenta',
        on: { click: () => cambiarModo('registrar') },
      }),
    ]),
  ];
}

function formularioRegistrar() {
  return [
    zonaGoogle(),
    campo({
      nombre: 'codigoAcademia',
      etiqueta: 'Código de tu academia',
      autocapitalize: 'characters',
      maxlength: 32,
      ayuda: 'Te lo da tu profesor. Sin él no se puede crear la cuenta.',
    }),
    campo({ nombre: 'nombre', etiqueta: 'Nombre', autocomplete: 'given-name', maxlength: 80 }),
    campo({ nombre: 'correo', etiqueta: 'Correo', tipo: 'email', autocomplete: 'email' }),
    campo({
      nombre: 'clave',
      etiqueta: 'Contraseña',
      tipo: 'password',
      autocomplete: 'new-password',
      ayuda: 'Mínimo 8 caracteres.',
    }),
    campo({
      nombre: 'claveRepetida',
      etiqueta: 'Repite la contraseña',
      tipo: 'password',
      autocomplete: 'new-password',
    }),
    campo({
      nombre: 'anioNacimiento',
      etiqueta: 'Año de nacimiento',
      tipo: 'number',
      min: 1930,
      max: ANIO,
      ayuda: 'Solo el año. Lo pedimos para saber si necesitas permiso de un apoderado.',
    }),
    casilla('apoderado', 'Si soy menor de 18, tengo permiso de mi padre, madre o apoderado.'),
    casilla('terminos', 'Acepto los términos de uso y la política de privacidad.', {
      texto: 'Leerlos',
      href: '#/terminos',
    }),
    el('button', {
      clase: 'boton boton--ancho',
      type: 'submit',
      texto: estado.ocupado ? 'Creando…' : 'Crear cuenta',
      attrs: { disabled: estado.ocupado },
    }),
    el('div', { clase: 'entrar__enlaces' }, [
      el('button', {
        clase: 'enlace',
        type: 'button',
        texto: 'Ya tengo cuenta',
        on: { click: () => cambiarModo('entrar') },
      }),
    ]),
  ];
}

function formularioRecuperar() {
  return [
    el('p', {
      clase: 'entrar__nota',
      texto: 'Escribe tu correo y te mandamos un enlace para cambiar la contraseña.',
    }),
    campo({ nombre: 'correo', etiqueta: 'Correo', tipo: 'email', autocomplete: 'email' }),
    el('button', {
      clase: 'boton boton--ancho',
      type: 'submit',
      texto: estado.ocupado ? 'Enviando…' : 'Enviar enlace',
      attrs: { disabled: estado.ocupado },
    }),
    el('div', { clase: 'entrar__enlaces' }, [
      el('button', {
        clase: 'enlace',
        type: 'button',
        texto: 'Volver a entrar',
        on: { click: () => cambiarModo('entrar') },
      }),
    ]),
  ];
}

const TITULOS = {
  entrar: 'Entra a tu cuenta',
  registrar: 'Crea tu cuenta',
  recuperar: 'Recupera tu contraseña',
  completar: 'Un paso más',
};
const CAMPOS = {
  entrar: formularioEntrar,
  registrar: formularioRegistrar,
  recuperar: formularioRecuperar,
  completar: formularioCompletar,
};
const ACCIONES = {
  entrar: accionEntrar,
  registrar: accionRegistrar,
  recuperar: accionRecuperar,
  completar: accionCompletar,
};

function pintar() {
  const formulario = el(
    'form',
    {
      clase: 'entrar__forma',
      attrs: { novalidate: true },
      on: {
        submit: (evento) => {
          evento.preventDefault();
          // Se lee TODO aquí, antes de que pintar() reemplace los inputs.
          const datos = leerFormulario(evento.target);
          estado.valores = { ...estado.valores, ...datos };
          ACCIONES[estado.modo](datos);
        },
        // Mantiene el estado al día mientras se escribe, por si algo redibuja.
        input: (evento) => {
          const { name, type, value, checked } = evento.target;
          if (name) estado.valores[name] = type === 'checkbox' ? checked : value;
        },
      },
    },
    [
      estado.error &&
        el('p', { clase: 'mensaje mensaje--error', texto: estado.error, attrs: { role: 'alert' } }),
      estado.aviso &&
        el('p', { clase: 'mensaje mensaje--aviso', texto: estado.aviso, attrs: { role: 'status' } }),
      ...CAMPOS[estado.modo](),
    ],
  );

  montar(
    estado.raiz,
    el('div', { clase: 'entrar envoltura' }, [
      el('header', { clase: 'entrar__cabecera' }, [
        el('p', { clase: 'entrar__marca' }, [marcaUmbral(), el('span', { texto: 'Umbral' })]),
        el('h1', { clase: 'entrar__titulo', texto: TITULOS[estado.modo] }),
      ]),
      formulario,
      el('div', { clase: 'entrar__demo' }, [
        el('p', { texto: `Cuenta de prueba: ${CUENTA_DEMO.correo} / ${CUENTA_DEMO.clave}` }),
        estado.modo === 'registrar' &&
          el('p', { texto: `Código de academia para probar: ${CODIGOS_DEMO.alumno}` }),
      ]),
    ]),
  );
}

/** @param {{ volver?: string }} params */
export async function render(params) {
  Object.assign(estado, {
    raiz: el('div'),
    volver: params.volver ?? 'meta',
    modo: 'entrar',
    error: null,
    campoConError: null,
    aviso: null,
    ocupado: false,
    valores: {},
  });
  pintar();
  document.getElementById('correo')?.focus();
  return estado.raiz;
}
