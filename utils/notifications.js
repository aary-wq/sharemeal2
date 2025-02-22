const twilio = require('twilio');
const webpush = require('web-push');
const User = require('../models/User');

// Check if web push is configured
const isWebPushConfigured = () => {
    return process.env.VAPID_PUBLIC_KEY && 
           process.env.VAPID_PRIVATE_KEY && 
           process.env.EMAIL_USER;
};

// Initialize web push only if configured
if (isWebPushConfigured()) {
    webpush.setVapidDetails(
        'mailto:' + process.env.EMAIL_USER,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn('Web Push is not configured. Push notifications will be disabled.');
}

// Check if Twilio credentials are properly configured
const isTwilioConfigured = () => {
    return process.env.TWILIO_ACCOUNT_SID &&
           process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
           process.env.TWILIO_AUTH_TOKEN &&
           process.env.TWILIO_PHONE_NUMBER;
};

let twilioClient = null;

// Initialize Twilio client only if properly configured
if (isTwilioConfigured()) {
    twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
} else {
    console.warn('Twilio is not properly configured. SMS notifications will be disabled.');
}

class NotificationService {
    static async sendPushNotification(subscription, title, body) {
        if (!isWebPushConfigured()) {
            console.warn('Push notification skipped: Web Push not configured');
            return false;
        }

        try {
            await webpush.sendNotification(subscription, JSON.stringify({
                title,
                body,
                icon: '/logo.png'
            }));
            return true;
        } catch (error) {
            console.error('Push notification error:', error);
            return false;
        }
    }

    static async sendSMS(to, message) {
        try {
            if (!twilioClient) {
                console.warn('SMS notification skipped: Twilio not configured');
                return false;
            }

            const response = await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to
            });

            console.log('SMS sent successfully:', response.sid);
            return true;
        } catch (error) {
            console.error('SMS error:', error);
            return false;
        }
    }

    static async sendEmail(to, subject, message) {
        // Implement email notification logic here
        console.log('Email notification:', { to, subject, message });
        return true;
    }

    static async sendNotification(user, message, options = {}) {
        try {
            const { preferSMS = true, subject = 'ShareMeal Notification' } = options;
            let notificationSent = false;

            // Try SMS if preferred and phone number exists
            if (preferSMS && user.phone) {
                notificationSent = await this.sendSMS(user.phone, message);
            }

            // Try push notification if user has subscription
            if (user.pushSubscription) {
                notificationSent = await this.sendPushNotification(
                    user.pushSubscription,
                    subject,
                    message
                ) || notificationSent;
            }

            // Fall back to email
            if (!notificationSent && user.email) {
                notificationSent = await this.sendEmail(user.email, subject, message);
            }

            return notificationSent;
        } catch (error) {
            console.error('Notification error:', error);
            return false;
        }
    }
}

module.exports = NotificationService; 