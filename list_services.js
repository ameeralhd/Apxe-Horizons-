const { Service } = require('./server/models');

async function listServices() {
    try {
        const services = await Service.findAll();
        console.log('Available Services:');
        services.forEach(s => {
            console.log(`ID: ${s.id}, Title: ${s.title}, Price: ${s.price}`);
        });
    } catch (err) {
        console.error('Error listing services:', err);
    } finally {
        process.exit();
    }
}

listServices();
