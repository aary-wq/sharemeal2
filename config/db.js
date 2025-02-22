const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Set strictQuery to false to prepare for Mongoose 7
        mongoose.set('strictQuery', false);

        // Test the connection string before connecting
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        console.log('Attempting to connect to MongoDB...');
        
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        return conn;

    } catch (error) {
        console.error('MongoDB Connection Error Details:');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to MongoDB server. Please check:');
            console.error('1. Your network connection');
            console.error('2. If MongoDB Atlas is accessible');
            console.error('3. If your IP is whitelisted in MongoDB Atlas');
        }
        
        if (error.name === 'MongoParseError') {
            console.error('Invalid MongoDB connection string. Please check:');
            console.error('1. The format of your connection string');
            console.error('2. If all special characters are properly encoded');
        }
        
        if (error.message.includes('bad auth')) {
            console.error('Authentication failed. Please check:');
            console.error('1. Your database username');
            console.error('2. Your database password');
            console.error('3. If the user has the correct permissions');
        }

        process.exit(1);
    }
};

module.exports = connectDB; 