document.addEventListener('DOMContentLoaded', function() {
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
        
        window.location.href = "../index.html";
    });

    function updateCartCount() {
        const count = carrito.length;
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }
    
    const CONFIG = {
        APP_BASE: '/FrontendOli',
        LOGIN_URL: '/FrontendOli/Login/login.html',
        API_BASE: 'http://localhost:4000/api',
        IMG_BASE: 'http://localhost:4000'
    };

    const DOM = {
        sections: {
            profile: document.getElementById('profile-section'),
            reservations: document.getElementById('reservations-section')
        },
        profile: {
            username: document.getElementById('username-display'),
            email: document.getElementById('email-display'),
            avatar: document.getElementById('user-avatar'),
            view: {
                username: document.getElementById('username-view'),
                email: document.getElementById('email-view')
            },
            edit: {
                username: document.getElementById('username-input'),
                email: document.getElementById('email-input'),
                btn: document.getElementById('edit-profile-btn'),
                save: document.getElementById('save-profile-btn'),
                cancel: document.getElementById('cancel-edit-btn')
            }
        },
        reservations: {
            list: document.getElementById('reservations-list')
        },
        menu: {
            links: document.querySelectorAll('.account-menu a'),
            profile: document.querySelector('.account-menu a[href="#profile"]')
        },
        ui: {
            viewMode: document.querySelectorAll('.view-mode'),
            editMode: document.querySelectorAll('.edit-mode'),
            loader: document.createElement('div')
        }
    };

    let appState = {
        user: null,
        editing: false,
        loading: false
    };

    initApplication();

    async function initApplication() {
        try {
            startLoading();
            
            const tokenData = await verifyAuth();
            if (!tokenData) return;
            
            await loadInitialData(tokenData);
            
            setupInitialUI();
            
        } catch (error) {
            console.error('Error inicial:', error);
            showAlert('Error al iniciar. Recarga la página.', 'error');
        } finally {
            stopLoading();
        }
    }

    async function verifyAuth() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            redirectToLogin('no_token');
            return null;
        }

        const tokenData = parseJWT(token);
        if (!tokenData?.id) {
            localStorage.removeItem('token');
            redirectToLogin('invalid_token');
            return null;
        }

        return tokenData;
    }

    function parseJWT(token) {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        } catch (e) {
            console.error('Error decodificando token:', e);
            return null;
        }
    }

    async function loadInitialData(tokenData) {
        displayUserData({
            username: tokenData.username || 'Usuario',
            email: tokenData.email || 'No especificado'
        });

        try {
            const userData = await fetchUserData(tokenData.id);
            if (userData) {
                appState.user = userData;
                displayUserData(userData);
            }
        } catch (error) {
            console.warn('Error cargando datos del backend:', error);
            appState.user = {
                id: tokenData.id,
                username: tokenData.username,
                email: tokenData.email
            };
        }
    }

    async function fetchUserData(userId) {
        try {
            const response = await fetch(`${CONFIG.API_BASE}/usuarios/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            }
            throw new Error('Error al obtener datos del usuario');
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    function setupInitialUI() {
        showSection('profile');
        setupEventListeners();
        
        if (appState.user?.imagen) {
            DOM.profile.avatar.src = `${CONFIG.IMG_BASE}${appState.user.imagen}`;
        }
    }

    function showSection(sectionId) {
        Object.values(DOM.sections).forEach(section => {
            if (section) section.style.display = 'none';
        });
        
        const section = DOM.sections[sectionId];
        if (section) {
            section.style.display = 'block';
        }
        
        DOM.menu.links.forEach(link => {
            if (link) link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.account-menu a[href="#${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');
    }

    function setupEventListeners() {
        DOM.menu.links.forEach(link => {
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = link.getAttribute('href').substring(1);
                    showSection(target);
                    
                    if (target === 'reservations') {
                        loadReservations();
                    }
                });
            }
        });

        if (DOM.profile.edit.btn) {
            DOM.profile.edit.btn.addEventListener('click', startEditing);
        }
        
        if (DOM.profile.edit.save) {
            DOM.profile.edit.save.addEventListener('click', saveProfile);
        }
        
        if (DOM.profile.edit.cancel) {
            DOM.profile.edit.cancel.addEventListener('click', cancelEditing);
        }
    }

    function displayUserData(user) {
        if (!user) return;
        
        if (DOM.profile.username) DOM.profile.username.textContent = user.username;
        if (DOM.profile.email) DOM.profile.email.textContent = user.email;
        if (DOM.profile.view.username) DOM.profile.view.username.textContent = user.username;
        if (DOM.profile.view.email) DOM.profile.view.email.textContent = user.email;
        
        if (DOM.profile.edit.username) DOM.profile.edit.username.value = user.username || '';
        if (DOM.profile.edit.email) DOM.profile.edit.email.value = user.email || '';
    }

    function startEditing() {
        appState.editing = true;
        updateEditUI();
    }

    function cancelEditing() {
        appState.editing = false;
        updateEditUI();
        displayUserData(appState.user);
    }

    function updateEditUI() {
        DOM.ui.viewMode.forEach(el => {
            if (el) el.style.display = appState.editing ? 'none' : 'block';
        });
        
        DOM.ui.editMode.forEach(el => {
            if (el) el.style.display = appState.editing ? 'block' : 'none';
        });
    }

    async function saveProfile() {
        if (!appState.user) return;
        
        const newUsername = DOM.profile.edit.username?.value.trim();
        const newEmail = DOM.profile.edit.email?.value.trim();

        if (!newUsername || !newEmail) {
            showAlert('Completa todos los campos', 'error');
            return;
        }

        try {
            startLoading();
            
            const response = await fetch(`${CONFIG.API_BASE}/usuarios/${appState.user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    username: newUsername,
                    email: newEmail
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            appState.user.username = newUsername;
            appState.user.email = newEmail;
            appState.editing = false;
            
            displayUserData(appState.user);
            updateEditUI();
            
            showAlert('Perfil actualizado', 'success');
            
        } catch (error) {
            console.error('Error guardando perfil:', error);
            showAlert('Error al guardar cambios', 'error');
        } finally {
            stopLoading();
        }
    }

    async function loadReservations() {
        try {
            startLoading();
            
            const response = await fetch(`${CONFIG.API_BASE}/reservations/user/${appState.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const data = await response.json();
            renderReservations(data);
            
        } catch (error) {
            console.error('Error cargando reservas:', error);
            showAlert('Error al cargar reservas', 'error');
        } finally {
            stopLoading();
        }
    }

    function renderReservations(reservations) {
        if (!DOM.reservations.list) return;
        
        if (!reservations?.length) {
            DOM.reservations.list.innerHTML = `
                <div class="no-reservations">
                    <p>No tienes reservaciones</p>
                    <a href="${CONFIG.APP_BASE}/paquetes/paquetes.html" class="btn">Ver paquetes</a>
                </div>
            `;
            return;
        }

        DOM.reservations.list.innerHTML = reservations.map(res => `
            <div class="reservation-card ${res.status}">
                <div class="reservation-header">
                    <h3>${res.paquete?.nombre || 'Paquete sin nombre'}</h3>
                    <span class="status-badge ${res.status}">
                        ${translateReservationStatus(res.status)}
                    </span>
                </div>
                
                <div class="reservation-details">
                    <div class="detail-row">
                        <span class="detail-label">Fecha de viaje:</span>
                        <span class="detail-value">${formatDate(res.travel_date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha de regreso:</span>
                        <span class="detail-value">${formatDate(res.return_date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Pasajeros:</span>
                        <span class="detail-value">${res.passengers || 1}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total:</span>
                        <span class="detail-value">$${(res.total_price || 0).toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="reservation-actions">
                    ${res.status === 'pending' || res.status === 'confirmed' ? `
                        <button class="btn-cancel" data-id="${res.id}">Cancelar reserva</button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reservationId = e.target.dataset.id;
                confirmCancelReservation(reservationId);
            });
        });
    }

    async function confirmCancelReservation(reservationId) {
        const confirmed = confirm('¿Estás seguro que deseas cancelar esta reserva?');
        if (!confirmed) return;

        try {
            startLoading();
            
            const response = await fetch(`${CONFIG.API_BASE}/reservations/${reservationId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            showAlert('Reserva cancelada exitosamente', 'success');
            loadReservations(); 
            
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            showAlert('Error al cancelar la reserva', 'error');
        } finally {
            stopLoading();
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'No especificada';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('es-ES');
        } catch {
            return dateString;
        }
    }

    function translateReservationStatus(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmada',
            'cancelled': 'Cancelada',
            'completed': 'Completada'
        };
        return statusMap[status] || status;
    }

    function startLoading() {
        appState.loading = true;
    }

    function stopLoading() {
        appState.loading = false;
    }

    function showAlert(message, type = 'error') {
        alert(`${type === 'error' ? 'Error' : 'Éxito'}: ${message}`);
    }

    function redirectToLogin(reason = '') {
        const params = new URLSearchParams();
        params.set('redirect', window.location.pathname);
        if (reason) params.set('reason', reason);
        window.location.href = `${CONFIG.LOGIN_URL}?${params.toString()}`;
    }
});