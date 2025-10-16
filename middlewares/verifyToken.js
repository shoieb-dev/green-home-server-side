// backend/middleware/verifyToken.js
const admin = require("../config/firebase");

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user info to request
    req.user = {
      email: decodedToken.email,
      uid: decodedToken.uid,
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};
