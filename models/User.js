const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['donor', 'ngo', 'admin'],
        default: 'donor',
        index: true
    },
    phone: {
        type: String,
        trim: true
    },
    profilePicture: String,
    notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    },
    privacy: {
        showProfile: { type: Boolean, default: true },
        showDonations: { type: Boolean, default: true }
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginHistory: [{
        timestamp: Date,
        ipAddress: String,
        userAgent: String
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
        index: true
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLoginInfo = async function(ipAddress, userAgent) {
    this.lastLogin = new Date();
    this.loginHistory.push({
        timestamp: new Date(),
        ipAddress,
        userAgent
    });
    await this.save();
};

module.exports = mongoose.model('User', userSchema); 