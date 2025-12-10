// assets/js/state.js

window.store = {
  isOpen: true,
  cart: [],              // id, name, price, and qty 
  pendingTipAmount: 0,   // tip choosen on cart page 
  lastOrder: null        // last placed order
};


//  persistence
function loadStore() {
  try {
    const raw = localStorage.getItem('frontdashStore');
    if (!raw) return;
    const data = JSON.parse(raw);

    if (typeof data.isOpen === 'boolean') store.isOpen = data.isOpen;
    if (Array.isArray(data.cart)) store.cart = data.cart;
    if (typeof data.pendingTipAmount === 'number') {
      store.pendingTipAmount = data.pendingTipAmount;
    }
    if (data.lastOrder) store.lastOrder = data.lastOrder;
  } catch (e) {
    console.error('Failed to load store from localStorage:', e);
  }
}

function saveStore() {
  try {
    localStorage.setItem('frontdashStore', JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save store to localStorage:', e);
  }
}

// money helpers
function fmt(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '$0.00';
  return '$' + num.toFixed(2);
}

// 8.25% service fee plust the tip
function calcCartTotals() {
  const subtotal = store.cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 0),
    0
  );

  const serviceFeeRate = 0.0825; 
  const serviceFee = subtotal * serviceFeeRate;

  const tip = Number(store.pendingTipAmount) || 0;
  const total = subtotal + serviceFee + tip;

  return {
    subtotal,
    serviceFee,
    tip,
    total
  };
}

// cart badghe
function updateCartCountBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;

  const count = store.cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  badge.textContent = String(count);
  badge.classList.toggle('d-none', count === 0);
}
