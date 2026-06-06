const { normalizeSymbol, json, handleOptions } = require("../dataProviders/common");
const eastmoney = require("../dataProviders/eastmoney");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const { tryProviders, failPayload } = require("../dataProviders/fallback");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 30]);
    const items = payload.items || payload;
    const dates = items.map((row) => String(row.time).slice(0, 10)).filter(Boolean);
    json(res, 200, {
      ok: true,
      source: providerName,
      sourceType: "real",
      cached: false,
      symbol: meta.symbol,
      name: meta.name,
      code: meta.code,
      type: meta.type,
      market: meta.market,
      lastTradeDate: dates[dates.length - 1] || "",
      previousTradeDate: dates[dates.length - 2] || "",
      dates
    });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "真实交易日数据不可用", error));
  }
};
