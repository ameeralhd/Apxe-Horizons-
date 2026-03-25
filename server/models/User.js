const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user' // user, admin, expert
    },
    verificationCategory: {
        type: DataTypes.STRING,
        defaultValue: 'scholarship'
    },
    verificationType: {
        type: DataTypes.STRING,
        defaultValue: 'Undergraduate'
    },
    verificationCountry: {
        type: DataTypes.STRING,
        defaultValue: 'USA'
    },
    verificationStatus: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // 0-100 percentage
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verificationExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = User;
