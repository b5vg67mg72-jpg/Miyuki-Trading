const catalogEmail = 'yoichi.maegawa@gmail.com';
const categories = ['hobby', 'matcha', 'japanese-knives', 'lamb'];
const categoryNames = {
  hobby: 'Hobby Products',
  matcha: 'Matcha',
  'japanese-knives': 'Japanese Knives',
  lamb: 'Lamb'
};
const cart = new Map();

const showSelectedCategory = () => {
  const requestedCategory = window.location.hash.slice(1);
  const activeCategory = categories.includes(requestedCategory) ? requestedCategory : 'hobby';

  document.querySelectorAll('.catalog-category').forEach((section) => {
    const isActive = section.dataset.category === activeCategory;
    section.hidden = !isActive;
    section.classList.toggle('is-active', isActive);
  });

  document.querySelectorAll('.catalog-header nav a').forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${activeCategory}`;
    link.setAttribute('aria-current', isCurrent ? 'page' : 'false');
  });

  document.title = `${categoryNames[activeCategory]} Catalog | Miyuki Trading`;
};

const formatPrice = (product) => {
  if (typeof product.price !== 'number') return 'Price on request';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'JPY' }).format(product.price);
};

const renderEmptySlots = (grid) => {
  grid.innerHTML = Array.from({ length: 3 }, (_, index) => `
    <div class="product-slot" aria-label="Reserved product space ${index + 1}">
      <span>Product space ${String(index + 1).padStart(2, '0')}</span>
      <p>Ready for your product</p>
    </div>
  `).join('');
};

const addToCart = (product) => {
  const current = cart.get(product.id);
  cart.set(product.id, { product, quantity: current ? current.quantity + 1 : 1 });
  renderCart();
};

const renderProducts = (products) => {
  categories.forEach((category) => {
    const grid = document.querySelector(`[data-product-grid="${category}"]`);
    const categoryProducts = products.filter((product) => product.category === category);
    if (!categoryProducts.length) {
      renderEmptySlots(grid);
      return;
    }

    grid.innerHTML = '';
    categoryProducts.forEach((product) => {
      const card = document.querySelector('#product-card-template').content.firstElementChild.cloneNode(true);
      const image = card.querySelector('img');
      image.src = product.image;
      image.alt = product.imageAlt || product.name;
      card.querySelector('.product-code').textContent = product.code || categoryNames[category];
      card.querySelector('h3').textContent = product.name;
      card.querySelector('.product-description').textContent = product.description || '';
      card.querySelector('.product-price').textContent = formatPrice(product);
      card.querySelector('button').addEventListener('click', () => addToCart(product));
      grid.append(card);
    });
  });
};

const renderCart = () => {
  const items = [...cart.values()];
  const orderItems = document.querySelector('#order-items');
  const count = items.reduce((total, item) => total + item.quantity, 0);
  document.querySelector('#header-cart-count').textContent = count;

  if (!items.length) {
    orderItems.innerHTML = '<p class="order-empty">Your selected products will appear here. Product spaces are ready for your inventory.</p>';
    document.querySelector('#order-total').textContent = '—';
    document.querySelector('#order-button').disabled = true;
    return;
  }

  orderItems.innerHTML = '';
  items.forEach(({ product, quantity }) => {
    const line = document.createElement('div');
    line.className = 'order-line';
    line.innerHTML = `<span>${product.name} × ${quantity}</span><strong>${formatPrice(product)}</strong><button type="button">Remove</button>`;
    line.querySelector('button').addEventListener('click', () => {
      cart.delete(product.id);
      renderCart();
    });
    orderItems.append(line);
  });

  const pricedItems = items.filter(({ product }) => typeof product.price === 'number');
  const currencies = new Set(pricedItems.map(({ product }) => product.currency || 'JPY'));
  const total = pricedItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  document.querySelector('#order-total').textContent = pricedItems.length && currencies.size === 1
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: [...currencies][0] }).format(total)
    : 'To be confirmed';
  document.querySelector('#order-button').disabled = false;
};

document.querySelector('#order-button').addEventListener('click', () => {
  const lines = [...cart.values()].map(({ product, quantity }) => `- ${product.name} × ${quantity}`);
  const subject = encodeURIComponent('Miyuki Trading order request');
  const body = encodeURIComponent(`Hello Miyuki Trading,\n\nI would like to request the following products:\n${lines.join('\n')}\n\nPlease confirm availability, shipping, and the final total.\n`);
  window.location.href = `mailto:${catalogEmail}?subject=${subject}&body=${body}`;
});

fetch('products.json', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) throw new Error('Unable to load catalog products.');
    return response.json();
  })
  .then((products) => renderProducts(Array.isArray(products) ? products : []))
  .catch(() => categories.forEach((category) => renderEmptySlots(document.querySelector(`[data-product-grid="${category}"]`))));

renderCart();
showSelectedCategory();
window.addEventListener('hashchange', showSelectedCategory);
