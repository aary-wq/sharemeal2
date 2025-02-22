class ShareMealChatbot {
    constructor() {
        // Create and append chat widget first
        this.createChatWidget();
        
        // Then initialize elements
        this.chatWindow = document.getElementById('chatWindow');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.chatToggle = document.getElementById('chatToggle');
        this.chatClose = document.getElementById('chatClose');
        this.suggestionBtns = document.querySelectorAll('.suggestion-btn');
        
        this.setupEventListeners();
        this.initializeChat();
    }

    createChatWidget() {
        const chatHTML = `
            <div id="chat-widget" class="chat-widget">
                <!-- Chat Toggle Button -->
                <button id="chatToggle" class="chat-toggle">
                    <i class="bi bi-chat-dots-fill"></i>
                    <span class="badge bg-danger position-absolute top-0 start-100 translate-middle" style="display: none;">1</span>
                </button>

                <!-- Chat Window -->
                <div id="chatWindow" class="chat-window" style="display: none;">
                    <div class="chat-header">
                        <div class="d-flex align-items-center">
                            <img src="logo.png" alt="ShareMeal Assistant" height="30">
                            <div class="ms-2">
                                <h6 class="mb-0">ShareMeal Assistant</h6>
                                <small class="text-success">Online</small>
                            </div>
                        </div>
                        <button class="btn-close" id="chatClose"></button>
                    </div>
                    
                    <div class="chat-messages" id="chatMessages">
                        <!-- Messages will be added here -->
                    </div>

                    <div class="chat-suggestions" id="chatSuggestions">
                        <button class="suggestion-btn" data-query="How do I donate food?">How do I donate food?</button>
                        <button class="suggestion-btn" data-query="Find nearby NGOs">Find nearby NGOs</button>
                        <button class="suggestion-btn" data-query="Emergency food relief">Emergency food relief</button>
                        <button class="suggestion-btn" data-query="Donation process">Donation process</button>
                    </div>

                    <div class="chat-input">
                        <form id="chatForm">
                            <div class="input-group">
                                <input type="text" id="messageInput" class="form-control" placeholder="Type your message...">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-send"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    setupEventListeners() {
        // Toggle chat window
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        this.chatClose.addEventListener('click', () => this.toggleChat());

        // Handle form submission
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = this.messageInput.value.trim();
            if (message) {
                this.handleUserMessage(message);
                this.messageInput.value = '';
            }
        });

        // Handle suggestion buttons
        this.suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                this.handleUserMessage(query);
            });
        });
    }

    initializeChat() {
        this.addMessage('Hello! 👋 I\'m your ShareMeal assistant. How can I help you today?', 'bot');
    }

    toggleChat() {
        const isVisible = this.chatWindow.style.display !== 'none';
        this.chatWindow.style.display = isVisible ? 'none' : 'flex';
        // Hide notification badge when opening chat
        if (!isVisible) {
            this.chatToggle.querySelector('.badge').style.display = 'none';
        }
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot-message typing-indicator-container';
        indicator.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.chatMessages.appendChild(indicator);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return indicator;
    }

    async handleUserMessage(message) {
        // Add user message to chat
        this.addMessage(message, 'user');

        // Show typing indicator
        const typingIndicator = this.showTypingIndicator();

        // Process the message and get response
        const response = await this.processMessage(message);

        // Remove typing indicator
        typingIndicator.remove();

        // Add bot response
        this.addMessage(response, 'bot');
    }

    async processMessage(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Basic response patterns
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('donate food')) {
            return `To donate food:<br>
                1. Click the "New Donation" button in your dashboard<br>
                2. Select "Food Donation"<br>
                3. Fill in the food details and pickup address<br>
                4. Choose your preferred pickup time<br>
                5. Submit the request<br><br>
                Would you like me to help you start a food donation?`;
        }
        
        if (lowerMessage.includes('nearby ngo') || lowerMessage.includes('find ngo')) {
            // In a real implementation, this would integrate with the Google Maps API
            return `I can help you find nearby NGOs. Could you please share your location or enter your area/zip code?`;
        }

        if (lowerMessage.includes('emergency') || lowerMessage.includes('relief')) {
            return `For emergency food relief:<br>
                1. Contact our 24/7 helpline: 1-800-SHAREMEAL<br>
                2. Visit the nearest food bank (I can help locate one)<br>
                3. Request immediate assistance through your dashboard<br><br>
                Would you like me to connect you with emergency services?`;
        }

        if (lowerMessage.includes('process') || lowerMessage.includes('how')) {
            return `The ShareMeal donation process is simple:<br>
                1. Register as a donor<br>
                2. Choose donation type (food/money)<br>
                3. Fill donation details<br>
                4. Get matched with nearby NGOs<br>
                5. Schedule pickup (for food)<br>
                6. Track your donation<br><br>
                Would you like to start a donation now?`;
        }

        // Default response
        return `I'm not sure how to help with that specific query. Would you like to:<br>
            - Learn about food donation<br>
            - Find nearby NGOs<br>
            - Get emergency assistance<br>
            - Learn about the donation process`;
    }

    // Method to show a notification
    showNotification() {
        const badge = this.chatToggle.querySelector('.badge');
        badge.style.display = 'block';
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShareMealChatbot();
}); 