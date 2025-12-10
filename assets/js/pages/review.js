// assets/js/pages/review.js

function $(id) {
  return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', () => {
  renderReview();
});

function renderReview() {
  const tbody      = $('reviewItems');     
  const subtotalEl = $('reviewSubtotal');  // id="reviewSubtotal"
  const feeEl      = $('reviewService');   // id="reviewService"
  const tipEl      = $('reviewTip');       // id="reviewTip"
  const totalEl    = $('reviewTotal');     // id="reviewTotal"
  const tsEl       = $('orderTimestamp');  // span for timestamp

  if (!tbody) return;

  const items = (window.store && Array.isArray(store.cart)) ? store.cart : [];

  if (!items.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          Your cart is empty. Go back to the cart page to add items.
        </td>
      </tr>
    `;
    if (subtotalEl) subtotalEl.textContent = fmt(0);
    if (feeEl)      feeEl.textContent      = fmt(0);
    if (tipEl)      tipEl.textContent      = fmt(0);
    if (totalEl)    totalEl.textContent    = fmt(0);
    if (tsEl) tsEl.textContent = '';
    return;
  }

  tbody.innerHTML = items.map(item => {
    const price = Number(item.price) || 0;
    const qty   = item.qty || 0;
    const line  = price * qty;
    return `
      <tr>
        <td>${item.name}</td>
        <td class="text-end">${fmt(price)}</td>
        <td class="text-end">${qty}</td>
        <td class="text-end">${fmt(line)}</td>
      </tr>
    `;
  }).join('');

  const totals = calcCartTotals();
  if (subtotalEl) subtotalEl.textContent = fmt(totals.subtotal);
  if (feeEl)      feeEl.textContent      = fmt(totals.serviceFee);
  if (tipEl)      tipEl.textContent      = fmt(totals.tip);
  if (totalEl)    totalEl.textContent    = fmt(totals.total);

  if (tsEl) {
    const now = new Date();
    tsEl.textContent = now.toLocaleString();
  }
}
