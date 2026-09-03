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
import { entrar, registrar, recuperar } from '../../data/repositories/auth.repo.js';
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

  return el('div', { clase: 'campo' }, [
    el('label', { clase: 'campo__etiqueta', texto: etiqueta, attrs: { for: nombre } }),
    control,
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

function formularioEntrar() {
  return [
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
};
const CAMPOS = {
  entrar: formularioEntrar,
  registrar: formularioRegistrar,
  recuperar: formularioRecuperar,
};
const ACCIONES = {
  entrar: accionEntrar,
  registrar: accionRegistrar,
  recuperar: accionRecuperar,
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
      el('p', { clase: 'entrar__demo' }, [
        el('span', { texto: `Cuenta de prueba: ${CUENTA_DEMO.correo} / ${CUENTA_DEMO.clave}` }),
        estado.modo === 'registrar' &&
          el('span', { texto: ` · Código de academia: ${CODIGOS_DEMO.alumno}` }),
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
