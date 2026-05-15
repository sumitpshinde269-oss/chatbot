const jwt = require('jsonwebtoken');
const config = require('../config');

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.JWT_ACCESS_SECRET, { expiresIn: config.JWT_ACCESS_EXPIRY });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRY });
}

module.exports = { generateAccessToken, generateRefreshToken };