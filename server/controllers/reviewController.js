const { Review, ConsultantProfile, Appointment, User, Service, Payout, sequelize } = require('../models');

/**
 * Handles student review submission.
 * Recalculates Consultant averageRating and reviewCount.
 */
exports.submitReview = async (req, res) => {
    const { appointmentId, rating, comment, traitTags, isAnonymous } = req.body;
    const userId = req.user.id;

    const transaction = await sequelize.transaction();

    try {
        const appointment = await Appointment.findByPk(appointmentId);
        if (!appointment || appointment.userId !== userId) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.status !== 'completed' && appointment.status !== 'paid') {
            return res.status(400).json({ message: 'Session must be completed before leaving a review' });
        }

        // Create Review
        const review = await Review.create({
            bookingId: appointmentId,
            userId,
            consultantId: appointment.consultantId,
            rating,
            comment,
            traitTags,
            isAnonymous
        }, { transaction });

        // Recalculate Consultant Stats
        const consultant = await ConsultantProfile.findByPk(appointment.consultantId);
        const reviews = await Review.findAll({ where: { consultantId: appointment.consultantId } });

        const count = reviews.length;
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / count;

        await consultant.update({
            averageRating: parseFloat(avg.toFixed(1)),
            reviewCount: count
        }, { transaction });

        // Auto-complete appointment if not already
        if (appointment.status !== 'completed') {
            await appointment.update({ status: 'completed' }, { transaction });
        }

        // Create Payout (70% consultant share)
        const service = await Service.findByPk(appointment.serviceId);
        if (service) {
            // Check if payout already exists to prevent duplicates
            const existingPayout = await Payout.findOne({ where: { appointmentId: appointment.id }, transaction });
            if (!existingPayout) {
                const totalAmount = service.price;
                const consultantShare = totalAmount * 0.7;
                const platformShare = totalAmount * 0.3;

                await Payout.create({
                    appointmentId: appointment.id,
                    consultantId: appointment.consultantId,
                    totalAmount,
                    consultantShare,
                    platformShare,
                    status: 'pending'
                }, { transaction });
            }
        }

        await transaction.commit();
        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        await transaction.rollback();
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Admin: Get all reviews for moderation.
 */
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: ConsultantProfile, include: [{ model: User, attributes: ['name'] }] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Admin: Toggle publication/testimonial status.
 */
exports.updateReviewStatus = async (req, res) => {
    const { reviewId } = req.params;
    const { isPublished, isTestimonial } = req.body;

    try {
        const review = await Review.findByPk(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        await review.update({ isPublished, isTestimonial });
        res.json({ message: 'Review status updated', review });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Public: Get featured testimonials for the landing page.
 */
exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Review.findAll({
            where: { isPublished: true, isTestimonial: true },
            include: [
                { model: User, attributes: ['name'] },
                { model: ConsultantProfile, include: [{ model: User, attributes: ['name'] }] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        res.json(testimonials);
    } catch (error) {
        console.error('Testimonials fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
