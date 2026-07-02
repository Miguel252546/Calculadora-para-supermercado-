// src/usecases/ManagePending.js
// Caso de uso: alta/baja de productos pendientes.

import { createPendingItem } from '../domain/entities/PendingItem.js';

/**
 * @param {{ pendingRepository: import('./ports.js').PendingRepositoryPort }} deps
 */
export function makeManagePending({ pendingRepository }) {
  return {
    list: () => pendingRepository.getAll(),

    add(input) {
      const item = createPendingItem(input);
      pendingRepository.upsert(item);
      return item;
    },

    remove(id) {
      pendingRepository.remove(id);
    },

    clear() {
      pendingRepository.clear();
    }
  };
}