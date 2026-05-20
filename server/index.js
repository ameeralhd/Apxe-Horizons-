const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const { startHeartbeat } = require('./services/heartbeatService');
const { triggerNudges } = require('./services/nudgeService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Serve static uploads
app.use('/uploads', express.static('public/uploads'));

// Request Logger
app.use((req, res, next) => {
    console.log(`[REQ] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Webhooks (Must be before express.json if global raw body is needed, but we use it locally in routes)
app.use('/api/webhooks', require('./routes/webhookRoutes'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/consultants', require('./routes/consultantRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/universities', require('./routes/universityRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/expert', require('./routes/expertRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/dynamic-content', require('./routes/dynamicContentRoutes'));
app.use('/api/scholarships', require('./routes/scholarshipRoutes'));

app.get('/', (req, res) => {
    res.send('Apex Horizons API is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {},
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Sync DB and Start Server
// Start Server Immediately to avoid port binding / unresponsiveness issues
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start background automation services
    startHeartbeat();

    // Trigger nudges once a day (simplified mock for demo/prod prep)
    setInterval(triggerNudges, 24 * 60 * 60 * 1000);
});

// Sync DB and Seed Admin Users in background
const syncOptions = process.env.DATABASE_URL ? { alter: true } : {};
sequelize.sync(syncOptions).then(async () => {
    console.log('✅ Database connected and synchronized successfully.');

    // Ensure Admin Users Exist (Multiple common ones for convenience)
    try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        
        const adminsToSeed = [
            {
                name: 'Admin User',
                email: 'joinapex@horizons-pex.com',
                password: 'Apex13189956@join',
                phone: '+0000000000'
            },
            {
                name: 'Apex Admin',
                email: 'admin@apexhorizons.com',
                password: 'admin123',
                phone: '+1234567890'
            },
            {
                name: 'System Admin',
                email: 'admin@apex.com',
                password: 'password123',
                phone: '+1112223333'
            }
        ];

        for (const adminInfo of adminsToSeed) {
            const existingAdmin = await User.findOne({ where: { email: adminInfo.email } });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash(adminInfo.password, 10);
                await User.create({
                    name: adminInfo.name,
                    email: adminInfo.email,
                    password: hashedPassword,
                    role: 'admin',
                    isVerified: true,
                    phone: adminInfo.phone
                });
                console.log(`✅ Default admin user seeded successfully: ${adminInfo.email}`);
            } else {
                // Ensure they are marked as verified and admin
                let updated = false;
                if (!existingAdmin.isVerified) {
                    existingAdmin.isVerified = true;
                    updated = true;
                }
                if (existingAdmin.role !== 'admin') {
                    existingAdmin.role = 'admin';
                    updated = true;
                }
                if (updated) {
                    await existingAdmin.save();
                    console.log(`✅ Admin status updated/verified for: ${adminInfo.email}`);
                }
            }
        }
    } catch (seedErr) {
        console.error('❌ Error seeding admin users:', seedErr.message);
    }
}).catch(err => {
    console.error('❌ Unable to connect to the database:', err.message);
});
