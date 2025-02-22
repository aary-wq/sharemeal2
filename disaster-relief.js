import DisasterReliefService from './services/disaster-relief.js';

class DisasterRelief {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.currentView = 'all';

        this.initializeMap();
        this.setupEventListeners();
        this.loadReliefEfforts();
        this.connectWebSocket();
    }

    initializeMap() {
        this.map = new google.maps.Map(document.getElementById('reliefMap'), {
            zoom: 5,
            center: { lat: 20.5937, lng: 78.9629 }, // Center on India
            styles: [
                {
                    featureType: "all",
                    elementType: "geometry.fill",
                    stylers: [{ weight: "2.00" }]
                }
                // Add more custom styles as needed
            ]
        });
    }

    setupEventListeners() {
        // View filters
        document.querySelectorAll('[data-view]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentView = e.target.dataset.view;
                this.updateView();
            });
        });

        // Form submissions
        document.getElementById('donateForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDonation(new FormData(e.target));
        });

        document.getElementById('volunteerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVolunteer(new FormData(e.target));
        });
    }

    async loadReliefEfforts() {
        try {
            const efforts = await DisasterReliefService.getReliefEfforts();
            this.updateMap(efforts);
            this.updateTable(efforts);
            this.updateUpdates(efforts);
        } catch (error) {
            console.error('Error loading relief efforts:', error);
            // Show error notification
        }
    }

    updateMap(efforts) {
        // Clear existing markers
        this.markers.forEach(marker => marker.setMap(null));
        this.markers.clear();

        efforts.forEach(effort => {
            if (this.shouldShowEffort(effort)) {
                const marker = new google.maps.Marker({
                    position: {
                        lat: effort.location.coordinates[1],
                        lng: effort.location.coordinates[0]
                    },
                    map: this.map,
                    title: effort.title,
                    icon: this.getMarkerIcon(effort.severity)
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: this.createInfoWindowContent(effort)
                });

                marker.addListener('click', () => {
                    infoWindow.open(this.map, marker);
                });

                this.markers.set(effort._id, marker);
            }
        });
    }

    updateTable(efforts) {
        const tbody = document.getElementById('reliefTable');
        tbody.innerHTML = efforts
            .filter(effort => this.shouldShowEffort(effort))
            .map(effort => `
                <tr>
                    <td>${effort.location.address}</td>
                    <td>
                        <span class="badge bg-${this.getTypeColor(effort.type)}">
                            ${effort.type}
                        </span>
                    </td>
                    <td>
                        <span class="status-indicator status-${effort.status}"></span>
                        ${effort.status}
                    </td>
                    <td>
                        ${effort.requirements.map(req => `
                            <span class="requirement-tag ${req.type} ${req.urgency === 'high' ? 'urgent' : ''}">
                                ${req.type}
                            </span>
                        `).join('')}
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="viewDetails('${effort._id}')">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" onclick="donate('${effort._id}')">
                                <i class="bi bi-heart"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
    }

    shouldShowEffort(effort) {
        switch (this.currentView) {
            case 'active':
                return effort.status === 'active';
            case 'urgent':
                return effort.severity === 'critical';
            default:
                return true;
        }
    }

    getMarkerIcon(severity) {
        const colors = {
            low: '#28a745',
            medium: '#ffc107',
            high: '#fd7e14',
            critical: '#dc3545'
        };

        return {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: colors[severity],
            fillOpacity: 0.7,
            strokeWeight: 1,
            strokeColor: '#fff',
            scale: 10
        };
    }

    getTypeColor(type) {
        const colors = {
            flood: 'info',
            earthquake: 'danger',
            pandemic: 'warning',
            drought: 'primary',
            other: 'secondary'
        };
        return colors[type] || 'secondary';
    }

    createInfoWindowContent(effort) {
        return `
            <div class="info-window">
                <h6>${effort.title}</h6>
                <p class="mb-2">${effort.description}</p>
                <div class="requirements mb-2">
                    ${effort.requirements.map(req => `
                        <span class="requirement-tag ${req.type}">
                            ${req.type}: ${req.fulfilled}/${req.quantity} ${req.unit}
                        </span>
                    `).join('')}
                </div>
                <button class="btn btn-sm btn-primary" onclick="donate('${effort._id}')">
                    Donate Now
                </button>
            </div>
        `;
    }

    connectWebSocket() {
        const ws = new WebSocket('ws://localhost:5000');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'relief_update') {
                this.handleReliefUpdate(data);
            }
        };

        ws.onclose = () => {
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    handleReliefUpdate(data) {
        // Update UI based on the type of update
        switch (data.updateType) {
            case 'new_effort':
                this.loadReliefEfforts();
                break;
            case 'status_change':
                this.updateEffortStatus(data.effortId, data.status);
                break;
            case 'donation_received':
                this.updateRequirements(data.effortId, data.requirements);
                break;
        }
    }
}

// Initialize relief dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DisasterRelief();
}); 