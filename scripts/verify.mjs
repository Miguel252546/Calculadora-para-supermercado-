// scripts/verify.mjs
// Verificación rápida: chequea sintaxis de todos los .js/.mjs del proyecto.
// Útil como CI light o como check pre-commit. No instala nada.

import { execFileSync } from 'node:child_process';

console.log('→ Verificando sintaxis de los módulos JS…\n');
try {
  execFileSync(process.execPath, ['scripts/check-syntax.mjs'], { stdio: 'inherit' });
  console.log('\n✅ Todo OK.');
} catch {
  console.error('\n❌ Hay errores de sintaxis. Revisa arriba.');
  process.exit(1);
}
