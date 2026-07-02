// src/frameworks/mappers/PrelistMapper.js

export const PrelistMapper = {
  toJSON(items) {
    return items.map(p => ({
      id: p.id,
      name: p.name,
      qty: p.qty,
      category: p.category,
      brand: p.brand || ''
    }));
  },
  toDomain(jsonArray) {
    if (!Array.isArray(jsonArray)) return [];
    return jsonArray
      .filter(x => x && typeof x.name === 'string')
      .map(p => ({
        id: p.id ?? cryptoId(),
        name: String(p.name).trim(),
        qty: Math.max(1, Number(p.qty) || 1),
        category: String(p.category || 'General').trim() || 'General',
        brand: String(p.brand || '').trim()
      }));
  }
};

function cryptoId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id_' + Date.now() + '_' + Math.random();
}