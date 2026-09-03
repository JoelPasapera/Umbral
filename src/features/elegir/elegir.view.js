/**
 * Elegir meta.
 *
 * Cambiar de carrera no es cosmético: los pesos por curso cambian, y con ellos
 * el índice entero. Trigonometría vale nueve puntos del examen en Ingeniería de
 * Sistemas y no entra en Derecho. Por eso la pantalla avisa de que el
 * diagnóstico se recalcula, en vez de cambiarlo en silencio.
 */

import { el, montar } from '../../core/dom.js';
import { catalogo, elegir, metaActiva } from '../../data/repositories/goal.repo.js';
import { invalidar as invalidarBiblioteca } from '../../data/repositories/library.repo.js';
import { estadoVacio } from '../../ui/components/estado.js';

const estado = { raiz: null, lista: [], actual: null, universidad: null, error: null, guardando: false };

const ETIQUETA_AREA = {
  ciencias: 'Ciencias e ingeniería',
  salud: 'Ciencias de la salud',
  letras: 'Humanidades y sociales',
};

function tarjetaUniversidad(u) {
  const seleccionada = estado.universidad === u.id;
  return el('li', {}, [
    el('button', {
      clase: ['uni', seleccionada && 'uni--activa'],
      type: 'button',
      attrs: { 'aria-expanded': seleccionada ? 'true' : 'false' },
      on: {
        click: () => {
          estado.universidad = seleccionada ? null : u.id;
          estado.error = null;
          pintar();
        },
      },
    }, [
      el('div', { clase: 'uni__grupo' }, [
        el('span', { clase: 'uni__sigla', texto: u.sigla }),
        el('span', { clase: 'uni__nombre', texto: u.nombre }),
        el('span', { clase: 'uni__meta', texto: `${u.ciudad} · examen en ${u.dias} días` }),
      ]),
      el('span', { clase: 'uni__conteo', texto: `${u.carreras.length} carreras` }),
    ]),
    seleccionada &&
      el('ul', { clase: 'carreras' }, u.carreras.map((c) => tarjetaCarrera(u, c))),
  ]);
}

function tarjetaCarrera(u, c) {
  const esActual = estado.actual?.universidadId === u.id && estado.actual?.carreraId === c.id;

  return el('li', {}, [
    el('button', {
      clase: ['carrera', esActual && 'carrera--actual'],
      type: 'button',
      attrs: { disabled: estado.guardando || esActual },
      on: { click: () => guardar(u.id, c.id) },
    }, [
      el('div', { clase: 'carrera__grupo' }, [
        el('span', { clase: 'carrera__nombre', texto: c.nombre }),
        el('span', { clase: 'carrera__area', texto: ETIQUETA_AREA[c.area] ?? c.area }),
      ]),
      el('div', { clase: 'carrera__cifras' }, [
        el('span', { clase: 'carrera__corte', texto: String(c.corte) }),
        el('span', { clase: 'carrera__corte-t', texto: 'corte' }),
      ]),
      esActual && el('span', { clase: 'carrera__marca', texto: 'Tu meta' }),
    ]),
  ]);
}

async function guardar(universidadId, carreraId) {
  estado.guardando = true;
  estado.error = null;
  pintar();
  try {
    await elegir({ universidadId, carreraId });
    invalidarBiblioteca();
    window.location.hash = '#/meta';
  } catch (error) {
    estado.error = error.message;
    estado.guardando = false;
    pintar();
  }
}

function pintar() {
  montar(
    estado.raiz,
    el('div', { clase: 'elegir envoltura' }, [
      el('header', { clase: 'elegir__cabecera' }, [
        el('h1', { clase: 'elegir__titulo', texto: 'Elige tu meta' }),
        el('p', {
          clase: 'elegir__nota',
          texto:
            'Cada carrera pesa los cursos de forma distinta, así que al cambiarla se recalcula tu preparación. Tus respuestas no se pierden.',
        }),
      ]),
      estado.error &&
        el('p', { clase: 'mensaje mensaje--error', texto: estado.error, attrs: { role: 'alert' } }),
      estado.guardando && el('p', { clase: 'elegir__nota', texto: 'Guardando…' }),
      el('ul', { clase: 'unis' }, estado.lista.map(tarjetaUniversidad)),
      el('p', {
        clase: 'elegir__fuente',
        texto: 'Los puntajes de corte son del último proceso conocido de cada carrera y cambian cada año.',
      }),
    ]),
  );
}

export async function render() {
  estado.raiz = el('div');
  estado.error = null;
  estado.guardando = false;

  try {
    const [lista, actual] = await Promise.all([catalogo(), metaActiva().catch(() => null)]);
    estado.lista = lista;
    estado.actual = actual && { universidadId: actual.universidadId, carreraId: actual.carreraId };
    estado.universidad = estado.actual?.universidadId ?? null;
  } catch (error) {
    montar(
      estado.raiz,
      estadoVacio({
        titulo: 'No se pudo cargar el catálogo',
        cuerpo: error.message,
        accion: { texto: 'Volver a mi meta', href: '#/meta' },
      }),
    );
    return estado.raiz;
  }

  pintar();
  return estado.raiz;
}
