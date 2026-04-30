// Supabase config (público)
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Carrito en localStorage
let cart = JSON.parse(localStorage.getItem('novoelectra_cart')) || [];

// Cargar productos
async function loadProducts() {
  const res = await fetch('https://novoelectra-api.onrender.com/api/products');
  const { data } = await res.json();
  renderProducts(data);
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.image_url || 'placeholder.png'}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="price">$${p.price}</p>
      <button class="btn-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
        Agregar al carrito
      </button>
    </div>
  `).join('');
  
  // Event listeners
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      addToCart({
        id: e.target.dataset.id,
        name: e.target.dataset.name,
        price: parseFloat(e.target.dataset.price),
        quantity: 1
      });
    });
  });
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push(product);
  }
  localStorage.setItem('novoelectra_cart', JSON.stringify(cart));
  updateCartCount();
  showToast(`${product.name} agregado`);
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = count;
}

// Checkout simple (WhatsApp)
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (cart.length === 0) return;
  
  const message = `🛒 Nuevo pedido Novoelectra:\n\n${
    cart.map(item => `• ${item.name} x${item.quantity} - $${item.price * item.quantity}`).join('\n')
  }\n\n💰 Total: $${cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}`;
  
  window.open(`https://wa.me/53XXXXXXXX?text=${encodeURIComponent(message)}`, '_blank');
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
});