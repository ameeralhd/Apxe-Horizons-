const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');

router.get('/', universityController.getUniversities);
router.get('/spotlight', universityController.getSpotlightUniversity);
router.post('/', universityController.addUniversity);

module.exports = router;
