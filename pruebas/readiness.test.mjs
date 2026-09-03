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
comprobar('los cursos sin evidencia quedan fuera del promedio', r.sinDatos.length >= 1 && r.cobertura > 0.8, `→ ${r.sinDatos.map(c=>c.nombre).join(', ')}`);
comprobar('el peor curso encabeza la lista', r.cursos[0].cursoId === 'trigonometria', `→ ${r.cursos[0].nombre} en ${r.cursos[0].dominio.valor.toFixed(0)}`);
comprobar('la cobertura es menor que 1', r.cobertura < 1, `→ ${(r.cobertura*100).toFixed(0)}% del examen medido`);
comprobar('días hasta el examen', diasHasta(meta.fecha, AHORA) === 94, `→ ${diasHasta(meta.fecha, AHORA)}`);

console.log('\n--- cursos ordenados por puntos recuperables ---');
for (const c of r.cursos) console.log(`  ${c.nombre.padEnd(20)} ${c.dominio.valor.toFixed(0).padStart(3)}   recupera hasta ${c.puntosEnJuego.toFixed(1)} pts`);
console.log(`\nÍndice ${r.indice.toFixed(0)} · corte ${r.corte} · brecha ${r.brecha.toFixed(1)}`);
console.log(fallos === 0 ? '\nTODAS LAS COMPROBACIONES PASAN' : `\n${fallos} FALLOS`);
process.exit(fallos ? 1 : 0);
