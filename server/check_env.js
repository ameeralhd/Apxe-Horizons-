const dotenv = require('dotenv');
dotenv.config();
console.log("Loaded .env");
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
process.exit(0);
