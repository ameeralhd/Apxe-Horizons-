const sequelize = require('./config/database');
const queryInterface = sequelize.getQueryInterface();

async function checkCols() {
    try {
        const tableInfo = await queryInterface.describeTable('Users');
        console.log('Columns in Users table:', Object.keys(tableInfo));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkCols();
