import AuthService from './services/auth.js';
import DonationService from './services/donation.js';

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
            } else {
                donation = await DonationService.createMoneyDonation(formData);
            }

            // Show success message and redirect
            alert('Donation submitted successfully!');
            window.location.href = '/donor-dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });
}); 