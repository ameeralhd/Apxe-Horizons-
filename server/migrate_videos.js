const { sequelize } = require('./models');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.query('ALTER TABLE `VideoResources` ADD COLUMN `author` VARCHAR(255);')
            .catch(err => console.log('author column already exists or error:', err.message));

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
