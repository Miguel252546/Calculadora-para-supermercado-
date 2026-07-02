// src/frameworks/gateways/LocalStorageSettingsRepository.js
// Almacena tema, nombre de tienda y hábitos en localStorage.

const THEME_KEY = 'supercalc_theme';
const STORE_KEY = 'supercalc_store_name';
const HABITS_KEY = 'supercalc_habits';

const DEFAULT_HABITS = () => ({
  productCounts: {},
  categoryCounts: {},
  lastUsed: {}
});

export function makeLocalStorageSettingsRepository(storage = globalThis.localStorage) {
  return {
    getTheme() { return storage.getItem(THEME_KEY) || 'light'; },
    setTheme(t) { storage.setItem(THEME_KEY, t); },

    getStoreName() { return storage.getItem(STORE_KEY) || 'SuperCalc Premium'; },
    setStoreName(n) { storage.setItem(STORE_KEY, n || 'SuperCalc Premium'); },

    getHabits() {
      try {
        const raw = storage.getItem(HABITS_KEY);
        return raw ? { ...DEFAULT_HABITS(), ...JSON.parse(raw) } : DEFAULT_HABITS();
      } catch { return DEFAULT_HABITS(); }
    },
    setHabits(h) { storage.setItem(HABITS_KEY, JSON.stringify(h)); }
  };
}