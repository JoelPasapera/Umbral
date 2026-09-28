# Umbral

Sistema de preparación para exámenes de admisión peruanos. Responde una sola
pregunta: **a qué distancia estás del puntaje de corte de tu carrera**, y qué
hacer hoy para acortarla.

El umbral es la línea que hay que cruzar. Todo el producto existe para
decirte, con honestidad, cuán lejos estás de ella.

> **Pendiente antes de publicar:** verificar que el dominio esté libre y que
> el nombre no colisione con una marca registrada en Indecopi para la clase
> educativa. Las etiquetas `canonical` y de vista previa apuntan a
> `umbral.pe` de forma provisional.

## Cómo se ve

```
Índice 58 · corte 72 · brecha -14.3 · 90% del examen medido

Trigonometría   21   recupera hasta 7.1 pts
Física          42   recupera hasta 6.4 pts
Geometría       42   recupera hasta 5.2 pts
...
```

## Correr en local

Los módulos ES no funcionan abriendo el archivo directamente: hace falta un
servidor. Cualquiera sirve.

```
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.

**El modo sin conexión se desactiva solo en local**, y además desinstala
cualquier service worker que quedara de antes. Si no fuera así, después de
cambiar un archivo la primera recarga seguiría mostrando el código viejo:
el service worker sirve la copia guardada y renueva por detrás. En producción
es lo correcto; mientras programas te hace perseguir fantasmas.

Para probar el modo sin conexión en local, añade `?sw` a la dirección.

### Si ves código viejo

Pasó una vez y puede repetirse si ya tenías una versión instalada. En el
navegador: herramientas de desarrollo, pestaña Application, "Clear site data".
Eso borra el service worker y las cachés. Después, la versión nueva ya se
encarga de que no vuelva a ocurrir en local.

## Pruebas

```
node pruebas/correr.mjs
```

No hay dependencias ni instalación: 11 archivos, 130 comprobaciones.

Para la auditoría en navegador real —accesibilidad, peso y estabilidad visual—
hacen falta dos herramientas de desarrollo. La aplicación sigue sin depender de
nada en tiempo de ejecución.

```
pip install playwright && playwright install chromium
npm install --no-save axe-core
python3 herramientas/auditar.py --capturas
``` El módulo de cálculo es puro, así que se
prueba con Node a secas.

## Portada

`portada.html` es la página pública. No depende del JavaScript de la
aplicación: es HTML y CSS estáticos, así que carga al instante y **se puede
indexar**, que era el techo duro del proyecto anterior — con todo detrás del
login, Google no ve nada y no llega una sola visita orgánica.

Las capturas de producto son reales: se generan con `herramientas/fotos.py`
desde la propia aplicación, y se reducen a WebP. Las cinco pesan 201 KB en
total; sin optimizar eran 4 MB.

**Al publicar**, `portada.html` pasa a ser `index.html` y la aplicación se
mueve a `/app/`. Aquí conviven separadas para no romper las rutas relativas
mientras se desarrolla.

## Documentos

| Archivo | Para qué |
| --- | --- |
| `README.md` | Cómo funciona y cómo correrlo |
| `PROJECT_CONTEXT.md` | **Por qué es como es.** Se lee al retomar el proyecto |
| `CRITERIOS.md` | Bajo qué reglas se construye, y el plan por fases |

## Criterios de diseño

`CRITERIOS.md` recoge la lista completa de criterios de interfaz, experiencia,
accesibilidad, rendimiento y privacidad, más el plan de ingeniería por fases.
**Se lee al empezar cada sesión.** Los criterios marcados con ⚠ salieron de
fallos reales de este proyecto o de la auditoría previa, no de teoría.

## Arquitectura

```
src/
  core/        router · store · bus · dom      infraestructura, sin reglas de negocio
  domain/      readiness.js                    el cálculo, puro y verificable
  data/        client + repositorios + mock    única frontera con el exterior
  ui/          tokens · base · componentes     sistema de diseño
  features/    meta/ practicar/ estudiar/     una carpeta por pantalla
```

### Las cinco reglas

1. **Una funcionalidad se puede borrar entera.** Las carpetas de `features/` no
   se importan entre ellas. Si dos necesitan hablarse, lo hacen por el bus de
   eventos.

2. **Ningún componente toca la red.** Solo los repositorios llaman a
   `data/client.js`. Cambiar de proveedor de backend es cambiar un archivo.

3. **Cero funciones globales.** Nada cuelga de `window`. Todo se importa.

4. **Ni un `onclick` en el HTML.** Los eventos se enlazan con
   `addEventListener` y el texto de datos se asigna con `textContent`, nunca
   con `innerHTML`. Eso permite servir el sitio con una política de seguridad
   estricta, y con ella la inyección de código deja de ser posible por
   construcción.

5. **Un solo archivo tiene colores.** `ui/tokens.css`. Cualquier hex fuera de
   ahí es un error de revisión. Por eso el modo noche sale gratis y no hace
   falta ningún `!important`.

### Sobre el cálculo

`domain/readiness.js` estima el dominio de cada curso a partir de los intentos,
con tres ajustes:

- **Antigüedad.** Vida media de 45 días. Lo que resolviste en marzo no dice
  mucho de tu nivel en agosto.
- **Dificultad.** Acertar una pregunta que casi nadie saca informa mucho;
  acertar una fácil, casi nada. Fallar una fácil informa mucho.
- **Incertidumbre.** Se calcula el intervalo de credibilidad al 90% y se
  muestra como margen de error.

Y una regla que gobierna el archivo entero: **por debajo del umbral de
evidencia no se devuelve un número.** Un curso sin datos suficientes queda
fuera del promedio y se reporta aparte. Un postulante que confía en un índice
inventado se lleva el golpe el día del examen.

Las constantes (`VIDA_MEDIA_DIAS`, umbrales de evidencia) están agrupadas al
inicio del archivo y exportadas, para poder calibrarlas contra resultados
reales cuando existan.

## Estado

Funciona con datos de ejemplo (`data/mock/`). Para conectar el backend se
cambia `ADAPTADOR` en `data/client.js`; ningún otro archivo se toca.

Construido: entrar, meta, elegir meta, reto diario, practicar, estudiar,
perfil, términos, administración, capa sin conexión.
Pendiente: mentor anclado a la pregunta fallada, notas por tema, anuncios,
backend real.

## Generación de preguntas con IA

Convierte el material de la academia (boletines, separatas, exámenes de años
anteriores) en preguntas etiquetadas por curso, tema y dificultad. Es lo que
saca a una academia de una plataforma vacía en una tarde.

La ingeniería de valor no está en el prompt, está en **la puerta de validación**
(`domain/generation.js`). Un modelo produce con total seguridad una pregunta
cuya respuesta correcta está mal. La puerta no puede detectar eso —hace falta
un profesor—, pero sí todo lo demás, y ahí está su valor: **el tiempo del
profesor es el recurso caro del sistema.**

Dos niveles, a propósito:

- **Rechazo automático.** Alternativas repetidas, sin explicación, fórmula sin
  cerrar, curso fuera del temario, dificultad imposible. No llega a la cola.
- **Aviso.** Copia literal del material, casi idéntica a una que ya existe, la
  correcta mucho más larga que las demás (se acierta sin saber), explicación
  que solo repite la respuesta. Llega marcada, para que el profesor mire justo
  ahí en vez de leerlo todo igual.

Sobre la segunda lista: la primera versión de la comprobación de explicaciones
exigía conectores causales y marcaba como sospechosas explicaciones correctas
que razonaban sin decir "porque". Un falso positivo cuesta exactamente el
recurso que la puerta protege. Hay una prueba que vigila ese caso concreto.

### Las reglas de la capa de IA

- **La clave nunca sale del servidor.** El navegador manda texto y recibe
  borradores.
- **Presupuesto mensual por academia, con techo duro**, comprobado antes de
  gastar. Una factura variable sin tope es riesgo existencial para una
  miniempresa. El panel muestra cuánto queda.
- **Nada se publica sin aprobación humana.** Todo va a borradores.
- **Lo generado queda marcado de por vida** (`origen: 'generado'`). Si mañana
  se descubre que una tanda salió mal, se pueden encontrar todas y retirarlas.
- **La academia sale de la sesión, no de la petición.** Si viajara en el
  cuerpo, cualquiera podría gastar el presupuesto de otra.

## El temario

`src/data/mock/temario.js` es la columna vertebral del producto. Antes los
temas eran texto libre (`temaId: 'identidades'`), y con eso no se puede decirle
a un alumno nada útil. Ahora está cargado el **temario oficial de admisión de
San Marcos** para los cinco cursos de matemática: habilidad matemática,
aritmética, álgebra, geometría y trigonometría. **138 temas en 28 bloques.**

Dos cosas que esto hace posibles y antes no:

**El peso real.** El examen no reparte porcentajes redondos: reparte
preguntas. Son 10 actitudinales fuera del cómputo, 10 de habilidad verbal, 10
de habilidad lógico-matemática y 70 de conocimientos, con un reparto que cambia
por área. Habilidad matemática vale 10 preguntas; trigonometría, 2 en Economía
y 6 en Ingeniería. Un alumno que se mata con trigonometría para postular a
Economía está gastando su tiempo en el curso que menos pesa, y ahora el
producto se lo dice.

**Cobertura por tema, no por curso.** "Te falta trigonometría" no es
accionable; "no has tocado transformaciones de suma a producto" sí.

### Lo que está verificado y lo que no

El área D (Ciencias Económicas) tiene el reparto de preguntas verificado contra
el temario publicado, y suma exactamente 90. Las áreas A, B y E son
estimaciones, marcadas con `verificado: false`, y **la pantalla lo avisa** en
vez de aparentar una precisión que no tenemos. Los temas sí están verificados
en las cuatro.

Los otros trece cursos existen con su peso pero sin desglose, marcados con
`detallado: false`. Cargarlos es añadir bloques a ese archivo; nada más cambia.

## Por qué existe el reto diario

No es gamificación. Es la única evidencia que corrige el servidor.

La práctica libre funciona sin conexión, y para eso las respuestas correctas
tienen que viajar en el paquete: se pueden leer. Por eso pesa 0.4 en el
cálculo. El reto se corrige en el servidor, es uno al día, no se puede
repetir y ataca los tres cursos donde más puntos pierdes. Por eso pesa 1.

La racha se muestra sin lenguaje de amenaza, y junto a un calendario de 28
días. Un contador frágil que castiga un día perdido hace que la gente
abandone justo cuando más falta le hace volver.

Cuentas de prueba, en dos academias distintas:

| Academia | Cuenta | Correo | Contraseña |
| --- | --- | --- | --- |
| Rumbo | Alumno | `estudiante@umbral.pe` | `admision2027` |
| Rumbo | Coordinación | `admin@umbral.pe` | `catalogo2027` |
| Sigma | Alumna | `alumna@sigma.pe` | `sigma2027xx` |
| Sigma | Coordinación | `coordinacion@sigma.pe` | `sigma2027xx` |

Para registrarse hace falta un código: `RUMBO-2027` (alumno) o `RUMBO-PROF`
(profesor).

## Varias academias en la misma plataforma

La regla que gobierna todo el backend: **la academia sale de la sesión, nunca
de lo que manda el cliente.** Si viajara en la petición, cualquiera podría leer
los alumnos, el contenido y el presupuesto de otra academia cambiando un valor
en la consola. Es el fallo que hunde productos vendidos a varios clientes, y
por eso `pruebas/multiacademia.test.mjs` es la batería más importante del
proyecto: 25 comprobaciones que intentan cruzar la frontera por todas las vías.

Tres roles, no un booleano: **alumno**, **profesor** y **coordinación**. Un
"es administrador" no basta cuando el que paga y el que enseña son personas
distintas, que es el caso normal en una academia.

Nadie entra por su cuenta: hace falta un código de invitación, y **el código
decide el rol**. Un alumno con el código de alumno jamás sale profesor, aunque
mande `rol: 'dueno'` en el registro. Hay una prueba que lo intenta.

### Entrada con Google

Hay botón de "Continuar con Google" en entrar y en registrarse. La regla que lo
gobierna, y que sostiene todo el modelo multiacademia:

> **Google autentica, no registra.**

Si entrar con Google creara la cuenta sola, cualquiera con una cuenta de Google
entraría y vería el material por el que paga una academia. Así que:

- Si la identidad ya está vinculada a una cuenta, entra directo.
- Si no, **no se crea nada**: se devuelve un pase de un solo uso que no da
  acceso a ninguna parte, y se pide el código de academia, el año de nacimiento
  y la aceptación de términos. Exactamente lo mismo que el registro por correo.
- El código sigue decidiendo la academia y el rol. Google no cambia eso.

`pruebas/google.test.mjs` comprueba las dieciséis reglas, incluida que el pase
no sirva como sesión ni abra el panel.

### Cómo activarlo

El botón usa Google Identity Services, la biblioteca oficial, y **lo dibuja
Google**. No es capricho: su documentación lo exige, y además es lo único que
abre el diálogo de forma fiable. Un botón propio que llama a `prompt()` lo
bloquean muchos navegadores por política de terceros, y entonces no pasa nada
al pulsarlo.

Mientras falte el identificador de cliente, **no hay botón**: aparece un aviso
diciendo qué falta. Nunca una entrada simulada. Un botón que finge autenticarte
y te crea una sesión real es una puerta trasera, no una maqueta.

Para activarlo:

1. En la consola de Google Cloud, crea un proyecto y abre **APIs y servicios ›
   Credenciales**.
2. Configura la **pantalla de consentimiento** (tipo Externo). Con el proyecto
   en modo prueba, solo entran los correos que añadas como usuarios de prueba.
3. Crea unas credenciales de **ID de cliente de OAuth**, tipo *Aplicación web*.
4. En **Orígenes autorizados de JavaScript** añade cada dominio desde el que se
   sirva la aplicación, incluido `http://localhost:8080` para desarrollo. El
   origen tiene que coincidir exactamente: puerto incluido y sin barra final.
   Este es el paso que más falla.
5. **Deja vacío "URIs de redireccionamiento autorizados".** Ese campo es para
   el flujo con servidor. Umbral usa Google Identity Services, que entrega el
   token por callback en el navegador sin redirigir a ninguna parte.
6. Copia el identificador —termina en `.apps.googleusercontent.com`— y pégalo
   en `GOOGLE_CLIENT_ID`, dentro de `src/data/config.js`.
7. En **Público**, añade tu propio correo como usuario de prueba. Con el
   proyecto en modo prueba, Google rechaza con "Acceso bloqueado" a cualquiera
   que no esté en esa lista.

### Páginas legales

`privacidad.html` y `terminos.html` son **estáticas y públicas a propósito**.
Google, y cualquier tienda de aplicaciones, exigen que la política de privacidad
sea accesible sin cuenta y en su propia URL. Una política detrás de un login no
le sirve a nadie y Google la rechaza.

El texto vive en `src/data/legal.js` y se muestra en tres sitios: las dos
páginas y la pantalla interna. Si estuviera duplicado divergiría, y acabarías
con dos políticas distintas para el mismo producto, que es peor que no tener
ninguna. Tras cambiar el texto:

```
node herramientas/paginas-legales.mjs
```

### Las URL absolutas del despliegue

Todas las rutas del proyecto son relativas y funcionan desde cualquier
subcarpeta —comprobado sirviendo la aplicación desde `/Umbral/`—, **salvo
tres**: `canonical`, `og:url` y `og:image`, que por definición tienen que ser
absolutas. Están en `index.html` y `portada.html`, marcadas con un comentario
`▼ URL DEL DESPLIEGUE ▼`.

Ahora apuntan a GitHub Pages. **Al mover el proyecto a un dominio propio hay que
cambiarlas**: un canonical hacia una dirección que ya no sirve el sitio le dice
a Google que la versión buena está en otra parte, y se pierde la indexación.

### Contacto público

`src/data/legal.js` usa `hola@umbral.pe` como dirección de contacto en las
páginas legales. **Es un marcador de posición**: hay que sustituirlo por una
dirección real antes de publicar, o los usuarios no tendrán forma de ejercer sus
derechos sobre sus datos. Conviene una dirección del proyecto, no personal: la
página es pública e indexable.

### Si el botón no aparece

Es el fallo más común, y Google no ayuda: cuando el origen no está autorizado
escribe un error en la consola y **no dibuja nada**. El síntoma es un hueco en
blanco y ninguna pista.

Umbral lo detecta: si a los cuatro segundos no hay botón, muestra un aviso con
el origen exacto que hay que añadir, copiado de la barra de direcciones. Los
cambios en la consola de Google tardan varios minutos en aplicarse.

Ese identificador es público por diseño y va en el navegador. El *client
secret* **nunca** entra en el cliente: solo lo usa el servidor.

### Lo que el servidor real tiene que hacer

Google devuelve un *ID token*: un JWT firmado. El servidor simulado lo decodifica
pero **no verifica la firma**, y eso está avisado en el código. Un JWT sin
verificar es texto que cualquiera puede escribir; creerle sin comprobar la firma
equivale a dejar que el visitante declare quién es. El servidor real tiene que:

1. Descargar las claves públicas de Google (`https://www.googleapis.com/oauth2/v3/certs`).
2. Comprobar la firma con la clave del `kid` correspondiente.
3. Comprobar que `aud` es tu identificador de cliente.
4. Comprobar que `iss` es `accounts.google.com`.
5. Comprobar que `exp` no ha pasado.
6. Exigir `email_verified: true`.

Con Supabase esto lo hace el proveedor: basta activar Google en
**Authentication › Providers** y pegar el identificador y el secreto.

### El banco base

Una academia recién contratada abre la aplicación vacía el primer día y el
alumno concluye que no sirve. Por eso Umbral trae un banco base que todas ven.
El panel del profesor lo muestra —y lo cuenta en la cobertura, porque sus
alumnos lo están practicando— pero marcado como no editable. Lo suyo se añade
encima y va sustituyéndolo.

## Panel de administración

Abre por los huecos, no por un listado. La razón es que en este producto un
curso sin preguntas hace que el alumno vea "todavía no puedo estimar tu nivel":
el panel enseña primero esa consecuencia, con el porcentaje del examen que el
catálogo actual no puede medir.

`domain/coverage.js` es el espejo de `domain/readiness.js`. Aquel mide lo que
sabe el estudiante; este mide lo que le falta al catálogo para poder medirlo.
También es puro y verificable.

### Decisiones que van en el código

- **Cada función autoriza.** No hay una comprobación al abrir y confianza
  después. Seis pruebas llaman a las acciones con un token de estudiante, con
  uno inventado y sin token, y las tres fallan igual.
- **Borrar es archivar.** Nada desaparece, así que no hace falta un `confirm()`
  que la gente acepta sin leer. Se restaura con un clic.
- **Reordenar es una sola operación.** Recibe el orden completo y lo aplica de
  golpe, y rechaza el lote entero si incluye algo que ya no existe.
- **El texto se normaliza al entrar**, no al pintar: forma Unicode NFC,
  caracteres de control fuera. Así no hace falta ninguna tabla que repare
  acentos rotos al mostrarlos mientras la base de datos sigue corrupta.
- **Toda pregunta necesita explicación.** El validador la exige: sin ella el
  alumno falla y no aprende por qué.
- **Queda registro de quién cambió qué.**

## Autenticación

Las rutas privadas se declaran al registrarlas:

```js
registrar('meta', () => import('./features/meta/meta.view.js'), { privada: true });
protegerCon(haySesion);
```

El enrutador recuerda a dónde ibas y te devuelve ahí después de entrar.

### Decisiones que van en el código

- **El rol de administrador no se puede pedir.** `registrarCuenta` ignora
  cualquier `esAdmin` que llegue del cliente y siempre guarda `false`. Se marca
  en la base de datos y se comprueba contra el servidor en cada acción. Una
  prueba intenta escalar privilegios en el registro y verifica que no funciona.
- **Los mensajes no revelan qué correos existen.** Entrar con una cuenta
  inexistente y entrar con la contraseña mal dan exactamente el mismo texto.
  La recuperación responde igual en los dos casos. Sin eso, el formulario se
  convierte en una lista de clientes.
- **Hay recuperación de contraseña.** Sin ella, olvidarla significa perder la
  cuenta y todo el progreso.
- **Bloqueo tras cinco intentos**, quince minutos, y aguanta aunque después
  llegue la contraseña correcta.
- **Verificación de edad.** Se pide solo el año, no la fecha completa: para
  decidir basta el año, y pedir menos datos de un menor es la postura correcta.
  Menos de 14 no entra; entre 14 y 17 hace falta confirmar el permiso de un
  apoderado.
- **La contraseña nunca se guarda en claro**, ni siquiera en la maqueta. Sal
  aleatoria por usuario y SHA-256 mediante `crypto.subtle`.

## Sin conexión

La app abre y funciona sin red. El service worker usa una estrategia por tipo
de recurso: la navegación pide a la red primero (para no clavar a nadie en una
versión vieja), el código se sirve al instante y se renueva por detrás, y las
imágenes van a caché con tope de 120 para no llenar el teléfono.

Cuando hay versión nueva se ofrece un botón. **Nunca se recarga sola**: hacerlo
mientras alguien contesta una pregunta le borra la respuesta.

Lo que haces sin red se guarda en `core/outbox.js` y se envía al volver la
señal, en orden y sin duplicar.

### El compromiso de la práctica sin conexión

Para practicar en el micro, las respuestas correctas tienen que viajar en el
paquete, y ahí se pueden leer. Ningún truco lo evita: con cuatro alternativas,
cualquier hash se rompe probando las cuatro.

La decisión es explícita: la práctica libre funciona sin conexión y esos
intentos pesan un 40% en el cálculo (`PESO_NO_VERIFICADO`). El diagnóstico, que
fija el número oficial, solo funciona en línea y lo corrige el servidor.
