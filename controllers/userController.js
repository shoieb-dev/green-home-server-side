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
    const requesterEmail = req.user?.email?.toLowerCase(); // from Firebase token
    const targetEmail = req.body.email?.toLowerCase();

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if requester is an admin
    const requesterAccount = await usersCollection.findOne({ email: requesterEmail });

    if (!requesterAccount || requesterAccount.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Only admins can assign roles" });
    }

    // Find the target user
    const targetAccount = await usersCollection.findOne({ email: targetEmail });

    if (!targetAccount) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (targetAccount.role === "admin") {
      return res.status(200).json({
        success: true,
        message: `${targetEmail} is already an admin`,
      });
    }

    // Promote the target user
    await usersCollection.updateOne({ email: targetEmail }, { $set: { role: "admin" } });

    res.status(200).json({
      success: true,
      message: `${targetEmail} has been promoted to admin`,
    });
  } catch (error) {
    console.error("Error in setAdminRole:", error);
    return res.status(500).json({ success: false, message: "Failed to set admin role" });
  }
};
