
async function testAdminAPI() {
    const loginUrl = 'http://127.0.0.1:5000/api/auth/login';
    const adminCredentials = {
        email: 'admin@apexhorizons.com',
        password: 'admin123'
    };

    console.log('Attempting to login as admin...');
    const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminCredentials)
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    const { token } = await loginRes.json();
    console.log('Login successful. Token acquired.');

    const analyticsUrl = 'http://127.0.0.1:5000/api/admin/analytics';
    console.log('Fetching admin analytics...');
    const start = Date.now();
    try {
        const analyticsRes = await fetch(analyticsUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!analyticsRes.ok) {
            console.error('Analytics fetch failed:', await analyticsRes.text());
            return;
        }

        const data = await analyticsRes.json();
        const duration = Date.now() - start;
        console.log('Analytics fetch successful in', duration, 'ms');
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error during fetch:', e);
    }
}

testAdminAPI();
