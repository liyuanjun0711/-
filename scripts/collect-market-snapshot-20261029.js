const fs = require("fs");
const { normalizeSymbol } = require("../dataProviders/common");
const sina = require("../dataProviders/sina");
const eastmoney = require("../dataProviders/eastmoney");

const symbols = [
  "SZ159740", "SZ164701", "SH512710", "SZ161226", "SZ159608", "SZ159241",
  "SH562350", "SZ002090", "SH601208", "SH600050", "SZ002466", "SH688981", "SZ161725"
];

const apiBase = "https://daily-briefing-blue.vercel.app";

async function getJson(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const raw = await response.text();
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      body = { raw };
    }
    return { status: response.status, body };
  } finally {
    clearTimeout(timeout);
  }
}

async function collectSymbol(symbol) {
  const quoteUrl = `${apiBase}/api/quote?symbol=${encodeURIComponent(symbol)}`;
  const klineUrl = `${apiBase}/api/kline?symbol=${encodeURIComponent(symbol)}&period=day`;
  const [quoteResult, klineResult] = await Promise.all([getJson(quoteUrl), getJson(klineUrl)]);
  const quote = quoteResult.body;
  const klineItems = Array.isArray(klineResult.body?.items) ? klineResult.body.items : [];
  const lastBar = klineItems.at(-1) || null;
  const previousBar = klineItems.at(-2) || null;
  const quoteSummary = quoteResult.status === 200 && quote?.ok ? {
    symbol,
    source: quote.source,
    mode: quote.mode,
    dataDate: quote.dataDate,
    lastUpdated: quote.lastUpdated,
    open: quote.open,
    close: quote.close,
    high: quote.high,
    low: quote.low,
    preClose: quote.preClose,
    changePercent: quote.changePercent,
    volume: quote.volume,
    amount: quote.amount
  } : { symbol, quoteStatus: quoteResult.status, quoteError: quote?.message || quote?.raw || "unknown" };
  return {
    ...quoteSummary,
    klineStatus: klineResult.status,
    klineSource: klineResult.body?.source,
    previousBar,
    lastBar,
    tieOut: Boolean(
      quoteResult.status === 200 && quote?.ok && lastBar &&
      quote.dataDate === lastBar.time &&
      Number(quote.open) === Number(lastBar.open) &&
      Number(quote.close) === Number(lastBar.close) &&
      Number(quote.high) === Number(lastBar.high) &&
      Number(quote.low) === Number(lastBar.low)
    )
  };
}

async function verifyMismatch(item) {
  if (item.tieOut) return item;
  const meta = normalizeSymbol(item.symbol);
  const attempts = [];
  for (const provider of [sina, eastmoney]) {
    try {
      const rows = await provider.kline(meta, "day", 5);
      const bar = rows.at(-1) || null;
      const exact = Boolean(
        bar && item.dataDate === bar.time &&
        Number(item.open) === Number(bar.open) &&
        Number(item.close) === Number(bar.close) &&
        Number(item.high) === Number(bar.high) &&
        Number(item.low) === Number(bar.low)
      );
      attempts.push({ provider: provider.providerName, bar, exact });
      if (exact) {
        return { ...item, tieOut: true, directVerification: { provider: provider.providerName, bar } };
      }
    } catch (error) {
      attempts.push({ provider: provider.providerName, error: error.message, exact: false });
    }
  }
  return { ...item, directVerificationAttempts: attempts };
}

async function collectFund(code) {
  const url = `https://api.fund.eastmoney.com/f10/lsjz?fundCode=${code}&pageIndex=1&pageSize=5`;
  const result = await getJson(url, {
    headers: {
      Referer: "https://fundf10.eastmoney.com/",
      "User-Agent": "Mozilla/5.0"
    }
  });
  return { code, status: result.status, body: result.body };
}

async function collectRuntimeFund(symbol) {
  const result = await getJson(`${apiBase}/api/fund?symbol=${encodeURIComponent(symbol)}`);
  return { symbol, status: result.status, body: result.body };
}

(async () => {
  const initialQuotes = await Promise.all(symbols.map(collectSymbol));
  const quotes = await Promise.all(initialQuotes.map(verifyMismatch));
  const funds = await Promise.all(["161226", "005827"].map(collectFund));
  const runtimeFunds = await Promise.all(["SZ161226", "OF005827"].map(collectRuntimeFund));
  const snapshot = { collectedAt: new Date().toISOString(), quotes, funds, runtimeFunds };
  fs.writeFileSync("scripts/market-snapshot-20261029.json", `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    collectedAt: snapshot.collectedAt,
    quoteCount: quotes.length,
    tieOutCount: quotes.filter((item) => item.tieOut).length,
    fundCount: funds.length,
    runtimeFundStatuses: runtimeFunds.map((item) => `${item.symbol}:${item.status}`),
    quoteDates: [...new Set(quotes.map((item) => item.dataDate).filter(Boolean))]
  }));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
