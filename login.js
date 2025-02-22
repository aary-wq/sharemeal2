import AuthService from './services/auth.js';

// Function to decode JWT and get user role
function getUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        // Decode the JWT (the part between the first and second dots)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await AuthService.login({ email, password });
        // Get role from the response token
        const role = getUserRole();
        
        if (role === 'ngo') {
            window.location.href = '/ngo-dashboard.html';
        } else if (role === 'donor') {
            window.location.href = '/donor-dashboard.html';
        } else {
            showError('Invalid user role');
        }
    } catch (error) {
        showError(error.message);
    }
});

// Google Sign-In
function handleGoogleSignIn(response) {
    try {
        await AuthService.googleLogin(response.credential);
        // Handle successful login
    } catch (error) {
        showError(error.message);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
} 