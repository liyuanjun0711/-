const fs = require("fs");
const vm = require("vm");

const reportPath = "report-data.js";
const snapshot = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261110.json", "utf8"));
const indexes = JSON.parse(fs.readFileSync("scripts/index-snapshot-20261110.json", "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(reportPath, "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;

if (snapshot.quotes.length !== 13 || snapshot.quotes.some((item) =>
  !item.tieOut || item.expectedDate !== "2026-11-09" || item.consensusCount < 2 ||
  !item.proxy?.valid || !item.proxy?.matchesConsensus)) {
  throw new Error("13-symbol November 9 proxy-to-multi-provider OHLC tie-out is required");
}
if (snapshot.runtimeFunds.some((item) =>
  item.status !== 501 || item.body?.ok !== false || item.body?.mode !== "failed")) {
  throw new Error("runtime fund endpoints must preserve the observed HTTP 501 failed state");
}

const quoteRows = new Map(snapshot.quotes.map((item) => [item.symbol.slice(2), item]));
const funds = new Map(snapshot.funds.map((item) => [item.code, item.body?.Data?.LSJZList?.[0] || null]));
const silverNavRow = funds.get("161226");
const openFundRow = funds.get("005827");
if (silverNavRow?.FSRQ !== "2026-11-09" || openFundRow?.FSRQ !== "2026-11-09") {
  throw new Error("November 9 fund NAVs are required");
}

const quote = (code) => {
  const row = quoteRows.get(code);
  const payload = row.proxy.body;
  const q = payload.quote || payload;
  return {
    date: row.expectedDate,
    open: Number(q.open),
    high: Number(q.high),
    low: Number(q.low),
    close: Number(q.close ?? q.price),
    preClose: Number(q.preClose),
    changePercent: Number(q.changePercent),
    source: payload.source,
    lastUpdated: payload.lastUpdated,
    mode: payload.mode
  };
};
const amount = (code, lots) => Number((quote(code).close * lots * 100).toFixed(2));
const feeRatio = (value, fee = 5) => Number((fee / value * 100).toFixed(2));
const idx = (symbol) => {
  const row = indexes.rows.find((item) => item.symbol === symbol);
  const provider = row?.providers.find((item) => item.ok && item.lastBar?.time === "2026-11-09");
  if (!provider) throw new Error(`missing November 9 index data for ${symbol}`);
  return provider.quote;
};

const silverClose = quote("161226").close;
const silverNav = Number(silverNavRow.DWJZ);
const silverPremium = (silverClose / silverNav - 1) * 100;
if (silverPremium >= 8) throw new Error("November 9 same-date silver premium should be below the hard-risk line");

const silverAmount = amount("161226", 2);
const hkAmount = amount("159740", 3);
const goldAmount = amount("164701", 2);
const liquorLots = Math.ceil(1000 / (quote("161725").close * 100));
const liquorAmount = amount("161725", liquorLots);
const minGrossEdge = feeRatio(liquorAmount, 30);

const sh = idx("SH000001");
const sz = idx("SZ399001");
const cy = idx("SZ399006");
const kc = idx("SH000688");

data.date = "2026-11-10";
data.portfolioVersion = "portfolio-2026-11-10-premarket-fee-aware-v1";
data.time = "2026-11-10 08:40盘前核验：13个场内持仓/观察标的均为11月9日真实收盘，已与至少两家独立日K源及Longbridge收盘报价核对；11月10日尚未开盘，不显示盘中实时价。开放式基金运行时接口HTTP 501，保留明确失败态。";
data.lastUpdated = "2026-11-10 08:40 北京时间（场内标的最近真实数据日为11月9日；基金为11月9日公开净值；开放式基金运行时接口HTTP 501）";
data.logicUpdatedAt = "2026-11-10盘前更新（券商持仓、当日订单与成交接口再次因OAuth授权范围不足而无法核验）";
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
    { code: "161226", label: "历史2手溢价风险复核（持仓未授权）", side: "sell", lots: 2, referencePrice: quote("161226").close, hardRiskExit: false },
    { code: "159740", label: "历史3手普通减仓复核", side: "sell", lots: 3, referencePrice: quote("159740").close, hardRiskExit: false },
    { code: "164701", label: "历史2手普通减仓复核", side: "sell", lots: 2, referencePrice: quote("164701").close, hardRiskExit: false },
    { code: "161725", label: `${liquorLots}手最低经济金额买入复核`, side: "buy", lots: liquorLots, referencePrice: quote("161725").close, hardRiskExit: false }
  ]
};

data.oneLine = `结论：11月10日盘前买0手、卖0手。161226在11月9日收盘价${silverClose.toFixed(3)}、净值${silverNav.toFixed(4)}，同日溢价约${silverPremium.toFixed(2)}%，低于8%硬风险线；三笔历史碎片单仍被费用闸门拦截，券商持仓接口未授权，开盘前不生成订单。仅供个人复盘参考。`;
data.tradeDecision = [
  {
    type: "第一屏结论",
    title: "盘前0买0卖，先核对真实持仓",
    conclusion: `已确认事实：13个场内标的均为11月9日真实收盘；161226同日溢价约${silverPremium.toFixed(2)}%，未触发8%硬退出。券商持仓、订单和成交接口仍缺少授权范围。`,
    action: "09:20后先在券商端核对可卖份额、当日订单和实际费率；没有账户证据前买0手、卖0手。",
    trigger: "只有实际仍持有161226且开盘后可靠同日估值显示溢价≥8%，才按全部实际剩余份额一次合并进入硬风险退出复核。",
    reason: "当前结论是未达到硬风险线且账户状态不可核验，不把历史手数机械转成订单。仅供个人复盘参考。"
  },
  {
    type: "费用闸门",
    title: "三笔历史碎片卖单继续暂停",
    conclusion: `按11月9日真实收盘：161226历史2手约${silverAmount.toFixed(2)}元/单边费${feeRatio(silverAmount).toFixed(2)}%，159740历史3手约${hkAmount.toFixed(2)}元/${feeRatio(hkAmount).toFixed(2)}%，164701历史2手约${goldAmount.toFixed(2)}元/${feeRatio(goldAmount).toFixed(2)}%；均低于1000元且费用占比高于0.5%。`,
    action: "普通波动只进入风险复核，不下碎片单、不拆单。",
    trigger: "基本面失效、流动性异常或经同日数据确认的LOF溢价失控，才允许越过最低经济金额。",
    reason: "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。"
  },
  {
    type: "隔夜市场",
    title: "美股强反弹，A股科技仍需确认",
    conclusion: "已确认事实：11月9日S&P 500涨2.3%、纳指涨2.7%、道指涨2.2%；Brent跌5.8%至92.57美元，10年期美债收益率4.87%。但英伟达跌4.3%，AI链内部仍分化。",
    action: "159740、512710只观察开盘承接，不因隔夜指数反弹追价；新增买入0手。",
    trigger: "基金真实价格站稳11月9日高点，同时有已成交资金和费用后收益证据，才进入复核。",
    reason: "海外风险偏好改善是背景，不替代单只基金的资金、费用和价格条件。仅供个人复盘参考。"
  },
  {
    type: "A股结构",
    title: "指数分化且缩量，不追开盘情绪",
    conclusion: `已确认事实：11月9日沪指${sh.changePercent >= 0 ? "+" : ""}${sh.changePercent.toFixed(2)}%、深成指${sz.changePercent.toFixed(2)}%、创业板${cy.changePercent.toFixed(2)}%、科创50+${kc.changePercent.toFixed(2)}%，三市成交约1.49万亿元、较前日缩量。`,
    action: "港股科技、军工、航空航天、稀有金属均先看能否收复各自11月9日高点；未满足时持有/观察。",
    trigger: "开盘后真实价格和时间戳有效，且突破前高后30分钟不回落，才进入风险复核；仍不自动下单。",
    reason: "11月9日深成指与创业板冲高回落，广度与成交量不支持机械追涨。仅供个人复盘参考。"
  },
  {
    type: "新买入",
    title: "金额过门，资金与收益证据仍缺",
    conclusion: `161725按${liquorLots}手约${liquorAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${feeRatio(liquorAmount, 10).toFixed(2)}%；预期毛收益至少需约${minGrossEdge.toFixed(2)}%才能覆盖往返费3倍。`,
    action: "不买。没有已成交卖出资金，也没有可核验证据支持费用后收益空间。",
    trigger: `需同时有真实资金、预期毛收益≥${minGrossEdge.toFixed(2)}%、扣费后预期收益≥1%，且价格站稳0.587，再评估。`,
    reason: "金额门通过不等于收益门和资金门通过。仅供个人复盘参考。"
  }
];

data.executionOrder = [
  "1. 09:20后先在券商端核对最新持仓、可卖份额、今日订单和实际费率；网页无法读取这些账户数据。",
  `2. 161226以11月9日同日数据计算溢价约${silverPremium.toFixed(2)}%，低于8%硬风险线；盘前卖0手。`,
  "3. 若开盘后无法取得可靠同日IOPV/估值，161226继续卖0手；若同日溢价≥8%且实际仍持有，只按全部实际剩余份额一次合并复核。",
  "4. 159740历史3手、164701历史2手继续暂停，普通费用门不通过。",
  "5. 其余基金新增买入0手；任何卖出未真实成交前，不把计划卖出写成资金来源。",
  "6. 股票条目只作板块温度计，不生成股票订单。",
  "7. 运行时行情若失败、模式为failed或时间戳过期，只显示失败态，不按缓存价执行。"
];

data.tradePlan = [
  { title: "161226硬退出未触发", basis: `11月9日场内收${silverClose.toFixed(3)}、净值${silverNav.toFixed(4)}，同日溢价约${silverPremium.toFixed(2)}%。`, inference: "仍有溢价风险但低于8%硬线，且基金公司风险提示仍有效。", conclusion: "盘前卖0手，开盘后只重算同日溢价。", invalidCondition: "可靠同日溢价≥8%且券商确认实际仍持有。" },
  { title: "隔夜反弹不等于A股追涨", basis: "美股三大指数大涨，但英伟达下跌、AI链分化；A股前一日深成指和创业板冲高回落。", inference: "风险偏好改善可能带来高开，但持续性需价格确认。", conclusion: "不追开盘高点，新增0手。", invalidCondition: "基金真实价格站稳前高且费用、资金、收益门全部通过。" },
  { title: "普通碎片单仍不经济", basis: `159740历史3手约${hkAmount.toFixed(2)}元，164701历史2手约${goldAmount.toFixed(2)}元。`, inference: "最低佣金占比显著高于0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现明确硬风险。" },
  { title: "经贸缓和改善背景", basis: "财政部与商务部确认部分对美加征关税和相关非关税措施继续暂停2个月。", inference: "政策环境更可预期，但不直接证明持仓基金的费用后收益。", conclusion: "作为全市场利好背景，不生成买单。", invalidCondition: "政策执行变化或市场价格不确认。" }
];

data.noTradeList = [
  "不把11月9日收盘价写成11月10日实时价。",
  "不在券商持仓接口未授权时机械卖历史手数。",
  "不执行159740历史3手、164701历史2手或161226历史2手的普通碎片卖单。",
  "不把计划卖出当作已到账资金；新增买入0手。",
  "不因美股大涨追买科技基金。",
  "不买股票观察池；股票只作基金板块温度计。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingViews = {
  "159740": { support: "0.499 / 前低", resistance: "0.512 / 前高", action: `持有、不追；历史3手约${hkAmount.toFixed(2)}元、单边费约${feeRatio(hkAmount).toFixed(2)}%，普通减仓暂停`, invalidCondition: "开盘后跌破0.499且港股科技同步转弱", predictionScore: 4, predictionLabel: "低位承接待验", expectedDirection: "震荡", reason: "11月9日冲高回落并收在日低，隔夜美股反弹仅改善情绪。", riskLevel: "中高" },
  "164701": { support: "1.570 / 前低", resistance: "1.583 / 前高", action: `持有、不追；历史2手约${goldAmount.toFixed(2)}元、单边费约${feeRatio(goldAmount).toFixed(2)}%，普通减仓暂停`, invalidCondition: "跌破1.570且贵金属同步转弱", predictionScore: 6, predictionLabel: "相对强势", expectedDirection: "震荡偏强", reason: "11月9日涨1.35%并守住多数涨幅，但仍不追开盘高点。", riskLevel: "中" },
  "512710": { support: "0.617 / 前低", resistance: "0.632 / 前高", action: "持有、不追；跌破0.617只进入复核，新买0手", invalidCondition: "跌破0.617且军工板块转弱", predictionScore: 5, predictionLabel: "反弹待延续", expectedDirection: "震荡", reason: "11月9日涨0.81%但明显低于日内高点，隔夜军工外部线索偏弱。", riskLevel: "中高" },
  "161226": { support: "1.520 / 前低", resistance: "1.548 / 前高", action: `卖0手；11月9日同日溢价${silverPremium.toFixed(2)}%，开盘后只复核同日估值`, invalidCondition: "可靠同日溢价≥8%且券商确认实际仍持有", predictionScore: 4, predictionLabel: "溢价临界复核", expectedDirection: "高波动震荡", reason: "同日溢价低于硬线但接近8%，基金公司仍提示二级市场溢价风险。", riskLevel: "高" },
  "159608": { support: "0.838 / 前低", resistance: "0.856 / 前高", action: "持有、不追；跌破0.838只进入复核，新买0手", invalidCondition: "跌破0.838且锂资源继续转弱", predictionScore: 4, predictionLabel: "冲高回落", expectedDirection: "震荡偏弱", reason: "11月9日仅涨0.24%且接近日低收盘，锂股观察样本明显走弱。", riskLevel: "中高" },
  "159241": { support: "0.990 / 前低", resistance: "1.017 / 前高", action: "持有、不追；站稳1.017也只进入复核，新买0手", invalidCondition: "跌破0.990且航天链转弱", predictionScore: 4, predictionLabel: "题材冲高回落", expectedDirection: "震荡", reason: "11月9日盘中冲高后接近日低收盘，持续性未确认。", riskLevel: "中" },
  "562350": { support: "1.094 / 前低", resistance: "1.102 / 前高", action: "持有、不加仓；普通碎片单不下", invalidCondition: "跌破1.094且电力板块转弱", predictionScore: 4, predictionLabel: "窄幅偏弱", expectedDirection: "震荡偏弱", reason: "11月9日跌0.27%，收盘靠近日内低位。", riskLevel: "中" },
  "002090": { support: "8.08 / 股票观察", resistance: "8.33 / 股票观察", action: "仅观察，不新增股票买卖指令；用于判断电网设备风险", invalidCondition: "跌破8.08", predictionScore: 3, predictionLabel: "弱势收低", expectedDirection: "偏弱", reason: "11月9日跌1.34%并收于日低，股票仅作基金环境参考。", riskLevel: "中高" }
};

for (const item of data.holdings) {
  const q = quote(item.code);
  Object.assign(item, holdingViews[item.code], {
    lastTradeDate: q.date,
    lastOpen: q.open,
    lastClose: q.close,
    lastHigh: q.high,
    lastLow: q.low,
    lastChangePercent: Number(q.changePercent.toFixed(2)),
    lastSource: `11月9日真实收盘；自有代理${q.source}，${q.lastUpdated}，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致`
  });
}

const watchViews = {
  "601208": { status: "高波动反弹，股票不买", reason: "11月9日涨1.66%，盘中振幅仍大。", buyTrigger: "股票不买；基金端需站稳34.97并通过费用门", avoidReason: "高波动且可执行建议限定基金", risk: "跌破32.75", support: "32.75", resistance: "34.97", invalidCondition: "跌破32.75", predictionScore: 6, predictionLabel: "强势高波动", expectedDirection: "震荡偏强", riskLevel: "高" },
  "600050": { status: "接近日低，股票不买", reason: "11月9日跌1.79%，弱于主要指数。", buyTrigger: "股票不买；基金端需站回4.45并通过费用门", avoidReason: "相对强度弱且无基金端资金证据", risk: "跌破4.37", support: "4.37", resistance: "4.45", invalidCondition: "放量站稳4.45", predictionScore: 3, predictionLabel: "相对弱势", expectedDirection: "偏弱", riskLevel: "中高" },
  "002466": { status: "锂板块弱势，股票不买", reason: "11月9日跌3.23%，接近日低。", buyTrigger: "股票不买；基金端需重新站稳37.62并通过费用门", avoidReason: "板块回落且无费用后收益证据", risk: "跌破35.90", support: "35.90", resistance: "37.62", invalidCondition: "跌破35.90", predictionScore: 2, predictionLabel: "弱势下探", expectedDirection: "偏弱", riskLevel: "高" },
  "688981": { status: "半导体冲高回落，股票不买", reason: "11月9日跌1.70%并收于日低。", buyTrigger: "股票不买；基金端先看109.02能否守住", avoidReason: "高开回落且无资金与收益证据", risk: "跌破109.02", support: "109.02", resistance: "111.71", invalidCondition: "跌破109.02", predictionScore: 3, predictionLabel: "高开回落", expectedDirection: "震荡偏弱", riskLevel: "高" },
  "161725": { status: "白酒窄幅偏弱，不买", reason: "11月9日跌0.34%，金额过门仍缺收益证据。", buyTrigger: `站稳0.587，且先有成交资金、预期毛收益≥${minGrossEdge.toFixed(2)}%和扣费后收益证据`, avoidReason: `${liquorLots}手约${liquorAmount.toFixed(2)}元、往返最低费约10元；无资金来源和预期毛收益`, risk: "跌破0.579", support: "0.579", resistance: "0.587", invalidCondition: "跌破0.579或资金来源缺失", predictionScore: 4, predictionLabel: "窄幅偏弱", expectedDirection: "震荡偏弱", riskLevel: "中" },
  "005827": { status: "11月9日净值已披露，运行时接口失败", reason: `11月9日净值${Number(openFundRow.DWJZ).toFixed(4)}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；只作dated NAV。`, buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据", avoidReason: "运行时基金接口HTTP 501，不能伪装实时", risk: "净值披露滞后或接口失败", support: "按净值披露", resistance: "不设盘中价", invalidCondition: "运行时真实基金接口接通并通过校验", predictionScore: 4, predictionLabel: "净值小跌、接口失败", expectedDirection: "震荡", riskLevel: "中" }
};

for (const item of data.watchlist) {
  Object.assign(item, watchViews[item.code]);
  if (item.code === "005827") {
    Object.assign(item, { lastTradeDate: openFundRow.FSRQ, lastOpen: null, lastClose: Number(openFundRow.DWJZ), lastHigh: null, lastLow: null, lastChangePercent: Number(openFundRow.JZZZL), lastSource: "东方财富基金11月9日公开净值；运行时基金接口HTTP 501，mode=failed" });
  } else {
    const q = quote(item.code);
    Object.assign(item, { lastTradeDate: q.date, lastOpen: q.open, lastClose: q.close, lastHigh: q.high, lastLow: q.low, lastChangePercent: Number(q.changePercent.toFixed(2)), lastSource: `11月9日真实收盘；自有代理${q.source}，${q.lastUpdated}；至少两家独立日K与Longbridge收盘报价一致` });
  }
}

data.newsItems = [
  { title: "A股冲高回落，沪强深弱且成交缩量", source: "新华财经", publishTime: "2026-11-09 15:24:00+08:00", summary: `已确认事实：沪指+${sh.changePercent.toFixed(2)}%、深成指${sz.changePercent.toFixed(2)}%、创业板${cy.changePercent.toFixed(2)}%，沪深京三市成交约1.49万亿元、较前日缩量1771亿元。基于事实的判断：开盘不追高，先看前高能否转为支撑。`, relatedStocks: ["159740", "512710", "159241"], sector: "过去24小时 / 全市场 / A股收盘", relation: "market", url: "https://finance.sina.com.cn/jjxw/2026-11-09/doc-iniycmty6557413.shtml" },
  { title: "美股大涨、油价回落，但AI链继续分化", source: "AP", publishTime: "2026-11-10 05:00:00+08:00", summary: "已确认事实：S&P 500+2.3%、纳指+2.7%、道指+2.2%，Brent跌5.8%至92.57美元，10年期美债收益率4.87%；AMD涨13.3%，英伟达跌4.3%。基于事实的判断：风险偏好改善但科技内部不是单边行情。", relatedStocks: ["159740", "512710", "688981"], sector: "过去24小时 / 全市场重大利好与风险 / 海外", relation: "market", url: "https://apnews.com/article/stocks-markets-ai-trump-oil-d938f8e6ff42b3706e1d36e6245ec56b" },
  { title: "部分对美加征关税继续暂停2个月", source: "国务院关税税则委员会", publishTime: "2026-11-09 18:00:00+08:00", summary: "已确认事实：自11月10日13:01起，24%的对美加征关税继续暂停2个月，保留10%税率。基于事实的判断：政策环境更可预期，属于全市场背景利好，不替代基金买入条件。", relatedStocks: ["159740", "512710", "562350"], sector: "过去24小时 / 全市场重大利好 / 经贸政策", relation: "market", url: "https://gss.mof.gov.cn/gzdt/zhengcejiedu/202611/t20261109_4004261.htm" },
  { title: "出口管制与不可靠实体清单相关措施继续暂停", source: "商务部", publishTime: "2026-11-09 16:00:00+08:00", summary: "已确认事实：商务部宣布相关措施自11月10日起继续暂停2个月。基于事实的判断：有利于降低经贸尾部风险，但科技基金仍需价格和费用条件确认。", relatedStocks: ["159740", "600050", "688981"], sector: "过去24小时 / 全市场重大利好 / 经贸政策", relation: "market", url: "https://www.mofcom.gov.cn/syxwfb/art/2026/art_4bc4aaa99b4e41feb6030ec59018d212.html" },
  { title: "13个场内标的11月9日真实收盘全部对账", source: "自有代理 / 新浪 / 腾讯 / 东方财富 / Longbridge", publishTime: "2026-11-10 08:40:00+08:00", summary: "已确认事实：13/13均为11月9日非零OHLC，自有代理收盘数据与至少两家独立日K及Longbridge报价一致。基于事实的判断：盘前只显示最近真实收盘，不标成11月10日实时行情。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "过去24小时 / 数据校验 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710" },
  { title: `161226同日溢价约${silverPremium.toFixed(2)}%，低于硬风险线`, source: "东方财富基金 / 自有代理 / 国投瑞银基金", publishTime: "2026-11-10 08:40:00+08:00", summary: `已确认事实：11月9日场内收${silverClose.toFixed(3)}、净值${silverNav.toFixed(4)}，同日溢价约${silverPremium.toFixed(2)}%；11月6日基金公司仍发布溢价风险提示。基于事实的判断：盘前卖0手，开盘后只重算同日溢价。`, relatedStocks: ["161226"], sector: "过去24小时 / 持仓 / 白银LOF", relation: "risk", url: "https://static.cninfo.com.cn/finalpage/2026-11-06/1225659583.PDF" },
  { title: "锂与半导体观察样本收于弱位", source: "自有代理 / Longbridge", publishTime: "2026-11-10 08:40:00+08:00", summary: "已确认事实：天齐锂业跌3.23%、中芯国际跌1.70%，二者均接近日低收盘。基于事实的判断：159608和科技方向不做低开补仓。", relatedStocks: ["159608", "002466", "688981"], sector: "持仓关联 / 资源与科技风险", relation: "risk", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ002466" },
  { title: "005827净值小跌，运行时基金接口仍失败", source: "东方财富基金 / 自有代理", publishTime: "2026-11-10 08:40:00+08:00", summary: `已确认事实：11月9日净值${Number(openFundRow.DWJZ).toFixed(4)}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。`, relatedStocks: ["005827"], sector: "持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" }
];

data.reasoning = [
  { title: "161226先看同日溢价", basis: `11月9日同日溢价${silverPremium.toFixed(2)}%，低于8%硬风险线。`, inference: "风险提示仍在，但未达到约定的硬退出条件。", conclusion: "盘前卖0手，开盘后只用可靠同日估值重算。", invalidCondition: "可靠同日溢价≥8%且实际仍持有。" },
  { title: "隔夜反弹只改善开盘背景", basis: "美股指数大涨、油价下跌，但英伟达逆势下跌；A股前一日冲高回落。", inference: "海外情绪可能带来高开，不能证明A股基金全天趋势。", conclusion: "不追高，新增0手。", invalidCondition: "基金站稳前高且费用、资金、收益证据齐备。" },
  { title: "普通碎片单仍不经济", basis: "161226历史2手、159740历史3手、164701历史2手均不足1000元且单边费用占比超0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "触价只复核。", invalidCondition: "出现明确硬风险。" },
  { title: "账户证据仍是执行前置条件", basis: "券商持仓、订单和成交接口再次返回OAuth授权范围不足。", inference: "无法确认历史份额是否仍在，也无法确认卖出资金。", conclusion: "买卖均为0手。", invalidCondition: "用户在券商端完成核对。" }
];
data.invalidConditions = [
  "161226无法取得开盘后同日IOPV/估值，或无法确认实际持仓：卖0手。",
  "最新券商持仓与历史计划不一致：历史手数示例立即失效，按真实可卖份额一次合并重算。",
  "161226/159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
  "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
  "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
];
data.cancelPlan = [
  "先查券商最新持仓与成交；不存在的历史份额不得生成订单。",
  "161226只用可靠同日IOPV/估值重算溢价；盘前昨收不得触发卖出。",
  "开盘瞬时跳价不直接成交，先确认真实价格、时间戳和30分钟承接。",
  "卖出未真实成交前不写入买入资金；成交后也先留现金。",
  "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
];
data.learningFramework = [
  { title: "盘前只用最近真实收盘", basis: "13个场内标的均为11月9日非零OHLC，多源一致。", inference: "11月10日开盘前不存在当日盘中价格。", conclusion: "页面标明最近真实收盘。", invalidCondition: "09:30后取得通过校验的真实盘中报价。" },
  { title: "LOF溢价必须同日比较", basis: `11月9日场内收${silverClose.toFixed(3)}、净值${silverNav.toFixed(4)}。`, inference: `同日溢价${silverPremium.toFixed(2)}%才可与8%硬线比较。`, conclusion: "盘前硬退出不成立。", invalidCondition: "开盘后可靠同日溢价≥8%。" },
  { title: "费用门先于普通调仓", basis: `三笔历史碎片单参考额${silverAmount.toFixed(2)}元、${hkAmount.toFixed(2)}元、${goldAmount.toFixed(2)}元。`, inference: "均未达到经济金额，最低佣金侵蚀过大。", conclusion: "普通调仓暂停。", invalidCondition: "明确硬风险出现。" },
  { title: "资金来源必须已成交", basis: "账户成交接口未授权，无法证明有卖出回款。", inference: "计划卖出不是资金。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" },
  { title: "股票只作板块温度计", basis: "601208上涨，600050、002466、688981走弱。", inference: "个股信号用于验证基金方向，不生成股票订单。", conclusion: "观察池股票不买。", invalidCondition: "无。" }
];
data.nextWatch = [
  "09:20：核对券商真实持仓、可卖份额、今日订单和实际费率。",
  "09:25：确认自有代理marketStatus与时间戳；未开盘数据只显示11月9日收盘。",
  "09:30-10:00：若能取得可靠同日IOPV/估值，再重算161226溢价；否则卖0手。",
  "10:00：观察159740的0.499、512710的0.617、159241的0.990能否守住；跌破只复核。",
  "10:30：不追隔夜情绪带来的高开；没有已成交资金仍买0手。",
  "全天：运行时接口失败时只显示失败态，不绘制假线或假K线。"
];
data.quoteWatchlist = data.watchlist.map((item) => ({ name: item.name, code: item.code, symbol: item.symbol, market: item.market, type: item.type, sector: item.sector, support: item.support, resistance: item.resistance }));
data.sources = [
  { name: "本次运行：13个场内标的11月9日真实收盘", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710", note: "2026-11-10 08:40：13/13为非零11月9日收盘OHLC；自有代理与至少两家独立日K、Longbridge报价一致。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月9日单位净值${silverNav.toFixed(4)}、日涨${Number(silverNavRow.JZZZL).toFixed(2)}%；相对同日场内收盘${silverClose.toFixed(3)}的静态溢价约${silverPremium.toFixed(2)}%。` },
  { name: "国投瑞银：161226溢价风险提示", url: "https://static.cninfo.com.cn/finalpage/2026-11-06/1225659583.PDF", note: "基金管理人提示二级市场价格溢价风险；本页仍要求同日数据和实际持仓双重确认。" },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月9日单位净值${Number(openFundRow.DWJZ).toFixed(4)}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；仅作dated NAV。` },
  { name: "运行时基金接口HTTP 501失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。" },
  { name: "新华财经：11月9日A股收盘", url: "https://finance.sina.com.cn/jjxw/2026-11-09/doc-iniycmty6557413.shtml", note: "沪指+0.32%、深成指-0.27%、创业板-0.27%，成交缩量且冲高回落。" },
  { name: "AP：11月9日美股与油价", url: "https://apnews.com/article/stocks-markets-ai-trump-oil-d938f8e6ff42b3706e1d36e6245ec56b", note: "S&P 500+2.3%、纳指+2.7%、道指+2.2%，Brent跌5.8%至92.57美元，10年期美债收益率4.87%。" },
  { name: "财政部：部分对美加征关税继续暂停", url: "https://gss.mof.gov.cn/gzdt/zhengcejiedu/202611/t20261109_4004261.htm", note: "自11月10日13:01起继续暂停24%的对美加征关税税率2个月，保留10%税率。" },
  { name: "商务部：部分出口管制措施继续暂停", url: "https://www.mofcom.gov.cn/syxwfb/art/2026/art_4bc4aaa99b4e41feb6030ec59018d212.html", note: "自11月10日起相关措施继续暂停2个月；仅作全市场政策背景。" }
];

fs.writeFileSync(reportPath, `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  quoteTieOut: snapshot.quotes.filter((item) => item.tieOut && item.proxy.matchesConsensus).length,
  fundDates: [silverNavRow.FSRQ, openFundRow.FSRQ],
  silverPremium: Number(silverPremium.toFixed(2)),
  hardRiskConfirmed: false,
  runtimeFunds: snapshot.runtimeFunds.map((item) => `${item.symbol}:${item.status}:${item.body.mode}`),
  indexChanges: [sh.changePercent, sz.changePercent, cy.changePercent, kc.changePercent]
}, null, 2));
