const jwt = require("jsonwebtoken");

function generateToken(userId) {
  const secret = process.env.JWT_SECRET || "default_taskflow_jwt_secret_key_2026";
  return jwt.sign(
    { userId: userId.toString() },
    secret,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

module.exports = generateToken;

