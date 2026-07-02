// tests/imports-check.mjs
// Verifica que todos los módulos del proyecto carguen sin errores de sintaxis.
// Simula un entorno mínimo (sin DOM) y hace imports lazy.

const files = [
  // Domain
  '../src/domain/errors.js',
  '../src/domain/entities/Product.js',
  '../src/domain/entities/Cart.js',
  '../src/domain/entities/PrelistItem.js',
  '../src/domain/entities/PendingItem.js',
  '../src/domain/entities/Invoice.js',
  '../src/domain/entities/Habits.js',
  // Shared
  '../src/shared/id.js',
  '../src/shared/money.js',
  // UseCases
  '../src/usecases/ports.js',
  '../src/usecases/AddProductToCart.js',
  '../src/usecases/RemoveProductFromCart.js',
  '../src/usecases/UpdateProductInCart.js',
  '../src/usecases/CalculateCartTotal.js',
  '../src/usecases/ClearCart.js',
  '../src/usecases/GenerateInvoice.js',
  '../src/usecases/ManageHistory.js',
  '../src/usecases/ManagePrelist.js',
  '../src/usecases/ManagePending.js',
  '../src/usecases/SelectPrelistItem.js',
  '../src/usecases/CompletePendingProduct.js',
  // Mappers (sin DOM)
  '../src/frameworks/mappers/CartMapper.js',
  '../src/frameworks/mappers/PrelistMapper.js',
  '../src/frameworks/mappers/PendingMapper.js'
];

let okCount = 0;
let failCount = 0;

for (const f of files) {
  try {
    await import(f);
    okCount++;
  } catch (e) {
    failCount++;
    console.error(`✗ ${f}: ${e.message}`);
  }
}

console.log(`Imports OK: ${okCount}/${files.length}`);
if (failCount) process.exit(1);