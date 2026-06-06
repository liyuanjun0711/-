const { json, handleOptions } = require("../dataProviders/common");
const { searchNews } = require("../dataProviders/news");
const { cached, cacheKey, assertRateLimit } = require("../dataProviders/cache");

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
    const limit = Number(req.query?.limit || 12);
    const key = cacheKey(["news", symbols.join("|"), keywords.join("|"), limit]);
    const ttl = 15 * 60 * 1000;
    assertRateLimit(key, 1200, ttl);
    const response = await cached(key, ttl, async () => {
      const items = await searchNews({ symbols, keywords, limit });
      return {
        ok: true,
        source: "configured-news-sources",
        mode: "real",
        lastUpdated: new Date().toISOString(),
        items
      };
    });
    json(res, 200, response);
  } catch (error) {
    json(res, error.statusCode || 502, {
      ok: false,
      mode: "failed",
      message: error.message === "请求过于频繁，请稍后再试" ? error.message : "真实新闻数据获取失败",
      errors: error.errors || [error.message],
      items: []
    });
  }
};
