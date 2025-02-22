class AuthService {
    static async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static async updateProfile(profileData) {
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.getToken()
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error;
        }
    }
}

export default AuthService; 