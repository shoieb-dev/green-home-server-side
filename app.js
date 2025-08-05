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
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB connection setup
connectToDatabase()
  .then(() => {
    console.log("🚀 Server is ready");

    // Routes
    app.use("/api/houses", houseRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/reviews", reviewRoutes);

    // 404 Route Handler (Optional)
    app.use((req, res, next) => {
      res.status(404).json({ success: false, message: "Route not found" });
    });

    // Error Handler
    app.use(errorHandler);

    // Start server
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database", err);
    process.exit(1); // Exit app if DB connection fails
  });

module.exports = app;
