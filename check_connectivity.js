const http = require('http');

function checkUrl(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            console.log(`Successfully reached ${url} - Status: ${res.statusCode}`);
            res.resume();
            resolve();
        });

        req.on('error', (err) => {
            console.error(`Failed to reach ${url}: ${err.message}`);
            resolve(); // Resolve anyway to let other checks proceed
        });
    });
}

async function run() {
    console.log('Checking connectivity...');
    await checkUrl('http://localhost:5173');
    await checkUrl('http://127.0.0.1:5173');
    await checkUrl('http://localhost:5000');
}

run();
