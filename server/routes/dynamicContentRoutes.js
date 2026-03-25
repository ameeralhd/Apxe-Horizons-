const express = require('express');
const router = express.Router();
const dynamicContentController = require('../controllers/dynamicContentController');
// const { authenticateToken, isAdmin } = require('../middleware/auth'); // Add if needed, but keeping it simple for now as per current structure

router.get('/', dynamicContentController.getDynamicContent);
router.post('/', dynamicContentController.createDynamicContent);
router.put('/:id', dynamicContentController.updateDynamicContent);
router.delete('/:id', dynamicContentController.deleteDynamicContent);

module.exports = router;
