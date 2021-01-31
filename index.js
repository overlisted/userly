const express = require("express");
const cors = require("cors");
const createRoutes = require("./routes");

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
}));

createRoutes(app);

app.listen(80);
console.info("YEP");
