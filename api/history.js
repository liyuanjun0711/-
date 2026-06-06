const { normalizeSymbol, json, handleOptions, marketStatus } = require("../lib/providers/common");
const eastmoney = require("../lib/providers/eastmoney");
const sina = require("../lib/providers/sina");
const tencent = require("../lib/providers/tencent");
const { tryProviders, failPayload } = require("../lib/providers/fallback");

function countFromRange(range) {
  const value = String(range || "30d").toLowerCase();
  if (value === "1y") return 260;
  if (value === "6m") return 130;
  if (value === "90d") return 90;
  if (value === "60d") return 60;
  const match = value.match(/^(\d+)d$/);
  return match ? Math.max(1, Math.min(Number(match[1]), 500)) : 30;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    if (meta.type === "open_fund") throw new Error("普通开放式基金历史净值接口暂未接入");
    const range = req.query?.range || "30d";
    const period = req.query?.period || "day";
    const count = countFromRange(range);
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", [period, count]);
    const items = payload.items || payload;
    const status = marketStatus();
    const last = items[items.length - 1];
    json(res, 200, {
      ok: true,
      source: providerName,
      sourceType: "real",
      cached: false,
      mode: "historical",
      marketStatus: status.marketStatus,
      symbol: meta.symbol,
      name: meta.name,
      code: meta.code,
      type: meta.type,
      market: meta.market,
      range,
      period,
      dataDate: last?.time || "",
      lastUpdated: last?.time || "",
      items
    });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "真实历史行情不可用", error));
  }
};
