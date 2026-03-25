const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    benefits: {
        type: DataTypes.JSON, // Stores array of strings
        defaultValue: []
    },
    prerequisites: {
        type: DataTypes.JSON, // Stores array of strings
        defaultValue: []
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER, // in minutes
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Service;
