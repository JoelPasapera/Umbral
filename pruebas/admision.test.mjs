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

/* --- Los datos reales de la convocatoria --- */

const { datosDeAdmision, AREAS, ESTATICO } = await import('../src/data/mock/admision.js');
const { componerAdmision } = await import('../src/domain/admision.js');
const { cursosDelArea } = await import('../src/data/mock/temario.js');

const componer = (servidor) => componerAdmision({
  area: 'B', cursos: cursosDelArea('B'), estatico: ESTATICO, servidor, ahora: Date.UTC(2026, 8, 10),
});
const d = componer(datosDeAdmision());

/*
 * San Marcos convoca CINCO áreas y la C es Ingenierías, separada de la B
 * (Ciencias Básicas): son exámenes distintos aunque caigan el mismo día. El
 * temario del proyecto las trae fundidas y no declara la C, así que el reparto
 * de preguntas que ve un postulante a ingeniería está sin contrastar.
 */
ok('las cinco áreas están declaradas con su nombre',
  Object.keys(AREAS).join('') === 'ABCDE' && AREAS.C === 'Ingenierías');
ok('el temario todavía funde Ciencias Básicas con Ingenierías',
  AREAS_DEL_TEMARIO.B?.nombre?.includes('Ingenierías') && !AREAS_DEL_TEMARIO.C,
  '→ pendiente de separar contra el prospecto');
ok('por eso el reparto se marca como sin contrastar', d.reparto.estado === 'estimado');

/* Cronograma 2027-I: cuatro jornadas en octubre de 2026. */
ok('el cronograma trae las cuatro jornadas', d.cronograma.jornadas.length === 4);
ok('y va marcado como oficial con su fuente',
  d.cronograma.estado === 'oficial' && d.cronograma.fuente.startsWith('https://'));
ok('las cuatro caen en octubre de 2026',
  d.cronograma.jornadas.every((j) => {
    const f = new Date(j.fecha);
    return f.getUTCFullYear() === 2026 && f.getUTCMonth() === 9;
  }),
  `→ ${d.cronograma.jornadas.map((j) => new Date(j.fecha).getUTCDate()).join(', ')} de octubre`);
ok('Ciencias Básicas e Ingenierías rinden el mismo día',
  d.cronograma.jornadas.some((j) => j.areas.includes('B') && j.areas.includes('C')));
ok('Medicina Humana tiene jornada propia',
  d.cronograma.jornadas.filter((j) => j.areas.includes('A')).length === 2);

/* Los plazos de inscripción son lo único que se puede perder por no mirarlo. */
ok('los tres plazos de inscripción están', d.cronograma.inscripcion.length === 3);
ok('el estado de cada plazo se calcula contra la fecha',
  d.cronograma.inscripcion.filter((i) => i.abierto).length === 1
    && d.cronograma.inscripcion.filter((i) => i.cerrado).length === 1,
  '→ a 10 de septiembre de 2026: uno cerrado, uno abierto, uno por abrir');

/* El hueco declarado. Es lo que impide que alguien lo rellene con una cifra de
   blog sobre la que un postulante calcularía cuánto le falta. */
ok('el corte por carrera se declara como hueco',
  d.cortes.estado === 'falta' && d.cortes.donde.startsWith('https://'));
ok('y el hueco explica de dónde saldría', d.cortes.motivo.includes('acta'));

/* Todo lo que se presenta con una cifra tiene que decir de dónde sale. */
ok('cada cifra del proceso trae fuente y estado',
  d.cifras.every((c) => c.fuente?.startsWith('https://') && ['oficial', 'estimado'].includes(c.estado)),
  `→ ${d.cifras.length} cifras`);

/* --- Que los dos adaptadores no se separen --- */

/*
 * El simulado devolvía un objeto con cronograma, reparto, pasos y cortes; el
 * Worker devolvía una lista de filas. La pantalla leía el primero, así que el
 * día que el recurso pasara al servidor se habría roto sin que nada avisara.
 * Ahora cada adaptador aporta solo lo suyo —jornadas, cifras y cortes— y
 * `componerAdmision` arma la forma final una sola vez.
 */
const CLAVES = ['universidadId', 'proceso', 'jornadas', 'cifras', 'cortes'];
ok('el simulado devuelve las claves del contrato',
  CLAVES.every((k) => k in datosDeAdmision()),
  `→ ${Object.keys(datosDeAdmision()).join(', ')}`);

/* Lo que respondería el Worker con la base vacía. */
const comoElWorker = componer({
  universidadId: 'unmsm', proceso: '2027-I', jornadas: [], cifras: [], cortes: [],
});
ok('la respuesta del Worker arma la misma forma que la del simulado',
  Object.keys(comoElWorker).join(',') === Object.keys(d).join(','),
  `→ ${Object.keys(d).join(', ')}`);
ok('y la pantalla encuentra lo que busca en las dos',
  Array.isArray(comoElWorker.cronograma.jornadas)
    && Array.isArray(comoElWorker.cronograma.inscripcion)
    && Array.isArray(comoElWorker.reparto.cursos)
    && Array.isArray(comoElWorker.pasos));

/* Con la base vacía, el cronograma también se declara hueco en vez de salir
   como una lista de cero jornadas que parece un error de carga. */
ok('sin jornadas confirmadas, el cronograma se declara hueco',
  comoElWorker.cronograma.estado === 'falta');
ok('lo estático llega igual aunque el servidor no traiga nada',
  comoElWorker.pasos.length === d.pasos.length
    && comoElWorker.cronograma.inscripcion.length === 3,
  '→ plazos y pasos viajan con el cliente, no con la respuesta');

/* Y con cortes confirmados, deja de ser hueco. */
const conCortes = componer({
  jornadas: [], cifras: [],
  cortes: [{
    carrera: 'Ingeniería de Sistemas', area: 'C', proceso: '2027-I',
    vacantes: 45, postulantes: 1240, corte: 1187,
    fuente: 'https://admision.unmsm.edu.pe/acta.pdf', confirmado: Date.now(),
  }],
});
ok('con el acta confirmada el corte deja de ser un hueco',
  conCortes.cortes.estado === 'oficial' && conCortes.cortes.filas[0].porVacante === 27.6);

/* ── Que las pantallas no se contradigan ─────────────────────────────── */

/*
 * La pantalla de meta decía que el examen era el 30 de diciembre —hoy más 94
 * días, un número que no se movía nunca— y la de Admisión, con el cronograma
 * oficial, el 18 de octubre. Las dos a la vez, al mismo alumno. Ahora la fecha
 * sale de un solo sitio, y esto comprueba que las dos pantallas la lean igual.
 */
const { examen, catalogo } = await import('../src/data/mock/exams.js');
const { fechaDeExamen } = await import('../src/data/mock/admision.js');

const suMeta = examen({ universidadId: 'unmsm', carreraId: 'sistemas' });
const suJornada = datosDeAdmision().jornadas.find((j) => j.areas.includes(suMeta.area));
ok('la meta y Admisión dan la misma fecha de examen',
  new Date(suMeta.fecha).getTime() === suJornada.fecha,
  `→ ${suMeta.fecha.slice(0, 10)} en las dos`);
ok('Medicina Humana rinde en su día propio y no con el resto del área A',
  fechaDeExamen({ universidadId: 'unmsm', area: 'A', carreraId: 'medicina' })
    > fechaDeExamen({ universidadId: 'unmsm', area: 'A', carreraId: 'biologia' }));
ok('una universidad sin cronograma cargado no inventa fecha',
  examen({ universidadId: 'uni', carreraId: 'civil' }).fecha === null);

/*
 * El corte de la meta decía "último proceso conocido" sobre números escritos a
 * mano, y sobre él salía el titular "te faltan 14 puntos". Admisión decía que
 * el corte no estaba cargado. Ahora ninguna de las dos lo inventa.
 */
ok('la meta no presenta un corte que Admisión declara como hueco',
  suMeta.corte === null && suMeta.corteFuente === null && d.cortes.estado === 'falta');

/* Un corte real se carga en las unidades del acta —puntos sobre un máximo— y
   se convierte aquí. Copiarlo convertido a mano es donde entra el error. */
const { corteEnEscala } = await import('../src/data/mock/exams.js');
const ACTA = { puntos: 1187, maximo: 1800, proceso: '2026-II', fuente: 'https://admision.unmsm.edu.pe/acta.pdf' };
const convertido = corteEnEscala(ACTA);
ok('un corte del acta se pasa a la escala de 0 a 100',
  convertido.corte === 65.9, `→ 1187 de 1800 son ${convertido.corte} sobre 100`);
ok('y dice de qué proceso sale y cuántos puntos eran',
  convertido.corteFuente.includes('2026-II') && convertido.corteFuente.includes('1187'));
ok('sin fuente no se acepta',
  corteEnEscala({ ...ACTA, fuente: '' }).corte === null,
  '→ un corte sin decir de dónde sale es un rumor con formato de número');
ok('un corte mayor que el máximo se rechaza, no se recorta',
  corteEnEscala({ ...ACTA, puntos: 1900 }).corte === null);

ok('ninguna universidad del catálogo arrastra la cuenta congelada',
  catalogo().every((u) => !('dias' in u)),
  '→ antes cada una traía "examen en 94 días" fijo');

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
