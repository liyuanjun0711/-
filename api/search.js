const { localSearch, json, handleOptions } = require("../lib/providers/common");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const keyword = req.query?.keyword || req.query?.symbol || "";
  const items = localSearch(keyword).map((item) => ({
    name: item.name,
    code: item.code,
    type: item.type,
    market: item.market,
    symbol: item.symbol,
    sector: item.sector
  }));
  json(res, 200, { ok: true, source: "local-symbol-map", items });
};
