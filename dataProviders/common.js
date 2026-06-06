const SYMBOLS = [
  { name: "东材科技", code: "601208", market: "SH", type: "stock", sector: "电子材料" },
  { name: "天齐锂业", code: "002466", market: "SZ", type: "stock", sector: "锂矿" },
  { name: "中国联通", code: "600050", market: "SH", type: "stock", sector: "通信/6G" },
  { name: "中芯国际", code: "688981", market: "SH", type: "stock", sector: "半导体" },
  { name: "恒生科技ETF大成", code: "159740", market: "SZ", type: "exchange_fund", sector: "港股科技" },
  { name: "黄金LOF", code: "164701", market: "SZ", type: "exchange_fund", sector: "黄金" },
  { name: "军工龙头ETF富国", code: "512710", market: "SH", type: "exchange_fund", sector: "军工" },
  { name: "国投白银LOF", code: "161226", market: "SZ", type: "exchange_fund", sector: "白银" },
  { name: "稀有金属ETF广发", code: "159608", market: "SZ", type: "exchange_fund", sector: "稀有金属" },
  { name: "易方达蓝筹精选混合", code: "005827", market: "OF", type: "open_fund", sector: "开放式基金" }
];

function normalizeSymbol(input) {
  const raw = String(input || "").trim();
  const upper = raw.toUpperCase();
  const byName = SYMBOLS.find((item) => item.name === raw || item.name.toLowerCase().includes(raw.toLowerCase()));
  if (byName) return toSymbolShape(byName);
  const code = upper.replace(/^(SH|SZ|BJ|OF)/, "");
  const byCode = SYMBOLS.find((item) => item.code === code);
  if (byCode) return toSymbolShape(byCode);
  if (/^(SH|SZ|BJ|OF)\d{6}$/.test(upper)) {
    return toSymbolShape({ code: upper.slice(2), market: upper.slice(0, 2), type: inferType(upper.slice(2)) });
  }
  if (/^\d{6}$/.test(upper)) {
    return toSymbolShape({ code: upper, market: inferMarket(upper), type: inferType(upper) });
  }
  throw new Error("invalid symbol");
}

function toSymbolShape(item) {
  const market = item.market || inferMarket(item.code);
  const code = String(item.code);
  return {
    name: item.name || "",
    code,
    market,
    type: item.type || inferType(code),
    symbol: `${market}${code}`,
    sinaSymbol: `${market.toLowerCase()}${code}`,
    tencentSymbol: `${market.toLowerCase()}${code}`,
    eastmoneySecid: `${market === "SH" ? "1" : "0"}.${code}`,
    sector: item.sector || ""
  };
}

function inferMarket(code) {
  const value = String(code);
  if (/^[6895]/.test(value)) return "SH";
  if (/^[0123]/.test(value)) return "SZ";
  if (/^[48]/.test(value)) return "BJ";
  return "OF";
}

function inferType(code) {
  const value = String(code);
  if (/^00|^30|^60|^68|^8|^4/.test(value)) return "stock";
  if (/^[15]/.test(value)) return "exchange_fund";
  return "open_fund";
}

function localSearch(keyword) {
  const value = String(keyword || "").trim().toLowerCase();
  if (!value) return [];
  return SYMBOLS.filter((item) => item.code.includes(value) || item.name.toLowerCase().includes(value))
    .map(toSymbolShape);
}

function marketStatus() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = dayMap[parts.find((part) => part.type === "weekday")?.value] ?? 0;
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  const minutes = hour * 60 + minute;
  if (day === 0 || day === 6) return { marketStatus: "non_trading_day", mode: "closed" };
  if ((minutes >= 570 && minutes <= 690) || (minutes >= 780 && minutes <= 900)) return { marketStatus: "trading", mode: "realtime" };
  if (minutes > 690 && minutes < 780) return { marketStatus: "lunch_break", mode: "delayed" };
  return { marketStatus: "closed", mode: "closed" };
}

function json(res, status, payload) {
  res.status(status).setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
  res.end(JSON.stringify(payload));
}

function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    json(res, 200, {});
    return true;
  }
  return false;
}

function num(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pct(price, preClose) {
  if (price == null || !preClose) return null;
  return ((price - preClose) / preClose) * 100;
}

function chinaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

module.exports = {
  SYMBOLS,
  normalizeSymbol,
  localSearch,
  marketStatus,
  json,
  handleOptions,
  num,
  pct,
  chinaDate
};
