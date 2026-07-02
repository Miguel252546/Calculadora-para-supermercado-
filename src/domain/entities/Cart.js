// src/domain/entities/Cart.js
// Entidad Cart: colección de productos + total calculado.
// Inmutable.

import { lineSubtotal } from './Product.js';

/**
 * Crea un Cart con sus productos y total calculado.
 * @param {Product[]} [products]
 */
export function createCart(products = []) {
  const safe = Array.isArray(products) ? products : [];
  return Object.freeze({
    products: Object.freeze(safe.slice()),
    total: safe.reduce((acc, p) => acc + lineSubtotal(p), 0),
    count: safe.length
  });
}

/**
 * Encuentra el índice de un producto por id; -1 si no existe.
 */
export function findIndex(cart, productId) {
  return cart.products.findIndex(p => p.id === productId);
}

/**
 * Devuelve un Cart sin el producto indicado.
 */
export function withoutProduct(cart, productId) {
  return createCart(cart.products.filter(p => p.id !== productId));
}

/**
 * Devuelve un Cart con el producto reemplazado.
 */
export function withProduct(cart, product) {
  const idx = findIndex(cart, product.id);
  if (idx === -1) return createCart([...cart.products, product]);
  const next = cart.products.slice();
  next[idx] = product;
  return createCart(next);
}