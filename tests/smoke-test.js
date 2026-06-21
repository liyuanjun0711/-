const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

class NodeStub {
  constructor(id = "") {
    this.id = id;
    this.innerHTML = "";
    this.textContent = "";
    this.className = "";
    this.disabled = false;
    this.dataset = {};
    this.style = {};
    this.clientWidth = 720;
  }
  querySelector() { return new NodeStub(); }
  querySelectorAll() { return []; }
  classList = { add() {}, remove() {}, toggle() {} };
  scrollIntoView() {}
}

const nodeIds = [
  "appRoot", "refreshAll", "statusDot", "dataStatus", "dataTimestamp",
  "marketStatus", "snapshotStatus", "scoreStatus", "baselineStatus",
  "detailRoot", "toastRoot"
];
const nodes = new Map(nodeIds.map((id) => [id, new NodeStub(id)]));
const documentStub = {
  hidden: false,
  body: { style: {} },
  addEventListener() {},
  querySelector() { return new NodeStub(); },
  querySelectorAll() { return []; },
  getElementById(id) { return nodes.get(id) || new NodeStub(id); }
};

const storage = new Map();
// Old V3 local-only portfolio state must be ignored by V4.
storage.set("portfolio-dashboard:custom-holdings:v3", JSON.stringify([{ name: "不应出现", code: "600000", symbol: "SH600000" }]));
const localStorageStub = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key)
};

const fixedQuote = {
  ok: true,
  symbol: "SZ164701",
  source: "eastmoney",
  mode: "historical",
  lastUpdated: "2026-06-19",
  dataDate: "2026-06-19",
  quote: {
    price: 1.72,
    close: 1.72,
    preClose: 1.70,
    open: 1.705,
    high: 1.735,
    low: 1.695,
    changePercent: 1.1765,
    volume: 100000,
    amount: 172000
  }
};

async function fetchStub(url) {
  const href = String(url);
  if (href.includes("/api/quote?symbols=")) {
    return response({
      ok: true,
      schemaVersion: 4,
      scoreVersion: "market-observation-v4.0.0",
      snapshotId: "s4_test_snapshot",
      generatedAt: "2026-06-21T02:00:00.000Z",
      validUntil: "2026-06-21T02:05:00.000Z",
      marketStatus: "non_trading_day",
      mode: "historical",
      items: [fixedQuote],
      failed: [{ symbol: "SZ002090", message: "fixture unavailable" }]
    });
  }
  if (href.includes("/api/market-status")) {
    return response({ ok: true, status: "non_trading_day", tradeDate: "2026-06-19" });
  }
  if (href.includes("/api/news")) throw new Error("offline news fixture");
  throw new Error(`unexpected request: ${href}`);
}

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return payload; }
  };
}

const windowStub = {
  MARKET_BRIEFING_DATA: {
    apiBase: "",
    date: "2026-06-16",
    lastUpdated: "2026-06-15 22:45 北京时间",
    portfolioVersion: "portfolio-test-v1",
    holdings: [{
      name: "黄金LOF",
      code: "164701",
      symbol: "SZ164701",
      market: "SZ",
      type: "exchange_fund",
      sector: "黄金",
      support: "1.65",
      resistance: "1.75",
      riskLevel: "中",
      lastClose: 1.681,
      lastTradeDate: "2026-06-15"
    }],
    watchlist: [],
    invalidConditions: ["没有真实行情不交易"],
    newsItems: []
  },
  LightweightCharts: undefined,
  setTimeout,
  clearTimeout,
  setInterval: () => 1,
  clearInterval() {},
  innerWidth: 1024,
  addEventListener() {},
  removeEventListener() {}
};

const locationStub = { hash: "", href: "https://example.com/" };
const historyStub = { replaceState() {} };
const context = {
  window: windowStub,
  document: documentStub,
  localStorage: localStorageStub,
  location: locationStub,
  history: historyStub,
  URL,
  Intl,
  Date,
  Number,
  String,
  Set,
  Map,
  Array,
  Object,
  Math,
  Promise,
  console: { ...console, error() {} },
  fetch: fetchStub,
  AbortController,
  FormData: class { constructor() {} get() { return ""; } },
  requestAnimationFrame: (fn) => fn()
};
windowStub.document = documentStub;
windowStub.localStorage = localStorageStub;
windowStub.location = locationStub;
windowStub.history = historyStub;
windowStub.fetch = fetchStub;
windowStub.requestAnimationFrame = context.requestAnimationFrame;

vm.createContext(context);
const appPath = path.join(__dirname, "..", "app.js");
vm.runInContext(fs.readFileSync(appPath, "utf8"), context, { filename: "app.js" });

setTimeout(() => {
  const debug = windowStub.__PORTFOLIO_DASHBOARD__;
  assert(debug, "debug API should exist");
  assert.strictEqual(debug.scoreVersion, "market-observation-v4.0.0");
  assert.strictEqual(debug.getState().snapshotId, "s4_test_snapshot");
  assert(nodes.get("appRoot").innerHTML.length > 500, "app should render meaningful content");
  assert(!nodes.get("appRoot").innerHTML.includes("不应出现"), "old device-local holdings must be ignored");

  const scoreInput = {
    quote: fixedQuote.quote,
    quoteMeta: { origin: "live", mode: "historical", source: "eastmoney", dataDate: "2026-06-19", lastUpdated: "2026-06-19" },
    support: "1.65",
    resistance: "1.75",
    riskLevel: "中"
  };
  const first = debug.scoreAsset(scoreInput);
  const second = debug.scoreAsset(JSON.parse(JSON.stringify(scoreInput)));
  assert.strictEqual(first.total, second.total, "same inputs must produce same score");
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(first.components)),
    JSON.parse(JSON.stringify(second.components)),
    "score breakdown must be deterministic"
  );
  assert(first.total >= 0 && first.total <= 100, "score must stay within 0-100");

  const idA = debug.createClientSnapshotId(123, [fixedQuote]);
  const idB = debug.createClientSnapshotId(123, [JSON.parse(JSON.stringify(fixedQuote))]);
  assert.strictEqual(idA, idB, "same snapshot content must produce same client fallback id");

  console.log("smoke ok", {
    renderedChars: nodes.get("appRoot").innerHTML.length,
    snapshotId: debug.getState().snapshotId,
    score: first.total,
    confidence: first.confidence.grade
  });
}, 120);
