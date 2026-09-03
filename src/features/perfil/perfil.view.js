/**
 * Perfil. Quién eres, qué preparas y cómo te vas.
 *
 * El botón de administración solo aparece si el servidor lo confirma en esta
 * misma visita, no porque quedara un booleano guardado de antes.
 */

import { el } from '../../core/dom.js';
import { leer } from '../../core/store.js';
import { sesion, cerrarSesion } from '../../core/sesion.js';
import { esAdmin } from '../../data/repositories/auth.repo.js';
import { metaActiva } from '../../data/repositories/goal.repo.js';
import { diasHasta } from '../../domain/readiness.js';
import { intentos } from '../../data/repositories/practice.repo.js';

/**
 * Criterio 13.2: la persona puede llevarse sus datos.
 *
 * Se arma en el navegador con lo que la aplicación ya tiene, en JSON legible.
 * No hay que pedirlo por correo ni esperar a nadie.
 */
async function descargarDatos() {
  const usuario = await sesion();
  const historial = await intentos().catch(() => []);
  const meta = await metaActiva().catch(() => null);

  const paquete = {
    generado: new Date().toISOString(),
    cuenta: usuario,
    meta: meta && { carrera: meta.carrera, universidad: meta.universidad, fecha: meta.fecha },
    respuestas: historial.map((i) => ({
      curso: i.cursoId,
      tema: i.temaId,
      acerto: i.acerto,
      fecha: new Date(i.fecha).toISOString(),
    })),
  };

  const enlace = el('a', {
    attrs: {
      href: URL.createObjectURL(new Blob([JSON.stringify(paquete, null, 2)], { type: 'application/json' })),
      download: `umbral-mis-datos-${new Date().toISOString().slice(0, 10)}.json`,
    },
  });
  document.body.append(enlace);
  enlace.click();
  URL.revokeObjectURL(enlace.href);
  enlace.remove();
}

const ETIQUETA_ROL = { alumno: 'Alumno', profesor: 'Profesor', dueno: 'Coordinación' };

function dato(etiqueta, valor) {
  return el('div', { clase: 'dato' }, [
    el('span', { clase: 'dato__etiqueta', texto: etiqueta }),
    el('span', { clase: 'dato__valor', texto: valor }),
  ]);
}

export async function render() {
  const usuario = await sesion();
  const meta = await metaActiva().catch(() => null);
  const preparacion = leer().preparacion;
  const administrador = await esAdmin();

  const nodos = [
    el('header', { clase: 'perfil__cabecera' }, [
      el('h1', { clase: 'perfil__nombre', texto: usuario?.nombre ?? 'Tu cuenta' }),
      el('p', { clase: 'perfil__correo', texto: usuario?.correo ?? '' }),
      usuario?.academia &&
        el('p', { clase: 'perfil__academia' }, [
          el('span', { clase: 'perfil__insignia', texto: ETIQUETA_ROL[usuario.rol] ?? usuario.rol }),
          el('span', { texto: usuario.academia }),
        ]),
    ]),
  ];

  if (meta) {
    nodos.push(
      el('section', { clase: 'perfil__bloque' }, [
        el('h2', { clase: 'perfil__titulo', texto: 'Tu meta' }),
        dato('Carrera', meta.carrera),
        dato('Universidad', meta.universidad),
        dato('Faltan', `${diasHasta(meta.fecha, Date.now())} días`),
        preparacion?.indice != null &&
          dato('Preparación', `${Math.round(preparacion.indice)} de 100`),
      ]),
    );
  }

  nodos.push(
    el('section', { clase: 'perfil__bloque' }, [
      el('h2', { clase: 'perfil__titulo', texto: 'Tus datos' }),
      el('p', {
        clase: 'perfil__nota',
        texto:
          'Guardamos tu correo, tu nombre, tu año de nacimiento y tus respuestas de práctica. Nada más.',
      }),
      el('div', { clase: 'perfil__acciones' }, [
      el('button', {
        clase: 'enlace',
        type: 'button',
        texto: 'Descargar mis datos',
        on: { click: descargarDatos },
      }),
      el('a', { clase: 'enlace', texto: 'Términos y privacidad', attrs: { href: '#/terminos' } }),
      ]),
    ]),
  );

  if (administrador) {
    nodos.push(
      el('section', { clase: 'perfil__bloque' }, [
        el('h2', { clase: 'perfil__titulo', texto: 'Administración' }),
        el('a', { clase: 'boton boton--secundario', texto: 'Abrir panel', attrs: { href: '#/admin' } }),
      ]),
    );
  }

  nodos.push(
    el('button', {
      clase: 'boton boton--secundario boton--ancho',
      type: 'button',
      texto: 'Cerrar sesión',
      on: { click: cerrarSesion },
    }),
  );

  return el('div', { clase: 'perfil envoltura' }, nodos);
}
