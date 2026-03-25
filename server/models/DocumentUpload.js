const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentUpload = sequelize.define('DocumentUpload', {
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
    documentType: {
        type: DataTypes.STRING,
        allowNull: false // e.g., 'Academic Transcript', 'Passport Copy'
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileSize: {
        type: DataTypes.INTEGER, // in bytes
        allowNull: true
    },
    fileType: {
        type: DataTypes.STRING, // MIME type
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
    },
    category: {
        type: DataTypes.ENUM('scholarship', 'visa', 'job'),
        allowNull: true
    },
    urgency: {
        type: DataTypes.ENUM('Normal', 'High', 'Urgent'),
        defaultValue: 'Normal'
    },
    adminNotes: {
        type: DataTypes.TEXT, // Internal notes, not visible to student
        allowNull: true
    },
    customerFeedback: {
        type: DataTypes.TEXT, // Feedback visible to student
        allowNull: true
    },
    rejectionReason: {
        type: DataTypes.TEXT, // Specific rejection reason
        allowNull: true
    },
    reviewedBy: {
        type: DataTypes.INTEGER, // Admin user ID
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = DocumentUpload;
