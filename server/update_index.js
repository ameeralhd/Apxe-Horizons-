const fs = require('fs');

let data = fs.readFileSync('models/index.js', 'utf8');

data = data.replace(
    "const TemplateFavorite = require('./TemplateFavorite');",
    "const TemplateFavorite = require('./TemplateFavorite');\nconst Scholarship = require('./Scholarship');"
);

data = data.replace(
    "    TemplateFavorite\r\n};",
    "    TemplateFavorite,\r\n    Scholarship\r\n};"
);

data = data.replace(
    "    TemplateFavorite\n};",
    "    TemplateFavorite,\n    Scholarship\n};"
);

fs.writeFileSync('models/index.js', data);

console.log("Updated models/index.js successfully");
