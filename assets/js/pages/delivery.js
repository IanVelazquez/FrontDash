// assets/js/pages/delivery.js

function $(id) {
  return document.getElementById(id);
}

document.addEventListener('DOMContentLoaded', () => {
  // check global store amd navbar are ready
  loadStore?.();
  initNavbar?.();

  const form = $('deliveryForm');
  if (!form) return;

  form.addEventListener('submit', onSubmitDelivery);
});

// ETA based on number of items (like if i had to cook 40 pizzas, it would probably take longer than 2)
function computeEtaMinutes() {
  if (!window.store || !Array.isArray(store.cart)) return 30;
  const itemCount = store.cart.reduce((sum, i) => sum + (i.qty || 0), 0);
  const base = 25;   // base minutes
  const perItem = 2; // += per item
  return base + perItem * itemCount;
}

async function onSubmitDelivery(e) {
  e.preventDefault();

  if (!window.store || !store.cart || !store.cart.length) {
    alert('Your cart is empty.');
    return;
  }

  const contactName = $('deliveryContact')?.value.trim() || '';
  const phone       = $('deliveryPhone')?.value.trim() || '';
  const building    = $('addrBuilding')?.value.trim() || '';
  const street      = $('addrStreet')?.value.trim() || '';
  const city        = $('addrCity')?.value.trim() || '';
  const state       = $('addrState')?.value.trim() || '';
  const zip         = $('addrZip')?.value.trim() || '';

  if (!contactName || !phone || !building || !street || !city || !state) {
    alert('Please fill in all required delivery fields.');
    return;
  }

  // split first name, rest -> last name
  const parts = contactName.split(/\s+/);
  const contactFirstname = parts[0] || '';
  const contactLastname  = parts.slice(1).join(' '); // may be ''

  // same totals we used on cart / review
  const totals = typeof calcCartTotals === 'function'
    ? calcCartTotals()
    : computeCartTotals(); // fallback helper in helpers.js

  const etaMinutes = computeEtaMinutes();
  const placedAt   = new Date();


  // payload for backend /api/orders
 
  const payload = {
    subtotal: Number(totals.subtotal.toFixed(2)),
    tip:      Number(totals.tip.toFixed(2)),
    total:    Number(totals.total.toFixed(2)),
    status:   'new',

    contactFirstname,
    contactLastname,
    contactPhone: phone,

    deliveryBldg:   building,
    deliveryStreet: street,
    deliveryCity:   city,
    deliveryState:  state,
    deliveryZip:    zip,

    items: store.cart.map(item => ({
      menuItemId: Number(item.id),
      quantity:   Number(item.qty) || 1
    }))
  };

  try {
    const created = await apiPost('/orders', payload);

    // save snapshot for confirmation page
    store.lastOrder = {
      id: created?.id ?? null,
      placedAt: placedAt.toISOString(),
      etaMinutes,
      totals: {
        subtotal: totals.subtotal,
        serviceFee: totals.serviceFee,
        tip: totals.tip,
        total: totals.total
      },
      items: store.cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      delivery: {
        contactName,
        phone,
        building,
        street,
        city,
        state,
        zip
      }
    };

    // clear cart now that order is placed
    store.cart = [];
    saveStore();

    window.location.href = 'confirm.html';
  } catch (err) {
    console.error('Failed to place order:', err);
    alert('Could not place order. Please try again.');
  }
}
