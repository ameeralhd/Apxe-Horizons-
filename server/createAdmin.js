const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: 'joinapex@horizons-pex.com' } });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: joinapex@horizons-pex.com');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('Apex13189956@join', 10);

        const admin = await User.create({
            name: 'Admin User',
            email: 'joinapex@horizons-pex.com',
            password: hashedPassword,
            phone: '+1234567890',
            role: 'admin',
            isVerified: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: joinapex@horizons-pex.com');
        console.log('🔑 Password: Apex13189956@join');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
