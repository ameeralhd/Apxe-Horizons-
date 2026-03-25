const { ConsultantProfile, User } = require('./server/models');

async function listConsultants() {
    try {
        const consultants = await ConsultantProfile.findAll({
            include: [{ model: User, attributes: ['name', 'email'] }]
        });
        console.log('Available Consultants:');
        consultants.forEach(c => {
            console.log(`ID: ${c.id}, User ID: ${c.userId}, Name: ${c.User.name}, Email: ${c.User.email}`);
        });
    } catch (err) {
        console.error('Error listing consultants:', err);
    } finally {
        process.exit();
    }
}

listConsultants();
