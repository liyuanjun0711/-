const { normalizeSymbol, json, handleOptions } = require("../lib/providers/common");
const sina = require("../lib/providers/sina");
const tencent = require("../lib/providers/tencent");
const eastmoney = require("../lib/providers/eastmoney");
const { tryProviders, withQuoteMeta, quoteFromLastKline, failPayload } = require("../lib/providers/fallback");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    if (meta.type === "open_fund") throw new Error("普通开放式基金不支持盘中实时行情");
    try {
      const { payload } = await tryProviders(meta, [sina, tencent, eastmoney], "quote");
      json(res, 200, withQuoteMeta(payload, meta));
    } catch (quoteError) {
      const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 120]);
      json(res, 200, quoteFromLastKline(meta, payload.items || payload, providerName));
    }
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "真实行情获取失败", error));
  }
};
