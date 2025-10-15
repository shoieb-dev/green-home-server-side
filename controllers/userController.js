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

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await getUserCollection();
    const result = await users.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return next(new Error("Failed to fetch users"));
  }
};

exports.getUserByEmail = async (req, res, next) => {
  try {
    const usersCollection = await getUserCollection();
    const email = req.params.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return next(new Error("Failed to fetch user"));
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
    const users = await getUserCollection();
    const email = req.body.email?.toLowerCase();

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const existing = await users.findOne({ email });

    if (!existing) {
      // First-time Google login → insert both Google + custom defaults
      const newUser = {
        email,
        googleName: req.body.displayName,
        googlePhotoUrl: req.body.photoURL,
        displayName: req.body.displayName, // default to Google name
        photoURL: req.body.photoURL, // default to Google photo
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await users.insertOne(newUser);
      return res.json({ success: true, data: newUser });
    }

    // Existing user → only update Google fields, do NOT overwrite custom edits
    const updateDoc = {
      $set: {
        googleName: req.body.displayName,
        googlePhotoUrl: req.body.photoURL,
        updatedAt: new Date(),
      },
    };

    await users.updateOne({ email }, updateDoc);
    res.json({ success: true, message: "User Google data updated" });
  } catch (err) {
    console.error("Error in upsertUser:", err);
    return next(new Error("Failed to update user"));
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const users = await getUserCollection();
    const { email, displayName, photoURL } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const updateDoc = {
      $set: {
        displayName,
        photoURL,
        updatedAt: new Date(),
      },
    };

    const result = await users.updateOne({ email: email.toLowerCase() }, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("Error in updateProfile:", err);
    return next(new Error("Failed to update profile"));
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

exports.removeAdminRole = async (req, res, next) => {
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

    if (targetAccount.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `${targetEmail} is not an admin`,
      });
    }

    // **CRITICAL CHECK: Count total admins before removal**
    const adminCount = await usersCollection.countDocuments({ role: "admin" });

    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the last admin. At least one admin must remain in the system.",
      });
    }

    // Prevent admin from removing themselves (optional but recommended)
    if (requesterEmail === targetEmail) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin privileges. Ask another admin to do this.",
      });
    }

    // Demote the target user to regular user
    await usersCollection.updateOne(
      { email: targetEmail },
      {
        $unset: { role: "" },
        $currentDate: { updatedAt: true },
      }
    );

    res.status(200).json({
      success: true,
      message: `Admin privileges removed from ${targetEmail} successfully`,
    });
  } catch (error) {
    console.error("Error in removeAdminRole:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove admin role. Please try again.",
    });
  }
};
