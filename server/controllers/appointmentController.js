const { DataTypes, Op } = require('sequelize');
const { Appointment, User, Service, ConsultantProfile, TimeSlot, Availability } = require('../models');
const {
    sendBookingConfirmationEmail,
    sendConsultantAcceptanceEmail,
    sendPaymentSuccessEmail
} = require('../services/emailService');
const { Transaction } = require('../models');
const { generateReceipt } = require('../services/receiptService');
// Note: User model is already imported via `require('../models')`

exports.createAppointment = async (req, res) => {
    try {
        const { serviceId, consultantId, date, time, topic, documentPath } = req.body;
        const userId = req.user.id;

        // 1. Double-Booking Prevention & Availability Logic
        // Normalize time from frontend (e.g., "10:00 AM" -> "10:00:00")
        let normalizedTime = time;
        if (time && (time.includes('AM') || time.includes('PM'))) {
            const [t, modifier] = time.split(' ');
            let [hours, minutes] = t.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
            normalizedTime = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
        } else if (time && time.length === 5) {
            normalizedTime = `${time}:00`;
        }

        // Check if a slot already exists and is booked
        // Support both 24h normalized and 12h original formats for legacy data
        let timeSlot = await TimeSlot.findOne({
            where: {
                consultantId,
                date,
                startTime: {
                    [Op.in]: [normalizedTime, time]
                }
            }
        });

        if (timeSlot && timeSlot.isBooked) {
            return res.status(400).json({ message: 'This time slot is already booked.' });
        }

        // If slot doesn't exist, verify it matches the Consultant's Weekly Availability
        if (!timeSlot) {
            // Robust dayOfWeek detection
            const appointmentDate = new Date(date);
            // Use UTC to ensure consistency if date strings are YYYY-MM-DD
            const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(appointmentDate);

            const isAvailable = await Availability.findOne({
                where: {
                    consultantId,
                    dayOfWeek,
                    startTime: { [Op.lte]: normalizedTime },
                    endTime: { [Op.gt]: normalizedTime }
                }
            });

            if (!isAvailable) {
                const hasAvailability = await Availability.count({ where: { consultantId } });
                if (hasAvailability > 0) {
                    console.log(`[Availability Check Fail] Day: ${dayOfWeek}, Time: ${normalizedTime}, Consultant: ${consultantId}`);
                    return res.status(400).json({ message: 'Consultant is not available at this time.' });
                }
            }

            // Create the slot and mark as booked
            timeSlot = await TimeSlot.create({
                consultantId,
                date,
                startTime: normalizedTime,
                isBooked: true
            });
        } else {
            // Slot exists but wasn't booked (maybe cancelled previously), so mark it
            timeSlot.isBooked = true;
            await timeSlot.save();
        }

        // 2. Create Appointment linked to TimeSlot
        console.log('[CreateAppointment] Step 2: Creating Appointment record...');
        
        // Ensure serviceId is an integer or null
        const numericServiceId = parseInt(serviceId, 10);
        const validatedServiceId = isNaN(numericServiceId) ? null : numericServiceId;

        if (!timeSlot || !timeSlot.id) {
            throw new Error("Failed to secure a time slot. Please try again.");
        }

        const appointment = await Appointment.create({
            userId,
            serviceId: validatedServiceId,
            consultantId,
            slotId: timeSlot.id,
            date,
            time: normalizedTime,
            topic: topic || 'General Consultation',
            documentPath,
            status: 'pending'
        });

        console.log('[CreateAppointment] Step 3: Sending emails...');
        const user = await User.findByPk(userId);
        const consultantProfile = await ConsultantProfile.findByPk(consultantId, { include: [User] });
        if (user && consultantProfile && consultantProfile.User) {
            sendBookingConfirmationEmail(
                user.email,
                user.name,
                consultantProfile.User.name,
                date,
                normalizedTime
            ).catch(err => console.error("Failed to send booking confirmation email:", err));

            sendConsultantAcceptanceEmail(
                consultantProfile.User.email,
                consultantProfile.User.name,
                user.name,
                date,
                normalizedTime,
                appointment.id
            ).catch(err => console.error("Failed to send consultant acceptance email:", err));
        }

        console.log('[CreateAppointment] Success!');
        res.status(201).json({ message: 'Appointment created successfully', appointment });
    } catch (err) {
        console.error('CRITICAL Error in createAppointment:', err);
        // Include full error in response for debugging
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
        });
    }
};

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Service, attributes: ['title', 'price'] },
                {
                    model: ConsultantProfile,
                    include: [{ model: User, attributes: ['name'] }]
                }
            ],
            order: [['date', 'DESC'], ['time', 'DESC']]
        });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin: Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Service, attributes: ['title'] },
                {
                    model: ConsultantProfile,
                    include: [{ model: User, attributes: ['name'] }]
                }
            ],
            order: [['date', 'DESC']]
        });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin: Update Status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        // TODO: Trigger Notification here
        console.log(`Notification: Appointment ${appointment.id} status updated to ${status}`);

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                { model: Service, attributes: ['title', 'price'] },
                {
                    model: ConsultantProfile,
                    include: [{ model: User, attributes: ['name'] }]
                }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Ensure user owns this appointment or is admin
        if (appointment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.processPayment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                { model: Service, attributes: ['title', 'price'] },
                {
                    model: ConsultantProfile,
                    include: [{ model: User, attributes: ['name', 'email'] }]
                },
                { model: User, attributes: ['name', 'email'] }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // 1. Update Appointment Status
        appointment.status = 'paid';
        await appointment.save();

        // 2. Persist Transaction
        const transaction = await Transaction.create({
            appointmentId: appointment.id,
            userId: appointment.userId,
            amount: appointment.Service?.price || 199.99,
            status: 'paid',
            invoiceId: `AH-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });

        // 3. Trigger Payment Success Email
        if (appointment.User && appointment.ConsultantProfile?.User) {
            sendPaymentSuccessEmail(
                appointment.User.email,
                appointment.User.name,
                appointment.ConsultantProfile.User.name,
                appointment.date,
                appointment.time,
                transaction.amount,
                appointment.meetingLink || 'https://meet.apexhorizons.com/live',
                transaction.id + 1000
            ).catch(err => console.error("Failed to send payment success email:", err));
        }

        res.json({
            success: true,
            message: 'Payment verified and confirmed',
            appointment,
            transaction
        });

    } catch (err) {
        console.error('Error in processPayment:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.downloadReceipt = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            where: { appointmentId: req.params.id }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction record not found' });
        }

        const appointment = await Appointment.findByPk(transaction.appointmentId, {
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: ConsultantProfile, include: [User] }
            ]
        });

        const student = appointment.User;
        const consultant = appointment.ConsultantProfile;

        const filePath = await generateReceipt(transaction, student, consultant, appointment);

        res.download(filePath, `Receipt-INV-${transaction.id + 1000}.pdf`, (err) => {
            if (err) console.error("Download Error:", err);
        });

    } catch (err) {
        console.error('Receipt Generation Error:', err);
        res.status(500).json({ message: 'Could not generate receipt', error: err.message });
    }
};
