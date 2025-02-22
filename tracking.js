import TrackingService from './services/tracking.js';

class DonationTracker {
    constructor() {
        this.donationId = new URLSearchParams(window.location.search).get('id');
        this.map = null;
        this.markers = {
            pickup: null,
            delivery: null,
            current: null
        };
        this.socket = null;

        if (!this.donationId) {
            window.location.href = '/donations.html';
            return;
        }

        this.initializeMap();
        this.initializeTracking();
        this.connectWebSocket();
    }

    initializeMap() {
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: { lat: 20.5937, lng: 78.9629 }, // Default to India
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

    async initializeTracking() {
        try {
            const donation = await TrackingService.getDonationDetails(this.donationId);
            this.updateUI(donation);
            this.updateMap(donation);
        } catch (error) {
            console.error('Error initializing tracking:', error);
            alert('Failed to load donation details');
        }
    }

    connectWebSocket() {
        this.socket = new WebSocket('ws://localhost:5000');
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.donationId === this.donationId) {
                this.handleStatusUpdate(data);
            }
        };

        this.socket.onclose = () => {
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    updateUI(donation) {
        // Update status badge
        document.getElementById('statusBadge').textContent = donation.status;
        
        // Update progress steps
        const steps = ['pending', 'accepted', 'pickup', 'delivered'];
        const currentStep = steps.indexOf(donation.status);
        
        steps.forEach((step, index) => {
            const stepElement = document.querySelector(`[data-status="${step}"]`);
            if (index < currentStep) {
                stepElement.classList.add('completed');
            } else if (index === currentStep) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('completed', 'active');
            }
        });

        // Update donation details
        document.getElementById('donationId').textContent = donation._id;
        document.getElementById('donationType').textContent = donation.type;
        document.getElementById('createdAt').textContent = new Date(donation.createdAt).toLocaleString();
        document.getElementById('donorName').textContent = donation.donor.fullName;
        document.getElementById('ngoName').textContent = donation.assignedNGO?.fullName || 'Not assigned';
        document.getElementById('expectedDelivery').textContent = 
            donation.tracking.estimatedPickupTime ? 
            new Date(donation.tracking.estimatedPickupTime).toLocaleString() : 
            'To be determined';

        // Update status timeline
        const timelineContainer = document.getElementById('statusUpdates');
        timelineContainer.innerHTML = donation.tracking.statusUpdates
            .map(update => `
                <div class="status-update">
                    <div class="status-message">${update.message}</div>
                    <div class="status-time">${new Date(update.timestamp).toLocaleString()}</div>
                </div>
            `)
            .join('');
    }

    updateMap(donation) {
        // Clear existing markers
        Object.values(this.markers).forEach(marker => {
            if (marker) marker.setMap(null);
        });

        // Add pickup location marker
        if (donation.foodDetails?.pickupLocation?.coordinates) {
            this.markers.pickup = new google.maps.Marker({
                position: {
                    lat: donation.foodDetails.pickupLocation.coordinates.lat,
                    lng: donation.foodDetails.pickupLocation.coordinates.lng
                },
                map: this.map,
                icon: {
                    url: 'pickup-marker.png',
                    scaledSize: new google.maps.Size(32, 32)
                },
                title: 'Pickup Location'
            });
        }

        // Add current location marker if available
        if (donation.tracking?.location?.coordinates) {
            const position = {
                lat: donation.tracking.location.coordinates[1],
                lng: donation.tracking.location.coordinates[0]
            };
            
            this.markers.current = new google.maps.Marker({
                position: position,
                map: this.map,
                icon: {
                    url: 'delivery-truck.png',
                    scaledSize: new google.maps.Size(32, 32)
                },
                title: 'Current Location'
            });

            this.map.panTo(position);
        }
    }

    handleStatusUpdate(data) {
        // Update status UI
        const stepElement = document.querySelector(`[data-status="${data.status}"]`);
        stepElement.classList.add('active');
        stepElement.querySelector('.step-time').textContent = new Date().toLocaleTimeString();

        // Update map marker
        if (data.location) {
            const position = {
                lat: data.location.coordinates[1],
                lng: data.location.coordinates[0]
            };
            
            if (this.markers.current) {
                this.markers.current.setPosition(position);
            } else {
                this.markers.current = new google.maps.Marker({
                    position: position,
                    map: this.map,
                    icon: {
                        url: 'delivery-truck.png',
                        scaledSize: new google.maps.Size(32, 32)
                    }
                });
            }

            this.map.panTo(position);
        }

        // Add status update to timeline
        const timelineContainer = document.getElementById('statusUpdates');
        const updateElement = document.createElement('div');
        updateElement.className = 'status-update';
        updateElement.innerHTML = `
            <div class="status-message">${data.message}</div>
            <div class="status-time">${new Date().toLocaleString()}</div>
        `;
        timelineContainer.insertBefore(updateElement, timelineContainer.firstChild);
    }
}

// Initialize tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DonationTracker();
}); 