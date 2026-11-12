const fs = require("fs");
const vm = require("vm");

const snapshot = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261112.json", "utf8"));
const indexSnapshot = JSON.parse(fs.readFileSync("scripts/index-snapshot-20261112.json", "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("report-data.js", "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;

if (snapshot.quotes.length !== 13 || snapshot.quotes.some((row) => !row.tieOut || !row.proxy.valid || !row.proxy.matchesConsensus)) {
  throw new Error("November 12 quote tie-out is incomplete");
}

const quoteBySymbol = new Map(snapshot.quotes.map((row) => [row.symbol, row]));
const fundByCode = new Map(snapshot.funds.map((row) => [row.code, row]));
const latestFundRow = (code) => fundByCode.get(code)?.body?.Data?.LSJZList?.[0] || null;
const silverNav = latestFundRow("161226");
const openFundNav = latestFundRow("005827");
if (silverNav?.FSRQ !== "2026-11-11" || openFundNav?.FSRQ !== "2026-11-11") {
  throw new Error("Expected November 11 fund NAVs are unavailable");
}

const round = (value, digits = 2) => Number(Number(value).toFixed(digits));
const sameDatePremium = round((1.525 / Number(silverNav.DWJZ) - 1) * 100, 2);
const crossDatePremium = round((1.486 / Number(silverNav.DWJZ) - 1) * 100, 2);

data.date = "2026-11-13";
data.portfolioVersion = "portfolio-2026-11-13-premarket-fee-aware-v1";
data.time = "2026-11-12 16:00收盘核验：13个场内持仓/观察标的均为11月12日真实收盘，已与自有代理、至少两家独立日K源及Longbridge收盘报价核对；本报告供11月13日盘前执行。开放式基金运行时接口HTTP 501，保留明确失败态。";
data.lastUpdated = "2026-11-12 16:00 北京时间（场内标的最近真实数据日为11月12日；基金最近公开净值日为11月11日；开放式基金运行时接口HTTP 501）";
data.logicUpdatedAt = "2026-11-12收盘更新（券商持仓、订单与成交接口再次因OAuth授权范围不足而无法核验）";

data.transactionCostPolicy.candidateOrders = [
  { code: "161226", label: "历史2手溢价风险复核（持仓未授权）", side: "sell", lots: 2, referencePrice: 1.486, hardRiskExit: false },
  { code: "159740", label: "历史3手普通减仓复核", side: "sell", lots: 3, referencePrice: 0.483, hardRiskExit: false },
  { code: "164701", label: "历史2手普通减仓复核", side: "sell", lots: 2, referencePrice: 1.521, hardRiskExit: false },
  { code: "161725", label: "18手最低经济金额买入复核", side: "buy", lots: 18, referencePrice: 0.566, hardRiskExit: false }
];

data.oneLine = `结论：11月13日盘前买0手、卖0手。161226最新可比同日数据为11月11日收盘1.525、净值${silverNav.DWJZ}，溢价约${sameDatePremium.toFixed(2)}%；11月12日收盘1.486相对旧净值约${crossDatePremium.toFixed(2)}%仅作跨日复核，不能触发订单。三笔历史碎片单继续被费用闸门拦截，券商持仓接口未授权。仅供个人复盘参考。`;

data.tradeDecision = [
  {
    type: "第一屏结论",
    title: "盘前0买0卖，161226等同日净值",
    conclusion: `已确认事实：13个场内标的均为11月12日真实收盘；161226最新同日溢价为11月11日约${sameDatePremium.toFixed(2)}%，高于8%复核线，但11月12日净值尚未披露，且券商持仓接口缺少授权。`,
    action: "11月13日先在券商端核对实际可卖份额、订单和费率；没有11月12日同日净值/可靠估值与账户证据前，买0手、卖0手。",
    trigger: "只有实际仍持有161226且可靠同日数据确认溢价≥8%，才按全部实际剩余份额一次合并进入硬风险退出复核。",
    reason: "不把跨日价差、历史手数或计划卖出机械转成订单。仅供个人复盘参考。"
  },
  {
    type: "费用闸门",
    title: "三笔历史碎片卖单继续暂停",
    conclusion: "按11月12日真实收盘：161226历史2手约297.20元/单边费1.68%，159740历史3手约144.90元/3.45%，164701历史2手约304.20元/1.64%；均低于1000元且费用占比高于0.5%。",
    action: "普通波动只进入风险复核，不下碎片单、不拆单。",
    trigger: "基本面失效、流动性异常或经同日数据确认的LOF溢价失控，才允许越过最低经济金额。",
    reason: "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。"
  },
  {
    type: "A股收盘",
    title: "成长分化：科创50独强，主要指数回落",
    conclusion: "已确认事实：11月12日上证-0.67%、深成指-1.68%、创业板-2.44%，科创50+0.73%；持仓中港股科技、黄金、白银和稀有金属均收跌。",
    action: "11月13日不抄底；159740、164701、161226、159608先看能否收复11月12日高点，未收复时仅持有/复核。",
    trigger: "真实价格站稳前高、资金来源已成交、费用与收益门全部通过，才进入买入评估；当前仍为0手。",
    reason: "指数和行业分化明显，单日下跌不构成费用后收益证据。仅供个人复盘参考。"
  },
  {
    type: "海外市场",
    title: "美股科技反弹，但不抵消A股收盘转弱",
    conclusion: "已确认事实：11月11日S&P 500涨1.3%、纳指涨1.6%、道指涨0.5%；美债市场因假日休市，油价上涨、黄金回落。",
    action: "海外风险偏好只作背景，不追买科技基金；中芯国际盘后业绩与11月13日说明会只用于板块观察。",
    trigger: "A股基金自身价格与费用条件确认后再复核，不用海外指数替代本地触发。",
    reason: "隔夜反弹与A股当日结构不同步。仅供个人复盘参考。"
  },
  {
    type: "新买入",
    title: "金额过门，资金与收益证据仍缺",
    conclusion: "161725按18手约1018.80元，往返最低佣金约10元、费用占比约0.98%；预期毛收益至少需约2.94%才能覆盖往返费3倍。",
    action: "不买。没有已成交卖出资金，也没有可核验证据支持费用后收益空间。",
    trigger: "需同时有真实资金、预期毛收益≥2.94%、扣费后预期收益≥1%，且真实价格站稳0.570，再评估。",
    reason: "金额门通过不等于收益门和资金门通过。仅供个人复盘参考。"
  }
];

data.executionOrder = [
  "1. 11月13日09:20后先在券商端核对最新持仓、可卖份额、当日订单和实际费率；网页无法读取这些账户数据。",
  `2. 161226最新同日溢价为11月11日约${sameDatePremium.toFixed(2)}%；11月12日收盘相对旧净值约${crossDatePremium.toFixed(2)}%仅作跨日复核，盘前卖0手。`,
  "3. 若无法取得可靠同日IOPV/净值，161226继续卖0手；若同日溢价≥8%且实际仍持有，只按全部实际剩余份额一次合并复核。",
  "4. 159740历史3手、164701历史2手继续暂停，普通费用门不通过。",
  "5. 其余基金新增买入0手；任何卖出未真实成交前，不把计划卖出写成资金来源。",
  "6. 股票条目只作板块温度计，不生成股票订单。",
  "7. 运行时行情若失败、模式为failed或时间戳过期，只显示失败态，不按缓存价执行。"
];

data.tradePlan = [
  {
    title: "161226先等同日口径",
    basis: `11月11日场内收1.525、净值${silverNav.DWJZ}，同日溢价约${sameDatePremium.toFixed(2)}%；11月12日场内收1.486，但当日净值尚未披露。`,
    inference: "硬风险曾触线，但跨日价差不能证明11月12日仍触线。",
    conclusion: "盘前卖0手，开盘后只重算同日溢价。",
    invalidCondition: "可靠同日溢价≥8%且券商确认实际仍持有。"
  },
  {
    title: "资源与贵金属收低，不做低开补仓",
    basis: "159608跌2.45%、164701跌2.25%、161226跌2.56%，三者均接近日低收盘。",
    inference: "短线承接偏弱，尚无费用后反弹空间证据。",
    conclusion: "持有/复核，新买0手。",
    invalidCondition: "真实价格重新站稳11月12日高点且资金、费用、收益门全部通过。"
  },
  {
    title: "普通碎片单仍不经济",
    basis: "159740历史3手约144.90元，164701历史2手约304.20元。",
    inference: "最低佣金占比显著高于0.5%。",
    conclusion: "触价只复核，不机械卖。",
    invalidCondition: "出现明确硬风险。"
  },
  {
    title: "半导体强于大盘但有业绩事件",
    basis: "科创50涨0.73%、中芯国际涨2.20%，公司安排11月12日盘后披露三季度业绩并于11月13日举行说明会。",
    inference: "相对强势与事件波动并存，不外推为基金买点。",
    conclusion: "股票不买，只观察科技基金承接。",
    invalidCondition: "公司正式披露与价格表现改变板块判断。"
  }
];

data.noTradeList = [
  "不把11月12日收盘价写成11月13日实时价。",
  "不把11月12日161226收盘价与11月11日净值的跨日差额写成卖出触发。",
  "不在券商持仓接口未授权时机械卖历史手数。",
  "不执行159740历史3手、164701历史2手或161226历史2手的普通碎片卖单。",
  "不把计划卖出当作已到账资金；新增买入0手。",
  "不买股票观察池；股票只作基金板块温度计。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingsMeta = {
  "159740": ["0.483 / 当日低点", "0.492 / 当日高点", "持有、不追；历史3手约144.90元、单边费约3.45%，普通减仓暂停", "跌破0.483且港股科技同步转弱", 3, "弱势收低", "偏弱", "11月12日跌2.82%并收于日低，先看能否收复0.492。", "高"],
  "164701": ["1.520 / 当日低点", "1.546 / 当日高点", "持有、不追；历史2手约304.20元、单边费约1.64%，普通减仓暂停", "跌破1.520且贵金属继续转弱", 3, "贵金属回落", "偏弱", "11月12日跌2.25%并接近日低，隔夜黄金回落。", "高"],
  "512710": ["0.607 / 当日低点", "0.621 / 当日高点", "持有、不追；跌破0.607只进入复核，新买0手", "跌破0.607且军工板块转弱", 4, "冲高回平", "震荡", "日内冲高后收平，承接与持续性均需再确认。", "中高"],
  "161226": ["1.486 / 当日低点", "1.500 / 当日高点", "卖0手；先取得11月12日同日净值/可靠估值并核对实际份额", "可靠同日溢价≥8%且券商确认实际仍持有", 3, "溢价口径待补", "高波动偏弱", `11月11日同日溢价约${sameDatePremium.toFixed(2)}%，11月12日跌2.56%，但当日净值尚未披露。`, "高"],
  "159608": ["0.833 / 当日低点", "0.859 / 当日高点", "持有、不补仓；跌破0.833只进入复核，新买0手", "跌破0.833且锂资源继续转弱", 2, "资源弱势", "偏弱", "11月12日跌2.45%并接近日低，锂股观察样本同步走弱。", "高"],
  "159241": ["0.983 / 当日低点", "1.003 / 当日高点", "持有、不追；未站稳1.003前新买0手", "跌破0.983且航天链转弱", 4, "冲高回落", "震荡", "日内一度上冲1.003，收盘仍微跌0.10%。", "中"],
  "562350": ["1.076 / 当日低点", "1.085 / 当日高点", "持有、不加仓；普通碎片单不下", "跌破1.076且电力板块转弱", 4, "窄幅偏弱", "震荡偏弱", "11月12日跌0.18%，波动较小但收盘靠近低位。", "中"],
  "002090": ["8.36 / 股票观察", "8.58 / 股票观察", "仅观察，不新增股票买卖指令；用于判断电网设备风险", "跌破8.36", 6, "逆势走强", "震荡偏强", "11月12日涨1.19%并接近日高，股票仅作基金环境参考。", "中高"]
};

for (const item of data.holdings) {
  const row = quoteBySymbol.get(item.symbol);
  const bar = row.bar;
  const quote = row.proxy.body.quote;
  const meta = holdingsMeta[item.code];
  Object.assign(item, {
    support: meta[0], resistance: meta[1], lastTradeDate: "2026-11-12",
    lastOpen: bar.open, lastClose: bar.close, lastHigh: bar.high, lastLow: bar.low,
    lastChangePercent: round(quote.changePercent, 2),
    lastSource: `11月12日真实收盘；自有代理${row.proxy.body.source}，${row.proxy.body.lastUpdated}，marketStatus=${row.proxy.body.marketStatus}；至少两家独立日K与Longbridge收盘报价一致`,
    action: meta[2], invalidCondition: meta[3], predictionScore: meta[4], predictionLabel: meta[5],
    expectedDirection: meta[6], reason: meta[7], riskLevel: meta[8]
  });
}

const watchMeta = {
  "601208": ["高波动回落，股票不买", "11月12日跌2.33%，冲高36.70后收于34.39。", "股票不买；基金端需站稳36.70并通过费用门", "事件与振幅均高", "跌破34.31", "34.31", "36.70", 3, "冲高回落", "偏弱", "高"],
  "600050": ["通信回落，股票不买", "11月12日跌1.40%，收盘靠近日低。", "股票不买；基金端需站回4.30并通过费用门", "相对强度弱且无基金端资金证据", "跌破4.21", "4.21", "4.30", 3, "弱势收低", "偏弱", "中高"],
  "002466": ["锂板块弱势，股票不买", "11月12日跌2.12%，收盘接近日低。", "股票不买；基金端需重新站稳36.08并通过费用门", "板块回落且无费用后收益证据", "跌破34.95", "34.95", "36.08", 2, "弱势下探", "偏弱", "高"],
  "688981": ["半导体逆势上涨，股票不买", "11月12日涨2.20%，盘后业绩与次日说明会带来事件波动。", "股票不买；基金端先看114.90能否有效突破", "事件风险高且可执行建议限定基金", "跌破108.44", "108.44", "114.90", 6, "逆势强势", "震荡偏强", "高"],
  "161725": ["白酒小涨，金额过门仍不买", "11月12日涨0.35%，18手金额过门但缺资金和收益证据。", "站稳0.570，且先有成交资金、预期毛收益≥2.94%和扣费后收益证据", "18手约1018.80元、往返最低费约10元；无资金来源和预期毛收益", "跌破0.559", "0.559", "0.570", 5, "窄幅反弹", "震荡", "中"]
};

for (const item of data.watchlist.filter((row) => row.code !== "005827")) {
  const row = quoteBySymbol.get(item.symbol);
  const bar = row.bar;
  const quote = row.proxy.body.quote;
  const meta = watchMeta[item.code];
  Object.assign(item, {
    status: meta[0], reason: meta[1], buyTrigger: meta[2], avoidReason: meta[3], risk: meta[4],
    support: meta[5], resistance: meta[6], lastTradeDate: "2026-11-12",
    lastOpen: bar.open, lastClose: bar.close, lastHigh: bar.high, lastLow: bar.low,
    lastChangePercent: round(quote.changePercent, 2),
    lastSource: `11月12日真实收盘；自有代理${row.proxy.body.source}，${row.proxy.body.lastUpdated}；至少两家独立日K与Longbridge收盘报价一致`,
    invalidCondition: meta[4], predictionScore: meta[7], predictionLabel: meta[8], expectedDirection: meta[9], riskLevel: meta[10]
  });
}

const openFund = data.watchlist.find((row) => row.code === "005827");
Object.assign(openFund, {
  status: "11月11日净值已披露，运行时接口失败",
  reason: `11月11日净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；只作dated NAV。`,
  buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据",
  avoidReason: "运行时基金接口HTTP 501，不能伪装实时",
  lastTradeDate: "2026-11-11", lastOpen: null, lastClose: Number(openFundNav.DWJZ), lastHigh: null, lastLow: null,
  lastChangePercent: Number(openFundNav.JZZZL),
  lastSource: "东方财富基金11月11日公开净值；运行时基金接口HTTP 501，mode=failed",
  predictionScore: 4, predictionLabel: "净值小跌、接口失败", expectedDirection: "震荡", riskLevel: "中"
});

for (const item of data.quoteWatchlist) {
  const source = data.watchlist.find((row) => row.code === item.code);
  item.support = source.support;
  item.resistance = source.resistance;
}

data.newsItems = [
  {
    title: "A股尾盘转弱，科创50相对独强",
    source: "自有代理 / 新浪 / 腾讯 / 东方财富",
    publishTime: "2026-11-12 16:00:00+08:00",
    summary: "已确认事实：上证-0.67%、深成指-1.68%、创业板-2.44%，科创50+0.73%；四项指数均经至少两家行情源核对。基于事实的判断：科技内部有结构强度，但多数持仓基金不具备追涨条件。",
    relatedStocks: ["159740", "512710", "159241", "688981"],
    sector: "过去24小时 / 全市场 / A股收盘",
    relation: "market",
    url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710"
  },
  {
    title: "美股科技反弹，油价上涨、黄金回落",
    source: "AP",
    publishTime: "2026-11-12",
    summary: "已确认事实：11月11日S&P 500涨1.3%、纳指涨1.6%、道指涨0.5%；美债市场因假日休市，油价上涨。基于事实的判断：海外风险偏好改善，但不能覆盖A股当日回落与基金费用条件。",
    relatedStocks: ["159740", "512710", "688981"],
    sector: "过去24小时 / 全市场重大利好与风险 / 海外",
    relation: "market",
    url: "https://apnews.com/article/297d040c83844a9563327340b370c24e"
  },
  {
    title: "央行强调逆周期调节与资本市场工具",
    source: "上海证券报 / 证券时报（新浪财经汇编）",
    publishTime: "2026-11-12",
    summary: "已确认事实：央行三季度货币政策执行报告提出加大逆周期调节力度，并继续用好支持资本市场的两项货币政策工具。基于事实的判断：属于市场底部支撑背景，不直接生成买单。",
    relatedStocks: ["512710", "562350", "159241"],
    sector: "过去24小时 / 全市场重大利好 / 政策",
    relation: "market",
    url: "https://finance.sina.com.cn/stock/y/2026-11-12/doc-iniymmzp1906314.shtml"
  },
  {
    title: "中芯国际盘后披露三季业绩，次日召开说明会",
    source: "上海证券交易所 / 中芯国际",
    publishTime: "2026-11-12",
    summary: "已确认事实：公司公告安排11月12日交易时段后披露2026年第三季度业绩，并于11月13日08:30举行说明会。基于事实的判断：688981当日+2.20%后面临事件波动，股票不买，仅观察半导体基金情绪。",
    relatedStocks: ["688981", "159740"],
    sector: "过去24小时 / 观察池 / 半导体事件",
    relation: "watch",
    url: "https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688981"
  },
  {
    title: "13个场内标的11月12日真实收盘全部对账",
    source: "自有代理 / 新浪 / 腾讯 / 东方财富 / Longbridge",
    publishTime: "2026-11-12 16:00:00+08:00",
    summary: "已确认事实：13/13均为11月12日非零OHLC，自有代理收盘数据与至少两家独立日K及Longbridge报价一致。基于事实的判断：11月13日盘前只显示最近真实收盘，不标成当日实时行情。",
    relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"],
    sector: "过去24小时 / 数据校验 / 真实行情",
    relation: "holding",
    url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226"
  },
  {
    title: `161226最新同日溢价约${sameDatePremium.toFixed(2)}%，11月12日口径待补`,
    source: "东方财富基金 / 自有代理 / 国投瑞银基金",
    publishTime: "2026-11-12 16:00:00+08:00",
    summary: `已确认事实：11月11日场内收1.525、净值${silverNav.DWJZ}，同日溢价约${sameDatePremium.toFixed(2)}%；11月12日收1.486，但当日净值尚未披露。基于事实的判断：跨日比较只进复核，不触发订单。`,
    relatedStocks: ["161226"],
    sector: "持仓 / 白银LOF / 硬风险复核",
    relation: "risk",
    url: "https://static.cninfo.com.cn/finalpage/2026-11-06/1225659583.PDF"
  },
  {
    title: "贵金属与稀有金属持仓同步收低",
    source: "自有代理 / Longbridge",
    publishTime: "2026-11-12 16:00:00+08:00",
    summary: "已确认事实：164701跌2.25%、161226跌2.56%、159608跌2.45%，均接近日内低位。基于事实的判断：11月13日不做低开补仓，先看是否收复当日高点。",
    relatedStocks: ["164701", "161226", "159608", "002466"],
    sector: "持仓关联 / 资源与贵金属风险",
    relation: "risk",
    url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ159608"
  },
  {
    title: "005827净值小跌，运行时基金接口仍失败",
    source: "东方财富基金 / 自有代理",
    publishTime: "2026-11-12 16:00:00+08:00",
    summary: `已确认事实：11月11日净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。`,
    relatedStocks: ["005827"],
    sector: "持仓 / 开放式基金 / 接口失败",
    relation: "holding",
    url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10"
  }
];

data.reasoning = [
  { title: "161226先补同日净值", basis: `11月11日同日溢价约${sameDatePremium.toFixed(2)}%；11月12日收盘相对旧净值约${crossDatePremium.toFixed(2)}%只是跨日数。`, inference: "只有同日口径才能与8%硬风险线比较。", conclusion: "盘前卖0手，取得可靠同日数据后再复核。", invalidCondition: "可靠同日溢价≥8%且实际仍持有。" },
  { title: "A股回落且结构分化", basis: "上证-0.67%、深成指-1.68%、创业板-2.44%，科创50+0.73%。", inference: "半导体相对强不代表多数基金转强。", conclusion: "不追科技、不补资源，新增0手。", invalidCondition: "基金站稳前高且费用、资金、收益证据齐备。" },
  { title: "普通碎片单仍不经济", basis: "161226历史2手、159740历史3手、164701历史2手均不足1000元且单边费用占比超0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "触价只复核。", invalidCondition: "出现明确硬风险。" },
  { title: "账户证据仍是执行前置条件", basis: "券商持仓、订单和成交接口再次返回OAuth授权范围不足。", inference: "无法确认历史份额是否仍在，也无法确认卖出资金。", conclusion: "买卖均为0手。", invalidCondition: "用户在券商端完成核对。" }
];

data.invalidConditions = [
  "161226无法取得可靠同日IOPV/净值，或无法确认实际持仓：卖0手。",
  "最新券商持仓与历史计划不一致：历史手数示例立即失效，按真实可卖份额一次合并重算。",
  "161226/159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
  "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
  "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
];

data.cancelPlan = [
  "先查券商最新持仓与成交；不存在的历史份额不得生成订单。",
  "161226只用可靠同日IOPV/净值重算溢价；跨日价差不得触发卖出。",
  "开盘瞬时跳价不直接成交，先确认真实价格、时间戳和30分钟承接。",
  "卖出未真实成交前不写入买入资金；成交后也先留现金。",
  "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
];

data.learningFramework = [
  { title: "盘前只用最近真实收盘", basis: "13个场内标的均为11月12日非零OHLC，多源一致。", inference: "11月13日开盘前不存在当日盘中价格。", conclusion: "页面标明最近真实收盘。", invalidCondition: "09:30后取得通过校验的真实盘中报价。" },
  { title: "LOF溢价必须同日比较", basis: `11月11日场内收1.525、净值${silverNav.DWJZ}；11月12日净值待披露。`, inference: "同日溢价才能与8%硬线比较。", conclusion: "盘前不生成订单。", invalidCondition: "可靠同日溢价≥8%。" },
  { title: "费用门先于普通调仓", basis: "三笔历史碎片单参考额297.20元、144.90元、304.20元。", inference: "均未达到经济金额，最低佣金侵蚀过大。", conclusion: "普通调仓暂停。", invalidCondition: "明确硬风险出现。" },
  { title: "资金来源必须已成交", basis: "账户成交接口未授权，无法证明有卖出回款。", inference: "计划卖出不是资金。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" },
  { title: "股票只作板块温度计", basis: "中芯国际上涨，东材科技、中国联通、天齐锂业下跌。", inference: "个股信号用于验证基金方向，不生成股票订单。", conclusion: "观察池股票不买。", invalidCondition: "无。" }
];

data.nextWatch = [
  "11月13日08:30：关注中芯国际业绩说明会，只用于半导体板块温度判断。",
  "09:20：核对券商真实持仓、可卖份额、今日订单和实际费率。",
  "09:25：确认自有代理marketStatus与时间戳；未开盘数据只显示11月12日收盘。",
  "09:30-10:00：若能取得可靠同日IOPV/净值，再重算161226溢价；否则卖0手。",
  "10:00：观察159740的0.483、164701的1.520、159608的0.833能否守住；跌破只复核。",
  "全天：运行时接口失败时只显示失败态，不绘制假线或假K线。"
];

data.sources = [
  { name: "本次运行：13个场内标的11月12日真实收盘", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710", note: "2026-11-12 16:00：13/13为非零11月12日收盘OHLC；自有代理与至少两家独立日K、Longbridge报价一致。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月11日单位净值${silverNav.DWJZ}、日跌${Math.abs(Number(silverNav.JZZZL)).toFixed(2)}%；相对同日场内收盘1.525的静态溢价约${sameDatePremium.toFixed(2)}%。` },
  { name: "国投瑞银：161226溢价风险提示", url: "https://static.cninfo.com.cn/finalpage/2026-11-06/1225659583.PDF", note: "基金管理人提示二级市场价格溢价风险；本页仍要求同日数据和实际持仓双重确认。" },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月11日单位净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；仅作dated NAV。` },
  { name: "运行时基金接口HTTP 501失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。" },
  { name: "三家行情源：11月12日主要指数收盘", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710", note: "上证-0.67%、深成指-1.68%、创业板-2.44%、科创50+0.73%；均为11月12日收盘。" },
  { name: "AP：11月11日美股反弹", url: "https://apnews.com/article/297d040c83844a9563327340b370c24e", note: "S&P 500+1.3%、纳指+1.6%、道指+0.5%；美债市场因假日休市，油价上涨。" },
  { name: "证券时报：央行三季度货币政策执行报告", url: "https://finance.sina.com.cn/stock/y/2026-11-12/doc-iniymmzp1906314.shtml", note: "报告提出加大逆周期调节力度，并用好支持资本市场的两项货币政策工具。" },
  { name: "上交所：中芯国际三季度业绩说明会预告", url: "https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=688981", note: "公司安排11月12日盘后披露业绩，11月13日08:30举行说明会；仅作观察池事件。" }
];

const output = `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`;
fs.writeFileSync("report-data.js", output, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  sameDatePremium,
  crossDatePremium,
  quoteTieOut: snapshot.quotes.filter((row) => row.tieOut && row.proxy.matchesConsensus).length,
  indexRows: indexSnapshot.rows.length,
  fundDates: [silverNav.FSRQ, openFundNav.FSRQ]
}, null, 2));
