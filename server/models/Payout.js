const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payout = sequelize.define('Payout', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    consultantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    consultantShare: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    platformShare: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // pending, processed, paid
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Payout;
