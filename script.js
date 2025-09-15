document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'shop_cart_v1';


    const cartButton = document.getElementById('cart-button');
    const cartCountBadge = document.getElementById('cart-count-badge');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart');
    const closeCartFooterBtn = document.getElementById('close-cart-footer');
    if (closeCartFooterBtn) {  
        closeCartFooterBtn.addEventListener('click', () => closeModal(cartModal));
    }

    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');

    const checkoutBtn = document.getElementById('checkout');
    const orderModal = document.getElementById('order-modal');
    const closeOrderBtn = document.getElementById('close-order');
    const orderForm = document.getElementById('checkout-form');
    const cancelOrderBtn = document.getElementById('cancel-order');

    const centerModal = document.getElementById('center-modal');
    const closeCenterBtn = document.getElementById('close-center');

    const toast = document.getElementById('toast');

    
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }
    function saveCart(cart) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    
    function updateCardControls(id) {
        const cart = getCart();
        const card = document.querySelector(`.add-cart[data-id="${id}"]`)?.closest('.product-card');
        if (!card) return;

        const existing = cart.find(item => item.id === id);


        const oldControls = card.querySelector('.qty-controls');
        if (oldControls) oldControls.remove();

        const addBtn = card.querySelector('.add-cart');

        if (existing && existing.qty > 0) {
            
            addBtn.style.display = 'none';

           
            const controls = document.createElement('div');
            controls.className = 'qty-controls';
            controls.innerHTML = `
                <button class="minus" aria-label="уменьшить">-</button>
                <span class="qty">${existing.qty}</span>
                <button class="plus" aria-label="увеличить">+</button>
            `;
            card.appendChild(controls);

            
            controls.querySelector('.minus').addEventListener('click', () => {
                if (existing.qty > 1) {
                    existing.qty--;
                    controls.querySelector('.qty').textContent = existing.qty;
                    saveCart(cart);
                    renderCart();
                } else {
                    
                    const index = cart.findIndex(it => it.id === id);
                    cart.splice(index, 1);
                    saveCart(cart);
                    renderCart();
                    updateCardControls(id); 
                }
            });

            controls.querySelector('.plus').addEventListener('click', () => {
                existing.qty++;
                controls.querySelector('.qty').textContent = existing.qty;
                saveCart(cart);
                renderCart();
            });

        } else {
            
            addBtn.style.display = 'block';
        }
    }

    
    function renderCart() {
        const cart = getCart();
        cartItemsEl.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            total += item.price * item.qty;
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="meta">
                    <strong>${escapeHtml(item.name)}</strong>
                </div>
                <div class="controls">
                    <button class="minus" data-id="${item.id}" aria-label="уменьшить">-</button>
                    <span class="qty">${item.qty}</span>
                    <button class="plus" data-id="${item.id}" aria-label="увеличить">+</button>
                    <div style="width:8px"></div>
                    <div>${(item.price * item.qty).toLocaleString()} ₽</div>
                    <button class="remove" data-id="${item.id}" aria-label="удалить">×</button>
                </div>
            `;
            cartItemsEl.appendChild(li);
        });

        const count = cart.reduce((s, it) => s + it.qty, 0);
        cartCountBadge.textContent = count;
        cartTotalEl.textContent = total.toLocaleString();

       
        document.querySelectorAll('.product-card').forEach(card => {
            const id = card.querySelector('.add-cart')?.dataset.id;
            if (id) updateCardControls(id);
        });
    }

   
    function escapeHtml(text) {
        const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    
    function openModal(modal) { modal.classList.remove('hidden'); }
    function closeModal(modal) { modal.classList.add('hidden'); }

    
cartButton.addEventListener('click', () => {
    if (cartModal.classList.contains('hidden')) {
        renderCart();
        openModal(cartModal);
        closeCartBtn.focus();
    } else {
        closeModal(cartModal);
    }
});


    
    closeCartBtn.addEventListener('click', () => closeModal(cartModal));
    cartModal.querySelectorAll('.modal-backdrop').forEach(b => {
        b.addEventListener('click', () => closeModal(cartModal));
    });

    
    document.querySelectorAll('.add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const price = Number(btn.dataset.price) || 0;
            const name = btn.closest('.product-card').querySelector('h3').textContent.trim();
            const cart = getCart();
            const existing = cart.find(i => i.id === id);
            if (existing) existing.qty += 1;
            else cart.push({ id, name, price, qty: 1 });
            saveCart(cart);
            renderCart();
            showToast('Товар добавлен в корзину');
        });
    });

    
    cartItemsEl.addEventListener('click', (e) => {
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

  
    checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (!cart.length) {
            showToast('Корзина пуста');
            return;
        }
        openModal(orderModal);
        setTimeout(() => orderForm.querySelector('input[name="firstName"]').focus(), 60);
    });

  
    closeOrderBtn.addEventListener('click', () => closeModal(orderModal));
    cancelOrderBtn.addEventListener('click', () => closeModal(orderModal));
    orderModal.querySelectorAll('.modal-backdrop').forEach(b => {
        b.addEventListener('click', () => closeModal(orderModal));
    });

    
    function openCenterModal() {
        centerModal.classList.remove('hidden');
        cartButton.style.display = 'none'; 
        closeCenterBtn.focus();
    }

    function closeCenterModal() {
        centerModal.classList.add('hidden');
        cartButton.style.display = 'flex'; 
    }

    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCart([]);
        renderCart();
        closeModal(orderModal);
        closeModal(cartModal);
        openCenterModal();
    });

    
    closeCenterBtn.addEventListener('click', () => closeCenterModal());
    centerModal.querySelectorAll('.modal-backdrop').forEach(b => {
        b.addEventListener('click', () => closeCenterModal());
    });

    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(orderModal);
            closeModal(cartModal);
            closeCenterModal();
        }
    });

   
    let toastTimer = null;
    function showToast(text, ms = 1800) {
        toast.textContent = text;
        toast.classList.remove('hidden');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.add('hidden'), ms);
    }
    const phoneInput = document.querySelector('input[name="phone"]');

phoneInput.addEventListener('input', () => {
  let val = phoneInput.value.replace(/[^\d+]/g, '');
  if (val.startsWith('+')) {
    val = '+' + val.slice(1).replace(/\+/g, ''); 
  } else {
    val = val.replace(/\+/g, ''); 
  }
  phoneInput.value = val;
});


    // initial render
    renderCart();
});
