const express = require("express");
const router = express.Router();
const { checkIfAdmin, addUser, upsertUser, setAdminRole } = require("../controllers/userController");

router.get("/:email", checkIfAdmin);
router.post("/", addUser);
router.put("/", upsertUser);
router.put("/admin", setAdminRole);

module.exports = router;
