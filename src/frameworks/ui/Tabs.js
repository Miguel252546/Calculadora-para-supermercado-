// src/frameworks/ui/Tabs.js
// Switch entre vistas (carrito / historial).
// Acepta tanto `.active` como `.is-active` para compatibilidad.

import { $, qsa } from './DomBinder.js';

const ACTIVE = 'is-active';

function setActive(el, active) {
  if (!el) return;
  el.classList.toggle(ACTIVE, active);
  el.classList.toggle('active', active); // compat legacy
}

export function makeTabs() {
  return {
    init() {
      qsa('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => this.activate(btn.dataset.view));
      });
    },
    activate(viewId) {
      qsa('.view-content').forEach((v) => setActive(v, false));
      qsa('.tab-btn').forEach((b) => setActive(b, false));
      const target = $(`view-${viewId}`);
      if (target) {
        setActive(target, true);
        target.removeAttribute('hidden');
      }
      // Oculta las otras vistas si están dentro del mismo `main`.
      qsa('.view-content').forEach((v) => {
        if (v !== target) v.setAttribute('hidden', '');
      });
      const btn = document.querySelector(`.tab-btn[data-view="${viewId}"]`);
      if (btn) setActive(btn, true);
    }
  };
}
