window.MARKET_BRIEFING_DATA = {
  date: "2026-06-06",
  time: "样例版 08:30 北京时间",
  lastUpdated: null,
  apiBase: "",
  refreshInterval: 10000,
  oneLine: "没有真实行情接口时，不显示假价格；今天只按触发条件做仓内调整。",
  tradeDecision: [
    {
      type: "先卖",
      title: "黄金LOF 164701",
      conclusion: "只在真实行情触发价到达后卖2-3手。",
      action: "真实成交价到1.765卖2手，1.774上方可卖3手。",
      trigger: "真实行情不到1.765不动。",
      reason: "贵金属仓位偏重，优先降集中度。"
    },
    {
      type: "再卖",
      title: "国投白银LOF 161226",
      conclusion: "不补仓，只等真实反弹价减1手。",
      action: "真实成交价到2.132上方卖1手。",
      trigger: "不到2.132不动。",
      reason: "白银波动大，补仓会放大回撤。"
    },
    {
      type: "再买",
      title: "军工龙头ETF 512710",
      conclusion: "只允许用卖出资金买1手。",
      action: "尾盘真实价格站稳0.696且强于大盘再买。",
      trigger: "没有卖出资金或没有真实行情，不买。",
      reason: "满仓账户不能凭感觉加仓。"
    },
    {
      type: "禁止",
      title: "恒生科技 / 稀有金属",
      conclusion: "今天不新增。",
      action: "只看关键位，不追。",
      trigger: "恒生科技站上0.628也只是持有信号。",
      reason: "已有底仓，继续加会提高集中度。"
    }
  ],
  executionOrder: [
    "1. 先确认页面是否显示实时或延迟行情；如果显示失败，不按价格执行。",
    "2. 黄金164701真实价格到1.765，才考虑卖2手。",
    "3. 白银161226真实价格到2.132，才考虑卖1手。",
    "4. 已卖出资金后，再看512710是否站稳0.696。"
  ],
  noTradeList: [
    "不按模拟价格下单。",
    "不在真实行情失败时追买。",
    "不因亏损深补白银。",
    "不在没有现金来源时买新方向。"
  ],
  holdings: [
    {
      name: "恒生科技ETF大成",
      code: "159740",
      symbol: "SZ159740",
      market: "SZ",
      type: "exchange_fund",
      support: "0.600",
      resistance: "0.628",
      action: "持有，不加仓",
      invalidCondition: "跌破0.600且港股科技权重同步走弱",
      predictionScore: 5,
      predictionLabel: "中性",
      expectedDirection: "flat",
      reason: "仓位较高，未突破关键压力位。",
      riskLevel: "中"
    },
    {
      name: "黄金LOF",
      code: "164701",
      symbol: "SZ164701",
      market: "SZ",
      type: "exchange_fund",
      support: "1.720",
      resistance: "1.765 / 1.774",
      action: "反弹到价卖2-3手",
      invalidCondition: "美元、美债同步走弱且黄金强势放量",
      predictionScore: 4,
      predictionLabel: "轻度看跌",
      expectedDirection: "down",
      reason: "贵金属集中度偏高，先降风险。",
      riskLevel: "中"
    },
    {
      name: "军工龙头ETF富国",
      code: "512710",
      symbol: "SH512710",
      market: "SH",
      type: "exchange_fund",
      support: "0.686",
      resistance: "0.696",
      action: "有卖出资金才买1手",
      invalidCondition: "冲高回落并弱于大盘",
      predictionScore: 7,
      predictionLabel: "轻度看涨",
      expectedDirection: "up",
      reason: "相对强度好，但必须尾盘确认。",
      riskLevel: "中"
    },
    {
      name: "国投白银LOF",
      code: "161226",
      symbol: "SZ161226",
      market: "SZ",
      type: "exchange_fund",
      support: "2.080",
      resistance: "2.132",
      action: "不补仓，反弹卖1手",
      invalidCondition: "白银放量站回2.132并强于黄金",
      predictionScore: 3,
      predictionLabel: "轻度看跌",
      expectedDirection: "down",
      reason: "亏损深但波动更大，不适合补仓。",
      riskLevel: "高"
    },
    {
      name: "稀有金属ETF广发",
      code: "159608",
      symbol: "SZ159608",
      market: "SZ",
      type: "exchange_fund",
      support: "1.190",
      resistance: "1.224",
      action: "观察，不加仓",
      invalidCondition: "跌破1.190且锂矿板块走弱",
      predictionScore: 5,
      predictionLabel: "中性",
      expectedDirection: "flat",
      reason: "已有资源品敞口，等突破再看。",
      riskLevel: "中"
    },
    {
      name: "航空航天ETF天弘",
      code: "159241",
      symbol: "SZ159241",
      market: "SZ",
      type: "exchange_fund",
      support: "1.171",
      resistance: "1.200",
      action: "小仓持有",
      invalidCondition: "军工主线转弱",
      predictionScore: 6,
      predictionLabel: "轻度看涨",
      expectedDirection: "up",
      reason: "方向跟随军工，但仓位小。",
      riskLevel: "中"
    },
    {
      name: "电力ETF银华",
      code: "562350",
      symbol: "SH562350",
      market: "SH",
      type: "exchange_fund",
      support: "1.240",
      resistance: "1.280",
      action: "小仓观察",
      invalidCondition: "防守板块继续走弱",
      predictionScore: 5,
      predictionLabel: "中性",
      expectedDirection: "flat",
      reason: "小仓防守，今天不是主线。",
      riskLevel: "低"
    }
  ],
  watchlist: [
    {
      name: "中国联通",
      code: "600050",
      symbol: "SH600050",
      market: "SH",
      type: "stock",
      sector: "通信/6G",
      status: "观察，不买",
      reason: "通信方向有政策催化。",
      buyTrigger: "连续两天强于大盘且放量突破短压。",
      avoidReason: "第一天消息刺激不追。",
      risk: "低价股也会高开低走。"
    },
    {
      name: "天齐锂业",
      code: "002466",
      symbol: "SZ002466",
      market: "SZ",
      type: "stock",
      sector: "锂矿",
      status: "观察，不买",
      reason: "资源股有弹性，但账户已有稀有金属ETF。",
      buyTrigger: "锂矿板块放量转强，159608同步站上1.224。",
      avoidReason: "单股波动大，当前账户已满仓。",
      risk: "资源品价格反复。"
    },
    {
      name: "中芯国际",
      code: "688981",
      symbol: "SH688981",
      market: "SH",
      type: "stock",
      sector: "半导体",
      status: "观察，不买",
      reason: "芯片若连续强于大盘可关注。",
      buyTrigger: "板块连续两天强于大盘且成交放大。",
      avoidReason: "单日反弹不买。",
      risk: "高位分化。"
    }
  ],
  riskOverview: [
    { title: "最大风险", conclusion: "贵金属集中度偏高。", trigger: "黄金、白银同时弱于预期。", action: "只在真实反弹触发价减，不下跌补。" },
    { title: "行情风险", conclusion: "没有真实行情就不能按价格交易。", trigger: "页面显示行情失败或暂无真实数据。", action: "打开券商App核对，不用页面价格。" },
    { title: "满仓风险", conclusion: "追新方向会让仓位失控。", trigger: "没有卖出资金还想买军工或新热点。", action: "强制先卖后买。" }
  ],
  marketRadar: [
    { type: "risk", title: "贵金属看美元和美债", summary: "美元、美债走强会压制黄金白银。", action: "反弹到价减，不补。" },
    { type: "positive", title: "军工相对强度可跟踪", summary: "若军工尾盘仍强于大盘，512710有小仓切换价值。", action: "只买1手，资金来自卖出。" },
    { type: "neutral", title: "港股科技看权重同步", summary: "腾讯、阿里、美团不同步时，不把ETF反弹当加仓信号。", action: "159740不加仓。" }
  ],
  newsReview: [
    { title: "港股科技仍是组合体感核心", body: "看权重同步，不看单日小反弹。" },
    { title: "贵金属等待宏观变量", body: "美元、美债、美国数据预期决定短线弹性。" },
    { title: "军工有相对强度", body: "只认尾盘站稳，不追上午冲高。" }
  ],
  reasoning: [
    { title: "为什么先卖", body: "贵金属仓位偏重，反弹减仓比下跌割肉更合适。" },
    { title: "为什么不追高", body: "满仓状态下，追新方向必须先有卖出资金。" },
    { title: "为什么不按模拟价做", body: "行情字段必须来自真实接口，失败时只做复盘不做交易。" }
  ],
  invalidConditions: [
    "行情失败或暂无真实数据，所有价格触发计划暂停。",
    "黄金未到1.765，减仓计划不执行。",
    "白银未到2.132，不卖也不补。",
    "军工未站稳0.696，买1手计划作废。"
  ],
  learningFramework: [
    { title: "真实行情", body: "价格、涨跌幅、成交量、K线只认代理接口返回。" },
    { title: "主观评分", body: "评分只表达预期，不替代行情。" },
    { title: "复盘标准", body: "收盘只看真实触发价是否有效，不复盘盘中噪音。" }
  ],
  cancelPlan: [
    "代理行情不可用时，不按页面价格执行。",
    "164701未到1.765，黄金减仓计划作废。",
    "512710未站稳0.696，军工买入计划作废。"
  ],
  nextWatch: [
    { title: "164701 黄金LOF", body: "明天继续看1.765/1.774能否触发减仓。" },
    { title: "512710 军工龙头ETF", body: "明天看0.696上方是否能站稳。" },
    { title: "159608 稀有金属ETF", body: "明天看1.224是否放量突破，否则不加。" }
  ],
  searchUniverse: [
    { name: "东材科技", code: "601208", symbol: "SH601208", market: "SH", type: "stock", sector: "新材料", support: "8.20", resistance: "8.80" },
    { name: "天齐锂业", code: "002466", symbol: "SZ002466", market: "SZ", type: "stock", sector: "锂矿", support: "30.80", resistance: "33.20" },
    { name: "中国联通", code: "600050", symbol: "SH600050", market: "SH", type: "stock", sector: "通信/6G", support: "4.98", resistance: "5.28" },
    { name: "中芯国际", code: "688981", symbol: "SH688981", market: "SH", type: "stock", sector: "半导体", support: "71.50", resistance: "76.80" },
    { name: "白酒基金LOF", code: "161725", symbol: "SZ161725", market: "SZ", type: "exchange_fund", sector: "消费", support: "", resistance: "" },
    { name: "易方达蓝筹精选混合", code: "005827", symbol: "OF005827", market: "OF", type: "open_fund", sector: "开放式基金", support: "", resistance: "" }
  ]
};
