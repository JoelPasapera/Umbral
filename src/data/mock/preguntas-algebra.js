/**
 * Banco de Álgebra.
 *
 * Cubre los treinta y cinco temas del curso con dos preguntas cada uno, al
 * nivel del examen de San Marcos: números reales y complejos, ecuaciones,
 * sistemas, programación lineal, polinomios y funciones.
 *
 * Mismas reglas que los bancos de trigonometría y aritmética:
 *
 *   · la respuesta está repartida entre las cuatro alternativas;
 *   · cada `temaId` es un tema real del temario, no un bloque;
 *   · cada distractor es un error que se comete de verdad —restar mal al
 *     aplicar Ruffini, olvidar que el logaritmo exige argumento positivo,
 *     confundir crecimiento lineal con exponencial— y la explicación lo nombra.
 *
 * Los intervalos siguen la notación que se usa en el Perú: `⟨a, b⟩` abierto y
 * `[a, b]` cerrado.
 *
 * `pruebas/algebra.test.mjs` recalcula cada respuesta —resuelve los sistemas,
 * divide los polinomios, recorre los vértices de cada problema de
 * programación lineal— y exige que la clave marcada sea la única alternativa
 * que coincide con el cálculo.
 */

/** @type {object[]} */
export const ALGEBRA = [
  /* ── Operaciones con números reales ─────────────────────────────────── */
  {
    id: 'alg-101', temaId: 'alg-reales-1', dificultad: 0.3,
    enunciado: 'Calcula $\\dfrac{2^{5} \\cdot 2^{-3}}{2^{-1}}$.',
    opciones: ['$4$', '$8$', '$2$', '$16$'],
    correcta: 1,
    explicacion: 'Con la misma base se suman los exponentes del producto y se resta el del divisor: $5 - 3 - (-1) = 3$, así que queda $2^{3} = 8$. Olvidar que restar $-1$ es sumar 1 da exponente 1, o sea 2.',
  },
  {
    id: 'alg-102', temaId: 'alg-reales-1', dificultad: 0.4,
    enunciado: 'Simplifica $\\sqrt{50} + \\sqrt{18} - \\sqrt{8}$.',
    opciones: ['$4\\sqrt{2}$', '$\\sqrt{60}$', '$6\\sqrt{2}$', '$8\\sqrt{2}$'],
    correcta: 2,
    explicacion: 'Se extraen los cuadrados: $\\sqrt{50} = 5\\sqrt{2}$, $\\sqrt{18} = 3\\sqrt{2}$ y $\\sqrt{8} = 2\\sqrt{2}$. Quedan radicales semejantes: $5 + 3 - 2 = 6$, o sea $6\\sqrt{2}$. Sumar lo de dentro, $\\sqrt{60}$, es el error clásico.',
  },

  /* ── Intervalos ─────────────────────────────────────────────────────── */
  {
    id: 'alg-103', temaId: 'alg-reales-2', dificultad: 0.35,
    enunciado: 'Si $A = [-2, 5 \\rangle$ y $B = \\langle 1, 8]$, ¿cuál es $A \\cap B$?',
    opciones: ['$[-2, 8]$', '$[1, 5]$', '$\\langle -2, 8]$', '$\\langle 1, 5 \\rangle$'],
    correcta: 3,
    explicacion: 'La intersección va desde el mayor de los extremos izquierdos, 1, hasta el menor de los derechos, 5. El 1 no entra porque $B$ lo excluye, y el 5 tampoco porque $A$ lo excluye: queda $\\langle 1, 5 \\rangle$.',
  },
  {
    id: 'alg-104', temaId: 'alg-reales-2', dificultad: 0.3,
    enunciado: '¿Cuántos números enteros hay en el intervalo $\\langle -3, 4]$?',
    opciones: ['$8$', '$6$', '$7$', '$5$'],
    correcta: 2,
    explicacion: 'El $-3$ queda fuera porque el extremo es abierto, y el 4 entra porque es cerrado: $-2, -1, 0, 1, 2, 3$ y $4$. Son siete.',
  },

  /* ── Valor absoluto ─────────────────────────────────────────────────── */
  {
    id: 'alg-105', temaId: 'alg-reales-3', dificultad: 0.35,
    enunciado: 'Resuelve $|2x - 3| = 7$. ¿Cuánto suman sus soluciones?',
    opciones: ['$3$', '$5$', '$7$', '$-2$'],
    correcta: 0,
    explicacion: 'Hay dos casos: $2x - 3 = 7$ da $x = 5$, y $2x - 3 = -7$ da $x = -2$. La suma es $5 + (-2) = 3$. Quedarse solo con el caso positivo da 5.',
  },
  {
    id: 'alg-106', temaId: 'alg-reales-3', dificultad: 0.4,
    enunciado: '¿Cuántos números enteros cumplen $|x - 1| < 3$?',
    opciones: ['$5$', '$6$', '$7$', '$4$'],
    correcta: 0,
    explicacion: 'La desigualdad equivale a $-3 < x - 1 < 3$, o sea $-2 < x < 4$. Los enteros son $-1, 0, 1, 2$ y $3$: cinco. Los extremos no entran porque la desigualdad es estricta.',
  },

  /* ── Números complejos ──────────────────────────────────────────────── */
  {
    id: 'alg-107', temaId: 'alg-reales-4', dificultad: 0.4,
    enunciado: 'Calcula $(2 + 3i)(1 - i)$.',
    opciones: ['$-1 + i$', '$-1 + 5i$', '$5 - i$', '$5 + i$'],
    correcta: 3,
    explicacion: 'Se multiplica término a término: $2 - 2i + 3i - 3i^{2}$. Como $i^{2} = -1$, el último término es $+3$, y queda $5 + i$. Tomar $i^{2}$ como 1 lleva a $-1 + i$.',
  },
  {
    id: 'alg-108', temaId: 'alg-reales-4', dificultad: 0.45,
    enunciado: 'Calcula $i^{2027}$.',
    opciones: ['$i$', '$-i$', '$-1$', '$1$'],
    correcta: 1,
    explicacion: 'Las potencias de $i$ se repiten cada cuatro: $i, -1, -i, 1$. Como $2027 = 4 \\cdot 506 + 3$, vale lo mismo que $i^{3} = -i$.',
  },
  {
    id: 'alg-109', temaId: 'alg-reales-5', dificultad: 0.3,
    enunciado: '¿Cuál es el módulo de $z = 6 - 8i$?',
    opciones: ['$2$', '$14$', '$10$', '$\\sqrt{28}$'],
    correcta: 2,
    explicacion: 'El módulo es $\\sqrt{a^{2} + b^{2}} = \\sqrt{36 + 64} = \\sqrt{100} = 10$. El signo de la parte imaginaria no importa porque va al cuadrado.',
  },
  {
    id: 'alg-110', temaId: 'alg-reales-5', dificultad: 0.35,
    enunciado: 'Si $z = 3 + 4i$, calcula $z \\cdot \\overline{z}$.',
    opciones: ['$7$', '$25$', '$9 - 16i$', '$5$'],
    correcta: 1,
    explicacion: 'Un complejo por su conjugado da el cuadrado del módulo, que es real: $(3 + 4i)(3 - 4i) = 9 - 16i^{2} = 9 + 16 = 25$. El 5 es el módulo, no su cuadrado.',
  },

  /* ── Ecuaciones de primer y segundo grado ───────────────────────────── */
  {
    id: 'alg-111', temaId: 'alg-ecuaciones-1', dificultad: 0.25,
    enunciado: 'Resuelve $\\dfrac{x}{2} + \\dfrac{x}{3} = 10$.',
    opciones: ['$6$', '$60$', '$5$', '$12$'],
    correcta: 3,
    explicacion: 'Con denominador común 6 queda $\\dfrac{3x + 2x}{6} = 10$, así que $5x = 60$ y $x = 12$. Quedarse en $5x = 60$ y responder 60 es olvidar el último paso.',
  },
  {
    id: 'alg-112', temaId: 'alg-ecuaciones-1', dificultad: 0.3,
    enunciado: '¿Cuál es la mayor raíz de $x^{2} - 7x + 10 = 0$?',
    opciones: ['$2$', '$10$', '$7$', '$5$'],
    correcta: 3,
    explicacion: 'Se buscan dos números que sumen 7 y multipliquen 10: son 2 y 5. Así, $(x - 2)(x - 5) = 0$ y la mayor raíz es 5.',
  },

  /* ── Ecuaciones bicuadradas ─────────────────────────────────────────── */
  {
    id: 'alg-113', temaId: 'alg-ecuaciones-2', dificultad: 0.4,
    enunciado: '¿Cuántas soluciones reales tiene $x^{4} - 5x^{2} + 4 = 0$?',
    opciones: ['$4$', '$0$', '$1$', '$2$'],
    correcta: 0,
    explicacion: 'Con $t = x^{2}$ queda $t^{2} - 5t + 4 = 0$, de raíces $t = 1$ y $t = 4$. Como las dos son positivas, cada una da dos valores de $x$: $\\pm 1$ y $\\pm 2$. Son cuatro.',
  },
  {
    id: 'alg-114', temaId: 'alg-ecuaciones-2', dificultad: 0.5,
    enunciado: 'Halla la suma de los cuadrados de las raíces reales de $x^{4} - 13x^{2} + 36 = 0$.',
    opciones: ['$26$', '$36$', '$13$', '$10$'],
    correcta: 0,
    explicacion: 'Con $t = x^{2}$ salen $t = 4$ y $t = 9$, así que las raíces son $\\pm 2$ y $\\pm 3$. Sus cuadrados suman $4 + 4 + 9 + 9 = 26$. Sumar solo los dos valores de $t$ da 13, pero cada uno corresponde a dos raíces.',
  },

  /* ── Inecuaciones ───────────────────────────────────────────────────── */
  {
    id: 'alg-115', temaId: 'alg-ecuaciones-3', dificultad: 0.25,
    enunciado: 'Resuelve $3x - 4 > 2x + 1$.',
    opciones: ['$\\langle -5, +\\infty \\rangle$', '$\\langle -\\infty, 5 \\rangle$', '$[5, +\\infty \\rangle$', '$\\langle 5, +\\infty \\rangle$'],
    correcta: 3,
    explicacion: 'Pasando términos: $3x - 2x > 1 + 4$, o sea $x > 5$. La desigualdad es estricta, así que el 5 queda fuera y el intervalo es abierto: $\\langle 5, +\\infty \\rangle$.',
  },
  {
    id: 'alg-116', temaId: 'alg-ecuaciones-3', dificultad: 0.45,
    enunciado: '¿Cuántos números enteros cumplen $x^{2} - x - 6 < 0$?',
    opciones: ['$5$', '$4$', '$6$', '$3$'],
    correcta: 1,
    explicacion: 'Se factoriza: $(x - 3)(x + 2) < 0$. El producto es negativo entre las raíces, $-2 < x < 3$, y ahí están $-1, 0, 1$ y $2$. Son cuatro; las raíces no entran porque la desigualdad es estricta.',
  },

  /* ── Sistemas lineales ──────────────────────────────────────────────── */
  {
    id: 'alg-117', temaId: 'alg-sistemas-1', dificultad: 0.25,
    enunciado: 'Si $x + y = 10$ y $x - y = 4$, ¿cuánto vale $xy$?',
    opciones: ['$24$', '$40$', '$21$', '$14$'],
    correcta: 2,
    explicacion: 'Sumando las ecuaciones, $2x = 14$ y $x = 7$; entonces $y = 3$. El producto es $7 \\cdot 3 = 21$.',
  },
  {
    id: 'alg-118', temaId: 'alg-sistemas-1', dificultad: 0.45,
    enunciado: 'Resuelve el sistema $x + y + z = 6$, $x - y = 1$, $y - z = 1$. ¿Cuánto vale $x$?',
    opciones: ['$1$', '$2$', '$3$', '$4$'],
    correcta: 2,
    explicacion: 'De las dos últimas, $x = y + 1$ y $z = y - 1$. Sustituyendo en la primera: $(y + 1) + y + (y - 1) = 6$, o sea $3y = 6$ e $y = 2$. Entonces $x = 3$ y $z = 1$.',
  },

  /* ── Cramer y Gauss ─────────────────────────────────────────────────── */
  {
    id: 'alg-119', temaId: 'alg-sistemas-2', dificultad: 0.4,
    enunciado: '¿Cuánto vale el determinante del sistema $2x + 3y = 8$, $x - y = -1$?',
    opciones: ['$-5$', '$5$', '$-1$', '$1$'],
    correcta: 0,
    explicacion: 'Es el determinante de los coeficientes: $2 \\cdot (-1) - 3 \\cdot 1 = -2 - 3 = -5$. Cambiar el orden de la resta da 5, y el signo importa al aplicar Cramer.',
  },
  {
    id: 'alg-120', temaId: 'alg-sistemas-2', dificultad: 0.5,
    enunciado: 'Resuelve por Cramer el sistema $2x + 3y = 8$, $x - y = -1$. ¿Cuánto vale $y$?',
    opciones: ['$1$', '$2$', '$\\dfrac{8}{5}$', '$-2$'],
    correcta: 1,
    explicacion: 'El determinante del sistema es $-5$. Para $y$ se cambia su columna por los términos independientes: $2 \\cdot (-1) - 8 \\cdot 1 = -10$. Entonces $y = \\dfrac{-10}{-5} = 2$, y de ahí $x = 1$.',
  },

  /* ── Sistemas de inecuaciones ───────────────────────────────────────── */
  {
    id: 'alg-121', temaId: 'alg-sistemas-3', dificultad: 0.35,
    enunciado: '¿Qué punto cumple a la vez $x + y \\le 4$ y $y > x$?',
    opciones: ['$(3, 2)$', '$(0, 0)$', '$(2, 3)$', '$(1, 2)$'],
    correcta: 3,
    explicacion: 'Se prueba cada punto en las dos condiciones. $(1, 2)$ cumple ambas: $1 + 2 = 3 \\le 4$ y $2 > 1$. El $(0, 0)$ falla la segunda porque la desigualdad es estricta, y los otros dos pasan de 4.',
  },
  {
    id: 'alg-122', temaId: 'alg-sistemas-3', dificultad: 0.4,
    enunciado: '¿Cuántos puntos de coordenadas enteras no negativas cumplen $x + y \\le 2$?',
    opciones: ['$6$', '$4$', '$3$', '$9$'],
    correcta: 0,
    explicacion: 'Se cuentan por valor de $x$: con $x = 0$ hay tres valores de $y$ (0, 1 y 2), con $x = 1$ hay dos y con $x = 2$ hay uno. En total, seis.',
  },

  /* ── Programación lineal ────────────────────────────────────────────── */
  {
    id: 'alg-123', temaId: 'alg-sistemas-4', dificultad: 0.55,
    enunciado: 'Maximiza $Z = 3x + 2y$ sujeto a $x + y \\le 4$, $x \\le 3$, $x \\ge 0$ e $y \\ge 0$.',
    opciones: ['$12$', '$9$', '$11$', '$8$'],
    correcta: 2,
    explicacion: 'El óptimo está en un vértice de la región: $(0, 0)$, $(3, 0)$, $(3, 1)$ y $(0, 4)$. Evaluando, $Z$ vale 0, 9, 11 y 8. El máximo es 11, en $(3, 1)$. El 12 sale de un punto que no cumple $x \\le 3$.',
  },
  {
    id: 'alg-124', temaId: 'alg-sistemas-4', dificultad: 0.55,
    enunciado: 'Minimiza $Z = 2x + 5y$ sujeto a $x + y \\ge 6$, $x \\le 4$, $x \\ge 0$ e $y \\ge 0$.',
    opciones: ['$12$', '$30$', '$18$', '$20$'],
    correcta: 2,
    explicacion: 'Los vértices de la región son $(4, 2)$ y $(0, 6)$. En ellos $Z$ vale 18 y 30, así que el mínimo es 18. El 12 sería el punto $(6, 0)$, pero no cumple $x \\le 4$.',
  },

  /* ── Expresiones algebraicas ────────────────────────────────────────── */
  {
    id: 'alg-125', temaId: 'alg-expresiones-1', dificultad: 0.35,
    enunciado: 'Si $a + b = 5$ y $ab = 6$, ¿cuánto vale $a^{2} + b^{2}$?',
    opciones: ['$13$', '$25$', '$19$', '$37$'],
    correcta: 0,
    explicacion: 'De $(a + b)^{2} = a^{2} + 2ab + b^{2}$ se despeja: $a^{2} + b^{2} = 25 - 2 \\cdot 6 = 13$. Responder 25 es olvidar el doble producto.',
  },
  {
    id: 'alg-126', temaId: 'alg-expresiones-1', dificultad: 0.3,
    enunciado: 'Reduce $3(2x - 1) - 2(x - 4)$. ¿Cuál es el término independiente?',
    opciones: ['$-11$', '$5$', '$4$', '$11$'],
    correcta: 1,
    explicacion: 'Se distribuye: $6x - 3 - 2x + 8 = 4x + 5$. El término independiente es 5. El error típico es no cambiar el signo del $-4$ al multiplicarlo por $-2$.',
  },

  /* ── Potenciación ───────────────────────────────────────────────────── */
  {
    id: 'alg-127', temaId: 'alg-expresiones-2', dificultad: 0.35,
    enunciado: 'Simplifica $\\dfrac{(x^{3})^{4} \\cdot x^{-2}}{x^{5}}$. ¿Qué exponente le queda a $x$?',
    opciones: ['$5$', '$9$', '$7$', '$3$'],
    correcta: 0,
    explicacion: 'Una potencia de potencia multiplica los exponentes: $(x^{3})^{4} = x^{12}$. Luego se suman los del producto y se resta el del divisor: $12 - 2 - 5 = 5$. Sumar $3 + 4$ en vez de multiplicar daría exponente 0.',
  },
  {
    id: 'alg-128', temaId: 'alg-expresiones-2', dificultad: 0.4,
    enunciado: 'Calcula $\\left(\\dfrac{1}{2}\\right)^{-3} + 4^{\\frac{1}{2}}$.',
    opciones: ['$10$', '$\\dfrac{1}{8}$', '$12$', '$6$'],
    correcta: 0,
    explicacion: 'Un exponente negativo invierte la base: $\\left(\\dfrac{1}{2}\\right)^{-3} = 2^{3} = 8$. Un exponente $\\dfrac{1}{2}$ es una raíz cuadrada: $4^{\\frac{1}{2}} = 2$. La suma es 10.',
  },

  /* ── Radicación ─────────────────────────────────────────────────────── */
  {
    id: 'alg-129', temaId: 'alg-expresiones-3', dificultad: 0.3,
    enunciado: 'Racionaliza $\\dfrac{6}{\\sqrt{3}}$.',
    opciones: ['$6\\sqrt{3}$', '$3\\sqrt{2}$', '$\\sqrt{3}$', '$2\\sqrt{3}$'],
    correcta: 3,
    explicacion: 'Se multiplica arriba y abajo por $\\sqrt{3}$: $\\dfrac{6\\sqrt{3}}{3} = 2\\sqrt{3}$. Olvidar dividir entre el 3 que aparece abajo deja $6\\sqrt{3}$.',
  },
  {
    id: 'alg-130', temaId: 'alg-expresiones-3', dificultad: 0.6,
    enunciado: 'Calcula $\\sqrt{7 + 4\\sqrt{3}}$.',
    opciones: ['$\\sqrt{7} + 2$', '$4 + \\sqrt{3}$', '$2 + \\sqrt{3}$', '$1 + 2\\sqrt{3}$'],
    correcta: 2,
    explicacion: 'Se busca $a + b\\sqrt{3}$ cuyo cuadrado sea $7 + 4\\sqrt{3}$: $(2 + \\sqrt{3})^{2} = 4 + 4\\sqrt{3} + 3 = 7 + 4\\sqrt{3}$. Así, la raíz es $2 + \\sqrt{3}$. La raíz de una suma no es la suma de las raíces.',
  },

  /* ── Polinomios y grado ─────────────────────────────────────────────── */
  {
    id: 'alg-131', temaId: 'alg-expresiones-4', dificultad: 0.35,
    enunciado: '¿Cuál es el grado absoluto de $P(x, y) = 3x^{4}y^{2} - 5x^{2}y^{5} + 7$?',
    opciones: ['$4$', '$5$', '$7$', '$6$'],
    correcta: 2,
    explicacion: 'El grado de cada término es la suma de sus exponentes: $4 + 2 = 6$ y $2 + 5 = 7$. El grado absoluto del polinomio es el mayor, 7. El 4 y el 5 son los grados relativos en $x$ y en $y$.',
  },
  {
    id: 'alg-132', temaId: 'alg-expresiones-4', dificultad: 0.25,
    enunciado: 'Si $P(x) = 2x^{2} - 3x + 1$, calcula $P(2) + P(-1)$.',
    opciones: ['$0$', '$3$', '$6$', '$9$'],
    correcta: 3,
    explicacion: '$P(2) = 8 - 6 + 1 = 3$ y $P(-1) = 2 + 3 + 1 = 6$. La suma es 9. Con $-1$ hay que cuidar que $-3 \\cdot (-1) = +3$.',
  },

  /* ── Suma y producto de polinomios ──────────────────────────────────── */
  {
    id: 'alg-133', temaId: 'alg-expresiones-5', dificultad: 0.4,
    enunciado: '¿Cuál es el coeficiente de $x^{2}$ en $(2x + 3)(x^{2} - x + 4)$?',
    opciones: ['$-2$', '$1$', '$3$', '$5$'],
    correcta: 1,
    explicacion: 'Solo dos productos dan $x^{2}$: $2x \\cdot (-x) = -2x^{2}$ y $3 \\cdot x^{2} = 3x^{2}$. Juntos suman $x^{2}$, así que el coeficiente es 1.',
  },
  {
    id: 'alg-134', temaId: 'alg-expresiones-5', dificultad: 0.4,
    enunciado: 'Si $P(x) = x^{2} + 2x$ y $Q(x) = 3x - 1$, ¿cuánto suman los coeficientes de $P(x) \\cdot Q(x)$?',
    opciones: ['$5$', '$6$', '$3$', '$2$'],
    correcta: 1,
    explicacion: 'La suma de coeficientes de un polinomio es su valor en 1, y el de un producto es el producto de los valores: $P(1) \\cdot Q(1) = 3 \\cdot 2 = 6$. No hace falta multiplicar los polinomios.',
  },

  /* ── Ruffini y Horner ───────────────────────────────────────────────── */
  {
    id: 'alg-135', temaId: 'alg-expresiones-6', dificultad: 0.4,
    enunciado: 'Divide $x^{3} - 2x^{2} + 3x - 4$ entre $x - 2$ por Ruffini. ¿Cuál es el residuo?',
    opciones: ['$2$', '$-4$', '$6$', '$0$'],
    correcta: 0,
    explicacion: 'Con el 2 abajo: se baja el 1; $1 \\cdot 2 - 2 = 0$; $0 \\cdot 2 + 3 = 3$; $3 \\cdot 2 - 4 = 2$. El último número es el residuo, 2, y el cociente es $x^{2} + 3$.',
  },
  {
    id: 'alg-136', temaId: 'alg-expresiones-6', dificultad: 0.5,
    enunciado: 'Al dividir $2x^{3} + x^{2} - 5x + 3$ entre $x + 1$, ¿cuánto suman los coeficientes del cociente?',
    opciones: ['$7$', '$-3$', '$3$', '$-4$'],
    correcta: 1,
    explicacion: 'Para $x + 1$ se usa $-1$: se baja el 2; $2 \\cdot (-1) + 1 = -1$; $-1 \\cdot (-1) - 5 = -4$; y queda residuo 7. El cociente es $2x^{2} - x - 4$, cuyos coeficientes suman $-3$. Usar $+1$ en vez de $-1$ es la trampa.',
  },

  /* ── Teorema del resto ──────────────────────────────────────────────── */
  {
    id: 'alg-137', temaId: 'alg-expresiones-7', dificultad: 0.4,
    enunciado: '¿Cuál es el resto de dividir $x^{5} - 3x^{2} + 1$ entre $x + 1$?',
    opciones: ['$3$', '$5$', '$-1$', '$-3$'],
    correcta: 3,
    explicacion: 'Por el teorema del resto, se evalúa en la raíz del divisor, $x = -1$: $(-1)^{5} - 3(-1)^{2} + 1 = -1 - 3 + 1 = -3$. Una potencia impar de $-1$ es $-1$.',
  },
  {
    id: 'alg-138', temaId: 'alg-expresiones-7', dificultad: 0.4,
    enunciado: '¿Para qué valor de $k$ el resto de dividir $x^{2} + kx - 6$ entre $x - 2$ es cero?',
    opciones: ['$1$', '$3$', '$2$', '$-1$'],
    correcta: 0,
    explicacion: 'El resto es el valor en $x = 2$: $4 + 2k - 6 = 2k - 2$. Para que sea cero, $k = 1$.',
  },

  /* ── Teorema del factor ─────────────────────────────────────────────── */
  {
    id: 'alg-139', temaId: 'alg-expresiones-8', dificultad: 0.45,
    enunciado: '¿Cuál de estos es un factor de $x^{3} - 6x^{2} + 11x - 6$?',
    opciones: ['$x + 1$', '$x - 4$', '$x + 2$', '$x - 3$'],
    correcta: 3,
    explicacion: '$x - a$ es factor si el polinomio vale cero en $x = a$. En $x = 3$: $27 - 54 + 33 - 6 = 0$. En $-1$, $4$ y $-2$ no se anula. Ojo con el signo: el factor $x + 1$ corresponde a evaluar en $-1$.',
  },
  {
    id: 'alg-140', temaId: 'alg-expresiones-8', dificultad: 0.4,
    enunciado: 'Si $x - 1$ es factor de $x^{3} + ax - 4$, ¿cuánto vale $a$?',
    opciones: ['$-3$', '$3$', '$4$', '$5$'],
    correcta: 1,
    explicacion: 'Si $x - 1$ es factor, el polinomio vale cero en $x = 1$: $1 + a - 4 = 0$, así que $a = 3$.',
  },

  /* ── Productos notables y binomio de Newton ─────────────────────────── */
  {
    id: 'alg-141', temaId: 'alg-expresiones-9', dificultad: 0.45,
    enunciado: 'Si $x + \\dfrac{1}{x} = 3$, calcula $x^{2} + \\dfrac{1}{x^{2}}$.',
    opciones: ['$9$', '$11$', '$7$', '$6$'],
    correcta: 2,
    explicacion: 'Al elevar al cuadrado: $x^{2} + 2 + \\dfrac{1}{x^{2}} = 9$, porque el doble producto $2 \\cdot x \\cdot \\dfrac{1}{x}$ vale 2. Entonces $x^{2} + \\dfrac{1}{x^{2}} = 7$. Responder 9 es olvidar ese 2.',
  },
  {
    id: 'alg-142', temaId: 'alg-expresiones-9', dificultad: 0.5,
    enunciado: '¿Cuál es el coeficiente del término central de $(x + 2)^{4}$?',
    opciones: ['$24$', '$16$', '$6$', '$32$'],
    correcta: 0,
    explicacion: 'El desarrollo tiene cinco términos; el central es el tercero, $\\dbinom{4}{2} x^{2} \\cdot 2^{2} = 6 \\cdot 4 \\, x^{2}$. Su coeficiente es 24. Quedarse en el combinatorio, 6, es olvidar la potencia del 2.',
  },

  /* ── Factorización ──────────────────────────────────────────────────── */
  {
    id: 'alg-143', temaId: 'alg-expresiones-10', dificultad: 0.35,
    enunciado: '¿En cuántos factores lineales se descompone $x^{3} - x$ en los reales?',
    opciones: ['$2$', '$3$', '$4$', '$1$'],
    correcta: 1,
    explicacion: 'Primero el factor común y después la diferencia de cuadrados: $x^{3} - x = x(x^{2} - 1) = x(x - 1)(x + 1)$. Son tres. Quedarse en $x(x^{2} - 1)$ deja la factorización a medias.',
  },
  {
    id: 'alg-144', temaId: 'alg-expresiones-10', dificultad: 0.3,
    enunciado: 'Calcula $53^{2} - 47^{2}$ sin elevar al cuadrado.',
    opciones: ['$600$', '$36$', '$6$', '$100$'],
    correcta: 0,
    explicacion: 'Es una diferencia de cuadrados: $a^{2} - b^{2} = (a + b)(a - b) = 100 \\cdot 6 = 600$. Restar las bases y elevar al cuadrado, $6^{2}$, da 36, que no es lo mismo.',
  },

  /* ── MCD y MCM de polinomios ────────────────────────────────────────── */
  {
    id: 'alg-145', temaId: 'alg-expresiones-11', dificultad: 0.4,
    enunciado: '¿Cuál es el MCD de $x^{2} - 1$ y $x^{2} + 2x + 1$?',
    opciones: ['$x - 1$', '$x + 1$', '$(x + 1)^{2}$', '$x^{2} - 1$'],
    correcta: 1,
    explicacion: 'Se factorizan: $x^{2} - 1 = (x - 1)(x + 1)$ y $x^{2} + 2x + 1 = (x + 1)^{2}$. El MCD toma los factores comunes con su menor exponente: $x + 1$.',
  },
  {
    id: 'alg-146', temaId: 'alg-expresiones-11', dificultad: 0.45,
    enunciado: '¿Cuál es el grado del MCM de $x^{2} - 4$ y $x^{2} + x - 6$?',
    opciones: ['$4$', '$3$', '$2$', '$1$'],
    correcta: 1,
    explicacion: '$x^{2} - 4 = (x - 2)(x + 2)$ y $x^{2} + x - 6 = (x + 3)(x - 2)$. El MCM toma todos los factores una vez con su mayor exponente: $(x - 2)(x + 2)(x + 3)$, de grado 3. Multiplicar los dos polinomios daría grado 4.',
  },

  /* ── Teorema fundamental del álgebra ────────────────────────────────── */
  {
    id: 'alg-147', temaId: 'alg-expresiones-12', dificultad: 0.4,
    enunciado: '¿Cuántas raíces tiene $x^{4} - 1 = 0$ en los complejos, contando multiplicidades?',
    opciones: ['$2$', '$1$', '$3$', '$4$'],
    correcta: 3,
    explicacion: 'Un polinomio de grado $n$ tiene exactamente $n$ raíces complejas. Aquí son $1, -1, i$ y $-i$, porque $x^{4} - 1 = (x - 1)(x + 1)(x^{2} + 1)$. Contar solo las reales da 2.',
  },
  {
    id: 'alg-148', temaId: 'alg-expresiones-12', dificultad: 0.55,
    enunciado: 'Un polinomio de grado 5 con coeficientes reales, ¿cuántas raíces reales tiene como mínimo?',
    opciones: ['$2$', '$0$', '$5$', '$1$'],
    correcta: 3,
    explicacion: 'Con coeficientes reales, las raíces no reales van en parejas de conjugados. En grado 5 pueden emparejarse como mucho cuatro, así que al menos una es real.',
  },

  /* ── Relación entre raíces y coeficientes ───────────────────────────── */
  {
    id: 'alg-149', temaId: 'alg-expresiones-13', dificultad: 0.45,
    enunciado: 'Si $r$ y $s$ son las raíces de $2x^{2} - 6x + 3 = 0$, calcula $r + s + rs$.',
    opciones: ['$3$', '$\\dfrac{3}{2}$', '$\\dfrac{9}{2}$', '$6$'],
    correcta: 2,
    explicacion: 'Por Cardano-Vieta, $r + s = -\\dfrac{b}{a} = 3$ y $rs = \\dfrac{c}{a} = \\dfrac{3}{2}$. La suma es $\\dfrac{9}{2}$. Olvidar dividir entre el coeficiente principal, 2, es el error habitual.',
  },
  {
    id: 'alg-150', temaId: 'alg-expresiones-13', dificultad: 0.35,
    enunciado: '¿Cuánto suman las raíces de $x^{3} - 4x^{2} + x + 6 = 0$?',
    opciones: ['$-4$', '$4$', '$6$', '$-6$'],
    correcta: 1,
    explicacion: 'La suma de las raíces es $-\\dfrac{b}{a} = -\\dfrac{-4}{1} = 4$. Se puede comprobar: las raíces son $-1$, $2$ y $3$. El signo menos de la fórmula es donde se cae.',
  },

  /* ── Dominio y rango ────────────────────────────────────────────────── */
  {
    id: 'alg-151', temaId: 'alg-funciones-1', dificultad: 0.3,
    enunciado: '¿Cuál es el dominio de $f(x) = \\sqrt{x - 3}$?',
    opciones: ['$\\langle 3, +\\infty \\rangle$', '$\\langle -\\infty, 3]$', '$[3, +\\infty \\rangle$', '$\\mathbb{R}$'],
    correcta: 2,
    explicacion: 'Lo de dentro de una raíz cuadrada no puede ser negativo: $x - 3 \\ge 0$, o sea $x \\ge 3$. El 3 sí entra, porque $\\sqrt{0} = 0$: el intervalo es cerrado en 3.',
  },
  {
    id: 'alg-152', temaId: 'alg-funciones-1', dificultad: 0.5,
    enunciado: '¿Cuál es el rango de $f(x) = x^{2} - 4x + 7$?',
    opciones: ['$\\mathbb{R}$', '$[7, +\\infty \\rangle$', '$[2, +\\infty \\rangle$', '$[3, +\\infty \\rangle$'],
    correcta: 3,
    explicacion: 'Completando cuadrados: $f(x) = (x - 2)^{2} + 3$. El cuadrado vale como mínimo 0, así que $f$ vale como mínimo 3 y crece sin límite. El 7 es $f(0)$ y el 2 es donde está el mínimo, no su valor.',
  },

  /* ── Tablas y gráficas ──────────────────────────────────────────────── */
  {
    id: 'alg-153', temaId: 'alg-funciones-2', dificultad: 0.35,
    enunciado: 'Una función lineal cumple $f(1) = 5$ y $f(3) = 11$. ¿Cuánto vale $f(0)$?',
    opciones: ['$5$', '$3$', '$2$', '$0$'],
    correcta: 2,
    explicacion: 'La pendiente es $\\dfrac{11 - 5}{3 - 1} = 3$. Si de $x = 1$ se retrocede a $x = 0$, se resta una pendiente: $f(0) = 5 - 3 = 2$.',
  },
  {
    id: 'alg-154', temaId: 'alg-funciones-2', dificultad: 0.25,
    enunciado: '¿En qué punto corta al eje $X$ la gráfica de $f(x) = 2x - 6$?',
    opciones: ['$(0, -6)$', '$(-3, 0)$', '$(6, 0)$', '$(3, 0)$'],
    correcta: 3,
    explicacion: 'En el eje $X$ la ordenada es cero: $2x - 6 = 0$ da $x = 3$. El punto es $(3, 0)$. El $(0, -6)$ es el corte con el eje $Y$.',
  },

  /* ── Funciones lineal, cuadrática y valor absoluto ──────────────────── */
  {
    id: 'alg-155', temaId: 'alg-funciones-3', dificultad: 0.4,
    enunciado: '¿Cuál es el vértice de la parábola $y = x^{2} - 6x + 5$?',
    opciones: ['$(-3, 4)$', '$(3, -4)$', '$(3, 4)$', '$(6, 5)$'],
    correcta: 1,
    explicacion: 'La abscisa del vértice es $-\\dfrac{b}{2a} = 3$, y la ordenada, $9 - 18 + 5 = -4$. El vértice es $(3, -4)$. Tomar $\\dfrac{b}{2a}$ sin el signo menos da $-3$.',
  },
  {
    id: 'alg-156', temaId: 'alg-funciones-3', dificultad: 0.3,
    enunciado: '¿Cuál es el valor mínimo de $f(x) = |x - 2| + 3$?',
    opciones: ['$5$', '$2$', '$3$', '$0$'],
    correcta: 2,
    explicacion: 'El valor absoluto vale como mínimo 0, y lo alcanza en $x = 2$. Entonces el mínimo de $f$ es $0 + 3 = 3$. El 2 es dónde se alcanza, no cuánto vale.',
  },

  /* ── Funciones par e impar ──────────────────────────────────────────── */
  {
    id: 'alg-157', temaId: 'alg-funciones-4', dificultad: 0.35,
    enunciado: '¿Cuál de estas funciones es par?',
    opciones: ['$f(x) = x^{2} + 1$', '$f(x) = x^{3}$', '$f(x) = x + 1$', '$f(x) = x^{3} + x$'],
    correcta: 0,
    explicacion: 'Una función es par si $f(-x) = f(x)$. Con $x^{2} + 1$ se cumple, porque $(-x)^{2} = x^{2}$. Las potencias impares cambian de signo, y $x + 1$ no es ni par ni impar.',
  },
  {
    id: 'alg-158', temaId: 'alg-funciones-4', dificultad: 0.4,
    enunciado: '¿Cuál de estas funciones es impar?',
    opciones: ['$f(x) = x^{3} - x$', '$f(x) = |x|$', '$f(x) = x^{2}$', '$f(x) = x^{2} + x$'],
    correcta: 0,
    explicacion: 'Una función es impar si $f(-x) = -f(x)$. En $x^{3} - x$ los dos términos tienen potencia impar, así que al cambiar el signo de $x$ cambia el de todo. $x^{2} + x$ mezcla una potencia par con una impar.',
  },

  /* ── Crecimiento ────────────────────────────────────────────────────── */
  {
    id: 'alg-159', temaId: 'alg-funciones-5', dificultad: 0.45,
    enunciado: '¿En qué intervalo es creciente $f(x) = x^{2} - 4x$?',
    opciones: ['$\\langle -\\infty, 2]$', '$[-2, +\\infty \\rangle$', '$[2, +\\infty \\rangle$', '$[4, +\\infty \\rangle$'],
    correcta: 2,
    explicacion: 'Es una parábola hacia arriba con vértice en $x = -\\dfrac{b}{2a} = 2$. Baja hasta el vértice y sube desde él: crece en $[2, +\\infty \\rangle$. El 4 es donde vuelve a cortar el eje, no donde cambia de sentido.',
  },
  {
    id: 'alg-160', temaId: 'alg-funciones-5', dificultad: 0.3,
    enunciado: '¿Cuál de estas funciones es decreciente en todo $\\mathbb{R}$?',
    opciones: ['$f(x) = 2x + 1$', '$f(x) = -3x + 4$', '$f(x) = x^{2}$', '$f(x) = |x|$'],
    correcta: 1,
    explicacion: 'Una función lineal decrece en todo $\\mathbb{R}$ cuando su pendiente es negativa, y $-3x + 4$ la tiene. $x^{2}$ y $|x|$ bajan hasta el 0 y después suben.',
  },

  /* ── Inyectividad ───────────────────────────────────────────────────── */
  {
    id: 'alg-161', temaId: 'alg-funciones-6', dificultad: 0.4,
    enunciado: '¿Cuál de estas funciones de $\\mathbb{R}$ en $\\mathbb{R}$ es inyectiva?',
    opciones: ['$f(x) = x^{2}$', '$f(x) = |x|$', '$f(x) = 2x - 5$', '$f(x) = x^{2} - 1$'],
    correcta: 2,
    explicacion: 'Es inyectiva si valores distintos de $x$ nunca dan la misma imagen. Las otras tres fallan con $x = 1$ y $x = -1$, que dan lo mismo. Una recta que no es horizontal nunca repite un valor.',
  },
  {
    id: 'alg-162', temaId: 'alg-funciones-6', dificultad: 0.55,
    enunciado: 'Si $f : [0, +\\infty \\rangle \\rightarrow \\mathbb{R}$ con $f(x) = x^{2}$, ¿es inyectiva?',
    opciones: [
      'Sí: en ese dominio, dos valores distintos de $x$ nunca tienen la misma imagen',
      'No, porque no es sobreyectiva',
      'No, porque $f(-2) = f(2)$',
      'Solo si $x$ es entero',
    ],
    correcta: 0,
    explicacion: 'El $-2$ no pertenece al dominio, así que ese contraejemplo no vale. Para $x \\ge 0$, $x^{2}$ es estrictamente creciente y no repite valores. Ser inyectiva y ser sobreyectiva son propiedades distintas.',
  },

  /* ── Función inversa ────────────────────────────────────────────────── */
  {
    id: 'alg-163', temaId: 'alg-funciones-7', dificultad: 0.35,
    enunciado: 'Si $f(x) = 3x - 6$, ¿cuánto vale $f^{-1}(9)$?',
    opciones: ['$21$', '$1$', '$3$', '$5$'],
    correcta: 3,
    explicacion: '$f^{-1}(9)$ es el $x$ tal que $f(x) = 9$: $3x - 6 = 9$ da $x = 5$. Calcular $f(9) = 21$ es confundir la inversa con la función.',
  },
  {
    id: 'alg-164', temaId: 'alg-funciones-7', dificultad: 0.5,
    enunciado: 'Si $f(x) = \\dfrac{2x + 1}{x - 3}$, ¿cuánto vale $f^{-1}(3)$?',
    opciones: ['$-10$', '$10$', '$4$', '$7$'],
    correcta: 1,
    explicacion: 'Se busca el $x$ con $f(x) = 3$: $2x + 1 = 3(x - 3)$, o sea $2x + 1 = 3x - 9$, y $x = 10$. Se comprueba: $f(10) = \\dfrac{21}{7} = 3$.',
  },

  /* ── Función exponencial ────────────────────────────────────────────── */
  {
    id: 'alg-165', temaId: 'alg-funciones-8', dificultad: 0.3,
    enunciado: 'Resuelve $2^{x + 1} = 32$.',
    opciones: ['$5$', '$3$', '$16$', '$4$'],
    correcta: 3,
    explicacion: 'Como $32 = 2^{5}$, se igualan exponentes: $x + 1 = 5$, así que $x = 4$. Responder 5 es olvidar el $+1$.',
  },
  {
    id: 'alg-166', temaId: 'alg-funciones-8', dificultad: 0.45,
    enunciado: 'Resuelve $9^{x} = 27$.',
    opciones: ['$3$', '$\\dfrac{2}{3}$', '$\\dfrac{3}{2}$', '$\\dfrac{1}{3}$'],
    correcta: 2,
    explicacion: 'Se escriben las dos en base 3: $3^{2x} = 3^{3}$. Entonces $2x = 3$ y $x = \\dfrac{3}{2}$. Invertir la fracción, $\\dfrac{2}{3}$, es el error habitual.',
  },

  /* ── Función logarítmica ────────────────────────────────────────────── */
  {
    id: 'alg-167', temaId: 'alg-funciones-9', dificultad: 0.3,
    enunciado: 'Calcula $\\log_{2} 8 + \\log_{3} 81$.',
    opciones: ['$12$', '$7$', '$6$', '$5$'],
    correcta: 1,
    explicacion: 'El logaritmo es el exponente: $2^{3} = 8$ y $3^{4} = 81$, así que la suma es $3 + 4 = 7$.',
  },
  {
    id: 'alg-168', temaId: 'alg-funciones-9', dificultad: 0.6,
    enunciado: 'Resuelve $\\log(x + 2) + \\log(x - 1) = 1$, con logaritmos en base 10.',
    opciones: ['$4$', '$-4$', '$3$ y $-4$', '$3$'],
    correcta: 3,
    explicacion: 'La suma de logaritmos es el logaritmo del producto: $(x + 2)(x - 1) = 10$, que da $x^{2} + x - 12 = 0$, con raíces 3 y $-4$. Pero el logaritmo exige argumento positivo, y con $-4$ serían negativos. Solo vale 3.',
  },

  /* ── Modelación ─────────────────────────────────────────────────────── */
  {
    id: 'alg-169', temaId: 'alg-funciones-10', dificultad: 0.25,
    enunciado: 'Un taxi cobra S/ 5 al subir más S/ 2 por kilómetro. Si se pagaron S/ 29, ¿cuántos kilómetros se recorrieron?',
    opciones: ['$14$', '$17$', '$12$', '$10$'],
    correcta: 2,
    explicacion: 'El precio es $5 + 2k = 29$, así que $2k = 24$ y $k = 12$. El error habitual es olvidar el cobro fijo y repartir entre 2 el total pagado.',
  },
  {
    id: 'alg-170', temaId: 'alg-funciones-10', dificultad: 0.4,
    enunciado: 'Una población de bacterias se duplica cada hora. Si al inicio hay 50, ¿cuántas habrá a las cinco horas?',
    opciones: ['$500$', '$1600$', '$800$', '$250$'],
    correcta: 1,
    explicacion: 'Duplicarse cada hora es crecer como $50 \\cdot 2^{t}$: a las cinco horas, $50 \\cdot 32 = 1600$. El 250 sale de multiplicar 50 por las cinco horas, como si el crecimiento fuera lineal, y el 800 de contar una hora de menos.',
  },
];
