class TrackingService {
    constructor() {
        this.ws = new WebSocket('ws://localhost:5000');
        this.listeners = new Map();
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'STATUS_UPDATE') {
                this.notifyListeners(data);
            }
        };
    }

    addListener(donationId, callback) {
        if (!this.listeners.has(donationId)) {
            this.listeners.set(donationId, new Set());
        }
        this.listeners.get(donationId).add(callback);
    }

    removeListener(donationId, callback) {
        if (this.listeners.has(donationId)) {
            this.listeners.get(donationId).delete(callback);
        }
    }

    notifyListeners(data) {
        if (this.listeners.has(data.donationId)) {
            this.listeners.get(data.donationId).forEach(callback => callback(data));
        }
    }

    async updateStatus(donationId, status, location, message) {
        const response = await fetch(`/api/tracking/${donationId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ status, location, message })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    }

    async getTrackingDetails(donationId) {
        const response = await fetch(`/api/tracking/${donationId}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    }
}

export default new TrackingService(); 