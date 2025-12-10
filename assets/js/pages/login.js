// login.js

// write auth object into local storage with KEY_AUTH in auth.js
function saveAuth(obj) {
  localStorage.setItem(KEY_AUTH, JSON.stringify(obj));
}

function showError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('d-none');
  setTimeout(() => el.classList.add('d-none'), 3000);
}

function bannerSignedIn(auth) {
  const wrap = document.getElementById('loginStatus');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="alert alert-info d-flex justify-content-between align-items-center">
      <div>
        <strong>Already signed in:</strong>
        ${auth.role === 'admin' ? 'Admin' : 'Staff'} • <code>${auth.username}</code>.
        Please sign out to switch roles.
      </div>
      <button class="btn btn-outline-primary btn-sm" id="logoutBtn">Sign out</button>
    </div>
  `;
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    clearAuth();
    location.reload();
  });
}

function disableForms() {
  ['staffLoginForm', 'adminLoginForm'].forEach(id => {
    const f = document.getElementById(id);
    if (!f) return;
    f.querySelectorAll('input,button,select').forEach(el => {
      el.setAttribute('disabled', 'disabled');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const wantAdmin = (location.hash === '#admin' || location.hash === '#adminPane');
  const initialTab = document.getElementById(wantAdmin ? 'admin-tab' : 'staff-tab');
  if (initialTab && window.bootstrap?.Tab) {
    new bootstrap.Tab(initialTab).show();
  }
  document.getElementById('admin-tab')?.addEventListener('shown.bs.tab', () => {
    history.replaceState(null, '', '#admin');
  });
  document.getElementById('staff-tab')?.addEventListener('shown.bs.tab', () => {
    history.replaceState(null, '', '#staff');
  });

  // if already signed in, show banner and dont allow form completioon
  const auth = getAuth();
  if (auth) {
    bannerSignedIn(auth);
    disableForms();
  }

  //staff 
  const staffForm = document.getElementById('staffLoginForm');
  staffForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (getAuth()) return; // cant have 2 people signed in at the same time

    const uEl = document.getElementById('staffUsername');
    const pEl = document.getElementById('staffPassword');

    let ok = true;
    const uname = (uEl.value || '').trim();
    const pw    = (pEl.value || '').trim();

    if (!isUsernameStudentFormat(uname)) {
      uEl.classList.add('is-invalid'); ok = false;
    } else {
      uEl.classList.remove('is-invalid');
    }
    if (!isPasswordPolicy(pw)) {
      pEl.classList.add('is-invalid'); ok = false;
    } else {
      pEl.classList.remove('is-invalid');
    }
    if (!ok) {
      showError('staffLoginError');
      return;
    }

    try {
      // call spring boot
      const resp = await apiPost('/auth/login', {
        username: uname,
        password: pw,
        role: 'staff'
      });

      // resp is login response from AuthController
      saveAuth({
        role: resp.role,          // "staff"
        username: resp.username,  // "arthur01"
        staffId: resp.staffId,
        firstName: resp.firstName,
        lastName: resp.lastName,
        status: resp.status,
        time: Date.now()
      });

      window.location.href = 'staff-dashboard.html';
    } catch (err) {
      console.error('Staff login failed', err);
      showError('staffLoginError');
    }
  });

  // admin side
  const adminForm = document.getElementById('adminLoginForm');
  adminForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (getAuth()) return; // must sign out first

    const uEl = document.getElementById('adminUsername');
    const pEl = document.getElementById('adminPassword');

    let ok = true;
    const uname = (uEl.value || '').trim();
    const pw    = (pEl.value || '').trim();

    if (!uname) {
      uEl.classList.add('is-invalid'); ok = false;
    } else {
      uEl.classList.remove('is-invalid');
    }
    if (!isPasswordPolicy(pw)) {
      pEl.classList.add('is-invalid'); ok = false;
    } else {
      pEl.classList.remove('is-invalid');
    }
    if (!ok) {
      showError('adminLoginError');
      return;
    }

    try {
      const resp = await apiPost('/auth/login', {
        username: uname,
        password: pw,
        role: 'admin'
      });

      saveAuth({
        role: resp.role,          // "admin"
        username: resp.username,  // "admin99"
        time: Date.now()
      });

      window.location.href = 'admin-dashboard.html';
    } catch (err) {
      console.error('Admin login failed', err);
      showError('adminLoginError');
    }
  });
});
