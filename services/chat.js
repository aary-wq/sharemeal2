const API_URL = 'http://localhost:5000/api';

class ChatService {
    constructor() {
        this.ws = new WebSocket('ws://localhost:5000');
        this.messageHandlers = new Set();
    }

    addMessageHandler(handler) {
        this.messageHandlers.add(handler);
    }

    removeMessageHandler(handler) {
        this.messageHandlers.delete(handler);
    }

    async sendMessage(message) {
        const response = await fetch(`${API_URL}/chatbot/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send message');
        }

        return data;
    }

    formatResponse(response) {
        // Convert URLs to clickable links
        return response.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank">$1</a>'
        );
    }
}

export default new ChatService(); 