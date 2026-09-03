/**
 * Repositorio de práctica.
 *
 * El contrato importante: `iniciar` devuelve preguntas sin respuesta correcta.
 * El veredicto solo llega tras `responder`. La vista no puede hacer trampa
 * aunque quisiera, porque nunca tiene el dato.
 */

import { pedir } from '../client.js';
import { leer } from '../../core/store.js';

const usuario = () => leer().sesion?.id ?? 'u-1';

/** @returns {Promise<import('../../domain/readiness.js').Intento[]>} */
export async function intentos() {
  return pedir('practica/intentos');
}

/**
 * @param {string} cursoId
 * @returns {Promise<{titulo:string, detalle:string, preguntas:number, minutos:number}>}
 */
export async function siguienteTarea(cursoId) {
  return pedir('practica/siguiente', { cursoId });
}

/**
 * @param {{ cursoId?: string, modo?: string }} params
 * @returns {Promise<{sesionId:string, total:number, preguntas:object[]}>}
 */
export async function iniciar(params) {
  return pedir('practica/iniciar', { ...params, usuarioId: usuario() });
}

/** Estado del reto de hoy: si está hecho, con qué resultado, y la racha. */
export async function retoDeHoy() {
  return pedir('reto/estado', { usuarioId: usuario() });
}

/**
 * @param {{ sesionId:string, preguntaId:string, opcion:number, segundos:number }} params
 * @returns {Promise<{acerto:boolean, correcta:number, explicacion:string}>}
 */
export async function responder(params) {
  return pedir('practica/responder', params);
}

/**
 * @param {string} sesionId
 * @returns {Promise<{aciertos:number, total:number, segundos:number}>}
 */
export async function cerrar(sesionId) {
  return pedir('practica/cerrar', { sesionId });
}
