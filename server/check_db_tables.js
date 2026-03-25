const sequelize = require('./config/database');

async function checkTables() {
    try {
        const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('Tables in database:', results.map(r => r.name));

        for (const table of ['Availabilities', 'TimeSlots', 'ConsultantProfiles']) {
            try {
                const [cols] = await sequelize.query(`PRAGMA table_info(${table});`);
                console.log(`\nColumns in ${table}:`, cols.map(c => c.name));
            } catch (e) {
                console.log(`\nFailed to get info for ${table}:`, e.message);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

checkTables();
