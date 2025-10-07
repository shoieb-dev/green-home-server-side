const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const dotenv = require("dotenv");
const connectToDatabase = require("./config/db");

const houseRoutes = require("./routes/houseRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const uploadRoute = require("./routes/uploadRoute");
const dashboardRoutes = require("./routes/dashboardRoutes");

const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// --- Security Middlewares --- //
app.use(helmet()); // Set secure HTTP headers

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable old headers
});

app.use(limiter);

// Prevent MongoDB operator injection
app.use(mongoSanitize());

app.use(xss());

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/houses", houseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/images", uploadRoute);
app.use("/api/dashboard", dashboardRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Green Home Server is running.");
});

// 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(errorHandler);

// Start server
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  });
