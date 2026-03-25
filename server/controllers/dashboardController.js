const { Appointment, DocumentUpload, News, User } = require('../models');

exports.getUserStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user for the current status
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Consultations Count (Dynamic based on DB)
        const consultationsCount = await Appointment.count({
            where: {
                userId,
                status: { [require('sequelize').Op.in]: ['confirmed', 'paid', 'completed'] }
            }
        });

        // 2. Comprehensive Profile Progress Calculation
        // Required items: Phone, Academic Transcript, English Proficiency Test, Identity Document
        const requiredDocs = ['Academic Transcript', 'English Proficiency Test', 'Identity Document'];
        const userDocs = await DocumentUpload.findAll({ where: { userId } });
        
        const tasks = [
            { 
                label: 'Personal Details (Phone)', 
                completed: !!user.phone, 
                link: '/settings' 
            },
            ...requiredDocs.map(type => ({
                label: type,
                completed: userDocs.some(d => d.documentType === type),
                link: '/verification'
            }))
        ];

        const completedTasks = tasks.filter(t => t.completed).length;
        const profilePercent = Math.round((completedTasks / tasks.length) * 100);

        // 3. Document Verification Progress (for legacy or specific charts)
        const verifiedDocs = userDocs.filter(d => d.status === 'verified').length;
        const verificationPercent = userDocs.length > 0 ? Math.round((verifiedDocs / userDocs.length) * 100) : 0;

        // 4. Recent Alerts (Rejected docs or Status changes)
        const alerts = userDocs
            .filter(d => d.status === 'rejected' || d.reviewedAt > new Date(Date.now() - 24 * 60 * 60 * 1000))
            .map(d => ({
                id: d.id,
                type: d.status === 'rejected' ? 'Action Required' : 'Update',
                message: d.status === 'rejected'
                    ? `Your ${d.documentType} was rejected: ${d.rejectionReason || 'Please review.'}`
                    : `Your ${d.documentType} has been verified!`,
                date: d.reviewedAt || d.updatedAt
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            consultations: consultationsCount,
            verificationPercent, // Keep for legacy if needed
            profileProgress: {
                percentage: profilePercent,
                tasks: tasks
            },
            academicStatus: profilePercent === 100 ? 'Profile Optimized' : 'In Progress',
            alerts
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard status', error: error.message });
    }
};

exports.getNewsTicker = async (req, res) => {
    try {
        const latestNews = await News.findOne({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(latestNews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news ticker', error: error.message });
    }
};
