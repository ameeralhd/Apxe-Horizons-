console.log("1. Requiring dependencies...");
const { Sequelize } = require('sequelize');
const path = require('path');
console.log("2. Dependencies required.");

console.log("3. Instantiating Sequelize...");
try {
    const storagePath = path.join(__dirname, 'database.sqlite');
    console.log("Storage path is:", storagePath);
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: console.log
    });
    console.log("4. Sequelize instantiated.");
    
    console.log("5. Testing connection...");
    sequelize.authenticate().then(() => {
        console.log("6. Connection tested successfully!");
        process.exit(0);
    }).catch(err => {
        console.error("Connection failed:", err);
        process.exit(1);
    });
} catch (e) {
    console.error("Error instantiating:", e);
    process.exit(1);
}
