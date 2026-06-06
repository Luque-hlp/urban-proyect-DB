// Configuración global de la aplicación
const CONFIG = {
    N8N_WEBHOOK_URL: 'https://coherent-matron-barrier.ngrok-free.dev/workflow/SDAX0OTfEBQUMnYj',
    MAP_DEFAULT_CENTER: [4.6097, -74.0817], // Bogotá
    MAP_DEFAULT_ZOOM: 13,
    MAP_ZOOM_ON_LOCATION: 16,
    GEOLOCATION_OPTIONS: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    },
    MAX_IMAGES: 3,
    TICKET_ID_PREFIX: 'URB',
    TICKET_ID_DIGITS: 4,
    TOAST_DURATION: 4000,
    NETWORK_DELAY: 1500, // ms - simular latencia
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org/reverse',
    TILE_LAYERS: {
        standard: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors'
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles © Esri'
        }
    }
};