// src/usecases/ManagePrelist.js
// Caso de uso: alta/baja/modificación de la lista previa.

import { createPrelistItem } from '../domain/entities/PrelistItem.js';

/**
 * @param {{ prelistRepository: import('./ports.js').PrelistRepositoryPort }} deps
 */
export function makeManagePrelist({ prelistRepository }) {
  return {
    list: () => prelistRepository.getAll(),

    add(input) {
      const item = createPrelistItem(input);
      prelistRepository.upsert(item);
      return item;
    },

    update(id, patch) {
      const current = prelistRepository.getAll().find(p => p.id === id);
      if (!current) return null;
      const updated = createPrelistItem({ ...current, ...patch, id });
      prelistRepository.upsert(updated);
      return updated;
    },

    remove(id) {
      prelistRepository.remove(id);
    },

    clear() {
      prelistRepository.clear();
    },

    /** Devuelve categorías únicas ordenadas. */
    categories() {
      const set = new Set(prelistRepository.getAll().map(p => p.category));
      return [...set].sort();
    },

    /** Devuelve marcas únicas (no vacías) ordenadas. */
    brands() {
      const set = new Set(
        prelistRepository.getAll()
          .map(p => (p.brand || '').trim())
          .filter(Boolean)
      );
      return [...set].sort();
    }
  };
}