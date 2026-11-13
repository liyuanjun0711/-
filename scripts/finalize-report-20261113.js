const fs = require("fs");
const vm = require("vm");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("report-data.js", "utf8"), context);

const data = context.window.MARKET_BRIEFING_DATA;
const snapshot = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261113.json", "utf8"));
const indexSnapshot = JSON.parse(fs.readFileSync("scripts/index-snapshot-20261113.json", "utf8"));
const quoteBySymbol = new Map(snapshot.quotes.map((row) => [row.symbol, row]));
const round = (value, digits = 2) => Number(Number(value).toFixed(digits));

if (snapshot.expectedDate !== "2026-11-13") throw new Error("market snapshot date mismatch");
if (snapshot.quotes.length !== 13) throw new Error("expected 13 exchange-traded quotes");
if (!snapshot.quotes.every((row) => row.tieOut && row.proxy.matchesConsensus && row.bar.time === "2026-11-13")) {
  throw new Error("quote/date/OHLC tie-out failed");
}
if (indexSnapshot.rows.length !== 4) throw new Error("index snapshot incomplete");
for (const row of indexSnapshot.rows) {
  const valid = row.providers.filter((provider) => provider.ok && provider.lastBar?.time === "2026-11-13");
  if (valid.length < 2) throw new Error(`index tie-out failed: ${row.symbol}`);
}

const latestFund = (code) => snapshot.funds.find((row) => row.code === code)?.body?.Data?.LSJZList?.[0];
const silverNav = latestFund("161226");
const openFundNav = latestFund("005827");
if (silverNav?.FSRQ !== "2026-11-13" || openFundNav?.FSRQ !== "2026-11-13") {
  throw new Error("fund NAV dates are not November 13");
}

const silverClose = quoteBySymbol.get("SZ161226").bar.close;
const sameDatePremium = (silverClose / Number(silverNav.DWJZ) - 1) * 100;

data.date = "2026-11-16";
data.portfolioVersion = "portfolio-2026-11-16-premarket-fee-aware-v1";
data.time = "2026-11-13 16:00收盘核验：13个场内持仓/观察标的均为11月13日真实收盘，已与自有代理、至少两家独立日K源及Longbridge收盘报价核对；11月14-15日为周末，本报告供11月16日盘前执行。开放式基金运行时接口HTTP 501，保留明确失败态。";
data.lastUpdated = "2026-11-13 16:00 北京时间（场内标的和两只基金最近真实数据日均为11月13日；周末无A股交易；开放式基金运行时接口HTTP 501）";
data.logicUpdatedAt = "2026-11-13收盘更新（券商持仓、订单与成交接口再次因OAuth授权范围不足而无法核验）";
data.oneLine = `周末不交易；11月16日盘前0买0卖。161226在11月13日收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%，低于8%硬风险线；历史碎片单仍被费用闸门拦截，先核对券商真实持仓与费率。仅供个人复盘参考。`;

data.transactionCostPolicy.candidateOrders = [
  { code: "161226", label: "历史2手普通溢价复核（持仓未授权）", side: "sell", lots: 2, referencePrice: silverClose, hardRiskExit: false },
  { code: "159740", label: "历史3手普通减仓复核", side: "sell", lots: 3, referencePrice: quoteBySymbol.get("SZ159740").bar.close, hardRiskExit: false },
  { code: "164701", label: "历史2手普通减仓复核", side: "sell", lots: 2, referencePrice: quoteBySymbol.get("SZ164701").bar.close, hardRiskExit: false },
  { code: "161725", label: "18手最低经济金额买入复核", side: "buy", lots: 18, referencePrice: quoteBySymbol.get("SZ161725").bar.close, hardRiskExit: false }
];

data.tradeDecision = [
  {
    type: "第一屏结论",
    title: "周末不交易，周一盘前0买0卖",
    conclusion: `已确认事实：13个场内标的均为11月13日真实收盘；161226同日静态溢价约${sameDatePremium.toFixed(2)}%，低于8%硬风险线；券商持仓接口仍缺少授权。`,
    action: "11月14-15日不交易；11月16日先在券商端核对实际持仓、订单、成交与费率，盘前买0手、卖0手。",
    trigger: "只有实际持仓已确认，且真实价格、同日净值、资金来源、费用与收益门同时通过，才重新计算可执行手数。",
    reason: "不把历史手数、周末静态数据或计划卖出机械转成订单。仅供个人复盘参考。"
  },
  {
    type: "费用闸门",
    title: "三笔历史碎片卖单继续暂停",
    conclusion: "按11月13日真实收盘：161226历史2手约290.80元/单边费1.72%，159740历史3手约141.00元/3.55%，164701历史2手约300.60元/1.66%；均低于1000元且费用占比高于0.5%。",
    action: "普通波动只进入风险复核，不下碎片单、不拆单。",
    trigger: "基本面失效、流动性异常或经同日数据确认的LOF溢价失控，才允许越过最低经济金额。",
    reason: "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。"
  },
  {
    type: "A股收盘",
    title: "成长继续承压，4700余股下跌",
    conclusion: "已确认事实：11月13日上证-0.59%、深成指-2.05%、创业板-3.32%、科创50-2.30%；159740、512710、159608、159241均继续收跌。",
    action: "11月16日不抄底；先看基金是否收复11月13日高点，未收复时仅持有/复核。",
    trigger: "真实价格站稳前高、卖出资金已经成交、费用与收益门全部通过，才进入买入评估；当前仍为0手。",
    reason: "高开低走与广度转弱说明承接不足，单日下跌不构成费用后收益证据。仅供个人复盘参考。"
  },
  {
    type: "业绩事件",
    title: "中芯毛利率改善，但股价冲高回落",
    conclusion: "已确认事实：中芯国际三季度收入31.90亿美元、毛利率29.9%；11月13日股价最高116.28元、收110.50元，跌1.09%。",
    action: "把业绩改善记为半导体中期利好，但股票不买、科技基金不追；先看110.50元附近承接与基金自身走势。",
    trigger: "科技基金需先收复11月13日高点，并通过资金、费用和可核验收益门。",
    reason: "基本面利好没有抵消当日科技板块回落，不能直接外推为买点。仅供个人复盘参考。"
  },
  {
    type: "新买入",
    title: "金额过门，资金与收益证据仍缺",
    conclusion: "161725按18手约1036.80元，往返最低佣金约10元、费用占比约0.96%；预期毛收益至少需约2.89%才能覆盖往返费3倍。",
    action: "不买。没有已成交卖出资金，也没有可核验证据支持费用后收益空间。",
    trigger: "需同时有真实资金、预期毛收益≥2.89%、扣费后预期收益≥1%，且真实价格站稳0.578，再评估。",
    reason: "金额门通过不等于收益门和资金门通过。仅供个人复盘参考。"
  }
];

data.executionOrder = [
  "1. 11月14-15日为周末，不生成场内基金订单；周末页面只显示11月13日最近真实收盘。",
  "2. 11月16日09:20后先在券商端核对最新持仓、可卖份额、当日订单和实际费率；网页无法读取这些账户数据。",
  `3. 161226在11月13日同日静态溢价约${sameDatePremium.toFixed(2)}%，低于8%硬风险线；历史2手普通卖单被费用门拦截。`,
  "4. 159740历史3手、164701历史2手继续暂停，普通费用门不通过。",
  "5. 其余基金新增买入0手；任何卖出未真实成交前，不把计划卖出写成资金来源。",
  "6. 股票条目只作板块温度计，不生成股票订单。",
  "7. 运行时行情若失败、模式为failed或时间戳过期，只显示失败态，不按缓存价执行。"
];

data.tradePlan = [
  { title: "161226回到普通费用复核", basis: `11月13日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%。`, inference: "低于8%硬风险线，且历史2手约290.80元、单边费约1.72%。", conclusion: "卖0手；周一只核对持仓与同日口径。", invalidCondition: "可靠同日溢价重新达到8%且券商确认实际仍持有。" },
  { title: "成长基金连续走弱，不接周一低开", basis: "159740跌2.69%、512710跌1.80%、159241跌2.43%，创业板与科创50同步下跌。", inference: "板块承接不足，尚无费用后反弹空间证据。", conclusion: "持有/复核，新买0手。", invalidCondition: "真实价格收复11月13日高点且资金、费用、收益门全部通过。" },
  { title: "普通碎片单仍不经济", basis: "159740历史3手约141.00元，164701历史2手约300.60元。", inference: "最低佣金占比显著高于0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现明确硬风险。" },
  { title: "业绩利好与价格反应分离", basis: "中芯国际三季度收入和毛利率改善，但11月13日冲高后收跌1.09%，科创50跌2.30%。", inference: "好业绩未形成当日趋势确认。", conclusion: "股票不买，只观察科技基金承接。", invalidCondition: "科技基金收复前高且费用后收益证据成立。" }
];

data.noTradeList = [
  "不把11月13日收盘价写成周末或11月16日实时价。",
  "不在券商持仓、订单和成交接口未授权时机械卖历史手数。",
  "不执行159740历史3手、164701历史2手或161226历史2手的普通碎片卖单。",
  "不因中芯国际业绩改善追买股票或科技基金。",
  "不把计划卖出当作已到账资金；新增买入0手。",
  "不买股票观察池；股票只作基金板块温度计。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingsMeta = {
  "159740": ["0.468 / 当日低点", "0.484 / 当日高点", "持有、不补；历史3手约141.00元、单边费约3.55%，普通减仓暂停", "跌破0.468且港股科技继续转弱", 2, "连续走弱", "偏弱", "11月13日再跌2.69%并接近日低，先看能否收复0.484。", "高"],
  "164701": ["1.501 / 当日低点", "1.515 / 当日高点", "持有、不追；历史2手约300.60元、单边费约1.66%，普通减仓暂停", "跌破1.501且贵金属继续转弱", 3, "弱势收低", "偏弱", "11月13日跌1.18%并接近日低，未出现止跌确认。", "高"],
  "512710": ["0.598 / 当日低点", "0.621 / 当日高点", "持有、不补；跌破0.598只进入复核，新买0手", "跌破0.598且军工板块转弱", 2, "高开低走", "偏弱", "11月13日跌1.80%，高点0.621后回落至0.600。", "高"],
  "161226": ["1.451 / 当日低点", "1.475 / 当日高点", `卖0手；同日溢价约${sameDatePremium.toFixed(2)}%，历史2手普通单被费用门拦截`, "可靠同日溢价≥8%且券商确认实际仍持有", 3, "溢价低于硬线", "高波动偏弱", `11月13日场内跌2.15%、净值跌3.42%，同日静态溢价约${sameDatePremium.toFixed(2)}%。`, "高"],
  "159608": ["0.810 / 当日低点", "0.842 / 当日高点", "持有、不补仓；跌破0.810只进入复核，新买0手", "跌破0.810且锂资源继续转弱", 2, "资源弱势", "偏弱", "11月13日跌2.87%并收于日低附近，锂资源观察样本同步走弱。", "高"],
  "159241": ["0.959 / 当日低点", "1.003 / 当日高点", "持有、不追；未收复1.003前新买0手", "跌破0.959且航天链转弱", 2, "冲高回落", "偏弱", "日内一度上冲1.003，随后收跌2.43%。", "高"],
  "562350": ["1.076 / 当日低点", "1.093 / 当日高点", "持有、不加仓；普通碎片单不下", "跌破1.076且电力板块转弱", 5, "逆势微涨", "震荡", "11月13日涨0.09%，但仍需确认能否站稳1.093。", "中"],
  "002090": ["8.47 / 股票观察", "8.77 / 股票观察", "仅观察，不新增股票买卖指令；用于判断电网设备风险", "跌破8.47", 6, "逆势走强", "震荡偏强", "11月13日涨1.06%，股票仅作基金环境参考。", "中高"]
};

for (const item of data.holdings) {
  const row = quoteBySymbol.get(item.symbol);
  const bar = row.bar;
  const quote = row.proxy.body.quote;
  const meta = holdingsMeta[item.code];
  Object.assign(item, {
    support: meta[0], resistance: meta[1], lastTradeDate: "2026-11-13",
    lastOpen: bar.open, lastClose: bar.close, lastHigh: bar.high, lastLow: bar.low,
    lastChangePercent: round(quote.changePercent, 2),
    lastSource: `11月13日真实收盘；自有代理${row.proxy.body.source}，${row.proxy.body.lastUpdated}，marketStatus=${row.proxy.body.marketStatus}；至少两家独立日K与Longbridge收盘报价一致`,
    action: meta[2], invalidCondition: meta[3], predictionScore: meta[4], predictionLabel: meta[5],
    expectedDirection: meta[6], reason: meta[7], riskLevel: meta[8]
  });
}

const watchMeta = {
  "601208": ["放量下挫，股票不买", "11月13日跌7.18%，收盘接近日低。", "股票不买；基金端需先站回35.05并通过费用门", "单日跌幅大且无基金端承接证据", "跌破31.70", "31.70", "35.05", 1, "放量下挫", "偏弱", "高"],
  "600050": ["通信逆势上涨，股票不买", "11月13日涨0.95%，但上方4.30尚未突破。", "股票不买；基金端需站稳4.30并通过费用门", "指数与科技板块弱，个股强度未扩散", "跌破4.20", "4.20", "4.30", 6, "逆势走强", "震荡偏强", "中高"],
  "002466": ["锂板块弱势，股票不买", "11月13日跌1.59%，收盘接近日低。", "股票不买；基金端需重新站稳36.16并通过费用门", "板块回落且无费用后收益证据", "跌破34.51", "34.51", "36.16", 3, "弱势下探", "偏弱", "高"],
  "688981": ["业绩改善但冲高回落，股票不买", "三季度收入31.90亿美元、毛利率29.9%；11月13日冲高116.28后收110.50。", "股票不买；基金端先看116.28能否有效突破", "业绩利好未形成当日价格趋势", "跌破108.70", "108.70", "116.28", 5, "业绩后冲高回落", "震荡", "高"],
  "161725": ["白酒逆势上涨，金额过门仍不买", "11月13日涨1.77%，18手金额过门但缺资金和收益证据。", "站稳0.578，且先有成交资金、预期毛收益≥2.89%和扣费后收益证据", "18手约1036.80元、往返最低费约10元；无资金来源和预期毛收益", "跌破0.559", "0.559", "0.578", 6, "逆势反弹", "震荡偏强", "中高"]
};

for (const item of data.watchlist.filter((row) => row.code !== "005827")) {
  const row = quoteBySymbol.get(item.symbol);
  const bar = row.bar;
  const quote = row.proxy.body.quote;
  const meta = watchMeta[item.code];
  Object.assign(item, {
    status: meta[0], reason: meta[1], buyTrigger: meta[2], avoidReason: meta[3], risk: meta[4],
    support: meta[5], resistance: meta[6], lastTradeDate: "2026-11-13",
    lastOpen: bar.open, lastClose: bar.close, lastHigh: bar.high, lastLow: bar.low,
    lastChangePercent: round(quote.changePercent, 2),
    lastSource: `11月13日真实收盘；自有代理${row.proxy.body.source}，${row.proxy.body.lastUpdated}；至少两家独立日K与Longbridge收盘报价一致`,
    invalidCondition: meta[4], predictionScore: meta[7], predictionLabel: meta[8], expectedDirection: meta[9], riskLevel: meta[10]
  });
}

const openFund = data.watchlist.find((row) => row.code === "005827");
Object.assign(openFund, {
  status: "11月13日净值已披露，运行时接口失败",
  reason: `11月13日净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；只作dated NAV。`,
  buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据",
  avoidReason: "运行时基金接口HTTP 501，不能伪装实时",
  lastTradeDate: "2026-11-13", lastOpen: null, lastClose: Number(openFundNav.DWJZ), lastHigh: null, lastLow: null,
  lastChangePercent: Number(openFundNav.JZZZL),
  lastSource: "东方财富基金11月13日公开净值；运行时基金接口HTTP 501，mode=failed",
  predictionScore: 3, predictionLabel: "净值回落、接口失败", expectedDirection: "震荡偏弱", riskLevel: "中高"
});

for (const item of data.quoteWatchlist) {
  const source = data.watchlist.find((row) => row.code === item.code);
  item.support = source.support;
  item.resistance = source.resistance;
}

data.newsItems = [
  { title: "A股高开低走，成长板块继续承压", source: "新华财经 / 自有代理 / 新浪 / 腾讯 / 东方财富", publishTime: "2026-11-13 16:00:00+08:00", summary: "已确认事实：上证-0.59%、深成指-2.05%、创业板-3.32%、科创50-2.30%，全市场逾4700只个股下跌。基于事实的判断：周一不接低开，先看基金能否收复周五高点。", relatedStocks: ["159740", "512710", "159241", "688981"], sector: "过去24小时 / 全市场 / A股收盘", relation: "market", url: "https://www.cnfin.com/yw-lb/detail/20261113/4495384_1.html" },
  { title: "美股周四小幅收低，周五盘中仍分化", source: "AP", publishTime: "2026-11-13", summary: "已确认事实：11月12日S&P 500、道指和纳指均跌0.4%；11月13日美股盘中标普约跌0.1%、纳指约跌0.4%，油价上涨。基于事实的判断：海外风险偏好未形成单边确认，不替代A股基金触发。", relatedStocks: ["159740", "512710", "688981"], sector: "过去24小时 / 全市场重大风险 / 海外", relation: "market", url: "https://apnews.com/article/stocks-markets-ai-us-oil-f8edd0eeb1494d4d2584715686c5e619" },
  { title: "证监会强调稳市场并支持主动ETF建仓", source: "中国证监会 / 新华社", publishTime: "2026-11-13 09:42:00+08:00", summary: "已确认事实：监管层提出完善稳市机制、拓宽中长期资金来源，并引导主动ETF加快投资建仓。基于事实的判断：属于中期政策支撑，不能抵消11月13日广度转弱，也不直接生成买单。", relatedStocks: ["512710", "562350", "159241"], sector: "过去24小时 / 全市场重大利好 / 政策", relation: "market", url: "https://www.beijing.gov.cn/ywdt/zybwdt/202611/t20261113_4944358.html" },
  { title: "中芯国际三季度收入与毛利率改善", source: "港交所 / 中芯国际", publishTime: "2026-11-12 17:40:00+08:00", summary: "已确认事实：三季度收入31.90亿美元、毛利9.532亿美元、毛利率29.9%，均高于二季度；11月13日A股冲高后收跌1.09%。基于事实的判断：基本面改善是中期利好，但短线价格未确认趋势。", relatedStocks: ["688981", "159740"], sector: "过去24小时 / 观察池 / 半导体业绩", relation: "watch", url: "https://www1.hkexnews.hk/listedco/listconews/sehk/2026/1112/2026111200682.pdf" },
  { title: "13个场内标的11月13日真实收盘全部对账", source: "自有代理 / 新浪 / 腾讯 / 东方财富 / Longbridge", publishTime: "2026-11-13 16:00:00+08:00", summary: "已确认事实：13/13均为11月13日非零OHLC，自有代理收盘数据与至少两家独立日K及Longbridge报价一致。基于事实的判断：周末与11月16日开盘前只显示最近真实收盘，不标成实时行情。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "过去24小时 / 数据校验 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226" },
  { title: `161226同日静态溢价约${sameDatePremium.toFixed(2)}%，低于硬风险线`, source: "东方财富基金 / 自有代理 / 国投瑞银基金", publishTime: "2026-11-13 16:00:00+08:00", summary: `已确认事实：11月13日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%；历史2手约290.80元，单边最低费约1.72%。基于事实的判断：不触发8%硬风险退出，普通碎片单继续暂停。`, relatedStocks: ["161226"], sector: "持仓 / 白银LOF / 费用复核", relation: "risk", url: "https://static.cninfo.com.cn/finalpage/2026-11-06/1225659583.PDF" },
  { title: "成长与资源基金多数续跌", source: "自有代理 / Longbridge", publishTime: "2026-11-13 16:00:00+08:00", summary: "已确认事实：159740跌2.69%、159608跌2.87%、159241跌2.43%、512710跌1.80%，东材科技跌7.18%。基于事实的判断：周一不做低开补仓，先看是否收复周五高点。", relatedStocks: ["159740", "159608", "159241", "512710", "601208"], sector: "持仓关联 / 成长与资源风险", relation: "risk", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ159740" },
  { title: "005827净值回落，运行时基金接口仍失败", source: "东方财富基金 / 自有代理", publishTime: "2026-11-13 22:00:00+08:00", summary: `已确认事实：11月13日净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。`, relatedStocks: ["005827"], sector: "过去24小时 / 持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" }
];

data.reasoning = [
  { title: "161226同日溢价回落", basis: `11月13日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%。`, inference: "低于8%硬风险线，历史2手又被普通费用门拦截。", conclusion: "卖0手，周一只复核。", invalidCondition: "可靠同日溢价重新达到8%且实际仍持有。" },
  { title: "A股广度与成长风格同步转弱", basis: "上证-0.59%、深证-2.05%、创业板-3.32%、科创50-2.30%，逾4700股下跌。", inference: "不是单一持仓噪声，周一需先确认承接。", conclusion: "不抄底，新增0手。", invalidCondition: "基金收复前高且费用、资金、收益证据齐备。" },
  { title: "普通碎片单仍不经济", basis: "161226历史2手、159740历史3手、164701历史2手均不足1000元且单边费用占比超0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "触价只复核。", invalidCondition: "出现明确硬风险。" },
  { title: "账户证据仍是执行前置条件", basis: "券商持仓、订单和成交接口再次返回OAuth授权范围不足。", inference: "无法确认历史份额是否仍在，也无法确认卖出资金。", conclusion: "买卖均为0手。", invalidCondition: "用户在券商端完成核对。" }
];

data.invalidConditions = [
  "最新券商持仓与历史计划不一致：历史手数示例立即失效，按真实可卖份额一次合并重算。",
  "161226同日溢价低于8%：不得使用硬风险退出例外；若未来重新达到8%，仍需实际持仓证据。",
  "161226/159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
  "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
  "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
];

data.cancelPlan = [
  "周末不下场内基金单；周一先查券商最新持仓与成交，不存在的历史份额不得生成订单。",
  "161226只用可靠同日IOPV/净值重算溢价；低于8%时不使用硬退出例外。",
  "开盘瞬时跳价不直接成交，先确认真实价格、时间戳和30分钟承接。",
  "卖出未真实成交前不写入买入资金；成交后也先留现金。",
  "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
];

data.learningFramework = [
  { title: "周末只用最近真实收盘", basis: "13个场内标的均为11月13日非零OHLC，多源一致。", inference: "11月14-15日无A股交易，11月16日开盘前也不存在当日盘中价格。", conclusion: "页面标明最近真实收盘。", invalidCondition: "11月16日09:30后取得通过校验的真实盘中报价。" },
  { title: "LOF溢价必须同日比较", basis: `11月13日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}。`, inference: "同日静态溢价约低于8%硬线。", conclusion: "不生成硬退出订单。", invalidCondition: "可靠同日溢价重新达到8%。" },
  { title: "费用门先于普通调仓", basis: "三笔历史碎片单参考额290.80元、141.00元、300.60元。", inference: "均未达到经济金额，最低佣金侵蚀过大。", conclusion: "普通调仓暂停。", invalidCondition: "明确硬风险出现。" },
  { title: "资金来源必须已成交", basis: "账户成交接口未授权，无法证明有卖出回款。", inference: "计划卖出不是资金。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" },
  { title: "业绩与价格反应分开验证", basis: "中芯国际毛利率改善，但股价和科创50均收跌。", inference: "好业绩是事实，短线趋势未确认。", conclusion: "股票只作板块温度计。", invalidCondition: "基金端趋势与费用后收益证据同时成立。" }
];

data.nextWatch = [
  "11月14-15日：周末不交易，只保留11月13日最近真实收盘与净值。",
  "11月16日09:20：核对券商真实持仓、可卖份额、当日订单和实际费率。",
  "09:25：确认自有代理marketStatus与时间戳；未开盘数据只显示11月13日收盘。",
  "09:30-10:00：观察159740的0.468、512710的0.598、159608的0.810、159241的0.959能否守住；跌破只复核。",
  "10:00：观察161226同日溢价是否重新达到8%；未达到或持仓未确认则卖0手。",
  "全天：运行时接口失败时只显示失败态，不绘制假线或假K线。"
];

data.sources = [
  { name: "本次运行：13个场内标的11月13日真实收盘", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226", note: "2026-11-13 16:00：13/13为非零11月13日收盘OHLC；自有代理与至少两家独立日K、Longbridge报价一致。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月13日单位净值${silverNav.DWJZ}、日跌${Math.abs(Number(silverNav.JZZZL)).toFixed(2)}%；相对同日场内收盘${silverClose.toFixed(3)}的静态溢价约${sameDatePremium.toFixed(2)}%。` },
  { name: "国投瑞银：161226溢价风险提示", url: "https://static.cninfo.com.cn/finalpage/2026-11-06/1225659583.PDF", note: "基金管理人提示二级市场价格溢价风险；本页仍要求同日数据和实际持仓双重确认。" },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月13日单位净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；仅作dated NAV。` },
  { name: "运行时基金接口HTTP 501失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。" },
  { name: "新华财经：11月13日A股收盘", url: "https://www.cnfin.com/yw-lb/detail/20261113/4495384_1.html", note: "上证-0.59%、深成指-2.05%、创业板-3.32%、科创50-2.30%；逾4700股下跌。" },
  { name: "AP：11月12日美股收盘与11月13日盘中", url: "https://apnews.com/article/stocks-markets-ai-us-oil-f8edd0eeb1494d4d2584715686c5e619", note: "11月12日三大指数均跌约0.4%；11月13日盘中市场仍分化、油价上涨。" },
  { name: "港交所：中芯国际三季度未经审计业绩", url: "https://www1.hkexnews.hk/listedco/listconews/sehk/2026/1112/2026111200682.pdf", note: "三季度收入31.90亿美元、毛利9.532亿美元、毛利率29.9%。" },
  { name: "证监会：稳市场与主动ETF支持", url: "https://www.beijing.gov.cn/ywdt/zybwdt/202611/t20261113_4944358.html", note: "监管层提出完善稳市机制、拓宽中长期资金来源，并引导主动ETF加快投资建仓。" }
];

fs.writeFileSync("report-data.js", `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  sameDatePremium: round(sameDatePremium, 2),
  quoteTieOut: snapshot.quotes.filter((row) => row.tieOut && row.proxy.matchesConsensus).length,
  indexRows: indexSnapshot.rows.length,
  fundDates: [silverNav.FSRQ, openFundNav.FSRQ]
}, null, 2));
