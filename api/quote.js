const { normalizeSymbol, json, handleOptions } = require("../dataProviders/common");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const eastmoney = require("../dataProviders/eastmoney");
const { tryProviders, withQuoteMeta, quoteFromLastKline, failPayload } = require("../dataProviders/fallback");
const { cached, cacheKey, assertRateLimit } = require("../dataProviders/cache");

const MAX_BATCH_SIZE = 24;
const BATCH_CONCURRENCY = 5;

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const rawBatch = String(req.query?.symbols || "").trim();
  if (rawBatch) {
    await handleBatch(rawBatch, res);
    return;
  }

  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    const payload = await getQuote(meta);
    setCacheHeaders(res, payload.mode);
    json(res, 200, payload);
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

async function handleBatch(rawBatch, res) {
  const symbols = [...new Set(rawBatch.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, MAX_BATCH_SIZE);
  if (!symbols.length) {
    json(res, 400, { ok: false, message: "symbols is required", items: [], failed: [] });
    return;
  }

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

  const items = rows.filter((row) => row?.ok);
  const failed = rows.filter((row) => !row?.ok).map((row) => ({
    ok: false,
    symbol: row.symbol,
    message: row.message || "real quote unavailable",
    errors: row.errors || []
  }));

  const modes = items.map((item) => item.mode).filter(Boolean);
  const mode = modes.includes("realtime") ? "realtime" : modes.includes("delayed") ? "delayed" : "historical";
  setCacheHeaders(res, mode);
  json(res, items.length ? 200 : 502, {
    ok: items.length > 0,
    mode,
    requestedAt: new Date().toISOString(),
    count: items.length,
    failedCount: failed.length,
    items,
    failed,
    message: items.length ? "" : "all real quote providers unavailable"
  });
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

function setCacheHeaders(res, mode) {
  const seconds = mode === "realtime" ? 10 : 120;
  res.setHeader("cache-control", `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}`);
}
