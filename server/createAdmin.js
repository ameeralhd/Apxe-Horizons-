const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: 'admin@apexhorizons.com' } });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@apexhorizons.com');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@apexhorizons.com',
            password: hashedPassword,
            phone: '+1234567890',
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@apexhorizons.com');
        console.log('🔑 Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
