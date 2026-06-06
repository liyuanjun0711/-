const { normalizeSymbol, json, handleOptions } = require("../dataProviders/common");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const eastmoney = require("../dataProviders/eastmoney");
const { tryProviders, withQuoteMeta, quoteFromLastKline, failPayload } = require("../dataProviders/fallback");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    if (meta.type === "open_fund") throw new Error("open fund realtime quote is not supported");
    try {
      const { payload } = await tryProviders(meta, [sina, tencent, eastmoney], "quote");
      json(res, 200, withQuoteMeta(payload, meta));
    } catch (quoteError) {
      const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 120]);
      json(res, 200, quoteFromLastKline(meta, payload.items || payload, providerName));
    }
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "real quote unavailable", error));
  }
};
