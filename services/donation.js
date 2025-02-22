const API_URL = 'http://localhost:5000/api';

class DonationService {
    static async createDonation(data) {
        const response = await fetch(`${API_URL}/donations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to create donation');
        }

        return responseData;
    }

    static async getDonationDetails(id) {
        const response = await fetch(`${API_URL}/donations/${id}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get donation details');
        }

        return data;
    }

    static async getDonationHistory() {
        const response = await fetch(`${API_URL}/donations/history`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get donation history');
        }

        return data;
    }

    static async updateDonationStatus(id, status, message) {
        const response = await fetch(`${API_URL}/donations/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ status, message })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update status');
        }

        return data;
    }

    static async processPayment(donationId, paymentDetails) {
        const response = await fetch(`${API_URL}/donations/${donationId}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(paymentDetails)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Payment failed');
        }

        return data;
    }
}

export default DonationService; 