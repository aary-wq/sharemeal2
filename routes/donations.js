const router = require('express').Router();
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');
const multer = require('multer');
const path = require('path');
const { processPayment } = require('../utils/payment');
const { sendNotification } = require('../utils/notifications');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, 'food-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

// Create new donation
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        const { type, ...donationData } = req.body;
        
        // Handle image uploads
        const images = req.files ? req.files.map(file => file.path) : [];
        
        const donation = new Donation({
            donor: req.user.id,
            type,
            ...(type === 'food' ? {
                foodDetails: {
                    ...donationData,
                    images
                }
            } : {
                moneyDetails: donationData
            })
        });

        await donation.save();

        // If it's a monetary donation, initiate payment
        if (donation.type === 'money') {
            const paymentIntent = await processPayment(donation);
            return res.json({ donation, paymentIntent });
        }

        res.status(201).json(donation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all donations (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const { type, status, ngo } = req.query;
        const filter = {};

        if (type) filter.type = type;
        if (status) filter.status = status;
        if (ngo) filter.assignedNGO = ngo;

        // If user is NGO, show only nearby donations
        if (req.user.role === 'ngo') {
            // Add location-based filtering here
        }

        const donations = await Donation.find(filter)
            .populate('donor', 'fullName')
            .populate('assignedNGO', 'fullName')
            .sort('-createdAt');

        res.json(donations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get donation by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donor', 'fullName')
            .populate('assignedNGO', 'fullName');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.json(donation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update donation status (NGO only)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status, message } = req.body;
        
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const donation = await Donation.findById(req.params.id);
        
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        donation.status = status;
        donation.assignedNGO = req.user.id;
        donation.statusUpdates.push({
            status,
            message,
            updatedBy: req.user.id
        });
        donation.updatedAt = Date.now();

        await donation.save();

        // Send notification to donor
        await sendNotification(donation.donor, {
            title: 'Donation Status Update',
            message: `Your donation (${donation._id}) status has been updated to ${status}`
        });

        res.json(donation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 