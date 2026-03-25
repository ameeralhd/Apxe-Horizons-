const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');
const DocumentUpload = require('../models/DocumentUpload');

// GET /api/documents - Get User Documents
router.get('/', auth.protect, documentController.getUserDocuments);

const REQUIREMENTS = require('../config/requirements');
const User = require('../models/User');

// POST /api/documents/path - Update user's verification path
router.post('/path', auth.protect, async (req, res) => {
    try {
        const { category, type, country } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({
            verificationCategory: category || user.verificationCategory,
            verificationType: type || user.verificationType,
            verificationCountry: country || user.verificationCountry
        });

        res.json({ message: 'Verification path updated', path: { category, type, country } });
    } catch (error) {
        console.error('Error updating path:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/documents/path - Get user's verification path
router.get('/path', auth.protect, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            category: user.verificationCategory,
            type: user.verificationType,
            country: user.verificationCountry
        });
    } catch (error) {
        console.error('Error fetching path:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Optional auth middleware — attaches user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            // Invalid token — just proceed without user
        }
    }
    next();
};

// GET /api/documents/requirements
router.get('/requirements', optionalAuth, async (req, res) => {
    try {
        let { category, type, country } = req.query;

        // Cleanup malformed values from frontend
        if (category === 'null' || category === 'undefined') category = null;
        if (type === 'null' || type === 'undefined') type = null;
        if (country === 'null' || country === 'undefined') country = null;

        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        // Case-insensitive category lookup
        const catKey = Object.keys(REQUIREMENTS).find(k => k.toLowerCase() === category.toLowerCase());
        if (!catKey || !REQUIREMENTS[catKey]) {
            return res.status(400).json({ message: `Invalid category: ${category}` });
        }

        const categoryData = REQUIREMENTS[catKey];
        let categoryDocs = [];

        if (catKey === 'visa') {
            const countryKey = country || 'Default';
            // Case-insensitive country lookup for visa
            const actualCountryKey = Object.keys(categoryData).find(k => k.toLowerCase() === countryKey.toLowerCase()) || 'Default';
            categoryDocs = categoryData[actualCountryKey] || categoryData.Default || [];
        } else {
            const defaultType = catKey === 'job' ? 'Technical' : 'Undergraduate';
            const rawTypeKey = type || defaultType;
            // Case-insensitive type lookup
            const actualTypeKey = Object.keys(categoryData).find(k => k.toLowerCase() === rawTypeKey.toLowerCase()) || defaultType;
            categoryDocs = categoryData[actualTypeKey] || [];
        }

        // Return empty missing status by default
        let finalDocs = categoryDocs.map(doc => ({ ...doc, status: 'missing' }));

        // If user is logged in, attempt to merge statuses
        if (req.user && req.user.id) {
            try {
                const userDocs = await DocumentUpload.findAll({
                    where: { userId: req.user.id, category: catKey }
                });

                if (userDocs && userDocs.length > 0) {
                    const matchedDocIds = new Set();
                    const mergedDocs = categoryDocs.map(reqDoc => {
                        // Match by name or specific ID if present
                        const userDoc = userDocs.find(ud => ud.documentType === reqDoc.name);
                        if (userDoc) matchedDocIds.add(userDoc.id);
                        return {
                            ...reqDoc,
                            status: userDoc ? userDoc.status : 'missing',
                            feedback: userDoc ? userDoc.customerFeedback : null,
                            rejectionReason: userDoc ? userDoc.rejectionReason : null,
                            uploadedAt: userDoc ? userDoc.createdAt : null,
                            filePath: userDoc ? userDoc.filePath : null
                        };
                    });

                    const extraDocs = userDocs
                        .filter(ud => !matchedDocIds.has(ud.id))
                        .map(ud => ({
                            id: `extra-${ud.id}`,
                            name: ud.documentType,
                            description: 'Additional document provided by applicant.',
                            status: ud.status,
                            feedback: ud.customerFeedback,
                            rejectionReason: ud.rejectionReason,
                            uploadedAt: ud.createdAt,
                            filePath: ud.filePath,
                            isExtra: true
                        }));
                    finalDocs = [...mergedDocs, ...extraDocs];
                }
            } catch (dbError) {
                console.error('Database error in requirements merge (falling back to static):', dbError);
                // Continue with static docs if DB fails
            }
        }

        return res.json(finalDocs);

    } catch (error) {
        console.error('Fatal error fetching requirements:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// POST /api/documents/analyze
router.post('/analyze', auth.protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { docId, category, documentType } = req.body;

        // Simulating AI Analysis
        const analysisResult = {
            status: 'pending', // Send to admin for manual review
            feedback: 'Document uploaded and awaiting manual verification by our compliance team.',
            issues: []
        };

        const relativePath = `/uploads/${req.file.filename}`;

        const docRecord = await DocumentUpload.create({
            userId: req.user.id,
            documentType: documentType || 'Unspecified Document',
            fileName: req.file.originalname,
            filePath: relativePath,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            status: 'pending',
            category: category || 'scholarship',
            urgency: 'Normal'
        });

        // Simulate delay for realism
        setTimeout(() => {
            res.json({
                status: 'pending',
                feedback: analysisResult.feedback,
                issues: [],
                analyzedAt: new Date().toISOString(),
                documentId: docRecord.id
            });
        }, 1500);
    } catch (error) {
        console.error('Error during analysis:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/documents/upload - Real File Upload
router.post('/upload', auth.protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the path relative to public (clients can access via /uploads/filename)
    // Assuming Express serves 'public' folder as static
    const relativePath = `/uploads/${req.file.filename}`;

    // Ideally create a DocumentUpload record here too? 
    // Or just return path for the Appointment to use.
    // For now, return path.
    res.json({
        message: 'File uploaded successfully',
        filePath: relativePath,
        originalName: req.file.originalname
    });
});

module.exports = router;
