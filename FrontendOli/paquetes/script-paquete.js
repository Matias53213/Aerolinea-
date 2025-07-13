let paquetes = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const BASE_URL = "http://localhost:4000";

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
  const contadores = document.querySelectorAll('.cart-count');
  contadores.forEach(contador => {
    contador.textContent = carrito.length;
  });
}

async function cargarPaquetes() {
  try {
    const response = await fetch(`${BASE_URL}/api/paquetes`);
    if (!response.ok) throw new Error('Error al cargar paquetes del servidor');
    paquetes = await response.json();
    mostrarProductos();
  } catch (error) {
    console.error(error);
    alert('No se pudieron cargar los paquetes desde el servidor.');
  }
}

function mostrarProductos() {
  const contenedor = document.getElementById("productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  paquetes.forEach(producto => {
    const descripcion = producto.descripcion || "Sin descripción disponible";
    const imagenUrl = producto.imagen.startsWith("/uploads")
      ? `${BASE_URL}${producto.imagen}`
      : producto.imagen;

    contenedor.innerHTML += `
      <div class="paquete">
        <div class="paquete-img" style="background-image: url('${imagenUrl}')"></div>
        <div class="paquete-info">
          <h3>${producto.nombre}</h3>
          <p class="paquete-precio">$${producto.precio}</p>
          <p>${descripcion.substring(0, 60)}...</p>
          <button class="paquete-btn" onclick="window.location.href='detalle.html?id=${producto.id}'">Ver detalles</button>
        </div>
      </div>
    `;
  });

  actualizarContadorCarrito();
}

function mostrarDetallePaquete() {
  const urlParams = new URLSearchParams(window.location.search);
  const paqueteId = parseInt(urlParams.get('id'));
  const paquete = paquetes.find(p => p.id === paqueteId);

  if (!paquete) {
    window.location.href = 'paquetes.html';
    return;
  }

  const imagenUrl = paquete.imagen.startsWith("/uploads")
    ? `${BASE_URL}${paquete.imagen}`
    : paquete.imagen;

  document.getElementById('paquete-imagen').style.backgroundImage = `url('${imagenUrl}')`;
  document.getElementById('paquete-titulo').textContent = paquete.nombre;
  document.getElementById('paquete-precio').textContent = `$${paquete.precio}`;
  document.getElementById('paquete-descripcion').textContent = paquete.descripcion || "Sin descripción";

  const duracionEl = document.getElementById('paquete-duracion');
  if (duracionEl) {
    duracionEl.innerHTML = `<span><i>Duracion del viaje:</i> ${paquete.duracion || 7} días</span>`;
  }

  const inputSalida = document.getElementById('fecha-salida');
  const inputRegreso = document.getElementById('fecha-regreso');

  inputSalida.addEventListener('change', () => {
    if (!inputSalida.value) return;

    const salida = new Date(inputSalida.value);
    const dias = paquete.duracion || 7;

    const regreso = new Date(salida);
    regreso.setDate(salida.getDate() + dias);

    const regresoStr = regreso.toISOString().split('T')[0];
    inputRegreso.value = regresoStr;
  });

  document.getElementById('agregar-carrito').addEventListener('click', function() {
    const token = localStorage.getItem("token");
    if (!token) {
      const confirmar = confirm("Debes iniciar sesión para agregar al carrito. ¿Quieres ir a iniciar sesión?");
      if (confirmar) {
        window.location.href = "../Login/login.html?form=login";
      }
      return;
    }

    const fechaSalida = inputSalida.value;
    const fechaRegreso = inputRegreso.value;

    if (!fechaSalida || !fechaRegreso) {
      alert("Por favor selecciona la fecha de salida.");
      return;
    }

    if (new Date(fechaSalida) >= new Date(fechaRegreso)) {
      alert("La fecha de regreso debe ser posterior a la de salida.");
      return;
    }

    const paqueteConFechas = {
      ...paquete,
      fechaSalida,
      fechaRegreso
    };

    carrito.push(paqueteConFechas);
    guardarCarrito();
    actualizarContadorCarrito();
    alert(`${paquete.nombre} agregado al carrito con fechas.`);
  });
}

function renderCarrito() {
  const contenedor = document.getElementById("carrito");
  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <p>Tu carrito está vacío</p>
        <a href="paquetes.html">Explora nuestros paquetes</a>
      </div>
    `;
    return;
  }

  let html = '';
  let total = 0;

  carrito.forEach((item, index) => {
    total += item.precio;

    const imagenUrl = item.imagen.startsWith("/uploads")
      ? `${BASE_URL}${item.imagen}`
      : item.imagen;

  html += `
    <div class="item-carrito">
      <div class="item-info">
        <div class="item-img" style="background-image: url('${imagenUrl}')"></div>
        <div>
          <h3>
            <a href="detalle.html?id=${item.id}" style="color: #007bff; text-decoration: none;">
              ${item.nombre}
            </a>
          </h3>
          <p>${(item.descripcion || "").substring(0, 50)}...</p>
          <p><small>${item.fechaSalida ? `Del ${item.fechaSalida} al ${item.fechaRegreso}` : ''}</small></p>
        </div>
      </div>
      <div>
        <span class="item-precio">$${item.precio}</span>
        <button class="eliminar-btn" onclick="eliminarItem(${index})">Eliminar</button>
      </div>
    </div>
  `;
  });

  html += `
    <div class="total">
      Total: $${total}
    </div>
    <div class="acciones">
      <button class="btn btn-vaciar" onclick="vaciarCarrito()">Vaciar carrito</button>
      <button class="btn btn-comprar" onclick="comprar()">Continuar con la compra</button>
    </div>
  `;

  contenedor.innerHTML = html;
}

window.eliminarItem = function(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  renderCarrito();
  actualizarContadorCarrito();
}

window.vaciarCarrito = function() {
  carrito = [];
  guardarCarrito();
  renderCarrito();
  actualizarContadorCarrito();
}

window.comprar = async function() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    try {
        const itemsParaPago = carrito.map(item => ({
            nombre: item.nombre,
            precio: Number(item.precio),
            cantidad: 1,
            paqueteId: item.id
        }));

        const response = await fetch(`${BASE_URL}/api/mercadopago/pago`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: itemsParaPago })
        });

        if (!response.ok) throw new Error("Error en el pago");

        const data = await response.json();
        
        if (data.id) {
            renderMercadoPagoButton(data.id);
        } else {
            throw new Error("No se recibió ID de preferencia");
        }

    } catch (error) {
        console.error("Error:", error);
        alert(`Error al procesar el pago: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', function () {
  actualizarContadorCarrito();

  if (document.getElementById("productos")) {
    cargarPaquetes();
  }

  if (document.getElementById("paquete-imagen")) {
    cargarPaquetes().then(() => {
      mostrarDetallePaquete();
    });
  }

  if (document.getElementById("carrito")) {
    renderCarrito();
  }
});

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
});

document.getElementById('contact-form')?.addEventListener('submit', function (e) {
  alert('Función fuera de servicio');
});
