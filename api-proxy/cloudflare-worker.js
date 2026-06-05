const headers = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type"
};

export default {
  async fetch(request, env = {}) {
    if (request.method === "OPTIONS") return new Response(null, { headers });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/search") return json(await searchSecurities(url.searchParams.get("keyword") || "", env));
      if (url.pathname === "/api/market-status") return json(await getMarketStatus(url.searchParams.get("symbol") || "", env));
      if (url.pathname === "/api/last-trading-day") return json(await getLastTradingDay(url.searchParams.get("symbol") || "", env));
      if (url.pathname === "/api/quote") return json(await getQuote(url.searchParams.get("symbol") || "", env));
      if (url.pathname === "/api/intraday") return json(await getIntraday(url.searchParams.get("symbol") || "", url.searchParams.get("tradeDate") || "", env));
      if (url.pathname === "/api/kline") return json(await getKline(url.searchParams.get("symbol") || "", url.searchParams.get("period") || "day", Number(url.searchParams.get("count") || 120), env));
      if (url.pathname === "/api/daily-summary") return json(await getDailySummary(url.searchParams.get("symbol") || "", url.searchParams.get("tradeDate") || "", env));
      if (url.pathname === "/api/last-valid-quote") return json(await getLastValidQuote(url.searchParams.get("symbol") || "", env));
      if (url.pathname === "/api/fund") return json(await getFundInfo(url.searchParams.get("symbol") || "", env));
      if (url.pathname === "/api/news") return json(await getNews(url.searchParams.get("keyword") || "", env));
      return json({ ok: false, message: "not found" }, 404);
    } catch (error) {
      return json({ ok: false, message: error.message || "proxy error" }, 502);
    }
  }
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers });
}

async function searchSecurities(keyword, env) {
  const local = searchLocalIndex(keyword);
  if (!env.MARKET_DATA_BASE) return local;
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/search?keyword=${encodeURIComponent(keyword)}`);
  return normalizeOk(upstream, "search adapter returned invalid data");
}

async function getMarketStatus(symbol, env) {
  if (!env.MARKET_DATA_BASE) {
    return {
      ok: true,
      symbol,
      ...localMarketStatus()
    };
  }
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/market-status?symbol=${encodeURIComponent(symbol)}`);
  return normalizeOk(upstream, "market status adapter returned invalid data");
}

async function getLastTradingDay(symbol, env) {
  if (!env.MARKET_DATA_BASE) return adapterMissing(symbol, "last trading day adapter not configured");
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/last-trading-day?symbol=${encodeURIComponent(symbol)}`);
  return normalizeOk(upstream, "last trading day adapter returned invalid data");
}

async function getQuote(symbol, env) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  if (!env.MARKET_DATA_BASE) return adapterMissing(symbol, "real quote adapter not configured");
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/quote?symbol=${encodeURIComponent(symbol)}`);
  return normalizeOk(upstream, "quote adapter returned invalid data");
}

async function getIntraday(symbol, tradeDate, env) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  if (!env.MARKET_DATA_BASE) return adapterMissing(symbol, "real intraday adapter not configured");
  const date = tradeDate ? `&tradeDate=${encodeURIComponent(tradeDate)}` : "";
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/intraday?symbol=${encodeURIComponent(symbol)}${date}`);
  return normalizeOk(upstream, "intraday adapter returned invalid data");
}

async function getKline(symbol, period, count, env) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  if (!env.MARKET_DATA_BASE) return adapterMissing(symbol, "real kline adapter not configured");
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/kline?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}&count=${encodeURIComponent(count)}`);
  return normalizeOk(upstream, "kline adapter returned invalid data");
}

async function getDailySummary(symbol, tradeDate, env) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  if (!env.MARKET_DATA_BASE) return adapterMissing(symbol, "daily summary adapter not configured");
  const date = tradeDate ? `&tradeDate=${encodeURIComponent(tradeDate)}` : "";
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/daily-summary?symbol=${encodeURIComponent(symbol)}${date}`);
  return normalizeOk(upstream, "daily summary adapter returned invalid data");
}

async function getLastValidQuote(symbol, env) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  if (!env.MARKET_DATA_BASE) return adapterMissing(symbol, "last valid quote adapter not configured");
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/last-valid-quote?symbol=${encodeURIComponent(symbol)}`);
  return normalizeOk(upstream, "last valid quote adapter returned invalid data");
}

async function getFundInfo(symbol, env) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  if (!env.MARKET_DATA_BASE) return adapterMissing(symbol, "fund net value adapter not configured");
  const upstream = await fetchJson(`${env.MARKET_DATA_BASE}/api/fund?symbol=${encodeURIComponent(symbol)}`);
  return normalizeOk(upstream, "fund adapter returned invalid data");
}

async function getNews(keyword, env) {
  if (!env.NEWS_DATA_BASE) return { ok: false, message: "news adapter not configured" };
  const upstream = await fetchJson(`${env.NEWS_DATA_BASE}/api/news?keyword=${encodeURIComponent(keyword)}`);
  return normalizeOk(upstream, "news adapter returned invalid data");
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `upstream error ${response.status}`);
  return payload;
}

function normalizeOk(payload, message) {
  if (!payload || payload.ok === false) return { ok: false, message: payload?.message || message };
  return { ok: true, ...payload };
}

function adapterMissing(symbol, message) {
  return {
    ok: false,
    symbol,
    message
  };
}

function localMarketStatus() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (day === 0 || day === 6) return { isTradingDay: false, status: "non_trading_day", session: "non_trading_day", label: "非交易日" };
  if (minutes >= 570 && minutes <= 690) return { isTradingDay: true, status: "trading", session: "trading", label: "盘中实时" };
  if (minutes > 690 && minutes < 780) return { isTradingDay: true, status: "lunch_break", session: "lunch_break", label: "午间休市" };
  if (minutes >= 780 && minutes <= 900) return { isTradingDay: true, status: "trading", session: "trading", label: "盘中实时" };
  if (minutes > 900) return { isTradingDay: true, status: "closed", session: "closed", label: "已收盘" };
  return { isTradingDay: true, status: "closed", session: "closed", label: "未开盘" };
}

function searchLocalIndex(keyword) {
  const items = [
    { name: "东材科技", code: "601208", symbol: "SH601208", market: "SH", type: "stock" },
    { name: "天齐锂业", code: "002466", symbol: "SZ002466", market: "SZ", type: "stock" },
    { name: "中国联通", code: "600050", symbol: "SH600050", market: "SH", type: "stock" },
    { name: "中芯国际", code: "688981", symbol: "SH688981", market: "SH", type: "stock" },
    { name: "黄金LOF", code: "164701", symbol: "SZ164701", market: "SZ", type: "exchange_fund" },
    { name: "军工龙头ETF富国", code: "512710", symbol: "SH512710", market: "SH", type: "exchange_fund" },
    { name: "易方达蓝筹精选混合", code: "005827", symbol: "OF005827", market: "OF", type: "open_fund" }
  ];
  const value = keyword.trim().toLowerCase();
  return { ok: true, items: items.filter((item) => item.code.includes(value) || item.name.toLowerCase().includes(value)) };
}
