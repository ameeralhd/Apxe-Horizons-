const DocumentUpload = require('../models/DocumentUpload');

exports.getUserDocuments = async (req, res) => {
    try {
        const documents = await DocumentUpload.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(documents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
