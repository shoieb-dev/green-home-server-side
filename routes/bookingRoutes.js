const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  getBookingsByEmail,
  createBooking,
  updateBookingStatus,
  deleteBookingById,
  deleteBookingByEmail,
} = require("../controllers/bookingController");

router.get("/", getAllBookings);
router.get("/:email", getBookingsByEmail);
router.post("/", createBooking);
router.patch("/:id", updateBookingStatus);
router.delete("/:id", deleteBookingById);
router.delete("/:email", deleteBookingByEmail);

module.exports = router;
