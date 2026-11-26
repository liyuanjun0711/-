const fs = require("fs");
const vm = require("vm");

const reportPath = "report-data.js";
const snapshot = JSON.parse(fs.readFileSync("scripts/market-snapshot-20261126.json", "utf8"));
const indexes = JSON.parse(fs.readFileSync("scripts/index-snapshot-20261126.json", "utf8"));
const longbridge = JSON.parse(fs.readFileSync("scripts/longbridge-snapshot-20261126.json", "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(reportPath, "utf8"), context);
const data = context.window.MARKET_BRIEFING_DATA;

const round = (value, digits = 2) => Number(Number(value).toFixed(digits));
const pct = (last, previous) => (Number(last) / Number(previous) - 1) * 100;
const money = (price, lots) => round(Number(price) * 100 * lots, 2);
const feeRatio = (amount, fee = 5) => round(fee / amount * 100, 2);
const signed = (value) => `${value > 0 ? "+" : ""}${Number(value).toFixed(2)}%`;

if (snapshot.expectedDate !== "2026-11-26" || snapshot.quotes.length !== 13) throw new Error("11/26 snapshot incomplete");
if (!snapshot.quotes.every((row) => row.tieOut && row.consensusCount >= 2 && row.bar?.time === "2026-11-26")) {
  throw new Error("11/26 three-provider daily-K consensus failed");
}
if (!snapshot.quotes.every((row) => row.proxy.status === 200 && row.proxy.body?.ok === true && row.proxy.body?.mode === "closed" && row.proxy.matchesConsensus)) {
  throw new Error("11/26 own-proxy closed quote validation failed");
}
if (longbridge.quotes.length !== 13 || !longbridge.quotes.every((row) => row.dailyBarMatched && row.timestamp.startsWith("2026-11-26"))) {
  throw new Error("Longbridge quote/daily-bar evidence incomplete");
}
if (Object.values(longbridge.account).some((row) => row.error_code !== 403308)) throw new Error("account-scope evidence changed");
if (snapshot.runtimeFunds.some((row) => row.status !== 501 || row.body?.ok !== false || row.body?.mode !== "failed")) {
  throw new Error("runtime fund failure state changed");
}

const q = (symbol) => snapshot.quotes.find((row) => row.symbol === symbol).proxy.body;
const change = (symbol) => Number(q(symbol).changePercent);
const latestFund = (code) => snapshot.funds.find((row) => row.code === code)?.body?.Data?.LSJZList?.[0];
const silverNavRow = latestFund("161226");
const openFundRow = latestFund("005827");
if (silverNavRow?.FSRQ !== "2026-11-25" || openFundRow?.FSRQ !== "2026-11-25") throw new Error("11/25 NAV rows missing");

const indexChange = {};
for (const row of indexes.rows) {
  const valid = row.providers.filter((provider) => provider.ok && provider.quote?.time?.startsWith("2026-11-26"));
  if (valid.length < 2) throw new Error(`index lacks two-provider support: ${row.symbol}`);
  const values = valid.map((provider) => Number(provider.quote.changePercent));
  if (Math.max(...values) - Math.min(...values) > 0.02) throw new Error(`index provider conflict: ${row.symbol}`);
  indexChange[row.symbol] = round(values[0], 2);
}

const silverPreviousClose = Number(q("SZ161226").preClose);
const silverNav = Number(silverNavRow.DWJZ);
const lastSameDatePremium = pct(silverPreviousClose, silverNav);
const crossDatePremium = pct(q("SZ161226").price, silverNav);
const silverAmount = money(q("SZ161226").price, 2);
const hkAmount = money(q("SZ159740").price, 3);
const goldAmount = money(q("SZ164701").price, 2);
const minBuyLots = Math.ceil(1000 / (q("SZ161725").price * 100));
const minBuyAmount = money(q("SZ161725").price, minBuyLots);
const minBuyRoundTripRate = feeRatio(minBuyAmount, 10);
const minBuyGrossEdge = round(Math.max(minBuyRoundTripRate * 3, minBuyRoundTripRate + 1), 2);

data.date = "2026-11-27";
data.portfolioVersion = "portfolio-2026-11-27-premarket-from-20261126-close-fee-aware-v1";
data.time = "2026-11-26 18:25收盘更新：13个场内持仓/观察标的均为11月26日真实收盘；自有代理、三源日K与Longbridge逐项核对。执行计划面向11月27日开盘。";
data.lastUpdated = "2026-11-26 18:25 北京时间（场内标的为11月26日真实收盘；基金为11月25日公开净值；开放式基金运行时接口仍失败）";
data.logicUpdatedAt = "2026-11-26收盘 / 11月27日盘前（券商持仓、订单、成交接口均为OAuth 403308）";
data.transactionCostPolicy.candidateOrders = [
  { code: "161226", label: "历史2手高溢价风险复核（实际持仓未授权）", side: "sell", lots: 2, referencePrice: q("SZ161226").price, hardRiskExit: false },
  { code: "159740", label: "历史3手普通减仓复核", side: "sell", lots: 3, referencePrice: q("SZ159740").price, hardRiskExit: false },
  { code: "164701", label: "历史2手普通减仓复核", side: "sell", lots: 2, referencePrice: q("SZ164701").price, hardRiskExit: false },
  { code: "161725", label: `${minBuyLots}手最低经济金额买入复核`, side: "buy", lots: minBuyLots, referencePrice: q("SZ161725").price, hardRiskExit: false }
];

data.oneLine = `11月27日盘前买0手、卖0手。161226在11月25日收${silverPreviousClose.toFixed(3)}、净值${silverNavRow.DWJZ}，同日静态溢价约${lastSameDatePremium.toFixed(2)}%，高于8%风险线；11月26日收${q("SZ161226").price.toFixed(3)}相对旧净值约${crossDatePremium.toFixed(2)}%仅是跨日复核，须先核仓并取得更新净值。仅供个人复盘参考。`;
data.tradeDecision = [
  { type: "第一屏结论", title: "盘前买0手、卖0手；先核161226与弱势基金", conclusion: `已确认事实：161226在11月25日同日静态溢价约${lastSameDatePremium.toFixed(2)}%，越过8%风险线；11月26日收${q("SZ161226").price.toFixed(3)}，相对11月25日净值约${crossDatePremium.toFixed(2)}%仍是跨日口径。`, action: "11月27日先核对实际持仓、可卖份额和161226更新净值/IOPV；512710与159241只做弱势复核，不下普通碎片单。", trigger: "实际持仓存在 + 可靠同日溢价≥8% + 真实开盘报价有效，161226才进入一次合并硬风险退出复核；缺一项即卖0手。", reason: "历史同日溢价风险仍高，但账户证据与最新同日净值不能省。仅供个人复盘参考。" },
  { type: "市场结构", title: "指数近乎平收，科创与军工明显偏弱", conclusion: `已确认事实：11月26日上证${signed(indexChange.SH000001)}、深成指${signed(indexChange.SZ399001)}、创业板${signed(indexChange.SZ399006)}、科创50${signed(indexChange.SH000688)}；512710跌${Math.abs(change("SH512710")).toFixed(2)}%、159241跌${Math.abs(change("SZ159241")).toFixed(2)}%、688981跌${Math.abs(change("SH688981")).toFixed(2)}%。`, action: "不追开盘反抽；军工、航天、半导体先看能否收复11月26日高点，股票仍只作板块温度计。", trigger: "基金自身站稳11月26日高点、真实资金到账、预期毛收益覆盖往返费用3倍且扣费后≥1%，才进入买入评估。", reason: "主板平稳掩盖了成长方向的收盘压力。仅供个人复盘参考。" },
  { type: "费用闸门", title: "三笔历史碎片单仍全部暂停", conclusion: `按11月26日收盘：161226历史2手约${silverAmount.toFixed(2)}元/单边费${feeRatio(silverAmount).toFixed(2)}%，159740历史3手约${hkAmount.toFixed(2)}元/${feeRatio(hkAmount).toFixed(2)}%，164701历史2手约${goldAmount.toFixed(2)}元/${feeRatio(goldAmount).toFixed(2)}%；普通订单均不经济。`, action: "159740与164701不下碎片单；161226只有实际持仓与最新同日硬风险同时确认后才可越过金额门，并一次完成。", trigger: "普通波动保持0手；基本面失效、流动性异常或可靠同日溢价≥8%才进入硬风险复核。", reason: "暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。" },
  { type: "新买入", title: "金额门可过，资金与收益门失败", conclusion: `161725按${minBuyLots}手约${minBuyAmount.toFixed(2)}元，往返最低佣金约10元、费用占比约${minBuyRoundTripRate.toFixed(2)}%；可核验毛收益至少需${minBuyGrossEdge.toFixed(2)}%，且扣费后不少于1%。`, action: "不买。没有已成交卖出资金，也没有可靠收益空间证据。", trigger: `站稳${q("SZ161725").high.toFixed(3)}，同时真实资金已到账、预期毛收益≥${minBuyGrossEdge.toFixed(2)}%、扣费后≥1%，才重新评估。`, reason: "价格触发不能替代资金门和收益门。仅供个人复盘参考。" },
  { type: "相对强弱", title: "港股科技与贵金属修复，成长硬件仍弱", conclusion: `已确认事实：159740涨${change("SZ159740").toFixed(2)}%、164701涨${change("SZ164701").toFixed(2)}%、161226涨${change("SZ161226").toFixed(2)}%；688981跌${Math.abs(change("SH688981")).toFixed(2)}%。`, action: "现有基金只持有观察、不追；161226上涨不能抵消溢价风险，688981仍只作半导体风险温度计。", trigger: "基金自身突破11月26日高点且资金、费用、收益三门齐备，才进入基金端评估。", reason: "修复与风险并存，个股强弱不直接生成股票订单。仅供个人复盘参考。" }
];

data.executionOrder = [
  "1. 11月27日开盘前在券商端核对真实持仓、可卖份额、挂单、成交和实际费率；网页仍无法读取账户数据。",
  `2. 161226的11月25日同日静态溢价约${lastSameDatePremium.toFixed(2)}%，但11月26日净值尚未取得；先重算最新同日溢价。`,
  "3. 若实际不再持有161226，或可靠最新同日溢价低于8%，卖0手；若两项均确认，按全部实际可卖份额一次合并复核，避免拆单。",
  "4. 512710与159241收盘偏弱，只做风险复核；历史普通小单不得机械执行。",
  "5. 159740历史3手与164701历史2手继续暂停：普通费用门不通过。",
  "6. 其余基金新增买入0手；未成交卖出不得写成资金来源，真实卖出后也先留现金。",
  "7. 股票条目只作板块温度计；接口失败时不画假线或假K线。"
];
data.tradePlan = [
  { title: "161226历史同日溢价仍在硬风险区", basis: `11月25日场内收${silverPreviousClose.toFixed(3)}、净值${silverNavRow.DWJZ}，同日静态溢价约${lastSameDatePremium.toFixed(2)}%。`, inference: "历史风险线已触发；11月26日收盘与旧净值的比较不能代替最新同日证据。", conclusion: "当前卖0手；先核仓并重算，确认后才合并退出。", invalidCondition: "实际无持仓，或可靠最新同日溢价回落至8%以下。" },
  { title: "科创与军工收盘偏弱", basis: `科创50${signed(indexChange.SH000688)}、512710${signed(change("SH512710"))}、159241${signed(change("SZ159241"))}。`, inference: "成长分支承压，开盘反抽不能直接视为趋势反转。", conclusion: "基金不追、股票不买。", invalidCondition: "目标基金站稳11月26日高点且三门齐备。" },
  { title: "普通碎片单仍不经济", basis: `159740历史3手约${hkAmount.toFixed(2)}元，164701历史2手约${goldAmount.toFixed(2)}元。`, inference: "最低佣金占比显著超过0.5%。", conclusion: "触价只复核，不机械卖。", invalidCondition: "出现明确硬风险。" },
  { title: "资金来源仍未成立", basis: "券商持仓、订单、成交接口均返回OAuth 403308。", inference: "无法证明历史份额，也无法证明有卖出回款。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" }
];
data.noTradeList = [
  "不把11月26日收盘写成11月27日实时价；页面保留真实交易日和更新时间。",
  "不把161226的11月26日收盘与11月25日净值写成同日溢价。",
  "不在券商持仓接口未授权时机械卖历史2手。",
  "不执行159740历史3手或164701历史2手普通碎片卖单。",
  "不因港股科技或贵金属单日上涨追买ETF、LOF。",
  "不把计划卖出当作已到账资金；新增买入0手。",
  "不自动下单；所有建议仅供个人复盘参考。"
];

const holdingMeta = {
  "159740": [6, "港股科技修复", "偏强", `涨${change("SZ159740").toFixed(2)}%，但仍未突破11月26日高点。`, "中高", "持有、不追；历史3手普通减仓仍被费用门阻断"],
  "164701": [6, "黄金修复", "偏强", `涨${change("SZ164701").toFixed(2)}%，贵金属波动仍高。`, "高", "持有、不追；历史2手普通减仓仍被费用门阻断"],
  "512710": [2, "军工转弱", "偏弱", `跌${Math.abs(change("SH512710")).toFixed(2)}%，收盘靠近日低。`, "高", "持有、先复核0.512；普通小单不执行，新买0手"],
  "161226": [3, "上涨但溢价风险高", "震荡偏弱", `涨${change("SZ161226").toFixed(2)}%；11月25日同日静态溢价约${lastSameDatePremium.toFixed(2)}%，先核仓和更新净值。`, "高", "卖0手；仅在实际持仓与可靠同日溢价≥8%同时确认后一次合并复核"],
  "159608": [5, "稀有金属震荡", "震荡", `涨${change("SZ159608").toFixed(2)}%，盘中振幅较大。`, "中高", "持有、不补；跌破0.701只进入复核"],
  "159241": [2, "航天转弱", "偏弱", `跌${Math.abs(change("SZ159241")).toFixed(2)}%，收盘低于开盘。`, "高", "持有、先复核0.792；普通小单不执行，新买0手"],
  "562350": [5, "电力横盘", "震荡", `涨${change("SH562350").toFixed(2)}%，日内波动较窄。`, "中高", "持有、不加仓；站稳1.073且三门齐备才复核"],
  "002090": [5, "电网设备震荡", "震荡", `涨${change("SZ002090").toFixed(2)}%，股票只作基金环境参考。`, "中高", "仅观察，不新增股票买卖指令；用于判断电网设备风险"]
};
for (const item of data.holdings) {
  const row = q(item.symbol);
  const meta = holdingMeta[item.code];
  Object.assign(item, {
    support: `${row.low} / 11月26日低点`, resistance: `${row.high} / 11月26日高点`,
    lastTradeDate: "2026-11-26", lastOpen: row.open, lastClose: row.price, lastHigh: row.high, lastLow: row.low,
    lastChangePercent: round(change(item.symbol), 2),
    lastSource: `自有代理${row.lastUpdated}真实收盘（${row.source}）；11月26日OHLC经三源日K一致并与Longbridge日K核对`,
    predictionScore: meta[0], predictionLabel: meta[1], expectedDirection: meta[2], reason: meta[3], riskLevel: meta[4], action: meta[5],
    invalidCondition: `跌破${row.low}且板块继续转弱；普通订单仍须通过费用闸门`
  });
}

const watchMeta = {
  "601208": [5, "宽幅震荡，股票不买", `涨${change("SH601208").toFixed(2)}%，但日内振幅大`, "股票不买；基金端需站稳26.65并通过费用门", "宽幅波动，追价性价比不足", "高"],
  "600050": [4, "通信偏弱，股票不买", `跌${Math.abs(change("SH600050")).toFixed(2)}%`, "股票不买；基金端需站稳4.52并通过费用门", "强度未扩散，费用后收益证据不足", "中高"],
  "002466": [5, "锂股震荡，股票不买", `涨${change("SZ002466").toFixed(2)}%，高开后回落`, "股票不买；基金端需站稳31.47并通过费用门", "冲高回落且资源波动高", "高"],
  "688981": [1, "半导体大跌，股票不买", `跌${Math.abs(change("SH688981")).toFixed(2)}%，接近日低收盘`, "股票不买；基金端先看相关ETF能否收复自身高点", "单点大跌显示成长硬件风险", "高"],
  "161725": [3, "白酒偏弱，金额过门仍不买", `跌${Math.abs(change("SZ161725")).toFixed(2)}%；${minBuyLots}手金额过门但缺资金和收益证据`, `站稳${q("SZ161725").high.toFixed(3)}，且先有成交资金、预期毛收益≥${minBuyGrossEdge.toFixed(2)}%和扣费后≥1%`, `${minBuyLots}手约${minBuyAmount.toFixed(2)}元、往返最低费约10元；无资金来源`, "中高"]
};
for (const item of data.watchlist.filter((row) => row.code !== "005827")) {
  const row = q(item.symbol);
  const meta = watchMeta[item.code];
  Object.assign(item, {
    status: meta[1], reason: meta[2], buyTrigger: meta[3], avoidReason: meta[4], risk: `跌破${row.low}`,
    support: String(row.low), resistance: String(row.high), invalidCondition: `跌破${row.low}`,
    lastTradeDate: "2026-11-26", lastOpen: row.open, lastClose: row.price, lastHigh: row.high, lastLow: row.low,
    lastChangePercent: round(change(item.symbol), 2), lastSource: `自有代理${row.lastUpdated}真实收盘（${row.source}）；11月26日OHLC经三源日K一致并与Longbridge日K核对`,
    predictionScore: meta[0], predictionLabel: meta[1], expectedDirection: meta[0] >= 6 ? "偏强" : (meta[0] <= 3 ? "偏弱" : "震荡"), riskLevel: meta[5]
  });
}
const openFund = data.watchlist.find((row) => row.code === "005827");
Object.assign(openFund, {
  status: "11月25日净值已披露，运行时接口失败", reason: `11月25日净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；只作dated NAV。`,
  buyTrigger: "不买；开放式基金无盘中K线，且缺少资金与收益证据", avoidReason: "运行时基金接口HTTP 501，不能伪装实时", risk: "净值披露滞后或接口失败",
  support: "按净值披露", resistance: "不设盘中价", invalidCondition: "运行时真实基金接口接通并通过校验",
  lastTradeDate: "2026-11-25", lastOpen: null, lastClose: Number(openFundRow.DWJZ), lastHigh: null, lastLow: null, lastChangePercent: Number(openFundRow.JZZZL),
  lastSource: "东方财富基金11月25日公开净值；运行时基金接口HTTP 501，mode=failed", predictionScore: 3, predictionLabel: "净值回落、接口失败", expectedDirection: "偏弱", riskLevel: "中高"
});

data.newsItems = [
  { title: "A股冲高回落，科创50收跌1.36%", source: "新浪 / 腾讯 / 东方财富", publishTime: "2026-11-26 16:15:00+08:00", summary: `已确认事实：上证${signed(indexChange.SH000001)}、深成指${signed(indexChange.SZ399001)}、创业板${signed(indexChange.SZ399006)}、科创50${signed(indexChange.SH000688)}；四项指数均由至少两源一致。基于事实的判断：主板平稳，但成长硬件压力仍在。`, relatedStocks: ["512710", "159241", "688981"], sector: "过去24小时 / 全市场重大利好与风险 / A股收盘", relation: "market", url: "https://finance.eastmoney.com/a/202611263940475023.html" },
  { title: `161226最近可比同日静态溢价约${lastSameDatePremium.toFixed(2)}%`, source: "东方财富基金 / 三源日K", publishTime: "2026-11-26 18:25:00+08:00", summary: `已确认事实：11月25日场内收${silverPreviousClose.toFixed(3)}、公开净值${silverNavRow.DWJZ}，同日静态溢价约${lastSameDatePremium.toFixed(2)}%；11月26日净值尚未取得。基于事实的判断：风险仍处硬线之上，但执行必须核仓并重算最新同日口径。`, relatedStocks: ["161226"], sector: "过去24小时 / 持仓重大风险 / 白银LOF", relation: "risk", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10" },
  { title: "美股从盘中大跌中修复，科技股仍收低", source: "AP", publishTime: "2026-11-25 16:20:00-05:00", summary: "已确认事实：标普500跌约0.3%、纳指跌0.6%、道指涨0.3%，10年期美债收益率降至4.87%；盘中跌幅一度明显更大。基于事实的判断：风险偏好脆弱，不能把反抽当成科技趋势确认。", relatedStocks: ["159740", "512710", "688981"], sector: "过去24小时 / 全市场重大利好与风险 / 海外收盘", relation: "market", url: "https://apnews.com/article/10044b4fb55d3ff20fde9ba9e9acaab1" },
  { title: "感恩节美股休市，周五缩短交易", source: "AP", publishTime: "2026-11-26 08:00:00-05:00", summary: "已确认事实：美国市场11月26日感恩节休市，11月27日股票交易提前结束。基于事实的判断：海外价格发现变少，周五薄量波动可能放大，不作为A股追价依据。", relatedStocks: ["159740", "164701", "161226"], sector: "过去24小时 / 交易日历 / 海外风险", relation: "market", url: "https://apnews.com/article/320cd8c9c286a7773797bf2f478ef314" },
  { title: "13个场内标的收盘行情全部有效", source: "自有代理 / 三源日K / Longbridge", publishTime: "2026-11-26 18:25:00+08:00", summary: "已确认事实：13/13均有11月26日非零真实收盘，自有代理与至少两家日K源OHLC一致，Longbridge报价与日K再核对。基于事实的判断：页面使用收盘快照，不把它写成11月27日实时行情。", relatedStocks: ["159740", "164701", "512710", "161226", "159608", "159241", "562350"], sector: "过去24小时 / 数据校验 / 真实行情", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226" },
  { title: "贵金属场内基金反弹，但白银溢价风险未消", source: "自有代理 / 三源日K", publishTime: "2026-11-26 16:15:00+08:00", summary: `已确认事实：164701涨${change("SZ164701").toFixed(2)}%、161226涨${change("SZ161226").toFixed(2)}%。基于事实的判断：价格修复不能抵消161226的溢价与停申购风险。`, relatedStocks: ["164701", "161226"], sector: "过去24小时 / 热点复盘 / 贵金属", relation: "holding", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ164701" },
  { title: "005827净值回落，运行时基金接口仍失败", source: "东方财富基金 / 自有代理", publishTime: "2026-11-26 18:25:00+08:00", summary: `已确认事实：11月25日净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。`, relatedStocks: ["005827"], sector: "过去24小时 / 持仓 / 开放式基金 / 接口失败", relation: "holding", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10" },
  { title: "半导体与军工基金收盘承压", source: "自有代理 / 三源日K", publishTime: "2026-11-26 16:15:00+08:00", summary: `已确认事实：688981跌${Math.abs(change("SH688981")).toFixed(2)}%、512710跌${Math.abs(change("SH512710")).toFixed(2)}%、159241跌${Math.abs(change("SZ159241")).toFixed(2)}%。基于事实的判断：11月27日先看能否收复前高，不抢开盘反弹。`, relatedStocks: ["688981", "512710", "159241"], sector: "过去24小时 / 热点复盘 / 成长分化", relation: "market", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH688981" },
  { title: "融资保证金比例将降至80%", source: "上海证券交易所", publishTime: "2026-11-22 18:00:00+08:00", summary: "已确认事实：融资买入证券最低保证金比例自11月30日起由100%调低至80%。基于事实的判断：有助于流动性预期，但不是现有基金立即买入依据。", relatedStocks: ["512710", "159241", "688981"], sector: "政策雷达 / 市场流动性 / 已确认事实", relation: "market", url: "https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/margin/c/c_20261122_10838633.shtml" },
  { title: "创业板拟引入做市交易机制", source: "深圳证券交易所", publishTime: "2026-11-22 18:10:00+08:00", summary: "已确认事实：深交所就创业板做市交易业务细则公开征求意见。基于事实的判断：中期改善定价和流动性，不直接生成基金订单。", relatedStocks: ["688981", "512710"], sector: "政策雷达 / 交易机制 / 中性偏利好", relation: "market", url: "https://www.szse.cn/www/aboutus/trends/news/t20261122_623984.html" },
  { title: "交易所推出新一批降费措施", source: "深圳证券交易所", publishTime: "2026-11-22 18:20:00+08:00", summary: "已确认事实：深交所公布新一批市场费用减免。基于事实的判断：这是市场层面降费，不等同于用户券商佣金已经变更，费用闸门仍按待确认费率运行。", relatedStocks: ["159740", "164701", "161226"], sector: "政策雷达 / 市场费用 / 利好但需区分口径", relation: "market", url: "https://www.szse.cn/aboutus/trends/news/t20261122_623988.html" },
  { title: "券商账户接口仍缺少持仓与交易权限", source: "Longbridge", publishTime: "2026-11-26 18:22:00+08:00", summary: "已确认事实：持仓、当日订单、当日成交均返回OAuth 403308。基于事实的判断：不能假定历史手数仍存在，所有当前可执行数量保持0手。", relatedStocks: ["161226", "159740", "164701", "161725"], sector: "执行风险 / 账户核验 / 权限失败", relation: "risk", url: "https://open.longbridge.com/docs" }
];

data.reasoning = [
  { title: "161226先解决实际份额与最新同日口径", basis: `11月25日同日溢价${lastSameDatePremium.toFixed(2)}%，11月26日收盘相对旧净值约${crossDatePremium.toFixed(2)}%。`, inference: "历史同日风险已确认，但跨日估算不能替代最新净值，账户也未授权。", conclusion: "当前卖0手；核仓且最新同日溢价≥8%后一次合并复核。", invalidCondition: "实际无持仓，或可靠最新同日溢价低于8%。" },
  { title: "主板平稳与成长走弱分离", basis: `上证${signed(indexChange.SH000001)}，科创50${signed(indexChange.SH000688)}，688981${signed(change("SH688981"))}。`, inference: "指数平稳不等于成长风险解除。", conclusion: "科技与军工基金不追，股票不买。", invalidCondition: "目标基金站稳11月26日高点且三门齐备。" },
  { title: "普通碎片单仍不经济", basis: "161226历史2手、159740历史3手、164701历史2手均不足1000元且单边费用占比超过0.5%。", inference: "普通波动不值得重复支付最低佣金。", conclusion: "触价只复核。", invalidCondition: "出现明确硬风险。" },
  { title: "账户证据是执行前置条件", basis: "券商持仓、当日订单、成交接口仍返回OAuth 403308。", inference: "无法确认历史份额，也无法确认卖出回款。", conclusion: "买卖均为0手。", invalidCondition: "用户在券商端完成核对。" }
];
data.invalidConditions = [
  "161226无法确认实际持仓，或可靠最新同日溢价低于8%：卖0手。",
  "最新券商持仓与历史示例不一致：历史手数立即失效，按真实可卖份额一次合并重算。",
  "161226/159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
  "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
  "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
];
data.cancelPlan = [
  "先查券商最新持仓与挂单；不存在的历史份额不得生成订单。",
  "161226只用可靠最新同日IOPV/净值重算溢价；跨日估算不得触发卖出。",
  "开盘瞬时跳价不直接成交，先确认真实价格、时间戳与流动性。",
  "卖出未真实成交前不写入买入资金；成交后也先留现金。",
  "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
];
data.learningFramework = [
  { title: "收盘价必须带真实交易日", basis: "13个场内标的均有11月26日非零真实收盘。", inference: "11月27日开盘前只能称已校验收盘，不能称实时。", conclusion: "页面保留真实日期、时间和来源。", invalidCondition: "取得11月27日更新且通过校验的真实报价。" },
  { title: "LOF溢价必须同日比较", basis: `11月25日同日溢价${lastSameDatePremium.toFixed(2)}%，11月26日收盘相对旧净值约${crossDatePremium.toFixed(2)}%。`, inference: "跨日口径混入当日银价和净值变化。", conclusion: "最新同日证据不足时卖0手。", invalidCondition: "取得可靠最新同日IOPV/净值。" },
  { title: "费用门先于普通调仓", basis: `三笔历史碎片单参考额${silverAmount.toFixed(2)}元、${hkAmount.toFixed(2)}元、${goldAmount.toFixed(2)}元。`, inference: "均未达到经济金额，最低佣金侵蚀过大。", conclusion: "普通调仓暂停。", invalidCondition: "明确硬风险出现。" },
  { title: "资金来源必须已成交", basis: "账户订单与成交接口未授权，无法证明有卖出回款。", inference: "计划卖出不是资金。", conclusion: "新增买入0手。", invalidCondition: "券商端确认成交和可用资金。" },
  { title: "海外休市不等于国内风险消失", basis: "美股感恩节休市，周五缩短交易。", inference: "外部价格发现减少，薄量波动可能放大。", conclusion: "不以海外静默作为追价理由。", invalidCondition: "A股基金自身形成可核验趋势且执行三门齐备。" }
];
data.nextWatch = [
  "开盘前：在券商端核对真实持仓、可卖份额、挂单和实际费率。",
  "开盘前：若11月26日基金净值已披露，重算161226同日溢价；否则卖0手。",
  `09:35：观察512710的${q("SH512710").low.toFixed(3)}、159241的${q("SZ159241").low.toFixed(3)}能否守住；跌破只复核。`,
  `10:30：观察159740能否站稳${q("SZ159740").high.toFixed(3)}、164701能否站稳${q("SZ164701").high.toFixed(3)}；未站稳不追。`,
  "15:00后：记录真实收盘并等待11月27日基金净值披露，再做同日溢价复盘。"
];
data.quoteWatchlist = data.watchlist.map((item) => ({ name: item.name, code: item.code, symbol: item.symbol, market: item.market, type: item.type, sector: item.sector, support: item.support, resistance: item.resistance }));
data.sources = [
  { name: "自有代理：13个标的11月26日真实收盘", url: "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226", note: "2026-11-26 18:25核验：13/13返回非零closed行情；页面保留真实交易日和时间戳。" },
  { name: "11月26日三源日K一致性核验", url: "https://daily-briefing-blue.vercel.app/api/kline?symbol=SH512710&period=day", note: "新浪、腾讯、东方财富对13个标的11月26日OHLC形成至少两源一致，13/13通过。" },
  { name: "Longbridge收盘行情、日K与账户接口", url: "https://open.longbridge.com/docs", note: "13/13报价时间为11月26日15:00，均与Longbridge当日日K一致；持仓、订单、成交均返回OAuth 403308。" },
  { name: "东方财富基金：161226历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10", note: `11月25日单位净值${silverNavRow.DWJZ}、日跌${Math.abs(Number(silverNavRow.JZZZL)).toFixed(2)}%；相对同日收盘${silverPreviousClose.toFixed(3)}的静态溢价约${lastSameDatePremium.toFixed(2)}%。` },
  { name: "东方财富基金：005827历史净值", url: "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10", note: `11月25日单位净值${openFundRow.DWJZ}、日跌${Math.abs(Number(openFundRow.JZZZL)).toFixed(2)}%；仅作dated NAV。` },
  { name: "运行时基金接口HTTP 501失败态", url: "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827", note: "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。" },
  { name: "21财经：11月26日A股午评", url: "https://finance.eastmoney.com/a/202611263940475023.html", note: "早盘指数冲高回落；正式收盘指数由三源行情更新并核对。" },
  { name: "AP：11月25日美股修复多数跌幅", url: "https://apnews.com/article/10044b4fb55d3ff20fde9ba9e9acaab1", note: "标普500约-0.3%、纳指-0.6%、道指+0.3%，10年期美债收益率4.87%。" },
  { name: "AP：感恩节全球市场与美股休市", url: "https://apnews.com/article/320cd8c9c286a7773797bf2f478ef314", note: "11月26日美股休市，11月27日缩短交易；只作海外流动性风险背景。" },
  { name: "上交所：调整融资保证金比例", url: "https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/margin/c/c_20261122_10838633.shtml", note: "最低融资保证金比例自11月30日起降至80%；不直接生成买入指令。" },
  { name: "深交所：创业板做市规则征求意见", url: "https://www.szse.cn/www/aboutus/trends/news/t20261122_623984.html", note: "中期流动性和定价机制背景；不直接生成订单。" },
  { name: "深交所：新一批降费措施", url: "https://www.szse.cn/aboutus/trends/news/t20261122_623988.html", note: "交易所费用减免不等于券商佣金已经变更。" }
];

fs.writeFileSync(reportPath, `window.MARKET_BRIEFING_DATA = ${JSON.stringify(data, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  portfolioVersion: data.portfolioVersion,
  quoteTieOut: snapshot.quotes.filter((row) => row.tieOut && row.proxy.matchesConsensus).length,
  longbridgeTieOut: longbridge.quotes.filter((row) => row.dailyBarMatched).length,
  lastSameDatePremium: round(lastSameDatePremium, 2),
  crossDatePremium: round(crossDatePremium, 2),
  candidateAmounts: { silverAmount, hkAmount, goldAmount, minBuyAmount },
  minBuyLots,
  minBuyGrossEdge,
  runtimeFunds: snapshot.runtimeFunds.map((row) => `${row.symbol}:${row.status}:${row.body.mode}`)
}, null, 2));
