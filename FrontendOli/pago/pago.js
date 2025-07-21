document.addEventListener('DOMContentLoaded', async function() {
    const API_BASE_URL = 'http://localhost:4000/api';
    
    const elements = {
        container: document.querySelector('.payment-container'),
        paymentId: document.getElementById('payment-id'),
        paymentDate: document.getElementById('payment-date'),
        paymentStatus: document.getElementById('payment-status'),
        paymentMethod: document.getElementById('payment-method'),
        paymentAmount: document.getElementById('payment-amount'),
        reservationsContainer: document.getElementById('reservations-container')
    };

    if (!elements.container || !elements.paymentId || !elements.paymentDate || 
        !elements.paymentStatus || !elements.paymentMethod || !elements.paymentAmount || 
        !elements.reservationsContainer) {
        showErrorMessage('Error en la configuración de la página. Por favor, recarga.');
        return;
    }

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('payment_id') || urlParams.get('preference_id');
        const status = urlParams.get('status') || urlParams.get('collection_status');
        
        let reservationIds = [];
        try {
            const storedReservations = localStorage.getItem('currentReservations');
            reservationIds = storedReservations ? JSON.parse(storedReservations) : [];
        } catch (e) {
            console.error('Error al parsear reservas:', e);
            reservationIds = [];
        }

        console.log('Parámetros recibidos:', { paymentId, status, reservationIds });

        if (!paymentId || !status) {
            showErrorMessage('Faltan parámetros esenciales en la URL. Verifica que completaste el pago correctamente.');
            return;
        }

        if (reservationIds.length === 0) {
            showErrorMessage('No se encontraron reservas asociadas a este pago.');
            return;
        }

        displayBasicInfo({ paymentId, status });

        await processPaymentWithMultipleReservations({ paymentId, status, reservationIds });

    } catch (error) {
        console.error('Error general:', error);
        showErrorMessage(`Ocurrió un error inesperado: ${error.message || 'Por favor, contacta a soporte.'}`);
    }

    async function processPaymentWithMultipleReservations({ paymentId, status, reservationIds }) {
        try {
            console.log('Iniciando proceso de pago con reservas:', reservationIds);

            const reservationsData = await Promise.all(
                reservationIds.map(id => fetchReservationDetails(id))
            );
            
            const validReservations = reservationsData.filter(r => r !== null);
            if (validReservations.length === 0) {
                throw new Error('No se pudieron cargar los detalles de las reservas');
            }

            const totalAmount = validReservations.reduce((sum, r) => sum + (r.total_price || 0), 0);
            console.log('Monto total calculado:', totalAmount);

            elements.paymentAmount.textContent = `$${totalAmount.toFixed(2)}`;

            const paymentData = await registerPaymentBackend(
                paymentId, 
                reservationIds, 
                status,
                totalAmount
            );
            console.log('Pago registrado:', paymentData);

            updatePaymentUI({
                payment: {
                    paymentId,
                    status,
                    amount: totalAmount
                },
                reservations: validReservations
            });

            if (status === 'approved') {
                showSuccessMessage('¡Pago aprobado! Tus reservas han sido confirmadas.');
            }

        } catch (error) {
            console.error('Error en el proceso de pago:', error);
            handlePaymentError(error, paymentId, status);
        } finally {
            cleanupAfterPayment();
        }
    }

    async function registerPaymentBackend(paymentId, reservationIds, status, amount) {
        const payload = {
            paymentId,
            reservationIds: reservationIds.map(id => Number(id)),
            status: status === 'approved' ? 'approved' : 'pending',
            amount: Number(amount) || 0
        };

        console.log('Enviando pago al backend:', payload);

        const response = await fetch(`${API_BASE_URL}/payments/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al registrar el pago');
        }

        return await response.json();
    }

    async function fetchReservationDetails(reservationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error al obtener reserva ${reservationId}:`, error);
            return null;
        }
    }

    function updatePaymentUI(data) {
        if (data.payment) {
            elements.paymentId.textContent = data.payment.paymentId || 'N/A';
            elements.paymentStatus.textContent = translateStatus(data.payment.status);
            elements.paymentAmount.textContent = `$${(data.payment.amount || 0).toFixed(2)}`;
            elements.paymentDate.textContent = new Date().toLocaleString();
            elements.paymentMethod.textContent = 'MercadoPago';
        }

        if (data.reservations && data.reservations.length > 0) {
            displayMultipleReservations(data.reservations);
        } else {
            elements.reservationsContainer.innerHTML = `
                <div class="warning-message">
                    <p>⚠️ No se pudieron cargar los detalles completos de las reservas</p>
                </div>
            `;
        }
    }

    function displayMultipleReservations(reservations) {
        const formatDate = (dateString) => {
            if (!dateString) return 'No especificada';
            try {
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('es-ES');
            } catch {
                return dateString;
            }
        };

        elements.reservationsContainer.innerHTML = `
            <h3 class="reservations-title">Detalles de tus reservas (${reservations.length})</h3>
            ${reservations.map(reservation => `
                <div class="reservation-card">
                    <div class="detail-row">
                        <span class="detail-label">Número:</span>
                        <span class="detail-value">${reservation.id || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-value ${reservation.status}">${translateReservationStatus(reservation.status)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Paquete:</span>
                        <span class="detail-value">${reservation.paquete?.nombre || 'No especificado'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha de viaje:</span>
                        <span class="detail-value">${formatDate(reservation.travel_date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha de regreso:</span>
                        <span class="detail-value">${formatDate(reservation.return_date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Pasajeros:</span>
                        <span class="detail-value">${reservation.passengers || 1}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Precio:</span>
                        <span class="detail-value">$${(reservation.total_price || 0).toFixed(2)}</span>
                    </div>
                </div>
            `).join('')}
        `;
    }

    function cleanupAfterPayment() {
        localStorage.removeItem('currentReservations');
    }

    function translateStatus(status) {
        const statusMap = {
            'approved': 'Aprobado',
            'pending': 'Pendiente',
            'rejected': 'Rechazado',
            'in_process': 'En proceso',
            'refunded': 'Reembolsado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status?.toLowerCase()] || status;
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

    function showSuccessMessage(message) {
        const success = document.createElement('div');
        success.className = 'success-message';
        success.innerHTML = `<p>✓ ${message}</p>`;
        elements.container.prepend(success);
    }

    function showErrorMessage(message) {
        elements.container.innerHTML = `
            <div class="error-message">
                <h3>Error al procesar el pago</h3>
                <p>${message}</p>
                <div class="action-buttons">
                    <a href="/FrontendOli/paquetes/paquetes.html" class="btn btn-primary">Volver a paquetes</a>
                    <button id="retry-button" class="btn btn-secondary">Reintentar</button>
                </div>
            </div>
        `;

        document.getElementById('retry-button')?.addEventListener('click', () => window.location.reload());
    }

    function showWarningMessage(message) {
        const warning = document.createElement('div');
        warning.className = 'warning-message';
        warning.innerHTML = `<p>⚠️ ${message}</p>`;
        elements.container.prepend(warning);
    }

    function displayBasicInfo({paymentId, status}) {
        elements.paymentId.textContent = paymentId || 'N/A';
        elements.paymentStatus.textContent = translateStatus(status) || 'N/A';
        elements.paymentDate.textContent = new Date().toLocaleString();
    }

    function handlePaymentError(error, paymentId, status) {
        showWarningMessage(error.message || 'Pago registrado, pero hubo un problema al obtener los detalles.');
        
        updatePaymentUI({
            payment: {
                paymentId,
                status,
                amount: 0
            }
        });
    }
});