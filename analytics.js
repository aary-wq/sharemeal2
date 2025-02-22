import PaymentService from './services/payment.js';
import { requireAuth } from './middleware/protectedRoute.js';

class Analytics {
    constructor() {
        this.charts = {};
        this.data = {
            payments: [],
            trends: {},
            summary: {}
        };

        this.initializeCharts();
        this.loadData();
    }

    async loadData() {
        try {
            const payments = await PaymentService.getPaymentHistory();
            this.data.payments = payments;
            this.calculateMetrics();
            this.updateUI();
            this.updateCharts();
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    calculateMetrics() {
        const payments = this.data.payments;
        
        // Calculate summary metrics
        this.data.summary = {
            totalDonations: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
            successRate: (payments.filter(p => p.status === 'completed').length / payments.length) * 100,
            avgDonation: payments.length ? this.data.summary.totalAmount / payments.length : 0
        };

        // Calculate trends
        const previousPeriod = payments.filter(p => {
            const date = new Date(p.createdAt);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return date >= monthAgo;
        });

        this.data.trends = {
            donations: this.calculateTrend(previousPeriod.length, payments.length),
            amount: this.calculateTrend(
                previousPeriod.reduce((sum, p) => sum + p.amount, 0),
                this.data.summary.totalAmount
            )
        };
    }

    calculateTrend(current, previous) {
        if (!previous) return 0;
        return ((current - previous) / previous) * 100;
    }

    updateUI() {
        // Update summary cards
        document.getElementById('totalDonations').textContent = this.data.summary.totalDonations;
        document.getElementById('totalAmount').textContent = `₹${this.data.summary.totalAmount}`;
        document.getElementById('successRate').textContent = `${this.data.summary.successRate.toFixed(1)}%`;
        document.getElementById('avgDonation').textContent = `₹${this.data.summary.avgDonation.toFixed(2)}`;

        // Update trends
        document.getElementById('donationTrend').textContent = `${this.data.trends.donations.toFixed(1)}%`;
        document.getElementById('amountTrend').textContent = `${this.data.trends.amount.toFixed(1)}%`;

        // Update recent activity
        this.updateRecentActivity();
    }

    initializeCharts() {
        // Donation trends chart
        this.charts.trends = new Chart(document.getElementById('trendChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Donations',
                    data: [],
                    borderColor: '#4299e1',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Donation types chart
        this.charts.types = new Chart(document.getElementById('typeChart'), {
            type: 'doughnut',
            data: {
                labels: ['Food', 'Money'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#48bb78', '#4299e1']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateCharts() {
        // Update trend chart
        const monthlyData = this.getMonthlyData();
        this.charts.trends.data.labels = monthlyData.labels;
        this.charts.trends.data.datasets[0].data = monthlyData.values;
        this.charts.trends.update();

        // Update type chart
        const typeData = this.getTypeData();
        this.charts.types.data.datasets[0].data = [typeData.food, typeData.money];
        this.charts.types.update();
    }

    getMonthlyData() {
        // Calculate monthly aggregates
        const monthly = {};
        this.data.payments.forEach(payment => {
            const date = new Date(payment.createdAt);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthly[key] = (monthly[key] || 0) + payment.amount;
        });

        return {
            labels: Object.keys(monthly),
            values: Object.values(monthly)
        };
    }

    getTypeData() {
        return {
            food: this.data.payments.filter(p => p.type === 'food').length,
            money: this.data.payments.filter(p => p.type === 'money').length
        };
    }

    updateRecentActivity() {
        const tbody = document.getElementById('recentActivity');
        const recent = this.data.payments.slice(0, 5);

        tbody.innerHTML = recent.map(payment => `
            <tr>
                <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
                <td>${payment.type}</td>
                <td>₹${payment.amount}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(payment.status)}">
                        ${payment.status}
                    </span>
                </td>
                <td>${this.calculateImpact(payment)}</td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        const colors = {
            completed: 'success',
            pending: 'warning',
            failed: 'danger'
        };
        return colors[status] || 'secondary';
    }

    calculateImpact(payment) {
        // Implement impact calculation logic
        return 'Helped 10 people';
    }
}

// Check authentication before initializing
requireAuth();
new Analytics(); 