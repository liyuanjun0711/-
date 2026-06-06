const store = new Map();
const recentHits = new Map();

function cacheKey(parts) {
  return parts.map((part) => String(part ?? "")).join(":");
}

async function cached(key, ttlMs, producer) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && now - hit.time < ttlMs) {
    return { ...clone(hit.value), cached: true, cacheTime: new Date(hit.time).toISOString() };
  }
  const value = await producer();
  store.set(key, { time: now, value: clone(value) });
  return { ...value, cached: false };
}

function assertRateLimit(key, windowMs = 1000, cacheTtlMs = 0) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && cacheTtlMs && now - hit.time < cacheTtlMs) return;
  const last = recentHits.get(key) || 0;
  if (now - last < windowMs) {
    const error = new Error("请求过于频繁，请稍后再试");
    error.statusCode = 429;
    throw error;
  }
  recentHits.set(key, now);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = { cacheKey, cached, assertRateLimit };
