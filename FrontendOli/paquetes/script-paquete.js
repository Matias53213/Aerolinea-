  const paquetes = [
    { 
      id: 1, 
      nombre: "Cancún Todo Incluido", 
      precio: 1200,
      imagen: "img/Cancun.jpg",
      descripcion: "Disfruta de 7 dias en un lujoso resort todo incluido frente al mar Caribe. Este paquete incluye vuelos directos, traslados privados, habitación con vista al mar, acceso ilimitado a restaurantes y bares, y actividades diarias.",
      duracion: 7
    },
    { 
      id: 2, 
      nombre: "Roma Clásica", 
      precio: 1500,
      imagen: "img/Roma.jpg",
      descripcion: "Sumérgete en la historia con este tour de 6 dias por la Ciudad Eterna. Visita el Coliseo, el Vaticano, la Fontana di Trevi y más. Incluye alojamiento en hotel céntrico, desayunos y entradas a los principales monumentos.",
      duracion: 6
    },
    { 
      id: 3, 
      nombre: "Aventura en Costa Rica", 
      precio: 1800,
      imagen: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      descripcion: "8 días de pura aventura en la naturaleza. Incluye canopy en Monteverde, rafting en el río Pacuare, caminata por el volcán Arenal, alojamiento en eco-lodges y transporte entre destinos.",
      duacion: 8
    },
    { 
      id: 4, 
      nombre: "París Romántico", 
      precio: 2000,
      imagen: "img/Paris.jpg",
      descripcion: "7 dias en hotel boutique, cena en Torre Eiffel y tour por Montmartre",
      duracion: 7
    },
    { 
      id: 5, 
      nombre: "Japón Tradicional", 
      precio: 3500,
      imagen: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      descripcion: "10 días recorriendo Tokio, Kioto y Osaka con guía en español",
      duracion: 10
    },
    { 
      id: 6, 
      nombre: "Nueva York Express", 
      precio: 1700,
      imagen: "img/NewYork.jpg",
      descripcion: "5 dias en Manhattan, entradas a Broadway y tour por los rascacielos",
      duracion: 5
    },
    { 
      id: 7, 
      nombre: "Paraiso en Bali", 
      precio: 1700,
      imagen: "img/Bali.jpg",
      descripcion: "Relájate en las playas de arena blanca de Bali con este paquete de lujo que incluye masajes, cena romántica y excursiones a templos sagrados.",
      duracion: 7 
    },
    { 
      id: 8, 
      nombre: "Machu Picchu Místico", 
      precio: 1700,
      imagen: "img/MachuPichu.jpg",
      descripcion: "Aventúrate en este viaje a la ciudad perdida de los Incas, incluye tren a Machu Picchu, guía especializado y alojamiento en Cusco.",
      duracion: 8 
    }
  ];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
  const contadores = document.querySelectorAll('.cart-count');
  contadores.forEach(contador => {
    contador.textContent = carrito.length;
  });
}

function mostrarProductos() {
  const contenedor = document.getElementById("productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  
  paquetes.forEach(producto => {
    contenedor.innerHTML += `
      <div class="paquete">
        <div class="paquete-img" style="background-image: url('${producto.imagen}')"></div>
        <div class="paquete-info">
          <h3>${producto.nombre}</h3>
          <p class="paquete-precio">$${producto.precio}</p>
          <p>${producto.descripcion.substring(0, 60)}...</p>
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

  document.getElementById('paquete-imagen').style.backgroundImage = `url('${paquete.imagen}')`;
  document.getElementById('paquete-titulo').textContent = paquete.nombre;
  document.getElementById('paquete-precio').textContent = `$${paquete.precio}`;
  document.getElementById('paquete-descripcion').textContent = paquete.descripcion;

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
      alert("Por favor selecciona ambas fechas.");
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
    html += `
      <div class="item-carrito">
        <div class="item-info">
          <div class="item-img" style="background-image: url('${item.imagen}')"></div>
          <div>
            <h3>${item.nombre}</h3>
            <p>${item.descripcion.substring(0, 50)}...</p>
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

window.comprar = function() {
  alert('Compra realizada con éxito (simulación)');
  vaciarCarrito();
}

document.addEventListener('DOMContentLoaded', function () {
  actualizarContadorCarrito();

  if (document.getElementById("productos")) {
    mostrarProductos();
  }

  if (document.getElementById("paquete-imagen")) {
    mostrarDetallePaquete();
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
