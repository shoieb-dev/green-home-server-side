// controllers/reviewController.js
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
