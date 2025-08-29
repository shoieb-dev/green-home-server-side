const express = require("express");
const router = express.Router();
const { checkIfAdmin, addUser, upsertUser, setAdminRole } = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/:email", checkIfAdmin);
router.post("/", addUser);
router.put("/", upsertUser);
router.put("/make-admin", verifyToken, setAdminRole);

module.exports = router;
