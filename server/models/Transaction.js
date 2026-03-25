const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Appointments',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending' // pending, paid, failed
    },
    invoiceId: {
        type: DataTypes.STRING,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = Transaction;
