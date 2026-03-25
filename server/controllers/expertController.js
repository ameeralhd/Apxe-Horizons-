const {
    Appointment,
    User,
    ConsultantProfile,
    Payout,
    Review,
    Service,
    Availability,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

/**
 * Get core dashboard stats for an expert.
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const consultant = await ConsultantProfile.findOne({ where: { userId: req.user.id } });
        if (!consultant) return res.status(404).json({ message: 'Expert profile not found' });

        const consultantId = consultant.id;

        // 1. Total Revenue (This Month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevenue = await Payout.sum('consultantShare', {
            where: {
                consultantId,
                createdAt: { [Op.gte]: startOfMonth }
            }
        }) || 0;

        // 2. Pending Payouts
        const pendingPayouts = await Payout.sum('consultantShare', {
            where: { consultantId, status: 'pending' }
        }) || 0;

        // 3. Upcoming Sessions Count
        const upcomingCount = await Appointment.count({
            where: {
                consultantId,
                status: { [Op.in]: ['confirmed', 'paid'] },
                date: { [Op.gte]: new Date().toISOString().split('T')[0] }
            }
        });

        // 4. Performance (Avg Rating) - Already in profile but double check or get counts
        const recentReviews = await Review.findAll({
            where: { consultantId },
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['name'] }]
        });

        res.json({
            revenue: {
                monthly: parseFloat(monthlyRevenue.toFixed(2)),
                pending: parseFloat(pendingPayouts.toFixed(2))
            },
            stats: {
                upcomingSessions: upcomingCount,
                averageRating: consultant.averageRating,
                reviewCount: consultant.reviewCount
            },
            recentReviews
        });
    } catch (error) {
        console.error('Expert stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get upcoming and past sessions for the expert.
 */
exports.getSessions = async (req, res) => {
    try {
        const consultant = await ConsultantProfile.findOne({ where: { userId: req.user.id } });
        const sessions = await Appointment.findAll({
            where: { consultantId: consultant.id },
            include: [
                { model: User, attributes: ['name', 'email', 'phone'] },
                { model: Service, attributes: ['title', 'price'] }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Update Expert availability.
 */
exports.updateAvailability = async (req, res) => {
    const { availability } = req.body; // Expecting { "Monday": ["09:00", "17:00"], ... }

    try {
        const consultant = await ConsultantProfile.findOne({ where: { userId: req.user.id } });

        // We can update the JSON field in ConsultantProfile
        await consultant.update({ availability });

        // OR if using the Availability table, we'd sync it here
        // For simplicity in this demo, we'll use the JSON field as primary

        res.json({ message: 'Availability updated successfully', availability });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get student profile/documents for a specific booking.
 */
exports.getStudentDetails = async (req, res) => {
    const { appointmentId } = req.params;

    try {
        const consultant = await ConsultantProfile.findOne({ where: { userId: req.user.id } });
        const appointment = await Appointment.findOne({
            where: { id: appointmentId, consultantId: consultant.id },
            include: [{ model: User, attributes: ['id', 'name', 'email', 'phone', 'verificationStatus'] }]
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
