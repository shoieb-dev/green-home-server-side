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

    // Return the review with user data for immediate UI update
    res.json({
      success: true,
      message: "Review added successfully",
      review: {
        ...reviewData,
        _id: result.insertedId,
        user: {
          photoURL: user.photoURL,
          displayName: user.displayName,
        },
      },
    });
  } catch (error) {
    console.error("Error in addReview:", error);
    return res.status(500).json({ success: false, message: "Failed to add review" });
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const users = await getUserCollection();

    // Fetch all reviews
    const result = await reviews.find({}).sort({ createdAt: -1 }).toArray();

    if (result.length === 0) {
      return res.json([]);
    }

    // Get all unique user IDs from reviews
    const userIds = [...new Set(result.map((review) => review.userId))];

    // Fetch all users in ONE query instead of N queries
    const usersData = await users
      .find({ _id: { $in: userIds } }, { projection: { _id: 1, photoURL: 1, displayName: 1 } })
      .toArray();

    // Create a lookup map for O(1) access
    const userMap = new Map(usersData.map((user) => [user._id.toString(), user]));

    // Merge review data with user data
    const reviewDataWithUser = result.map((review) => {
      const userId = review.userId.toString();
      const user = userMap.get(userId);

      return {
        ...review,
        user: user
          ? {
              photoURL: user.photoURL || null,
              displayName: user.displayName || "Unknown User",
            }
          : {
              photoURL: null,
              displayName: "Deleted User",
            },
      };
    });

    res.json(reviewDataWithUser);
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

exports.getReviewByReviewId = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const users = await getUserCollection();
    const reviewId = req.params.id;

    // Validate ObjectId
    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = await reviews.findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Fetch user data
    const user = await users.findOne({ _id: review.userId }, { projection: { _id: 0, photoURL: 1, displayName: 1 } });

    const reviewWithUser = {
      ...review,
      user: user
        ? {
            photoURL: user.photoURL || null,
            displayName: user.displayName || "Unknown User",
          }
        : {
            photoURL: null,
            displayName: "Deleted User",
          },
    };

    res.json(reviewWithUser);
  } catch (error) {
    console.error("Error in getReviewById:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch review" });
  }
};

// In reviewController.js

exports.getReviewsByUserId = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const users = await getUserCollection();
    const userId = req.params.userId;

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Fetch all reviews by this user
    const result = await reviews
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    if (result.length === 0) {
      return res.json([]);
    }

    // Get user data (will be same for all reviews)
    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { _id: 0, photoURL: 1, displayName: 1 } }
    );

    // Attach user data to each review
    const reviewDataWithUser = result.map((review) => ({
      ...review,
      user: user
        ? {
            photoURL: user.photoURL || null,
            displayName: user.displayName || "Unknown User",
          }
        : {
            photoURL: null,
            displayName: "Deleted User",
          },
    }));

    res.json(reviewDataWithUser);
  } catch (error) {
    console.error("Error in getReviewsByUserId:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch user reviews" });
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const reviewId = req.params.id;
    const requesterEmail = req.user?.email?.toLowerCase(); // From Firebase token

    // Validate ObjectId
    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    // Check if review exists
    const existingReview = await reviews.findOne({ _id: new ObjectId(reviewId) });

    if (!existingReview) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Authorization check: Only the review owner can update
    const users = await getUserCollection();
    const user = await users.findOne({ email: requesterEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Check if the user owns this review
    if (existingReview.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own reviews",
      });
    }

    // Validate and sanitize update data
    const allowedFields = ["reviewtext", "rating"]; // Add your actual review fields
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // Add validation for specific fields
    if (updateData.rating !== undefined) {
      const rating = Number(updateData.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a number between 1 and 5",
        });
      }
      updateData.rating = rating;
    }

    if (updateData.reviewtext !== undefined) {
      updateData.reviewtext = updateData.reviewtext.trim();
      if (updateData.reviewtext.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Review text cannot be empty",
        });
      }
      if (updateData.reviewtext.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Review text cannot exceed 1000 characters",
        });
      }
    }

    // Update the review with timestamp
    const result = await reviews.updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were made to the review",
      });
    }

    // Fetch and return the updated review
    const updatedReview = await reviews.findOne({ _id: new ObjectId(reviewId) });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error in updateReview:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review. Please try again.",
    });
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const reviewId = req.params.id;

    // Validate ObjectId
    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const result = await reviews.deleteOne({ _id: new ObjectId(reviewId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    return res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};

// Optional: Add pagination for better performance
exports.getReviewsPaginated = async (req, res, next) => {
  try {
    const reviews = await getReviewCollection();
    const users = await getUserCollection();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const totalReviews = await reviews.countDocuments({});

    // Fetch paginated reviews
    const result = await reviews.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    if (result.length === 0) {
      return res.json({
        reviews: [],
        currentPage: page,
        totalPages: 0,
        totalReviews: 0,
      });
    }

    // Get unique user IDs
    const userIds = [...new Set(result.map((review) => review.userId))];

    // Fetch users in one query
    const usersData = await users
      .find({ _id: { $in: userIds } }, { projection: { _id: 1, photoURL: 1, displayName: 1 } })
      .toArray();

    // Create lookup map
    const userMap = new Map(usersData.map((user) => [user._id.toString(), user]));

    // Merge data
    const reviewDataWithUser = result.map((review) => {
      const userId = review.userId.toString();
      const user = userMap.get(userId);

      return {
        ...review,
        user: user
          ? {
              photoURL: user.photoURL || null,
              displayName: user.displayName || "Unknown User",
            }
          : {
              photoURL: null,
              displayName: "Deleted User",
            },
      };
    });

    res.json({
      reviews: reviewDataWithUser,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit),
      totalReviews: totalReviews,
    });
  } catch (error) {
    console.error("Error in getReviewsPaginated:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};
