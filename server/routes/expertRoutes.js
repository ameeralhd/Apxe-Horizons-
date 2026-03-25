const express = require('express');
const router = express.Router();
const expertController = require('../controllers/expertController');
const { protect, expert } = require('../middleware/authMiddleware');

// Apply protection to all expert routes
router.use(protect);
router.use(expert);

router.get('/stats', expertController.getDashboardStats);
router.get('/sessions', expertController.getSessions);
router.patch('/availability', expertController.updateAvailability);
router.get('/appointments/:appointmentId/student', expertController.getStudentDetails);

module.exports = router;
