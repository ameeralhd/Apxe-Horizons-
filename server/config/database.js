const { Sequelize } = require('sequelize');
const path = require('path');

// Ensure the storage path is correct relative to this file
// config is in server/config, so ../../ goes to server root, then we can place db there or in valid location
let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database.sqlite'),
        logging: false
    });
}

module.exports = sequelize;
