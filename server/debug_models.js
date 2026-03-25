try {
    console.log('Requiring models...');
    const models = require('./models');
    console.log('Models required successfully.');
    console.log('Keys in models:', Object.keys(models));

    const { User, ConsultantProfile, Availability } = models;

    console.log('User model:', !!User);
    console.log('ConsultantProfile model:', !!ConsultantProfile);
    console.log('Availability model:', !!Availability);

    if (ConsultantProfile && ConsultantProfile.associations) {
        console.log('ConsultantProfile associations:', Object.keys(ConsultantProfile.associations));
    }
} catch (err) {
    console.error('ERROR during model require:');
    console.error(err);
}
process.exit(0);
