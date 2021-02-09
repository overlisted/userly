const emailing = require("./emailing");
const passwords = require("./password");
const users = require("./user");
const pug = require("pug");
const { v4: generateUuid } = require("uuid");

let toReset = new Map(); //: Map<string, string>

const makeEmailHTML = pug.compileFile("passwordResetEmail.pug");
const beginReset = async email => {
  if(!await users.email.exists(email)) throw 404;

  const id = await users.id.byEmail(email);
  const ticket = generateUuid();

  toReset.set(ticket, id);

  await emailing.sendEmail(
    process.env.PASSWORD_RESETS_FROM,
    email,
    "Password Reset",
    makeEmailHTML({ticket})
  );
};

const reset = async (ticket, newPassword) => {
  const id = toReset.get(ticket);
  if(!id) throw 404;

  toReset.delete(ticket);
  await passwords.update.byId(id, newPassword);
};

module.exports = { beginReset, reset };
