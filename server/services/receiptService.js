const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceipt = async (transaction, student, consultant, appointment) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const fileName = `Receipt-INV-${transaction.id + 1000}.pdf`;
            const filePath = path.join(__dirname, '../temp', fileName);

            // Ensure temp directory exists
            if (!fs.existsSync(path.join(__dirname, '../temp'))) {
                fs.mkdirSync(path.join(__dirname, '../temp'));
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header - Large Apex Horizons Brand
            doc.fillColor('#1E293B')
                .fontSize(24)
                .font('Helvetica-Bold')
                .text('APEX HORIZONS', { align: 'center' })
                .fontSize(10)
                .font('Helvetica')
                .text('GLOBAL ACADEMIC EXCELLENCE', { align: 'center' })
                .moveDown(2);

            // Divider
            doc.moveTo(50, 110)
                .lineTo(545, 110)
                .strokeColor('#E2E8F0')
                .stroke();

            // Invoice Info
            doc.moveDown(2);
            doc.fillColor('#64748B')
                .fontSize(10)
                .text('INVOICE ID:', 50, 140)
                .fillColor('#1E293B')
                .font('Helvetica-Bold')
                .text(`#AH-${transaction.id + 1000}`, 130, 140)
                .font('Helvetica')
                .fillColor('#64748B')
                .text('DATE:', 350, 140)
                .fillColor('#1E293B')
                .font('Helvetica-Bold')
                .text(new Date().toLocaleDateString(), 430, 140);

            // Student & Expert Info
            doc.moveDown(2);
            doc.fillColor('#94A3B8')
                .fontSize(9)
                .text('BILLED TO:', 50, 180)
                .text('SERVICE PROVIDER:', 350, 180);

            doc.fillColor('#1E293B')
                .fontSize(11)
                .font('Helvetica-Bold')
                .text(student.name, 50, 195)
                .font('Helvetica')
                .fontSize(10)
                .text(student.email, 50, 210)
                .text('Verified Scholar', 50, 225);

            doc.font('Helvetica-Bold')
                .text('Apex Horizons Group', 350, 195)
                .font('Helvetica')
                .text(consultant.User.name, 350, 210)
                .text('Expert Consultant', 350, 225);

            // Summary Table Header
            doc.moveDown(4);
            doc.rect(50, 280, 495, 30)
                .fill('#F8FAFC');

            doc.fillColor('#1E293B')
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('DESCRIPTION', 60, 290)
                .text('SCHEDULE', 250, 290)
                .text('AMOUNT', 480, 290, { width: 60, align: 'right' });

            // Table Content
            doc.font('Helvetica')
                .fillColor('#475569')
                .text('Expert Strategy Consultation', 60, 325)
                .text(`${appointment.date} @ ${appointment.time}`, 250, 325)
                .fillColor('#1E293B')
                .font('Helvetica-Bold')
                .text(`$${transaction.amount}`, 480, 325, { width: 60, align: 'right' });

            // Bottom Divider
            doc.moveTo(50, 355)
                .lineTo(545, 355)
                .strokeColor('#F1F5F9')
                .stroke();

            // Total Section
            doc.moveDown(4);
            doc.fillColor('#64748B')
                .text('Subtotal:', 380, 380)
                .text('$0.00', 480, 380, { width: 60, align: 'right' })
                .text('Tax (0%):', 380, 400)
                .text('$0.00', 480, 400, { width: 60, align: 'right' });

            doc.fillColor('#0D9488')
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Total Paid:', 380, 430)
                .text(`$${transaction.amount}`, 480, 430, { width: 60, align: 'right' });

            // Footer / Message
            doc.moveDown(6);
            doc.fillColor('#2DD4BF')
                .font('Helvetica-Bold')
                .fontSize(12)
                .text('Thank you for choosing Apex Horizons.', 50, 520, { align: 'center' });

            doc.fillColor('#94A3B8')
                .font('Helvetica')
                .fontSize(8)
                .text('This is a computer-generated document. No signature is required.', 50, 540, { align: 'center' });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateReceipt };
