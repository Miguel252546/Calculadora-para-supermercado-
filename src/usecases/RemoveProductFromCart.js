// src/usecases/RemoveProductFromCart.js
// Caso de uso: eliminar un producto del carrito por id.

/**
 * @param {{ cartRepository: import('./ports.js').CartRepositoryPort }} deps
 */
export function makeRemoveProductFromCart({ cartRepository }) {
  return function removeProductFromCart(id) {
    const next = cartRepository.getAll().filter(p => p.id !== id);
    cartRepository.save(next);
    return next;
  };
}