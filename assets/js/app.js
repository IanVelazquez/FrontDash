// assets/js/app.js

//load cart
document.addEventListener('DOMContentLoaded', () => {
  loadStore();
  initNavbar();
});

// initiatilaize navbar:
function initNavbar() {
  const openSwitch = document.getElementById('openSwitch');
  if (openSwitch) {
    openSwitch.checked = !!store.isOpen;

    openSwitch.addEventListener('change', () => {
      store.isOpen = openSwitch.checked;
      saveStore();

      // page reaction
      if (typeof window.onOpenStateChange === 'function') {
        window.onOpenStateChange();
      }
    });
  }

  // cart badge
  if (typeof updateCartCountBadge === 'function') {
    updateCartCountBadge();
  }
}

// highlight nav link
function setActiveNav(href) {
  const links = document.querySelectorAll('.navbar-nav .nav-link');
  links.forEach(link => {
    if (link.getAttribute('href') === href) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
