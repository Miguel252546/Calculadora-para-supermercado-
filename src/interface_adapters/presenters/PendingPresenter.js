// src/interface_adapters/presenters/PendingPresenter.js

import { escapeHtml } from '../../frameworks/ui/DomBinder.js';

export const PendingPresenter = {
  toViewModel(items) {
    return { items, total: items.length };
  },

  renderListHtml(items, completingId) {
    const total = items.length;
    const countText = total > 0
      ? `${total} pendiente${total !== 1 ? 's' : ''}`
      : '';

    if (total === 0) {
      return { html: `<div class="pending-empty">No hay productos pendientes.</div>`, countText };
    }

    const html = items.map(p => {
      const isCompleting = completingId === p.id;
      if (isCompleting) {
        return `
          <div class="pending-card pending-card-completing">
            <div class="pending-card-main">
              <div class="pending-info">
                <span class="pending-name">${escapeHtml(p.name)}</span>
                <span class="pending-qty-label">${p.qty} ud.</span>
              </div>
            </div>
            <div class="pending-complete-form">
              <input type="number" class="modern-input pending-complete-qty" placeholder="Cant" min="1" value="${p.qty}" step="1">
              <input type="number" class="modern-input pending-complete-price" placeholder="Precio unit." min="0" step="0.01">
              <button class="btn-pending-confirm" data-id="${escapeHtml(p.id)}">✓</button>
              <button class="btn-pending-cancel-complete">✕</button>
            </div>
          </div>`;
      }
      return `
        <div class="pending-card">
          <div class="pending-card-main">
            <div class="pending-info">
              <span class="pending-name">${escapeHtml(p.name)}</span>
              <span class="pending-qty-label">${p.qty} ud.</span>
            </div>
            <span class="pending-badge">⏳ Pendiente</span>
          </div>
          <div class="pending-actions">
            <button class="btn-pending-complete" data-id="${escapeHtml(p.id)}">✓ Completar</button>
            <button class="btn-pending-delete" data-id="${escapeHtml(p.id)}" aria-label="Eliminar pendiente">🗑️</button>
          </div>
        </div>`;
    }).join('');

    return { html, countText };
  }
};