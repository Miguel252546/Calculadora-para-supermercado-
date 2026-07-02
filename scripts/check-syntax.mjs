// scripts/check-syntax.mjs
// Verifica la sintaxis de TODOS los archivos JS del proyecto con `node --check`.
// No requiere dependencias, ni siquiera un package.json con dependencias.
// Falla con exit 1 si encuentra algún error de parseo.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const TARGETS = ['src', 'scripts', 'tests'];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.js') || full.endsWith('.mjs')) out.push(full);
  }
  return out;
}

const files = TARGETS.flatMap((t) => {
  try { return walk(join(ROOT, t)); } catch { return []; }
});

let failed = 0;
for (const f of files) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    console.log(`✓ ${relative(ROOT, f)}`);
  } catch (err) {
    failed++;
    const msg = (err.stderr || err.stdout || err.message).toString();
    console.error(`✗ ${relative(ROOT, f)}\n${msg}`);
  }
}

console.log(`\nArchivos OK: ${files.length - failed}/${files.length}`);
process.exit(failed ? 1 : 0);
