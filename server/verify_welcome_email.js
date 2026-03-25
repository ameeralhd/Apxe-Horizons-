const emailService = require('./services/emailService');
const nodemailer = require('nodemailer');

async function verifyWelcomeEmail() {
    console.log('--- Verifying Welcome Email ---');
    try {
        console.log('⏳ Waiting for SMTP connection...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('📤 Sending welcome email to test@example.com...');
        const info = await emailService.sendWelcomeEmail('test@example.com', 'Ameer');
        
        console.log('✅ Email sent successfully!');
        console.log('🆔 Message ID:', info.messageId);
        
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log('🔗 Preview Link:', previewUrl);
        } else {
            console.log('ℹ️ No preview link available (likely using real SMTP or non-Ethereal)');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to send welcome email:');
        console.error(error);
        process.exit(1);
    }
}

verifyWelcomeEmail();
