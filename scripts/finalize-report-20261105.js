const fs = require("fs");
const vm = require("vm");

const reportPath = "report-data.js";
const snapshotPath = "scripts/market-snapshot-20261105.json";
const indexPath = "scripts/index-snapshot-20261105.json";
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(reportPath, "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const indexSnapshot = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const quotes = new Map(snapshot.quotes.map((item) => [item.symbol.slice(2), item]));
const fundRows = new Map(snapshot.funds.map((item) => [item.code, item.body?.Data?.LSJZList?.[0] || null]));

if (snapshot.quotes.length !== 13 || snapshot.quotes.some((item) => !item.tieOut || item.dataDate !== "2026-11-04")) {
  throw new Error("13-symbol 2026-11-04 quote/K-line tie-out is required");
}
if (snapshot.runtimeFunds.some((item) => item.status !== 501 || item.body?.ok !== false)) {
  throw new Error("runtime fund endpoints must remain explicit failures");
}
for (const row of indexSnapshot.rows) {
  const successful = row.providers.filter((provider) => provider.ok && provider.quote?.time?.startsWith("2026-11-04"));
  if (successful.length < 2) throw new Error(`${row.symbol} lacks two-provider index verification`);
}

const silverNavRow = fundRows.get("161226");
const openFundRow = fundRows.get("005827");
const silverQuote = quotes.get("161226");
if (silverNavRow?.FSRQ !== "2026-11-04" || openFundRow?.FSRQ !== "2026-11-04") {
  throw new Error("same-date 2026-11-04 fund NAVs are required");
}
const silverNav = Number(silverNavRow.DWJZ);
const silverPremium = (Number(silverQuote.close) / silverNav - 1) * 100;
if (silverPremium <= 8) throw new Error("161226 premium must be confirmed above the 8% hard-risk line");

const amount = (code, lots) => Number((quotes.get(code).close * lots * 100).toFixed(2));
const feeRatio = (value, fee = 5) => Number((fee / value * 100).toFixed(2));
const hkAmount = amount("159740", 3);
const goldAmount = amount("164701", 2);
const silverAmount = amount("161226", 2);
const liquorLots = Math.ceil(1000 / (quotes.get("161725").close * 100));
const liquorAmount = amount("161725", liquorLots);
const indexChange = (symbol) => Number(indexSnapshot.rows.find((row) => row.symbol === symbol).providers.find((provider) => provider.ok).quote.changePercent.toFixed(2));

data.date = "2026-11-05";
data.portfolioVersion = "portfolio-2026-11-05-premarket-fee-aware-v1";
data.time = "2026-11-05 08:33北京时点核验：13个场内持仓/观察标的均为11月4日真实收盘，且与独立日K末根日期、开高低收逐只一致。161226与005827均已披露11月4日净值；自有运行时基金接口仍返回501。盘前不把11月4日收盘写成实时行情。";
data.lastUpdated = "2026-11-05 08:33 北京时间（场内为11月4日真实收盘；基金为11月4日公开净值）";
data.logicUpdatedAt = "2026-11-05盘前（最新券商持仓、可卖份额与实际费率仍待核对）";
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
    { code: "161226", label: "溢价重新超过8%的合并退出复核", side: "sell", lots: 2, referencePrice: silverQuote.close, hardRiskExit: true },
    { code: "159740", label: "旧3手普通减仓复核", side: "sell", lots: 3, referencePrice: quotes.get("159740").close, hardRiskExit: false },
    { code: "164701", label: "旧2手普通减仓复核", side: "sell", lots: 2, referencePrice: quotes.get("164701").close, hardRiskExit: false },
    { code: "161725", label: `${liquorLots}手最低经济金额买入复核`, side: "buy", lots: liquorLots, referencePrice: quotes.get("161725").close, hardRiskExit: false }
  ]
};

data.oneLine = `结论：11月5日只处理161226硬风险，其他买0手、卖0手。11月4日场内收${silverQuote.close.toFixed(3)}、净值${silverNav.toFixed(4)}，同日静态溢价约${silverPremium.toFixed(2)}%，重新超过8%线；若券商确认仍持有旧2手，则合并卖2手，参考成交额约${silverAmount.toFixed(2)}元、单边费约5元/${feeRatio(silverAmount).toFixed(2)}%，费用闸门为“风险退出例外”。A股11月4日急涨后不追。仅供个人复盘参考。`;

data.tradeDecision = [
  {
    type: "第一屏结论",
    title: "仅161226重开硬退出；其余0手",
    conclusion: `已确认事实：161226在11月4日场内收${silverQuote.close.toFixed(3)}、单位净值${silverNav.toFixed(4)}，同日静态溢价约${silverPremium.toFixed(2)}%，高于8%硬风险线。`,
    action: `9:15先核对券商真实持仓。若旧2手仍在，合并卖2手，不拆单；参考成交额约${silverAmount.toFixed(2)}元，单边费约5元，费用占比约${feeRatio(silverAmount).toFixed(2)}%。扣费后收益空间不作为退出条件，目标是回避溢价回落风险；资金来源为该笔卖出，成交后留现金。`,
    trigger: "实际仍持有且最新可核验同日/最近净值口径溢价≥8%；若开盘价使溢价回落至≤8%，不追着卖，改为风险复核。",
    reason: "费用闸门结论为“风险退出例外”；手续费不能阻止明确LOF溢价风险，但真实持仓和券商费率仍须确认。没触发则卖0手。仅供个人复盘参考。"
  },
  {
    type: "市场总览",
    title: "急涨修复成立，追涨条件不成立",
    conclusion: `已确认事实：11月4日沪指+${indexChange("SH000001").toFixed(2)}%、深成指+${indexChange("SZ399001").toFixed(2)}%、创业板+${indexChange("SZ399006").toFixed(2)}%、科创50+${indexChange("SH000688").toFixed(2)}%，成交额重返2万亿元上方；半导体、贵金属领涨，白酒逆势回落。`,
    action: "除161226风险退出外，基金买0手、卖0手；不把单日急涨当作可核验预期收益。",
    trigger: "只有回踩不破11月4日开盘/低点、重新站上日高，且先有真实卖出资金、预期毛收益覆盖往返费用3倍并留出至少1%扣费后收益，才进入买入复核。",
    reason: "指数大涨提升风险偏好，但次日追价的赔率与资金来源均未通过。没触发则继续持有/观察。仅供个人复盘参考。"
  },
  {
    type: "费用闸门",
    title: "161226例外；两笔普通碎片单继续暂停",
    conclusion: `161226旧2手约${silverAmount.toFixed(2)}元/单边费约${feeRatio(silverAmount).toFixed(2)}%，因溢价>${8}%进入硬风险例外；159740旧3手约${hkAmount.toFixed(2)}元/${feeRatio(hkAmount).toFixed(2)}%，164701旧2手约${goldAmount.toFixed(2)}元/${feeRatio(goldAmount).toFixed(2)}%，仍未达1000元且费用占比超0.5%。`,
    action: "161226仅按真实剩余份额合并一次退出；159740、164701普通小单不下。",
    trigger: "159740/164701只有出现基本面失效、流动性异常或新的明确硬风控，才越过经济金额门。",
    reason: "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。"
  },
  {
    type: "新买入",
    title: "金额过门仍不买，新增买入0手",
    conclusion: `161725在11月4日跌1.86%收${quotes.get("161725").close.toFixed(3)}；${liquorLots}手约${liquorAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${feeRatio(liquorAmount, 10).toFixed(2)}%。`,
    action: "不买。161226若成交，卖出资金继续留现金；其余没有已成交资金来源。",
    trigger: `未来若有真实资金来源，预期毛收益至少需覆盖往返费用3倍（约${feeRatio(liquorAmount, 30).toFixed(2)}%），且扣费后预期收益率≥1%，再评估。`,
    reason: "目前缺少可核验预期毛收益，费用闸门结论为“缺少收益空间”。没触发则买0手。仅供个人复盘参考。"
  },
  {
    type: "外部市场",
    title: "美股普涨、油价大跌，但AI仍分化",
    conclusion: "已确认事实：11月4日美股S&P 500涨1.6%、道指涨3.0%、纳指涨1.4%；布油跌8.7%至94.62美元，美债10年期收益率由4.95%降至4.88%。英伟达反而跌3.2%。",
    action: "油价与利率回落只作风险偏好参考；港股科技、半导体、贵金属基金均不追开盘。",
    trigger: "若相关基金回踩守住11月4日低点并再次站上高点，且费用后收益证据与资金来源齐备，才复核；否则买0手。",
    reason: "宽基上涨与AI内部下跌并存，海外行情不能替代基金自身价格和费用门。仅供个人复盘参考。"
  }
];

data.executionOrder = [
  "1. 9:15核对券商最新成交、实际持仓与可卖份额；不存在的旧2手不得生成订单。",
  "2. 9:20复核161226最新净值/估值与申购状态；最近同日静态溢价约11.39%，高于8%硬风险线。",
  "3. 若实际仍有旧2手且溢价仍≥8%，合并卖2手；参考成交额301.40元、单边费约5元/1.66%，风险退出例外。",
  "4. 若开盘价使溢价回落至≤8%，取消161226卖单，只做风险复核；不得拆成多笔。",
  "5. 159740旧3手、164701旧2手继续暂停；普通费用门不通过。",
  "6. 其他基金与观察池买0手；任何卖出资金成交后先留现金。",
  "7. 网页若仍显示11月4日或接口失败，只视作最近真实收盘/失败态，不当作11月5日实时价格。"
];

data.tradePlan = [
  { title: "161226硬风险重新成立", basis: `11月4日场内${silverQuote.close.toFixed(3)}、净值${silverNav.toFixed(4)}，同日静态溢价约${silverPremium.toFixed(2)}%。`, inference: "溢价重新超过8%，普通费用门让位于风险退出。", conclusion: "实际仍有旧2手则合并卖2手；否则0手。", invalidCondition: "实际无持仓，或开盘价对应溢价回落至≤8%。" },
  { title: "A股急涨不等于次日可追", basis: "创业板涨6.40%、科创50涨9.92%，成交额放大至2万亿元上方。", inference: "反弹强度高，但次日追价缺少可核验收益空间。", conclusion: "所有新增买入0手。", invalidCondition: "回踩确认、资金来源和费用后收益证据同时成立。" },
  { title: "普通碎片单仍不经济", basis: `159740旧3手约${hkAmount.toFixed(2)}元、164701旧2手约${goldAmount.toFixed(2)}元。`, inference: "单边费用占比仍显著高于0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现基本面失效或明确硬风控。" },
  { title: "海外反弹内部仍分化", basis: "S&P 500涨1.6%，但英伟达跌3.2%；油价和长端利率明显回落。", inference: "宏观压力缓和不等于AI链全面转强。", conclusion: "科技和贵金属基金不追。", invalidCondition: "基金真实价格回踩后站稳日高且费用门通过。" },
  { title: "新买入缺少执行闭环", basis: "没有已成交资金来源与可核验预期毛收益。", inference: "金额超过1000元仍不能直接下单。", conclusion: "新增买入0手。", invalidCondition: "资金、实际费率、毛收益与扣费后收益四项证据齐备。" }
];

data.noTradeList = [
  "不把11月4日收盘写成11月5日实时行情；盘前只用作最近真实基线。",
  "不在未核对券商持仓时机械卖161226；不存在的份额不得下单。",
  "不把161226硬风险退出拆单；同一标的一次合并，避免重复最低佣金。",
  "不机械执行159740旧3手或164701旧2手普通卖单；费用闸门继续否决。",
  "不追A股急涨、美股反弹或任何单日板块热点；所有新增买入0手。",
  "不买股票观察池；股票只作基金板块温度计。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingViews = {
  "159740": { support: "0.467 / 跌破后复核", resistance: "0.483 / 0.490", action: `持有、不追涨；旧3手约${hkAmount.toFixed(2)}元、单边费约${feeRatio(hkAmount).toFixed(2)}%，普通减仓不下单`, invalidCondition: "跌破0.467并持续30分钟，或海外科技转弱", predictionScore: 6, predictionLabel: "反弹后防冲高回落", expectedDirection: "震荡偏强", reason: "11月4日涨2.11%并收日高，隔夜美股普涨但AI内部仍分化。", riskLevel: "中" },
  "164701": { support: "1.510 / 跌破后复核", resistance: "1.543 / 1.560", action: `持有、不追涨；旧2手约${goldAmount.toFixed(2)}元、单边费约${feeRatio(goldAmount).toFixed(2)}%，普通减仓不下单`, invalidCondition: "跌破1.510且贵金属转弱", predictionScore: 6, predictionLabel: "贵金属强势后震荡", expectedDirection: "震荡偏强", reason: "11月4日涨2.66%并收日高附近，油价与美债收益率回落提供支撑。", riskLevel: "中" },
  "512710": { support: "0.593 / 跌破后复核", resistance: "0.616 / 0.625", action: "持有、不追涨；回踩0.593不破且站回0.616只进入复核，新买0手", invalidCondition: "跌破0.593或科技反弹失速", predictionScore: 6, predictionLabel: "科技急涨后分化", expectedDirection: "震荡偏强", reason: "11月4日涨2.00%，但弱于科创50，次日需验证相对强度。", riskLevel: "中" },
  "161226": { support: "1.407 / 硬风险复核", resistance: "1.508 / 溢价复核", action: `同日溢价约${silverPremium.toFixed(2)}%，高于8%硬风险线；实际仍有旧2手则合并退出，参考额${silverAmount.toFixed(2)}元/费约5元`, invalidCondition: "实际无持仓或开盘溢价回落至≤8%", predictionScore: 3, predictionLabel: "场内急涨、溢价失控", expectedDirection: "高波动偏弱", reason: `净值跌${Math.abs(Number(silverNavRow.JZZZL)).toFixed(2)}%、场内涨6.50%，同日溢价扩大至${silverPremium.toFixed(2)}%。`, riskLevel: "高" },
  "159608": { support: "0.797 / 跌破后复核", resistance: "0.844 / 0.855", action: "持有、不追涨；回踩0.797不破并站回0.844只进入复核，新买0手", invalidCondition: "跌破0.797或稀有金属反弹失速", predictionScore: 6, predictionLabel: "强反弹后震荡", expectedDirection: "震荡偏强", reason: "11月4日涨4.84%并收日高，次日追价风险高。", riskLevel: "中高" },
  "159241": { support: "0.943 / 跌破后复核", resistance: "0.988 / 1.000", action: "持有、不追涨；站稳0.988只进入复核，新买0手", invalidCondition: "跌破0.943或军工链转弱", predictionScore: 6, predictionLabel: "反弹待延续确认", expectedDirection: "震荡偏强", reason: "11月4日涨2.71%，但隔夜美国军工股承压。", riskLevel: "中" },
  "562350": { support: "1.078 / 跌破后复核", resistance: "1.093 / 1.100", action: "持有、不加仓；弱于大盘，普通碎片单不下", invalidCondition: "跌破1.078或政策预期转弱", predictionScore: 4, predictionLabel: "逆势偏弱", expectedDirection: "震荡偏弱", reason: "11月4日跌0.37%，未跟随宽基急涨。", riskLevel: "中高" },
  "002090": { support: "7.86 / 股票观察", resistance: "8.18 / 8.30", action: "仅观察，不新增股票买卖指令；用于判断电网设备风险", invalidCondition: "跌破7.86或盈利质量恶化", predictionScore: 6, predictionLabel: "反弹收高", expectedDirection: "震荡偏强", reason: "11月4日涨2.90%，收盘接近日高。", riskLevel: "中" }
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
    lastSource: `自有代理${quote.source}真实收盘与独立${quote.directVerification?.provider || quote.klineSource}日K交叉核对，2026-11-04；mode=closed`
  });
}

const watchViews = {
  "601208": { status: "涨停修复，股票不买", reason: "11月4日涨10.01%，仅作新材料与科技风险偏好信号。", buyTrigger: "股票不买；基金端需回踩29.16不破并通过费用门", avoidReason: "单日涨停且可执行建议限定基金", risk: "跌破29.16", support: "29.16", resistance: "33.31", invalidCondition: "跌破29.16", predictionScore: 6, predictionLabel: "涨停后高波动", expectedDirection: "震荡偏强", riskLevel: "高" },
  "600050": { status: "逆市回落，股票不买", reason: "11月4日跌1.76%，与科技宽基急涨明显背离。", buyTrigger: "股票不买；基金端需站回4.56并通过费用门", avoidReason: "相对强度转弱且无基金端资金证据", risk: "跌破4.45", support: "4.45", resistance: "4.56", invalidCondition: "放量站稳4.56", predictionScore: 3, predictionLabel: "相对弱势", expectedDirection: "震荡偏弱", riskLevel: "中高" },
  "002466": { status: "锂矿反弹，股票不买", reason: "11月4日涨3.28%，只作稀有金属基金验证。", buyTrigger: "股票不买；站稳36.22后只复核基金", avoidReason: "无费用后收益证据", risk: "跌破34.45", support: "34.45", resistance: "36.22", invalidCondition: "跌破34.45", predictionScore: 6, predictionLabel: "反弹待确认", expectedDirection: "震荡偏强", riskLevel: "中" },
  "688981": { status: "大涨9%，股票不买", reason: "11月4日涨9.00%，与科创50共振但次日追价风险高。", buyTrigger: "股票不买；回踩101.24不破后只复核半导体基金", avoidReason: "单日急涨且无资金与收益证据", risk: "跌破101.24", support: "101.24", resistance: "111.82", invalidCondition: "跌破101.24", predictionScore: 6, predictionLabel: "急涨后高波动", expectedDirection: "震荡偏强", riskLevel: "高" },
  "161725": { status: "白酒逆势回落，不买", reason: "11月4日跌1.86%，与科技和贵金属强势背离。", buyTrigger: "真实回踩0.575不破并站回0.593，且先有成交资金与费用后收益证据", avoidReason: `${liquorLots}手约${liquorAmount.toFixed(2)}元、往返最低费约10元；当前无资金来源和预期毛收益`, risk: "跌破0.575", support: "0.575", resistance: "0.593", invalidCondition: "跌破0.575或资金来源缺失", predictionScore: 4, predictionLabel: "相对偏弱", expectedDirection: "震荡偏弱", riskLevel: "中" },
  "005827": { status: "11月4日净值已披露，运行时接口失败", reason: `11月4日净值${Number(openFundRow.DWJZ).toFixed(4)}、日涨${Number(openFundRow.JZZZL).toFixed(2)}%；仅作dated NAV。`, buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据", avoidReason: "运行时/api/fund仍为501，不能伪装实时", risk: "净值披露滞后或接口失败", support: "按净值披露", resistance: "不设盘中价", invalidCondition: "运行时真实基金接口接通并通过校验", predictionScore: 6, predictionLabel: "净值反弹、接口失败", expectedDirection: "震荡偏强", riskLevel: "中" }
};

for (const item of data.watchlist) {
  Object.assign(item, watchViews[item.code]);
  if (item.code === "005827") {
    Object.assign(item, { lastTradeDate: openFundRow.FSRQ, lastOpen: null, lastClose: Number(openFundRow.DWJZ), lastHigh: null, lastLow: null, lastChangePercent: Number(openFundRow.JZZZL), lastSource: "东方财富基金11月4日公开净值；自有运行时/api/fund HTTP 501，mode=failed" });
  } else {
    const quote = quotes.get(item.code);
    Object.assign(item, { lastTradeDate: quote.dataDate, lastOpen: quote.open, lastClose: quote.close, lastHigh: quote.high, lastLow: quote.low, lastChangePercent: Number(Number(quote.changePercent).toFixed(2)), lastSource: `自有代理${quote.source}真实收盘与独立${quote.directVerification?.provider || quote.klineSource}日K交叉核对，2026-11-04；mode=closed` });
  }
}

data.newsItems = [
  { title: "A股急涨，科创50接近10%", source: "自有三源行情 / 东方财富Choice", publishTime: "2026-11-04 15:22:00+08:00", summary: "已确认事实：沪指+2.16%、深成指+4.22%、创业板+6.40%、科创50+9.92%，成交额超2万亿元，半导体与贵金属领涨。基于事实的判断：风险偏好修复，但次日不追单日急涨。", relatedStocks: ["512710", "159608", "688981", "164701"], sector: "过去24小时 / 全市场重大利好与风险 / A股急涨", relation: "market", url: "https://fund.eastmoney.com/a/202611043921903739.html" },
  { title: "稳市工具继续加力，回购增持再贷款利率降至1%", source: "中国人民银行信息 / 东方财富", publishTime: "2026-11-04 15:00:00+08:00", summary: "已确认事实：自11月4日起股票回购增持再贷款利率下调0.25个百分点至1%，支持比例100%。基于事实的判断：政策改善流动性预期，但不能替代标的价格、资金与费用后收益证据。", relatedStocks: ["512710", "159241", "159740", "562350"], sector: "过去24小时 / 全市场重大利好 / 稳市政策", relation: "market", url: "https://fund.eastmoney.com/a/202611043921903739.html" },
  { title: "美股普涨、油价大跌，AI内部仍分化", source: "AP", publishTime: "2026-11-05 06:20:00+08:00", summary: "已确认事实：S&P 500+1.6%、道指+3.0%、纳指+1.4%；布油跌8.7%至94.62美元，10年期美债收益率降至4.88%，英伟达跌3.2%。基于事实的判断：宏观压力缓和，但AI基金不直接追涨。", relatedStocks: ["159740", "512710", "688981", "164701"], sector: "过去24小时 / 全市场重大利好与分化 / 海外市场", relation: "market", url: "https://apnews.com/article/stock-markets-ai-earnings-oil-4d12764c0b3ce38ffde3077712811182" },
  { title: `161226同日溢价扩大至约${silverPremium.toFixed(2)}%`, source: "东方财富基金 / 自有代理", publishTime: "2026-11-05 08:33:00+08:00", summary: `已确认事实：11月4日净值${silverNav.toFixed(4)}、场内收${silverQuote.close.toFixed(3)}，同日静态溢价约${silverPremium.toFixed(2)}%，高于8%硬风险线。基于事实的判断：若实际旧2手仍在，按真实份额合并退出；费用不阻止硬风控。`, relatedStocks: ["161226"], sector: "持仓 / 白银LOF / 溢价风险", relation: "risk", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10" },
  { title: "005827净值反弹，运行时接口仍为501", source: "东方财富基金 / 自有代理", publishTime: "2026-11-05 08:33:00+08:00", summary: `已确认事实：11月4日净值${Number(openFundRow.DWJZ).toFixed(4)}、日涨${Number(openFundRow.JZZZL).toFixed(2)}%；自有/api/fund仍返回501。基于事实的判断：只保留dated NAV，不提供盘中K线，不新增。`, relatedStocks: ["005827"], sector: "持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" },
  { title: "科技与稀有金属基金反弹，白酒和央企红利背离", source: "自有代理 / 独立日K", publishTime: "2026-11-04 16:15:00+08:00", summary: "已确认事实：159608涨4.84%、159241涨2.71%、512710涨2.00%；562350跌0.37%、161725跌1.86%。基于事实的判断：板块轮动快，单日强弱不能直接转成追涨或碎片减仓。", relatedStocks: ["159608", "159241", "512710", "562350", "161725"], sector: "过去24小时 / 持仓关联 / 板块分化", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ159608" },
  { title: "601208涨停修复、688981大涨9%", source: "自有代理 / 独立日K", publishTime: "2026-11-04 16:15:00+08:00", summary: "已确认事实：601208涨10.01%、688981涨9.00%，而600050跌1.76%。基于事实的判断：股票只作基金板块温度计，不生成股票订单。", relatedStocks: ["601208", "688981", "600050", "512710"], sector: "过去24小时 / 观察池 / 科技分化", relation: "market", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH688981" },
  { title: "贵金属强势，但白银LOF净值与场内价格背离", source: "自有代理 / 东方财富基金", publishTime: "2026-11-05 08:33:00+08:00", summary: "已确认事实：164701涨2.66%，161226场内涨6.50%而净值跌0.13%。基于事实的判断：白银LOF的主要风险是溢价而非手续费，黄金基金普通碎片单仍受费用门约束。", relatedStocks: ["164701", "161226"], sector: "过去24小时 / 持仓关联 / 贵金属", relation: "risk", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226" },
  { title: "13个场内标的真实收盘全部通过日K核对", source: "自有代理 / 独立日K", publishTime: "2026-11-05 08:33:00+08:00", summary: "已确认事实：13/13报价日期均为11月4日，非零OHLC与独立日K末根一致；基金运行时端点保持HTTP 501失败态。基于事实的判断：11月4日值仅作最近真实收盘基线，不能冒充11月5日实时行情。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "数据校验 / 持仓 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710" }
];

data.reasoning = [
  { title: "161226硬退出重新成立", basis: `同日场内${silverQuote.close.toFixed(3)}、净值${silverNav.toFixed(4)}，静态溢价约${silverPremium.toFixed(2)}%。`, inference: "超过8%后，溢价回落风险高于最低佣金损耗。", conclusion: "实际仍有旧2手则合并退出。", invalidCondition: "实际无持仓或开盘溢价回落至≤8%。" },
  { title: "急涨修复不是追涨证据", basis: "创业板+6.40%、科创50+9.92%，成交额重返2万亿元上方。", inference: "反弹强但次日盈亏比未被验证。", conclusion: "新增买入0手。", invalidCondition: "回踩确认、资金来源和费用后收益证据同时成立。" },
  { title: "海外宏观缓和但AI分化", basis: "美股宽基上涨、油价和长端利率回落，但英伟达跌3.2%。", inference: "外部条件改善不等于科技链全面反转。", conclusion: "科技基金不追开盘。", invalidCondition: "基金真实价格回踩后再创新高且费用门通过。" },
  { title: "普通碎片单仍不经济", basis: "159740旧3手、164701旧2手均不足1000元且单边费用占比超0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "触价只复核，不下单。", invalidCondition: "出现明确硬风险。" },
  { title: "新买入缺少资金与收益闭环", basis: "没有已成交资金来源和可核验预期毛收益。", inference: "指数急涨不能替代费用后收益证明。", conclusion: "所有新增买入0手。", invalidCondition: "资金、费率、毛收益与扣费后收益四项证据齐备。" }
];

data.invalidConditions = [
  "161226实际无持仓，或开盘价对应溢价回落至≤8%：取消卖出，只做风险复核。",
  "最新券商持仓与旧计划不一致：任何旧手数示例立即失效，按真实可卖份额一次合并重算。",
  "159740/164701只有普通价格触发且订单仍<1000元或单边费率>0.5%：取消下单，只做风险复核。",
  "任何买入缺少已成交资金、券商实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
  "网页出现0价、11月4日旧时间戳却标实时、失败态或来源校验失败：取消基于网页价格的执行，只看券商真实行情。"
];

data.cancelPlan = [
  "9:15先查最新成交与持仓；实际不存在的161226份额不得生成卖单。",
  "9:20复核161226申购状态与最新净值/估值；溢价≤8%则取消硬退出。",
  "竞价或开盘一分钟的瞬时跳空不直接成交；先用券商真实价格确认。",
  "卖出没有真实成交前，不把资金写入任何买入计划；成交后也先留现金。",
  "真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
];

data.learningFramework = [
  { title: "报价与日K必须同日核对", basis: "13个场内标的11月4日OHLC全部与独立日K末根一致。", inference: "只有日期与OHLC校验通过的数据才能进入报告。", conclusion: "以11月4日收盘作11月5日盘前基线。", invalidCondition: "11月5日真实行情到达。" },
  { title: "LOF硬风险按同日溢价重算", basis: `161226的11月4日场内${silverQuote.close.toFixed(3)}和净值${silverNav.toFixed(4)}同日可比，溢价约${silverPremium.toFixed(2)}%。`, inference: "重新超过8%后，硬风险例外恢复。", conclusion: "按真实剩余份额合并退出。", invalidCondition: "开盘溢价回落至≤8%或实际无持仓。" },
  { title: "费用门不阻止硬风险", basis: `旧2手参考额${silverAmount.toFixed(2)}元、单边费占比约${feeRatio(silverAmount).toFixed(2)}%。`, inference: "普通调仓不经济，但明确溢价风险可以越过金额门。", conclusion: "一次合并，不拆单。", invalidCondition: "硬风险条件失效。" },
  { title: "强反弹不自动产生买单", basis: "政策加力与指数急涨已确认。", inference: "仍需价格回踩、资金来源和费用后收益同时成立。", conclusion: "新增买入0手。", invalidCondition: "四项条件同时满足。" },
  { title: "股票只作板块温度计", basis: "601208与688981大涨，600050逆势下跌，科技内部仍分化。", inference: "个股信号用于验证基金方向，不生成股票订单。", conclusion: "观察池股票不买。", invalidCondition: "无。" }
];

data.nextWatch = [
  "9:15：核对最新成交、161226实际持仓和可卖份额。",
  "9:20：复核161226最新净值/估值；溢价≥8%且实际仍有旧2手才合并卖2手。",
  "9:30后：若161226开盘对应溢价≤8%，取消卖出；不要追着成交。",
  "10:00：看512710的0.593、159608的0.797、159241的0.943；跌破只复核，普通碎片单不下。",
  "全天：关注A股科技急涨后的承接、美股AI分化、油价与美债收益率；其余基金不追。",
  "15:00后：记录11月5日真实收盘与基金净值，重算161226同日溢价和费用闸门。"
];

data.quoteWatchlist = data.watchlist.map((item) => ({ name: item.name, code: item.code, symbol: item.symbol, market: item.market, type: item.type, sector: item.sector, support: item.support, resistance: item.resistance }));
data.sources = [
  { name: "本次运行：13个场内标的收盘与日K核验", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710", note: "2026-11-05 08:33：13/13返回非零11月4日真实收盘，状态closed；报价与独立日K末根日期、开高低收一致。" },
  { name: "自有代理基金端点失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "2026-11-05运行时SZ161226与OF005827均返回HTTP 501；页面显示失败态，开放式基金不提供盘中K线。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月4日单位净值${silverNav.toFixed(4)}、日跌${Math.abs(Number(silverNavRow.JZZZL)).toFixed(2)}%、暂停申购；相对同日场内收盘${silverQuote.close.toFixed(3)}的静态溢价约${silverPremium.toFixed(2)}%，高于8%硬风险线。` },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月4日单位净值${Number(openFundRow.DWJZ).toFixed(4)}、日涨${Number(openFundRow.JZZZL).toFixed(2)}%；运行时接口仍失败。` },
  { name: "三源交叉核验：11月4日A股指数", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ399006", note: "Sina/Tencent/Eastmoney至少两源核对：沪指+2.16%、深成指+4.22%、创业板+6.40%、科创50+9.92%。" },
  { name: "东方财富Choice：11月4日A股收盘", url: "https://fund.eastmoney.com/a/202611043921903739.html", note: "成交额超2万亿元，半导体、贵金属领涨，白酒逆势走弱；同文记录回购增持再贷款利率降至1%。" },
  { name: "AP：11月4日美股、油价与美债", url: "https://apnews.com/article/stock-markets-ai-earnings-oil-4d12764c0b3ce38ffde3077712811182", note: "S&P 500+1.6%、道指+3.0%、纳指+1.4%；布油跌8.7%至94.62美元，10年期美债收益率降至4.88%，英伟达跌3.2%。" },
  { name: "金融界：161226场内收盘复核", url: "https://summary.jrj.com.cn/stock/sz/161226", note: `11月4日场内收盘${silverQuote.close.toFixed(3)}、涨6.50%，与自有代理一致。` }
];

fs.writeFileSync(reportPath, `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  quoteTieOut: snapshot.quotes.filter((item) => item.tieOut).length,
  silverPremium: Number(silverPremium.toFixed(2)),
  silverHardRisk: true,
  runtimeFunds: snapshot.runtimeFunds.map((item) => `${item.symbol}:${item.status}`)
}, null, 2));
