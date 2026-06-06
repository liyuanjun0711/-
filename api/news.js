const { json, handleOptions } = require("../dataProviders/common");
const { searchNews } = require("../dataProviders/news");

function listParam(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    const symbols = listParam(req.query?.symbols);
    const keywords = listParam(req.query?.keywords || req.query?.keyword);
    const items = await searchNews({ symbols, keywords, limit: Number(req.query?.limit || 12) });
    json(res, 200, {
      ok: true,
      source: "configured-news-sources",
      mode: "real",
      lastUpdated: new Date().toISOString(),
      items
    });
  } catch (error) {
    json(res, 502, {
      ok: false,
      mode: "failed",
      message: "真实新闻数据获取失败",
      errors: error.errors || [error.message],
      items: []
    });
  }
};
