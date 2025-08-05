const connectToDatabase = require("../config/db");

async function getBookingCollection() {
  const { collections } = await connectToDatabase();
  return collections.bookings;
}

module.exports = {
  getBookingCollection,
};
