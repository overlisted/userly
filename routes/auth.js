const Router = require("express-promise-router");
const bodyParser = require("body-parser");
const { users, tokens, passwords, emailVerification, passwordReset } = require("../services");
const authValidator = require("./middleware/auth");
const validation = require("../errors/validation");

const formErrors = require("../errors/formErrors.json");

const router = new Router();
module.exports = router;

router.use(bodyParser.json());

router.post("/signup", async (req, res) => {
  const json = req.body;
  const requestErrors = await validation.form(json, {
    email: async ({email}, test) => {
      test(!users.email.validate(email), formErrors.email.MALFORMED);
      test(await users.email.exists(email), formErrors.email.TAKEN);
    },
    username: async ({username}, test) => {
      test(username.length < 3, formErrors.username.TOO_SHORT);
      test(username.length > 14, formErrors.username.TOO_LONG);
      test(!users.username.validateContent(username), formErrors.username.MALFORMED);
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
    await emailVerification.beginVerification(json.email, json.username, json.newPassword);
    res.status(200);
    res.send({});
  }
});

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
    res.send({token: await tokens.fromUserOrNew(await users.id.byEmail(json.email))});
  }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    res.send({token: await tokens.renew(token)});
  }
});

router.post("/signup/verifyEmail", async (req, res) => {
  const json = req.body;

  try {
    await emailVerification.verify(json.ticket);
    res.status(200);
    res.send({});
  } catch(e) {
    if(e === 404) {
      res.status(400);
      res.send(formErrors.ticket.UNKNOWN);
    }
  }
});

router.post("/login/resetPassword", async (req, res) => {
  const json = req.body;

  await passwordReset.beginReset(json.email);

  res.status(200);
  res.send({})
});

router.post("/login/resetPassword/confirm", async (req, res) => {
  const json = req.body;
  const requestErrors = await validation.form(json, {
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
    try {
      await passwordReset.reset(json.ticket, json.newPassword);

      res.status(200);
      res.send({})
    } catch(e) {
      if(e === 404) {
        res.status(400);
        res.send(formErrors.ticket.UNKNOWN);
      }
    }
  }
});
