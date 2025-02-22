import AuthService from './services/auth.js';
import DonationService from './services/donation.js';
import PaymentService from './services/payment.js';
import NotificationHandler from './notifications.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    const donationForm = document.getElementById('donationForm');
    const foodForm = document.getElementById('foodForm');
    const moneyForm = document.getElementById('moneyForm');
    const foodDonation = document.getElementById('foodDonation');
    const moneyDonation = document.getElementById('moneyDonation');

    // Toggle between food and money donation forms
    foodDonation.addEventListener('change', () => {
        foodForm.style.display = 'block';
        moneyForm.style.display = 'none';
    });

    moneyDonation.addEventListener('change', () => {
        foodForm.style.display = 'none';
        moneyForm.style.display = 'block';
    });

    // Handle form submission
    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(donationForm);
        const donationType = formData.get('type');

        try {
            let donation;
            if (donationType === 'food') {
                donation = await DonationService.createFoodDonation(formData);
                alert('Food donation submitted successfully!');
                window.location.href = '/donor-dashboard.html';
            } else {
                await handleMoneyDonation(formData);
            }
        } catch (error) {
            alert(error.message);
        }
    });

    const stripe = Stripe('your_publishable_key');
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    card.addEventListener('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    async function handleMoneyDonation(formData) {
        try {
            const amount = formData.get('amount');
            
            // Create payment method
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement('card')
            });

            if (error) {
                throw new Error(error.message);
            }

            // Process payment
            const paymentResult = await PaymentService.processPayment(
                paymentMethod.id,
                amount
            );

            // Create donation record
            const donation = await DonationService.createDonation({
                type: 'money',
                amount,
                paymentId: paymentResult.id
            });

            // Show success message
            showSuccess('Payment successful! Thank you for your donation.');
            
            // Redirect to donation tracking
            setTimeout(() => {
                window.location.href = `/track-donation.html?id=${donation._id}`;
            }, 2000);
        } catch (error) {
            console.error('Payment error:', error);
            showError(error.message);
        }
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'payment-success';
        successDiv.innerHTML = `
            <i class="bi bi-check-circle"></i>
            <h4>${message}</h4>
        `;
        donationForm.innerHTML = '';
        donationForm.appendChild(successDiv);
    }

    function showError(message) {
        const errorDiv = document.getElementById('card-errors');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    NotificationHandler.init();
}); 