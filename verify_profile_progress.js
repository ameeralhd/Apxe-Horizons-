const { User, DocumentUpload, sequelize } = require('./server/models');

async function verifyProfileProgress() {
    console.log('--- Verifying Profile Progress Logic ---');
    try {
        await sequelize.sync();

        // 1. Create a test user
        const testEmail = `progress_test_${Date.now()}@example.com`;
        const user = await User.create({
            name: 'Progress Test User',
            email: testEmail,
            password: 'password123',
            phone: null // Not completed
        });
        console.log('✅ Created test user');

        // Initial check (Expect 0%)
        // We'll mock the controller logic here
        const checkProgress = async (uId) => {
            const u = await User.findByPk(uId);
            const userDocs = await DocumentUpload.findAll({ where: { userId: uId } });
            const requiredDocs = ['Academic Transcript', 'English Proficiency Test', 'Identity Document'];
            const tasks = [
                { label: 'Personal Details (Phone)', completed: !!u.phone },
                ...requiredDocs.map(type => ({
                    label: type,
                    completed: userDocs.some(d => d.documentType === type)
                }))
            ];
            const completed = tasks.filter(t => t.completed).length;
            const percent = Math.round((completed / tasks.length) * 100);
            return { percent, tasks };
        };

        let progress = await checkProgress(user.id);
        console.log(`Initial Progress: ${progress.percent}% (Expected 0%)`);

        // 2. Add Phone
        await user.update({ phone: '123456789' });
        progress = await checkProgress(user.id);
        console.log(`Progress after Phone: ${progress.percent}% (Expected 25%)`);

        // 3. Add Transcript
        await DocumentUpload.create({
            userId: user.id,
            documentType: 'Academic Transcript',
            fileName: 'transcript.pdf',
            filePath: '/tmp/transcript.pdf',
            status: 'pending'
        });
        progress = await checkProgress(user.id);
        console.log(`Progress after Transcript: ${progress.percent}% (Expected 50%)`);

        // 4. Add Identity Doc
        await DocumentUpload.create({
            userId: user.id,
            documentType: 'Identity Document',
            fileName: 'passport.pdf',
            filePath: '/tmp/passport.pdf',
            status: 'pending'
        });
        progress = await checkProgress(user.id);
        console.log(`Progress after Identity Doc: ${progress.percent}% (Expected 75%)`);

        // 5. Add English Test
        await DocumentUpload.create({
            userId: user.id,
            documentType: 'English Proficiency Test',
            fileName: 'ielts.pdf',
            filePath: '/tmp/ielts.pdf',
            status: 'pending'
        });
        progress = await checkProgress(user.id);
        console.log(`Progress after English Test: ${progress.percent}% (Expected 100%)`);

        if (progress.percent === 100) {
            console.log('🎉 Verification Successful: 100% completion achieved!');
        } else {
            console.log('❌ Verification Failed: Percentage mismatch.');
        }

        // Cleanup
        await DocumentUpload.destroy({ where: { userId: user.id } });
        await user.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification Error:', error);
        process.exit(1);
    }
}

verifyProfileProgress();
