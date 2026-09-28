# Worker de Umbral

La única puerta al servidor. Habla el mismo contrato que el simulado —un
recurso por nombre y un objeto de parámetros— para que la misma batería de
pruebas valga para los dos y el backend no pueda desviarse en silencio.

## Qué hay aquí y qué no

Esta primera entrega cubre **sesión y academia**, que es de lo que cuelga todo
lo demás. Lo que atiende el Worker ya no se puede falsear desde el navegador:
quién eres, de qué academia y si administras.

Lo demás lo sigue sirviendo el simulado en el navegador. Eso significa que
**hoy siguen siendo falseables**, y conviene tenerlo presente en vez de
suponerlo resuelto:

- Las respuestas correctas están en el paquete que descarga el navegador.
- El presupuesto de IA y la puerta de licencia se pueden saltar.

El orden que viene después: filtrar el contenido por academia contra D1,
después las respuestas correctas, y al final las claves, cuando existan.

## Poner en marcha

    npm install -g wrangler
    wrangler login
    wrangler d1 create umbral

Copia el `database_id` que imprime al `wrangler.toml`. Después:

    wrangler d1 execute umbral --file=src/esquema.sql --remote
    wrangler deploy

Wrangler imprime la dirección del Worker. Pégala en `src/data/config.js`, en
`API`, y a partir de ese momento los cuatro recursos de `RECURSOS_EN_SERVIDOR`
dejan de atenderse en el navegador.

Para probar en local sin desplegar nada:

    wrangler dev --local

## Los secretos

No van en `wrangler.toml`, que se sube al repositorio. Van así:

    wrangler secret put NOMBRE

que los guarda cifrados en la plataforma y los deja en `env`. Hoy no hay
ninguno: el ID de cliente de Google es público por diseño, y el modelo de IA
todavía está simulado. Cuando haya una clave de modelo, este es su sitio y
nunca un archivo del repositorio.

`ORIGENES_PERMITIDOS` sí está en `wrangler.toml` porque no es un secreto: solo
dice qué páginas pueden llamar a la API. Actualízalo si cambias de dominio, o
las llamadas se caerán con un 403.

## El aislamiento entre academias

Vive en `src/ambito.js` y en ningún otro sitio. La decisión fue ponerlo en el
código en vez de en la base, así que hace falta que se sostenga solo:

1. Es el único archivo que llama a `prepare`. `pruebas/ambito.test.mjs` lee el
   código fuente y falla si aparece un `prepare(` en cualquier otro.
2. Las tablas se declaran con su regla de ámbito. Una tabla sin declarar no se
   puede consultar.
3. La academia sale siempre de la sesión. Si llega en los filtros o en un
   `insert`, lanza en vez de obedecer.

Si tocas este módulo, corre `node pruebas/ambito.test.mjs` antes de nada. Es lo
único del proyecto que no puede fallar ni una vez.
