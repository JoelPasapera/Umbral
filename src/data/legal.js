/**
 * Textos legales.
 *
 * Viven aquí, en un solo sitio, porque se muestran en tres lugares distintos:
 * las dos páginas estáticas (`privacidad.html` y `terminos.html`, que son las
 * que Google y cualquier tienda de aplicaciones exigen que sean públicas y
 * accesibles sin cuenta) y la pantalla de dentro de la aplicación.
 *
 * Si estuvieran duplicados, divergirían: alguien corregiría uno y se olvidaría
 * del otro, y acabarías con dos políticas de privacidad distintas para el mismo
 * producto. Eso es peor que no tener ninguna.
 *
 * Están escritos cortos y en lenguaje llano a propósito. Un documento de seis
 * páginas que nadie lee no es transparencia, es cobertura legal disfrazada.
 *
 * ⚠ Borrador honesto, no documento validado. Antes de publicar tiene que
 *   revisarlo alguien que conozca la normativa peruana de protección de datos
 *   y de menores.
 */

export const PRIVACIDAD = {
  titulo: 'Política de privacidad',
  entrada:
    'Qué datos guarda Umbral, para qué los usa y qué puedes hacer con ellos. Corto y en lenguaje llano, porque un documento que nadie lee no informa a nadie.',
  secciones: [
    {
      titulo: 'Qué datos recogemos',
      parrafos: [
        'Tu nombre y tu correo electrónico. Si entras con Google, los recibimos de Google: solo el nombre, el correo y si ese correo está verificado. No pedimos ni recibimos nada más de tu cuenta de Google.',
        'Tu año de nacimiento. Solo el año, no la fecha completa. Lo pedimos únicamente para saber si necesitas el permiso de un apoderado.',
        'El código de la academia con la que te registras, que determina a qué contenido tienes acceso.',
        'Tus respuestas de práctica: qué pregunta, si acertaste y cuándo. Es lo que permite calcular tu preparación; sin eso la aplicación no puede hacer su trabajo.',
        'Nada más. No pedimos tu documento de identidad, ni tu teléfono, ni tu colegio, ni tu dirección, ni tu ubicación.',
      ],
    },
    {
      titulo: 'Para qué los usamos',
      parrafos: [
        'Para calcular tu índice de preparación y decirte en qué cursos y temas estás perdiendo puntos.',
        'Para que tu academia vea el avance de su grupo. Un profesor de tu academia puede ver tus resultados; no puede verlos nadie de otra academia.',
        'Para mantener tu sesión abierta y recuperar tu contraseña si la olvidas.',
      ],
    },
    {
      titulo: 'Qué no hacemos',
      parrafos: [
        'No vendemos tus datos ni los compartimos con anunciantes.',
        'No mostramos publicidad.',
        'No publicamos tu puntaje ni tu nombre en ninguna lista visible para otros estudiantes.',
        'No te enviamos correos que no hayas pedido.',
        'No usamos tus datos para entrenar ningún sistema fuera de tu propio diagnóstico.',
      ],
    },
    {
      titulo: 'Tus datos son tuyos',
      parrafos: [
        'Puedes descargarlos cuando quieras desde tu perfil, en un archivo que se abre en cualquier computadora.',
        'Puedes pedir que borremos tu cuenta y todo lo asociado escribiendo a la dirección de contacto. Se borra de verdad, no se oculta.',
        'Puedes pedirnos que corrijamos cualquier dato incorrecto.',
      ],
    },
    {
      titulo: 'Si eres menor de edad',
      parrafos: [
        'Necesitas el permiso de tu padre, madre o apoderado para crear una cuenta. Al registrarte confirmas que lo tienes.',
        'No aceptamos cuentas de menores de 14 años.',
        'Tu apoderado puede pedirnos ver o borrar tus datos en cualquier momento.',
      ],
    },
    {
      titulo: 'Dónde se guardan y cuánto tiempo',
      parrafos: [
        'Los datos se guardan mientras tu cuenta esté activa. Si pides que la borremos, se eliminan.',
        'Si tu academia deja de usar Umbral, sus alumnos conservan sus cuentas y pueden descargar sus datos antes de que se cierren.',
      ],
    },
    {
      titulo: 'Cambios y contacto',
      parrafos: [
        'Si esta política cambia, se avisa dentro de la aplicación antes de que el cambio tenga efecto.',
        'Para cualquier consulta sobre tus datos, escribe a la dirección de contacto que aparece al final de esta página.',
      ],
    },
  ],
};

export const TERMINOS = {
  titulo: 'Términos de uso',
  entrada:
    'Las reglas de uso de Umbral, en lenguaje llano. Al crear una cuenta aceptas lo que dice esta página.',
  secciones: [
    {
      titulo: 'Qué es Umbral',
      parrafos: [
        'Una herramienta para estimar tu preparación para un examen de admisión y orientarte sobre qué estudiar.',
        'Se accede con un código que da tu academia. No es un servicio abierto al público.',
      ],
    },
    {
      titulo: 'Sobre el número de preparación',
      parrafos: [
        'Es una estimación a partir de tus respuestas, con su margen de error siempre a la vista. No es una predicción de si vas a ingresar, y no debe tomarse como tal.',
        'El puntaje de corte que mostramos es el de un proceso de admisión anterior. Cambia cada año y no lo controlamos.',
        'Cuando no tenemos datos suficientes lo decimos, en vez de inventar un número.',
        'El temario y los pesos por curso salen de la información publicada por cada universidad. Puede cambiar sin previo aviso, y la fuente oficial siempre es el prospecto de admisión.',
      ],
    },
    {
      titulo: 'Tu cuenta',
      parrafos: [
        'La cuenta es personal e intransferible. No la compartas.',
        'Eres responsable de la actividad que ocurra con tu cuenta.',
        'Si detectamos que alguien manipula sus respuestas para inflar su preparación, se perjudica solo a sí mismo, pero podemos reiniciar su historial.',
      ],
    },
    {
      titulo: 'Sobre el material de estudio',
      parrafos: [
        'Publicamos material de libre distribución y aportes de la comunidad, además del que cada academia sube para sus propios alumnos.',
        'Si eres autor o editorial y encuentras material tuyo que no debería estar publicado, escríbenos y lo retiramos.',
      ],
    },
    {
      titulo: 'Conducta',
      parrafos: [
        'Podemos cerrar cuentas que usen la aplicación para acosar o perjudicar a otras personas.',
        'Podemos cerrar cuentas que intenten acceder a contenido de una academia a la que no pertenecen.',
      ],
    },
    {
      titulo: 'Disponibilidad',
      parrafos: [
        'Hacemos lo posible por mantener el servicio disponible, pero no garantizamos que funcione sin interrupciones.',
        'Si el servicio se cierra, se avisa con antelación suficiente para que descargues tus datos.',
      ],
    },
  ],
};

export const CONTACTO = 'hola@umbral.pe';

export const AVISO_BORRADOR =
  'Borrador pendiente de revisión legal. No lo tomes como documento definitivo.';
