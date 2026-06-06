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
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 8]);
    const items = payload.items || payload;
    const last = items[items.length - 1];
    if (!last?.time) throw new Error("last trading day unavailable");
    json(res, 200, { ok: true, symbol: meta.symbol, tradeDate: String(last.time).slice(0, 10), source: providerName });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "最近交易日获取失败", error));
  }
};
