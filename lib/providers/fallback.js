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

function withQuoteMeta(row, meta) {
  const status = marketStatus();
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
    time: row.time || "",
    price: row.price,
    preClose: row.preClose,
    open: row.open,
    high: row.high,
    low: row.low,
    change: row.change,
    changePercent: row.changePercent,
    volume: row.volume,
    amount: row.amount
  };
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

module.exports = { tryProviders, withQuoteMeta, failPayload };
