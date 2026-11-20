const fs = require("fs");
const vm = require("vm");

const reportPath = "report-data.js";
const market = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261120.json", "utf8"));
const indexes = JSON.parse(fs.readFileSync("scripts/index-snapshot-20261120.json", "utf8"));
const longbridge = JSON.parse(fs.readFileSync("scripts/longbridge-snapshot-20261120.json", "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(reportPath, "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;

const round = (value, digits = 2) => Number(Number(value).toFixed(digits));
const pct = (last, previous) => (Number(last) / Number(previous) - 1) * 100;
const money = (price, lots) => round(Number(price) * 100 * lots, 2);
const feeRatio = (amount, fee = 5) => round(fee / amount * 100, 2);
const signed = (value) => `${value > 0 ? "+" : ""}${Number(value).toFixed(2)}%`;

if (market.expectedDate !== "2026-11-20" || market.quotes.length !== 13) throw new Error("11/20 market snapshot incomplete");
if (!market.quotes.every((row) => row.tieOut && row.consensusCount >= 2 && row.bar.time === "2026-11-20")) {
  throw new Error("11/20 quote/date/OHLC consensus failed");
}
if (longbridge.quotes.length !== 13 || longbridge.quotes.some((row) => !row.last || !row.prevClose || row.timestamp !== "2026-11-20T15:00:00+08:00")) {
  throw new Error("11/20 Longbridge close snapshot invalid");
}
const baseBySymbol = new Map(market.quotes.map((row) => [row.symbol, row]));
const liveBySymbol = new Map(longbridge.quotes.map((row) => [row.symbol, row]));
for (const [symbol, row] of liveBySymbol) {
  const bar = baseBySymbol.get(symbol)?.bar;
  if (!bar || Math.abs(Number(bar.close) - Number(row.last)) > 0.0006) throw new Error(`Longbridge/daily close mismatch: ${symbol}`);
}
const latestFund = (code) => market.funds.find((row) => row.code === code)?.body?.Data?.LSJZList?.[0];
const silverNavRow = latestFund("161226");
const openFundRow = latestFund("005827");
if (silverNavRow?.FSRQ !== "2026-11-20" || openFundRow?.FSRQ !== "2026-11-20") throw new Error("11/20 NAV missing");
if (market.runtimeFunds.some((row) => row.status !== 501 || row.body?.ok !== false || row.body?.mode !== "failed")) {
  throw new Error("runtime fund failure state changed");
}
const indexChange = {};
for (const row of indexes.rows) {
  const valid = row.providers.filter((provider) => provider.ok && provider.quote?.time?.startsWith("2026-11-20"));
  if (valid.length < 2) throw new Error(`index lacks two-provider support: ${row.symbol}`);
  const values = valid.map((provider) => Number(provider.quote.changePercent));
  if (Math.max(...values) - Math.min(...values) > 0.02) throw new Error(`index provider conflict: ${row.symbol}`);
  indexChange[row.symbol] = round(values[0], 2);
}

const q = (symbol) => liveBySymbol.get(symbol);
const change = (symbol) => round(pct(q(symbol).last, q(symbol).prevClose), 2);
const silverClose = q("SZ161226").last;
const silverNav = Number(silverNavRow.DWJZ);
const sameDatePremium = pct(silverClose, silverNav);
const silverAmount = money(silverClose, 2);
const hkAmount = money(q("SZ159740").last, 3);
const goldAmount = money(q("SZ164701").last, 2);
const minBuyLots = Math.ceil(1000 / (q("SZ161725").last * 100));
const minBuyAmount = money(q("SZ161725").last, minBuyLots);
const minBuyRoundTripRate = feeRatio(minBuyAmount, 10);
const minBuyGrossEdge = round(Math.max(minBuyRoundTripRate * 3, minBuyRoundTripRate + 1), 2);

data.date = "2026-11-23";
data.portfolioVersion = "portfolio-2026-11-23-premarket-from-20261120-close-fee-aware-v1";
data.time = "2026-11-20 22:53周末版：面向11月23日开盘。13个场内持仓/观察标的均为11月20日15:00真实收盘，Longbridge收盘与新浪、腾讯、东方财富至少两源日K逐项一致；161226与005827为11月20日公开净值。";
data.lastUpdated = "2026-11-20 22:53 北京时间（场内标的为11月20日真实收盘；基金为11月20日公开净值；周末不刷新为实时行情）";
data.logicUpdatedAt = "2026-11-20收盘后 / 11月23日盘前计划（券商持仓、订单、成交接口仍为OAuth 403308）";
data.transactionCostPolicy.candidateOrders = [
  { code: "161226", label: "历史2手溢价硬风险复核（实际持仓未授权）", side: "sell", lots: 2, referencePrice: silverClose, hardRiskExit: false },
  { code: "159740", label: "历史3手普通减仓复核", side: "sell", lots: 3, referencePrice: q("SZ159740").last, hardRiskExit: false },
  { code: "164701", label: "历史2手普通减仓复核", side: "sell", lots: 2, referencePrice: q("SZ164701").last, hardRiskExit: false },
  { code: "161725", label: `${minBuyLots}手最低经济金额买入复核`, side: "buy", lots: minBuyLots, referencePrice: q("SZ161725").last, hardRiskExit: false }
];

data.oneLine = `11月23日盘前买0手、卖0手。161226在11月20日收${silverClose.toFixed(3)}、净值${silverNavRow.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%，重新高于8%硬风险线；但实际持仓无法核验，周一须先确认份额并用最新同日数据重算。仅供个人复盘参考。`;
data.tradeDecision = [
  { type: "第一屏结论", title: "周一先核仓；买0手、卖0手", conclusion: `已确认事实：11月20日A股放量普跌，161226同日静态溢价约${sameDatePremium.toFixed(2)}%；账户持仓、挂单和成交仍无法读取。`, action: "周一不开盘即下单。先核对真实持仓与可卖份额，再用最新可验证IOPV/净值重算161226溢价；未核验则卖0手。", trigger: "实际持仓存在 + 最新可靠同日溢价≥8% + 真实报价有效；三项齐备后才把全部实际可卖份额合并为一笔硬风险退出复核。", reason: "费用可为硬风险让路，但账户证据和同日口径不能省。仅供个人复盘参考。" },
  { type: "市场风险", title: "放量普跌；普通调仓不抢反弹", conclusion: `已确认事实：上证${signed(indexChange.SH000001)}、深成指${signed(indexChange.SZ399001)}、创业板${signed(indexChange.SZ399006)}、科创50${signed(indexChange.SH000688)}；全市场超过5200只股票下跌。`, action: "周一不补仓、不追反弹；持仓跌破11月20日低点只进入风险复核。", trigger: "至少先看到主要指数止跌、基金自身收复11月20日高点，且资金与费用后收益证据齐备。", reason: "11月20日是放量下跌而非缩量震荡，风险优先级高于抄底。仅供个人复盘参考。" },
  { type: "费用闸门", title: "三笔历史碎片单仍全部暂停", conclusion: `按11月20日收盘：161226历史2手约${silverAmount.toFixed(2)}元/单边费${feeRatio(silverAmount).toFixed(2)}%，159740历史3手约${hkAmount.toFixed(2)}元/${feeRatio(hkAmount).toFixed(2)}%，164701历史2手约${goldAmount.toFixed(2)}元/${feeRatio(goldAmount).toFixed(2)}%；普通订单均不经济。`, action: "159740与164701不下碎片单；161226只有在实际持仓与硬风险同时确认后才可越过金额门，并一次完成。", trigger: "普通波动保持0手；基本面失效、流动性异常或可靠同日溢价≥8%才进入硬风险复核。", reason: "暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。" },
  { type: "新买入", title: "白酒基金金额门可过，资金与收益门失败", conclusion: `161725按${minBuyLots}手约${minBuyAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${minBuyRoundTripRate.toFixed(2)}%；可核验毛收益至少需${minBuyGrossEdge.toFixed(2)}%，且扣费后不少于1%。`, action: "不买。没有已成交卖出资金，也没有可靠收益空间证据。", trigger: `周一站稳0.573，同时真实资金已到账、预期毛收益≥${minBuyGrossEdge.toFixed(2)}%、扣费后≥1%，才重新评估。`, reason: "价格触发不能替代资金门和收益门。仅供个人复盘参考。" },
  { type: "相对强弱", title: "中芯与联通逆势，但股票仍只观察", conclusion: `已确认事实：688981收涨${change("SH688981").toFixed(2)}%、600050收涨${change("SH600050").toFixed(2)}%，其余多数观察标的下跌。`, action: "不买股票，不把两只个股强势外推为基金普涨；只用作科技、通信板块温度计。", trigger: "相关基金自身收复11月20日高点且通过资金、费用、收益三门，才进入基金端评估。", reason: "个股相对强势与可执行基金信号是两件事。仅供个人复盘参考。" }
];
data.executionOrder = [
  "1. 周一开盘前先在券商端核对真实持仓、可卖份额、挂单、成交和实际费率；网页无法读取这些账户数据。",
  `2. 161226的11月20日同日静态溢价约${sameDatePremium.toFixed(2)}%，已重新越过8%；但必须用周一最新同日IOPV/净值再次确认。`,
  "3. 若实际不再持有161226，或周一同日溢价低于8%，卖0手；若两项均确认，按全部实际可卖份额一次合并复核，避免拆单。",
  "4. 159740历史3手与164701历史2手继续暂停：普通费用门不通过。",
  "5. 其余基金新增买入0手；未成交卖出不得写成资金来源，真实卖出后也先留现金。",
  "6. 股票条目只作板块温度计，不生成股票订单。",
  "7. 周末页面只显示最后真实收盘时间；运行时接口失败时不画假线或假K线。"
];
data.tradePlan = [
  { title: "161226硬风险信号重新出现", basis: `11月20日场内收${silverClose.toFixed(3)}、净值${silverNavRow.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%。`, inference: "已越过8%风险线，但周一价格与IOPV会变化，历史2手也未获账户确认。", conclusion: "盘前卖0手；先核仓并重算，确认后才合并退出。", invalidCondition: "实际无持仓，或最新可靠同日溢价回落至8%以下。" },
  { title: "放量普跌压过单点强势", basis: `深成指${signed(indexChange.SZ399001)}、创业板${signed(indexChange.SZ399006)}，仅688981和600050逆势。`, inference: "市场广度与成长风格仍弱，单点强势没有扩散。", conclusion: "基金不补、股票不买。", invalidCondition: "主要指数止跌且目标基金收复11月20日高点。" },
  { title: "普通碎片单仍不经济", basis: `159740历史3手约${hkAmount.toFixed(2)}元，164701历史2手约${goldAmount.toFixed(2)}元。`, inference: "最低佣金占比显著超过0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现明确硬风险。" },
  { title: "贵金属先看去杠杆是否结束", basis: `164701跌${Math.abs(change("SZ164701")).toFixed(2)}%、161226跌${Math.abs(change("SZ161226")).toFixed(2)}%，SHFE白银当日跌约7.11%。`, inference: "底层资产与场内价格同步承压，抢反弹的费用后收益没有证据。", conclusion: "黄金LOF不追；白银LOF只处理溢价风险。", invalidCondition: "贵金属止跌且基金折溢价、资金、费用证据同时改善。" }
];
data.noTradeList = [
  "不把11月20日收盘数据写成周末实时行情。",
  "不在券商持仓接口未授权时机械卖历史2手。",
  "不把11月20日溢价直接当作11月23日可执行溢价。",
  "不执行159740历史3手或164701历史2手普通碎片卖单。",
  "不因688981或600050逆势上涨买股票或追科技基金。",
  "不把计划卖出当作已到账资金；新增买入0手。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingMeta = {
  "159740": [2, "港股科技弱势", "偏弱", "恒生科技周线创逾两年低位，ETF收在日内低点。", "高", `持有、不补；历史3手约${hkAmount.toFixed(2)}元、单边费约${feeRatio(hkAmount).toFixed(2)}%，普通减仓暂停`],
  "164701": [2, "黄金去杠杆", "偏弱", "境内外贵金属同步下跌，LOF收跌。", "高", `持有、不追；历史2手约${goldAmount.toFixed(2)}元、单边费约${feeRatio(goldAmount).toFixed(2)}%，普通减仓暂停`],
  "512710": [2, "军工承压", "偏弱", "收跌并接近日内低位，未见止跌确认。", "高", "持有、不补；跌破0.527只进入复核，新买0手"],
  "161226": [1, "溢价与底层双风险", "高风险", `同日静态溢价约${sameDatePremium.toFixed(2)}%，且白银大跌；先核仓再处理。`, "高", `盘前卖0手；历史2手约${silverAmount.toFixed(2)}元、单边费约${feeRatio(silverAmount).toFixed(2)}%，硬风险确认后才一次合并退出`],
  "159608": [2, "稀有金属偏弱", "偏弱", "收跌并靠近日内低点，资源品风险偏好下降。", "高", "持有、不补；跌破0.719只进入复核，新买0手"],
  "159241": [2, "航空航天弱势", "偏弱", "收跌且接近日内低点。", "高", "持有、不追；未收复0.844前新买0手"],
  "562350": [5, "电力相对抗跌", "震荡", "收盘持平且守住日内低点，但未形成买入证据。", "中高", "持有、不加仓；站稳1.098且三门齐备才复核"],
  "002090": [3, "电网设备震荡偏弱", "偏弱", "盘中反抽后收跌，股票只作基金环境参考。", "高", "仅观察，不新增股票买卖指令；用于判断电网设备风险"]
};
for (const item of data.holdings) {
  const row = q(item.symbol);
  const meta = holdingMeta[item.code];
  Object.assign(item, {
    support: `${row.low} / 11月20日低点`, resistance: `${row.high} / 11月20日高点`,
    lastTradeDate: "2026-11-20", lastOpen: row.open, lastClose: row.last, lastHigh: row.high, lastLow: row.low,
    lastChangePercent: change(item.symbol),
    lastSource: `Longbridge 2026-11-20 15:00真实收盘；新浪、腾讯、东方财富至少两源日K日期/OHLC一致；自有代理${baseBySymbol.get(item.symbol).proxy.body.mode}`,
    predictionScore: meta[0], predictionLabel: meta[1], expectedDirection: meta[2], reason: meta[3], riskLevel: meta[4], action: meta[5],
    invalidCondition: `跌破${row.low}且板块继续转弱；普通订单仍须通过费用闸门`
  });
}

const watchMeta = {
  "601208": [1, "高波动重挫，股票不买", "PCB材料日跌7.66%", "股票不买；基金端需站稳28.36并通过费用门", "跌幅大且仍无基金端确认", "高"],
  "600050": [6, "通信逆势，股票不买", "大盘普跌时收涨0.89%", "股票不买；基金端需站稳4.54并通过费用门", "相对强不等于可买基金", "中高"],
  "002466": [2, "锂股偏弱，股票不买", "收跌3.31%并接近日内低位", "股票不买；基金端需站稳32.69并通过费用门", "资源品风险偏好弱", "高"],
  "688981": [7, "半导体相对强，股票不买", `收涨${change("SH688981").toFixed(2)}%，但科创50下跌`, "股票不买；基金端先看相关ETF能否收复自身高点", "单点强势不等于基金趋势扩散", "高"],
  "161725": [3, "白酒偏弱，金额过门仍不买", `收跌${Math.abs(change("SZ161725")).toFixed(2)}%；${minBuyLots}手金额过门但缺资金和收益证据`, `站稳0.573，且先有成交资金、预期毛收益≥${minBuyGrossEdge.toFixed(2)}%和扣费后≥1%`, `${minBuyLots}手约${minBuyAmount.toFixed(2)}元、往返最低费约10元；无资金来源`, "中高"]
};
for (const item of data.watchlist.filter((row) => row.code !== "005827")) {
  const row = q(item.symbol);
  const meta = watchMeta[item.code];
  Object.assign(item, {
    status: meta[1], reason: meta[2], buyTrigger: meta[3], avoidReason: meta[4], risk: `跌破${row.low}`,
    support: String(row.low), resistance: String(row.high), invalidCondition: `跌破${row.low}`,
    lastTradeDate: "2026-11-20", lastOpen: row.open, lastClose: row.last, lastHigh: row.high, lastLow: row.low,
    lastChangePercent: change(item.symbol), lastSource: "Longbridge 11月20日15:00真实收盘；三源日K日期/OHLC一致",
    predictionScore: meta[0], predictionLabel: meta[1], expectedDirection: meta[0] >= 6 ? "偏强" : "偏弱", riskLevel: meta[5]
  });
}
const openFund = data.watchlist.find((row) => row.code === "005827");
Object.assign(openFund, {
  status: "11月20日净值已披露，运行时接口失败", reason: `11月20日净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；只作dated NAV。`,
  buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据", avoidReason: "运行时基金接口HTTP 501，不能伪装实时", risk: "净值披露滞后或接口失败",
  support: "按净值披露", resistance: "不设盘中价", invalidCondition: "运行时真实基金接口接通并通过校验",
  lastTradeDate: "2026-11-20", lastOpen: null, lastClose: Number(openFundRow.DWJZ), lastHigh: null, lastLow: null, lastChangePercent: Number(openFundRow.JZZZL),
  lastSource: "东方财富基金11月20日公开净值；运行时基金接口HTTP 501，mode=failed", predictionScore: 3, predictionLabel: "净值续跌、接口失败", expectedDirection: "震荡偏弱", riskLevel: "中高"
});

data.newsItems = [
  { title: "A股放量普跌，成长指数跌幅超过3%", source: "上交所 / Longbridge / 新浪 / 腾讯 / 东方财富", publishTime: "2026-11-20 16:15:00+08:00", summary: `已确认事实：上证${signed(indexChange.SH000001)}、深成指${signed(indexChange.SZ399001)}、创业板${signed(indexChange.SZ399006)}、科创50${signed(indexChange.SH000688)}，全市场超过5200只股票下跌。基于事实的判断：周一先防风险，不抢反弹。`, relatedStocks: ["159740", "512710", "159608", "159241", "688981"], sector: "过去24小时 / 全市场重大风险 / A股收盘", relation: "risk", url: "https://finance.sina.com.cn/jjxw/2026-11-20/doc-inizkizc5583458.shtml" },
  { title: "上证50逆势收涨0.45%，银行保险相对抗跌", source: "每日经济新闻 / 多源指数行情", publishTime: "2026-11-20 16:15:00+08:00", summary: "已确认事实：普跌当日上证50仍收涨0.45%，银行、保险居前。基于事实的判断：权重防御线是少数利好，但尚未扩散到现有基金，不据此追买。", relatedStocks: ["600050", "562350"], sector: "过去24小时 / 全市场重大利好 / 权重防御", relation: "market", url: "https://finance.sina.com.cn/jjxw/2026-11-20/doc-inizkizc5583458.shtml" },
  { title: `161226同日静态溢价约${sameDatePremium.toFixed(2)}%`, source: "东方财富基金 / 三源日K / Longbridge", publishTime: "2026-11-20 22:53:00+08:00", summary: `已确认事实：11月20日场内收${silverClose.toFixed(3)}、净值${silverNavRow.DWJZ}，同日静态溢价约${sameDatePremium.toFixed(2)}%，且暂停申购。基于事实的判断：风险线重新触发，但周一仍须先核仓并重算。`, relatedStocks: ["161226"], sector: "过去24小时 / 持仓重大风险 / 白银LOF", relation: "risk", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10" },
  { title: "恒生科技指数周线跌近8%，创逾两年低位", source: "东方财富 / 港股收盘", publishTime: "2026-11-20 17:07:00+08:00", summary: "已确认事实：恒生科技指数全周跌7.92%，收3511.14点，创2024年9月以来低位。基于事实的判断：159740弱势背景未结束，不补仓。", relatedStocks: ["159740"], sector: "过去24小时 / 全市场重大风险 / 港股科技", relation: "risk", url: "https://finance.eastmoney.com/a/202611203936166744.html" },
  { title: "贵金属继续去杠杆，SHFE白银跌约7.11%", source: "同花顺贵金属日报 / 每日经济新闻", publishTime: "2026-11-20 17:30:00+08:00", summary: "已确认事实：11月20日SHFE黄金跌约4.90%、SHFE白银跌约7.11%，现货金银亦承压。基于事实的判断：164701不抄底，161226只处理溢价与持仓风险。", relatedStocks: ["164701", "161226", "159608"], sector: "过去24小时 / 全市场重大风险 / 贵金属", relation: "risk", url: "https://invest.10jqka.com.cn/20261120/c682050267.shtml" },
  { title: "美股AI卖盘延续，周四纳指跌2.3%", source: "AP", publishTime: "2026-11-20 05:50:00+08:00", summary: "已确认事实：美股周四继续下跌，纳指跌2.3%；周五开盘科技卖压仍在。基于事实的判断：海外风险偏好继续压制港股科技和成长风格，周一不追科技基金。", relatedStocks: ["159740", "512710", "688981"], sector: "过去24小时 / 全市场重大风险 / 海外市场", relation: "risk", url: "https://apnews.com/article/2f178054aea79d282e5ccf8d62f26a28" },
  { title: "中芯国际逆势上涨，但科创50收跌", source: "Longbridge / 三源日K", publishTime: "2026-11-20 16:15:00+08:00", summary: `已确认事实：688981收涨${change("SH688981").toFixed(2)}%，科创50收跌${Math.abs(indexChange.SH000688).toFixed(2)}%。基于事实的判断：相对强势未扩散，股票不买，基金不追。`, relatedStocks: ["688981", "512710"], sector: "过去24小时 / 观察池 / 半导体", relation: "market", url: "https://finance.sina.com.cn/jjxw/2026-11-20/doc-inizkizc5583458.shtml" },
  { title: "13个场内标的收盘价与日K全部通过核验", source: "Longbridge / 新浪 / 腾讯 / 东方财富", publishTime: "2026-11-20 22:53:00+08:00", summary: "已确认事实：13/13均有11月20日15:00非零OHLC，且收盘与至少两家独立日K逐项一致；自有代理11个closed、2个failed。基于事实的判断：失败标的不由前端补造行情。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "过去24小时 / 数据校验 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226" },
  { title: "005827净值续跌，运行时基金接口仍失败", source: "东方财富基金 / 自有代理", publishTime: "2026-11-20 22:53:00+08:00", summary: `已确认事实：11月20日净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。`, relatedStocks: ["005827"], sector: "过去24小时 / 持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" }
];

data.reasoning = [
  { title: "161226先核仓再处理溢价", basis: `11月20日同日溢价约${sameDatePremium.toFixed(2)}%，但账户接口仍为OAuth 403308。`, inference: "硬风险信号成立不等于历史份额仍存在，周一溢价也会变化。", conclusion: "盘前卖0手；核仓且重算后才合并退出。", invalidCondition: "实际无持仓，或最新同日溢价低于8%。" },
  { title: "市场广度优先于单点强势", basis: `深成指${signed(indexChange.SZ399001)}、创业板${signed(indexChange.SZ399006)}，688981和600050逆势。`, inference: "两只个股强势不足以证明基金趋势转强。", conclusion: "股票不买，基金不追。", invalidCondition: "主要指数止跌且目标基金收复11月20日高点。" },
  { title: "普通碎片单仍不经济", basis: "161226历史2手、159740历史3手、164701历史2手均不足1000元且单边费用占比超过0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "普通触价只复核；硬风险另行处理。", invalidCondition: "出现并确认明确硬风险。" },
  { title: "账户证据是执行前置条件", basis: "券商持仓、订单和成交接口均返回OAuth 403308。", inference: "无法确认历史份额，也无法确认卖出回款。", conclusion: "盘前买卖均为0手。", invalidCondition: "用户在券商端完成核对。" }
];
data.invalidConditions = [
  "161226无法确认实际持仓，或最新可靠同日溢价低于8%：卖0手。",
  "最新券商持仓与历史示例不一致：历史手数立即失效，按真实可卖份额一次合并重算。",
  "159740或164701普通订单仍<1000元或单边费率>0.5%：只复核。",
  "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
  "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
];
data.cancelPlan = [
  "周一先查券商最新持仓与挂单；不存在的历史份额不得生成订单。",
  "161226只用最新可靠同日IOPV/净值重算；11月20日收盘溢价不直接变成周一订单。",
  "开盘跳空不直接成交，先确认真实价格、时间戳与流动性。",
  "卖出未真实成交前不写入买入资金；成交后也先留现金。",
  "运行时接口失败时不画假线、不显示假价、不把缓存写成实时。"
];
data.learningFramework = [
  { title: "周末页面只认最后真实收盘", basis: "13个场内标的均有11月20日15:00非零OHLC。", inference: "周末没有A股实时行情。", conclusion: "页面标明最近真实收盘和更新时间。", invalidCondition: "11月23日取得更新且通过校验的真实报价。" },
  { title: "LOF溢价必须同日比较", basis: `11月20日场内收${silverClose.toFixed(3)}、净值${silverNavRow.DWJZ}。`, inference: `同日静态溢价约${sameDatePremium.toFixed(2)}%，可用于风险复盘。`, conclusion: "周一仍需用最新同日口径重算。", invalidCondition: "取得更晚且可靠的同日数据。" },
  { title: "费用门先于普通调仓", basis: `三笔历史碎片单参考额${silverAmount.toFixed(2)}元、${hkAmount.toFixed(2)}元、${goldAmount.toFixed(2)}元。`, inference: "普通订单均未达到经济金额。", conclusion: "普通调仓暂停；硬风险经核仓后例外。", invalidCondition: "明确硬风险出现。" },
  { title: "资金来源必须已成交", basis: "账户成交接口未授权，无法证明有卖出回款。", inference: "计划卖出不是资金。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" },
  { title: "相对强势不等于可执行信号", basis: "688981与600050上涨，但成长指数与多数持仓下跌。", inference: "个股强势没有扩散到基金。", conclusion: "股票只观察，基金不追。", invalidCondition: "基金自身转强且费用后收益证据齐备。" }
];
data.nextWatch = [
  "11月23日09:15前：在券商端核对真实持仓、可卖份额、挂单和实际费率。",
  "09:25：检查自有代理是否返回真实时间戳；failed标的不按页面价格执行。",
  "09:30后：取得161226最新场内价与可靠同日IOPV/净值；溢价不足8%即卖0手。",
  "10:00：观察159740的0.429、512710的0.527、159241的0.815能否守住；跌破只复核。",
  "10:30：观察688981和600050强势能否扩散到基金端；股票仍不买、基金不追。",
  "收盘后：记录11月23日真实收盘并等待同日基金净值，再做溢价复盘。"
];
data.quoteWatchlist = data.watchlist.map((item) => ({ name: item.name, code: item.code, symbol: item.symbol, market: item.market, type: item.type, sector: item.sector, support: item.support, resistance: item.resistance }));
data.sources = [
  { name: "Longbridge：13个标的11月20日真实收盘", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226", note: "13/13返回11月20日15:00非零OHLC；收盘与三源日K逐项一致。" },
  { name: "11月20日三源日K一致性核验", url: "https://daily-briefing-blue.vercel.app/api/kline?symbol=SH512710&period=day", note: "新浪、腾讯、东方财富对13个标的11月20日OHLC形成至少两源一致，13/13通过；自有代理11个closed、2个failed。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月20日单位净值${silverNavRow.DWJZ}、日跌${Math.abs(Number(silverNavRow.JZZZL)).toFixed(2)}%；相对同日收盘${silverClose.toFixed(3)}的静态溢价约${sameDatePremium.toFixed(2)}%。` },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月20日单位净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；仅作dated NAV。` },
  { name: "运行时基金接口HTTP 501失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。" },
  { name: "上交所：11月16日至20日沪市市场运行情况", url: "https://www.sse.com.cn/aboutus/mediacenter/conference/c/10838542/files/42313bdc5e6d4878ae94d0c4c01877a1.pdf", note: "用于核对上证综指、科创50和周度市场运行。" },
  { name: "每日经济新闻：11月20日A股收盘", url: "https://finance.sina.com.cn/jjxw/2026-11-20/doc-inizkizc5583458.shtml", note: "上证-1.23%、深成指-3.09%、创业板-3.54%，超过5200只股票下跌。" },
  { name: "东方财富：11月20日港股收盘", url: "https://finance.eastmoney.com/a/202611203936166744.html", note: "恒生科技全周跌7.92%，创2024年9月以来低位。" },
  { name: "同花顺：11月20日黄金市场日报", url: "https://invest.10jqka.com.cn/20261120/c682050267.shtml", note: "SHFE黄金跌约4.90%、SHFE白银跌约7.11%，用于贵金属风险背景。" },
  { name: "AP：11月19日美股主要指数", url: "https://apnews.com/article/2f178054aea79d282e5ccf8d62f26a28", note: "纳指跌2.3%，AI相关卖压延续；用于海外风险背景。" }
];

fs.writeFileSync(reportPath, `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  quoteTieOut: market.quotes.filter((row) => row.tieOut).length,
  longbridgeQuotes: longbridge.quotes.length,
  indexChange,
  sameDatePremium: round(sameDatePremium, 2),
  candidateAmounts: { silverAmount, hkAmount, goldAmount, minBuyAmount },
  minBuyLots, minBuyGrossEdge,
  proxyModes: [...new Set(market.quotes.map((row) => row.proxy.body.mode))],
  runtimeFunds: market.runtimeFunds.map((row) => `${row.symbol}:${row.status}:${row.body.mode}`)
}, null, 2));
