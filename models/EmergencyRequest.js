const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
    requestor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['food', 'supplies', 'medical'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    urgencyLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    details: {
        beneficiaries: Number,
        description: String,
        requirements: String
    },
    location: {
        address: String,
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number] // [longitude, latitude]
        }
    },
    contact: {
        name: String,
        phone: String,
        email: String,
        alternatePhone: String
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    resolvedAt: Date
});

// Index for geospatial queries
emergencyRequestSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema); 