// assets/js/pages/admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  //this will be specific to admins 
  if (typeof requireRole === 'function') {
    requireRole('admin');
  }

  // badge in navbar
  if (typeof renderAuthBadge === 'function') {
    renderAuthBadge('authArea');
  }

  // load initial data
  initStaffSection();
  initDriverSection();
});

/* managing the staf*/ 

async function loadStaffList() {
  try {
    const staff = await apiGet('/staff');  //api/staff
    renderStaffTable(staff || []);
  } catch (err) {
    console.error('Failed to load staff list', err);
    showToast('Error loading staff list.');
  }
}

function renderStaffTable(list) {
  const tbody = document.getElementById('staffTableBody');
  const countEl = document.getElementById('staffCount');
  const emptyRow = document.getElementById('noStaffRow');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (!Array.isArray(list) || list.length === 0) {
    if (emptyRow) emptyRow.classList.remove('d-none');
    if (countEl) countEl.textContent = '0';
    return;
  }

  if (emptyRow) emptyRow.classList.add('d-none');
  if (countEl) countEl.textContent = String(list.length);

  for (const s of list) {
    const tr = document.createElement('tr');

    const fullName = [s.firstName, s.lastName].filter(Boolean).join(' ');
    const email = s.email || '';
    const status = (s.status || '').toLowerCase();

    const badgeClass =
      status === 'active'
        ? 'badge bg-success'
        : status === 'inactive'
        ? 'badge bg-secondary'
        : 'badge bg-dark';

    tr.innerHTML = `
      <td><code>${s.username || ''}</code></td>
      <td>${fullName || '&mdash;'}</td>
      <td>${email || '&mdash;'}</td>
      <td><span class="${badgeClass}">${status || 'unknown'}</span></td>
      <td class="text-end">
        <!-- For now, just a disabled button so column isn’t empty -->
        <button class="btn btn-sm btn-outline-secondary" disabled>Manage</button>
      </td>
    `;

    tbody.appendChild(tr);
  }
}

function initStaffSection() {
  const form = document.getElementById('addStaffForm');
  if (!form) return;

  // initial load
  loadStaffList();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstEl = document.getElementById('staffFirst');
    const lastEl = document.getElementById('staffLast');
    const emailEl = document.getElementById('staffEmail');

    const firstName = (firstEl?.value || '').trim();
    const lastName = (lastEl?.value || '').trim();
    const email = (emailEl?.value || '').trim();

    let ok = true;

    // basic validation
    if (!firstName) {
      firstEl.classList.add('is-invalid');
      ok = false;
    } else {
      firstEl.classList.remove('is-invalid');
    }

    if (!lastName || !/^[A-Za-z]{2,}$/.test(lastName)) {
      lastEl.classList.add('is-invalid');
      ok = false;
    } else {
      lastEl.classList.remove('is-invalid');
    }

    // email should now be required
    if (!email || !emailEl.checkValidity()) {
      emailEl.classList.add('is-invalid');
      ok = false;
    } else {
      emailEl.classList.remove('is-invalid');
    }

    if (!ok) return;

    try {
      // Backend:
      //  create staff row, generate username with lastname and 2 digits, and create login row with default password
      const body = {
        firstName,
        lastName,
        email
      };

      const created = await apiPost('/staff', body);

      showToast(
        `Staff created: ${created.username || ''} (${created.firstName || ''} ${
          created.lastName || ''
        })`
      );

      // clear 
      form.reset();

      // refresh 
      await loadStaffList();
    } catch (err) {
      console.error('Failed to create staff', err);

      const msg = String(err).toLowerCase();
      if (msg.includes('409') || msg.includes('conflict')) {
        showToast('Unable to create staff: username / staff already exists.');
      } else {
        showToast('Error creating staff member.');
      }
    }
  });
}

/* driver managemnet*/

async function loadDriverList() {
  try {
    const drivers = await apiGet('/drivers'); //api/drivers
    renderDriverTable(drivers || []);
  } catch (err) {
    console.error('Failed to load driver list', err);
    showToast('Error loading driver list.');
  }
}

function renderDriverTable(list) {
  const tbody = document.getElementById('driverTableBody');
  const countEl = document.getElementById('driverCount');
  const emptyRow = document.getElementById('noDriverRow');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (!Array.isArray(list) || list.length === 0) {
    if (emptyRow) emptyRow.classList.remove('d-none');
    if (countEl) countEl.textContent = '0';
    return;
  }

  if (emptyRow) emptyRow.classList.add('d-none');
  if (countEl) countEl.textContent = String(list.length);

  for (const d of list) {
    const fullName = [d.firstName, d.lastName].filter(Boolean).join(' ');
    const status = (d.status || '').toLowerCase();

    const badgeClass =
      status === 'active'
        ? 'badge bg-success'
        : status === 'inactive'
        ? 'badge bg-secondary'
        : 'badge bg-dark';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fullName || '&mdash;'}</td>
      <td><span class="${badgeClass}">${status || 'unknown'}</span></td>
      <td class="text-end">
        <!-- placeholder for future actions; not required by assignment -->
        <button class="btn btn-sm btn-outline-secondary" disabled>Manage</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function initDriverSection() {
  const form = document.getElementById('addDriverForm');
  if (!form) return;

  // initial load
  loadDriverList();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstEl = document.getElementById('driverFirst');
    const lastEl = document.getElementById('driverLast');

    const firstName = (firstEl?.value || '').trim();
    const lastName = (lastEl?.value || '').trim();

    let ok = true;

    if (!firstName) {
      firstEl.classList.add('is-invalid');
      ok = false;
    } else {
      firstEl.classList.remove('is-invalid');
    }

    if (!lastName) {
      lastEl.classList.add('is-invalid');
      ok = false;
    } else {
      lastEl.classList.remove('is-invalid');
    }

    if (!ok) return;

    try {
      //  post api/drivers
      const body = {
        firstName,
        lastName,
        status: 'Active'
      };

      const created = await apiPost('/drivers', body);

      showToast(
        `Driver added: ${created.firstName || ''} ${created.lastName || ''} (${created.status ||
          ''})`
      );

      form.reset();
      await loadDriverList();
    } catch (err) {
      console.error('Failed to add driver', err);

      const msg = String(err).toLowerCase();
      if (msg.includes('409') || msg.includes('already exists') || msg.includes('duplicate')) {
        showToast('Driver already exists in the system.');
      } else {
        showToast('Error adding driver.');
      }
    }
  });
}
