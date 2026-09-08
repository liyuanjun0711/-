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

assert.strictEqual(data.date, "2026-09-09");
assert.strictEqual(data.portfolioVersion, "portfolio-2026-09-09-premarket-v1");
assert.strictEqual(data.holdings.length, 8);
assert.strictEqual(data.watchlist.length, 6);
assert.strictEqual(data.newsItems.length, 7);
assert(data.newsItems.filter((item) => String(item.sector).includes("过去24小时")).length >= 3, "past-24h coverage missing");
assert(data.holdings.every((item) => item.lastTradeDate === "2026-09-08" && Number(item.lastClose) > 0), "holding quote baseline invalid");
assert(data.watchlist.every((item) => item.lastTradeDate === (item.type === "open_fund" ? "2026-09-07" : "2026-09-08") && Number(item.lastClose) > 0), "watchlist baseline invalid");

for (const privatePhrase of ["总资产", "持仓金额", "持仓市值", "现金余额", "盈亏金额", "银证转账金额", "账号标识", "银行卡", "账户规模"]) {
  assert(!reportText.includes(privatePhrase), `privacy-sensitive wording found: ${privatePhrase}`);
}

const expected = {
  "159740": [0.559, 0.554, 0.560, 0.552, -1.42],
  "164701": [1.715, 1.703, 1.715, 1.701, 0.06],
  "512710": [0.630, 0.645, 0.645, 0.629, 2.06],
  "161226": [1.961, 1.946, 1.963, 1.937, 0.26],
  "159608": [1.045, 1.048, 1.057, 1.042, 0.48],
  "159241": [1.051, 1.075, 1.077, 1.051, 1.70],
  "562350": [1.090, 1.097, 1.098, 1.088, 0.64],
  "002090": [9.32, 9.33, 9.37, 9.25, 0.32],
  "601208": [50.00, 47.41, 50.00, 47.26, -3.60],
  "600050": [4.23, 4.24, 4.26, 4.22, 0.47],
  "002466": [45.50, 45.59, 45.95, 45.28, 0.73],
  "688981": [124.25, 121.52, 124.44, 121.50, -2.09],
  "161725": [0.563, 0.561, 0.565, 0.558, -0.36],
  "005827": [null, 1.5155, null, null, 1.20]
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
