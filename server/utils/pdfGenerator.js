const PDFDocument = require('pdfkit');

/**
 * Generates the 2026 Global Admissions Guide PDF
 * @param {NodeJS.WritableStream} stream - The stream to write the PDF to
 */
function generateAdmissionsGuide(stream) {
    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(stream);

    // --- COVER PAGE ---
    doc.fillColor('#1E293B')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('Your Path to Global Excellence:', { align: 'center' });

    doc.moveDown(0.2);

    doc.fillColor('#2DD4BF')
        .fontSize(32)
        .text('2026 International Student Admissions Guide', { align: 'center' });

    doc.moveDown(1.5);

    doc.fillColor('#64748B')
        .fontSize(16)
        .font('Helvetica')
        .text('Presented by Apex Horizons', { align: 'center' });

    // Minimalist Silhouette (Placeholder or drawing)
    doc.moveDown(4);
    doc.circle(doc.page.width / 2, doc.y, 40)
        .lineWidth(2)
        .stroke('#E2E8F0');

    doc.fontSize(12)
        .text('Explore. Apply. Succeed.', { align: 'center' });

    doc.addPage();

    // --- SECTION 1: THE MASTER CHECKLIST ---
    doc.fillColor('#1E293B')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Section 1: The Master Checklist');

    doc.moveDown();

    const checklist = [
        { item: 'Passport', desc: 'Valid for at least 18 months.' },
        { item: 'Transcripts', desc: 'Certified English/Turkish/Chinese translations of high school/university grades.' },
        { item: 'Language Proficiency', desc: 'Current scores for IELTS (6.0+), TOEFL (80+), or HSK (for China).' },
        { item: 'Statement of Purpose', desc: 'A 500-word essay on why you chose this specific country and university.' },
        { item: 'Recommendation Letters', desc: 'At least two letters from previous professors or mentors.' }
    ];

    checklist.forEach(c => {
        doc.fillColor('#1E293B').fontSize(14).font('Helvetica-Bold').text(`• ${c.item}`);
        doc.fillColor('#64748B').fontSize(12).font('Helvetica').text(c.desc, { indent: 15 });
        doc.moveDown(0.5);
    });

    doc.moveDown(2);

    // --- SECTION 2: REGIONAL SPECIFICS ---
    doc.fillColor('#1E293B')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Section 2: Regional Specifics');

    doc.moveDown();

    const regions = [
        { name: 'Malaysia', info: 'Requires "Genuine Student" (GS) assessment and EMGS visa approval.' },
        { name: 'Turkey', info: 'Focus on the YÖS exam or SAT scores for top state universities.' },
        { name: 'China', info: 'Look for the CSC Scholarship (Chinese Government Scholarship) deadlines in March.' },
        { name: 'Saudi Arabia', info: 'Excellent full-ride scholarship opportunities for Islamic studies and STEM.' }
    ];

    regions.forEach(r => {
        doc.fillColor('#2DD4BF').fontSize(14).font('Helvetica-Bold').text(r.name);
        doc.fillColor('#64748B').fontSize(12).font('Helvetica').text(r.info);
        doc.moveDown(0.5);
    });

    doc.addPage();

    // --- SECTION 3: TIMELINE (THE 12-MONTH PLAN) ---
    doc.fillColor('#1E293B')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Section 3: Timeline (The 12-Month Plan)');

    doc.moveDown();

    const timeline = [
        { phase: 'Month 1-3', task: 'Research & Standardized Testing.' },
        { phase: 'Month 4-6', task: 'Document Verification with Apex Horizons.' },
        { phase: 'Month 7-9', task: 'Application Submission & Interview Prep.' },
        { phase: 'Month 10-12', task: 'Visa Processing & Pre-departure Orientation.' }
    ];

    timeline.forEach(t => {
        doc.fillColor('#1E293B').fontSize(14).font('Helvetica-Bold').text(t.phase);
        doc.fillColor('#64748B').fontSize(12).font('Helvetica').text(t.task);
        doc.moveDown(0.5);
    });

    doc.end();
}

module.exports = { generateAdmissionsGuide };
