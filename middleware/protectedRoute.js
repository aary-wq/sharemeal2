import AuthService from '../services/auth.js';

function getUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

export function requireAuth(allowedRoles = []) {
    if (!AuthService.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    if (allowedRoles.length > 0) {
        const userRole = getUserRole();
        if (!allowedRoles.includes(userRole)) {
            window.location.href = '/unauthorized.html';
            return;
        }
    }
} 