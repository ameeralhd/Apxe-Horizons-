const fs = require('fs');
const { generateAdmissionsGuide } = require('./utils/pdfGenerator');

const out = fs.createWriteStream('test_guide.pdf');
generateAdmissionsGuide(out);

out.on('finish', () => {
    console.log('PDF generated successfully: test_guide.pdf');
    process.exit(0);
});

out.on('error', (err) => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
