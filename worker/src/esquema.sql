-- Esquema de Umbral en D1.
--
-- D1 es SQLite, así que este archivo se aplica tal cual en producción y en las
-- pruebas: `pruebas/worker-auth.test.mjs` lo carga en un SQLite en memoria y
-- corre las mismas consultas que corre el Worker. Un esquema que solo existe en
-- producción es un esquema que nadie prueba.
--
-- Esta primera entrega cubre sesión y academia. El contenido —materiales y
-- preguntas— tiene aquí sus tablas para que el aislamiento se pueda probar
-- desde el principio, pero todavía lo sirve el simulado.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS academias (
  id              TEXT PRIMARY KEY,
  nombre          TEXT NOT NULL,
  -- Los códigos no son secretos: son códigos de matrícula que reparte el
  -- profesor y que acaban escritos en una pizarra. Lo único que deciden es a
  -- qué academia perteneces, y por eso son únicos.
  codigo_alumno   TEXT NOT NULL UNIQUE,
  codigo_profesor TEXT NOT NULL UNIQUE,
  plan            TEXT NOT NULL DEFAULT 'base',
  creada          INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id                  TEXT PRIMARY KEY,
  academia_id         TEXT NOT NULL REFERENCES academias(id),
  correo              TEXT NOT NULL UNIQUE,
  nombre              TEXT NOT NULL,
  rol                 TEXT NOT NULL,
  -- La clave nunca se guarda: se guarda su derivación con sal propia. Las
  -- iteraciones van en la fila para poder subirlas con el tiempo sin dejar
  -- fuera a quien se registró antes.
  clave_hash          TEXT,
  sal                 TEXT,
  iteraciones         INTEGER,
  anio_nacimiento     INTEGER,
  consintio_apoderado INTEGER NOT NULL DEFAULT 0,
  acepto_terminos     INTEGER NOT NULL DEFAULT 0,
  intentos_fallidos   INTEGER NOT NULL DEFAULT 0,
  bloqueado_hasta     INTEGER,
  creado              INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_usuarios_academia ON usuarios(academia_id);

CREATE TABLE IF NOT EXISTS sesiones (
  -- Se guarda la huella del testigo, no el testigo. Con esto, una copia de la
  -- base no le sirve a nadie para entrar como otro.
  token_hash  TEXT PRIMARY KEY,
  usuario_id  TEXT NOT NULL REFERENCES usuarios(id),
  academia_id TEXT NOT NULL REFERENCES academias(id),
  creada      INTEGER NOT NULL,
  expira      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);

CREATE TABLE IF NOT EXISTS identidades_google (
  sub         TEXT PRIMARY KEY,
  usuario_id  TEXT NOT NULL REFERENCES usuarios(id),
  academia_id TEXT NOT NULL REFERENCES academias(id),
  vinculada   INTEGER NOT NULL
);

-- Contenido. `academia_id = 'base'` es la biblioteca común que trae el
-- producto y que ven todas las academias; el resto es de cada una.
CREATE TABLE IF NOT EXISTS materiales (
  id             TEXT PRIMARY KEY,
  academia_id    TEXT NOT NULL,
  tipo           TEXT NOT NULL,
  titulo         TEXT NOT NULL,
  subtitulo      TEXT,
  detalle        TEXT,
  origen         TEXT,
  licencia       TEXT,
  permiso_ref    TEXT,
  fuente         TEXT,
  universidad_id TEXT,
  curso_id       TEXT NOT NULL,
  tema_id        TEXT,
  minutos        INTEGER,
  url            TEXT,
  publicado      INTEGER NOT NULL DEFAULT 0,
  archivado      INTEGER NOT NULL DEFAULT 0,
  creado         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_materiales_academia ON materiales(academia_id, curso_id);

CREATE TABLE IF NOT EXISTS preguntas (
  id          TEXT PRIMARY KEY,
  academia_id TEXT NOT NULL,
  enunciado   TEXT NOT NULL,
  opciones    TEXT NOT NULL,
  -- La respuesta correcta vive aquí y no viaja al navegador salvo en el
  -- paquete de práctica sin conexión, que por eso pesa 0.4 en el diagnóstico.
  correcta    INTEGER NOT NULL,
  explicacion TEXT,
  curso_id    TEXT NOT NULL,
  tema_id     TEXT,
  dificultad  TEXT,
  publicado   INTEGER NOT NULL DEFAULT 0,
  archivado   INTEGER NOT NULL DEFAULT 0,
  creado      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_preguntas_academia ON preguntas(academia_id, curso_id);

-- ── Datos de admisión ─────────────────────────────────────────────────────
--
-- Lo raspado vive aquí en cuarentena. `confirmado` en NULL significa que
-- ninguna persona ha mirado esa fila todavía, y mientras siga así no se le
-- sirve a ningún alumno. No es una precaución de más: el OCR confunde un 1 con
-- un 7 y el resultado es una cifra creíble, sin ningún error que capturar. Y el
-- corte alimenta el índice de preparación, que es el número del que vive el
-- producto.

CREATE TABLE IF NOT EXISTS admision_datos (
  universidad_id TEXT NOT NULL,
  proceso        TEXT NOT NULL,
  carrera_id     TEXT NOT NULL,
  carrera        TEXT NOT NULL,
  area           TEXT NOT NULL,
  vacantes       INTEGER NOT NULL,
  postulantes    INTEGER NOT NULL,
  corte          INTEGER NOT NULL,
  -- De qué documento salió. Sin esto nadie puede contrastarlo a mano, y un
  -- corte sin fuente no es un dato: es un rumor con formato de tabla.
  fuente         TEXT NOT NULL,
  obtenido       INTEGER NOT NULL,
  avisos         TEXT,
  -- Cuándo lo confirmó una persona. NULL = en cuarentena.
  confirmado     INTEGER,
  confirmado_por TEXT,
  PRIMARY KEY (universidad_id, proceso, carrera_id)
);
CREATE INDEX IF NOT EXISTS idx_admision_confirmado ON admision_datos(universidad_id, confirmado);

-- Fechas del cronograma, con la misma cuarentena.
CREATE TABLE IF NOT EXISTS admision_fechas (
  universidad_id TEXT NOT NULL,
  proceso        TEXT NOT NULL,
  fecha          INTEGER NOT NULL,
  areas          TEXT NOT NULL,
  fuente         TEXT NOT NULL,
  obtenido       INTEGER NOT NULL,
  confirmado     INTEGER,
  PRIMARY KEY (universidad_id, proceso, fecha)
);

-- Huella de cada página vigilada. Detectar que algo cambió es fiable;
-- interpretar qué dice no lo es. Por eso lo primero se automatiza y lo segundo
-- termina en manos de una persona.
CREATE TABLE IF NOT EXISTS admision_huellas (
  url     TEXT PRIMARY KEY,
  huella  TEXT NOT NULL,
  visto   INTEGER NOT NULL
);
