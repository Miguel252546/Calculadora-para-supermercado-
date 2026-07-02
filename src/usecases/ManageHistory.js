// src/usecases/ManageHistory.js
// Caso de uso: operaciones sobre el historial de facturas.

/**
 * @param {{ historyRepository: import('./ports.js').HistoryRepositoryPort }} deps
 */
export function makeManageHistory({ historyRepository }) {
  return {
    list: () => historyRepository.getAll(),

    remove(id) {
      // El gateway puede implementar `remove` o no. Si no existe,
      // hacemos la operación manualmente con la API disponible.
      if (typeof historyRepository.remove === 'function') {
        historyRepository.remove(id);
        return;
      }
      const list = historyRepository.getAll().filter((i) => i.id !== id);
      historyRepository.clear();
      list.forEach((i) => historyRepository.save(i));
    },

    clear: () => historyRepository.clear()
  };
}
