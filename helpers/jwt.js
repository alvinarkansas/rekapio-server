const jwt = require("jsonwebtoken");

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.SECRET, { expiresIn: "60m" });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.SECRET);
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "7d" });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
