const { DynamicContent } = require('../models');

// Get all dynamic content
exports.getDynamicContent = async (req, res) => {
    try {
        const { category, status } = req.query;
        const where = {};
        
        if (category) where.category = category;
        if (status !== undefined) where.status = status === 'true';

        const content = await DynamicContent.findAll({
            where,
            order: [['order_index', 'ASC'], ['createdAt', 'DESC']]
        });

        res.json(content);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create dynamic content
exports.createDynamicContent = async (req, res) => {
    try {
        const { title, youtube_url, category, status, order_index } = req.body;
        
        // Extract video ID
        const extractVideoId = (url) => {
            if (!url) return '';
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url.match(regex);
            return match ? match[1] : url;
        };

        const video_id = extractVideoId(youtube_url);

        const content = await DynamicContent.create({
            title,
            youtube_url,
            video_id,
            category,
            status: status !== undefined ? status : true,
            order_index: order_index || 0,
            country: req.body.country,
            official_link: req.body.official_link
        });

        res.status(201).json(content);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update dynamic content
exports.updateDynamicContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, youtube_url, category, status, order_index } = req.body;
        
        const content = await DynamicContent.findByPk(id);
        if (!content) return res.status(404).json({ message: 'Content not found' });

        if (title) content.title = title;
        if (youtube_url) {
            content.youtube_url = youtube_url;
            const extractVideoId = (url) => {
                if (!url) return '';
                const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                const match = url.match(regex);
                return match ? match[1] : url;
            };
            content.video_id = extractVideoId(youtube_url);
        }
        if (category) content.category = category;
        if (status !== undefined) content.status = status;
        if (order_index !== undefined) content.order_index = order_index;
        if (req.body.country !== undefined) content.country = req.body.country;
        if (req.body.official_link !== undefined) content.official_link = req.body.official_link;

        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete dynamic content
exports.deleteDynamicContent = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await DynamicContent.findByPk(id);
        if (!content) return res.status(404).json({ message: 'Content not found' });

        await content.destroy();
        res.json({ message: 'Content deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
