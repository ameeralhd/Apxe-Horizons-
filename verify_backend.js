// using global fetch (Node 18+)

async function verifyFlow() {
    const BASE_URL = 'http://localhost:5000/api';
    let token = '';

    try {
        // 0. Register a new user
        console.log('--- Step 0: Register ---');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                email: `test${Date.now()}@example.com`,
                password: 'password123',
                phone: '123456789'
            })
        });
        const regData = await regRes.json();
        const testEmail = regData.user.email;
        console.log('Registration successful:', testEmail);

        // 1. Login to get token
        console.log('\n--- Step 1: Login ---');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'password123' })
        });
        const loginData = await loginRes.json();
        token = loginData.token;
        console.log('Login successful');

        // 2. Check initial dashboard status
        console.log('\n--- Step 2: Initial Dashboard Status ---');
        const statusRes1 = await fetch(`${BASE_URL}/dashboard/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statusData1 = await statusRes1.json();
        const initialCount = statusData1.consultations;
        console.log('Initial Consultations Count:', initialCount);

        // 3. Create a pending appointment
        console.log('\n--- Step 3: Create Pending Appointment ---');
        const bookingRes = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                consultantId: 1,
                date: `2026-03-${Math.floor(Math.random() * 20) + 10}`,
                time: `${Math.floor(Math.random() * 5) + 10}:00`,
                topic: 'Scholarship Application Verification'
            })
        });
        const bookingData = await bookingRes.json();
        console.log('Booking Response:', JSON.stringify(bookingData, null, 2));
        const appointmentId = bookingData.id || (bookingData.appointment && bookingData.appointment.id);
        const currentStatus = bookingData.status || (bookingData.appointment && bookingData.appointment.status);

        if (!appointmentId) {
            throw new Error('Failed to extract appointmentId from response');
        }

        console.log('Appointment ID:', appointmentId, 'Status:', currentStatus);

        // 4. Process Payment
        console.log('\n--- Step 4: Process Payment ---');
        const payRes = await fetch(`${BASE_URL}/appointments/${appointmentId}/pay`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const payData = await payRes.json();
        console.log('Payment Status:', payData.appointment.status);

        // 5. Check final dashboard status
        console.log('\n--- Step 5: Final Dashboard Status ---');
        const statusRes2 = await fetch(`${BASE_URL}/dashboard/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statusData2 = await statusRes2.json();
        const finalCount = statusData2.consultations;
        console.log('Final Consultations Count:', finalCount);

        if (finalCount === initialCount + 1) {
            console.log('\nSUCCESS: Dashboard count incremented correctly.');
        } else {
            console.error('\nFAILURE: Dashboard count did not increment as expected.');
        }

    } catch (err) {
        console.error('Verification failed:', err);
    }
}

verifyFlow();
