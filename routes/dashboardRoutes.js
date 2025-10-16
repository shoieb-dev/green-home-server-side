const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", verifyToken, getDashboardSummary);

module.exports = router;
