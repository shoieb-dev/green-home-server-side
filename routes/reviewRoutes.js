const express = require("express");
const router = express.Router();
const {
  addReview,
  getAllReviews,
  getReviewByReviewId,
  deleteReview,
  getReviewsByUserId,
  updateReview,
} = require("../controllers/reviewController");
const { verifyToken } = require("../middlewares/verifyToken");

// Public routes (no auth needed)
router.get("/", getAllReviews);

// Protected routes (auth required)
router.post("/", verifyToken, addReview);
router.put("/:id", verifyToken, updateReview);
router.delete("/:id", verifyToken, deleteReview);
router.get("/:id", verifyToken, getReviewByReviewId);
router.get("/user/:userId", verifyToken, getReviewsByUserId);

module.exports = router;
