const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type"
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: jsonHeaders });

    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/search") return json(searchStocks(url.searchParams.get("keyword") || ""));
      if (url.pathname === "/api/quote") return json(await getQuote(url.searchParams.get("code") || ""));
      if (url.pathname === "/api/kline") {
        return json(await getKline(url.searchParams.get("code") || "", url.searchParams.get("period") || "1m"));
      }
      if (url.pathname === "/api/news") return json({ items: [], mode: "delayed" });
      return json({ error: "not found" }, 404);
    } catch (error) {
      return json({ error: error.message || "proxy error", mode: "failed" }, 502);
    }
  }
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders });
}

function searchStocks(keyword) {
  const demo = [
    { name: "东材科技", code: "601208", market: "SH" },
    { name: "天齐锂业", code: "002466", market: "SZ" },
    { name: "中国联通", code: "600050", market: "SH" },
    { name: "中芯国际", code: "688981", market: "SH" }
  ];
  const value = keyword.trim().toLowerCase();
  return { items: demo.filter((item) => item.code.includes(value) || item.name.toLowerCase().includes(value)) };
}

async function getQuote(code) {
  if (!code) throw new Error("missing code");

  // Replace this mock with an upstream request to Eastmoney or another licensed data source.
  // Keep upstream credentials and anti-abuse handling inside the Worker, never in GitHub Pages.
  return {
    name: "",
    code,
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    amount: 0,
    time: new Date().toISOString(),
    mode: "delayed"
  };
}

async function getKline(code, period) {
  if (!code) throw new Error("missing code");
  return { code, period, mode: "delayed", items: [] };
}
