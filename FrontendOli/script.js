document.addEventListener("DOMContentLoaded", () => {

    const guestView = document.getElementById("guest-view");
    const userView = document.getElementById("user-view");
    const usernameDisplay = document.getElementById("username-display");
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (username && token) {
        guestView.style.display = "none";
        userView.style.display = "";
        usernameDisplay.textContent = username;
        
        updateCartCount();
    } else {
        userView.style.display = "none";
    }

    const dropdownBtn = document.querySelector(".user-dropbtn");
    const dropdownContent = document.querySelector(".user-dropdown-content");

    dropdownBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
        if (dropdownContent) dropdownContent.style.display = "none";
    });


    document.getElementById("logout")?.addEventListener("click", (e) => {
        e.preventDefault();
        
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("carrito");
        
        window.location.href = "index.html";
    });

    function updateCartCount() {
        const count = carrito.length;
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }

    if (document.getElementById('paquetesDestacadosContainer')) {
        cargarPaquetesDestacados();
    }

    async function cargarPaquetesDestacados() {
        const BASE_URL = 'http://localhost:4000';
        const container = document.getElementById('paquetesDestacadosContainer');

        try {
            const res = await fetch(`${BASE_URL}/api/paquetes?destacado=true`);
            if (!res.ok) throw new Error('Error al cargar paquetes');
            
            const paquetes = await res.json();
            
            if (!paquetes.length) {
                container.innerHTML = '<p class="no-results">No hay paquetes destacados</p>';
                return;
            }

            container.innerHTML = paquetes.map(paquete => `
                <div class="paquete-card">
                    <div class="paquete-img">
                        <img src="${paquete.imagen?.startsWith('/uploads') 
                            ? BASE_URL + paquete.imagen 
                            : paquete.imagen || 'img/default.jpg'}" 
                        alt="${paquete.nombre}">
                        ${paquete.oferta ? '<span class="paquete-tag">Oferta</span>' : ''}
                    </div>
                    <div class="paquete-info">
                        <h3>${paquete.nombre}</h3>
                        <div class="paquete-meta">
                            <span><i>📅</i> ${paquete.duracion || 7} días</span>
                            <span><i>⭐</i> ${paquete.calificacion || 'Nuevo'}</span>
                        </div>
                        <p class="paquete-desc">${paquete.descripcion?.substring(0, 100) || 'Descripción no disponible'}...</p>
                        <div class="paquete-footer">
                            <div class="paquete-price">
                                $${paquete.precio} <small>${paquete.precioPorPersona ? 'por persona' : ''}</small>
                            </div>
                            <a href="paquetes/detalle.html?id=${paquete.id}" class="book-btn">Ver detalles</a>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = `
                <p class="error-msg">Error al cargar paquetes. 
                <button onclick="cargarPaquetesDestacados()">Reintentar</button>
                </p>
            `;
        }
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';
                
                const response = await fetch('http://localhost:4000/api/contacto', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) throw new Error(await response.text());
                
                alert('Mensaje enviado con éxito');
                contactForm.reset();
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error al enviar el mensaje: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar mensaje';
            }
        });
    }
});

window.cargarPaquetesDestacados = cargarPaquetesDestacados;