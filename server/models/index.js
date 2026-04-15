const sequelize = require('../config/database');
const User = require('./User');
const Appointment = require('./Appointment');
const Service = require('./Service');
const ConsultantProfile = require('./ConsultantProfile');
const DocumentUpload = require('./DocumentUpload');
const University = require('./University');
const News = require('./News');
const Availability = require('./Availability');
const TimeSlot = require('./TimeSlot');
const Review = require('./Review');
const VideoResource = require('./VideoResource');
const DynamicContent = require('./DynamicContent');
const Payout = require('./Payout');
const Transaction = require('./Transaction');
const Resource = require('./Resource');
const DocumentTemplate = require('./DocumentTemplate');
const TemplateFavorite = require('./TemplateFavorite');
const Scholarship = require('./Scholarship');

// User Associations
User.hasMany(Appointment, { foreignKey: 'userId' });
User.hasOne(ConsultantProfile, { foreignKey: 'userId' });
User.hasMany(DocumentUpload, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId' });
User.hasMany(Transaction, { foreignKey: 'userId' });
User.hasMany(TemplateFavorite, { foreignKey: 'userId' });

// Consultant Associations
ConsultantProfile.belongsTo(User, { foreignKey: 'userId' });
ConsultantProfile.hasMany(Appointment, { foreignKey: 'consultantId' });
ConsultantProfile.hasMany(Availability, { foreignKey: 'consultantId' });
ConsultantProfile.hasMany(TimeSlot, { foreignKey: 'consultantId' });
ConsultantProfile.hasMany(Review, { foreignKey: 'consultantId' });
ConsultantProfile.hasMany(Payout, { foreignKey: 'consultantId' });

// Service Associations
Service.hasMany(Appointment, { foreignKey: 'serviceId' });

// TimeSlot Associations
TimeSlot.belongsTo(ConsultantProfile, { foreignKey: 'consultantId' });
TimeSlot.hasOne(Appointment, { foreignKey: 'slotId' });

// Review Associations
Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(ConsultantProfile, { foreignKey: 'consultantId' });
Review.belongsTo(Appointment, { foreignKey: 'bookingId' });

// Appointment Associations
Appointment.belongsTo(User, { foreignKey: 'userId' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId' });
Appointment.belongsTo(ConsultantProfile, { foreignKey: 'consultantId' });
Appointment.belongsTo(TimeSlot, { foreignKey: 'slotId' });
Appointment.hasOne(Review, { foreignKey: 'bookingId' });
Appointment.hasOne(Payout, { foreignKey: 'appointmentId' });
Appointment.hasOne(Transaction, { foreignKey: 'appointmentId' });

// Payout Associations
Payout.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Payout.belongsTo(ConsultantProfile, { foreignKey: 'consultantId' });

// Transaction Associations
Transaction.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

// DocumentUpload Associations
DocumentUpload.belongsTo(User, { foreignKey: 'userId' });
DocumentUpload.belongsTo(User, { as: 'Reviewer', foreignKey: 'reviewedBy' });

// Template Associations
DocumentTemplate.hasMany(TemplateFavorite, { foreignKey: 'templateId' });
TemplateFavorite.belongsTo(User, { foreignKey: 'userId' });
TemplateFavorite.belongsTo(DocumentTemplate, { foreignKey: 'templateId' });

module.exports = {
    sequelize,
    User,
    Appointment,
    Service,
    ConsultantProfile,
    DocumentUpload,
    Availability,
    TimeSlot,
    Review,
    University,
    News,
    VideoResource,
    DynamicContent,
    Payout,
    Transaction,
    Resource,
    DocumentTemplate,
    TemplateFavorite,
    Scholarship
};
