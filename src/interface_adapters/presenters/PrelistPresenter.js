// src/interface_adapters/presenters/PrelistPresenter.js
// Genera HTML para el panel de lista previa.
// Las marcas y categorías ya NO se exponen como filtros visuales ni como
// chips dentro de cada card: la UI es ahora minimal y enfocada en el
// producto. Los datos category/brand siguen en el modelo y se usan sólo
// en el buscador (match por texto) y en el datalist de autocompletar al
// crear/editar un producto.

import { escapeHtml } from '../../frameworks/ui/DomBinder.js';

const SORT_MODES = [
  { key: 'most_used', label: '🔥 Más usados' },
  { key: 'recent',    label: '🕐 Recientes' },
  { key: 'name',      label: 'A-Z' }
];

export const PrelistPresenter = {
  toViewModel(items, habits) {
    const productCounts = habits?.productCounts || {};
    return {
      items: items.map((it) => ({
        ...it,
        count: productCounts[it.name.toLowerCase()] || 0
      }))
    };
  },

  renderItemsHtml(items) {
    if (items.length === 0) {
      return `<div class="prelist-empty">No hay productos en la lista previa.<br>¡Añade uno nuevo!</div>`;
    }
    return items.map((item) => {
      const freqBadge = item.count > 0
        ? `<span class="prelist-card-freq" title="Usado ${item.count} vez${item.count === 1 ? '' : 'es'}">${item.count > 9 ? '9+' : item.count}</span>`
        : '';
      return `
        <div class="prelist-card template-item" data-id="${escapeHtml(item.id)}" role="listitem">
          <div class="prelist-card-main template-item-main">
            <span class="prelist-card-name item-name">${escapeHtml(item.name)} ${freqBadge}</span>
          </div>
          <div class="prelist-card-side">
            <span class="prelist-card-qty" aria-label="Cantidad por defecto">× ${item.qty}</span>
            <div class="prelist-card-actions template-item-actions">
              <button type="button" class="prelist-icon-btn btn-item-edit" title="Editar" aria-label="Editar producto">✎</button>
              <button type="button" class="prelist-icon-btn prelist-icon-btn--danger btn-item-delete" title="Eliminar" aria-label="Eliminar producto">×</button>
            </div>
          </div>
        </div>`;
    }).join('');
  },

  // Mantenido sólo para uso interno (autocompletar al crear/editar un
  // producto). Ya no se renderiza como filtro visible en el panel.
  renderCategoryDatalistHtml(categories) {
    return categories.map((c) => `<option value="${escapeHtml(c)}">`).join('');
  },

  renderSortHtml(currentSort) {
    return SORT_MODES.map((m) => {
      const isActive = m.key === currentSort;
      return `<button type="button" class="sort-btn ${isActive ? 'is-active' : ''}" data-sort="${m.key}">${m.label}</button>`;
    }).join('');
  }
};
