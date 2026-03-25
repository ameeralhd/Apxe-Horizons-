const { Service } = require('../models');

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createService = async (req, res) => {
    try {
        // ideally add admin check here or in middleware
        const { title, description, benefits, prerequisites, price, duration } = req.body;

        const service = await Service.create({
            title,
            description,
            benefits,
            prerequisites,
            price,
            duration
        });

        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
