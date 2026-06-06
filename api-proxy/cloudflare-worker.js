const headers = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type"
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/search") return json(searchLocalIndex(url.searchParams.get("keyword") || ""));
      if (url.pathname === "/api/market-status") return json({ ok: true, ...localMarketStatus() });
      if (url.pathname === "/api/last-trading-day") return json(await getLastTradingDay(requiredSymbol(url)));
      if (url.pathname === "/api/quote") return json(await getQuote(requiredSymbol(url)));
      if (url.pathname === "/api/intraday") return json(await getIntraday(requiredSymbol(url), url.searchParams.get("tradeDate") || ""));
      if (url.pathname === "/api/kline") return json(await getKline(requiredSymbol(url), url.searchParams.get("period") || "day", Number(url.searchParams.get("count") || 120)));
      if (url.pathname === "/api/daily-summary") return json(await getDailySummary(requiredSymbol(url), url.searchParams.get("tradeDate") || ""));
      if (url.pathname === "/api/last-valid-quote") return json(await getLastValidQuote(requiredSymbol(url)));
      if (url.pathname === "/api/fund") return json({ ok: false, message: "open fund net value adapter not configured" }, 502);
      if (url.pathname === "/api/news") return json({ ok: false, message: "news adapter not configured" }, 502);
      return json({ ok: false, message: "not found" }, 404);
    } catch (error) {
      return json({ ok: false, message: error.message || "proxy error" }, 502);
    }
  }
};

function json(payload, status = payloadStatus(payload)) {
  return new Response(JSON.stringify(payload), { status, headers });
}

function payloadStatus(payload) {
  return payload && payload.ok === false ? 502 : 200;
}

function requiredSymbol(url) {
  const symbol = url.searchParams.get("symbol") || "";
  if (!symbol) throw new Error("missing symbol");
  const normalized = normalizeSymbol(symbol);
  if (!/^(SH|SZ)\d{6}$/.test(normalized) || /000000$/.test(normalized)) throw new Error("invalid symbol");
  return normalized;
}

async function getQuote(symbol) {
  return withFallback("quote", symbol, [
    () => eastmoneyQuote(symbol),
    () => sinaQuote(symbol),
    () => tencentQuote(symbol)
  ]);
}

async function getIntraday(symbol, tradeDate) {
  return withFallback("intraday", symbol, [
    () => eastmoneyIntraday(symbol, tradeDate),
    () => sinaIntraday(symbol, tradeDate),
    () => tencentIntraday(symbol, tradeDate)
  ]);
}

async function getKline(symbol, period, count) {
  return withFallback("kline", symbol, [
    () => eastmoneyKline(symbol, period, count),
    () => sinaKline(symbol, period, count),
    () => tencentKline(symbol, period, count)
  ]);
}

async function getDailySummary(symbol, tradeDate) {
  const kline = await getKline(symbol, "day", 120);
  const rows = (kline.items || []).filter((row) => !tradeDate || row.time === tradeDate);
  const row = rows.at(-1) || (kline.items || []).at(-1);
  if (!row) return { ok: false, symbol, message: "daily summary unavailable" };
  const all = kline.items || [];
  const index = all.findIndex((item) => item.time === row.time);
  const prev = index > 0 ? all[index - 1] : null;
  return {
    ok: true,
    source: kline.source,
    symbol,
    tradeDate: row.time,
    close: row.close,
    price: row.close,
    preClose: prev ? prev.close : null,
    open: row.open,
    high: row.high,
    low: row.low,
    volume: row.volume,
    amount: row.amount,
    changePercent: row.changePercent,
    time: row.time,
    mode: "historical",
    status: "historical"
  };
}

async function getLastValidQuote(symbol) {
  const summary = await getDailySummary(symbol, "");
  if (!summary.ok) return summary;
  return {
    ok: true,
    source: summary.source,
    symbol,
    price: summary.close,
    change: summary.close != null && summary.preClose != null ? summary.close - summary.preClose : null,
    changePercent: summary.changePercent,
    preClose: summary.preClose,
    open: summary.open,
    high: summary.high,
    low: summary.low,
    volume: summary.volume,
    amount: summary.amount,
    time: summary.tradeDate,
    tradeDate: summary.tradeDate,
    mode: "historical",
    status: "historical"
  };
}

async function getLastTradingDay(symbol) {
  const kline = await getKline(symbol, "day", 20);
  const last = (kline.items || []).at(-1);
  if (!last) return { ok: false, symbol, message: "last trading day unavailable" };
  return { ok: true, symbol, source: kline.source, tradeDate: last.time };
}

async function withFallback(kind, symbol, adapters) {
  const errors = [];
  for (const adapter of adapters) {
    try {
      const payload = await adapter();
      if (payload && payload.ok !== false) return { ok: true, ...payload };
      errors.push(payload?.message || `${kind} adapter returned no data`);
    } catch (error) {
      errors.push(error.message || String(error));
    }
  }
  return {
    ok: false,
    symbol,
    message: "真实行情暂不可用",
    errors
  };
}

async function eastmoneyQuote(symbol) {
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${eastmoneySecid(symbol)}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f86,f169,f170`;
  const payload = await fetchJson(url);
  const data = payload.data;
  if (!data || data.f43 == null || data.f43 === "-") throw new Error("eastmoney quote empty");
  const price = scale100(data.f43);
  const preClose = scale100(data.f60);
  return {
    source: "eastmoney",
    name: data.f58 || "",
    code: data.f57 || symbol.slice(2),
    symbol,
    price,
    change: scale100(data.f169),
    changePercent: scale100(data.f170),
    preClose,
    open: scale100(data.f46),
    high: scale100(data.f44),
    low: scale100(data.f45),
    volume: numberOrNull(data.f47) ? Number(data.f47) * 100 : null,
    amount: numberOrNull(data.f48),
    time: eastmoneyTime(data.f86),
    tradeDate: eastmoneyTime(data.f86).slice(0, 10),
    mode: "realtime",
    status: price === 0 && preClose ? "suspended" : "realtime"
  };
}

async function sinaQuote(symbol) {
  const prefix = marketPrefix(symbol);
  const url = `https://hq.sinajs.cn/list=${prefix}${symbol.slice(2)}`;
  const text = await fetchText(url, { Referer: "https://finance.sina.com.cn/" });
  const match = text.match(/="([^"]*)"/);
  if (!match || !match[1]) throw new Error("sina quote empty");
  const parts = match[1].split(",");
  if (parts.length < 32 || !parts[3]) throw new Error("sina quote invalid");
  const price = numberOrNull(parts[3]);
  const preClose = numberOrNull(parts[2]);
  const date = parts[30] || "";
  const time = parts[31] || "";
  return {
    source: "sina",
    name: parts[0] || "",
    code: symbol.slice(2),
    symbol,
    price,
    change: price != null && preClose != null ? price - preClose : null,
    changePercent: price != null && preClose ? ((price - preClose) / preClose) * 100 : null,
    preClose,
    open: numberOrNull(parts[1]),
    high: numberOrNull(parts[4]),
    low: numberOrNull(parts[5]),
    volume: numberOrNull(parts[8]),
    amount: numberOrNull(parts[9]),
    time: `${date} ${time}`.trim(),
    tradeDate: date,
    mode: "realtime",
    status: price === 0 && preClose ? "suspended" : "realtime"
  };
}

async function tencentQuote(symbol) {
  const prefix = marketPrefix(symbol);
  const url = `https://qt.gtimg.cn/q=${prefix}${symbol.slice(2)}`;
  const text = await fetchText(url);
  const match = text.match(/="([^"]*)"/);
  if (!match || !match[1]) throw new Error("tencent quote empty");
  const parts = match[1].split("~");
  if (parts.length < 39 || !parts[3]) throw new Error("tencent quote invalid");
  const price = numberOrNull(parts[3]);
  const preClose = numberOrNull(parts[4]);
  const timestamp = parts[30] || "";
  return {
    source: "tencent",
    name: parts[1] || "",
    code: parts[2] || symbol.slice(2),
    symbol,
    price,
    change: numberOrNull(parts[31]),
    changePercent: numberOrNull(parts[32]),
    preClose,
    open: numberOrNull(parts[5]),
    high: numberOrNull(parts[33]),
    low: numberOrNull(parts[34]),
    volume: numberOrNull(parts[6]) ? Number(parts[6]) * 100 : null,
    amount: numberOrNull(parts[37]) ? Number(parts[37]) * 10000 : null,
    time: formatTencentTimestamp(timestamp),
    tradeDate: formatTencentTimestamp(timestamp).slice(0, 10),
    mode: "realtime",
    status: price === 0 && preClose ? "suspended" : "realtime"
  };
}

async function eastmoneyIntraday(symbol, tradeDate) {
  const url = `https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${eastmoneySecid(symbol)}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11&fields2=f51,f52,f53,f54,f55,f56,f57,f58&iscr=0&iscca=0&ndays=1`;
  const payload = await fetchJson(url);
  const trends = payload.data?.trends || [];
  const items = trends.map((line) => {
    const p = String(line).split(",");
    return {
      time: p[0],
      price: numberOrNull(p[2]),
      avgPrice: numberOrNull(p[7]),
      volume: numberOrNull(p[5]) ? Number(p[5]) * 100 : null,
      amount: numberOrNull(p[6]),
      changePercent: null,
      tradeDate: String(p[0] || "").slice(0, 10)
    };
  }).filter((row) => row.time && row.price != null && (!tradeDate || row.tradeDate === tradeDate));
  if (items.length < 20) throw new Error("eastmoney intraday empty");
  return { source: "eastmoney", symbol, period: "intraday", items };
}

async function sinaIntraday(symbol, tradeDate) {
  const prefix = marketPrefix(symbol);
  const url = `https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketData.getKLineData?symbol=${prefix}${symbol.slice(2)}&scale=5&ma=no&datalen=120`;
  const rows = await fetchJson(url);
  if (!Array.isArray(rows) || !rows.length) throw new Error("sina intraday empty");
  const items = rows.map((row) => ({
    time: row.day,
    price: numberOrNull(row.close),
    avgPrice: null,
    volume: numberOrNull(row.volume),
    amount: numberOrNull(row.amount),
    changePercent: null,
    tradeDate: String(row.day || "").slice(0, 10)
  })).filter((row) => row.time && row.price != null && (!tradeDate || row.tradeDate === tradeDate));
  if (items.length < 20) throw new Error("sina intraday no matching date");
  return { source: "sina", symbol, period: "intraday", items };
}

async function tencentIntraday(symbol, tradeDate) {
  const prefix = marketPrefix(symbol);
  const code = `${prefix}${symbol.slice(2)}`;
  const url = `https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=${code}`;
  const payload = await fetchJson(url);
  const rows = payload.data?.[code]?.data?.data || [];
  const date = tradeDate || currentChinaDate();
  const items = rows.map((line) => {
    const p = String(line).split(" ");
    const minute = p[0] || "";
    return {
      time: `${date} ${minute.slice(0, 2)}:${minute.slice(2, 4)}`,
      price: numberOrNull(p[1]),
      avgPrice: null,
      volume: numberOrNull(p[2]) ? Number(p[2]) * 100 : null,
      amount: numberOrNull(p[3]),
      changePercent: null,
      tradeDate: date
    };
  }).filter((row) => row.price != null);
  if (items.length < 20) throw new Error("tencent intraday empty");
  return { source: "tencent", symbol, period: "intraday", items };
}

async function eastmoneyKline(symbol, period, count) {
  const klt = period === "week" ? 102 : 101;
  const begin = beginDateForCount(count);
  const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${eastmoneySecid(symbol)}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=${klt}&fqt=1&beg=${begin}&end=20500101&lmt=${Math.max(count, 120)}`;
  const payload = await fetchJson(url);
  const klines = payload.data?.klines || [];
  const items = klines.map(parseEastmoneyKline).filter(Boolean).slice(-count);
  if (!items.length) throw new Error("eastmoney kline empty");
  return { source: "eastmoney", symbol, period, items };
}

async function sinaKline(symbol, period, count) {
  const prefix = marketPrefix(symbol);
  const scale = period === "week" ? 1200 : 240;
  const url = `https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketData.getKLineData?symbol=${prefix}${symbol.slice(2)}&scale=${scale}&ma=no&datalen=${count}`;
  const rows = await fetchJson(url);
  if (!Array.isArray(rows) || !rows.length) throw new Error("sina kline empty");
  const items = rows.map((row) => ({
    time: String(row.day || "").slice(0, 10),
    open: numberOrNull(row.open),
    high: numberOrNull(row.high),
    low: numberOrNull(row.low),
    close: numberOrNull(row.close),
    volume: numberOrNull(row.volume),
    amount: numberOrNull(row.amount),
    changePercent: null
  })).filter(validKlineRow);
  if (!items.length) throw new Error("sina kline invalid");
  return { source: "sina", symbol, period, items };
}

async function tencentKline(symbol, period, count) {
  const prefix = marketPrefix(symbol);
  const code = `${prefix}${symbol.slice(2)}`;
  const tencentPeriod = period === "week" ? "week" : "day";
  const url = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${code},${tencentPeriod},,,${count},qfq`;
  const payload = await fetchJson(url);
  const data = payload.data?.[code] || {};
  const rows = data[`qfq${tencentPeriod}`] || data[tencentPeriod] || [];
  const items = rows.map((row) => ({
    time: row[0],
    open: numberOrNull(row[1]),
    close: numberOrNull(row[2]),
    high: numberOrNull(row[3]),
    low: numberOrNull(row[4]),
    volume: numberOrNull(row[5]) ? Number(row[5]) * 100 : null,
    amount: null,
    changePercent: null
  })).filter(validKlineRow);
  if (!items.length) throw new Error("tencent kline empty");
  return { source: "tencent", symbol, period, items };
}

function parseEastmoneyKline(line) {
  const p = String(line).split(",");
  const row = {
    time: p[0],
    open: numberOrNull(p[1]),
    close: numberOrNull(p[2]),
    high: numberOrNull(p[3]),
    low: numberOrNull(p[4]),
    volume: numberOrNull(p[5]) ? Number(p[5]) * 100 : null,
    amount: numberOrNull(p[6]),
    changePercent: numberOrNull(p[8])
  };
  return validKlineRow(row) ? row : null;
}

function validKlineRow(row) {
  return row && row.time && row.open != null && row.high != null && row.low != null && row.close != null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json,text/plain,*/*",
      referer: "https://finance.sina.com.cn/"
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`upstream error ${response.status}`);
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/^[^{[]*([{\[][\s\S]*[}\]])/);
    if (match) return JSON.parse(match[1]);
    throw new Error("upstream json parse failed");
  }
}

async function fetchText(url, extraHeaders = {}) {
  const response = await fetch(url, {
    headers: {
      accept: "text/plain,*/*",
      ...extraHeaders
    }
  });
  if (!response.ok) throw new Error(`upstream error ${response.status}`);
  return response.text();
}

function normalizeSymbol(symbol) {
  const value = String(symbol).trim().toUpperCase();
  if (/^(SH|SZ)\d{6}$/.test(value)) return value;
  if (/^6|^5|^9/.test(value)) return `SH${value}`;
  if (/^0|^1|^2|^3/.test(value)) return `SZ${value}`;
  return value;
}

function eastmoneySecid(symbol) {
  const normalized = normalizeSymbol(symbol);
  const market = normalized.startsWith("SH") ? "1" : "0";
  return `${market}.${normalized.slice(2)}`;
}

function marketPrefix(symbol) {
  return normalizeSymbol(symbol).startsWith("SH") ? "sh" : "sz";
}

function scale100(value) {
  const number = numberOrNull(value);
  return number == null ? null : number / 100;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function eastmoneyTime(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "";
  return new Date((number + 8 * 3600) * 1000).toISOString().replace("T", " ").slice(0, 19);
}

function formatTencentTimestamp(value) {
  const text = String(value || "");
  if (text.length < 14) return "";
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)} ${text.slice(8, 10)}:${text.slice(10, 12)}:${text.slice(12, 14)}`;
}

function beginDateForCount(count) {
  const date = new Date();
  date.setDate(date.getDate() - Math.max(Number(count) * 3, 220));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function currentChinaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
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
