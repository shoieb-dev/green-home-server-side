// backend/middleware/verifyToken.js
const admin = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decodedUser = await admin.auth().verifyIdToken(token);

    req.user = decodedUser; // attach Firebase user info
    next();
  } catch (error) {
    console.error("verifyToken error:", error);
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
};

module.exports = verifyToken;
