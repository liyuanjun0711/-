const { normalizeSymbol, json, handleOptions, marketStatus } = require("../dataProviders/common");
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
    const prev = items[items.length - 2];
    if (!last) throw new Error("daily summary unavailable");
    const status = marketStatus();
    const preClose = prev?.close ?? null;
    json(res, 200, {
      ok: true,
      source: providerName,
      mode: "historical",
      marketStatus: status.marketStatus,
      symbol: meta.symbol,
      tradeDate: String(last.time).slice(0, 10),
      open: last.open,
      high: last.high,
      low: last.low,
      close: last.close,
      price: last.close,
      preClose,
      change: last.close != null && preClose != null ? last.close - preClose : null,
      changePercent: last.close != null && preClose ? ((last.close - preClose) / preClose) * 100 : last.changePercent,
      volume: last.volume,
      amount: last.amount
    });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "daily summary unavailable", error));
  }
};
