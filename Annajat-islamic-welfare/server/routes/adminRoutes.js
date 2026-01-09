const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { upload } = require('../utils/upload');

// Protect all admin routes
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Dashboard Statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/activate', adminController.activateUser);
router.post('/users/:id/deactivate', adminController.deactivateUser);

// Donation Management
router.get('/donations/summary', adminController.getDonationSummary);
router.post('/donations/:id/verify', adminController.verifyDonation);
router.post('/donations/:id/refund', adminController.refundDonation);

// Event Management
router.post('/events', upload.single('coverImage'), adminController.createEvent);
router.patch('/events/:id', upload.single('coverImage'), adminController.updateEvent);
router.delete('/events/:id', adminController.deleteEvent);
router.post('/events/:id/publish', adminController.publishEvent);
router.post('/events/:id/unpublish', adminController.unpublishEvent);

// Gallery Management
router.post('/gallery', upload.array('images', 10), adminController.uploadGalleryImages);
router.delete('/gallery/:id', adminController.deleteGalleryImage);

// Content Management
router.post('/content/pages', adminController.createPage);
router.patch('/content/pages/:id', adminController.updatePage);
router.delete('/content/pages/:id', adminController.deletePage);

// Settings
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);

// Backup & Export
router.get('/export/database', adminController.exportDatabase);
router.post('/import/database', adminController.importDatabase);

// System Logs
router.get('/logs', adminController.getSystemLogs);
router.get('/logs/:id', adminController.getLogDetails);

module.exports = router;