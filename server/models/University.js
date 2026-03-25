const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const University = sequelize.define('University', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    officialLink: {
        type: DataTypes.STRING,
        allowNull: true
    },
    videoId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    featuredPitch: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Standard'
    }
}, {
    timestamps: true
});

module.exports = University;
