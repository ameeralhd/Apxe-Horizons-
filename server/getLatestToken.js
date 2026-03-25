const { User } = require('./models');

async function getLatestUser() {
    try {
        const user = await User.findOne({
            order: [['createdAt', 'DESC']]
        });
        if (user) {
            console.log(`LATEST_USER_EMAIL: ${user.email}`);
            console.log(`LATEST_USER_TOKEN: ${user.verificationToken}`);
            console.log(`LATEST_USER_VERIFIED: ${user.isVerified}`);
        } else {
            console.log('No users found.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

getLatestUser();
