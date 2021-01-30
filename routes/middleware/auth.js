const { tokens } = require("../../services");

// "authorization" header == the token uuid
module.exports = async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    const isAuthorized = token && await tokens.validate(token);

    if(!isAuthorized) {
      res.status(401);
      res.end();
    } else next()
  } catch {
    res.status(401);
    res.end()
  }
};
