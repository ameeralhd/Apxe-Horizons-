const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Student routes
router.post('/submit', protect, reviewController.submitReview);

// Public routes
router.get('/testimonials', reviewController.getTestimonials);

// Admin routes
router.get('/all', protect, admin, reviewController.getAllReviews);
router.patch('/:reviewId/status', protect, admin, reviewController.updateReviewStatus);

module.exports = router;
