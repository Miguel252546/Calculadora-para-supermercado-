// src/usecases/GenerateInvoice.js
// Caso de uso: generar una Invoice, guardarla en historial y disparar impresión.

import { createInvoice } from '../domain/entities/Invoice.js';

/**
 * @param {{
 *   cartRepository: import('./ports.js').CartRepositoryPort,
 *   historyRepository: import('./ports.js').HistoryRepositoryPort,
 *   settingsRepository: import('./ports.js').SettingsRepositoryPort,
 *   printService: import('./ports.js').PrintServicePort
 * }} deps
 */
export function makeGenerateInvoice({ cartRepository, historyRepository, settingsRepository, printService }) {
  return function generateInvoice({ clientName = 'Consumidor Final', autoPrint = true, afterInvoice = 'clear' } = {}) {
    const products = cartRepository.getAll();
    if (products.length === 0) {
      throw new Error('La lista está vacía. Agrega productos para facturar.');
    }
    const storeName = settingsRepository.getStoreName?.() || 'SuperCalc Premium';
    const invoice = createInvoice({ storeName, clientName, products });

    // Guardar en historial (al inicio).
    const current = historyRepository.getAll();
    historyRepository.save(invoice);

    // Imprimir.
    if (autoPrint && printService?.printInvoice) {
      try { printService.printInvoice(invoice); }
      catch (e) { console.warn('PrintService error:', e); }
    }

    // Acción post-facturación.
    if (afterInvoice === 'clear') {
      cartRepository.clear();
    }

    return invoice;
  };
}