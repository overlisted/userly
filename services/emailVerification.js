const { newUser } = require("./user");
const { v4: generateUuid } = require("uuid");

let unverifiedUsers = new Map(); //: Map<string, { email: string, username: string, password: string }>

const beginVerification = async (email, username, password) => {
  const ticket = generateUuid();

  unverifiedUsers.set(ticket, {email, username, password});
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
