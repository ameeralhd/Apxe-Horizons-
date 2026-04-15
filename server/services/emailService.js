const nodemailer = require('nodemailer');

// Configure transporter
let transporter;

let transporterReady = (async () => {
    // Detect placeholders or missing config
    const isPlaceholder = !process.env.SMTP_USER || 
                          process.env.SMTP_USER.includes('your_verified_sender') ||
                          process.env.SMTP_USER === 'your_email@gmail.com';

    if (isPlaceholder) {
        console.log('⚠️ [EMAIL] Using Ethereal (Test Trap) - SMTP credentials are still placeholders in .env');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } else {
        console.log(`📡 [EMAIL] Connecting to real SMTP host: ${process.env.SMTP_HOST}...`);
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    return new Promise((resolve, reject) => {
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ [EMAIL] SMTP Connection Error:', error.code, error.message);
                resolve(false); // Resolve even on error so we don't hang, but log failure
            } else {
                console.log('✅ [EMAIL] SMTP Server Connection: Ready for delivery' + (isPlaceholder ? ' (TEST ACCOUNT)' : ''));
                resolve(true);
            }
        });
    });
})();

const ensureTransporter = async () => {
    await transporterReady;
    if (!transporter) throw new Error('SMTP Transporter not initialized');
};

// Helper to log preview URL for test emails
const logPreview = (info) => {
    const isEthereal = transporter?.options?.host?.includes('ethereal.email');
    if (isEthereal && info) {
        console.log('📧 [TEST] Email Sent to Ethereal Trap: %s', info.messageId);
        console.log('🔗 [TEST] Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
};

const SENDER_EMAIL = process.env.SMTP_FROM || '"Apex Horizons" <info@apexhorizons.com>';
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL || 'info.apexhorizons23@gmail.com';

// Send an internal admin notification for any app event
const sendAdminNotification = async (subject, details) => {
    await ensureTransporter();
    const content = `
        <div style="font-family: monospace; background: #1E293B; color: #94A3B8; padding: 24px; border-radius: 12px; font-size: 13px; line-height: 1.8;">
            <p style="color: #2DD4BF; font-size: 16px; font-weight: 900; margin: 0 0 16px;">🔔 Admin Notification</p>
            ${Object.entries(details).map(([k, v]) => `<p style="margin: 4px 0;"><span style="color: #38BDF8; font-weight: 700;">${k}:</span> <span style="color: #F1F5F9;">${v}</span></p>`).join('')}
            <p style="color: #64748B; font-size: 11px; margin-top: 20px;">Sent at: ${new Date().toISOString()}</p>
        </div>
    `;
    try {
        return transporter.sendMail({
            from: SENDER_EMAIL,
            to: ADMIN_NOTIFY_EMAIL,
            subject: `[Apex Admin] ${subject}`,
            html: getBaseTemplate(content, `Admin Alert: ${subject}`)
        });
    } catch (err) {
        console.error('[EMAIL] Failed to send admin notification:', err.message);
    }
};

const APP_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const emailStyles = {
    main: "font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);",
    header: "background: #1E293B; padding: 40px 20px; text-align: center; color: white;",
    body: "padding: 40px; color: #334155; line-height: 1.6;",
    footer: "background: #F8FAFC; padding: 20px; text-align: center; color: #94A3B8; font-size: 12px;",
    button: "display: inline-block; background: #2DD4BF; color: #1E293B; padding: 14px 28px; border-radius: 8px; font-weight: 800; text-decoration: none; margin: 20px 0;",
    alert: "background: #F0FDFA; border-left: 4px solid #2DD4BF; padding: 20px; margin: 20px 0; color: #115E59; border-radius: 0 8px 8px 0;"
};

const getBaseTemplate = (content, title) => `
<div style="${emailStyles.main}">
    <div style="${emailStyles.header}">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.05em;">APEX HORIZONS</h1>
        <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Global Academic Excellence</p>
    </div>
    <div style="${emailStyles.body}">
        <h2 style="color: #1E293B; margin-top: 0; font-weight: 900;">${title}</h2>
        ${content}
    </div>
    <div style="${emailStyles.footer}">
        <p>© 2026 Apex Horizons Group. All rights reserved.</p>
        <p>Trusted by Global Learners | <a href="${APP_URL}/faq" style="color: #2DD4BF; text-decoration: none;">FAQ</a></p>
    </div>
</div>
`;

const sendWelcomeEmail = async (to, fullName) => {
    await ensureTransporter();
    const firstName = fullName.split(' ')[0];
    const content = `
        <p>Hi ${firstName},</p>
        <p>Welcome to <strong>Apex Horizons</strong>! We are thrilled to partner with you in your journey toward international education. Our goal is to make the scholarship and application process as smooth and transparent as possible.</p>
        
        <h3 style="color: #1E293B; margin-top: 30px;">Your first steps to success:</h3>
        
        <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>1. Complete your profile</strong></p>
            <p style="margin: 4px 0 0; color: #64748B; font-size: 14px;">A complete profile helps our matching engine find the best scholarships for you.</p>
        </div>

        <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>2. Check your Document Toolkit</strong></p>
            <p style="margin: 4px 0 0; color: #64748B; font-size: 14px;">Feeling overwhelmed by the paperwork? We’ve created a Resource Hub specifically for you. It contains templates for CVs, Research Proposals, and Letters to Professors.</p>
        </div>

        <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>3. Explore Universities</strong></p>
            <p style="margin: 4px 0 0; color: #64748B; font-size: 14px;">Browse our partner list to see which institutions align with your career goals.</p>
        </div>
        
        <div style="text-align: center; margin-top: 32px;">
            <a href="${APP_URL}/verification" style="${emailStyles.button}">Access My Dashboard & Resources</a>
        </div>
        
        <div style="background: #F8FAFC; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #E2E8F0;">
            <p style="margin: 0; color: #475569; font-size: 14px;">
                <strong>Need help?</strong> Simply reply to this email, or book a session with one of our consultants directly from your dashboard.
            </p>
        </div>

        <p style="color: #1E293B; margin-top: 30px;">
            Best regards,<br/>
            <strong>The Apex Horizons Team</strong>
        </p>
    `;

    const info = await transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: `Welcome to Apex Horizons, ${firstName}! Your global journey starts here. 🎓`,
        html: getBaseTemplate(content, "Welcome to Apex Horizons!")
    });
    logPreview(info);
    sendAdminNotification('New User Registered', { Name: fullName, Email: to }).catch(() => {});
    return info;
};

const sendVerificationEmail = async (to, fullName, token) => {
    await ensureTransporter();
    const firstName = fullName.split(' ')[0];
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

    const content = `
        <p>Hi ${firstName},</p>
        <p>One last step! Please verify your email to unlock your <strong>Apex Horizons</strong> dashboard and begin your verification process.</p>
        
        <div style="${emailStyles.alert}">
            <strong>Action Required:</strong><br/>
            Click the button below to confirm your account.
        </div>
        
        <a href="${verificationUrl}" style="${emailStyles.button}">Verify Email Address</a>
        
        <p style="color: #64748B; font-size: 13px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${verificationUrl}" style="color: #2DD4BF;">${verificationUrl}</a>
        </p>
    `;

    const info = await transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: "Verify your Apex Horizons account ✉️",
        html: getBaseTemplate(content, "Almost There!")
    });
    logPreview(info);
    return info;
};

const sendPasswordResetEmail = async (to, fullName, token) => {
    await ensureTransporter();
    const firstName = fullName.split(' ')[0];
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    const content = `
        <p>Hi ${firstName},</p>
        <p>We received a request to reset the password for your account. No worries—it happens to the best of us!</p>
        
        <div style="background: #F8FAFC; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #E2E8F0; text-align: center;">
            <p style="margin-bottom: 20px; color: #1E293B; font-weight: 600;">Choose a new password using the link below:</p>
            <a href="${resetUrl}" style="${emailStyles.button}">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #94A3B8;">This link will expire in 60 minutes.</p>
        </div>
        
        <p style="font-size: 14px; color: #64748B; margin-top: 30px;">
            <strong>Security Note:</strong> If you did not request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
    `;

    const info = await transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: "Reset your Apex Horizons password 🔒",
        html: getBaseTemplate(content, "Password Reset Request")
    });
    logPreview(info);
    sendAdminNotification('Password Reset Requested', { Email: to, User: fullName }).catch(() => {});
    return info;
};

const sendBookingConfirmationEmail = async (to, studentName, consultantName, date, time) => {
    const content = `
        <p>Great news! Your session with <strong>${consultantName}</strong> is officially confirmed.</p>
        <div style="background: #F1F5F9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 5px 0 0;"><strong>Time:</strong> ${time} (UTC+7)</p>
        </div>
        <p>Please ensure you've uploaded all relevant documents before the meeting to maximize your session value.</p>
        <a href="${APP_URL}/my-bookings" style="${emailStyles.button}">View Booking Details</a>
    `;
    transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: `Session Confirmed: ${consultantName}`,
        html: getBaseTemplate(content, "Booking Successfully Secured")
    });
    sendAdminNotification('New Appointment Booked', { Student: studentName, Consultant: consultantName, Date: date, Time: time }).catch(() => {});
};

const sendRejectionEmail = async (to, studentName, documentName, reason) => {
    const content = `
        <p>Our admissions team has reviewed your submission for <strong>${documentName}</strong>. Unfortunately, we cannot accept it in its current form.</p>
        <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; color: #991B1B;">
            <strong>Feedback:</strong> ${reason}
        </div>
        <p>What to do next:</p>
        <ol>
            <li>Log in to your Dashboard.</li>
            <li>Re-upload a high-resolution version.</li>
        </ol>
        <a href="${APP_URL}/verification" style="${emailStyles.button}">Update Credentials</a>
    `;
    transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: `Action Required: ${documentName}`,
        html: getBaseTemplate(content, "Document Verification Update")
    });
    sendAdminNotification('Document Rejected', { Student: studentName, Document: documentName, Reason: reason }).catch(() => {});
};

const sendConsultantAcceptanceEmail = async (to, studentName, consultantName, meetingLink) => {
    const content = `
        <p>Your consultant, <strong>${consultantName}</strong>, is ready to meet you. The link for your strategic consultation is now live.</p>
        <div style="${emailStyles.alert}">
            <strong>Meeting Entry:</strong><br/>
            Click the button below to join the virtual room.
        </div>
        <a href="${meetingLink}" style="${emailStyles.button}">Join Now</a>
    `;
    return transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: `Meeting Secured: ${studentName} is waiting`,
        html: getBaseTemplate(content, "Strategic Session Live")
    });
};

const sendNudgeEmail = async (to, studentName) => {
    const content = `
        <p>Don't let your global dreams wait! You're only a few uploads away from your scholarship goal.</p>
        <p>Our experts have noted that your profile is currently at 0% progress. Take 5 minutes today to upload your ID or Transcripts.</p>
        <a href="${APP_URL}/verification" style="${emailStyles.button}">Resume Application</a>
    `;
    return transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        subject: `Your future won't wait, ${studentName}!`,
        html: getBaseTemplate(content, "Keep Your Momentum")
    });
};

const sendReminderEmail = async (to, studentName, consultantName, topic, time, meetingLink) => {
    const trackerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background: #F8FAFC; border-radius: 12px;">
            <div style="text-align: center; flex: 1;">
                <div style="color: #2DD4BF; font-weight: 800; font-size: 12px;">Step 1</div>
                <div style="font-size: 10px; color: #64748B;">Booked ✅</div>
            </div>
            <div style="width: 20px; height: 2px; background: #E2E8F0; margin-top: 10px;"></div>
            <div style="text-align: center; flex: 1;">
                <div style="color: #2DD4BF; font-weight: 800; font-size: 12px;">Step 2</div>
                <div style="font-size: 10px; color: #1E293B; font-weight: 900;">Reminder 🔔</div>
            </div>
            <div style="width: 20px; height: 2px; background: #E2E8F0; margin-top: 10px;"></div>
            <div style="text-align: center; flex: 1;">
                <div style="color: #94A3B8; font-weight: 800; font-size: 12px;">Step 3</div>
                <div style="font-size: 10px; color: #94A3B8;">Session 🎥</div>
            </div>
            <div style="width: 20px; height: 2px; background: #E2E8F0; margin-top: 10px;"></div>
            <div style="text-align: center; flex: 1;">
                <div style="color: #94A3B8; font-weight: 800; font-size: 12px;">Step 4</div>
                <div style="font-size: 10px; color: #94A3B8;">Feedback ⭐</div>
            </div>
        </div>
    `;

    const content = `
        ${trackerHtml}
        <p>Hi ${studentName},</p>
        <p>This is a friendly reminder that your expert consultation session starts in <strong>1 hour</strong>.</p>
        
        <div style="background: #F1F5F9; padding: 25px; border-radius: 16px; margin: 25px 0; border: 1px solid #E2E8F0;">
            <h3 style="margin: 0 0 15px 0; color: #1E293B; border-bottom: 1px solid #CBD5E1; padding-bottom: 10px;">Session Details</h3>
            <p style="margin: 8px 0;"><strong>Expert:</strong> ${consultantName}</p>
            <p style="margin: 8px 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${time} (UTC+7)</p>
        </div>

        <h3 style="color: #1E293B;">How to Join:</h3>
        <p>Simply click the button below to enter your private meeting room. We recommend joining 5 minutes early to test your camera and microphone.</p>
        
        <a href="${meetingLink}" style="${emailStyles.button}">Join Meeting Now</a>
        
        <div style="${emailStyles.alert}">
            <strong>Need to Reschedule?</strong><br/>
            If you can no longer make it, please visit your Consultations dashboard to message your expert.
        </div>
        
        <p>See you soon,<br/>The Apex Horizons Team</p>
    `;

    return transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: `Happening Soon: Your Consultation with ${consultantName} 🎥`,
        html: getBaseTemplate(content, "Consultation Countdown: 1 Hour Left")
    });
};

const sendCongratulationsEmail = async (to, studentName) => {
    const content = `
        <p>Congratulations! Our admissions team has officially verified all your required documents. Your profile is now <strong>100% Verified</strong>.</p>
        <div style="${emailStyles.alert}">
            <strong>Next Milestone:</strong><br/>
            You are now eligible for priority university application submissions.
        </div>
        <a href="${APP_URL}/consultation" style="${emailStyles.button}">Book Final Strategy Session</a>
    `;
    transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: `You're 100% Verified! 🎉`,
        html: getBaseTemplate(content, "Full Verification Achieved")
    });
    sendAdminNotification('User Fully Verified', { Student: studentName, Email: to }).catch(() => {});
};

const sendPaymentSuccessEmail = async (to, studentName, consultantName, date, time, amount, meetingLink, orderId) => {
    const summaryStyle = "background: #F8FAFC; padding: 25px; border-radius: 16px; margin: 25px 0; border: 1px solid #E2E8F0;";

    const content = `
        <p>Hi ${studentName},</p>
        <p>Great news! Your payment was successful, and your consultation session with <strong>${consultantName}</strong> is now officially confirmed.</p>
        
        <h3 style="color: #1E293B; margin-top: 30px;">Your Booking Summary:</h3>
        <div style="${summaryStyle}">
            <p style="margin: 8px 0;"><strong>Expert:</strong> ${consultantName}</p>
            <p style="margin: 8px 0;"><strong>Date & Time:</strong> ${date} at ${time} (UTC+7)</p>
            <p style="margin: 8px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #2DD4BF; text-decoration: none; font-weight: 700;">Join Session</a></p>
            <p style="margin: 15px 0 0; font-size: 12px; color: #64748B;">(This link will also be active on your dashboard 10 minutes before the start)</p>
        </div>

        <h3 style="color: #1E293B;">Payment Details:</h3>
        <div style="${summaryStyle}">
            <p style="margin: 8px 0;"><strong>Order ID:</strong> #${orderId}</p>
            <p style="margin: 8px 0;"><strong>Amount:</strong> $${amount}</p>
            <p style="margin: 8px 0;"><strong>Status:</strong> Paid in Full ✅</p>
        </div>

        <p>You can view all your transactions and download official receipts anytime from your **History & Payments** tab in the dashboard.</p>
        
        <div style="${emailStyles.alert}">
            Prepare your questions and get ready to take the next step toward your global education!
        </div>

        <p>Best Regards,<br/>The Apex Horizons Team</p>
    `;

    transporter.sendMail({
        from: SENDER_EMAIL,
        to,
        bcc: ADMIN_NOTIFY_EMAIL,
        subject: `Confirmed: Your Session & Payment Receipt 🏛️`,
        html: getBaseTemplate(content, "Payment & Booking Success")
    });
    sendAdminNotification('Payment Received', { Student: studentName, Consultant: consultantName, Date: date, Time: time, Amount: `$${amount}`, OrderId: `#${orderId}` }).catch(() => {});
};

module.exports = {
    sendRejectionEmail,
    sendCongratulationsEmail,
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendBookingConfirmationEmail,
    sendConsultantAcceptanceEmail,
    sendNudgeEmail,
    sendReminderEmail,
    sendPaymentSuccessEmail,
    sendAdminNotification
};
