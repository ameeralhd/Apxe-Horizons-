const { ConsultantProfile, User, Availability, sequelize } = require('./models');

async function testQuery() {
    try {
        console.log('Starting query...');
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
        console.log('SUCCESS!');
        // console.log(JSON.stringify(consultants, null, 2));
    } catch (err) {
        console.error('QUERY FAILED!');
        console.error(err);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

testQuery();
