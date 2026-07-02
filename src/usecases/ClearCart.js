// src/usecases/ClearCart.js
// Caso de uso: vaciar el carrito actual.

/**
 * @param {{ cartRepository: import('./ports.js').CartRepositoryPort }} deps
 */
export function makeClearCart({ cartRepository }) {
  return function clearCart() {
    cartRepository.clear();
    return [];
  };
}