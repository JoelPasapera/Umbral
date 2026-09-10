# Logotipos de universidades

Suelta aquí el archivo de cada universidad y aparecerá sola en la biblioteca.
No hay que tocar código.

## Cómo se llama el archivo

El nombre es el identificador de la universidad en
`src/data/mock/universidades.js`, con extensión `.svg`:

    unmsm.svg   uni.svg    unac.svg   unfv.svg
    unalm.svg   une.svg    unt.svg    unprg.svg
    unp.svg     unc.svg    unsa.svg   unsaac.svg

Si solo tienes PNG, sirve igual: cambia la extensión en el campo `logo` de esa
universidad. SVG es preferible porque pesa menos y se ve nítido en cualquier
pantalla, incluida la de un teléfono con densidad alta.

## Cómo tiene que ser

- **Cuadrado**, o con el escudo centrado en un lienzo cuadrado. La rejilla
  reserva 40×40 y una imagen apaisada se descoloca.
- **Fondo transparente.** El botón cambia de fondo al seleccionarse, y un
  recuadro blanco pegado al escudo se nota al instante.
- **Ligero.** Por debajo de 20 KB cada uno. Son doce en la misma pantalla y el
  aparato típico de un postulante es un Android de gama media con datos
  móviles.

Mientras un archivo no esté, esa universidad dibuja su sigla como marca
tipográfica y la pantalla se ve entera igual. No hace falta tenerlos todos para
empezar: puedes ir poniéndolos de uno en uno.

## De dónde sacarlos

Cada universidad publica su identidad visual en su propio sitio, normalmente en
la oficina de imagen institucional o en el prospecto de admisión. Ese es el
archivo bueno: el que circula por buscadores suele estar recortado, reescalado
o directamente ser una versión antigua del escudo.

## Una advertencia que conviene leer una vez

Un escudo universitario es una marca registrada. Usarlo para identificar a esa
universidad en un listado es uso legítimo y no necesita permiso, pero muchas
casas publican reglas sobre proporciones, colores y fondo mínimo, y saltárselas
es el tipo de detalle por el que llega una carta a una empresa que ya factura.
Vale la pena mirar el manual de identidad de cada una antes de recortar nada.

Lo que sí no se puede hacer es usar el escudo de forma que parezca que la
universidad respalda o certifica Umbral. Identificar, sí; dar a entender un
convenio que no existe, no.
