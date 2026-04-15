const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', scholarshipController.getAllScholarships);
router.get('/:id', scholarshipController.getScholarshipById);

// Admin only routes
router.post('/', protect, admin, scholarshipController.createScholarship);
router.put('/:id', protect, admin, scholarshipController.updateScholarship);
router.delete('/:id', protect, admin, scholarshipController.deleteScholarship);

module.exports = router;
