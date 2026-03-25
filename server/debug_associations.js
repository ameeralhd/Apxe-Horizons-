const { ConsultantProfile, User, Availability, sequelize } = require('./models');

async function debug() {
    console.log('--- Debugging Admin Consultants ---');
    try {
        const consultants = await ConsultantProfile.findAll({
            include: [
                {
                    model: User,
                    attributes: ['name', 'email', 'role']
                },
                {
                    model: Availability
                }
            ]
        });
        console.log('Successfully fetched consultants:', consultants.length);
        console.log('Sample consultant Availability:', JSON.stringify(consultants[0].Availabilities, null, 2));
    } catch (err) {
        console.error('FAILED to fetch consultants!');
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

debug();
