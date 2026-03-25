const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DynamicContent = sequelize.define('DynamicContent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    category: {
        type: DataTypes.ENUM('university_discovery', 'success_story'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    youtube_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    video_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true
    },
    official_link: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'dynamic_content',
    timestamps: true
});

module.exports = DynamicContent;
