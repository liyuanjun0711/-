const { num, pct } = require("./common");

async function fetchText(url, headers = {}) {
  const response = await fetch(url, { headers: { referer: "https://finance.sina.com.cn/", ...headers } });
  if (!response.ok) throw new Error(`sina upstream ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const text = await fetchText(url);
  return JSON.parse(text.replace(/^[^{[]*/, ""));
}

async function quote(meta) {
  if (meta.type === "open_fund") throw new Error("sina quote does not support open fund realtime");
  const text = await fetchText(`https://hq.sinajs.cn/list=${meta.sinaSymbol}`);
  const match = text.match(/="([^"]*)"/);
  if (!match || !match[1]) throw new Error("sina quote empty");
  const p = match[1].split(",");
  if (p.length < 32 || !p[3]) throw new Error("sina quote invalid");
  const price = num(p[3]);
  const preClose = num(p[2]);
  return {
    source: "sina",
    name: p[0] || meta.name,
    code: meta.code,
    type: meta.type,
    market: meta.market,
    symbol: meta.symbol,
    time: `${p[30] || ""} ${p[31] || ""}`.trim(),
    price,
    preClose,
    open: num(p[1]),
    high: num(p[4]),
    low: num(p[5]),
    change: price != null && preClose != null ? price - preClose : null,
    changePercent: pct(price, preClose),
    volume: num(p[8]),
    amount: num(p[9])
  };
}

async function intraday(meta) {
  const rows = await fetchJson(`https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketData.getKLineData?symbol=${meta.sinaSymbol}&scale=5&ma=no&datalen=120`);
  if (!Array.isArray(rows) || rows.length < 20) throw new Error("sina intraday empty");
  return rows.map((row) => ({
    time: row.day,
    price: num(row.close),
    avgPrice: null,
    volume: num(row.volume),
    amount: num(row.amount)
  })).filter((row) => row.time && row.price != null);
}

async function kline(meta, period = "day", count = 120) {
  const scale = period === "week" ? 1200 : 240;
  const rows = await fetchJson(`https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketData.getKLineData?symbol=${meta.sinaSymbol}&scale=${scale}&ma=no&datalen=${count}`);
  if (!Array.isArray(rows) || !rows.length) throw new Error("sina kline empty");
  return rows.map((row) => ({
    time: String(row.day || "").slice(0, 10),
    open: num(row.open),
    high: num(row.high),
    low: num(row.low),
    close: num(row.close),
    volume: num(row.volume),
    amount: num(row.amount)
  })).filter((row) => row.time && row.open != null && row.high != null && row.low != null && row.close != null);
}

module.exports = { providerName: "sina", quote, intraday, kline };
