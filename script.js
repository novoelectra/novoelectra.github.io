// ============================================
// NOVOELECTRA LANDING - SCRIPT CON DEBUG
// ============================================

console.log('🔍 Script.js cargado...');

// CONFIGURACIÓN ADMIN
const ADMIN_PASSWORD = 'novo2026';
const ADMIN_URL = 'admin/index.html';

// ============================================
// MENÚ MÓVIL
// ============================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });
}

// ============================================
// ACCESO ADMIN - DIRECTO SIN DOMCONTENTLOADED
// ============================================
console.log('🔍 Buscando logo con ID: adminAccessLogo');
const logo = document.getElementById('adminAccessLogo');
console.log('🔍 Logo encontrado:', logo);

if (logo) {
  console.log('✅ Logo encontrado. Agregando eventos...');
  
  let pressTimer;
  let pressStartTime;
  const modal = document.getElementById('adminLoginModal');
  const progressBar = document.getElementById('adminPressProgress');
  const passwordField = document.getElementById('adminPassword');
  const errorEl = document.getElementById('adminLoginError');
  const cancelBtn = document.getElementById('cancelAdminLogin');

  console.log('🔍 Modal:', modal);
  console.log('🔍 ProgressBar:', progressBar);
  console.log('🔍 Password:', passwordField);

  function startPress(e) {
    console.log('👆 Logo presionado');
    e.preventDefault();
    pressStartTime = Date.now();
    
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.style.transition = 'width 3s linear';
    }
    
    logo.classList.add('logo-pressed');
    
    pressTimer = setTimeout(() => {
      console.log('⏰ 3 segundos completados!');
      logo.classList.remove('logo-pressed');
      
      if (modal) {
        modal.style.display = 'flex';
        console.log('✅ Modal mostrado');
      }
      
      if (passwordField) passwordField.focus();
      
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.background = '#059669';
      }
      
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }, 3000);
    
    function updateProgress() {
      if (!pressTimer) return;
      const elapsed = Date.now() - pressStartTime;
      const progress = Math.min((elapsed / 3000) * 100, 100);
      if (progressBar) progressBar.style.width = progress + '%';
      if (progress < 100) requestAnimationFrame(updateProgress);
    }
    
    updateProgress();
  }

  function cancelPress() {
    console.log('❌ Presión cancelada');
    clearTimeout(pressTimer);
    pressTimer = null;
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.style.transition = 'width 0.3s ease';
    }
    logo.classList.remove('logo-pressed');
  }

  // Eventos mouse
  logo.addEventListener('mousedown', startPress);
  logo.addEventListener('mouseup', cancelPress);
  logo.addEventListener('mouseleave', cancelPress);
  
  // Eventos touch (móvil)
  logo.addEventListener('touchstart', startPress);
  logo.addEventListener('touchend', cancelPress);
  logo.addEventListener('touchcancel', cancelPress);

  // Cancelar modal
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';
      if (passwordField) passwordField.value = '';
    });
  }

  // Cerrar modal click fuera
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
        if (passwordField) passwordField.value = '';
      }
    });
  }

  // Login form
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('🔑 Intentando login...');
      
      const password = passwordField.value;
      
      if (password === ADMIN_PASSWORD) {
        console.log('✅ Contraseña correcta!');
        sessionStorage.setItem('novo_admin', 'true');
        console.log('✅ Sesión guardada:', sessionStorage.getItem('novo_admin'));
        
        if (errorEl) {
          errorEl.textContent = '✅ Acceso correcto. Redirigiendo...';
          errorEl.style.background = '#d1fae5';
          errorEl.style.color = '#059669';
          errorEl.style.display = 'block';
        }
        
        setTimeout(() => {
          console.log('🔄 Redirigiendo a:', ADMIN_URL);
          window.location.href = ADMIN_URL;
        }, 1000);
      } else {
        console.log('❌ Contraseña incorrecta');
        if (errorEl) {
          errorEl.textContent = '❌ Contraseña incorrecta';
          errorEl.style.background = '#fee2e2';
          errorEl.style.color = '#dc2626';
          errorEl.style.display = 'block';
        }
        if (passwordField) passwordField.value = '';
      }
    });
  }

  console.log('✅ Eventos de admin agregados correctamente');
} else {
  console.error('❌ NO se encontró el logo con ID "adminAccessLogo"');
  console.error('❌ Revisa que el HTML tenga: id="adminAccessLogo" en la imagen del logo');
}

// ============================================
// FAQ ACCORDION
// ============================================
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
    });
    
    if (!isActive) {
      faqItem.classList.add('active');
    }
  });
});

// ============================================
// ANIMACIÓN AL SCROLL
// ============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// NAVBAR SCROLL
// ============================================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 100) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
  } else {
    navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  }
});

console.log('✅ Script.js inicializado correctamente');