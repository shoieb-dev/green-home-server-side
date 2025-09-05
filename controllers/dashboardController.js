const { getHouseCollection } = require("../models/houseModel");
const { getBookingCollection } = require("../models/bookingModel");
const { getUserCollection } = require("../models/userModel");
const { getReviewCollection } = require("../models/reviewModel");

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const houses = await getHouseCollection();
    const bookings = await getBookingCollection();
    const users = await getUserCollection();
    const reviews = await getReviewCollection();

    // Total counts
    const [totalHouses, totalBookings, totalUsers, totalReviews] = await Promise.all([
      houses.countDocuments(),
      bookings.countDocuments(),
      users.countDocuments(),
      reviews.countDocuments(),
    ]);

    // Booking status breakdown
    const statusAggregation = await bookings.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray();

    const bookingStatusSummary = statusAggregation.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    // Top 5 popular houses by bookings
    const popularHouses = await bookings
      .aggregate([{ $group: { _id: "$house", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }])
      .toArray();

    // Last 5 bookings & users
    const recentBookings = await bookings.find({}).sort({ bookedAt: -1 }).limit(5).toArray();
    const recentUsers = await users.find({}).sort({ createdAt: -1 }).limit(5).toArray();

    res.json({
      success: true,
      data: {
        totals: { totalHouses, totalBookings, totalUsers, totalReviews },
        bookingStatusSummary,
        popularHouses,
        recentBookings,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    next(new Error("Failed to fetch dashboard data"));
  }
};
