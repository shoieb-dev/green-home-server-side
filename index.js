const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const connectToDatabase = require("./db");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// === ROUTES ===

// Home Route
app.get("/", (req, res) => {
  res.send("Hello Green Home Backend!");
});

// GET All Houses
app.get("/houses", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const houses = await db.collection("buyers").find({}).toArray();
    res.send(houses);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch houses");
  }
});

// GET Single House by ID
app.get("/houses/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const house = await db.collection("buyers").findOne({ _id: ObjectId(req.params.id) });
    res.json(house);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch house");
  }
});

// POST New House
app.post("/houses", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection("buyers").insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add house");
  }
});

// DELETE House
app.delete("/houses/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection("buyers").deleteOne({ _id: ObjectId(req.params.id) });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete house");
  }
});

// POST New Booking
app.post("/bookings", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection("bookings").insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add booking");
  }
});

// GET Bookings by Email
app.get("/myApartments/:email", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection("bookings").find({ email: req.params.email }).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch bookings");
  }
});

// DELETE Booking by Email
app.delete("/myApartments/:email", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection("bookings").deleteOne({ email: req.params.email });
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete booking");
  }
});

// POST New Review
app.post("/reviews", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection("reviews").insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add review");
  }
});

// GET All Reviews
app.get("/reviews", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const reviews = await db.collection("reviews").find({}).toArray();
    res.send(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch reviews");
  }
});

// Check if User is Admin
app.get("/users/:email", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const user = await db.collection("users").findOne({ email: req.params.email });
    const isAdmin = user?.role === "admin";
    res.json({ admin: isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to check admin status");
  }
});

// Add New User
app.post("/users", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const result = await db.collection("users").insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add user");
  }
});

// Upsert User
app.put("/users", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const filter = { email: req.body.email };
    const options = { upsert: true };
    const updateDoc = { $set: req.body };
    const result = await db.collection("users").updateOne(filter, updateDoc, options);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update user");
  }
});

// Set Admin Role
app.put("/users/admin", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const filter = { email: req.body.email };
    const updateDoc = { $set: { role: "admin" } };
    const result = await db.collection("users").updateOne(filter, updateDoc);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to set admin role");
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Green Home server running at http://localhost:${port}`);
});
