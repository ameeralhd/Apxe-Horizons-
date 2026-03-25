const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Availability = sequelize.define('Availability', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    consultantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dayOfWeek: {
        type: DataTypes.STRING, // "Monday", "Tuesday", etc.
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Availability;
