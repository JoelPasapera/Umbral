/**
 * Banco de Habilidad matemática.
 *
 * Cubre los veintinueve temas del curso con dos preguntas cada uno. Es el
 * curso que más pesa en el examen y el que aparece en todas las áreas.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * SOBRE LAS FIGURAS
 *
 * Siete temas suelen venir con un dibujo en el examen: rotación y traslación,
 * trazo de figuras, conteo de figuras, simetría, visualización espacial,
 * cerillos, y tablas y gráficos. Aquí cada uno se evalúa con la MISMA regla
 * pero sin depender del dibujo: una rotación con coordenadas, el trazo con la
 * regla de los vértices impares, el conteo en un tablero descrito con
 * palabras. Enseñan lo que hay detrás de la figura.
 *
 * Lo que no enseñan es a leer la figura, que es una destreza aparte. Para eso
 * las preguntas necesitan poder llevar una imagen, y hoy el modelo de pregunta
 * solo admite texto y fórmulas. Está anotado como mejora pendiente.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Mismas reglas que los demás bancos: respuesta repartida, tema real del
 * temario, distractores que son errores de verdad, y un solucionario que
 * `pruebas/habilidad-matematica.test.mjs` recalcula —con simulaciones,
 * búsquedas exhaustivas y enumeración de modelos lógicos— exigiendo que la
 * clave sea la única alternativa correcta.
 */

/** @type {object[]} */
export const HABILIDAD_MATEMATICA = [
  /* ── Máximos y mínimos ──────────────────────────────────────────────── */
  {
    id: 'hm-101', temaId: 'hm-cantidad-1', dificultad: 0.4,
    enunciado: 'Con 40 m de cerca se quiere encerrar un terreno rectangular. ¿Cuál es el área máxima posible, en metros cuadrados?',
    opciones: ['$96$', '$84$', '$400$', '$100$'],
    correcta: 3,
    explicacion: 'Los lados suman 20, la mitad del perímetro. Con lados $a$ y $20 - a$, el área $a(20 - a)$ es máxima cuando los lados son iguales: un cuadrado de 10 por 10, con área 100. Entre todos los rectángulos de igual perímetro, el cuadrado encierra más.',
  },
  {
    id: 'hm-102', temaId: 'hm-cantidad-1', dificultad: 0.3,
    enunciado: 'Dos números positivos suman 12. ¿Cuál es el mayor valor que puede tomar su producto?',
    opciones: ['$36$', '$32$', '$35$', '$24$'],
    correcta: 0,
    explicacion: 'Con suma fija, el producto es máximo cuando los números son iguales: $6 \\cdot 6 = 36$. Si se separan, baja: $5 \\cdot 7 = 35$ y $4 \\cdot 8 = 32$.',
  },

  /* ── Pesadas y balanzas ─────────────────────────────────────────────── */
  {
    id: 'hm-103', temaId: 'hm-cantidad-2', dificultad: 0.55,
    enunciado: 'Hay 9 monedas iguales en apariencia y una pesa más que las demás. Con una balanza de dos platillos, ¿cuántas pesadas hacen falta, como mínimo, para asegurar encontrarla?',
    opciones: ['$3$', '$4$', '$1$', '$2$'],
    correcta: 3,
    explicacion: 'Cada pesada tiene tres resultados —baja un platillo, baja el otro o quedan iguales—, así que puede dividir el grupo en tres. Se pesan 3 contra 3: se sabe en qué grupo de 3 está. Luego 1 contra 1 de ese grupo. Son dos pesadas. Pensar en mitades lleva a 3 o 4.',
  },
  {
    id: 'hm-104', temaId: 'hm-cantidad-2', dificultad: 0.4,
    enunciado: 'Tres manzanas pesan lo mismo que dos peras, y cuatro peras pesan lo mismo que un melón. ¿Cuántas manzanas equilibran dos melones?',
    opciones: ['$12$', '$8$', '$6$', '$24$'],
    correcta: 0,
    explicacion: 'Dos melones son ocho peras. Y como dos peras equivalen a tres manzanas, ocho peras equivalen a $4 \\cdot 3 = 12$ manzanas.',
  },

  /* ── Arreglos numéricos ─────────────────────────────────────────────── */
  {
    id: 'hm-105', temaId: 'hm-cantidad-3', dificultad: 0.35,
    enunciado: 'En un cuadrado mágico de 3 por 3 se colocan los números del 1 al 9 sin repetir. ¿Cuánto suma cada fila?',
    opciones: ['$18$', '$12$', '$45$', '$15$'],
    correcta: 3,
    explicacion: 'Los nueve números suman 45 y se reparten en tres filas que suman lo mismo, así que cada una suma $\\dfrac{45}{3} = 15$. El 45 es el total, no una fila.',
  },
  {
    id: 'hm-106', temaId: 'hm-cantidad-3', dificultad: 0.55,
    enunciado: 'En un cuadrado mágico de 3 por 3 con los números del 1 al 9, ¿qué número ocupa siempre la casilla central?',
    opciones: ['$9$', '$1$', '$4$', '$5$'],
    correcta: 3,
    explicacion: 'La casilla central está en cuatro líneas: su fila, su columna y las dos diagonales. Sumando esas cuatro líneas se obtiene $4 \\cdot 15 = 60$, que es el total, 45, más tres veces el centro. Entonces el centro vale $\\dfrac{60 - 45}{3} = 5$.',
  },

  /* ── Seccionamientos y cortes ───────────────────────────────────────── */
  {
    id: 'hm-107', temaId: 'hm-cantidad-4', dificultad: 0.3,
    enunciado: 'Una varilla de 60 cm se corta en trozos de 6 cm. ¿Cuántos cortes se hacen?',
    opciones: ['$10$', '$9$', '$11$', '$6$'],
    correcta: 1,
    explicacion: 'Salen $\\dfrac{60}{6} = 10$ trozos, pero en una varilla abierta el último trozo no necesita corte: hacen falta 9. Confundir trozos con cortes es la trampa.',
  },
  {
    id: 'hm-108', temaId: 'hm-cantidad-4', dificultad: 0.4,
    enunciado: 'Un aro cerrado de 60 cm se corta en trozos de 6 cm. ¿Cuántos cortes se hacen?',
    opciones: ['$9$', '$10$', '$11$', '$12$'],
    correcta: 1,
    explicacion: 'En una figura cerrada el primer corte solo la abre, sin separar ningún trozo. Por eso hacen falta tantos cortes como trozos: 10. Es justo lo contrario que en una varilla abierta.',
  },

  /* ── Dados y dominó ─────────────────────────────────────────────────── */
  {
    id: 'hm-109', temaId: 'hm-cantidad-5', dificultad: 0.35,
    enunciado: 'En un dado común las caras opuestas suman 7. Si se ven tres caras con los números 1, 2 y 3, ¿cuánto suman las tres caras que no se ven?',
    opciones: ['$21$', '$6$', '$15$', '$12$'],
    correcta: 2,
    explicacion: 'Las seis caras suman $1 + 2 + \\ldots + 6 = 21$. Si las visibles suman 6, las ocultas suman $21 - 6 = 15$. También se ve con las opuestas: 6, 5 y 4.',
  },
  {
    id: 'hm-110', temaId: 'hm-cantidad-5', dificultad: 0.45,
    enunciado: '¿Cuántas fichas tiene un juego de dominó que va del 0 al 6?',
    opciones: ['$49$', '$28$', '$21$', '$36$'],
    correcta: 1,
    explicacion: 'Cada ficha es un par de números del 0 al 6 sin importar el orden: hay 21 fichas con los dos números distintos y 7 dobles. En total, 28. Contar $7 \\cdot 7 = 49$ cuenta dos veces cada ficha no doble.',
  },

  /* ── Calendarios ────────────────────────────────────────────────────── */
  {
    id: 'hm-111', temaId: 'hm-cantidad-6', dificultad: 0.35,
    enunciado: 'Si el 1 de marzo de un año fue lunes, ¿qué día de la semana fue el 1 de abril del mismo año?',
    opciones: ['Miércoles', 'Viernes', 'Jueves', 'Lunes'],
    correcta: 2,
    explicacion: 'Marzo tiene 31 días, que son 4 semanas completas y 3 días más. Del lunes, tres días después es jueves.',
  },
  {
    id: 'hm-112', temaId: 'hm-cantidad-6', dificultad: 0.3,
    enunciado: 'Si hoy es miércoles, ¿qué día de la semana será dentro de 100 días?',
    opciones: ['Jueves', 'Viernes', 'Sábado', 'Miércoles'],
    correcta: 1,
    explicacion: 'Cada 7 días se repite el mismo día. Como $100 = 7 \\cdot 14 + 2$, dentro de 100 días es como dentro de 2: del miércoles, viernes.',
  },

  /* ── Traslados ──────────────────────────────────────────────────────── */
  {
    id: 'hm-113', temaId: 'hm-cantidad-7', dificultad: 0.5,
    enunciado: 'En la Torre de Hanoi con 4 discos, ¿cuál es el número mínimo de movimientos para trasladarlos todos a otra varilla?',
    opciones: ['$16$', '$31$', '$8$', '$15$'],
    correcta: 3,
    explicacion: 'Para mover $n$ discos hay que mover $n - 1$ a un lado, el grande al destino y los $n - 1$ encima: el número se duplica y suma uno. Con 1, 2, 3 y 4 discos salen 1, 3, 7 y 15, o sea $2^{4} - 1$.',
  },
  {
    id: 'hm-114', temaId: 'hm-cantidad-7', dificultad: 0.6,
    enunciado: 'Un hombre debe cruzar un río con un lobo, una cabra y una col. La barca solo lo lleva a él y a una cosa. El lobo no puede quedarse solo con la cabra, ni la cabra con la col. ¿Cuántos cruces hace como mínimo?',
    opciones: ['$5$', '$7$', '$9$', '$6$'],
    correcta: 1,
    explicacion: 'Primero cruza la cabra y vuelve solo. Lleva el lobo y regresa con la cabra. Deja la cabra, lleva la col y vuelve solo. Por último cruza con la cabra. Son siete cruces: la clave es traer de vuelta a la cabra.',
  },

  /* ── Frecuencia de sucesos ──────────────────────────────────────────── */
  {
    id: 'hm-115', temaId: 'hm-cambio-1', dificultad: 0.45,
    enunciado: 'Un reloj da 6 campanadas en 5 segundos. ¿Cuántos segundos tarda en dar 12 campanadas?',
    opciones: ['$10$', '$11$', '$9$', '$12$'],
    correcta: 1,
    explicacion: 'Lo que dura no son las campanadas sino los intervalos entre ellas: 6 campanadas tienen 5 intervalos, de 1 segundo cada uno. Doce campanadas tienen 11 intervalos, así que tardan 11 segundos. La regla de tres directa da 10.',
  },
  {
    id: 'hm-116', temaId: 'hm-cambio-1', dificultad: 0.45,
    enunciado: 'Una persona toma una pastilla cada 8 horas durante 4 días, y toma la primera al empezar. ¿Cuántas pastillas toma en total?',
    opciones: ['$13$', '$12$', '$11$', '$32$'],
    correcta: 0,
    explicacion: 'Cuatro días son 96 horas, que dan $\\dfrac{96}{8} = 12$ intervalos. Como toma una al empezar, son 12 más esa primera: 13. Contar solo los intervalos da 12.',
  },

  /* ── Razonamiento inductivo ─────────────────────────────────────────── */
  {
    id: 'hm-117', temaId: 'hm-cambio-2', dificultad: 0.4,
    enunciado: '¿Cuánto suman los 20 primeros números impares?',
    opciones: ['$441$', '$380$', '$400$', '$210$'],
    correcta: 2,
    explicacion: 'Se ve el patrón: $1 = 1^{2}$, $1 + 3 = 2^{2}$, $1 + 3 + 5 = 3^{2}$. La suma de los $n$ primeros impares es $n^{2}$, así que para 20 es 400. El 210 es la suma de los 20 primeros naturales.',
  },
  {
    id: 'hm-118', temaId: 'hm-cambio-2', dificultad: 0.4,
    enunciado: 'Con palitos se forma una fila de cuadrados unidos por un lado: 1 cuadrado usa 4 palitos, 2 cuadrados usan 7 y 3 cuadrados usan 10. ¿Cuántos palitos hacen falta para 10 cuadrados?',
    opciones: ['$31$', '$40$', '$30$', '$34$'],
    correcta: 0,
    explicacion: 'Cada cuadrado nuevo comparte un lado con el anterior, así que añade 3 palitos: son $3n + 1$. Para 10 cuadrados, 31. Multiplicar $10 \\cdot 4 = 40$ cuenta dos veces los lados compartidos.',
  },

  /* ── Cronometría ────────────────────────────────────────────────────── */
  {
    id: 'hm-119', temaId: 'hm-cambio-3', dificultad: 0.5,
    enunciado: '¿Qué ángulo forman las agujas de un reloj a las 3:30?',
    opciones: ['$90^{\\circ}$', '$60^{\\circ}$', '$105^{\\circ}$', '$75^{\\circ}$'],
    correcta: 3,
    explicacion: 'El minutero está en el 6, a $180^{\\circ}$. El horario no está en el 3: a y media ya avanzó medio tramo, $15^{\\circ}$, así que está en $105^{\\circ}$. La diferencia es $75^{\\circ}$. Dejar el horario en el 3 da $90^{\\circ}$.',
  },
  {
    id: 'hm-120', temaId: 'hm-cambio-3', dificultad: 0.35,
    enunciado: 'Un reloj se adelanta 3 minutos cada hora. Si se pone en hora a las 8:00, ¿qué hora marcará cuando en realidad sean las 12:00?',
    opciones: ['12:03', '12:12', '11:48', '12:15'],
    correcta: 1,
    explicacion: 'Pasan cuatro horas y en cada una se adelanta 3 minutos: 12 minutos en total. Como se adelanta, marca más: las 12:12. Restarlos, 11:48, sería un reloj que se atrasa.',
  },

  /* ── Simbolización y operadores ─────────────────────────────────────── */
  {
    id: 'hm-121', temaId: 'hm-cambio-4', dificultad: 0.35,
    enunciado: 'Se define $a \\ast b = 2a - b$. Calcula $(3 \\ast 1) \\ast 4$.',
    opciones: ['$2$', '$10$', '$6$', '$-2$'],
    correcta: 2,
    explicacion: 'Primero el paréntesis: $3 \\ast 1 = 6 - 1 = 5$. Después $5 \\ast 4 = 10 - 4 = 6$. El orden de los operandos importa: esta operación no es conmutativa.',
  },
  {
    id: 'hm-122', temaId: 'hm-cambio-4', dificultad: 0.3,
    enunciado: 'El triple de un número, disminuido en 8, es igual al número aumentado en 12. ¿Cuál es el número?',
    opciones: ['$5$', '$20$', '$4$', '$10$'],
    correcta: 3,
    explicacion: 'Se traduce: $3x - 8 = x + 12$. Pasando términos, $2x = 20$ y $x = 10$.',
  },

  /* ── Rotación y traslación ──────────────────────────────────────────── */
  {
    id: 'hm-123', temaId: 'hm-forma-1', dificultad: 0.5,
    enunciado: 'El punto $(2, 3)$ se rota $90^{\\circ}$ en sentido antihorario alrededor del origen. ¿Dónde queda?',
    opciones: ['$(3, -2)$', '$(-3, 2)$', '$(2, -3)$', '$(-2, 3)$'],
    correcta: 1,
    explicacion: 'Un giro de $90^{\\circ}$ antihorario lleva $(x, y)$ a $(-y, x)$: el punto pasa de estar arriba a la derecha a estar arriba a la izquierda. Queda en $(-3, 2)$. El giro horario daría $(3, -2)$.',
  },
  {
    id: 'hm-124', temaId: 'hm-forma-1', dificultad: 0.45,
    enunciado: 'El punto $(1, -2)$ se traslada 3 unidades a la derecha y 4 hacia arriba, y después se refleja sobre el eje $X$. ¿Dónde queda?',
    opciones: ['$(-2, 4)$', '$(4, 2)$', '$(-4, 2)$', '$(4, -2)$'],
    correcta: 3,
    explicacion: 'La traslación lo lleva a $(1 + 3, -2 + 4) = (4, 2)$. Reflejar sobre el eje $X$ cambia el signo de la ordenada: $(4, -2)$. Quedarse en la traslación da $(4, 2)$.',
  },

  /* ── Rutas y puntos cardinales ──────────────────────────────────────── */
  {
    id: 'hm-125', temaId: 'hm-forma-2', dificultad: 0.3,
    enunciado: 'Una persona camina 6 km al norte y luego 8 km al este. ¿A qué distancia en línea recta está del punto de partida?',
    opciones: ['$14$', '$10$', '$2$', '$12$'],
    correcta: 1,
    explicacion: 'Los dos tramos forman los catetos de un triángulo rectángulo, y la distancia es la hipotenusa: $\\sqrt{36 + 64} = 10$ km. Sumar los tramos, 14, es lo que caminó, no lo lejos que está.',
  },
  {
    id: 'hm-126', temaId: 'hm-forma-2', dificultad: 0.55,
    enunciado: 'En una cuadrícula de 3 cuadras de ancho por 2 de alto, ¿cuántos caminos mínimos hay desde la esquina inferior izquierda hasta la superior derecha, avanzando solo hacia la derecha o hacia arriba?',
    opciones: ['$6$', '$5$', '$12$', '$10$'],
    correcta: 3,
    explicacion: 'Todo camino mínimo tiene 5 tramos: 3 a la derecha y 2 hacia arriba. Solo cambia en qué orden van, y elegir dónde van los 2 de subida entre 5 posiciones da $\\dbinom{5}{2} = 10$.',
  },

  /* ── Trazo de figuras ───────────────────────────────────────────────── */
  {
    id: 'hm-127', temaId: 'hm-forma-3', dificultad: 0.55,
    enunciado: 'Una figura se puede dibujar de un solo trazo, sin levantar el lápiz ni repasar líneas, si tiene 0 o 2 vértices impares. Si una figura tiene 6 vértices impares, ¿cuántos trazos necesita como mínimo?',
    opciones: ['$2$', '$6$', '$3$', '$1$'],
    correcta: 2,
    explicacion: 'Cada trazo tiene un inicio y un final, y cada uno de esos extremos resuelve un vértice impar. Con 6 impares hacen falta $\\dfrac{6}{2} = 3$ trazos.',
  },
  {
    id: 'hm-128', temaId: 'hm-forma-3', dificultad: 0.5,
    enunciado: '¿Se puede dibujar de un solo trazo el contorno de un cuadrado junto con sus dos diagonales?',
    opciones: [
      'Sí, empezando por una esquina',
      'Sí, empezando por el centro',
      'No: tiene cuatro vértices impares y necesita dos trazos',
      'No: necesita cuatro trazos',
    ],
    correcta: 2,
    explicacion: 'A cada esquina llegan tres líneas —dos lados y una diagonal—, así que las cuatro esquinas son impares. El centro recibe cuatro y es par. Con cuatro impares no hay un solo trazo: hacen falta dos.',
  },

  /* ── Conteo de figuras ──────────────────────────────────────────────── */
  {
    id: 'hm-129', temaId: 'hm-forma-4', dificultad: 0.5,
    enunciado: '¿Cuántos cuadrados, de todos los tamaños, hay en un tablero de 4 por 4?',
    opciones: ['$16$', '$25$', '$20$', '$30$'],
    correcta: 3,
    explicacion: 'Se cuentan por tamaño: 16 de 1 por 1, 9 de 2 por 2, 4 de 3 por 3 y 1 de 4 por 4. En total, $16 + 9 + 4 + 1 = 30$. Contar solo los pequeños da 16.',
  },
  {
    id: 'hm-130', temaId: 'hm-forma-4', dificultad: 0.55,
    enunciado: 'Desde un vértice de un triángulo se trazan 3 segmentos hasta el lado opuesto. ¿Cuántos triángulos hay en total en la figura?',
    opciones: ['$4$', '$6$', '$10$', '$8$'],
    correcta: 2,
    explicacion: 'Del vértice salen 5 líneas: los dos lados y los tres segmentos. Cada par de ellas, con el lado opuesto, forma un triángulo, así que hay $\\dbinom{5}{2} = 10$. Contar solo los cuatro pequeños olvida los formados por varios juntos.',
  },

  /* ── Simetría ───────────────────────────────────────────────────────── */
  {
    id: 'hm-131', temaId: 'hm-forma-5', dificultad: 0.35,
    enunciado: '¿Cuántos ejes de simetría tiene un hexágono regular?',
    opciones: ['$6$', '$12$', '$2$', '$3$'],
    correcta: 0,
    explicacion: 'Un polígono regular de $n$ lados tiene $n$ ejes. En el hexágono son 6: tres pasan por vértices opuestos y tres por los puntos medios de lados opuestos. Contar solo los de vértices da 3.',
  },
  {
    id: 'hm-132', temaId: 'hm-forma-5', dificultad: 0.35,
    enunciado: 'El punto $(5, 2)$ se refleja sobre la recta $y = x$. ¿Dónde queda?',
    opciones: ['$(-5, 2)$', '$(2, 5)$', '$(5, -2)$', '$(-2, -5)$'],
    correcta: 1,
    explicacion: 'Reflejar sobre la recta $y = x$ intercambia las coordenadas: $(5, 2)$ pasa a $(2, 5)$. Reflejar sobre los ejes cambiaría signos, no el orden.',
  },

  /* ── Visualización espacial ─────────────────────────────────────────── */
  {
    id: 'hm-133', temaId: 'hm-forma-6', dificultad: 0.5,
    enunciado: 'Un cubo de 3 cm de arista se pinta por fuera y se corta en cubitos de 1 cm. ¿Cuántos cubitos tienen exactamente dos caras pintadas?',
    opciones: ['$12$', '$6$', '$24$', '$8$'],
    correcta: 0,
    explicacion: 'Los de dos caras están en las aristas sin contar las esquinas. El cubo tiene 12 aristas y en cada una queda un cubito central: 12. Los 8 de las esquinas tienen tres caras pintadas y los 6 del centro de cada cara, una.',
  },
  {
    id: 'hm-134', temaId: 'hm-forma-6', dificultad: 0.4,
    enunciado: '¿Cuántas aristas tiene un prisma de base hexagonal?',
    opciones: ['$12$', '$18$', '$24$', '$15$'],
    correcta: 1,
    explicacion: 'Tiene 6 aristas en cada base y 6 laterales que las unen: $6 + 6 + 6 = 18$. Se comprueba con Euler: 12 vértices y 8 caras dan $12 + 8 - 2 = 18$.',
  },

  /* ── Perímetros y áreas ─────────────────────────────────────────────── */
  {
    id: 'hm-135', temaId: 'hm-forma-7', dificultad: 0.3,
    enunciado: 'Un rectángulo tiene perímetro 30 y uno de sus lados mide 9. ¿Cuál es su área?',
    opciones: ['$54$', '$135$', '$81$', '$45$'],
    correcta: 0,
    explicacion: 'Dos lados distintos suman la mitad del perímetro, 15, así que el otro mide $15 - 9 = 6$. El área es $9 \\cdot 6 = 54$. Restar 9 del perímetro entero da un lado de 21 que no cierra.',
  },
  {
    id: 'hm-136', temaId: 'hm-forma-7', dificultad: 0.4,
    enunciado: '¿Cuál es el área de un círculo cuya longitud de circunferencia es $10\\pi$?',
    opciones: ['$25\\pi$', '$10\\pi$', '$100\\pi$', '$5\\pi$'],
    correcta: 0,
    explicacion: 'De $2\\pi r = 10\\pi$ sale $r = 5$. El área es $\\pi r^{2} = 25\\pi$. Usar el diámetro, 10, en lugar del radio da $100\\pi$.',
  },

  /* ── Ruedas y engranajes ────────────────────────────────────────────── */
  {
    id: 'hm-137', temaId: 'hm-forma-8', dificultad: 0.4,
    enunciado: 'Dos engranajes están conectados: uno tiene 20 dientes y el otro 50. Si el pequeño da 25 vueltas, ¿cuántas da el grande?',
    opciones: ['$62{,}5$', '$25$', '$10$', '$5$'],
    correcta: 2,
    explicacion: 'Los dientes que pasan por el punto de contacto son los mismos en los dos: $20 \\cdot 25 = 50 \\cdot v$, así que $v = 10$. El grande gira menos. Hacerlo al revés da 62,5, más vueltas para el grande.',
  },
  {
    id: 'hm-138', temaId: 'hm-forma-8', dificultad: 0.3,
    enunciado: 'Tres engranajes A, B y C están en línea: A engrana con B, y B con C. Si A gira en sentido horario, ¿en qué sentido gira C?',
    opciones: ['Horario', 'No gira', 'Antihorario', 'Depende de los dientes'],
    correcta: 0,
    explicacion: 'Cada engranaje gira al revés que el que lo mueve. B gira antihorario, y C, al revés que B: horario. Con dos contactos el sentido se invierte dos veces y vuelve al original; el número de dientes no cambia el sentido.',
  },

  /* ── Semejanza ──────────────────────────────────────────────────────── */
  {
    id: 'hm-139', temaId: 'hm-forma-9', dificultad: 0.3,
    enunciado: 'Un poste de 3 m proyecta una sombra de 2 m. A la misma hora, un árbol proyecta una sombra de 8 m. ¿Cuánto mide el árbol?',
    opciones: ['$9$', '$12$', '$6$', '$16$'],
    correcta: 1,
    explicacion: 'A la misma hora los rayos llegan con el mismo ángulo, así que los triángulos son semejantes: $\\dfrac{3}{2} = \\dfrac{h}{8}$, y $h = 12$ m.',
  },
  {
    id: 'hm-140', temaId: 'hm-forma-9', dificultad: 0.5,
    enunciado: 'Dos triángulos semejantes tienen sus lados en la razón de 2 a 3. Si el área del menor es 20, ¿cuál es el área del mayor?',
    opciones: ['$60$', '$30$', '$45$', '$40$'],
    correcta: 2,
    explicacion: 'Las áreas están en la razón de los cuadrados de los lados: $\\left(\\dfrac{3}{2}\\right)^{2} = \\dfrac{9}{4}$. El área del mayor es $20 \\cdot \\dfrac{9}{4} = 45$. Aplicar la razón de los lados sin elevar al cuadrado da 30.',
  },

  /* ── Tablas y gráficos ──────────────────────────────────────────────── */
  {
    id: 'hm-141', temaId: 'hm-datos-1', dificultad: 0.35,
    enunciado: 'Una tienda vendió 20 unidades en enero, 35 en febrero, 25 en marzo y 40 en abril. ¿En qué porcentaje aumentaron las ventas de marzo a abril?',
    opciones: ['60 %', '15 %', '37,5 %', '40 %'],
    correcta: 0,
    explicacion: 'El aumento es de 15 unidades, y se compara con el punto de partida, marzo: $\\dfrac{15}{25} = 0{,}6$, o sea un 60 %. Compararlo con abril da 37,5 %, que es el error habitual.',
  },
  {
    id: 'hm-142', temaId: 'hm-datos-1', dificultad: 0.3,
    enunciado: 'En un gráfico circular, un sector representa el 25 % del total. ¿Cuánto mide su ángulo central?',
    opciones: ['$120^{\\circ}$', '$25^{\\circ}$', '$45^{\\circ}$', '$90^{\\circ}$'],
    correcta: 3,
    explicacion: 'El círculo completo, el 100 %, son $360^{\\circ}$. El 25 % es un cuarto: $\\dfrac{360}{4} = 90^{\\circ}$.',
  },

  /* ── Situaciones deportivas ─────────────────────────────────────────── */
  {
    id: 'hm-143', temaId: 'hm-datos-2', dificultad: 0.35,
    enunciado: 'En un campeonato de 8 equipos todos juegan contra todos una sola vez. ¿Cuántos partidos se juegan?',
    opciones: ['$56$', '$64$', '$28$', '$16$'],
    correcta: 2,
    explicacion: 'Cada partido es un par de equipos: $\\dbinom{8}{2} = \\dfrac{8 \\cdot 7}{2} = 28$. Contar $8 \\cdot 7 = 56$ cuenta cada partido dos veces, una por cada equipo.',
  },
  {
    id: 'hm-144', temaId: 'hm-datos-2', dificultad: 0.4,
    enunciado: 'En un torneo por eliminación directa con 32 equipos, ¿cuántos partidos se juegan hasta tener un campeón?',
    opciones: ['$16$', '$32$', '$63$', '$31$'],
    correcta: 3,
    explicacion: 'Cada partido elimina a exactamente un equipo, y para que quede un campeón hay que eliminar a 31. Son 31 partidos: $16 + 8 + 4 + 2 + 1$.',
  },

  /* ── Suficiencia de datos ───────────────────────────────────────────── */
  {
    id: 'hm-145', temaId: 'hm-datos-3', dificultad: 0.45,
    enunciado: 'Se quiere saber el valor de $x$. Dato I: $x + y = 10$. Dato II: $x - y = 2$. ¿Qué hace falta?',
    opciones: ['El dato I solo', 'Los dos datos juntos', 'El dato II solo', 'Ni con los dos datos'],
    correcta: 1,
    explicacion: 'Cada dato por separado admite infinitas soluciones: con $x + y = 10$, $x$ puede valer cualquier cosa. Juntos forman un sistema con solución única: $x = 6$ e $y = 4$.',
  },
  {
    id: 'hm-146', temaId: 'hm-datos-3', dificultad: 0.45,
    enunciado: 'Se quiere saber cuánto mide el lado de un cuadrado. Dato I: su área es 49. Dato II: su perímetro es 28. ¿Qué hace falta?',
    opciones: ['El dato I solo', 'El dato II solo', 'Cualquiera de los dos por separado', 'Los dos datos juntos'],
    correcta: 2,
    explicacion: 'Con el área, el lado es $\\sqrt{49} = 7$. Con el perímetro, $\\dfrac{28}{4} = 7$. Cada dato basta por sí solo, así que no hace falta juntarlos.',
  },

  /* ── Certeza ────────────────────────────────────────────────────────── */
  {
    id: 'hm-147', temaId: 'hm-datos-4', dificultad: 0.45,
    enunciado: 'En una caja hay 5 bolas rojas, 4 azules y 3 verdes. ¿Cuántas hay que sacar, sin mirar, para tener la certeza de obtener dos del mismo color?',
    opciones: ['$4$', '$6$', '$10$', '$3$'],
    correcta: 0,
    explicacion: 'Se piensa en el peor caso: las tres primeras salen de colores distintos. La cuarta tiene que repetir uno, porque solo hay tres colores. Hacen falta 4.',
  },
  {
    id: 'hm-148', temaId: 'hm-datos-4', dificultad: 0.55,
    enunciado: 'En una caja hay 5 bolas rojas, 4 azules y 3 verdes. ¿Cuántas hay que sacar, sin mirar, para tener la certeza de obtener al menos una de cada color?',
    opciones: ['$6$', '$3$', '$10$', '$12$'],
    correcta: 2,
    explicacion: 'En el peor caso salen primero todas las de los dos colores más abundantes: 5 rojas y 4 azules, 9 bolas sin ninguna verde. La siguiente tiene que ser verde. Hacen falta 10.',
  },

  /* ── Deducción ──────────────────────────────────────────────────────── */
  {
    id: 'hm-149', temaId: 'hm-datos-5', dificultad: 0.6,
    enunciado: 'Todos los médicos son profesionales. Algunos profesionales son deportistas. ¿Qué se concluye con certeza?',
    opciones: [
      'Algunos médicos son deportistas',
      'Ningún médico es deportista',
      'No se puede concluir nada sobre médicos y deportistas',
      'Todos los deportistas son profesionales',
    ],
    correcta: 2,
    explicacion: 'Los profesionales que son deportistas pueden ser médicos o no serlo: las dos situaciones cumplen las premisas. Por eso no se puede afirmar ni que algunos médicos lo sean ni que ninguno. Y nada dice que todos los deportistas sean profesionales.',
  },
  {
    id: 'hm-150', temaId: 'hm-datos-5', dificultad: 0.45,
    enunciado: 'Si llueve, el partido se suspende. El partido no se suspendió. ¿Qué se concluye?',
    opciones: ['Llovió', 'El partido se jugó bajo la lluvia', 'No se puede saber si llovió', 'No llovió'],
    correcta: 3,
    explicacion: 'Si hubiera llovido, el partido se habría suspendido. Como no se suspendió, no pudo llover. Es el modus tollens: negar la consecuencia obliga a negar la condición.',
  },

  /* ── Ordenamiento de la información ─────────────────────────────────── */
  {
    id: 'hm-151', temaId: 'hm-datos-6', dificultad: 0.3,
    enunciado: 'Ana es mayor que Beto. Carla es menor que Beto. Diego es mayor que Ana. ¿Quién es el menor?',
    opciones: ['Beto', 'Diego', 'Ana', 'Carla'],
    correcta: 3,
    explicacion: 'Ordenando de mayor a menor: Diego, Ana, Beto y Carla. Cada dato fija un par, y juntos dan el orden completo. La menor es Carla.',
  },
  {
    id: 'hm-152', temaId: 'hm-datos-6', dificultad: 0.6,
    enunciado: 'Cinco amigos se sientan en fila. Luis está en un extremo y Marta está a su lado. Nora está en el asiento central. Óscar no está junto a Nora. ¿Entre quiénes se sienta Pablo?',
    opciones: ['Entre Luis y Marta', 'Entre Nora y Óscar', 'Entre Marta y Nora', 'En un extremo'],
    correcta: 1,
    explicacion: 'Si Luis ocupa el asiento 1, Marta va en el 2 y Nora en el 3. Óscar no puede estar en el 4, junto a Nora, así que va en el 5 y a Pablo le queda el 4: entre Nora y Óscar. Con Luis en el otro extremo sale lo mismo, en espejo.',
  },

  /* ── Verdades y mentiras ────────────────────────────────────────────── */
  {
    id: 'hm-153', temaId: 'hm-datos-7', dificultad: 0.55,
    enunciado: 'Uno de tres hermanos rompió un jarrón. Andrés dice: «Fue Bruno». Bruno dice: «Yo no fui». Carlos dice: «Yo no fui». Si solo uno dice la verdad, ¿quién lo rompió?',
    opciones: ['Carlos', 'Bruno', 'No se puede saber', 'Andrés'],
    correcta: 0,
    explicacion: 'Se prueba cada culpable. Si fue Andrés o Bruno, hay dos frases verdaderas. Si fue Carlos, solo es verdad lo que dice Bruno, que es lo que exige el enunciado. Fue Carlos.',
  },
  {
    id: 'hm-154', temaId: 'hm-datos-7', dificultad: 0.6,
    enunciado: 'A y B siempre dicen la verdad o siempre mienten. A dice: «B miente». B dice: «A y yo decimos la verdad». ¿Qué es cada uno?',
    opciones: ['A dice la verdad y B miente', 'Los dos dicen la verdad', 'A miente y B dice la verdad', 'Los dos mienten'],
    correcta: 0,
    explicacion: 'Si A mintiera, B diría la verdad, y entonces sería cierto que los dos dicen la verdad: contradicción. Así que A dice la verdad y B miente, y la frase de B es falsa, como corresponde.',
  },

  /* ── Lazos familiares ───────────────────────────────────────────────── */
  {
    id: 'hm-155', temaId: 'hm-datos-8', dificultad: 0.3,
    enunciado: '¿Qué parentesco tiene conmigo el hijo del único hermano de mi padre?',
    opciones: ['Mi sobrino', 'Mi hermano', 'Mi primo', 'Mi tío'],
    correcta: 2,
    explicacion: 'El hermano de mi padre es mi tío, y el hijo de mi tío es mi primo: compartimos abuelos pero no padres.',
  },
  {
    id: 'hm-156', temaId: 'hm-datos-8', dificultad: 0.45,
    enunciado: 'En una familia hay un padre, una madre y dos hijos varones, y cada hijo tiene una hermana. ¿Cuántas personas hay, como mínimo?',
    opciones: ['$4$', '$6$', '$5$', '$7$'],
    correcta: 2,
    explicacion: 'La hermana de un hijo también es hermana del otro: basta una sola hija para los dos. Son padre, madre, dos hijos y una hija, cinco en total. Contar una hermana por hijo da 6.',
  },

  /* ── Diagramas de flujo ─────────────────────────────────────────────── */
  {
    id: 'hm-157', temaId: 'hm-datos-9', dificultad: 0.4,
    enunciado: 'Un diagrama de flujo empieza con $x = 1$. Mientras $x$ sea menor que 50, reemplaza $x$ por $2x + 1$. Al terminar, muestra $x$. ¿Qué número muestra?',
    opciones: ['$63$', '$31$', '$50$', '$127$'],
    correcta: 0,
    explicacion: 'Los valores son 1, 3, 7, 15, 31 y 63. Con 31 todavía es menor que 50, así que se hace una vuelta más. Con 63 ya no se cumple la condición y se muestra 63.',
  },
  {
    id: 'hm-158', temaId: 'hm-datos-9', dificultad: 0.45,
    enunciado: 'Un diagrama lee un número: si es par lo divide entre 2 y si es impar le suma 1, y repite hasta llegar a 1. ¿Cuántos pasos da si empieza en 13?',
    opciones: ['$5$', '$6$', '$7$', '$13$'],
    correcta: 1,
    explicacion: 'El recorrido es 13, 14, 7, 8, 4, 2 y 1. Son seis pasos, uno por cada flecha entre números. Contar los números en vez de las flechas da 7.',
  },
];
