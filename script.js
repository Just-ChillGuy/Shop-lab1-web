// script.js — логика корзины и формы заказа
document.addEventListener('DOMContentLoaded', () => {

  const STORAGE_KEY = 'shop_cart_v1';

  // Получаем корзину из localStorage или пустую
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  // Сохраняем корзину в localStorage
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  // Рендер корзины: список, количество и общая сумма
  function renderCart() {
    const cart = getCart();
    const list = document.getElementById('cart-items');
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');

    list.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
      total += item.price * item.qty;

      const li = document.createElement('li');
      // внутренний HTML с контролами: минус, число, плюс, удалить
      li.innerHTML = `
        <div class="meta">
          <strong>${escapeHtml(item.name)}</strong>
          <div class="muted">${item.price} ₽ each</div>
        </div>
        <div class="controls">
          <button class="minus" data-id="${item.id}" aria-label="уменьшить">-</button>
          <span class="qty">${item.qty}</span>
          <button class="plus" data-id="${item.id}" aria-label="увеличить">+</button>
          <div style="width:12px"></div>
          <div>${(item.price * item.qty).toLocaleString()} ₽</div>
          <button class="remove" data-id="${item.id}" aria-label="удалить">×</button>
        </div>
      `;
      list.appendChild(li);
    });

    countEl.textContent = cart.reduce((s, it) => s + it.qty, 0);
    totalEl.textContent = total.toLocaleString();
  }

  // Экранирование текста (необязательно, но безопасно)
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  // Добавление в корзину (используем data-атрибуты)
  document.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const price = Number(btn.dataset.price) || 0;
      const name = btn.closest('.product-card').querySelector('h3').textContent.trim();

      const cart = getCart();
      const existing = cart.find(i => i.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, name, price, qty: 1 });
      }
      saveCart(cart);
      renderCart();
      showToast('Товар добавлен в корзину');
    });
  });

  // Делегирование кликов внутри корзины: +, -, удалить
  document.getElementById('cart-items').addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    let cart = getCart();

    if (e.target.classList.contains('remove')) {
      cart = cart.filter(i => i.id !== id);
    } else if (e.target.classList.contains('plus')) {
      const it = cart.find(i => i.id === id);
      if (it) it.qty += 1;
    } else if (e.target.classList.contains('minus')) {
      const it = cart.find(i => i.id === id);
      if (it) {
        it.qty -= 1;
        if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
      }
    }
    saveCart(cart);
    renderCart();
  });

  // Кнопка "Оформить заказ" — показать форму
  document.getElementById('checkout').addEventListener('click', () => {
    document.getElementById('order-form').classList.remove('hidden');
    document.getElementById('order-form').setAttribute('aria-hidden', 'false');
  });

  // Кнопка "Отмена" закрывает форму
  document.getElementById('cancel-order').addEventListener('click', () => {
    document.getElementById('order-form').classList.add('hidden');
    document.getElementById('order-form').setAttribute('aria-hidden', 'true');
  });

  // Обработка отправки формы: вывод сообщения и сброс корзины
  document.getElementById('checkout-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Можно здесь собрать данные формы и показать подтверждение/сохранить куда-то
    showToast('Заказ создан!');
    localStorage.removeItem(STORAGE_KEY); // очищаем корзину
    renderCart();
    this.reset();
    // скрываем форму
    document.getElementById('order-form').classList.add('hidden');
    document.getElementById('order-form').setAttribute('aria-hidden', 'true');
  });

  // Простой фидбек (тост)
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(text, ms = 2000) {
    toastEl.textContent = text;
    toastEl.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), ms);
  }

  // Начальная отрисовка, восстанавливаем корзину из localStorage
  renderCart();
});
