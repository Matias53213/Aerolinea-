document.addEventListener("DOMContentLoaded", () => {
  const guestView = document.getElementById("guest-view");
  const userView = document.getElementById("user-view");
  const welcomeUser = document.getElementById("welcome-user");
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (username && token) {
    guestView.style.display = "none";
    userView.style.display = "";
    welcomeUser.innerHTML = `Bienvenido, <strong>${username}</strong>`;
  } else {
    userView.style.display = "none";
  }

  const logoutBtn = document.getElementById("logout");
  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    location.reload();
  });

  async function cargarPaquetesDestacados() {
    const BASE_URL = 'http://localhost:4000';

    try {
      const res = await fetch(`${BASE_URL}/api/paquetes?destacado=true`);
      if (!res.ok) throw new Error('Error al cargar paquetes destacados');
      const paquetes = await res.json();
      const container = document.getElementById('paquetesDestacadosContainer');

      if (!paquetes.length) {
        container.innerHTML = '<p>No hay paquetes destacados disponibles.</p>';
        return;
      }

      container.innerHTML = paquetes.map(p => {
        const imagenUrl = p.imagen?.startsWith("/uploads")
          ? `${BASE_URL}${p.imagen}`
          : p.imagen || 'default.jpg';

        return `
          <div class="paquete-card">
            <div class="paquete-img">
              <img src="${imagenUrl}" alt="${p.nombre}" />
              <span class="paquete-tag">Oferta</span>
            </div>
            <div class="paquete-info">
              <h3>${p.nombre}</h3>
              <div class="paquete-meta">
                <span><i>📅</i> ${p.duracion} días</span>
                <span><i>🛏️</i> Hotel 4*</span>
                <span><i>✈️</i> Vuelo incluido</span>
              </div>
              <p class="paquete-desc">${p.descripcion}</p>
              <div class="paquete-footer">
                <div class="paquete-price">
                  $${p.precio} <small>por persona</small>
                </div>
                <a href="./paquetes/detalle.html?id=${p.id}" class="book-btn">Reservar</a>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error(error);
      const container = document.getElementById('paquetesDestacadosContainer');
      container.innerHTML = '<p>Error al cargar paquetes destacados.</p>';
    }
  }

  cargarPaquetesDestacados();
});

document.getElementById('contact-form')?.addEventListener('submit', function(e) {
  alert('Función fuera de servicio');
  e.preventDefault();
});
