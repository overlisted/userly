const express = require("express");
const createRoutes = require("./routes");

const app = express();

createRoutes(app);

app.listen(80);
console.info("YEP");
