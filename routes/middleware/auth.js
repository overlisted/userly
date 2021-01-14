const { tokens } = require("../../services");

// "authorization" header == the token uuid
module.exports = async (req, res, next) => {
  const token = req.headers.authorization;
  if(!token || !await tokens.validate(token)) {
    res.status(401);
    res.end();
  } else next();
};
