const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['food', 'money'],
        required: true
    },
    amount: {
        type: Number,
        required: function() { return this.type === 'money'; }
    },
    foodDetails: {
        items: [{
            name: String,
            quantity: Number,
            unit: String
        }],
        expiryDate: Date,
        storageRequirements: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'completed'],
        default: 'pending'
    },
    assignedNGO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    location: {
        pickupAddress: String,
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number] // [longitude, latitude]
        }
    },
    paymentDetails: {
        transactionId: String,
        paymentMethod: String,
        paymentStatus: String
    },
    statusUpdates: [{
        status: String,
        message: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
donationSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema); 