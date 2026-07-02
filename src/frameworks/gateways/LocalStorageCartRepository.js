// src/frameworks/gateways/LocalStorageCartRepository.js
// Implementación del puerto CartRepositoryPort sobre localStorage.

import { CartMapper } from '../mappers/CartMapper.js';

/**
 * @param {Storage} [storage] - por defecto localStorage (inyectable para tests)
 */
export function makeLocalStorageCartRepository(storage = globalThis.localStorage) {
  const KEY = 'supercalc_products';
  return {
    getAll() {
      try {
        const raw = storage.getItem(KEY);
        return CartMapper.toDomain(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.warn('LS cart corrupto, se ignora:', e);
        return [];
      }
    },
    save(products) {
      storage.setItem(KEY, JSON.stringify(CartMapper.toJSON(products)));
    },
    clear() {
      storage.removeItem(KEY);
    }
  };
}