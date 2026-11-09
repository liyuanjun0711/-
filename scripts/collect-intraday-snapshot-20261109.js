const fs = require("fs");

const apiBase = "https://daily-briefing-blue.vercel.app";
const expectedDate = "2026-11-09";
const symbols = [
  "SZ159740", "SZ164701", "SH512710", "SZ161226", "SZ159608", "SZ159241",
  "SH562350", "SZ002090", "SH601208", "SH600050", "SZ002466", "SH688981", "SZ161725"
];

async function getJson(url, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
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

function validQuote(item) {
  const quote = item.body?.quote || item.body;
  return item.status === 200 && item.body?.ok === true && item.body?.mode === "realtime" &&
    item.body?.dataDate === expectedDate && /^2026-11-09 1[3-4]:/.test(item.body?.lastUpdated || "") &&
    [quote.price, quote.preClose, quote.open, quote.high, quote.low].every((value) => Number(value) > 0);
}

(async () => {
  const quotes = await Promise.all(symbols.map(async (symbol) => {
    const result = await getJson(`${apiBase}/api/quote?symbol=${symbol}`);
    return { symbol, status: result.status, body: result.body, valid: validQuote(result) };
  }));
  const snapshot = {
    collectedAt: new Date().toISOString(),
    collectionMode: "own-proxy-realtime",
    expectedDate,
    quotes
  };
  fs.writeFileSync("scripts/intraday-snapshot-20261109.json", `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    collectedAt: snapshot.collectedAt,
    validCount: quotes.filter((item) => item.valid).length,
    modes: [...new Set(quotes.map((item) => item.body?.mode || "missing"))],
    timestamps: quotes.map((item) => item.body?.lastUpdated || null),
    failedSymbols: quotes.filter((item) => !item.valid).map((item) => item.symbol)
  }, null, 2));
  if (quotes.some((item) => !item.valid)) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
