const connectToDatabase = require("../config/db");

async function getUserCollection() {
  const { collections } = await connectToDatabase();
  return collections.users;
}

module.exports = {
  getUserCollection,
};
