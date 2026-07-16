const { marketStatus } = require("./common");

async function tryProviders(meta, providers, method, args = []) {
  const errors = [];
  for (const provider of providers) {
    try {
      const payload = await provider[method](meta, ...args);
      return { payload, providerName: provider.providerName || provider.name || "provider", errors };
    } catch (error) {
      errors.push(`${provider.name || "provider"}: ${error.message}`);
    }
  }
  const failure = new Error(errors.join("; ") || "all providers failed");
  failure.errors = errors;
  throw failure;
}

async function tryProvidersFast(meta, providers, method, args = [], timeoutMs = 4500) {
  const tasks = providers.map((provider) => {
    const name = provider.providerName || provider.name || "provider";
    return withTimeout(Promise.resolve().then(() => provider[method](meta, ...args)), timeoutMs, `${name} ${method} timeout`)
      .then((payload) => ({ payload, providerName: name }))
      .catch((error) => {
        throw new Error(`${name}: ${error.message}`);
      });
  });
  try {
    return await Promise.any(tasks);
  } catch (error) {
    const errors = (error.errors || []).map((item) => item.message || String(item));
    const failure = new Error(errors.join("; ") || "all providers failed");
    failure.errors = errors;
    throw failure;
  }
}

function withTimeout(promise, timeoutMs, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function withQuoteMeta(row, meta) {
  const status = marketStatus();
  const quote = {
    price: row.price,
    preClose: row.preClose,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close ?? row.price,
    change: row.change,
    changePercent: row.changePercent,
    volume: row.volume,
    amount: row.amount
  };
  return {
    ok: true,
    source: row.source,
    mode: status.mode,
    marketStatus: status.marketStatus,
    symbol: meta.symbol,
    name: meta.name || row.name,
    code: row.code || meta.code,
    type: meta.type,
    market: meta.market,
    sourceType: "real",
    cached: false,
    dataDate: row.tradeDate || dateFromTime(row.time) || "",
    lastUpdated: row.time || "",
    time: row.time || "",
    quote,
    price: quote.price,
    preClose: quote.preClose,
    open: quote.open,
    high: quote.high,
    low: quote.low,
    close: quote.close,
    change: quote.change,
    changePercent: quote.changePercent,
    volume: quote.volume,
    amount: quote.amount
  };
}

function quoteFromLastKline(meta, rows, source = "history") {
  const items = Array.isArray(rows) ? rows : [];
  const last = items[items.length - 1];
  const prev = items[items.length - 2];
  if (!last) throw new Error("history empty");
  const preClose = prev?.close ?? null;
  const change = last.close != null && preClose != null ? last.close - preClose : null;
  const changePercent = change != null && preClose ? (change / preClose) * 100 : last.changePercent ?? null;
  const status = marketStatus();
  const quote = {
    price: last.close,
    preClose,
    open: last.open,
    high: last.high,
    low: last.low,
    close: last.close,
    change,
    changePercent,
    volume: last.volume,
    amount: last.amount
  };
  return {
    ok: true,
    source,
    mode: "historical",
    marketStatus: status.marketStatus,
    symbol: meta.symbol,
    name: meta.name,
    code: meta.code,
    type: meta.type,
    market: meta.market,
    sourceType: "real",
    cached: false,
    dataDate: String(last.time).slice(0, 10),
    lastUpdated: String(last.time).slice(0, 10),
    time: String(last.time).slice(0, 10),
    quote,
    price: quote.price,
    preClose: quote.preClose,
    open: quote.open,
    high: quote.high,
    low: quote.low,
    close: quote.close,
    change: quote.change,
    changePercent: quote.changePercent,
    volume: quote.volume,
    amount: quote.amount
  };
}

function dateFromTime(value) {
  const text = String(value || "");
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function failPayload(symbol, message, error) {
  return {
    ok: false,
    mode: "failed",
    marketStatus: "error",
    message,
    symbol,
    lastRealData: null,
    errors: error?.errors || [error?.message].filter(Boolean)
  };
}

module.exports = { tryProviders, tryProvidersFast, withQuoteMeta, quoteFromLastKline, failPayload };
