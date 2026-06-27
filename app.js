import { jsPDF } from 'https://esm.sh/jspdf';
import autoTable from 'https://esm.sh/jspdf-autotable';

const STORAGE_KEY = 'supercalc_data';
const HISTORY_KEY = 'supercalc_history';
const THEME_KEY = 'supercalc_theme';
const STORE_NAME_KEY = 'supercalc_store_name';
const PRELIST_KEY = 'supercalc_prelist';
const HABITS_KEY = 'supercalc_habits';
const PENDING_KEY = 'supercalc_pending';

const state = {
  products: [],
  history: [],
  total: 0,
  theme: 'light',
  storeName: 'SuperCalc Premium',
  prelist: [],
  pendingProducts: [],
  habits: { productCounts: {}, categoryCounts: {}, lastUsed: {} }
};

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0
});

let currentDisplayedItems = [];
let activeCategory = 'Todas';
let activeBrand = 'Todas';
let currentSearch = '';
let sortMode = 'most_used';
let editingPrelistId = null;
let currentImageData = null;
let completingPendingId = null;

const $ = (id) => document.getElementById(id);

function seedDefaultPrelist() {
  const defaults = [
    { category: 'Café y té', items: [
      { name: 'Café Espresso', qty: 1 },
      { name: 'Café Instantáneo', qty: 1 },
      { name: 'Café en Grano 500g', qty: 1 },
      { name: 'Café en Cápsulas (pack 10)', qty: 1 },
      { name: 'Té Negro (20 uds)', qty: 1 },
      { name: 'Té Verde (20 uds)', qty: 1 },
      { name: 'Té de Hierbas (20 uds)', qty: 1 },
    ]},
    { category: 'Panificados', items: [
      { name: 'Media bolsa', qty: 1 },
      { name: 'Bolsa completa', qty: 1 },
      { name: 'Pan cuadrado', qty: 1 },
      { name: 'Pan en tira', qty: 1 },
      { name: 'Pan de molde', qty: 1 },
      { name: 'Pan lactal', qty: 1 },
      { name: 'Pan rallado', qty: 1 },
      { name: 'Pre pizza', qty: 1 },
      { name: 'Tapas de empanadas', qty: 1 },
      { name: 'Tapas de pascualina', qty: 1 },
    ]},
    { category: 'Harinas', items: [
      { name: 'Harina de Trigo 1kg', qty: 1 },
      { name: 'Harina de Maíz 500g', qty: 1 },
      { name: 'Harina de Arroz 500g', qty: 1 },
      { name: 'Harina Integral 1kg', qty: 1 },
      { name: 'Harina para Panqueques', qty: 1 },
      { name: 'Harina Pan', qty: 1 },
      { name: 'Morixe Arepa', qty: 1, brand: 'Morixe' },
      { name: 'Harina para Cachapa', qty: 1 },
      { name: 'Harina sin TACC', qty: 1 },
      { name: 'Harina 000', qty: 1 },
      { name: 'Harina 0000', qty: 1 },
      { name: 'Harina Leudante', qty: 1 },
    ]},
    { category: 'Jabones de ropa', items: [
      { name: 'Jabón en polvo', qty: 1 },
      { name: 'Jabón líquido', qty: 1 },
      { name: 'Jabón para disolver en agua', qty: 1 },
      { name: 'Skip', qty: 1, brand: 'Skip' },
      { name: 'Ala', qty: 1, brand: 'Ala' },
      { name: 'Ariel', qty: 1, brand: 'Ariel' },
      { name: 'Zorro', qty: 1, brand: 'Zorro' },
      { name: 'Drive', qty: 1, brand: 'Drive' },
      { name: 'Ace', qty: 1, brand: 'Ace' },
    ]},
    { category: 'Artículos de limpieza corporal', items: [
      { name: 'Jabón de Manos', qty: 1 },
      { name: 'Shampoo', qty: 1 },
      { name: 'Acondicionador', qty: 1 },
      { name: 'Crema Corporal', qty: 1 },
      { name: 'Desodorante', qty: 1 },
      { name: 'Pasta Dental', qty: 1 },
      { name: 'Jabón de Baño', qty: 1 },
    ]},
    { category: 'Limpieza del hogar', items: [
      { name: 'Lavaloza Líquido', qty: 1 },
      { name: 'Detergente en Polvo', qty: 1 },
      { name: 'Desinfectante', qty: 1 },
      { name: 'Limpia Vidrios', qty: 1 },
      { name: 'Bolsas de Basura (pack 30)', qty: 1 },
      { name: 'Cloro 1L', qty: 1 },
      { name: 'Esponja Multiuso (pack 5)', qty: 1 },
    ]},
    { category: 'Congelados', items: [
      { name: 'Papas Fritas Congeladas', qty: 1 },
      { name: 'Verduras Mixtas', qty: 1 },
      { name: 'Helado 1L', qty: 1 },
      { name: 'Pescado Congelado', qty: 1 },
      { name: 'Pizza Congelada', qty: 1 },
      { name: 'Arvejas Congeladas', qty: 1 },
    ]},
    { category: 'Lácteos', items: [
      { name: 'Leche 1L', qty: 1 },
      { name: 'Queso Gouda', qty: 1 },
      { name: 'Yogur Natural (pack 4)', qty: 1 },
      { name: 'Mantequilla', qty: 1 },
      { name: 'Crema de Leche 200ml', qty: 1 },
      { name: 'Queso Crema', qty: 1 },
    ]},
  ];
  const items = [];
  defaults.forEach(cat => {
    cat.items.forEach(item => {
      items.push({ id: crypto.randomUUID(), category: cat.category, name: item.name, qty: item.qty, brand: item.brand || '' });
    });
  });
  localStorage.setItem(PRELIST_KEY, JSON.stringify(items));
}

function init() {
  loadState();
  applyTheme();
  calculateTotal();
  renderCart();
  renderPendingProducts();
  renderHistory();
  renderCategoryFilters();
  renderBrandFilters();
  renderSortControls();
  updateCategoryDatalist();
  filterTemplates();
  bindEvents();
}

function loadState() {
  state.products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  state.history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  state.theme = localStorage.getItem(THEME_KEY) || 'light';
  state.storeName = localStorage.getItem(STORE_NAME_KEY) || 'SuperCalc Premium';
  const raw = localStorage.getItem(PRELIST_KEY);
  if (raw === null) {
    seedDefaultPrelist();
    state.prelist = JSON.parse(localStorage.getItem(PRELIST_KEY));
  } else {
    state.prelist = JSON.parse(raw);
  }
  const pendingRaw = localStorage.getItem(PENDING_KEY);
  state.pendingProducts = pendingRaw ? JSON.parse(pendingRaw) : [];
  const habitsRaw = localStorage.getItem(HABITS_KEY);
  if (habitsRaw) {
    state.habits = JSON.parse(habitsRaw);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  localStorage.setItem(STORE_NAME_KEY, state.storeName);
  localStorage.setItem(PRELIST_KEY, JSON.stringify(state.prelist));
  localStorage.setItem(PENDING_KEY, JSON.stringify(state.pendingProducts));
  localStorage.setItem(HABITS_KEY, JSON.stringify(state.habits));
}

function calculateTotal() {
  state.total = state.products.reduce((acc, p) => acc + (p.qty * p.price), 0);
}

function switchView(viewId) {
  document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  $(`view-${viewId}`).classList.add('active');
  document.querySelector(`.tab-btn[data-view="${viewId}"]`).classList.add('active');
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  $('theme-icon').textContent = state.theme === 'light' ? '🌙' : '☀️';
  localStorage.setItem(THEME_KEY, state.theme);
}

function handleImageUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageData = e.target.result;
    $('image-preview').src = currentImageData;
    $('image-preview').style.display = 'block';
    $('preview-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
  let fileName = file.name.replace(/\.[^/.]+$/, "");
  fileName = fileName.replace(/[-_]/g, ' ');
  fileName = fileName.replace(/\b\w/g, l => l.toUpperCase());
  $('product-name').value = fileName;
}

function getCategoriesFromPrelist() {
  return [...new Set(state.prelist.map(item => item.category))].sort();
}

function getAllPrelistItems() {
  return [...state.prelist];
}

function addPrelistItem(category, name, qty, brand) {
  state.prelist.push({ id: crypto.randomUUID(), category, name, qty, brand: brand || '' });
}

function editPrelistItem(id, category, name, qty, brand) {
  const item = state.prelist.find(p => p.id === id);
  if (item) { item.category = category; item.name = name; item.qty = qty; item.brand = brand || ''; }
}

function deletePrelistItem(id) {
  state.prelist = state.prelist.filter(p => p.id !== id);
}

function addPendingProduct(name, qty) {
  state.pendingProducts.push({
    id: crypto.randomUUID(),
    name,
    qty: qty || 1,
    createdAt: new Date().toISOString()
  });
}

function removePendingProduct(id) {
  state.pendingProducts = state.pendingProducts.filter(p => p.id !== id);
}

function completePendingProduct(id, qty, price) {
  const pending = state.pendingProducts.find(p => p.id === id);
  if (!pending) return;
  const existing = state.products.find(p => p.name.toLowerCase() === pending.name.toLowerCase());
  if (existing) {
    existing.qty += qty;
  } else {
    state.products.push({ name: pending.name, qty, price, imageData: null });
  }
  trackUsage(pending.name, '');
  removePendingProduct(id);
  calculateTotal();
  saveState();
  renderCart();
  renderPendingProducts();
}

function renderPendingProducts() {
  const list = $('pending-list');
  const count = $('pending-count');
  if (!list) return;
  const total = state.pendingProducts.length;
  count.textContent = total > 0 ? `${total} pendiente${total !== 1 ? 's' : ''}` : '';
  if (total === 0) {
    list.innerHTML = '<div class="pending-empty">No hay productos pendientes.</div>';
    return;
  }
  list.innerHTML = state.pendingProducts.map(p => {
    const isCompleting = completingPendingId === p.id;
    if (isCompleting) {
      return `
        <div class="pending-card pending-card-completing">
          <div class="pending-card-main">
            <div class="pending-info">
              <span class="pending-name">${p.name}</span>
              <span class="pending-qty-label">${p.qty} ud.</span>
            </div>
          </div>
          <div class="pending-complete-form">
            <input type="number" class="modern-input pending-complete-qty" placeholder="Cant" min="1" value="${p.qty}" step="1">
            <input type="number" class="modern-input pending-complete-price" placeholder="Precio unit." min="0" step="0.01">
            <button class="btn-pending-confirm" data-id="${p.id}">\u2713</button>
            <button class="btn-pending-cancel-complete">\u2715</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="pending-card">
        <div class="pending-card-main">
          <div class="pending-info">
            <span class="pending-name">${p.name}</span>
            <span class="pending-qty-label">${p.qty} ud.</span>
          </div>
          <span class="pending-badge">\u23f3 Pendiente</span>
        </div>
        <div class="pending-actions">
          <button class="btn-pending-complete" data-id="${p.id}">\u2713 Completar</button>
          <button class="btn-pending-delete" data-id="${p.id}" aria-label="Eliminar pendiente">\ud83d\uddd1\ufe0f</button>
        </div>
      </div>
    `;
  }).join('');
  if (completingPendingId) {
    setTimeout(() => { list.querySelector('.pending-complete-qty')?.focus(); }, 50);
  }
}

function handlePendingFormSubmit(e) {
  e.preventDefault();
  const name = $('pending-name').value.trim();
  const qty = parseInt($('pending-qty').value) || 1;
  if (!name || qty < 1) return;
  addPendingProduct(name, qty);
  saveState();
  renderPendingProducts();
  $('pending-form').reset();
  $('pending-name').focus();
}

function showPrelistForm(item) {
  $('prelist-form-section').style.display = '';
  $('prelist-form').classList.add('visible');
  if (item) {
    editingPrelistId = item.id;
    $('prelist-category').value = item.category;
    $('prelist-name').value = item.name;
    $('prelist-qty').value = item.qty;
    $('prelist-brand').value = item.brand || '';
  } else {
    editingPrelistId = null;
    $('prelist-category').value = '';
    $('prelist-name').value = '';
    $('prelist-qty').value = 1;
    $('prelist-brand').value = '';
  }
  $('prelist-category').focus();
}

function hidePrelistForm() {
  $('prelist-form').classList.remove('visible');
  $('prelist-form-section').style.display = 'none';
  editingPrelistId = null;
}

function handlePrelistFormSave() {
  const category = $('prelist-category').value.trim();
  const name = $('prelist-name').value.trim();
  const qty = parseInt($('prelist-qty').value) || 1;
  const brand = $('prelist-brand').value.trim();
  if (!category || !name) return;
  if (qty < 1) { alert('La cantidad debe ser al menos 1.'); return; }
  if (editingPrelistId) {
    editPrelistItem(editingPrelistId, category, name, qty, brand);
  } else {
    addPrelistItem(category, name, qty, brand);
  }
  saveState();
  hidePrelistForm();
  renderCategoryFilters();
  renderBrandFilters();
  updateCategoryDatalist();
  filterTemplates();
}

function togglePrelistPanel(show) {
  const panel = $('templates-panel');
  const btn = $('templates-toggle');
  const isVisible = show !== undefined ? show : panel.style.display !== 'block';
  panel.style.display = isVisible ? 'block' : 'none';
  btn.classList.toggle('active', isVisible);
  if (isVisible) {
    $('templates-search').value = '';
    currentSearch = '';
    activeCategory = 'Todas';
    activeBrand = 'Todas';
    hidePrelistForm();
    document.querySelectorAll('.templates-category-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.templates-category-btn[data-category="Todas"]')?.classList.add('active');
    filterTemplates();
    setTimeout(() => $('templates-search').focus(), 100);
  }
}

function trackUsage(name, category) {
  const key = name.toLowerCase().trim();
  if (!state.habits.productCounts[key]) state.habits.productCounts[key] = 0;
  state.habits.productCounts[key]++;
  const catKey = category.toLowerCase().trim();
  if (!state.habits.categoryCounts[catKey]) state.habits.categoryCounts[catKey] = 0;
  state.habits.categoryCounts[catKey]++;
  state.habits.lastUsed[key] = new Date().toISOString();
  saveState();
}

function getBrandsFromItems(items) {
  const brands = items.map(i => i.brand).filter(b => b && b.trim());
  return [...new Set(brands)].sort();
}

function filterTemplates() {
  let items = [];
  if (activeCategory === 'Todas') {
    items = getAllPrelistItems();
  } else {
    items = state.prelist.filter(p => p.category === activeCategory);
  }
  if (activeBrand !== 'Todas') {
    items = items.filter(p => p.brand === activeBrand);
  }
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.brand && item.brand.toLowerCase().includes(q))
    );
  }
  sortItems(items);
  renderTemplateItems(items);
}

function sortItems(items) {
  switch (sortMode) {
    case 'most_used':
      items.sort((a, b) => {
        const aCount = state.habits.productCounts[a.name.toLowerCase()] || 0;
        const bCount = state.habits.productCounts[b.name.toLowerCase()] || 0;
        if (bCount !== aCount) return bCount - aCount;
        return a.name.localeCompare(b.name);
      });
      break;
    case 'recent':
      items.sort((a, b) => {
        const aTime = state.habits.lastUsed[a.name.toLowerCase()] || '';
        const bTime = state.habits.lastUsed[b.name.toLowerCase()] || '';
        if (aTime && bTime) return bTime.localeCompare(aTime);
        if (aTime) return -1;
        if (bTime) return 1;
        return a.name.localeCompare(b.name);
      });
      break;
    case 'name':
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
}

function renderTemplateItems(items) {
  currentDisplayedItems = items;
  const totalCount = items.length;
  const countEl = $('template-count');
  if (countEl) countEl.textContent = totalCount > 0 ? `${totalCount} producto${totalCount !== 1 ? 's' : ''}` : '';
  if (items.length === 0) {
    $('templates-grid').innerHTML = '<div class="templates-empty">No hay productos. ¡Añade uno nuevo!</div>';
    return;
  }
  $('templates-grid').innerHTML = items.map((item, i) => {
    const count = state.habits.productCounts[item.name.toLowerCase()] || 0;
    const freqBadge = count > 0 ? `<span class="item-freq">${count > 9 ? '9+' : count}</span>` : '';
    const brandText = item.brand ? `<span class="item-brand">${item.brand}</span>` : '';
    return `
      <div class="template-item" data-index="${i}">
        <div class="template-item-main">
          <span class="item-name">${item.name} ${freqBadge}</span>
          <span class="item-qty">${brandText}${brandText ? ' · ' : ''}${item.category} · ${item.qty} ud.</span>
        </div>
        <div class="template-item-actions">
          <button class="btn-item-edit" data-index="${i}" title="Editar" aria-label="Editar producto">✏️</button>
          <button class="btn-item-delete" data-index="${i}" title="Eliminar" aria-label="Eliminar producto">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderCategoryFilters() {
  const cats = ['Todas', ...getCategoriesFromPrelist()];
  $('templates-categories').innerHTML = cats.map(cat => `
    <button type="button" class="templates-category-btn ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>
  `).join('');
}

function renderBrandFilters() {
  const allItems = activeCategory === 'Todas' ? getAllPrelistItems() : state.prelist.filter(p => p.category === activeCategory);
  const brands = getBrandsFromItems(allItems);
  if (brands.length === 0) {
    $('templates-brands').style.display = 'none';
    return;
  }
  $('templates-brands').style.display = 'flex';
  $('templates-brands').innerHTML = ['Todas', ...brands].map(b => `
    <button type="button" class="templates-brand-btn ${b === activeBrand ? 'active' : ''}" data-brand="${b}">${b}</button>
  `).join('');
}

function renderSortControls() {
  const modes = [
    { key: 'most_used', label: '🔥 Más usados' },
    { key: 'recent', label: '🕐 Recientes' },
    { key: 'name', label: 'A-Z' }
  ];
  $('templates-sort').innerHTML = modes.map(m => `
    <button type="button" class="sort-btn ${m.key === sortMode ? 'active' : ''}" data-sort="${m.key}">${m.label}</button>
  `).join('');
}

function updateCategoryDatalist() {
  const cats = getCategoriesFromPrelist();
  $('prelist-category-list').innerHTML = cats.map(c => `<option value="${c}">`).join('');
}

function selectPrelistItem(item) {
  $('product-name').value = item.name;
  $('product-qty').value = item.qty;
  $('product-price').value = '';
  $('product-price').focus();
  trackUsage(item.name, item.category);
  togglePrelistPanel(false);
}

function renderCart() {
  const list = $('products-list');
  list.innerHTML = '';
  if (state.products.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-style: italic; padding: 2rem 0; font-size: 0.9rem;">
        Tu carrito está vacío. <br>¡Empieza a agregar productos!
      </div>
    `;
  } else {
    state.products.forEach((product, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.index = index;
      const subtotal = product.qty * product.price;
      const thumbHtml = product.imageData
        ? `<img src="${product.imageData}" class="cart-thumb" alt="${product.name}">`
        : '';
      card.innerHTML = `
        <div class="product-info">
          ${thumbHtml}
          <div class="product-info-text">
            <span class="product-name">${product.name}</span>
            <span class="product-meta">${product.qty} ud. &bull; ${currencyFormatter.format(product.price)} c/u</span>
          </div>
        </div>
        <div class="product-actions">
          <div class="product-total">
            <span class="subtotal-label">Subtotal</span>
            <span class="subtotal-value">${currencyFormatter.format(subtotal)}</span>
          </div>
          <button class="btn-delete" title="Eliminar" onclick="removeProduct(${index})" aria-label="Eliminar producto">&times;</button>
        </div>
      `;
      list.appendChild(card);
    });
  }
  $('total-amount').textContent = currencyFormatter.format(state.total);
}

function renderHistory() {
  const list = $('history-list');
  list.innerHTML = '';
  if (state.history.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-style: italic; padding: 2rem 0; font-size: 0.9rem;">
        No hay compras registradas en el historial.
      </div>
    `;
    return;
  }
  [...state.history].reverse().forEach((purchase) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-info">
        <span class="history-id">${purchase.invoiceNo}</span>
        <span class="history-date">${purchase.date} &bull; ${purchase.itemCount} productos</span>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span class="history-amount">${currencyFormatter.format(purchase.total)}</span>
        <div class="history-btns">
          <button class="btn-history-action" onclick="downloadHistoricalPDF('${purchase.id}')">📄 PDF</button>
          <button class="btn-history-action btn-history-delete" onclick="deleteHistoryItem('${purchase.id}')">🗑️</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  const name = $('product-name').value.trim();
  const qty = parseInt($('product-qty').value);
  const price = parseFloat($('product-price').value);
  if (!name || isNaN(qty) || isNaN(price)) return;
  if (qty <= 0 || price < 0) {
    alert('Por favor, ingresa cantidades y precios válidos.');
    return;
  }
  const existing = state.products.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.qty += qty;
    if (currentImageData) existing.imageData = currentImageData;
  } else {
    state.products.push({ name, qty, price, imageData: currentImageData || null });
  }
  trackUsage(name, '');
  calculateTotal();
  saveState();
  renderCart();
  $('product-form').reset();
  currentImageData = null;
  $('image-preview').style.display = 'none';
  $('preview-placeholder').style.display = 'block';
  $('file-gallery').value = '';
  $('file-camera').value = '';
  $('product-name').focus();
}

function clearCart() {
  if (state.products.length === 0) return;
  if (confirm('¿Deseas vaciar el carrito actual?')) {
    state.products = [];
    state.total = 0;
    saveState();
    renderCart();
  }
}

function clearHistory() {
  if (state.history.length === 0) return;
  if (confirm('¿Deseas borrar TODO el historial de compras?')) {
    state.history = [];
    saveState();
    renderHistory();
  }
}

function generateInvoiceData(products = state.products, total = state.total) {
  const now = new Date();
  const dateStr = now.toLocaleString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  const invoiceNumber = `FAC-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    id: crypto.randomUUID(),
    invoiceNo: invoiceNumber,
    date: dateStr,
    client: $('client-name').value.trim() || 'Consumidor Final',
    items: products.map(p => ({
      nombre: p.name,
      cantidad: p.qty,
      precio: p.price,
      subtotal: p.qty * p.price,
      imageData: p.imageData || null
    })),
    total: total,
    itemCount: products.reduce((acc, p) => acc + p.qty, 0)
  };
}

async function downloadPDF(invoiceData) {
  try {
    const doc = new jsPDF();
    const pc = [16, 185, 129];
    doc.setFillColor(pc[0], pc[1], pc[2]);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setFontSize(22);
    doc.setTextColor(pc[0], pc[1], pc[2]);
    doc.setFont(undefined, 'bold');
    doc.text(state.storeName, 14, 28);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont(undefined, 'normal');
    doc.text('Facturación Electrónica Digital', 14, 34);
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(`FACTURA: ${invoiceData.invoiceNo}`, 140, 22);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`Fecha: ${invoiceData.date}`, 140, 28);
    doc.setDrawColor(230);
    doc.line(14, 40, 196, 40);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('CLIENTE:', 14, 48);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(invoiceData.client, 14, 54);
    const hasImages = invoiceData.items.some(p => p.imageData);
    const cols = hasImages ? ["", "Producto", "Cant.", "Precio Unit.", "Subtotal"] : ["Producto", "Cant.", "Precio Unit.", "Subtotal"];
    const rows = invoiceData.items.map(p => {
      const row = hasImages ? [p.imageData || '', p.nombre] : [p.nombre];
      row.push(p.cantidad, currencyFormatter.format(p.precio), currencyFormatter.format(p.subtotal));
      return row;
    });
    const colStyles = hasImages
      ? {
          0: { cellWidth: 14, halign: 'center' },
          1: { halign: 'left', fontStyle: 'bold' },
          2: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'right' }
        }
      : {
          0: { halign: 'left', fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' }
        };
    autoTable(doc, {
      startY: 60, head: [cols], body: rows,
      headStyles: { fillColor: pc, fontSize: 11, halign: 'center' },
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 5 },
      columnStyles: colStyles,
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawCell: hasImages ? function(data) {
        if (data.column.index === 0 && data.cell.raw && typeof data.cell.raw === 'string' && data.cell.raw.startsWith('data:image')) {
          try {
            doc.addImage(data.cell.raw, 'JPEG', data.cell.x + 2, data.cell.y + 2, 10, 10);
          } catch (e) { /* ignore draw errors */ }
        }
      } : null
    });
    const finalY = (doc.lastAutoTable?.finalY ?? 80) + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total productos: ${invoiceData.itemCount}`, 140, finalY, { align: 'right' });
    doc.setFontSize(16);
    doc.setTextColor(pc[0], pc[1], pc[2]);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL FINAL: ${currencyFormatter.format(invoiceData.total)}`, 140, finalY + 10, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(120);
    doc.text('Gracias por su compra. Este documento es un comprobante digital.', 105, 285, { align: 'center' });
    doc.save(`Factura_${invoiceData.invoiceNo}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF Error:', error);
    alert('Error al generar el PDF: ' + error.message);
    return false;
  }
}

async function handleCheckout() {
  if (state.products.length === 0) {
    alert('La lista está vacía. Agrega productos para facturar.');
    return;
  }
  const invoiceData = generateInvoiceData();
  state.history.push(invoiceData);
  saveState();
  const success = await downloadPDF(invoiceData);
  if (success) {
    alert('✅ Factura generada y guardada en el historial.');
    if (confirm('¿Deseas vaciar el carrito ahora que has facturado?')) {
      state.products = [];
      state.total = 0;
      saveState();
      renderCart();
    }
  }
}

window.removeProduct = function(index) {
  const card = document.querySelector(`.product-card[data-index="${index}"]`);
  if (!card) return;
  card.classList.add('removing');
  setTimeout(() => {
    state.products.splice(index, 1);
    calculateTotal();
    saveState();
    renderCart();
  }, 300);
};

window.deleteHistoryItem = function(id) {
  if (confirm('¿Eliminar esta compra del historial?')) {
    state.history = state.history.filter(item => item.id !== id);
    saveState();
    renderHistory();
  }
};

window.downloadHistoricalPDF = async function(id) {
  const purchase = state.history.find(item => item.id === id);
  if (!purchase) return;
  await downloadPDF(purchase);
};

function bindEvents() {
  $('theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  $('product-form').addEventListener('submit', handleFormSubmit);
  $('btn-clear-list').addEventListener('click', clearCart);
  $('btn-clear-history').addEventListener('click', clearHistory);
  $('btn-generate-pdf').addEventListener('click', handleCheckout);

  $('store-name-input').value = state.storeName;
  $('store-name-input').addEventListener('input', (e) => {
    state.storeName = e.target.value || 'SuperCalc Premium';
    saveState();
  });

  $('btn-upload-gallery').addEventListener('click', () => $('file-gallery').click());
  $('btn-upload-camera').addEventListener('click', () => $('file-camera').click());
  $('file-gallery').addEventListener('change', (e) => handleImageUpload(e.target.files[0]));
  $('file-camera').addEventListener('change', (e) => handleImageUpload(e.target.files[0]));

  $('templates-toggle').addEventListener('click', () => togglePrelistPanel());

  $('templates-search').addEventListener('input', (e) => {
    currentSearch = e.target.value;
    filterTemplates();
  });

  $('templates-sort').addEventListener('click', (e) => {
    const btn = e.target.closest('.sort-btn');
    if (!btn) return;
    sortMode = btn.dataset.sort;
    renderSortControls();
    filterTemplates();
  });

  $('templates-grid').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-item-edit');
    if (editBtn) {
      const item = currentDisplayedItems[parseInt(editBtn.dataset.index)];
      if (item) showPrelistForm(item);
      return;
    }
    const deleteBtn = e.target.closest('.btn-item-delete');
    if (deleteBtn) {
      const item = currentDisplayedItems[parseInt(deleteBtn.dataset.index)];
      if (item && confirm(`¿Eliminar "${item.name}" de tu lista previa?`)) {
        deletePrelistItem(item.id);
        saveState();
        renderCategoryFilters();
        renderBrandFilters();
        updateCategoryDatalist();
        filterTemplates();
      }
      return;
    }
    const itemEl = e.target.closest('.template-item');
    if (itemEl) {
      const item = currentDisplayedItems[parseInt(itemEl.dataset.index)];
      if (item) selectPrelistItem(item);
    }
  });

  $('templates-categories').addEventListener('click', (e) => {
    const btn = e.target.closest('.templates-category-btn');
    if (!btn) return;
    document.querySelectorAll('.templates-category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    activeBrand = 'Todas';
    renderBrandFilters();
    filterTemplates();
  });

  $('templates-brands').addEventListener('click', (e) => {
    const btn = e.target.closest('.templates-brand-btn');
    if (!btn) return;
    document.querySelectorAll('.templates-brand-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeBrand = btn.dataset.brand;
    filterTemplates();
  });

  $('btn-prelist-add').addEventListener('click', () => showPrelistForm(null));
  $('btn-prelist-save').addEventListener('click', handlePrelistFormSave);
  $('btn-prelist-cancel').addEventListener('click', hidePrelistForm);

  $('prelist-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handlePrelistFormSave(); }
  });
  $('prelist-qty').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handlePrelistFormSave(); }
  });
  $('prelist-brand').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handlePrelistFormSave(); }
  });

  $('pending-form').addEventListener('submit', handlePendingFormSubmit);

  $('pending-list').addEventListener('click', (e) => {
    const completeBtn = e.target.closest('.btn-pending-complete');
    if (completeBtn) {
      completingPendingId = completeBtn.dataset.id;
      renderPendingProducts();
      return;
    }
    const confirmBtn = e.target.closest('.btn-pending-confirm');
    if (confirmBtn) {
      const id = confirmBtn.dataset.id;
      const card = confirmBtn.closest('.pending-card');
      const qty = parseInt(card.querySelector('.pending-complete-qty').value);
      const price = parseFloat(card.querySelector('.pending-complete-price').value);
      if (isNaN(qty) || qty < 1 || isNaN(price) || price < 0) {
        alert('Ingresa una cantidad y precio v\u00e1lidos.');
        return;
      }
      completePendingProduct(id, qty, price);
      completingPendingId = null;
      return;
    }
    const cancelBtn = e.target.closest('.btn-pending-cancel-complete');
    if (cancelBtn) {
      completingPendingId = null;
      renderPendingProducts();
      return;
    }
    const deleteBtn = e.target.closest('.btn-pending-delete');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const pending = state.pendingProducts.find(p => p.id === id);
      if (pending && confirm(`\u00bfEliminar "${pending.name}" de pendientes?`)) {
        removePendingProduct(id);
        saveState();
        renderPendingProducts();
      }
      return;
    }
  });

  $('pending-list').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const qtyInput = e.target.closest('.pending-complete-qty');
      const priceInput = e.target.closest('.pending-complete-price');
      if (qtyInput) {
        e.preventDefault();
        const priceEl = qtyInput.closest('.pending-card')?.querySelector('.pending-complete-price');
        if (priceEl) priceEl.focus();
        return;
      }
      if (priceInput) {
        e.preventDefault();
        const confirmBtn = priceInput.closest('.pending-card')?.querySelector('.btn-pending-confirm');
        if (confirmBtn) confirmBtn.click();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
