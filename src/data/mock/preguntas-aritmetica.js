/**
 * Banco de Aritmética.
 *
 * Cubre los veinticinco temas del curso con dos preguntas cada uno, al nivel
 * del examen de San Marcos.
 *
 * Mismas reglas que el banco de trigonometría, y por las mismas razones:
 *
 *   · **La respuesta está repartida entre las cuatro alternativas.** El banco
 *     original las tenía todas en A. Las sesiones además barajan el orden,
 *     pero repartirla al escribir es la primera línea de defensa.
 *   · **Cada `temaId` es un tema de verdad** del temario, no un bloque, para
 *     que el diagnóstico pueda decir qué tema concreto falla.
 *   · **Cada distractor es un error real.** Sumar $n(A)$ y $n(B)$ sin restar la
 *     intersección, sumar porcentajes en vez de multiplicarlos, promediar
 *     precios sin ponderar. La explicación nombra la trampa, porque eso es lo
 *     que el alumno necesita oír después de caer en ella.
 *
 * `pruebas/aritmetica.test.mjs` recalcula cada respuesta desde cero y
 * comprueba que la marcada es la única alternativa que coincide con el
 * cálculo. Si dos alternativas valen lo mismo, la pregunta es irresoluble, y
 * eso también se detecta.
 */

/** @type {object[]} */
export const ARITMETICA = [
  /* ── Lógica proposicional ───────────────────────────────────────────── */
  {
    id: 'ari-101', temaId: 'ari-logica-1', dificultad: 0.35,
    enunciado: '¿En cuántas filas de su tabla de verdad es verdadera $(p \\rightarrow q) \\wedge (q \\rightarrow p)$?',
    opciones: ['$1$', '$3$', '$2$', '$4$'],
    correcta: 2,
    explicacion: 'Es el bicondicional $p \\leftrightarrow q$: solo es verdadero cuando $p$ y $q$ coinciden. De las cuatro filas, eso pasa en VV y en FF, así que son dos.',
  },
  {
    id: 'ari-102', temaId: 'ari-logica-1', dificultad: 0.45,
    enunciado: 'Si $(p \\wedge \\neg q) \\rightarrow r$ es falsa, ¿qué valores toman $p$, $q$ y $r$, en ese orden?',
    opciones: ['V, V, F', 'V, F, F', 'F, F, V', 'V, F, V'],
    correcta: 1,
    explicacion: 'Un condicional solo es falso cuando el antecedente es verdadero y el consecuente falso. Entonces $r$ es F, y $p \\wedge \\neg q$ tiene que ser V, lo que obliga a que $p$ sea V y $q$ sea F.',
  },

  /* ── Conjuntos ──────────────────────────────────────────────────────── */
  {
    id: 'ari-103', temaId: 'ari-logica-2', dificultad: 0.3,
    enunciado: 'Si $n(A) = 15$, $n(B) = 12$ y $n(A \\cap B) = 5$, ¿cuánto vale $n(A \\cup B)$?',
    opciones: ['$22$', '$17$', '$32$', '$27$'],
    correcta: 0,
    explicacion: 'Al sumar $n(A)$ y $n(B)$ los elementos comunes se cuentan dos veces, así que se restan una vez: $15 + 12 - 5 = 22$. Sumar sin restar da 27, que es el error más habitual.',
  },
  {
    id: 'ari-104', temaId: 'ari-logica-2', dificultad: 0.35,
    enunciado: 'Un conjunto tiene cuatro elementos. ¿Cuántos subconjuntos propios tiene?',
    opciones: ['$8$', '$16$', '$15$', '$14$'],
    correcta: 2,
    explicacion: 'Un conjunto de $n$ elementos tiene $2^n$ subconjuntos. Los propios son todos menos el propio conjunto: $2^4 - 1 = 15$. Si además se quita el vacío salen 14, pero el vacío sí es un subconjunto propio.',
  },

  /* ── Operaciones con naturales ──────────────────────────────────────── */
  {
    id: 'ari-105', temaId: 'ari-naturales-1', dificultad: 0.25,
    enunciado: 'La suma de dos números es 50 y su diferencia es 14. ¿Cuál es el mayor?',
    opciones: ['$36$', '$32$', '$18$', '$25$'],
    correcta: 1,
    explicacion: 'Sumando las dos igualdades se cancela el menor: el doble del mayor es $50 + 14 = 64$, así que el mayor es 32 y el menor, 18.',
  },
  {
    id: 'ari-106', temaId: 'ari-naturales-1', dificultad: 0.25,
    enunciado: 'Si a un número se le suman su doble y su triple, se obtiene 72. ¿Cuál es el número?',
    opciones: ['$24$', '$18$', '$12$', '$8$'],
    correcta: 2,
    explicacion: 'El número más su doble más su triple son seis veces el número: $6x = 72$, luego $x = 12$.',
  },

  /* ── Potenciación y radicación ──────────────────────────────────────── */
  {
    id: 'ari-107', temaId: 'ari-naturales-2', dificultad: 0.28,
    enunciado: 'Calcula $2^{10} - 10^{2}$.',
    opciones: ['$0$', '$924$', '$1000$', '$1124$'],
    correcta: 1,
    explicacion: '$2^{10} = 1024$ y $10^{2} = 100$, así que la diferencia es 924. Tratar las dos potencias como si fueran iguales lleva a 0, que es la trampa de la pregunta.',
  },
  {
    id: 'ari-108', temaId: 'ari-naturales-2', dificultad: 0.4,
    enunciado: 'Calcula $\\sqrt[3]{0{,}008}$.',
    opciones: ['$0{,}02$', '$2$', '$0{,}004$', '$0{,}2$'],
    correcta: 3,
    explicacion: '$0{,}008 = \\dfrac{8}{1000}$, y su raíz cúbica es $\\dfrac{2}{10} = 0{,}2$. El error típico es sacar la raíz solo al 8 y dejar los decimales como estaban.',
  },

  /* ── Sistema de numeración decimal ──────────────────────────────────── */
  {
    id: 'ari-109', temaId: 'ari-naturales-3', dificultad: 0.22,
    enunciado: '¿Cuántos números de tres cifras existen?',
    opciones: ['$999$', '$1000$', '$900$', '$899$'],
    correcta: 2,
    explicacion: 'Van del 100 al 999: son $999 - 100 + 1 = 900$. El más uno aparece porque se cuentan los dos extremos.',
  },
  {
    id: 'ari-110', temaId: 'ari-naturales-3', dificultad: 0.45,
    enunciado: 'Si $\\overline{ab} + \\overline{ba} = 132$, ¿cuánto vale $a + b$?',
    opciones: ['$12$', '$11$', '$13$', '$6$'],
    correcta: 0,
    explicacion: '$\\overline{ab} = 10a + b$ y $\\overline{ba} = 10b + a$. La suma es $11a + 11b = 11(a + b)$, así que $a + b = \\dfrac{132}{11} = 12$.',
  },

  /* ── Enteros: operaciones y orden ───────────────────────────────────── */
  {
    id: 'ari-111', temaId: 'ari-enteros-1', dificultad: 0.25,
    enunciado: 'Calcula $-3 - (-7) + (-2)(-4)$.',
    opciones: ['$-12$', '$12$', '$2$', '$-2$'],
    correcta: 1,
    explicacion: 'Restar un negativo es sumar: $-3 + 7 = 4$. El producto de dos negativos es positivo: $(-2)(-4) = 8$. En total, $4 + 8 = 12$.',
  },
  {
    id: 'ari-112', temaId: 'ari-enteros-1', dificultad: 0.35,
    enunciado: '¿Cuál es el mayor entero $x$ que cumple $3x - 5 < 16$?',
    opciones: ['$7$', '$8$', '$5$', '$6$'],
    correcta: 3,
    explicacion: 'Se despeja: $3x < 21$, así que $x < 7$. La desigualdad es estricta, de modo que 7 no vale y el mayor entero es 6.',
  },

  /* ── Algoritmo de la división y divisibilidad ───────────────────────── */
  {
    id: 'ari-113', temaId: 'ari-enteros-2', dificultad: 0.25,
    enunciado: '¿Cuál es el residuo de dividir $257$ entre $12$?',
    opciones: ['$21$', '$5$', '$7$', '$1$'],
    correcta: 1,
    explicacion: '$12 \\cdot 21 = 252$ y $257 - 252 = 5$. El residuo tiene que ser menor que el divisor; el 21 es el cociente, no el residuo.',
  },
  {
    id: 'ari-114', temaId: 'ari-enteros-2', dificultad: 0.5,
    enunciado: '¿Qué cifra $a$ hace que $\\overline{5a3}$ sea divisible entre $11$?',
    opciones: ['$8$', '$6$', '$9$', '$2$'],
    correcta: 0,
    explicacion: 'Un número es divisible entre 11 si lo es la suma alternada de sus cifras: $5 - a + 3 = 8 - a$. Con una sola cifra, eso solo es múltiplo de 11 si $a = 8$, y queda $583 = 11 \\cdot 53$.',
  },

  /* ── Primos y cantidad de divisores ─────────────────────────────────── */
  {
    id: 'ari-115', temaId: 'ari-enteros-3', dificultad: 0.45,
    enunciado: '¿Cuántos divisores positivos tiene $360$?',
    opciones: ['$18$', '$20$', '$36$', '$24$'],
    correcta: 3,
    explicacion: '$360 = 2^3 \\cdot 3^2 \\cdot 5$. Se suma uno a cada exponente y se multiplican: $(3 + 1)(2 + 1)(1 + 1) = 24$.',
  },
  {
    id: 'ari-116', temaId: 'ari-enteros-3', dificultad: 0.3,
    enunciado: '¿Cuántos números primos hay entre $20$ y $40$?',
    opciones: ['$3$', '$5$', '$4$', '$6$'],
    correcta: 2,
    explicacion: 'Entre 20 y 40 son primos 23, 29, 31 y 37. Los demás impares tienen divisores: 21, 25, 27, 33, 35 y 39.',
  },

  /* ── Máximo común divisor ───────────────────────────────────────────── */
  {
    id: 'ari-117', temaId: 'ari-enteros-4', dificultad: 0.3,
    enunciado: 'Calcula el MCD de $84$ y $126$.',
    opciones: ['$21$', '$14$', '$84$', '$42$'],
    correcta: 3,
    explicacion: '$84 = 2^2 \\cdot 3 \\cdot 7$ y $126 = 2 \\cdot 3^2 \\cdot 7$. Se toman los factores comunes con su menor exponente: $2 \\cdot 3 \\cdot 7 = 42$.',
  },
  {
    id: 'ari-118', temaId: 'ari-enteros-4', dificultad: 0.5,
    enunciado: 'Con el algoritmo de Euclides, ¿cuál es el MCD de $391$ y $299$?',
    opciones: ['$13$', '$1$', '$17$', '$23$'],
    correcta: 3,
    explicacion: 'Se divide el mayor entre el menor y se sigue con el residuo: $391 = 299 + 92$, $299 = 3 \\cdot 92 + 23$ y $92 = 4 \\cdot 23$. El último divisor, el que deja residuo cero, es 23.',
  },

  /* ── Mínimo común múltiplo ──────────────────────────────────────────── */
  {
    id: 'ari-119', temaId: 'ari-enteros-5', dificultad: 0.3,
    enunciado: 'Calcula el MCM de $12$, $18$ y $30$.',
    opciones: ['$360$', '$90$', '$180$', '$60$'],
    correcta: 2,
    explicacion: '$12 = 2^2 \\cdot 3$, $18 = 2 \\cdot 3^2$ y $30 = 2 \\cdot 3 \\cdot 5$. Se toman todos los factores con su mayor exponente: $2^2 \\cdot 3^2 \\cdot 5 = 180$.',
  },
  {
    id: 'ari-120', temaId: 'ari-enteros-5', dificultad: 0.4,
    enunciado: 'Tres campanas suenan cada 6, 8 y 10 minutos. Si suenan juntas a las 8:00, ¿a qué hora vuelven a sonar juntas?',
    opciones: ['9:00', '8:24', '10:00', '10:40'],
    correcta: 2,
    explicacion: 'Vuelven a coincidir cuando pasa un múltiplo común de los tres intervalos, y el primero es el MCM: 120 minutos, o sea dos horas. De las 8:00 pasan a las 10:00.',
  },

  /* ── Fracciones y sus clases ────────────────────────────────────────── */
  {
    id: 'ari-121', temaId: 'ari-racionales-1', dificultad: 0.3,
    enunciado: '¿Cuál de estas fracciones es irreducible?',
    opciones: ['$\\dfrac{21}{35}$', '$\\dfrac{14}{49}$', '$\\dfrac{18}{24}$', '$\\dfrac{15}{28}$'],
    correcta: 3,
    explicacion: 'Es irreducible cuando numerador y denominador no comparten divisores. $15 = 3 \\cdot 5$ y $28 = 2^2 \\cdot 7$ no comparten ninguno; las otras se simplifican por 7, por 7 y por 6.',
  },
  {
    id: 'ari-122', temaId: 'ari-racionales-1', dificultad: 0.45,
    enunciado: '¿Cuántas fracciones propias e irreducibles tienen denominador $12$?',
    opciones: ['$11$', '$4$', '$6$', '$5$'],
    correcta: 1,
    explicacion: 'El numerador tiene que ser menor que 12 y no compartir factores con él. Como $12 = 2^2 \\cdot 3$, se descartan los pares y los múltiplos de 3: quedan 1, 5, 7 y 11.',
  },

  /* ── Operaciones y orden con fracciones ─────────────────────────────── */
  {
    id: 'ari-123', temaId: 'ari-racionales-2', dificultad: 0.3,
    enunciado: 'Calcula $\\dfrac{2}{3} + \\dfrac{3}{4} - \\dfrac{1}{6}$.',
    opciones: ['$\\dfrac{5}{4}$', '$\\dfrac{4}{11}$', '$\\dfrac{3}{2}$', '$\\dfrac{7}{6}$'],
    correcta: 0,
    explicacion: 'Con denominador común 12: $\\dfrac{8}{12} + \\dfrac{9}{12} - \\dfrac{2}{12} = \\dfrac{15}{12} = \\dfrac{5}{4}$. Sumar numeradores y denominadores por separado da $\\dfrac{4}{11}$, que es la trampa.',
  },
  {
    id: 'ari-124', temaId: 'ari-racionales-2', dificultad: 0.35,
    enunciado: 'Ordena de menor a mayor: $\\dfrac{3}{5}$, $\\dfrac{5}{8}$ y $\\dfrac{2}{3}$.',
    opciones: [
      '$\\dfrac{5}{8} < \\dfrac{3}{5} < \\dfrac{2}{3}$',
      '$\\dfrac{2}{3} < \\dfrac{5}{8} < \\dfrac{3}{5}$',
      '$\\dfrac{3}{5} < \\dfrac{5}{8} < \\dfrac{2}{3}$',
      '$\\dfrac{3}{5} < \\dfrac{2}{3} < \\dfrac{5}{8}$',
    ],
    correcta: 2,
    explicacion: 'Pasando a decimales: $\\dfrac{3}{5} = 0{,}6$, $\\dfrac{5}{8} = 0{,}625$ y $\\dfrac{2}{3} \\approx 0{,}667$. De menor a mayor queda en ese orden.',
  },

  /* ── Representación decimal ─────────────────────────────────────────── */
  {
    id: 'ari-125', temaId: 'ari-racionales-3', dificultad: 0.45,
    enunciado: '¿Qué fracción irreducible genera el decimal $0{,}\\overline{36}$?',
    opciones: ['$\\dfrac{4}{11}$', '$\\dfrac{9}{25}$', '$\\dfrac{36}{100}$', '$\\dfrac{36}{90}$'],
    correcta: 0,
    explicacion: 'Un periódico puro de dos cifras se escribe con ellas sobre 99: $\\dfrac{36}{99}$, que se simplifica a $\\dfrac{4}{11}$. Poner 100 en el denominador es tratarlo como si no se repitiera.',
  },
  {
    id: 'ari-126', temaId: 'ari-racionales-3', dificultad: 0.4,
    enunciado: '¿Cuántas cifras decimales tiene $\\dfrac{7}{40}$?',
    opciones: ['$2$', '$3$', '$4$', 'Infinitas'],
    correcta: 1,
    explicacion: '$40 = 2^3 \\cdot 5$: el denominador solo tiene doses y cincos, así que el decimal es exacto, y el mayor exponente, 3, da las cifras. En efecto, $\\dfrac{7}{40} = 0{,}175$.',
  },

  /* ── Series de razones iguales ──────────────────────────────────────── */
  {
    id: 'ari-127', temaId: 'ari-razones-1', dificultad: 0.35,
    enunciado: 'Si $\\dfrac{a}{3} = \\dfrac{b}{5} = \\dfrac{c}{7}$ y $a + b + c = 45$, ¿cuánto vale $c$?',
    opciones: ['$15$', '$9$', '$35$', '$21$'],
    correcta: 3,
    explicacion: 'Si las tres razones valen $k$, entonces $a = 3k$, $b = 5k$ y $c = 7k$. La suma es $15k = 45$, luego $k = 3$ y $c = 21$.',
  },
  {
    id: 'ari-128', temaId: 'ari-razones-1', dificultad: 0.25,
    enunciado: 'Dos números están en la razón de 3 a 5 y suman 64. ¿Cuál es el menor?',
    opciones: ['$40$', '$24$', '$20$', '$12$'],
    correcta: 1,
    explicacion: 'El total se divide en $3 + 5 = 8$ partes de $\\dfrac{64}{8} = 8$ cada una. El menor tiene tres partes: 24.',
  },

  /* ── Proporcionalidad, reparto y regla de tres ──────────────────────── */
  {
    id: 'ari-129', temaId: 'ari-razones-2', dificultad: 0.35,
    enunciado: 'Seis obreros hacen una obra en 20 días. ¿En cuántos días la harían ocho obreros, trabajando al mismo ritmo?',
    opciones: ['$26{,}7$', '$15$', '$24$', '$10$'],
    correcta: 1,
    explicacion: 'Más obreros tardan menos: es proporcionalidad inversa, así que se conserva el producto. $6 \\cdot 20 = 120$ obrero-días, y $\\dfrac{120}{8} = 15$ días. La regla de tres directa da 26,7, que es la trampa.',
  },
  {
    id: 'ari-130', temaId: 'ari-razones-2', dificultad: 0.3,
    enunciado: 'Se reparten $900$ en partes directamente proporcionales a 2, 3 y 4. ¿Cuánto recibe la mayor parte?',
    opciones: ['$300$', '$450$', '$400$', '$360$'],
    correcta: 2,
    explicacion: 'Se reparte en $2 + 3 + 4 = 9$ partes de $\\dfrac{900}{9} = 100$ cada una. La mayor recibe cuatro partes: 400.',
  },

  /* ── Porcentajes ────────────────────────────────────────────────────── */
  {
    id: 'ari-131', temaId: 'ari-razones-3', dificultad: 0.25,
    enunciado: '¿Cuánto es el 20 % del 30 % de 500?',
    opciones: ['$150$', '$30$', '$250$', '$50$'],
    correcta: 1,
    explicacion: 'Se multiplican los porcentajes: $0{,}2 \\cdot 0{,}3 \\cdot 500 = 30$. Sumarlos, como si fuera el 50 % de 500, da 250.',
  },
  {
    id: 'ari-132', temaId: 'ari-razones-3', dificultad: 0.45,
    enunciado: 'Un precio sube un 20 % y después baja un 20 %. ¿Cómo queda respecto al original?',
    opciones: ['Igual', 'Sube un 4 %', 'Baja un 4 %', 'Baja un 20 %'],
    correcta: 2,
    explicacion: 'El segundo porcentaje se calcula sobre un precio que ya subió. Queda $1{,}2 \\cdot 0{,}8 = 0{,}96$ del original, o sea un 4 % menos. Pensar que un 20 % compensa al otro es la trampa.',
  },

  /* ── Sucesiones ─────────────────────────────────────────────────────── */
  {
    id: 'ari-133', temaId: 'ari-razones-4', dificultad: 0.35,
    enunciado: '¿Qué número sigue en 2, 6, 12, 20, 30, …?',
    opciones: ['$40$', '$44$', '$36$', '$42$'],
    correcta: 3,
    explicacion: 'Las diferencias son 4, 6, 8 y 10, que crecen de dos en dos, así que la siguiente es 12 y el término es $30 + 12 = 42$. También se ve como $n(n + 1)$: $6 \\cdot 7 = 42$.',
  },
  {
    id: 'ari-134', temaId: 'ari-razones-4', dificultad: 0.2,
    enunciado: '¿Qué número sigue en 1, 1, 2, 3, 5, 8, …?',
    opciones: ['$11$', '$16$', '$13$', '$10$'],
    correcta: 2,
    explicacion: 'Cada término es la suma de los dos anteriores: es la sucesión de Fibonacci. Después de 5 y 8 viene $5 + 8 = 13$.',
  },

  /* ── Progresiones ───────────────────────────────────────────────────── */
  {
    id: 'ari-135', temaId: 'ari-razones-5', dificultad: 0.3,
    enunciado: 'En una progresión aritmética, $a_1 = 5$ y la razón es $3$. ¿Cuánto vale $a_{20}$?',
    opciones: ['$62$', '$60$', '$63$', '$65$'],
    correcta: 0,
    explicacion: 'El término general es $a_n = a_1 + (n - 1)r$. Para $n = 20$: $5 + 19 \\cdot 3 = 62$. Multiplicar por 20 en vez de por 19 da 65, porque olvida que el primer término ya está puesto.',
  },
  {
    id: 'ari-136', temaId: 'ari-razones-5', dificultad: 0.45,
    enunciado: '¿Cuánto suman los seis primeros términos de la progresión geométrica 3, 6, 12, …?',
    opciones: ['$189$', '$96$', '$192$', '$381$'],
    correcta: 0,
    explicacion: 'La razón es 2, y la suma es $S_n = a_1 \\cdot \\dfrac{r^n - 1}{r - 1} = 3 \\cdot \\dfrac{64 - 1}{1} = 189$. El 96 es el sexto término, no la suma.',
  },

  /* ── Interés, mezclas y aleaciones ──────────────────────────────────── */
  {
    id: 'ari-137', temaId: 'ari-razones-6', dificultad: 0.35,
    enunciado: '¿Qué interés simple generan S/ 2000 al 5 % anual durante tres años?',
    opciones: ['S/ 100', 'S/ 315,25', 'S/ 300', 'S/ 30'],
    correcta: 2,
    explicacion: 'El interés simple es capital por tasa por tiempo: $2000 \\cdot 0{,}05 \\cdot 3 = 300$. Los S/ 315,25 salen del interés compuesto, que capitaliza cada año.',
  },
  {
    id: 'ari-138', temaId: 'ari-razones-6', dificultad: 0.45,
    enunciado: 'Se mezclan 20 kg de café de S/ 10 el kilo con 30 kg de café de S/ 15 el kilo. ¿A cuánto sale el kilo de la mezcla?',
    opciones: ['S/ 12,50', 'S/ 12', 'S/ 13', 'S/ 14'],
    correcta: 2,
    explicacion: 'El precio medio se pondera por la cantidad: $\\dfrac{20 \\cdot 10 + 30 \\cdot 15}{50} = \\dfrac{650}{50} = 13$. Promediar los precios sin ponderar da 12,50, pero hay más café del caro.',
  },

  /* ── Medidas de tendencia central ───────────────────────────────────── */
  {
    id: 'ari-139', temaId: 'ari-estadistica-1', dificultad: 0.2,
    enunciado: '¿Cuál es la media de los datos 4, 7, 7, 10 y 12?',
    opciones: ['$8$', '$7$', '$9$', '$10$'],
    correcta: 0,
    explicacion: 'Se suman y se divide entre la cantidad de datos: $\\dfrac{4 + 7 + 7 + 10 + 12}{5} = \\dfrac{40}{5} = 8$.',
  },
  {
    id: 'ari-140', temaId: 'ari-estadistica-1', dificultad: 0.35,
    enunciado: '¿Cuál es la mediana de los datos 3, 9, 5, 12, 7 y 1?',
    opciones: ['$5$', '$6$', '$7$', '$8{,}5$'],
    correcta: 1,
    explicacion: 'Primero hay que ordenar: 1, 3, 5, 7, 9, 12. Con seis datos, la mediana es el promedio de los dos centrales: $\\dfrac{5 + 7}{2} = 6$. Sin ordenar se toman 5 y 12, que dan 8,5.',
  },

  /* ── Medidas de posición ────────────────────────────────────────────── */
  {
    id: 'ari-141', temaId: 'ari-estadistica-2', dificultad: 0.45,
    enunciado: 'Para los datos 1, 2, 3, …, 11, ¿cuánto vale el primer cuartil?',
    opciones: ['$3$', '$2{,}75$', '$4$', '$5{,}5$'],
    correcta: 0,
    explicacion: 'Con 11 datos ordenados, el primer cuartil ocupa la posición $\\dfrac{n + 1}{4} = 3$, y el tercer dato es 3. Deja un cuarto de los datos por debajo.',
  },
  {
    id: 'ari-142', temaId: 'ari-estadistica-2', dificultad: 0.3,
    enunciado: 'Para los datos 5, 10, 15, 20, 25, 30, 35, 40 y 45, ¿cuánto vale el percentil 50?',
    opciones: ['$25$', '$22{,}5$', '$20$', '$27{,}5$'],
    correcta: 0,
    explicacion: 'El percentil 50 es la mediana. Con nueve datos ordenados es el quinto: 25.',
  },

  /* ── Medidas de dispersión ──────────────────────────────────────────── */
  {
    id: 'ari-143', temaId: 'ari-estadistica-3', dificultad: 0.5,
    enunciado: '¿Cuál es la varianza poblacional de los datos 2, 4 y 6?',
    opciones: ['$\\dfrac{16}{3}$', '$4$', '$2$', '$\\dfrac{8}{3}$'],
    correcta: 3,
    explicacion: 'La media es 4. La varianza poblacional promedia los cuadrados de las desviaciones: $\\dfrac{4 + 0 + 4}{3} = \\dfrac{8}{3}$. Dividir entre 2, como en la muestral, da 4.',
  },
  {
    id: 'ari-144', temaId: 'ari-estadistica-3', dificultad: 0.55,
    enunciado: '¿Cuál es la desviación estándar poblacional de los datos 1, 3, 5, 7 y 9?',
    opciones: ['$8$', '$2\\sqrt{2}$', '$2$', '$\\sqrt{10}$'],
    correcta: 1,
    explicacion: 'La media es 5 y los cuadrados de las desviaciones suman $16 + 4 + 0 + 4 + 16 = 40$. La varianza poblacional es $\\dfrac{40}{5} = 8$ y la desviación es su raíz: $\\sqrt{8} = 2\\sqrt{2}$. El 8 es la varianza, no la desviación.',
  },

  /* ── Tablas y gráficos ──────────────────────────────────────────────── */
  {
    id: 'ari-145', temaId: 'ari-estadistica-4', dificultad: 0.25,
    enunciado: 'Las frecuencias absolutas de cuatro clases son 4, 6, 10 y 5. ¿Cuál es la frecuencia relativa de la tercera clase?',
    opciones: ['$0{,}40$', '$0{,}25$', '$0{,}10$', '$0{,}20$'],
    correcta: 0,
    explicacion: 'La frecuencia relativa es la de la clase entre el total: $\\dfrac{10}{25} = 0{,}40$, o sea el 40 %.',
  },
  {
    id: 'ari-146', temaId: 'ari-estadistica-4', dificultad: 0.25,
    enunciado: 'Las frecuencias absolutas de cuatro clases son 3, 7, 5 y 5. ¿Cuál es la frecuencia absoluta acumulada hasta la tercera clase?',
    opciones: ['$5$', '$15$', '$12$', '$20$'],
    correcta: 1,
    explicacion: 'La acumulada suma las frecuencias hasta esa clase, ella incluida: $3 + 7 + 5 = 15$.',
  },

  /* ── Conteo ─────────────────────────────────────────────────────────── */
  {
    id: 'ari-147', temaId: 'ari-estadistica-5', dificultad: 0.25,
    enunciado: '¿De cuántas formas distintas se pueden ordenar las letras de la palabra AMOR?',
    opciones: ['$24$', '$16$', '$12$', '$4$'],
    correcta: 0,
    explicacion: 'Son cuatro letras distintas, así que se permutan todas: $4! = 4 \\cdot 3 \\cdot 2 \\cdot 1 = 24$.',
  },
  {
    id: 'ari-148', temaId: 'ari-estadistica-5', dificultad: 0.4,
    enunciado: '¿Cuántos comités de tres personas se pueden formar con siete personas?',
    opciones: ['$21$', '$210$', '$35$', '$343$'],
    correcta: 2,
    explicacion: 'En un comité no importa el orden, así que son combinaciones: $\\dbinom{7}{3} = \\dfrac{7 \\cdot 6 \\cdot 5}{3!} = 35$. Las 210 son variaciones, que sí distinguen el orden.',
  },

  /* ── Probabilidad ───────────────────────────────────────────────────── */
  {
    id: 'ari-149', temaId: 'ari-estadistica-6', dificultad: 0.4,
    enunciado: 'Se lanzan dos dados. ¿Cuál es la probabilidad de que la suma sea 7?',
    opciones: ['$\\dfrac{7}{36}$', '$\\dfrac{1}{6}$', '$\\dfrac{1}{12}$', '$\\dfrac{1}{11}$'],
    correcta: 1,
    explicacion: 'Hay 36 resultados igual de probables y seis suman 7: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2) y (6, 1). La probabilidad es $\\dfrac{6}{36} = \\dfrac{1}{6}$. Las once sumas posibles no son igual de probables, por eso $\\dfrac{1}{11}$ es la trampa.',
  },
  {
    id: 'ari-150', temaId: 'ari-estadistica-6', dificultad: 0.5,
    enunciado: 'Una urna tiene tres bolas rojas y dos azules. Se sacan dos sin reponerlas. ¿Cuál es la probabilidad de que las dos sean rojas?',
    opciones: ['$\\dfrac{9}{25}$', '$\\dfrac{3}{5}$', '$\\dfrac{1}{2}$', '$\\dfrac{3}{10}$'],
    correcta: 3,
    explicacion: 'La primera roja sale con probabilidad $\\dfrac{3}{5}$; sin reponer quedan dos rojas entre cuatro bolas, $\\dfrac{2}{4}$. El producto es $\\dfrac{3}{10}$. Con reposición saldría $\\dfrac{9}{25}$.',
  },
];
