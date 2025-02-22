import EmergencyService from './services/emergency.js';

class EmergencyRequestForm {
    constructor() {
        this.form = document.getElementById('emergencyRequestForm');
        this.submitButton = document.getElementById('submitButton');
        this.spinner = this.submitButton.querySelector('.spinner-border');
        this.map = null;
        this.marker = null;
        this.autocomplete = null;

        this.initializeMap();
        this.setupEventListeners();
    }

    initializeMap() {
        // Initialize Google Maps
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: { lat: 20.5937, lng: 78.9629 } // Default to India
        });

        // Initialize location autocomplete
        this.autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('locationInput')
        );

        // Initialize marker
        this.marker = new google.maps.Marker({
            map: this.map,
            draggable: true
        });

        // Update coordinates when marker is dragged
        this.marker.addListener('dragend', () => {
            const position = this.marker.getPosition();
            this.updateCoordinates(position.lat(), position.lng());
        });

        // Update marker when place is selected
        this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace();
            if (place.geometry) {
                const position = place.geometry.location;
                this.map.setCenter(position);
                this.marker.setPosition(position);
                this.updateCoordinates(position.lat(), position.lng());
            }
        });
    }

    updateCoordinates(lat, lng) {
        document.querySelector('input[name="latitude"]').value = lat;
        document.querySelector('input[name="longitude"]').value = lng;
    }

    setupEventListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    async handleSubmit() {
        try {
            this.setLoading(true);

            const formData = new FormData(this.form);
            const data = {
                type: formData.get('type'),
                urgencyLevel: formData.get('urgencyLevel'),
                details: {
                    beneficiaries: parseInt(formData.get('beneficiaries')),
                    description: formData.get('description'),
                    requirements: formData.get('requirements')
                },
                location: {
                    address: document.getElementById('locationInput').value,
                    coordinates: [
                        parseFloat(formData.get('longitude')),
                        parseFloat(formData.get('latitude'))
                    ]
                },
                contact: {
                    name: formData.get('contactName'),
                    phone: formData.get('contactPhone'),
                    email: formData.get('contactEmail')
                }
            };

            const response = await EmergencyService.createRequest(data);
            
            // Show success message
            alert('Emergency request submitted successfully!');
            
            // Redirect to tracking page
            window.location.href = `/emergency-tracking.html?id=${response._id}`;
        } catch (error) {
            console.error('Submit error:', error);
            alert(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        this.submitButton.disabled = isLoading;
        this.spinner.classList.toggle('d-none', !isLoading);
        this.submitButton.textContent = isLoading ? 'Submitting...' : 'Submit Emergency Request';
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmergencyRequestForm();
}); 