// Módulo de Formulario, Imágenes y Análisis IA

function handleImageUpload(input) {
    const files = Array.from(input.files).slice(0, CONFIG.MAX_IMAGES);
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = '';
    AppState.uploadedImagesBase64 = [];

    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast('Error', 'Solo se permiten archivos de imagen.', true);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.uploadedImagesBase64.push(e.target.result);
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '0.5rem';
            img.style.border = '1px solid var(--border)';
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function simulateAIAnalysis() {
    const tipo = document.getElementById('tipo').value;
    const desc = document.getElementById('descripcion').value.toLowerCase();
    const aiBox = document.getElementById('ai-analysis');
    
    if (!tipo && desc.length < 10) {
        aiBox.classList.add('hidden');
        return;
    }

    aiBox.classList.remove('hidden');
    
    const analysis = analyzeContent(tipo, desc);
    
    document.getElementById('ai-cat').textContent = analysis.category;
    document.getElementById('ai-conf').textContent = analysis.confidence;
    
    const sevBadge = document.getElementById('ai-severity');
    sevBadge.textContent = `Severidad: ${analysis.severity}`;
    sevBadge.className = `ai-badge ${analysis.severityClass}`;
}

function analyzeContent(tipo, desc) {
    let severity = 'Baja';
    let severityClass = 'severity-low';
    let confidence = 85;
    let category = tipo.charAt(0).toUpperCase() + tipo.slice(1);

    // Reglas NLP simuladas
    if (desc.includes('peligro') || desc.includes('chispas') || 
        desc.includes('hundimiento') || tipo === 'cableado') {
        severity = 'Crítica';
        severityClass = 'severity-critical';
        confidence = 94;
    } else if (desc.includes('grande') || desc.includes('peligroso') || tipo === 'fuga') {
        severity = 'Alta';
        severityClass = 'severity-high';
        confidence = 89;
    } else if (desc.includes('varios') || desc.includes('afecta')) {
        severity = 'Moderada';
        severityClass = 'severity-moderate';
        confidence = 87;
    }

    return { severity, severityClass, confidence, category };
}

async function handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

    const ticketId = generateTicketId();
    
    const payload = buildPayload(ticketId);

    try {
        await sendToWebhook(payload);
        handleSuccess(ticketId);
    } catch (error) {
        handleSubmissionError();
    } finally {
        resetSubmitButton(btn);
    }
}

function buildPayload(ticketId) {
    return {
        ticketId: ticketId,
        fecha: new Date().toISOString(),
        nombre: sanitize(document.getElementById('nombre').value),
        documento: sanitize(document.getElementById('documento').value),
        telegram: sanitize(document.getElementById('telegram').value),
        correo: sanitize(document.getElementById('correo').value),
        telefono: sanitize(document.getElementById('telefono').value),
        tipo_incidente: document.getElementById('tipo').value,
        descripcion: sanitize(document.getElementById('descripcion').value),
        latitud: AppState.currentLocation.lat,
        longitud: AppState.currentLocation.lng,
        direccion: AppState.currentLocation.address,
        imagenes: AppState.uploadedImagesBase64,
        ai_analysis: {
            categoria: document.getElementById('ai-cat').textContent,
            severidad: document.getElementById('ai-severity').textContent.replace('Severidad: ', ''),
            confianza: document.getElementById('ai-conf').textContent + '%'
        }
    };
}

async function sendToWebhook(payload) {
    // Producción:
    /*
    const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'mock-token-123' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error en webhook');
    */
    
    // Simulación de delay de red
    await new Promise(r => setTimeout(r, CONFIG.NETWORK_DELAY));
}

function handleSuccess(ticketId) {
    showToast('¡Reporte Exitoso!', `Tu ticket es: ${ticketId}. Recibirás actualizaciones en Telegram.`);
    document.getElementById('incidentForm').reset();
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('ai-analysis').classList.add('hidden');
    showSection('hero');
    incrementMetric('metric-reports');
}

function handleSubmissionError() {
    showToast('Error de Conexión', 'No se pudo conectar con el servidor. Intente nuevamente.', true);
}

function resetSubmitButton(btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Reporte';
}

function incrementMetric(elementId) {
    const el = document.getElementById(elementId);
    let current = parseInt(el.textContent.replace(',', ''));
    el.textContent = (current + 1).toLocaleString();
}

const formulario = document.getElementById('incidentForm'); // Pon el ID de tu formulario HTML

formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); // 1. Evita que la página se recargue

    // 2. Capturas los datos de los inputs de tu HTML
    const datosReporte = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telegram').value,
        correo: document.getElementById('correo').value,
        descripcion: document.getElementById('Descripcion').value,
    };

    try {
        // 3. LA LÍNEA CLAVE: Envía los datos a tu Webhook de n8n mediante ngrok
        const respuesta = await fetch('https://coherent-matron-barrier.ngrok-free.dev/webhook-test/4d53bed1-f40c-455b-862f-9be97891663b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosReporte) // Convierte los datos a JSON
        });

        if (respuesta.ok) {
            alert('¡Reporte enviado con éxito a n8n y Google Sheets!');
        } else {
            alert('Error en el servidor de n8n');
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el webhook de ngrok');
    }
});