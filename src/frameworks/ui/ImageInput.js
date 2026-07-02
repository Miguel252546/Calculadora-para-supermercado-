// src/frameworks/ui/ImageInput.js
// Maneja los inputs file (galería/cámara) y la previsualización.
// Devuelve un data:URL para adjuntar al Product (imageDataUrl).
//
// Acepta tanto el id legacy `preview-placeholder` como el nuevo
// `image-preview-placeholder` para no romper enlaces previos.

import { $ } from './DomBinder.js';

function placeholderEl() {
  return $('#image-preview-placeholder') || $('#preview-placeholder');
}

/**
 * @param {{ onChange?: (dataUrl: string|null) => void, onName?: (name: string) => void }} [hooks]
 */
export function makeImageInput(hooks = {}) {
  let currentDataUrl = null;

  function read(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      currentDataUrl = e.target.result;
      show(currentDataUrl);
      if (hooks.onChange) hooks.onChange(currentDataUrl);
    };
    reader.readAsDataURL(file);

    // Pre-llenar nombre del producto a partir del filename (heurística).
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const nameInput = $('product-name');
    if (nameInput && cleanName && !nameInput.value) nameInput.value = cleanName;
    if (hooks.onName) hooks.onName(cleanName);
  }

  function show(dataUrl) {
    const img = $('image-preview');
    const ph = placeholderEl();
    if (img) {
      if (dataUrl) { img.src = dataUrl; img.style.display = 'block'; }
      else { img.src = ''; img.style.display = 'none'; }
    }
    if (ph) ph.style.display = dataUrl ? 'none' : 'block';
  }

  function clear() {
    currentDataUrl = null;
    show(null);
    ['file-gallery', 'file-camera'].forEach((id) => {
      const el = $(id);
      if (el) el.value = '';
    });
    if (hooks.onChange) hooks.onChange(null);
  }

  function init() {
    $('btn-upload-gallery')?.addEventListener('click', () => $('file-gallery')?.click());
    $('btn-upload-camera')?.addEventListener('click', () => $('file-camera')?.click());
    $('file-gallery')?.addEventListener('change', (e) => read(e.target.files?.[0]));
    $('file-camera')?.addEventListener('change',  (e) => read(e.target.files?.[0]));
  }

  function current() { return currentDataUrl; }

  return { init, clear, current };
}
