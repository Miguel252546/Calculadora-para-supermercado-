// src/usecases/AddProductToCart.js
// Caso de uso: añadir un producto al carrito (valida y suma si existe).

import { createProduct } from '../domain/entities/Product.js';

/**
 * @param {{ cartRepository: import('./ports.js').CartRepositoryPort }} deps
 */
export function makeAddProductToCart({ cartRepository }) {
  return function addProductToCart(input) {
    const product = createProduct(input);
    const current = cartRepository.getAll();
    // Si ya existe un producto con el mismo nombre (case-insensitive), sumar qty.
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
    return product;
  };
}