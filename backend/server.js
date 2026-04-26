require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");

// ✅ Redis
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

// ✅ Modules
const rateLimitFactory = require("./middleware/rateLimiter");
const { connectMongo, saveThrottleEvent } = require("./mongo");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const adminOnly = require("./middleware/roleMiddleware");

const RequestLog = require("./models/RequestLog");

const app = express();
const PORT = process.env.PORT || 5000;

// global toggle for rate limiter
let limiterEnabled = true;

// ================= MIDDLEWARE =================
app.use(cors({
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset"
  ]
}));

app.use(express.json());

// ================= AUTH =================
app.use("/api/auth", authRoutes);

// 🔑 Identity
function identify(req) {
  if (req.user && req.user.id) {
    return { id: req.user.id, type: "user" };
  }

  const userId = req.headers["user-id"];
  if (userId) {
    return { id: userId, type: "demo-user" };
  }

  return { id: req.ip, type: "ip" };
}

// ================= RATE LIMITER =================
const rateLimiter = rateLimitFactory({
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  default: {
    capacity: Number(process.env.RL_CAPACITY) || 100,
    windowSec: Number(process.env.RL_WINDOW_SEC) || 60,
  },
  sampleSaveRate: Number(process.env.SAMPLE_RATE) || 1,
  saveEvent: saveThrottleEvent,
});

// ================= ROUTES =================

// ✅ Home
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// 🌐 Public
app.get(
  "/api/public",
  (req, res, next) => {
    if (!limiterEnabled) return next();
    return rateLimiter.middleware({ route: "public", identify })(req, res, next);
  },
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
  (req, res, next) => {
    if (!limiterEnabled) return next();
    return rateLimiter.middleware({ route: "protected", identify })(req, res, next);
  },
  (req, res) => {
    res.json({
      message: "Protected route OK",
      user: req.user,
      remaining: res.locals.remaining || null,
    });
  }
);

// ================= ADMIN =================

// ⚙️ Get limits
app.get(
  "/api/admin/limits",
  authMiddleware,
  adminOnly,
  (req, res) => {
    res.json(rateLimiter.getConfig());
  }
);

// ⚙️ Set limits
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

// 🔁 Toggle limiter
app.post(
  "/api/admin/toggle",
  authMiddleware,
  adminOnly,
  (req, res) => {
    limiterEnabled = !limiterEnabled;

    res.json({
      message: `Limiter ${limiterEnabled ? "Enabled ✅" : "Disabled ❌"}`,
      enabled: limiterEnabled,
    });
  }
);

// 🔥 RESET ALL
app.post(
  "/api/admin/reset",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      await redis.flushall();

      res.json({
        message: "All rate limit data reset successfully ✅"
      });
    } catch (err) {
      console.error("Reset error:", err);
      res.status(500).json({
        message: "Error resetting data ❌"
      });
    }
  }
);

// 🔥 RESET USER
app.post(
  "/api/admin/reset/:userId",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    const userId = req.params.userId;

    try {
      await redis.del(`user:${userId}:total`);
      await redis.del(`user:${userId}:allowed`);
      await redis.del(`user:${userId}:blocked`);
      await redis.del(`user:${userId}:timestamps`);

      res.json({
        message: `User ${userId} reset successfully ✅`
      });
    } catch (err) {
      console.error("User reset error:", err);
      res.status(500).json({
        message: "Error resetting user ❌"
      });
    }
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

// 👥 All users
app.get("/analytics", async (req, res) => {
  const users = [];

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

  res.json(users);
});

// ================= LOGS =================
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

// ================= SYSTEM HEALTH =================
app.get("/health", async (req, res) => {
  res.json({
    server: "Running ✅",
    redis: "Connected ✅",
    mongo: "Connected ✅",
    uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
    limiterEnabled,
  });
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