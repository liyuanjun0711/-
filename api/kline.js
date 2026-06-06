const { normalizeSymbol, json, handleOptions, marketStatus } = require("../lib/providers/common");
const eastmoney = require("../lib/providers/eastmoney");
const sina = require("../lib/providers/sina");
const tencent = require("../lib/providers/tencent");
const { tryProviders, failPayload } = require("../lib/providers/fallback");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    const period = req.query?.period || "day";
    const count = Number(req.query?.count || 120);
    if (meta.type === "open_fund") throw new Error("普通开放式基金不显示伪K线");
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
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "真实K线不可用", error));
  }
};
