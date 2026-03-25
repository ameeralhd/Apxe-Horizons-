const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

// Public
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Admin only
router.post('/', authMiddleware.protect, authMiddleware.admin, serviceController.createService);

module.exports = router;
