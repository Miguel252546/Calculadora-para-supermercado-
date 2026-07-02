// src/interface_adapters/controllers/PendingController.js
// Maneja los eventos de pendientes: alta rápida, completar (con precio)
// y eliminación. Trabaja contra `PendingPresenter` que pinta el HTML.

import { $, on } from '../../frameworks/ui/DomBinder.js';
import { PendingPresenter } from '../presenters/PendingPresenter.js';

/**
 * @param {{
 *   managePending: import('../../usecases/ManagePending.js').ManagePending,
 *   completePendingProduct: Function
 * }} deps
 */
export function makePendingController({ managePending, completePendingProduct }) {
  let onChange = () => {};
  let completingId = null;

  function render() {
    const items = managePending.list();
    const out = PendingPresenter.renderListHtml(items, completingId);
    $('pending-list').innerHTML = out.html;
    const countEl = $('pending-count');
    if (countEl) countEl.textContent = out.countText;
    if (completingId) {
      setTimeout(() => {
        $('pending-list')?.querySelector('.pending-complete-qty')?.focus();
      }, 50);
    }
  }

  function attach() {
    on($('pending-form'), 'submit', (e) => {
      e.preventDefault();
      const name = $('pending-name').value.trim();
      const qty = parseInt($('pending-qty').value, 10) || 1;
      if (!name || qty < 1) {
        alert('Ingresa un nombre válido y cantidad al menos 1.');
        return;
      }
      try {
        managePending.add({ name, qty });
        $('pending-form').reset();
        $('pending-qty').value = 1;
        $('pending-name').focus();
        render();
        onChange();
      } catch (err) {
        alert(err.message || 'No se pudo agregar el pendiente');
      }
    });

    on($('pending-list'), 'click', (e) => {
      const completeBtn = e.target.closest('.btn-pending-complete');
      if (completeBtn) {
        completingId = completeBtn.dataset.id;
        render();
        return;
      }

      const confirmBtn = e.target.closest('.btn-pending-confirm');
      if (confirmBtn) {
        const id = confirmBtn.dataset.id;
        const card = confirmBtn.closest('.pending-card');
        const qty   = parseInt(card.querySelector('.pending-complete-qty').value, 10);
        const price = parseFloat(card.querySelector('.pending-complete-price').value);
        if (!Number.isFinite(qty) || qty < 1 || !Number.isFinite(price) || price < 0) {
          alert('Ingresa una cantidad (≥ 1) y precio (≥ 0) válidos.');
          return;
        }
        try {
          completePendingProduct(id, qty, price, null);
          completingId = null;
          render();
          onChange();
        } catch (err) {
          alert(err.message || 'No se pudo completar el pendiente');
        }
        return;
      }

      const cancelBtn = e.target.closest('.btn-pending-cancel-complete');
      if (cancelBtn) {
        completingId = null;
        render();
        return;
      }

      const delBtn = e.target.closest('.btn-pending-delete');
      if (delBtn) {
        const id = delBtn.dataset.id;
        const item = managePending.list().find((p) => p.id === id);
        if (item && confirm(`¿Eliminar "${item.name}" de pendientes?`)) {
          managePending.remove(id);
          render();
          onChange();
        }
      }
    });

    // Atajos de teclado en el form inline
    on($('pending-list'), 'keydown', (e) => {
      if (e.key !== 'Enter') return;
      const qtyInput = e.target.closest('.pending-complete-qty');
      const priceInput = e.target.closest('.pending-complete-price');
      if (qtyInput) {
        e.preventDefault();
        const priceEl = qtyInput.closest('.pending-card')?.querySelector('.pending-complete-price');
        if (priceEl) priceEl.focus();
        return;
      }
      if (priceInput) {
        e.preventDefault();
        const confirmBtn = priceInput.closest('.pending-card')?.querySelector('.btn-pending-confirm');
        if (confirmBtn) confirmBtn.click();
      }
    });
  }

  return {
    attach,
    render,
    subscribe(fn) { onChange = fn; }
  };
}
