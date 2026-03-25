const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TemplateFavorite = sequelize.define('TemplateFavorite', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    templateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'DocumentTemplates',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'templateId']
        }
    ]
});

module.exports = TemplateFavorite;
