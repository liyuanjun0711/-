const { normalizeSymbol, json, handleOptions } = require("../lib/providers/common");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
  } catch (error) {
    json(res, 400, { ok: false, mode: "failed", message: "基金代码无效" });
    return;
  }
  json(res, 501, {
    ok: false,
    mode: "failed",
    symbol: meta.symbol,
    message: "普通开放式基金净值接口暂未接入，不显示伪净值"
  });
};
