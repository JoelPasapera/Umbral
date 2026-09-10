/**
 * Raspado de datos de admisión.
 *
 * Lo que se protege aquí es el único número del que vive Umbral. El corte
 * alimenta `readiness.js`, y el OCR confunde un 1 con un 7 sin lanzar ningún
 * error: la cifra sale mal y con muy buena pinta. Un corte equivocado convierte
 * "te faltan 14 puntos" en una mentira que el alumno no puede detectar.
 *
 * Por eso hay dos capas y las dos se comprueban aquí: una puerta que descarta
 * lo imposible y marca lo raro, y una cuarentena de la que nada sale sin que
 * una persona lo confirme.
 *
 * Los textos de ejemplo imitan lo que devuelve un OCR de verdad: columnas
 * separadas por espacios de anchura imprevisible, encabezados repetidos y
 * cifras rotas.
 */
import {
  revisarRegistro, revisarTanda, versionPublica, PUNTAJE_MAXIMO, LIMITES_ADMISION, AREAS_UNMSM,
} from '../src/domain/admision.js';
import { AREAS_UNMSM as AREAS_DEL_TEMARIO } from '../src/data/mock/temario.js';
import {
  convocatoriaDe, convocatoriasEn, documentosEn, huellaDePagina,
} from '../worker/src/admision/descubrir.js';
import {
  filasDeCarrera, fechasDeExamen, totalDeVacantes, cuadraElTotal, idDeCarrera, areaDe,
} from '../worker/src/admision/extraer.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

/* --- Descubrir dónde está la convocatoria --- */

/* La dirección cambia cada ciclo. En el portal real, el vigente cuelga de
   `/portal/admision2027-i/` y el de 2024-II vive en `/Website20242/`: otra
   ruta y otro sitio. Escribirla a mano deja el raspador muerto en seis meses. */
ok('reconoce la convocatoria vigente en la dirección',
  convocatoriaDe('https://admision.unmsm.edu.pe/portal/admision2027-i/') === '2027-I');
ok('y también el formato viejo de los microsites',
  convocatoriaDe('https://admision.unmsm.edu.pe/Website20242/') === '2024-II');
ok('una dirección cualquiera no se confunde con una convocatoria',
  convocatoriaDe('https://admision.unmsm.edu.pe/portal/politica-de-privacidad/') === null);

/* Trozo del portal real, tal como está hoy: menú duplicado para escritorio y
   para móvil, y casi todo el contenido en imágenes. */
const PORTAL_REAL = `
<nav><ul>
  <li><a href="https://admision.unmsm.edu.pe/portal/admision2027-i/">Admisión 2027-I</a></li>
  <li><a href="https://admision.unmsm.edu.pe/portal/simulacro-presencial-2027-i/">Simulacro Presencial 2027-I</a></li>
  <li><a href="https://admision.unmsm.edu.pe/portal/politica-de-privacidad/">Política de Privacidad</a></li>
  <li><a href="https://admision.unmsm.edu.pe/portal/wp-content/uploads/2026/09/OCA-UPLAC-SGC-D-04-Politica.pdf">Política de Calidad</a></li>
</ul></nav>
<nav class="movil"><ul>
  <li><a href="https://admision.unmsm.edu.pe/portal/admision2027-i/">Admisión 2027-I</a></li>
</ul></nav>
<a href="https://admision.unmsm.edu.pe/Website20242/">Resultados 2024-II</a>
<img src="https://admision.unmsm.edu.pe/portal/wp-content/uploads/2021/08/cropped-LOGO-OCA-COLOR_opt_1.png">
<img src="https://admision.unmsm.edu.pe/portal/wp-content/uploads/2026/08/SLIDER_SIMULACRO-scaled.jpg">
<img src="https://admision.unmsm.edu.pe/portal/wp-content/uploads/2026/08/IMG_8061-2-scaled.jpeg">
`;

const convocatorias = convocatoriasEn(PORTAL_REAL);
ok('encuentra las convocatorias del portal',
  convocatorias.length === 2, `→ ${convocatorias.map((c) => c.proceso).join(', ')}`);
ok('la vigente va primero',
  convocatorias[0].proceso === '2027-I',
  '→ ordena por año y número, no por el orden del menú');
ok('el menú duplicado no la cuenta dos veces',
  convocatorias.filter((c) => c.proceso === '2027-I').length === 1,
  '→ el portal repite el mismo enlace para escritorio y para móvil');

const documentos = documentosEn(PORTAL_REAL);
ok('recoge las imágenes, que es donde están los datos',
  documentos.some((d) => d.tipo === 'imagen'),
  '→ en este portal las fechas y las vacantes están pintadas dentro de JPGs');
ok('recoge también los PDF', documentos.some((d) => d.tipo === 'pdf'));
ok('descarta el logotipo y los iconos',
  !documentos.some((d) => /logo|cropped-/i.test(d.url)),
  '→ no traen datos y sí ruido');

/* --- El vigilante --- */

const h1 = await huellaDePagina(PORTAL_REAL);
ok('la misma página da la misma huella', h1 === await huellaDePagina(PORTAL_REAL));
ok('los espacios en blanco no cuentan como cambio',
  h1 === await huellaDePagina(PORTAL_REAL.replace(/\n/g, '\n  ')),
  '→ si no, avisaría de un cambio cada vez que reordenan el HTML');
ok('un cambio de verdad sí cambia la huella',
  h1 !== await huellaDePagina(`${PORTAL_REAL}<a href="/portal/admision2027-ii/">2027-II</a>`));

/* --- Leer las cifras --- */

/* Así sale una tabla del OCR: columnas separadas por espacios de anchura
   imprevisible y el encabezado repetido en cada página. */
const TABLA = `
RESULTADOS DEL EXAMEN DE ADMISION 2027-I
AREA C - INGENIERIAS
Carrera                          Vacantes  Postulantes  Ultimo ingresante
Ingenieria de Sistemas                 45         1.234               1.187
Ingenieria Industrial                  40         1.502               1.203
Ingenieria Electronica                 35           870               1.096
2.771 vacantes en total
`;

/* --- El área sale del documento, no de quien llama --- */

/*
 * Aquí hubo un fallo caro. El raspador recorría las cuatro áreas releyendo la
 * misma tabla, así que producía cuatro copias de cada carrera con un área
 * distinta cada una. La deduplicación se quedaba con la primera y TODA carrera
 * terminaba etiquetada como área A, ingenierías incluidas.
 */
ok('el área se lee de la cabecera del acta', areaDe(TABLA) === 'C',
  '→ "AREA C - INGENIERIAS"');
ok('sin cabecera no se inventa un área', areaDe('Carrera Vacantes Postulantes') === null,
  '→ un área nula la rechaza la puerta; una inventada se publica');
ok('si la cabecera menciona dos áreas, tampoco se elige',
  areaDe('Area B y Area C rinden el domingo 8') === null);

const filas = filasDeCarrera(TABLA, { proceso: '2027-I', fuente: 'https://ejemplo.pe/acta.pdf' });
ok('cada carrera aparece una sola vez',
  new Set(filas.map((f) => f.carreraId)).size === filas.length,
  `→ ${filas.length} filas, ${new Set(filas.map((f) => f.carreraId)).size} carreras`);
ok('y con el área que dice el documento',
  filas.every((f) => f.area === 'C'), `→ ${[...new Set(filas.map((f) => f.area))].join(', ')}`);
ok('lee las filas de la tabla', filas.length === 3, `→ ${filas.length}`);
ok('descarta la línea de encabezado',
  !filas.some((f) => /carrera/i.test(f.carrera)),
  '→ encaja con el patrón igual que una fila de datos');
ok('entiende los miles con punto',
  filas[0].vacantes === 45 && filas[0].postulantes === 1234 && filas[0].corte === 1187);
ok('da a cada carrera un identificador estable',
  filas[0].carreraId === 'ingenieria-de-sistemas');
ok('el identificador ignora tildes y mayúsculas',
  idDeCarrera('Ingeniería de Sistemas') === idDeCarrera('INGENIERIA DE SISTEMAS'));

const fechas = fechasDeExamen(
  'Sabado 7 de marzo: Area D y Area E\nDomingo 8 de marzo: Area B y Area C\nSabado 14 de marzo: Area A',
  { año: 2027 },
);
ok('lee el cronograma por áreas', fechas.length === 3, `→ ${fechas.length} jornadas`);
ok('cada jornada dice a qué áreas toca',
  fechas[0].areas.includes('D') && fechas[0].areas.includes('E'));
ok('las fechas salen ordenadas', fechas[0].fecha < fechas[2].fecha);

/*
 * El nombre del mes salía de la posición en una lista que tenía las dos
 * grafías de septiembre, así que a partir de octubre mentía: un examen del 4
 * de octubre quedaba guardado como "setiembre". La fecha era correcta y el
 * nombre no, que es justo lo que lee una persona.
 */
const otoño = [
  ['4 de octubre: Área B', 'octubre', 9],
  ['3 de noviembre: Área A', 'noviembre', 10],
  ['20 de diciembre: Área E', 'diciembre', 11],
  ['15 de setiembre: Área A', 'septiembre', 8],
];
ok('el nombre del mes coincide con la fecha',
  otoño.every(([texto, nombre, numero]) => {
    const f = fechasDeExamen(texto, { año: 2027 })[0];
    return f.mes === nombre && new Date(f.fecha).getUTCMonth() === numero;
  }),
  '→ presentarse un mes antes no es un detalle');
/* El año casi nunca aparece en esas frases. Adivinarlo pone el examen a doce
   meses de distancia y el contador de días de la pantalla de meta se vuelve
   una broma, así que entra por contexto. */
ok('el año entra por contexto y no se adivina',
  new Date(fechas[0].fecha).getUTCFullYear() === 2027);

/* --- El fallo más silencioso del OCR --- */

ok('lee el total de vacantes que declara el documento', totalDeVacantes(TABLA) === 2771);

/* Saltarse filas enteras no lo detecta ninguna validación por fila: las que sí
   leyó son correctas. Solo se ve contrastando contra el total publicado. */
const cuadra = cuadraElTotal(filas, 2771);
ok('avisa cuando la lectura se saltó carreras',
  cuadra.comprobable && !cuadra.cuadra,
  `→ "${cuadra.mensaje}"`);
ok('y calla cuando la suma cuadra',
  cuadraElTotal([{ vacantes: 2771 }], 2771).cuadra);

/* --- La puerta --- */

const BUENO = {
  universidadId: 'unmsm', proceso: '2027-I', carreraId: 'ingenieria-de-sistemas',
  carrera: 'Ingeniería de Sistemas', area: 'B', vacantes: 45, postulantes: 1234, corte: 1187,
  fuente: 'https://admision.unmsm.edu.pe/acta.pdf', obtenido: Date.now(),
};

const rev = (cambios, ctx) => revisarRegistro({ ...BUENO, ...cambios }, ctx);
const rechaza = (nombre, cambios, campo) => {
  const r = rev(cambios);
  const p = r.problemas.find((x) => x.nivel === 'rechazo' && x.campo === campo);
  ok(nombre, !r.publicable && Boolean(p), p ? `→ "${p.mensaje}"` : '→ no lo detectó');
};

ok('un registro creíble pasa la puerta', rev({}).publicable && rev({}).problemas.length === 0);

rechaza('rechaza un corte por encima del máximo del examen', { corte: 4200 }, 'corte');
rechaza('rechaza un corte irrisorio: el dígito está mal leído', { corte: 87 }, 'corte');
rechaza('rechaza un corte ilegible', { corte: NaN }, 'corte');
rechaza('rechaza unas vacantes imposibles', { vacantes: 9000 }, 'vacantes');
rechaza('rechaza que haya menos postulantes que vacantes',
  { vacantes: 45, postulantes: 12 }, 'postulantes');
rechaza('rechaza el registro que no dice de dónde salió', { fuente: '' }, 'fuente');
rechaza('rechaza un área inventada', { area: 'Z' }, 'area');
rechaza('rechaza una convocatoria con formato raro', { proceso: 'marzo' }, 'proceso');

/*
 * Un acta de área C es real y no se puede tirar. Pero el temario del proyecto
 * solo declara cuatro áreas, así que una carrera de área C entra en la base y
 * la aplicación no sabe dónde ponerla. El hueco está en el temario.
 */
ok('la puerta acepta las cinco áreas que convoca San Marcos',
  AREAS_UNMSM.length === 5 && AREAS_UNMSM.includes('C'));
ok('el temario todavía declara solo cuatro: le falta la C',
  !Object.keys(AREAS_DEL_TEMARIO).includes('C'),
  `→ tiene ${Object.keys(AREAS_DEL_TEMARIO).join(', ')} · pendiente de cargar`);

ok(`el máximo del examen son ${PUNTAJE_MAXIMO} puntos`,
  PUNTAJE_MAXIMO === 1800, '→ 90 preguntas por 20 puntos');

/* El aviso que caza el error de OCR que supera todo lo demás: un dígito mal
   leído da una cifra perfectamente posible, y solo destaca al compararla con
   la del ciclo anterior. */
const salto = rev({ corte: 787 }, { anterior: { corte: 1187, proceso: '2026-II' } });
ok('avisa cuando el corte salta respecto al ciclo anterior',
  salto.publicable && salto.problemas.some((p) => p.nivel === 'aviso' && p.campo === 'corte'),
  `→ "${salto.problemas[0]?.mensaje}"`);
ok('un movimiento normal entre ciclos no molesta',
  rev({ corte: 1210 }, { anterior: { corte: 1187, proceso: '2026-II' } }).problemas.length === 0);
ok('el umbral del salto está declarado', LIMITES_ADMISION.SALTO_SOSPECHOSO === 0.25);

/* --- La tanda --- */

const tanda = revisarTanda([
  { ...BUENO },
  { ...BUENO, carreraId: 'ingenieria-industrial', carrera: 'Ingeniería Industrial', corte: 1203 },
  { ...BUENO, carreraId: 'medicina', carrera: 'Medicina Humana', corte: 9999 },
]);
ok('la tanda reparte lo publicable y lo descartado',
  tanda.resumen.aRevisar === 2 && tanda.resumen.descartados === 1,
  `→ ${tanda.resumen.aRevisar} a revisar, ${tanda.resumen.descartados} descartadas`);

/* Una carrera repetida significa que la lectura saltó o repitió una fila, y
   entonces no se puede confiar en ninguna de las dos. */
const repetida = revisarTanda([{ ...BUENO }, { ...BUENO }]);
ok('una carrera repetida en la misma tanda se descarta',
  repetida.resumen.descartados === 1,
  '→ la lectura saltó o repitió una fila');

/* --- La cuarentena --- */

/* Esta es la que sostiene todo lo demás. "Plausible" no es "correcto", y solo
   alguien que mire el acta puede decir la diferencia. */
ok('nada sale de la puerta ya publicado',
  tanda.aRevisar.every((r) => r.registro.confirmado === undefined),
  '→ pasar la puerta es entrar a la cola, no salir de ella');

const publica = versionPublica({ ...BUENO, confirmado: Date.now() });
ok('lo que ve el alumno lleva siempre su fuente',
  publica.fuente.startsWith('http'),
  '→ un corte sin decir de dónde salió es un rumor con formato de tabla');
ok('y lleva la marca de quién lo confirmó', Boolean(publica.confirmado));
ok('calcula los postulantes por vacante, que es lo que se entiende',
  publica.porVacante === 27.4, `→ ${publica.porVacante} por vacante`);
ok('la versión pública no filtra los avisos internos',
  publica.avisos === undefined);

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
