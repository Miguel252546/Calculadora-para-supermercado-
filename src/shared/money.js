// src/shared/money.js
// Formateadores de moneda compartidos con 2 decimales.

export function formatCurrency(value) {
  const num = Number(value) || 0;
  return '$' + num.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}