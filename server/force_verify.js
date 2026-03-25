const { sequelize, User } = require('./models');

async function forceVerify() {
    try {
        await sequelize.authenticate();
        console.log('📡 Database connected.');

        // Find the most recent unverified user
        const user = await User.findOne({
            where: { isVerified: false },
            order: [['createdAt', 'DESC']]
        });

        if (!user) {
            console.log('ℹ️ No unverified users found.');
            return;
        }

        console.log(`👤 Found unverified user: ${user.email} (${user.name})`);
        
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        console.log(`✅ User ${user.email} has been FORCED VERIFIED.`);
        console.log('🚀 You can now log in with this account.');

    } catch (err) {
        console.error('❌ Error in forceVerify:', err.message);
    } finally {
        await sequelize.close();
    }
}

forceVerify();
