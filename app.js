const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectToDatabase = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Routes
const houseRoutes = require("./routes/houseRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB connection setup
connectToDatabase()
  .then(() => {
    console.log("🚀 Connected to database");

    // Routes
    app.use("/api/houses", houseRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/reviews", reviewRoutes);

    app.get("/", (req, res) => {
      res.send("Green Home Server is running.");
    });

    // 404 Route Handler
    app.use((req, res, next) => {
      res.status(404).json({ success: false, message: "Route not found" });
    });

    // Error Handler
    app.use(errorHandler);
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database", err);
  });

module.exports = app;
