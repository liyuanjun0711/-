const { num, pct } = require("./common");

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json,text/plain,*/*" } });
  if (!response.ok) throw new Error(`eastmoney upstream ${response.status}`);
  return response.json();
}

function scale100(value) {
  const number = num(value);
  return number == null ? null : number / 100;
}

function eastmoneyTime(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "";
  return new Date((number + 8 * 3600) * 1000).toISOString().replace("T", " ").slice(0, 19);
}

function beginDateForCount(count) {
  const date = new Date();
  date.setDate(date.getDate() - Math.max(Number(count) * 3, 220));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

async function quote(meta) {
  const payload = await fetchJson(`https://push2.eastmoney.com/api/qt/stock/get?secid=${meta.eastmoneySecid}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f86,f169,f170`);
  const data = payload.data;
  if (!data || data.f43 == null || data.f43 === "-") throw new Error("eastmoney quote empty");
  const price = scale100(data.f43);
  const preClose = scale100(data.f60);
  return {
    source: "eastmoney",
    name: data.f58 || meta.name,
    code: data.f57 || meta.code,
    type: meta.type,
    market: meta.market,
    symbol: meta.symbol,
    time: eastmoneyTime(data.f86),
    price,
    preClose,
    open: scale100(data.f46),
    high: scale100(data.f44),
    low: scale100(data.f45),
    change: scale100(data.f169) ?? (price != null && preClose != null ? price - preClose : null),
    changePercent: scale100(data.f170) ?? pct(price, preClose),
    volume: num(data.f47) != null ? num(data.f47) * 100 : null,
    amount: num(data.f48)
  };
}

async function intraday(meta, tradeDate = "") {
  const ndays = tradeDate ? 5 : 1;
  const payload = await fetchJson(`https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${meta.eastmoneySecid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11&fields2=f51,f52,f53,f54,f55,f56,f57,f58&iscr=0&iscca=0&ndays=${ndays}`);
  const rows = payload.data?.trends || [];
  if (rows.length < 20) throw new Error("eastmoney intraday empty");
  const mapped = rows.map((line) => {
    const p = String(line).split(",");
    return {
      time: p[0],
      price: num(p[2]),
      avgPrice: num(p[7]),
      volume: num(p[5]) != null ? num(p[5]) * 100 : null,
      amount: num(p[6])
    };
  }).filter((row) => row.time && row.price != null);
  const filtered = tradeDate ? mapped.filter((row) => String(row.time).startsWith(tradeDate)) : mapped;
  if (filtered.length < 20) throw new Error("eastmoney intraday date empty");
  return filtered;
}

async function kline(meta, period = "day", count = 120) {
  const klt = period === "week" ? 102 : 101;
  const payload = await fetchJson(`https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${meta.eastmoneySecid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=${klt}&fqt=1&beg=${beginDateForCount(count)}&end=20500101&lmt=${Math.max(count, 120)}`);
  const rows = payload.data?.klines || [];
  if (!rows.length) throw new Error("eastmoney kline empty");
  return rows.map((line) => {
    const p = String(line).split(",");
    return {
      time: p[0],
      open: num(p[1]),
      close: num(p[2]),
      high: num(p[3]),
      low: num(p[4]),
      volume: num(p[5]) != null ? num(p[5]) * 100 : null,
      amount: num(p[6]),
      changePercent: num(p[8])
    };
  }).filter((row) => row.time && row.open != null && row.high != null && row.low != null && row.close != null).slice(-count);
}

module.exports = { providerName: "eastmoney", quote, intraday, kline };
