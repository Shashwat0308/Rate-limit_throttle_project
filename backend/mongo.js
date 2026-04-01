const mongoose = require("mongoose");

// Connect MongoDB
async function connectMongo() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/rateLimiterDB");
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error ❌", err);
  }
}

// Schema for storing throttled requests
const throttleSchema = new mongoose.Schema({
  id: String,
  type: String,
  route: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Model
const Throttle = mongoose.model("Throttle", throttleSchema);

// Save throttling event
async function saveThrottleEvent(data) {
  try {
    await Throttle.create(data);
  } catch (err) {
    console.error("Error saving throttle event ❌", err);
  }
}

module.exports = { connectMongo, saveThrottleEvent };