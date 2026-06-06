// Módulo de UI: Navegación, Tema y Notificaciones

function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById('hero-section').classList.add('hidden');
    
    if (sectionId === 'hero') {
        document.getElementById('hero-section').classList.remove('hidden');
    } else {
        document.getElementById(sectionId + '-section').classList.remove('hidden');
    }
    
    // Fix: Leaflet necesita redibujar cuando el contenedor está oculto
    if (sectionId === 'report' && AppState.map) {
        setTimeout(() => AppState.map.invalidateSize(), 100);
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
}

function showToast(title, msg, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-msg').textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, CONFIG.TOAST_DURATION);
}