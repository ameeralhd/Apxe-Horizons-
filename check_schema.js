const { Appointment } = require('./server/models');

async function checkSchema() {
    try {
        const columns = await Appointment.sequelize.getQueryInterface().describeTable('Appointments');
        console.log('Appointments Table Schema:');
        console.log(JSON.stringify(columns, null, 2));
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
