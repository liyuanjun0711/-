const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const tradeCost = require("../trade-cost-policy.js");

const app = fs.readFileSync("app.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const styles = fs.readFileSync("styles.css", "utf8");
const reportText = fs.readFileSync("report-data.js", "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(reportText, context);
const data = context.window.MARKET_BRIEFING_DATA;

const expectedMap = `action: { title: "今日操作", sections: ["trade-decision", "one-sentence", "transaction-costs", "execution-list", "trade-plan", "do-not-do"] },
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
assert(html.includes("styles.css?v=20261103-axis1") && html.includes("app.js?v=20261103-axis1"), "axis-guide assets must be cache-busted");
for (const label of ["09:30", "10:30", "11:30", "13:00", "14:00", "15:00"]) assert(app.includes(label), `intraday axis label missing: ${label}`);
assert(app.includes("timeVisible") && app.includes("tickMarkFormatter"), "chart time axis config missing");
assert(app.includes("appendIntradayAxisGuide(host)") && app.includes('guide.className = "intraday-axis-guide"'), "fixed intraday axis guide missing");
assert(styles.includes(".intraday-axis-guide"), "intraday axis guide style missing");
assert(app.includes("真实分时暂无；不绘制假线。") && app.includes("真实日K暂无；不绘制假K线。"), "chart failure labels missing");
assert(app.includes("开放式基金按净值披露，不提供盘中K线"), "open-fund disclosure missing");
assert(app.includes("最近真实收盘已校验") && app.includes("最后真实更新时间"), "non-trading quote status must show the real market timestamp");

assert.strictEqual(data.date, "2026-11-16");
assert.strictEqual(data.portfolioVersion, "portfolio-2026-11-16-premarket-fee-aware-v1");
assert.strictEqual(data.holdings.length, 8);
assert.strictEqual(data.watchlist.length, 6);
assert.strictEqual(data.newsItems.length, 8);
assert(data.newsItems.filter((item) => String(item.sector).includes("过去24小时")).length >= 3, "past-24h coverage missing");
assert(data.holdings.every((item) => item.lastTradeDate === "2026-11-13" && Number(item.lastClose) > 0), "holding quote baseline invalid");
assert(data.watchlist.filter((item) => item.code !== "005827").every((item) => item.lastTradeDate === "2026-11-13" && Number(item.lastClose) > 0), "watchlist quote baseline invalid");
assert(data.watchlist.find((item) => item.code === "005827")?.lastTradeDate === "2026-11-13", "open-fund NAV date mismatch");

assert(html.includes("./trade-cost-policy.js"), "trade cost policy script missing");
assert(data.transactionCostPolicy, "transaction cost policy missing");
assert.strictEqual(data.transactionCostPolicy.profile, "low_principal");
assert.strictEqual(data.transactionCostPolicy.minimumEconomicOrderCny, 1000);
assert.strictEqual(data.transactionCostPolicy.maxOneWayCostRatio, 0.005);
assert.strictEqual(data.transactionCostPolicy.maxRoundTripCostRatio, 0.01);
assert.strictEqual(data.transactionCostPolicy.feeCoverageMultiple, 3);
assert.strictEqual(data.transactionCostPolicy.minimumNetEdgeRatio, 0.01);
assert.strictEqual(data.transactionCostPolicy.candidateOrders.length, 4);
for (const order of data.transactionCostPolicy.candidateOrders.slice(1, 3)) {
  const result = tradeCost.assessOrder(order, data.transactionCostPolicy);
  assert.strictEqual(result.status, "暂缓小单", `${order.code} should be blocked by low-principal cost gate`);
  assert(result.belowEconomicMinimum, `${order.code} should be below the economic order floor`);
  assert(result.excessiveCostRatio, `${order.code} should exceed the one-way cost ratio cap`);
}
const silverOrdinaryReview = tradeCost.assessOrder(data.transactionCostPolicy.candidateOrders[0], data.transactionCostPolicy);
assert.strictEqual(silverOrdinaryReview.status, "暂缓小单", "161226 must stay blocked when the latest date lacks a same-date NAV and account confirmation");
assert(Math.abs(silverOrdinaryReview.amount - 290.8) < 1e-9, "161226 ordinary-review amount mismatch");
const watchBuy = tradeCost.assessOrder(data.transactionCostPolicy.candidateOrders[3], data.transactionCostPolicy);
assert.strictEqual(watchBuy.status, "缺少收益空间", "minimum-sized watchlist buy must remain blocked without sourced expected edge");
assert(Math.abs(watchBuy.amount - 1036.8) < 1e-9, "watchlist buy amount mismatch");
assert(Math.abs(watchBuy.totalCostCny - 10) < 1e-9, "watchlist round-trip minimum commission mismatch");
assert(watchBuy.requiredGrossEdgeRatio > 0.0289 && watchBuy.requiredGrossEdgeRatio < 0.0290, "watchlist required gross edge mismatch");
const smallSell = tradeCost.assessOrder({ side: "sell", lots: 3, referencePrice: 0.47 }, data.transactionCostPolicy);
assert(Math.abs(smallSell.amount - 141) < 1e-9, "small sell amount mismatch");
assert(Math.abs(smallSell.totalCostCny - 5) < 1e-9, "minimum commission mismatch");
assert(Math.abs(smallSell.costRatio - (5 / 141)) < 1e-9, "small sell cost ratio mismatch");
const hardExit = tradeCost.assessOrder({ side: "sell", lots: 3, referencePrice: 0.47, hardRiskExit: true }, data.transactionCostPolicy);
assert.strictEqual(hardExit.status, "风险退出例外", "hard risk exits must bypass the economic amount gate");
const buyReview = tradeCost.assessOrder({ side: "buy", estimatedAmountCny: 1000 }, data.transactionCostPolicy);
assert.strictEqual(buyReview.sideCount, 2, "buy review must include round-trip commission");
assert(Math.abs(buyReview.totalCostCny - 10) < 1e-9, "round-trip minimum commission mismatch");
assert(Math.abs(buyReview.requiredGrossEdgeRatio - 0.03) < 1e-9, "required gross edge must cover fees three times");
assert.strictEqual(buyReview.status, "缺少收益空间", "buy review without an expected edge must not be actionable");
const weakBuy = tradeCost.assessOrder({ side: "buy", estimatedAmountCny: 1000, expectedGrossEdgeRatio: 0.02 }, data.transactionCostPolicy);
assert.strictEqual(weakBuy.status, "收益不足", "buy review below the required gross edge must be blocked");
const qualifiedBuy = tradeCost.assessOrder({ side: "buy", estimatedAmountCny: 1000, expectedGrossEdgeRatio: 0.04 }, data.transactionCostPolicy);
assert.strictEqual(qualifiedBuy.status, "可评估", "buy review above the fee-adjusted edge may proceed to risk review");

for (const privatePhrase of ["总资产", "持仓金额", "持仓市值", "现金余额", "盈亏金额", "银证转账金额", "账号标识", "银行卡", "账户规模"]) {
  assert(!reportText.includes(privatePhrase), `privacy-sensitive wording found: ${privatePhrase}`);
}

const expected = {
  "159740": [0.481, 0.47, 0.484, 0.468, -2.69],
  "164701": [1.508, 1.503, 1.515, 1.501, -1.18],
  "512710": [0.61, 0.6, 0.621, 0.598, -1.8],
  "161226": [1.47, 1.454, 1.475, 1.451, -2.15],
  "159608": [0.835, 0.811, 0.842, 0.81, -2.87],
  "159241": [0.989, 0.962, 1.003, 0.959, -2.43],
  "562350": [1.076, 1.083, 1.093, 1.076, 0.09],
  "002090": [8.55, 8.59, 8.77, 8.47, 1.06],
  "601208": [34.9, 31.92, 35.05, 31.7, -7.18],
  "600050": [4.21, 4.27, 4.3, 4.2, 0.95],
  "002466": [35.41, 34.6, 36.16, 34.51, -1.59],
  "688981": [111.72, 110.5, 116.28, 108.7, -1.09],
  "161725": [0.563, 0.576, 0.578, 0.559, 1.77],
  "005827": [null, 1.3732, null, null, -0.79]
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
