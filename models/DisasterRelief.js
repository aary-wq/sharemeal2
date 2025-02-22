const mongoose = require('mongoose');

const disasterReliefSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['flood', 'earthquake', 'pandemic', 'drought', 'other'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'archived'],
        default: 'active'
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
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
        },
        affectedArea: {
            type: String,
            required: true
        }
    },
    requirements: [{
        type: String,
        enum: ['food', 'water', 'medical', 'shelter', 'clothing', 'money'],
        required: true,
        quantity: Number,
        unit: String,
        urgency: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
        },
        fulfilled: {
            type: Number,
            default: 0
        }
    }],
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: String,
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    updates: [{
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    donations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
    }],
    volunteers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'active', 'completed'],
            default: 'pending'
        }
    }]
});

// Index for geospatial queries
disasterReliefSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('DisasterRelief', disasterReliefSchema); 