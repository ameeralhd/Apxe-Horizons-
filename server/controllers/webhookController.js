const { Appointment, User, ConsultantProfile, Service, Transaction } = require('../models');
const { sendPaymentSuccessEmail } = require('../services/emailService');

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const event = req.body; // In real app, use stripe.webhooks.constructEvent

    console.log('--- Webhook Event Received ---', event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const appointmentId = session.metadata.appointmentId;

        try {
            const appointment = await Appointment.findByPk(appointmentId, {
                include: [
                    { model: User, attributes: ['name', 'email'] },
                    { model: Service },
                    { model: ConsultantProfile, include: [User] }
                ]
            });

            if (appointment) {
                // Update status
                appointment.status = 'paid';
                await appointment.save();

                // Persist transaction
                const transaction = await Transaction.create({
                    appointmentId: appointment.id,
                    userId: appointment.userId,
                    amount: appointment.Service?.price || 199.99,
                    status: 'paid',
                    invoiceId: `AH-WEB-${Date.now()}`
                });

                // Trigger Email
                sendPaymentSuccessEmail(
                    appointment.User.email,
                    appointment.User.name,
                    appointment.ConsultantProfile.User.name,
                    appointment.date,
                    appointment.time,
                    transaction.amount,
                    appointment.meetingLink || 'https://meet.apexhorizons.com/live',
                    transaction.id + 1000
                ).catch(err => console.error("Webhook Email Failure:", err));

                console.log(`Webhook Processed: Appointment ${appointmentId} marked as PAID.`);
            }
        } catch (err) {
            console.error('Webhook Error:', err);
            return res.status(500).send('Webhook Processing Error');
        }
    }

    res.json({ received: true });
};
