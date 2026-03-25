const { User } = require('./models');

async function clean() {
    try {
        const users = await User.findAll();
        for (const user of users) {
             // Keep admins and consultants, delete random test users
             if (user.role !== 'admin' && user.role !== 'consultant') {
                  console.log(`Deleting test user ${user.email}`);
                  await user.destroy();
             }
        }
        console.log('Database cleanup complete.');
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
clean();
