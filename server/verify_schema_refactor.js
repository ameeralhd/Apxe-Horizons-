// const fetch = require('node-fetch'); // Removed as Node 18+ has native fetch
// Using native fetch

const BASE_URL = 'http://localhost:5000/api';
let ADMIN_TOKEN = '';
let USER_TOKEN = '';
let CONSULTANT_ID = 0;

async function runTest() {
    console.log('--- Starting Schema & Double-Booking Verification ---');

    try {
        // 1. Login as Admin
        console.log('\n1. Logging in as Admin...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email: 'admin@apex.com', password: 'password123' }),
            headers: { 'Content-Type': 'application/json' }
        });
        const loginData = await loginRes.json();
        ADMIN_TOKEN = loginData.token;
        console.log('Admin logged in.');

        // 2. Fetch Consultants to get ID
        const consRes = await fetch(`${BASE_URL}/admin/consultants`, {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        const consultants = await consRes.json();
        CONSULTANT_ID = consultants[0].id; // Target first consultant
        console.log(`Targeting Consultant ID: ${CONSULTANT_ID}`);

        // 3. Set Availability (Monday 09:00 - 10:00)
        console.log('\n2. Setting Availability (Monday 09:00 - 10:00)...');
        const updatePayload = {
            hourly_rate: 150.00,
            availability: [
                { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' }
            ]
        };
        const updateRes = await fetch(`${BASE_URL}/admin/consultants/${CONSULTANT_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            },
            body: JSON.stringify(updatePayload)
        });

        if (!updateRes.ok) throw new Error('Failed to update availability');
        console.log('Availability updated.');

        // 4. Register/Login as User
        console.log('\n3. Logging in as User...');
        // Reuse existing user or create temp? Let's assume seed user exists 'john@example.com' 'password123'
        const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email: 'john@example.com', password: 'password123' }),
            headers: { 'Content-Type': 'application/json' }
        });

        // If fail, register temp
        if (!userLoginRes.ok) {
            console.log('User login failed, registering temp user...');
            const regRes = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                body: JSON.stringify({ name: 'Test User', email: 'testuser' + Date.now() + '@test.com', password: 'password123' }),
                headers: { 'Content-Type': 'application/json' }
            });
            const regData = await regRes.json();
            USER_TOKEN = regData.token;
        } else {
            const userData = await userLoginRes.json();
            USER_TOKEN = userData.token;
        }
        console.log('User logged in.');

        // 5. Attempt Booking (Valid Slot: Next Monday 09:00)
        // Calculate next Monday
        const d = new Date();
        d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);
        const nextMonday = d.toISOString().split('T')[0];

        console.log(`\n4. Booking Valid Slot: ${nextMonday} 09:00...`);
        const bookingPayload = {
            consultantId: CONSULTANT_ID,
            date: nextMonday,
            time: '09:00:00',
            topic: 'Test Booking'
        };

        const bookRes1 = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${USER_TOKEN}`
            },
            body: JSON.stringify(bookingPayload)
        });

        if (!bookRes1.ok) {
            const err = await bookRes1.json();
            throw new Error(`Booking failed: ${err.message}`);
        }
        console.log('Booking 1 Successful!');

        // 6. Attempt Double Booking (Same Slot)
        console.log('\n5. Attempting Double Booking (Should Fail)...');
        const bookRes2 = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${USER_TOKEN}`
            },
            body: JSON.stringify(bookingPayload)
        });

        if (bookRes2.ok) {
            throw new Error('Double Booking Allowed! Verification FAILED.');
        } else {
            const err = await bookRes2.json();
            console.log(`Booking 2 Rejected as expected: ${err.message}`);
        }

        console.log('\n--- Verification SUCCESS ---');

    } catch (err) {
        console.error('\n!!! Verification FAILED !!!', err);
        process.exit(1);
    }
}

runTest();
