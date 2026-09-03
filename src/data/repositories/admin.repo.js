/**
 * Repositorio de administración.
 *
 * Cada llamada manda el token. La autorización no se guarda en memoria del
 * cliente: se comprueba en el servidor, en cada acción, sin excepción.
 */

import { pedir } from '../client.js';

const token = () => localStorage.getItem('umbral:sesion');

const conToken = (recurso, datos = {}) => pedir(recurso, { ...datos, token: token() });

export const panel = () => conToken('admin/panel');
export const crearPregunta = (datos) => conToken('admin/pregunta/crear', datos);
export const editarPregunta = (datos) => conToken('admin/pregunta/editar', datos);
export const crearMaterial = (datos) => conToken('admin/material/crear', datos);
export const publicar = (id, publicado) => conToken('admin/publicar', { id, publicado });
export const archivar = (id) => conToken('admin/archivar', { id });
export const restaurar = (id) => conToken('admin/restaurar', { id });
export const reordenar = (ids) => conToken('admin/reordenar', { ids });
