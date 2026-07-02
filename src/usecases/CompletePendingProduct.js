// src/usecases/CompletePendingProduct.js
// Caso de uso: convertir un PendingItem en línea de carrito (con precio).

import { createProduct } from '../domain/entities/Product.js';

/**
 * @param {{
 *   cartRepository: import('./ports.js').CartRepositoryPort,
 *   pendingRepository: import('./ports.js').PendingRepositoryPort
 * }} deps
 */
export function makeCompletePendingProduct({ cartRepository, pendingRepository }) {
  return function completePendingProduct(id, qty, price, imageDataUrl = null) {
    const pending = pendingRepository.getAll().find(p => p.id === id);
    if (!pending) return { cart: cartRepository.getAll(), removedPending: null };

    // Construimos el Product a partir del pendiente + precio del usuario.
    const product = createProduct({
      name: pending.name,
      qty: qty ?? pending.qty,
      price: price ?? 0,
      imageDataUrl
    });

    const current = cartRepository.getAll();
    const idx = current.findIndex(p => p.name.toLowerCase() === product.name.toLowerCase());
    let next;
    if (idx >= 0) {
      const merged = createProduct({
        ...current[idx],
        qty: current[idx].qty + product.qty,
        price: product.price || current[idx].price,
        imageDataUrl: product.imageDataUrl ?? current[idx].imageDataUrl ?? null
      });
      next = current.slice();
      next[idx] = merged;
    } else {
      next = [...current, product];
    }
    cartRepository.save(next);

    // Quitamos el pendiente.
    const nextPending = pendingRepository.getAll().filter(p => p.id !== id);
    pendingRepository.clear();
    nextPending.forEach(p => pendingRepository.upsert(p));

    return { cart: next, removedPending: pending };
  };
}