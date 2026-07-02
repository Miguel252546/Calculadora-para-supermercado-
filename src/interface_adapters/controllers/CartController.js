// src/interface_adapters/controllers/CartController.js
// Maneja los eventos del formulario de producto + acciones de la lista.

import { $, on, showToast } from '../../frameworks/ui/DomBinder.js';
import { CartPresenter } from '../presenters/CartPresenter.js';

/**
 * @param {{
 *   addProduct: Function,
 *   removeProduct: Function,
 *   updateProduct: Function,
 *   calculateTotal: Function,
 *   clearCart: Function,
 *   generateInvoice: Function,
 *   clearPrelist: Function,
 *   imageInput?: { clear(): void, current(): string|null }
 * }} deps
 */
export function makeCartController({
  addProduct, removeProduct, updateProduct, calculateTotal, clearCart, generateInvoice, clearPrelist, imageInput
}) {
  let onChange = () => {};

  function attach() {
    on($('product-form'), 'submit', (e) => {
      e.preventDefault();
      const name = $('product-name').value.trim();
      const qty = Number($('product-qty').value);
      const price = Number($('product-price').value);
      if (!name) { alert('Ingresa el nombre del producto.'); return; }
      if (!Number.isFinite(qty) || qty <= 0) { alert('La cantidad debe ser al menos 1.'); return; }
      if (!Number.isFinite(price) || price < 0) { alert('El precio debe ser un número ≥ 0.'); return; }

      const imageDataUrl = imageInput?.current?.() ?? null;
      try {
        addProduct({ name, qty, price, imageDataUrl });
        $('product-form').reset();
        $('product-qty').value = 1;
        imageInput?.clear?.();
        $('product-name').focus();
        onChange();
      } catch (err) {
        alert(err.message || 'Error al agregar');
      }
    });

    on($('products-list'), 'click', (e) => {
      const btn = e.target.closest('[data-action="remove"]');
      if (!btn) return;
      const id = btn.dataset.id;
      const card = btn.closest('.product-card');
      if (card) {
        card.classList.add('is-removing');
        setTimeout(() => { removeProduct(id); onChange(); }, 220);
      } else {
        removeProduct(id);
        onChange();
      }
    });

    on($('btn-clear-list'), 'click', () => {
      const cart = calculateTotal();
      if (cart.count === 0) return;
      if (!confirm('¿Deseas vaciar el carrito actual?')) return;
      clearCart();
      onChange();
    });

    on($('btn-generate-pdf'), 'click', () => {
      const cart = calculateTotal();
      if (cart.count === 0) {
        alert('La lista está vacía. Agrega productos para facturar.');
        return;
      }
      try {
        const clientName = $('client-name')?.value.trim() || 'Consumidor Final';
        // Genera la factura, guarda en historial y vacía el carrito.
        // `afterInvoice: 'clear'` está soportado por el usecase.
        const invoice = generateInvoice({
          clientName,
          autoPrint: true,
          afterInvoice: 'clear'
        });
        showToast(`Factura ${invoice.invoiceNo} generada y guardada en el historial.`);
        clearPrelist();
        onChange();
      } catch (err) {
        alert(err.message || 'Error al facturar');
      }
    });
  }

  return {
    attach,
    subscribe(fn) { onChange = fn; },
    render() { onChange(); },
    viewModel() { return CartPresenter.toViewModel(calculateTotal().products); }
  };
}
