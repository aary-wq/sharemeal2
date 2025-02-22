const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');
const WebSocket = require('ws');

// Get donation by tracking ID
router.get('/:donationId', async (req, res) => {
    try {
        const donation = await Donation.findOne({ donationId: req.params.donationId })
            .populate('donor', 'name email')
            .populate('ngo', 'name email');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.json(donation);
    } catch (error) {
        console.error('Error fetching donation:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all donations for a user
router.get('/user/donations', auth, async (req, res) => {
    try {
        const donations = await Donation.find({
            $or: [
                { donor: req.user.userId },
                { ngo: req.user.userId }
            ]
        })
        .populate('donor', 'name email')
        .populate('ngo', 'name email')
        .sort({ createdAt: -1 });

        res.json(donations);
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update donation status
router.put('/:donationId/status', auth, async (req, res) => {
    try {
        const { status, location, note } = req.body;
        const donation = await Donation.findOne({ donationId: req.params.donationId });

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        donation.status = status;
        donation.statusUpdates.push({
            status,
            timestamp: new Date(),
            location,
            note
        });

        await donation.save();
        res.json(donation);
    } catch (error) {
        console.error('Error updating donation status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update donation status
router.patch('/:donationId/status', auth, async (req, res) => {
    try {
        const { status, location, message } = req.body;
        const donation = await Donation.findById(req.params.donationId);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Update tracking information
        donation.tracking.status = status;
        if (location) {
            donation.tracking.location = {
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
            };
        }

        // Add status update to history
        donation.tracking.statusUpdates.push({
            status,
            message,
            location: donation.tracking.location
        });

        // Update timestamps based on status
        switch (status) {
            case 'picked_up':
                donation.tracking.actualPickupTime = new Date();
                break;
            case 'delivered':
                donation.tracking.deliveryTime = new Date();
                break;
        }

        await donation.save();

        // Broadcast update via WebSocket
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'STATUS_UPDATE',
                    donationId: donation._id,
                    status,
                    location,
                    message
                }));
            }
        });

        res.json(donation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get tracking details
router.get('/:donationId', auth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.donationId)
            .populate('donor', 'fullName')
            .populate('assignedNGO', 'fullName');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.json(donation.tracking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 