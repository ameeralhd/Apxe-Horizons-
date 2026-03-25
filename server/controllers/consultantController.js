const { ConsultantProfile, User, Availability } = require('../models');
const { Op } = require('sequelize');

// Public: Get all active consultants
exports.getAllConsultants = async (req, res) => {
    try {
        const consultants = await ConsultantProfile.findAll({
            where: { isActive: { [Op.ne]: false } },
            include: [
                {
                    model: User,
                    attributes: ['name', 'email']
                },
                {
                    model: Availability
                }
            ]
        });
        const lastUpdated = await ConsultantProfile.max('updatedAt');
        res.setHeader('X-Last-Updated', lastUpdated || new Date().toISOString());
        res.json(consultants);
    } catch (err) {
        console.error('API Error (getAllConsultants):', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Admin: Get ALL consultants (including inactive)
exports.adminGetAllConsultants = async (req, res) => {
    try {
        console.log('Fetching all consultants with associations...');
        const consultants = await ConsultantProfile.findAll({
            include: [
                {
                    model: User,
                    attributes: ['name', 'email', 'role']
                },
                {
                    model: Availability
                }
            ]
        });
        console.log(`Found ${consultants.length} consultants.`);
        res.json(consultants);
    } catch (err) {
        console.error('API Error (adminGetAllConsultants):', err);
        res.status(500).json({ message: 'Server Error', error: err.message, stack: err.stack });
    }
};

// Admin: Update Consultant Profile & Settings
exports.adminUpdateConsultant = async (req, res) => {
    try {
        const { id } = req.params;
        const { bio, expertise, availability, title, hourly_rate, isActive, profileImage, rating, reviewCount, isOnline } = req.body;

        let consultant = await ConsultantProfile.findByPk(id);

        if (!consultant) {
            return res.status(404).json({ message: 'Consultant not found' });
        }

        // Update fields if provided
        if (bio !== undefined) consultant.bio = bio;
        if (expertise !== undefined) consultant.expertise = expertise;
        if (title !== undefined) consultant.title = title;
        if (hourly_rate !== undefined) consultant.hourly_rate = hourly_rate;
        if (isActive !== undefined) consultant.isActive = isActive;
        if (profileImage !== undefined) consultant.profileImage = profileImage;
        if (rating !== undefined) consultant.rating = rating;
        if (reviewCount !== undefined) consultant.reviewCount = reviewCount;
        if (isOnline !== undefined) consultant.isOnline = isOnline;

        await consultant.save();

        // Handle Availability Update (Replaces existing availability for now)
        if (availability) {
            // Case 1: Availability is an Object (from UI: { "Monday": ["09:00", "17:00"] })
            if (typeof availability === 'object' && !Array.isArray(availability)) {
                consultant.availability = availability; // Sync the JSON field

                // Convert to Array for relational table update
                const availabilityRecords = Object.entries(availability).map(([day, slots]) => ({
                    consultantId: id,
                    dayOfWeek: day,
                    startTime: slots[0],
                    endTime: slots[1]
                }));

                await Availability.destroy({ where: { consultantId: id } });
                await Availability.bulkCreate(availabilityRecords);
            }
            // Case 2: Availability is an Array (legacy or direct relational update)
            else if (Array.isArray(availability)) {
                await Availability.destroy({ where: { consultantId: id } });
                const availabilityRecords = availability.map(slot => ({
                    consultantId: id,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                }));
                await Availability.bulkCreate(availabilityRecords);

                // Re-sync the JSON field from the array
                const availObj = {};
                availability.forEach(slot => {
                    availObj[slot.dayOfWeek] = [slot.startTime, slot.endTime];
                });
                consultant.availability = availObj;
            }
        }

        // Fetch updated with User and Availability data
        const updatedConsultant = await ConsultantProfile.findByPk(id, {
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Availability }
            ]
        });

        res.json(updatedConsultant);
    } catch (err) {
        console.error('API Error (adminUpdateConsultant):', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Consultant: Get own profile
exports.getOwnProfile = async (req, res) => {
    try {
        const consultant = await ConsultantProfile.findOne({
            where: { userId: req.user.id },
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Availability }
            ]
        });

        if (!consultant) {
            return res.status(404).json({ message: 'Consultant profile not found' });
        }

        res.json(consultant);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Consultant: Update own profile
exports.updateOwnProfile = async (req, res) => {
    try {
        const { bio, expertise, availability, title, profileImage } = req.body;

        let consultant = await ConsultantProfile.findOne({ where: { userId: req.user.id } });

        if (!consultant) {
            return res.status(404).json({ message: 'Consultant profile not found' });
        }

        // Update fields
        if (bio !== undefined) consultant.bio = bio;
        if (expertise !== undefined) consultant.expertise = expertise;
        if (title !== undefined) consultant.title = title;
        if (profileImage !== undefined) consultant.profileImage = profileImage;

        await consultant.save();

        // Handle Availability
        if (availability && Array.isArray(availability)) {
            await Availability.destroy({ where: { consultantId: consultant.id } });
            const availabilityRecords = availability.map(slot => ({
                consultantId: consultant.id,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime
            }));
            await Availability.bulkCreate(availabilityRecords);
        }

        const updated = await ConsultantProfile.findOne({
            where: { userId: req.user.id },
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Availability }
            ]
        });

        res.json(updated);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin: Toggle Active Status (Quick Action)
exports.adminToggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const consultant = await ConsultantProfile.findByPk(id);
        if (!consultant) {
            return res.status(404).json({ message: 'Consultant not found' });
        }

        consultant.isActive = isActive;
        await consultant.save();

        res.json({ message: `Consultant ${isActive ? 'activated' : 'deactivated'}`, consultant });
    } catch (err) {
        console.error('API Error (adminToggleStatus):', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
