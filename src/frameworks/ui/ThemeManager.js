// src/frameworks/ui/ThemeManager.js
// Maneja el cambio de tema (oscuro/claro).

/**
 * @param {{ settingsRepository: import('../../usecases/ports.js').SettingsRepositoryPort }} deps
 */
export function makeThemeManager({ settingsRepository }) {
  let current = settingsRepository.getTheme();
  apply(current);

  return {
    toggle() {
      current = current === 'dark' ? 'light' : 'dark';
      settingsRepository.setTheme(current);
      apply(current);
      return current;
    },
    current() { return current; }
  };

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'light' ? '🌙' : '☀️';
  }
}