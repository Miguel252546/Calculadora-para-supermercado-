// src/interface_adapters/presenters/CartPresenter.js
// Transforma productos del dominio a modelo de vista (HTML strings listos para inyectar).

import { lineSubtotal } from '../../domain/entities/Product.js';
import { formatCurrency } from '../../shared/money.js';
import { escapeHtml } from '../../frameworks/ui/DomBinder.js';

export const CartPresenter = {
  toViewModel(products) {
    const total = products.reduce((acc, p) => acc + lineSubtotal(p), 0);
    return {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        qty: p.qty,
        price: formatCurrency(p.price),
        subtotal: formatCurrency(lineSubtotal(p)),
        imageDataUrl: p.imageDataUrl ?? null
      })),
      total: formatCurrency(total),
      totalRaw: total,
      count: products.length,
      itemCount: products.reduce((acc, p) => acc + Number(p.qty || 0), 0),
      empty: products.length === 0
    };
  },

  renderListHtml(vm) {
    if (vm.empty) {
      return `<div style="text-align:center;color:var(--text-muted);font-style:italic;padding:2rem 0;font-size:0.9rem;">
        Tu carrito está vacío. <br>¡Empieza a agregar productos!
      </div>`;
    }
    return vm.products.map((p, i) => {
      const thumb = p.imageDataUrl
        ? `<img src="${escapeHtml(p.imageDataUrl)}" class="cart-thumb" alt="${escapeHtml(p.name)}">`
        : '';
      return `
        <div class="product-card" data-id="${escapeHtml(p.id)}" data-index="${i}">
          <div class="product-info">
            ${thumb}
            <div class="product-info-text">
              <span class="product-name">${escapeHtml(p.name)}</span>
              <span class="product-meta">${p.qty} ud. &bull; ${p.price} c/u</span>
            </div>
          </div>
          <div class="product-actions">
            <div class="product-total">
              <span class="subtotal-label">Subtotal</span>
              <span class="subtotal-value">${p.subtotal}</span>
            </div>
            <button class="btn-delete" data-action="remove" data-id="${escapeHtml(p.id)}" title="Eliminar" aria-label="Eliminar producto">&times;</button>
          </div>
        </div>`;
    }).join('');
  }
};