document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        paquetesList: document.getElementById('paquetes-list'),
        formPaquete: document.getElementById('form-paquete'),
        paqueteForm: document.getElementById('paquete-form'),
        btnNuevoPaquete: document.getElementById('btn-nuevo-paquete'),
        btnCancelar: document.getElementById('btn-cancelar'),
        confirmModal: document.getElementById('confirmModal') ? 
        new bootstrap.Modal(document.getElementById('confirmModal')) : null,
        previewImagen: document.getElementById('preview-imagen'),
        imagenInput: document.getElementById('imagen'),
        usuariosSection: document.getElementById('usuarios-section'),
        tablaUsuariosBody: document.querySelector('#tabla-usuarios tbody'),
        tabPaquetes: document.getElementById('tab-paquetes'),
        tabUsuarios: document.getElementById('tab-usuarios'),
        sectionTitle: document.getElementById('section-title'),
        btnNuevoPaqueteContainer: document.getElementById('btn-nuevo-paquete')
    };

    if (!elements.paqueteForm || !elements.btnNuevoPaquete) {
        console.error('Elementos críticos no encontrados');
        return;
    }

    let paqueteActual = null;
    const API_URL_PAQUETES = 'http://localhost:4000/api/paquetes';
    const API_URL_USUARIOS = 'http://localhost:4000/api/usuarios';
    const IMG_BASE_URL = 'http://localhost:4000';

    mostrarSeccion('paquetes');
    cargarPaquetes();
    setupEventListeners();

    function setupEventListeners() {
        elements.tabPaquetes.addEventListener('click', e => {
            e.preventDefault();
            mostrarSeccion('paquetes');
        });
        elements.tabUsuarios.addEventListener('click', e => {
            e.preventDefault();
            mostrarSeccion('usuarios');
            cargarUsuarios();
        });

        elements.btnNuevoPaquete.addEventListener('click', mostrarFormNuevoPaquete);
        elements.btnCancelar?.addEventListener('click', ocultarFormulario);
        elements.paqueteForm.addEventListener('submit', handleFormSubmit);
        elements.imagenInput.addEventListener('change', handleImagenPreview);

        if (elements.confirmModal) {
            document.getElementById('btn-confirm-delete')?.addEventListener('click', confirmarEliminacionPaquete);
        }
    }

    function mostrarSeccion(seccion) {
        if (seccion === 'paquetes') {
            elements.usuariosSection.classList.add('d-none');
            elements.formPaquete.classList.remove('d-block');
            elements.formPaquete.classList.add('d-none');
            elements.paquetesList.parentElement.style.display = 'block';
            elements.paquetesList.style.display = 'flex';
            elements.sectionTitle.textContent = 'Administrar Paquetes';
            elements.btnNuevoPaqueteContainer.style.display = 'inline-block';
            elements.tabPaquetes.classList.add('active');
            elements.tabUsuarios.classList.remove('active');
        } else if (seccion === 'usuarios') {
            elements.usuariosSection.classList.remove('d-none');
            elements.paquetesList.parentElement.style.display = 'none';
            elements.formPaquete.classList.remove('d-block');
            elements.formPaquete.classList.add('d-none');
            elements.sectionTitle.textContent = 'Administrar Usuarios';
            elements.btnNuevoPaqueteContainer.style.display = 'none';
            elements.tabUsuarios.classList.add('active');
            elements.tabPaquetes.classList.remove('active');
        }
    }

    function handleImagenPreview() {
        const file = elements.imagenInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                elements.previewImagen.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;"/>`;
            };
            reader.readAsDataURL(file);
        } else {
            elements.previewImagen.innerHTML = '';
        }
    }

    async function cargarPaquetes() {
        try {
            showLoader();
            const response = await fetch(API_URL_PAQUETES);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const paquetes = await response.json();
            renderPaquetes(paquetes);
        } catch (error) {
            console.error('Error al cargar paquetes:', error);
            showAlert('Error al cargar paquetes', 'danger');
        } finally {
            hideLoader();
        }
    }

function renderPaquetes(paquetes) {
    if (!elements.paquetesList) return;
    elements.paquetesList.innerHTML = paquetes.map(paquete => {
        const imgSrc = paquete.imagen ? IMG_BASE_URL + paquete.imagen : 'default.jpg';
        return `
        <div class="col">
            <div class="card h-100">
                <img src="${imgSrc}" class="card-img-top" alt="${paquete.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${paquete.nombre}</h5>
                    <p class="card-text">${(paquete.descripcion || '').substring(0, 100)}...</p>
                    <p class="text-primary fw-bold">$${paquete.precio?.toFixed(2) || '0.00'}</p>
                    <p><small>Duración: ${paquete.duracion ?? 7} días</small></p>
                    <div class="form-check mt-2">
                        <input class="form-check-input destacado-checkbox" type="checkbox" value="" id="destacado-${paquete.id}" data-id="${paquete.id}" 
                          ${paquete.destacado ? 'checked' : ''}>
                        <label class="form-check-label" for="destacado-${paquete.id}">
                          Destacado en página principal
                        </label>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-primary me-2 editar-paquete" data-id="${paquete.id}">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger eliminar-paquete" data-id="${paquete.id}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.destacado-checkbox').forEach(chk => {
        chk.addEventListener('change', async (e) => {
            const checkbox = e.target;
            const id = checkbox.getAttribute('data-id');
            const destacado = checkbox.checked;

            try {
                const res = await fetch(`${API_URL_PAQUETES}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destacado })
                });
                if (!res.ok) throw new Error('Error al actualizar destacado');
                console.log(`Paquete ${id} actualizado: destacado = ${destacado}`);
            } catch (error) {
                console.error(error);
                alert('No se pudo actualizar el estado destacado.');
                checkbox.checked = !destacado;
            }
        });
    });

    document.querySelectorAll('.editar-paquete').forEach(btn => {
        btn.addEventListener('click', () => editarPaquete(btn.dataset.id));
    });
    document.querySelectorAll('.eliminar-paquete').forEach(btn => {
        btn.addEventListener('click', () => confirmarEliminarPaquete(btn.dataset.id));
    });
}

    function mostrarFormNuevoPaquete() {
        paqueteActual = null;
        setFormTitle('Nuevo Paquete');
        resetForm();
        elements.previewImagen.innerHTML = '';
        showForm();
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const precio = parseFloat(document.getElementById('precio').value);
        const duracion = parseInt(document.getElementById('duracion').value) || 7;
        const imagenFile = elements.imagenInput.files[0];

        if (!nombre || !descripcion || isNaN(precio) || duracion <= 0) {
            showAlert('Completa todos los campos correctamente', 'danger');
            return;
        }

        if (!paqueteActual && !imagenFile) {
            showAlert('Debes seleccionar una imagen', 'danger');
            return;
        }

        try {
            showLoader();

            let imagenUrl = paqueteActual ? paqueteActual.imagen : 'default.jpg';

            if (imagenFile) {
                const formDataImagen = new FormData();
                formDataImagen.append('imagen', imagenFile);

                const uploadResponse = await fetch(IMG_BASE_URL + '/api/paquetes/upload', {
                    method: 'POST',
                    body: formDataImagen,
                });

                if (!uploadResponse.ok) throw new Error('Error subiendo la imagen');

                const uploadResult = await uploadResponse.json();
                imagenUrl = uploadResult.url;
            }

            const paqueteData = {
                nombre,
                descripcion,
                precio,
                imagen: imagenUrl,
                duracion
            };

            const url = paqueteActual ? `${API_URL_PAQUETES}/${paqueteActual.id}` : API_URL_PAQUETES;
            const method = paqueteActual ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paqueteData)
            });

            if (!response.ok) throw new Error('Error guardando el paquete');

            showAlert(`Paquete ${paqueteActual ? 'actualizado' : 'creado'} correctamente`, 'success');
            ocultarFormulario();
            await cargarPaquetes();

        } catch (error) {
            console.error('Error al guardar paquete:', error);
            showAlert(error.message || 'Error al guardar paquete', 'danger');
        } finally {
            hideLoader();
        }
    }

    function showForm() {
        if (elements.formPaquete) {
            elements.formPaquete.classList.remove('d-none');
            elements.formPaquete.classList.add('d-block');
            window.scrollTo(0, 0);
        }
    }

    function ocultarFormulario() {
        if (elements.formPaquete) {
            elements.formPaquete.classList.remove('d-block');
            elements.formPaquete.classList.add('d-none');
        }
    }

    function resetForm() {
        if (elements.paqueteForm) {
            elements.paqueteForm.reset();
            document.getElementById('paquete-id').value = '';
            elements.previewImagen.innerHTML = '';
        }
        paqueteActual = null;
    }

    function setFormTitle(title) {
        const titleElement = document.getElementById('form-title');
        if (titleElement) titleElement.textContent = title;
    }

    function showAlert(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
    }

    function showLoader() {
        console.log('Loading...');
    }

    function hideLoader() {
        console.log('Loading complete');
    }

    async function editarPaquete(id) {
        try {
            showLoader();
            const response = await fetch(`${API_URL_PAQUETES}/${id}`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            paqueteActual = await response.json();
            setFormTitle('Editar Paquete');
            populateForm(paqueteActual);
            showForm();
        } catch (error) {
            console.error('Error al cargar paquete:', error);
            showAlert('Error al cargar paquete para edición', 'danger');
        } finally {
            hideLoader();
        }
    }

    function populateForm(paquete) {
        document.getElementById('paquete-id').value = paquete.id;
        document.getElementById('nombre').value = paquete.nombre;
        document.getElementById('descripcion').value = paquete.descripcion;
        document.getElementById('precio').value = paquete.precio;
        document.getElementById('duracion').value = paquete.duracion ?? 7;

        const imgSrc = paquete.imagen ? IMG_BASE_URL + paquete.imagen : 'default.jpg';
        elements.previewImagen.innerHTML = `<img src="${imgSrc}" alt="Imagen actual" style="max-width: 100%; max-height: 200px; margin-top: 10px;" />`;

        elements.imagenInput.value = '';
    }

    function confirmarEliminarPaquete(id) {
        paqueteActual = { id };
        if (elements.confirmModal) {
            elements.confirmModal.show();
        } else {
            if (confirm('¿Eliminar este paquete?')) {
                eliminarPaquete(id);
            }
        }
    }

    async function confirmarEliminacionPaquete() {
        if (!paqueteActual) return;
        await eliminarPaquete(paqueteActual.id);
        if (elements.confirmModal) {
            elements.confirmModal.hide();
        }
    }

    async function eliminarPaquete(id) {
        try {
            showLoader();
            const response = await fetch(`${API_URL_PAQUETES}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            showAlert('Paquete eliminado correctamente', 'success');
            await cargarPaquetes();
        } catch (error) {
            console.error('Error al eliminar paquete:', error);
            showAlert('Error al eliminar paquete', 'danger');
        } finally {
            hideLoader();
        }
    }
    async function cargarUsuarios() {
        if (!elements.tabUsuarios.classList.contains('active')) return;

        if (!elements.tabUsuarios) {
            console.error('No se encontró el tab usuarios');
            return;
        }

        if (!elements.usuariosSection || !elements.tabPaquetes) {
            console.error('Elementos para usuarios no encontrados');
            return;
        }

        if (!elements.tabUsuarios.classList.contains('active')) {
            return;
        }

        if (!elements.tabUsuarios.classList.contains('active')) return;

        try {
            showLoader();
            const response = await fetch(API_URL_USUARIOS);
            if (!response.ok) throw new Error('No se pudieron obtener los usuarios');
            const usuarios = await response.json();
            renderUsuarios(usuarios);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            elements.tabUsuarios.innerHTML = '<p>Error al cargar usuarios</p>';
        } finally {
            hideLoader();
        }
    }

function renderUsuarios(usuarios) {
  const tbodyUsuarios = document.querySelector('#tabla-usuarios tbody');
  if (!tbodyUsuarios) {
    console.error('No se encontró tbody de tabla usuarios');
    return;
  }

  if (usuarios.length === 0) {
    tbodyUsuarios.innerHTML = `<tr><td colspan="4" class="text-center">No hay usuarios registrados.</td></tr>`;
    return;
  }

  tbodyUsuarios.innerHTML = usuarios.map(usuario => `
    <tr>
      <td>${usuario.id}</td>
      <td>${usuario.username}</td>
      <td>${usuario.email}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" onclick="editarUsuario(${usuario.id}, '${usuario.username}', '${usuario.email}')">
          <i class="bi bi-pencil"></i> Editar
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario(${usuario.id})">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      </td>
    </tr>
  `).join('');
}

    window.eliminarUsuario = async function(id) {
        const confirmar = confirm('¿Estás seguro de que deseas eliminar este usuario?');
        if (!confirmar) return;

        try {
            const res = await fetch(`${API_URL_USUARIOS}/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('No se pudo eliminar el usuario');
            alert('Usuario eliminado');
            cargarUsuarios();
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            alert('Error al eliminar el usuario');
        }
    };

    window.editarUsuario = async function editarUsuario(id, username, email) {
  const userId = Number(id);
  if (isNaN(userId)) {
    alert("ID de usuario inválido");
    return;
  }

  const nuevoUsername = prompt('Nuevo nombre de usuario:', username);
  if (!nuevoUsername) {
    alert('Nombre de usuario inválido o vacío');
    return;
  }

  const nuevoEmail = prompt('Nuevo email:', email);
  if (!nuevoEmail || !nuevoEmail.includes('@')) {
    alert('Email inválido');
    return;
  }

  try {
    const res = await fetch(`http://localhost:4000/api/usuarios/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: nuevoUsername, email: nuevoEmail }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const errMsg = errData?.message || `Error HTTP: ${res.status}`;
      throw new Error(errMsg);
    }

    alert('Usuario actualizado correctamente');
    cargarUsuarios();
  } catch (err) {
    console.error('Error al editar usuario:', err);
    alert('Error al editar el usuario: ' + err.message);
  }
}


});
