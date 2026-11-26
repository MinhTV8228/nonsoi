/**
 * Common JavaScript for Nõn Sợi website
 * Handles navbar functionality and page initialization
 */

window.parsePrice = function (value) {
  const text = String(value == null ? '' : value);
  const amount = Number(text.replace(/[^0-9.-]/g, '')) || 0;
  return text.includes('$') ? Math.round(amount * 25000) : amount;
};

window.formatVND = function (value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(window.parsePrice(value)) + ' ₫';
};

window.formatVNDHTML = function (value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(window.parsePrice(value)) + ' <span class="currency-symbol">₫</span>';
};

window.showSiteToast = function (message, type) {
  let toastContainer = document.querySelector('.site-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'site-toast-container';
    const header = document.querySelector('.navbar');
    const toastTop = header ? header.getBoundingClientRect().bottom + 10 : 20;
    toastContainer.style.top = toastTop + 'px';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'site-toast site-toast-' + (type === 'info' ? 'delete' : 'success');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const messageElement = document.createElement('span');
  messageElement.textContent = message;
  const progress = document.createElement('span');
  progress.className = 'site-toast-progress';
  toast.appendChild(messageElement);
  toast.appendChild(progress);
  toastContainer.appendChild(toast);

  setTimeout(function () {
    toast.remove();
    if (!toastContainer.children.length) toastContainer.remove();
  }, 2500);
};

document.addEventListener('click', function (event) {
  const card = event.target.closest('.product-card[data-detail-url]');
  if (!card || event.target.closest('button, a')) return;
  window.location.href = card.dataset.detailUrl;
});

document.addEventListener('keydown', function (event) {
  const card = event.target.closest('.product-card[data-detail-url]');
  if (!card || event.target !== card || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  window.location.href = card.dataset.detailUrl;
});

/**
 * Function to call after header is loaded
 */
window.initializeHeaderComponents = function () {
  initializeNavbar();
  setActiveNavItem();
  scheduleActiveNavRefresh();

  // Initialize submenu handlers after header loads
  setTimeout(function () {
    initializeSubmenuHandlers();
  }, 100);
};

function scheduleActiveNavRefresh() {
  [0, 100, 500, 1000].forEach(function (delay) {
    setTimeout(setActiveNavItem, delay);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Initialize navbar functionality - will be called after header loads
  initializeNavbar();

  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    const headerObserver = new MutationObserver(function () {
      setActiveNavItem();
      scheduleActiveNavRefresh();
      if (window.cartManager) window.cartManager.updateCartUI();
      if (window.wishlistManager) window.wishlistManager.updateWishlistUI();
    });
    headerObserver.observe(headerPlaceholder, { childList: true });
  }

  // Set active navigation item
  setActiveNavItem();
  scheduleActiveNavRefresh();

  // Initialize animations
  initializeAnimations();

  // Initialize header scroll behavior
  initializeHeaderScroll();

  // Initialize back to top button
  initializeBackToTop();

  // Initialize badges for cart and wishlist
  initializeBadges();

  // Also initialize after a delay to ensure header is loaded
  setTimeout(function () {
    initializeNavbar();
  }, 1000);
});

/**
 * Initialize cart and wishlist badges on page load
 */
function initializeBadges() {
  // Wait a bit for cart and wishlist managers to be ready
  setTimeout(() => {
    // Initialize cart badge if cart manager exists
    if (typeof window.cartManager !== 'undefined') {
      window.cartManager.updateCartBadge();
    }

    // Initialize wishlist badge if wishlist manager exists  
    if (typeof window.wishlistManager !== 'undefined') {
      window.wishlistManager.updateWishlistBadge();
    }

    // Fallback: directly update badges from localStorage
    updateBadgesFromStorage();

    // Additional delay for wishlist specifically
    setTimeout(() => {
      if (typeof window.wishlistManager !== 'undefined') {
        window.wishlistManager.updateWishlistBadge();
      }
    }, 200);
  }, 100);
}

/**
 * Update badges directly from localStorage as fallback
 */
function updateBadgesFromStorage() {
  try {
    // Update giỏ hàng badge
    const cartData = localStorage.getItem('Nõn Sợi_cart');
    const cartItems = cartData ? JSON.parse(cartData) : [];
    const cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

    const cartBadge = $('.cart-badge');
    const cartIcon = $('a[title="Giỏ hàng"]');

    if (cartCount > 0) {
      cartBadge.text(cartCount > 99 ? '99+' : cartCount).show();
    } else {
      cartBadge.hide();
    }

    // Remove any background classes from cart icon
    cartIcon.removeClass('cart-has-items');

    // Update wishlist badge  
    const wishlistData = localStorage.getItem('Nõn Sợi_wishlist'); // Fixed key name
    const wishlistItems = wishlistData ? JSON.parse(wishlistData) : [];
    const wishlistCount = wishlistItems.length;

    const wishlistBadge = $('.wishlist-badge');
    const wishlistIcon = $('a[title="Danh sách yêu thích"]');

    if (wishlistCount > 0) {
      wishlistBadge.text(wishlistCount > 99 ? '99+' : wishlistCount).show();
    } else {
      wishlistBadge.hide();
    }

    // Remove any background classes from wishlist icon
    wishlistIcon.removeClass('wishlist-has-items');

    console.log('Badges initialized from storage - Cart:', cartCount, 'Wishlist:', wishlistCount);
  } catch (error) {
    console.error('Error updating badges from storage:', error);
  }
}

/**
 * Initialize navbar dropdown functionality
 * This function can be called multiple times safely
 */
function initializeNavbar() {
  // Bootstrap handles the desktop dropdown behavior through the markup attributes.
}

/**
 * Set active navigation item based on current page
 */
function setActiveNavItem() {
  const currentPage = getCurrentTrangName();
  const navLinks = document.querySelectorAll('.nav-link[data-page], .wishlist-icon[data-page], .cart-icon[data-page]');

  navLinks.forEach(function (link) {
    const isActive = Boolean(currentPage) && link.getAttribute('data-page') === currentPage;

    link.classList.toggle('active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
      link.style.setProperty('color', 'var(--header-main)', 'important');
      link.style.setProperty('text-decoration', 'none', 'important');
    } else {
      link.removeAttribute('aria-current');
      link.style.removeProperty('color');
      link.style.removeProperty('text-decoration');
    }
  });
}

/**
 * Get current page name from URL
 */
function getCurrentTrangName() {
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);
  let filename = (segments.pop() || '').toLowerCase();

  if (!filename) {
    return 'home';
  }

  filename = filename.replace(/\.html$/i, '');

  // Map filenames to page names
  const pageMap = {
    'index': 'home',
    'about': 'about',
    'contact': 'contact',
    'feedback': 'feedback',
    'policies-and-term': 'policies',
    'wishlist': 'wishlist',
    'cart': 'cart',
    'login': '',
    'register': '',
    // Product pages
    'all-products': 'products',
    'towels': 'products',
    'bath-robes': 'products',
    'bath-towels': 'products',
    'face-towels': 'products',
    'hand-towels': 'products',
    'best-sellers': 'products',
    'new-products': 'products',
    'sale-products': 'products',
    'bath-robe-detail': 'products',
    'bath-towel-detail': 'products',
    'face-towel-detail': 'products',
    'hand-towel-detail': 'products'
  };

  return pageMap[filename] || '';
}

/**
 * Initialize page animations
 */
function initializeAnimations() {
  // Add fade-in animation to main content
  const mainContent = document.querySelector('main, .container');
  if (mainContent) {
    mainContent.classList.add('fade-in');
  }

  if (!('IntersectionObserver' in window)) return;

  const revealSelector =
    'main > *, main section, body > section, body > article, .card, .about-description > *';
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -40px 0px'
  });

  function observeRevealTargets(root) {
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    if (root.matches && root.matches(revealSelector) && !root.classList.contains('scroll-reveal')) {
      root.classList.add('scroll-reveal');
      revealObserver.observe(root);
    }

    root.querySelectorAll(revealSelector).forEach(function (target) {
      if (target.classList.contains('scroll-reveal')) return;
      target.classList.add('scroll-reveal');
      revealObserver.observe(target);
    });
  }

  observeRevealTargets(document);

  const contentObserver = new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(observeRevealTargets);
    });
  });
  contentObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Search functionality
 */
function initializeSearch() {
  const searchInput = document.querySelector('.search-input');

  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const searchTerm = this.value.trim();

        if (searchTerm) {
          // Implement search functionality here
          console.log('Searching for:', searchTerm);
          // You can add actual search logic here
        }
      }
    });
  }
}

/**
 * Utility functions
 */
const Utils = {
  // Smooth scroll to element
  scrollTo: function (element) {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  },

  // Show loading state
  showLoading: function () {
    document.body.style.cursor = 'wait';
  },

  // Hide loading state
  hideLoading: function () {
    document.body.style.cursor = 'default';
  },

  // Debounce function for performance
  debounce: function (func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function () {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

/**
 * Initialize header scroll behavior
 */
function initializeHeaderScroll() {
  setTimeout(() => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Keep the header visible while scrolling.
    navbar.classList.remove('header-hidden');
    navbar.classList.add('header-visible');
  }, 500); // Wait for header component to load
}

/**
 * Initialize back to top button
 */
function initializeBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  // Show/hide button based on scroll position
  const toggleButton = Utils.debounce(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  }, 10);

  // Smooth scroll to top when clicked
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Listen for scroll events
  window.addEventListener('scroll', toggleButton);
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSearch);

// Export for use in other files if needed
window.NONSOI = {
  initializeNavbar,
  setActiveNavItem,
  getCurrentTrangName,
  initializeAnimations,
  initializeHeaderScroll,
  initializeBackToTop,
  Utils
};




