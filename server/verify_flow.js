// using global fetch (Node 18+)

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
    console.log('--- Starting Verification Test ---');

    // 1. Register User
    console.log('\n1. Registering User...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Test', lastName: 'User', email: `test${Date.now()}@user.com`, password: 'password123', phone: '1234567890' })
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) throw new Error(`Register failed: ${JSON.stringify(registerData)}`);
    const userToken = registerData.token;
    console.log('User registered. Token acquired.');

    // 2. Get Services
    console.log('\n2. Fetching Services...');
    const servicesRes = await fetch(`${BASE_URL}/services`);
    const services = await servicesRes.json();
    if (services.length === 0) throw new Error('No services found');
    console.log(`Found ${services.length} services.`);
    const serviceId = services[0].id;

    // 3. Get Consultants
    console.log('\n3. Fetching Consultants...');
    const consultantsRes = await fetch(`${BASE_URL}/consultants`);
    const consultants = await consultantsRes.json();
    if (consultants.length === 0) throw new Error('No consultants found');
    console.log(`Found ${consultants.length} consultants.`);
    const consultantId = consultants[0].id;

    // 4. Book Appointment
    console.log('\n4. Booking Appointment...');
    const bookRes = await fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
            serviceId,
            consultantId,
            date: '2025-12-25',
            time: '10:00',
            notes: 'Testing booking'
        })
    });
    const booking = await bookRes.json();
    if (!bookRes.ok) throw new Error(`Booking failed: ${JSON.stringify(booking)}`);
    console.log(`Appointment created. ID: ${booking.id}, Status: ${booking.status}`);

    // 5. Admin Login
    console.log('\n5. Admin Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@apex.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error('Admin login failed');
    const adminToken = loginData.token;
    console.log('Admin logged in.');

    // 6. Admin Confirm Appointment
    console.log('\n6. Admin Confirming Appointment...');
    const confirmRes = await fetch(`${BASE_URL}/appointments/${booking.id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'confirmed' })
    });
    const confirmedBooking = await confirmRes.json();
    if (confirmedBooking.status !== 'confirmed') throw new Error('Status update failed');
    console.log(`Appointment confirmed. New Status: ${confirmedBooking.status}`);

    console.log('\n--- Verification SUCCESS ---');
}

runTest().catch(err => console.error('\n!!! Verification FAILED !!!', err));
