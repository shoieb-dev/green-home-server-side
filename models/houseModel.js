const connectToDatabase = require("../config/db");

async function getHouseCollection() {
  const { collections } = await connectToDatabase();
  return collections.houses;
}

module.exports = {
  getHouseCollection,
};
