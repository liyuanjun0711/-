const fs = require("fs");
const { normalizeSymbol } = require("../dataProviders/common");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const eastmoney = require("../dataProviders/eastmoney");

const symbols = [
  "SZ159740", "SZ164701", "SH512710", "SZ161226", "SZ159608", "SZ159241",
  "SH562350", "SZ002090", "SH601208", "SH600050", "SZ002466", "SH688981", "SZ161725"
];
const providers = [sina, tencent, eastmoney];
const apiBase = "https://daily-briefing-blue.vercel.app";

async function getJson(url, init = {}, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const raw = await response.text();
    let body;
    try { body = JSON.parse(raw); } catch { body = { raw }; }
    return { status: response.status, body };
  } catch (error) {
    return { status: 0, body: { ok: false, mode: "failed", message: error.message } };
  } finally {
    clearTimeout(timeout);
  }
}

function validQuote(quote) {
  return quote && quote.price > 0 && quote.open > 0 && quote.high > 0 && quote.low > 0 && /^2026-11-05/.test(quote.time || "");
}

function exact(quote, bar) {
  return Boolean(bar && String(quote.time).slice(0, 10) === bar.time &&
    Number(quote.open) === Number(bar.open) && Number(quote.price) === Number(bar.close) &&
    Number(quote.high) === Number(bar.high) && Number(quote.low) === Number(bar.low));
}

async function readProvider(provider, meta) {
  try {
    const [quote, bars] = await Promise.all([provider.quote(meta), provider.kline(meta, "day", 8)]);
    const lastBar = bars.at(-1) || null;
    return { provider: provider.providerName, ok: validQuote(quote), quote, lastBar, exact: validQuote(quote) && exact(quote, lastBar) };
  } catch (error) {
    return { provider: provider.providerName, ok: false, error: error.message };
  }
}

async function collectSymbol(symbol) {
  const meta = normalizeSymbol(symbol);
  const attempts = await Promise.all(providers.map((provider) => readProvider(provider, meta)));
  const chosen = attempts.find((item) => item.exact) || attempts.find((item) => item.ok && item.lastBar?.time === "2026-11-05");
  if (!chosen) return { symbol, quoteStatus: 0, quoteError: "no verified 2026-11-05 quote", providerAttempts: attempts, tieOut: false };
  const q = chosen.quote;
  return {
    symbol,
    source: chosen.provider,
    mode: "closed",
    dataDate: String(q.time).slice(0, 10),
    lastUpdated: q.time,
    open: q.open,
    close: q.price,
    high: q.high,
    low: q.low,
    preClose: q.preClose,
    changePercent: q.changePercent,
    volume: q.volume,
    amount: q.amount,
    klineStatus: 200,
    klineSource: chosen.provider,
    previousBar: null,
    lastBar: chosen.lastBar,
    tieOut: chosen.exact,
    directVerification: { provider: chosen.provider, bar: chosen.lastBar },
    providerAttempts: attempts
  };
}

async function collectFund(code) {
  const url = `https://api.fund.eastmoney.com/f10/lsjz?fundCode=${code}&pageIndex=1&pageSize=5`;
  const result = await getJson(url, { headers: { Referer: "https://fundf10.eastmoney.com/", "User-Agent": "Mozilla/5.0" } });
  return { code, status: result.status, body: result.body };
}

async function collectRuntimeFund(symbol) {
  const result = await getJson(`${apiBase}/api/fund?symbol=${encodeURIComponent(symbol)}`, {}, 15_000);
  return { symbol, status: result.status, body: result.body };
}

(async () => {
  const quotes = await Promise.all(symbols.map(collectSymbol));
  const funds = await Promise.all(["161226", "005827"].map(collectFund));
  const runtimeFunds = await Promise.all(["SZ161226", "OF005827"].map(collectRuntimeFund));
  const snapshot = { collectedAt: new Date().toISOString(), collectionMode: "direct-three-provider-fallback-after-own-proxy-timeout", quotes, funds, runtimeFunds };
  fs.writeFileSync("scripts/market-snapshot-20261106.json", `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    collectedAt: snapshot.collectedAt,
    quoteCount: quotes.length,
    tieOutCount: quotes.filter((item) => item.tieOut).length,
    fundDates: funds.map((item) => item.body?.Data?.LSJZList?.[0]?.FSRQ || null),
    runtimeFundStatuses: runtimeFunds.map((item) => `${item.symbol}:${item.status}`),
    quoteDates: [...new Set(quotes.map((item) => item.dataDate).filter(Boolean))]
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
