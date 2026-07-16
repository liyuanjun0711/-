const { normalizeSymbol, json, handleOptions, marketStatus } = require("../dataProviders/common");
const eastmoney = require("../dataProviders/eastmoney");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const { tryProvidersFast, failPayload } = require("../dataProviders/fallback");
const { cached, cacheKey, assertRateLimit } = require("../dataProviders/cache");

function countFromRange(range) {
  const value = String(range || "30d").toLowerCase();
  if (value === "1y") return 260;
  if (value === "6m") return 130;
  if (value === "90d") return 90;
  if (value === "60d") return 60;
  const match = value.match(/^(\d+)d$/);
  return match ? Math.max(1, Math.min(Number(match[1]), 500)) : 30;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    if (meta.type === "open_fund") throw new Error("open fund history is not connected");
    const range = req.query?.range || "30d";
    const period = req.query?.period || "day";
    const count = countFromRange(range);
    const key = cacheKey(["history", meta.symbol, range, period]);
    const ttl = 3 * 60 * 60 * 1000;
    assertRateLimit(key, 900, ttl);
    const response = await cached(key, ttl, async () => {
      const { payload, providerName } = await tryProvidersFast(meta, [sina, tencent, eastmoney], "kline", [period, count], 4500);
      const items = payload.items || payload;
      const status = marketStatus();
      const last = items[items.length - 1];
      return {
        ok: true,
        source: providerName,
        sourceType: "real",
        mode: "historical",
        marketStatus: status.marketStatus,
        symbol: meta.symbol,
        name: meta.name,
        code: meta.code,
        type: meta.type,
        market: meta.market,
        range,
        period,
        dataDate: last?.time || "",
        lastUpdated: last?.time || "",
        items
      };
    });
    json(res, 200, response);
  } catch (error) {
    json(res, error.statusCode || 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), error.message === "请求过于频繁，请稍后再试" ? error.message : "real history unavailable", error));
  }
};
