const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    serviceType: {
        type: DataTypes.STRING,
        allowNull: true // Made optional as we now have serviceId
    },
    serviceId: {
        type: DataTypes.INTEGER,
        allowNull: true // Allow null for general inquiries if needed, or make false later
    },
    consultantId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    slotId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // confirmed, completed, cancelled
    },
    notes: {
        type: DataTypes.TEXT
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General Consultation'
    },
    documentPath: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    meetingLink: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Appointment;
