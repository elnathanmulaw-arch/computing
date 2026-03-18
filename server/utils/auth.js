const jwt = require("jsonwebtoken");
const { config } = require("../config");

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

module.exports = { createToken };
