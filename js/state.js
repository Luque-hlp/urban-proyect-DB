// Estado global de la aplicación
const AppState = {
    map: null,
    marker: null,
    accuracyCircle: null,
    watchId: null,
    currentLocation: {
        lat: null,
        lng: null,
        address: 'Buscando...'
    },
    uploadedImagesBase64: []
};

// Helper para sanitizar input (prevención XSS)
function sanitize(str) {
    return str.replace(/[<>]/g, '');
}

// Generador de Ticket ID
function generateTicketId() {
    const year = new Date().getFullYear();
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `${CONFIG.TICKET_ID_PREFIX}-${year}-${digits}`;
}