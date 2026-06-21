const crypto = require("crypto");
const { normalizeSymbol, json, handleOptions, marketStatus } = require("../dataProviders/common");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const eastmoney = require("../dataProviders/eastmoney");
const { tryProviders, withQuoteMeta, quoteFromLastKline, failPayload } = require("../dataProviders/fallback");
const { cached, cacheKey, assertRateLimit } = require("../dataProviders/cache");

const MAX_BATCH_SIZE = 24;
const BATCH_CONCURRENCY = 5;
const SCORE_VERSION = "market-observation-v4.0.0";
const SCHEMA_VERSION = 4;

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const rawBatch = String(req.query?.symbols || "").trim();
  if (rawBatch) {
    await handleBatch(req, rawBatch, res);
    return;
  }

  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    const status = marketStatus();
    const timing = snapshotTiming(req.query?.bucket, status.marketStatus);
    const payload = await getQuote(meta);
    const snapshotId = createSnapshotId(timing.bucket, [payload]);
    setCacheHeaders(res, payload.mode, snapshotId);
    json(res, 200, {
      ...payload,
      schemaVersion: SCHEMA_VERSION,
      scoreVersion: SCORE_VERSION,
      snapshotId,
      generatedAt: timing.generatedAt,
      validUntil: timing.validUntil
    });
  } catch (error) {
    json(
      res,
      error.statusCode || 502,
      failPayload(
        meta?.symbol || String(req.query?.symbol || ""),
        error.message === "请求过于频繁，请稍后再试" ? error.message : "real quote unavailable",
        error
      )
    );
  }
};

async function handleBatch(req, rawBatch, res) {
  const symbols = [...new Set(rawBatch.split(",").map((item) => item.trim()).filter(Boolean))]
    .sort()
    .slice(0, MAX_BATCH_SIZE);

  if (!symbols.length) {
    json(res, 400, { ok: false, message: "symbols is required", items: [], failed: [] });
    return;
  }

  const status = marketStatus();
  const timing = snapshotTiming(req.query?.bucket, status.marketStatus);
  const batchKey = cacheKey(["batch-quote-v4", timing.bucket, ...symbols]);
  const ttl = timing.ttlMs;

  try {
    const response = await cached(batchKey, ttl, async () => {
      const rows = await mapPool(symbols, BATCH_CONCURRENCY, async (symbol) => {
        let meta;
        try {
          meta = normalizeSymbol(symbol);
          if (meta.type === "open_fund") throw new Error("open fund realtime quote is not supported");
          return await getQuote(meta);
        } catch (error) {
          return failPayload(meta?.symbol || symbol, error.message || "real quote unavailable", error);
        }
      });

      const items = rows.filter((row) => row?.ok).sort((a, b) => String(a.symbol).localeCompare(String(b.symbol)));
      const failed = rows.filter((row) => !row?.ok).map((row) => ({
        ok: false,
        symbol: row.symbol,
        message: row.message || "real quote unavailable",
        errors: row.errors || []
      })).sort((a, b) => String(a.symbol).localeCompare(String(b.symbol)));

      const modes = items.map((item) => item.mode).filter(Boolean);
      const mode = modes.includes("realtime") ? "realtime" : modes.includes("delayed") ? "delayed" : "historical";
      const snapshotId = createSnapshotId(timing.bucket, items);

      return {
        ok: items.length > 0,
        schemaVersion: SCHEMA_VERSION,
        scoreVersion: SCORE_VERSION,
        snapshotId,
        generatedAt: timing.generatedAt,
        validUntil: timing.validUntil,
        marketStatus: status.marketStatus,
        mode,
        symbols,
        count: items.length,
        failedCount: failed.length,
        items,
        failed,
        message: items.length ? "" : "all real quote providers unavailable"
      };
    });

    setCacheHeaders(res, response.mode, response.snapshotId);
    json(res, response.ok ? 200 : 502, response);
  } catch (error) {
    json(res, error.statusCode || 502, {
      ok: false,
      schemaVersion: SCHEMA_VERSION,
      scoreVersion: SCORE_VERSION,
      snapshotId: "",
      generatedAt: timing.generatedAt,
      validUntil: timing.validUntil,
      marketStatus: status.marketStatus,
      mode: "failed",
      symbols,
      count: 0,
      failedCount: symbols.length,
      items: [],
      failed: symbols.map((symbol) => ({ ok: false, symbol, message: error.message || "real quote unavailable" })),
      message: "all real quote providers unavailable"
    });
  }
}

async function getQuote(meta) {
  if (meta.type === "open_fund") throw new Error("open fund realtime quote is not supported");
  const key = cacheKey(["quote", meta.symbol]);
  const ttl = 15000;
  assertRateLimit(key, 900, ttl);
  return cached(key, ttl, async () => {
    try {
      const result = await tryProviders(meta, [eastmoney, sina, tencent], "quote");
      return withQuoteMeta(result.payload, meta);
    } catch (quoteError) {
      const result = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 120]);
      return quoteFromLastKline(meta, result.payload.items || result.payload, result.providerName);
    }
  });
}

function snapshotTiming(rawBucket, status) {
  const ttlMs = status === "trading" ? 30000 : 300000;
  const currentBucket = Math.floor(Date.now() / ttlMs);
  const candidate = Number(rawBucket);
  const bucket = Number.isInteger(candidate) && Math.abs(candidate - currentBucket) <= 1 ? candidate : currentBucket;
  const start = bucket * ttlMs;
  return {
    bucket,
    ttlMs,
    generatedAt: new Date(start).toISOString(),
    validUntil: new Date(start + ttlMs).toISOString()
  };
}

function createSnapshotId(bucket, items) {
  const fingerprint = items.map((item) => {
    const quote = item.quote || item;
    return [
      item.symbol || "",
      quote.price ?? quote.close ?? "",
      quote.preClose ?? "",
      quote.open ?? "",
      quote.high ?? "",
      quote.low ?? "",
      item.lastUpdated || item.dataDate || "",
      item.source || ""
    ].join("|");
  }).sort().join(";");
  return `s4_${crypto.createHash("sha256").update(`${bucket}|${fingerprint}`).digest("hex").slice(0, 16)}`;
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function setCacheHeaders(res, mode, snapshotId) {
  const seconds = mode === "realtime" ? 30 : 300;
  res.setHeader("cache-control", `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 3}`);
  res.setHeader("x-dashboard-schema", String(SCHEMA_VERSION));
  res.setHeader("x-score-version", SCORE_VERSION);
  if (snapshotId) res.setHeader("x-snapshot-id", snapshotId);
}
