/**
 * Banco de trigonometría.
 *
 * Cubre los trece temas que el temario declara para el curso, con preguntas del
 * nivel al que se rinde el examen de San Marcos.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * DOS COSAS QUE NO SON DETALLE
 *
 * **La respuesta correcta está repartida entre las cuatro alternativas.** El
 * banco anterior tenía las diez preguntas con la respuesta en A, así que un
 * alumno que marcara siempre A sacaba 100% y el índice de preparación calculaba
 * obedientemente un resultado perfecto sobre datos basura. Aquí la posición se
 * reparte, y `pruebas/trigonometria.test.mjs` falla si vuelve a concentrarse.
 *
 * **Cada `temaId` es un tema de verdad**, de los que devuelve `temasDe`. Las
 * preguntas viejas apuntan a bloques —`tri-identidades` en vez de
 * `tri-identidades-2`—, y con eso el diagnóstico sabe que fallas identidades
 * pero no puede decirte cuál, ni mandarte al material correcto.
 *
 * La otra batería recalcula por su cuenta las respuestas numéricas y compara
 * con la clave declarada. Un solucionario equivocado en una plataforma de
 * admisión hace daño real, y revisarlo a ojo cincuenta veces no funciona.
 * ────────────────────────────────────────────────────────────────────────────
 */

/** @type {object[]} */
export const TRIGONOMETRIA = [
  /* ── Sistemas de medida angular ─────────────────────────────────────── */
  {
    id: 'trg-101', temaId: 'tri-angulos-1', dificultad: 0.25,
    enunciado: 'Convierte $36^\\circ$ a radianes.',
    opciones: ['$\\dfrac{\\pi}{6}$', '$\\dfrac{\\pi}{4}$', '$\\dfrac{\\pi}{5}$', '$\\dfrac{\\pi}{10}$'],
    correcta: 2,
    explicacion: 'Multiplicas por $\\dfrac{\\pi}{180^\\circ}$: $36 \\cdot \\dfrac{\\pi}{180} = \\dfrac{\\pi}{5}$.',
  },
  {
    id: 'trg-102', temaId: 'tri-angulos-1', dificultad: 0.3,
    enunciado: 'Expresa $\\dfrac{3\\pi}{4}$ radianes en el sistema centesimal.',
    opciones: ['$135^{g}$', '$120^{g}$', '$150^{g}$', '$180^{g}$'],
    correcta: 2,
    explicacion: '$\\dfrac{3\\pi}{4}$ rad son $135^\\circ$. Como $9^\\circ$ equivalen a $10^{g}$, multiplicas por $\\dfrac{10}{9}$: $135 \\cdot \\dfrac{10}{9} = 150^{g}$.',
  },
  {
    id: 'trg-103', temaId: 'tri-angulos-1', dificultad: 0.45,
    enunciado: 'Un ángulo mide $S$ grados sexagesimales y $C$ centesimales. Si $C - S = 4$, ¿cuánto vale $S$?',
    opciones: ['$40$', '$36$', '$32$', '$45$'],
    correcta: 1,
    explicacion: 'De $\\dfrac{S}{9} = \\dfrac{C}{10} = k$ sale $S = 9k$ y $C = 10k$. Entonces $C - S = k = 4$, así que $S = 9 \\cdot 4 = 36$.',
  },
  {
    id: 'trg-104', temaId: 'tri-angulos-1', dificultad: 0.28,
    enunciado: '¿A cuántos grados sexagesimales equivalen $50^{g}$?',
    opciones: ['$60^\\circ$', '$55^\\circ$', '$40^\\circ$', '$45^\\circ$'],
    correcta: 3,
    explicacion: 'Cada grado centesimal vale $0{,}9^\\circ$. Entonces $50 \\cdot 0{,}9 = 45^\\circ$.',
  },

  /* ── Longitud de arco y sector circular ─────────────────────────────── */
  {
    id: 'trg-105', temaId: 'tri-angulos-2', dificultad: 0.24,
    enunciado: 'En una circunferencia de radio $6$, ¿cuál es la longitud del arco que subtiende un ángulo central de $2$ radianes?',
    opciones: ['$3$', '$12$', '$8$', '$36$'],
    correcta: 1,
    explicacion: 'La longitud de arco es $L = r\\theta$, con el ángulo en radianes: $L = 6 \\cdot 2 = 12$.',
  },
  {
    id: 'trg-106', temaId: 'tri-angulos-2', dificultad: 0.4,
    enunciado: 'Calcula el área del sector circular de radio $4$ y ángulo central $\\dfrac{\\pi}{3}$.',
    opciones: ['$\\dfrac{8\\pi}{3}$', '$\\dfrac{4\\pi}{3}$', '$\\dfrac{16\\pi}{3}$', '$\\dfrac{2\\pi}{3}$'],
    correcta: 0,
    explicacion: 'El área es $A = \\dfrac{r^2\\theta}{2} = \\dfrac{16 \\cdot \\pi/3}{2} = \\dfrac{8\\pi}{3}$.',
  },
  {
    id: 'trg-107', temaId: 'tri-angulos-2', dificultad: 0.32,
    enunciado: 'Un arco de $10$ unidades pertenece a una circunferencia de radio $5$. ¿Cuánto mide el ángulo central en radianes?',
    opciones: ['$0{,}5$', '$1$', '$2$', '$5$'],
    correcta: 2,
    explicacion: 'De $L = r\\theta$ despejas $\\theta = \\dfrac{L}{r} = \\dfrac{10}{5} = 2$ radianes.',
  },
  {
    id: 'trg-108', temaId: 'tri-angulos-2', dificultad: 0.48,
    enunciado: 'Un sector circular de ángulo $3$ radianes tiene área $24$. ¿Cuál es su radio?',
    opciones: ['$16$', '$4$', '$8$', '$6$'],
    correcta: 1,
    explicacion: 'De $A = \\dfrac{r^2\\theta}{2}$ sale $24 = \\dfrac{3r^2}{2}$, luego $r^2 = 16$ y $r = 4$.',
  },

  /* ── Razones de ángulos agudos y notables ───────────────────────────── */
  {
    id: 'trg-109', temaId: 'tri-angulos-3', dificultad: 0.2,
    enunciado: 'En un triángulo rectángulo los catetos miden $8$ y $15$. ¿Cuál es el seno del ángulo opuesto al cateto de $8$?',
    opciones: ['$\\dfrac{15}{17}$', '$\\dfrac{8}{15}$', '$\\dfrac{8}{17}$', '$\\dfrac{17}{8}$'],
    correcta: 2,
    explicacion: 'La hipotenusa es $\\sqrt{8^2 + 15^2} = 17$. El seno es cateto opuesto entre hipotenusa: $\\dfrac{8}{17}$.',
  },
  {
    id: 'trg-110', temaId: 'tri-angulos-3', dificultad: 0.35,
    enunciado: 'Calcula $\\tan 60^\\circ + \\cot 30^\\circ$.',
    opciones: ['$2$', '$\\sqrt{3}$', '$2\\sqrt{3}$', '$\\dfrac{2\\sqrt{3}}{3}$'],
    correcta: 2,
    explicacion: 'La tangente de $60^\\circ$ vale $\\sqrt{3}$, y la cotangente de $30^\\circ$ es la tangente de su complemento, o sea también $\\sqrt{3}$. La suma es $2\\sqrt{3}$.',
  },
  {
    id: 'trg-111', temaId: 'tri-angulos-3', dificultad: 0.42,
    enunciado: 'Si $\\theta$ es agudo y $\\sin\\theta = \\dfrac{5}{13}$, ¿cuánto vale $\\tan\\theta$?',
    opciones: ['$\\dfrac{12}{13}$', '$\\dfrac{13}{12}$', '$\\dfrac{12}{5}$', '$\\dfrac{5}{12}$'],
    correcta: 3,
    explicacion: 'El triángulo es 5-12-13, así que $\\cos\\theta = \\dfrac{12}{13}$ y $\\tan\\theta = \\dfrac{5/13}{12/13} = \\dfrac{5}{12}$.',
  },
  {
    id: 'trg-112', temaId: 'tri-angulos-3', dificultad: 0.3,
    enunciado: 'Calcula $\\sec^2 45^\\circ - \\tan^2 45^\\circ$.',
    opciones: ['$0$', '$1$', '$2$', '$3$'],
    correcta: 1,
    explicacion: 'Por la identidad $\\sec^2 x - \\tan^2 x = 1$ el resultado es 1 para cualquier ángulo. Comprobando: $2 - 1 = 1$.',
  },

  /* ── Ángulo en posición normal y reducción ──────────────────────────── */
  {
    id: 'trg-113', temaId: 'tri-normal-1', dificultad: 0.3,
    enunciado: 'Calcula $\\cos 240^\\circ$.',
    opciones: ['$-\\dfrac{1}{2}$', '$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{1}{2}$', '$-\\dfrac{\\sqrt{3}}{2}$'],
    correcta: 0,
    explicacion: '$240^\\circ$ está en el tercer cuadrante, donde el coseno es negativo. Su ángulo de referencia es $60^\\circ$, así que $\\cos 240^\\circ = -\\cos 60^\\circ = -\\dfrac{1}{2}$.',
  },
  {
    id: 'trg-114', temaId: 'tri-normal-1', dificultad: 0.46,
    enunciado: 'Si $\\tan\\theta = -\\dfrac{3}{4}$ y $\\theta$ pertenece al segundo cuadrante, ¿cuánto vale $\\sin\\theta$?',
    opciones: ['$\\dfrac{3}{5}$', '$-\\dfrac{3}{5}$', '$\\dfrac{4}{5}$', '$-\\dfrac{4}{5}$'],
    correcta: 0,
    explicacion: 'En el segundo cuadrante el seno es positivo y el coseno negativo. Con el triángulo 3-4-5: $\\sin\\theta = \\dfrac{3}{5}$ y $\\cos\\theta = -\\dfrac{4}{5}$.',
  },
  {
    id: 'trg-115', temaId: 'tri-normal-1', dificultad: 0.34,
    enunciado: 'Simplifica $\\sin(180^\\circ - x) + \\cos(360^\\circ - x)$.',
    opciones: ['$\\sin x - \\cos x$', '$\\sin x + \\cos x$', '$2\\sin x$', '$0$'],
    correcta: 1,
    explicacion: '$\\sin(180^\\circ - x) = \\sin x$ y $\\cos(360^\\circ - x) = \\cos x$, así que la suma queda $\\sin x + \\cos x$.',
  },
  {
    id: 'trg-116', temaId: 'tri-normal-1', dificultad: 0.26,
    enunciado: '¿En qué cuadrante el seno es negativo y el coseno positivo?',
    opciones: ['Segundo', 'Primero', 'Cuarto', 'Tercero'],
    correcta: 2,
    explicacion: 'En el cuarto cuadrante la abscisa es positiva y la ordenada negativa, así que el coseno es positivo y el seno negativo.',
  },

  /* ── Suma y diferencia de ángulos ───────────────────────────────────── */
  {
    id: 'trg-117', temaId: 'tri-identidades-1', dificultad: 0.55,
    enunciado: 'Si $a$ y $b$ son agudos con $\\sin a = \\dfrac{3}{5}$ y $\\cos b = \\dfrac{5}{13}$, calcula $\\sin(a+b)$.',
    opciones: ['$\\dfrac{33}{65}$', '$\\dfrac{63}{65}$', '$\\dfrac{56}{65}$', '$\\dfrac{16}{65}$'],
    correcta: 1,
    explicacion: 'De los triángulos 3-4-5 y 5-12-13: $\\cos a = \\dfrac{4}{5}$ y $\\sin b = \\dfrac{12}{13}$. Entonces $\\sin(a+b) = \\dfrac{3}{5}\\cdot\\dfrac{5}{13} + \\dfrac{4}{5}\\cdot\\dfrac{12}{13} = \\dfrac{15 + 48}{65} = \\dfrac{63}{65}$.',
  },
  {
    id: 'trg-118', temaId: 'tri-identidades-1', dificultad: 0.5,
    enunciado: 'Calcula $\\cos 75^\\circ$.',
    opciones: ['$\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}$', '$\\dfrac{\\sqrt{3}-1}{2}$', '$\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}$', '$\\dfrac{\\sqrt{2}}{2}$'],
    correcta: 0,
    explicacion: '$\\cos 75^\\circ = \\cos(45^\\circ + 30^\\circ) = \\cos 45\\cos 30 - \\sin 45\\sin 30 = \\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{\\sqrt{3}}{2} - \\dfrac{\\sqrt{2}}{2}\\cdot\\dfrac{1}{2} = \\dfrac{\\sqrt{6}-\\sqrt{2}}{4}$.',
  },
  {
    id: 'trg-119', temaId: 'tri-identidades-1', dificultad: 0.44,
    enunciado: 'Expresa $\\tan(45^\\circ + x)$ en términos de $\\tan x$.',
    opciones: ['$\\dfrac{1-\\tan x}{1+\\tan x}$', '$1 + \\tan x$', '$\\dfrac{\\tan x}{1-\\tan x}$', '$\\dfrac{1+\\tan x}{1-\\tan x}$'],
    correcta: 3,
    explicacion: 'Con $\\tan(a+b) = \\dfrac{\\tan a + \\tan b}{1 - \\tan a\\tan b}$ y $\\tan 45^\\circ = 1$ queda $\\dfrac{1+\\tan x}{1-\\tan x}$.',
  },
  {
    id: 'trg-120', temaId: 'tri-identidades-1', dificultad: 0.47,
    enunciado: 'Calcula $\\sin 15^\\circ \\cdot \\cos 15^\\circ$.',
    opciones: ['$\\dfrac{1}{2}$', '$\\dfrac{1}{4}$', '$\\dfrac{\\sqrt{3}}{4}$', '$\\dfrac{\\sqrt{2}}{4}$'],
    correcta: 1,
    explicacion: 'De $\\sin 2x = 2\\sin x\\cos x$ sale $\\sin x\\cos x = \\dfrac{\\sin 2x}{2}$. Con $x = 15^\\circ$: $\\dfrac{\\sin 30^\\circ}{2} = \\dfrac{1/2}{2} = \\dfrac{1}{4}$.',
  },

  /* ── Ángulo doble y ángulo mitad ────────────────────────────────────── */
  {
    id: 'trg-121', temaId: 'tri-identidades-2', dificultad: 0.4,
    enunciado: 'Si $x$ es agudo y $\\sin x = \\dfrac{3}{5}$, calcula $\\sin 2x$.',
    opciones: ['$\\dfrac{6}{5}$', '$\\dfrac{12}{25}$', '$\\dfrac{24}{25}$', '$\\dfrac{7}{25}$'],
    correcta: 2,
    explicacion: 'Como $\\cos x = \\dfrac{4}{5}$, entonces $\\sin 2x = 2\\sin x\\cos x = 2\\cdot\\dfrac{3}{5}\\cdot\\dfrac{4}{5} = \\dfrac{24}{25}$.',
  },
  {
    id: 'trg-122', temaId: 'tri-identidades-2', dificultad: 0.43,
    enunciado: 'Si $\\sin x = \\dfrac{1}{3}$, calcula $\\cos 2x$.',
    opciones: ['$\\dfrac{2}{3}$', '$\\dfrac{1}{9}$', '$\\dfrac{7}{9}$', '$-\\dfrac{7}{9}$'],
    correcta: 2,
    explicacion: 'Con $\\cos 2x = 1 - 2\\sin^2 x$: $1 - 2\\cdot\\dfrac{1}{9} = \\dfrac{7}{9}$. No hace falta saber el cuadrante porque la fórmula solo usa el seno al cuadrado.',
  },
  {
    id: 'trg-123', temaId: 'tri-identidades-2', dificultad: 0.5,
    enunciado: 'Si $\\tan x = \\dfrac{1}{2}$, calcula $\\tan 2x$.',
    opciones: ['$1$', '$\\dfrac{3}{4}$', '$\\dfrac{1}{4}$', '$\\dfrac{4}{3}$'],
    correcta: 3,
    explicacion: 'Con $\\tan 2x = \\dfrac{2\\tan x}{1-\\tan^2 x}$: $\\dfrac{2 \\cdot 1/2}{1 - 1/4} = \\dfrac{1}{3/4} = \\dfrac{4}{3}$.',
  },
  {
    id: 'trg-124', temaId: 'tri-identidades-2', dificultad: 0.52,
    enunciado: 'Si $\\cos x = \\dfrac{1}{2}$ y $x$ es agudo, ¿cuánto vale $\\sin\\dfrac{x}{2}$?',
    opciones: ['$\\dfrac{\\sqrt{2}}{2}$', '$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{1}{2}$', '$\\dfrac{1}{4}$'],
    correcta: 2,
    explicacion: 'Con $\\sin^2\\dfrac{x}{2} = \\dfrac{1-\\cos x}{2} = \\dfrac{1 - 1/2}{2} = \\dfrac{1}{4}$. Como $x$ es agudo, $\\dfrac{x}{2}$ también, así que la raíz es positiva: $\\dfrac{1}{2}$.',
  },

  /* ── Transformaciones a producto ────────────────────────────────────── */
  {
    id: 'trg-125', temaId: 'tri-identidades-3', dificultad: 0.45,
    enunciado: 'Transforma a producto: $\\sin 5x + \\sin 3x$.',
    opciones: ['$2\\sin 4x\\cos x$', '$2\\cos 4x\\sin x$', '$\\sin 8x$', '$2\\sin x\\cos 4x$'],
    correcta: 0,
    explicacion: 'Con $\\sin A + \\sin B = 2\\sin\\dfrac{A+B}{2}\\cos\\dfrac{A-B}{2}$: la semisuma es $4x$ y la semidiferencia $x$, así que queda $2\\sin 4x\\cos x$.',
  },
  {
    id: 'trg-126', temaId: 'tri-identidades-3', dificultad: 0.55,
    enunciado: 'Simplifica $\\cos 70^\\circ + \\cos 50^\\circ$.',
    opciones: ['$\\cos 60^\\circ$', '$2\\cos 60^\\circ$', '$\\cos 10^\\circ$', '$\\sin 10^\\circ$'],
    correcta: 2,
    explicacion: 'Con $\\cos A + \\cos B = 2\\cos\\dfrac{A+B}{2}\\cos\\dfrac{A-B}{2}$ queda $2\\cos 60^\\circ\\cos 10^\\circ$. Como $\\cos 60^\\circ = \\dfrac{1}{2}$, el 2 se cancela y sobra $\\cos 10^\\circ$.',
  },
  {
    id: 'trg-127', temaId: 'tri-identidades-3', dificultad: 0.56,
    enunciado: 'Simplifica $\\sin 80^\\circ - \\sin 20^\\circ$.',
    opciones: ['$\\sin 60^\\circ$', '$2\\sin 30^\\circ$', '$\\cos 50^\\circ$', '$\\sin 50^\\circ$'],
    correcta: 2,
    explicacion: 'Con $\\sin A - \\sin B = 2\\cos\\dfrac{A+B}{2}\\sin\\dfrac{A-B}{2}$ queda $2\\cos 50^\\circ\\sin 30^\\circ$. Como $\\sin 30^\\circ = \\dfrac{1}{2}$, sobra $\\cos 50^\\circ$.',
  },
  {
    id: 'trg-128', temaId: 'tri-identidades-3', dificultad: 0.58,
    enunciado: 'Simplifica $\\dfrac{\\sin 3x + \\sin x}{\\cos 3x + \\cos x}$.',
    opciones: ['$\\tan 2x$', '$\\cot 2x$', '$\\tan 4x$', '$\\tan x$'],
    correcta: 0,
    explicacion: 'Arriba queda $2\\sin 2x\\cos x$ y abajo $2\\cos 2x\\cos x$. Se cancelan el 2 y el $\\cos x$, y sobra $\\dfrac{\\sin 2x}{\\cos 2x} = \\tan 2x$.',
  },

  /* ── Ecuaciones trigonométricas ─────────────────────────────────────── */
  {
    id: 'trg-129', temaId: 'tri-ecuaciones-1', dificultad: 0.38,
    enunciado: '¿Cuántas soluciones tiene $\\sin x = \\dfrac{1}{2}$ en el intervalo $[0^\\circ, 360^\\circ\\rangle$?',
    opciones: ['$1$', '$2$', '$3$', '$4$'],
    correcta: 1,
    explicacion: 'El seno es positivo en el primer y segundo cuadrante: $x = 30^\\circ$ y $x = 150^\\circ$. Son dos.',
  },
  {
    id: 'trg-130', temaId: 'tri-ecuaciones-1', dificultad: 0.42,
    enunciado: 'Resuelve $2\\cos x - 1 = 0$ en $[0^\\circ, 360^\\circ\\rangle$.',
    opciones: ['$60^\\circ$ y $120^\\circ$', '$60^\\circ$ y $300^\\circ$', '$30^\\circ$ y $330^\\circ$', '$120^\\circ$ y $240^\\circ$'],
    correcta: 1,
    explicacion: 'Queda $\\cos x = \\dfrac{1}{2}$. El coseno es positivo en el primer y cuarto cuadrante, así que $x = 60^\\circ$ y $x = 300^\\circ$.',
  },
  {
    id: 'trg-131', temaId: 'tri-ecuaciones-1', dificultad: 0.62,
    enunciado: '¿Cuántas soluciones tiene $\\sin 2x = \\sin x$ en $[0^\\circ, 360^\\circ\\rangle$?',
    opciones: ['$2$', '$3$', '$4$', '$6$'],
    correcta: 2,
    explicacion: 'Pasando todo a un lado: $2\\sin x\\cos x - \\sin x = 0$, o sea $\\sin x(2\\cos x - 1) = 0$. De $\\sin x = 0$ salen $0^\\circ$ y $180^\\circ$; de $\\cos x = \\dfrac{1}{2}$ salen $60^\\circ$ y $300^\\circ$. Cuatro en total.',
  },
  {
    id: 'trg-132', temaId: 'tri-ecuaciones-1', dificultad: 0.4,
    enunciado: 'Resuelve $\\tan x = \\sqrt{3}$ en $[0^\\circ, 360^\\circ\\rangle$.',
    opciones: ['$30^\\circ$ y $150^\\circ$', '$30^\\circ$ y $210^\\circ$', '$60^\\circ$ y $120^\\circ$', '$60^\\circ$ y $240^\\circ$'],
    correcta: 3,
    explicacion: 'La tangente es positiva en el primer y tercer cuadrante, y su periodo es $180^\\circ$. Con $\\tan 60^\\circ = \\sqrt{3}$, las soluciones son $60^\\circ$ y $60^\\circ + 180^\\circ = 240^\\circ$.',
  },

  /* ── Triángulos oblicuángulos ───────────────────────────────────────── */
  {
    id: 'trg-133', temaId: 'tri-oblicuangulos-1', dificultad: 0.48,
    enunciado: 'Dos lados de un triángulo miden $5$ y $8$, y el ángulo que forman es $60^\\circ$. ¿Cuánto mide el tercer lado?',
    opciones: ['$\\sqrt{89}$', '$9$', '$7$', '$\\sqrt{129}$'],
    correcta: 2,
    explicacion: 'Por la ley de cosenos: $c^2 = 25 + 64 - 2\\cdot 5\\cdot 8\\cdot\\cos 60^\\circ = 89 - 40 = 49$, así que $c = 7$.',
  },
  {
    id: 'trg-134', temaId: 'tri-oblicuangulos-1', dificultad: 0.52,
    enunciado: 'En un triángulo, $a = 10$, $A = 30^\\circ$ y $B = 45^\\circ$. ¿Cuánto mide el lado $b$?',
    opciones: ['$10\\sqrt{2}$', '$5\\sqrt{2}$', '$20$', '$10\\sqrt{3}$'],
    correcta: 0,
    explicacion: 'Por la ley de senos, $\\dfrac{b}{\\sin B} = \\dfrac{a}{\\sin A}$, así que $b = \\dfrac{10 \\cdot \\sin 45^\\circ}{\\sin 30^\\circ} = \\dfrac{10 \\cdot \\sqrt{2}/2}{1/2} = 10\\sqrt{2}$.',
  },
  {
    id: 'trg-135', temaId: 'tri-oblicuangulos-1', dificultad: 0.55,
    enunciado: 'Los lados de un triángulo miden $7$, $8$ y $9$. ¿Cuál es el coseno del ángulo opuesto al lado de $9$?',
    opciones: ['$\\dfrac{11}{21}$', '$\\dfrac{1}{7}$', '$\\dfrac{3}{8}$', '$\\dfrac{2}{7}$'],
    correcta: 3,
    explicacion: 'Por la ley de cosenos: $\\cos C = \\dfrac{49 + 64 - 81}{2\\cdot 7\\cdot 8} = \\dfrac{32}{112} = \\dfrac{2}{7}$.',
  },
  {
    id: 'trg-136', temaId: 'tri-oblicuangulos-1', dificultad: 0.44,
    enunciado: 'Calcula el área de un triángulo con lados de $6$ y $10$ que forman un ángulo de $30^\\circ$.',
    opciones: ['$30$', '$15$', '$15\\sqrt{3}$', '$60$'],
    correcta: 1,
    explicacion: 'El área es $\\dfrac{ab\\sin C}{2} = \\dfrac{6 \\cdot 10 \\cdot 1/2}{2} = 15$.',
  },

  /* ── Elevación y depresión ──────────────────────────────────────────── */
  {
    id: 'trg-137', temaId: 'tri-oblicuangulos-2', dificultad: 0.35,
    enunciado: 'Desde un punto a $30$ m de la base de una torre, la elevación de su punta es $60^\\circ$. ¿Qué altura tiene la torre?',
    opciones: ['$60$ m', '$15\\sqrt{3}$ m', '$30\\sqrt{3}$ m', '$10\\sqrt{3}$ m'],
    correcta: 2,
    explicacion: 'La tangente relaciona la altura con la distancia: $h = 30\\tan 60^\\circ = 30\\sqrt{3}$ m.',
  },
  {
    id: 'trg-138', temaId: 'tri-oblicuangulos-2', dificultad: 0.65,
    enunciado: 'Desde un punto, la elevación de la punta de una torre es $30^\\circ$. Al acercarse $20$ m en línea recta, la elevación pasa a $60^\\circ$. ¿Qué altura tiene la torre?',
    opciones: ['$10\\sqrt{3}$ m', '$20$ m', '$10$ m', '$20\\sqrt{3}$ m'],
    correcta: 0,
    explicacion: 'Las dos distancias son $\\dfrac{h}{\\tan 30^\\circ}$ y $\\dfrac{h}{\\tan 60^\\circ}$, y se diferencian en 20: $h\\sqrt{3} - \\dfrac{h}{\\sqrt{3}} = 20$. Eso es $\\dfrac{2h}{\\sqrt{3}} = 20$, así que $h = 10\\sqrt{3}$ m.',
  },
  {
    id: 'trg-139', temaId: 'tri-oblicuangulos-2', dificultad: 0.3,
    enunciado: 'Desde lo alto de un acantilado de $50$ m, un bote se ve con un ángulo de depresión de $45^\\circ$. ¿A qué distancia horizontal está el bote?',
    opciones: ['$50$ m', '$25$ m', '$50\\sqrt{2}$ m', '$100$ m'],
    correcta: 0,
    explicacion: 'Con $45^\\circ$ la tangente vale 1, así que la distancia horizontal es igual a la altura: $50$ m.',
  },
  {
    id: 'trg-140', temaId: 'tri-oblicuangulos-2', dificultad: 0.4,
    enunciado: 'Desde $40$ m de distancia, un poste se ve con una elevación de $37^\\circ$. ¿Qué altura tiene?',
    opciones: ['$32$ m', '$24$ m', '$53$ m', '$30$ m'],
    correcta: 3,
    explicacion: 'El ángulo de $37^\\circ$ es notable y $\\tan 37^\\circ = \\dfrac{3}{4}$. Entonces $h = 40 \\cdot \\dfrac{3}{4} = 30$ m.',
  },

  /* ── Funciones trigonométricas ──────────────────────────────────────── */
  {
    id: 'trg-141', temaId: 'tri-funciones-1', dificultad: 0.42,
    enunciado: '¿Cuál es el rango de $y = 3\\sin x + 1$?',
    opciones: ['$[-3, 3]$', '$[-4, 4]$', '$[0, 4]$', '$[-2, 4]$'],
    correcta: 3,
    explicacion: 'Como $\\sin x$ va de $-1$ a $1$, entonces $3\\sin x$ va de $-3$ a $3$, y sumando 1 el rango queda $[-2, 4]$.',
  },
  {
    id: 'trg-142', temaId: 'tri-funciones-1', dificultad: 0.45,
    enunciado: '¿Cuál es el periodo de $y = \\sin 4x$?',
    opciones: ['$\\dfrac{\\pi}{2}$', '$4\\pi$', '$\\pi$', '$2\\pi$'],
    correcta: 0,
    explicacion: 'El periodo del seno es $2\\pi$ y se divide entre el coeficiente de $x$: $\\dfrac{2\\pi}{4} = \\dfrac{\\pi}{2}$.',
  },
  {
    id: 'trg-143', temaId: 'tri-funciones-1', dificultad: 0.4,
    enunciado: '¿Cuál es el valor máximo de $y = 5 - 2\\cos x$?',
    opciones: ['$3$', '$5$', '$10$', '$7$'],
    correcta: 3,
    explicacion: 'El máximo se alcanza cuando $\\cos x$ toma su valor mínimo, $-1$: $5 - 2(-1) = 7$. Ojo con el signo menos, que invierte dónde está el máximo.',
  },
  {
    id: 'trg-144', temaId: 'tri-funciones-1', dificultad: 0.5,
    enunciado: '¿Cuál es el periodo de $y = \\tan\\dfrac{x}{2}$?',
    opciones: ['$\\pi$', '$2\\pi$', '$4\\pi$', '$\\dfrac{\\pi}{2}$'],
    correcta: 1,
    explicacion: 'El periodo de la tangente es $\\pi$, no $2\\pi$. Dividido entre el coeficiente $\\dfrac{1}{2}$ queda $\\dfrac{\\pi}{1/2} = 2\\pi$.',
  },
  {
    id: 'trg-145', temaId: 'tri-funciones-2', dificultad: 0.35,
    enunciado: 'Calcula $\\arcsin\\dfrac{1}{2}$.',
    opciones: ['$\\dfrac{\\pi}{3}$', '$\\dfrac{5\\pi}{6}$', '$\\dfrac{\\pi}{4}$', '$\\dfrac{\\pi}{6}$'],
    correcta: 3,
    explicacion: 'El arcoseno devuelve el ángulo entre $-\\dfrac{\\pi}{2}$ y $\\dfrac{\\pi}{2}$ cuyo seno es $\\dfrac{1}{2}$: es $\\dfrac{\\pi}{6}$.',
  },
  {
    id: 'trg-146', temaId: 'tri-funciones-2', dificultad: 0.5,
    enunciado: 'Calcula $\\arccos\\left(-\\dfrac{1}{2}\\right)$.',
    opciones: ['$\\dfrac{\\pi}{3}$', '$\\dfrac{2\\pi}{3}$', '$-\\dfrac{\\pi}{3}$', '$\\dfrac{4\\pi}{3}$'],
    correcta: 1,
    explicacion: 'El arcocoseno devuelve ángulos entre $0$ y $\\pi$, así que la respuesta está en el segundo cuadrante: $\\pi - \\dfrac{\\pi}{3} = \\dfrac{2\\pi}{3}$.',
  },
  {
    id: 'trg-147', temaId: 'tri-funciones-2', dificultad: 0.55,
    enunciado: 'Calcula $\\arctan 1 + \\arctan\\sqrt{3}$.',
    opciones: ['$\\dfrac{\\pi}{2}$', '$\\dfrac{5\\pi}{12}$', '$\\dfrac{2\\pi}{3}$', '$\\dfrac{7\\pi}{12}$'],
    correcta: 3,
    explicacion: '$\\arctan 1 = \\dfrac{\\pi}{4}$ y $\\arctan\\sqrt{3} = \\dfrac{\\pi}{3}$. La suma es $\\dfrac{3\\pi + 4\\pi}{12} = \\dfrac{7\\pi}{12}$.',
  },
  {
    id: 'trg-148', temaId: 'tri-funciones-2', dificultad: 0.44,
    enunciado: '¿Cuál es el rango de la función $\\arccos x$?',
    opciones: ['$[0, 2\\pi]$', '$\\left[-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right]$', '$[-1, 1]$', '$[0, \\pi]$'],
    correcta: 3,
    explicacion: 'Su dominio es $[-1, 1]$ y su rango $[0, \\pi]$. Se confunden con facilidad: el intervalo $\\left[-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right]$ es el rango del arcoseno.',
  },
  {
    id: 'trg-149', temaId: 'tri-funciones-3', dificultad: 0.58,
    enunciado: 'La altura de una cabina de rueda de la fortuna, en metros, es $h(t) = 12 - 10\\cos\\dfrac{\\pi t}{15}$, con $t$ en segundos. ¿Cuál es su altura máxima?',
    opciones: ['$12$ m', '$22$ m', '$2$ m', '$10$ m'],
    correcta: 1,
    explicacion: 'El máximo ocurre cuando $\\cos$ vale $-1$: $12 - 10(-1) = 22$ m. El signo menos hace que el máximo caiga donde el coseno es mínimo.',
  },
  {
    id: 'trg-150', temaId: 'tri-funciones-3', dificultad: 0.55,
    enunciado: 'En el mismo modelo $h(t) = 12 - 10\\cos\\dfrac{\\pi t}{15}$, ¿cuánto tarda la rueda en dar una vuelta completa?',
    opciones: ['$15$ s', '$30$ s', '$60$ s', '$\\dfrac{\\pi}{15}$ s'],
    correcta: 1,
    explicacion: 'Una vuelta es un periodo: $\\dfrac{2\\pi}{\\pi/15} = 30$ segundos.',
  },

  /* ── Del temario oficial que faltaba cubrir ─────────────────────────── */
  {
    id: 'trg-151', temaId: 'tri-normal-1', dificultad: 0.35,
    enunciado: 'Calcula $\\sin(-30^{\\circ}) + \\cos(-60^{\\circ})$.',
    opciones: ['$1$', '$0$', '$-1$', '$\\sqrt{3}$'],
    correcta: 1,
    explicacion: 'El seno es una función impar: $\\sin(-x) = -\\sin x$, así que $\\sin(-30^{\\circ}) = -\\dfrac{1}{2}$. El coseno es par: $\\cos(-x) = \\cos x$, así que $\\cos(-60^{\\circ}) = \\dfrac{1}{2}$. La suma es 0. Tratar el ángulo negativo como positivo da 1.',
  },
  {
    id: 'trg-152', temaId: 'tri-oblicuangulos-1', dificultad: 0.6,
    enunciado: 'En un triángulo $ABC$, $A = 75^{\\circ}$ y $B = 15^{\\circ}$. Por la ley de tangentes, ¿cuánto vale $\\dfrac{a - b}{a + b}$?',
    opciones: ['$\\sqrt{3}$', '$\\dfrac{1}{2}$', '$\\dfrac{\\sqrt{3}}{3}$', '$\\dfrac{\\sqrt{3}}{2}$'],
    correcta: 2,
    explicacion: 'La ley de tangentes dice $\\dfrac{a - b}{a + b} = \\dfrac{\\tan \\frac{A - B}{2}}{\\tan \\frac{A + B}{2}} = \\dfrac{\\tan 30^{\\circ}}{\\tan 45^{\\circ}} = \\dfrac{\\sqrt{3}}{3}$. Invertir la fracción da $\\sqrt{3}$.',
  },
];
