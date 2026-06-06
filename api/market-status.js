const { json, handleOptions, marketStatus } = require("../dataProviders/common");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const status = marketStatus();
  json(res, 200, { ok: true, ...status, status: status.marketStatus });
};
