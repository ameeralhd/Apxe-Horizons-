const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware'); // Added import for protect and admin

// Appointment Routes
router.post('/', protect, appointmentController.createAppointment);
router.get('/', protect, appointmentController.getAppointments);
router.get('/:id', protect, appointmentController.getAppointmentById);
router.post('/:id/pay', protect, appointmentController.processPayment);
router.get('/:id/receipt', protect, appointmentController.downloadReceipt);

// Admin Routes
router.get('/admin', protect, admin, appointmentController.getAllAppointments);
router.put('/:id/status', protect, admin, appointmentController.updateStatus);

module.exports = router;
