const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    try {
        db.run("ALTER TABLE Users ADD COLUMN verificationExpires DATETIME;", (err) => {
            if (err) {
                console.log("Column might already exist or error:", err.message);
            } else {
                console.log("verificationExpires column added successfully.");
            }
        });
    } catch (e) {
        console.log(e);
    }
});

db.close();
