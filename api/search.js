const { localSearch, json, handleOptions } = require("../dataProviders/common");
const eastmoney = require("../dataProviders/eastmoney");
const { cached, cacheKey, assertRateLimit } = require("../dataProviders/cache");

function normalizeItem(item) {
  return {
    name: item.name,
    code: item.code,
    type: item.type,
    market: item.market,
    symbol: item.symbol,
    sinaSymbol: item.sinaSymbol,
    tencentSymbol: item.tencentSymbol,
    eastmoneySecid: item.eastmoneySecid,
    exchange: item.exchange,
    sector: item.sector || "",
    source: item.source || "local-symbol-map"
  };
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.symbol || `${item.market}${item.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const keyword = req.query?.keyword || req.query?.symbol || "";
  const localItems = localSearch(keyword).map(normalizeItem);
  try {
    const key = cacheKey(["search", keyword]);
    const ttl = 10 * 60 * 1000;
    assertRateLimit(key, 900, ttl);
    const response = await cached(key, ttl, async () => {
      const remoteItems = (await eastmoney.search(keyword)).map(normalizeItem);
      return {
        ok: true,
        source: "eastmoney",
        fallbackSource: localItems.length ? "local-symbol-map" : "",
        items: dedupe([...remoteItems, ...localItems])
      };
    });
    json(res, 200, response);
  } catch (error) {
    if (error.statusCode) {
      json(res, error.statusCode, { ok: false, mode: "failed", message: error.message, items: [] });
      return;
    }
    json(res, 200, {
      ok: true,
      source: "local-symbol-map",
      warning: "真实搜索接口不可用，已使用本地持仓表",
      errors: [error.message],
      items: localItems
    });
  }
};
