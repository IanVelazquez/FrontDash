// assets/js/pages/confirm.js

function $(id) {
  return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', () => {
  loadStore?.();
  renderConfirmation();
  wireCopyButton();
});

function renderConfirmation() {
  const missingAlert = $('confirmMissing');
  const order = store.lastOrder;

  if (!order) {
    if (missingAlert) missingAlert.classList.remove('d-none');
    return;
  }
  if (missingAlert) missingAlert.classList.add('d-none');

  const idEl         = $('confirmOrderId');
  const placedEl     = $('confirmPlaced');
  const etaWindowEl  = $('confirmEtaWindow');
  const etaArrivalEl = $('confirmEtaArrival');
  const subtotalEl   = $('confirmSubtotal');
  const feeEl        = $('confirmService');
  const tipEl        = $('confirmTip');
  const totalEl      = $('confirmTotal');
  const tbody        = $('confirmItemsBody');

  // order no
  if (idEl) idEl.textContent = order.id ? `#${order.id}` : '(pending id)';

  // placed time
  if (placedEl) {
    const dt = new Date(order.placedAt);
    placedEl.textContent = isNaN(dt.getTime()) ? '—' : dt.toLocaleString();
  }

  // eta
  const minutes = Number(order.etaMinutes) || 0;
  if (etaWindowEl) {
    //  window with +/- 10 minutes around eta
    if (minutes > 0) {
      const low  = Math.max(10, minutes - 10);
      const high = minutes + 10;
      etaWindowEl.textContent = `${low}–${high} min`;
    }
  }
  if (etaArrivalEl) {
    if (!isNaN(Date.parse(order.placedAt)) && minutes > 0) {
      const dt = new Date(order.placedAt);
      dt.setMinutes(dt.getMinutes() + minutes);
      etaArrivalEl.textContent = dt.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      });
    } else if (minutes > 0) {
      etaArrivalEl.textContent = `${minutes} minutes from now`;
    } else {
      etaArrivalEl.textContent = '—';
    }
  }

  // items
  if (tbody) {
    tbody.innerHTML = (order.items || []).map(item => {
      const line = (Number(item.price) || 0) * (item.qty || 0);
      return `
        <tr>
          <td>${item.name}</td>
          <td class="text-center">${item.qty}</td>
          <td class="text-end">${fmt(Number(item.price) || 0)}</td>
          <td class="text-end">${fmt(line)}</td>
        </tr>
      `;
    }).join('');
  }

  // totals
  const t = order.totals || { subtotal: 0, serviceFee: 0, tip: 0, total: 0 };
  if (subtotalEl) subtotalEl.textContent = fmt(Number(t.subtotal)   || 0);
  if (feeEl)      feeEl.textContent      = fmt(Number(t.serviceFee) || 0);
  if (tipEl)      tipEl.textContent      = fmt(Number(t.tip)        || 0);
  if (totalEl)    totalEl.textContent    = fmt(Number(t.total)      || 0);
}

// copy order ID button
function wireCopyButton() {
  const btn = $('copyOrderBtn');
  const idEl = $('confirmOrderId');
  if (!btn || !idEl) return;

  btn.addEventListener('click', async () => {
    const text = idEl.textContent || '';
    if (!text || text === '—') return;

    try {
      await navigator.clipboard.writeText(text.replace('#', '').trim());
      showToast?.(`Order ID ${text} copied to clipboard.`);
    } catch {
      showToast?.('Could not copy order ID.');
    }
  });
}
