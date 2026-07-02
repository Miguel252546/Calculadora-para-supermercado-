// src/interface_adapters/presenters/PrelistPresenter.js
// Genera HTML para el panel de lista previa usando los IDs y clases del
// nuevo HTML (`prelist-*`). Mantiene compatibilidad con `.template-item`
// como nombre semántico de cada card.

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
      const brandText = item.brand
        ? `<span class="prelist-card-brand">${escapeHtml(item.brand)}</span>`
        : '';
      return `
        <div class="prelist-card template-item" data-id="${escapeHtml(item.id)}" role="listitem">
          <div class="prelist-card-main template-item-main">
            <span class="prelist-card-name item-name">${escapeHtml(item.name)} ${freqBadge}</span>
            <span class="prelist-card-meta item-qty">
              <span class="prelist-card-tag">${escapeHtml(item.category)}</span>
              ${brandText}
              <span>× ${item.qty}</span>
            </span>
          </div>
          <div class="prelist-card-actions template-item-actions">
            <button type="button" class="prelist-icon-btn btn-item-edit" title="Editar" aria-label="Editar producto">✎</button>
            <button type="button" class="prelist-icon-btn prelist-icon-btn--danger btn-item-delete" title="Eliminar" aria-label="Eliminar producto">×</button>
          </div>
        </div>`;
    }).join('');
  },

  renderCategoriesHtml(categories, activeCategory) {
    const all = ['Todas', ...categories];
    return all.map((c) => {
      const isActive = c === activeCategory;
      return `<button type="button" class="chip-btn ${isActive ? 'is-active' : ''}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`;
    }).join('');
  },

  renderBrandsHtml(brands, activeBrand) {
    if (!brands || brands.length === 0) return '';
    const all = ['Todas', ...brands];
    return all.map((b) => {
      const isActive = b === activeBrand;
      const cls = b === 'Todas' ? 'chip-btn' : 'chip-btn chip-btn--brand';
      return `<button type="button" class="${cls} ${isActive ? 'is-active' : ''}" data-brand="${escapeHtml(b)}">${escapeHtml(b)}</button>`;
    }).join('');
  },

  renderSortHtml(currentSort) {
    return SORT_MODES.map((m) => {
      const isActive = m.key === currentSort;
      return `<button type="button" class="sort-btn ${isActive ? 'is-active' : ''}" data-sort="${m.key}">${m.label}</button>`;
    }).join('');
  },

  renderCategoryDatalistHtml(categories) {
    return categories.map((c) => `<option value="${escapeHtml(c)}">`).join('');
  }
};
