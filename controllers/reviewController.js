// controllers/reviewController.js
const { ObjectId } = require("mongodb");
const { getReviewCollection } = require("../models/reviewModel");
const { getUserCollection } = require("../models/userModel");

exports.addReview = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const users = await getUserCollection();

    const user = await users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found with the provided email" });
    }

    const reviewData = {
      ...req.body,
      userId: user._id,
      createdAt: new Date(),
    };

    const result = await reviews.insertOne(reviewData);
    res.json(result);
  } catch (error) {
    console.error("Error in addReview:", error);
    return next(new Error("Failed to add review"));
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const result = await reviews.find({}).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    return next(new Error("Failed to fetch reviews"));
  }
};

exports.getReviewById = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const reviewId = req.params.id;
    const review = await reviews.findOne({ _id: new ObjectId(reviewId) });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    console.error("Error in getReviewById:", error);
    return next(new Error("Failed to fetch review"));
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const reviewId = req.params.id;
    const result = await reviews.deleteOne({ _id: new ObjectId(reviewId) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    return next(new Error("Failed to delete review"));
  }
};
