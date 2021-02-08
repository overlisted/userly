const db = require("../db");
const { v4: generateUuid } = require("uuid");

const id = {
  byUsername: async username => {
    const { rows } = await db.query("SELECT uuid FROM users WHERE username = $1", [username]);
    return rows[0].uuid;
  },
  byEmail: async email => {
    const { rows } = await db.query("SELECT uuid FROM users WHERE email = $1", [email]);
    return rows[0].uuid;
  },
  exists: async id => {
    const { rows } = await db.query("SELECT * FROM users WHERE uuid = $1", [id]);
    return rows.length > 0;
  }
};

// i guess it should cover enough emails?
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const usernameContentRegex = /^[a-zA-Z_0-9]{3,18}$/;

const username = {
  validateContent: username => usernameContentRegex.test(username),
  exists: async username => {
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    return rows.length > 0;
  }
};

const email = {
  validate: email => emailRegex.test(email),
  exists: async email => {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows.length > 0;
  }
};

const newUser = async (email, username, password) => {
  await db.query("INSERT INTO users VALUES ($1, $2, $3, sha256($4))", [generateUuid(), email, username, password]);
};

module.exports = {
  id, email, username, newUser
};
