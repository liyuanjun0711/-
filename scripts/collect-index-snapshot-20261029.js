const fs = require("fs");
const { normalizeSymbol } = require("../dataProviders/common");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const eastmoney = require("../dataProviders/eastmoney");

const indexes = [
  { symbol: "SH000001", name: "上证指数" },
  { symbol: "SZ399001", name: "深证成指" },
  { symbol: "SZ399006", name: "创业板指" },
  { symbol: "SH000688", name: "科创50" }
];

async function readProvider(provider, meta) {
  try {
    const [quote, bars] = await Promise.all([provider.quote(meta), provider.kline(meta, "day", 5)]);
    return { provider: provider.providerName, ok: true, quote, lastBar: bars.at(-1) || null };
  } catch (error) {
    return { provider: provider.providerName, ok: false, error: error.message };
  }
}

(async () => {
  const rows = [];
  for (const index of indexes) {
    const meta = normalizeSymbol(index.symbol);
    const providers = await Promise.all([sina, tencent, eastmoney].map((provider) => readProvider(provider, meta)));
    rows.push({ ...index, providers });
  }
  const snapshot = { collectedAt: new Date().toISOString(), rows };
  fs.writeFileSync("scripts/index-snapshot-20261029.json", `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(snapshot, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
