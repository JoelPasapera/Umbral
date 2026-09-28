import { calcularPreparacion, estimarDominio, diasHasta } from '../src/domain/readiness.js';

const DIA = 86400000, AHORA = Date.now();
let fallos = 0;
const comprobar = (nombre, ok, extra='') => { console.log(`${ok?'  ok  ':'FALLO '} ${nombre} ${extra}`); if(!ok) fallos++; };

// 1. Sin evidencia no se inventa un número
const vacio = estimarDominio([], AHORA, 12);
comprobar('sin intentos devuelve null', vacio.valor === null && vacio.estado === 'insuficiente');

// 2. Con evidencia suficiente sí estima
const muchos = Array.from({length:30}, (_,i)=>({acerto:i%10<8, dificultad:0.5, fecha:AHORA-i*DIA}));
const est = estimarDominio(muchos, AHORA, 12);
comprobar('30 intentos al 80% estiman cerca de 80', est.valor > 70 && est.valor < 88, `→ ${est.valor.toFixed(1)}`);

// 3. Lo viejo pesa menos que lo nuevo
const viejos = Array.from({length:30}, (_,i)=>({acerto:true, dificultad:0.5, fecha:AHORA-180*DIA-i*DIA}));
const nuevos = Array.from({length:30}, (_,i)=>({acerto:true, dificultad:0.5, fecha:AHORA-i*DIA}));
comprobar('la evidencia antigua pesa menos',
  estimarDominio(viejos,AHORA,0).evidencia < estimarDominio(nuevos,AHORA,0).evidencia * 0.2);

// 4. Acertar una difícil vale más que acertar una fácil
const dificil = estimarDominio(Array.from({length:20},()=>({acerto:true,dificultad:0.2,fecha:AHORA})),AHORA,0);
const facil   = estimarDominio(Array.from({length:20},()=>({acerto:true,dificultad:0.9,fecha:AHORA})),AHORA,0);
comprobar('acertar difíciles sube más', dificil.valor > facil.valor,
  `→ difícil ${dificil.valor.toFixed(1)} vs fácil ${facil.valor.toFixed(1)}`);

// 5. Más evidencia estrecha el margen
const pocos = estimarDominio(Array.from({length:14},(_,i)=>({acerto:i%2===0,dificultad:0.5,fecha:AHORA})),AHORA,0);
const monton = estimarDominio(Array.from({length:200},(_,i)=>({acerto:i%2===0,dificultad:0.5,fecha:AHORA})),AHORA,0);
comprobar('más datos, menos margen', monton.margen < pocos.margen,
  `→ ${pocos.margen.toFixed(1)} baja a ${monton.margen.toFixed(1)}`);

// 6. El escenario completo, con los datos de ejemplo
const { responder } = await import('../src/data/mock/fixtures.js');
const meta = await responder('meta/activa', {});
const intentos = await responder('practica/intentos', {});
const r = calcularPreparacion(intentos, meta, AHORA);
comprobar('el escenario produce un índice', r.estado === 'estimado', `→ ${r.indice.toFixed(1)} ± ${(r.margen/2).toFixed(1)}`);
comprobar('los cursos sin evidencia quedan fuera del promedio', r.sinDatos.length >= 1 && r.cobertura > 0.5, `→ ${r.sinDatos.map(c=>c.nombre).join(', ')}`);
// Encabeza el que más puntos devuelve, que es nivel por peso: en ingenierías
// Física pesa 10 preguntas y trigonometría 6, así que no basta ir peor.
comprobar('encabeza el curso que más puntos devuelve',
  r.cursos[0].puntosEnJuego >= r.cursos[1].puntosEnJuego,
  `→ ${r.cursos[0].nombre}, recupera ${r.cursos[0].puntosEnJuego.toFixed(1)} pts`);
comprobar('la cobertura es menor que 1', r.cobertura < 1, `→ ${(r.cobertura*100).toFixed(0)}% del examen medido`);
/*
 * Aquí se comprobaba que faltaran 94 días, y pasaba siempre: la fecha se
 * calculaba como "hoy más 94 días", así que la cuenta atrás no se movía nunca.
 * La prueba fijaba el fallo en vez de detectarlo. Ahora la fecha es la del
 * cronograma oficial, y se comprueba contra un día conocido.
 */
const diezDeSetiembre = Date.UTC(2026, 8, 10);
comprobar('días hasta el examen, contra el cronograma oficial',
  diasHasta(meta.fecha, diezDeSetiembre) === 38,
  `→ ${diasHasta(meta.fecha, diezDeSetiembre)} días desde el 10 de septiembre`);
comprobar('la cuenta atrás se mueve con los días',
  diasHasta(meta.fecha, diezDeSetiembre + 5 * DIA) === 33);
comprobar('sin fecha no hay cuenta, en vez de un número absurdo', diasHasta(null, AHORA) === null);

/*
 * La brecha se prueba con un corte puesto aquí, no con el del catálogo: el
 * catálogo ya no trae ninguno —los que había eran inventados— y la prueba de
 * la fórmula no puede depender de que alguien haya cargado un acta.
 */
const conCorte = calcularPreparacion(intentos, { ...meta, corte: 65 }, AHORA);
comprobar('con un corte cargado se calcula la brecha', typeof conCorte.brecha === 'number',
  `→ ${conCorte.brecha.toFixed(1)} puntos`);
comprobar('la brecha es el índice menos el corte',
  Math.abs(conCorte.brecha - (conCorte.indice - 65)) < 1e-9);
comprobar('sin corte cargado la brecha no se inventa', r.corte === null && r.brecha === null);

console.log('\n--- cursos ordenados por puntos recuperables ---');
for (const c of r.cursos) console.log(`  ${c.nombre.padEnd(20)} ${c.dominio.valor.toFixed(0).padStart(3)}   recupera hasta ${c.puntosEnJuego.toFixed(1)} pts`);
console.log(`\nÍndice ${r.indice.toFixed(0)} · corte ${r.corte ?? 'sin cargar'} · brecha ${r.brecha === null ? '—' : r.brecha.toFixed(1)}`);
console.log(fallos === 0 ? '\nTODAS LAS COMPROBACIONES PASAN' : `\n${fallos} FALLOS`);
process.exit(fallos ? 1 : 0);
