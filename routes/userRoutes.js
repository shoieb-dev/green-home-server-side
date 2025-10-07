const express = require("express");
const router = express.Router();
const {
  checkIfAdmin,
  addUser,
  upsertUser,
  setAdminRole,
  getUserByEmail,
  updateProfile,
  getAllUsers,
} = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", getAllUsers);
router.get("/:email", getUserByEmail);
router.get("/check/:email", checkIfAdmin);
router.post("/", addUser);
router.put("/", upsertUser); // gogle login
router.put("/profile", updateProfile); // custom profile update
router.put("/make-admin", verifyToken, setAdminRole);

module.exports = router;
