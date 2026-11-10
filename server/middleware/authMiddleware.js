const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT and loads the current user.
async function protect(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing",
      });
    }

    const secret = process.env.JWT_SECRET || "default_taskflow_jwt_secret_key_2026";
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token. Please log in again.",
      });
    }

    console.error("Authentication error:", error.message);
    return res.status(500).json({
      message: "Authentication could not be completed",
    });
  }
}

// Optional auth for endpoints that can serve both public and personalized data
async function optionalAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer ")) {
      const token = authorization.split(" ")[1];
      if (token) {
        const secret = process.env.JWT_SECRET || "default_taskflow_jwt_secret_key_2026";
        const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (err) {
    // Ignore invalid token in optionalAuth
  }
  next();
}

// Allows only administrators.
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin permission required.",
    });
  }
  next();
}

module.exports = {
  protect,
  optionalAuth,
  adminOnly,
};

