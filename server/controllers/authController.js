const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        const name = `${firstName} ${lastName}`;

        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            isVerified: true,
            verificationToken: verificationToken,
            verificationExpires: new Date(Date.now() + 3600000)
        });

        console.log(`✅ User created: ${user.email}. Sending welcome email...`);
        
        // Trigger Welcome Email (Non-blocking)
        try {
            await sendWelcomeEmail(user.email, user.name);
            console.log(`📧 Welcome email sent to ${user.email}`);
        } catch (emailErr) {
            console.error(`❌ Failed to send welcome email to ${user.email}:`, emailErr.message);
        }

        res.status(201).json({
            message: 'Registration successful! You can now log in.',
            email: user.email
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({ 
            where: { 
                verificationToken: token,
                verificationExpires: { [require('sequelize').Op.gt]: new Date() }
            } 
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationExpires = null;
        await user.save();

        // Trigger the Welcome Email AFTER verification
        await sendWelcomeEmail(user.email, user.name).catch(console.error);

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[Login Attempt] Email: ${email}`);

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }



        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key_123', { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, isVerified: user.isVerified } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        // Generic response to prevent enumeration
        const genericMessage = { message: 'If an account exists for this email, a reset link has been sent.' };

        if (!user) {
            return res.json(genericMessage);
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendPasswordResetEmail(user.email, user.name, token).catch(console.error);

        res.json(genericMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [require('sequelize').Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, password } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (firstName && lastName) {
            user.name = `${firstName} ${lastName}`;
        }

        if (phone) {
            user.phone = phone;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        // Fetch user profile using access_token
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user profile from Google');
        }

        const profile = await response.json();
        const { sub: googleId, email, name, picture: avatar } = profile;

        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
                name,
                email,
                googleId,
                avatar,
                isVerified: true, // OAuth emails are verified
                password: crypto.randomBytes(16).toString('hex') // Dummy password
            });
            await sendWelcomeEmail(user.email, user.name).catch(console.error);
        } else {
            // Update Google ID and avatar if needed
            user.googleId = googleId;
            user.avatar = avatar;
            if (!user.isVerified) user.isVerified = true;
            await user.save();
        }

        const payload = { id: user.id, role: user.role };
        const authToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret_key_123', { expiresIn: '1h' });

        res.json({
            token: authToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isVerified: user.isVerified,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Google authentication failed', error: err.message });
    }
};

// DEV ONLY: Bypass verification for testing
exports.debugVerify = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        console.log(`🔧 [DEBUG] User ${email} verified via Developer Bypass.`);
        res.json({ message: 'User verified successfuly' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
