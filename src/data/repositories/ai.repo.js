/**
 * Repositorio de generación.
 *
 * La vista nunca sabe qué modelo hay detrás, ni cuánto cuesta, ni dónde está
 * la clave. Manda material y recibe borradores ya filtrados.
 */

import { pedir } from '../client.js';

const token = () => localStorage.getItem('umbral:sesion');

const conToken = (recurso, datos = {}) => pedir(recurso, { ...datos, token: token() });

/** @param {{ material:string, cursoId:string, temaId:string, cantidad?:number }} datos */
export const generar = (datos) => conToken('ia/generar', datos);

export const borradores = () => conToken('ia/cola');

/** @param {string} id @param {'aprobar'|'descartar'} decision @param {object} [cambios] */
export const decidir = (id, decision, cambios) => conToken('ia/decidir', { id, decision, cambios });

export const presupuesto = () => conToken('ia/presupuesto');
