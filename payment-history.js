import PaymentService from './services/payment.js';
import { requireAuth } from './middleware/protectedRoute.js';

class PaymentHistory {
    constructor() {
        this.payments = [];
        this.currentFilter = 'all';
        
        this.setupEventListeners();
        this.loadPayments();
    }

    setupEventListeners() {
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    async loadPayments() {
        try {
            this.payments = await PaymentService.getPaymentHistory();
            this.renderPayments();
        } catch (error) {
            console.error('Error loading payments:', error);
            this.showError('Failed to load payment history');
        }
    }

    renderPayments() {
        const tbody = document.getElementById('paymentHistory');
        const emptyState = document.getElementById('emptyState');
        
        const filteredPayments = this.filterPayments();

        if (filteredPayments.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tbody.innerHTML = filteredPayments.map(payment => this.createPaymentRow(payment)).join('');
    }

    createPaymentRow(payment) {
        return `
            <tr>
                <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
                <td>${payment.currency.toUpperCase()} ${payment.amount}</td>
                <td>${payment.donationId?.type || 'Money'}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(payment.status)}">
                        ${payment.status}
                    </span>
                </td>
                <td>
                    ${payment.receipt ? `
                        <a href="/api/payment/receipt/${payment._id}" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-download"></i> Receipt
                        </a>
                    ` : '-'}
                </td>
                <td>
                    <a href="/track-donation.html?id=${payment.donationId?._id}" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-eye"></i> View Details
                    </a>
                </td>
            </tr>
        `;
    }

    filterPayments() {
        if (this.currentFilter === 'all') return this.payments;
        return this.payments.filter(p => p.status === this.currentFilter);
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.classList.toggle('active', button.dataset.filter === filter);
        });
        
        this.renderPayments();
    }

    getStatusColor(status) {
        const colors = {
            completed: 'success',
            pending: 'warning',
            failed: 'danger'
        };
        return colors[status] || 'secondary';
    }

    showError(message) {
        // Implement error display
    }
}

// Check authentication before initializing
requireAuth();
new PaymentHistory(); 