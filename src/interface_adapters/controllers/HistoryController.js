// src/interface_adapters/controllers/HistoryController.js
// Maneja los eventos del historial: reimprimir, eliminar individual y borrar todo.
// El nombre de la tienda es persistente (settings repository).

import { $, on } from '../../frameworks/ui/DomBinder.js';
import { HistoryPresenter } from '../presenters/HistoryPresenter.js';

/**
 * @param {{
 *   manageHistory: import('../../usecases/ManageHistory.js').ManageHistory,
 *   printService: { printInvoice(invoice): void },
 *   settingsRepository: import('../../usecases/ports.js').SettingsRepositoryPort
 * }} deps
 */
export function makeHistoryController({ manageHistory, printService, settingsRepository }) {
  let onChange = () => {};
  function render() {
    const list = manageHistory.list();
    const out = HistoryPresenter.renderListHtml(list);
    const container = $('history-list');
    if (container) container.innerHTML = out.html;
  }

  function attach() {
    on($('btn-clear-history'), 'click', () => {
      if (manageHistory.list().length === 0) return;
      if (!confirm('¿Deseas borrar TODO el historial de compras?')) return;
      try {
        manageHistory.clear();
        render();
        onChange();
      } catch (err) {
        alert(err.message || 'No se pudo borrar el historial');
      }
    });

    on($('history-list'), 'click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'delete') {
        if (confirm('¿Eliminar esta compra del historial?')) {
          try {
            manageHistory.remove(id);
            render();
            onChange();
          } catch (err) { alert(err.message || 'No se pudo eliminar'); }
        }
      } else if (action === 'print') {
        const inv = manageHistory.list().find((i) => i.id === id);
        if (inv) {
          try { printService.printInvoice(inv); }
          catch (err) { alert(err.message || 'No se pudo reimprimir'); }
        }
      }
    });

    // Nombre de tienda persistente.
    const storeInput = $('store-name-input');
    if (storeInput) {
      storeInput.value = settingsRepository.getStoreName() || '';
      on(storeInput, 'input', (e) => {
        settingsRepository.setStoreName(e.target.value || 'SuperCalc Premium');
      });
    }
  }

  return {
    attach,
    render,
    subscribe(fn) { onChange = fn; }
  };
}
