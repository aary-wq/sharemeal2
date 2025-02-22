document.addEventListener('DOMContentLoaded', function() {
    // Form validation
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                event.stopPropagation();
            } else {
                // Handle form submission here
                console.log('Form submitted successfully');
            }
            form.classList.add('was-validated');
        });
    });

    // Password toggle functionality
    const togglePassword = document.querySelectorAll('[id^="toggle"]');
    togglePassword.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    });

    // Additional validation for signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');

        // Password validation
        password.addEventListener('input', function() {
            if (this.value.length < 8) {
                this.setCustomValidity('Password must be at least 8 characters long');
            } else {
                this.setCustomValidity('');
            }
        });

        // Confirm password validation
        confirmPassword.addEventListener('input', function() {
            if (this.value !== password.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });

        // Email validation
        email.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.value)) {
                this.setCustomValidity('Please enter a valid email address');
            } else {
                this.setCustomValidity('');
            }
        });

        // Phone validation
        phone.addEventListener('input', function() {
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(this.value)) {
                this.setCustomValidity('Please enter a valid phone number');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}); 