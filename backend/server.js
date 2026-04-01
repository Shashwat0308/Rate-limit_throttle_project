require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Redis = require("ioredis");

// ✅ Redis setup
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

// ✅ Import modules
const rateLimitFactory = require("./middleware/rateLimiter");
const { connectMongo, saveThrottleEvent } = require("./mongo");

const app = express();

// ✅ Middlewares
app.use(cors({
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset"
  ]
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 🔑 Identity resolver
function identify(req) {
  const auth = req.headers["authorization"];

  if (auth && auth.startsWith("Bearer ")) {
    try {
      const token = auth.split(" ")[1];
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "devsecret"
      );
      if (payload && payload.sub) return { id: payload.sub, type: "user" };
    } catch (e) {}
  }

  if (req.headers["x-api-key"])
    return { id: req.headers["x-api-key"], type: "api-key" };

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

// 🔐 Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username === "user1" && password === "password123") {
    const token = jwt.sign(
      { sub: "user1", role: "standard" },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "1h" }
    );
    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid credentials" });
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
  rateLimiter.middleware({ route: "protected", identify }),
  (req, res) => {
    res.json({
      message: "Protected route OK",
      remaining: res.locals.remaining || null,
    });
  }
);

// ⚙️ Admin
app.get("/api/admin/limits", (req, res) => {
  res.json(rateLimiter.getConfig());
});

app.post("/api/admin/limits", (req, res) => {
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
});


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


// ================= START SERVER =================

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