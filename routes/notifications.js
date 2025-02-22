const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const webpush = require('web-push');

router.post('/subscribe', auth, async (req, res) => {
    try {
        const subscription = req.body;
        const user = await User.findById(req.user.userId);
        
        user.pushSubscription = subscription;
        await user.save();

        res.json({ message: 'Successfully subscribed to notifications' });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ message: 'Failed to subscribe to notifications' });
    }
});

module.exports = router; 