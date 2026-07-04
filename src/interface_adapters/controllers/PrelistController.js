// src/interface_adapters/controllers/PrelistController.js
// Maneja los eventos del panel de lista previa: toggle, búsqueda, filtros, CRUD.
// Trabaja con los IDs del nuevo HTML (prelist-*) y mantiene el estado entre
// aperturas del panel (no lo destruye al abrir/cerrar).

import { $, on, qsa, showToast } from '../../frameworks/ui/DomBinder.js';
import { PrelistPresenter } from '../presenters/PrelistPresenter.js';

/**
 * @param {{
 *   managePrelist: import('../../usecases/ManagePrelist.js').ManagePrelist,
 *   settingsRepository: import('../../usecases/ports.js').SettingsRepositoryPort,
 *   selectPrelistItem: Function
 * }} deps
 */
export function makePrelistController({ managePrelist, settingsRepository, selectPrelistItem }) {
  // Estado persistente entre aperturas
  let currentSearch = '';
  let sortMode = 'most_used';
  let editingId = null;
  let isOpen = false;
  let onChange = () => {};

  function getHabits() {
    return settingsRepository?.getHabits?.() || { productCounts: {}, lastUsed: {} };
  }

  function filterAndSort() {
    let items = managePrelist.list();
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      items = items.filter((it) =>
        it.name.toLowerCase().includes(q) ||
        (it.category && it.category.toLowerCase().includes(q)) ||
        (it.brand && it.brand.toLowerCase().includes(q))
      );
    }
    sortItems(items);
    return items;
  }

  function sortItems(items) {
    const habits = getHabits();
    if (sortMode === 'most_used') {
      items.sort((a, b) => {
        const aC = habits.productCounts[a.name.toLowerCase()] || 0;
        const bC = habits.productCounts[b.name.toLowerCase()] || 0;
        return (bC - aC) || a.name.localeCompare(b.name);
      });
    } else if (sortMode === 'recent') {
      items.sort((a, b) => {
        const aT = habits.lastUsed[a.name.toLowerCase()] || '';
        const bT = habits.lastUsed[b.name.toLowerCase()] || '';
        return (bT || '').localeCompare(aT || '') || a.name.localeCompare(b.name);
      });
    } else {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  function render() {
    const items = filterAndSort();
    const habits = getHabits();
    const vm = PrelistPresenter.toViewModel(items, habits);

    // Grid
    const grid = $('prelist-grid');
    if (grid) grid.innerHTML = PrelistPresenter.renderItemsHtml(vm.items);

    // Contadores
    const count = $('prelist-results-count');
    if (count) {
      count.textContent = items.length > 0
        ? `${items.length} resultado${items.length === 1 ? '' : 's'}`
        : '0 resultados';
    }
    const badge = $('prelist-count-badge');
    if (badge) badge.textContent = String(managePrelist.list().length);

    // Habilitar/deshabilitar botón de vaciar lista
    const clearBtn = $('btn-prelist-clear');
    if (clearBtn) {
      const total = managePrelist.list().length;
      if (total === 0) clearBtn.setAttribute('disabled', '');
      else clearBtn.removeAttribute('disabled');
    }

    // Datalist de categorías (sigue disponible para autocompletar al
    // crear/editar un producto, aunque ya no se muestren filtros).
    const cats = managePrelist.categories();
    const datalist = $('prelist-category-list');
    if (datalist) datalist.innerHTML = PrelistPresenter.renderCategoryDatalistHtml(cats);

    // Orden
    const sortEl = $('prelist-sort');
    if (sortEl) sortEl.innerHTML = PrelistPresenter.renderSortHtml(sortMode);

    // Form en edición: marcar visualmente la card correspondiente
    qsa('.prelist-card, .template-item', grid).forEach((el) => {
      if (el.dataset.id && el.dataset.id === editingId) el.classList.add('is-editing');
    });
  }

  function showForm(item) {
    const section = $('prelist-form-section');
    if (section) section.removeAttribute('hidden');
    if (item) {
      editingId = item.id;
      $('prelist-category').value = item.category || '';
      $('prelist-name').value = item.name || '';
      $('prelist-qty').value = item.qty || 1;
      $('prelist-brand').value = item.brand || '';
    } else {
      editingId = null;
      $('prelist-category').value = '';
      $('prelist-name').value = '';
      $('prelist-qty').value = 1;
      $('prelist-brand').value = '';
    }
    setTimeout(() => $('prelist-name')?.focus(), 30);
    render();
  }

  function hideForm() {
    const section = $('prelist-form-section');
    if (section) section.setAttribute('hidden', '');
    editingId = null;
    render();
  }

  function togglePanel(forceState) {
    const panel = $('prelist-panel');
    const btn = $('prelist-toggle');
    if (!panel || !btn) return;
    const next = typeof forceState === 'boolean' ? forceState : !isOpen;
    isOpen = next;
    if (isOpen) {
      panel.removeAttribute('hidden');
      panel.setAttribute('aria-hidden', 'false');
      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      render();
      setTimeout(() => $('prelist-search')?.focus(), 80);
    } else {
      panel.setAttribute('hidden', '');
      panel.setAttribute('aria-hidden', 'true');
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  function saveForm() {
    const category = $('prelist-category').value.trim();
    const name = $('prelist-name').value.trim();
    const qty = parseInt($('prelist-qty').value, 10) || 1;
    const brand = $('prelist-brand').value.trim();
    if (!category || !name) { showToast('Categoría y nombre son requeridos.', 'error'); return; }
    if (qty < 1) { showToast('La cantidad debe ser al menos 1.', 'error'); return; }
    try {
      if (editingId) {
        managePrelist.update(editingId, { category, name, qty, brand });
        showToast('Producto actualizado en la lista previa.');
      } else {
        managePrelist.add({ category, name, qty, brand });
        showToast('Producto añadido a la lista previa.');
      }
      hideForm();
      onChange();
    } catch (err) {
      showToast(err.message || 'No se pudo guardar', 'error');
    }
  }

  function attach() {
    // Toggle del panel
    on($('prelist-toggle'), 'click', () => togglePanel());

    // Buscador (no destructivo: no resetea al abrir)
    on($('prelist-search'), 'input', (e) => {
      currentSearch = e.target.value;
      render();
    });

    // Orden
    on($('prelist-sort'), 'click', (e) => {
      const btn = e.target.closest('.sort-btn');
      if (!btn) return;
      sortMode = btn.dataset.sort;
      render();
    });

    // Vaciar lista
    on($('btn-prelist-clear'), 'click', () => {
      const total = managePrelist.list().length;
      if (total === 0) return;
      if (!confirm(`¿Vaciar los ${total} producto(s) de tu lista previa? Esta acción no se puede deshacer.`)) return;
      try {
        managePrelist.clear();
        showToast('Lista previa vaciada.', 'warning');
        editingId = null;
        hideForm();
        render();
        onChange();
      } catch (err) {
        showToast(err.message || 'No se pudo vaciar la lista', 'error');
      }
    });

    // Grid: editar / eliminar / seleccionar
    on($('prelist-grid'), 'click', (e) => {
      const card = e.target.closest('.prelist-card, .template-item');
      if (!card) return;
      const id = card.dataset.id;
      const item = managePrelist.list().find((p) => p.id === id);
      if (!item) return;

      const editBtn = e.target.closest('.btn-item-edit');
      if (editBtn) { showForm(item); return; }

      const delBtn = e.target.closest('.prelist-icon-btn--danger, .btn-item-delete');
      if (delBtn) {
        if (confirm(`¿Eliminar "${item.name}" de tu lista previa?`)) {
          managePrelist.remove(item.id);
          showToast(`"${item.name}" eliminado de la lista previa.`, 'warning');
          render();
          onChange();
        }
        return;
      }

      // Click en la card → cargar al formulario del producto actual
      $('product-name').value = item.name;
      $('product-qty').value = item.qty;
      $('product-price').value = '';
      $('product-price').focus();
      try { selectPrelistItem(item); } catch (err) { console.warn('selectPrelistItem', err); }
      togglePanel(false);
      onChange();
    });

    // Botones del form
    on($('btn-prelist-add'), 'click', () => showForm(null));
    on($('btn-prelist-save'), 'click', (e) => { e.preventDefault(); saveForm(); });
    on($('btn-prelist-cancel'), 'click', hideForm);

    // Enviar form con Enter
    on($('prelist-form'), 'submit', (e) => { e.preventDefault(); saveForm(); });
  }

  return {
    attach,
    subscribe(fn) { onChange = fn; },
    render,
    seedDefaultsIfEmpty(seeder) {
      if (managePrelist.list().length === 0) seeder();
    }
  };
}
