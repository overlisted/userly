const Router = require("express-promise-router");
const bodyParser = require("body-parser");
const { users, tokens, passwords } = require("../services");
const authValidator = require("./middleware/auth");

const router = new Router();
module.exports = router;

router.use(bodyParser.json());

// POST /auth/register(email: string, username: string, password: string): void
// -> { 200, 400: ["Email taken", "Username taken", "No password"] }
router.post("/register", async (req, res) => {
  const json = req.body;

  if(await users.username.exists(json.username)) {
    res.status(400);
    res.send("Username taken");

    return;
  }

  if(await users.email.exists(json.email)) {
    res.status(400);
    res.send("Email taken");

    return;
  }

  if(!json.password) {
    res.status(400);
    res.send("No password");

    return;
  }

  // finally, the request is alright
  await users.newUser(json.email, json.username, json.password);
  res.status(200);
  res.end();
});

// Returns the session token of a user
// POST /auth/login(email: string, password: string): string
// -> { 200, 400: ["Wrong email", "Wrong password"] }
router.post("/login", async (req, res) => {
  const json = req.body;

  if(!await users.email.exists(json.email)) {
    res.status(400);
    res.send("Wrong email");

    return;
  }

  if(!await passwords.check.byEmail(json.email, json.password)) {
    res.status(400);
    res.send("Wrong password");

    return;
  }

  res.status(200);
  res.send(await tokens.fromUserOrNew(await users.id.byEmail(json.email)));
});

// Returns a new refreshed token
// PATCH @auth /auth/changePassword(oldPassword: string, newPassword: string): string
// -> { 200, 400: ["Wrong old password"] }
router.patch("/changePassword", authValidator, async (req, res) => {
  const json = req.body;
  const token = req.headers.authorization;

  if(!await passwords.check.byToken(token, json.oldPassword)) {
    res.status(200);
    res.send("Wrong old password");

    return;
  }

  await passwords.update.byToken(token, json.newPassword);

  res.status(200);
  res.send(await tokens.renew(token));
});
