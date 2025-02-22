const API_URL = 'http://localhost:5000/api';

class AuthService {
    static async register(userData) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        
        localStorage.setItem('token', data.token);
        return data;
    }

    static async login(credentials) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        
        localStorage.setItem('token', data.token);
        return data;
    }

    static async googleLogin(token) {
        const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }
        
        localStorage.setItem('token', data.token);
        return data;
    }

    static logout() {
        localStorage.removeItem('token');
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getToken() {
        return localStorage.getItem('token');
    }
}

export default AuthService; 