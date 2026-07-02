// src/domain/entities/Habits.js
// Entidad Habits: tracking de uso de productos/categorías.
// Inmutable (las funciones devuelven nuevos objetos).

export function createEmptyHabits() {
  return Object.freeze({
    productCounts: Object.freeze({}),
    categoryCounts: Object.freeze({}),
    lastUsed: Object.freeze({})
  });
}

/**
 * Devuelve un nuevo Habits con el producto/categoría incrementados.
 */
export function trackUsage(habits, name, category = '') {
  const key = String(name).toLowerCase().trim();
  const catKey = String(category || '').toLowerCase().trim();
  return Object.freeze({
    productCounts: Object.freeze({ ...habits.productCounts, [key]: (habits.productCounts[key] || 0) + 1 }),
    categoryCounts: Object.freeze({ ...habits.categoryCounts, [catKey]: (habits.categoryCounts[catKey] || 0) + 1 }),
    lastUsed: Object.freeze({ ...habits.lastUsed, [key]: new Date().toISOString() })
  });
}

/**
 * Cantidad de veces usado un producto (0 si nunca).
 */
export function usageCount(habits, name) {
  const key = String(name).toLowerCase().trim();
  return habits.productCounts[key] || 0;
}

/**
 * Timestamp ISO de último uso (null si nunca).
 */
export function lastUsedAt(habits, name) {
  const key = String(name).toLowerCase().trim();
  return habits.lastUsed[key] || null;
}