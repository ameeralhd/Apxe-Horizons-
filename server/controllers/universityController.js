const { University } = require('../models');
const { Op } = require('sequelize');

exports.getUniversities = async (req, res) => {
    try {
        const { country, category } = req.query;
        const queryOptions = { where: {} };

        if (country && country !== 'All') {
            queryOptions.where.country = country;
        }

        if (category) {
            queryOptions.where.category = category;
        }

        const universities = await University.findAll(queryOptions);
        res.status(200).json(universities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching universities', error: error.message });
    }
};

exports.addUniversity = async (req, res) => {
    try {
        const university = await University.create(req.body);
        res.status(201).json(university);
    } catch (error) {
        res.status(500).json({ message: 'Error creating university', error: error.message });
    }
};

exports.getSpotlightUniversity = async (req, res) => {
    try {
        const featuredUnis = await University.findAll({
            where: { isFeatured: true }
        });

        if (!featuredUnis || featuredUnis.length === 0) {
            return res.status(404).json({ message: 'No spotlight university found' });
        }

        // Simple rotation logic based on week of the year
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

        const index = weekNumber % featuredUnis.length;
        const spotlight = featuredUnis[index];

        res.status(200).json(spotlight);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching spotlight university', error: error.message });
    }
};
