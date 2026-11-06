const fs = require("fs");
const vm = require("vm");

// Reuse the stable report schema initializer, then replace every dated market/content field.
require("./finalize-report-20261105.js");

const reportPath = "report-data.js";
const snapshot = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261106.json", "utf8"));
const indexSnapshot = JSON.parse(fs.readFileSync("scripts/index-snapshot-20261106.json", "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(reportPath, "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;
const quotes = new Map(snapshot.quotes.map((item) => [item.symbol.slice(2), item]));
const funds = new Map(snapshot.funds.map((item) => [item.code, item.body?.Data?.LSJZList?.[0] || null]));

if (snapshot.quotes.length !== 13 || snapshot.quotes.some((item) => !item.tieOut || item.dataDate !== "2026-11-05")) {
  throw new Error("13-symbol 2026-11-05 quote/K-line tie-out is required");
}
if (snapshot.runtimeFunds.some((item) => item.status !== 0 || item.body?.ok !== false || item.body?.mode !== "failed")) {
  throw new Error("runtime fund endpoints must preserve the observed failed state");
}
for (const row of indexSnapshot.rows) {
  const successful = row.providers.filter((provider) => provider.ok && provider.quote?.time?.startsWith("2026-11-05"));
  if (successful.length < 2) throw new Error(`${row.symbol} lacks two-provider index verification`);
}

const silverNavRow = funds.get("161226");
const openFundRow = funds.get("005827");
const silverQuote = quotes.get("161226");
if (silverNavRow?.FSRQ !== "2026-11-05" || openFundRow?.FSRQ !== "2026-11-05") {
  throw new Error("same-date 2026-11-05 fund NAVs are required");
}
const silverNav = Number(silverNavRow.DWJZ);
const silverPremium = (silverQuote.close / silverNav - 1) * 100;
if (silverPremium <= 8) throw new Error("161226 premium must remain above the 8% hard-risk line");
const amount = (code, lots) => Number((quotes.get(code).close * lots * 100).toFixed(2));
const feeRatio = (value, fee = 5) => Number((fee / value * 100).toFixed(2));
const hkAmount = amount("159740", 3);
const goldAmount = amount("164701", 2);
const silverAmount = amount("161226", 2);
const liquorLots = Math.ceil(1000 / (quotes.get("161725").close * 100));
const liquorAmount = amount("161725", liquorLots);
const indexChange = (symbol) => Number(indexSnapshot.rows.find((row) => row.symbol === symbol).providers.find((provider) => provider.ok).quote.changePercent.toFixed(2));

data.date = "2026-11-06";
data.portfolioVersion = "portfolio-2026-11-06-premarket-fee-aware-v1";
data.time = "2026-11-06 08:36北京时点核验：13个场内持仓/观察标的均为11月5日真实收盘，逐只与日K末根日期和OHLC一致；两只基金均已披露11月5日净值。自有代理本次连接超时，页面运行时须显示行情获取失败，不把11月5日收盘写成实时行情。";
data.lastUpdated = "2026-11-06 08:36 北京时间（场内为11月5日真实收盘；基金为11月5日公开净值；自有代理连接超时）";
data.logicUpdatedAt = "2026-11-06盘前（最新券商持仓、可卖份额与实际费率仍待核对）";
data.transactionCostPolicy = {
  profile: "low_principal", assumptionStatus: "待用户用券商佣金表或交割单确认", commissionRate: 0.00025,
  minimumCommissionCny: 5, minimumEconomicOrderCny: 1000, maxOneWayCostRatio: 0.005,
  maxRoundTripCostRatio: 0.01, minimumNetEdgeRatio: 0.01, feeCoverageMultiple: 3, lotSize: 100,
  hardRiskExitRule: "基本面失效、LOF溢价失控或明确硬性风控时，费用不阻止退出；同一标的尽量一次完成，避免重复支付最低佣金。",
  candidateOrders: [
    { code: "161226", label: "溢价仍高于8%的合并退出复核", side: "sell", lots: 2, referencePrice: silverQuote.close, hardRiskExit: true },
    { code: "159740", label: "旧3手普通减仓复核", side: "sell", lots: 3, referencePrice: quotes.get("159740").close, hardRiskExit: false },
    { code: "164701", label: "旧2手普通减仓复核", side: "sell", lots: 2, referencePrice: quotes.get("164701").close, hardRiskExit: false },
    { code: "161725", label: `${liquorLots}手最低经济金额买入复核`, side: "buy", lots: liquorLots, referencePrice: quotes.get("161725").close, hardRiskExit: false }
  ]
};

data.oneLine = `结论：11月6日先处理161226溢价硬风险，其他基金买0手、卖0手。11月5日场内收${silverQuote.close.toFixed(3)}、净值${silverNav.toFixed(4)}，同日静态溢价约${silverPremium.toFixed(2)}%，仍高于8%；若券商确认旧2手仍在且开盘溢价仍≥8%，合并卖2手，参考成交额${silverAmount.toFixed(2)}元、单边费约5元/${feeRatio(silverAmount).toFixed(2)}%，费用闸门为“风险退出例外”。隔夜美股AI急跌，科技基金不接飞刀。仅供个人复盘参考。`;
data.tradeDecision = [
  { type: "第一屏结论", title: "161226硬退出仍有效；其余0手", conclusion: `已确认事实：11月5日161226场内收${silverQuote.close.toFixed(3)}、单位净值${silverNav.toFixed(4)}，同日静态溢价约${silverPremium.toFixed(2)}%，仍高于8%硬风险线。`, action: `9:15先核对券商真实持仓。旧2手仍在且开盘溢价仍≥8%才合并卖2手，不拆单；参考额${silverAmount.toFixed(2)}元，单边费约5元/${feeRatio(silverAmount).toFixed(2)}%。扣费后收益空间不作为硬退出条件；成交资金留现金。`, trigger: "实际仍持有且用最新可核验净值口径计算的开盘溢价≥8%；若≤8%或无持仓，卖0手。", reason: "费用闸门结论为风险退出例外；手续费不能阻止明确LOF溢价风险，但真实份额与券商费率仍须确认。仅供个人复盘参考。" },
  { type: "外部市场", title: "隔夜AI急跌，科技基金不接飞刀", conclusion: "已确认事实：11月5日美股S&P 500跌4.4%、道指跌3.4%、纳指跌5.5%；英伟达跌9.3%、AMD跌17.3%。布油反弹3.9%至98.29美元，10年期美债收益率降至4.84%。", action: "159740、512710及半导体相关观察均不追开盘；先看真实价格能否守住11月5日低点。", trigger: "只有基金真实价格止跌、重新站上11月5日高点，且资金与费用后收益证据齐备，才进入复核；否则买0手。", reason: "海外AI估值与融资成本风险重新定价，长端利率回落不足以抵消股价冲击。仅供个人复盘参考。" },
  { type: "市场总览", title: "A股普涨但冲高回落，等待承接", conclusion: `已确认事实：11月5日沪指+${indexChange("SH000001").toFixed(2)}%、深成指+${indexChange("SZ399001").toFixed(2)}%、创业板+${indexChange("SZ399006").toFixed(2)}%、科创50+${indexChange("SH000688").toFixed(2)}%；三市成交约2.14万亿元，近4900只上涨。`, action: "A股广度改善只作正面背景；除161226硬风险退出外，基金买0手、卖0手。", trigger: "盘中回踩守住11月5日低点并重新站上高点，同时有真实卖出资金、毛收益覆盖往返费用3倍且扣费后收益≥1%，才复核。", reason: "指数盘中冲高回落，隔夜AI风险又显著放大，单日普涨不构成买入证据。仅供个人复盘参考。" },
  { type: "费用闸门", title: "161226例外；普通碎片单继续暂停", conclusion: `161226旧2手约${silverAmount.toFixed(2)}元/单边费${feeRatio(silverAmount).toFixed(2)}%，因溢价>${8}%进入硬风险例外；159740旧3手约${hkAmount.toFixed(2)}元/${feeRatio(hkAmount).toFixed(2)}%，164701旧2手约${goldAmount.toFixed(2)}元/${feeRatio(goldAmount).toFixed(2)}%，均未达1000元且单边费率超0.5%。`, action: "161226只按真实剩余份额一次合并；159740、164701普通小单不下。", trigger: "普通小单只有出现基本面失效、流动性异常或新的明确硬风控才越过金额门。", reason: "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。" },
  { type: "新买入", title: "金额过门仍不买，新增买入0手", conclusion: `161725按${liquorLots}手约${liquorAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${feeRatio(liquorAmount, 10).toFixed(2)}%。`, action: "不买。161226若成交，资金继续留现金；其余无已成交资金来源。", trigger: `未来需有真实资金，预期毛收益至少覆盖往返费3倍（约${feeRatio(liquorAmount, 30).toFixed(2)}%），且扣费后预期收益≥1%，再评估。`, reason: "目前缺少可核验预期毛收益，费用闸门结论为缺少收益空间。仅供个人复盘参考。" }
];

data.executionOrder = [
  "1. 9:15核对券商最新成交、161226实际持仓与可卖份额；不存在的旧2手不得生成订单。",
  `2. 9:20用11月5日净值1.4204和券商真实开盘价重算溢价；最近同日静态溢价约${silverPremium.toFixed(2)}%。`,
  `3. 若旧2手仍在且溢价仍≥8%，合并卖2手；参考额${silverAmount.toFixed(2)}元、单边费约5元/${feeRatio(silverAmount).toFixed(2)}%，风险退出例外。`,
  "4. 若溢价≤8%、实际无持仓或券商数据无法核验，取消卖单，只做风险复核。",
  "5. 159740旧3手、164701旧2手继续暂停；普通费用门不通过。",
  "6. 隔夜AI急跌背景下，其他基金和观察池买0手；任何成交资金先留现金。",
  "7. 自有代理仍失败时只看券商真实行情；网页不画假线、不显示假价。"
];
data.tradePlan = [
  { title: "161226硬风险仍成立", basis: `11月5日场内${silverQuote.close.toFixed(3)}、净值${silverNav.toFixed(4)}，同日溢价约${silverPremium.toFixed(2)}%。`, inference: "溢价仍高于8%，回落风险高于最低佣金损耗。", conclusion: "实际仍有旧2手则一次合并退出。", invalidCondition: "无持仓或开盘溢价≤8%。" },
  { title: "隔夜AI急跌压过A股普涨", basis: "纳指跌5.5%、英伟达跌9.3%，A股前一日虽普涨但盘中冲高回落。", inference: "科技链开盘波动与下行风险上升。", conclusion: "科技相关基金不追、不接飞刀。", invalidCondition: "真实价格止跌并重新站上11月5日高点，且费用门通过。" },
  { title: "普通碎片单仍不经济", basis: `159740旧3手约${hkAmount.toFixed(2)}元，164701旧2手约${goldAmount.toFixed(2)}元。`, inference: "单边费用占比显著高于0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现基本面失效或明确硬风控。" },
  { title: "政策支持不能替代执行证据", basis: "金融工作报告与证监会措施继续强调稳市和增量工具。", inference: "政策改善中期预期，但不保证单只基金短线收益。", conclusion: "新增买入0手。", invalidCondition: "资金、费率、毛收益与扣费后收益证据齐备。" }
];
data.noTradeList = ["不把11月5日收盘写成11月6日实时行情；盘前只作最近真实基线。", "不在未核对券商持仓时机械卖161226。", "不把161226硬风险退出拆单。", "不执行159740旧3手或164701旧2手普通碎片卖单。", "不在隔夜AI急跌后接飞刀；所有新增买入0手。", "不买股票观察池；股票只作基金板块温度计。", "不自动下单；所有建议仅供个人复盘参考。"];

const holdingViews = {
  "159740": { support: "0.487 / 跌破后复核", resistance: "0.512 / 0.520", action: `持有、不追涨；旧3手约${hkAmount.toFixed(2)}元、单边费约${feeRatio(hkAmount).toFixed(2)}%，普通减仓不下单`, invalidCondition: "跌破0.487且隔夜科技风险继续扩散", predictionScore: 3, predictionLabel: "外盘AI急跌压制", expectedDirection: "震荡偏弱", reason: "11月5日涨5.38%，但隔夜纳指与AI龙头急跌，次日高开承接风险大。", riskLevel: "高" },
  "164701": { support: "1.570 / 跌破后复核", resistance: "1.620 / 1.650", action: `持有、不追涨；旧2手约${goldAmount.toFixed(2)}元、单边费约${feeRatio(goldAmount).toFixed(2)}%，普通减仓不下单`, invalidCondition: "跌破1.570且贵金属转弱", predictionScore: 6, predictionLabel: "强势后震荡", expectedDirection: "震荡偏强", reason: "11月5日涨2.40%，贵金属板块强；但油价反弹提高宏观不确定性。", riskLevel: "中" },
  "512710": { support: "0.606 / 跌破后复核", resistance: "0.629 / 0.635", action: "持有、不追涨；跌破0.606只进入复核，新买0手", invalidCondition: "跌破0.606且风险偏好转弱", predictionScore: 5, predictionLabel: "冲高后待承接", expectedDirection: "震荡", reason: "11月5日涨1.14%但未收日高，隔夜风险偏好急降。", riskLevel: "中高" },
  "161226": { support: "1.514 / 硬风险复核", resistance: "1.590 / 溢价复核", action: `同日溢价约${silverPremium.toFixed(2)}%，仍高于8%；实际旧2手仍在则一次合并退出，参考额${silverAmount.toFixed(2)}元/费约5元`, invalidCondition: "实际无持仓或开盘溢价≤8%", predictionScore: 3, predictionLabel: "溢价仍失控", expectedDirection: "高波动偏弱", reason: `净值涨${Number(silverNavRow.JZZZL).toFixed(2)}%、场内涨4.38%，同日溢价仍约${silverPremium.toFixed(2)}%。`, riskLevel: "高" },
  "159608": { support: "0.836 / 跌破后复核", resistance: "0.879 / 0.890", action: "持有、不追涨；回踩0.836不破只进入复核，新买0手", invalidCondition: "跌破0.836或能源金属转弱", predictionScore: 5, predictionLabel: "强势后分化", expectedDirection: "震荡", reason: "11月5日涨2.25%，但隔夜风险资产急跌，先看承接。", riskLevel: "中高" },
  "159241": { support: "0.973 / 跌破后复核", resistance: "1.014 / 1.020", action: "持有、不追涨；站稳1.014只进入复核，新买0手", invalidCondition: "跌破0.973或军工链转弱", predictionScore: 5, predictionLabel: "反弹待确认", expectedDirection: "震荡", reason: "11月5日涨1.42%但盘中振幅较大。", riskLevel: "中" },
  "562350": { support: "1.074 / 跌破后复核", resistance: "1.088 / 1.100", action: "持有、不加仓；普通碎片单不下", invalidCondition: "跌破1.074或政策预期转弱", predictionScore: 5, predictionLabel: "低波动修复", expectedDirection: "震荡", reason: "11月5日涨0.55%并收日高，仍需量能确认。", riskLevel: "中" },
  "002090": { support: "8.11 / 股票观察", resistance: "8.40 / 8.50", action: "仅观察，不新增股票买卖指令；用于判断电网设备风险", invalidCondition: "跌破8.11", predictionScore: 6, predictionLabel: "板块强势验证", expectedDirection: "震荡偏强", reason: "11月5日涨1.84%，电力设备保持活跃。", riskLevel: "中" }
};
for (const item of data.holdings) {
  const q = quotes.get(item.code);
  Object.assign(item, holdingViews[item.code], { lastTradeDate: q.dataDate, lastOpen: q.open, lastClose: q.close, lastHigh: q.high, lastLow: q.low, lastChangePercent: Number(q.changePercent.toFixed(2)), lastSource: `本次采集${q.source}真实收盘与${q.directVerification.provider}日K逐项核对，2026-11-05；mode=closed；自有代理连接超时` });
}

const watchViews = {
  "601208": { status: "高位续涨，股票不买", reason: "11月5日涨4.74%、振幅大，仅作材料与科技温度计。", buyTrigger: "股票不买；基金端需守住32.34并通过费用门", avoidReason: "高位波动且可执行建议限定基金", risk: "跌破32.34", support: "32.34", resistance: "36.08", invalidCondition: "跌破32.34", predictionScore: 5, predictionLabel: "高位分化", expectedDirection: "震荡", riskLevel: "高" },
  "600050": { status: "继续弱于大盘，股票不买", reason: "11月5日跌1.12%，与市场普涨背离。", buyTrigger: "股票不买；基金端需站回4.46并通过费用门", avoidReason: "相对强度弱且无基金端资金证据", risk: "跌破4.40", support: "4.40", resistance: "4.46", invalidCondition: "放量站稳4.46", predictionScore: 3, predictionLabel: "相对弱势", expectedDirection: "震荡偏弱", riskLevel: "中高" },
  "002466": { status: "能源金属大涨，股票不买", reason: "11月5日涨5.03%，只作159608方向验证。", buyTrigger: "股票不买；基金端需守住36.20并通过费用门", avoidReason: "单日急涨且无费用后收益证据", risk: "跌破36.20", support: "36.20", resistance: "39.00", invalidCondition: "跌破36.20", predictionScore: 5, predictionLabel: "急涨后分化", expectedDirection: "震荡", riskLevel: "高" },
  "688981": { status: "逆势回落且隔夜AI急跌，股票不买", reason: "11月5日跌0.55%，弱于科创50；隔夜英伟达跌9.3%。", buyTrigger: "股票不买；基金端先看107.60能否守住", avoidReason: "外盘AI重估且无资金与收益证据", risk: "跌破107.60", support: "107.60", resistance: "113.84", invalidCondition: "跌破107.60", predictionScore: 2, predictionLabel: "外盘冲击高", expectedDirection: "偏弱", riskLevel: "高" },
  "161725": { status: "白酒小幅修复，不买", reason: "11月5日涨1.55%，金额过门仍缺收益证据。", buyTrigger: "守住0.576并站稳0.590，且先有成交资金与费用后收益证据", avoidReason: `${liquorLots}手约${liquorAmount.toFixed(2)}元、往返最低费约10元；无资金来源和预期毛收益`, risk: "跌破0.576", support: "0.576", resistance: "0.590", invalidCondition: "跌破0.576或资金来源缺失", predictionScore: 5, predictionLabel: "弱修复", expectedDirection: "震荡", riskLevel: "中" },
  "005827": { status: "11月5日净值已披露，运行时代理失败", reason: `11月5日净值${Number(openFundRow.DWJZ).toFixed(4)}、日涨${Number(openFundRow.JZZZL).toFixed(2)}%；仅作dated NAV。`, buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据", avoidReason: "自有代理连接超时，不能伪装实时", risk: "净值披露滞后或接口失败", support: "按净值披露", resistance: "不设盘中价", invalidCondition: "运行时真实基金接口接通并通过校验", predictionScore: 5, predictionLabel: "净值修复、接口失败", expectedDirection: "震荡", riskLevel: "中" }
};
for (const item of data.watchlist) {
  Object.assign(item, watchViews[item.code]);
  if (item.code === "005827") Object.assign(item, { lastTradeDate: openFundRow.FSRQ, lastOpen: null, lastClose: Number(openFundRow.DWJZ), lastHigh: null, lastLow: null, lastChangePercent: Number(openFundRow.JZZZL), lastSource: "东方财富基金11月5日公开净值；自有运行时代理连接超时，mode=failed" });
  else { const q = quotes.get(item.code); Object.assign(item, { lastTradeDate: q.dataDate, lastOpen: q.open, lastClose: q.close, lastHigh: q.high, lastLow: q.low, lastChangePercent: Number(q.changePercent.toFixed(2)), lastSource: `本次采集${q.source}真实收盘与${q.directVerification.provider}日K逐项核对，2026-11-05；mode=closed；自有代理连接超时` }); }
}

data.newsItems = [
  { title: "美股AI抛售加剧，纳指跌5.5%", source: "AP", publishTime: "2026-11-06 07:00:00+08:00", summary: "已确认事实：S&P 500跌4.4%、道指跌3.4%、纳指跌5.5%；英伟达跌9.3%、AMD跌17.3%。基于事实的判断：科技基金开盘下行风险显著上升，不接飞刀。", relatedStocks: ["159740", "512710", "688981"], sector: "过去24小时 / 全市场重大风险 / 海外AI", relation: "risk", url: "https://apnews.com/article/stocks-markets-ai-midterm-oil-trump-7ee9c212805aa5e70cf34d25aab7a36e" },
  { title: "A股近4900只上涨，但指数冲高回落", source: "东方财富Choice / 澎湃新闻 / 三源行情", publishTime: "2026-11-05 15:27:00+08:00", summary: "已确认事实：沪指+0.10%、深成指+1.19%、创业板+0.87%、科创50+1.68%，三市成交约2.14万亿元；光伏、贵金属、能源金属领涨。基于事实的判断：广度改善但尾盘承接仍需验证。", relatedStocks: ["164701", "159608", "512710"], sector: "过去24小时 / 全市场重大利好与分化 / A股", relation: "market", url: "https://fund.eastmoney.com/a/202611053923465485.html" },
  { title: "金融工作报告强调巩固稳市机制", source: "全国人大信息 / 东方财富Choice", publishTime: "2026-11-05 15:00:00+08:00", summary: "已确认事实：11月5日发布的金融工作情况报告提出支持中央汇金发挥类平准基金作用、巩固完善资本市场稳市机制。基于事实的判断：政策托底改善中期预期，但不替代当日价格和费用证据。", relatedStocks: ["512710", "159241", "562350"], sector: "过去24小时 / 全市场重大利好 / 稳市政策", relation: "market", url: "https://fund.eastmoney.com/a/202611053923465485.html" },
  { title: `161226同日溢价仍约${silverPremium.toFixed(2)}%`, source: "东方财富基金 / 三源行情", publishTime: "2026-11-06 08:36:00+08:00", summary: `已确认事实：11月5日净值${silverNav.toFixed(4)}、场内收${silverQuote.close.toFixed(3)}，同日静态溢价约${silverPremium.toFixed(2)}%，仍高于8%。基于事实的判断：实际旧2手仍在且开盘溢价未回落才一次合并退出。`, relatedStocks: ["161226"], sector: "持仓 / 白银LOF / 溢价风险", relation: "risk", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10" },
  { title: "005827净值涨1.11%，运行时代理连接超时", source: "东方财富基金 / 自有代理", publishTime: "2026-11-06 08:36:00+08:00", summary: `已确认事实：11月5日净值${Number(openFundRow.DWJZ).toFixed(4)}、日涨${Number(openFundRow.JZZZL).toFixed(2)}%；本次自有代理连接超时。基于事实的判断：只保留dated NAV，不提供盘中K线。`, relatedStocks: ["005827"], sector: "持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" },
  { title: "能源金属和贵金属延续强势，科技内部背离", source: "三源行情 / 独立日K", publishTime: "2026-11-05 16:15:00+08:00", summary: "已确认事实：159740涨5.38%、164701涨2.40%、159608涨2.25%，但688981跌0.55%、600050跌1.12%。基于事实的判断：A股内部已分化，隔夜AI急跌后不追强势基金。", relatedStocks: ["159740", "164701", "159608", "688981"], sector: "过去24小时 / 持仓关联 / 板块分化", relation: "holding", url: "https://finance.sina.com.cn/jjxw/2026-11-05/doc-inixsmiu5599974.shtml" },
  { title: "中芯国际弱于科创50，通信继续背离", source: "三源行情 / 独立日K", publishTime: "2026-11-05 16:15:00+08:00", summary: "已确认事实：科创50涨1.68%，但688981跌0.55%、600050跌1.12%；601208涨4.74%。基于事实的判断：科技内部强弱分化明显，股票只作基金温度计，不生成股票订单。", relatedStocks: ["688981", "600050", "601208", "512710"], sector: "过去24小时 / 观察池 / 科技分化", relation: "market", url: "https://fund.eastmoney.com/a/202611053923465485.html" },
  { title: "布油反弹、长端利率下行，宏观信号相互冲突", source: "AP", publishTime: "2026-11-06 07:00:00+08:00", summary: "已确认事实：布油涨3.9%至98.29美元，10年期美债收益率降至4.84%。基于事实的判断：能源与避险交易并存，不能据此追买贵金属或资源基金。", relatedStocks: ["164701", "161226", "159608"], sector: "过去24小时 / 全市场重大风险 / 油价与利率", relation: "risk", url: "https://apnews.com/article/stocks-markets-ai-midterm-oil-trump-7ee9c212805aa5e70cf34d25aab7a36e" },
  { title: "13个场内标的真实收盘全部通过日K核对", source: "新浪 / 腾讯 / 东方财富", publishTime: "2026-11-06 08:36:00+08:00", summary: "已确认事实：13/13报价日期均为11月5日，三源非零OHLC与各自日K末根一致；自有代理连接超时。基于事实的判断：11月5日值只作最近真实收盘基线，不能冒充11月6日实时行情。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "数据校验 / 持仓 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710" }
];
data.reasoning = [
  { title: "161226硬退出仍成立", basis: `同日场内${silverQuote.close.toFixed(3)}、净值${silverNav.toFixed(4)}，溢价约${silverPremium.toFixed(2)}%。`, inference: "超过8%后，溢价回落风险高于最低佣金损耗。", conclusion: "实际旧2手仍在则一次合并退出。", invalidCondition: "无持仓或开盘溢价≤8%。" },
  { title: "隔夜AI急跌改变短线风险", basis: "纳指跌5.5%，英伟达跌9.3%，AMD跌17.3%。", inference: "A股科技基金面临外盘估值与风险偏好双重冲击。", conclusion: "不接飞刀，新增0手。", invalidCondition: "真实价格止跌回升且费用门通过。" },
  { title: "普通碎片单仍不经济", basis: "159740旧3手、164701旧2手均不足1000元且单边费用占比超0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "触价只复核。", invalidCondition: "出现明确硬风险。" },
  { title: "政策托底不是买单", basis: "稳市机制与增量工具方向已确认。", inference: "政策只能改善背景，不能证明单只基金的费用后收益。", conclusion: "所有新增买入0手。", invalidCondition: "资金、费率、毛收益与扣费后收益证据齐备。" }
];
data.invalidConditions = ["161226实际无持仓，或开盘价对应溢价≤8%：取消卖出。", "最新券商持仓与旧计划不一致：旧手数示例立即失效，按真实可卖份额一次合并重算。", "159740/164701订单仍<1000元或单边费率>0.5%：普通调仓只复核。", "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。", "网页出现0价、11月5日旧时间戳却标实时、来源失败或代理超时：取消基于网页价格的执行。"];
data.cancelPlan = ["9:15先查最新成交与持仓；不存在的161226份额不得生成卖单。", "9:20用最新可核验净值和券商真实价重算161226溢价；≤8%则取消硬退出。", "开盘一分钟瞬时跳空不直接成交，先确认真实价格。", "卖出未真实成交前不写入买入资金；成交后也先留现金。", "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"];
data.learningFramework = [
  { title: "报价与日K必须同日核对", basis: "13个场内标的11月5日OHLC全部与日K末根一致。", inference: "只有日期和OHLC校验通过的数据才能进入报告。", conclusion: "以11月5日收盘作11月6日盘前基线。", invalidCondition: "11月6日真实行情到达。" },
  { title: "LOF硬风险按同日溢价重算", basis: `161226同日场内${silverQuote.close.toFixed(3)}和净值${silverNav.toFixed(4)}，溢价约${silverPremium.toFixed(2)}%。`, inference: "仍超过8%，硬风险例外继续。", conclusion: "按真实剩余份额一次退出。", invalidCondition: "开盘溢价≤8%或无持仓。" },
  { title: "费用门不阻止硬风险", basis: `旧2手参考额${silverAmount.toFixed(2)}元、单边费占比约${feeRatio(silverAmount).toFixed(2)}%。`, inference: "普通调仓不经济，但明确溢价风险可越过金额门。", conclusion: "一次合并，不拆单。", invalidCondition: "硬风险失效。" },
  { title: "海外冲击先于追涨", basis: "A股普涨后隔夜美股AI板块急跌。", inference: "次日先验证承接，不根据昨日涨幅追买。", conclusion: "新增买入0手。", invalidCondition: "止跌、资金与费用后收益同时成立。" },
  { title: "股票只作板块温度计", basis: "601208与002466上涨，但600050、688981相对偏弱。", inference: "个股信号用于验证基金方向，不生成股票订单。", conclusion: "观察池股票不买。", invalidCondition: "无。" }
];
data.nextWatch = ["9:15：核对最新成交、161226实际持仓和可卖份额。", "9:20：用11月5日净值1.4204和券商真实价重算溢价；≥8%且仍有旧2手才一次卖2手。", "9:30后：若161226开盘溢价≤8%，取消卖出。", "10:00：看159740的0.487、512710的0.606、688981的107.60能否守住；跌破只复核。", "全天：关注美股AI抛售传导、布油反弹和美债收益率；其余基金不追。", "15:00后：记录11月6日真实收盘与基金净值，重算溢价和费用闸门。"];
data.quoteWatchlist = data.watchlist.map((item) => ({ name: item.name, code: item.code, symbol: item.symbol, market: item.market, type: item.type, sector: item.sector, support: item.support, resistance: item.resistance }));
data.sources = [
  { name: "本次运行：13个场内标的三源收盘与日K核验", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710", note: "2026-11-06 08:36：因自有代理连接超时，改用新浪、腾讯、东方财富直接交叉核对；13/13为非零11月5日真实收盘，报价与日K日期/OHLC一致。" },
  { name: "自有代理连接超时失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "2026-11-06运行时SZ161226与OF005827均连接超时，mode=failed；页面不得伪装实时，开放式基金不提供盘中K线。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月5日单位净值${silverNav.toFixed(4)}、日涨${Number(silverNavRow.JZZZL).toFixed(2)}%、暂停申购；相对同日场内收盘${silverQuote.close.toFixed(3)}的静态溢价约${silverPremium.toFixed(2)}%。` },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月5日单位净值${Number(openFundRow.DWJZ).toFixed(4)}、日涨${Number(openFundRow.JZZZL).toFixed(2)}%；仅作dated NAV。` },
  { name: "三源交叉核验：11月5日A股指数", url: "https://fund.eastmoney.com/a/202611053923465485.html", note: `至少两源核对：沪指+${indexChange("SH000001").toFixed(2)}%、深成指+${indexChange("SZ399001").toFixed(2)}%、创业板+${indexChange("SZ399006").toFixed(2)}%、科创50+${indexChange("SH000688").toFixed(2)}%。` },
  { name: "东方财富Choice：11月5日A股收盘", url: "https://fund.eastmoney.com/a/202611053923465485.html", note: "三市成交约2.14万亿元，近4900只上涨，光伏、贵金属、能源金属领涨；金融工作报告强调巩固稳市机制。" },
  { name: "AP：11月5日美股AI抛售", url: "https://apnews.com/article/stocks-markets-ai-midterm-oil-trump-7ee9c212805aa5e70cf34d25aab7a36e", note: "S&P 500-4.4%、道指-3.4%、纳指-5.5%；英伟达-9.3%、AMD-17.3%；布油+3.9%至98.29美元，10年期美债收益率降至4.84%。" },
  { name: "证监会：稳市场稳预期与ETF工具", url: "https://www.csrc.gov.cn/csrc/c100028/c7668092/content.shtml", note: "证监会披露回购增持、主动ETF和进一步丰富指数基金工具；仅作政策背景，不直接生成买单。" }
];

fs.writeFileSync(reportPath, `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({ portfolioVersion: data.portfolioVersion, quoteTieOut: snapshot.quotes.filter((item) => item.tieOut).length, silverPremium: Number(silverPremium.toFixed(2)), silverHardRisk: true, runtimeFunds: snapshot.runtimeFunds.map((item) => `${item.symbol}:${item.status}`) }, null, 2));
