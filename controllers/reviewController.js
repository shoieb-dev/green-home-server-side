// controllers/reviewController.js
const { getReviewCollection } = require("../models/reviewModel");

exports.addReview = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const result = await reviews.insertOne(req.body);
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
