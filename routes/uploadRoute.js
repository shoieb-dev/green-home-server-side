// routes/uploadRoute.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const connectToDatabase = require("../config/db");
const { PassThrough } = require("stream");

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function: upload single file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, originalname) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "greenhome_images" }, (error, result) => {
      if (error) reject(error);
      else
        resolve({
          name: originalname,
          url: result.secure_url,
          createdAt: new Date(),
        });
    });
    const bufferStream = new PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(stream);
  });
};

// ✅ Multi-image upload
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    const { collections } = await connectToDatabase();

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, file.originalname));

    const uploadedImages = await Promise.all(uploadPromises);

    // Save to MongoDB
    await collections.images.insertMany(uploadedImages);

    res.status(200).json(uploadedImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all images
router.get("/", async (req, res) => {
  try {
    const { collections } = await connectToDatabase();
    const images = await collections.images.find().sort({ createdAt: -1 }).toArray();
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
