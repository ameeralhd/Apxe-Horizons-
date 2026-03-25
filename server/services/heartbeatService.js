const { Appointment, User, ConsultantProfile } = require('../models');
const { sendReminderEmail } = require('./emailService');
const { Op } = require('sequelize');

/**
 * Background task to check for sessions starting in the next 60-75 minutes.
 * Triggers a professional 1-hour reminder email to the student.
 */
const checkUpcomingSessions = async () => {
    try {
        const now = new Date();
        const startWindow = new Date(now.getTime() + 60 * 60 * 1000); // 60 mins from now
        const endWindow = new Date(now.getTime() + 75 * 60 * 1000);  // 75 mins from now

        console.log(`[Heartbeat] Checking for sessions between ${startWindow.toLocaleTimeString()} and ${endWindow.toLocaleTimeString()}`);

        // Note: This logic assumes 'date' and 'time' can be parsed into a single JS Date.
        // If 'date' is YYYY-MM-DD and 'time' is HH:mm, we combine them.
        const sessions = await Appointment.findAll({
            where: {
                status: 'confirmed',
                reminderSent: { [Op.not]: true } // Prevent duplicate emails
            },
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: ConsultantProfile, include: [{ model: User, attributes: ['name'] }] }
            ]
        });

        let remindersTriggered = 0;

        for (const session of sessions) {
            const sessionDateTime = new Date(`${session.date} ${session.time}`);

            if (sessionDateTime >= startWindow && sessionDateTime <= endWindow) {
                console.log(`[Heartbeat] Triggering reminder for User: ${session.User.email} (Consultant: ${session.ConsultantProfile.User.name})`);

                await sendReminderEmail(
                    session.User.email,
                    session.User.name,
                    session.ConsultantProfile.User.name,
                    session.topic || 'General Strategy',
                    session.time,
                    session.meetingLink || 'https://meet.apexhorizons.com/session'
                );

                // Mark reminder as sent
                await session.update({ reminderSent: true });
                remindersTriggered++;
            }
        }

        if (remindersTriggered > 0) {
            console.log(`[Heartbeat] Successfully sent ${remindersTriggered} reminders.`);
        }

        return { success: true, count: remindersTriggered };
    } catch (error) {
        console.error("[Heartbeat] Error checking upcoming sessions:", error);
        return { success: false, error: error.message };
    }
};

const startHeartbeat = () => {
    console.log("[Heartbeat] Meeting automation service started (Interval: 15 minutes)");
    // Run immediately on start
    checkUpcomingSessions();
    // Then run every 15 minutes
    setInterval(checkUpcomingSessions, 15 * 60 * 1000);
};

module.exports = { startHeartbeat };
