const { ConsultantProfile } = require('./server/models');

async function checkCols() {
    try {
        const columns = await ConsultantProfile.sequelize.getQueryInterface().describeTable('ConsultantProfiles');
        console.log('Columns in ConsultantProfiles table:', Object.keys(columns));
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        process.exit();
    }
}

checkCols();
