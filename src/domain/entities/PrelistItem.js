// src/domain/entities/PrelistItem.js
// Entidad PrelistItem: producto de la lista previa.
// Inmutable.

import { ValidationError } from '../errors.js';
import { newId } from '../../shared/id.js';

export function createPrelistItem(input) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('prelistItem', 'entrada inválida');
  }
  const name = String(input.name ?? '').trim();
  if (!name) throw new ValidationError('name', 'requerido');

  const category = String(input.category ?? 'General').trim() || 'General';
  const brand = String(input.brand ?? '').trim();

  const qty = Number(input.qty ?? 1);
  if (!Number.isFinite(qty) || qty < 1) throw new ValidationError('qty', '>= 1');

  return Object.freeze({
    id: input.id ?? newId(),
    name,
    qty,
    category,
    brand
  });
}