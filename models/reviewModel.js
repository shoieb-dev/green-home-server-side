const connectToDatabase = require("../config/db");

async function getReviewCollection() {
  const { collections } = await connectToDatabase();
  return collections.reviews;
}

module.exports = {
  getReviewCollection,
};
