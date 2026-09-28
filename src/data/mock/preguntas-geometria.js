/**
 * Banco de Geometría.
 *
 * Cubre los treinta y seis temas del curso con dos preguntas cada uno: ángulos
 * y triángulos, polígonos y circunferencia, semejanza y relaciones métricas,
 * áreas, poliedros, sólidos de revolución y geometría analítica.
 *
 * Mismas reglas que los demás bancos. Las preguntas se escribieron sin figura:
 * cada una da en palabras los datos que el dibujo daría, de modo que se puede
 * resolver con lápiz y papel igual que en el examen.
 *
 * La posición de la respuesta no se eligió a mano. En los bancos anteriores
 * elegirla así dejó rachas de A, B, C, D que bastaba con contar; aquí la
 * asignó un guion con un orden sin rotaciones ni tres iguales seguidas.
 *
 * `pruebas/geometria.test.mjs` recalcula cada respuesta, casi siempre
 * construyendo la figura con coordenadas: coloca el triángulo, traza la
 * bisectriz, mide la mediana, busca el punto que equidista de los vértices.
 */

/** @type {object[]} */
export const GEOMETRIA = [
  /* ── Ángulos ────────────────────────────────────────────────────────── */
  {
    id: 'geo-101', temaId: 'geo-basica-1', dificultad: 0.3,
    enunciado: 'El complemento de un ángulo mide $25^{\\circ}$. ¿Cuánto mide su suplemento?',
    opciones: ['$65^{\\circ}$', '$155^{\\circ}$', '$115^{\\circ}$', '$25^{\\circ}$'],
    correcta: 2,
    explicacion: 'Si el complemento es $25^{\\circ}$, el ángulo mide $90^{\\circ} - 25^{\\circ} = 65^{\\circ}$, y su suplemento $180^{\\circ} - 65^{\\circ} = 115^{\\circ}$. Responder 65 es quedarse a medio camino.',
  },
  {
    id: 'geo-102', temaId: 'geo-basica-1', dificultad: 0.3,
    enunciado: 'Dos ángulos adyacentes suplementarios están en la razón de 2 a 7. ¿Cuánto mide el menor?',
    opciones: ['$36^{\\circ}$', '$20^{\\circ}$', '$140^{\\circ}$', '$40^{\\circ}$'],
    correcta: 3,
    explicacion: 'Suplementarios suman $180^{\\circ}$, repartidos en $2 + 7 = 9$ partes de $20^{\\circ}$. El menor tiene dos partes: $40^{\\circ}$. Si sumaran $90^{\\circ}$ serían complementarios, y ahí saldría 20.',
  },

  /* ── Triángulos y congruencia ───────────────────────────────────────── */
  {
    id: 'geo-103', temaId: 'geo-basica-2', dificultad: 0.2,
    enunciado: 'Dos ángulos de un triángulo miden $48^{\\circ}$ y $67^{\\circ}$. ¿Cuánto mide el tercero?',
    opciones: ['$75^{\\circ}$', '$115^{\\circ}$', '$65^{\\circ}$', '$55^{\\circ}$'],
    correcta: 2,
    explicacion: 'Los ángulos interiores de un triángulo suman $180^{\\circ}$: $180^{\\circ} - 48^{\\circ} - 67^{\\circ} = 65^{\\circ}$. El $115^{\\circ}$ es la suma de los dos datos, que es el ángulo exterior.',
  },
  {
    id: 'geo-104', temaId: 'geo-basica-2', dificultad: 0.35,
    enunciado: 'Un ángulo exterior de un triángulo mide $130^{\\circ}$ y uno de los interiores no adyacentes a él mide $70^{\\circ}$. ¿Cuánto mide el otro interior no adyacente?',
    opciones: ['$110^{\\circ}$', '$50^{\\circ}$', '$70^{\\circ}$', '$60^{\\circ}$'],
    correcta: 3,
    explicacion: 'Un ángulo exterior es igual a la suma de los dos interiores no adyacentes: $130^{\\circ} = 70^{\\circ} + x$, así que $x = 60^{\\circ}$. El $50^{\\circ}$ es el interior adyacente, $180^{\\circ} - 130^{\\circ}$.',
  },

  /* ── Desigualdades geométricas ──────────────────────────────────────── */
  {
    id: 'geo-105', temaId: 'geo-basica-3', dificultad: 0.45,
    enunciado: 'Dos lados de un triángulo miden 5 y 9. ¿Cuántos valores enteros puede tomar el tercer lado?',
    opciones: ['$10$', '$8$', '$9$', '$13$'],
    correcta: 2,
    explicacion: 'Cada lado tiene que ser menor que la suma de los otros dos y mayor que su diferencia: $9 - 5 < x < 9 + 5$, o sea $4 < x < 14$. Los enteros van del 5 al 13: son nueve.',
  },
  {
    id: 'geo-106', temaId: 'geo-basica-3', dificultad: 0.4,
    enunciado: 'En un triángulo $ABC$, $AB = 7$, $BC = 10$ y $AC = 12$. ¿Cuál es su mayor ángulo?',
    opciones: ['$\\angle A$', '$\\angle B$', '$\\angle C$', 'Los tres son iguales'],
    correcta: 1,
    explicacion: 'A mayor lado se opone mayor ángulo. El lado mayor es $AC = 12$, y el ángulo opuesto a él es el del vértice que no toca: $B$.',
  },

  /* ── Rectas perpendiculares ─────────────────────────────────────────── */
  {
    id: 'geo-107', temaId: 'geo-basica-4', dificultad: 0.35,
    enunciado: 'Desde un punto $P$ se traza a una recta la perpendicular $PH = 5$ y la oblicua $PA = 13$. ¿Cuánto mide $HA$?',
    opciones: ['$\\sqrt{194}$', '$8$', '$18$', '$12$'],
    correcta: 3,
    explicacion: 'La perpendicular forma un ángulo recto en $H$, así que $PA$ es la hipotenusa: $HA = \\sqrt{13^{2} - 5^{2}} = \\sqrt{144} = 12$. Restar las longitudes, 8, no respeta el teorema de Pitágoras.',
  },
  {
    id: 'geo-108', temaId: 'geo-basica-4', dificultad: 0.3,
    enunciado: 'Las rectas $L_1$ y $L_2$ son perpendiculares. Una tercera recta $L_3$ forma con $L_1$ un ángulo de $35^{\\circ}$. ¿Qué ángulo agudo forma $L_3$ con $L_2$?',
    opciones: ['$125^{\\circ}$', '$35^{\\circ}$', '$145^{\\circ}$', '$55^{\\circ}$'],
    correcta: 3,
    explicacion: 'Entre $L_1$ y $L_2$ hay $90^{\\circ}$, y $L_3$ se lleva 35 de ellos. Con $L_2$ quedan $90^{\\circ} - 35^{\\circ} = 55^{\\circ}$. El $145^{\\circ}$ es el ángulo obtuso, no el agudo.',
  },

  /* ── Rectas paralelas ───────────────────────────────────────────────── */
  {
    id: 'geo-109', temaId: 'geo-basica-5', dificultad: 0.3,
    enunciado: 'Dos rectas paralelas son cortadas por una secante. Dos ángulos alternos internos miden $3x + 10$ y $5x - 30$ grados. ¿Cuánto vale $x$?',
    opciones: ['$25$', '$20$', '$10$', '$15$'],
    correcta: 1,
    explicacion: 'Los ángulos alternos internos entre paralelas son iguales: $3x + 10 = 5x - 30$, así que $2x = 40$ y $x = 20$. Cada ángulo mide $70^{\\circ}$.',
  },
  {
    id: 'geo-110', temaId: 'geo-basica-5', dificultad: 0.35,
    enunciado: 'Dos rectas paralelas cortadas por una secante forman dos ángulos conjugados internos. Si uno mide $70^{\\circ}$, ¿cuánto mide el otro?',
    opciones: ['$20^{\\circ}$', '$70^{\\circ}$', '$110^{\\circ}$', '$90^{\\circ}$'],
    correcta: 2,
    explicacion: 'Los conjugados internos, del mismo lado de la secante y entre las paralelas, son suplementarios: $180^{\\circ} - 70^{\\circ} = 110^{\\circ}$. Iguales son los alternos, no los conjugados.',
  },

  /* ── Mediatriz y bisectriz ──────────────────────────────────────────── */
  {
    id: 'geo-111', temaId: 'geo-basica-6', dificultad: 0.35,
    enunciado: 'Un punto $P$ está sobre la mediatriz del segmento $AB$. Si $PA = 3x - 4$ y $PB = x + 6$, ¿cuánto mide $PA$?',
    opciones: ['$5$', '$11$', '$10$', '$22$'],
    correcta: 1,
    explicacion: 'Todo punto de la mediatriz está a la misma distancia de los extremos: $3x - 4 = x + 6$, de donde $x = 5$ y $PA = 11$. El 5 es el valor de $x$, no la distancia que se pide.',
  },
  {
    id: 'geo-112', temaId: 'geo-basica-6', dificultad: 0.25,
    enunciado: 'Un punto de la bisectriz de un ángulo está a 7 cm de uno de sus lados. ¿A qué distancia está del otro lado?',
    opciones: ['Depende del ángulo', '$14$', '$3{,}5$', '$7$'],
    correcta: 3,
    explicacion: 'La bisectriz es justamente el conjunto de puntos que están a la misma distancia de los dos lados del ángulo. Si está a 7 cm de uno, está a 7 cm del otro, sea cual sea la abertura.',
  },

  /* ── Polígonos ──────────────────────────────────────────────────────── */
  {
    id: 'geo-113', temaId: 'geo-poligonos-1', dificultad: 0.3,
    enunciado: '¿Cuánto suman los ángulos interiores de un octógono?',
    opciones: ['$1080^{\\circ}$', '$1440^{\\circ}$', '$900^{\\circ}$', '$360^{\\circ}$'],
    correcta: 0,
    explicacion: 'Desde un vértice, un polígono de $n$ lados se divide en $n - 2$ triángulos. Con 8 lados son 6 triángulos: $6 \\cdot 180^{\\circ} = 1080^{\\circ}$. Los $360^{\\circ}$ son la suma de los exteriores.',
  },
  {
    id: 'geo-114', temaId: 'geo-poligonos-1', dificultad: 0.4,
    enunciado: '¿Cuántas diagonales tiene un polígono de 10 lados?',
    opciones: ['$35$', '$45$', '$70$', '$30$'],
    correcta: 0,
    explicacion: 'De cada vértice salen diagonales hacia todos los demás salvo él mismo y sus dos vecinos: 7. Son $10 \\cdot 7 = 70$ extremos, y cada diagonal tiene dos, así que hay 35. El 45 cuenta también los lados.',
  },

  /* ── Circunferencia y ángulos ───────────────────────────────────────── */
  {
    id: 'geo-115', temaId: 'geo-poligonos-2', dificultad: 0.3,
    enunciado: 'Un ángulo inscrito en una circunferencia abarca un arco de $110^{\\circ}$. ¿Cuánto mide el ángulo?',
    opciones: ['$220^{\\circ}$', '$110^{\\circ}$', '$55^{\\circ}$', '$70^{\\circ}$'],
    correcta: 2,
    explicacion: 'Un ángulo inscrito mide la mitad del arco que abarca: $\\dfrac{110^{\\circ}}{2} = 55^{\\circ}$. Mediría lo mismo que el arco si el vértice estuviera en el centro.',
  },
  {
    id: 'geo-116', temaId: 'geo-poligonos-2', dificultad: 0.3,
    enunciado: '¿Cuánto mide un ángulo inscrito en una semicircunferencia?',
    opciones: ['$90^{\\circ}$', '$180^{\\circ}$', '$45^{\\circ}$', '$60^{\\circ}$'],
    correcta: 0,
    explicacion: 'Abarca media circunferencia, un arco de $180^{\\circ}$, y el ángulo inscrito mide la mitad: $90^{\\circ}$. Por eso todo triángulo con un lado como diámetro es rectángulo.',
  },

  /* ── Circunferencias inscrita y circunscrita ────────────────────────── */
  {
    id: 'geo-117', temaId: 'geo-poligonos-3', dificultad: 0.45,
    enunciado: '¿Cuál es el radio de la circunferencia circunscrita a un triángulo rectángulo de catetos 6 y 8?',
    opciones: ['$4$', '$10$', '$5$', '$7$'],
    correcta: 2,
    explicacion: 'En un triángulo rectángulo la hipotenusa es un diámetro de la circunscrita. La hipotenusa mide $\\sqrt{36 + 64} = 10$, así que el radio es 5. Responder 10 confunde diámetro con radio.',
  },
  {
    id: 'geo-118', temaId: 'geo-poligonos-3', dificultad: 0.55,
    enunciado: '¿Cuál es el radio de la circunferencia inscrita en un triángulo rectángulo de catetos 6 y 8?',
    opciones: ['$5$', '$3$', '$4$', '$2$'],
    correcta: 3,
    explicacion: 'El área es $\\dfrac{6 \\cdot 8}{2} = 24$ y el semiperímetro, $\\dfrac{6 + 8 + 10}{2} = 12$. El radio inscrito es el área entre el semiperímetro: 2. En un triángulo rectángulo también sale de $\\dfrac{6 + 8 - 10}{2}$.',
  },

  /* ── Puntos notables ────────────────────────────────────────────────── */
  {
    id: 'geo-119', temaId: 'geo-poligonos-4', dificultad: 0.4,
    enunciado: 'Una mediana de un triángulo mide 18. ¿Cuánto mide el tramo que va del vértice al baricentro?',
    opciones: ['$15$', '$9$', '$6$', '$12$'],
    correcta: 3,
    explicacion: 'El baricentro divide cada mediana en dos tramos que están en la razón de 2 a 1, con el largo del lado del vértice: $\\dfrac{2}{3} \\cdot 18 = 12$. Pensar que la parte por la mitad da 9.',
  },
  {
    id: 'geo-120', temaId: 'geo-poligonos-4', dificultad: 0.35,
    enunciado: '¿Qué punto notable de un triángulo es el centro de su circunferencia circunscrita?',
    opciones: ['El circuncentro', 'El incentro', 'El baricentro', 'El ortocentro'],
    correcta: 0,
    explicacion: 'El circuncentro es el cruce de las mediatrices, y todo punto de una mediatriz equidista de sus extremos: por eso está a la misma distancia de los tres vértices. El incentro equidista de los lados, no de los vértices.',
  },

  /* ── Teorema de Tales ───────────────────────────────────────────────── */
  {
    id: 'geo-121', temaId: 'geo-semejanza-1', dificultad: 0.35,
    enunciado: 'Tres rectas paralelas cortan a dos secantes. En la primera secante determinan segmentos de 4 y 6; en la segunda, el primer segmento mide 10. ¿Cuánto mide el segundo?',
    opciones: ['$15$', '$12$', '$\\dfrac{20}{3}$', '$24$'],
    correcta: 0,
    explicacion: 'Las paralelas cortan segmentos proporcionales: $\\dfrac{4}{6} = \\dfrac{10}{x}$, así que $x = 15$. Poner la proporción al revés da $\\dfrac{20}{3}$.',
  },
  {
    id: 'geo-122', temaId: 'geo-semejanza-1', dificultad: 0.4,
    enunciado: 'En un triángulo $ABC$, una recta paralela a $BC$ corta a $AB$ en $M$ y a $AC$ en $N$. Si $AM = 3$, $MB = 6$ y $AN = 4$, ¿cuánto mide $NC$?',
    opciones: ['$2$', '$8$', '$12$', '$6$'],
    correcta: 1,
    explicacion: 'Una paralela a un lado divide a los otros dos en la misma razón: $\\dfrac{AM}{MB} = \\dfrac{AN}{NC}$, o sea $\\dfrac{3}{6} = \\dfrac{4}{NC}$, y $NC = 8$.',
  },

  /* ── Criterios de semejanza ─────────────────────────────────────────── */
  {
    id: 'geo-123', temaId: 'geo-semejanza-2', dificultad: 0.4,
    enunciado: 'Dos triángulos semejantes tienen lados homólogos de 4 y 10. Si el perímetro del menor es 18, ¿cuál es el perímetro del mayor?',
    opciones: ['$24$', '$45$', '$112{,}5$', '$36$'],
    correcta: 1,
    explicacion: 'Los perímetros están en la misma razón que los lados, $\\dfrac{10}{4}$: $18 \\cdot \\dfrac{10}{4} = 45$. Elevar la razón al cuadrado, 112,5, sería correcto para las áreas.',
  },
  {
    id: 'geo-124', temaId: 'geo-semejanza-2', dificultad: 0.35,
    enunciado: 'Los lados de un triángulo miden 6, 8 y 10. Un triángulo semejante tiene su lado menor igual a 9. ¿Cuánto mide su lado mayor?',
    opciones: ['$15$', '$13$', '$12$', '$20$'],
    correcta: 0,
    explicacion: 'La razón de semejanza es $\\dfrac{9}{6} = 1{,}5$, y todos los lados se multiplican por ella: $10 \\cdot 1{,}5 = 15$. Sumar la diferencia, $10 + 3 = 13$, no conserva la forma.',
  },

  /* ── Teorema de Pitágoras ───────────────────────────────────────────── */
  {
    id: 'geo-125', temaId: 'geo-semejanza-3', dificultad: 0.25,
    enunciado: '¿Cuánto mide la diagonal de un rectángulo de lados 9 y 12?',
    opciones: ['$15$', '$21$', '$\\sqrt{63}$', '$13$'],
    correcta: 0,
    explicacion: 'La diagonal es la hipotenusa de un triángulo rectángulo con esos lados: $\\sqrt{81 + 144} = \\sqrt{225} = 15$.',
  },
  {
    id: 'geo-126', temaId: 'geo-semejanza-3', dificultad: 0.3,
    enunciado: 'Una escalera de 10 m se apoya en una pared vertical y su pie queda a 6 m de la pared. ¿A qué altura toca la pared?',
    opciones: ['$\\sqrt{136}$', '$4$', '$8$', '$16$'],
    correcta: 2,
    explicacion: 'La escalera es la hipotenusa: $\\sqrt{10^{2} - 6^{2}} = \\sqrt{64} = 8$ m. Sumar los cuadrados en vez de restarlos da $\\sqrt{136}$, más largo que la propia escalera.',
  },

  /* ── Teorema de la bisectriz ────────────────────────────────────────── */
  {
    id: 'geo-127', temaId: 'geo-semejanza-4', dificultad: 0.5,
    enunciado: 'En un triángulo $ABC$, $AB = 6$, $AC = 9$ y $BC = 10$. La bisectriz del ángulo $A$ corta a $BC$ en $D$. ¿Cuánto mide $BD$?',
    opciones: ['$5$', '$6$', '$4$', '$\\dfrac{20}{3}$'],
    correcta: 2,
    explicacion: 'La bisectriz divide el lado opuesto en la razón de los lados que forman el ángulo: $\\dfrac{BD}{DC} = \\dfrac{6}{9}$. Repartiendo 10 en $6 + 9 = 15$ partes, $BD = 10 \\cdot \\dfrac{6}{15} = 4$. Pensar que corta por la mitad da 5.',
  },
  {
    id: 'geo-128', temaId: 'geo-semejanza-4', dificultad: 0.5,
    enunciado: 'La bisectriz interior de un ángulo de un triángulo divide al lado opuesto en segmentos de 3 y 5. Si el lado adyacente al segmento de 3 mide 6, ¿cuánto mide el otro lado que forma el ángulo?',
    opciones: ['$10$', '$8$', '$\\dfrac{18}{5}$', '$15$'],
    correcta: 0,
    explicacion: 'Cada segmento es proporcional a su lado adyacente: $\\dfrac{3}{6} = \\dfrac{5}{x}$, así que $x = 10$. Cruzar los segmentos con los lados equivocados da $\\dfrac{18}{5}$.',
  },

  /* ── Teorema de la mediana ──────────────────────────────────────────── */
  {
    id: 'geo-129', temaId: 'geo-semejanza-5', dificultad: 0.6,
    enunciado: 'En un triángulo de lados $a = 8$, $b = 6$ y $c = 4$, ¿cuánto mide la mediana relativa al lado $a$?',
    opciones: ['$\\sqrt{10}$', '$4$', '$\\sqrt{26}$', '$5$'],
    correcta: 0,
    explicacion: 'Por el teorema de la mediana, $m_a^{2} = \\dfrac{2b^{2} + 2c^{2} - a^{2}}{4} = \\dfrac{72 + 32 - 64}{4} = 10$. La mediana mide $\\sqrt{10}$.',
  },
  {
    id: 'geo-130', temaId: 'geo-semejanza-5', dificultad: 0.4,
    enunciado: 'En un triángulo rectángulo la hipotenusa mide 26. ¿Cuánto mide la mediana relativa a la hipotenusa?',
    opciones: ['$12$', '$26$', '$13$', '$10$'],
    correcta: 2,
    explicacion: 'El punto medio de la hipotenusa es el centro de la circunferencia circunscrita, así que está a la misma distancia de los tres vértices: la mitad de la hipotenusa, 13.',
  },

  /* ── Relaciones métricas ────────────────────────────────────────────── */
  {
    id: 'geo-131', temaId: 'geo-semejanza-6', dificultad: 0.5,
    enunciado: 'En un triángulo rectángulo, la altura relativa a la hipotenusa la divide en segmentos de 4 y 9. ¿Cuánto mide esa altura?',
    opciones: ['$13$', '$6$', '$\\sqrt{13}$', '$36$'],
    correcta: 1,
    explicacion: 'La altura sobre la hipotenusa es media proporcional entre los dos segmentos: $h^{2} = 4 \\cdot 9 = 36$, así que $h = 6$. El 36 es $h^{2}$, no la altura.',
  },
  {
    id: 'geo-132', temaId: 'geo-semejanza-6', dificultad: 0.55,
    enunciado: 'Desde un punto exterior a una circunferencia se traza una tangente de longitud 6 y una secante cuyo segmento exterior mide 4. ¿Cuánto mide la secante completa?',
    opciones: ['$9$', '$5$', '$10$', '$\\dfrac{3}{2}$'],
    correcta: 0,
    explicacion: 'La tangente al cuadrado es igual al segmento exterior por la secante completa: $36 = 4 \\cdot s$, así que $s = 9$. La parte interior mide $9 - 4 = 5$, que no es lo que se pide.',
  },

  /* ── Postulados de área ─────────────────────────────────────────────── */
  {
    id: 'geo-133', temaId: 'geo-areas-1', dificultad: 0.3,
    enunciado: 'Si se duplican los lados de un cuadrado, ¿por cuánto se multiplica su área?',
    opciones: ['$8$', '$2$', '$4$', '$16$'],
    correcta: 2,
    explicacion: 'El área depende del lado al cuadrado: $(2L)^{2} = 4L^{2}$. Duplicar el lado cuadruplica el área. El 8 sería lo que pasa con el volumen de un cubo.',
  },
  {
    id: 'geo-134', temaId: 'geo-areas-1', dificultad: 0.3,
    enunciado: 'Dos triángulos tienen la misma altura. Si la base de uno es el triple de la del otro, ¿cuál es la razón de sus áreas?',
    opciones: ['$\\dfrac{3}{2}$', '$9$', '$3$', '$6$'],
    correcta: 2,
    explicacion: 'Con la misma altura, el área es proporcional a la base: $\\dfrac{3b \\cdot h / 2}{b \\cdot h / 2} = 3$. Elevar al cuadrado, 9, solo vale cuando se escalan todas las medidas.',
  },

  /* ── Áreas de polígonos ─────────────────────────────────────────────── */
  {
    id: 'geo-135', temaId: 'geo-areas-2', dificultad: 0.55,
    enunciado: '¿Cuál es el área de un triángulo de lados 13, 14 y 15?',
    opciones: ['$84$', '$42$', '$168$', '$91$'],
    correcta: 0,
    explicacion: 'Con la fórmula de Herón: el semiperímetro es 21, y el área es $\\sqrt{21 \\cdot 8 \\cdot 7 \\cdot 6} = \\sqrt{7056} = 84$. Se comprueba también con la altura sobre el lado 14, que mide 12: $\\dfrac{14 \\cdot 12}{2} = 84$.',
  },
  {
    id: 'geo-136', temaId: 'geo-areas-2', dificultad: 0.25,
    enunciado: '¿Cuál es el área de un trapecio de bases 8 y 14 y altura 5?',
    opciones: ['$40$', '$110$', '$70$', '$55$'],
    correcta: 3,
    explicacion: 'Es la semisuma de las bases por la altura: $\\dfrac{8 + 14}{2} \\cdot 5 = 55$. Olvidar dividir entre 2 da 110.',
  },

  /* ── Longitud de la circunferencia ──────────────────────────────────── */
  {
    id: 'geo-137', temaId: 'geo-areas-3', dificultad: 0.2,
    enunciado: '¿Cuánto mide la circunferencia de un círculo de diámetro 14?',
    opciones: ['$28\\pi$', '$7\\pi$', '$14\\pi$', '$49\\pi$'],
    correcta: 2,
    explicacion: 'La longitud es $\\pi$ por el diámetro, o $2\\pi$ por el radio: $14\\pi$. Usar $2\\pi$ con el diámetro da $28\\pi$, el doble.',
  },
  {
    id: 'geo-138', temaId: 'geo-areas-3', dificultad: 0.45,
    enunciado: 'Una rueda de 30 cm de radio da 50 vueltas. Con $\\pi = 3{,}14$, ¿cuántos metros recorre?',
    opciones: ['$47{,}1$', '$94{,}2$', '$9420$', '$15$'],
    correcta: 1,
    explicacion: 'En cada vuelta recorre su circunferencia: $2 \\cdot 3{,}14 \\cdot 0{,}30 = 1{,}884$ m. En 50 vueltas, $94{,}2$ m. Dejar el radio en centímetros da 9420, que son centímetros y no metros.',
  },

  /* ── Área del círculo y del sector ──────────────────────────────────── */
  {
    id: 'geo-139', temaId: 'geo-areas-4', dificultad: 0.2,
    enunciado: '¿Cuál es el área de un círculo de radio 6?',
    opciones: ['$144\\pi$', '$12\\pi$', '$6\\pi$', '$36\\pi$'],
    correcta: 3,
    explicacion: 'El área es $\\pi r^{2} = 36\\pi$. El $12\\pi$ es la longitud de la circunferencia, y el $144\\pi$ sale de usar el diámetro como si fuera el radio.',
  },
  {
    id: 'geo-140', temaId: 'geo-areas-4', dificultad: 0.4,
    enunciado: '¿Cuál es el área de un sector circular de radio 6 y ángulo central $60^{\\circ}$?',
    opciones: ['$2\\pi$', '$36\\pi$', '$6\\pi$', '$12\\pi$'],
    correcta: 2,
    explicacion: 'El sector es la fracción del círculo que marca su ángulo: $\\dfrac{60}{360} = \\dfrac{1}{6}$ de $36\\pi$, o sea $6\\pi$. El $2\\pi$ es la longitud de su arco, no su área.',
  },

  /* ── Prismas ────────────────────────────────────────────────────────── */
  {
    id: 'geo-141', temaId: 'geo-poliedros-1', dificultad: 0.25,
    enunciado: '¿Cuántos vértices tiene un prisma de base pentagonal?',
    opciones: ['$15$', '$5$', '$10$', '$7$'],
    correcta: 2,
    explicacion: 'Un prisma tiene dos bases iguales, y cada una aporta sus vértices: $5 + 5 = 10$. Las 15 son sus aristas.',
  },
  {
    id: 'geo-142', temaId: 'geo-poliedros-1', dificultad: 0.45,
    enunciado: '¿Cuánto mide la diagonal de un ortoedro de dimensiones 2, 3 y 6?',
    opciones: ['$6$', '$11$', '$\\sqrt{13}$', '$7$'],
    correcta: 3,
    explicacion: 'Se aplica Pitágoras dos veces, lo que equivale a sumar los tres cuadrados: $\\sqrt{4 + 9 + 36} = \\sqrt{49} = 7$. La $\\sqrt{13}$ es solo la diagonal de la cara de 2 por 3.',
  },

  /* ── Pirámides ──────────────────────────────────────────────────────── */
  {
    id: 'geo-143', temaId: 'geo-poliedros-2', dificultad: 0.3,
    enunciado: '¿Cuántas aristas tiene una pirámide de base hexagonal?',
    opciones: ['$6$', '$12$', '$18$', '$7$'],
    correcta: 1,
    explicacion: 'Tiene las 6 aristas de la base y 6 laterales que suben al vértice: 12. Se comprueba con Euler: 7 vértices y 7 caras dan $7 + 7 - 2 = 12$.',
  },
  {
    id: 'geo-144', temaId: 'geo-poliedros-2', dificultad: 0.5,
    enunciado: 'Una pirámide regular de base cuadrada tiene arista básica 6 y altura 4. ¿Cuánto mide su apotema, la altura de cada cara lateral?',
    opciones: ['$5$', '$4$', '$\\sqrt{52}$', '$7$'],
    correcta: 0,
    explicacion: 'La apotema une el vértice con el punto medio de un lado de la base. Forma un triángulo rectángulo con la altura, 4, y la mitad del lado, 3: $\\sqrt{16 + 9} = 5$. Usar el lado entero da $\\sqrt{52}$.',
  },

  /* ── Área lateral y total ───────────────────────────────────────────── */
  {
    id: 'geo-145', temaId: 'geo-poliedros-3', dificultad: 0.2,
    enunciado: '¿Cuál es el área total de un cubo de arista 5?',
    opciones: ['$125$', '$150$', '$100$', '$25$'],
    correcta: 1,
    explicacion: 'Un cubo tiene seis caras de $5 \\cdot 5 = 25$ cada una: $6 \\cdot 25 = 150$. El 125 es su volumen y el 100, su área lateral.',
  },
  {
    id: 'geo-146', temaId: 'geo-poliedros-3', dificultad: 0.4,
    enunciado: 'Una pirámide regular de base cuadrada tiene arista básica 6 y apotema 5. ¿Cuál es su área lateral?',
    opciones: ['$60$', '$120$', '$96$', '$30$'],
    correcta: 0,
    explicacion: 'Son cuatro triángulos de base 6 y altura 5: $4 \\cdot \\dfrac{6 \\cdot 5}{2} = 60$. Sumarle la base, 36, da el área total, 96.',
  },

  /* ── Volúmenes ──────────────────────────────────────────────────────── */
  {
    id: 'geo-147', temaId: 'geo-poliedros-4', dificultad: 0.35,
    enunciado: '¿Cuál es el volumen de una pirámide de base cuadrada de lado 6 y altura 5?',
    opciones: ['$90$', '$180$', '$60$', '$30$'],
    correcta: 2,
    explicacion: 'Una pirámide ocupa un tercio del prisma de la misma base y altura: $\\dfrac{36 \\cdot 5}{3} = 60$. Olvidar el tercio da 180, que es el prisma.',
  },
  {
    id: 'geo-148', temaId: 'geo-poliedros-4', dificultad: 0.4,
    enunciado: 'Un prisma recto tiene por base un triángulo rectángulo de catetos 5 y 6, y altura 10. ¿Cuál es su volumen?',
    opciones: ['$300$', '$150$', '$50$', '$110$'],
    correcta: 1,
    explicacion: 'El volumen es el área de la base por la altura. La base mide $\\dfrac{5 \\cdot 6}{2} = 15$, así que el volumen es 150. Olvidar que el área del triángulo lleva la mitad da 300.',
  },

  /* ── Cilindro ───────────────────────────────────────────────────────── */
  {
    id: 'geo-149', temaId: 'geo-revolucion-1', dificultad: 0.25,
    enunciado: '¿Cuál es el volumen de un cilindro de radio 3 y altura 10?',
    opciones: ['$60\\pi$', '$30\\pi$', '$90\\pi$', '$900\\pi$'],
    correcta: 2,
    explicacion: 'Es el área de la base por la altura: $\\pi \\cdot 3^{2} \\cdot 10 = 90\\pi$. Olvidar elevar el radio al cuadrado da $30\\pi$.',
  },
  {
    id: 'geo-150', temaId: 'geo-revolucion-1', dificultad: 0.35,
    enunciado: '¿Cuál es el área lateral de un cilindro de radio 4 y altura 7?',
    opciones: ['$28\\pi$', '$56\\pi$', '$112\\pi$', '$88\\pi$'],
    correcta: 1,
    explicacion: 'Desenrollada, la superficie lateral es un rectángulo de largo $2\\pi r$ y ancho la altura: $2\\pi \\cdot 4 \\cdot 7 = 56\\pi$. Sumarle las dos tapas da el área total, $88\\pi$.',
  },

  /* ── Cono ───────────────────────────────────────────────────────────── */
  {
    id: 'geo-151', temaId: 'geo-revolucion-2', dificultad: 0.3,
    enunciado: '¿Cuál es el volumen de un cono de radio 3 y altura 4?',
    opciones: ['$36\\pi$', '$12\\pi$', '$15\\pi$', '$4\\pi$'],
    correcta: 1,
    explicacion: 'Un cono ocupa un tercio del cilindro de la misma base y altura: $\\dfrac{\\pi \\cdot 9 \\cdot 4}{3} = 12\\pi$. Sin el tercio sale el cilindro, $36\\pi$.',
  },
  {
    id: 'geo-152', temaId: 'geo-revolucion-2', dificultad: 0.3,
    enunciado: 'Un cono tiene radio 6 y altura 8. ¿Cuánto mide su generatriz?',
    opciones: ['$\\sqrt{28}$', '$14$', '$10$', '$2$'],
    correcta: 2,
    explicacion: 'La generatriz es la hipotenusa del triángulo que forman la altura y el radio: $\\sqrt{64 + 36} = 10$. Sumarlos, 14, no respeta el ángulo recto.',
  },

  /* ── Esfera ─────────────────────────────────────────────────────────── */
  {
    id: 'geo-153', temaId: 'geo-revolucion-3', dificultad: 0.35,
    enunciado: '¿Cuál es el volumen de una esfera de radio 3?',
    opciones: ['$36\\pi$', '$27\\pi$', '$12\\pi$', '$108\\pi$'],
    correcta: 0,
    explicacion: 'El volumen es $\\dfrac{4}{3}\\pi r^{3} = \\dfrac{4}{3}\\pi \\cdot 27 = 36\\pi$. El $27\\pi$ olvida el factor $\\dfrac{4}{3}$.',
  },
  {
    id: 'geo-154', temaId: 'geo-revolucion-3', dificultad: 0.35,
    enunciado: 'Si se duplica el radio de una esfera, ¿por cuánto se multiplica su volumen?',
    opciones: ['$16$', '$2$', '$4$', '$8$'],
    correcta: 3,
    explicacion: 'El volumen depende del radio al cubo: $(2r)^{3} = 8r^{3}$. El 4 es lo que le pasa a su superficie, que depende del cuadrado.',
  },

  /* ── Superficies de revolución ──────────────────────────────────────── */
  {
    id: 'geo-155', temaId: 'geo-revolucion-4', dificultad: 0.3,
    enunciado: '¿Cuál es el área de la superficie de una esfera de radio 5?',
    opciones: ['$20\\pi$', '$25\\pi$', '$50\\pi$', '$100\\pi$'],
    correcta: 3,
    explicacion: 'La superficie de una esfera es cuatro veces el área de su círculo máximo: $4\\pi \\cdot 25 = 100\\pi$. El $25\\pi$ es solo ese círculo.',
  },
  {
    id: 'geo-156', temaId: 'geo-revolucion-4', dificultad: 0.4,
    enunciado: '¿Cuál es el área lateral de un cono de radio 3 y generatriz 5?',
    opciones: ['$24\\pi$', '$15\\pi$', '$30\\pi$', '$45\\pi$'],
    correcta: 1,
    explicacion: 'El área lateral es $\\pi$ por el radio por la generatriz: $\\pi \\cdot 3 \\cdot 5 = 15\\pi$. Sumarle la base, $9\\pi$, da el área total, $24\\pi$.',
  },

  /* ── Volúmenes de revolución ────────────────────────────────────────── */
  {
    id: 'geo-157', temaId: 'geo-revolucion-5', dificultad: 0.45,
    enunciado: 'Un rectángulo de lados 3 y 5 gira alrededor de su lado de 5. ¿Qué volumen genera?',
    opciones: ['$15\\pi$', '$75\\pi$', '$45\\pi$', '$30\\pi$'],
    correcta: 2,
    explicacion: 'Al girar genera un cilindro: el lado del eje, 5, es la altura, y el otro, 3, es el radio. Volumen: $\\pi \\cdot 9 \\cdot 5 = 45\\pi$. Girar alrededor del lado de 3 daría $75\\pi$.',
  },
  {
    id: 'geo-158', temaId: 'geo-revolucion-5', dificultad: 0.45,
    enunciado: 'Un triángulo rectángulo de catetos 3 y 4 gira alrededor del cateto de 4. ¿Qué volumen genera?',
    opciones: ['$12\\pi$', '$16\\pi$', '$36\\pi$', '$48\\pi$'],
    correcta: 0,
    explicacion: 'Genera un cono con altura 4, el cateto del eje, y radio 3: $\\dfrac{\\pi \\cdot 9 \\cdot 4}{3} = 12\\pi$. Girar alrededor del otro cateto daría $16\\pi$.',
  },

  /* ── Distancia entre dos puntos ─────────────────────────────────────── */
  {
    id: 'geo-159', temaId: 'geo-analitica-1', dificultad: 0.25,
    enunciado: '¿Cuál es la distancia entre los puntos $A(1, 2)$ y $B(7, 10)$?',
    opciones: ['$8$', '$14$', '$\\sqrt{28}$', '$10$'],
    correcta: 3,
    explicacion: 'Las diferencias son 6 en $x$ y 8 en $y$, y la distancia es $\\sqrt{36 + 64} = 10$. Sumar las diferencias, 14, es medir un camino en escalera.',
  },
  {
    id: 'geo-160', temaId: 'geo-analitica-1', dificultad: 0.25,
    enunciado: '¿Cuál es el punto medio del segmento de extremos $(-2, 5)$ y $(6, -1)$?',
    opciones: ['$(8, -6)$', '$(4, 3)$', '$(-4, 3)$', '$(2, 2)$'],
    correcta: 3,
    explicacion: 'Se promedian las coordenadas: $\\left(\\dfrac{-2 + 6}{2}, \\dfrac{5 - 1}{2}\\right) = (2, 2)$. Restar en vez de sumar lleva a $(-4, 3)$.',
  },

  /* ── Ecuación de la recta ───────────────────────────────────────────── */
  {
    id: 'geo-161', temaId: 'geo-analitica-2', dificultad: 0.25,
    enunciado: '¿Cuál es la pendiente de la recta que pasa por $(1, 3)$ y $(4, 12)$?',
    opciones: ['$\\dfrac{1}{3}$', '$3$', '$9$', '$-3$'],
    correcta: 1,
    explicacion: 'La pendiente es cuánto sube por cada unidad que avanza: $\\dfrac{12 - 3}{4 - 1} = \\dfrac{9}{3} = 3$. Poner la diferencia de $x$ arriba da $\\dfrac{1}{3}$.',
  },
  {
    id: 'geo-162', temaId: 'geo-analitica-2', dificultad: 0.35,
    enunciado: '¿Cuál es la ecuación de la recta de pendiente 2 que pasa por $(1, 5)$?',
    opciones: ['$y = 2x + 5$', '$y = 2x + 3$', '$y = 2x - 3$', '$y = 5x + 2$'],
    correcta: 1,
    explicacion: 'Con $y = 2x + b$ y el punto $(1, 5)$: $5 = 2 + b$, así que $b = 3$. Tomar la ordenada del punto como si fuera el corte con el eje da $y = 2x + 5$.',
  },

  /* ── Paralelas y perpendiculares ────────────────────────────────────── */
  {
    id: 'geo-163', temaId: 'geo-analitica-3', dificultad: 0.35,
    enunciado: '¿Cuál es la pendiente de una recta perpendicular a $y = \\dfrac{2}{3}x + 1$?',
    opciones: ['$-\\dfrac{3}{2}$', '$\\dfrac{3}{2}$', '$\\dfrac{2}{3}$', '$-\\dfrac{2}{3}$'],
    correcta: 0,
    explicacion: 'Dos rectas son perpendiculares si el producto de sus pendientes es $-1$: la pendiente se invierte y cambia de signo, $-\\dfrac{3}{2}$. Invertirla sin cambiar el signo es el error más común.',
  },
  {
    id: 'geo-164', temaId: 'geo-analitica-3', dificultad: 0.3,
    enunciado: '¿Para qué valor de $k$ son paralelas las rectas $y = (k - 1)x + 4$ e $y = 5x - 2$?',
    opciones: ['$5$', '$6$', '$4$', '$-4$'],
    correcta: 1,
    explicacion: 'Dos rectas son paralelas si tienen la misma pendiente: $k - 1 = 5$, así que $k = 6$.',
  },

  /* ── Ángulo entre rectas ────────────────────────────────────────────── */
  {
    id: 'geo-165', temaId: 'geo-analitica-4', dificultad: 0.3,
    enunciado: '¿Qué ángulo forman las rectas $y = x$ e $y = -x$?',
    opciones: ['$45^{\\circ}$', '$90^{\\circ}$', '$0^{\\circ}$', '$180^{\\circ}$'],
    correcta: 1,
    explicacion: 'Sus pendientes son 1 y $-1$, cuyo producto es $-1$: son perpendiculares. Cada una forma $45^{\\circ}$ con el eje, pero en sentidos opuestos.',
  },
  {
    id: 'geo-166', temaId: 'geo-analitica-4', dificultad: 0.4,
    enunciado: '¿Qué ángulo agudo forma la recta $y = \\sqrt{3}x$ con el eje $X$?',
    opciones: ['$90^{\\circ}$', '$30^{\\circ}$', '$45^{\\circ}$', '$60^{\\circ}$'],
    correcta: 3,
    explicacion: 'La pendiente es la tangente del ángulo de inclinación. Como $\\tan 60^{\\circ} = \\sqrt{3}$, el ángulo es $60^{\\circ}$. El $30^{\\circ}$ tendría pendiente $\\dfrac{\\sqrt{3}}{3}$.',
  },

  /* ── Circunferencia ─────────────────────────────────────────────────── */
  {
    id: 'geo-167', temaId: 'geo-analitica-5', dificultad: 0.5,
    enunciado: '¿Cuál es el radio de la circunferencia $x^{2} + y^{2} - 6x + 8y = 0$?',
    opciones: ['$10$', '$25$', '$7$', '$5$'],
    correcta: 3,
    explicacion: 'Completando cuadrados: $(x - 3)^{2} + (y + 4)^{2} = 9 + 16 = 25$. El radio es la raíz, 5. Responder 25 es dar el radio al cuadrado.',
  },
  {
    id: 'geo-168', temaId: 'geo-analitica-5', dificultad: 0.3,
    enunciado: '¿Cuál es el centro de la circunferencia $(x + 2)^{2} + (y - 3)^{2} = 16$?',
    opciones: ['$(2, -3)$', '$(-2, 3)$', '$(-2, -3)$', '$(4, 3)$'],
    correcta: 1,
    explicacion: 'La forma es $(x - h)^{2} + (y - k)^{2} = r^{2}$, con centro $(h, k)$. Como $x + 2 = x - (-2)$, el centro es $(-2, 3)$. Copiar los signos tal como aparecen da $(2, -3)$.',
  },

  /* ── Parábola ───────────────────────────────────────────────────────── */
  {
    id: 'geo-169', temaId: 'geo-analitica-6', dificultad: 0.5,
    enunciado: '¿Cuál es el foco de la parábola $x^{2} = 8y$?',
    opciones: ['$(0, 2)$', '$(2, 0)$', '$(0, 8)$', '$(0, 4)$'],
    correcta: 0,
    explicacion: 'La forma es $x^{2} = 4py$, con foco en $(0, p)$. De $4p = 8$ sale $p = 2$: el foco es $(0, 2)$. Como la parábola abre hacia arriba, el foco está sobre el eje $Y$, no sobre el $X$.',
  },
  {
    id: 'geo-170', temaId: 'geo-analitica-6', dificultad: 0.55,
    enunciado: '¿Cuál es la ecuación de la directriz de la parábola $y^{2} = 12x$?',
    opciones: ['$x = -12$', '$x = 3$', '$y = -3$', '$x = -3$'],
    correcta: 3,
    explicacion: 'La forma es $y^{2} = 4px$, con foco en $(p, 0)$ y directriz $x = -p$. De $4p = 12$ sale $p = 3$: la directriz es $x = -3$. La recta $x = 3$ pasa por el foco.',
  },

  /* ── Elipse ─────────────────────────────────────────────────────────── */
  {
    id: 'geo-171', temaId: 'geo-analitica-7', dificultad: 0.4,
    enunciado: 'En la elipse $\\dfrac{x^{2}}{25} + \\dfrac{y^{2}}{9} = 1$, ¿cuánto mide el eje mayor?',
    opciones: ['$6$', '$5$', '$25$', '$10$'],
    correcta: 3,
    explicacion: 'El semieje mayor es $a = \\sqrt{25} = 5$, y el eje mayor es el doble: 10. El 5 es el semieje, y el 25 es $a^{2}$.',
  },
  {
    id: 'geo-172', temaId: 'geo-analitica-7', dificultad: 0.55,
    enunciado: '¿A qué distancia del centro están los focos de la elipse $\\dfrac{x^{2}}{25} + \\dfrac{y^{2}}{9} = 1$?',
    opciones: ['$4$', '$\\sqrt{34}$', '$16$', '$3$'],
    correcta: 0,
    explicacion: 'En la elipse, $c^{2} = a^{2} - b^{2} = 25 - 9 = 16$, así que $c = 4$. Sumar los cuadrados, como en la hipérbola, da $\\sqrt{34}$.',
  },
];
