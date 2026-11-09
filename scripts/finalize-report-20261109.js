const fs = require("fs");
const vm = require("vm");

require("./finalize-report-20261106.js");

const reportPath = "report-data.js";
const baseline = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261109.json", "utf8"));
const intraday = JSON.parse(fs.readFileSync("scripts/intraday-snapshot-20261109.json", "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(reportPath, "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;

if (baseline.quotes.length !== 13 || baseline.quotes.some((item) => !item.tieOut || item.expectedDate !== "2026-11-06" || item.consensusCount < 2)) {
  throw new Error("13-symbol 2026-11-06 two-provider daily-K consensus is required");
}
if (intraday.quotes.length !== 13 || intraday.quotes.some((item) => !item.valid || item.body?.mode !== "realtime" || item.body?.dataDate !== "2026-11-09")) {
  throw new Error("13-symbol 2026-11-09 real intraday snapshot is required");
}
if (baseline.runtimeFunds.some((item) => item.status !== 501 || item.body?.ok !== false || item.body?.mode !== "failed")) {
  throw new Error("runtime fund endpoints must preserve the observed HTTP 501 failed state");
}

const baselineQuotes = new Map(baseline.quotes.map((item) => [item.symbol.slice(2), item]));
const liveQuotes = new Map(intraday.quotes.map((item) => [item.symbol.slice(2), item.body]));
const funds = new Map(baseline.funds.map((item) => [item.code, item.body?.Data?.LSJZList?.[0] || null]));
const silverNavRow = funds.get("161226");
const openFundRow = funds.get("005827");
if (silverNavRow?.FSRQ !== "2026-11-06" || openFundRow?.FSRQ !== "2026-11-06") {
  throw new Error("2026-11-06 fund NAVs are required");
}

const silverClose = Number(baselineQuotes.get("161226").bar.close);
const silverNav = Number(silverNavRow.DWJZ);
const silverSameDatePremium = (silverClose / silverNav - 1) * 100;
const silverLive = liveQuotes.get("161226");
const silverCrossDatePremium = (Number(silverLive.price) / silverNav - 1) * 100;
if (silverSameDatePremium >= 8) throw new Error("same-date 161226 premium should be below the hard-risk line");

const amount = (code, lots) => Number((Number(liveQuotes.get(code).price) * lots * 100).toFixed(2));
const feeRatio = (value, fee = 5) => Number((fee / value * 100).toFixed(2));
const hkAmount = amount("159740", 3);
const goldAmount = amount("164701", 2);
const silverAmount = amount("161226", 2);
const liquorLots = Math.ceil(1000 / (Number(liveQuotes.get("161725").price) * 100));
const liquorAmount = amount("161725", liquorLots);

data.date = "2026-11-09";
data.portfolioVersion = "portfolio-2026-11-09-midday-fee-aware-v1";
data.time = "2026-11-09 13:42北京时点核验：13个场内持仓/观察标的均由自有代理返回11月9日真实盘中报价，状态为realtime；11月6日收盘OHLC另经新浪、腾讯、东方财富三源日K一致性核验。开放式基金运行时接口HTTP 501，保留明确失败态。";
data.lastUpdated = "2026-11-09 13:42 北京时间（13个场内标的为真实盘中快照；基金为11月6日公开净值；开放式基金运行时接口HTTP 501）";
data.logicUpdatedAt = "2026-11-09午间补发（券商持仓、当日订单与成交接口因授权范围不足无法核验）";
data.transactionCostPolicy = {
  profile: "low_principal", assumptionStatus: "待用户用券商佣金表或交割单确认", commissionRate: 0.00025,
  minimumCommissionCny: 5, minimumEconomicOrderCny: 1000, maxOneWayCostRatio: 0.005,
  maxRoundTripCostRatio: 0.01, minimumNetEdgeRatio: 0.01, feeCoverageMultiple: 3, lotSize: 100,
  hardRiskExitRule: "基本面失效、LOF溢价失控或明确硬性风控时，费用不阻止退出；同一标的尽量一次完成，避免重复支付最低佣金。",
  candidateOrders: [
    { code: "161226", label: "旧2手溢价风险复核（同日证据不足）", side: "sell", lots: 2, referencePrice: Number(silverLive.price), hardRiskExit: false },
    { code: "159740", label: "旧3手普通减仓复核", side: "sell", lots: 3, referencePrice: Number(liveQuotes.get("159740").price), hardRiskExit: false },
    { code: "164701", label: "旧2手普通减仓复核", side: "sell", lots: 2, referencePrice: Number(liveQuotes.get("164701").price), hardRiskExit: false },
    { code: "161725", label: `${liquorLots}手最低经济金额买入复核`, side: "buy", lots: liquorLots, referencePrice: Number(liveQuotes.get("161725").price), hardRiskExit: false }
  ]
};

data.oneLine = `结论：11月9日午后买0手、卖0手。161226在11月6日同日溢价约${silverSameDatePremium.toFixed(2)}%，低于8%硬风险线；13:41盘中价相对上周五净值约${silverCrossDatePremium.toFixed(2)}%只是跨日复核信号，且券商持仓接口未授权，不能据此生成卖单。其余普通碎片单继续被费用闸门拦截。仅供个人复盘参考。`;
data.tradeDecision = [
  { type: "第一屏结论", title: "午后0买0卖，先补齐持仓证据", conclusion: `已确认事实：13个场内标的13:41前后均有真实盘中报价；券商持仓、订单和成交接口返回授权范围不足。161226上周五同日溢价约${silverSameDatePremium.toFixed(2)}%，未触发8%硬退出。`, action: "今天不生成订单。若用户在券商端确认仍有161226，并能看到可靠同日IOPV/估值且溢价≥8%，才按全部实际剩余份额一次合并进入硬风险复核；否则卖0手。", trigger: "实际仍持有 + 同日可核验IOPV/估值 + 溢价≥8%三项同时成立；少一项都不下单。", reason: "当前只有跨日净值比较，不能把估算溢价冒充同日溢价。仅供个人复盘参考。" },
  { type: "盘中市场", title: "指数小涨，内部强弱仍分化", conclusion: "已确认事实：午盘沪指+0.46%、深成指+0.27%、创业板+0.56%、科创50+0.70%；半日成交约1.01万亿元，涨跌家数接近。", action: "不追早盘高点。军工、稀有金属和科技基金只看午后能否守住盘中低点；未确认资金来源前买0手。", trigger: "真实价格守住午盘低点并重新站上日内高点，同时有卖出成交资金和费用后收益证据，才复核。", reason: "指数修复但个股赚钱效应约五成，不能用指数红盘替代单只基金的执行证据。仅供个人复盘参考。" },
  { type: "外部市场", title: "美股AI反弹但周线仍弱", conclusion: "已确认事实：上周五S&P 500涨0.3%、纳指涨1.1%、道指跌0.5%，英伟达反弹2.8%；S&P 500全周仍跌2.7%，10年期美债收益率升至4.86%。", action: "科技基金不追高；159740、512710只保留持有/观察。", trigger: "午后真实价格站稳日内高点且费用门通过才复核；否则新增0手。", reason: "单日反弹只部分修复前期急跌，融资成本风险仍在。仅供个人复盘参考。" },
  { type: "费用闸门", title: "三笔旧碎片单全部暂停", conclusion: `按13:41真实价：161226旧2手约${silverAmount.toFixed(2)}元/单边费${feeRatio(silverAmount).toFixed(2)}%，159740旧3手约${hkAmount.toFixed(2)}元/${feeRatio(hkAmount).toFixed(2)}%，164701旧2手约${goldAmount.toFixed(2)}元/${feeRatio(goldAmount).toFixed(2)}%；均低于1000元且费用占比高于0.5%。`, action: "同日硬风险未被证实前，三笔都只复核、不下单、不拆单。", trigger: "只有基本面失效、流动性异常或经同日数据证实的LOF溢价失控，才越过普通费用门。", reason: "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。" },
  { type: "新买入", title: "金额过门仍不买", conclusion: `161725按${liquorLots}手约${liquorAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${feeRatio(liquorAmount, 10).toFixed(2)}%。`, action: "不买。没有已成交卖出资金，不把计划中的卖出当作资金来源。", trigger: `未来需有真实资金，预期毛收益至少覆盖往返费3倍（约${feeRatio(liquorAmount, 30).toFixed(2)}%），且扣费后预期收益≥1%，再评估。`, reason: "目前缺少资金来源与可核验毛收益，费用闸门结论为缺少收益空间。仅供个人复盘参考。" }
];

data.executionOrder = [
  "1. 午后先在券商端核对最新持仓、可卖份额、当日成交和实际费率；网页无法读取这些账户数据。",
  `2. 161226上周五同日溢价约${silverSameDatePremium.toFixed(2)}%；13:41跨日估算约${silverCrossDatePremium.toFixed(2)}%，不得直接当作同日溢价。`,
  "3. 若无法取得可靠同日IOPV/估值，161226卖0手；若券商端确认实际仍持有且同日溢价≥8%，只进入一次合并退出复核。",
  "4. 159740旧3手、164701旧2手继续暂停，普通费用门不通过。",
  "5. 其余基金新增买入0手；任何卖出未真实成交前，不写入买入资金来源。",
  "6. 股票观察池只作板块温度计，不生成股票订单。",
  "7. 运行时行情若失败或时间戳过期，只显示失败态，不按缓存价执行。"
];
data.tradePlan = [
  { title: "161226硬退出暂不成立", basis: `11月6日场内收${silverClose.toFixed(3)}、净值${silverNav.toFixed(4)}，同日溢价约${silverSameDatePremium.toFixed(2)}%。`, inference: "低于8%硬风险线；盘中价与上周五净值是跨日口径。", conclusion: "无同日IOPV/估值与真实持仓前卖0手。", invalidCondition: "券商确认实际仍持有，且可靠同日溢价≥8%。" },
  { title: "午盘普涨但强度一般", basis: "四个主要指数午盘上涨，个股涨跌接近一半一半。", inference: "市场修复但并非普遍强趋势。", conclusion: "不追高，等待午后确认。", invalidCondition: "基金真实价格放量站稳日内高点且费用门通过。" },
  { title: "普通碎片单仍不经济", basis: `159740旧3手约${hkAmount.toFixed(2)}元，164701旧2手约${goldAmount.toFixed(2)}元。`, inference: "单边费用占比显著高于0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现明确硬风险。" },
  { title: "政策托底只改善背景", basis: "国常会提出完善资本市场稳市机制，证监会继续部署稳市场工具。", inference: "政策有利于中期风险偏好，但不证明单只基金短线费用后收益。", conclusion: "新增买入0手。", invalidCondition: "资金、费率、毛收益与扣费后收益证据齐备。" }
];
data.noTradeList = ["不把13:41快照继续标成更新后的实时价；页面只按真实接口时间刷新。", "不把161226盘中价/上周五净值的跨日比较写成同日溢价。", "不在券商持仓接口未授权时机械卖旧2手。", "不执行159740旧3手或164701旧2手普通碎片卖单。", "不把计划卖出当作已到账资金；新增买入0手。", "不买股票观察池；股票只作基金板块温度计。", "不自动下单；所有建议仅供个人复盘参考。"];

const holdingViews = {
  "159740": { support: "0.499 / 跌破后复核", resistance: "0.512 / 日内高点", action: `持有、不追；旧3手约${hkAmount.toFixed(2)}元、单边费约${feeRatio(hkAmount).toFixed(2)}%，普通减仓暂停`, invalidCondition: "跌破0.499且港股科技同步转弱", predictionScore: 5, predictionLabel: "冲高回落", expectedDirection: "震荡", reason: "13:41近昨收，早盘高点0.512未能保持。", riskLevel: "中高" },
  "164701": { support: "1.570 / 日内低点", resistance: "1.583 / 日内高点", action: `持有、不追；旧2手约${goldAmount.toFixed(2)}元、单边费约${feeRatio(goldAmount).toFixed(2)}%，普通减仓暂停`, invalidCondition: "跌破1.570且贵金属转弱", predictionScore: 6, predictionLabel: "相对强势", expectedDirection: "震荡偏强", reason: "13:41约涨1.35%，仍守日内低点。", riskLevel: "中" },
  "512710": { support: "0.617 / 日内低点", resistance: "0.632 / 日内高点", action: "持有、不追；跌破0.617只进入复核，新买0手", invalidCondition: "跌破0.617且军工板块转弱", predictionScore: 5, predictionLabel: "高开回落", expectedDirection: "震荡", reason: "开盘0.622后回落，13:41仍小幅红盘。", riskLevel: "中高" },
  "161226": { support: "1.527 / 日内低点", resistance: "1.548 / 日内高点", action: `卖0手；上周五同日溢价${silverSameDatePremium.toFixed(2)}%，跨日估算${silverCrossDatePremium.toFixed(2)}%仅复核`, invalidCondition: "可靠同日溢价≥8%且券商确认实际仍持有", predictionScore: 4, predictionLabel: "跨日溢价待核", expectedDirection: "高波动震荡", reason: "运行时场内价真实，但同日净值/IOPV不可得，硬退出证据不足。", riskLevel: "高" },
  "159608": { support: "0.838 / 日内低点", resistance: "0.856 / 日内高点", action: "持有、不追；跌破0.838只进入复核，新买0手", invalidCondition: "跌破0.838且能源金属继续转弱", predictionScore: 4, predictionLabel: "高开回落", expectedDirection: "震荡偏弱", reason: "早盘冲至0.856后回落，锂板块偏弱。", riskLevel: "中高" },
  "159241": { support: "0.990 / 日内低点", resistance: "1.017 / 日内高点", action: "持有、不追；站稳1.017也只进入复核，新买0手", invalidCondition: "跌破0.990且航天链转弱", predictionScore: 5, predictionLabel: "冲高回落", expectedDirection: "震荡", reason: "商业航天活跃但基金未守住日内高点。", riskLevel: "中" },
  "562350": { support: "1.094 / 日内低点", resistance: "1.102 / 日内高点", action: "持有、不加仓；普通碎片单不下", invalidCondition: "跌破1.094且电力板块转弱", predictionScore: 5, predictionLabel: "窄幅整理", expectedDirection: "震荡", reason: "13:41约跌0.18%，波动较窄。", riskLevel: "中" },
  "002090": { support: "8.09 / 股票观察", resistance: "8.33 / 股票观察", action: "仅观察，不新增股票买卖指令；用于判断电网设备风险", invalidCondition: "跌破8.09", predictionScore: 4, predictionLabel: "高开走弱", expectedDirection: "震荡偏弱", reason: "13:41约跌0.73%，接近日内低点。", riskLevel: "中高" }
};
for (const item of data.holdings) {
  const q = liveQuotes.get(item.code);
  Object.assign(item, holdingViews[item.code], {
    lastTradeDate: q.dataDate, lastOpen: Number(q.open), lastClose: Number(q.price), lastHigh: Number(q.high), lastLow: Number(q.low),
    lastChangePercent: Number(Number(q.changePercent).toFixed(2)), lastSource: `自有代理${q.source}真实盘中报价，${q.lastUpdated}；mode=realtime；11月6日收盘另经三源日K一致性核验`
  });
}

const watchViews = {
  "601208": { status: "强反弹但波动大，股票不买", reason: "13:41约涨2.59%，盘中振幅仍高。", buyTrigger: "股票不买；基金端需站稳34.97并通过费用门", avoidReason: "高波动且可执行建议限定基金", risk: "跌破32.75", support: "32.75", resistance: "34.97", invalidCondition: "跌破32.75", predictionScore: 6, predictionLabel: "强势高波动", expectedDirection: "震荡偏强", riskLevel: "高" },
  "600050": { status: "接近日内低点，股票不买", reason: "13:41约跌2.01%，弱于主要指数。", buyTrigger: "股票不买；基金端需站回4.45并通过费用门", avoidReason: "相对强度弱且无基金端资金证据", risk: "跌破4.38", support: "4.38", resistance: "4.45", invalidCondition: "放量站稳4.45", predictionScore: 3, predictionLabel: "相对弱势", expectedDirection: "偏弱", riskLevel: "中高" },
  "002466": { status: "锂板块弱势，股票不买", reason: "13:41约跌2.88%，接近日内低点。", buyTrigger: "股票不买；基金端需重新站稳37.62并通过费用门", avoidReason: "板块回落且无费用后收益证据", risk: "跌破36.01", support: "36.01", resistance: "37.62", invalidCondition: "跌破36.01", predictionScore: 2, predictionLabel: "弱势下探", expectedDirection: "偏弱", riskLevel: "高" },
  "688981": { status: "半导体高开回落，股票不买", reason: "13:41约跌0.93%，早盘反弹未保持。", buyTrigger: "股票不买；基金端先看109.40能否守住", avoidReason: "高开回落且无资金与收益证据", risk: "跌破109.40", support: "109.40", resistance: "111.71", invalidCondition: "跌破109.40", predictionScore: 4, predictionLabel: "高开回落", expectedDirection: "震荡偏弱", riskLevel: "高" },
  "161725": { status: "白酒窄幅偏弱，不买", reason: "13:41约跌0.68%，金额过门仍缺收益证据。", buyTrigger: "守住0.579并站稳0.587，且先有成交资金与费用后收益证据", avoidReason: `${liquorLots}手约${liquorAmount.toFixed(2)}元、往返最低费约10元；无资金来源和预期毛收益`, risk: "跌破0.579", support: "0.579", resistance: "0.587", invalidCondition: "跌破0.579或资金来源缺失", predictionScore: 4, predictionLabel: "窄幅偏弱", expectedDirection: "震荡偏弱", riskLevel: "中" },
  "005827": { status: "11月6日净值已披露，运行时接口失败", reason: `11月6日净值${Number(openFundRow.DWJZ).toFixed(4)}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；只作dated NAV。`, buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据", avoidReason: "运行时基金接口HTTP 501，不能伪装实时", risk: "净值披露滞后或接口失败", support: "按净值披露", resistance: "不设盘中价", invalidCondition: "运行时真实基金接口接通并通过校验", predictionScore: 4, predictionLabel: "净值回落、接口失败", expectedDirection: "震荡", riskLevel: "中" }
};
for (const item of data.watchlist) {
  Object.assign(item, watchViews[item.code]);
  if (item.code === "005827") {
    Object.assign(item, { lastTradeDate: openFundRow.FSRQ, lastOpen: null, lastClose: Number(openFundRow.DWJZ), lastHigh: null, lastLow: null, lastChangePercent: Number(openFundRow.JZZZL), lastSource: "东方财富基金11月6日公开净值；运行时基金接口HTTP 501，mode=failed" });
  } else {
    const q = liveQuotes.get(item.code);
    Object.assign(item, { lastTradeDate: q.dataDate, lastOpen: Number(q.open), lastClose: Number(q.price), lastHigh: Number(q.high), lastLow: Number(q.low), lastChangePercent: Number(Number(q.changePercent).toFixed(2)), lastSource: `自有代理${q.source}真实盘中报价，${q.lastUpdated}；mode=realtime；11月6日收盘另经三源日K一致性核验` });
  }
}

data.newsItems = [
  { title: "A股午盘小涨，涨跌家数接近", source: "新华财经 / 同花顺", publishTime: "2026-11-09 11:48:00+08:00", summary: "已确认事实：沪指+0.46%、深成指+0.27%、创业板+0.56%、科创50+0.70%，半日成交约1.01万亿元，约2650只上涨。基于事实的判断：修复强度一般，不据此追买基金。", relatedStocks: ["159740", "512710", "159241"], sector: "过去24小时 / 全市场 / 午盘", relation: "market", url: "https://finance.sina.com.cn/jjxw/2026-11-09/doc-iniycfna6562919.shtml" },
  { title: "亚洲市场跟随美股AI反弹", source: "AP", publishTime: "2026-11-09 12:14:00+08:00", summary: "已确认事实：上周五S&P 500+0.3%、纳指+1.1%、道指-0.5%，英伟达+2.8%；周一亚洲主要市场多数反弹。基于事实的判断：风险偏好修复，但上周波动未消失。", relatedStocks: ["159740", "512710", "688981"], sector: "过去24小时 / 全市场重大利好与风险 / 海外AI", relation: "market", url: "https://apnews.com/article/stocks-markets-ai-trump-oil-d938f8e6ff42b3706e1d36e6245ec56b" },
  { title: "13个场内标的盘中真实报价全部通过校验", source: "自有代理 / 新浪 / 腾讯 / 东方财富", publishTime: "2026-11-09 13:42:00+08:00", summary: "已确认事实：13/13报价日期均为11月9日、mode=realtime、非零OHLC；11月6日收盘另经三源日K一致性核验。基于事实的判断：页面可显示真实盘中状态，但只以接口时间戳为准。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "过去24小时 / 数据校验 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710" },
  { title: `161226跨日估算约${silverCrossDatePremium.toFixed(2)}%，不等于同日溢价`, source: "自有代理 / 东方财富基金", publishTime: "2026-11-09 13:42:00+08:00", summary: `已确认事实：11月6日场内收${silverClose.toFixed(3)}、净值${silverNav.toFixed(4)}，同日溢价约${silverSameDatePremium.toFixed(2)}%；13:41盘中价${Number(silverLive.price).toFixed(3)}。基于事实的判断：缺少11月9日同日净值/IOPV与真实持仓，卖0手。`, relatedStocks: ["161226"], sector: "过去24小时 / 持仓 / 白银LOF", relation: "risk", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10" },
  { title: "贵金属相对强，锂板块偏弱", source: "自有代理", publishTime: "2026-11-09 13:42:00+08:00", summary: "已确认事实：164701约涨1.35%，159608约涨0.36%；002466约跌2.88%。基于事实的判断：资源方向内部明显分化，不追强、不补弱。", relatedStocks: ["164701", "159608", "002466"], sector: "持仓关联 / 板块分化", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ164701" },
  { title: "商业航天活跃，但基金冲高回落", source: "新华财经 / 自有代理", publishTime: "2026-11-09 13:42:00+08:00", summary: "已确认事实：商业航天板块早盘活跃；159241盘中高见1.017，13:41回到0.993。基于事实的判断：题材热度没有转化为可执行追价信号。", relatedStocks: ["159241"], sector: "持仓关联 / 航空航天", relation: "holding", url: "https://finance.sina.com.cn/jjxw/2026-11-09/doc-iniycfna6562919.shtml" },
  { title: "国常会提出完善资本市场稳市机制", source: "新华社 / 教育部政府门户", publishTime: "2026-11-07 09:00:00+08:00", summary: "已确认事实：11月6日国常会提出完善资本市场稳市机制、增强股市内在稳定性。基于事实的判断：政策托底改善中期背景，但不替代费用和触发条件。", relatedStocks: ["512710", "562350"], sector: "全市场重大利好 / 稳市政策", relation: "market", url: "https://www.moe.gov.cn/jyb_xwfb/s6052/moe_838/202611/t20261107_1457467.html" },
  { title: "11月6日A股缩量下跌，科技压力较大", source: "新华财经", publishTime: "2026-11-06 15:30:00+08:00", summary: "已确认事实：沪指-1.10%、深成指-2.57%、创业板-3.96%，两市成交约1.66万亿元；算力硬件走弱。基于事实的判断：周一小幅修复尚未完全扭转上周五风险。", relatedStocks: ["159740", "512710", "688981"], sector: "市场风险 / 上一交易日", relation: "risk", url: "https://www.cnfin.com/gs-lb/detail/20261106/4492047_1.html" },
  { title: "005827净值跌1.00%，运行时基金接口失败", source: "东方财富基金 / 自有代理", publishTime: "2026-11-09 13:42:00+08:00", summary: `已确认事实：11月6日净值${Number(openFundRow.DWJZ).toFixed(4)}、日跌1.00%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。`, relatedStocks: ["005827"], sector: "持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" }
];

data.reasoning = [
  { title: "161226先解决口径问题", basis: `上周五同日溢价${silverSameDatePremium.toFixed(2)}%，盘中跨日估算${silverCrossDatePremium.toFixed(2)}%。`, inference: "跨日估算会混入银价和净值变化，不能直接触发卖出。", conclusion: "无同日IOPV/估值和真实持仓前卖0手。", invalidCondition: "可靠同日溢价≥8%且实际仍持有。" },
  { title: "指数反弹不等于可追", basis: "午盘指数普涨但涨跌家数接近。", inference: "市场修复广度一般，热点轮动快。", conclusion: "基金不追高，新增0手。", invalidCondition: "真实价格站稳日内高点且费用门通过。" },
  { title: "普通碎片单仍不经济", basis: "161226旧2手、159740旧3手、164701旧2手均不足1000元且单边费用占比超0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "触价只复核。", invalidCondition: "出现明确硬风险。" },
  { title: "账户证据是执行前置条件", basis: "券商持仓、订单和成交接口未获授权。", inference: "无法确认旧份额是否仍在，也无法确认卖出资金。", conclusion: "买卖均为0手。", invalidCondition: "用户在券商端完成核对。" }
];
data.invalidConditions = ["161226缺少同日IOPV/估值，或无法确认实际持仓：卖0手。", "最新券商持仓与旧计划不一致：旧手数示例立即失效，按真实可卖份额一次合并重算。", "161226/159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。", "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。", "网页出现0价、时间戳过期、来源失败或mode非realtime：取消基于网页价格的执行。"];
data.cancelPlan = ["先查券商最新持仓与成交；不存在的旧份额不得生成订单。", "161226只用可靠同日IOPV/估值重算溢价；跨日估算不得触发卖出。", "午后瞬时跳价不直接成交，先确认真实价格与时间戳。", "卖出未真实成交前不写入买入资金；成交后也先留现金。", "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"];
data.learningFramework = [
  { title: "盘中价必须带真实时间戳", basis: "13个场内标的均返回11月9日13:41前后非零OHLC和mode=realtime。", inference: "只有通过校验的数据才能显示为实时。", conclusion: "页面按接口时间刷新。", invalidCondition: "接口失败或时间戳过期。" },
  { title: "LOF溢价必须同日比较", basis: `11月6日同日溢价${silverSameDatePremium.toFixed(2)}%，盘中跨日估算${silverCrossDatePremium.toFixed(2)}%。`, inference: "跨日口径不能确认真实溢价。", conclusion: "同日证据不足时卖0手。", invalidCondition: "取得可靠同日IOPV/估值。" },
  { title: "费用门先于普通调仓", basis: `三笔旧碎片单参考额${silverAmount.toFixed(2)}元、${hkAmount.toFixed(2)}元、${goldAmount.toFixed(2)}元。`, inference: "均未达到经济金额，最低佣金侵蚀过大。", conclusion: "普通调仓暂停。", invalidCondition: "明确硬风险出现。" },
  { title: "资金来源必须已成交", basis: "账户成交接口未授权，无法证明有卖出回款。", inference: "计划卖出不是资金。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" },
  { title: "股票只作板块温度计", basis: "601208上涨，600050、002466、688981走弱。", inference: "个股信号用于验证基金方向，不生成股票订单。", conclusion: "观察池股票不买。", invalidCondition: "无。" }
];
data.nextWatch = ["14:00：核对券商真实持仓、可卖份额和实际费率。", "14:10：若能取得可靠同日IOPV/估值，再重算161226溢价；否则卖0手。", "14:30：观察159740的0.499、512710的0.617、159241的0.990能否守住；跌破只复核。", "14:50：不追尾盘拉升；没有已成交资金仍买0手。", "15:00后：记录真实收盘，等待11月9日基金净值披露后再做同日溢价复盘。", "全天：运行时接口失败时只显示失败态，不绘制假线或假K线。"];
data.quoteWatchlist = data.watchlist.map((item) => ({ name: item.name, code: item.code, symbol: item.symbol, market: item.market, type: item.type, sector: item.sector, support: item.support, resistance: item.resistance }));
data.sources = [
  { name: "本次运行：13个场内标的真实盘中报价", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710", note: "2026-11-09 13:42：13/13为非零11月9日真实盘中报价，mode=realtime；页面只按各接口时间戳显示。" },
  { name: "本次基线：11月6日三源日K一致性核验", url: "https://daily-briefing-blue.vercel.app/api/kline?symbol=SH512710&period=day", note: "新浪、腾讯、东方财富对13个标的11月6日OHLC形成至少两源一致，全部13/13通过。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月6日单位净值${silverNav.toFixed(4)}、日跌0.46%；相对同日场内收盘${silverClose.toFixed(3)}的静态溢价约${silverSameDatePremium.toFixed(2)}%。` },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月6日单位净值${Number(openFundRow.DWJZ).toFixed(4)}、日跌1.00%；仅作dated NAV。` },
  { name: "运行时基金接口HTTP 501失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。" },
  { name: "新华财经：11月9日A股午盘", url: "https://finance.sina.com.cn/jjxw/2026-11-09/doc-iniycfna6562919.shtml", note: "沪指+0.46%、深成指+0.27%、创业板+0.56%，主要股指小涨，热点轮动。" },
  { name: "AP：美股AI反弹与亚洲市场", url: "https://apnews.com/article/stocks-markets-ai-trump-oil-d938f8e6ff42b3706e1d36e6245ec56b", note: "上周五S&P 500+0.3%、纳指+1.1%、道指-0.5%，周一亚洲市场多数反弹；10年期美债收益率4.86%。" },
  { name: "新华社：国常会完善稳市机制", url: "https://www.moe.gov.cn/jyb_xwfb/s6052/moe_838/202611/t20261107_1457467.html", note: "11月6日国常会提出完善资本市场稳市机制、增强股市内在稳定性；仅作政策背景。" }
];

fs.writeFileSync(reportPath, `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  baselineTieOut: baseline.quotes.filter((item) => item.tieOut).length,
  intradayValid: intraday.quotes.filter((item) => item.valid).length,
  silverSameDatePremium: Number(silverSameDatePremium.toFixed(2)),
  silverCrossDatePremium: Number(silverCrossDatePremium.toFixed(2)),
  hardRiskConfirmed: false,
  runtimeFunds: baseline.runtimeFunds.map((item) => `${item.symbol}:${item.status}`)
}, null, 2));
