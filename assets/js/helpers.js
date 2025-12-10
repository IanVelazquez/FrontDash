
// helpers.js

// format money as $X.XX
function fmt(n) {
  return `$${Number(n).toFixed(2)}`;
}

// fhow toast using #mainToast ajd #toastBody
function showToast(msg) {
  const tb = document.getElementById('toastBody');
  if (tb) tb.textContent = msg;

  const el = document.getElementById('mainToast');
  if (!el) return;

  const toast = bootstrap.Toast.getOrCreateInstance(el);
  toast.show();
}

// highlighty active navbar link
function setActiveNav(page) {
  document.querySelectorAll('.navbar-nav .nav-link').forEach(a => {
    if (a.getAttribute('href') === page) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

// converts form fields into a JS object
function formToObj(form) {
  const data = {};
  new FormData(form).forEach((v, k) => (data[k] = v));
  return data;
}

// quick number conversion
function toNumber(n) {
  const x = Number(n);
  return isNaN(x) ? 0 : x;
}

// totals

const SERVICE_RATE = 0.0825; // 8.25% serviec fee

function computeCartTotals() {
  if (!window.store || !Array.isArray(store.cart)) {
    return {
      itemsSubtotal: 0,
      serviceFee: 0,
      subtotal: 0,
      tip: 0,
      total: 0
    };
  }

  let itemsSubtotal = 0;
  for (const item of store.cart) {
    const price = Number(item.price) || 0;
    const qty   = Number(item.qty)   || 0;
    itemsSubtotal += price * qty;
  }

  const serviceFee = itemsSubtotal * SERVICE_RATE;
  const subtotal   = itemsSubtotal + serviceFee;

  // state uses pendingTipAmount
  const tip   = Number(store.pendingTipAmount || 0);
  const total = subtotal + tip;

  return {
    itemsSubtotal,
    serviceFee,
    subtotal,
    tip,
    total
  };
}

// ORDER BUILDER

function buildOrderPayloadFromState() {
  const totals = computeCartTotals();

  const items = (store.cart || []).map(it => ({
    menuItemId: Number(it.id),
    quantity: Number(it.qty) || 1
  }));

  return {
    subtotal: totals.subtotal,
    tip: totals.tip,
    total: totals.total,
    status: "new",
    items
  };
}


// api helpers

const API_BASE = "http://127.0.0.1:8080/api";

// get request
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`); 

  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// post request
async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body || {})
  });

  if (!res.ok) {
    let msg = `POST ${path} failed: ${res.status} ${res.statusText}`;
    try {
      const err = await res.text();
      if (err) msg += ` – ${err}`;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json();
}


// exporting globals

window.fmt = fmt;
window.showToast = showToast;
window.setActiveNav = setActiveNav;
window.formToObj = formToObj;
window.toNumber = toNumber;
window.computeCartTotals = computeCartTotals;
window.buildOrderPayloadFromState = buildOrderPayloadFromState;
window.apiGet = apiGet;
window.apiPost = apiPost;
