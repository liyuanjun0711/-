const { normalizeSymbol, json, handleOptions, marketStatus } = require("../dataProviders/common");
const eastmoney = require("../dataProviders/eastmoney");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const { tryProviders, failPayload } = require("../dataProviders/fallback");
const { cached, cacheKey, assertRateLimit } = require("../dataProviders/cache");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    const period = req.query?.period || "day";
    const count = Number(req.query?.count || 120);
    if (meta.type === "open_fund") throw new Error("open fund kline is not supported");
    const key = cacheKey(["kline", meta.symbol, period, count]);
    const ttl = period === "day" ? 3 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000;
    assertRateLimit(key, 900, ttl);
    const response = await cached(key, ttl, async () => {
      const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", [period, count]);
      const status = marketStatus();
      const items = payload.items || payload;
      const last = items[items.length - 1];
      return {
        ok: true,
        source: providerName,
        mode: status.mode === "realtime" ? "historical" : status.mode,
        marketStatus: status.marketStatus,
        symbol: meta.symbol,
        name: meta.name,
        code: meta.code,
        market: meta.market,
        type: meta.type,
        period,
        dataDate: last?.time || "",
        lastUpdated: last?.time || "",
        items
      };
    });
    json(res, 200, response);
  } catch (error) {
    json(res, error.statusCode || 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), error.message === "请求过于频繁，请稍后再试" ? error.message : "real kline unavailable", error));
  }
};
