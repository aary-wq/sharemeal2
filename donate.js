document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    flatpickr("#pickupDateTime", {
        enableTime: true,
        minDate: "today",
        minTime: "09:00",
        maxTime: "18:00",
        dateFormat: "Y-m-d H:i",
        disable: [
            function(date) {
                // Disable weekends
                return (date.getDay() === 0 || date.getDay() === 6);
            }
        ]
    });

    // Sample NGO data - Replace with actual API call
    const ngos = [
        { id: 1, name: "Food Bank Foundation" },
        { id: 2, name: "Community Help Center" },
        { id: 3, name: "Local Food Drive" }
    ];

    // Populate NGO dropdown
    const ngoSelect = document.getElementById('ngo');
    ngos.forEach(ngo => {
        const option = document.createElement('option');
        option.value = ngo.id;
        option.textContent = ngo.name;
        ngoSelect.appendChild(option);
    });

    // Check for NGO selection in URL
    const urlParams = new URLSearchParams(window.location.search);
    const preSelectedNgo = urlParams.get('ngo');
    
    if (preSelectedNgo) {
        ngoSelect.value = preSelectedNgo;
    }

    // Handle donation type toggle
    const donationType = document.getElementsByName('donationType');
    const foodFields = document.querySelectorAll('.food-donation-fields');
    const moneyFields = document.querySelectorAll('.money-donation-fields');

    function toggleDonationFields() {
        const selectedType = document.querySelector('input[name="donationType"]:checked').value;
        
        foodFields.forEach(field => {
            field.style.display = selectedType === 'food' ? 'block' : 'none';
            field.querySelector('input, textarea')?.toggleAttribute('required', selectedType === 'food');
        });

        moneyFields.forEach(field => {
            field.style.display = selectedType === 'money' ? 'block' : 'none';
            field.querySelector('input')?.toggleAttribute('required', selectedType === 'money');
        });
    }

    donationType.forEach(radio => {
        radio.addEventListener('change', toggleDonationFields);
    });

    // Form validation and submission
    const form = document.getElementById('donationForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            donationType: document.querySelector('input[name="donationType"]:checked').value,
            ngo: document.getElementById('ngo').value,
            address: document.getElementById('address').value,
            pickupDateTime: document.getElementById('pickupDateTime').value,
            amount: document.getElementById('amount').value
        };

        // Submit data to backend
        submitDonation(formData);
    });

    async function submitDonation(data) {
        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
            submitButton.disabled = true;

            // Replace with your actual API endpoint
            const response = await fetch('/api/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Submission failed');
            }

            // Show success message
            form.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                    <h3 class="mt-4">Thank You!</h3>
                    <p class="lead">Your donation has been submitted successfully.</p>
                    <a href="index.html" class="btn btn-primary mt-4">Return to Home</a>
                </div>
            `;

        } catch (error) {
            // Show error message
            alert('There was an error submitting your donation. Please try again.');
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }
}); 