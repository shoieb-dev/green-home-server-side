// controllers/userController.js
const { getUserCollection } = require("../models/userModel");

exports.checkIfAdmin = async (req, res, next) => {
  try {
    const users = await getUserCollection();
    const user = await users.findOne({ email: req.params.email });
    const isAdmin = user?.role === "admin";
    res.json({ admin: isAdmin });
  } catch (error) {
    console.error("Error in checkIfAdmin:", error);
    return next(new Error("Failed to check admin status"));
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const users = await getUserCollection();

    const email = req.body.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existing = await users.findOne({ email });

    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const result = await users.insertOne(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in addUser:", error);
    return next(new Error("Failed to add user"));
  }
};

exports.upsertUser = async (req, res, next) => {
  try {
    const usersCollection = await getUserCollection();
    const email = req.body.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const filter = { email };
    const options = { upsert: true };
    const updateDoc = { $set: req.body };

    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in upsertUser:", error);
    return next(new Error("Failed to update user"));
  }
};

exports.setAdminRole = async (req, res, next) => {
  try {
    const usersCollection = await getUserCollection();
    const email = req.body.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const filter = { email };
    const updateDoc = { $set: { role: "admin" } };

    const result = await usersCollection.updateOne(filter, updateDoc);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in setAdminRole:", error);
    return next(new Error("Failed to set admin role"));
  }
};
