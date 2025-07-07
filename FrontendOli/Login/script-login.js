document.addEventListener('DOMContentLoaded', function() {
  const toggleAuth = document.getElementById('toggle-auth');
  const toggleText = document.getElementById('toggle-auth-text');
  const welcomeMessage = document.getElementById('welcome-message');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showLoginNav = document.getElementById('show-login-nav');
  const showRegisterNav = document.getElementById('show-register-nav');

  function showLogin() {
    loginForm.classList.add('form-active');
    registerForm.classList.remove('form-active');
    toggleText.innerHTML = '¿No tienes cuenta? <a href="?form=register" id="toggle-auth">Regístrate</a>';
    welcomeMessage.textContent = 'Inicia sesión para continuar';
    history.replaceState(null, '', '?form=login');
  }

  function showRegister() {
    loginForm.classList.remove('form-active');
    registerForm.classList.add('form-active');
    toggleText.innerHTML = '¿Ya tienes cuenta? <a href="?form=login" id="toggle-auth">Inicia sesión</a>';
    welcomeMessage.textContent = 'Regístrate para comenzar';
    history.replaceState(null, '', '?form=register');
  }

  function handleAuthClick(e) {
    e.preventDefault();
    const formType = new URL(this.href, window.location.href).searchParams.get('form');
    if (formType === 'login') {
      showLogin();
    } else {
      showRegister();
    }
  }

  showLoginNav?.addEventListener('click', handleAuthClick);
  showRegisterNav?.addEventListener('click', handleAuthClick);

  document.addEventListener('click', function(e) {
    if (e.target?.id === 'toggle-auth') {
      e.preventDefault();
      loginForm.classList.contains('form-active') ? showRegister() : showLogin();
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const formType = urlParams.get('form') || 'register';
  
  if (formType === 'login') {
    showLogin();
  } else {
    showRegister();
  }
});