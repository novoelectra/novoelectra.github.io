// ============================================
// NOVOELECTRA TIENDA - LÓGICA DEL CARRITO
// ============================================

const WHATSAPP_NUMBER = '5353834215';

let cart = JSON.parse(localStorage.getItem('novoelectra_cart')) || [];
let productos = [];

// ============================================
// CARGAR PRODUCTOS (CON CACHE BUSTING)
// ============================================
async function loadProducts() {
  try {
    // ✅ Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const res = await fetch(`productos.json?t=${timestamp}`);
    const data = await res.json();
    productos = data.productos.filter(p => p.activo);
    renderProducts(productos);
  } catch (err) {
    console.error('Error cargando productos:', err);
    document.getElementById('productsGrid').innerHTML = 
      '<p style="color: red; text-align: center; padding: 2rem;">Error cargando productos. Recarga la página.</p>';
  }
}

// ============================================
// RENDERIZAR PRODUCTOS
// ============================================
function renderProducts(lista) {
  const grid = document.getElementById('productsGrid');
  if (lista.length === 0) {
    grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No hay productos en esta categoría.</p>';
    return;
  }
  
  grid.innerHTML = lista.map(p => `
    <div class="product-card">
      <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/300?text=Sin+Imagen'">
      <h3>${p.nombre}</h3>
      <p class="descripcion">${p.descripcion || ''}</p>
      <p class="precio">$${parseFloat(p.precio).toFixed(2)}</p>
      <p class="stock ${p.stock > 0 ? 'disponible' : 'agotado'}">
        ${p.stock > 0 ? `✓ Stock: ${p.stock}` : '✗ Agotado'}
      </p>
      <button class="btn-add" 
              data-id="${p.id}" 
              data-nombre="${p.nombre}" 
              data-precio="${p.precio}"
              ${p.stock === 0 ? 'disabled' : ''}>
        ${p.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
      </button>
    </div>
  `).join('');

  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target.disabled) return;
      addToCart({
        id: e.target.dataset.id,
        nombre: e.target.dataset.nombre,
        precio: parseFloat(e.target.dataset.precio),
        quantity: 1
      });
    });
  });
}

// ============================================
// AGREGAR AL CARRITO
// ============================================
function addToCart(producto) {
  const existing = cart.find(item => item.id === producto.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push(producto);
  }
  localStorage.setItem('novoelectra_cart', JSON.stringify(cart));
  updateCartCount();
  showToast(`${producto.nombre} agregado al carrito`);
}

// ============================================
// ACTUALIZAR CONTADOR
// ============================================
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = count;
  const cartIcon = document.getElementById('cartBtn');
  cartIcon.style.transform = 'scale(1.2)';
  setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
}

// ============================================
// MOSTRAR TOAST
// ============================================
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'toast';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// MODAL CARRITO
// ============================================
document.getElementById('cartBtn')?.addEventListener('click', () => {
  document.getElementById('cartModal').style.display = 'flex';
  renderCart();
});

document.getElementById('closeModal')?.addEventListener('click', () => {
  document.getElementById('cartModal').style.display = 'none';
});

document.getElementById('cartModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'cartModal') {
    document.getElementById('cartModal').style.display = 'none';
  }
});

// ============================================
// RENDERIZAR CARRITO
// ============================================
function renderCart() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Tu carrito está vacío</p>';
    document.getElementById('cartTotal').textContent = '0.00';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.nombre}</strong>
        <p style="font-size: 0.9rem; color: #666;">$${item.precio} x ${item.quantity}</p>
      </div>
      <div class="cart-actions">
        <button onclick="updateQuantity('${item.id}', -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity('${item.id}', 1)">+</button>
        <button onclick="removeItem('${item.id}')" class="btn-delete">🗑️</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  document.getElementById('cartTotal').textContent = total.toFixed(2);
}

// ============================================
// FUNCIONES GLOBALES
// ============================================
window.updateQuantity = function(id, change) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    localStorage.setItem('novoelectra_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
};

window.removeItem = function(id) {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem('novoelectra_cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
};

// ============================================
// CHECKOUT WHATSAPP
// ============================================
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  const itemsList = cart.map(item => 
    `• ${item.nombre}\n  $${item.precio} x ${item.quantity} = $${(item.precio * item.quantity).toFixed(2)}`
  ).join('\n\n');

  const message = `🛒 *NUEVO PEDIDO - NOVOELECTRA*\n\n${itemsList}\n\n💰 *TOTAL: $${total.toFixed(2)}*\n\n📍 Dirección de entrega: _____________\n📞 Teléfono: _____________\n\n*Enviado desde la tienda online*`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
});

// ============================================
// FILTROS
// ============================================
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const categoria = btn.dataset.categoria;
    if (categoria === 'todos') {
      renderProducts(productos);
    } else {
      const filtrados = productos.filter(p => p.categoria === categoria);
      renderProducts(filtrados);
    }
  });
});

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
});