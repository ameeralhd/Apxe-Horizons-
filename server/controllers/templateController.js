const { DocumentTemplate, TemplateFavorite } = require('../models');
const path = require('path');
const fs = require('fs');

// Get all templates (User view)
exports.getAllTemplates = async (req, res) => {
    try {
        const { category, search } = req.query;
        const where = {};
        
        if (category && category !== 'All') {
            where.category = category;
        }
        
        if (search) {
            const { Op } = require('sequelize');
            where.name = { [Op.like]: `%${search}%` };
        }

        const templates = await DocumentTemplate.findAll({
            where,
            include: req.user ? [
                {
                    model: TemplateFavorite,
                    where: { userId: req.user.id },
                    required: false
                }
            ] : [],
            order: [['createdAt', 'DESC']]
        });

        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ message: 'Failed to fetch templates' });
    }
};

// Create template (Admin)
exports.createTemplate = async (req, res) => {
    try {
        const { name, category } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }

        const url = `/uploads/templates/${req.file.filename}`;
        const fileType = path.extname(req.file.originalname).substring(1).toUpperCase();

        const template = await DocumentTemplate.create({
            name,
            category,
            url,
            fileType
        });

        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ message: 'Failed to create template' });
    }
};

// Update template (Admin)
exports.updateTemplate = async (req, res) => {
    try {
        const { name, category } = req.body;
        const template = await DocumentTemplate.findByPk(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        await template.update({ name, category });
        res.json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ message: 'Failed to update template' });
    }
};

// Delete template (Admin)
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await DocumentTemplate.findByPk(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Delete file from disk
        const filePath = path.join(__dirname, '../public', template.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await template.destroy();
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ message: 'Failed to delete template' });
    }
};

// Toggle Favorite
exports.toggleFavorite = async (req, res) => {
    try {
        const { id: templateId } = req.params;
        const userId = req.user.id;

        const favorite = await TemplateFavorite.findOne({
            where: { userId, templateId }
        });

        if (favorite) {
            await favorite.destroy();
            res.json({ isFavorite: false });
        } else {
            await TemplateFavorite.create({ userId, templateId });
            res.json({ isFavorite: true });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Failed to toggle favorite' });
    }
};
