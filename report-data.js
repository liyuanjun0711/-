window.MARKET_BRIEFING_DATA = {
  date: "2026-06-06",
  time: "样例版 08:30 北京时间",
  lastUpdated: null,
  apiBase: "",
  quoteMode: "mock",
  refreshInterval: 10000,
  oneLine: "满仓账户今天不追新方向；黄金、白银反弹到价先减，军工确认强势后只用腾出的资金小买。",
  tradeDecision: [
    {
      type: "先卖",
      title: "黄金LOF 164701",
      conclusion: "反弹到价卖2-3手。",
      reason: "贵金属仓位偏重，先降集中度。",
      action: "1.765卖2手；1.774上方可卖3手。",
      trigger: "不到1.765不动。"
    },
    {
      type: "再卖",
      title: "国投白银LOF 161226",
      conclusion: "不补仓，只等强反弹减1手。",
      reason: "亏损深但波动更大，补仓会放大风险。",
      action: "2.132上方卖1手。",
      trigger: "不到2.132不动。"
    },
    {
      type: "再买",
      title: "军工龙头ETF 512710",
      conclusion: "只允许用卖出资金买1手。",
      reason: "板块有弹性，但不能满仓硬追。",
      action: "尾盘站稳0.696且强于大盘再买。",
      trigger: "没有卖出资金就不买。"
    },
    {
      type: "禁止",
      title: "恒生科技 / 稀有金属",
      conclusion: "今天不加仓。",
      reason: "已有底仓，继续加会提高集中度。",
      action: "只看关键位，不追。",
      trigger: "恒生科技站上0.628也只是持有信号。"
    }
  ],
  executionOrder: [
    "1. 先看黄金164701是否到1.765，未到不动。",
    "2. 再看白银161226是否到2.132，未到不动。",
    "3. 若已卖出资金，再看512710尾盘是否站稳0.696。",
    "4. 恒生科技159740、稀有金属159608今天不新增。"
  ],
  noTradeList: [
    "不追天齐锂业等高价单股。",
    "不因亏损深补白银。",
    "不在没有现金来源时买新方向。",
    "不处理小仓位防守品种。"
  ],
  holdings: [
    {
      name: "恒生科技ETF大成",
      code: "159740",
      market: "SZ",
      price: 0.616,
      previousClose: 0.622,
      changePercent: -0.96,
      volume: 126800,
      sectorStrength: 0,
      newsStrength: 0,
      expectation: "flat",
      strength: 0,
      support: "0.600",
      resistance: "0.628",
      action: "持有，不加仓",
      invalidCondition: "跌破0.600且港股科技权重同步走弱"
    },
    {
      name: "黄金LOF",
      code: "164701",
      market: "SZ",
      price: 1.737,
      previousClose: 1.748,
      changePercent: -0.63,
      volume: 89200,
      sectorStrength: -1,
      newsStrength: -1,
      expectation: "down",
      strength: -1,
      support: "1.720",
      resistance: "1.765 / 1.774",
      action: "反弹到价卖2-3手",
      invalidCondition: "美元、美债同步走弱且黄金强势放量"
    },
    {
      name: "军工龙头ETF富国",
      code: "512710",
      market: "SH",
      price: 0.695,
      previousClose: 0.686,
      changePercent: 1.31,
      volume: 231600,
      sectorStrength: 1,
      newsStrength: 1,
      expectation: "up",
      strength: 2,
      support: "0.686",
      resistance: "0.696",
      action: "有卖出资金才买1手",
      invalidCondition: "冲高回落并弱于大盘"
    },
    {
      name: "国投白银LOF",
      code: "161226",
      market: "SZ",
      price: 2.118,
      previousClose: 2.154,
      changePercent: -1.67,
      volume: 73400,
      sectorStrength: -1,
      newsStrength: -1,
      expectation: "down",
      strength: -2,
      support: "2.080",
      resistance: "2.132",
      action: "不补仓，反弹卖1手",
      invalidCondition: "白银放量站回2.132并强于黄金"
    },
    {
      name: "稀有金属ETF广发",
      code: "159608",
      market: "SZ",
      price: 1.210,
      previousClose: 1.212,
      changePercent: -0.17,
      volume: 68100,
      sectorStrength: 0,
      newsStrength: 0,
      expectation: "flat",
      strength: 0,
      support: "1.190",
      resistance: "1.224",
      action: "观察，不加仓",
      invalidCondition: "跌破1.190且锂矿板块走弱"
    },
    {
      name: "航空航天ETF天弘",
      code: "159241",
      market: "SZ",
      price: 1.182,
      previousClose: 1.159,
      changePercent: 1.98,
      volume: 42300,
      sectorStrength: 1,
      newsStrength: 0,
      expectation: "up",
      strength: 1,
      support: "1.171",
      resistance: "1.200",
      action: "小仓持有",
      invalidCondition: "军工主线转弱"
    },
    {
      name: "电力ETF银华",
      code: "562350",
      market: "SH",
      price: 1.262,
      previousClose: 1.295,
      changePercent: -2.55,
      volume: 18800,
      sectorStrength: -1,
      newsStrength: 0,
      expectation: "flat",
      strength: 0,
      support: "1.240",
      resistance: "1.280",
      action: "小仓观察",
      invalidCondition: "防守板块继续走弱"
    }
  ],
  riskOverview: [
    {
      title: "最大风险",
      conclusion: "贵金属集中度偏高。",
      trigger: "黄金、白银同时弱于预期。",
      action: "只在反弹触发价减，不下跌补。"
    },
    {
      title: "交易风险",
      conclusion: "满仓追新方向会失控。",
      trigger: "没有卖出资金还想买军工或新热点。",
      action: "强制先卖后买。"
    },
    {
      title: "港股科技风险",
      conclusion: "恒生科技是最大仓位。",
      trigger: "159740跌破0.600且权重股同步走弱。",
      action: "不加仓，等次日确认。"
    }
  ],
  scenarioPlan: [
    { title: "强势盘", conclusion: "军工强，恒生科技修复。", action: "黄金到价卖，军工用腾出资金买1手。" },
    { title: "震荡盘", conclusion: "多数持仓横盘。", action: "只执行黄金/白银触发价，其余不动。" },
    { title: "风险盘", conclusion: "贵金属和港股科技同步弱。", action: "不补仓，不追热点，收盘后再评估。"}
  ],
  marketRadar: [
    {
      type: "risk",
      title: "贵金属看美元和美债",
      summary: "美元、美债走强会压制黄金白银。",
      action: "反弹到价减，不补。"
    },
    {
      type: "positive",
      title: "军工相对强度可跟踪",
      summary: "若军工尾盘仍强于大盘，512710有小仓切换价值。",
      action: "只买1手，资金来自卖出。"
    },
    {
      type: "neutral",
      title: "港股科技看权重同步",
      summary: "腾讯、阿里、美团不同步时，不把ETF反弹当加仓信号。",
      action: "159740不加仓。"
    }
  ],
  newsReview: [
    { title: "过去24小时：港股科技仍是组合体感核心", body: "看权重同步，不看单日小反弹。" },
    { title: "过去24小时：贵金属等待宏观变量", body: "美元、美债、美国数据预期决定短线弹性。" },
    { title: "过去24小时：军工有相对强度", body: "只认尾盘站稳，不追上午冲高。" }
  ],
  holdingNews: [
    { type: "risk", title: "贵金属仓位仍是组合主要波动源", summary: "黄金、白银方向若同步走弱，优先按触发价减风险。", action: "164701、161226只反弹减，不下跌补。" },
    { type: "positive", title: "军工ETF是仓内切换候选", summary: "512710若强于大盘且尾盘站稳压力位，才有小仓切换意义。", action: "只用卖出资金买1手。" },
    { type: "neutral", title: "恒生科技不新增", summary: "159740仓位已经高，今天只看关键位，不再提高集中度。", action: "0.600守住则持有，跌破不补。" }
  ],
  sectorMove: [
    { type: "positive", title: "军工/航空航天", summary: "若板块相对强度延续，持仓内512710和159241优先观察。", action: "只看尾盘确认。" },
    { type: "neutral", title: "港股科技", summary: "权重不同步时，ETF反弹不等于加仓信号。", action: "159740持有，不追。" },
    { type: "risk", title: "贵金属", summary: "美元、美债若压制贵金属，组合波动会放大。", action: "触发价减仓优先。" }
  ],
  watchlist: [
    {
      name: "中国联通",
      code: "600050",
      market: "SH",
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
      market: "SZ",
      sector: "锂矿",
      status: "观察，不买",
      reason: "三个月资源股弹性仍在。",
      buyTrigger: "锂矿板块放量转强，159608同步站上1.224。",
      avoidReason: "单股波动大，当前账户已满仓。",
      risk: "资源品价格反复。"
    },
    {
      name: "中芯国际",
      code: "688981",
      market: "SH",
      sector: "半导体",
      status: "观察，不买",
      reason: "芯片若连续强于大盘可关注。",
      buyTrigger: "板块连续两天强于大盘且成交放大。",
      avoidReason: "单日反弹不买。",
      risk: "高位分化。"
    }
  ],
  reasoning: [
    { title: "为什么先卖", body: "贵金属仓位偏重，反弹减仓比下跌割肉更合适。" },
    { title: "为什么不追高", body: "满仓状态下，追新方向必须先有卖出资金。" },
    { title: "为什么只观察天齐锂业", body: "已有稀有金属ETF，单股会提高波动和集中度。" }
  ],
  invalidConditions: [
    "黄金未到1.765，减仓计划不执行。",
    "白银未到2.132，不卖也不补。",
    "军工未站稳0.696，买1手计划作废。",
    "行情异常或基金停牌，停止按本页执行。"
  ],
  learningFramework: [
    { title: "今日只看四个价格", body: "159740看0.628，164701看1.765/1.774，161226看2.132，512710看0.696。" },
    { title: "仓位优先级", body: "先降集中风险，再考虑切到强势方向。" },
    { title: "复盘标准", body: "收盘只看触发价是否有效，不复盘盘中噪音。" }
  ],
  cancelPlan: [
    "164701未到1.765，黄金减仓计划作废。",
    "512710未站稳0.696，军工买入计划作废。",
    "159740跌破0.600，恒生科技加仓想法全部取消。",
    "代理行情不可用时，不按模拟价下单。"
  ],
  nextWatch: [
    { title: "164701 黄金LOF", body: "明天继续看1.765/1.774能否触发减仓。" },
    { title: "512710 军工龙头ETF", body: "明天看0.696上方是否能站稳。" },
    { title: "159608 稀有金属ETF", body: "明天看1.224是否放量突破，否则不加。" }
  ],
  searchUniverse: [
    { name: "东材科技", code: "601208", market: "SH", sector: "新材料", price: 8.36, changePercent: 0.72, support: "8.20", resistance: "8.80" },
    { name: "天齐锂业", code: "002466", market: "SZ", sector: "锂矿", price: 31.42, changePercent: -0.35, support: "30.80", resistance: "33.20" },
    { name: "中国联通", code: "600050", market: "SH", sector: "通信/6G", price: 5.12, changePercent: 0.39, support: "4.98", resistance: "5.28" },
    { name: "中芯国际", code: "688981", market: "SH", sector: "半导体", price: 74.2, changePercent: 1.06, support: "71.50", resistance: "76.80" },
    { name: "恒生科技ETF大成", code: "159740", market: "SZ", sector: "港股科技", price: 0.616, changePercent: -0.96, support: "0.600", resistance: "0.628" },
    { name: "黄金LOF", code: "164701", market: "SZ", sector: "黄金", price: 1.737, changePercent: -0.63, support: "1.720", resistance: "1.765" },
    { name: "军工龙头ETF富国", code: "512710", market: "SH", sector: "军工", price: 0.695, changePercent: 1.31, support: "0.686", resistance: "0.696" }
  ]
};
