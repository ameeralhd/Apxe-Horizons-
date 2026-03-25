const http = require('http');

http.get('http://localhost:5000/api/consultants', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('Consultants count:', parsed.length);
            if (parsed.length > 0) {
                parsed.forEach(c => {
                    console.log(`  - ${c.User?.name}, isActive: ${c.isActive}, title: ${c.title}`);
                });
            }
        } catch (e) {
            console.error('Parse error:', data);
        }
    });
}).on('error', e => {
    console.error('Server not running or error:', e.message);
    console.log('This is expected if the server is not running. Start it first with: npm start');
});
