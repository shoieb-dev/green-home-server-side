// config/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8su0x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

let client;
let db;
let collections;

async function connectToDatabase() {
  if (db && collections) return { db, collections };

  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });
    await client.connect();
    console.log("✅ MongoDB connected");
  }

  db = client.db("GreenHome");

  collections = {
    houses: db.collection("buyers"),
    bookings: db.collection("bookings"),
    reviews: db.collection("reviews"),
    users: db.collection("users"),
  };

  return { db, collections };
}

module.exports = connectToDatabase;
