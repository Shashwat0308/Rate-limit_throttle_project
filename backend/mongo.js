const RequestLog = require("./models/RequestLog");
const mongoose = require("mongoose");


async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected ✅");
}

// ✅ Save event (SMART logging)
async function saveThrottleEvent(event) {
  try {
    const log = new RequestLog({
      userId: event.userId,
      route: event.route,
      status: event.allowed ? "allowed" : "blocked",
      remainingTokens: event.remaining,
      ip: event.ip,
    });

    await log.save();
  } catch (err) {
    console.error("Mongo save error:", err.message);
  }
}

module.exports = { connectMongo, saveThrottleEvent };