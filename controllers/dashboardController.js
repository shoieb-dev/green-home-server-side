// controllers/dashboardController.js
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

    const requesterEmail = req.user?.email?.toLowerCase(); // decoded from Firebase middleware
    const requesterAccount = await users.findOne({ email: requesterEmail });

    if (!requesterAccount) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 🔹 If Admin → return global dashboard data
    if (requesterAccount.role === "admin") {
      const [totalHouses, totalBookings, totalUsers, totalReviews] = await Promise.all([
        houses.countDocuments(),
        bookings.countDocuments(),
        users.countDocuments(),
        reviews.countDocuments(),
      ]);

      const statusAggregation = await bookings
        .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray();

      const bookingStatusSummary = statusAggregation.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {});
      // Top 5 popular houses by bookings
      const popularHouses = await bookings
        .aggregate([{ $group: { _id: "$house", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }])
        .toArray();

      const recentBookings = await bookings.find({}).sort({ bookedAt: -1 }).limit(5).toArray();

      const recentUsers = await users.find({}).sort({ createdAt: -1 }).limit(5).toArray();

      return res.json({
        success: true,
        role: "admin",
        data: {
          totals: { totalHouses, totalBookings, totalUsers, totalReviews },
          bookingStatusSummary,
          popularHouses,
          recentBookings,
          recentUsers,
        },
      });
    }

    // 🔹 If Normal User → personalized dashboard
    const myBookings = await bookings.find({ userId: requesterAccount._id }).toArray();
    const myReviews = await reviews.find({ userId: requesterAccount._id }).toArray();

    const myBookingStatus = myBookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    const recentBookings = myBookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)).slice(0, 5);

    // Optional: recommend houses not booked by this user
    const bookedHouseIds = myBookings.map((b) => b.houseId.toString());
    const recommendedHouses = await houses
      .find({ _id: { $nin: bookedHouseIds } })
      .limit(3)
      .toArray();

    return res.json({
      success: true,
      role: "user",
      data: {
        totals: {
          myBookings: myBookings.length,
          myReviews: myReviews.length,
        },
        myBookingStatus,
        recentBookings,
        recommendedHouses,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    next(new Error("Failed to fetch dashboard data"));
  }
};
