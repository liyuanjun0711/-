const { json, handleOptions } = require("../lib/providers/common");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  json(res, 501, {
    ok: false,
    mode: "failed",
    message: "真实新闻接口暂未接入，前端保留本地复盘新闻，不伪装实时新闻",
    items: []
  });
};
