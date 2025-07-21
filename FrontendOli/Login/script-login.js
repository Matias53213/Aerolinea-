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

  document.getElementById("btn-login").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login exitoso");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("username", data.user.username);
        window.location.href = "../index.html";
      } else {
        alert(data.message || "Error en el login");
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  });

  document.getElementById("btn-registrar").addEventListener("click", async () => {
    const username = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar-contrasena").value;

    if (password !== confirmar) {
      return alert("Las contraseñas no coinciden");
    }

    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }) 
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registro exitoso. Ahora podés iniciar sesión.");
        location.href = "?form=login";
      } else {
        alert(data.message || "Error al registrarse");
      }
    } catch (err) {
      alert("Error de conexión con el servidor");
    }
  });
});
