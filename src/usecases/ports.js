// src/usecases/ports.js
// Contratos (puertos) que los gateways deben implementar.
// JS no tiene interfaces; usamos duck typing + JSDoc.
// Si un gateway no cumple el contrato, fallará en tiempo de uso.

/**
 * @typedef {{id:string,name:string,qty:number,price:number,imageDataUrl?:string|null}} Product
 * @typedef {{id:string,name:string,qty:number,category:string,brand?:string}} PrelistItem
 * @typedef {{id:string,name:string,qty:number,createdAt?:string}} PendingItem
 * @typedef {Object} Invoice
 *   @property {string} id
 *   @property {string} invoiceNo
 *   @property {string} storeName
 *   @property {string} clientName
 *   @property {string} date
 *   @property {string} createdAt
 *   @property {Array} lines
 *   @property {number} total
 *   @property {number} itemCount
 */

/** @typedef {{
 *   getAll: () => Product[],
 *   save: (products: Product[]) => void,
 *   clear: () => void
 * }} CartRepositoryPort */

/** @typedef {{
 *   getAll: () => Invoice[],
 *   save: (invoice: Invoice) => void,
 *   remove: (id: string) => void,
 *   clear: () => void
 * }} HistoryRepositoryPort */

/** @typedef {{
 *   getAll: () => PrelistItem[],
 *   upsert: (item: PrelistItem) => void,
 *   remove: (id: string) => void,
 *   clear: () => void
 * }} PrelistRepositoryPort */

/** @typedef {{
 *   getAll: () => PendingItem[],
 *   upsert: (item: PendingItem) => void,
 *   remove: (id: string) => void,
 *   clear: () => void
 * }} PendingRepositoryPort */

/** @typedef {{
 *   getTheme: () => string,
 *   setTheme: (t: string) => void,
 *   getStoreName: () => string,
 *   setStoreName: (n: string) => void,
 *   getHabits: () => Object,
 *   setHabits: (h: Object) => void
 * }} SettingsRepositoryPort */

/** @typedef {{
 *   printInvoice: (invoice: Invoice) => void
 * }} PrintServicePort */

// Anclaje para que el archivo sea tratado como módulo incluso si no hay exports nombrados.
export const __PORTS__ = true;