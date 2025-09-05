const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", getDashboardSummary);

module.exports = router;
