const express = require("express");
const router = express.Router();
const { addReview, getAllReviews } = require("../controllers/reviewController");

router.post("/", addReview);
router.get("/", getAllReviews);

module.exports = router;
