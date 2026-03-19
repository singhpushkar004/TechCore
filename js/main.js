/* ============================================================
   LumiDecor - Main JavaScript
   ============================================================ */

'use strict';

// ============================================================
// THEME SYSTEM
// ============================================================
const ThemeManager = {
  themes: ['dark', 'light', 'midnight'],
  current: 'dark',

  init() {
    const saved = localStorage.getItem('lumidecor-theme') || 'dark';
    this.apply(saved);
    this.bindButtons();
  },

  apply(theme) {
    this.current = theme;
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('lumidecor-theme', theme);

    // Update toggle buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  },

  bindButtons() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => this.apply(btn.dataset.theme));
    });
  }
};

// ============================================================
// NAVBAR
// ============================================================
const Navbar = {
  init() {
    this.navbar = document.querySelector('.navbar-luxury');
    this.scrollHandler();
    this.mobileMenu();
    this.searchToggle();
    window.addEventListener('scroll', () => this.scrollHandler());
  },

  scrollHandler() {
    if (!this.navbar) return;
    this.navbar.classList.toggle('scrolled', window.scrollY > 30);
  },

  mobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const closeBtn = document.querySelector('.mobile-nav-close');

    if (!toggle) return;

    const open = () => {
      toggle.classList.add('active');
      nav?.classList.add('open');
      overlay?.classList.add('open');
      document.body.classList.add('menu-open');
    };

    const close = () => {
      toggle.classList.remove('active');
      nav?.classList.remove('open');
      overlay?.classList.remove('open');
      document.body.classList.remove('menu-open');
    };

    toggle.addEventListener('click', () => {
      toggle.classList.contains('active') ? close() : open();
    });

    overlay?.addEventListener('click', close);
    closeBtn?.addEventListener('click', close);
  },

  searchToggle() {
    const searchBtn = document.querySelector('.search-toggle-btn');
    const searchInput = document.querySelector('.search-input-nav');
    if (!searchBtn || !searchInput) return;

    let open = false;
    searchBtn.addEventListener('click', () => {
      open = !open;
      searchInput.classList.toggle('open', open);
      if (open) searchInput.focus();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-search') && open) {
        open = false;
        searchInput.classList.remove('open');
      }
    });
  }
};

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
const ScrollAnimations = {
  init() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      this.observer.observe(el);
    });
  }
};

// ============================================================
// HERO PARTICLES
// ============================================================
const HeroParticles = {
  init() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'hero-particle';
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        animation-duration: ${Math.random() * 8 + 6}s;
        animation-delay: ${Math.random() * 6}s;
      `;
      container.appendChild(particle);
    }
  }
};

// ============================================================
// HERO RINGS
// ============================================================
const HeroRings = {
  init() {
    const glowEl = document.querySelector('.hero-lamp-glow');
    if (!glowEl) return;

    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 'hero-ring';
      ring.style.cssText = `
        position: absolute;
        border-radius: 50%;
        border: 1px solid var(--accent-glow);
        animation: ring-expand 4s ease-out infinite;
        animation-delay: ${i * 1.3}s;
        opacity: 0;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
      `;
      glowEl.appendChild(ring);
    }
  }
};

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
const Toast = {
  container: null,

  init() {
    this.container = document.querySelector('.toast-container-luxury');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container-luxury';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'success', duration = 3500) {
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      info: 'bi-info-circle-fill',
      warning: 'bi-exclamation-triangle-fill'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-luxury';
    toast.style.borderLeftColor = type === 'error' ? 'var(--badge-hot, #c44b2e)' :
                                   type === 'warning' ? 'var(--accent-secondary)' :
                                   'var(--accent-primary)';
    toast.innerHTML = `
      <i class="bi ${icons[type] || icons.success} toast-icon"></i>
      <span class="toast-msg">${message}</span>
      <i class="bi bi-x toast-close"></i>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => this.remove(toast));
    this.container.appendChild(toast);

    setTimeout(() => this.remove(toast), duration);
  },

  remove(toast) {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }
};

// ============================================================
// CART SYSTEM
// ============================================================
const Cart = {
  items: [],

  init() {
    this.items = JSON.parse(localStorage.getItem('lumidecor-cart') || '[]');
    this.updateCounter();
    this.bindAddButtons();
  },

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.save();
    this.updateCounter();
    Toast.show(`"${product.name}" added to cart`, 'success');
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    this.updateCounter();
  },

  save() {
    localStorage.setItem('lumidecor-cart', JSON.stringify(this.items));
  },

  updateCounter() {
    const total = this.items.reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = total;
      el.style.display = total > 0 ? 'flex' : 'none';
    });
  },

  bindAddButtons() {
    document.querySelectorAll('[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('[data-product]');
        if (card) {
          Cart.add({
            id: card.dataset.product,
            name: card.dataset.name || 'Product',
            price: parseFloat(card.dataset.price) || 0
          });
        }
      });
    });
  },

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }
};

// ============================================================
// WISHLIST
// ============================================================
const Wishlist = {
  items: [],

  init() {
    this.items = JSON.parse(localStorage.getItem('lumidecor-wishlist') || '[]');
    this.updateUI();
    this.bindButtons();
  },

  toggle(id, name) {
    if (this.items.includes(id)) {
      this.items = this.items.filter(i => i !== id);
      Toast.show(`Removed from wishlist`, 'info');
    } else {
      this.items.push(id);
      Toast.show(`"${name}" added to wishlist`, 'success');
    }
    this.save();
    this.updateUI();
  },

  save() {
    localStorage.setItem('lumidecor-wishlist', JSON.stringify(this.items));
  },

  updateUI() {
    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      const id = btn.dataset.wishlistBtn;
      btn.classList.toggle('active', this.items.includes(id));
    });

    document.querySelectorAll('.wishlist-count').forEach(el => {
      el.textContent = this.items.length;
      el.style.display = this.items.length > 0 ? 'flex' : 'none';
    });
  },

  bindButtons() {
    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('[data-product]');
        Wishlist.toggle(btn.dataset.wishlistBtn, card?.dataset.name || 'Product');
      });
    });
  }
};

// ============================================================
// FILTER SIDEBAR
// ============================================================
const FilterSidebar = {
  init() {
    const headings = document.querySelectorAll('.filter-heading');
    headings.forEach(h => {
      h.addEventListener('click', () => {
        const content = h.nextElementSibling;
        if (!content) return;
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : '';
        const icon = h.querySelector('.filter-toggle-icon');
        if (icon) icon.className = `bi bi-chevron-${isOpen ? 'down' : 'up'} filter-toggle-icon`;
      });
    });

    // Price slider
    const slider = document.querySelector('#price-slider');
    const display = document.querySelector('#price-display');
    if (slider && display) {
      slider.addEventListener('input', () => {
        display.textContent = `₹0 – ₹${parseInt(slider.value).toLocaleString()}`;
      });
    }

    // Filter options
    document.querySelectorAll('.filter-option').forEach(option => {
      option.addEventListener('click', () => {
        option.classList.toggle('selected');
      });
    });
  }
};

// ============================================================
// PRODUCT GALLERY (Detail Page)
// ============================================================
const ProductGallery = {
  init() {
    const thumbnails = document.querySelectorAll('.thumbnail-wrap');
    const mainImg = document.querySelector('.main-image-icon');
    if (!thumbnails.length) return;

    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        if (mainImg) {
          mainImg.className = `bi ${thumb.dataset.icon || 'bi-lightbulb'} main-image-icon`;
        }
      });
    });
  }
};

// ============================================================
// QUANTITY CONTROLS
// ============================================================
const QtyControls = {
  init() {
    document.querySelectorAll('.qty-control').forEach(control => {
      const input = control.querySelector('.qty-input');
      const dec = control.querySelector('.qty-dec');
      const inc = control.querySelector('.qty-inc');
      if (!input) return;

      dec?.addEventListener('click', () => {
        const v = parseInt(input.value) || 1;
        if (v > 1) input.value = v - 1;
        this.update(control, input.value);
      });

      inc?.addEventListener('click', () => {
        const v = parseInt(input.value) || 1;
        input.value = v + 1;
        this.update(control, input.value);
      });
    });
  },

  update(control, qty) {
    const card = control.closest('[data-cart-row]');
    if (!card) return;
    const price = parseFloat(card.dataset.price || 0);
    const itemTotal = card.querySelector('.item-total');
    if (itemTotal) itemTotal.textContent = `₹${(price * qty).toLocaleString()}`;
    CartPage.recalculate();
  }
};

// ============================================================
// CART PAGE
// ============================================================
const CartPage = {
  init() {
    if (!document.querySelector('.cart-page')) return;

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('[data-cart-row]');
        row?.remove();
        this.recalculate();
        Toast.show('Item removed from cart', 'info');
      });
    });

    this.recalculate();
  },

  recalculate() {
    let subtotal = 0;
    document.querySelectorAll('[data-cart-row]').forEach(row => {
      const price = parseFloat(row.dataset.price || 0);
      const qty = parseInt(row.querySelector('.qty-input')?.value || 1);
      subtotal += price * qty;
    });

    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + shipping;

    const setEl = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
    setEl('.summary-subtotal', `₹${subtotal.toLocaleString()}`);
    setEl('.summary-shipping', shipping === 0 ? 'Free' : `₹${shipping}`);
    setEl('.summary-grand-total', `₹${total.toLocaleString()}`);
  }
};

// ============================================================
// COUPON CODE
// ============================================================
const CouponCode = {
  init() {
    const btn = document.querySelector('#apply-coupon-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const input = document.querySelector('#coupon-input');
      const code = input?.value.trim().toUpperCase();
      if (code === 'LUMI20') {
        Toast.show('Coupon applied! 20% discount', 'success');
      } else if (code) {
        Toast.show('Invalid coupon code', 'error');
      }
    });
  }
};

// ============================================================
// CHECKOUT STEPS
// ============================================================
const Checkout = {
  step: 1,

  init() {
    if (!document.querySelector('.checkout-page')) return;
    this.render();

    document.querySelectorAll('[data-next-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.step = Math.min(this.step + 1, 3);
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[data-prev-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.step = Math.max(this.step - 1, 1);
        this.render();
      });
    });
  },

  render() {
    document.querySelectorAll('.checkout-step-section').forEach((sec, i) => {
      sec.style.display = (i + 1 === this.step) ? 'block' : 'none';
    });

    document.querySelectorAll('.checkout-step').forEach((step, i) => {
      step.classList.remove('active', 'done');
      if (i + 1 < this.step) step.classList.add('done');
      if (i + 1 === this.step) step.classList.add('active');
    });

    document.querySelectorAll('.step-line').forEach((line, i) => {
      line.classList.toggle('done', i < this.step - 1);
    });
  }
};

// ============================================================
// FORM VALIDATION
// ============================================================
const FormValidator = {
  init() {
    document.querySelectorAll('form[data-validate]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validate(form)) {
          const target = form.dataset.successMsg;
          Toast.show(target || 'Form submitted successfully!', 'success');
        }
      });
    });

    // Real-time validation
    document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
    });
  },

  validate(form) {
    let valid = true;
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
      if (!this.validateField(input)) valid = false;
    });
    return valid;
  },

  validateField(input) {
    const val = input.value.trim();
    let error = '';

    if (!val) {
      error = 'This field is required';
    } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      error = 'Enter a valid email address';
    } else if (input.type === 'tel' && !/^\d{10}$/.test(val.replace(/\D/g, ''))) {
      error = 'Enter a valid phone number';
    } else if (input.id === 'confirm-password') {
      const pass = document.querySelector('#password');
      if (pass && pass.value !== val) error = 'Passwords do not match';
    }

    const wrapper = input.closest('.form-group-luxury') || input.parentElement;
    let errorEl = wrapper.querySelector('.field-error');

    if (error) {
      input.style.borderColor = 'var(--badge-hot, #c44b2e)';
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.style.cssText = 'font-size:0.75rem;color:var(--badge-hot,#c44b2e);margin-top:4px;display:block;font-family:"Jost",sans-serif;';
        wrapper.appendChild(errorEl);
      }
      errorEl.textContent = error;
      return false;
    } else {
      input.style.borderColor = '';
      errorEl?.remove();
      return true;
    }
  }
};

// ============================================================
// PRODUCT REVIEW STARS
// ============================================================
const ReviewStars = {
  init() {
    document.querySelectorAll('.star-rating-input').forEach(container => {
      const stars = container.querySelectorAll('[data-star]');
      stars.forEach(star => {
        star.addEventListener('click', () => {
          const val = parseInt(star.dataset.star);
          stars.forEach((s, i) => {
            s.className = `bi bi-star${i < val ? '-fill' : ''} star-input-icon`;
          });
          const input = container.querySelector('input[name="rating"]');
          if (input) input.value = val;
        });

        star.addEventListener('mouseenter', () => {
          const val = parseInt(star.dataset.star);
          stars.forEach((s, i) => {
            s.className = `bi bi-star${i < val ? '-fill' : ''} star-input-icon`;
          });
        });
      });

      container.addEventListener('mouseleave', () => {
        const val = parseInt(container.querySelector('input[name="rating"]')?.value || 0);
        stars.forEach((s, i) => {
          s.className = `bi bi-star${i < val ? '-fill' : ''} star-input-icon`;
        });
      });
    });
  }
};

// ============================================================
// PASSWORD TOGGLE
// ============================================================
const PasswordToggle = {
  init() {
    document.querySelectorAll('.input-eye-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling || btn.closest('.input-group-luxury')?.querySelector('input');
        if (!input) return;
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        btn.querySelector('i').className = `bi bi-eye${isPass ? '-slash' : ''}`;
      });
    });
  }
};

// ============================================================
// QUICK VIEW MODAL
// ============================================================
const QuickView = {
  init() {
    document.querySelectorAll('[data-quickview]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('[data-product]');
        const name = card?.dataset.name || 'Product';
        const price = card?.dataset.price || '0';
        Toast.show(`Quick view: ${name} - ₹${parseInt(price).toLocaleString()}`, 'info');
      });
    });
  }
};

// ============================================================
// COUNTER ANIMATION
// ============================================================
const CounterAnimation = {
  init() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  },

  animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = Date.now();

    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }
};

// ============================================================
// LAZY LOAD IMAGES
// ============================================================
const LazyLoad = {
  init() {
    const imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    imgs.forEach(img => observer.observe(img));
  }
};

// ============================================================
// NEWSLETTER
// ============================================================
const Newsletter = {
  init() {
    document.querySelectorAll('[data-newsletter-form]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]')?.value;
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Toast.show('Thank you for subscribing to LumiDecor!', 'success');
          form.reset();
        } else {
          Toast.show('Please enter a valid email address', 'error');
        }
      });
    });
  }
};

// ============================================================
// SORT DROPDOWN
// ============================================================
const SortControl = {
  init() {
    const select = document.querySelector('#sort-select');
    if (!select) return;
    select.addEventListener('change', () => {
      Toast.show(`Sorting by: ${select.options[select.selectedIndex].text}`, 'info', 2000);
    });
  }
};

// ============================================================
// TABS (Product Detail)
// ============================================================
const ProductTabs = {
  init() {
    document.querySelectorAll('.product-tabs .nav-link').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabsContainer = tab.closest('.product-tabs-container');
        tabsContainer?.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.getAttribute('data-tab');
        tabsContainer?.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.toggle('show', pane.id === target);
          pane.classList.toggle('active', pane.id === target);
        });
      });
    });
  }
};

// ============================================================
// PAYMENT OPTION SELECTOR
// ============================================================
const PaymentSelector = {
  init() {
    document.querySelectorAll('.payment-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(o => {
          o.classList.remove('selected');
          o.style.borderColor = '';
        });
        option.classList.add('selected');
        option.style.borderColor = 'var(--accent-primary)';
      });
    });
  }
};

// ============================================================
// PAGE TRANSITION
// ============================================================
const PageTransition = {
  init() {
    document.querySelectorAll('a:not([href^="#"]):not([href^="javascript"]):not([target="_blank"])').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('mailto') || href.startsWith('tel')) return;
        
        // Only for same-site links
        if (!href.startsWith('http') || href.includes(window.location.host)) {
          e.preventDefault();
          const overlay = document.querySelector('.page-transition');
          if (overlay) {
            overlay.style.transition = 'transform 0.4s ease';
            overlay.style.transform = 'scaleY(1)';
            overlay.style.transformOrigin = 'bottom';
            setTimeout(() => { window.location.href = href; }, 400);
          } else {
            window.location.href = href;
          }
        }
      });
    });
  }
};

// ============================================================
// INIT ALL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Navbar.init();
  ScrollAnimations.init();
  HeroParticles.init();
  HeroRings.init();
  Toast.init();
  Cart.init();
  Wishlist.init();
  FilterSidebar.init();
  ProductGallery.init();
  QtyControls.init();
  CartPage.init();
  CouponCode.init();
  Checkout.init();
  FormValidator.init();
  ReviewStars.init();
  PasswordToggle.init();
  QuickView.init();
  CounterAnimation.init();
  LazyLoad.init();
  Newsletter.init();
  SortControl.init();
  ProductTabs.init();
  PaymentSelector.init();
  // PageTransition.init(); // Enable if using multi-file setup

  // Smooth in-page scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage || 
        (currentPage === '' && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
    }
  });
});
