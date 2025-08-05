const express = require("express");
const router = express.Router();
const { getAllHouses, getHouseById, createHouse, deleteHouse } = require("../controllers/houseController");

router.get("/", getAllHouses);
router.get("/:id", getHouseById);
router.post("/", createHouse);
router.delete("/:id", deleteHouse);

module.exports = router;
