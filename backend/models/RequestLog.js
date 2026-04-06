const mongoose = require("mongoose");

const requestLogSchema = new mongoose.Schema({
  userId: String,
  route: String,
  status: String, // allowed / blocked
  timestamp: {
    type: Date,
    default: Date.now,
  },
  remainingTokens: Number,
  ip: String,
});

module.exports = mongoose.model("RequestLog", requestLogSchema);