const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConsultantProfile = sequelize.define('ConsultantProfile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    expertise: {
        type: DataTypes.JSON, // Array of strings
        defaultValue: []
    },
    availability: {
        type: DataTypes.JSON, // e.g. { "Monday": ["09:00", "17:00"] }
        defaultValue: {}
    },
    instagram: {
        type: DataTypes.STRING,
        allowNull: true
    },
    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 5.0
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hourly_rate: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = ConsultantProfile;
