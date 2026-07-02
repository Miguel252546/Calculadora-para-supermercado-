// src/interface_adapters/controllers/ThemeController.js

import { $, on } from '../../frameworks/ui/DomBinder.js';

/**
 * @param {{ themeManager: import('../../frameworks/ui/ThemeManager.js').ThemeManager }} deps
 */
export function makeThemeController({ themeManager }) {
  return {
    attach() {
      on($('theme-toggle'), 'click', () => themeManager.toggle());
    }
  };
}