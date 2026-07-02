// src/frameworks/ui/PrintService.js
// Servicio que abre una ventana con HTML imprimible y dispara window.print().
// No usa librerías externas (reemplaza al jspdf del legacy).

import { formatCurrency } from '../../shared/money.js';

export function makePrintService() {
  return {
    printInvoice(invoice) {
      const html = buildInvoiceHtml(invoice);
      // Intentamos ventana nueva; si el navegador lo bloquea,
      // fallback: overlay imprimible en el mismo documento.
      const win = window.open('', '_blank', 'width=800,height=900');
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
        win.focus();
        // Esperar un tick para que el navegador renderice.
        setTimeout(() => { try { win.print(); } catch (e) { console.warn(e); } }, 200);
        return true;
      }
      return fallbackPrint(html);
    }
  };
}

function buildInvoiceHtml(invoice) {
  const rows = (invoice.lines || []).map(l => `
    <tr>
      <td>${esc(l.nombre)}</td>
      <td class="c">${l.cantidad}</td>
      <td class="r">${formatCurrency(l.precio)}</td>
      <td class="r">${formatCurrency(l.subtotal)}</td>
    </tr>`).join('');

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Factura ${esc(invoice.invoiceNo)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; padding: 32px; color: #222; max-width: 720px; margin: 0 auto; }
  h1 { margin: 0; color: #10b981; font-size: 28px; }
  .sub { color: #777; font-size: 12px; }
  .head { display: flex; justify-content: space-between; border-bottom: 2px solid #10b981; padding-bottom: 12px; }
  .meta { margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
  th { background: #10b981; color: white; padding: 10px; text-align: left; }
  td { padding: 10px; border-bottom: 1px solid #eee; }
  .c { text-align: center; }
  .r { text-align: right; }
  .totals { margin-top: 20px; text-align: right; }
  .totals .grand { font-size: 22px; color: #10b981; font-weight: 800; }
  .footer { margin-top: 32px; text-align: center; color: #888; font-size: 12px; font-style: italic; }
  @media print { body { padding: 0; } }
</style></head><body>
  <div class="head">
    <div>
      <h1>${esc(invoice.storeName)}</h1>
      <div class="sub">Facturación Electrónica Digital</div>
    </div>
    <div class="r">
      <div><strong>FACTURA:</strong> ${esc(invoice.invoiceNo)}</div>
      <div class="sub">${esc(invoice.date)}</div>
    </div>
  </div>
  <div class="meta">
    <div><strong>Cliente:</strong> ${esc(invoice.clientName)}</div>
    <div class="r"><strong>Productos:</strong> ${invoice.itemCount}</div>
  </div>
  <table>
    <thead><tr>
      <th>Producto</th><th class="c">Cant.</th><th class="r">Precio</th><th class="r">Subtotal</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="4" class="c">Sin productos</td></tr>'}</tbody>
  </table>
  <div class="totals">
    <div class="grand">TOTAL: ${formatCurrency(invoice.total)}</div>
  </div>
  <div class="footer">Gracias por su compra. Este documento es un comprobante digital.</div>
</body></html>`;
}

function fallbackPrint(html) {
  // Crea un overlay imprimible en el documento actual.
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  wrap.style.cssText = 'position:fixed;inset:0;background:white;z-index:99999;overflow:auto;';
  document.body.appendChild(wrap);
  try { window.print(); }
  finally { wrap.remove(); }
  return true;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}