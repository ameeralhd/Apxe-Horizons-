const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentTemplate = sequelize.define('DocumentTemplate', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('Academic', 'Visa', 'Research', 'CV'),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    downloadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = DocumentTemplate;
