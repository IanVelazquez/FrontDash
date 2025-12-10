// assets/js/pages/home.js

window.onOpenStateChange = () => renderMenu();

// helper for reading DOM elements
function $(id) {
  return document.getElementById(id);
}

//initiate

document.addEventListener('DOMContentLoaded', () => {
  console.log('[home] DOM loaded, init filters + load menu');

  // search + filter
  initHomeFilters();

  // load menu from api
  loadMenuFromApi();
});

// wire search box & category dropdown
function initHomeFilters() {
  const searchInput = $('searchInput');
  const categoryFilter = $('categoryFilter');

  if (searchInput) {
    searchInput.addEventListener('input', () => renderMenu());
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => renderMenu());
  }
}


//  loads menu from backend

async function loadMenuFromApi() {
  try {
    console.log('[home] Requesting menu items from /api/menu-items ...');

    // GET http://127.0.0.1:8080/api/menu-items  (contained in api.js file)
    const data = await apiGet('/menu-items');

    console.log('[home] Raw menu API data:', data);

    if (!Array.isArray(data)) {
      console.error('[home] Menu API returned non-array', data);
      showToast && showToast('Could not load menu (invalid data).');
      store.menu = [];
      renderCategories();
      renderMenu();
      return;
    }

    // map backend rows into the shape t match the frontend
    // menu_item entity has id, name, price, availability
    store.menu = data.map(row => ({
      id: String(row.id),
      name: row.name,
      price: Number(row.price),
      category: 'Menu',
      available: (row.availability || '').toLowerCase() === 'available'
    }));

    console.log('[home] Normalized menu items for store.menu:', store.menu);

    renderCategories();
    renderMenu();
  } catch (err) {
    console.error('[home] Failed to load menu:', err);
    showToast && showToast('Could not load menu. Please try again later.');
  }
}


//  food categories 

function renderCategories() {
  const sel = $('categoryFilter');
  if (!sel) return;

  const cats = Array.from(
    new Set((store.menu || []).map(m => m.category || 'Menu'))
  ).sort();

  sel.innerHTML =
    `<option value="all">All Categories</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

// main render
function renderMenu() {
  const grid = $('menuGrid');
  if (!grid) return;

  const q = ( $('searchInput')?.value || '' ).toLowerCase();
  const cat = $('categoryFilter')?.value || 'all';

  const closed = !store.isOpen;
  const alertEl = $('openAlert');
  if (alertEl) {
    alertEl.classList.toggle('d-none', !closed);
  }

  const items = store.menu || [];
  console.log('[home] renderMenu, items length =', items.length);

  const filtered = items.filter(m => {
    const okCat = cat === 'all' || m.category === cat;
    const okText = m.name.toLowerCase().includes(q);
    return okCat && okText;
  });

  grid.innerHTML = filtered.map(m => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h2 class="h5 mb-0">${m.name}</h2>
            <span class="badge ${m.available ? 'badge-available' : 'badge-soldout'}">
              ${m.available ? 'Available' : 'Sold Out'}
            </span>
          </div>
          <p class="text-muted mb-4">Category: ${m.category || 'Menu'}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <strong>${fmt(m.price)}</strong>
            <div class="d-flex align-items-center gap-2">
              <input
                type="number"
                min="1"
                value="1"
                class="form-control form-control-sm qty-input"
                id="qty-${m.id}"
                ${( !m.available || closed ) ? 'disabled' : ''}
              >
              <button
                class="btn btn-sm btn-primary ${( !m.available || closed ) ? 'cursor-not-allowed' : ''}"
                ${( !m.available || closed ) ? 'disabled' : ''}
                data-add="${m.id}"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  //  handlers to add buttons
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-add');
      const item = (store.menu || []).find(x => x.id === id);
      if (!item) return;

      if (!store.isOpen) {
        showToast && showToast('Sorry, we are closed.');
        return;
      }
      if (!item.available) {
        showToast && showToast('This item is sold out.');
        return;
      }

      const qtyInput = $(`qty-${id}`);
      const qty = Math.max(1, parseInt(qtyInput?.value || '1', 10));

      const existing = store.cart.find(c => c.id === id);
      if (existing) {
        existing.qty += qty;
      } else {
        store.cart.push({
          id: item.id,
          name: item.name,
          price: item.price,
          qty
        });
      }

      saveStore && saveStore();
      updateCartCountBadge && updateCartCountBadge();
      showToast && showToast(`${item.name} added to cart`);
    });
  });
}
