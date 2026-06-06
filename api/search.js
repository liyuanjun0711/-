const { localSearch, json, handleOptions } = require("../dataProviders/common");
const eastmoney = require("../dataProviders/eastmoney");

function normalizeItem(item) {
  return {
    name: item.name,
    code: item.code,
    type: item.type,
    market: item.market,
    symbol: item.symbol,
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
    const remoteItems = (await eastmoney.search(keyword)).map(normalizeItem);
    json(res, 200, {
      ok: true,
      source: "eastmoney",
      fallbackSource: localItems.length ? "local-symbol-map" : "",
      items: dedupe([...remoteItems, ...localItems])
    });
  } catch (error) {
    json(res, 200, {
      ok: true,
      source: "local-symbol-map",
      warning: "真实搜索接口不可用，已使用本地持仓表",
      errors: [error.message],
      items: localItems
    });
  }
};
