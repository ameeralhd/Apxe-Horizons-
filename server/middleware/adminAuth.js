const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
    try {
        // First check if user is authenticated
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');

        // Get user from database
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { requireAdmin };
