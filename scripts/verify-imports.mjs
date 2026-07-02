// scripts/verify-imports.mjs
// Importa cada módulo del proyecto en un Node con `globalThis` enriquecido
// con un DOM mínimo (localStorage) y reporta fallos.
//
// Es el mismo principio que `tests/imports-check.mjs`, ampliado a TODO el
// árbol `src/`. No usa dependencias externas.

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

// DOM mínimo: lo justo para que los gateways de localStorage y los
// helpers que hacen `document.getElementById` (los controllers NO lo hacen
// en import-time, pero algunos gateways sí durante getAll) no exploten.
globalThis.localStorage = {
  _data: new Map(),
  getItem(k) { return this._data.has(k) ? this._data.get(k) : null; },
  setItem(k, v) { this._data.set(k, String(v)); },
  removeItem(k) { this._data.delete(k); },
  clear() { this._data.clear(); }
};

const ROOT = process.cwd();
const TARGETS = ['src/domain', 'src/shared', 'src/frameworks/mappers', 'src/usecases'];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.js')) out.push(full);
  }
  return out;
}

const files = TARGETS.flatMap((t) => {
  try { return walk(join(ROOT, t)); } catch { return []; }
});

let ok = 0, fail = 0;
for (const f of files) {
  try {
    await import(pathToFileURL(f).href);
    console.log(`✓ ${relative(ROOT, f)}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${relative(ROOT, f)}: ${e.message}`);
    fail++;
  }
}
console.log(`\nImports OK: ${ok}/${files.length}`);
process.exit(fail ? 1 : 0);
