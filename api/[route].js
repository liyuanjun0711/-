const { normalizeSymbol, localSearch, json, handleOptions, marketStatus } = require("../dataProviders/common");
const eastmoney = require("../dataProviders/eastmoney");
const sina = require("../dataProviders/sina");
const tencent = require("../dataProviders/tencent");
const quoteHandler = require("./quote");
const { tryProviders, failPayload } = require("../dataProviders/fallback");

function routeName(req) {
  const value = req.query?.route;
  return Array.isArray(value) ? value[0] : String(value || "");
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  const route = routeName(req);
  if (route === "health") return handleHealth(req, res);
  if (route === "debug") return handleDebug(req, res);
  if (route === "market-status") return handleMarketStatus(req, res);
  if (route === "last-trading-day") return handleLastTradingDay(req, res);
  if (route === "trading-days") return handleTradingDays(req, res);
  if (route === "daily-summary") return handleDailySummary(req, res);
  if (route === "last-valid-quote") return quoteHandler(req, res);
  if (route === "fund") return handleFund(req, res);
  json(res, 404, { ok: false, message: `unknown api route: ${route}` });
};

function handleHealth(req, res) {
  json(res, 200, {
    ok: true,
    routes: {
      search: true,
      quote: true,
      history: true,
      kline: true,
      intraday: true,
      news: true,
      health: true,
      debug: true
    },
    time: new Date().toISOString()
  });
}

async function handleDebug(req, res) {
  const input = req.query?.symbol || req.query?.code || "SH601208";
  let meta;
  const result = {
    ok: true,
    symbol: String(input),
    search: { ok: false, count: 0, error: null },
    quote: { ok: false, hasPrice: false, rawLength: 0, source: null, error: null },
    history: { ok: false, count: 0, first: null, last: null, source: null, error: null },
    intraday: { ok: false, count: 0, source: null, error: null },
    chartReady: false
  };

  try {
    meta = normalizeSymbol(input);
    result.symbol = meta.symbol;
  } catch (error) {
    result.ok = false;
    result.error = error.message;
    json(res, 400, result);
    return;
  }

  try {
    const searchItems = await eastmoney.search(meta.code).catch(() => localSearch(meta.code));
    result.search = { ok: searchItems.length > 0, count: searchItems.length, error: searchItems.length ? null : "搜索结果为空" };
  } catch (error) {
    result.search = { ok: false, count: 0, error: error.message };
  }

  try {
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "quote");
    result.quote = {
      ok: payload.price != null,
      hasPrice: payload.price != null,
      rawLength: JSON.stringify(payload).length,
      source: providerName,
      error: payload.price == null ? "quote price is empty" : null
    };
  } catch (error) {
    result.quote = { ok: false, hasPrice: false, rawLength: 0, source: null, error: error.errors?.join("; ") || error.message };
  }

  try {
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 260]);
    const items = payload.items || payload;
    const valid = Array.isArray(items) && items.length > 0 && items.every(isValidKlineRow);
    result.history = {
      ok: valid,
      count: Array.isArray(items) ? items.length : 0,
      first: items?.[0]?.time || null,
      last: items?.[items.length - 1]?.time || null,
      source: providerName,
      error: valid ? null : "history items empty or invalid"
    };
  } catch (error) {
    result.history = { ok: false, count: 0, first: null, last: null, source: null, error: error.errors?.join("; ") || error.message };
  }

  try {
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "intraday");
    const items = payload.items || payload;
    result.intraday = {
      ok: Array.isArray(items) && items.length > 0,
      count: Array.isArray(items) ? items.length : 0,
      source: providerName,
      error: Array.isArray(items) && items.length ? null : "intraday items empty"
    };
  } catch (error) {
    result.intraday = { ok: false, count: 0, source: null, error: error.errors?.join("; ") || error.message };
  }

  result.chartReady = result.history.ok && result.history.count > 0;
  result.ok = result.search.ok && result.quote.ok && result.history.ok;
  json(res, 200, result);
}

function isValidKlineRow(row) {
  return row
    && /^\d{4}-\d{2}-\d{2}$/.test(String(row.time || ""))
    && Number.isFinite(Number(row.open))
    && Number.isFinite(Number(row.high))
    && Number.isFinite(Number(row.low))
    && Number.isFinite(Number(row.close));
}

function handleMarketStatus(req, res) {
  const status = marketStatus();
  json(res, 200, { ok: true, ...status, status: status.marketStatus });
}

async function handleLastTradingDay(req, res) {
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 8]);
    const items = payload.items || payload;
    const last = items[items.length - 1];
    if (!last?.time) throw new Error("last trading day unavailable");
    json(res, 200, { ok: true, symbol: meta.symbol, tradeDate: String(last.time).slice(0, 10), source: providerName });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "最近交易日获取失败", error));
  }
}

async function handleTradingDays(req, res) {
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 30]);
    const items = payload.items || payload;
    const dates = items.map((row) => String(row.time).slice(0, 10)).filter(Boolean);
    json(res, 200, {
      ok: true,
      source: providerName,
      sourceType: "real",
      cached: false,
      symbol: meta.symbol,
      name: meta.name,
      code: meta.code,
      type: meta.type,
      market: meta.market,
      lastTradeDate: dates[dates.length - 1] || "",
      previousTradeDate: dates[dates.length - 2] || "",
      dates
    });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "真实交易日数据不可用", error));
  }
}

async function handleDailySummary(req, res) {
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
    const { payload, providerName } = await tryProviders(meta, [eastmoney, sina, tencent], "kline", ["day", 8]);
    const items = payload.items || payload;
    const last = items[items.length - 1];
    const prev = items[items.length - 2];
    if (!last) throw new Error("daily summary unavailable");
    const status = marketStatus();
    const preClose = prev?.close ?? null;
    json(res, 200, {
      ok: true,
      source: providerName,
      mode: "historical",
      marketStatus: status.marketStatus,
      symbol: meta.symbol,
      tradeDate: String(last.time).slice(0, 10),
      open: last.open,
      high: last.high,
      low: last.low,
      close: last.close,
      price: last.close,
      preClose,
      change: last.close != null && preClose != null ? last.close - preClose : null,
      changePercent: last.close != null && preClose ? ((last.close - preClose) / preClose) * 100 : last.changePercent,
      volume: last.volume,
      amount: last.amount
    });
  } catch (error) {
    json(res, 502, failPayload(meta?.symbol || String(req.query?.symbol || ""), "daily summary unavailable", error));
  }
}

function handleFund(req, res) {
  let meta;
  try {
    meta = normalizeSymbol(req.query?.symbol || req.query?.code || "");
  } catch (error) {
    json(res, 400, { ok: false, mode: "failed", message: "invalid fund symbol" });
    return;
  }
  json(res, 501, {
    ok: false,
    mode: "failed",
    symbol: meta.symbol,
    message: "open fund NAV provider is not connected"
  });
}
