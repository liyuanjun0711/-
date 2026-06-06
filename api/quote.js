const { normalizeSymbol, json, handleOptions } = require("../dataProviders/common");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const eastmoney = require("../dataProviders/eastmoney");
const { tryProviders, withQuoteMeta, quoteFromLastKline, failPayload } = require("../dataProviders/fallback");
const { cached, cacheKey, assertRateLimit } = require("../dataProviders/cache");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    if (meta.type === "open_fund") throw new Error("open fund realtime quote is not supported");
    const key = cacheKey(["quote", meta.symbol]);
    const ttl = 10000;
    assertRateLimit(key, 900, ttl);
    const payload = await cached(key, ttl, async () => {
      try {
        const result = await tryProviders(meta, [eastmoney, sina, tencent], "quote");
        return withQuoteMeta(result.payload, meta);
      } catch (quoteError) {
        const result = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 120]);
        return quoteFromLastKline(meta, result.payload.items || result.payload, result.providerName);
      }
    });
    json(res, 200, payload);
  } catch (error) {
    json(res, error.statusCode || 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), error.message === "请求过于频繁，请稍后再试" ? error.message : "real quote unavailable", error));
  }
};
