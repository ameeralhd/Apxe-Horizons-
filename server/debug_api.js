const fetch = require('node-fetch'); // wait, node-fetch might not be installed, let's use standard http or require('./models') directly!
const { DynamicContent } = require('./models');

async function testQuery() {
    try {
        console.log("Querying DynamicContent...");
        const content = await DynamicContent.findAll({
            where: { status: true },
            order: [['order_index', 'ASC'], ['createdAt', 'DESC']]
        });
        console.log("Query successful! Count:", content.length);
        console.log("First item:", content[0] ? content[0].toJSON() : "none");
    } catch (err) {
        console.error("Query failed with error:");
        console.error(err);
    }
    process.exit(0);
}

testQuery();
