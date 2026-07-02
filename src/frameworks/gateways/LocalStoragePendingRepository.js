// src/frameworks/gateways/LocalStoragePendingRepository.js

import { PendingMapper } from '../mappers/PendingMapper.js';

const KEY = 'supercalc_pending';

export function makeLocalStoragePendingRepository(storage = globalThis.localStorage) {
  return {
    getAll() {
      try {
        const raw = storage.getItem(KEY);
        return PendingMapper.toDomain(raw ? JSON.parse(raw) : []);
      } catch { return []; }
    },
    upsert(item) {
      const list = this.getAll();
      const idx = list.findIndex(p => p.id === item.id);
      if (idx === -1) list.push(item);
      else list[idx] = item;
      storage.setItem(KEY, JSON.stringify(PendingMapper.toJSON(list)));
    },
    remove(id) {
      const list = this.getAll().filter(p => p.id !== id);
      storage.setItem(KEY, JSON.stringify(PendingMapper.toJSON(list)));
    },
    clear() {
      storage.removeItem(KEY);
    }
  };
}