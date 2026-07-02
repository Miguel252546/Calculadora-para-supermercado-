// tests/runner.js
// Pruebas mínimas sin paquetes. Usa console.assert y refleja resultados en el DOM.
// Compatible con cualquier navegador moderno (Chrome/Edge/Firefox).

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

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (e) {
    results.push({ name, ok: false, err: e && e.message ? e.message : String(e) });
  }
}

// ---------- DOMINIO: Product ----------
test('Product: crea con datos válidos', () => {
  const p = createProduct({ name: 'Café', qty: 2, price: 1000 });
  console.assert(p.name === 'Café', 'nombre');
  console.assert(p.qty === 2, 'qty');
  console.assert(p.price === 1000, 'price');
  console.assert(typeof p.id === 'string' && p.id.length > 0, 'id generado');
});

test('Product: subtotal = qty * price', () => {
  const p = createProduct({ name: 'Pan', qty: 3, price: 500 });
  console.assert(lineSubtotal(p) === 1500, 'subtotal esperado 1500');
});

test('Product: falla con nombre vacío', () => {
  let threw = false;
  try { createProduct({ name: '', qty: 1, price: 0 }); }
  catch (e) { threw = e.name === 'ValidationError'; }
  console.assert(threw, 'debe lanzar ValidationError');
});

test('Product: falla con qty < 1', () => {
  let threw = false;
  try { createProduct({ name: 'X', qty: 0, price: 100 }); }
  catch { threw = true; }
  console.assert(threw, 'debe lanzar');
});

test('Product: falla con price negativo', () => {
  let threw = false;
  try { createProduct({ name: 'X', qty: 1, price: -5 }); }
  catch { threw = true; }
  console.assert(threw, 'debe lanzar');
});

// ---------- DOMINIO: Cart ----------
test('Cart: total correcto con varias líneas', () => {
  const cart = createCart([
    createProduct({ name: 'A', qty: 2, price: 100 }),
    createProduct({ name: 'B', qty: 1, price: 50 })
  ]);
  console.assert(cart.total === 250, `total fue ${cart.total}`);
  console.assert(cart.count === 2);
});

test('Cart: findIndex devuelve -1 si no existe', () => {
  const cart = createCart([createProduct({ name: 'A', qty: 1, price: 1 })]);
  console.assert(findIndex(cart, 'nope') === -1);
});

test('Cart: withoutProduct elimina por id', () => {
  const p = createProduct({ name: 'A', qty: 1, price: 1 });
  const cart = createCart([p]);
  const next = withoutProduct(cart, p.id);
  console.assert(next.count === 0);
});

// ---------- DOMINIO: Prelist / Pending ----------
test('PrelistItem: crea con categoría válida', () => {
  const it = createPrelistItem({ name: 'Leche', category: 'Lácteos', qty: 2, brand: 'Colun' });
  console.assert(it.category === 'Lácteos');
  console.assert(it.brand === 'Colun');
});

test('PendingItem: crea con qty por defecto', () => {
  const it = createPendingItem({ name: 'X' });
  console.assert(it.qty === 1);
});

// ---------- DOMINIO: Invoice ----------
test('Invoice: total correcto con líneas', () => {
  const invoice = createInvoice({
    storeName: 'Test',
    clientName: 'Cliente',
    products: [
      createProduct({ name: 'A', qty: 2, price: 100 }),
      createProduct({ name: 'B', qty: 1, price: 50 })
    ]
  });
  console.assert(invoice.total === 250);
  console.assert(invoice.itemCount === 3);
  console.assert(invoice.lines.length === 2);
});

test('Invoice: falla con carrito vacío', () => {
  let threw = false;
  try { createInvoice({ products: [] }); }
  catch { threw = true; }
  console.assert(threw, 'debe lanzar');
});

// ---------- MAPPERS ----------
test('CartMapper: round-trip JSON ↔ dominio', () => {
  const products = [createProduct({ name: 'Leche', qty: 2, price: 1200 })];
  const json = CartMapper.toJSON(products);
  const back = CartMapper.toDomain(json);
  console.assert(back[0].name === 'Leche');
  console.assert(back[0].qty === 2);
  console.assert(back[0].price === 1200);
});

test('CartMapper: ignora entradas inválidas', () => {
  const out = CartMapper.toDomain([{ qty: 1 }, { name: 'OK', qty: 1, price: 10 }]);
  console.assert(out.length === 1, `salida length=${out.length}`);
});

test('PrelistMapper: round-trip', () => {
  const items = [createPrelistItem({ name: 'A', category: 'C' })];
  const back = PrelistMapper.toDomain(PrelistMapper.toJSON(items));
  console.assert(back[0].name === 'A');
  console.assert(back[0].category === 'C');
});

test('PendingMapper: round-trip', () => {
  const items = [createPendingItem({ name: 'P' })];
  const back = PendingMapper.toDomain(PendingMapper.toJSON(items));
  console.assert(back[0].name === 'P');
});

// ---------- USE CASES (con repo en memoria) ----------
function makeMemoryRepo(initial = []) {
  let data = initial;
  return {
    getAll: () => data.slice(),
    save: (x) => { data = x.slice(); },
    clear: () => { data = []; }
  };
}

test('AddProductToCart: agrega nuevo producto', () => {
  const repo = makeMemoryRepo();
  const add = makeAddProductToCart({ cartRepository: repo });
  const p = add({ name: 'Café', qty: 2, price: 1000 });
  console.assert(repo.getAll().length === 1);
  console.assert(repo.getAll()[0].id === p.id);
});

test('AddProductToCart: suma qty si existe (case-insensitive)', () => {
  const repo = makeMemoryRepo();
  const add = makeAddProductToCart({ cartRepository: repo });
  add({ name: 'Café', qty: 2, price: 1000 });
  add({ name: 'café', qty: 3, price: 1000 });
  const all = repo.getAll();
  console.assert(all.length === 1, `count=${all.length}`);
  console.assert(all[0].qty === 5);
});

test('RemoveProductFromCart: elimina por id', () => {
  const repo = makeMemoryRepo([createProduct({ name: 'A', qty: 1, price: 10 })]);
  const remove = makeRemoveProductFromCart({ cartRepository: repo });
  remove(repo.getAll()[0].id);
  console.assert(repo.getAll().length === 0);
});

test('CalculateCartTotal: devuelve Cart con total', () => {
  const repo = makeMemoryRepo([
    createProduct({ name: 'A', qty: 2, price: 100 }),
    createProduct({ name: 'B', qty: 1, price: 50 })
  ]);
  const calc = makeCalculateCartTotal({ cartRepository: repo });
  const cart = calc();
  console.assert(cart.total === 250);
});

// ---------- REPORTE ----------
const ul = document.getElementById('results');
const pass = results.filter(r => r.ok).length;
const fail = results.length - pass;

for (const r of results) {
  const li = document.createElement('li');
  li.className = r.ok ? 'pass' : 'fail';
  li.textContent = (r.ok ? '✓ ' : '✗ ') + r.name + (r.err ? ' — ' + r.err : '');
  ul.appendChild(li);
}

const summary = document.createElement('li');
summary.className = fail === 0 ? 'pass' : 'fail';
summary.textContent = `Total: ${pass}/${results.length} OK` + (fail ? ` — ${fail} FALLAN` : '');
ul.appendChild(summary);

console.log(`[harness] ${pass}/${results.length} tests OK${fail ? `, ${fail} FAIL` : ''}`);
if (fail > 0) {
  console.error('Hay pruebas fallidas. Revisa la lista en pantalla.');
}