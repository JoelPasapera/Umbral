/**
 * Banco de Física.
 *
 * Cubre los veintiocho temas del temario oficial de admisión 2027-I —los diez
 * bloques del reglamento, de la cinemática a la física moderna— con dos
 * preguntas cada uno.
 *
 * El nivel y el estilo se calibraron con exámenes y simulacros reales de San
 * Marcos: problemas de un concepto o dos, casi siempre dentro de una situación
 * concreta —un auto que frena, un buzo, un foco encendido cinco horas al
 * día— y con $g = 10\ \text{m/s}^{2}$ declarado, que es la convención del
 * examen. Las preguntas son originales: los exámenes sirvieron de guía, no de
 * fuente para copiar.
 *
 * Las unidades van en el enunciado y las alternativas son solo números: así
 * una alternativa no se descarta por la unidad sino por el cálculo, que es lo
 * que se evalúa.
 *
 * `pruebas/fisica.test.mjs` recalcula cada respuesta. Las conceptuales —qué
 * pasa al partir un imán, hacia dónde van las líneas de campo, dónde es máxima
 * la energía cinética de un oscilador— se comprueban con un modelo pequeño
 * del fenómeno, no con la respuesta escrita a mano.
 */

/** @type {object[]} */
export const FISICA = [
  /* ── Magnitudes, vectores y análisis dimensional ────────────────────── */
  {
    id: 'fis-101', temaId: 'fis-cinematica-1', dificultad: 0.25,
    enunciado: 'Sobre un cuerpo actúan dos fuerzas perpendiculares entre sí, de 6 N y 8 N. ¿Cuál es el módulo de la fuerza resultante, en newtons?',
    opciones: ['$48$', '$14$', '$2$', '$10$'],
    correcta: 3,
    explicacion: 'Las fuerzas son vectores: al ser perpendiculares, la resultante es la hipotenusa del triángulo que forman, $\\sqrt{36 + 64} = 10$ N. Sumarlas como números, 14, solo vale si apuntan en la misma dirección.',
  },
  {
    id: 'fis-102', temaId: 'fis-cinematica-1', dificultad: 0.45,
    enunciado: 'En la ecuación $x = A t^{2} + B t$, $x$ es una distancia en metros y $t$ un tiempo en segundos. ¿Qué unidades tiene $A$?',
    opciones: ['$\\text{m} \\cdot \\text{s}^{2}$', '$\\text{m/s}$', '$\\text{m}$', '$\\text{m/s}^{2}$'],
    correcta: 3,
    explicacion: 'Cada término de una suma tiene las unidades del resultado. Si $A t^{2}$ está en metros, $A$ tiene que ser metros entre segundos al cuadrado: es una aceleración. Las de $B$ serían $\\text{m/s}$.',
  },

  /* ── Cantidades cinemáticas ─────────────────────────────────────────── */
  {
    id: 'fis-103', temaId: 'fis-cinematica-2', dificultad: 0.4,
    enunciado: 'Un ciclista recorre 30 km en una hora y luego otros 30 km en dos horas. ¿Cuál es su rapidez media en todo el trayecto, en km/h?',
    opciones: ['$22{,}5$', '$20$', '$25$', '$30$'],
    correcta: 1,
    explicacion: 'La rapidez media es la distancia total entre el tiempo total: $\\dfrac{60}{3} = 20$ km/h. Promediar las dos rapideces, 30 y 15, da 22,5, pero pasó más tiempo yendo lento.',
  },
  {
    id: 'fis-104', temaId: 'fis-cinematica-2', dificultad: 0.45,
    enunciado: 'La posición de un móvil es $x = 3t^{2} - 2t + 1$, en metros y con $t$ en segundos. ¿Cuál es su velocidad media entre $t = 1$ s y $t = 3$ s, en m/s?',
    opciones: ['$20$', '$11$', '$22$', '$10$'],
    correcta: 3,
    explicacion: 'Se evalúa la posición en los dos instantes: $x(1) = 2$ y $x(3) = 22$. La velocidad media es el desplazamiento entre el tiempo: $\\dfrac{22 - 2}{3 - 1} = 10$ m/s. El 20 es el desplazamiento, no la velocidad.',
  },

  /* ── Movimiento rectilíneo ──────────────────────────────────────────── */
  {
    id: 'fis-105', temaId: 'fis-cinematica-3', dificultad: 0.4,
    enunciado: 'Un auto va a 20 m/s y frena con una desaceleración constante de $4\\ \\text{m/s}^{2}$. ¿Qué distancia recorre hasta detenerse, en metros?',
    opciones: ['$80$', '$100$', '$25$', '$50$'],
    correcta: 3,
    explicacion: 'Con $v^{2} = v_0^{2} - 2ad$ y velocidad final cero: $d = \\dfrac{400}{2 \\cdot 4} = 50$ m. Tarda 5 s en parar, y en ese tiempo no mantiene los 20 m/s, por eso no son 100 m.',
  },
  {
    id: 'fis-106', temaId: 'fis-cinematica-3', dificultad: 0.3,
    enunciado: 'Desde lo alto de un edificio se suelta una piedra, que tarda 3 s en llegar al suelo. Con $g = 10\\ \\text{m/s}^{2}$, ¿qué altura tiene el edificio, en metros?',
    opciones: ['$90$', '$30$', '$45$', '$15$'],
    correcta: 2,
    explicacion: 'Soltada desde el reposo, cae $h = \\dfrac{1}{2} g t^{2} = \\dfrac{1}{2} \\cdot 10 \\cdot 9 = 45$ m. Multiplicar la velocidad final, 30 m/s, por el tiempo da 90, pero la piedra no cae todo el rato a esa velocidad.',
  },

  /* ── Movimiento en dos dimensiones ──────────────────────────────────── */
  {
    id: 'fis-107', temaId: 'fis-cinematica-4', dificultad: 0.5,
    enunciado: 'Un proyectil se lanza a 50 m/s formando $37^{\\circ}$ con la horizontal. Con $g = 10\\ \\text{m/s}^{2}$ y $\\sin 37^{\\circ} = 0{,}6$, ¿cuál es su altura máxima, en metros?',
    opciones: ['$45$', '$80$', '$125$', '$60$'],
    correcta: 0,
    explicacion: 'Solo la componente vertical sube y frena: $v_y = 50 \\cdot 0{,}6 = 30$ m/s. La altura máxima es $\\dfrac{v_y^{2}}{2g} = \\dfrac{900}{20} = 45$ m. Usar la velocidad entera, 50 m/s, da 125.',
  },
  {
    id: 'fis-108', temaId: 'fis-cinematica-4', dificultad: 0.35,
    enunciado: 'Una rueda gira a 120 revoluciones por minuto. ¿Cuál es su velocidad angular, en rad/s?',
    opciones: ['$2\\pi$', '$4\\pi$', '$120\\pi$', '$240\\pi$'],
    correcta: 1,
    explicacion: 'Cada revolución son $2\\pi$ radianes y un minuto son 60 s: $\\dfrac{120 \\cdot 2\\pi}{60} = 4\\pi$ rad/s. Olvidar pasar los minutos a segundos da $240\\pi$.',
  },

  /* ── Leyes de Newton ────────────────────────────────────────────────── */
  {
    id: 'fis-109', temaId: 'fis-dinamica-1', dificultad: 0.2,
    enunciado: 'A un bloque de 5 kg, sobre una superficie horizontal sin rozamiento, se le aplica una fuerza horizontal de 20 N. ¿Cuál es su aceleración, en $\\text{m/s}^{2}$?',
    opciones: ['$15$', '$100$', '$0{,}25$', '$4$'],
    correcta: 3,
    explicacion: 'Por la segunda ley de Newton, $a = \\dfrac{F}{m} = \\dfrac{20}{5} = 4\\ \\text{m/s}^{2}$. Multiplicar en vez de dividir da 100.',
  },
  {
    id: 'fis-110', temaId: 'fis-dinamica-1', dificultad: 0.45,
    enunciado: 'Un bloque de 10 kg se arrastra sobre un piso horizontal a velocidad constante. Si el coeficiente de rozamiento cinético es 0,3 y $g = 10\\ \\text{m/s}^{2}$, ¿qué fuerza horizontal se aplica, en newtons?',
    opciones: ['$100$', '$3$', '$30$', '$0$'],
    correcta: 2,
    explicacion: 'A velocidad constante la fuerza neta es cero, así que la fuerza aplicada iguala al rozamiento: $\\mu m g = 0{,}3 \\cdot 10 \\cdot 10 = 30$ N. Pensar que "a velocidad constante no hace falta fuerza" olvida el rozamiento.',
  },

  /* ── Equilibrio y torque ────────────────────────────────────────────── */
  {
    id: 'fis-111', temaId: 'fis-dinamica-2', dificultad: 0.25,
    enunciado: 'Un resorte de constante $k = 200\\ \\text{N/m}$ se estira 0,1 m. ¿Qué fuerza ejerce, en newtons?',
    opciones: ['$2000$', '$20$', '$2$', '$200$'],
    correcta: 1,
    explicacion: 'Por la ley de Hooke, $F = kx = 200 \\cdot 0{,}1 = 20$ N. Dividir la constante entre la deformación da 2000.',
  },
  {
    id: 'fis-112', temaId: 'fis-dinamica-2', dificultad: 0.45,
    enunciado: 'Una barra horizontal de peso despreciable se apoya en un punto. A 2 m del apoyo cuelga un peso de 30 N. ¿Qué peso hay que colgar al otro lado, a 1,5 m del apoyo, para que quede en equilibrio, en newtons?',
    opciones: ['$45$', '$22{,}5$', '$30$', '$40$'],
    correcta: 3,
    explicacion: 'Los torques respecto al apoyo tienen que compensarse: $30 \\cdot 2 = W \\cdot 1{,}5$, así que $W = 40$ N. Está más cerca del apoyo, por eso tiene que pesar más. Invertir la proporción da 22,5.',
  },

  /* ── Cantidad de movimiento y gravitación ───────────────────────────── */
  {
    id: 'fis-113', temaId: 'fis-dinamica-3', dificultad: 0.5,
    enunciado: 'Una bala de 0,02 kg a 400 m/s se incrusta en un bloque de 3,98 kg que está en reposo sobre hielo. ¿Con qué velocidad se mueve el conjunto, en m/s?',
    opciones: ['$2$', '$400$', '$8$', '$1$'],
    correcta: 0,
    explicacion: 'Se conserva la cantidad de movimiento: $0{,}02 \\cdot 400 = (0{,}02 + 3{,}98) \\, v$, o sea $8 = 4v$ y $v = 2$ m/s. El 8 es la cantidad de movimiento, no la velocidad.',
  },
  {
    id: 'fis-114', temaId: 'fis-dinamica-3', dificultad: 0.35,
    enunciado: 'Si la distancia entre dos masas se triplica, ¿qué pasa con la fuerza gravitatoria entre ellas?',
    opciones: ['Se multiplica por 9', 'Se reduce a la tercera parte', 'Se triplica', 'Se reduce a la novena parte'],
    correcta: 3,
    explicacion: 'La fuerza gravitatoria es inversamente proporcional al cuadrado de la distancia: con el triple de distancia queda dividida entre $3^{2} = 9$. Reducirla solo a la tercera parte olvida el cuadrado.',
  },

  /* ── Trabajo y potencia ─────────────────────────────────────────────── */
  {
    id: 'fis-115', temaId: 'fis-conservacion-1', dificultad: 0.4,
    enunciado: 'Una fuerza de 50 N arrastra una caja 10 m, formando $60^{\\circ}$ con la dirección del desplazamiento. ¿Qué trabajo realiza, en joules?',
    opciones: ['$433$', '$500$', '$250$', '$0$'],
    correcta: 2,
    explicacion: 'Solo trabaja la componente de la fuerza en la dirección del movimiento: $W = F d \\cos 60^{\\circ} = 50 \\cdot 10 \\cdot 0{,}5 = 250$ J. Usar el seno da unos 433 J, que es la componente que no trabaja.',
  },
  {
    id: 'fis-116', temaId: 'fis-conservacion-1', dificultad: 0.45,
    enunciado: 'Un motor sube un cuerpo de 80 kg a 15 m de altura en 20 s, a velocidad constante. Con $g = 10\\ \\text{m/s}^{2}$, ¿qué potencia desarrolla, en watts?',
    opciones: ['$600$', '$12000$', '$60$', '$1200$'],
    correcta: 0,
    explicacion: 'El trabajo es subir el peso: $80 \\cdot 10 \\cdot 15 = 12\\,000$ J. La potencia es ese trabajo entre el tiempo: $\\dfrac{12\\,000}{20} = 600$ W. Los 12 000 son el trabajo, no la potencia.',
  },

  /* ── Energía cinética ───────────────────────────────────────────────── */
  {
    id: 'fis-117', temaId: 'fis-conservacion-2', dificultad: 0.2,
    enunciado: '¿Cuál es la energía cinética de un cuerpo de 4 kg que se mueve a 5 m/s, en joules?',
    opciones: ['$50$', '$100$', '$20$', '$10$'],
    correcta: 0,
    explicacion: '$E_c = \\dfrac{1}{2} m v^{2} = \\dfrac{1}{2} \\cdot 4 \\cdot 25 = 50$ J. Olvidar el medio da 100, y no elevar la velocidad al cuadrado da 10.',
  },
  {
    id: 'fis-118', temaId: 'fis-conservacion-2', dificultad: 0.5,
    enunciado: 'Un cuerpo de 2 kg se mueve a 3 m/s y una fuerza neta realiza sobre él un trabajo de 16 J. ¿Cuál es su rapidez final, en m/s?',
    opciones: ['$4$', '$5$', '$11$', '$25$'],
    correcta: 1,
    explicacion: 'El trabajo neto se suma a la energía cinética: empieza con $\\dfrac{1}{2} \\cdot 2 \\cdot 9 = 9$ J y termina con $9 + 16 = 25$ J. De $25 = \\dfrac{1}{2} \\cdot 2 \\cdot v^{2}$ sale $v = 5$ m/s. El 25 es la energía, no la rapidez.',
  },

  /* ── Energía potencial y conservación ───────────────────────────────── */
  {
    id: 'fis-119', temaId: 'fis-conservacion-3', dificultad: 0.3,
    enunciado: 'Un cuerpo se suelta desde 20 m de altura. Sin rozamiento y con $g = 10\\ \\text{m/s}^{2}$, ¿con qué rapidez llega al suelo, en m/s?',
    opciones: ['$20$', '$200$', '$400$', '$10$'],
    correcta: 0,
    explicacion: 'Toda la energía potencial se convierte en cinética: $mgh = \\dfrac{1}{2} m v^{2}$, así que $v = \\sqrt{2gh} = \\sqrt{400} = 20$ m/s. La masa se cancela: no hace falta conocerla.',
  },
  {
    id: 'fis-120', temaId: 'fis-conservacion-3', dificultad: 0.55,
    enunciado: 'Un bloque de 0,5 kg comprime 0,2 m un resorte de $k = 800\\ \\text{N/m}$ sobre una superficie sin rozamiento. Al soltarlo, ¿con qué rapidez sale el bloque, en m/s?',
    opciones: ['$4$', '$16$', '$64$', '$8$'],
    correcta: 3,
    explicacion: 'La energía elástica, $\\dfrac{1}{2} k x^{2} = \\dfrac{1}{2} \\cdot 800 \\cdot 0{,}04 = 16$ J, pasa entera al bloque: $16 = \\dfrac{1}{2} \\cdot 0{,}5 \\cdot v^{2}$, de donde $v^{2} = 64$ y $v = 8$ m/s.',
  },

  /* ── Temperatura y dilatación ───────────────────────────────────────── */
  {
    id: 'fis-121', temaId: 'fis-termicos-1', dificultad: 0.3,
    enunciado: '¿A cuántos grados Fahrenheit equivalen $25^{\\circ}\\text{C}$?',
    opciones: ['$57$', '$45$', '$77$', '$13$'],
    correcta: 2,
    explicacion: 'Se usa $F = \\dfrac{9}{5} C + 32 = 45 + 32 = 77$. Olvidar sumar los 32 da 45, porque las escalas no empiezan en el mismo punto.',
  },
  {
    id: 'fis-122', temaId: 'fis-termicos-1', dificultad: 0.5,
    enunciado: 'Una varilla de acero de 2 m se calienta de $20^{\\circ}\\text{C}$ a $120^{\\circ}\\text{C}$. Si su coeficiente de dilatación lineal es $1{,}2 \\cdot 10^{-5}\\ ^{\\circ}\\text{C}^{-1}$, ¿cuánto se alarga, en milímetros?',
    opciones: ['$2{,}4$', '$0{,}24$', '$24$', '$1{,}2$'],
    correcta: 0,
    explicacion: 'El alargamiento es $\\Delta L = L_0 \\alpha \\Delta T = 2 \\cdot 1{,}2 \\cdot 10^{-5} \\cdot 100 = 0{,}0024$ m, que son 2,4 mm. El error típico está en pasar de metros a milímetros.',
  },

  /* ── Calor ──────────────────────────────────────────────────────────── */
  {
    id: 'fis-123', temaId: 'fis-termicos-2', dificultad: 0.3,
    enunciado: '¿Cuánto calor hay que dar a 500 g de agua para calentarla de $20^{\\circ}\\text{C}$ a $80^{\\circ}\\text{C}$, en calorías? El calor específico del agua es $1\\ \\text{cal/g}\\,^{\\circ}\\text{C}$.',
    opciones: ['$10000$', '$40000$', '$30000$', '$300$'],
    correcta: 2,
    explicacion: 'El calor sensible es $Q = m c \\Delta T = 500 \\cdot 1 \\cdot 60 = 30\\,000$ cal. Usar la temperatura final, 80, en vez del cambio, 60, da 40 000.',
  },
  {
    id: 'fis-124', temaId: 'fis-termicos-2', dificultad: 0.45,
    enunciado: '¿Cuánto calor se necesita para fundir 200 g de hielo que ya está a $0^{\\circ}\\text{C}$, en calorías? El calor latente de fusión del hielo es 80 cal por gramo.',
    opciones: ['$0$', '$200$', '$8000$', '$16000$'],
    correcta: 3,
    explicacion: 'Durante un cambio de fase la temperatura no varía, pero sí hace falta calor: $Q = m L = 200 \\cdot 80 = 16\\,000$ cal. Pensar que no hace falta calor porque la temperatura se queda en 0 es la trampa.',
  },

  /* ── Densidad y presión ─────────────────────────────────────────────── */
  {
    id: 'fis-125', temaId: 'fis-fluidos-1', dificultad: 0.25,
    enunciado: 'Un bloque de 3 kg ocupa un volumen de $0{,}002\\ \\text{m}^{3}$. ¿Cuál es su densidad, en $\\text{kg/m}^{3}$?',
    opciones: ['$0{,}006$', '$6$', '$1500$', '$150$'],
    correcta: 2,
    explicacion: 'La densidad es masa entre volumen: $\\dfrac{3}{0{,}002} = 1500\\ \\text{kg/m}^{3}$. Multiplicar en vez de dividir da 0,006.',
  },
  {
    id: 'fis-126', temaId: 'fis-fluidos-1', dificultad: 0.4,
    enunciado: '¿Qué presión hidrostática soporta un buzo a 12 m de profundidad en el mar? La densidad del agua es $1000\\ \\text{kg/m}^{3}$ y $g = 10\\ \\text{m/s}^{2}$. Responde en kilopascales.',
    opciones: ['$120$', '$12$', '$1200$', '$220$'],
    correcta: 0,
    explicacion: 'La presión hidrostática es $\\rho g h = 1000 \\cdot 10 \\cdot 12 = 120\\,000$ Pa, o sea 120 kPa. Sumarle la atmosférica, unos 100 kPa, da la presión total, 220, pero la pregunta pide solo la del agua.',
  },

  /* ── Pascal y Arquímedes ────────────────────────────────────────────── */
  {
    id: 'fis-127', temaId: 'fis-fluidos-2', dificultad: 0.4,
    enunciado: 'En una prensa hidráulica el émbolo pequeño tiene $10\\ \\text{cm}^{2}$ y el grande $500\\ \\text{cm}^{2}$. ¿Qué fuerza hay que aplicar en el pequeño para levantar un auto de 10 000 N apoyado en el grande, en newtons?',
    opciones: ['$500000$', '$200$', '$2000$', '$50$'],
    correcta: 1,
    explicacion: 'La presión se transmite igual a todo el líquido: $\\dfrac{F}{10} = \\dfrac{10\\,000}{500}$, así que $F = 200$ N. La prensa multiplica la fuerza por la razón de las áreas, 50.',
  },
  {
    id: 'fis-128', temaId: 'fis-fluidos-2', dificultad: 0.35,
    enunciado: 'Un cuerpo de $0{,}004\\ \\text{m}^{3}$ se sumerge por completo en agua, de densidad $1000\\ \\text{kg/m}^{3}$. Con $g = 10\\ \\text{m/s}^{2}$, ¿qué empuje recibe, en newtons?',
    opciones: ['$400$', '$4$', '$40$', '$0{,}4$'],
    correcta: 2,
    explicacion: 'Por Arquímedes, el empuje es el peso del agua desalojada: $\\rho g V = 1000 \\cdot 10 \\cdot 0{,}004 = 40$ N. No depende de qué material es el cuerpo, solo del volumen sumergido.',
  },

  /* ── Hidrodinámica ──────────────────────────────────────────────────── */
  {
    id: 'fis-129', temaId: 'fis-fluidos-3', dificultad: 0.4,
    enunciado: 'Por una tubería de $20\\ \\text{cm}^{2}$ de sección circula agua a 3 m/s. Si la tubería se estrecha a $5\\ \\text{cm}^{2}$, ¿a qué rapidez circula el agua en la parte estrecha, en m/s?',
    opciones: ['$0{,}75$', '$12$', '$3$', '$60$'],
    correcta: 1,
    explicacion: 'El caudal se conserva: $A_1 v_1 = A_2 v_2$, o sea $20 \\cdot 3 = 5 \\cdot v_2$, y $v_2 = 12$ m/s. Donde el tubo se estrecha, el agua va más rápido; el 0,75 invierte la proporción.',
  },
  {
    id: 'fis-130', temaId: 'fis-fluidos-3', dificultad: 0.45,
    enunciado: 'Según el principio de Bernoulli, en un tubo horizontal, en la zona donde el agua circula más rápido, la presión es:',
    opciones: ['Nula', 'Mayor', 'Igual', 'Menor'],
    correcta: 3,
    explicacion: 'En un tubo horizontal, presión más energía cinética por volumen se mantiene constante: si la velocidad sube, la presión tiene que bajar. Por eso las alas levantan un avión.',
  },

  /* ── Coulomb y campo eléctrico ──────────────────────────────────────── */
  {
    id: 'fis-131', temaId: 'fis-electrostatica-1', dificultad: 0.35,
    enunciado: 'Dos cargas puntuales se repelen con una fuerza de 36 N. Si la distancia entre ellas se duplica, ¿cuál es la nueva fuerza, en newtons?',
    opciones: ['$9$', '$18$', '$72$', '$144$'],
    correcta: 0,
    explicacion: 'La fuerza de Coulomb es inversamente proporcional al cuadrado de la distancia: con el doble de distancia se divide entre 4. Queda $\\dfrac{36}{4} = 9$ N. Dividir solo entre 2 da 18.',
  },
  {
    id: 'fis-132', temaId: 'fis-electrostatica-1', dificultad: 0.45,
    enunciado: '¿Qué campo eléctrico crea una carga de $2 \\cdot 10^{-6}\\ \\text{C}$ a 3 m de distancia, con $k = 9 \\cdot 10^{9}\\ \\text{N m}^{2}/\\text{C}^{2}$? Responde en N/C.',
    opciones: ['$18000$', '$6000$', '$2000$', '$200$'],
    correcta: 2,
    explicacion: 'El campo es $E = \\dfrac{kq}{r^{2}} = \\dfrac{9 \\cdot 10^{9} \\cdot 2 \\cdot 10^{-6}}{9} = 2000$ N/C. Dividir entre la distancia sin elevarla al cuadrado da 6000.',
  },

  /* ── Potencial y condensadores ──────────────────────────────────────── */
  {
    id: 'fis-133', temaId: 'fis-electrostatica-2', dificultad: 0.45,
    enunciado: 'Dos condensadores de $6\\ \\mu\\text{F}$ y $3\\ \\mu\\text{F}$ se conectan en serie. ¿Cuál es la capacidad equivalente, en microfaradios?',
    opciones: ['$9$', '$2$', '$4{,}5$', '$18$'],
    correcta: 1,
    explicacion: 'En serie se suman las inversas: $\\dfrac{1}{C} = \\dfrac{1}{6} + \\dfrac{1}{3} = \\dfrac{1}{2}$, así que $C = 2\\ \\mu\\text{F}$. Sumar las capacidades, 9, es lo que se hace en paralelo: con los condensadores es al revés que con las resistencias.',
  },
  {
    id: 'fis-134', temaId: 'fis-electrostatica-2', dificultad: 0.45,
    enunciado: 'Un condensador de $4\\ \\mu\\text{F}$ se carga a 10 V. ¿Qué energía almacena, en microjoules?',
    opciones: ['$400$', '$200$', '$40$', '$20$'],
    correcta: 1,
    explicacion: 'La energía es $\\dfrac{1}{2} C V^{2} = \\dfrac{1}{2} \\cdot 4 \\cdot 100 = 200\\ \\mu\\text{J}$. Olvidar el medio da 400, y no elevar el voltaje al cuadrado da 20.',
  },

  /* ── Corriente y ley de Ohm ─────────────────────────────────────────── */
  {
    id: 'fis-135', temaId: 'fis-electrodinamica-1', dificultad: 0.2,
    enunciado: 'Por una resistencia de $15\\ \\Omega$ circula una corriente de 2 A. ¿Qué voltaje hay entre sus extremos, en voltios?',
    opciones: ['$30$', '$7{,}5$', '$17$', '$0{,}13$'],
    correcta: 0,
    explicacion: 'Por la ley de Ohm, $V = IR = 2 \\cdot 15 = 30$ V. Dividir la resistencia entre la corriente da 7,5, que no tiene unidades de voltaje.',
  },
  {
    id: 'fis-136', temaId: 'fis-electrodinamica-1', dificultad: 0.3,
    enunciado: 'Por un conductor pasa una corriente de 4 A. ¿Cuánta carga lo atraviesa en un minuto, en coulombs?',
    opciones: ['$4$', '$240$', '$15$', '$0{,}067$'],
    correcta: 1,
    explicacion: 'La corriente es carga por segundo: $q = I t = 4 \\cdot 60 = 240$ C. Usar 1 en vez de 60 segundos da 4.',
  },

  /* ── Circuitos y potencia ───────────────────────────────────────────── */
  {
    id: 'fis-137', temaId: 'fis-electrodinamica-2', dificultad: 0.35,
    enunciado: 'Tres resistencias de $6\\ \\Omega$ se conectan en paralelo. ¿Cuál es la resistencia equivalente, en ohmios?',
    opciones: ['$3$', '$18$', '$6$', '$2$'],
    correcta: 3,
    explicacion: 'En paralelo se suman las inversas: $\\dfrac{1}{R} = \\dfrac{3}{6}$, así que $R = 2\\ \\Omega$. La equivalente en paralelo siempre es menor que la menor de ellas; el 18 sería en serie.',
  },
  {
    id: 'fis-138', temaId: 'fis-electrodinamica-2', dificultad: 0.4,
    enunciado: 'Un foco de 100 W funciona 5 horas diarias durante 30 días. ¿Cuánta energía consume, en kWh?',
    opciones: ['$1500$', '$15$', '$150$', '$3$'],
    correcta: 1,
    explicacion: 'La energía es potencia por tiempo: $0{,}1\\ \\text{kW} \\cdot 150\\ \\text{h} = 15$ kWh. Dejar los 100 W sin pasar a kilovatios da 1500, que son vatios-hora.',
  },

  /* ── Imanes y campo magnético ───────────────────────────────────────── */
  {
    id: 'fis-139', temaId: 'fis-electromagnetismo-1', dificultad: 0.3,
    enunciado: 'Si un imán de barra se parte por la mitad, ¿qué se obtiene?',
    opciones: ['Un polo norte aislado y un polo sur aislado', 'Dos imanes, cada uno con su polo norte y su polo sur', 'Dos trozos sin magnetismo', 'Dos polos norte'],
    correcta: 1,
    explicacion: 'Un imán está hecho de muchísimos imanes diminutos alineados, así que al partirlo cada trozo sigue siendo un imán completo, con sus dos polos. No existen polos magnéticos aislados.',
  },
  {
    id: 'fis-140', temaId: 'fis-electromagnetismo-1', dificultad: 0.35,
    enunciado: 'Fuera de un imán, las líneas de campo magnético van:',
    opciones: ['Del polo norte al polo sur', 'Del polo sur al polo norte', 'Solo alrededor del polo norte', 'En línea recta, sin cerrarse'],
    correcta: 0,
    explicacion: 'Las líneas salen del polo norte, rodean el imán por fuera y entran por el polo sur; por dentro vuelven del sur al norte y se cierran. Por eso el polo norte de una brújula apunta hacia donde van las líneas.',
  },

  /* ── Fuerza magnética y campo de una corriente ──────────────────────── */
  {
    id: 'fis-141', temaId: 'fis-electromagnetismo-2', dificultad: 0.45,
    enunciado: 'Una carga de $2 \\cdot 10^{-6}\\ \\text{C}$ entra a $5 \\cdot 10^{4}\\ \\text{m/s}$, perpendicular a un campo magnético de 0,3 T. ¿Qué fuerza magnética recibe, en newtons?',
    opciones: ['$0{,}3$', '$0{,}03$', '$3$', '$0$'],
    correcta: 1,
    explicacion: 'La fuerza es $F = q v B = 2 \\cdot 10^{-6} \\cdot 5 \\cdot 10^{4} \\cdot 0{,}3 = 0{,}03$ N. Sería cero solo si la carga se moviera en la dirección del campo, no perpendicular a él.',
  },
  {
    id: 'fis-142', temaId: 'fis-electromagnetismo-2', dificultad: 0.5,
    enunciado: 'Un conductor rectilíneo muy largo lleva 10 A. ¿Qué campo magnético produce a 0,2 m de él, en teslas? Considera $\\mu_0 = 4\\pi \\cdot 10^{-7}\\ \\text{T m/A}$.',
    opciones: ['$5 \\cdot 10^{-5}$', '$10^{-6}$', '$2 \\cdot 10^{-5}$', '$10^{-5}$'],
    correcta: 3,
    explicacion: 'Para un conductor rectilíneo, $B = \\dfrac{\\mu_0 I}{2\\pi r} = \\dfrac{4\\pi \\cdot 10^{-7} \\cdot 10}{2\\pi \\cdot 0{,}2} = 10^{-5}$ T. Olvidar el $2\\pi$ del denominador da un resultado $2\\pi$ veces mayor.',
  },

  /* ── Inducción electromagnética ─────────────────────────────────────── */
  {
    id: 'fis-143', temaId: 'fis-electromagnetismo-3', dificultad: 0.4,
    enunciado: 'El flujo magnético que atraviesa una espira baja de 0,5 Wb a 0,1 Wb en 0,2 s. ¿Qué fuerza electromotriz media se induce, en voltios?',
    opciones: ['$3$', '$0{,}08$', '$2$', '$0{,}4$'],
    correcta: 2,
    explicacion: 'Por la ley de Faraday, la fem es el cambio de flujo entre el tiempo: $\\dfrac{0{,}5 - 0{,}1}{0{,}2} = 2$ V. Lo que induce la fem es que el flujo cambie; el 0,4 es ese cambio, no la fem.',
  },
  {
    id: 'fis-144', temaId: 'fis-electromagnetismo-3', dificultad: 0.35,
    enunciado: 'Un transformador tiene 200 vueltas en el primario y 50 en el secundario. Si el primario recibe 220 V, ¿qué voltaje sale del secundario, en voltios?',
    opciones: ['$44$', '$880$', '$220$', '$55$'],
    correcta: 3,
    explicacion: 'El voltaje es proporcional al número de vueltas: $\\dfrac{V_2}{220} = \\dfrac{50}{200}$, así que $V_2 = 55$ V. Con menos vueltas en el secundario es un reductor; invertir la proporción da 880.',
  },

  /* ── Movimiento armónico simple ─────────────────────────────────────── */
  {
    id: 'fis-145', temaId: 'fis-ondas-1', dificultad: 0.5,
    enunciado: 'Un bloque de 2 kg unido a un resorte de $k = 50\\ \\text{N/m}$ oscila con movimiento armónico simple. ¿Cuál es su período, en segundos?',
    opciones: ['$0{,}4\\pi$', '$0{,}2\\pi$', '$10\\pi$', '$4\\pi$'],
    correcta: 0,
    explicacion: 'El período es $T = 2\\pi \\sqrt{\\dfrac{m}{k}} = 2\\pi \\sqrt{\\dfrac{2}{50}} = 2\\pi \\cdot 0{,}2 = 0{,}4\\pi$ s. Poner la constante arriba y la masa abajo da $10\\pi$.',
  },
  {
    id: 'fis-146', temaId: 'fis-ondas-1', dificultad: 0.4,
    enunciado: 'Si la longitud de un péndulo simple se cuadruplica, ¿qué pasa con su período?',
    opciones: ['Se reduce a la mitad', 'Se cuadruplica', 'Se duplica', 'No cambia'],
    correcta: 2,
    explicacion: 'El período del péndulo es proporcional a la raíz de su longitud: $\\sqrt{4} = 2$, así que se duplica. No depende de la masa ni, en oscilaciones pequeñas, de la amplitud.',
  },

  /* ── Energía del oscilador ──────────────────────────────────────────── */
  {
    id: 'fis-147', temaId: 'fis-ondas-2', dificultad: 0.4,
    enunciado: 'Un oscilador masa-resorte con $k = 400\\ \\text{N/m}$ tiene una amplitud de 0,1 m. ¿Cuál es su energía mecánica total, en joules?',
    opciones: ['$4$', '$2$', '$20$', '$40$'],
    correcta: 1,
    explicacion: 'En el extremo toda la energía es elástica: $E = \\dfrac{1}{2} k A^{2} = \\dfrac{1}{2} \\cdot 400 \\cdot 0{,}01 = 2$ J. Y como se conserva, es la energía total en cualquier punto.',
  },
  {
    id: 'fis-148', temaId: 'fis-ondas-2', dificultad: 0.35,
    enunciado: 'En un movimiento armónico simple, ¿en qué posición es máxima la energía cinética?',
    opciones: ['A la mitad de la amplitud', 'En los extremos', 'En la posición de equilibrio', 'Es igual en todas las posiciones'],
    correcta: 2,
    explicacion: 'La energía total es fija y se reparte entre cinética y elástica. En el equilibrio el resorte no está deformado, así que toda la energía es cinética; en los extremos el cuerpo se detiene.',
  },

  /* ── Ondas y sonido ─────────────────────────────────────────────────── */
  {
    id: 'fis-149', temaId: 'fis-ondas-3', dificultad: 0.25,
    enunciado: 'Una onda tiene una frecuencia de 50 Hz y una longitud de onda de 4 m. ¿Cuál es su velocidad de propagación, en m/s?',
    opciones: ['$0{,}08$', '$12{,}5$', '$200$', '$54$'],
    correcta: 2,
    explicacion: 'La onda avanza una longitud de onda en cada oscilación: $v = \\lambda f = 4 \\cdot 50 = 200$ m/s. Dividir en vez de multiplicar da 12,5.',
  },
  {
    id: 'fis-150', temaId: 'fis-ondas-3', dificultad: 0.55,
    enunciado: 'Si la intensidad de un sonido se multiplica por 100, ¿en cuántos decibeles aumenta su nivel de intensidad?',
    opciones: ['$20$', '$100$', '$10$', '$2$'],
    correcta: 0,
    explicacion: 'El nivel en decibeles es logarítmico: $10 \\log 100 = 10 \\cdot 2 = 20$ dB. Multiplicar la intensidad por 10 suma 10 dB, y por 100 suma 20, no 100.',
  },

  /* ── La luz ─────────────────────────────────────────────────────────── */
  {
    id: 'fis-151', temaId: 'fis-ondas-4', dificultad: 0.5,
    enunciado: 'Un objeto está a 30 cm de un espejo cóncavo de distancia focal 10 cm. ¿A qué distancia del espejo se forma la imagen, en centímetros?',
    opciones: ['$15$', '$20$', '$7{,}5$', '$40$'],
    correcta: 0,
    explicacion: 'Con la ecuación de los espejos, $\\dfrac{1}{f} = \\dfrac{1}{o} + \\dfrac{1}{i}$: $\\dfrac{1}{i} = \\dfrac{1}{10} - \\dfrac{1}{30} = \\dfrac{2}{30}$, así que $i = 15$ cm. Restar las distancias, $30 - 10 = 20$, no es la ecuación.',
  },
  {
    id: 'fis-152', temaId: 'fis-ondas-4', dificultad: 0.55,
    enunciado: 'Un rayo de luz pasa del aire, con $n = 1$, al agua, con $n = \\dfrac{4}{3}$, con un ángulo de incidencia de $53^{\\circ}$. Con $\\sin 53^{\\circ} = 0{,}8$, ¿cuál es el ángulo de refracción?',
    opciones: ['$45^{\\circ}$', '$53^{\\circ}$', '$30^{\\circ}$', '$37^{\\circ}$'],
    correcta: 3,
    explicacion: 'Por la ley de Snell, $1 \\cdot 0{,}8 = \\dfrac{4}{3} \\sin r$, así que $\\sin r = 0{,}6$, que es el seno de $37^{\\circ}$ en el triángulo notable. Al entrar a un medio más denso, el rayo se acerca a la normal.',
  },

  /* ── Fundamentos cuánticos ──────────────────────────────────────────── */
  {
    id: 'fis-153', temaId: 'fis-moderna-1', dificultad: 0.45,
    enunciado: '¿Qué energía tiene un fotón de frecuencia $5 \\cdot 10^{14}\\ \\text{Hz}$? Considera $h = 6{,}6 \\cdot 10^{-34}\\ \\text{J s}$. Responde en joules.',
    opciones: ['$3{,}3 \\cdot 10^{-20}$', '$1{,}3 \\cdot 10^{-48}$', '$3{,}3 \\cdot 10^{-19}$', '$6{,}6 \\cdot 10^{-19}$'],
    correcta: 2,
    explicacion: 'Por la hipótesis de Planck, $E = hf = 6{,}6 \\cdot 10^{-34} \\cdot 5 \\cdot 10^{14} = 3{,}3 \\cdot 10^{-19}$ J. Al multiplicar potencias de 10 se suman los exponentes: $-34 + 14 = -20$, y $6{,}6 \\cdot 5 = 33$ añade uno más.',
  },
  {
    id: 'fis-154', temaId: 'fis-moderna-1', dificultad: 0.4,
    enunciado: 'Una muestra radiactiva tiene 80 g y su vida media es de 5 días. ¿Cuántos gramos quedan después de 15 días?',
    opciones: ['$20$', '$10$', '$40$', '$5$'],
    correcta: 1,
    explicacion: 'Quince días son tres vidas medias, y en cada una la muestra se reduce a la mitad: $80 \\rightarrow 40 \\rightarrow 20 \\rightarrow 10$ g. No decae restando una cantidad fija, sino a la mitad cada vez.',
  },

  /* ── Relatividad especial ───────────────────────────────────────────── */
  {
    id: 'fis-155', temaId: 'fis-moderna-2', dificultad: 0.55,
    enunciado: 'Una nave viaja a $0{,}6c$ respecto de la Tierra. Si en la nave pasan 8 años, ¿cuántos años pasan en la Tierra?',
    opciones: ['$10$', '$8$', '$6{,}4$', '$13{,}3$'],
    correcta: 0,
    explicacion: 'El factor de Lorentz es $\\gamma = \\dfrac{1}{\\sqrt{1 - 0{,}36}} = \\dfrac{1}{0{,}8} = 1{,}25$. El tiempo en la Tierra es mayor: $8 \\cdot 1{,}25 = 10$ años. Multiplicar por 0,8 en vez de dividir da 6,4, que es al revés.',
  },
  {
    id: 'fis-156', temaId: 'fis-moderna-2', dificultad: 0.55,
    enunciado: 'Una nave con 100 m de longitud propia se mueve a $0{,}8c$ respecto de la Tierra. ¿Qué longitud le mide un observador en la Tierra, en metros?',
    opciones: ['$166{,}7$', '$100$', '$60$', '$80$'],
    correcta: 2,
    explicacion: 'Las longitudes se contraen en la dirección del movimiento: $L = 100 \\sqrt{1 - 0{,}64} = 100 \\cdot 0{,}6 = 60$ m. Dividir entre 0,6, 166,7, la alargaría, que es el efecto contrario.',
  },
];
