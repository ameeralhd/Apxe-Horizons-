const { Sequelize } = require('sequelize');
const path = require('path');

// Ensure the storage path is correct relative to this file
// config is in server/config, so ../../ goes to server root, then we can place db there or in valid location
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

module.exports = sequelize;
