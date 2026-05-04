// ============================================
// NOVOELECTRA ADMIN - PANEL DE CONTROL
// ============================================

// CONFIGURACIÓN
const PRODUCTOS_FILE = '../tienda/productos.json';
const LANDING_URL = '../index.html';

// Estado
let productos = [];
let isAdmin = false;

// ============================================
// VERIFICAR SESIÓN AL CARGAR
// ============================================
function checkSession() {
  const session = sessionStorage.getItem('novo_admin');
  
  if (session !== 'true') {
    // No hay sesión válida, redirigir a landing
    alert('🔐 Acceso denegado. Debes iniciar sesión desde la página principal.');
    window.location.href = LANDING_URL;
    return false;
  }
  
  isAdmin = true;
  showAdmin();
  return true;
}

// ============================================
// MOSTRAR PANEL ADMIN
// ============================================
function showAdmin() {
  document.getElementById('loadingSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'block';
  loadProductos();
}

// ============================================
// CARGAR PRODUCTOS
// ============================================
async function loadProductos() {
  try {
    const res = await fetch(PRODUCTOS_FILE);
    const data = await res.json();
    productos = data.productos;
    renderProductos();
    updateStats();
  } catch (err) {
    console.error('Error cargando productos:', err);
    alert('Error cargando productos. Verifica la conexión.');
  }
}

// ============================================
// RENDERIZAR LISTA DE PRODUCTOS
// ============================================
function renderProductos() {
  const container = document.getElementById('productsList');
  if (!container) return;
  
  container.innerHTML = productos.map((p, index) => `
    <div class="admin-product-item">
      <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/50'">
      <div class="product-info">
        <strong>${p.nombre}</strong>
        <p>$${parseFloat(p.precio).toFixed(2)} | Stock: ${p.stock} | ${p.categoria}</p>
        <span class="status ${p.activo ? 'active' : 'inactive'}">
          ${p.activo ? '✓ Activo' : '✗ Inactivo'}
        </span>
      </div>
      <div class="product-actions">
        <button onclick="editProduct(${index})" class="btn-edit">Editar</button>
        <button onclick="toggleProduct(${index})" class="btn-toggle">
          ${p.activo ? 'Desactivar' : 'Activar'}
        </button>
        <button onclick="deleteProduct(${index})" class="btn-delete">Eliminar</button>
      </div>
    </div>
  `).join('');
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================
function updateStats() {
  document.getElementById('totalProductos').textContent = productos.length;
  document.getElementById('productosActivos').textContent = productos.filter(p => p.activo).length;
  const valor = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  document.getElementById('valorInventario').textContent = `$${valor.toFixed(2)}`;
}

// ============================================
// MODAL - NUEVO PRODUCTO
// ============================================
document.getElementById('addProductBtn')?.addEventListener('click', () => {
  document.getElementById('modalTitle').textContent = 'Nuevo Producto';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('productActivo').checked = true;
  document.getElementById('productModal').style.display = 'flex';
});

// ============================================
// MODAL - CANCELAR
// ============================================
document.getElementById('cancelProduct')?.addEventListener('click', () => {
  document.getElementById('productModal').style.display = 'none';
});

// ============================================
// GUARDAR PRODUCTO
// ============================================
document.getElementById('productForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const id = document.getElementById('productId').value;
  const nuevoProducto = {
    id: id || Date.now().toString(),
    nombre: document.getElementById('productName').value,
    descripcion: document.getElementById('productDesc').value,
    precio: parseFloat(document.getElementById('productPrice').value),
    stock: parseInt(document.getElementById('productStock').value),
    categoria: document.getElementById('productCategory').value,
    imagen: document.getElementById('productImage').value || 'https://via.placeholder.com/300',
    activo: document.getElementById('productActivo').checked
  };

  if (id) {
    productos[id] = nuevoProducto;
  } else {
    productos.push(nuevoProducto);
  }

  document.getElementById('productModal').style.display = 'none';
  renderProductos();
  updateStats();
  
  alert('✅ Producto guardado. No olvides EXPORTAR el JSON y actualizar en GitHub.');
});

// ============================================
// FUNCIONES GLOBALES
// ============================================
window.editProduct = function(index) {
  const p = productos[index];
  document.getElementById('modalTitle').textContent = 'Editar Producto';
  document.getElementById('productId').value = index;
  document.getElementById('productName').value = p.nombre;
  document.getElementById('productDesc').value = p.descripcion;
  document.getElementById('productPrice').value = p.precio;
  document.getElementById('productStock').value = p.stock;
  document.getElementById('productCategory').value = p.categoria;
  document.getElementById('productImage').value = p.imagen;
  document.getElementById('productActivo').checked = p.activo;
  document.getElementById('productModal').style.display = 'flex';
};

window.toggleProduct = function(index) {
  productos[index].activo = !productos[index].activo;
  renderProductos();
  updateStats();
};

window.deleteProduct = function(index) {
  if (confirm('¿Seguro que deseas eliminar este producto?')) {
    productos.splice(index, 1);
    renderProductos();
    updateStats();
    alert('✅ Producto eliminado. No olvides EXPORTAR el JSON.');
  }
};

// ============================================
// EXPORTAR JSON
// ============================================
document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
  const json = JSON.stringify({ productos }, null, 2);
  document.getElementById('exportJson').value = json;
  document.getElementById('exportModal').style.display = 'flex';
});

document.getElementById('closeExport')?.addEventListener('click', () => {
  document.getElementById('exportModal').style.display = 'none';
});

document.getElementById('copyJson')?.addEventListener('click', () => {
  const textarea = document.getElementById('exportJson');
  textarea.select();
  document.execCommand('copy');
  
  const btn = document.getElementById('copyJson');
  const originalText = btn.textContent;
  btn.textContent = '✅ ¡Copiado!';
  setTimeout(() => btn.textContent = originalText, 2000);
});

// ============================================
// LOGOUT
// ============================================
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  sessionStorage.removeItem('novo_admin');
  isAdmin = false;
  window.location.href = LANDING_URL;
});

// ============================================
// CERRAR MODALES AL CLICK FUERA
// ============================================
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', checkSession);