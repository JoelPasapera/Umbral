/**
 * El archivo de enlaces.
 *
 * `src/data/enlaces.js` es el único sitio donde se pegan enlaces, y lo va a
 * editar una persona a mano, muchas veces, con prisa. Esta batería es la red
 * para los tres errores que se cometen así y no dan ningún error por sí solos:
 *
 *   · pegar bajo un identificador mal escrito: el enlace no aparece nunca;
 *   · pegar algo que no es una dirección completa: el botón no lleva a nada;
 *   · pegar una carpeta en vez de un archivo: el alumno aterriza en un listado.
 *
 * Además comprueba que nadie tenga que volver a tocar los archivos de datos
 * para poner un enlace, que es para lo que existe el archivo.
 */
import { readFileSync } from 'node:fs';
import { ENLACES, enlaceDe, pendientes } from '../src/data/enlaces.js';
import { catalogoCompleto } from '../src/data/mock/library.js';
import { admisible } from '../src/domain/catalogo.js';

let fallos = 0;
const ok = (n, c, e = '') => { console.log(`${c ? '  ok  ' : 'FALLO '} ${n} ${e}`); if (!c) fallos++; };

const catalogo = catalogoCompleto();
const porId = new Map(catalogo.map((m) => [m.id, m]));
const claves = Object.keys(ENLACES);

/* ── Que cada hueco corresponda a algo ───────────────────────────────── */

/* Un enlace bajo un nombre mal escrito no aparecería en ninguna parte, y
   nadie se enteraría hasta que un alumno preguntara por él. */
const huerfanas = claves.filter((k) => !porId.has(k));
ok('cada identificador corresponde a un material que existe',
  huerfanas.length === 0,
  huerfanas.length ? `→ no existen: ${huerfanas.join(', ')}` : `→ ${claves.length} huecos`);

const EXTERNOS = new Set(['enlace', 'video', 'libro', 'examen']);
const necesitan = catalogo.filter((m) => EXTERNOS.has(m.tipo) && m.licencia);
const sinHueco = necesitan.filter((m) => !(m.id in ENLACES));
ok('todo lo que se abre fuera tiene su hueco en el archivo',
  sinHueco.length === 0,
  sinHueco.length ? `→ falta hueco para: ${sinHueco.map((m) => m.id).slice(0, 5).join(', ')}` : `→ ${necesitan.length} materiales`);

/* Las fichas de editorial esperan licencia. Darles hueco invitaría a pegarles
   un enlace que la puerta no dejaría pasar. */
const sinLicencia = catalogo.filter((m) => EXTERNOS.has(m.tipo) && !m.licencia);
ok('las fichas sin licencia resuelta no tienen hueco',
  sinLicencia.every((m) => !(m.id in ENLACES)),
  `→ ${sinLicencia.length} esperan licencia, fuera del archivo`);

/* ── Que lo pegado sea una dirección que funcione ────────────────────── */

const llenos = Object.entries(ENLACES).filter(([, u]) => String(u).trim());
const malFormados = llenos.filter(([, u]) => {
  try { return new URL(String(u).trim()).protocol !== 'https:'; } catch { return true; }
});
ok('todo enlace pegado es una dirección https completa',
  malFormados.length === 0,
  malFormados.length ? `→ revisa: ${malFormados.map(([k]) => k).join(', ')}` : `→ ${llenos.length} pegados`);

const aCarpeta = llenos.filter(([, u]) => /drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\//i.test(u));
ok('ningún enlace apunta a una carpeta de Drive',
  aCarpeta.length === 0,
  aCarpeta.length ? `→ enlaza el archivo, no la carpeta: ${aCarpeta.map(([k]) => k).join(', ')}` : '');

/*
 * Se enlaza a quien publica el material, no a quien lo copia. Los exámenes y
 * solucionarios de San Marcos circulan republicados en blogs, en Scribd y en
 * carpetas compartidas; enlazar esas copias es exactamente lo que la puerta de
 * licencias existe para impedir, y además envejecen mal: se caen sin aviso.
 */
const REPUBLICADORES = /scribd\.com|studocu\.com|blogspot\.|pdfcoffee\.|dokumen\.|idoc\.|docer\.|slideshare\.net|issuu\.com/i;
const copias = llenos.filter(([, u]) => REPUBLICADORES.test(u));
ok('ningún enlace apunta a un sitio que republica material ajeno',
  copias.length === 0,
  copias.length ? `→ revisa: ${copias.map(([k]) => k).join(', ')}` : '');

/* Los de San Marcos, además, solo a editores reconocidos: la universidad o
   las academias que publican el examen con sus claves en su propia página. */
const EDITORES = ['admision.unmsm.edu.pe', 'sacooliveros.edu.pe', 'savia.school', 'www.trilce.edu.pe'];
const deSanMarcos = llenos.filter(([k]) => k.startsWith('ex-unmsm-'));
const ajenos = deSanMarcos.filter(([, u]) => !EDITORES.includes(new URL(u).hostname));
ok('los exámenes de San Marcos enlazan a quien los publica',
  deSanMarcos.length > 0 && ajenos.length === 0,
  ajenos.length ? `→ fuera de la lista: ${ajenos.map(([k, u]) => `${k} (${new URL(u).hostname})`).join(', ')}`
    : `→ ${deSanMarcos.length} enlaces, todos de editores reconocidos`);

ok('ningún enlace es de un marcador de prueba',
  llenos.every(([, u]) => !/ejemplo\.pe|example\.com|localhost/i.test(u)));

/* ── Que la puerta trate bien los enlaces de Drive ───────────────────── */

/* La puerta rechazaba Drive entero, incluido un archivo propio de la academia,
   y con un mensaje falso: "apunta a una carpeta compartida". El plan de
   alojar el material en Drive no habría podido funcionar. */
const LIBRO = {
  tipo: 'libro', origen: 'academia', licencia: 'propia', fuente: 'Elaborado por la academia', titulo: 'x',
};
ok('un archivo de Drive con licencia pasa la puerta',
  admisible({ ...LIBRO, url: 'https://drive.google.com/file/d/1AbCdEf/view?usp=drive_link' }).admisible);
ok('un documento de Google también',
  admisible({ ...LIBRO, url: 'https://docs.google.com/document/d/1AbCdEf/edit' }).admisible);
ok('un archivo de Drive sin licencia sigue sin pasar',
  !admisible({ ...LIBRO, licencia: '', url: 'https://drive.google.com/file/d/1AbCdEf/view' }).admisible,
  '→ lo que decide es el derecho a publicarlo, no dónde está alojado');
ok('una carpeta de Drive se rechaza, con o sin cuenta en la dirección',
  !admisible({ ...LIBRO, url: 'https://drive.google.com/drive/folders/abc' }).admisible
    && !admisible({ ...LIBRO, url: 'https://drive.google.com/drive/u/0/folders/abc' }).admisible);

/* ── Que el enlace llegue a la pantalla ──────────────────────────────── */

ok('un hueco vacío da null, no una cadena vacía',
  enlaceDe(claves[0]) === null || typeof enlaceDe(claves[0]) === 'string',
  '→ una cadena vacía en un href recarga la página actual');
ok('un identificador que no existe da null',
  enlaceDe('no-existe') === null);
ok('se sabe cuántos quedan por pegar',
  pendientes() === claves.length - llenos.length,
  `→ ${pendientes()} pendientes de ${claves.length}`);

/* Nadie tiene que volver a abrir los archivos de datos para poner un enlace:
   si alguno vuelve a fabricar direcciones de marcador, este archivo deja de
   ser el único sitio. */
const DATOS = ['src/data/mock/library.js', 'src/data/mock/examenes.js', 'src/data/mock/recursos-curso.js'];
const conMarcador = DATOS.filter((f) => /https:\/\/(?:ejemplo\.pe|www\.youtube\.com\/['`])/.test(readFileSync(f, 'utf8')));
ok('los archivos de datos ya no fabrican direcciones',
  conMarcador.length === 0,
  conMarcador.length ? `→ revisa: ${conMarcador.join(', ')}` : '→ todas salen de enlaces.js');

console.log(fallos ? `\n${fallos} FALLOS` : '\nTODAS PASAN');
process.exit(fallos ? 1 : 0);
