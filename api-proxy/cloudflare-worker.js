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
      if (url.pathname === "/api/quote") return json(await getQuote(url.searchParams.get("symbol") || ""));
      if (url.pathname === "/api/intraday") return json(await getIntraday(url.searchParams.get("symbol") || ""));
      if (url.pathname === "/api/kline") return json(await getKline(url.searchParams.get("symbol") || "", url.searchParams.get("period") || "day"));
      if (url.pathname === "/api/fund") return json(await getFundInfo(url.searchParams.get("symbol") || ""));
      if (url.pathname === "/api/news") return json({ ok: false, message: "news adapter not configured" }, 501);
      return json({ ok: false, message: "not found" }, 404);
    } catch (error) {
      return json({ ok: false, message: error.message || "proxy error" }, 502);
    }
  }
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers });
}

function searchLocalIndex(keyword) {
  const items = [
    { name: "东材科技", code: "601208", symbol: "SH601208", market: "SH", type: "stock" },
    { name: "天齐锂业", code: "002466", symbol: "SZ002466", market: "SZ", type: "stock" },
    { name: "中国联通", code: "600050", symbol: "SH600050", market: "SH", type: "stock" },
    { name: "中芯国际", code: "688981", symbol: "SH688981", market: "SH", type: "stock" },
    { name: "黄金LOF", code: "164701", symbol: "SZ164701", market: "SZ", type: "exchange_fund" },
    { name: "易方达蓝筹精选混合", code: "005827", symbol: "OF005827", market: "OF", type: "open_fund" }
  ];
  const value = keyword.trim().toLowerCase();
  return { ok: true, items: items.filter((item) => item.code.includes(value) || item.name.toLowerCase().includes(value)) };
}

async function getQuote(symbol) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  return {
    ok: false,
    symbol,
    message: "real quote adapter not configured; do not return fake price"
  };
}

async function getIntraday(symbol) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  return {
    ok: false,
    symbol,
    period: "intraday",
    message: "real intraday adapter not configured; do not draw fake line"
  };
}

async function getKline(symbol, period) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  return {
    ok: false,
    symbol,
    period,
    message: "real kline adapter not configured; do not draw fake kline"
  };
}

async function getFundInfo(symbol) {
  if (!symbol) return { ok: false, message: "missing symbol" };
  return {
    ok: false,
    symbol,
    message: "real fund net value adapter not configured"
  };
}
