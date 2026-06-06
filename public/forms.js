// forms.js - Manejo del formulario de reportes para n8n + Google Sheets

// URL del webhook de n8n a través de ngrok (ruta del workflow específico)
const WEBHOOK_URL = 'https://coherent-matron-barrier.ngrok-free.dev/workflow/kxtqHg5QlwxzXmE7';

// Elementos del DOM
const form = document.getElementById('reportForm');
const submitBtn = document.getElementById('submitBtn') || document.querySelector('button[type="submit"]');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Inputs del formulario
const nombreInput = document.getElementById('nombre');
const telefonoInput = document.getElementById('telefono');
const correoInput = document.getElementById('correo');
const descripcionInput = document.getElementById('descripcion');

/**
 * Valida los datos del formulario antes de enviar
 */
function validarFormulario() {
    const errores = [];

    if (!nombreInput.value.trim()) {
        errores.push('El nombre es requerido');
    }

    if (!telefonoInput.value.trim()) {
        errores.push('El teléfono es requerido');
    } else if (!/^[0-9+\-\s]{10,15}$/.test(telefonoInput.value)) {
        errores.push('Teléfono inválido (mínimo 10 dígitos)');
    }

    if (!correoInput.value.trim()) {
        errores.push('El correo es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoInput.value)) {
        errores.push('Correo electrónico inválido');
    }

    if (!descripcionInput.value.trim()) {
        errores.push('La descripción es requerida');
    } else if (descripcionInput.value.trim().length < 10) {
        errores.push('La descripción debe tener al menos 10 caracteres');
    }

    return errores;
}

/**
 * Muestra mensajes de éxito o error
 */
function mostrarMensaje(tipo, mensaje) {
    // Ocultar ambos mensajes primero
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    if (tipo === 'success') {
        successMessage.textContent = mensaje;
        successMessage.style.display = 'block';
    } else {
        errorMessage.textContent = mensaje;
        errorMessage.style.display = 'block';
    }

    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
    }, 5000);
}

/**
 * Maneja el envío del formulario
 */
async function manejarEnvio(event) {
    event.preventDefault();

    // Validar formulario
    const errores = validarFormulario();
    if (errores.length > 0) {
        mostrarMensaje('error', '⚠️ ' + errores.join('. '));
        return;
    }

    // Deshabilitar botón durante el envío
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Enviando...';

    // Capturar datos del formulario
    const datosReporte = {
        nombre: nombreInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        correo: correoInput.value.trim(),
        descripcion: descripcionInput.value.trim(),
        fechaEnvio: new Date().toISOString(),
        userAgent: navigator.userAgent,
        origen: window.location.href
    };

    console.log('📤 Enviando reporte:', datosReporte);

    try {
        // Enviar datos al webhook de n8n mediante ngrok
        console.log('📤 Enviando a:', WEBHOOK_URL);
        const respuesta = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' // Importante para evitar advertencias de ngrok
            },
            body: JSON.stringify(datosReporte)
        });

        console.log('📥 Respuesta del servidor:', respuesta.status);

        if (respuesta.ok) {
            // Éxito: Mostrar mensaje y limpiar formulario
            mostrarMensaje('success', '✅ ¡Reporte enviado con éxito! Los datos se están guardando en Google Sheets.');
            form.reset();
        } else {
            // Error del servidor
            const textoError = await respuesta.text();
            console.error('Error del servidor:', textoError);
            mostrarMensaje('error', `❌ Error en el procesamiento (Status: ${respuesta.status})`);
        }
    } catch (error) {
        // Error de red
        console.error('❌ Error de red:', error);
        mostrarMensaje('error', '🔌 No se pudo conectar. Verifica que ngrok esté activo y la URL sea correcta.');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = '📤 Enviar Reporte';
    }
}

// Agregar event listener cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        form.addEventListener('submit', manejarEnvio);
    });
} else {
    form.addEventListener('submit', manejarEnvio);
}

// Validación en tiempo real (opcional)
[nombreInput, telefonoInput, correoInput, descripcionInput].forEach(input => {
    input.addEventListener('blur', () => {
        // Remover estilos de error previos
        input.style.borderColor = '#e0e0e0';
        
        // Validar campo individual
        if (input.value.trim() && input.validity.valid) {
            input.style.borderColor = '#4caf50';
        } else if (input.value.trim() && !input.validity.valid) {
            input.style.borderColor = '#f44336';
        }
    });
});

console.log('✅ forms.js cargado correctamente');
console.log('🎯 Webhook URL:', WEBHOOK_URL);
