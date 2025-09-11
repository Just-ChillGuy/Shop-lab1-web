// Получаем корзину из localStorage или пустой массив
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Сохраняем корзину в localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Рендер корзины
function renderCart() {
  const cart = getCart();
  const list = document.getElementById('cart-items');
  list.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.name}: ${item.price} ₽ × ${item.qty}
      <button class="minus" data-id="${item.id}">-</button>
      <button class="plus" data-id="${item.id}">+</button>
      <button class="remove" data-id="${item.id}">×</button>
    `;
    list.appendChild(li);
  });

  document.querySelector('.cart-total').textContent = `Общая сумма: ${total} ₽`;
  document.getElementById('cart-count').textContent = cart.reduce((sum, i) => sum + i.qty, 0);
}

// Добавление товара
document.querySelectorAll('.add-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const productId = btn.dataset.id;
    let cart = getCart();
    let item = cart.find(x => x.id === productId);

    if (item) {
      item.qty++;
    } else {
      cart.push({
        id: productId,
        name: btn.closest('.product-card').querySelector('h3').textContent,
        price: +btn.closest('.product-card').querySelector('p').textContent.replace(/\D/g, ''),
        qty: 1
      });
    }

    saveCart(cart);
    renderCart();
  });
});

// Обработка кнопок в корзине
document.getElementById('cart-items').addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  let cart = getCart();

  if (e.target.classList.contains('remove')) {
    cart = cart.filter(i => i.id !== id);
  }
  if (e.target.classList.contains('plus')) {
    cart.find(i => i.id === id).qty++;
  }
  if (e.target.classList.contains('minus')) {
    let item = cart.find(i => i.id === id);
    item.qty--;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  }

  saveCart(cart);
  renderCart();
});

// Показ формы заказа
document.getElementById('checkout').addEventListener('click', () => {
  document.getElementById('order-form').style.display = 'block';
});

// Обработка отправки формы
document.querySelector('#order-form form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Заказ создан!');
  localStorage.removeItem('cart');
  renderCart();
  this.reset();
});

// При загрузке страницы восстановить корзину
document.addEventListener('DOMContentLoaded', renderCart);
