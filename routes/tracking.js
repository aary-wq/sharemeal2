const router = require('express').Router();
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');
const WebSocket = require('ws');

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