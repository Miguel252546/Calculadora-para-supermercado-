// src/interface_adapters/presenters/HistoryPresenter.js
// Pinta el HTML del historial a partir de las invoices.
// Devuelve { html, countText } por simetría con los demás presenters.

import { formatCurrency } from '../../shared/money.js';
import { escapeHtml } from '../../frameworks/ui/DomBinder.js';

export const HistoryPresenter = {
  toViewModel(invoices) {
    return {
      invoices,
      total: invoices.length,
      totalAmount: invoices.reduce((s, i) => s + (i.total || 0), 0)
    };
  },

  renderListHtml(invoices) {
    const total = invoices.length;
    const countText = total > 0
      ? `${total} compra${total !== 1 ? 's' : ''}`
      : '0 compras';

    if (total === 0) {
      return {
        html: `<div class="empty-state">No hay compras registradas en el historial.<br>Emite una factura y aparecerá aquí.</div>`,
        countText
      };
    }

    const html = invoices.map((inv) => `
      <article class="history-card" data-id="${escapeHtml(inv.id)}">
        <div class="history-info">
          <span class="history-id">#${escapeHtml(inv.invoiceNo || inv.id)} · ${escapeHtml(inv.clientName || 'Consumidor Final')}</span>
          <span class="history-date">${escapeHtml(inv.date)} · ${inv.itemCount} producto${inv.itemCount === 1 ? '' : 's'}</span>
        </div>
        <div class="history-amount">${formatCurrency(inv.total || 0)}</div>
        <div class="history-btns">
          <button type="button" class="btn-history-action" data-action="print" data-id="${escapeHtml(inv.id)}" title="Reimprimir">🖨️</button>
          <button type="button" class="btn-history-action is-danger" data-action="delete" data-id="${escapeHtml(inv.id)}" title="Eliminar">🗑️</button>
        </div>
      </article>
    `).join('');

    return { html, countText };
  }
};
