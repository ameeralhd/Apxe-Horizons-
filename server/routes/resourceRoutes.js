const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// The download endpoint (frontend can use this if authenticated)
router.get('/download/admissions-guide', resourceController.downloadAdmissionsGuide);

// Stats for admin dashboard
router.get('/stats', resourceController.getResourceStats);

module.exports = router;
