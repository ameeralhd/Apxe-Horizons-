const { Resource } = require('../models');
const { generateAdmissionsGuide } = require('../utils/pdfGenerator');

exports.downloadAdmissionsGuide = async (req, res) => {
    try {
        // Find or create the resource entry for tracking
        const [resource] = await Resource.findOrCreate({
            where: { name: '2026 Global Admissions Guide' },
            defaults: {
                description: 'Complete guide for international student admissions in 2026.'
            }
        });

        // Increment download count
        await resource.increment('downloadCount');

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Apex_Horizons_2026_Admissions_Guide.pdf');

        // Generate and stream PDF
        generateAdmissionsGuide(res);

    } catch (error) {
        console.error('Error downloading guide:', error);
        res.status(500).json({ message: 'Error generating guide', error: error.message });
    }
};

exports.getResourceStats = async (req, res) => {
    try {
        const stats = await Resource.findAll({
            attributes: ['name', 'downloadCount', 'updatedAt']
        });
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
