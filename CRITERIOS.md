# Criterios de diseño y plan de ingeniería

Documento de referencia de Umbral. Se lee al empezar cada sesión de trabajo y
se usa como lista de verificación antes de dar algo por terminado.

Dos reglas sobre este documento:

0. **Los que se pueden automatizar, están automatizados.** `pruebas/criterios.test.mjs`
   convierte doce de estos criterios en fallo de construcción. Escribir un color
   fuera de `tokens.css` o un texto de 11 px rompe las pruebas. Un criterio que
   solo vive en un documento es una sugerencia.
1. **Cada criterio tiene que ser comprobable.** "Buena jerarquía visual" no es
   un criterio; "el dato más importante de la pantalla es el elemento de mayor
   tamaño" sí. Si no se puede verificar, no entra.
2. **Los criterios marcados con ⚠ salieron de un fallo real** de este proyecto
   o de la auditoría del sitio anterior. No son teoría.

---

## Contexto que condiciona todo

Antes de cualquier criterio, las restricciones reales. Un criterio que las
ignora es un criterio equivocado.

| Restricción | Consecuencia de diseño |
| --- | --- |
| Postulantes de 16 a 19 años | Nada infantil, nada corporativo. Serio pero no frío. |
| Mayoría en Android de gama media | Presupuesto de JavaScript estricto; animaciones baratas. |
| Datos móviles contados | Cada kilobyte se paga. Imágenes y fuentes bajo control. |
| Conexión intermitente | Todo lo importante funciona sin red. |
| Ansiedad alta, meses de esfuerzo | Honestidad sobre optimismo. Nada de falso ánimo. |
| Muchos son menores de edad | Consentimiento, datos mínimos, sin chat abierto sin moderar. |
| Se estudia de madrugada | Modo noche de primera clase, no un añadido. |

---

# Parte 1 · Criterios de interfaz y experiencia

## 1. Fundamentos del sistema

- **1.1** Existe un único archivo con valores de diseño (`ui/tokens.css`).
  Cualquier color, espacio, radio o sombra escrito a mano fuera de ahí es un
  error de revisión. ⚠ *El sitio anterior tenía 233 colores sueltos, y por eso
  necesitaba 37 `!important` y ocho reglas que reparaban el modo oscuro.*
  **Verificación:** `grep -rE "#[0-9a-fA-F]{3,6}" src --include=*.css` solo debe
  devolver `tokens.css`.
- **1.2** Escala de espaciado limitada y geométrica. Nada de `13px` porque
  quedaba bien; si un valor no está en la escala, la escala está mal.
- **1.3** Escala tipográfica limitada, con `clamp()` donde el tamaño deba
  responder al ancho.
- **1.4** Escala de elevación con dos o tres niveles como mucho. Más niveles no
  comunican más jerarquía, comunican menos.
- **1.5** Escala de capas (`z-index`) nombrada y única. ⚠ *En el sitio anterior
  el panel de administración usaba 10020 y los avisos 9999: un administrador que
  fallaba al guardar no veía nunca el mensaje de error.*
- **1.6** El modo noche se define con los mismos nombres de token, no con
  reglas que corrigen colores. Si hay que "arreglar" algo en modo noche, el
  token estaba mal.
- **1.7** Los componentes no traen márgenes propios. El espacio lo pone el
  contenedor. Un componente con margen no se puede reutilizar.

## 2. Disposición y adaptación

- **2.1** Se diseña primero para 360 px de ancho. Es el teléfono real del
  usuario, no el escritorio del programador.
- **2.2** Los puntos de ruptura los decide el contenido, no una lista de
  dispositivos. Se añade uno cuando la disposición empieza a verse mal, no
  porque exista un iPad.
- **2.3** En pantallas grandes se aumenta la densidad, no solo el margen. ⚠ *La
  primera versión mostraba una columna de 490 px centrada en 1280: el 60% de la
  pantalla era vacío.*
- **2.4** Longitud de línea de texto entre 45 y 75 caracteres.
- **2.5** Áreas táctiles de 44 px como mínimo, con 8 px de separación entre
  objetivos adyacentes.
- **2.6** Se respetan las zonas seguras del dispositivo (`env(safe-area-inset-*)`).
- **2.7** La interfaz aguanta zoom del navegador al 200% sin perder contenido ni
  generar desplazamiento horizontal.
- **2.8** Funciona en horizontal y con teclado en pantalla abierto (altura
  reducida). Un formulario con el botón fuera de alcance es un formulario roto.
- **2.9** Nada fijo tapa contenido ni otro elemento fijo. ⚠ *En el sitio
  anterior el aviso emergente se solapaba con el botón de WhatsApp y le robaba
  el clic.*

## 3. Tipografía

- **3.1** Dos familias como máximo. Una si se puede.
- **3.2** Fuentes variables, con subconjunto de caracteres. Cada peso extra son
  kilobytes que paga el usuario.
- **3.3** `font-display: swap` y precarga de la fuente crítica.
- **3.4** Cifras tabulares (`font-variant-numeric: tabular-nums`) en todo dato
  que se compare en columna o cambie en su sitio. Sin esto los números bailan.
- **3.5** Interlineado que baja al subir el tamaño: 1.5 en cuerpo, 1.15 en
  titulares.
- **3.6** Ningún texto dentro de una imagen. No se puede seleccionar, ni
  traducir, ni leer con lector de pantalla, ni escalar.
- **3.7** Nada por debajo de 12 px. ⚠ *El panel anterior tenía etiquetas a 9 px.*

## 4. Color y contraste

- **4.1** Contraste mínimo 4.5:1 en texto normal, 3:1 en texto grande y en
  bordes de controles.
  **Verificación:** herramienta automática en el proceso de integración, no a ojo.
- **4.2** El color nunca es la única señal. Un estado crítico lleva color,
  texto y posición. Quien no distingue rojo de verde tiene que poder usarla.
- **4.3** El anillo de foco es visible sobre todos los fondos donde puede
  aparecer el elemento. Se comprueba sobre la superficie oscura también.
- **4.4** Los colores tienen nombre semántico según lo que significan, no según
  cómo se ven.
- **4.5** El modo noche no es invertir. Se reduce la saturación de los acentos:
  un rojo que funciona sobre papel deslumbra sobre negro.

## 5. Jerarquía e información

- **5.1** El dato más importante de la pantalla es el elemento de mayor peso
  visual. ⚠ *El índice de preparación, que es la razón entera de la app,
  competía de tú a tú con once filas de curso.*
- **5.2** Una sola acción principal por pantalla. Si hay dos, una de las dos
  sobra o la pantalla son dos pantallas.
- **5.3** El orden de lo que se muestra responde a una decisión, y la decisión
  se explica. En Umbral los cursos van por puntos recuperables, y lo dice
  debajo del título.
- **5.4** Divulgación progresiva: se muestran cinco cursos y un botón para los
  demás, no once filas idénticas.
- **5.5** Los estados vacíos enseñan qué hacer. "No hay resultados" es una
  disculpa; "prueba con el nombre del tema o de la editorial" es una ayuda.
- **5.6** Los estados de carga muestran la forma de lo que viene, o resultados
  parciales. Nunca una pantalla en blanco ni un giro eterno.
- **5.7** Los mensajes de error dicen qué pasó y qué hacer. "Algo salió mal"
  está prohibido.
- **5.8** Ningún número aparece sin unidad ni referencia. "58" no significa
  nada; "58 de 100, corte en 72" sí.
- **5.9** La incertidumbre se muestra, no se esconde. Si la estimación tiene 13
  puntos de margen, se dice.

## 6. Interacción

- **6.1** Todo elemento interactivo tiene los cinco estados: reposo, hover,
  foco, activo y deshabilitado.
- **6.2** Nada cambia de tamaño al cambiar de estado. El desplazamiento del
  contenido bajo el cursor hace fallar clics.
- **6.3** Deshacer antes que confirmar. Un `confirm()` se acepta sin leer; un
  "archivado · deshacer" se lee. ⚠ *El panel anterior borraba en firme.*
- **6.4** Las acciones destructivas que no se pueden deshacer exigen escribir
  algo, no solo pulsar.
- **6.5** Atajos de teclado en toda tarea repetitiva. Un postulante hace
  cientos de preguntas al mes; obligarlo a apuntar con el dedo cada vez es una
  fricción que se acumula.
- **6.6** Ninguna operación local espera a la red.
- **6.7** El foco vuelve a donde estaba tras cerrar un diálogo.
- **6.8** Los escuchadores globales se retiran al salir de la pantalla. ⚠ *El
  sitio anterior dejaba dos temporizadores corriendo para siempre.*

## 7. Movimiento

- **7.1** La animación tiene una función: orientar, dar continuidad o
  confirmar. Si es decorativa, sobra.
- **7.2** Entre 120 y 240 ms para transiciones de interfaz.
- **7.3** Se animan solo `transform` y `opacity`. Animar `width` o `top`
  provoca recálculo de disposición en cada fotograma.
- **7.4** `prefers-reduced-motion` se respeta de verdad, no reduciendo la
  duración a la mitad.
- **7.5** Nada se anima en la primera pintura. La animación de entrada retrasa
  la percepción de que la página ya cargó.

## 8. Accesibilidad

No es una fase al final. Es un criterio de aceptación de cada pantalla.

- **8.1** HTML semántico antes que ARIA. Un `<button>` real trae foco, teclado
  y semántica gratis; un `<div role="button">` hay que reconstruirlo entero.
- **8.2** Puntos de referencia: `header`, `nav`, `main`, `footer`.
- **8.3** Un solo `<h1>` por pantalla y jerarquía de encabezados sin saltos.
  ⚠ *El sitio anterior tenía tres `<h1>` simultáneos en el DOM.*
- **8.4** Toda entrada tiene `<label>` asociada. El texto de marcador de
  posición no es etiqueta: desaparece al escribir.
- **8.5** Los cambios asíncronos se anuncian con `aria-live`.
- **8.6** Al cambiar de ruta el foco va al contenido y se desplaza al inicio.
- **8.7** Los diálogos atrapan el foco y lo devuelven al cerrarse.
- **8.8** Enlaces con `href` real. ⚠ *El sitio anterior tenía `<a onclick>` sin
  `href`: no era enfocable ni activable con teclado.*
- **8.9** Toda imagen con contenido lleva texto alternativo real. Las
  decorativas llevan `alt=""`. Un resumen escaneado sin alternativo es una
  pantalla muda.
- **8.10** El campo con error recibe `aria-invalid` y el foco.
- **8.11** Atributo `lang` correcto en el documento.
- **8.12** Enlace para saltar al contenido.
- **8.13** Recorrido completo con teclado, sin trampas, en cada flujo.
- **8.14** Prueba real con lector de pantalla en los flujos críticos: entrar,
  practicar, ver el diagnóstico.

## 9. Formularios

Sección propia porque es donde más se pierde a la gente.

- **9.1** ⚠ **Nunca se pierde lo escrito.** Ni al fallar la validación, ni al
  redibujar, ni al volver atrás. *Este fue un fallo real: la pantalla se
  redibujaba antes de leer los campos y los valores llegaban vacíos.*
- **9.2** Los valores se leen del evento de envío, nunca del DOM en un momento
  posterior.
- **9.3** Se valida al enviar. Después del primer error, se revalida mientras
  se corrige.
- **9.4** El error aparece junto al campo y el foco salta ahí.
- **9.5** `autocomplete` correcto en cada campo. Ahorra teclear en un teléfono.
- **9.6** `type` e `inputmode` correctos: un campo numérico abre el teclado
  numérico.
- **9.7** Campo de confirmación en lo irreversible: contraseña nueva, correo de
  contacto.
- **9.8** Se permite pegar en todos los campos. Bloquearlo no aporta seguridad y
  rompe los gestores de contraseñas.
- **9.9** Sin límites arbitrarios de longitud en nombres. Los apellidos
  compuestos existen.
- **9.10** Se pide el mínimo dato posible, y se explica por qué se pide cada
  uno. Para saber si alguien necesita permiso de apoderado basta el año de
  nacimiento, no la fecha completa.

## 10. Contenido y voz

- **10.1** Lenguaje llano. Nada de jerga técnica en pantalla.
- **10.2** ⚠ Ningún mensaje interno se muestra al usuario. *El sitio anterior
  le decía a un chico de diecisiete años: "Instala el archivo 04-retos.sql".*
- **10.3** Formatos locales: fechas, números y moneda en convención peruana.
- **10.4** Sin patrones oscuros. Ni cuentas atrás falsas, ni casillas marcadas
  por defecto, ni botón de cancelar escondido.
- **10.5** Las cifras que se prometen son ciertas. ⚠ *El sitio anterior anunciaba
  "20+ universidades" con 17 definidas y 12 alcanzables.*
- **10.6** Los mensajes de validación enseñan qué es un buen contenido. "Escribe
  la explicación: sin ella el alumno falla y no aprende por qué".

## 11. Rendimiento como experiencia

- **11.1** Presupuesto declarado y vigilado: JavaScript por ruta, CSS total,
  peso de fuentes, peso de imagen por pantalla.
- **11.2** Objetivos en gama media con red móvil: primera pintura de contenido
  útil por debajo de 2.5 s, desplazamiento acumulado por debajo de 0.1,
  respuesta a interacción por debajo de 200 ms.
- **11.3** Código dividido por ruta, cargado bajo demanda. ⚠ *El sitio anterior
  descargaba 85 KB de panel de administración a todos los estudiantes.*
- **11.4** Las bibliotecas pesadas se cargan cuando se usan. ⚠ *KaTeX son 300 KB
  que se pagaban en cada visita para una sola pantalla.*
- **11.5** Las miniaturas son miniaturas. ⚠ *El visor anterior usaba la imagen
  completa para recuadros de 56 píxeles.*
- **11.6** Imágenes con `width` y `height` declarados para no desplazar el
  contenido al cargar.
- **11.7** Carga diferida de todo lo que está fuera de la vista; carga
  prioritaria de lo que está dentro.
- **11.8** Se adelanta lo siguiente probable: la página siguiente del visor, la
  ruta que el usuario va a pulsar.
- **11.9** Ninguna dependencia de terceros bloquea la primera pintura.
- **11.10** Nada de temporizadores permanentes. ⚠ *Dos `setInterval` corriendo
  para siempre en el sitio anterior gastaban batería sin hacer nada.*

## 12. Resistencia

- **12.1** Todo lo importante funciona sin conexión.
- **12.2** Lo que el usuario hace sin red se guarda y se envía después, en
  orden y sin duplicar.
- **12.3** El estado de conexión se comunica, sin alarmismo.
- **12.4** Toda dependencia externa degrada con gracia. ⚠ *Si el CDN de fórmulas
  no carga, el alumno lee `sin² 20°`, no `$\sin^2 20^\circ$`.*
- **12.5** El service worker nunca se impone: ofrece la versión nueva y espera.
  ⚠ *Y no se registra en local, o cada cambio tarda dos recargas en verse.*
- **12.6** Ninguna respuesta a una acción de escritura se sirve desde caché.

## 13. Confianza y privacidad

- **13.1** Se pide el mínimo dato y se explica el motivo.
- **13.2** El usuario puede descargar y borrar sus datos.
- **13.3** Verificación de edad y consentimiento de apoderado donde la ley lo
  exige.
- **13.4** Ningún dato personal en el código fuente. ⚠ *El sitio anterior tenía
  el número de Yape y el nombre del titular escritos en un archivo público.*
- **13.5** Sin espacios sociales abiertos y sin moderar para menores.
- **13.6** Términos y política de privacidad existen y se aceptan de forma
  explícita.

---

# Parte 2 · Cómo lo llevaría un desarrollador senior

## Fase 0 · Antes de escribir código

1. **Definir la pregunta que responde el producto.** Una sola. En Umbral: a qué
   distancia estás del corte. Todo lo que no la responda o no la alimente es
   candidato a no existir.
2. **Escribir las restricciones reales** (la tabla del principio). Sin esto se
   diseña para el ordenador del programador.
3. **Decidir qué NO se va a hacer.** El sitio anterior hacía once cosas a
   medias. La lista de descartes es más valiosa que la de funciones.
4. **Elegir el riesgo mayor y atacarlo primero.** Aquí es la honestidad del
   número: si no se puede calcular con rigor, el producto no tiene razón de ser.

## Fase 1 · Cimientos

Objetivo: que añadir la funcionalidad número veinte cueste lo mismo que la
número dos.

- Estructura de carpetas con una regla clara: cada funcionalidad se puede
  borrar entera sin romper el resto.
- Sistema de diseño mínimo: tokens, tipografía, botón, campo, tarjeta.
- Enrutador con carga bajo demanda y guardián de rutas.
- Capa de datos con una sola frontera al exterior.
- El dominio en módulos puros, sin DOM ni red.
- Corredor de pruebas funcionando desde el primer día.
- Documento de criterios (este) en el repositorio.

**Criterio de salida:** una pantalla real funciona de punta a punta con datos
simulados, y las pruebas corren con un solo comando.

## Fase 2 · Rebanada vertical

Una sola funcionalidad, completa: interfaz, dominio, datos, pruebas, estados
de error, vacío y carga. Sirve para descubrir lo que la arquitectura no
soporta, cuando cambiarla todavía es barato.

## Fase 3 · Construcción

Una funcionalidad por vez, cada una con su definición de terminado:

- [ ] Funciona en 360 px y en escritorio
- [ ] Estados vacío, cargando y error resueltos
- [ ] Recorrido completo con teclado
- [ ] Contraste verificado
- [ ] Sin datos personales en el código
- [ ] Pruebas de la lógica pura
- [ ] Presupuesto de peso respetado
- [ ] Textos revisados en lenguaje llano
- [ ] Capturas revisadas en modo papel y modo noche

## Fase 4 · Servidor

Se deja para el final a propósito. Con la interfaz construida contra un
servidor simulado, los contratos ya están decididos por el uso real y no por
suposiciones.

Orden de trabajo:

1. Esquema de base de datos y políticas de acceso por fila **antes** que
   cualquier código de aplicación.
2. Prueba de penetración de esas políticas: intentar leer y escribir todo con
   la clave pública, desde fuera.
3. Traducir cada función del servidor simulado, una por una, verificando que el
   contrato no cambia.
4. Cambiar el adaptador. Ningún otro archivo se toca.
5. Migración de datos y plan de vuelta atrás.

## Fase 5 · Endurecimiento

- Auditoría de accesibilidad con lector de pantalla real.
- Medición de rendimiento en un dispositivo de gama media real, no en el
  simulador del portátil.
- Revisión de seguridad: política de contenidos estricta, cabeceras, límites de
  frecuencia en el servidor, revisión de permisos.
- Revisión legal: derechos de autor del material, privacidad, menores.
- Prueba con cinco usuarios reales del público objetivo. Cinco bastan para
  encontrar la mayoría de los problemas graves.

## Fase 6 · Publicación

- Dominio y marca verificados en el registro correspondiente.
- Observabilidad: errores del cliente, métricas de rendimiento reales de
  usuarios, embudos de las tres acciones que importan.
- Publicación gradual, con plan de reversión escrito y probado.
- Página de estado y canal de soporte.

## Prácticas transversales

**Pruebas.** Pirámide con la base en el dominio puro, que es donde vive el
valor y donde las pruebas son baratas y rápidas. Encima, pruebas de contrato
del servidor simulado. Arriba, un puñado de recorridos completos automatizados.
No se persigue un porcentaje de cobertura: se cubre lo que duele si se rompe.

**Revisión.** Toda incorporación pasa por la lista de la Fase 3. La revisión
mira el diseño y los nombres antes que la sintaxis; las herramientas ya
comprueban el formato.

**Integración continua.** Falla la construcción si: se rompe una prueba, se
excede el presupuesto de peso, aparece un color fuera de los tokens, o baja el
contraste por debajo del mínimo. Un criterio que no está automatizado es una
sugerencia.

**Deuda técnica.** Se anota cuando se contrae, con la razón y el coste de
pagarla. La deuda invisible es la que mata.

**Trabajar viendo el resultado.** Capturas automáticas de cada pantalla en
ambos temas y en ambos tamaños, generadas en la integración continua. ⚠ *Diseñar
sin ver el resultado produjo un icono que parecía una lápida y una pantalla
principal donde el dato más importante era invisible. Las dos cosas se
detectaron al mirarlas, no al pensarlas.*

---

## Estado de Umbral frente a estos criterios

| Sección | Estado | Cómo se comprueba |
| --- | --- | --- |
| 1 Fundamentos | Cumplido | `pruebas/criterios.test.mjs` |
| 2 Disposición | Cumplido | Capturas en 390 px y 1280 px |
| 3 Tipografía | Cumplido | Fuentes variables por rango, 2 archivos |
| 4 Color | Cumplido | `pruebas/contraste.test.mjs`, 25 parejas × 2 temas |
| 5 Jerarquía | Cumplido | Revisión visual |
| 6 Interacción | Cumplido | Deshacer implementado en el panel |
| 7 Movimiento | Cumplido | `pruebas/criterios.test.mjs` |
| 8 Accesibilidad | Cero incidencias automáticas | `herramientas/auditar.py`, axe-core en 7 pantallas |
| 9 Formularios | Cumplido | `pruebas/formulario.test.mjs` |
| 10 Contenido | Cumplido | `pruebas/criterios.test.mjs` |
| 11 Rendimiento | Cumplido | `herramientas/auditar.py`, procesador 4× lento |
| 12 Resistencia | Cumplido | `pruebas/serviceworker.test.mjs` |
| 13 Privacidad | Cumplido | Términos y descarga de datos implementados |

### Medidas actuales

| Métrica | Valor | Presupuesto |
| --- | --- | --- |
| Peso en frío | 75 KB | 220 KB |
| Mayor pintura | 668 ms | 2500 ms |
| Desplazamiento acumulado | 0.000 | 0.100 |
| Añadido por ruta | 0–12 KB | 40 KB |
| Incidencias de accesibilidad | 0 | 0 |
| Contraste mínimo | 3.06:1 en bordes, 4.5:1 en texto | norma AA |

### Lo que sigue sin estar hecho

Estas tres no se pueden automatizar y no se dan por buenas hasta hacerlas:

- **Prueba con lector de pantalla real** (VoiceOver o TalkBack) en los flujos de
  entrar, practicar y ver el diagnóstico. Una herramienta automática detecta
  quizá el 40% de los problemas de accesibilidad; el resto se encuentra
  escuchando la pantalla.
- **Medición en un Android de gama media real.** El procesador emulado cuatro
  veces más lento es una aproximación, no un teléfono de 400 soles con veinte
  pestañas abiertas.
- **Revisión legal de los términos** por alguien que conozca la normativa
  peruana de protección de datos y de menores. El texto actual es un borrador
  honesto, no un documento validado.

Lo pendiente no está oculto en una lista aparte: está aquí, a la vista, para
que nadie dé por terminado lo que no lo está.
