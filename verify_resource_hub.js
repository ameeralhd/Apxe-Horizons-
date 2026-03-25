const { sequelize, DocumentTemplate, User, TemplateFavorite } = require('./server/models');
const fs = require('fs');
const path = require('path');

async function verifyTemplates() {
    try {
        console.log('--- Starting Resource Hub Verification ---');
        
        // 1. Sync DB
        await sequelize.sync();
        console.log('✅ DB Synced');

        // 2. Create Dummy Admin and User if not exist (using existing ones if possible)
        let admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) {
            admin = await User.create({ name: 'Test Admin', email: `admin_${Date.now()}@test.com`, password: 'password', role: 'admin' });
        }
        
        let user = await User.findOne({ where: { role: 'user' } });
        if (!user) {
            user = await User.create({ name: 'Test User', email: `user_${Date.now()}@test.com`, password: 'password', role: 'user' });
        }
        console.log('✅ Admin and User identified');

        // 3. Create a Template
        const template = await DocumentTemplate.create({
            name: 'Verification Test Template',
            category: 'CV',
            url: '/uploads/templates/test.pdf',
            fileType: 'PDF'
        });
        console.log('✅ Template created:', template.name);

        // 4. Test Fetching (User View)
        const allTemplates = await DocumentTemplate.findAll();
        if (allTemplates.length > 0) {
            console.log(`✅ Found ${allTemplates.length} templates`);
        } else {
            throw new Error('Templates not found after creation');
        }

        // 5. Test Favorite Logic
        await TemplateFavorite.create({ userId: user.id, templateId: template.id });
        const fav = await TemplateFavorite.findOne({ where: { userId: user.id, templateId: template.id } });
        if (fav) {
            console.log('✅ Favorite logic verified');
        } else {
            throw new Error('Favorite failed to save');
        }

        // 6. Test Category Filter Logic
        const cvTemplates = await DocumentTemplate.findAll({ where: { category: 'CV' } });
        if (cvTemplates.length > 0) {
            console.log('✅ Category filtering logic verified');
        } else {
            throw new Error('Category filtering failed');
        }

        // 7. Cleanup (Optional but good for repetitive tests)
        await template.destroy();
        console.log('✅ Template deleted (Cleanup)');

        console.log('--- Verification Successful ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verifyTemplates();
