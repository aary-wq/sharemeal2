require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('Using URI:', process.env.MONGODB_URI.replace(/:([^:@]{8})[^:@]*@/, ':****@'));
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connection successful!');
        console.log('Connected to database:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);
        
        await mongoose.disconnect();
        console.log('Disconnected successfully');
        process.exit(0);
    } catch (error) {
        console.error('Connection test failed:');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        process.exit(1);
    }
}

testConnection(); 