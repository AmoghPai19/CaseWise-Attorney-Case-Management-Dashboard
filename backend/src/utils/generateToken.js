const jwt = require('jsonwebtoken');

function generateToken(user) {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

module.exports = generateToken;

