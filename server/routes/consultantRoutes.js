const express = require('express');
const router = express.Router();
const consultantController = require('../controllers/consultantController');

const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', consultantController.getAllConsultants);

// Consultant Self-Edit
router.get('/me', protect, consultantController.getOwnProfile);
router.put('/me', protect, consultantController.updateOwnProfile);

module.exports = router;
