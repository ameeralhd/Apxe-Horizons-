const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', protect, dashboardController.getUserStatus);
router.get('/news/ticker', dashboardController.getNewsTicker);

module.exports = router;
