const bcrypt = require("bcryptjs");

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);
  return hashed;
}

function comparePassword(password, hashed) {
  return bcrypt.compareSync(password, hashed);
}

module.exports = {
  hashPassword,
  comparePassword,
};
