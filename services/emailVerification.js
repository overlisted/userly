const { newUser } = require("./user");
const { v4: generateUuid } = require("uuid");
const { sendEmail } = require("./emailing");
const pug = require("pug");

let unverifiedUsers = new Map(); //: Map<string, { email: string, username: string, password: string }>

const makeVerificationHTML = pug.compileFile("verificationEmail.pug");
const sendVerification = async ticket => {
  const user = unverifiedUsers.get(ticket);

  await sendEmail(
    process.env.EMAIL_VERIFICATION_FROM,
    user.email,
    "Email Verification",
    makeVerificationHTML({username: user.username, ticket})
  )
};

const beginVerification = async (email, username, password) => {
  const ticket = generateUuid();

  unverifiedUsers.set(ticket, {email, username, password});
  await sendVerification(ticket);
};

const verify = async ticket => {
  let user;
  unverifiedUsers.forEach((it, itTicket) => {
    if(ticket === itTicket) user = it;
  });

  if(user) {
    unverifiedUsers.delete(ticket);

    await newUser(user.email, user.username, user.password);
  } else throw 404;
};

module.exports = { beginVerification, verify };
