require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");
const jwt = require("jsonwebtoken");

// ✅ Redis
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

// ✅ Modules
const rateLimitFactory = require("./middleware/rateLimiter");
const { connectMongo, saveThrottleEvent } = require("./mongo");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const adminOnly = require("./middleware/roleMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors({
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset"
  ]
}));

app.use(express.json());

// ✅ Auth routes
app.use("/api/auth", authRoutes);

// 🔑 Identity (IMPORTANT FIX)
function identify(req) {
  if (req.user && req.user.id) {
    return { id: req.user.id, type: "user" };
  }

  // fallback → demo users (for old UI)
  const userId = req.headers["user-id"];
  if (userId) {
    return { id: userId, type: "demo-user" };
  }

  return { id: req.ip, type: "ip" };
}

// ⚡ Rate limiter
const rateLimiter = rateLimitFactory({
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  default: {
    capacity: Number(process.env.RL_CAPACITY) || 100,
    windowSec: Number(process.env.RL_WINDOW_SEC) || 60,
  },
  sampleSaveRate: Number(process.env.SAMPLE_RATE) || 0.1,
  saveEvent: saveThrottleEvent,
});


// ================= ROUTES =================

// ✅ Health
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// 🌐 Public
app.get(
  "/api/public",
  rateLimiter.middleware({ route: "public", identify }),
  (req, res) => {
    res.json({
      message: "Public route OK",
      remaining: res.locals.remaining || null,
    });
  }
);

// 🔒 Protected
app.get(
  "/api/protected",
  authMiddleware,
  rateLimiter.middleware({ route: "protected", identify }),
  (req, res) => {
    res.json({
      message: "Protected route OK",
      user: req.user,
      remaining: res.locals.remaining || null,
    });
  }
);

// ⚙️ Admin
app.get(
  "/api/admin/limits",
  authMiddleware,
  adminOnly,
  (req, res) => {
    res.json(rateLimiter.getConfig());
  }
);

app.post(
  "/api/admin/limits",
  authMiddleware,
  adminOnly,
  (req, res) => {
    const { route, capacity, windowSec } = req.body || {};

    if (!route || !capacity) {
      return res.status(400).json({
        message: "route and capacity required",
      });
    }

    rateLimiter.setRouteLimit(route, {
      capacity: Number(capacity),
      windowSec: Number(windowSec) || undefined,
    });

    res.json({ ok: true });
  }
);


// ================= ANALYTICS =================

// 👤 Single user
app.get("/analytics/:userId", async (req, res) => {
  const userId = req.params.userId;

  const total = await redis.get(`user:${userId}:total`) || 0;
  const allowed = await redis.get(`user:${userId}:allowed`) || 0;
  const blocked = await redis.get(`user:${userId}:blocked`) || 0;
  const timestamps = await redis.lrange(`user:${userId}:timestamps`, 0, -1);

  res.json({
    userId,
    total,
    allowed,
    blocked,
    timestamps
  });
});

// 👥 All users (FIXED + HYBRID)
app.get("/analytics", async (req, res) => {
  const users = [];

  // ✅ OLD demo users (user1 → user10)
  for (let i = 1; i <= 10; i++) {
    const userId = `user${i}`;

    const total = await redis.get(`user:${userId}:total`) || 0;
    const blocked = await redis.get(`user:${userId}:blocked`) || 0;
    const timestamps = await redis.lrange(`user:${userId}:timestamps`, 0, -1);

    users.push({
      userId,
      total,
      blocked,
      timestamps
    });
  }

  // ✅ NEW: include logged-in JWT user (IMPORTANT)
  const jwtUserId = "user1"; // 👈 keep same as login

  const total = await redis.get(`user:${jwtUserId}:total`) || 0;
  const blocked = await redis.get(`user:${jwtUserId}:blocked`) || 0;
  const timestamps = await redis.lrange(`user:${jwtUserId}:timestamps`, 0, -1);

  // override user1 with real data
  users[0] = {
    userId: jwtUserId,
    total,
    blocked,
    timestamps
  };

  res.json(users);
});

const RequestLog = require("./models/RequestLog");

// 📊 Get logs from MongoDB
app.get("/logs", async (req, res) => {
  try {
    const logs = await RequestLog.find()
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs" });
  }
});


// ================= START =================

async function startServer() {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
  }
}

startServer();

module.exports = app;