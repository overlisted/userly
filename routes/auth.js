const Router = require("express-promise-router");
const bodyParser = require("body-parser");
const { users, tokens, passwords } = require("../services");
const authValidator = require("./middleware/auth");
const validation = require("../errors/validation");

const formErrors = require("../errors/formErrors.json");

const router = new Router();
module.exports = router;

router.use(bodyParser.json());

// i guess it should cover enough emails?
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// POST /auth/signup(email: string, username: string, newPasswordRepeat: string): void
// -> { 200, 400: [1, 6, 10, 8, 7, 3, 9, 5] }
router.post("/signup", async (req, res) => {
  const json = req.body;
  const requestErrors = await validation.form(json, {
    email: async ({email}, test) => {
      test(!emailRegex.test(email), formErrors.email.MALFORMED);
      test(await users.email.exists(email), formErrors.email.TAKEN);
    },
    username: async ({username}, test) => {
      test(username.length < 3, formErrors.username.TOO_SHORT);
      test(username.length > 14, formErrors.username.TOO_LONG);
      test(await users.username.exists(username), formErrors.username.TAKEN);
    },
    newPassword: async ({newPassword}, test) => {
      test(newPassword.length < 8, formErrors.newPassword.TOO_SHORT);
      test(newPassword.length > 32, formErrors.newPassword.TOO_LONG);
    },
    newPasswordRepeat: async ({newPassword, newPasswordRepeat}, test) => {
      test(newPassword !== newPasswordRepeat, formErrors.newPasswordRepeat.DOESNT_MATCH);
    },
  });

  if(requestErrors) {
    res.status(400);
    res.send(JSON.stringify(requestErrors));
  } else {
    await users.newUser(json.email, json.username, json.newPassword);
    res.status(200);
    res.end();
  }
});

// Returns the session token of a user
// POST /auth/login(email: string, password: string): string
// -> { 200, 400: [2, 4] }
router.post("/login", async (req, res) => {
  const json = req.body;
  const requestErrors = await validation.form(json, {
    email: async ({email}, test) => {
      test(!await users.email.exists(email), formErrors.email.UNKNOWN);
    },
    password: async ({email, password}, test) => {
      test(!await passwords.check.byEmail(email, password), formErrors.password.WRONG);
    },
  });

  if(requestErrors) {
    res.status(400);
    res.send(JSON.stringify(requestErrors));
  } else {
    res.status(200);
    res.send(await tokens.fromUserOrNew(await users.id.byEmail(json.email)));
  }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Returns a new refreshed token
// PATCH @auth /auth/changePassword(password: string, newPassword: string, newPasswordRepeat: string): string
// -> { 200, 400: [4, 3, 9, 5] }
router.patch("/changePassword", authValidator, async (req, res) => {
  const json = req.body;
  const token = req.headers.authorization;

  const requestErrors = await validation.form(json, {
    password: async ({email, password}, test) => {
      test(!await passwords.check.byEmail(json.email, json.password), formErrors.password.WRONG);
    },
    newPassword: async ({newPassword}, test) => {
      test(newPassword.length < 8, formErrors.newPassword.TOO_SHORT);
      test(newPassword.length > 32, formErrors.newPassword.TOO_LONG);
    },
    newPasswordRepeat: async ({newPassword, newPasswordRepeat}, test) => {
      test(newPassword !== newPasswordRepeat, formErrors.newPasswordRepeat.DOESNT_MATCH);
    },
  });

  if(requestErrors) {
    res.status(400);
    res.send(JSON.stringify(requestErrors));
  } else {
    await passwords.update.byToken(token, json.newPassword);

    res.status(200);
    res.send(await tokens.renew(token));
  }
});
