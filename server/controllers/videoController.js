const { VideoResource } = require('../models');

exports.getVideoResources = async (req, res) => {
    try {
        const { category } = req.query;
        const queryOptions = {};

        if (category) {
            queryOptions.where = { category };
        }

        const videos = await VideoResource.findAll(queryOptions);
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching video resources', error: error.message });
    }
};

exports.addVideoResource = async (req, res) => {
    try {
        const video = await VideoResource.create(req.body);
        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ message: 'Error creating video resource', error: error.message });
    }
};
