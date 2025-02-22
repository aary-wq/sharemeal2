require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const connectDB = require('./config/db');
const cors = require('cors');
const chatbotRoutes = require('./routes/chatbot');
const notifications = require('./utils/notifications');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });





// Try different ports if default is in use
const findAvailablePort = async (startPort) => {
    const net = require('net');
    
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
        
        server.listen(startPort, () => {
            server.close(() => {
                resolve(startPort);
            });
        });
    });
};

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        // First, connect to MongoDB
        await connectDB();
        
        // Find available port
        const PORT = await findAvailablePort(process.env.PORT || 5000);
        
        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
        
        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
            process.exit(1);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Serve HTML files from views directory
app.use('/views', express.static('views'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payment', require('./routes/payment'));

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        // Broadcast status updates to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'MongoDB Atlas Connected!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
startServer().catch(error => {
    console.error('Failed to start application:', error);
    process.exit(1);
});

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
