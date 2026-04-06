const IORedis = require("ioredis");

function createRateLimiter({
  redisUrl,
  default: defaultConfig = {},
  sampleSaveRate = 0.1,
  saveEvent,
} = {}) {

  let redis;

  // ✅ Decide Redis or in-memory
  const useInMemory =
    process.env.NODE_ENV === "test" ||
    process.env.NO_REDIS === "1" ||
    !redisUrl;

  if (useInMemory) {
    console.warn("⚠️ Using in-memory rate limiter (Redis disabled)");

    const store = new Map();

    redis = {
      async consume_token(key, capacity, refill_per_ms, now, requested) {
        const entry = store.get(key) || { tokens: capacity, last: now };

        let tokens = entry.tokens;
        const delta = Math.max(0, now - entry.last);

        tokens = Math.min(capacity, tokens + delta * refill_per_ms);

        if (tokens >= requested) {
          tokens -= requested;
          store.set(key, { tokens, last: now });
          return [1, Math.floor(tokens), capacity];
        } else {
          const needed = requested - tokens;
          const retry_after_ms =
            refill_per_ms > 0
              ? Math.ceil(needed / refill_per_ms)
              : 60000;

          return [0, Math.floor(tokens), capacity, retry_after_ms];
        }
      },

      async incr(key) {
        const val = store.get(key) || 0;
        store.set(key, val + 1);
      },

      async lpush(key, value) {
        const arr = store.get(key) || [];
        arr.unshift(value);
        store.set(key, arr);
      },

      async ltrim(key, start, end) {
        const arr = store.get(key) || [];
        store.set(key, arr.slice(start, end + 1));
      },

      async get(key) {
        return store.get(key) || 0;
      },

      async lrange(key, start, end) {
        const arr = store.get(key) || [];
        return arr.slice(start, end + 1);
      },
    };

  } else {
    // ✅ Redis setup
    redis = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
    });

    redis.on("connect", () => {
      console.log("✅ Redis connected:", redisUrl);
    });

    redis.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
    });
  }

  // ✅ Token Bucket Lua Script
  const lua = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refill_per_ms = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requested = tonumber(ARGV[4])

  local data = redis.call('HMGET', key, 'tokens', 'last')
  local tokens = tonumber(data[1])
  local last = tonumber(data[2])

  if tokens == nil then tokens = capacity end
  if last == nil then last = now end

  local delta = math.max(0, now - last)
  local refill = delta * refill_per_ms
  tokens = math.min(capacity, tokens + refill)

  if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tostring(tokens), 'last', tostring(now))
    redis.call('PEXPIRE', key, 86400000)
    return {1, math.floor(tokens), capacity}
  else
    local needed = requested - tokens
    local retry_after_ms = 0

    if refill_per_ms > 0 then
      retry_after_ms = math.ceil(needed / refill_per_ms)
    else
      retry_after_ms = 60000
    end

    return {0, math.floor(tokens), capacity, retry_after_ms}
  end
  `;

  if (redis.defineCommand) {
    redis.defineCommand("consume_token", {
      numberOfKeys: 1,
      lua,
    });
  }

  const routeConfig = new Map();

  function getConfig() {
    return {
      default: defaultConfig,
      routes: Array.from(routeConfig.entries()).map(([k, v]) => ({
        route: k,
        ...v,
      })),
    };
  }

  function setRouteLimit(route, cfg) {
    routeConfig.set(route, cfg);
  }

  async function checkAndConsume({ key, route, requested = 1 }) {
    const cfg = routeConfig.get(route) || defaultConfig;

    const capacity = cfg.capacity || 100;
    const windowSec = cfg.windowSec || 60;

    const refill_per_ms = capacity / (windowSec * 1000);
    const now = Date.now();

    const res = await redis.consume_token(
      key,
      capacity,
      refill_per_ms,
      now,
      requested
    );

    const allowed = Number(res[0]) === 1;
    const remaining = Number(res[1]);
    const limit = Number(res[2]);
    const retryAfterMs = res[3] ? Number(res[3]) : 0;

    let resetMs = 0;
    if (refill_per_ms > 0) {
      resetMs = Math.ceil((limit - remaining) / refill_per_ms);
    }

    return { allowed, remaining, limit, retryAfterMs, resetMs };
  }

  function middlewareFactory({ route, identify } = {}) {
    route = route || "default";

    return async function (req, res, next) {
      try {
        const identityObj = identify ? identify(req) : { id: req.ip };
        const identity = identityObj.id || req.ip;

        const key = `${route}:${identity}`;

        const result = await checkAndConsume({ key, route });

        // ✅ USER ID
        const userId = req.user?.id || identity;

        // ✅ TOTAL
        await redis.incr(`user:${userId}:total`);

        // ❌ BLOCKED
        if (!result.allowed) {
          await redis.incr(`user:${userId}:blocked`);

          // 🔥 MongoDB LOG (BLOCKED)
          if (saveEvent && Math.random() < sampleSaveRate) {
            await saveEvent({
              userId,
              route,
              allowed: false,
              remaining: result.remaining,
              ip: req.ip,
            });
          }

          res.setHeader("Retry-After", Math.ceil(result.retryAfterMs / 1000));

          return res.status(429).json({
            message: "Too Many Requests ❌",
          });
        }

        // ✅ ALLOWED
        await redis.incr(`user:${userId}:allowed`);

        // 🔥 MongoDB LOG (ALLOWED)
        if (saveEvent && Math.random() < sampleSaveRate) {
          await saveEvent({
            userId,
            route,
            allowed: true,
            remaining: result.remaining,
            ip: req.ip,
          });
        }

        // ✅ TIMESTAMPS
        await redis.lpush(`user:${userId}:timestamps`, Date.now());
        await redis.ltrim(`user:${userId}:timestamps`, 0, 99);

        // ✅ HEADERS
        res.setHeader("X-RateLimit-Limit", result.limit);
        res.setHeader("X-RateLimit-Remaining", result.remaining);

        res.locals.remaining = result.remaining;

        next();
      } catch (err) {
        console.error("Rate limiter error:", err);
        next();
      }
    };
  }

  return {
    middleware: middlewareFactory,
    getConfig,
    setRouteLimit,
  };
}

module.exports = createRateLimiter;