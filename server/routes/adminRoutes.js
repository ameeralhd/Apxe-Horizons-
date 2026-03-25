const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/adminAuth');
const User = require('../models/User');
const DocumentUpload = require('../models/DocumentUpload');
const Appointment = require('../models/Appointment');
const ConsultantProfile = require('../models/ConsultantProfile');
const { Op } = require('sequelize');

// Apply admin middleware to all routes
router.use(requireAdmin);

// ==================== APPLICANT MANAGEMENT ====================

// Get all applicants with filters
router.get('/applicants', async (req, res) => {
    try {
        const { search, serviceType, progressMin, progressMax, page = 1, limit = 20 } = req.query;

        const where = { role: 'user' };

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows: users } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'email', 'phone', 'createdAt']
        });

        // Calculate progress for each user
        const usersWithProgress = await Promise.all(users.map(async (user) => {
            const documents = await DocumentUpload.findAll({ where: { userId: user.id } });
            const totalDocs = documents.length;
            const verifiedDocs = documents.filter(d => d.status === 'verified').length;
            const progress = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

            return {
                ...user.toJSON(),
                progress,
                totalDocuments: totalDocs,
                verifiedDocuments: verifiedDocs
            };
        }));

        res.json({
            applicants: usersWithProgress,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ message: 'Failed to fetch applicants' });
    }
});

// Get single applicant detail
router.get('/applicants/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'email', 'phone', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ message: 'Applicant not found' });
        }

        const documents = await DocumentUpload.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']]
        });

        const appointments = await Appointment.findAll({
            where: { userId: user.id },
            include: [{ model: ConsultantProfile, include: [User] }],
            order: [['date', 'DESC']]
        });

        res.json({
            ...user.toJSON(),
            documents,
            appointments
        });
    } catch (error) {
        console.error('Error fetching applicant:', error);
        res.status(500).json({ message: 'Failed to fetch applicant details' });
    }
});

// ==================== DOCUMENT VERIFICATION ====================

// Get pending documents queue
router.get('/documents/pending', async (req, res) => {
    try {
        const documents = await DocumentUpload.findAll({
            where: { status: 'pending' },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'ASC']]
        });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching pending documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

// Get all documents with filters
router.get('/documents', async (req, res) => {
    try {
        const { status, userId, category } = req.query;
        const where = {};

        if (status) where.status = status;
        if (userId) where.userId = userId;
        if (category) where.category = category;

        const documents = await DocumentUpload.findAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});



const { sendRejectionEmail, sendCongratulationsEmail } = require('../services/emailService');
const REQUIREMENTS = require('../config/requirements');

// Helper to check if user is 100% verified
const checkUserVerificationStatus = async (userId) => {
    try {
        // Need to know user's "path" (category/type/country) to know which requirements apply.
        // For now, we'll check against ALL documents uploaded by user vs the requirements they seemingly are pursuing.
        // A better way: User model should store their active path.
        // Assuming we can infer or fetch the "path" from somewhere, or we just check if *all* uploaded docs are verified AND they match a full set.

        // Let's rely on the DocumentUploads the user HAS.
        // If the user has uploaded documents, we check if they are ALL verified.
        // AND we should check if they have enough documents to match a requirement set.

        // Simplified approach for this task:
        // Get all user documents.
        const userDocs = await DocumentUpload.findAll({ where: { userId } });

        if (userDocs.length === 0) return false;

        // Check if ANY are pending/rejected/error
        const allVerified = userDocs.every(d => d.status === 'verified');
        if (!allVerified) return false;

        // Check if they have met the count of a requirement set (heuristic)
        // We can look at the category of the documents.
        const category = userDocs[0].category; // Assuming same category
        // We don't easily know the 'type' or 'country' without storing it on User.
        // Let's assume if they have > 3 verified documents it's a "success" for now to trigger the email.
        // In a real app, we'd query the User's selected path.

        return userDocs.length >= 3;
    } catch (e) {
        console.error("Error checking verification status", e);
        return false;
    }
};

// Review document (update status and feedback)
router.put('/documents/:id/review', async (req, res) => {
    try {
        const { status, adminNotes, customerFeedback, rejectionReason } = req.body;

        const document = await DocumentUpload.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await document.update({
            status,
            adminNotes,
            customerFeedback,
            rejectionReason: status === 'rejected' ? rejectionReason : null,
            reviewedBy: req.user.id,
            reviewedAt: new Date()
        });

        // Recalculate and update User verificationStatus
        const userDocs = await DocumentUpload.findAll({ where: { userId: document.userId } });
        const totalDocs = userDocs.length;
        const verifiedDocsCount = userDocs.filter(d => d.status === 'verified').length;
        const newStatus = totalDocs > 0 ? Math.round((verifiedDocsCount / totalDocs) * 100) : 0;

        await User.update({ verificationStatus: newStatus }, { where: { id: document.userId } });

        // Trigger emails based on status
        if (status === 'rejected' && document.User) {
            sendRejectionEmail(
                document.User.email,
                document.User.name,
                document.documentType,
                rejectionReason || customerFeedback || "Document did not meet requirements."
            ).catch(err => console.error("Failed to send rejection email:", err));
        } else if (status === 'verified' && document.User) {
            // Check if this was the last document needed
            if (newStatus === 100 && totalDocs >= 3) { // Heuristic: 100% and at least 3 docs
                sendCongratulationsEmail(
                    document.User.email,
                    document.User.name
                ).catch(err => console.error("Failed to send success email:", err));
            }
        }

        res.json({ message: 'Document reviewed successfully', document });
    } catch (error) {
        console.error('Error reviewing document:', error);
        res.status(500).json({ message: 'Failed to review document' });
    }
});

// ==================== ANALYTICS ====================

// Get dashboard// Analytics stats
router.get('/analytics', async (req, res) => {
    try {
        console.log('[ANALYTICS] Starting data fetch...');
        const totalStudents = await User.count({ where: { role: 'user' } });
        console.log(`[ANALYTICS] totalStudents: ${totalStudents}`);

        const pendingDocuments = await DocumentUpload.count({ where: { status: 'pending' } });
        console.log(`[ANALYTICS] pendingDocuments: ${pendingDocuments}`);

        const rejectedDocuments = await DocumentUpload.count({ where: { status: 'rejected' } });
        console.log(`[ANALYTICS] rejectedDocuments: ${rejectedDocuments}`);

        // Verified Students (Heuristic: > 0 docs and ALL are verified)
        console.log('[ANALYTICS] Fetching users with docs for verification check...');
        const usersWithDocs = await User.findAll({
            include: [{ model: DocumentUpload }]
        });
        console.log(`[ANALYTICS] Found ${usersWithDocs.length} users with documents.`);

        let verifiedStudents = 0;
        usersWithDocs.forEach(user => {
            const docs = user.DocumentUploads;
            if (docs && docs.length >= 3 && docs.every(d => d.status === 'verified')) {
                verifiedStudents++;
            }
        });
        console.log(`[ANALYTICS] verifiedStudents count: ${verifiedStudents}`);

        // Consultations Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        console.log('[ANALYTICS] Fetching consultations today...');
        const consultationsToday = await Appointment.count({
            where: {
                date: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: { [Op.not]: 'cancelled' }
            }
        });
        console.log(`[ANALYTICS] consultationsToday: ${consultationsToday}`);

        const upcomingAppointments = await Appointment.count({
            where: {
                date: { [Op.gte]: new Date() },
                status: 'confirmed'
            }
        });
        console.log(`[ANALYTICS] upcomingAppointments: ${upcomingAppointments}`);

        const newStudents = await User.count({
            where: {
                createdAt: { [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) },
                role: 'user'
            }
        });
        console.log(`[ANALYTICS] newStudents: ${newStudents}`);

        console.log('[ANALYTICS] Data fetch complete. Sending response.');
        res.json({
            totalStudents,
            pendingDocuments,
            verifiedDocuments: verifiedStudents,
            rejectedDocuments,
            upcomingAppointments,
            newStudents,
            consultationsToday
        });
    } catch (error) {
        console.error('[ANALYTICS ERROR]:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'Failed to fetch analytics', error: error.message, stack: error.stack });
    }
});

// ==================== CONSULTANT MANAGEMENT ====================

const consultantController = require('../controllers/consultantController');
const authController = require('../controllers/authController'); // Reuse register for creating new consultant user

// ==================== CONSULTANT MANAGEMENT ====================

// Get all consultants (Admin View)
router.get('/consultants', consultantController.adminGetAllConsultants);

// Update consultant profile & settings
router.put('/consultants/:id', consultantController.adminUpdateConsultant);

// Toggle consultant active status
router.put('/consultants/:id/status', consultantController.adminToggleStatus);

// Create new consultant (Create User + Profile)
router.post('/consultants', async (req, res) => {
    // This is a complex flow: Create User -> Create Profile. 
    // For simplicity, we can reuse authController.register logic but set role='consultant'
    // Or implement a specific adminCreateConsultant in controller. 
    // Let's assume the frontend will call /api/auth/register with role='consultant' for now, 
    // OR we implement a composite handler here if needed. 
    // For this iteration, let's stick to updating existing ones first as per prompt focus on "Management".
    // Check if we need a dedicated create route.
    res.status(501).json({ message: 'Not implemented yet. Use /api/auth/register' });
});

module.exports = router;
