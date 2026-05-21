console.log("1. Starting debug boot...");
try {
    const dotenv = require('dotenv');
    dotenv.config();
    console.log("2. dotenv configured.");
    
    console.log("3. Importing database config...");
    const sequelize = require('./config/database');
    console.log("4. Database config imported.");
    
    console.log("5. Authenticating sequelize...");
    sequelize.authenticate().then(() => {
        console.log("6. Sequelize authenticated successfully!");
        
        console.log("7. Requiring models...");
        const models = require('./models');
        console.log("8. Models required successfully.");
        
        console.log("9. Syncing sequelize...");
        models.sequelize.sync().then(() => {
            console.log("10. Sequelize synced successfully!");
            process.exit(0);
        }).catch(err => {
            console.error("Error syncing database:", err);
            process.exit(1);
        });
    }).catch(err => {
        console.error("Sequelize authentication failed:", err);
        process.exit(1);
    });
} catch (err) {
    console.error("Caught error during boot:", err);
    process.exit(1);
}
