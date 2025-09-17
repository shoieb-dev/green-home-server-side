// controllers/bookingController.js
const { getBookingCollection } = require("../models/bookingModel");
const { ObjectId } = require("mongodb");
const { getUserCollection } = require("../models/userModel");

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await getBookingCollection();
    const result = await bookings.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error in getAllBookings:", error);
    return next(new Error("Failed to fetch bookings"));
  }
};

exports.getBookingsByEmail = async (req, res, next) => {
  try {
    const bookings = await getBookingCollection();
    const result = await bookings.find({ email: req.params.email }).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error in getBookingsByEmail:", error);
    return next(new Error("Failed to fetch booking"));
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const bookings = await getBookingCollection();
    const users = await getUserCollection();

    // Find user by email
    const user = await users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found with the provided email" });
    }

    // Step 1: Check if booking already exists for this user + house
    const existingBooking = await bookings.findOne({
      userId: user._id,
      houseId: req.body.houseId,
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this house",
      });
    }

    // Step 2: Insert new booking
    const bookingData = {
      ...req.body,
      userId: user._id,
      bookedAt: new Date(),
      status: "pending",
    };

    const result = await bookings.insertOne(bookingData);
    res.json({ success: true, bookingId: result.insertedId });
  } catch (error) {
    console.error("Error in createBooking:", error);
    return next(new Error("Failed to add booking"));
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    if (!status?.trim()) {
      return res.status(400).json({ success: false, message: "Booking status is required" });
    }

    if (!ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const bookings = await getBookingCollection();
    const result = await bookings.updateOne({ _id: new ObjectId(bookingId) }, { $set: { status } });

    res.json({ success: true, message: "Booking status updated", result });
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    return next(new Error("Failed to update booking status"));
  }
};

exports.deleteBookingById = async (req, res, next) => {
  try {
    const bookingId = req.params.id;

    if (!ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const bookings = await getBookingCollection();
    const result = await bookings.deleteOne({ _id: new ObjectId(bookingId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBookingById:", error);
    return next(new Error("Failed to delete booking"));
  }
};

exports.deleteBookingByEmail = async (req, res, next) => {
  try {
    const bookings = await getBookingCollection();
    const result = await bookings.deleteMany({ email: req.params.email });
    res.send(result);
  } catch (error) {
    console.error("Error in deleteBookingByEmail:", error);
    return next(new Error("Failed to delete booking"));
  }
};
