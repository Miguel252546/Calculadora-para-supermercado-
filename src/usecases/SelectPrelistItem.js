// src/usecases/SelectPrelistItem.js
// Caso de uso: cuando el usuario elige un item de la prelista para añadir al carrito.

import { createProduct } from '../domain/entities/Product.js';

/**
 * @param {{
 *   cartRepository: import('./ports.js').CartRepositoryPort,
 *   settingsRepository: import('./ports.js').SettingsRepositoryPort
 * }} deps
 */
export function makeSelectPrelistItem({ cartRepository, settingsRepository }) {
  return function selectPrelistItem(prelistItem) {
    const product = createProduct({
      name: prelistItem.name,
      qty: prelistItem.qty,
      price: 0,
      imageDataUrl: null
    });
    const current = cartRepository.getAll();
    const idx = current.findIndex(p => p.name.toLowerCase() === product.name.toLowerCase());
    let next;
    if (idx >= 0) {
      const merged = createProduct({
        ...current[idx],
        qty: current[idx].qty + product.qty,
        price: product.price || current[idx].price
      });
      next = current.slice();
      next[idx] = merged;
    } else {
      next = [...current, product];
    }
    cartRepository.save(next);
    // Track usage (hábitos).
    if (settingsRepository?.getHabits && settingsRepository?.setHabits) {
      const habits = settingsRepository.getHabits();
      const key = product.name.toLowerCase();
      habits.productCounts = { ...habits.productCounts, [key]: (habits.productCounts[key] || 0) + 1 };
      habits.categoryCounts = { ...habits.categoryCounts, [prelistItem.category.toLowerCase()]: (habits.categoryCounts[prelistItem.category.toLowerCase()] || 0) + 1 };
      habits.lastUsed = { ...habits.lastUsed, [key]: new Date().toISOString() };
      settingsRepository.setHabits(habits);
    }
    return product;
  };
}