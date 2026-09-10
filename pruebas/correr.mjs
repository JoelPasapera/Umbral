import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const archivos = readdirSync(new URL('.', import.meta.url))
  .filter((f) => f.endsWith('.test.mjs'))
  .sort();

let fallos = 0;
for (const archivo of archivos) {
  console.log(`\n── ${archivo} ${'─'.repeat(Math.max(0, 44 - archivo.length))}`);
  const r = spawnSync(process.execPath, [new URL(archivo, import.meta.url).pathname], { stdio: 'inherit' });
  if (r.status !== 0) fallos += 1;
}

console.log(fallos ? `\n${fallos} archivo(s) con fallos` : '\nTodo verde.');
process.exit(fallos ? 1 : 0);
