// src/domain/entities/Product.js
// Entidad Product: representa una línea del carrito.
// Inmutable; las mutaciones generan nuevas instancias.

import { ValidationError } from '../errors.js';
import { newId } from '../../shared/id.js';

/**
 * Crea una entidad Product validada.
 * @param {{ id?: string, name: string, qty: number|string, price: number|string, imageDataUrl?: string|null }} input
 * @returns {Readonly<Product>}
 */
export function createProduct(input) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('product', 'entrada inválida');
  }
  const name = String(input.name ?? '').trim();
  if (!name) throw new ValidationError('name', 'requerido');

  const qty = Number(input.qty);
  if (!Number.isFinite(qty) || qty < 1) throw new ValidationError('qty', 'debe ser >= 1');

  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) throw new ValidationError('price', 'debe ser >= 0');

  return Object.freeze({
    id: input.id ?? newId(),
    name,
    qty,
    price,
    imageDataUrl: input.imageDataUrl ?? null
  });
}

/**
 * Subtotal de un producto (qty * price).
 * @param {Product} product
 * @returns {number}
 */
export function lineSubtotal(product) {
  return Number(product.qty) * Number(product.price);
}