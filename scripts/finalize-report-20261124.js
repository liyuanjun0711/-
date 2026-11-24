const fs = require("fs");
const vm = require("vm");

const reportPath = "report-data.js";
const snapshot = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261123.json", "utf8"));
const indexes = JSON.parse(fs.readFileSync("scripts/index-snapshot-20261124.json", "utf8"));
const longbridge = JSON.parse(fs.readFileSync("scripts/longbridge-snapshot-20261124.json", "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(reportPath, "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;

const round = (value, digits = 2) => Number(Number(value).toFixed(digits));
const pct = (last, previous) => (Number(last) / Number(previous) - 1) * 100;
const money = (price, lots) => round(Number(price) * 100 * lots, 2);
const feeRatio = (amount, fee = 5) => round(fee / amount * 100, 2);
const signed = (value) => `${value > 0 ? "+" : ""}${Number(value).toFixed(2)}%`;

if (snapshot.expectedDate !== "2026-11-23" || snapshot.quotes.length !== 13) throw new Error("11/23 baseline incomplete");
if (!snapshot.quotes.every((row) => row.tieOut && row.consensusCount >= 2 && row.bar.time === "2026-11-23")) {
  throw new Error("11/23 quote/date/OHLC consensus failed");
}
if (!snapshot.quotes.every((row) => row.proxy.status === 200 && row.proxy.body?.ok === true && row.proxy.body?.mode === "realtime" && row.proxy.body?.dataDate === "2026-11-24")) {
  throw new Error("11/24 own-proxy realtime snapshot incomplete");
}
if (longbridge.quotes.length !== 13 || Object.values(longbridge.account).some((row) => row.error_code !== 403308)) {
  throw new Error("Longbridge delayed quote or account-scope evidence invalid");
}
const baseBySymbol = new Map(snapshot.quotes.map((row) => [row.symbol, row]));
const liveBySymbol = new Map(snapshot.quotes.map((row) => [row.symbol, row.proxy.body]));
for (const row of longbridge.quotes) {
  const baseline = baseBySymbol.get(row.symbol)?.bar;
  if (!baseline || Math.abs(Number(baseline.close) - Number(row.prevClose)) > 0.0006) {
    throw new Error(`Longbridge previous-close mismatch: ${row.symbol}`);
  }
}
const latestFund = (code) => snapshot.funds.find((row) => row.code === code)?.body?.Data?.LSJZList?.[0];
const silverNavRow = latestFund("161226");
const openFundRow = latestFund("005827");
if (silverNavRow?.FSRQ !== "2026-11-23" || openFundRow?.FSRQ !== "2026-11-23") throw new Error("11/23 fund NAV missing");
if (snapshot.runtimeFunds.some((row) => row.status !== 501 || row.body?.ok !== false || row.body?.mode !== "failed")) {
  throw new Error("runtime fund failure state changed");
}

const indexChange = {};
for (const row of indexes.rows) {
  const valid = row.providers.filter((provider) => provider.ok && provider.quote?.time?.startsWith("2026-11-24"));
  if (valid.length < 2) throw new Error(`11/24 index quote lacks two-provider support: ${row.symbol}`);
  const values = valid.map((provider) => Number(provider.quote.changePercent));
  if (Math.max(...values) - Math.min(...values) > 0.02) throw new Error(`11/24 index provider conflict: ${row.symbol}`);
  indexChange[row.symbol] = round(values[0], 2);
}

const q = (symbol) => liveBySymbol.get(symbol);
const change = (symbol) => Number(q(symbol).changePercent);
const baselineSilverClose = Number(baseBySymbol.get("SZ161226").bar.close);
const silverNav = Number(silverNavRow.DWJZ);
const sameDatePremium = pct(baselineSilverClose, silverNav);
const crossDatePremium = pct(q("SZ161226").price, silverNav);
const silverAmount = money(q("SZ161226").price, 2);
const hkAmount = money(q("SZ159740").price, 3);
const goldAmount = money(q("SZ164701").price, 2);
const minBuyLots = Math.ceil(1000 / (q("SZ161725").price * 100));
const minBuyAmount = money(q("SZ161725").price, minBuyLots);
const minBuyRoundTripRate = feeRatio(minBuyAmount, 10);
const minBuyGrossEdge = round(Math.max(minBuyRoundTripRate * 3, minBuyRoundTripRate + 1), 2);

data.date = "2026-11-24";
data.portfolioVersion = "portfolio-2026-11-24-midday-realtime-fee-aware-v1";
data.time = "2026-11-24 13:49盘中补发：13个场内持仓/观察标的均为自有代理13:46真实行情，11月23日前收OHLC由新浪、腾讯、东方财富至少两源逐项一致；Longbridge行情约延迟14分钟，仅作交叉复核。";
data.lastUpdated = "2026-11-24 13:49 北京时间（场内标的为13:46真实行情；基金为11月23日公开净值；开放式基金运行时接口仍失败）";
data.logicUpdatedAt = "2026-11-24盘中补发（券商持仓、订单、成交接口均为OAuth 403308）";
data.transactionCostPolicy.candidateOrders = [
  { code: "161226", label: "历史2手高溢价风险复核（实际持仓未授权）", side: "sell", lots: 2, referencePrice: q("SZ161226").price, hardRiskExit: false },
  { code: "159740", label: "历史3手普通减仓复核", side: "sell", lots: 3, referencePrice: q("SZ159740").price, hardRiskExit: false },
  { code: "164701", label: "历史2手普通减仓复核", side: "sell", lots: 2, referencePrice: q("SZ164701").price, hardRiskExit: false },
  { code: "161725", label: `${minBuyLots}手最低经济金额买入复核`, side: "buy", lots: minBuyLots, referencePrice: q("SZ161725").price, hardRiskExit: false }
];

data.oneLine = `11月24日盘中买0手、卖0手。161226在11月23日收${baselineSilverClose.toFixed(3)}、净值${silverNavRow.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%，显著高于8%风险线；但今日${q("SZ161226").price.toFixed(3)}相对昨净值约${crossDatePremium.toFixed(2)}%仍是跨日口径，且实际持仓未授权。仅供个人复盘参考。`;
data.tradeDecision = [
  { type: "第一屏结论", title: "盘中买0手、卖0手；161226立即核仓", conclusion: `已确认事实：161226在11月23日同日静态溢价约${sameDatePremium.toFixed(2)}%，已明显越过8%风险线；今日13:46报${q("SZ161226").price.toFixed(3)}，相对昨日净值约${crossDatePremium.toFixed(2)}%只是跨日复核。`, action: "立即在券商端核对是否仍持有、实际可卖份额与挂单；只有实际持仓存在且可靠同日IOPV/净值仍确认溢价≥8%时，才把全部实际可卖份额合并为一笔硬风险退出复核。", trigger: "实际持仓存在 + 可靠同日溢价≥8% + 真实报价有效；缺一项即卖0手。", reason: "昨日同日溢价证明风险已升级，但账户证据和今日同日口径仍不能省。仅供个人复盘参考。" },
  { type: "盘中市场", title: "成长反弹但高开回落，不追涨", conclusion: `已确认事实：13:46上证${signed(indexChange.SH000001)}、深成指${signed(indexChange.SZ399001)}、创业板${signed(indexChange.SZ399006)}、科创50${signed(indexChange.SH000688)}；早盘高点后涨幅收窄。`, action: "不追科技反弹，不用上涨个股替代基金信号；现有基金只看自身是否守住盘中低点。", trigger: "目标基金站稳今日高点、真实资金到账、预期毛收益覆盖往返费用3倍且扣费后≥1%，才进入买入评估。", reason: "指数上涨不等于费用后收益空间成立，午后回落也说明波动仍高。仅供个人复盘参考。" },
  { type: "费用闸门", title: "三笔历史碎片单仍全部暂停", conclusion: `按13:46真实价：161226历史2手约${silverAmount.toFixed(2)}元/单边费${feeRatio(silverAmount).toFixed(2)}%，159740历史3手约${hkAmount.toFixed(2)}元/${feeRatio(hkAmount).toFixed(2)}%，164701历史2手约${goldAmount.toFixed(2)}元/${feeRatio(goldAmount).toFixed(2)}%；普通订单均不经济。`, action: "159740与164701不下碎片单；161226只有实际持仓与今日硬风险同时确认后才可越过金额门，并一次完成。", trigger: "普通波动保持0手；基本面失效、流动性异常或可靠同日溢价≥8%才进入硬风险复核。", reason: "暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。" },
  { type: "新买入", title: "金额门可过，资金与收益门失败", conclusion: `161725按${minBuyLots}手约${minBuyAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${minBuyRoundTripRate.toFixed(2)}%；可核验毛收益至少需${minBuyGrossEdge.toFixed(2)}%，且扣费后不少于1%。`, action: "不买。没有已成交卖出资金，也没有可靠收益空间证据。", trigger: `站稳0.568，同时真实资金已到账、预期毛收益≥${minBuyGrossEdge.toFixed(2)}%、扣费后≥1%，才重新评估。`, reason: "价格触发不能替代资金门和收益门。仅供个人复盘参考。" },
  { type: "相对强弱", title: "科创与军工较强，电网设备偏弱", conclusion: `已确认事实：688981涨${change("SH688981").toFixed(2)}%、512710涨${change("SH512710").toFixed(2)}%，002090跌${Math.abs(change("SZ002090")).toFixed(2)}%。`, action: "股票仍只观察；512710持有不追，002090只作电网设备风险温度计。", trigger: "相关基金自身收复今日高点且通过资金、费用、收益三门，才进入基金端评估。", reason: "个股强弱只解释板块，不直接生成股票订单。仅供个人复盘参考。" }
];

data.executionOrder = [
  "1. 立即在券商端核对真实持仓、可卖份额、挂单、成交和实际费率；网页仍无法读取账户数据。",
  `2. 161226的11月23日同日静态溢价约${sameDatePremium.toFixed(2)}%，风险已升级；今日跨日估算约${crossDatePremium.toFixed(2)}%不能直接触发卖出。`,
  "3. 若实际不再持有161226，或可靠今日同日溢价低于8%，卖0手；若两项均确认，按全部实际可卖份额一次合并复核，避免拆单。",
  "4. 159740历史3手与164701历史2手继续暂停：普通费用门不通过。",
  "5. 其余基金新增买入0手；未成交卖出不得写成资金来源，真实卖出后也先留现金。",
  "6. 股票条目只作板块温度计，不生成股票订单。",
  "7. 页面只显示13:46真实快照；接口失败时不画假线或假K线。"
];
data.tradePlan = [
  { title: "161226历史同日溢价显著失控", basis: `11月23日场内收${baselineSilverClose.toFixed(3)}、净值${silverNavRow.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%。`, inference: "昨日风险线已明确触发；今日仍需可靠同日IOPV/净值和实际份额。", conclusion: "当前卖0手；先核仓并重算，确认后才合并退出。", invalidCondition: "实际无持仓，或可靠今日同日溢价回落至8%以下。" },
  { title: "成长反弹但高开回落", basis: `科创50${signed(indexChange.SH000688)}、688981${signed(change("SH688981"))}，但指数从早盘高点回落。`, inference: "隔夜科技反弹带来情绪修复，但盘中追价风险仍高。", conclusion: "基金不追、股票不买。", invalidCondition: "目标基金站稳今日高点且三道执行门全部通过。" },
  { title: "普通碎片单仍不经济", basis: `159740历史3手约${hkAmount.toFixed(2)}元，164701历史2手约${goldAmount.toFixed(2)}元。`, inference: "最低佣金占比显著超过0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现明确硬风险。" },
  { title: "资金来源仍未成立", basis: "券商持仓、订单、成交接口均返回OAuth 403308。", inference: "无法证明历史份额，也无法证明有卖出回款。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" }
];
data.noTradeList = [
  "不把13:46快照写成持续实时价；页面保留真实更新时间。",
  "不把161226盘中价与11月23日净值的跨日比较写成今日同日溢价。",
  "不在券商持仓接口未授权时机械卖历史2手。",
  "不执行159740历史3手或164701历史2手普通碎片卖单。",
  "不因隔夜美股或科创板反弹追买股票、ETF或LOF。",
  "不把计划卖出当作已到账资金；新增买入0手。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingMeta = {
  "159740": [3, "港股科技偏弱", "偏弱", `跌${Math.abs(change("SZ159740")).toFixed(2)}%，高开后回到盘中低位附近。`, "高", `持有、不补；历史3手约${hkAmount.toFixed(2)}元、单边费约${feeRatio(hkAmount).toFixed(2)}%，普通减仓暂停`],
  "164701": [4, "黄金横盘", "震荡", `涨${change("SZ164701").toFixed(2)}%，未站稳开盘价。`, "高", `持有、不追；历史2手约${goldAmount.toFixed(2)}元、单边费约${feeRatio(goldAmount).toFixed(2)}%，普通减仓暂停`],
  "512710": [6, "军工反弹", "偏强", `涨${change("SH512710").toFixed(2)}%，但从盘中高点回落。`, "中高", "持有、不追；跌破0.544只进入复核，新买0手"],
  "161226": [1, "溢价失控风险", "高风险", `11月23日同日静态溢价约${sameDatePremium.toFixed(2)}%；今日跨日估算约${crossDatePremium.toFixed(2)}%，先核仓。`, "高", `当前卖0手；历史2手约${silverAmount.toFixed(2)}元、单边费约${feeRatio(silverAmount).toFixed(2)}%，硬风险确认后才一次合并退出`],
  "159608": [3, "资源高开回落", "偏弱", `跌${Math.abs(change("SZ159608")).toFixed(2)}%，接近日内低位。`, "高", "持有、不补；跌破0.742只进入复核，新买0手"],
  "159241": [6, "航天反弹", "偏强", `涨${change("SZ159241").toFixed(2)}%，仍低于盘中高点。`, "中高", "持有、不追；站稳0.863且三门齐备才复核"],
  "562350": [5, "电力震荡", "震荡", `涨${change("SH562350").toFixed(2)}%，未突破昨日高点。`, "中高", "持有、不加仓；站稳1.090且三门齐备才复核"],
  "002090": [2, "电网设备偏弱", "偏弱", `跌${Math.abs(change("SZ002090")).toFixed(2)}%，股票只作基金环境参考。`, "高", "仅观察，不新增股票买卖指令；用于判断电网设备风险"]
};
for (const item of data.holdings) {
  const row = q(item.symbol);
  const meta = holdingMeta[item.code];
  Object.assign(item, {
    support: `${row.low} / 今日低点`, resistance: `${row.high} / 今日高点`,
    lastTradeDate: "2026-11-24", lastOpen: row.open, lastClose: row.price, lastHigh: row.high, lastLow: row.low,
    lastChangePercent: round(change(item.symbol), 2),
    lastSource: `自有代理${row.lastUpdated}真实行情（${row.source}）；11月23日前收OHLC另经三源日K一致；Longbridge约延迟14分钟`,
    predictionScore: meta[0], predictionLabel: meta[1], expectedDirection: meta[2], reason: meta[3], riskLevel: meta[4], action: meta[5],
    invalidCondition: `跌破${row.low}且板块继续转弱；普通订单仍须通过费用闸门`
  });
}

const watchMeta = {
  "601208": [5, "冲高回落，股票不买", `涨${change("SH601208").toFixed(2)}%，但从30.12回落`, "股票不买；基金端需站稳30.12并通过费用门", "波动仍高，追价性价比不足", "高"],
  "600050": [3, "通信偏弱，股票不买", `跌${Math.abs(change("SH600050")).toFixed(2)}%`, "股票不买；基金端需站稳4.50并通过费用门", "强度未扩散，费用后收益证据不足", "中高"],
  "002466": [4, "锂股震荡，股票不买", `涨${change("SZ002466").toFixed(2)}%，高开回落`, "股票不买；基金端需站稳33.33并通过费用门", "冲高回落且资源波动高", "高"],
  "688981": [7, "半导体强势，股票不买", `涨${change("SH688981").toFixed(2)}%，但低于盘中高点`, "股票不买；基金端先看相关ETF能否站稳自身高点", "单点强势不等于基金趋势扩散", "高"],
  "161725": [4, "白酒横盘，金额过门仍不买", `跌${Math.abs(change("SZ161725")).toFixed(2)}%；${minBuyLots}手金额过门但缺资金和收益证据`, `站稳0.568，且先有成交资金、预期毛收益≥${minBuyGrossEdge.toFixed(2)}%和扣费后≥1%`, `${minBuyLots}手约${minBuyAmount.toFixed(2)}元、往返最低费约10元；无资金来源`, "中高"]
};
for (const item of data.watchlist.filter((row) => row.code !== "005827")) {
  const row = q(item.symbol);
  const meta = watchMeta[item.code];
  Object.assign(item, {
    status: meta[1], reason: meta[2], buyTrigger: meta[3], avoidReason: meta[4], risk: `跌破${row.low}`,
    support: String(row.low), resistance: String(row.high), invalidCondition: `跌破${row.low}`,
    lastTradeDate: "2026-11-24", lastOpen: row.open, lastClose: row.price, lastHigh: row.high, lastLow: row.low,
    lastChangePercent: round(change(item.symbol), 2), lastSource: `自有代理${row.lastUpdated}真实行情（${row.source}）；11月23日前收经三源日K一致`,
    predictionScore: meta[0], predictionLabel: meta[1], expectedDirection: meta[0] >= 6 ? "偏强" : "震荡偏弱", riskLevel: meta[5]
  });
}
const openFund = data.watchlist.find((row) => row.code === "005827");
Object.assign(openFund, {
  status: "11月23日净值已披露，运行时接口失败", reason: `11月23日净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；只作dated NAV。`,
  buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据", avoidReason: "运行时基金接口HTTP 501，不能伪装实时", risk: "净值披露滞后或接口失败",
  support: "按净值披露", resistance: "不设盘中价", invalidCondition: "运行时真实基金接口接通并通过校验",
  lastTradeDate: "2026-11-23", lastOpen: null, lastClose: Number(openFundRow.DWJZ), lastHigh: null, lastLow: null, lastChangePercent: Number(openFundRow.JZZZL),
  lastSource: "东方财富基金11月23日公开净值；运行时基金接口HTTP 501，mode=failed", predictionScore: 3, predictionLabel: "净值小幅回落、接口失败", expectedDirection: "震荡偏弱", riskLevel: "中高"
});

data.newsItems = [
  { title: "A股盘中上涨但高开回落，科创50仍领涨", source: "自有代理 / 新浪 / 腾讯 / 东方财富", publishTime: "2026-11-24 13:49:00+08:00", summary: `已确认事实：13:46上证${signed(indexChange.SH000001)}、深成指${signed(indexChange.SZ399001)}、创业板${signed(indexChange.SZ399006)}、科创50${signed(indexChange.SH000688)}，较早盘高点均有回落。基于事实的判断：成长情绪修复，但午后不追涨。`, relatedStocks: ["512710", "159241", "688981"], sector: "过去24小时 / 全市场重大利好与风险 / A股盘中", relation: "market", url: "https://finance.eastmoney.com/a/202611243938307531.html" },
  { title: `161226昨日同日静态溢价约${sameDatePremium.toFixed(2)}%`, source: "东方财富基金 / 三源日K", publishTime: "2026-11-24 08:10:00+08:00", summary: `已确认事实：11月23日场内收${baselineSilverClose.toFixed(3)}、官方净值${silverNavRow.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%。基于事实的判断：风险已显著升级；今日仍需核仓并取得可靠同日IOPV/净值。`, relatedStocks: ["161226"], sector: "过去24小时 / 持仓重大风险 / 白银LOF", relation: "risk", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10" },
  { title: "11月23日A股探底回升，逾4600只个股上涨", source: "财经杂志 / 多源指数", publishTime: "2026-11-23 20:25:00+08:00", summary: "已确认事实：上证+0.15%、深成指+1.93%、创业板+3.08%，科创50-0.26%。基于事实的判断：广度修复明显，但仍需观察连续性。", relatedStocks: ["512710", "159241", "688981"], sector: "过去24小时 / 全市场重大利好 / A股收盘", relation: "market", url: "https://finance.sina.com.cn/wm/2026-11-23/doc-iniztsaa0568861.shtml" },
  { title: "美股科技反弹，纳指单日上涨6.5%", source: "AP", publishTime: "2026-11-23 16:20:00-05:00", summary: "已确认事实：纳指涨6.5%、标普500涨4.7%、道指涨3.0%，此前连续下跌后出现强反弹。基于事实的判断：利好今日科技情绪，但单日急涨也放大追高风险。", relatedStocks: ["159740", "512710", "688981"], sector: "过去24小时 / 全市场重大利好与风险 / 海外收盘", relation: "market", url: "https://apnews.com/article/fcdf1bad36b4f81c90cbb0f33a2c5704" },
  { title: "13个场内标的盘中真实行情全部有效", source: "自有代理 / 三源日K / Longbridge", publishTime: "2026-11-24 13:49:00+08:00", summary: "已确认事实：13/13均有11月24日13:46非零真实报价；11月23日前收OHLC至少两源一致，Longbridge约延迟14分钟。基于事实的判断：页面使用较新的自有代理快照，并保留真实时间戳。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "过去24小时 / 数据校验 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226" },
  { title: "005827净值小幅回落，运行时基金接口仍失败", source: "东方财富基金 / 自有代理", publishTime: "2026-11-24 08:10:00+08:00", summary: `已确认事实：11月23日净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。`, relatedStocks: ["005827"], sector: "过去24小时 / 持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" },
  { title: "机器人与消费电子领涨，电网设备个股走弱", source: "财联社 / 自有代理", publishTime: "2026-11-24 12:05:00+08:00", summary: `已确认事实：早盘机器人、消费电子活跃；002090盘中跌${Math.abs(change("SZ002090")).toFixed(2)}%。基于事实的判断：成长内部继续分化，电网设备不追。`, relatedStocks: ["002090", "601208", "688981"], sector: "过去24小时 / 热点复盘 / 板块分化", relation: "market", url: "https://api3.cls.cn/share/article/2542702?app=&os=CailianpressWeb&sv=863" },
  { title: "融资保证金比例将降至80%", source: "上海证券交易所", publishTime: "2026-11-22 18:00:00+08:00", summary: "已确认事实：融资买入证券最低保证金比例自11月30日起由100%调低至80%。基于事实的判断：有助于流动性预期，但不是现有基金立即买入依据。", relatedStocks: ["512710", "159241", "688981"], sector: "政策雷达 / 市场流动性 / 已确认事实", relation: "market", url: "https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/margin/c/c_20261122_10838633.shtml" },
  { title: "创业板拟引入做市交易机制", source: "深圳证券交易所", publishTime: "2026-11-22 18:10:00+08:00", summary: "已确认事实：深交所就创业板做市交易业务细则公开征求意见。基于事实的判断：中期改善定价和流动性，不直接生成基金订单。", relatedStocks: ["688981", "512710"], sector: "政策雷达 / 交易机制 / 中性偏利好", relation: "market", url: "https://www.szse.cn/www/aboutus/trends/news/t20261122_623984.html" },
  { title: "交易所推出新一批降费措施", source: "深圳证券交易所", publishTime: "2026-11-22 18:20:00+08:00", summary: "已确认事实：深交所公布新一批市场费用减免。基于事实的判断：这是市场层面降费，不等同于用户券商佣金已经变更，费用闸门仍按待确认费率运行。", relatedStocks: ["159740", "164701", "161226"], sector: "政策雷达 / 市场费用 / 利好但需区分口径", relation: "market", url: "https://www.szse.cn/aboutus/trends/news/t20261122_623988.html" },
  { title: "工信部推进5G+工业互联网融合应用城市试点", source: "工业和信息化部", publishTime: "2026-11-17 18:05:00+08:00", summary: "已确认事实：工信部组织开展2026年5G+工业互联网融合应用城市试点申报。基于事实的判断：通信与工业互联网中期逻辑改善，但600050今日偏弱，不追。", relatedStocks: ["600050", "562350", "002090"], sector: "机会雷达 / 通信与工业互联网 / 官方政策", relation: "market", url: "https://www.miit.gov.cn/jgsj/xgj/wjfb/art/2026/art_4dd7509c84594a61bcdf2b383f5321a5.html" },
  { title: "券商账户接口仍缺少持仓与交易权限", source: "Longbridge", publishTime: "2026-11-24 13:45:00+08:00", summary: "已确认事实：持仓、当日订单、当日成交均返回OAuth 403308。基于事实的判断：不能假定历史手数仍存在，所有可执行数量保持0手。", relatedStocks: ["161226", "159740", "164701", "161725"], sector: "执行风险 / 账户核验 / 权限失败", relation: "risk", url: "https://open.longbridge.com/docs" }
];

data.reasoning = [
  { title: "161226先解决实际份额与同日口径", basis: `11月23日同日溢价${sameDatePremium.toFixed(2)}%，今日跨日估算${crossDatePremium.toFixed(2)}%。`, inference: "历史同日风险已确认，但跨日估算不能替代今日IOPV/净值，账户也未授权。", conclusion: "当前卖0手；核仓且今日同日溢价≥8%后一次合并复核。", invalidCondition: "实际无持仓，或可靠今日同日溢价低于8%。" },
  { title: "指数反弹与追价分离", basis: `科创50${signed(indexChange.SH000688)}，但多数指数较早盘高点回落。`, inference: "情绪修复仍伴随高波动，不能只看涨幅。", conclusion: "科技基金不追，股票不买。", invalidCondition: "目标基金站稳今日高点且三门齐备。" },
  { title: "普通碎片单仍不经济", basis: "161226历史2手、159740历史3手、164701历史2手均不足1000元且单边费用占比超过0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "触价只复核。", invalidCondition: "出现明确硬风险。" },
  { title: "账户证据是执行前置条件", basis: "券商持仓、当日订单、成交接口仍返回OAuth 403308。", inference: "无法确认历史份额，也无法确认卖出回款。", conclusion: "买卖均为0手。", invalidCondition: "用户在券商端完成核对。" }
];
data.invalidConditions = [
  "161226无法确认实际持仓，或可靠今日同日溢价低于8%：卖0手。",
  "最新券商持仓与历史示例不一致：历史手数立即失效，按真实可卖份额一次合并重算。",
  "161226/159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
  "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
  "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
];
data.cancelPlan = [
  "先查券商最新持仓与挂单；不存在的历史份额不得生成订单。",
  "161226只用可靠今日同日IOPV/净值重算溢价；跨日估算不得触发卖出。",
  "盘中瞬时跳价不直接成交，先确认真实价格、时间戳与流动性。",
  "卖出未真实成交前不写入买入资金；成交后也先留现金。",
  "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
];
data.learningFramework = [
  { title: "盘中价必须带真实更新时间", basis: "13个场内标的均有自有代理13:46非零真实行情。", inference: "13:49只能称已校验快照，不能称持续实时。", conclusion: "页面保留真实时间和来源。", invalidCondition: "取得更新且通过校验的真实报价。" },
  { title: "LOF溢价必须同日比较", basis: `11月23日同日溢价${sameDatePremium.toFixed(2)}%，今日跨日估算${crossDatePremium.toFixed(2)}%。`, inference: "跨日口径混入当日银价和净值变化。", conclusion: "同日证据不足时卖0手。", invalidCondition: "取得可靠今日同日IOPV/净值。" },
  { title: "费用门先于普通调仓", basis: `三笔历史碎片单参考额${silverAmount.toFixed(2)}元、${hkAmount.toFixed(2)}元、${goldAmount.toFixed(2)}元。`, inference: "均未达到经济金额，最低佣金侵蚀过大。", conclusion: "普通调仓暂停。", invalidCondition: "明确硬风险出现。" },
  { title: "资金来源必须已成交", basis: "账户订单与成交接口未授权，无法证明有卖出回款。", inference: "计划卖出不是资金。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" },
  { title: "隔夜反弹与今日执行分开", basis: "美股科技大涨，A股成长高开后涨幅收窄。", inference: "外部利好改善情绪，但不能替代基金自身趋势与费用证据。", conclusion: "观察，不追买。", invalidCondition: "基金自身站稳高点且执行三门齐备。" }
];
data.nextWatch = [
  "立即：在券商端核对真实持仓、可卖份额、挂单和实际费率。",
  "14:00前：若能取得可靠今日IOPV/净值，重算161226同日溢价；否则卖0手。",
  "14:00：观察159740的0.426、512710的0.544、159241的0.844能否守住；跌破只复核。",
  "14:30：观察688981强势能否扩散到基金端；股票仍不买、基金不追。",
  "15:00后：记录真实收盘并等待11月24日基金净值披露，再做同日溢价复盘。"
];
data.quoteWatchlist = data.watchlist.map((item) => ({ name: item.name, code: item.code, symbol: item.symbol, market: item.market, type: item.type, sector: item.sector, support: item.support, resistance: item.resistance }));
data.sources = [
  { name: "自有代理：13个标的11月24日盘中真实行情", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226", note: "2026-11-24 13:46核验：13/13返回非零realtime行情；页面保留真实时间戳。" },
  { name: "11月23日三源日K一致性核验", url: "https://daily-briefing-blue.vercel.app/api/kline?symbol=SH512710&period=day", note: "新浪、腾讯、东方财富对13个标的11月23日OHLC形成至少两源一致，13/13通过。" },
  { name: "Longbridge盘中行情与账户接口", url: "https://open.longbridge.com/docs", note: "行情时间约13:31—13:32，较采集时延迟约14分钟；持仓、订单、成交均返回OAuth 403308。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月23日单位净值${silverNavRow.DWJZ}、日跌${Math.abs(Number(silverNavRow.JZZZL)).toFixed(2)}%；相对同日收盘${baselineSilverClose.toFixed(3)}的静态溢价约${sameDatePremium.toFixed(2)}%。` },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月23日单位净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；仅作dated NAV。` },
  { name: "运行时基金接口HTTP 501失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。" },
  { name: "21财经：11月24日A股午评", url: "https://finance.eastmoney.com/a/202611243938307531.html", note: "午盘上证+0.47%、深成指+0.92%、创业板+1.90%、科创50+2.72%；盘中后续指数由三源行情更新。" },
  { name: "财经杂志：11月23日A股探底回升", url: "https://finance.sina.com.cn/wm/2026-11-23/doc-iniztsaa0568861.shtml", note: "上证+0.15%、深成指+1.93%、创业板+3.08%，逾4600只个股上涨。" },
  { name: "AP：11月23日美股强反弹", url: "https://apnews.com/article/fcdf1bad36b4f81c90cbb0f33a2c5704", note: "纳指+6.5%、标普500+4.7%、道指+3.0%；只作海外风险偏好背景。" },
  { name: "上交所：调整融资保证金比例", url: "https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/margin/c/c_20261122_10838633.shtml", note: "最低融资保证金比例自11月30日起降至80%；不直接生成买入指令。" },
  { name: "深交所：创业板做市规则征求意见", url: "https://www.szse.cn/www/aboutus/trends/news/t20261122_623984.html", note: "中期流动性和定价机制背景；不直接生成订单。" },
  { name: "深交所：新一批降费措施", url: "https://www.szse.cn/aboutus/trends/news/t20261122_623988.html", note: "交易所费用减免不等于券商佣金已经变更。" },
  { name: "工信部：5G+工业互联网融合应用城市试点", url: "https://www.miit.gov.cn/jgsj/xgj/wjfb/art/2026/art_4dd7509c84594a61bcdf2b383f5321a5.html", note: "通信与工业互联网中期政策背景；股票仅作观察。" }
];

fs.writeFileSync(reportPath, `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  baselineTieOut: snapshot.quotes.filter((row) => row.tieOut).length,
  realtimeQuotes: snapshot.quotes.filter((row) => row.proxy.body.mode === "realtime").length,
  sameDatePremium: round(sameDatePremium, 2),
  crossDatePremium: round(crossDatePremium, 2),
  candidateAmounts: { silverAmount, hkAmount, goldAmount, minBuyAmount },
  minBuyLots, minBuyGrossEdge,
  runtimeFunds: snapshot.runtimeFunds.map((row) => `${row.symbol}:${row.status}:${row.body.mode}`)
}, null, 2));
