const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TimeSlot = sequelize.define('TimeSlot', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    consultantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    isBooked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['consultantId', 'date', 'startTime']
        }
    ]
});

module.exports = TimeSlot;
