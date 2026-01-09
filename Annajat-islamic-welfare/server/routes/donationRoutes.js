const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validation middleware
const validateDonation = [
  body('donationType').isIn(['zakat', 'sadaqah', 'fidya', 'wazSupport', 'orphanSupport', 'education', 'other']),
  body('amount').isNumeric().isFloat({ min: 10 }),
  body('donor.name').notEmpty().trim(),
  body('donor.email').isEmail().normalizeEmail(),
  body('donor.phone').notEmpty().trim(),
  body('paymentMethod').isIn(['card', 'mobile', 'bank', 'crypto'])
];

// Public routes
router.post('/create', validateDonation, donationController.createDonation);
router.get('/receipt/:receiptNumber', donationController.getReceipt);
router.get('/stats', donationController.getDonationStats);
router.get('/recent', donationController.getRecentDonations);

// Protected routes (require authentication)
router.use(authController.protect);

router.get('/my-donations', donationController.getMyDonations);
router.get('/:id', donationController.getDonation);
router.post('/:id/cancel', donationController.cancelDonation);

// Admin routes
router.use(authController.restrictTo('admin'));

router.get('/', donationController.getAllDonations);
router.patch('/:id/verify', donationController.verifyDonation);
router.delete('/:id', donationController.deleteDonation);
router.get('/export/csv', donationController.exportDonationsCSV);
router.get('/export/pdf', donationController.exportDonationsPDF);

module.exports = router;