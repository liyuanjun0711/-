const fs = require("fs");
const { normalizeSymbol } = require("../dataProviders/common");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const eastmoney = require("../dataProviders/eastmoney");

const expectedDate = "2026-11-09";
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

function validBar(bar) {
  return bar && bar.time === expectedDate &&
    [bar.open, bar.high, bar.low, bar.close].every((value) => Number(value) > 0);
}

function signature(bar) {
  return [bar.open, bar.high, bar.low, bar.close].map(Number).join("|");
}

async function readProvider(provider, meta) {
  try {
    const bars = await provider.kline(meta, "day", 12);
    const bar = bars.find((item) => item.time === expectedDate) || null;
    return { provider: provider.providerName, ok: validBar(bar), bar };
  } catch (error) {
    return { provider: provider.providerName, ok: false, error: error.message };
  }
}

async function collectSymbol(symbol) {
  const meta = normalizeSymbol(symbol);
  const attempts = await Promise.all(providers.map((provider) => readProvider(provider, meta)));
  const valid = attempts.filter((item) => item.ok);
  const counts = new Map();
  for (const item of valid) counts.set(signature(item.bar), (counts.get(signature(item.bar)) || 0) + 1);
  const consensus = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || null;
  const selected = consensus ? valid.find((item) => signature(item.bar) === consensus[0]) : null;
  const proxy = await getJson(`${apiBase}/api/quote?symbol=${encodeURIComponent(symbol)}`);
  const proxyQuote = proxy.body?.quote || proxy.body;
  const proxyOk = proxy.status === 200 && proxy.body?.ok === true && proxy.body?.dataDate === expectedDate &&
    [proxyQuote.open, proxyQuote.high, proxyQuote.low, proxyQuote.close ?? proxyQuote.price]
      .every((value) => Number(value) > 0);
  const proxySignature = proxyOk
    ? [proxyQuote.open, proxyQuote.high, proxyQuote.low, proxyQuote.close ?? proxyQuote.price].map(Number).join("|")
    : null;
  return {
    symbol,
    expectedDate,
    tieOut: Boolean(selected && consensus[1] >= 2),
    consensusCount: consensus?.[1] || 0,
    source: selected?.provider || null,
    bar: selected?.bar || null,
    providerAttempts: attempts,
    proxy: { status: proxy.status, body: proxy.body, valid: proxyOk, matchesConsensus: proxySignature === consensus?.[0] }
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
  const snapshot = {
    collectedAt: new Date().toISOString(),
    collectionMode: "own-proxy-close-plus-three-provider-daily-k-consensus",
    expectedDate,
    quotes,
    funds,
    runtimeFunds
  };
  fs.writeFileSync("scripts/market-snapshot-20261110.json", `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    collectedAt: snapshot.collectedAt,
    quoteCount: quotes.length,
    tieOutCount: quotes.filter((item) => item.tieOut).length,
    proxyValidCount: quotes.filter((item) => item.proxy.valid).length,
    proxyMatchCount: quotes.filter((item) => item.proxy.matchesConsensus).length,
    proxyModes: [...new Set(quotes.map((item) => item.proxy.body?.mode || "missing"))],
    fundDates: funds.map((item) => item.body?.Data?.LSJZList?.[0]?.FSRQ || null),
    runtimeFundStatuses: runtimeFunds.map((item) => `${item.symbol}:${item.status}:${item.body?.mode || "missing"}`),
    failedSymbols: quotes.filter((item) => !item.tieOut || !item.proxy.valid || !item.proxy.matchesConsensus).map((item) => item.symbol)
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
