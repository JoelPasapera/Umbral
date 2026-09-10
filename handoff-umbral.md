# Traspaso · Umbral

Documento para retomar este proyecto **desde una cuenta nueva, sin memoria de
la anterior**. Se lee entero y antes de tocar nada.

El proyecto ya trae tres documentos propios; este los ordena y añade lo único
que no está en ninguno: el hilo de la conversación, las decisiones que se
descartaron y por qué, y las cosas que solo puede hacer el propietario.

| Archivo | Para qué |
| --- | --- |
| Este | Retomar el trabajo. Contexto, historia y estado |
| `README.md` | Cómo funciona y cómo correrlo |
| `PROJECT_CONTEXT.md` | Por qué es como es |
| `CRITERIOS.md` | Bajo qué reglas se construye, y el plan por fases |

---

## 1. Cómo trabajar con el propietario

Estas son las condiciones de trabajo observadas durante toda la conversación.
Respetarlas no es cortesía: ignorarlas hizo perder varias iteraciones.

**Idioma.** Todo en español: conversación, código, nombres de variables,
comentarios, archivos. Escrito de forma nativa, nunca traducido literalmente.

**Anonimato, absoluto.** Nunca mencionar Claude, IA ni modelos de lenguaje en
nada que sea visible para un usuario o semipúblico. Nunca revelar el nombre,
identidad, ubicación ni empresa del propietario. Esto se aplica a **todos** los
archivos y prompts, incluidos los documentos del repositorio. Referirse a él
como "el propietario". Por eso este documento no lleva su nombre.

**Formato de respuesta.** Cortas. Una tarea por vez. Lenguaje llano, sin jerga
técnica salvo la que él mismo use. Cuando haya opciones reales, presentarlas
como pregunta con botones, indicando antes cuál se recomienda y por qué.

**Terminal.** Un solo comando por mensaje, nunca varios juntos.

**Antes de una decisión visual, generar una maqueta o una captura.** No
describirla. En este proyecto hay una herramienta para eso (§6).

**Si falta un adjunto esperado, detenerse y avisar.** No trabajar a medias con
lo que haya llegado.

**Sobre el código:** el propietario delega la escritura de código a un agente
(Claude Code Desktop, en Windows con PowerShell). Aun así, durante esta
conversación ha revisado detalle técnico sin problema. Lo importante es
explicar siempre las consecuencias —dinero, datos de alumnos, tiempo del
profesor— y no solo el mecanismo.

---

## 2. Qué es Umbral

Sistema de preparación para exámenes de admisión peruanos. Responde una sola
pregunta: **a qué distancia estás del puntaje de corte de tu carrera**, y qué
hacer hoy para acortarla.

Se vende a **academias preuniversitarias y miniempresas**, no directamente al
estudiante. Hay tres usuarios: el alumno la usa, el profesor necesita saber
quién se queda atrás sin leer sesenta cuadernos, y la coordinación necesita
enseñarle a los padres que el dinero funciona.

### De dónde viene

Nació de auditar un sitio ajeno, "Mundo Pre" (`mundpre222.netlify.app`).
**Umbral no comparte una sola línea con él** — se verificó: ni credenciales, ni
datos de contacto, ni preguntas, ni marcas. Pero muchas decisiones salieron de
fallos concretos de aquella auditoría, y están resueltas de raíz:

| Hallazgo original | Cómo se resuelve aquí |
| --- | --- |
| `is_admin` editable desde el cliente | El rol lo decide un código de invitación; el servidor lo comprueba en cada acción |
| XSS en el botón de compartir | Cero `onclick` en HTML, `textContent` obligatorio |
| KaTeX de 300 KB en cada visita | Carga solo si hay fórmula, con respaldo legible si el CDN falla |
| Miniaturas cargando la imagen completa | Campos `miniatura` y `pagina` separados |
| Caché de biblioteca que nadie invalidaba | Se invalida por evento en el bus |
| Sin recuperación de contraseña | Implementada |
| Sin verificación de edad ni términos | Ambas, con permiso de apoderado entre 14 y 17 |
| Mensajes internos en pantalla del alumno | Prohibido por criterio, con prueba |
| 233 colores sueltos y 37 `!important` | Un solo archivo con colores, cero `!important` |
| Chat abierto sin moderar para menores | No existe y no se va a añadir |
| Todo detrás del login: cero tráfico orgánico | Portada estática indexable |

### La tesis

**Un solo número honesto.** El índice se calcula en `src/domain/readiness.js`
con tres ajustes —antigüedad, dificultad e incertidumbre— y una regla que
gobierna el archivo: **por debajo del umbral de evidencia no se devuelve un
número**. Un postulante que confía en un 61 inventado se lleva el golpe el día
del examen.

De ahí salen decisiones que se romperían por descuido. Si vas a cambiar algo de
esto, para y pregunta:

- **La práctica libre pesa 0.4 y el reto diario pesa 1.** La práctica libre
  funciona sin conexión, y para eso las respuestas correctas viajan al
  teléfono, donde se pueden leer. El reto lo corrige el servidor. El peso
  refleja la fiabilidad del dato, no un capricho.
- **El margen de error se muestra siempre.**
- **Los cursos sin evidencia quedan fuera del promedio** y se reportan aparte.

---

## 3. Decisiones tomadas a propósito de NO hacer

**La sección más importante de este documento.** Todo lo de aquí se evaluó y se
descartó con razones. Si te parece buena idea añadirlo, lee la razón antes.

**XP, niveles y puntos.** El producto se apoya en un número honesto que cuesta
mover. Un contador de XP es un segundo número, falso, que sube con solo abrir la
aplicación. Compite con el real por la atención del chico y gana, porque es más
fácil.

**Logros y medallas.** Mismo problema. Además, en el sitio original vivían en el
navegador: el alumno cambiaba de teléfono y desaparecían.

**Pomodoro.** Es un temporizador. El teléfono ya trae uno. No alimenta el
diagnóstico.

**Chat abierto entre alumnos.** Público mayoritariamente menor de edad, sin
moderar, sin reportar, sin bloquear. Era el mayor riesgo legal del proyecto
anterior. Si algún día hay comunidad, será preguntas y respuestas moderadas
atadas a un ejercicio, que es otro producto.

**Chatbot general de IA.** Lo tiene toda la competencia, así que no diferencia.
Cuesta por mensaje sin techo, alucina en matemáticas, invita a uso fuera de tema
y no produce nada medible.

**Predecir si el alumno ingresará.** Nunca. Destruye en una frase la honestidad
sobre la que se sostiene todo lo demás.

**Material generado por IA sin revisar.** Matemáticas alucinadas en una
plataforma de admisión hacen daño real.

**Volver a la estética de papel y tinta.** Se propuso, se construyó, y el
propietario la rechazó tras varias iteraciones. Ver §5.

---

## 4. Reglas del código que no se negocian

Detalladas en `CRITERIOS.md`. Las que más se romperían por descuido:

1. **Un solo archivo tiene colores**: `src/ui/tokens.css`. Cualquier hex fuera
   de ahí rompe `pruebas/criterios.test.mjs`.
2. **Ni un `onclick` en HTML.** Eventos con `addEventListener`, texto con
   `textContent`. Eso permite una política de seguridad estricta y hace la
   inyección imposible por construcción.
3. **Cero funciones globales.** Nada cuelga de `window`.
4. **Ningún componente habla con la red.** Solo los repositorios llaman a
   `src/data/client.js`.
5. **Cada carpeta de `src/features/` se puede borrar entera** sin romper el
   resto. Si dos necesitan hablarse, es por el bus de eventos.
6. **La academia sale de la sesión, nunca de la petición.** Es la regla que
   sostiene el modelo multiacademia; `pruebas/multiacademia.test.mjs` intenta
   cruzar esa frontera por veinticinco vías.
7. **Google autentica, no registra.** Una identidad de Google sin cuenta recibe
   un pase de un solo uso, no una sesión, y tiene que dar el código de academia
   como todo el mundo.
8. **Sin dependencias en tiempo de ejecución.** Ni una. Las herramientas de
   auditoría son solo de desarrollo.

### Convenciones

- Los comentarios explican **el porqué**, no el qué. Si describen lo que hace la
  línea siguiente, sobran.
- Cada decisión discutible lleva su prueba, no para cubrir porcentaje sino para
  que nadie la deshaga sin enterarse.
- `src/domain/` es puro: sin DOM, sin red, sin reloj propio (la fecha entra como
  parámetro). Por eso se prueba con Node a secas.

---

## 5. Historia de la conversación

En orden, porque explica por qué el proyecto es como es.

**Auditoría del sitio ajeno.** Se analizó `mundpre222.netlify.app` a fondo:
7.700 líneas propias, hallazgos de seguridad (XSS en compartir anuncios,
dependencia total de políticas RLS no verificables), rendimiento (750 KB de
JavaScript, miniaturas a tamaño completo), accesibilidad, y funciones rotas (el
buscador global y la "biblioteca clásica" leían un array vacío). También se
detectó riesgo legal: material con derechos de autor y un chat sin moderar para
menores.

**Decisión de construir desde cero.** El propietario pidió algo "legendario", no
una copia. Se propuso y aceptó la tesis del diagnóstico honesto.

**Construcción por fases**, cada una verificada antes de la siguiente:
cimientos y pantalla de meta → práctica → estudio → capa sin conexión →
autenticación → panel de administración → elegir meta y reto diario →
generación de preguntas con IA → multiacademia → portada → temario oficial →
entrada con Google.

**El nombre.** El proyecto se llamó "Mundo Pre" por inercia durante varios
pasos. Se detectó que era la marca de un tercero, se buscó alternativa
verificando que no estuviera ocupada (se descartó "Cachimbo": ya existe
Cachimboz con 500.000 descargas), y el propietario eligió **Umbral**.

**Tres correcciones de dirección visual**, y esto importa:

1. Se propuso una estética de papel y tinta —hoja de respuestas, grafito,
   lapicero rojo— muy trabajada. El propietario dijo varias veces que no.
2. Se insistió puliendo dentro de esa misma dirección. Fue un error: se estaba
   defendiendo una preferencia propia en lugar de escuchar.
3. El propietario envió referencias visuales concretas (dos plataformas
   educativas peruanas). **Esa es la dirección que manda.** Se rehízo todo:
   claro y aireado, degradados azules suaves, superficies blancas muy
   redondeadas, tipografía de palo pesada, rótulos de sección en azul con
   punto, pastillas para navegación y botones.

   La única decisión propia que se mantuvo, con motivo: **el rojo está reservado
   a la línea de corte y los errores**. Es la única nota cálida de la paleta y
   por eso el ojo va directo a ella.

**Errores cometidos, para no repetirlos:**

- Leer los valores del formulario del DOM al enviarlo, después de redibujar:
  llegaban vacíos y la aplicación decía "correo no válido" con un correo
  correcto. Se capturan con `FormData` en el `submit`.
- Validar un campo con un nombre distinto al del formulario (`aceptaTerminos`
  contra `terminos`): nadie podía registrarse. Hay una prueba que compara los
  dos archivos.
- El service worker sirviendo código viejo. Ya no se registra en `localhost`.
- Un icono que parecía una lápida y una pantalla donde el dato más importante
  era invisible. Ambos se detectaron **mirando capturas**, no pensando.
- Un botón de Google que simulaba la entrada y **creaba una sesión real**. Era
  una puerta trasera. Eliminado.
- Un `canonical` apuntando a un dominio inexistente, que le habría dicho a
  Google que la versión buena estaba en otro sitio.

---

## 6. Estado actual, exacto

**100 archivos. 18 baterías de prueba, 326 comprobaciones, todas en verde.**
8.865 líneas de código propio. 129 KB en carga en frío contra un presupuesto de
220. Mayor pintura en 1.124 ms con el procesador emulado cuatro veces más lento.
Cero incidencias de accesibilidad en las nueve pantallas, la portada y las dos
páginas legales.

### Nueve pantallas

`entrar` · `terminos` · `meta` · `temario` · `estudiar` · `practicar` ·
`elegir` · `perfil` · `admin`. Más `portada.html`, estática e independiente.

### Lo construido

- Registro con código de academia, recuperación de contraseña, verificación de
  edad con permiso de apoderado, entrada con Google (identificador de cliente ya
  configurado)
- **Páginas legales estáticas y públicas** (`privacidad.html`, `terminos.html`),
  generadas desde `src/data/legal.js` con `herramientas/paginas-legales.mjs`.
  No editarlas a mano: se regeneran y se perdería el cambio
- Elegir meta: 8 universidades, 25 carreras, pesos reales por área
- Índice de preparación con margen de error y comparación con el corte
- **Temario oficial de San Marcos**: 138 temas de matemática en 28 bloques,
  verificados contra fuente
- Reto diario corregido por el servidor, con racha y calendario de 28 días
- Práctica libre por curso
- Estudiar: material ordenado por diagnóstico, con visor de resúmenes
- Panel de contenido con cobertura, catálogo, registro de cambios y deshacer
- Generación de preguntas desde material, con puerta de validación y
  presupuesto por academia
- Multiacademia con tres roles y aislamiento probado
- Funciona sin conexión, con cola de envíos pendientes
- Portada pública indexable con capturas reales del producto

### Cómo verificar

```
node pruebas/correr.mjs
```

Sin instalar nada. **Si algo está en rojo, arréglalo antes de añadir nada.**

Ver la aplicación:

```
python3 -m http.server 8080
```

Cuentas de prueba, en dos academias distintas para poder probar el aislamiento:

| Academia | Cuenta | Correo | Contraseña |
| --- | --- | --- | --- |
| Rumbo | Alumno | `estudiante@umbral.pe` | `admision2027` |
| Rumbo | Coordinación | `admin@umbral.pe` | `catalogo2027` |
| Sigma | Alumna | `alumna@sigma.pe` | `sigma2027xx` |
| Sigma | Coordinación | `coordinacion@sigma.pe` | `sigma2027xx` |

Códigos de invitación: `RUMBO-2027` (alumno), `RUMBO-PROF` (profesor).

Auditoría en navegador real (accesibilidad, peso, estabilidad visual):

```
pip install playwright && playwright install chromium
npm install --no-save axe-core
python3 herramientas/auditar.py --capturas
```

Regenerar las capturas del producto para la portada, tras cambiar el diseño:

```
python3 herramientas/fotos.py
```

**Usa estas herramientas antes de dar por buena cualquier decisión visual.**

---

## 7. Pendiente del propietario

Cosas que **no puede hacer una sesión de Claude**. Si el propietario pregunta
por qué algo no funciona, empieza por aquí.

1. **Terminar de activar Google.** El identificador de cliente ya está en
   `src/data/config.js`. Le falta:
   - En *Orígenes autorizados de JavaScript*: `http://localhost:8080`,
     `http://127.0.0.1:8080` y su dominio. **Solo el origen**: esquema, dominio
     y puerto, sin ruta ni `#`. Ya se equivocó una vez pegando la URL completa.
   - *URIs de redireccionamiento*: **vacío**. Umbral usa Google Identity
     Services, que no redirige.
   - **Añadir cada origen desde el que se sirva el sitio.** Es el error que más
     veces se repitió: `origin_mismatch` significa exactamente eso, y el propio
     error de Google dice qué origen estaba pidiendo. Los cambios tardan entre
     cinco minutos y varias horas en aplicarse.
   - En *Público*, mantener el estado de publicación en **Prueba** y añadirse
     como usuario de prueba. En producción Google exige verificación de marca.
   - **No subir logotipo** mientras esté en pruebas: subirlo activa la
     verificación obligatoria, que exige demostrar la propiedad del dominio en
     Search Console. Con un dominio prestado (`pages.dev`, `github.io`) eso no
     se puede demostrar nunca.
   - Si el botón no aparece, la aplicación muestra a los cuatro segundos el
     origen exacto que falta añadir.

2. **Las tres URL absolutas** (`canonical`, `og:url`, `og:image`) ya apuntan a
   su GitHub Pages, marcadas con `▼ URL DEL DESPLIEGUE ▼`. **Hay que cambiarlas
   al pasar a dominio propio.** El resto de rutas son relativas y funcionan
   desde cualquier subcarpeta: comprobado sirviendo desde `/Umbral/`.

3. **La dirección de contacto de las páginas legales.** `src/data/legal.js` usa
   `hola@umbral.pe`, que es un marcador. Sin una dirección real, los usuarios no
   pueden ejercer sus derechos sobre sus datos. Debe ser del proyecto, no
   personal: esas páginas son públicas e indexables.

4. **Verificar el nombre.** Que `umbral.pe` esté libre y que no choque con una
   marca registrada en Indecopi para la clase educativa.

5. **Verificar los pesos de las áreas A, B y E** contra el prospecto de San
   Marcos. Solo el área D está verificada (suma exactamente 90 preguntas). Las
   otras tres son estimaciones marcadas `verificado: false`, y la pantalla lo
   avisa. **No las conviertas en datos verificados sin comprobarlas.**

6. **Revisión legal de los términos** por alguien que conozca la normativa
   peruana de protección de datos y de menores. El texto es un borrador honesto,
   no un documento validado.

7. **Prueba con lector de pantalla real** y **medición en un Android de gama
   media de verdad**. Una herramienta automática detecta quizá el 40% de los
   problemas de accesibilidad.

---

## 8. Pendiente de desarrollo, en orden

1. **Explicación del fallo concreto, con caché.** Cuando un alumno falla, un
   modelo le explica por qué *su* opción era tentadora y dónde se rompe. La
   caché es lo que lo hace viable: la explicación de "pregunta X, opción B" es
   idéntica para todos los que elijan B, se genera una vez y se reutiliza. Eso
   convierte un coste por alumno en un coste por pregunta, que es la diferencia
   entre viable e inviable para una academia pequeña.
2. **Resumen semanal para el profesor.** Sesenta alumnos, un profesor. Qué temas
   falla el grupo, quién bajó, qué clase dar el martes.
3. **Notas atadas a un tema.**
4. **Anuncios de la academia.**
5. **Cargar el temario de los cursos restantes** (trece sin desglose) y luego
   otras universidades. La estructura ya lo soporta: falta el dato.
6. **Backend real.** Todo `src/data/mock/` es un servidor escrito en JavaScript
   con el contrato cerrado. Migrar es traducir esas funciones a la base de datos
   y cambiar `ADAPTADOR` en `src/data/client.js`. Ningún otro archivo se toca.
   **El esquema y las políticas de acceso por fila se escriben antes que el
   código de aplicación, y se prueban intentando cruzarlas.**

---

## 9. Archivos entregados en esta conversación

**`umbral.zip`** — el proyecto completo, 94 archivos. Es lo único
imprescindible: contiene el código, las pruebas, las herramientas, las imágenes
y los tres documentos internos.

**`skills-diseno.zip`** — tres guías de diseño de Anthropic bajo licencia Apache
2.0 (`frontend-design`, `theme-factory`, `canvas-design`), con sus licencias y
un `LEEME.md` que explica cuál usar. La relevante es `frontend-design`.

**Este documento**, `handoff-umbral.md`.

---

## 10. Cómo empezar la sesión nueva

1. Descomprimir `umbral.zip`.
2. Leer este documento entero, luego `PROJECT_CONTEXT.md` y `CRITERIOS.md`.
3. Correr `node pruebas/correr.mjs` y confirmar que las 326 comprobaciones
   están en verde.
4. Resumir al propietario el estado y la siguiente tarea según §8, y **esperar
   su confirmación** antes de escribir código.
5. Si falta algún archivo, detenerse y pedirlo. No trabajar a medias.
