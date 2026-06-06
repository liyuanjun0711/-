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
    const period = req.query?.period || "day";
    const count = Number(req.query?.count || 120);
    if (meta.type === "open_fund") throw new Error("open fund kline is not supported");
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", [period, count]);
    const status = marketStatus();
    json(res, 200, {
      ok: true,
      source: providerName,
      mode: status.mode === "realtime" ? "historical" : status.mode,
      marketStatus: status.marketStatus,
      symbol: meta.symbol,
      period,
      items: payload.items || payload
    });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "real kline unavailable", error));
  }
};
