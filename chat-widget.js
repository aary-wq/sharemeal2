import ChatService from './services/chat.js';

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        const chatToggle = document.getElementById('chatToggle');
        const chatForm = document.getElementById('chatForm');
        const chatClose = document.getElementById('chatClose');

        chatToggle.addEventListener('click', () => this.toggleChat());
        chatClose.addEventListener('click', () => this.toggleChat());
        chatForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Quick reply buttons
        document.querySelectorAll('.quick-reply').forEach(button => {
            button.addEventListener('click', () => {
                this.handleQuickReply(button.dataset.message);
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (!message || this.isTyping) return;

        input.value = '';
        await this.sendMessage(message);
    }

    async handleQuickReply(message) {
        if (this.isTyping) return;
        await this.sendMessage(message);
    }

    async sendMessage(message) {
        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const response = await ChatService.sendMessage(message);
            this.hideTypingIndicator();

            // Add AI response
            if (response.type === 'error') {
                this.addErrorMessage();
            } else {
                const formattedResponse = ChatService.formatResponse(response.response);
                this.addMessage(formattedResponse, 'bot');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addErrorMessage();
        }
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${type === 'user' ? content : this.formatMessage(content)}
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // Add formatting for special content (links, buttons, etc.)
        return content.replace(/\n/g, '<br>');
    }

    addWelcomeMessage() {
        const welcomeMessage = `Hello! 👋 I'm your ShareMeal assistant. How can I help you today?
        
        Quick options:
        • Learn about donation process
        • Track your donation
        • Emergency food relief
        • Find nearby NGOs`;

        this.addMessage(welcomeMessage, 'bot');
    }

    addErrorMessage() {
        const errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again later.";
        this.addMessage(errorMessage, 'bot');
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-container';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    toggleChat() {
        const chatWindow = document.getElementById('chatWindow');
        this.isOpen = !this.isOpen;
        chatWindow.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen) {
            document.getElementById('messageInput').focus();
        }
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
}); 