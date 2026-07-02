// src/usecases/CalculateCartTotal.js
// Caso de uso: leer el carrito y devolver un Cart con total calculado.

import { createCart } from '../domain/entities/Cart.js';

/**
 * @param {{ cartRepository: import('./ports.js').CartRepositoryPort }} deps
 */
export function makeCalculateCartTotal({ cartRepository }) {
  return function calculateCartTotal() {
    return createCart(cartRepository.getAll());
  };
}