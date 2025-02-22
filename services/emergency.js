const API_URL = 'http://localhost:5000/api';

class EmergencyService {
    static async createRequest(data) {
        const response = await fetch(`${API_URL}/emergency`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to submit request');
        }

        return responseData;
    }

    static async getNearbyHelpers(coordinates, radius = 5000) {
        const response = await fetch(
            `${API_URL}/emergency/helpers?lat=${coordinates[1]}&lng=${coordinates[0]}&radius=${radius}`,
            {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get nearby helpers');
        }

        return data;
    }

    static async updateRequestStatus(requestId, status) {
        const response = await fetch(`${API_URL}/emergency/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update status');
        }

        return data;
    }
}

export default EmergencyService; 