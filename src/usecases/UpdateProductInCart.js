// src/usecases/UpdateProductInCart.js
// Caso de uso: actualizar qty/price/imagen de un producto del carrito.

import { createProduct } from '../domain/entities/Product.js';

/**
 * @param {{ cartRepository: import('./ports.js').CartRepositoryPort }} deps
 */
export function makeUpdateProductInCart({ cartRepository }) {
  return function updateProductInCart(id, patch) {
    const current = cartRepository.getAll();
    const idx = current.findIndex(p => p.id === id);
    if (idx === -1) return current;
    const updated = createProduct({ ...current[idx], ...patch, id });
    const next = current.slice();
    next[idx] = updated;
    cartRepository.save(next);
    return next;
  };
}