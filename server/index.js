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
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);

        // Start background automation services
        startHeartbeat();

        // Trigger nudges once a day (simplified mock for demo/prod prep)
        setInterval(triggerNudges, 24 * 60 * 60 * 1000);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
