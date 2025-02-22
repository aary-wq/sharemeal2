document.addEventListener('DOMContentLoaded', function() {
    // Donation Type Toggle
    const foodDonation = document.getElementById('foodDonation');
    const moneyDonation = document.getElementById('moneyDonation');
    const foodForm = document.getElementById('foodForm');
    const moneyForm = document.getElementById('moneyForm');

    foodDonation.addEventListener('change', function() {
        foodForm.style.display = 'block';
        moneyForm.style.display = 'none';
    });

    moneyDonation.addEventListener('change', function() {
        foodForm.style.display = 'none';
        moneyForm.style.display = 'block';
    });

    // Form Submission
    const donationForm = document.getElementById('donationForm');
    const submitButton = document.querySelector('.modal-footer .btn-primary');

    submitButton.addEventListener('click', function() {
        // Add your form submission logic here
        const formData = new FormData(donationForm);
        console.log('Submitting donation:', Object.fromEntries(formData));
        
        // Show success message
        showToast('Donation submitted successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('donationModal'));
        modal.hide();
    });
});

// Add donation-specific styles to the existing dashboard.css
const styles = `
    .donation-timeline {
        padding: 1rem 0;
    }

    .donation-item {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .donation-status {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .status-point {
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        margin-bottom: 0.5rem;
    }

    .status-line {
        flex: 1;
        width: 2px;
        background-color: #dee2e6;
    }

    .donation-content {
        flex: 1;
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .donation-content h6 {
        margin: 0;
    }

    .donation-content p {
        margin: 0.5rem 0;
    }

    .donation-content .progress {
        margin: 0.5rem 0;
    }
`;

// Add styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet); 