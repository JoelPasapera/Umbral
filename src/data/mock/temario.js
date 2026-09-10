/**
 * Temario del examen de admisión de San Marcos.
 *
 * Es la columna vertebral del producto. Hasta ahora los temas eran texto libre
 * (`temaId: 'identidades'`), y eso hacía imposible decirle a un alumno "de los
 * 44 temas de aritmética que entran, dominas 9". Con el temario real se puede.
 *
 * Fuente: temario de admisión UNMSM 2027-I. Los cursos de matemática están
 * completos y verificados contra el temario publicado. Los demás cursos existen
 * con su peso en el examen pero sin desglose todavía: se marcan con
 * `detallado: false` para que la interfaz no finja una precisión que no tiene.
 *
 * Dos cosas que este archivo hace posibles y antes no:
 *
 * 1. **El peso real.** El examen no reparte los cursos por porcentajes
 *    redondos: reparte preguntas. Habilidad matemática vale 10 preguntas y
 *    trigonometría 2. Un alumno que se mata con trigonometría está gastando su
 *    tiempo en el curso que menos pesa.
 * 2. **La cobertura por tema**, no por curso. "Te falta trigonometría" no sirve;
 *    "no has tocado transformaciones de suma a producto" sí.
 */

/** Cada pregunta del examen vale 20 puntos. */
export const PUNTOS_POR_PREGUNTA = 20;

/* ------------------------------------------------------------------ *
 *  Temario detallado. Cursos de matemática, verificados contra fuente.
 * ------------------------------------------------------------------ */

export const TEMARIO_UNMSM = {
  'habilidad-matematica': {
    nombre: 'Habilidad matemática',
    familia: 'matematica',
    detallado: true,
    bloques: [
      {
        id: 'hm-cantidad',
        nombre: 'Problemas de cantidad',
        temas: [
          'Máximos y mínimos',
          'Pesadas y balanzas',
          'Arreglos numéricos',
          'Seccionamientos y cortes',
          'Elementos recreativos: dados, cerillos, dominó',
          'Calendarios',
          'Traslados',
        ],
      },
      {
        id: 'hm-cambio',
        nombre: 'Regularidad, equivalencia y cambio',
        temas: [
          'Frecuencia de sucesos',
          'Inductivo numérico, verbal y geométrico',
          'Cronometría',
          'Interpretación de la información: simbolización y ecuaciones',
        ],
      },
      {
        id: 'hm-forma',
        nombre: 'Forma, movimiento y localización',
        temas: [
          'Rotación y traslación de figuras',
          'Rutas, trayectorias y puntos cardinales',
          'Trazo de figuras',
          'Conteo de figuras',
          'Simetría y reflexiones',
          'Visualización de figuras en el espacio',
          'Perímetros y áreas de regiones poligonales y circulares',
          'Ruedas, poleas y engranajes',
          'Congruencia y semejanza de figuras',
        ],
      },
      {
        id: 'hm-datos',
        nombre: 'Gestión de datos e inferencia lógica',
        temas: [
          'Tablas y gráficos estadísticos',
          'Situaciones deportivas',
          'Suficiencia de datos',
          'Certeza',
          'Deducción simple y compuesta',
          'Ordenamiento de la información',
          'Verdades y mentiras',
          'Lazos familiares',
          'Diagramas de flujo',
        ],
      },
    ],
  },

  aritmetica: {
    nombre: 'Aritmética',
    familia: 'matematica',
    detallado: true,
    bloques: [
      {
        id: 'ari-logica',
        nombre: 'Relaciones lógicas y conjuntos',
        temas: [
          'Lógica proposicional y tablas de verdad',
          'Conjuntos: determinación, relaciones y operaciones',
        ],
      },
      {
        id: 'ari-naturales',
        nombre: 'Números naturales',
        temas: ['Operaciones elementales', 'Potenciación y radicación', 'Sistema de numeración decimal'],
      },
      {
        id: 'ari-enteros',
        nombre: 'Números enteros',
        temas: [
          'Operaciones y relaciones de orden',
          'Algoritmo de la división y divisibilidad',
          'Números primos y cantidad de divisores',
          'Máximo común divisor y algoritmo de Euclides',
          'Mínimo común múltiplo',
        ],
      },
      {
        id: 'ari-racionales',
        nombre: 'Números racionales',
        temas: [
          'Fracciones ordinarias y sus clases',
          'Operaciones y relaciones de orden',
          'Representación decimal de una fracción',
        ],
      },
      {
        id: 'ari-razones',
        nombre: 'Razones y proporciones',
        temas: [
          'Series de razones geométricas iguales',
          'Magnitudes proporcionales, reparto y regla de tres',
          'Porcentajes',
          'Sucesiones',
          'Progresiones aritméticas y geométricas',
          'Interés, descuento, mezclas y aleaciones',
        ],
      },
      {
        id: 'ari-estadistica',
        nombre: 'Estadística y probabilidad',
        temas: [
          'Medidas de tendencia central',
          'Medidas de posición: cuartiles, deciles y percentiles',
          'Medidas de dispersión: varianza y desviación estándar',
          'Tablas, gráficos de barras e histogramas',
          'Factorial, combinaciones, variaciones y permutaciones',
          'Probabilidad, espacio muestral y probabilidad condicional',
        ],
      },
    ],
  },

  algebra: {
    nombre: 'Álgebra',
    familia: 'matematica',
    detallado: true,
    bloques: [
      {
        id: 'alg-reales',
        nombre: 'Números reales y complejos',
        temas: [
          'Operaciones con números reales',
          'Intervalos',
          'Valor absoluto',
          'Representación binomial de un número complejo',
          'Módulo y conjugado',
        ],
      },
      {
        id: 'alg-ecuaciones',
        nombre: 'Ecuaciones e inecuaciones',
        temas: [
          'Ecuaciones de primer y segundo grado',
          'Ecuaciones bicuadradas',
          'Inecuaciones de primer y segundo grado',
        ],
      },
      {
        id: 'alg-sistemas',
        nombre: 'Sistemas de ecuaciones',
        temas: [
          'Sistemas lineales con dos y tres variables',
          'Métodos de Cramer y Gauss',
          'Sistemas de inecuaciones con dos variables',
          'Introducción a la programación lineal',
        ],
      },
      {
        id: 'alg-expresiones',
        nombre: 'Expresiones algebraicas',
        temas: [
          'Operaciones con expresiones algebraicas',
          'Potenciación',
          'Radicación',
          'Polinomios y grado',
          'Adición y multiplicación de polinomios',
          'División de polinomios: Ruffini y Horner',
          'Teorema del resto',
          'Teorema del factor',
          'Productos notables, binomio de Newton y cocientes notables',
          'Factorización',
          'MCD y MCM de polinomios',
          'Teorema fundamental del álgebra',
          'Relación entre raíces y coeficientes',
        ],
      },
      {
        id: 'alg-funciones',
        nombre: 'Funciones reales',
        temas: [
          'Dominio y rango',
          'Representación tabular y gráfica',
          'Funciones lineal, cuadrática, raíz cuadrada y valor absoluto',
          'Funciones par e impar',
          'Funciones crecientes y decrecientes',
          'Funciones inyectivas y sobreyectivas',
          'Funciones inversas',
          'Función exponencial',
          'Función logarítmica',
          'Modelación con funciones',
        ],
      },
    ],
  },

  geometria: {
    nombre: 'Geometría',
    familia: 'matematica',
    detallado: true,
    bloques: [
      {
        id: 'geo-basica',
        nombre: 'Segmentos, ángulos y triángulos',
        temas: [
          'Ángulos',
          'Triángulos y congruencia',
          'Desigualdades geométricas',
          'Rectas perpendiculares',
          'Rectas paralelas',
          'Mediatriz y bisectriz como lugares geométricos',
        ],
      },
      {
        id: 'geo-poligonos',
        nombre: 'Polígonos y circunferencia',
        temas: [
          'Cuadriláteros, paralelogramos, trapecios y polígonos',
          'La circunferencia y sus ángulos',
          'Circunferencias inscritas y circunscritas',
          'Puntos notables del triángulo',
        ],
      },
      {
        id: 'geo-semejanza',
        nombre: 'Semejanza y relaciones métricas',
        temas: [
          'Teorema de Tales',
          'Criterios de semejanza',
          'Teorema de Pitágoras',
          'Teorema de la bisectriz',
          'Teorema de la mediana',
          'Relaciones métricas en el triángulo y la circunferencia',
        ],
      },
      {
        id: 'geo-areas',
        nombre: 'Áreas de polígonos y círculos',
        temas: [
          'Postulados y teoremas de área',
          'Áreas de triángulos, cuadriláteros y polígonos',
          'Longitud de la circunferencia',
          'Área del círculo y del sector circular',
        ],
      },
      {
        id: 'geo-poliedros',
        nombre: 'Poliedros',
        temas: ['Prismas y troncos de prisma', 'Pirámides y troncos de pirámide', 'Área lateral y total', 'Volúmenes'],
      },
      {
        id: 'geo-revolucion',
        nombre: 'Cuerpos de revolución',
        temas: [
          'Cilindro y tronco de cilindro',
          'Cono y tronco de cono',
          'Esfera',
          'Áreas de superficies cilíndrica, cónica y esférica',
          'Volúmenes de revolución',
        ],
      },
      {
        id: 'geo-analitica',
        nombre: 'Geometría analítica',
        temas: [
          'Distancia entre dos puntos',
          'Ecuación de la recta',
          'Rectas paralelas y perpendiculares',
          'Ángulo entre dos rectas',
          'Ecuación de la circunferencia',
          'Ecuación de la parábola',
          'Ecuación de la elipse',
        ],
      },
    ],
  },

  trigonometria: {
    nombre: 'Trigonometría',
    familia: 'matematica',
    detallado: true,
    bloques: [
      {
        id: 'tri-angulos',
        nombre: 'Medidas angulares y razones',
        temas: [
          'Sistemas sexagesimal, centesimal y radial',
          'Longitud de arco y área del sector circular',
          'Razones trigonométricas de ángulos agudos y notables',
        ],
      },
      {
        id: 'tri-normal',
        nombre: 'Ángulo en posición normal',
        temas: ['Círculo trigonométrico y reducción al primer cuadrante'],
      },
      {
        id: 'tri-identidades',
        nombre: 'Identidades trigonométricas',
        temas: [
          'Razones de suma y diferencia de ángulos',
          'Razones del ángulo doble y del ángulo mitad',
          'Transformaciones de suma o diferencia a producto',
        ],
      },
      {
        id: 'tri-ecuaciones',
        nombre: 'Ecuaciones trigonométricas',
        temas: ['Ecuaciones elementales y no elementales'],
      },
      {
        id: 'tri-oblicuangulos',
        nombre: 'Triángulos oblicuángulos',
        temas: ['Leyes de senos, cosenos y tangentes', 'Ángulos de elevación y depresión'],
      },
      {
        id: 'tri-funciones',
        nombre: 'Funciones trigonométricas',
        temas: [
          'Dominio, rango y gráfica',
          'Funciones trigonométricas inversas',
          'Aplicaciones de las funciones trigonométricas',
        ],
      },
    ],
  },
};

/** Cursos que existen en el examen pero cuyo temario todavía no se ha cargado. */
const SIN_DETALLE = {
  'habilidad-verbal': 'Habilidad verbal',
  lenguaje: 'Lenguaje',
  literatura: 'Literatura',
  'historia-peru': 'Historia del Perú',
  'historia-universal': 'Historia universal',
  geografia: 'Geografía',
  economia: 'Economía',
  filosofia: 'Filosofía',
  psicologia: 'Psicología',
  civica: 'Educación cívica',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biología',
};

for (const [id, nombre] of Object.entries(SIN_DETALLE)) {
  TEMARIO_UNMSM[id] = { nombre, familia: 'otros', detallado: false, bloques: [] };
}

/* ------------------------------------------------------------------ *
 *  Peso del examen. No son porcentajes: son preguntas.
 * ------------------------------------------------------------------ */

/**
 * Área D verificada contra el temario publicado: 10 actitudinales fuera del
 * cómputo, 10 de habilidad verbal, 10 de matemática y 70 de conocimientos.
 * Las demás áreas son estimaciones y se marcan como tales: la interfaz avisa
 * en vez de aparentar una precisión que no tenemos.
 */
export const AREAS_UNMSM = {
  A: {
    nombre: 'Ciencias de la Salud',
    verificado: false,
    preguntas: {
      'habilidad-verbal': 10, 'habilidad-matematica': 10,
      biologia: 12, quimica: 10, fisica: 6,
      aritmetica: 5, algebra: 4, geometria: 4, trigonometria: 3,
      lenguaje: 4, literatura: 3, 'historia-peru': 3, 'historia-universal': 2,
      geografia: 2, economia: 2, filosofia: 2, psicologia: 3, civica: 5,
    },
  },
  B: {
    nombre: 'Ciencias Básicas e Ingenierías',
    verificado: false,
    preguntas: {
      'habilidad-verbal': 10, 'habilidad-matematica': 10,
      aritmetica: 8, algebra: 8, geometria: 7, trigonometria: 6,
      fisica: 10, quimica: 8, biologia: 3,
      lenguaje: 4, literatura: 2, 'historia-peru': 3, 'historia-universal': 2,
      geografia: 2, economia: 2, filosofia: 2, psicologia: 1, civica: 2,
    },
  },
  D: {
    nombre: 'Ciencias Económicas y de la Gestión',
    verificado: true,
    preguntas: {
      'habilidad-verbal': 10, 'habilidad-matematica': 10,
      lenguaje: 8, economia: 8, psicologia: 6,
      aritmetica: 4, algebra: 4, geometria: 4, literatura: 4,
      civica: 4, geografia: 4, filosofia: 4, fisica: 4, quimica: 4, biologia: 4,
      'historia-peru': 3, 'historia-universal': 3, trigonometria: 2,
    },
  },
  E: {
    nombre: 'Humanidades y Ciencias Jurídicas',
    verificado: false,
    preguntas: {
      'habilidad-verbal': 10, 'habilidad-matematica': 10,
      lenguaje: 10, literatura: 9, 'historia-peru': 9, 'historia-universal': 5,
      filosofia: 8, psicologia: 5, civica: 5, geografia: 4, economia: 4,
      aritmetica: 3, algebra: 2, geometria: 2, trigonometria: 1,
      fisica: 1, quimica: 1, biologia: 1,
    },
  },
};

/* ------------------------------------------------------------------ *
 *  Consultas
 * ------------------------------------------------------------------ */

/** Cuántos temas tiene un curso en total. */
export function totalTemas(cursoId) {
  const curso = TEMARIO_UNMSM[cursoId];
  if (!curso) return 0;
  return curso.bloques.reduce((suma, b) => suma + b.temas.length, 0);
}

/**
 * Los cursos de un área, con su peso real.
 *
 * `peso` se sigue expresando en porcentaje porque es lo que consume el cálculo
 * de preparación, pero sale de las preguntas, no de un número inventado.
 */
export function cursosDelArea(areaId) {
  const area = AREAS_UNMSM[areaId];
  if (!area) throw new Error(`Área desconocida: ${areaId}`);

  const total = Object.values(area.preguntas).reduce((s, n) => s + n, 0);

  return Object.entries(area.preguntas)
    .map(([cursoId, preguntas]) => ({
      cursoId,
      nombre: TEMARIO_UNMSM[cursoId]?.nombre ?? cursoId,
      familia: TEMARIO_UNMSM[cursoId]?.familia ?? 'otros',
      detallado: TEMARIO_UNMSM[cursoId]?.detallado === true,
      preguntas,
      puntos: preguntas * PUNTOS_POR_PREGUNTA,
      temas: totalTemas(cursoId),
      peso: (preguntas / total) * 100,
    }))
    .sort((a, b) => b.preguntas - a.preguntas || a.nombre.localeCompare(b.nombre, 'es'));
}

/** @param {string} areaId */
export const areaVerificada = (areaId) => AREAS_UNMSM[areaId]?.verificado === true;

/** Todos los temas de un curso, aplanados, con su bloque. */
export function temasDe(cursoId) {
  const curso = TEMARIO_UNMSM[cursoId];
  if (!curso) return [];
  return curso.bloques.flatMap((bloque) =>
    bloque.temas.map((nombre, i) => ({
      id: `${bloque.id}-${i + 1}`,
      nombre,
      bloqueId: bloque.id,
      bloque: bloque.nombre,
      cursoId,
    })),
  );
}

/** Solo los cursos de matemática, que son los que ya tienen temario cargado. */
export const cursosDeMatematica = () =>
  Object.entries(TEMARIO_UNMSM)
    .filter(([, c]) => c.familia === 'matematica')
    .map(([cursoId, c]) => ({ cursoId, ...c }));
