const { User } = require('./server/models');

async function checkAndVerifyAdmin() {
    try {
        const admin = await User.findOne({ where: { email: 'admin@apexhorizons.com' } });
        if (admin) {
            console.log('Admin found:', admin.email);
            console.log('Current Verified Status:', admin.isVerified);
            
            if (!admin.isVerified) {
                admin.isVerified = true;
                await admin.save();
                console.log('✅ Admin user has been auto-verified.');
            }
        } else {
            console.log('Admin user NOT found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAndVerifyAdmin();
