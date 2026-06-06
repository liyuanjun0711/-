const fs = require("fs");
const path = require("path");
const { SYMBOLS } = require("./common");

function loadNewsConfig() {
  const file = path.join(process.cwd(), "config", "newsSources.json");
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw);
}

async function searchNews({ symbols = [], keywords = [], limit = 12 } = {}) {
  const config = loadNewsConfig();
  const enabled = (config.sources || []).filter((source) => source.enabled);
  const queries = buildQueries(symbols, keywords, config.defaultKeywords || []);
  const results = [];
  const errors = [];

  for (const query of queries) {
    for (const source of enabled) {
      try {
        const items = await fetchSource(source, query, symbols);
        results.push(...items);
      } catch (error) {
        errors.push(`${source.name}: ${error.message}`);
      }
    }
    if (results.length >= limit) break;
  }

  const deduped = dedupeNews(results)
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, limit);

  if (!deduped.length && errors.length) {
    const failure = new Error(errors.join("; "));
    failure.errors = errors;
    throw failure;
  }

  return deduped;
}

function buildQueries(symbols, keywords, defaults) {
  const clean = (value) => String(value || "").trim();
  const symbolCodes = symbols.map((symbol) => clean(symbol).slice(-6)).filter(Boolean);
  const values = [...keywords, ...symbolCodes, ...defaults].map(clean).filter(Boolean);
  return [...new Set(values)].slice(0, 10);
}

async function fetchSource(source, query, symbols) {
  if (source.type === "eastmoney-search") return fetchEastmoneyNews(source, query, symbols);
  if (source.type === "google-news-rss") return fetchGoogleNews(source, query, symbols);
  throw new Error(`unsupported source ${source.type}`);
}

async function fetchEastmoneyNews(source, query, symbols) {
  const param = {
    uid: "",
    keyword: query,
    type: ["cmsArticleWebOld"],
    client: "web",
    clientType: "web",
    clientVersion: "curr",
    param: {
      cmsArticleWebOld: {
        searchScope: "default",
        sort: "default",
        pageIndex: 1,
        pageSize: Number(source.pageSize || 8),
        preTag: "<em>",
        postTag: "</em>"
      }
    }
  };
  const url = `${source.url}?${new URLSearchParams({
    cb: "jQuery_news",
    param: JSON.stringify(param),
    _: Date.now()
  })}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/javascript,text/plain,*/*",
      referer: "https://so.eastmoney.com/",
      "user-agent": "Mozilla/5.0 market-briefing-workbench"
    }
  });
  if (!response.ok) throw new Error(`upstream ${response.status}`);
  const text = await response.text();
  const payload = parseJsonp(text);
  const rows = payload?.result?.cmsArticleWebOld || [];
  return rows
    .filter((row) => row.title && row.url && row.date)
    .map((row) => toNewsItem({
      title: cleanText(row.title),
      link: row.url,
      pubDate: row.date,
      description: cleanText(row.content),
      source: row.mediaName || source.name,
      code: row.code
    }, source, query, symbols));
}

async function fetchGoogleNews(source, query, symbols) {
  const url = source.url.replace("{query}", encodeURIComponent(query));
  const response = await fetch(url, {
    headers: {
      accept: "application/rss+xml, application/xml, text/xml, */*",
      "user-agent": "Mozilla/5.0 market-briefing-workbench"
    }
  });
  if (!response.ok) throw new Error(`upstream ${response.status}`);
  const xml = await response.text();
  if (!/<item[\s>]/.test(xml)) return [];
  return parseRssItems(xml).map((item) => toNewsItem(item, source, query, symbols));
}

function parseJsonp(text) {
  const match = String(text || "").match(/^[^(]*\(([\s\S]*)\)\s*;?\s*$/);
  if (!match) throw new Error("invalid jsonp");
  return JSON.parse(match[1]);
}

function parseRssItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
    const block = match[1];
    return {
      title: decodeXml(readTag(block, "title")),
      link: decodeXml(readTag(block, "link")),
      pubDate: decodeXml(readTag(block, "pubDate")),
      description: stripHtml(decodeXml(readTag(block, "description"))),
      source: decodeXml(readTag(block, "source"))
    };
  }).filter((item) => item.title && item.link && item.pubDate);
}

function readTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function toNewsItem(item, source, query, symbols) {
  const publishedAt = formatChinaTime(item.pubDate);
  const text = `${item.title} ${item.description}`;
  const relatedSymbols = inferRelatedSymbols(text, symbols);
  const impact = inferImpact(text, item.title);
  const summary = buildSummary(item, query, impact);
  return {
    id: stableId(item.link || `${item.title}-${item.pubDate}`),
    title: item.title,
    publishedAt,
    source: item.source || source.name,
    url: item.link,
    location: inferLocation(text),
    peopleOrOrg: inferOrganizations(text, query),
    relatedSymbols,
    sector: query,
    event: item.description || item.title,
    summary,
    impact: impact.type,
    impactScore: impact.score,
    whyItMatters: inferWhyItMatters(query, relatedSymbols, impact),
    rawQuery: query
  };
}

function buildSummary(item, query, impact) {
  const dateText = formatDateOnly(item.pubDate) || "近日";
  const sourceText = item.source || "公开财经媒体";
  const description = item.description || item.title;
  const matter = `该消息与${query}相关，影响方向：${impact.label}；是否改变今日计划，还要看真实价格、成交量和关键位。`;
  const max = 180;
  const room = Math.max(60, max - matter.length - 1);
  const base = clampSentence(`${dateText}，${sourceText}报道：${item.title}。${description}`, room);
  return ensureMinLength(`${base} ${matter}`, 80);
}

function inferImpact(text, title = "") {
  if (/(减持|处罚|调查|问询|停牌|退市|亏损|下调|违约|制裁)/.test(title)) {
    return { type: "negative", score: 3, label: "利空" };
  }
  if (/(回购|增持|中标|获批|涨停|创新高|扭亏|签约|订单)/.test(title)) {
    return { type: "positive", score: 7, label: "利好" };
  }
  const positive = countMatches(text, /(增长|中标|突破|回购|增持|利好|上调|扩产|签约|盈利|景气|政策支持|涨停|异动|订单|获批|创新高|扭亏)/g);
  const negative = countMatches(text, /(下滑|亏损|减持|处罚|调查|风险|下调|终止|违约|跌破|压力|制裁|停牌|问询|退市|亏本)/g);
  if (negative > 0 && negative >= positive) return { type: "negative", score: 3, label: "利空" };
  if (positive > 0 && positive > negative) return { type: "positive", score: 7, label: "利好" };
  return { type: "neutral", score: 5, label: "中性" };
}

function countMatches(text, pattern) {
  return (String(text || "").match(pattern) || []).length;
}

function inferRelatedSymbols(text, requestedSymbols) {
  const direct = requestedSymbols.filter((symbol) => text.includes(symbol) || text.includes(symbol.slice(-6)));
  const fromNames = SYMBOLS
    .filter((item) => item.name && text.includes(item.name))
    .map((item) => `${item.market}${item.code}`);
  return [...new Set([...direct, ...fromNames])];
}

function inferLocation(text) {
  if (/上海|上交所|沪市/.test(text)) return "上海";
  if (/深圳|深交所|深市/.test(text)) return "深圳";
  if (/香港|港股|恒生/.test(text)) return "香港";
  if (/美国|美股|纳斯达克|纽约/.test(text)) return "海外";
  if (/北京|证监会|国务院|发改委|央行/.test(text)) return "北京";
  return "未披露";
}

function inferOrganizations(text, query) {
  const names = [query];
  const orgMatches = text.match(/[\u4e00-\u9fa5A-Za-z0-9]{2,20}(公司|集团|证券|基金|交易所|委员会|银行|科技|材料|能源|股份|有限)/g) || [];
  return [...new Set(names.concat(orgMatches).filter(Boolean))].slice(0, 5);
}

function inferWhyItMatters(query, relatedSymbols, impact) {
  const target = relatedSymbols.length ? relatedSymbols.join("、") : query;
  return `影响${target}的情绪和资金关注度；方向暂按${impact.label}处理，需用真实行情、成交量和支撑压力位验证。`;
}

function matchesAny(item, values) {
  const text = `${item.title} ${item.description}`;
  return values.some((value) => value && text.includes(value));
}

function dedupeNews(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.url || item.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stableId(value) {
  let hash = 0;
  for (const char of String(value)) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return `news-${Math.abs(hash)}`;
}

function cleanText(value) {
  return stripHtml(decodeXml(String(value || ""))).replace(/\s+/g, " ").trim();
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function formatChinaTime(value) {
  const raw = String(value || "").trim();
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(raw) ? raw.replace(" ", "T") + "+08:00" : raw;
  const date = new Date(normalized);
  if (!Number.isFinite(date.getTime())) return raw.slice(0, 16);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function formatDateOnly(value) {
  return formatChinaTime(value).slice(0, 10);
}

function clampSentence(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function ensureMinLength(text, min) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length >= min) return clean;
  return `${clean} 后续仍需核对原文、公告和盘面反馈，避免只凭标题交易。`;
}

module.exports = { searchNews };
