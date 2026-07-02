// src/domain/entities/PendingItem.js
// Entidad PendingItem: producto pendiente de completar.
// Inmutable.

import { ValidationError } from '../errors.js';
import { newId } from '../../shared/id.js';

export function createPendingItem(input) {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('pendingItem', 'entrada inválida');
  }
  const name = String(input.name ?? '').trim();
  if (!name) throw new ValidationError('name', 'requerido');

  const qty = Number(input.qty ?? 1);
  if (!Number.isFinite(qty) || qty < 1) throw new ValidationError('qty', '>= 1');

  return Object.freeze({
    id: input.id ?? newId(),
    name,
    qty,
    createdAt: input.createdAt ?? new Date().toISOString()
  });
}