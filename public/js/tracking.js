class TrackingService {
    static async getDonation(donationId) {
        try {
            const response = await fetch(`/api/tracking/${donationId}`);
            if (!response.ok) throw new Error('Donation not found');
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static getStatusClass(status) {
        const statusClasses = {
            'pending': 'bg-warning',
            'accepted': 'bg-info',
            'picked_up': 'bg-primary',
            'in_transit': 'bg-primary',
            'delivered': 'bg-success'
        };
        return statusClasses[status] || 'bg-secondary';
    }

    static formatDate(date) {
        return new Date(date).toLocaleString();
    }

    static renderTimeline(updates) {
        return updates.map(update => `
            <div class="timeline-item">
                <div class="timeline-badge ${this.getStatusClass(update.status)}">
                    <i class="bi bi-circle-fill"></i>
                </div>
                <div class="timeline-content">
                    <h5>${update.status.replace('_', ' ').toUpperCase()}</h5>
                    <p>${update.note || ''}</p>
                    <small>${this.formatDate(update.timestamp)}</small>
                    ${update.location ? `<p class="location"><i class="bi bi-geo-alt"></i> ${update.location}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    static renderDonationDetails(donation) {
        return `
            <div class="row">
                <div class="col-md-6">
                    <h5>Donor Details</h5>
                    <p>Name: ${donation.donor.name}</p>
                    <p>Email: ${donation.donor.email}</p>
                </div>
                <div class="col-md-6">
                    <h5>NGO Details</h5>
                    <p>Name: ${donation.ngo.name}</p>
                    <p>Email: ${donation.ngo.email}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h5>Items Donated</h5>
                    <ul>
                        ${donation.items.map(item => `
                            <li>${item.quantity} ${item.unit} of ${item.name}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
}

// Event Listeners
document.getElementById('trackingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const donationId = document.getElementById('donationId').value;
    const resultDiv = document.getElementById('trackingResult');
    
    try {
        const donation = await TrackingService.getDonation(donationId);
        
        document.querySelector('.donation-id').textContent = `Donation ID: ${donation.donationId}`;
        document.querySelector('.tracking-timeline').innerHTML = TrackingService.renderTimeline(donation.statusUpdates);
        document.querySelector('.donation-details').innerHTML = TrackingService.renderDonationDetails(donation);
        
        resultDiv.style.display = 'block';
    } catch (error) {
        alert('Could not find donation with this ID');
        resultDiv.style.display = 'none';
    }
}); 