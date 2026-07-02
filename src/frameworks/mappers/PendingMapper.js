// src/frameworks/mappers/PendingMapper.js

export const PendingMapper = {
  toJSON(items) {
    return items.map(p => ({
      id: p.id,
      name: p.name,
      qty: p.qty,
      createdAt: p.createdAt ?? new Date().toISOString()
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
        createdAt: p.createdAt ?? new Date().toISOString()
      }));
  }
};

function cryptoId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id_' + Date.now() + '_' + Math.random();
}