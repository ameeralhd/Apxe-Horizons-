const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Starting column migrations for dynamic_content table...");
    
    db.run("ALTER TABLE dynamic_content ADD COLUMN country VARCHAR(255);", (err) => {
        if (err) {
            console.log("Column 'country' might already exist or error:", err.message);
        } else {
            console.log("Column 'country' added successfully.");
        }
    });

    db.run("ALTER TABLE dynamic_content ADD COLUMN official_link VARCHAR(255);", (err) => {
        if (err) {
            console.log("Column 'official_link' might already exist or error:", err.message);
        } else {
            console.log("Column 'official_link' added successfully.");
        }
    });
});

db.close();
