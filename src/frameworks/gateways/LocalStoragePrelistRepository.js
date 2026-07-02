// src/frameworks/gateways/LocalStoragePrelistRepository.js

import { PrelistMapper } from '../mappers/PrelistMapper.js';

const KEY = 'supercalc_prelist';

export function makeLocalStoragePrelistRepository(storage = globalThis.localStorage) {
  return {
    getAll() {
      try {
        const raw = storage.getItem(KEY);
        return PrelistMapper.toDomain(raw ? JSON.parse(raw) : []);
      } catch { return []; }
    },
    upsert(item) {
      const list = this.getAll();
      const idx = list.findIndex(p => p.id === item.id);
      if (idx === -1) list.push(item);
      else list[idx] = item;
      storage.setItem(KEY, JSON.stringify(PrelistMapper.toJSON(list)));
    },
    remove(id) {
      const list = this.getAll().filter(p => p.id !== id);
      storage.setItem(KEY, JSON.stringify(PrelistMapper.toJSON(list)));
    },
    clear() {
      storage.removeItem(KEY);
    }
  };
}