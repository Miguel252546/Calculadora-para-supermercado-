// tests/node-runner.mjs
// Ejecuta las pruebas del dominio y use cases en Node, sin DOM.

import { createProduct, lineSubtotal } from '../src/domain/entities/Product.js';
import { createCart, findIndex, withoutProduct } from '../src/domain/entities/Cart.js';
import { createPrelistItem } from '../src/domain/entities/PrelistItem.js';
import { createPendingItem } from '../src/domain/entities/PendingItem.js';
import { createInvoice } from '../src/domain/entities/Invoice.js';
import { CartMapper } from '../src/frameworks/mappers/CartMapper.js';
import { PrelistMapper } from '../src/frameworks/mappers/PrelistMapper.js';
import { PendingMapper } from '../src/frameworks/mappers/PendingMapper.js';
import { makeAddProductToCart } from '../src/usecases/AddProductToCart.js';
import { makeRemoveProductFromCart } from '../src/usecases/RemoveProductFromCart.js';
import { makeCalculateCartTotal } from '../src/usecases/CalculateCartTotal.js';
import { makeUpdateProductInCart } from '../src/usecases/UpdateProductInCart.js';
import { makeClearCart } from '../src/usecases/ClearCart.js';
import { makeManagePrelist } from '../src/usecases/ManagePrelist.js';
import { makeManagePending } from '../src/usecases/ManagePending.js';

const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, ok: true }); }
  catch (e) { results.push({ name, ok: false, err: e?.message || String(e) }); }
}
function assert(cond, msg = 'assert failed') { if (!cond) throw new Error(msg); }

// Domain
test('Product crea', () => {
  const p = createProduct({ name: 'Café', qty: 2, price: 1000 });
  assert(p.name === 'Café' && p.qty === 2 && p.price === 1000 && p.id);
});
test('Product subtotal', () => {
  const p = createProduct({ name: 'Pan', qty: 3, price: 500 });
  assert(lineSubtotal(p) === 1500);
});
test('Product nombre vacío', () => {
  let ok = false; try { createProduct({ name: '', qty: 1, price: 0 }); }
  catch (e) { ok = e.name === 'ValidationError'; }
  assert(ok);
});
test('Product qty inválida', () => {
  let ok = false; try { createProduct({ name: 'X', qty: 0, price: 1 }); }
  catch { ok = true; }
  assert(ok);
});
test('Product price negativo', () => {
  let ok = false; try { createProduct({ name: 'X', qty: 1, price: -5 }); }
  catch { ok = true; }
  assert(ok);
});

// Cart
test('Cart total', () => {
  const c = createCart([
    createProduct({ name: 'A', qty: 2, price: 100 }),
    createProduct({ name: 'B', qty: 1, price: 50 })
  ]);
  assert(c.total === 250 && c.count === 2);
});
test('Cart findIndex', () => {
  const c = createCart([createProduct({ name: 'A', qty: 1, price: 1 })]);
  assert(findIndex(c, 'nope') === -1);
});
test('Cart withoutProduct', () => {
  const p = createProduct({ name: 'A', qty: 1, price: 1 });
  const next = withoutProduct(createCart([p]), p.id);
  assert(next.count === 0);
});

// Prelist / Pending
test('PrelistItem', () => {
  const it = createPrelistItem({ name: 'Leche', category: 'Lácteos', qty: 2, brand: 'Colun' });
  assert(it.category === 'Lácteos' && it.brand === 'Colun');
});
test('PendingItem default qty', () => {
  const it = createPendingItem({ name: 'X' });
  assert(it.qty === 1);
});

// Invoice
test('Invoice total + itemCount', () => {
  const inv = createInvoice({
    storeName: 'T', clientName: 'C',
    products: [
      createProduct({ name: 'A', qty: 2, price: 100 }),
      createProduct({ name: 'B', qty: 1, price: 50 })
    ]
  });
  assert(inv.total === 250 && inv.itemCount === 3 && inv.lines.length === 2);
});
test('Invoice sin productos falla', () => {
  let ok = false; try { createInvoice({ products: [] }); }
  catch { ok = true; }
  assert(ok);
});

// Mappers
test('CartMapper round-trip', () => {
  const ps = [createProduct({ name: 'Leche', qty: 2, price: 1200 })];
  const back = CartMapper.toDomain(CartMapper.toJSON(ps));
  assert(back[0].name === 'Leche' && back[0].qty === 2 && back[0].price === 1200);
});
test('CartMapper filtra inválidos', () => {
  const out = CartMapper.toDomain([{ qty: 1 }, { name: 'OK', qty: 1, price: 10 }]);
  assert(out.length === 1);
});
test('PrelistMapper round-trip', () => {
  const it = [createPrelistItem({ name: 'A', category: 'C' })];
  const back = PrelistMapper.toDomain(PrelistMapper.toJSON(it));
  assert(back[0].name === 'A' && back[0].category === 'C');
});
test('PendingMapper round-trip', () => {
  const it = [createPendingItem({ name: 'P' })];
  const back = PendingMapper.toDomain(PendingMapper.toJSON(it));
  assert(back[0].name === 'P');
});

// UseCases
function makeMemoryRepo(initial = []) {
  let data = initial;
  return {
    getAll: () => data.slice(),
    save: (x) => { data = x.slice(); },
    clear: () => { data = []; }
  };
}

test('AddProductToCart', () => {
  const repo = makeMemoryRepo();
  const add = makeAddProductToCart({ cartRepository: repo });
  add({ name: 'Café', qty: 2, price: 1000 });
  assert(repo.getAll().length === 1);
});
test('AddProductToCart suma case-insensitive', () => {
  const repo = makeMemoryRepo();
  const add = makeAddProductToCart({ cartRepository: repo });
  add({ name: 'Café', qty: 2, price: 1000 });
  add({ name: 'café', qty: 3, price: 1000 });
  const all = repo.getAll();
  assert(all.length === 1 && all[0].qty === 5);
});
test('RemoveProductFromCart', () => {
  const p = createProduct({ name: 'A', qty: 1, price: 10 });
  const repo = makeMemoryRepo([p]);
  const remove = makeRemoveProductFromCart({ cartRepository: repo });
  remove(p.id);
  assert(repo.getAll().length === 0);
});
test('UpdateProductInCart', () => {
  const p = createProduct({ name: 'A', qty: 1, price: 10 });
  const repo = makeMemoryRepo([p]);
  const update = makeUpdateProductInCart({ cartRepository: repo });
  update(p.id, { qty: 5 });
  assert(repo.getAll()[0].qty === 5);
});
test('CalculateCartTotal', () => {
  const repo = makeMemoryRepo([
    createProduct({ name: 'A', qty: 2, price: 100 }),
    createProduct({ name: 'B', qty: 1, price: 50 })
  ]);
  const calc = makeCalculateCartTotal({ cartRepository: repo });
  assert(calc().total === 250);
});
test('ClearCart', () => {
  const repo = makeMemoryRepo([createProduct({ name: 'A', qty: 1, price: 1 })]);
  const clr = makeClearCart({ cartRepository: repo });
  clr();
  assert(repo.getAll().length === 0);
});

// ManagePrelist (con repo en memoria simulando upsert)
function makeMemoryUpsert(initial = []) {
  let data = initial;
  return {
    getAll: () => data.slice(),
    upsert: (item) => {
      const idx = data.findIndex(p => p.id === item.id);
      if (idx === -1) data.push(item); else data[idx] = item;
    },
    remove: (id) => { data = data.filter(p => p.id !== id); },
    clear: () => { data = []; }
  };
}

test('ManagePrelist add/list/categories', () => {
  const repo = makeMemoryUpsert();
  const m = makeManagePrelist({ prelistRepository: repo });
  m.add({ name: 'A', category: 'C1' });
  m.add({ name: 'B', category: 'C2' });
  assert(m.list().length === 2);
  assert(m.categories().includes('C1') && m.categories().includes('C2'));
});
test('ManagePrelist update', () => {
  const repo = makeMemoryUpsert();
  const m = makeManagePrelist({ prelistRepository: repo });
  const a = m.add({ name: 'A', category: 'C1' });
  const up = m.update(a.id, { name: 'AA' });
  assert(up.name === 'AA');
});
test('ManagePending add/remove', () => {
  const repo = makeMemoryUpsert();
  const m = makeManagePending({ pendingRepository: repo });
  const a = m.add({ name: 'X' });
  m.remove(a.id);
  assert(m.list().length === 0);
});

// Reporte
const pass = results.filter(r => r.ok).length;
const fail = results.length - pass;
console.log(`\nResultados: ${pass}/${results.length} OK`);
if (fail) {
  console.error('FALLOS:');
  for (const r of results.filter(r => !r.ok)) {
    console.error(`  ✗ ${r.name} — ${r.err}`);
  }
  process.exit(1);
}
console.log('Todos los tests pasaron.');