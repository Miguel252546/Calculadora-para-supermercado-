// src/frameworks/ui/DomBinder.js
// Helpers DOM portables. Sin dependencias.

export const $ = (id) => document.getElementById(id);
export const qs = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Registra un listener y devuelve un unsubscribe. */
export function on(el, evt, handler, opts) {
  if (!el) return () => {};
  el.addEventListener(evt, handler, opts);
  return () => el.removeEventListener(evt, handler, opts);
}

export function emit(el, evt, detail) {
  el.dispatchEvent(new CustomEvent(evt, { detail, bubbles: true }));
}

export function setText(el, value) {
  if (el) el.textContent = String(value);
}

export function clearChildren(el) {
  while (el && el.firstChild) el.removeChild(el.firstChild);
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast is-' + type;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
  }, duration);
}