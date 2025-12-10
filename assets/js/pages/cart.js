// assets/js/pages/cart.js

function $(id) {
  return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  wireTipControls();
  wireReviewButton();
});

//  render cart
function renderCartPage() {
  const content = $('cartContent');
  const empty = $('emptyCart');
  const summaryWrap = $('cartSummaryWrap');
  const subtotalEl = $('summarySubtotal');
  const serviceEl = $('summaryService');
  const totalEl = $('summaryTotal');

  if (!content) return;

  const items = store.cart || [];

  // empty cart state
  if (!items.length) {
    content.innerHTML = '';
    if (empty) empty.classList.remove('d-none');
    if (summaryWrap) summaryWrap.classList.add('d-none');

    if (subtotalEl) subtotalEl.textContent = fmt(0);
    if (serviceEl) serviceEl.textContent = fmt(0);
    if (totalEl) totalEl.textContent = fmt(0);

    updateCartCountBadge();
    return;
  }

  // items in cart
  if (empty) empty.classList.add('d-none');
  if (summaryWrap) summaryWrap.classList.remove('d-none');

  content.innerHTML = items.map(item => {
    const lineTotal = (Number(item.price) || 0) * (item.qty || 0);
    return `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h2 class="h5 mb-1">${item.name}</h2>
            <p class="text-muted mb-2">${fmt(item.price)}</p>

            <div class="mt-auto d-flex justify-content-between align-items-end gap-2">
              <div class="input-group input-group-sm" style="max-width: 130px;">
                <span class="input-group-text">Qty</span>
                <input
                  type="number"
                  min="1"
                  class="form-control cart-qty-input"
                  data-id="${item.id}"
                  value="${item.qty}"
                >
              </div>
              <div class="text-end">
                <div class="small text-muted">Line total</div>
                <strong>${fmt(lineTotal)}</strong>
              </div>
            </div>

            <button
              class="btn btn-sm btn-outline-danger mt-2 align-self-end"
              data-remove="${item.id}"
            >
              &times; Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // qty inputs
  content.querySelectorAll('.cart-qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      let val = parseInt(e.target.value || '1', 10);
      if (isNaN(val) || val < 1) val = 1;
      e.target.value = val;

      const item = store.cart.find(i => String(i.id) === String(id));
      if (!item) return;
      item.qty = val;

      saveStore();
      updateCartCountBadge();
      renderCartTotals(); // update summary numbers
    });
  });

  // remove buttons
  content.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-remove');
      store.cart = store.cart.filter(i => String(i.id) !== String(id));
      saveStore();
      updateCartCountBadge();
      renderCartPage(); // re-render whole cart since items changed
    });
  });

  // initial totals
  renderCartTotals();
}

//  final totals (subtotal + service + tip)
function renderCartTotals() {
  const subtotalEl = $('summarySubtotal');
  const serviceEl = $('summaryService');
  const totalEl = $('summaryTotal');

  const totals = calcCartTotals();

  if (subtotalEl) subtotalEl.textContent = fmt(totals.subtotal);
  if (serviceEl) serviceEl.textContent = fmt(totals.serviceFee);
  if (totalEl) totalEl.textContent = fmt(totals.total);
}

//tipping 
function wireTipControls() {
  const buttons = document.querySelectorAll('.tip-btn');
  const customInput = $('customTip');

  function setTipAmount(amount) {
    store.pendingTipAmount = Number(amount) || 0;
    saveStore();
    renderCartTotals();
  }

  // percentage buttons
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = Number(btn.getAttribute('data-tip')) || 0;

      // visual state
      buttons.forEach(b => b.classList.remove('btn-primary'));
      buttons.forEach(b => b.classList.add('btn-outline-secondary'));
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-primary');

      if (customInput) customInput.value = '';

      // compute tip from subtotal
      const subtotal = store.cart.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 0),
        0
      );
      const tipAmount = subtotal * (pct / 100);
      setTipAmount(tipAmount);
    });
  });

  // custom tip in dollars
  if (customInput) {
    customInput.addEventListener('input', () => {
      // clear button highlight
      buttons.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-secondary');
      });
      const val = Number(customInput.value) || 0;
      setTipAmount(val);
    });
  }

  // if a tip was already chosen, reflect it
  if (store.pendingTipAmount > 0 && customInput) {
    customInput.value = store.pendingTipAmount.toFixed(2);
  }
  renderCartTotals();
}

//  continue to review
function wireReviewButton() {
  const btn = $('toReviewBtn');
  const validation = $('cartValidation');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    if (!store.cart.length) {
      e.preventDefault();
      if (validation) validation.classList.remove('d-none');
    } else {
      if (validation) validation.classList.add('d-none');
    }
  });
}
