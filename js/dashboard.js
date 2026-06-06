// Módulo de Dashboard y Consulta de Tickets

function loadMockDashboardData() {
    const tbody = document.getElementById('dashboard-table-body');
    const mockData = getMockIncidents();

    tbody.innerHTML = mockData.map(renderIncidentRow).join('');
}

function getMockIncidents() {
    return [
        { id: 'URB-2026-8841', fecha: '06/06/2026', cat: 'Fuga de agua', prio: 'Alta', estado: 'En progreso', dir: 'Cra 45 # 26-12', ciudadano: 'Juan Pérez' },
        { id: 'URB-2026-8840', fecha: '05/06/2026', cat: 'Bache en vía', prio: 'Moderada', estado: 'Abierto', dir: 'Av. 68 # 12-34', ciudadano: 'María López' },
        { id: 'URB-2026-8839', fecha: '05/06/2026', cat: 'Alumbrado', prio: 'Baja', estado: 'Cerrado', dir: 'Calle 100 # 15-20', ciudadano: 'Carlos Ruiz' },
    ];
}

function renderIncidentRow(row) {
    const priorityClass = getPriorityClass(row.prio);
    const statusClass = getStatusClass(row.estado);
    
    return `
        <tr>
            <td><strong>${row.id}</strong></td>
            <td>${row.fecha}</td>
            <td>${row.cat}</td>
            <td><span class="ai-badge ${priorityClass}" style="color: white;">${row.prio}</span></td>
            <td><span class="status-badge ${statusClass}">${row.estado}</span></td>
            <td>${row.dir}</td>
            <td>${row.ciudadano}</td>
        </tr>
    `;
}

function getPriorityClass(priority) {
    const map = { 'Alta': 'severity-high', 'Moderada': 'severity-moderate' };
    return map[priority] || 'severity-low';
}

function getStatusClass(status) {
    const map = { 'Abierto': 'status-open', 'En progreso': 'status-progress', 'Cerrado': 'status-closed' };
    return map[status] || 'status-open';
}

function searchTicket() {
    const id = document.getElementById('ticket-search').value;
    if (id.length > 5) {
        document.getElementById('ticket-result').classList.remove('hidden');
        document.getElementById('res-id').textContent = id.toUpperCase();
    } else {
        showToast('Error', 'Ingresa un ID de ticket válido.', true);
    }
}