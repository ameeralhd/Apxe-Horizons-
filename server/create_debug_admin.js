const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('admin123', salt);
        
        const [user, created] = await User.findOrCreate({
            where: { email: 'testadmin@apex.com' },
            defaults: {
                name: 'Test Admin',
                password: password,
                role: 'admin',
                isVerified: true
            }
        });
        
        if (created) {
            console.log('Admin user created: testadmin@apex.com / admin123');
        } else {
            user.role = 'admin';
            user.isVerified = true;
            await user.save();
            console.log('Admin user updated: testadmin@apex.com / admin123');
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
createAdmin();
