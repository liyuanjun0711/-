const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const reportText = fs.readFileSync("report-data.js", "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(reportText, context);
const data = context.window.MARKET_BRIEFING_DATA;

const expectedMap = `action: { title: "今日操作", sections: ["trade-decision", "one-sentence", "execution-list", "trade-plan", "do-not-do"] },
    quote: { title: "持仓行情与走势", sections: ["quote-search", "holding-quotes", "prediction-overview", "risk-trigger", "quote-watchlist"] },
    news: { title: "市场新闻与机会", sections: ["holding-news", "market-risk", "hot-review", "sector-move", "watchlist"] },
    logic: { title: "今日交易逻辑", sections: ["reasoning", "invalid-conditions", "learning-framework", "cancel-plan", "next-watch"] }`;
assert(app.includes(expectedMap), "sectionMap drift");

for (const method of ["search(keyword)", "getQuote(symbol, bucket)", "getIntraday(symbol)", "getDailyKline(symbol)", "getFundInfo(symbol)"]) {
  assert(app.includes(method), `dataProvider method missing: ${method}`);
}
for (const route of ["/api/search?keyword=", "/api/quote?symbol=", "/api/intraday?symbol=", "/api/kline?symbol=", "/api/fund?symbol="]) {
  assert(app.includes(route), `route missing: ${route}`);
}
for (const forbidden of ["footerTabs", "mobileTabs", "bottomNav", "trend: {", "intraday-chart", "daily-kline", "realtime-kline", "position-expectation"]) {
  assert(!html.includes(forbidden) && !app.includes(forbidden), `forbidden module: ${forbidden}`);
}

assert.strictEqual((html.match(/data-view=/g) || []).length, 4, "html must have exactly four data-view buttons");
assert.strictEqual((app.match(/const sectionMap =/g) || []).length, 1, "sectionMap must be unique");
for (const label of ["09:30", "10:30", "11:30", "13:00", "14:00", "15:00"]) assert(app.includes(label), `intraday axis label missing: ${label}`);
assert(app.includes("timeVisible") && app.includes("tickMarkFormatter"), "chart time axis config missing");
assert(app.includes("真实分时暂无；不绘制假线。") && app.includes("真实日K暂无；不绘制假K线。"), "chart failure labels missing");
assert(app.includes("开放式基金按净值披露，不提供盘中K线"), "open-fund disclosure missing");

assert.strictEqual(data.date, "2026-09-10");
assert.strictEqual(data.portfolioVersion, "portfolio-2026-09-10-premarket-v1");
assert.strictEqual(data.holdings.length, 8);
assert.strictEqual(data.watchlist.length, 6);
assert.strictEqual(data.newsItems.length, 9);
assert(data.newsItems.filter((item) => String(item.sector).includes("过去24小时")).length >= 3, "past-24h coverage missing");
assert(data.holdings.every((item) => item.lastTradeDate === "2026-09-09" && Number(item.lastClose) > 0), "holding quote baseline invalid");
assert(data.watchlist.every((item) => item.lastTradeDate === "2026-09-09" && Number(item.lastClose) > 0), "watchlist baseline invalid");

for (const privatePhrase of ["总资产", "持仓金额", "持仓市值", "现金余额", "盈亏金额", "银证转账金额", "账号标识", "银行卡", "账户规模"]) {
  assert(!reportText.includes(privatePhrase), `privacy-sensitive wording found: ${privatePhrase}`);
}

const expected = {
  "159740": [0.554, 0.548, 0.554, 0.546, -1.08],
  "164701": [1.692, 1.702, 1.708, 1.691, -0.06],
  "512710": [0.643, 0.655, 0.661, 0.641, 1.55],
  "161226": [1.936, 1.963, 1.964, 1.932, 0.87],
  "159608": [1.049, 1.055, 1.060, 1.042, 0.67],
  "159241": [1.073, 1.091, 1.103, 1.072, 1.49],
  "562350": [1.100, 1.108, 1.108, 1.091, 1.00],
  "002090": [9.32, 9.28, 9.35, 9.23, -0.54],
  "601208": [47.90, 47.17, 48.31, 46.71, -0.51],
  "600050": [4.24, 4.21, 4.26, 4.19, -0.71],
  "002466": [45.34, 45.56, 45.79, 45.05, -0.07],
  "688981": [122.12, 120.51, 122.96, 120.06, -0.83],
  "161725": [0.559, 0.554, 0.560, 0.551, -1.25],
  "005827": [null, 1.5053, null, null, -0.37]
};
for (const item of [...data.holdings, ...data.watchlist]) {
  const actual = [item.lastOpen, item.lastClose, item.lastHigh, item.lastLow, item.lastChangePercent];
  assert.deepStrictEqual(actual, expected[item.code], `${item.code} quote mismatch`);
}

console.log("report contract ok", {
  tabs: 4,
  holdings: data.holdings.length,
  watchlist: data.watchlist.length,
  news: data.newsItems.length,
  past24h: data.newsItems.filter((item) => String(item.sector).includes("过去24小时")).length,
  quoteTieOut: Object.keys(expected).length
});
