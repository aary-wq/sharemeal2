const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const ReceiptGenerator = require('../utils/receipt');
const path = require('path');
const NotificationService = require('../utils/notifications');
const User = require('../models/User');

// Create payment intent
router.post('/create-intent', auth, async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency,
            metadata: {
                userId: req.user.userId
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
});

// Payment webhook
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
    }

    res.json({ received: true });
});

// Get payment history
router.get('/history', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.userId })
            .sort('-createdAt')
            .populate('donationId');

        res.json(payments);
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
});

async function handleSuccessfulPayment(paymentIntent) {
    const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
    if (!payment) return;

    payment.status = 'completed';
    payment.receipt.number = `RCP${Date.now()}`;

    // Generate receipt
    const receiptUrl = await ReceiptGenerator.generateReceipt(payment);
    payment.receipt.url = receiptUrl;

    await payment.save();

    // Get user for notifications
    const user = await User.findById(payment.userId);

    // Send notifications
    await NotificationService.sendPaymentNotification(payment, user);

    // Send email with receipt
    await sendPaymentConfirmation(payment);
}

// Add download receipt endpoint
router.get('/receipt/:paymentId', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment || payment.userId.toString() !== req.user.userId) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        const filePath = path.join(__dirname, '..', payment.receipt.url);
        res.download(filePath);
    } catch (error) {
        console.error('Receipt download error:', error);
        res.status(500).json({ message: 'Failed to download receipt' });
    }
});

module.exports = router; 