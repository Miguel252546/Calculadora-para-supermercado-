// src/frameworks/gateways/LocalStorageHistoryRepository.js

const KEY = 'supercalc_history';
const MAX = 50;

export function makeLocalStorageHistoryRepository(storage = globalThis.localStorage) {
  return {
    getAll() {
      try {
        const raw = storage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
      } catch { return []; }
    },
    save(invoice) {
      const list = this.getAll();
      list.unshift(invoice);
      storage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    },
    remove(id) {
      const list = this.getAll().filter(i => i.id !== id);
      storage.setItem(KEY, JSON.stringify(list));
    },
    clear() {
      storage.removeItem(KEY);
    }
  };
}