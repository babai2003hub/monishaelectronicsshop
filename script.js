// ============================================================
// MONISHA ELECTRONICS — interactions
// ============================================================
(function () {
  'use strict';

  /* ---------- Shutter intro cleanup ---------- */
  const shutter = document.getElementById('shutter');
  if (shutter) {
    window.setTimeout(() => { shutter.style.display = 'none'; }, 950);
  }

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Mobile search toggle ---------- */
  const searchToggle = document.getElementById('searchToggle');
  const searchForm = document.querySelector('.search-form');
  if (searchToggle && searchForm) {
    searchToggle.addEventListener('click', () => {
      const isOpen = searchForm.classList.toggle('mobile-open');
      searchToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        const input = document.getElementById('searchInput');
        if (input) input.focus();
      }
    });
  }

  /* ---------- Search (simple scroll-to + filter feedback) ---------- */
  const searchForm2 = document.querySelector('.search-form');
  if (searchForm2) {
    searchForm2.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('searchInput').value.trim();
      if (q) {
        document.getElementById('bestsellers').scrollIntoView({ behavior: 'smooth' });
        showToast(`Showing results near "${q}"`);
      }
    });
  }

  /* ---------- CART STATE ---------- */
  let cart = []; // { name, price, qty }

  const cartCountEl = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');

  function formatINR(num) {
    return '₹' + num.toLocaleString('en-IN');
  }

  function addToCart(name, price) {
    const existing = cart.find((item) => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    renderCart();
    showToast(`${name} added to cart`);
  }

  function changeQty(name, delta) {
    const item = cart.find((i) => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.name !== name);
    }
    renderCart();
  }

  function removeFromCart(name) {
    cart = cart.filter((i) => i.name !== name);
    renderCart();
  }

  function renderCart() {
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

    cartCountEl.textContent = String(totalQty);
    document.getElementById('cartToggle').setAttribute('aria-label', `Open cart, ${totalQty} items`);
    cartTotalEl.textContent = formatINR(totalPrice);

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Browse the showroom and tap <strong>Add to Cart</strong> on anything you like.</p>';
      return;
    }

    cartItemsEl.innerHTML = cart.map((item) => `
      <div class="cart-item" data-name="${escapeHtml(item.name)}">
        <div class="cart-item-thumb">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="1.6"/></svg>
        </div>
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <span class="cart-item-price">${formatINR(item.price)} each</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `).join('');

    // wire up qty buttons
    cartItemsEl.querySelectorAll('.cart-item').forEach((row) => {
      const name = row.getAttribute('data-name');
      row.querySelector('[data-action="inc"]').addEventListener('click', () => changeQty(name, 1));
      row.querySelector('[data-action="dec"]').addEventListener('click', () => changeQty(name, -1));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- Wire up all Add to Cart buttons ---------- */
  document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-add');
      const price = parseFloat(btn.getAttribute('data-price'), 10);
      addToCart(name, price);

      // micro feedback on the button itself
      const original = btn.textContent;
      btn.textContent = 'Added ✓';
      btn.classList.add('added');
      window.setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('added');
      }, 1200);
    });
  });

  /* ---------- Cart drawer open/close ---------- */
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartToggle.setAttribute('aria-expanded', 'true');
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartToggle.setAttribute('aria-expanded', 'false');
  }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  /* ---------- Checkout button ---------- */
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
      }
      showToast('Demo checkout — connect a payment provider to go live');
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  /* ---------- init ---------- */
  renderCart();
})();
