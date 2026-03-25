const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User, DocumentUpload } = require('./models');

async function verifyUpload() {
    try {
        console.log('--- Verification Start ---');

        // 1. Get latest user
        const user = await User.findOne({ order: [['createdAt', 'DESC']] });
        if (!user) {
            console.error('No users found in database.');
            process.exit(1);
        }
        console.log(`Found user: ${user.email} (ID: ${user.id})`);

        // 2. Generate JWT
        const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1h' });
        console.log('Generated JWT Token successfully.');

        // 3. Create a dummy file for testing
        const dummyFilePath = path.join(__dirname, 'test_upload.txt');
        fs.writeFileSync(dummyFilePath, 'This is a test document for verification.');
        console.log('Created dummy file: test_upload.txt');

        // 4. Hit the endpoint using native fetch (Node 18+)
        // Since native fetch in node doesn't have a built-in FormData that handles file streams easily without extra steps,
        // we'll use a trick or just simulate the controller call.
        // Actually, let's try to use the API directly with a simple buffer if possible, 
        // or just use a minimal version of FormData if node has it.

        // Node 20+ has a global FormData. Let's try it.
        const formData = new FormData();
        const blob = new Blob([fs.readFileSync(dummyFilePath)], { type: 'text/plain' });
        formData.append('file', blob, 'test_upload.txt');
        formData.append('documentType', 'Test Verification');
        formData.append('category', 'scholarship');

        console.log('Sending request to http://localhost:5000/api/documents/analyze...');
        const response = await fetch('http://localhost:5000/api/documents/analyze', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(result, null, 2));

        if (response.ok && result.documentId) {
            console.log('✅ API call successful!');

            // 5. Verify database record
            const doc = await DocumentUpload.findByPk(result.documentId);
            if (doc) {
                console.log(`✅ Database record verified: ${doc.fileName} (${doc.status})`);
            } else {
                console.error('❌ Database record NOT found!');
            }
        } else {
            console.error('❌ Upload failed!');
        }

        // Cleanup
        if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);
        console.log('--- Verification End ---');
        process.exit(0);
    } catch (err) {
        console.error('Verification Error:', err);
        process.exit(1);
    }
}

verifyUpload();
