window.MARKET_BRIEFING_DATA = {
  "date": "2026-09-10",
  "portfolioVersion": "portfolio-2026-09-10-premarket-v1",
  "time": "2026-09-09 22:17北京时点核验：13个场内持仓/观察标的均取得9月9日真实收盘，腾讯、新浪两源逐只一致，并与东方财富日K最后一根核对一致。161226与005827已取得9月9日公开净值；自有运行时基金接口仍返回501。无法确认用户9月9日是否执行减仓，9月10日开盘前必须先核对券商成交与最新持仓。",
  "lastUpdated": "2026-09-09 22:17 北京时间（场内为9月9日收盘；基金净值为9月9日披露）",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "oneLine": "结论：9月10日不买，先核对9月9日成交。若159740仍持有且低于0.546运行30分钟，卖3手；164701已收回1.700，不在开盘追卖，只有低于1.691运行30分钟卖2手；161226同日静态溢价约7.56%，低于8%，仅跌破1.932运行15分钟卖2手。强势基金只持有，卖出资金留现金。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "9月10日不买：先核对成交，再处理仍在持仓的弱项",
      "conclusion": "9月9日159740收0.548、跌1.08%，未收回0.552；164701午后修复至1.702，重新站回1.700。网页无法知道上午减仓是否实际成交。",
      "action": "9:25先查成交与持仓。若159740仍持有且低于0.546运行30分钟，卖3手（按9月9日收盘约164元）；若9月9日已卖出，不重复。164701不在开盘追卖。",
      "trigger": "159740未跌破0.546：继续持有，不补仓。若站稳0.554，取消弱势减仓。所有卖出资金留现金。",
      "reason": "先消除成交状态不确定性，再按新一交易日真实价格执行。仅供个人复盘参考。"
    },
    {
      "type": "贵金属风控",
      "title": "164701收回1.700；161226溢价仍在8%线下",
      "conclusion": "164701收1.702、仅跌0.06%，午后收回晨间失守位。161226收1.963、涨0.87%；9月9日净值1.8250，同日静态溢价约7.56%，低于8%。",
      "action": "164701低于1.691运行30分钟卖2手（约340元）；161226低于1.932运行15分钟卖2手（约393元），或同日溢价重新高于8%时卖2手。",
      "trigger": "没触发：继续持有、不补仓。取消减仓：164701站稳1.708；161226同日溢价降到3%以内且站稳1.964。",
      "reason": "黄金、白银方向与LOF溢价分开判断；9月9日净值已披露后才重算同日溢价。仅供个人复盘参考。"
    },
    {
      "type": "强势持仓管理",
      "title": "512710 / 159241 / 562350保持相对强势",
      "conclusion": "9月9日512710涨1.55%、159241涨1.49%、562350涨1.00%；三只均强于创业板-0.14%和科创50-0.69%。",
      "action": "512710低于0.641运行30分钟卖2手；159241低于1.072运行30分钟卖1手；562350低于1.091运行30分钟卖2手。",
      "trigger": "没触发：持有，不追涨。站稳0.661/1.103/1.108只上移保护线，不转为买入。",
      "reason": "相对强度可以保留，但满仓状态下不把连续上涨变成新增风险。仅供个人复盘参考。"
    },
    {
      "type": "震荡持仓管理",
      "title": "159608守住日低修复；002090继续只观察",
      "conclusion": "159608盘中触及1.042后收1.055、涨0.67%；002090收9.28、跌0.54%，仍在9.23-9.35区间。",
      "action": "159608低于1.042运行30分钟卖2手；未触发持有、不加仓。002090只观察9.23/9.35，不新增股票指令。",
      "trigger": "159608站稳1.060只视为持有确认；跌破1.042提高防守。002090无论是否突破都不下股票单。",
      "reason": "基金执行与股票温度计继续分开，避免在同主题上重复暴露。仅供个人复盘参考。"
    },
    {
      "type": "观察池不买",
      "title": "科技与港股观察池仍未给出可执行买点",
      "conclusion": "科创50跌0.69%，688981跌0.83%；恒生科技跌0.76%。005827最新净值1.5053、单日跌0.37%，运行时基金接口仍失败。",
      "action": "9月10日观察池全部不买。即使先有基金卖出成交，资金也留现金，不做当日切换。",
      "trigger": "未来只评估基金：真实卖出资金已到账、基金站稳触发位、板块与宽基同步确认。任一缺失都不买。",
      "reason": "产业利好尚未转化为板块普涨，接口失败更不能用静态净值伪装盘中行情。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 9:25核对9月9日成交记录与最新持仓；已卖出的159740/164701不得再执行同一笔计划。",
    "2. 9:30-10:00不买；网页必须出现9月10日新时间戳，9月9日收盘只能作静态基线。",
    "3. 若159740仍在持仓，低于0.546运行30分钟卖3手；未触发持有，不补仓。",
    "4. 164701低于1.691运行30分钟卖2手；161226低于1.932运行15分钟或同日溢价>8%卖2手。",
    "5. 10:30复核512710的0.641、159241的1.072、562350的1.091、159608的1.042；未触发继续持有。",
    "6. 002090和观察池股票只观察；161725、005827同样不买，不把海外AI合作直接当本地订单。",
    "7. 所有卖出资金先留现金。0价、旧日期、失败态或无真实时间戳时，以券商App真实报价为准。"
  ],
  "tradePlan": [
    {
      "title": "A股指数分化，成长仍弱于沪指",
      "basis": "9月9日上证+0.28%、深成指+0.15%、创业板-0.14%、科创50-0.69%；双创均从早盘高点明显回落。",
      "inference": "指数表面稳定，但成长风险偏好没有确认修复。",
      "conclusion": "科技相关持仓与观察标的继续按自身支撑防守，不追高开。",
      "invalidCondition": "创业板与科创50放量站回9月9日高点。"
    },
    {
      "title": "港股科技连续偏弱",
      "basis": "9月9日恒指跌0.17%、恒生科技跌0.76%；159740跌1.08%、收0.548，低点0.546。",
      "inference": "港股科技仍弱于大市，159740没有收回9月8日风控线0.552。",
      "conclusion": "仅在确认仍持有且跌破0.546运行30分钟时卖3手，不补仓。",
      "invalidCondition": "159740站稳0.554且恒生科技同步转强。"
    },
    {
      "title": "油价与利率担忧压制风险资产",
      "basis": "AP 9月8日美股收盘报道：布伦特结算97.92美元、涨0.9%；标普500跌0.6%、道指跌1.2%、纳指跌0.3%。",
      "inference": "能源通胀与利率预期对高估值资产形成额外压力，贵金属避险与利率利空相互拉扯。",
      "conclusion": "9月10日不追科技或贵金属，只按价格与同日净值管理。",
      "invalidCondition": "油价快速回落、利率预期降温且全球风险资产同步修复。"
    },
    {
      "title": "海外AI硬件合作是线索，不是A股订单",
      "basis": "Qualcomm 9月8日宣布与AWS开展多代定制AI芯片及最高1.6T光互连合作；9月9日688981仍跌0.83%，601208跌0.51%。",
      "inference": "需求方向得到确认，但A股映射公司的订单和盈利贡献仍缺直接证据。",
      "conclusion": "601208、600050、688981继续只作温度计，不买股票。",
      "invalidCondition": "相关公司正式披露可量化订单、收入或利润贡献。"
    },
    {
      "title": "先核对成交，再恢复现金缓冲",
      "basis": "组合接近满仓，且网页无法确认9月9日减仓是否成交。",
      "inference": "未核对成交就继续卖，可能重复执行；卖后立即换仓又无法恢复流动性。",
      "conclusion": "9月10日先查成交与持仓，所有新卖出资金留现金。",
      "invalidCondition": "用户提供新的成交与仓位快照，并形成独立现金缓冲。"
    }
  ],
  "noTradeList": [
    "不把9月9日收盘快照写成9月10日实时行情；盘中必须等待自有代理或券商App新时间戳。",
    "不在未核对9月9日成交记录前重复卖159740或164701。",
    "不把161226约7.56%的同日静态溢价写成9月10日实时溢价；每天重新用同日数据计算。",
    "不追512710、159241、562350、601208、688981；股票只作板块温度计。",
    "不把计划卖出当可用资金，不自动下单，所有建议仅供个人复盘参考。"
  ],
  "holdings": [
    {
      "name": "恒生科技ETF大成",
      "code": "159740",
      "symbol": "SZ159740",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "港股科技",
      "support": "0.546 / 0.542",
      "resistance": "0.552 / 0.554",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 0.554,
      "lastClose": 0.548,
      "lastHigh": 0.554,
      "lastLow": 0.546,
      "lastChangePercent": -1.08,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "action": "先核对9月9日成交；若仍持有且低于0.546运行30分钟卖3手；站稳0.554取消减仓",
      "invalidCondition": "站稳0.554且恒生科技转强",
      "predictionScore": 3,
      "predictionLabel": "连续弱势待确认",
      "expectedDirection": "震荡偏弱",
      "reason": "9月9日跌1.08%、收0.548，未收回0.552，恒生科技同步跌0.76%。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.691 / 1.685",
      "resistance": "1.708 / 1.715",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 1.692,
      "lastClose": 1.702,
      "lastHigh": 1.708,
      "lastLow": 1.691,
      "lastChangePercent": -0.06,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "action": "低于1.691运行30分钟卖2手；守住1.691持有；不补仓",
      "invalidCondition": "站稳1.708且国际金价同步修复",
      "predictionScore": 5,
      "predictionLabel": "午后收复晨间失守",
      "expectedDirection": "高波动震荡",
      "reason": "上午失守1.700，但收盘修复至1.702，全天仅跌0.06%。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.641 / 0.637",
      "resistance": "0.661 / 0.665",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 0.643,
      "lastClose": 0.655,
      "lastHigh": 0.661,
      "lastLow": 0.641,
      "lastChangePercent": 1.55,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "action": "低于0.641运行30分钟卖2手；守住0.641持有；不追涨",
      "invalidCondition": "跌破0.637或军工板块相对强度消失",
      "predictionScore": 7,
      "predictionLabel": "强势但未收日高",
      "expectedDirection": "震荡偏强",
      "reason": "9月9日涨1.55%、最高0.661，明显强于双创指数，但收盘低于日高。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.932 / 1.920",
      "resistance": "1.964 / 1.980",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 1.936,
      "lastClose": 1.963,
      "lastHigh": 1.964,
      "lastLow": 1.932,
      "lastChangePercent": 0.87,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "action": "同日溢价>8%卖2手；低于1.932运行15分钟卖2手；未触发持有但不补仓",
      "invalidCondition": "同日溢价降到3%以内且场内站稳1.964",
      "predictionScore": 5,
      "predictionLabel": "V形修复仍有溢价",
      "expectedDirection": "高波动震荡",
      "reason": "9月9日收1.963、接近日高；净值1.8250，对应同日静态溢价约7.56%。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "1.042 / 1.035",
      "resistance": "1.060 / 1.065",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 1.049,
      "lastClose": 1.055,
      "lastHigh": 1.06,
      "lastLow": 1.042,
      "lastChangePercent": 0.67,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "action": "低于1.042运行30分钟卖2手；守住1.042持有；不加仓",
      "invalidCondition": "跌破1.035且稀有金属板块同步转弱",
      "predictionScore": 6,
      "predictionLabel": "探底修复",
      "expectedDirection": "震荡",
      "reason": "9月9日从1.042日低修复至1.055、涨0.67%，但未突破1.060。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "1.072 / 1.065",
      "resistance": "1.103 / 1.110",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 1.073,
      "lastClose": 1.091,
      "lastHigh": 1.103,
      "lastLow": 1.072,
      "lastChangePercent": 1.49,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "action": "低于1.072运行30分钟卖1手；守住1.072持有；不加仓",
      "invalidCondition": "跌破1.065且航空航天板块同步转弱",
      "predictionScore": 7,
      "predictionLabel": "强势但冲高回落",
      "expectedDirection": "震荡偏强",
      "reason": "9月9日涨1.49%、最高1.103，明显强于双创指数，但收盘回落至1.091。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.091 / 1.088",
      "resistance": "1.108 / 1.115",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 1.1,
      "lastClose": 1.108,
      "lastHigh": 1.108,
      "lastLow": 1.091,
      "lastChangePercent": 1,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "action": "低于1.091运行30分钟卖2手；守住1.091持有；不加仓",
      "invalidCondition": "跌破1.088且电力板块相对转弱",
      "predictionScore": 7,
      "predictionLabel": "收于日高",
      "expectedDirection": "震荡偏强",
      "reason": "9月9日涨1.00%、收盘等于日高1.108，保持相对强势。",
      "riskLevel": "中"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "9.23 / 9.20",
      "resistance": "9.35 / 9.40",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 9.32,
      "lastClose": 9.28,
      "lastHigh": 9.35,
      "lastLow": 9.23,
      "lastChangePercent": -0.54,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "action": "仅观察9.23/9.35，不新增股票买卖指令，不补仓",
      "invalidCondition": "跌破9.23或电网设备板块相对转弱",
      "predictionScore": 4,
      "predictionLabel": "区间内偏弱",
      "expectedDirection": "震荡偏弱",
      "reason": "9月9日跌0.54%、收9.28，仍处于9.23-9.35窄区间。",
      "riskLevel": "中"
    }
  ],
  "watchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "status": "高开回落，股票不买",
      "reason": "9月9日高开47.90、最高48.31，收47.17、跌0.51%，未保留早盘强度。",
      "buyTrigger": "本账户不买股票；站稳48.31并有公司订单/业绩事实，只作新材料基金确认，不下单。",
      "avoidReason": "高开回落且账户不买股票；9月10日明确不买。",
      "risk": "跌破46.71可能延续回落。",
      "support": "46.71 / 46.50",
      "resistance": "47.90 / 48.31",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 47.9,
      "lastClose": 47.17,
      "lastHigh": 48.31,
      "lastLow": 46.71,
      "lastChangePercent": -0.51,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "invalidCondition": "跌破46.71或连续两日站不回47.90",
      "predictionScore": 3,
      "predictionLabel": "高开回落",
      "expectedDirection": "震荡偏弱",
      "riskLevel": "高"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "status": "收于低位，股票不买",
      "reason": "9月9日跌0.71%、收4.21，靠近日低4.19；早盘4.26未突破。",
      "buyTrigger": "本账户不买股票；放量站稳4.26并回踩4.24不破，只作通信基金确认，不下单。",
      "avoidReason": "收盘靠近低位且账户不买股票；9月10日明确不买。",
      "risk": "跌破4.19后可能继续走弱。",
      "support": "4.19 / 4.15",
      "resistance": "4.24 / 4.26",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 4.24,
      "lastClose": 4.21,
      "lastHigh": 4.26,
      "lastLow": 4.19,
      "lastChangePercent": -0.71,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "invalidCondition": "跌破4.19或继续弱于沪指",
      "predictionScore": 3,
      "predictionLabel": "收盘靠近低位",
      "expectedDirection": "震荡偏弱",
      "riskLevel": "中"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "status": "探底回升，与159608重叠",
      "reason": "9月9日最低45.05后收45.56、仅跌0.07%；组合已有159608资源暴露。",
      "buyTrigger": "本账户不买股票；站稳45.79并回踩45.56不破，只作稀有金属基金确认，不下单。",
      "avoidReason": "已有同类基金敞口且账户不买股票；9月10日明确不买。",
      "risk": "跌破45.05可能扩大回撤。",
      "support": "45.05 / 44.50",
      "resistance": "45.79 / 46.50",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 45.34,
      "lastClose": 45.56,
      "lastHigh": 45.79,
      "lastLow": 45.05,
      "lastChangePercent": -0.07,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "invalidCondition": "跌破45.05或锂矿板块转弱",
      "predictionScore": 5,
      "predictionLabel": "探底回升",
      "expectedDirection": "震荡",
      "riskLevel": "高"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "status": "科技高开回落，股票不买",
      "reason": "9月9日高开122.12、最高122.96，收120.51、跌0.83%，科创50同步跌0.69%。",
      "buyTrigger": "本账户不买股票；重新站稳122.96并回踩122.12不破，只作半导体基金确认，不下单。",
      "avoidReason": "高开回落且账户不买股票；9月10日明确不买。",
      "risk": "跌破120.06可能继续扩大科技回撤。",
      "support": "120.06 / 118.50",
      "resistance": "122.12 / 122.96",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 122.12,
      "lastClose": 120.51,
      "lastHigh": 122.96,
      "lastLow": 120.06,
      "lastChangePercent": -0.83,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "invalidCondition": "跌破120.06或半导体板块继续走弱",
      "predictionScore": 3,
      "predictionLabel": "高开回落",
      "expectedDirection": "震荡偏弱",
      "riskLevel": "高"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "status": "收盘靠近低位，基金不买",
      "reason": "9月9日跌1.25%、收0.554，靠近低点0.551；开盘0.559未站稳。",
      "buyTrigger": "先有基金真实卖出资金；重新站稳0.560并回踩0.559不破、下一交易日继续强于沪指时最多评估1手。9月10日不买。",
      "avoidReason": "低于0.560、没有真实卖出资金或相对沪指继续走弱时都不买。",
      "risk": "跌破0.551后可能继续测试更低平台。",
      "support": "0.551 / 0.548",
      "resistance": "0.559 / 0.560",
      "lastTradeDate": "2026-09-09",
      "lastOpen": 0.559,
      "lastClose": 0.554,
      "lastHigh": 0.56,
      "lastLow": 0.551,
      "lastChangePercent": -1.25,
      "lastSource": "腾讯、新浪真实收盘一致，并与东方财富日K核对，2026-09-09 15:00后",
      "invalidCondition": "跌破0.551或连续两日弱于沪指",
      "predictionScore": 3,
      "predictionLabel": "收盘靠近低位",
      "expectedDirection": "震荡偏弱",
      "riskLevel": "中"
    },
    {
      "name": "易方达蓝筹精选混合",
      "code": "005827",
      "symbol": "OF005827",
      "market": "OF",
      "type": "open_fund",
      "sector": "开放式基金",
      "status": "9月9日净值已披露，运行时接口失败",
      "reason": "9月9日单位净值1.5053、单日跌0.37%；开放式基金不提供盘中K线，自有代理仍返回501失败态。",
      "buyTrigger": "运行时真实净值接口恢复，且连续两个披露日跑赢沪深300和恒生科技，并先有基金真实卖出资金后再评估定投。",
      "avoidReason": "接口未恢复、相对收益未确认或没有真实卖出资金时不买。",
      "risk": "净值披露有时滞，港股科技仍弱。",
      "support": "按净值披露，不设盘中支撑",
      "resistance": "按净值披露，不设盘中压力",
      "lastTradeDate": "2026-09-09",
      "lastOpen": null,
      "lastClose": 1.5053,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": -0.37,
      "lastSource": "东方财富基金历史净值，2026-09-09；运行时/api/fund为失败态",
      "invalidCondition": "连续两个披露日跑输基准或真实净值接口继续失败",
      "predictionScore": 3,
      "predictionLabel": "等待净值接口恢复",
      "expectedDirection": "暂无盘中判断",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "油价逼近100美元并压低美股",
      "source": "AP",
      "publishTime": "2026-09-09 04:21:00+08:00",
      "summary": "已确认事实：布伦特盘中触及99.46美元，结算97.92美元、涨0.9%；标普500跌0.6%、道指跌1.2%、纳指跌0.3%。基于事实的判断：能源通胀和利率预期继续压制高估值资产，贵金属也不是单向受益。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981",
        "164701",
        "161226"
      ],
      "sector": "过去24小时 / 全市场重大风险 / 油价 / 美股",
      "relation": "risk",
      "url": "https://apnews.com/article/d3d6157a534584985987f828a940cffa"
    },
    {
      "title": "Qualcomm与AWS合作定制AI芯片及1.6T光互连",
      "source": "Qualcomm官方公告",
      "publishTime": "2026-09-09 06:10:00+08:00",
      "summary": "已确认事实：双方宣布多代定制硅合作，面向AWS大型AI数据中心推理，并合作最高1.6T光互连方案。基于事实的判断：产业链需求向高速互连扩散，但对A股公司仍只是映射线索，不能当作订单落地。",
      "relatedStocks": [
        "601208",
        "600050",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大利好 / AI硬件 / 光通信",
      "relation": "market",
      "url": "https://www.qualcomm.com/news/releases/2026/09/qualcomm-announces-multi-generational-product-collaboration-with"
    },
    {
      "title": "城市更新强调财政金融协同与重大工程",
      "source": "新华社 / 重庆市政府转载",
      "publishTime": "2026-09-09 07:46:00+08:00",
      "summary": "已确认事实：国务院专题学习强调城市更新、重大工程、政策性资金、信贷支持与城市更新基金。基于事实的判断：对建筑建材、城市基础设施和金融支持链条形成中期政策线索，但不是9月10日追涨理由。",
      "relatedStocks": [
        "562350",
        "002090"
      ],
      "sector": "过去24小时 / 全市场重大利好 / 政策 / 城市更新",
      "relation": "market",
      "url": "https://www.cq.gov.cn/ywdt/zyyw/202609/t20260909_16052162.html"
    },
    {
      "title": "A股与港股科技分化延续",
      "source": "东方财富 / 腾讯 / 新浪三源收盘",
      "publishTime": "2026-09-09 18:31:00+08:00",
      "summary": "已确认事实：上证+0.28%、深成指+0.15%、创业板-0.14%、科创50-0.69%；恒指-0.17%、恒生科技-0.76%。基于事实的判断：沪指稳定不能替代成长与港股科技止跌确认。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981",
        "601208",
        "600050"
      ],
      "sector": "过去24小时 / 全市场 / 收盘 / 风格分化",
      "relation": "risk",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SH000001,SH000688"
    },
    {
      "title": "龙版传媒累计涨幅偏离基本面并停牌核查",
      "source": "上海证券报信息披露",
      "publishTime": "2026-09-09 07:10:00+08:00",
      "summary": "已确认事实：公司公告称8月31日至9月8日累计涨幅约93.47%，股价偏离基本面，9月9日起停牌核查。基于事实的判断：高位题材的监管与回落风险上升，不把连板热度当新增买点。",
      "relatedStocks": [],
      "sector": "过去24小时 / 全市场重大风险 / 题材炒作 / 停牌",
      "relation": "risk",
      "url": "https://paper.cnstock.com/html/2026-09/09/node_69.htm"
    },
    {
      "title": "军工、航空航天与电力基金保持相对强势",
      "source": "自有代理真实收盘",
      "publishTime": "2026-09-09 16:15:00+08:00",
      "summary": "已确认事实：512710涨1.55%、159241涨1.49%、562350涨1.00%，均强于创业板与科创50。基于事实的判断：相对强度仍在，但只上移保护线，不在满仓状态追涨。",
      "relatedStocks": [
        "512710",
        "159241",
        "562350"
      ],
      "sector": "过去24小时 / 持仓 / 军工 / 航空航天 / 电力",
      "relation": "holding",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SH512710,SZ159241,SH562350"
    },
    {
      "title": "159740弱势延续，164701午后收回1.700",
      "source": "自有代理真实收盘与分时",
      "publishTime": "2026-09-09 16:15:00+08:00",
      "summary": "已确认事实：159740收0.548、跌1.08%，低点0.546；164701上午失守1.700后收1.702、仅跌0.06%。基于事实的判断：9月10日159740仍是防守重点，164701不在开盘追卖。",
      "relatedStocks": [
        "159740",
        "164701"
      ],
      "sector": "过去24小时 / 持仓 / 价格触发复盘",
      "relation": "risk",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SZ159740,SZ164701"
    },
    {
      "title": "161226同日静态溢价约7.56%",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-09-09 22:17:00+08:00",
      "summary": "已确认事实：9月9日单位净值1.8250、日跌0.38%，同日场内收1.963，对应静态溢价约7.56%；基金仍暂停申购。基于事实的判断：仍低于8%触发线，但已接近阈值，次日必须重算。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "过去24小时 / 持仓 / 白银LOF / 溢价",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10"
    },
    {
      "title": "005827净值继续回落，运行时基金接口仍失败",
      "source": "东方财富基金 / 自有代理失败态",
      "publishTime": "2026-09-09 22:17:00+08:00",
      "summary": "已确认事实：9月9日单位净值1.5053、单日跌0.37%，限制大额申购；运行时/api/fund仍返回501。基于事实的判断：只保留日期明确的净值，不画盘中K线，不新增定投。",
      "relatedStocks": [
        "005827",
        "159740"
      ],
      "sector": "过去24小时 / 观察池 / 开放式基金 / 接口失败",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10"
    }
  ],
  "reasoning": [
    {
      "title": "成交状态先于新计划",
      "basis": "9月9日触发过减仓条件，但网页无法读取券商成交。",
      "inference": "不核对就继续卖可能重复执行。",
      "conclusion": "9月10日9:25先查成交与最新持仓。",
      "invalidCondition": "无。"
    },
    {
      "title": "159740与164701收盘状态不同",
      "basis": "159740收0.548、未收回0.552；164701收1.702、重新站回1.700。",
      "inference": "同一上午的触发不能机械延续到下一交易日。",
      "conclusion": "159740继续防守，164701用新低1.691作为触发。",
      "invalidCondition": "各自站稳压力位。"
    },
    {
      "title": "161226溢价接近阈值但尚未触发",
      "basis": "9月9日场内1.963与净值1.8250对应约7.56%。",
      "inference": "低于8%不能提前当作触发，但申购暂停使溢价风险仍在。",
      "conclusion": "次日用同日数据重算，并同时看1.932。",
      "invalidCondition": "同日溢价降至3%以内且站稳1.964。"
    },
    {
      "title": "强势基金只持有不追",
      "basis": "512710、159241、562350均强于双创指数。",
      "inference": "相对强不等于满仓账户有新增风险预算。",
      "conclusion": "只上移保护线，不买。",
      "invalidCondition": "相对强度消失并跌破支撑。"
    },
    {
      "title": "开放式基金继续按净值披露",
      "basis": "005827运行时接口501，最新为9月9日净值1.5053。",
      "inference": "静态净值不能伪装成盘中行情。",
      "conclusion": "继续显示失败态且不画盘中K线。",
      "invalidCondition": "自有代理返回带真实日期的有效净值数据。"
    }
  ],
  "invalidConditions": [
    "159740站稳0.554且恒生科技转强：取消弱势减仓；跌破0.546运行30分钟则恢复卖3手。",
    "164701跌破1.691运行30分钟或161226跌破1.932运行15分钟：对应价格减仓条件成立。",
    "161226同日溢价降到3%以内且站稳1.964：取消溢价减仓；重新高于8%恢复卖2手。",
    "观察池没有真实卖出资金、基金自身触发或板块同步：继续不买。",
    "网页行情出现0价、旧日期、失败态或来源校验失败：取消基于网页价格的执行，只看券商App真实行情。"
  ],
  "cancelPlan": [
    "9:25先查9月9日成交记录和最新持仓；已成交的计划不得重复执行。",
    "竞价或开盘一分钟瞬时跌破不直接成交；需要15/30分钟确认的标的必须等完整时间。",
    "卖出没有真实成交前，不把资金写入观察池买入计划；即使成交，9月10日也先留现金。",
    "任何真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "触发、下单与成交是三个状态",
      "basis": "网页能看到价格触发，但看不到券商订单和成交。",
      "inference": "把触发当成交会导致次日重复动作。",
      "conclusion": "每天开盘前先对账。",
      "invalidCondition": "无。"
    },
    {
      "title": "同日价格与净值才能算LOF溢价",
      "basis": "161226在9月9日场内1.963、净值1.8250，对应约7.56%。",
      "inference": "次日盘中必须等待当日净值，不能沿用7.56%冒充实时。",
      "conclusion": "每天按同一日期重算。",
      "invalidCondition": "无。"
    },
    {
      "title": "收盘状态可以否定盘中触发的延续",
      "basis": "164701上午低于1.700，但收盘重新站回1.702。",
      "inference": "次日应使用新低和收盘结构，而不是追着昨日盘中信号卖。",
      "conclusion": "新触发改为1.691运行30分钟。",
      "invalidCondition": "跌破并持续。"
    },
    {
      "title": "产业新闻不等于本地订单",
      "basis": "Qualcomm与AWS合作确认AI硬件需求，但A股映射公司9月9日表现分化。",
      "inference": "海外合作只说明方向，不能替代公司公告。",
      "conclusion": "股票只作温度计，等订单或业绩证据。",
      "invalidCondition": "公司正式披露可量化影响。"
    },
    {
      "title": "先恢复流动性，再谈机会",
      "basis": "组合接近满仓且成交状态待核对。",
      "inference": "没有现金缓冲时，新机会不可执行。",
      "conclusion": "卖出资金先留现金，不做当日切换。",
      "invalidCondition": "仓位与风险预算已形成独立缓冲。"
    }
  ],
  "nextWatch": [
    "9月10日9:25：核对9月9日成交记录与最新持仓，不把触发当成交。",
    "9:30：核对网页真实时间戳；0价、旧日期或失败时切换券商App。",
    "10:00：看159740的0.546、164701的1.691、161226的1.932及同日净值可用性。",
    "10:30：复核512710、159241、562350、159608的移动保护线。",
    "13:30：观察双创与恒生科技是否修复，只作持仓确认，9月10日仍不买。",
    "15:00后：记录真实收盘与基金净值披露，复盘触发、下单、成交是否一致。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "46.71 / 46.50",
      "resistance": "47.90 / 48.31"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.19 / 4.15",
      "resistance": "4.24 / 4.26"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "45.05 / 44.50",
      "resistance": "45.79 / 46.50"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "120.06 / 118.50",
      "resistance": "122.12 / 122.96"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.551 / 0.548",
      "resistance": "0.559 / 0.560"
    },
    {
      "name": "易方达蓝筹精选混合",
      "code": "005827",
      "symbol": "OF005827",
      "market": "OF",
      "type": "open_fund",
      "sector": "开放式基金",
      "support": "按净值披露，不设盘中支撑",
      "resistance": "按净值披露，不设盘中压力"
    }
  ],
  "sources": [
    {
      "name": "本次运行：13个场内标的收盘核验",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SZ159740,SZ164701,SH512710,SZ161226,SZ159608,SZ159241,SH562350,SZ002090,SH601208,SH600050,SZ002466,SH688981,SZ161725",
      "note": "2026-09-09 22:17：13/13返回非零9月9日真实收盘；腾讯、新浪逐只一致，并与东方财富日K最后一根核对。"
    },
    {
      "name": "自有代理基金端点失败态",
      "url": "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827",
      "note": "2026-09-09运行时仍返回HTTP 501；页面显示失败态，开放式基金不提供盘中K线。"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10",
      "note": "9月9日单位净值1.8250、日跌0.38%、暂停申购；相对同日场内收盘1.963的静态溢价约7.56%。"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10",
      "note": "9月9日单位净值1.5053、单日跌0.37%、限制大额申购；运行时接口仍失败。"
    },
    {
      "name": "AP：9月8日油价与美股收盘",
      "url": "https://apnews.com/article/d3d6157a534584985987f828a940cffa",
      "note": "布伦特盘中99.46美元、结算97.92美元；标普500跌0.6%、道指跌1.2%、纳指跌0.3%。"
    },
    {
      "name": "Qualcomm：与AWS开展多代AI芯片合作",
      "url": "https://www.qualcomm.com/news/releases/2026/09/qualcomm-announces-multi-generational-product-collaboration-with",
      "note": "公司公告确认定制AI推理芯片与最高1.6T光互连合作；A股映射仍需订单证据。"
    },
    {
      "name": "国务院：高质量推进城市更新",
      "url": "https://www.cq.gov.cn/ywdt/zyyw/202609/t20260909_16052162.html",
      "note": "强调重大工程、政策性资金、信贷支持与城市更新基金，作为中期政策线索。"
    },
    {
      "name": "上海证券报：9月9日信息披露",
      "url": "https://paper.cnstock.com/html/2026-09/09/node_69.htm",
      "note": "龙版传媒公告股价偏离基本面并停牌核查，提示高位题材炒作风险。"
    }
  ]
};
