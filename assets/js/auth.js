// auth.js

const KEY_AUTH = 'fd_auth';

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(KEY_AUTH) || 'null');
  } catch {
    return null;
  }
}

function setAuth(auth) {
  if (!auth) {
    localStorage.removeItem(KEY_AUTH);
  } else {
    localStorage.setItem(KEY_AUTH, JSON.stringify(auth));
  }
}

function clearAuth() {
  localStorage.removeItem(KEY_AUTH);
}

/**
 * gates page to a roles and redirects login if not authorized
 * @param {'admin'|'staff'|Array<'admin'|'staff'>} allowed
 */
function requireRole(allowed) {
  const auth = getAuth();
  const ok = auth && (Array.isArray(allowed)
    ? allowed.includes(auth.role)
    : auth.role === allowed);

  if (!ok) {
    const wantAdmin = Array.isArray(allowed)
      ? allowed.includes('admin')
      : allowed === 'admin';
    const hash = wantAdmin ? '#admin' : '#staff';
    window.location.href = 'login.html' + hash;
  }
}

/**
 * signed in as user, logout button and or a login link if not signed in
 * @param {HTMLElement|string} target 
 */
function renderAuthBadge(target) {
  const el = (typeof target === 'string')
    ? document.getElementById(target)
    : target;
  if (!el) return;

  const auth = getAuth();

  if (!auth) {
    el.innerHTML = `<a class="btn btn-outline-light" href="login.html">Login</a>`;
    return;
  }

  const roleLabel = auth.role === 'admin' ? 'Admin' : 'Staff';
  el.innerHTML = `
    <span class="badge rounded-pill text-bg-secondary">
      Signed in: ${roleLabel} • ${auth.username}
    </span>
    <button class="btn btn-outline-light btn-sm" id="signOutBtn">Sign out</button>
  `;
  const btn = document.getElementById('signOutBtn');
  btn?.addEventListener('click', () => {
    const hash = auth.role === 'admin' ? '#admin' : '#staff';
    clearAuth();
    window.location.href = 'login.html' + hash;
  });
}
