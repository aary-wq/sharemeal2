const router = require('express').Router();
const auth = require('../middleware/auth');
const EmergencyRequest = require('../models/EmergencyRequest');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

// Create emergency request
router.post('/', auth, async (req, res) => {
    try {
        const request = new EmergencyRequest({
            requestor: req.user.userId,
            ...req.body
        });

        await request.save();

        // Find nearby helpers
        const nearbyHelpers = await User.find({
            role: { $in: ['donor', 'ngo'] },
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: request.location.coordinates
                    },
                    $maxDistance: 5000 // 5km radius
                }
            }
        });

        // Send notifications
        nearbyHelpers.forEach(async (helper) => {
            // Send email
            await sendEmail(helper.email, 'Emergency Food Request', 
                `New emergency request in your area. Please check the app for details.`);

            // Send SMS if phone number available
            if (helper.phone) {
                await sendSMS(helper.phone, 
                    `ShareMeal: Emergency food request in your area. Please check the app for details.`);
            }
        });

        res.status(201).json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get nearby helpers
router.get('/helpers', auth, async (req, res) => {
    try {
        const { lat, lng, radius = 5000 } = req.query;

        const helpers = await User.find({
            role: { $in: ['donor', 'ngo'] },
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).select('-password');

        res.json(helpers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update request status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const request = await EmergencyRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        request.updatedAt = Date.now();

        if (status === 'completed') {
            request.resolvedAt = Date.now();
        }

        await request.save();

        // Notify requestor of status change
        const requestor = await User.findById(request.requestor);
        await sendEmail(requestor.email, 'Emergency Request Update',
            `Your emergency request status has been updated to: ${status}`);

        res.json(request);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 