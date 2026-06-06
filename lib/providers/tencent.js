const { num, pct, chinaDate } = require("./common");

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`tencent upstream ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`tencent upstream ${response.status}`);
  return response.json();
}

function formatTimestamp(value) {
  const text = String(value || "");
  if (text.length < 14) return "";
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)} ${text.slice(8, 10)}:${text.slice(10, 12)}:${text.slice(12, 14)}`;
}

async function quote(meta) {
  const text = await fetchText(`https://qt.gtimg.cn/q=${meta.tencentSymbol}`);
  const match = text.match(/="([^"]*)"/);
  if (!match || !match[1]) throw new Error("tencent quote empty");
  const p = match[1].split("~");
  if (p.length < 39 || !p[3]) throw new Error("tencent quote invalid");
  const price = num(p[3]);
  const preClose = num(p[4]);
  return {
    source: "tencent",
    name: p[1] || meta.name,
    code: p[2] || meta.code,
    type: meta.type,
    market: meta.market,
    symbol: meta.symbol,
    time: formatTimestamp(p[30]),
    price,
    preClose,
    open: num(p[5]),
    high: num(p[33]),
    low: num(p[34]),
    change: num(p[31]) ?? (price != null && preClose != null ? price - preClose : null),
    changePercent: num(p[32]) ?? pct(price, preClose),
    volume: num(p[6]) != null ? num(p[6]) * 100 : null,
    amount: num(p[37]) != null ? num(p[37]) * 10000 : null
  };
}

async function intraday(meta) {
  const payload = await fetchJson(`https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=${meta.tencentSymbol}`);
  const rows = payload.data?.[meta.tencentSymbol]?.data?.data || [];
  if (rows.length < 20) throw new Error("tencent intraday empty");
  const date = chinaDate();
  return rows.map((line) => {
    const p = String(line).split(" ");
    const minute = p[0] || "";
    return {
      time: `${date} ${minute.slice(0, 2)}:${minute.slice(2, 4)}`,
      price: num(p[1]),
      avgPrice: null,
      volume: num(p[2]) != null ? num(p[2]) * 100 : null,
      amount: num(p[3])
    };
  }).filter((row) => row.price != null);
}

async function kline(meta, period = "day", count = 120) {
  const tencentPeriod = period === "week" ? "week" : "day";
  const payload = await fetchJson(`https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${meta.tencentSymbol},${tencentPeriod},,,${count},qfq`);
  const data = payload.data?.[meta.tencentSymbol] || {};
  const rows = data[`qfq${tencentPeriod}`] || data[tencentPeriod] || [];
  if (!rows.length) throw new Error("tencent kline empty");
  return rows.map((row) => ({
    time: row[0],
    open: num(row[1]),
    close: num(row[2]),
    high: num(row[3]),
    low: num(row[4]),
    volume: num(row[5]) != null ? num(row[5]) * 100 : null,
    amount: null
  })).filter((row) => row.time && row.open != null && row.high != null && row.low != null && row.close != null);
}

module.exports = { providerName: "tencent", quote, intraday, kline };
