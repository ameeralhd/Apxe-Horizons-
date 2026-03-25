const { User, DocumentUpload } = require('../models');
const { sendNudgeEmail } = require('./emailService');
const { Op } = require('sequelize');

/**
 * Identifies users who have been registered for more than 48 hours
 * but have 0% verification progress (no documents uploaded).
 */
const triggerNudges = async () => {
    try {
        const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const inactiveUsers = await User.findAll({
            where: {
                role: 'user',
                createdAt: { [Op.lt]: threshold }
            },
            include: [{
                model: DocumentUpload,
                required: false
            }]
        });

        let nudgeCount = 0;
        for (const user of inactiveUsers) {
            // Check if they have 0 documents
            if (!user.DocumentUploads || user.DocumentUploads.length === 0) {
                console.log(`Nudging user: ${user.email}`);
                await sendNudgeEmail(user.email, user.name);
                nudgeCount++;
            }
        }

        return { success: true, nudged: nudgeCount };
    } catch (error) {
        console.error("Error in nudge service:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { triggerNudges };
