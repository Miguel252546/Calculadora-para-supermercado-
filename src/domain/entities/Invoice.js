// src/domain/entities/Invoice.js
// Entidad Invoice: factura generada a partir de un Cart.
// Inmutable.

import { createCart } from './Cart.js';
import { lineSubtotal } from './Product.js';

let invoiceCounter = 0;

function nextInvoiceNumber() {
  // FAC-<6 dígitos timestamp>-<contador sesión>. Robusto ante refresh rápido.
  invoiceCounter = (invoiceCounter + 1) % 1000;
  const ts = Date.now().toString().slice(-6);
  return `FAC-${ts}-${String(invoiceCounter).padStart(3, '0')}`;
}

export function createInvoice({ storeName = 'Mi Tienda', clientName = 'Consumidor Final', products = [] } = {}) {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('No hay productos para facturar');
  }
  const cart = createCart(products);
  const dateStr = new Date().toLocaleString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return Object.freeze({
    id: 'inv_' + Date.now().toString(36) + '_' + (invoiceCounter++),
    invoiceNo: nextInvoiceNumber(),
    storeName,
    clientName,
    date: dateStr,
    createdAt: new Date().toISOString(),
    lines: Object.freeze(products.map((p) => Object.freeze({
      nombre: p.name,
      cantidad: p.qty,
      precio: p.price,
      subtotal: lineSubtotal(p),
      imageData: p.imageDataUrl ?? null
    }))),
    total: cart.total,
    itemCount: products.reduce((acc, p) => acc + Number(p.qty), 0)
  });
}
