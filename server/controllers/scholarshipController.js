const { Scholarship } = require('../models');

// @route   GET /api/scholarships
// @desc    Get all scholarships
// @access  Public
exports.getAllScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.findAll({
            order: [['matchScore', 'DESC']]
        });
        res.json(scholarships);
    } catch (error) {
        console.error('Error fetching scholarships:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/scholarships/:id
// @desc    Get scholarship by ID
// @access  Public
exports.getScholarshipById = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id);
        if (!scholarship) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }
        res.json(scholarship);
    } catch (error) {
        console.error('Error fetching scholarship:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/scholarships
// @desc    Create a new scholarship
// @access  Private/Admin
exports.createScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.create(req.body);
        res.status(201).json(scholarship);
    } catch (error) {
        console.error('Error creating scholarship:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @route   PUT /api/scholarships/:id
// @desc    Update a scholarship
// @access  Private/Admin
exports.updateScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id);
        if (!scholarship) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }
        await scholarship.update(req.body);
        res.json(scholarship);
    } catch (error) {
        console.error('Error updating scholarship:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   DELETE /api/scholarships/:id
// @desc    Delete a scholarship
// @access  Private/Admin
exports.deleteScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id);
        if (!scholarship) {
            return res.status(404).json({ message: 'Scholarship not found' });
        }
        await scholarship.destroy();
        res.json({ message: 'Scholarship removed successfully' });
    } catch (error) {
        console.error('Error deleting scholarship:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
