const dotenv = require('dotenv');
dotenv.config();
const { sendVerificationEmail } = require('./services/emailService');

async function testEmail() {
    console.log('--- Email Delivery Test ---');
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    
    try {
        console.log('Attempting to send a test verification email...');
        const info = await sendVerificationEmail('test@example.com', 'Test User', 'abc-123-verification-token');
        console.log('✅ Success! MessageId:', info.messageId);
        if (info.envelope && info.envelope.from.includes('ethereal.email')) {
            console.log('ℹ️ Sent to Ethereal Test Trap.');
        } else {
            console.log('🚀 Sent to Real SMTP Server!');
        }
    } catch (err) {
        console.error('❌ Email Test Failed:', err.message);
    }
}

testEmail();
