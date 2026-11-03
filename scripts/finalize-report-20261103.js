const fs = require("fs");
const vm = require("vm");

const reportPath = "report-data.js";
const snapshotPath = "scripts/market-snapshot-20261103.json";
const indexPath = "scripts/index-snapshot-20261103.json";
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(reportPath, "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const indexSnapshot = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const quotes = new Map(snapshot.quotes.map((item) => [item.symbol.slice(2), item]));
const fundRows = new Map(snapshot.funds.map((item) => [item.code, item.body?.Data?.LSJZList?.[0] || null]));

if (snapshot.quotes.length !== 13 || snapshot.quotes.some((item) => !item.tieOut || item.dataDate !== "2026-11-02")) {
  throw new Error("13-symbol 2026-11-02 quote/K-line tie-out is required");
}
if (snapshot.runtimeFunds.some((item) => item.status !== 501 || item.body?.ok !== false)) {
  throw new Error("runtime fund endpoints must remain explicit failures");
}
for (const row of indexSnapshot.rows) {
  const successful = row.providers.filter((provider) => provider.ok && provider.quote?.time?.startsWith("2026-11-02"));
  if (successful.length < 2) throw new Error(`${row.symbol} lacks two-provider index verification`);
}

const silverNavRow = fundRows.get("161226");
const openFundRow = fundRows.get("005827");
const silverQuote = quotes.get("161226");
if (silverNavRow?.FSRQ !== "2026-11-02" || openFundRow?.FSRQ !== "2026-11-02") {
  throw new Error("same-date 2026-11-02 fund NAVs are required");
}
const silverNav = Number(silverNavRow.DWJZ);
const silverPremium = (Number(silverQuote.close) / silverNav - 1) * 100;
if (silverPremium <= 8) throw new Error("161226 hard-risk premium trigger must be confirmed above 8%");

const amount = (code, lots) => Number((quotes.get(code).close * lots * 100).toFixed(2));
const feeRatio = (value) => Number((5 / value * 100).toFixed(2));
const hkAmount = amount("159740", 3);
const goldAmount = amount("164701", 2);
const silverAmount = amount("161226", 2);
const liquorAmount = amount("161725", 18);
const silverNetPremiumBuffer = silverPremium - feeRatio(silverAmount);

data.date = "2026-11-03";
data.portfolioVersion = "portfolio-2026-11-03-premarket-fee-aware-v1";
data.time = "2026-11-03 08:30北京时点核验：13个场内持仓/观察标的均为11月2日真实收盘，且与独立日K末根日期、开高低收逐只一致。161226与005827均已披露11月2日净值；自有运行时基金接口仍返回501。盘前不把11月2日收盘写成实时行情。";
data.lastUpdated = "2026-11-03 08:30 北京时间（场内为11月2日真实收盘；基金为11月2日公开净值）";
data.logicUpdatedAt = "2026-11-03盘前（最新券商持仓、可卖份额与实际费率仍待核对）";
data.transactionCostPolicy = {
  profile: "low_principal",
  assumptionStatus: "待用户用券商佣金表或交割单确认",
  commissionRate: 0.00025,
  minimumCommissionCny: 5,
  minimumEconomicOrderCny: 1000,
  maxOneWayCostRatio: 0.005,
  maxRoundTripCostRatio: 0.01,
  minimumNetEdgeRatio: 0.01,
  feeCoverageMultiple: 3,
  lotSize: 100,
  hardRiskExitRule: "基本面失效、LOF溢价失控或明确硬性风控时，费用不阻止退出；同一标的尽量一次完成，避免重复支付最低佣金。",
  candidateOrders: [
    { code: "161226", label: "同日溢价超过8%的硬风险退出复核", side: "sell", lots: 2, referencePrice: silverQuote.close, hardRiskExit: true },
    { code: "159740", label: "旧3手普通减仓复核", side: "sell", lots: 3, referencePrice: quotes.get("159740").close, hardRiskExit: false },
    { code: "164701", label: "旧2手普通减仓复核", side: "sell", lots: 2, referencePrice: quotes.get("164701").close, hardRiskExit: false },
    { code: "161725", label: "18手最低经济金额买入复核", side: "buy", lots: 18, referencePrice: quotes.get("161725").close, hardRiskExit: false }
  ]
};

data.oneLine = `结论：11月3日盘前买0手；161226确认同日静态溢价约${silverPremium.toFixed(2)}%且暂停申购，升级为硬风险。9:15先核券商真实剩余份额；若仍为旧2手，则合并卖2手，参考成交额约${silverAmount.toFixed(2)}元、单边费约5元/${feeRatio(silverAmount).toFixed(2)}%，费用闸门结论为“风险退出例外”，不拆单。若已无持仓则卖0手。其余基金不追11月2日普涨，卖出资金留现金。仅供个人复盘参考。`;

data.tradeDecision = [
  {
    type: "第一屏结论",
    title: "只处理161226硬风险，其余0手",
    conclusion: `11月2日161226场内收${silverQuote.close.toFixed(3)}、单位净值${silverNav.toFixed(4)}，同日静态溢价约${silverPremium.toFixed(2)}%；净值单日跌${Math.abs(Number(silverNavRow.JZZZL)).toFixed(2)}%，申购暂停。`,
    action: `9:15先核对券商可卖份额。若仍持有旧2手，9:30后合并卖2手，不拆单；参考成交额约${silverAmount.toFixed(2)}元、单边费约5元。若实际份额不是2手，按全部真实可卖份额一笔退出；若已无持仓则卖0手。`,
    trigger: "同日可核验溢价>8%且申购暂停已成立；若盘前基金公告恢复申购或同日估值使溢价降至≤8%，取消硬退出并重新复核。",
    reason: `旧2手费用占比约${feeRatio(silverAmount).toFixed(2)}%，但硬风险允许越过经济金额门槛；按旧2手测算，扣除单边最低佣金后的溢价缓冲仍约${silverNetPremiumBuffer.toFixed(2)}个百分点。费率待券商实际确认。仅供个人复盘参考。`
  },
  {
    type: "市场总览",
    title: "政策稳市推动普涨，但隔夜AI继续承压",
    conclusion: "11月2日沪指+1.08%、深成指+1.63%、创业板+1.87%、科创50+3.11%；证监会确认第三批互换便利申请额度超1000亿元、回购增持再贷款利率降至1%。隔夜纳指仍跌1.1%。",
    action: "已有基金继续观察，不把政策利好直接转成追涨单；港股科技、军工航天、稀有金属均买0手。",
    trigger: "只有真实盘中价格回踩11月2日支撑后重新站上日高，且有已成交卖出资金、可核验预期毛收益并通过费用门，才进入买入复核。",
    reason: "A股风险偏好修复与海外AI压力并存，单日普涨不足以证明可持续。仅供个人复盘参考。"
  },
  {
    type: "费用闸门",
    title: "旧普通碎片单继续暂停",
    conclusion: `159740旧3手约${hkAmount.toFixed(2)}元/单边费约${feeRatio(hkAmount).toFixed(2)}%；164701旧2手约${goldAmount.toFixed(2)}元/${feeRatio(goldAmount).toFixed(2)}%，均未达1000元且费用占比超0.5%。`,
    action: "两笔普通调仓不下单，只做风险复核；它们没有硬风险证据，不能借161226的例外越过费用门。",
    trigger: "只有基本面失效、流动性异常或新的明确硬风控成立，才按真实剩余份额合并退出。",
    reason: "最低佣金会吞噬普通小额调仓价值。费率待券商实际确认。仅供个人复盘参考。"
  },
  {
    type: "新买入",
    title: "白酒反弹不追，所有新增买入0手",
    conclusion: `161725涨3.56%收${quotes.get("161725").close.toFixed(3)}；18手约${liquorAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${(10 / liquorAmount * 100).toFixed(2)}%。`,
    action: "不买。没有已成交卖出资金来源，也没有可核验预期毛收益率；即使161226卖出，资金也先留现金。",
    trigger: `若未来有真实资金来源，预期毛收益至少需覆盖往返费用3倍（约${(30 / liquorAmount * 100).toFixed(2)}%），且扣费后预期收益率≥1%，再评估。`,
    reason: "单日上涨不是预期收益证据；接近满仓时不能用未成交资金安排加仓。仅供个人复盘参考。"
  },
  {
    type: "外部风险",
    title: "油价大跌缓解通胀，但AI与选举风险未消",
    conclusion: "11月2日油价跌逾6%，黄金反弹逾2%、白银约涨3.7%；美股科技与AI再受压，纳指跌1.1%。",
    action: "黄金LOF、港股科技ETF不追开盘波动；只用真实盘中价格复核支撑，不根据隔夜新闻直接下单。",
    trigger: "若贵金属和科技基金均跌破11月2日低点并持续30分钟，只进入风险复核；非硬风险碎片单仍暂停。",
    reason: "油价、贵金属与科技出现分化，不能用单一宏观变量替代标的价格确认。仅供个人复盘参考。"
  }
];

data.executionOrder = [
  "1. 9:15核对券商最新成交、161226真实可卖份额和实际费率；旧2手只作条件示例，份额不一致立即失效。",
  "2. 9:20核查161226最新公告、申购状态和同日估值；恢复申购或溢价降至≤8%则取消硬退出。",
  "3. 若硬风险仍成立且实际仍为2手，9:30后合并卖2手；若份额不同，按全部真实可卖份额一笔退出，不拆单。",
  "4. 若161226已无持仓，卖0手；不得重复执行旧计划。",
  "5. 159740旧3手与164701旧2手继续暂停，普通调仓费用闸门不通过。",
  "6. 其他基金和观察池买0手；任何真实卖出资金先留现金，不自动切换。",
  "7. 网页若仍显示11月2日或接口失败，只视作最近真实收盘/失败态，不当作11月3日实时价格。"
];

data.tradePlan = [
  { title: "161226硬风险优先", basis: `11月2日场内${silverQuote.close.toFixed(3)}、净值${silverNav.toFixed(4)}，同日溢价约${silverPremium.toFixed(2)}%，且暂停申购。`, inference: "溢价已越过8%硬风险线，小额费用不应阻止必要退出。", conclusion: "先核真实份额，确认后合并一笔退出。", invalidCondition: "恢复申购或最新同日可核验溢价降至≤8%。" },
  { title: "政策利好不等于追涨", basis: "稳市工具扩容与再贷款降息已确认，A股四个主要指数同步上涨。", inference: "政策改善流动性预期，但隔夜海外AI仍弱，持续性需价格确认。", conclusion: "除硬风险外买0手、卖0手。", invalidCondition: "真实价格回踩支撑后站稳日高，且资金与费用后收益证据同时成立。" },
  { title: "普通碎片单仍被费用否决", basis: `159740旧3手约${hkAmount.toFixed(2)}元、164701旧2手约${goldAmount.toFixed(2)}元，单边费用占比分别约${feeRatio(hkAmount).toFixed(2)}%、${feeRatio(goldAmount).toFixed(2)}%。`, inference: "普通波动下最低佣金会破坏调仓经济性。", conclusion: "触价只复核，不机械卖。", invalidCondition: "标的出现基本面失效或明确硬风控。" },
  { title: "贵金属内部出现分化", basis: "164701下跌1.70%，161226净值下跌4.86%；隔夜黄金和白银反弹、油价大跌。", inference: "外盘反弹可能带来波动，但不能修复161226已存在的场内溢价风险。", conclusion: "黄金LOF观察，白银LOF先处理溢价。", invalidCondition: "最新同日溢价降至≤8%且申购恢复。" },
  { title: "新买入缺少四项条件", basis: "没有已成交资金来源、券商实际费率、可核验预期毛收益与扣费后收益空间。", inference: "即使金额超过1000元，也不能把反弹直接写成买单。", conclusion: "所有新买入0手。", invalidCondition: "四项证据齐备并通过费用闸门。" }
];

data.noTradeList = [
  "不把11月2日收盘写成11月3日实时行情；盘前只用作最近真实基线。",
  "不拆分161226硬风险退出；先核真实份额，再合并一笔。",
  "不机械执行159740旧3手或164701旧2手普通卖单；费用闸门继续否决。",
  "不追11月2日普涨、政策利好或161725单日上涨；所有新增买入0手。",
  "不买股票观察池；股票只作基金板块温度计。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingViews = {
  "159740": { support: "0.462 / 跌破后复核", resistance: "0.475 / 0.480", action: `持有、不追涨；旧3手约${hkAmount.toFixed(2)}元、单边费约${feeRatio(hkAmount).toFixed(2)}%，普通减仓不下单`, invalidCondition: "跌破0.462并持续30分钟，或海外科技风险继续扩散", predictionScore: 5, predictionLabel: "A股反弹、隔夜科技承压", expectedDirection: "震荡", reason: "11月2日涨2.17%，但隔夜纳指跌1.1%。", riskLevel: "中" },
  "164701": { support: "1.500 / 跌破后复核", resistance: "1.518 / 1.530", action: `持有、不补仓；旧2手约${goldAmount.toFixed(2)}元、单边费约${feeRatio(goldAmount).toFixed(2)}%，普通减仓不下单`, invalidCondition: "跌破1.500且外盘黄金反弹失败", predictionScore: 5, predictionLabel: "场内偏弱、外盘反弹", expectedDirection: "震荡", reason: "11月2日跌1.70%，隔夜黄金反弹逾2%。", riskLevel: "中" },
  "512710": { support: "0.576 / 跌破后复核", resistance: "0.597 / 0.608", action: "持有、不追涨；站稳0.597并回踩不破只进入复核，新买仍为0手", invalidCondition: "跌破0.576或相对强度消失", predictionScore: 6, predictionLabel: "随科创方向修复", expectedDirection: "震荡偏强", reason: "11月2日涨1.71%，科创50涨3.11%。", riskLevel: "中" },
  "161226": { support: "1.418 / 硬风险复核", resistance: "1.448 / 溢价压缩", action: `同日溢价约${silverPremium.toFixed(2)}%，升级硬风险；先核真实份额，若仍为旧2手则合并卖2手，参考${silverAmount.toFixed(2)}元/费约5元，不拆单`, invalidCondition: "恢复申购或最新同日溢价降至≤8%", predictionScore: 2, predictionLabel: "净值急跌且溢价失控", expectedDirection: "高波动偏弱", reason: "净值单日跌4.86%，场内跌2.11%，同日溢价超过8%。", riskLevel: "高" },
  "159608": { support: "0.788 / 跌破后复核", resistance: "0.814 / 0.820", action: "持有、不追涨；跌破0.788持续30分钟只做风险复核，普通碎片单不下", invalidCondition: "站稳0.814且金属板块延续", predictionScore: 5, predictionLabel: "反弹后等待确认", expectedDirection: "震荡", reason: "11月2日涨1.89%，但资源方向仍受外部波动影响。", riskLevel: "中" },
  "159241": { support: "0.919 / 跌破后复核", resistance: "0.962 / 0.980", action: "持有、不追涨；站稳0.962并回踩不破只进入复核，新买0手", invalidCondition: "跌破0.919或航天相对强度消失", predictionScore: 6, predictionLabel: "随成长风格修复", expectedDirection: "震荡偏强", reason: "11月2日涨2.24%，但仍需确认反弹持续性。", riskLevel: "中" },
  "562350": { support: "1.072 / 跌破后复核", resistance: "1.082 / 1.090", action: "持有、不加仓；横盘未给出新收益证据，普通碎片单不下", invalidCondition: "跌破1.072或政策预期转弱", predictionScore: 5, predictionLabel: "窄幅震荡", expectedDirection: "震荡", reason: "11月2日收平，日内波动有限。", riskLevel: "中" },
  "002090": { support: "7.76 / 股票观察", resistance: "8.02 / 8.20", action: "仅观察，不新增股票买卖指令；用于判断电网设备风险", invalidCondition: "跌破7.76或盈利质量恶化", predictionScore: 4, predictionLabel: "弱反弹未突破", expectedDirection: "震荡偏弱", reason: "11月2日涨0.89%，仍未站上日高8.02。", riskLevel: "中" }
};

for (const item of data.holdings) {
  const quote = quotes.get(item.code);
  Object.assign(item, holdingViews[item.code], {
    lastTradeDate: quote.dataDate,
    lastOpen: quote.open,
    lastClose: quote.close,
    lastHigh: quote.high,
    lastLow: quote.low,
    lastChangePercent: Number(Number(quote.changePercent).toFixed(2)),
    lastSource: `自有代理${quote.source}真实收盘与独立${quote.directVerification?.provider || quote.klineSource}日K交叉核对，2026-11-02；mode=closed`
  });
}

const watchViews = {
  "601208": { status: "跌深反弹，股票不买", reason: "11月2日涨1.28%，仍只作新材料基金风险信号。", buyTrigger: "股票不买；基金端需站稳34.00并通过费用门", avoidReason: "反弹未修复前期急跌，且可执行建议限定基金", risk: "跌破32.08", support: "32.08", resistance: "34.00", invalidCondition: "放量站稳34.00", predictionScore: 4, predictionLabel: "修复不足", expectedDirection: "震荡偏弱", riskLevel: "高" },
  "600050": { status: "通信相对稳，股票不买", reason: "11月2日涨约1.37%并收日高，只作通信/算力温度计。", buyTrigger: "股票不买；基金端需站稳4.45并通过费用门", avoidReason: "没有基金端资金与收益证据", risk: "跌破4.39", support: "4.39", resistance: "4.45", invalidCondition: "跌破4.39", predictionScore: 6, predictionLabel: "相对稳健", expectedDirection: "震荡偏强", riskLevel: "中" },
  "002466": { status: "锂矿反弹，股票不买", reason: "11月2日涨1.04%，只作稀有金属基金验证。", buyTrigger: "股票不买；站稳35.08后只复核基金", avoidReason: "反弹幅度不足且无费用后收益证据", risk: "跌破33.80", support: "33.80", resistance: "35.08", invalidCondition: "跌破33.80", predictionScore: 5, predictionLabel: "弱修复", expectedDirection: "震荡", riskLevel: "中" },
  "688981": { status: "随科创反弹，股票不买", reason: "11月2日涨3.32%，与科创50修复一致。", buyTrigger: "股票不买；站稳100.50后只复核半导体基金", avoidReason: "隔夜AI科技继续承压", risk: "跌破96.40", support: "96.40", resistance: "100.50", invalidCondition: "跌破96.40", predictionScore: 6, predictionLabel: "强反弹待确认", expectedDirection: "震荡偏强", riskLevel: "中" },
  "161725": { status: "白酒大涨，不追", reason: "11月2日涨3.56%；单日上涨不是可核验预期收益。", buyTrigger: "真实回踩0.564不破并站回0.591，且先有成交资金与费用后收益证据", avoidReason: `18手约${liquorAmount.toFixed(2)}元、往返最低费约10元；当前无资金来源和预期毛收益`, risk: "跌破0.564", support: "0.564", resistance: "0.591", invalidCondition: "跌破0.564或资金来源缺失", predictionScore: 6, predictionLabel: "强反弹但不追", expectedDirection: "震荡偏强", riskLevel: "中" },
  "005827": { status: "11月2日净值已披露，运行时接口失败", reason: "11月2日净值1.3817、日涨0.67%；仅作dated NAV。", buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据", avoidReason: "运行时/api/fund仍为501，不能伪装实时", risk: "净值披露滞后或接口失败", support: "按净值披露", resistance: "不设盘中价", invalidCondition: "运行时真实基金接口接通并通过校验", predictionScore: 5, predictionLabel: "净值小涨、接口失败", expectedDirection: "震荡", riskLevel: "中" }
};

for (const item of data.watchlist) {
  const view = watchViews[item.code];
  Object.assign(item, view);
  if (item.code === "005827") {
    Object.assign(item, { lastTradeDate: openFundRow.FSRQ, lastOpen: null, lastClose: Number(openFundRow.DWJZ), lastHigh: null, lastLow: null, lastChangePercent: Number(openFundRow.JZZZL), lastSource: "东方财富基金11月2日公开净值；自有运行时/api/fund HTTP 501，mode=failed" });
  } else {
    const quote = quotes.get(item.code);
    Object.assign(item, { lastTradeDate: quote.dataDate, lastOpen: quote.open, lastClose: quote.close, lastHigh: quote.high, lastLow: quote.low, lastChangePercent: Number(Number(quote.changePercent).toFixed(2)), lastSource: `自有代理${quote.source}真实收盘与独立${quote.directVerification?.provider || quote.klineSource}日K交叉核对，2026-11-02；mode=closed` });
  }
}

data.newsItems = [
  { title: "稳市工具扩容，回购增持再贷款利率降至1%", source: "中国证监会", publishTime: "2026-11-02 20:39:40+08:00", summary: "已确认事实：第三批证券、基金、保险公司互换便利申请额度超过1000亿元，回购增持再贷款转为长期制度安排、利率降至1%。基于事实的判断：流动性预期改善，但不直接构成追涨基金的收益证据。", relatedStocks: ["512710", "159241", "159740", "161725"], sector: "过去24小时 / 全市场重大利好 / 稳市政策", relation: "market", url: "https://www.csrc.gov.cn/csrc/c100028/c7668092/content.shtml" },
  { title: "A股普涨，科创50领涨3.11%", source: "自有三源行情 / 财经媒体收盘核验", publishTime: "2026-11-02 16:15:00+08:00", summary: "已确认事实：沪指+1.08%、深成指+1.63%、创业板+1.87%、科创50+3.11%，13个场内标的全部为11月2日真实收盘。基于事实的判断：风险偏好修复，但单日普涨之后不追。", relatedStocks: ["512710", "159241", "159608", "688981", "161725"], sector: "过去24小时 / 全市场重大利好 / A股反弹", relation: "market", url: "https://finance.eastmoney.com/a/202611023918684837.html" },
  { title: "隔夜美股AI继续承压，纳指跌1.1%", source: "AP", publishTime: "2026-11-03 05:29:25+08:00", summary: "已确认事实：美股早盘反弹消退，道指涨0.4%、纳指跌1.1%，AI与科技板块延续波动。基于事实的判断：港股科技和半导体基金今日不追高。", relatedStocks: ["159740", "005827", "688981"], sector: "过去24小时 / 全市场重大风险 / AI科技", relation: "risk", url: "https://apnews.com/article/048328e49e47ce7afe6c1fb9d9acf13d" },
  { title: "油价跌逾6%，黄金白银反弹", source: "Reuters / MarketScreener", publishTime: "2026-11-03 06:30:00+08:00", summary: "已确认事实：11月2日油价跌逾6%，现货黄金反弹逾2%、白银约涨3.7%。基于事实的判断：贵金属可能高波动修复，但不能消除161226场内溢价风险。", relatedStocks: ["164701", "161226"], sector: "过去24小时 / 全市场重大波动 / 贵金属 / 油价", relation: "market", url: "https://www.marketscreener.com/news/gold-rebounds-from-one-year-low-as-oil-slides-ahead-of-us-midterms-ce785fd8de8fff24" },
  { title: `161226同日溢价约${silverPremium.toFixed(2)}%，触发硬风险`, source: "东方财富基金 / 自有代理", publishTime: "2026-11-03 08:30:00+08:00", summary: `已确认事实：11月2日净值${silverNav.toFixed(4)}、场内收${silverQuote.close.toFixed(3)}，同日静态溢价约${silverPremium.toFixed(2)}%，申购暂停。基于事实的判断：先核真实份额，若仍持有则合并一笔退出，不拆小单。`, relatedStocks: ["161226"], sector: "持仓 / 白银LOF / 溢价硬风险", relation: "risk", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10" },
  { title: "005827净值小涨，运行时接口仍为501", source: "东方财富基金 / 自有代理", publishTime: "2026-11-03 08:30:00+08:00", summary: `已确认事实：11月2日净值${Number(openFundRow.DWJZ).toFixed(4)}、日涨${Number(openFundRow.JZZZL).toFixed(2)}%；自有/api/fund仍返回501。基于事实的判断：只保留dated NAV，不提供盘中K线，不新增。`, relatedStocks: ["005827"], sector: "持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" },
  { title: "港股科技与军工航天同步反弹", source: "自有代理 / 独立日K", publishTime: "2026-11-02 16:15:00+08:00", summary: "已确认事实：159740涨2.17%、512710涨1.71%、159241涨2.24%。基于事实的判断：已有仓观察，不追单日反弹，隔夜科技风险需继续验证。", relatedStocks: ["159740", "512710", "159241"], sector: "过去24小时 / 持仓关联 / 成长反弹", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ159740" },
  { title: "白酒基金上涨3.56%，但买入条件不成立", source: "自有代理 / 独立日K", publishTime: "2026-11-02 16:15:00+08:00", summary: `已确认事实：161725收${quotes.get("161725").close.toFixed(3)}、涨3.56%。基于事实的判断：18手虽约${liquorAmount.toFixed(2)}元，但没有真实资金来源和可核验费用后收益，不买。`, relatedStocks: ["161725"], sector: "过去24小时 / 观察池 / 白酒", relation: "market", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161725" },
  { title: "13个场内标的真实收盘全部通过日K核对", source: "自有代理 / 独立日K", publishTime: "2026-11-03 08:30:00+08:00", summary: "已确认事实：13/13报价日期均为11月2日，非零OHLC与独立日K末根一致；基金运行时端点保持HTTP 501失败态。基于事实的判断：11月2日值仅作最近真实收盘基线，不能冒充11月3日实时行情。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "数据校验 / 持仓 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710" }
];

data.reasoning = [
  { title: "161226溢价已越过硬风险线", basis: `同日场内${silverQuote.close.toFixed(3)}、净值${silverNav.toFixed(4)}，静态溢价约${silverPremium.toFixed(2)}%，申购暂停。`, inference: "溢价失控可能反向压缩，硬风险高于小额费用问题。", conclusion: "核实后合并退出真实剩余份额。", invalidCondition: "恢复申购或最新同日溢价≤8%。" },
  { title: "政策支持改善A股流动性预期", basis: "互换便利第三批申请超1000亿元，回购增持再贷款利率降至1%。", inference: "政策有利于稳市场，但不能替代基金价格与收益证据。", conclusion: "已有仓观察，新买0手。", invalidCondition: "真实价格、资金来源和费用后收益同时通过。" },
  { title: "海外AI风险仍在", basis: "隔夜纳指跌1.1%，科技与AI板块继续承压。", inference: "A股成长反弹的持续性仍需确认。", conclusion: "港股科技和半导体不追。", invalidCondition: "海外科技企稳且基金回踩后站稳日高。" },
  { title: "普通碎片单仍不经济", basis: "159740旧3手、164701旧2手均不足1000元且单边费用占比超0.5%。", inference: "普通调仓会被最低佣金显著侵蚀。", conclusion: "触价只复核，不下单。", invalidCondition: "出现明确硬风险。" },
  { title: "新买入缺少可执行闭环", basis: "没有已成交资金来源与可核验预期毛收益。", inference: "金额过门不代表收益空间过门。", conclusion: "所有新增买入0手。", invalidCondition: "资金、费率、毛收益与扣费后收益四项证据齐备。" }
];

data.invalidConditions = [
  "最新券商持仓与旧计划不一致：旧2手示例立即失效，按真实可卖份额重算；已无161226则卖0手。",
  "161226恢复申购或最新同日可核验溢价降至≤8%：取消硬风险退出，回到观察。",
  "161226硬风险仍成立：费用不得阻止退出，但同一标的必须尽量合并一笔，禁止拆单重复付最低佣金。",
  "159740/164701只有普通价格触发且订单仍<1000元或单边费率>0.5%：取消下单，只做风险复核。",
  "网页出现0价、11月2日旧时间戳却标实时、失败态或来源校验失败：取消基于网页价格的执行，只看券商真实行情。"
];

data.cancelPlan = [
  "9:15先查最新成交与持仓；161226已卖出或份额变化则不得重复旧2手。",
  "9:20复核161226申购状态与同日估值；溢价≤8%即取消硬退出。",
  "竞价或开盘一分钟的瞬时跳空不直接成交；先用券商真实价格确认，再一次性处理。",
  "卖出没有真实成交前，不把资金写入任何买入计划；即使成交，也先留现金。",
  "真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
];

data.learningFramework = [
  { title: "报价与日K必须同日核对", basis: "13个场内标的11月2日OHLC全部与独立日K末根一致。", inference: "只有日期与OHLC校验通过的数据才能进入报告。", conclusion: "以11月2日收盘作11月3日盘前基线。", invalidCondition: "11月3日真实行情到达。" },
  { title: "LOF溢价必须同日", basis: `161226的11月2日场内${silverQuote.close.toFixed(3)}和净值${silverNav.toFixed(4)}同日可比。`, inference: "同日溢价约8.62%才可用于硬风险判断。", conclusion: "越过8%后先核份额再退出。", invalidCondition: "最新同日溢价≤8%或申购恢复。" },
  { title: "硬风险与普通费用门分开", basis: "161226触发硬风险；159740和164701只是普通小额调仓。", inference: "硬风险可越过经济金额门槛，普通碎片单不能借用例外。", conclusion: "只处理161226。", invalidCondition: "其他标的也出现明确硬风险。" },
  { title: "政策利好不自动产生买单", basis: "A股普涨且稳市工具扩容，但隔夜AI科技仍跌。", inference: "需要价格确认、资金来源和费用后收益同时成立。", conclusion: "新买0手。", invalidCondition: "四项条件同时满足。" },
  { title: "股票只作板块温度计", basis: "中芯国际、东材科技等反弹，但用户可执行建议限定基金。", inference: "个股信号用于验证基金方向，不生成股票订单。", conclusion: "观察池股票不买。", invalidCondition: "无。" }
];

data.nextWatch = [
  "9:15：核对161226真实持仓、可卖份额与券商实际费率；已无持仓则卖0手。",
  "9:20：核查161226申购状态和最新同日估值；溢价≤8%则取消退出。",
  "9:30后：硬风险仍成立才合并一笔退出；若仍为旧2手，参考卖2手，不拆单。",
  "10:00：看159740的0.462、164701的1.500；跌破只复核，普通碎片单不下。",
  "全天：关注稳市政策落地、海外AI科技、油价与贵金属波动；其余基金不追。",
  "15:00后：记录11月3日真实收盘与基金净值，重算溢价和费用闸门。"
];

data.quoteWatchlist = data.watchlist.map((item) => ({ name: item.name, code: item.code, symbol: item.symbol, market: item.market, type: item.type, sector: item.sector, support: item.support, resistance: item.resistance }));
data.sources = [
  { name: "本次运行：13个场内标的收盘与日K核验", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710", note: "2026-11-03 08:30：13/13返回非零11月2日真实收盘，状态closed；报价与独立日K末根日期、开高低收一致。" },
  { name: "自有代理基金端点失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "2026-11-03运行时SZ161226与OF005827均返回HTTP 501；页面显示失败态，开放式基金不提供盘中K线。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月2日单位净值${silverNav.toFixed(4)}、日跌${Math.abs(Number(silverNavRow.JZZZL)).toFixed(2)}%、暂停申购；相对同日场内收盘${silverQuote.close.toFixed(3)}的静态溢价约${silverPremium.toFixed(2)}%。` },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月2日单位净值${Number(openFundRow.DWJZ).toFixed(4)}、日涨${Number(openFundRow.JZZZL).toFixed(2)}%；运行时接口仍失败。` },
  { name: "三源交叉核验：11月2日A股指数", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ399006", note: "Sina/Tencent/Eastmoney至少两源核对：沪指+1.08%、深成指+1.63%、创业板+1.87%、科创50+3.11%。" },
  { name: "中国证监会：稳市场稳预期答记者问", url: "https://www.csrc.gov.cn/csrc/c100028/c7668092/content.shtml", note: "第三批互换便利申请额度超1000亿元；回购增持再贷款转长期制度安排，利率降至1%。" },
  { name: "AP：11月2日美股科技与AI", url: "https://apnews.com/article/048328e49e47ce7afe6c1fb9d9acf13d", note: "美股早盘反弹消退，道指+0.4%、纳指-1.1%，AI与科技板块继续承压。" },
  { name: "Reuters / MarketScreener：油价与贵金属", url: "https://www.marketscreener.com/news/gold-rebounds-from-one-year-low-as-oil-slides-ahead-of-us-midterms-ce785fd8de8fff24", note: "11月2日油价跌逾6%，黄金反弹逾2%、白银约涨3.7%。" },
  { name: "东方财富：11月2日A股收盘结构", url: "https://finance.eastmoney.com/a/202611023918684837.html", note: "A股主要指数普涨，科创50领涨3.11%，传媒、券商、白酒等方向活跃。" }
];

fs.writeFileSync(reportPath, `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  quoteTieOut: snapshot.quotes.filter((item) => item.tieOut).length,
  silverPremium: Number(silverPremium.toFixed(2)),
  silverHardRisk: true,
  runtimeFunds: snapshot.runtimeFunds.map((item) => `${item.symbol}:${item.status}`)
}, null, 2));
