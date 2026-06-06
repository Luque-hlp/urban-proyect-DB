// Módulo de Mapa y Geolocalización

function initMap() {
    AppState.map = L.map('map').setView(CONFIG.MAP_DEFAULT_CENTER, CONFIG.MAP_DEFAULT_ZOOM);
    
    const standardLayer = L.tileLayer(CONFIG.TILE_LAYERS.standard.url, {
        attribution: CONFIG.TILE_LAYERS.standard.attribution
    });
    
    const satelliteLayer = L.tileLayer(CONFIG.TILE_LAYERS.satellite.url, {
        attribution: CONFIG.TILE_LAYERS.satellite.attribution
    });

    standardLayer.addTo(AppState.map);
    
    L.control.layers(
        { "Mapa Estándar": standardLayer },
        { "Vista Satelital": satelliteLayer }
    ).addTo(AppState.map);
}

function startGeolocation() {
    if (!navigator.geolocation) {
        showToast('Error', 'Tu navegador no soporta geolocalización.', true);
        return;
    }

    AppState.watchId = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        CONFIG.GEOLOCATION_OPTIONS
    );
}

function handlePositionSuccess(position) {
    const { latitude, longitude, accuracy } = position.coords;
    
    AppState.currentLocation.lat = latitude;
    AppState.currentLocation.lng = longitude;
    
    updateLocationUI(latitude, longitude, accuracy);
    updateMapMarker(latitude, longitude, accuracy);
    reverseGeocode(latitude, longitude);
}

function handlePositionError(error) {
    document.getElementById('gps-text').textContent = 'Error al obtener GPS. Permita el acceso.';
    console.error('GPS Error:', error);
}

function updateLocationUI(lat, lng, accuracy) {
    document.getElementById('val-lat').textContent = lat.toFixed(6);
    document.getElementById('val-lng').textContent = lng.toFixed(6);
    document.getElementById('val-acc').textContent = Math.round(accuracy);
    document.getElementById('gps-text').textContent = `GPS Activo (Precisión: ${Math.round(accuracy)}m)`;
}

function updateMapMarker(lat, lng, accuracy) {
    if (AppState.marker) {
        AppState.marker.setLatLng([lat, lng]);
        AppState.accuracyCircle.setLatLng([lat, lng]).setRadius(accuracy);
    } else {
        AppState.marker = L.marker([lat, lng], { draggable: true }).addTo(AppState.map);
        AppState.accuracyCircle = L.circle([lat, lng], {
            radius: accuracy,
            color: '#2563eb',
            fillOpacity: 0.1
        }).addTo(AppState.map);
        
        AppState.marker.on('dragend', handleMarkerDrag);
    }
    AppState.map.setView([lat, lng], CONFIG.MAP_ZOOM_ON_LOCATION);
}

function handleMarkerDrag() {
    const position = AppState.marker.getLatLng();
    AppState.currentLocation.lat = position.lat;
    AppState.currentLocation.lng = position.lng;
    document.getElementById('val-lat').textContent = position.lat.toFixed(6);
    document.getElementById('val-lng').textContent = position.lng.toFixed(6);
    reverseGeocode(position.lat, position.lng);
}

async function reverseGeocode(lat, lng) {
    try {
        const url = `${CONFIG.NOMINATIM_URL}?format=json&lat=${lat}&lon=${lng}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.display_name) {
            AppState.currentLocation.address = data.display_name;
            const shortAddress = data.display_name.split(',').slice(0, 3).join(',');
            document.getElementById('val-dir').textContent = shortAddress;
        }
    } catch (error) {
        console.error('Geocoding error', error);
    }
}