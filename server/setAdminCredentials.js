const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function setAdminCredentials() {
    const email = 'joinapex@horizons-pex.com';
    const password = 'Apex13189956@join';
    const name = 'Admin User';

    try {
        console.log(`Setting admin credentials for: ${email}`);
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find existing user or create new one
        const [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                name,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                phone: '+0000000000'
            }
        });

        if (!created) {
            // Update existing user
            user.password = hashedPassword;
            user.role = 'admin';
            user.isVerified = true;
            await user.save();
            console.log('✅ Admin user updated successfully!');
        } else {
            console.log('✅ Admin user created successfully!');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting admin credentials:', error);
        process.exit(1);
    }
}

setAdminCredentials();
