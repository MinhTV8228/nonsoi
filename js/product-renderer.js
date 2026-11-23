
(function () {
  'use strict';

  function money(value) {
    return window.formatVNDHTML(value);
  }

  function createCard(product, imageOnly) {
    const col = document.createElement('div');
    col.className = 'col';

    if (imageOnly) {
      const tile = document.createElement('div');
      tile.className = 'featured-product';
      tile.dataset.productId = product.id;
      tile.tabIndex = 0;
      tile.setAttribute('role', 'link');
      tile.setAttribute('aria-label', 'Xem ' + product.name);
      tile.dataset.detailUrl =
        (product.detailPage || 'all-products.html') +
        '?id=' + encodeURIComponent(product.id);

      tile.innerHTML =
        '<img class="featured-product-image" loading="lazy">' +
        '<div class="featured-product-overlay">' +
        '</div>';

      tile.querySelector('img').src = product.image;
      tile.querySelector('img').alt = product.name;

      tile.addEventListener('click', function () {
        window.location.href = tile.dataset.detailUrl;
      });

      tile.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.location.href = tile.dataset.detailUrl;
        }
      });

      col.appendChild(tile);
      return col;
    }

    const card = document.createElement('div');
    card.className = 'card product-card h-100';

    card.innerHTML =
      '<img class="card-img-top" loading="lazy">' +
      '<div class="card-body">' +
      '<h5 class="card-title"></h5>' +
      '<p class="product-description"></p>' +
      '<div class="d-flex align-items-center mb-3">' +
      '<span class="price"></span>' +
      '<span class="old-price"></span>' +
      '</div>' +
      '</div>';

    card.querySelector('img').src = product.image;
    card.querySelector('img').alt = product.name;
    card.querySelector('.card-title').textContent = product.name;
    card.dataset.productId = product.id;

    card.querySelector('.product-description').textContent =
      product.description || '';

    card.querySelector('.price').innerHTML =
      money(product.price);

    card.querySelector('.old-price').innerHTML =
      product.oldPrice ? money(product.oldPrice) : '';

    const detailUrl =
      (product.detailPage || 'all-products.html') +
      '?id=' + encodeURIComponent(product.id);

    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', 'Xem ' + product.name);
    card.dataset.detailUrl = detailUrl;
    card.style.cursor = 'pointer';

    card.addEventListener('click', function () {
      window.location.href = card.dataset.detailUrl;
    });

    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = card.dataset.detailUrl;
      }
    });

    col.appendChild(card);
    return col;
  }

  function productsFor(filter) {
    const products = window.NONSOI_PRODUCTS || [];

    if (!filter || filter === 'all') return products;

    if (filter === 'sale') {
      return products.filter(function (product) {
        return product.isSale === true;
      });
    }

    if (filter === 'best') {
      return products.filter(function (product) {
        return product.isBestSeller === true;
      });
    }

    if (filter === 'new') {
      return products.filter(function (product) {
        return product.isNew === true;
      });
    }

    if (filter === 'towels') {
      return products.filter(function (product) {
        return ['bath', 'face', 'hand'].indexOf(product.category) !== -1;
      });
    }

    return products.filter(function (product) {
      return product.category === filter;
    });
  }

  function render(section) {
    const sourceRows = section.querySelectorAll('.row:has(.product-card)');

    sourceRows.forEach(function (row) {
      row.remove();
    });

    const imageOnly = section.classList.contains('new-products');

    const products = productsFor(section.dataset.productFilter)
      .slice(0, Number(section.dataset.productLimit) || undefined);

    const row = document.createElement('div');
    row.className = 'row row-cols-1 row-cols-md-4 g-4 mb-4';

    products.forEach(function (product) {
      row.appendChild(createCard(product, imageOnly));
    });

    if (!products.length) {
      const emptyState = document.createElement('p');
      emptyState.className = 'text-muted';
      emptyState.textContent =
        'Chưa có sản phẩm trong danh mục này.';

      row.appendChild(emptyState);
    }

    const followingContent = section.querySelector(
      '.text-center.mt-4, .text-center.mt-5'
    );

    section.insertBefore(row, followingContent || null);
  }

  function init() {
    document.querySelectorAll('[data-product-filter]').forEach(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
