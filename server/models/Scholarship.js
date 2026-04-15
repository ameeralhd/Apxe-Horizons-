const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Scholarship = sequelize.define('Scholarship', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    university: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    flag: {
        type: DataTypes.STRING,
        allowNull: false
    },
    field: {
        type: DataTypes.STRING,
        allowNull: false
    },
    level: {
        type: DataTypes.STRING,
        allowNull: false // e.g. "Masters", "Bachelors"
    },
    fundingType: {
        type: DataTypes.STRING,
        allowNull: false // e.g. "Full Ride", "Partial", "Tuition Only"
    },
    amount: {
        type: DataTypes.STRING, // e.g., "$78,000 / year"
        allowNull: false
    },
    amountNum: {
        type: DataTypes.INTEGER, // e.g., 78000 for sorting/filtering
        allowNull: false
    },
    deadline: {
        type: DataTypes.STRING,
        allowNull: false
    },
    matchScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 80
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=80&q=80'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Scholarship;
