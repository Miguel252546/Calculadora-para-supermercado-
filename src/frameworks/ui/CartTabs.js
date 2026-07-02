// src/frameworks/ui/CartTabs.js
// Navegación interna del carrito: Agregar / Carrito / Pendientes.
// ARIA completo + navegación por teclado + persistencia en sessionStorage.

const STORAGE_KEY = 'supercalc_cart_tab';
const TABLIST_ID = 'cart-tablist';
const ACTIVE = 'is-active';

function getTabId(tabName) {
  return 'cart-tab-btn-' + tabName;
}
function getPanelId(tabName) {
  return 'cart-panel-' + tabName;
}

export function makeCartTabs() {
  let tabs = [];
  let panels = [];
  let currentTab = 'add';

  function init() {
    const tablist = document.getElementById(TABLIST_ID);
    if (!tablist) return;
    tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    panels = tabs.map(btn => document.getElementById(btn.getAttribute('aria-controls'))).filter(Boolean);

    // Restaurar última pestaña activa
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const target = saved && tabs.some(b => b.dataset.cartTab === saved) ? saved : 'add';

    // Click handlers
    tabs.forEach(btn => {
      btn.addEventListener('click', () => activate(btn.dataset.cartTab));
    });

    // Keyboard navigation
    tablist.addEventListener('keydown', (e) => {
      const current = tabs.findIndex(b => b.classList.contains(ACTIVE));
      if (current === -1) return;
      let next = -1;
      if (e.key === 'ArrowRight') {
        next = (current + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        next = (current - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = tabs.length - 1;
      }
      if (next !== -1) {
        e.preventDefault();
        activate(tabs[next].dataset.cartTab);
        tabs[next].focus();
      }
    });

    activate(target);
  }

  function activate(tabName) {
    if (!tabName) return;
    currentTab = tabName;
    const tabBtn = document.getElementById(getTabId(tabName));
    const panel = document.getElementById(getPanelId(tabName));
    if (!tabBtn || !panel) return;

    // Desactivar todos
    tabs.forEach(btn => {
      btn.classList.remove(ACTIVE);
      btn.setAttribute('aria-selected', 'false');
      btn.removeAttribute('tabindex');
    });
    panels.forEach(p => {
      p.classList.remove(ACTIVE);
      p.setAttribute('hidden', '');
    });

    // Activar objetivo
    tabBtn.classList.add(ACTIVE);
    tabBtn.setAttribute('aria-selected', 'true');
    tabBtn.setAttribute('tabindex', '0');
    panel.classList.add(ACTIVE);
    panel.removeAttribute('hidden');

    // Persistir
    try { sessionStorage.setItem(STORAGE_KEY, tabName); } catch (e) { /* ignore */ }
  }

  function current() { return currentTab; }

  return { init, activate, current };
}
