// src/frameworks/mappers/CartMapper.js
// Convierte JSON persistido a entidades del dominio (Product).
// Limpia entradas inválidas en lugar de lanzar.

export const CartMapper = {
  toJSON(products) {
    return products.map(p => ({
      id: p.id,
      name: p.name,
      qty: p.qty,
      price: p.price,
      imageDataUrl: p.imageDataUrl ?? null
    }));
  },
  toDomain(jsonArray) {
    if (!Array.isArray(jsonArray)) return [];
    return jsonArray
      .filter(x => x && typeof x.name === 'string' && x.name.trim())
      .map(p => ({
        id: p.id ?? cryptoId(),
        name: String(p.name).trim(),
        qty: Math.max(1, Number(p.qty) || 1),
        price: Math.max(0, Number(p.price) || 0),
        imageDataUrl: p.imageData ?? p.imageDataUrl ?? null
      }));
  }
};

function cryptoId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id_' + Date.now() + '_' + Math.random();
}