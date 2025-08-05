// controllers/houseController.js
const { ObjectId } = require("mongodb");
const { getHouseCollection } = require("../models/houseModel");

exports.getAllHouses = async (req, res, next) => {
  try {
    const buyers = await getHouseCollection();
    const houses = await buyers.find({}).toArray();
    res.send(houses);
  } catch (error) {
    console.error("Error in getAllHouses:", error);
    return next(new Error("Failed to fetch houses"));
  }
};

exports.getHouseById = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid house ID" });
    }

    const buyers = await getHouseCollection();
    const house = await buyers.findOne({ _id: ObjectId(req.params.id) });
    res.json(house);
  } catch (error) {
    console.error("Error in getHouseById:", error);
    return next(new Error("Failed to fetch house"));
  }
};

exports.createHouse = async (req, res, next) => {
  try {
    const buyers = await getHouseCollection();
    const result = await buyers.insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error in createHouse:", error);
    return next(new Error("Failed to add house"));
  }
};

exports.deleteHouse = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid house ID" });
    }
    const buyers = await getHouseCollection();
    const result = await buyers.deleteOne({ _id: ObjectId(req.params.id) });
    res.json(result);
  } catch (error) {
    console.error("Error in deleteHouse:", error);
    return next(new Error("Failed to delete house"));
  }
};
