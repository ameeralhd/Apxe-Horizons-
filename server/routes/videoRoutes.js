const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.get('/', videoController.getVideoResources);
router.post('/', videoController.addVideoResource);

module.exports = router;
