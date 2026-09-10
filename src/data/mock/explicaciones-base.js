/**
 * Explicaciones de fallo del banco base.
 *
 * Contenido, no maquinaria: la maquinaria está en `explicaciones.js`. Están
 * aquí aparte porque cambian por motivos distintos —estas las corrige un
 * profesor, aquella la corrige un programador— y porque el día que el banco
 * base se sirva desde la base de datos, este archivo se convierte en una
 * migración y el otro no se toca.
 *
 * Cada entrada responde a una sola cosa: **por qué esa alternativa concreta
 * resultaba tentadora y dónde se rompe el razonamiento que lleva a ella**. No
 * repiten la solución del ejercicio: esa ya la da la explicación general de la
 * pregunta, y el alumno la tiene delante en la misma pantalla.
 *
 * No están todas. Faltan las alternativas cuyo error de origen no es
 * inequívoco, y ahí una explicación inventada sería peor que ninguna: el
 * alumno se llevaría un diagnóstico falso de su propio error. Cuando no hay
 * entrada, la pantalla enseña lo de siempre y no promete nada. Completarlas es
 * trabajo de profesor, pregunta a pregunta.
 */

/** @type {{ preguntaId:string, opcion:number, texto:string }[]} */
export const EXPLICACIONES_BASE = [
  /* trig-001 · $\sin^4 x - \cos^4 x + 1$ · correcta: $2\sin^2 x$ */
  {
    preguntaId: 'trig-001',
    opcion: 1,
    texto:
      'Factorizaste bien, pero invertiste el orden de la diferencia de cuadrados: escribiste $(\\cos^2 x - \\sin^2 x)$ cuando el enunciado resta en el otro sentido. Con ese cambio de signo el 1 se junta con $-\\sin^2 x$ y sale $2\\cos^2 x$. Fíjate en cuál de los dos términos aparece primero antes de factorizar.',
  },
  {
    preguntaId: 'trig-001',
    opcion: 2,
    texto:
      'Diste por hecho que $\\sin^4 x$ y $\\cos^4 x$ se cancelan, y entonces solo queda el 1. Se cancelan las **segundas** potencias cuando se suman, no las cuartas cuando se restan: $\\sin^2 x + \\cos^2 x = 1$ es la identidad, y aquí no la tienes.',
  },
  {
    preguntaId: 'trig-001',
    opcion: 3,
    texto:
      'Reconociste que aparece un ángulo doble, pero elegiste el que no era. $\\sin^2 x - \\cos^2 x$ es $-\\cos 2x$, no $\\sin 2x$; el seno del ángulo doble es $2\\sin x\\cos x$ y aquí no hay ningún producto de seno por coseno.',
  },

  /* trig-002 · $\sin x + \cos x = \sqrt{2}$ · correcta: $\tfrac{1}{2}$ */
  {
    preguntaId: 'trig-002',
    opcion: 1,
    texto:
      'Llegaste hasta $2\\sin x\\cos x = 1$, que está bien, y ahí te detuviste. Ese 1 es el valor del **doble** del producto. La pregunta pide $\\sin x\\cos x$ a secas, así que todavía falta dividir entre dos.',
  },
  {
    preguntaId: 'trig-002',
    opcion: 2,
    texto:
      'Para que el producto sea 0 haría falta que uno de los dos valiera 0, y entonces el otro tendría que valer $\\sqrt{2}$ él solo. Eso es imposible: ni el seno ni el coseno pasan nunca de 1.',
  },
  {
    preguntaId: 'trig-002',
    opcion: 3,
    texto:
      'Dedujiste bien que aquí $\\sin x$ y $\\cos x$ valen los dos $\\tfrac{\\sqrt{2}}{2}$, y ese razonamiento es correcto. Lo que pasa es que respondiste con el valor de cada uno en vez de con su producto: multiplícalos entre sí y verás que da otra cosa.',
  },

  /* trig-004 · $\tan x = \tfrac{3}{4}$ · correcta: $\tfrac{3}{5}$ */
  {
    preguntaId: 'trig-004',
    opcion: 1,
    texto:
      'Armaste bien el triángulo 3-4-5, pero cambiaste los catetos de sitio: $\\tfrac{4}{5}$ es adyacente entre hipotenusa, o sea el coseno. El seno usa el cateto **opuesto**, que aquí es 3.',
  },
  {
    preguntaId: 'trig-004',
    opcion: 2,
    texto:
      'Ese $\\tfrac{5}{3}$ es la hipotenusa entre el cateto opuesto, es decir la cosecante: tienes el seno dado la vuelta. El seno nunca puede pasar de 1, así que cualquier resultado mayor que 1 se descarta sin calcular nada.',
  },
  {
    preguntaId: 'trig-004',
    opcion: 3,
    texto:
      'Repetiste el dato del enunciado: $\\tfrac{3}{4}$ es la tangente que te dan, no el seno que te piden. La tangente relaciona los dos catetos entre sí; para el seno hace falta la hipotenusa, y por eso hay que calcularla antes.',
  },

  /* trig-005 · $\sin(90^\circ - x) + \cos(180^\circ - x)$ · correcta: $0$ */
  {
    preguntaId: 'trig-005',
    opcion: 1,
    texto:
      'Convertiste bien las dos razones, pero te comiste el signo de la segunda: $\\cos(180^\\circ - x)$ es $-\\cos x$, no $+\\cos x$. Con el signo correcto los dos términos se cancelan en vez de sumarse y no queda $2\\cos x$.',
  },

  /* trig-006 · $\sin^2 20^\circ + \sin^2 70^\circ$ · correcta: $1$ */
  {
    preguntaId: 'trig-006',
    opcion: 1,
    texto:
      'Viste que la identidad pitagórica encaja aquí, y encaja. Pero solo se aplica una vez: la suma entera vale 1, no 1 por cada sumando. Al convertir $\\sin 70^\\circ$ en $\\cos 20^\\circ$ te queda una sola pareja, no dos.',
  },

  /* trig-007 · $\sec x - \tan x = 3$ · correcta: $\tfrac{1}{3}$ */
  {
    preguntaId: 'trig-007',
    opcion: 1,
    texto:
      'Supusiste que las dos expresiones valen lo mismo, y solo lo harían si $\\tan x$ fuese 0. Lo que las relaciona es que su producto vale 1, así que una es la inversa de la otra: si una vale 3, la otra no puede valer 3 también.',
  },
  {
    preguntaId: 'trig-007',
    opcion: 2,
    texto:
      'Elevaste el 3 al cuadrado. La identidad $\\sec^2 x - \\tan^2 x = 1$ tiene los cuadrados **antes** de factorizar; una vez factorizada en dos binomios, lo que hay entre ellos es un producto que vale 1, y ahí ya no se eleva nada.',
  },
  {
    preguntaId: 'trig-007',
    opcion: 3,
    texto:
      'Hiciste dos cosas a la vez: invertir y elevar al cuadrado. Solo hace falta invertir. El producto de los dos binomios es 1, así que el segundo factor es $\\tfrac{1}{3}$ y ahí se acaba el ejercicio.',
  },

  /* trig-008 · $\dfrac{\sin x}{1+\cos x} + \dfrac{1+\cos x}{\sin x}$ · correcta: $2\csc x$ */
  {
    preguntaId: 'trig-008',
    opcion: 1,
    texto:
      'Llegaste a la forma correcta pero cambiaste la razón inversa: lo que queda en el denominador es $\\sin x$, y el inverso del seno es la cosecante. La secante es el inverso del coseno, que aquí ya se canceló.',
  },
  {
    preguntaId: 'trig-008',
    opcion: 2,
    texto:
      'Cancelaste $(1 + \\cos x)$ correctamente, pero también te llevaste por delante el 2 que lo acompañaba. El numerador era $2(1 + \\cos x)$: al cancelar el paréntesis el 2 se queda, y por eso el resultado lleva factor 2.',
  },
  {
    preguntaId: 'trig-008',
    opcion: 3,
    texto:
      'Te quedaste con el numerador y soltaste el denominador. Después de cancelar $(1 + \\cos x)$ sigue habiendo un $\\sin x$ dividiendo, así que el resultado no puede ser un número suelto: tiene que depender de $x$.',
  },

  /* fis-001 · $v_0 = 0$, $a = 4$, $t = 5$ · correcta: $50$ m */
  {
    preguntaId: 'fis-001',
    opcion: 1,
    texto:
      'Multiplicaste la aceleración por el tiempo: $4 \\times 5 = 20$. Eso es la velocidad que lleva el móvil al final, en m/s, no la distancia que recorrió. Son magnitudes distintas y por eso las unidades del enunciado no cuadran con ese resultado.',
  },
  {
    preguntaId: 'fis-001',
    opcion: 2,
    texto:
      'Usaste $a t^2 = 4 \\times 25 = 100$ y te saltaste el $\\tfrac{1}{2}$ de la fórmula. Ese medio no es un adorno: aparece porque la velocidad va creciendo desde cero, así que la distancia real es la mitad de la que recorrería yendo todo el rato a la velocidad final.',
  },

  /* geo-001 · ángulos $48^\circ$ y $67^\circ$ · correcta: $115^\circ$ */
  {
    preguntaId: 'geo-001',
    opcion: 1,
    texto:
      'Calculaste bien el tercer ángulo interior: $180^\\circ - 48^\\circ - 67^\\circ = 65^\\circ$. Pero la pregunta pide el **exterior** adyacente a ese, que es su suplemento, no él mismo. Te faltó el último paso.',
  },
  {
    preguntaId: 'geo-001',
    opcion: 3,
    texto:
      'Sacaste el suplemento del ángulo equivocado: $180^\\circ - 67^\\circ = 113^\\circ$ es el exterior adyacente al de $67^\\circ$. El enunciado pide el que está pegado al **tercer** ángulo, el que no te dan y hay que calcular primero.',
  },
];
