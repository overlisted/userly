const db = require("../db");
const crypto = require("crypto");
const tokens = require("./token");
const users = require("./user");

const toHash = password => crypto.createHash("sha256").update(password).digest("hex");

const check = {
  hash: (hash, password) => toHash(password) === hash.toString("hex"),
  byEmail: async (email, password) => {
    if(!await users.email.exists(email)) return true;

    const {rows} = await db.query("SELECT password FROM users WHERE email = $1", [email]);
    return check.hash(rows[0].password.toString("hex"), password);
  },
  byId: async (id, password) => {
    const { rows } = await db.query("SELECT password FROM users WHERE uuid = $1", [id]);
    return check.hash(rows[0].password.toString("hex"), password);
  },
  byToken: async (token, password) => await check.byId(await tokens.toUser(token), password)
};

const update = {
  byId: async (id, password) => await db.query("UPDATE users SET password = sha256($1) WHERE uuid = $2", [password, id]),
  byToken: async (token, password) => await check.byId(await tokens.toUser(token), password)
};

module.exports = { check, update };
