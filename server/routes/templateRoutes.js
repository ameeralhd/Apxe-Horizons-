const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { protect: requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for template uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/templates';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Public/User routes
router.get('/', templateController.getAllTemplates);

// Authenticated user routes
router.post('/:id/favorite', requireAuth, templateController.toggleFavorite);

// Admin routes
router.post('/', requireAuth, requireAdmin, upload.single('file'), templateController.createTemplate);
router.put('/:id', requireAuth, requireAdmin, templateController.updateTemplate);
router.delete('/:id', requireAuth, requireAdmin, templateController.deleteTemplate);

module.exports = router;
