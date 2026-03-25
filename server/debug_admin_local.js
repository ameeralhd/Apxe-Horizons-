const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function debugAdmin() {
    const email = 'joinapex@horizons-pex.com';
    const password = 'Apex13189956@join';
    
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('❌ ADMIN USER NOT FOUND IN DB');
            return;
        }
        
        console.log('✅ Admin user found:', user.email);
        console.log('User Role:', user.role);
        console.log('User Hash:', user.password);
        
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Bcrypt Match Detail:', isMatch);
        
        if (isMatch) {
            console.log('✅ PASSWORD MATCHES SUCCESS');
        } else {
            console.log('❌ PASSWORD DOES NOT MATCH');
            
            // Try hashing it again and comparing to see if we can find what's wrong
            const testHash = await bcrypt.hash(password, 10);
            const reMatch = await bcrypt.compare(password, testHash);
            console.log('New hash test match:', reMatch);
        }
        
    } catch (err) {
        console.error('Error in debug script:', err);
    } finally {
        process.exit();
    }
}

debugAdmin();
