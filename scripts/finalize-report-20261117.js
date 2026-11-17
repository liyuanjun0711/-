const fs = require("fs");
const vm = require("vm");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("report-data.js", "utf8"), context);

const data = context.window.MARKET_BRIEFING_DATA;
const snapshot = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261117.json", "utf8"));
const indexSnapshot = JSON.parse(fs.readFileSync("scripts/index-snapshot-20261117.json", "utf8"));
const quoteBySymbol = new Map(snapshot.quotes.map((row) => [row.symbol, row]));
const round = (value, digits = 2) => Number(Number(value).toFixed(digits));
const money = (price, lots) => round(price * 100 * lots, 2);
const oneWayFeeRate = (price, lots) => round(5 / money(price, lots) * 100, 2);

if (snapshot.expectedDate !== "2026-11-17") throw new Error("market snapshot date mismatch");
if (snapshot.quotes.length !== 13) throw new Error("expected 13 exchange-traded quotes");
if (!snapshot.quotes.every((row) => row.tieOut && row.proxy.matchesConsensus && row.bar.time === "2026-11-17")) {
  throw new Error("quote/date/OHLC tie-out failed");
}
if (indexSnapshot.rows.length !== 4) throw new Error("index snapshot incomplete");
for (const row of indexSnapshot.rows) {
  const valid = row.providers.filter((provider) => provider.ok && provider.lastBar?.time === "2026-11-17");
  if (valid.length < 2) throw new Error(`index tie-out failed: ${row.symbol}`);
}

const latestFund = (code) => snapshot.funds.find((row) => row.code === code)?.body?.Data?.LSJZList?.[0];
const silverNav = latestFund("161226");
const openFundNav = latestFund("005827");
if (silverNav?.FSRQ !== "2026-11-17" || openFundNav?.FSRQ !== "2026-11-17") {
  throw new Error("fund NAV dates are not November 17");
}

const q = (symbol) => quoteBySymbol.get(symbol).proxy.body.quote;
const silverClose = quoteBySymbol.get("SZ161226").bar.close;
const silverNavValue = Number(silverNav.DWJZ);
const sameDatePremium = (silverClose / silverNavValue - 1) * 100;
const silverExampleLots = 2;
const silverExampleAmount = money(silverClose, silverExampleLots);
const silverNetProceeds = silverExampleAmount - 5;
const silverNavEquivalent = silverNavValue * 100 * silverExampleLots;
const silverNetPremium = (silverNetProceeds / silverNavEquivalent - 1) * 100;
const minBuyLots = Math.ceil(1000 / (q("SZ161725").close * 100));
const minBuyAmount = money(q("SZ161725").close, minBuyLots);
const minBuyRoundTripRate = round(10 / minBuyAmount * 100, 2);
const minBuyGrossEdge = round(Math.max(minBuyRoundTripRate * 3, minBuyRoundTripRate + 1), 2);

data.date = "2026-11-18";
data.portfolioVersion = "portfolio-2026-11-18-premarket-fee-aware-v1";
data.time = "2026-11-17 20:42收盘核验：13个场内持仓/观察标的均为11月17日真实收盘，已与自有代理、至少两家独立日K源及Longbridge收盘报价核对；本报告供11月18日盘前执行。开放式基金运行时接口HTTP 501，保留明确失败态。";
data.lastUpdated = "2026-11-17 20:42 北京时间（场内标的和两只基金最近真实数据日均为11月17日；开放式基金运行时接口HTTP 501）";
data.logicUpdatedAt = "2026-11-17收盘更新（券商持仓与当日订单接口再次因OAuth授权范围不足而无法核验）";
data.oneLine = `11月18日盘前不买。161226在11月17日收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%，重新超过8%硬风险线：只有券商确认仍持有且开盘后可靠同日溢价仍≥8%，才一次卖出全部实际可卖份额；否则卖0手。仅供个人复盘参考。`;

data.transactionCostPolicy.candidateOrders = [
  { code: "161226", label: "历史2手硬风险退出示例（持仓未授权）", side: "sell", lots: silverExampleLots, referencePrice: silverClose, hardRiskExit: true },
  { code: "159740", label: "历史3手普通减仓复核", side: "sell", lots: 3, referencePrice: q("SZ159740").close, hardRiskExit: false },
  { code: "164701", label: "历史2手普通减仓复核", side: "sell", lots: 2, referencePrice: q("SZ164701").close, hardRiskExit: false },
  { code: "161725", label: `${minBuyLots}手最低经济金额买入复核`, side: "buy", lots: minBuyLots, referencePrice: q("SZ161725").close, hardRiskExit: false }
];

data.tradeDecision = [
  {
    type: "第一屏结论",
    title: "不买；161226只做条件化硬退出",
    conclusion: `已确认事实：161226在11月17日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%，重新超过8%硬风险线；但券商持仓接口仍未授权。`,
    action: "11月18日09:20先核对券商实际持仓与可卖份额；若仍持有，且09:30后可靠同日IOPV/净值显示溢价仍≥8%，一次卖出全部实际可卖份额，不拆单。否则卖0手；其余基金买卖均为0手。",
    trigger: "必须同时满足：实际持仓存在、同日溢价≥8%、真实价格与时间戳有效；任一不满足就不下单。",
    reason: `历史2手仅作费用示例：成交额约${silverExampleAmount.toFixed(2)}元、单边最低费约5元/占比${oneWayFeeRate(silverClose, silverExampleLots).toFixed(2)}%；按净值等值测算扣费后仍约有${silverNetPremium.toFixed(2)}%净溢价空间，属于硬风险例外。仅供个人复盘参考。`
  },
  {
    type: "费用闸门",
    title: "普通碎片卖单继续暂停",
    conclusion: `按11月17日真实收盘：159740历史3手约${money(q("SZ159740").close, 3).toFixed(2)}元/单边费${oneWayFeeRate(q("SZ159740").close, 3).toFixed(2)}%，164701历史2手约${money(q("SZ164701").close, 2).toFixed(2)}元/${oneWayFeeRate(q("SZ164701").close, 2).toFixed(2)}%；均低于1000元且费用占比高于0.5%。`,
    action: "普通波动只进入风险复核，不下碎片单、不拆单。",
    trigger: "只有基本面失效、流动性异常或可靠同日数据确认的LOF溢价失控，才越过最低经济金额。",
    reason: "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认；普通卖出没有可接受的费用后空间。仅供个人复盘参考。"
  },
  {
    type: "市场风险",
    title: "指数仍弱，科创反弹未扩散",
    conclusion: "已确认事实：上证-0.50%、深成指-0.49%、创业板-1.20%，科创50+0.62%；全市场约1326股上涨、4119股下跌。688981涨6.59%，但多数持仓并未同步走强。",
    action: "不追半导体反弹、不做低位摊薄；股票仍只作基金板块温度计。",
    trigger: "基金需收复11月17日高点，并同时通过资金、费用与可核验收益门，才进入买入评估；当前新增0手。",
    reason: "科创强度集中而市场广度偏弱，单一股票反弹不能替代基金端趋势和费用后收益证据。仅供个人复盘参考。"
  },
  {
    type: "持仓分化",
    title: "贵金属小幅修复，锂与航天继续弱",
    conclusion: `已确认事实：164701涨${q("SZ164701").changePercent.toFixed(2)}%、512710涨${q("SH512710").changePercent.toFixed(2)}%、562350涨${q("SH562350").changePercent.toFixed(2)}%；159608跌${Math.abs(q("SZ159608").changePercent).toFixed(2)}%、159241跌${Math.abs(q("SZ159241").changePercent).toFixed(2)}%。`,
    action: "除161226硬风险复核外，其余持有/观察，不因单日修复追买，也不下普通碎片卖单。",
    trigger: "跌破11月17日低点只触发风险复核；普通卖单仍需金额与费率双门通过。",
    reason: "同一组合内强弱分化明显，优先处理可量化的LOF溢价风险。仅供个人复盘参考。"
  },
  {
    type: "新买入",
    title: "金额过门，资金与收益证据仍缺",
    conclusion: `161725按${minBuyLots}手约${minBuyAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${minBuyRoundTripRate.toFixed(2)}%；预期毛收益至少需约${minBuyGrossEdge.toFixed(2)}%才能覆盖往返费3倍。`,
    action: "不买。没有已成交卖出资金，也没有可核验证据支持费用后收益空间。",
    trigger: `需同时有真实资金、预期毛收益≥${minBuyGrossEdge.toFixed(2)}%、扣费后预期收益≥1%，且真实价格站稳0.583，再评估。`,
    reason: "金额门通过不等于资金门和收益门通过；计划卖出不能作为资金来源。仅供个人复盘参考。"
  }
];

data.executionOrder = [
  "1. 11月18日09:20在券商端核对161226是否仍持有、实际可卖份额、挂单与实际费率。",
  "2. 09:30后只用真实时间戳和可靠同日IOPV/净值重算161226溢价；跨日净值不触发。",
  "3. 若实际持仓存在且同日溢价仍≥8%，按硬风险例外一次卖出全部实际可卖份额；不拆单。",
  "4. 若无持仓、溢价<8%、数据失败或报价过期，161226卖0手。",
  "5. 159740历史3手、164701历史2手继续暂停，普通费用门不通过。",
  "6. 其余基金新增买入0手；任何卖出未真实成交前，不把计划卖出写成资金来源。",
  "7. 股票条目只作板块温度计，不生成股票订单；所有建议仅供个人复盘参考。"
];

data.tradePlan = [
  { title: "161226重回硬风险复核", basis: `11月17日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%。`, inference: `历史2手成交额约${silverExampleAmount.toFixed(2)}元，单边费约${oneWayFeeRate(silverClose, 2).toFixed(2)}%；硬风险退出可越过金额门，扣费后净溢价示例约${silverNetPremium.toFixed(2)}%。`, conclusion: "仅在实际持仓和开盘后同日溢价双确认时，一次卖出全部实际可卖份额；否则0手。", invalidCondition: "无实际持仓、同日溢价<8%或真实数据失败。" },
  { title: "半导体反弹不等于基金买点", basis: "688981涨6.59%、科创50涨0.62%，但创业板跌1.20%且4119股下跌。", inference: "强度集中、广度偏弱，缺少基金端趋势扩散。", conclusion: "股票不买，相关基金不追。", invalidCondition: "基金收复11月17日高点且费用、资金、收益证据齐备。" },
  { title: "普通碎片单仍不经济", basis: `159740历史3手约${money(q("SZ159740").close, 3).toFixed(2)}元，164701历史2手约${money(q("SZ164701").close, 2).toFixed(2)}元。`, inference: "最低佣金占比显著高于0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现明确硬风险。" },
  { title: "资金来源必须已成交", basis: "券商持仓与订单接口均返回OAuth 403308。", inference: "无法证明历史份额存在，也无法证明有卖出回款。", conclusion: "除条件化风险退出外，其余买卖0手。", invalidCondition: "券商端完成实际持仓、订单、成交和可用资金核对。" }
];

data.noTradeList = [
  "不把11月17日收盘价写成11月18日实时价。",
  "不在券商未确认持仓时机械卖历史2手；历史手数仅作费用示例。",
  "不执行159740历史3手或164701历史2手普通碎片卖单。",
  "不因688981和科创50反弹追买股票或科技基金。",
  "不把计划卖出当作已到账资金；新增买入0手。",
  "不买股票观察池；股票只作基金板块温度计。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingsMeta = {
  "159740": ["0.456 / 当日低点", "0.467 / 当日高点", `持有、不补；历史3手约${money(q("SZ159740").close, 3).toFixed(2)}元、单边费约${oneWayFeeRate(q("SZ159740").close, 3).toFixed(2)}%，普通减仓暂停`, "跌破0.456且港股科技继续转弱", 3, "弱势震荡", "偏弱", "11月17日跌0.86%，收盘仍低于当日高点。", "高"],
  "164701": ["1.469 / 当日低点", "1.492 / 当日高点", `持有、不追；历史2手约${money(q("SZ164701").close, 2).toFixed(2)}元、单边费约${oneWayFeeRate(q("SZ164701").close, 2).toFixed(2)}%，普通减仓暂停`, "跌破1.469且贵金属转弱", 5, "小幅修复", "震荡", "11月17日涨0.47%，但未形成足以覆盖费用的新趋势。", "中高"],
  "512710": ["0.572 / 当日低点", "0.584 / 当日高点", "持有、不补；跌破0.572只进入复核，新买0手", "跌破0.572且军工板块继续转弱", 4, "低位震荡", "震荡", "11月17日涨0.17%，仍未收复0.584。", "中高"],
  "161226": ["1.368 / 当日低点", "1.410 / 当日高点", `仅作条件化硬退出；历史2手约${silverExampleAmount.toFixed(2)}元、单边费约${oneWayFeeRate(silverClose, 2).toFixed(2)}%、扣费后净溢价示例约${silverNetPremium.toFixed(2)}%`, "实际仍持有且可靠同日溢价≥8%", 3, "溢价重新失控", "高风险", `场内涨${q("SZ161226").changePercent.toFixed(2)}%，净值跌${Math.abs(Number(silverNav.JZZZL)).toFixed(2)}%，同日静态溢价约${sameDatePremium.toFixed(2)}%。`, "高"],
  "159608": ["0.753 / 当日低点", "0.785 / 当日高点", "持有、不补仓；跌破0.753只进入复核，新买0手", "跌破0.753且锂资源继续转弱", 3, "资源仍弱", "偏弱", "11月17日跌1.03%，盘中低见0.753。", "高"],
  "159241": ["0.902 / 当日低点", "0.927 / 当日高点", "持有、不追；未收复0.927前新买0手", "跌破0.902且航天链继续转弱", 3, "冲高回落", "偏弱", "11月17日跌1.20%，收盘靠近当日低位。", "高"],
  "562350": ["1.085 / 当日低点", "1.094 / 当日高点", "持有、不加仓；普通碎片单不下", "跌破1.085且电力板块转弱", 6, "相对抗跌", "震荡偏强", "11月17日涨0.18%，收盘接近日高。", "中高"],
  "002090": ["8.30 / 股票观察", "8.54 / 股票观察", "仅观察，不新增股票买卖指令；用于判断电网设备风险", "跌破8.30", 3, "震荡偏弱", "偏弱", "11月17日跌0.95%，股票仅作基金环境参考。", "高"]
};

for (const item of data.holdings) {
  const row = quoteBySymbol.get(item.symbol);
  const meta = holdingsMeta[item.code];
  Object.assign(item, {
    support: meta[0], resistance: meta[1], lastTradeDate: "2026-11-17",
    lastOpen: row.bar.open, lastClose: row.bar.close, lastHigh: row.bar.high, lastLow: row.bar.low,
    lastChangePercent: round(row.proxy.body.quote.changePercent, 2),
    lastSource: `11月17日真实收盘；自有代理${row.proxy.body.source}，${row.proxy.body.lastUpdated}，marketStatus=${row.proxy.body.marketStatus}；至少两家独立日K与Longbridge收盘报价一致`,
    action: meta[2], invalidCondition: meta[3], predictionScore: meta[4], predictionLabel: meta[5],
    expectedDirection: meta[6], reason: meta[7], riskLevel: meta[8]
  });
}

const watchMeta = {
  "601208": ["急跌后宽幅震荡，股票不买", "11月17日跌1.04%，日内振幅较大。", "股票不买；基金端需站稳29.79并通过费用门", "连续下跌后波动仍高，缺少基金端承接证据", "跌破27.76", "27.76", "29.79", 3, "高波动", "偏弱", "高"],
  "600050": ["通信小幅走强，股票不买", "11月17日涨0.68%，收盘接近日高。", "股票不买；基金端需确认4.43上方承接并通过费用门", "市场广度弱，个股强度尚未扩散", "跌破4.37", "4.37", "4.43", 6, "相对强势", "震荡偏强", "中高"],
  "002466": ["锂股修复，股票不买", "11月17日涨0.92%，但159608仍跌1.03%。", "股票不买；基金端需站稳34.05并通过费用门", "个股与基金分化，缺少费用后收益证据", "跌破32.96", "32.96", "34.05", 5, "个股修复", "震荡", "中高"],
  "688981": ["半导体强反弹，股票不买", "11月17日涨6.59%，高见115.94；科创50涨0.62%。", "股票不买；基金端先看相关ETF能否收复自身高点", "4119股下跌，强度尚未广泛扩散", "跌破107.66", "107.66", "115.94", 7, "强反弹", "偏强", "高"],
  "161725": ["白酒横盘，金额过门仍不买", `11月17日收平；${minBuyLots}手金额过门但缺资金和收益证据。`, `站稳0.583，且先有成交资金、预期毛收益≥${minBuyGrossEdge.toFixed(2)}%和扣费后收益证据`, `${minBuyLots}手约${minBuyAmount.toFixed(2)}元、往返最低费约10元；无资金来源和预期毛收益`, "跌破0.573", "0.573", "0.583", 4, "窄幅震荡", "震荡", "中高"]
};

for (const item of data.watchlist.filter((row) => row.code !== "005827")) {
  const row = quoteBySymbol.get(item.symbol);
  const meta = watchMeta[item.code];
  Object.assign(item, {
    status: meta[0], reason: meta[1], buyTrigger: meta[2], avoidReason: meta[3], risk: meta[4],
    support: meta[5], resistance: meta[6], lastTradeDate: "2026-11-17",
    lastOpen: row.bar.open, lastClose: row.bar.close, lastHigh: row.bar.high, lastLow: row.bar.low,
    lastChangePercent: round(row.proxy.body.quote.changePercent, 2),
    lastSource: `11月17日真实收盘；自有代理${row.proxy.body.source}，${row.proxy.body.lastUpdated}；至少两家独立日K与Longbridge收盘报价一致`,
    invalidCondition: meta[4], predictionScore: meta[7], predictionLabel: meta[8], expectedDirection: meta[9], riskLevel: meta[10]
  });
}

const openFund = data.watchlist.find((row) => row.code === "005827");
Object.assign(openFund, {
  status: "11月17日净值已披露，运行时接口失败",
  reason: `11月17日净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；只作dated NAV。`,
  buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据",
  avoidReason: "运行时基金接口HTTP 501，不能伪装实时",
  lastTradeDate: "2026-11-17", lastOpen: null, lastClose: Number(openFundNav.DWJZ), lastHigh: null, lastLow: null,
  lastChangePercent: Number(openFundNav.JZZZL),
  lastSource: "东方财富基金11月17日公开净值；运行时基金接口HTTP 501，mode=failed",
  predictionScore: 3, predictionLabel: "净值续跌、接口失败", expectedDirection: "震荡偏弱", riskLevel: "中高"
});

for (const item of data.quoteWatchlist) {
  const source = data.watchlist.find((row) => row.code === item.code);
  item.support = source.support;
  item.resistance = source.resistance;
}

data.newsItems = [
  { title: "A股冲高回落，超4100股下跌", source: "每日经济新闻 / 多源行情核验", publishTime: "2026-11-17 15:07:00+08:00", summary: "已确认事实：上证-0.50%、深成指-0.49%、创业板-1.20%、科创50+0.62%；1326股上涨、4119股下跌。基于事实的判断：广度仍弱，11月18日不做低位摊薄。", relatedStocks: ["159740", "512710", "159608", "159241", "688981"], sector: "过去24小时 / 全市场重大风险 / A股收盘", relation: "market", url: "https://finance.sina.com.cn/jjxw/2026-11-17/doc-iniyznqc1810161.shtml" },
  { title: "半导体逆势反弹，中芯国际涨6.59%", source: "自有代理 / Longbridge / 新华财经", publishTime: "2026-11-17 16:15:00+08:00", summary: "已确认事实：688981收113.45元、涨6.59%，科创50涨0.62%；半导体、光刻机早盘活跃。基于事实的判断：强度集中但没有扩散到多数基金持仓，股票不买、科技基金不追。", relatedStocks: ["688981", "159740", "512710"], sector: "过去24小时 / 半导体机会与风险", relation: "market", url: "https://www.cnfin.com/yw-lb/detail/20261117/4496546_1.html" },
  { title: `161226同日静态溢价约${sameDatePremium.toFixed(2)}%，重回硬风险线`, source: "东方财富基金 / 自有代理 / 国投瑞银基金", publishTime: "2026-11-17 20:42:00+08:00", summary: `已确认事实：11月17日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%；历史2手成交额约${silverExampleAmount.toFixed(2)}元、单边最低费约5元。基于事实的判断：若实际仍持有且开盘后同日溢价仍≥8%，按硬风险例外一次退出；否则0手。`, relatedStocks: ["161226"], sector: "过去24小时 / 持仓重大风险 / 白银LOF", relation: "risk", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10" },
  { title: "美股科技继续下挫，纳指跌2.5%", source: "AP", publishTime: "2026-11-16 16:17:00-05:00", summary: "已确认事实：11月16日S&P 500跌1.9%、纳指跌2.5%、道指跌1.4%；科技股继续承压。基于事实的判断：海外科技风险仍高，A股半导体单日反弹不宜追价。", relatedStocks: ["159740", "512710", "688981"], sector: "过去24小时 / 全市场重大风险 / 海外收盘", relation: "market", url: "https://apnews.com/article/wall-street-stocks-dow-nasdaq-2e6a9c41b6336e9240c1b01585d20cd4" },
  { title: "10月生产偏强，内需与投资仍有压力", source: "国家统计局 / 中国政府网", publishTime: "2026-11-17 08:22:00+08:00", summary: "已确认事实：10月规上工业增加值同比增长4.8%，1—10月社零增长1.0%、固定资产投资下降8.1%；官方同时提示供强需弱仍较突出。基于事实的判断：宏观结构分化，不能直接替代基金买入触发。", relatedStocks: ["562350", "512710", "159241"], sector: "过去24小时 / 官方宏观 / 全市场", relation: "market", url: "https://www.ln.gov.cn/web/ywdt/rdgz/2026111708223233808/index.shtml" },
  { title: "13个场内标的11月17日真实收盘全部对账", source: "自有代理 / 新浪 / 腾讯 / 东方财富 / Longbridge", publishTime: "2026-11-17 20:42:00+08:00", summary: "已确认事实：13/13均为11月17日非零OHLC，自有代理收盘数据与至少两家独立日K及Longbridge报价一致。基于事实的判断：11月18日开盘前只显示最近真实收盘，不标成实时行情。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "过去24小时 / 数据校验 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226" },
  { title: "005827净值续跌，运行时基金接口仍失败", source: "东方财富基金 / 自有代理", publishTime: "2026-11-17 20:42:00+08:00", summary: `已确认事实：11月17日净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。`, relatedStocks: ["005827"], sector: "过去24小时 / 持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" },
  { title: "APEC深圳会议进入关键日程", source: "新华社 / 中央网信办", publishTime: "2026-11-17 14:16:00+08:00", summary: "已确认事实：APEC工商领导人峰会于11月17—18日举行，领导人非正式会议将于11月18—19日举行。基于事实的判断：开放、数字经济与绿色合作是事件观察线，不直接生成基金买单。", relatedStocks: ["600050", "562350", "159241"], sector: "过去24小时 / 政策日程 / 观察池", relation: "market", url: "https://www.cac.gov.cn/2026-11/13/c_1796325469766056.htm" }
];

data.reasoning = [
  { title: "161226溢价是唯一可量化硬风险", basis: `11月17日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%。`, inference: `超过8%硬风险线；历史2手单边费约${oneWayFeeRate(silverClose, 2).toFixed(2)}%，但扣费后净溢价示例仍约${silverNetPremium.toFixed(2)}%。`, conclusion: "实际持仓和开盘后同日溢价双确认时，一次退出全部实际可卖份额。", invalidCondition: "无持仓、同日溢价<8%或真实数据失败。" },
  { title: "科创反弹与市场广度分离", basis: "科创50涨0.62%、688981涨6.59%，但创业板跌1.20%、4119股下跌。", inference: "半导体强度集中，未形成全市场修复。", conclusion: "股票不买，科技基金不追。", invalidCondition: "基金自身收复高点且费用、资金、收益证据齐备。" },
  { title: "普通碎片单仍不经济", basis: `159740历史3手约${money(q("SZ159740").close, 3).toFixed(2)}元，164701历史2手约${money(q("SZ164701").close, 2).toFixed(2)}元。`, inference: "最低佣金侵蚀显著高于普通费用门。", conclusion: "触价只复核。", invalidCondition: "出现明确硬风险。" },
  { title: "账户证据仍是执行前置条件", basis: "券商持仓与当日订单接口再次返回OAuth 403308。", inference: "无法确认历史份额，也无法确认卖出回款。", conclusion: "除条件化161226风险退出外，其余买卖0手。", invalidCondition: "用户在券商端完成核对。" }
];

data.invalidConditions = [
  "券商确认161226无实际持仓：历史2手示例立即失效，卖0手。",
  "161226开盘后可靠同日溢价低于8%：不得使用硬风险退出例外。",
  "159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
  "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
  "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
];

data.cancelPlan = [
  "周三先查券商最新持仓与挂单；不存在的历史份额不得生成订单。",
  "161226只用可靠同日IOPV/净值重算溢价；低于8%时不使用硬退出例外。",
  "开盘瞬时跳价不直接成交，先确认真实价格、时间戳与流动性。",
  "卖出未真实成交前不写入买入资金；成交后也先留现金。",
  "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
];

data.learningFramework = [
  { title: "盘前只用最近真实收盘", basis: "13个场内标的均为11月17日非零OHLC，多源一致。", inference: "11月18日开盘前不存在当日盘中价格。", conclusion: "页面标明11月17日真实收盘。", invalidCondition: "11月18日09:30后取得通过校验的真实盘中报价。" },
  { title: "LOF溢价必须同日比较", basis: `11月17日场内收${silverClose.toFixed(3)}、净值${silverNav.DWJZ}。`, inference: `同日静态溢价约${sameDatePremium.toFixed(2)}%，超过8%硬线。`, conclusion: "只在实际持仓存在且开盘后同日溢价仍达线时执行。", invalidCondition: "无持仓、同日溢价回落或数据失败。" },
  { title: "硬退出与普通费用门分开", basis: `历史2手成交额约${silverExampleAmount.toFixed(2)}元、单边费率约${oneWayFeeRate(silverClose, 2).toFixed(2)}%。`, inference: "普通调仓不经济，但溢价失控属于费用不阻止的硬风险。", conclusion: "满足条件时一次合并退出，不拆单。", invalidCondition: "溢价低于8%。" },
  { title: "资金来源必须已成交", basis: "账户订单接口未授权，无法证明有卖出回款。", inference: "计划卖出不是资金。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" },
  { title: "宏观与价格信号分开", basis: "10月工业增长4.8%，但1—10月社零增长1.0%、固定投资下降8.1%。", inference: "供给偏强、需求与投资偏弱的结构分化不等于具体基金买点。", conclusion: "等待价格与费用后收益证据。", invalidCondition: "持仓板块趋势和执行条件同步改善。" }
];

data.nextWatch = [
  "11月18日09:20：核对161226实际持仓、可卖份额、挂单和券商实际费率。",
  "09:25：确认自有代理marketStatus与时间戳；未开盘数据只显示11月17日收盘。",
  "09:30后：只用可靠同日IOPV/净值重算161226溢价；≥8%且实际持有时一次退出，其他情况0手。",
  "10:00前：观察159740的0.456、159608的0.753、159241的0.902能否守住；跌破只复核。",
  "全天：观察688981强势能否扩散到基金端；股票仍不买，基金不追。",
  "全天：运行时接口失败时只显示失败态，不绘制假线或假K线。"
];

data.sources = [
  { name: "本次运行：13个场内标的11月17日真实收盘", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226", note: "2026-11-17 20:42：13/13为非零11月17日收盘OHLC；自有代理与至少两家独立日K、Longbridge报价一致。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月17日单位净值${silverNav.DWJZ}、日跌${Math.abs(Number(silverNav.JZZZL)).toFixed(2)}%；相对同日场内收盘${silverClose.toFixed(3)}的静态溢价约${sameDatePremium.toFixed(2)}%。` },
  { name: "国投瑞银：161226溢价风险提示", url: "https://static.cninfo.com.cn/finalpage/2026-11-06/1225659583.PDF", note: "基金管理人提示二级市场价格溢价风险；本页仍要求同日数据和实际持仓双重确认。" },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月17日单位净值${openFundNav.DWJZ}、日跌${Math.abs(Number(openFundNav.JZZZL)).toFixed(2)}%；仅作dated NAV。` },
  { name: "运行时基金接口HTTP 501失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。" },
  { name: "11月17日A股收盘与市场广度", url: "https://finance.sina.com.cn/jjxw/2026-11-17/doc-iniyznqc1810161.shtml", note: "上证-0.50%、深成指-0.49%、创业板-1.20%；1326股上涨、4119股下跌。" },
  { name: "国家统计局：10月国民经济运行", url: "https://www.ln.gov.cn/web/ywdt/rdgz/2026111708223233808/index.shtml", note: "10月规上工业增加值同比增长4.8%；1—10月社零增长1.0%、固定资产投资下降8.1%。" },
  { name: "AP：11月16日美股收盘", url: "https://apnews.com/article/wall-street-stocks-dow-nasdaq-2e6a9c41b6336e9240c1b01585d20cd4", note: "S&P 500跌1.9%、纳指跌2.5%、道指跌1.4%，科技股继续承压。" },
  { name: "新华社：APEC深圳会议日程", url: "https://www.cac.gov.cn/2026-11/13/c_1796325469766056.htm", note: "工商领导人峰会11月17—18日举行，领导人非正式会议11月18—19日举行。" }
];

fs.writeFileSync("report-data.js", `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  sameDatePremium: round(sameDatePremium, 2),
  silverNetPremium: round(silverNetPremium, 2),
  silverExampleAmount,
  silverOneWayFeeRatio: oneWayFeeRate(silverClose, silverExampleLots),
  minBuyLots,
  minBuyAmount,
  minBuyGrossEdge,
  holdings: data.holdings.length,
  watchlist: data.watchlist.length,
  news: data.newsItems.length
}, null, 2));
