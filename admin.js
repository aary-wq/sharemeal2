import AdminService from './services/admin.js';

class AdminDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.setupEventListeners();
        this.initializeCharts();
        this.loadDashboardData();
        this.connectWebSocket();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.switchSection(section);
            });
        });

        // Mobile sidebar toggle
        document.querySelector('.sidebar-toggle').addEventListener('click', () => {
            document.querySelector('.admin-sidebar').classList.toggle('show');
        });

        // Donation actions
        document.getElementById('donationsTable')?.addEventListener('click', (e) => {
            if (e.target.matches('.approve-btn')) {
                this.handleDonationApproval(e.target.dataset.id);
            } else if (e.target.matches('.reject-btn')) {
                this.handleDonationRejection(e.target.dataset.id);
            }
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === section);
        });

        // Show selected section
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
        this.loadSectionData(section);
    }

    async loadDashboardData() {
        try {
            const data = await AdminService.getDashboardStats();
            this.updateDashboardStats(data);
            this.updateActivityFeed(data.recentActivity);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Show error notification
        }
    }

    async loadSectionData(section) {
        try {
            switch (section) {
                case 'donations':
                    const donations = await AdminService.getDonations();
                    this.renderDonationsTable(donations);
                    break;
                case 'disaster-relief':
                    const relief = await AdminService.getDisasterRelief();
                    this.renderDisasterRelief(relief);
                    break;
                // Add other section data loading
            }
        } catch (error) {
            console.error(`Error loading ${section} data:`, error);
            // Show error notification
        }
    }

    initializeCharts() {
        const ctx = document.getElementById('donationChart').getContext('2d');
        this.donationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Food Donations',
                    data: [],
                    borderColor: '#0d6efd'
                }, {
                    label: 'Money Donations',
                    data: [],
                    borderColor: '#198754'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateDashboardStats(data) {
        // Update stats cards
        document.querySelectorAll('.stats-card').forEach(card => {
            const key = card.dataset.stat;
            if (data[key]) {
                card.querySelector('h3').textContent = data[key].value;
                card.querySelector('.stats-trend').textContent = `${data[key].trend}%`;
            }
        });

        // Update charts
        this.donationChart.data.labels = data.chartData.labels;
        this.donationChart.data.datasets[0].data = data.chartData.food;
        this.donationChart.data.datasets[1].data = data.chartData.money;
        this.donationChart.update();
    }

    renderDonationsTable(donations) {
        const tbody = document.getElementById('donationsTable');
        tbody.innerHTML = donations.map(donation => `
            <tr>
                <td>${donation._id}</td>
                <td>${donation.donor.fullName}</td>
                <td>
                    <span class="badge bg-${donation.type === 'food' ? 'success' : 'primary'}">
                        ${donation.type}
                    </span>
                </td>
                <td>
                    <span class="badge bg-${this.getStatusColor(donation.status)}">
                        ${donation.status}
                    </span>
                </td>
                <td>${new Date(donation.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-btn" data-id="${donation._id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-success approve-btn" data-id="${donation._id}">
                            <i class="bi bi-check"></i>
                        </button>
                        <button class="btn btn-outline-danger reject-btn" data-id="${donation._id}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        const colors = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger',
            completed: 'info'
        };
        return colors[status] || 'secondary';
    }

    async handleDonationApproval(id) {
        try {
            await AdminService.updateDonationStatus(id, 'approved');
            // Refresh donations table
            this.loadSectionData('donations');
            // Show success notification
        } catch (error) {
            console.error('Error approving donation:', error);
            // Show error notification
        }
    }

    connectWebSocket() {
        const ws = new WebSocket('ws://localhost:5000');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealTimeUpdate(data);
        };

        ws.onclose = () => {
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'new_donation':
                this.showNotification('New donation request received');
                if (this.currentSection === 'donations') {
                    this.loadSectionData('donations');
                }
                break;
            case 'status_update':
                this.showNotification(`Donation ${data.id} status updated to ${data.status}`);
                break;
            // Handle other update types
        }
    }

    showNotification(message) {
        // Implement notification display
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
}); 