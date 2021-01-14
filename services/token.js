const db = require("../db");
const { v4: generateUuid } = require("uuid");

const create = async userId => {
  const newToken = generateUuid();
  await db.query("INSERT INTO tokens VALUES ($1, $2)", [newToken, userId]);

  return newToken;
};

const renew = async userId => {
  const newToken = generateUuid();
  await db.query("UPDATE tokens SET token = $1 WHERE user_id = $2", [newToken, userId]);

  return newToken;
};

const fromUser = async userId => {
  const { rows } = await db.query("SELECT token FROM tokens WHERE user_id = $1", [userId]);
  return rows[0]?.token;
};

const fromUserOrNew = async userId => await fromUser(userId) ?? await create(userId);

const toUser = async token => {
  const { rows } = await db.query("SELECT user_id FROM tokens WHERE token = $1", [token]);
  return rows[0]?.user_id;
};

const validate = async token => !!await toUser(token);

module.exports = {
  renew, fromUser, fromUserOrNew, toUser, validate
};
