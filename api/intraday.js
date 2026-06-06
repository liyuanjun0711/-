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
    if (meta.type === "open_fund") throw new Error("open fund intraday is not supported");
    const tradeDate = req.query?.date || req.query?.tradeDate || "";
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "intraday", [tradeDate]);
    const status = marketStatus();
    json(res, 200, {
      ok: true,
      source: providerName,
      mode: status.mode,
      marketStatus: status.marketStatus,
      symbol: meta.symbol,
      period: "intraday",
      items: payload.items || payload
    });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "real intraday unavailable", error));
  }
};
