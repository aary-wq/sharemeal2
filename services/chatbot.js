const API_URL = 'http://localhost:5000/api';

class ChatbotService {
    static async sendMessage(message, language = 'en') {
        const response = await fetch(`${API_URL}/chatbot/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ message, language })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get response');
        }

        return data;
    }

    static formatResponse(response, context) {
        let formattedResponse = response;

        // Add relief information if available
        if (context?.reliefInfo) {
            formattedResponse = `
                <div class="relief-info">
                    <div class="title">Current Relief Efforts:</div>
                    <p>${context.reliefInfo}</p>
                </div>
                ${formattedResponse}
            `;
        }

        // Convert URLs to clickable links
        formattedResponse = formattedResponse.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank">$1</a>'
        );

        return formattedResponse;
    }

    static handleEmergency() {
        const modal = new bootstrap.Modal(document.getElementById('emergencyModal'));
        modal.show();
    }
}

export default ChatbotService; 