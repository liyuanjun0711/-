const { normalizeSymbol, json, handleOptions } = require("../dataProviders/common");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
  } catch (error) {
    json(res, 400, { ok: false, mode: "failed", message: "invalid fund symbol" });
    return;
  }
  json(res, 501, {
    ok: false,
    mode: "failed",
    symbol: meta.symbol,
    message: "open fund NAV provider is not connected"
  });
};
