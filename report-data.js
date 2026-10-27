window.MARKET_BRIEFING_DATA = {
  "date": "2026-10-28",
  "portfolioVersion": "portfolio-2026-10-28-premarket-fee-aware-v1",
  "time": "2026-10-28 00:07北京时点核验：自有代理返回13个场内持仓/观察标的10月27日真实收盘，且与独立日K最后一根的日期、开高低收逐只一致；161226与005827的10月27日公开净值可核验。自有运行时基金接口仍返回501，页面继续显示失败态且不绘制开放式基金盘中K线。10月28日盘前不把10月27日收盘写成实时行情。",
  "lastUpdated": "2026-10-28 00:07 北京时间（场内为10月27日真实收盘；基金为10月27日公开净值）",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "logicUpdatedAt": "2026-10-28盘前（最新券商持仓与实际费率仍待核对）",
  "transactionCostPolicy": {
    "profile": "low_principal",
    "assumptionStatus": "待用户用券商佣金表或交割单确认",
    "commissionRate": 0.00025,
    "minimumCommissionCny": 5,
    "minimumEconomicOrderCny": 1000,
    "maxOneWayCostRatio": 0.005,
    "maxRoundTripCostRatio": 0.01,
    "minimumNetEdgeRatio": 0.01,
    "feeCoverageMultiple": 3,
    "lotSize": 100,
    "hardRiskExitRule": "基本面失效、LOF溢价失控或明确硬性风控时，费用不阻止退出；同一标的尽量一次完成，避免重复支付最低佣金。",
    "candidateOrders": [
      {
        "code": "159740",
        "label": "旧3手减仓复核",
        "side": "sell",
        "lots": 3,
        "referencePrice": 0.468,
        "hardRiskExit": false
      },
      {
        "code": "164701",
        "label": "旧2手减仓复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.537,
        "hardRiskExit": false
      },
      {
        "code": "161226",
        "label": "旧2手溢价风险复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.553,
        "hardRiskExit": false
      },
      {
        "code": "161725",
        "label": "19手最低经济金额买入复核",
        "side": "buy",
        "lots": 19,
        "referencePrice": 0.539,
        "hardRiskExit": false
      }
    ]
  },
  "oneLine": "结论：10月28日盘前买0手、卖0手。10月27日A股宽基全线下跌，科创50跌4.81%，组合内159241跌4.66%、512710跌4.01%，先核对券商真实持仓，不追反弹。161226场内1.553、同日净值1.4638，静态溢价约6.09%，低于8%硬风险线；旧2手约310.60元、单边费约1.61%，普通减仓被费用闸门否决。159740旧3手与164701旧2手同样暂停；所有新买入缺少已成交资金来源和费用后收益证据。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "盘前0手：先核持仓，不接急跌反弹",
      "conclusion": "10月27日沪指跌1.33%、深成指跌2.50%、创业板指跌3.41%、科创50跌4.81%；13个场内标的已用真实收盘与独立日K逐只核对。",
      "action": "10月28日盘前买0手、卖0手。9:15先核对券商最新持仓、可卖份额、成交记录与实际费率；未完成对账前不生成订单。",
      "trigger": "只有网页或券商出现10月28日真实时间戳，且最新持仓对账完成，才进入盘中风险复核；未触发就继续持有/观察。",
      "reason": "单日普跌后方向与真实剩余份额都不确定，旧计划不能直接复用。仅供个人复盘参考。"
    },
    {
      "type": "持仓风险",
      "title": "军工与航天急跌，普通破位只复核",
      "conclusion": "512710跌4.01%收0.599，159241跌4.66%收0.962，均收在日内低位附近；159740、159608与161226也同步走弱。",
      "action": "不补仓、不抄底。若10月28日真实价格继续低于各自10月27日低点并持续30分钟，只核查是否升级为基本面或明确硬风险；不足1000元的普通碎片卖单不下。",
      "trigger": "出现公告确认的基本面失效、流动性异常或LOF溢价重新失控，才按真实剩余份额合并退出；仅价格波动则不拆小单。",
      "reason": "急跌提高风险，但最低佣金仍会吞噬小额普通调仓；硬风险与普通波动必须分开。仅供个人复盘参考。"
    },
    {
      "type": "LOF溢价",
      "title": "161226溢价降至6.09%，取消旧硬退出",
      "conclusion": "10月27日场内收1.553、单位净值1.4638，同日静态溢价约6.09%，已低于8%硬风险线；基金仍暂停申购、开放赎回。",
      "action": "当前不卖旧2手。盘中只在可核验的最新同日净值/估值显示溢价重新>8%，或出现其他明确硬风险时，才按全部真实剩余份额合并退出。",
      "trigger": "最新可核验溢价>8%：转硬风险；≤8%或无法取得同一时点净值/估值：继续风险观察，不依据旧值下单。",
      "reason": "旧2手约310.60元、单边费约5元/1.61%；在硬风险未成立时属于费用不经济的普通小单。费率待券商实际确认。仅供个人复盘参考。"
    },
    {
      "type": "费用闸门",
      "title": "三笔旧碎片单全部暂停",
      "conclusion": "按10月27日收盘：159740卖3手约140.40元、单边费约3.56%；164701卖2手约307.40元、约1.63%；161226卖2手约310.60元、约1.61%。",
      "action": "三笔普通调仓均不下单；触价只进入风险复核。若真实持仓可合并后仍不足1000元且没有硬风险，继续持有/观察。",
      "trigger": "非硬风险且成交额<1000元或单边费用>0.5%：暂停；基本面失效、溢价失控或明确硬风控：费用不阻止一次性退出。",
      "reason": "重复小单会多次支付最低佣金，当前扣费后没有可核验的普通调仓收益空间。仅供个人复盘参考。"
    },
    {
      "type": "观察池不买",
      "title": "天齐业绩强但股价跌，观察池仍0手",
      "conclusion": "天齐锂业前三季度营收同比增147.11%、归母净利润增3013.86%，但10月27日股价仍跌1.65%；金智科技Q3亏损且计提减值，风险高于政策标题。",
      "action": "股票观察池全部不买；161725买0手、005827不新增。即使有卖出成交，资金先留现金，不在普跌次日机械切换。",
      "trigger": "新买基金必须同时满足：真实卖出资金到账、基金自身两次确认、可核验预期毛收益覆盖往返费用3倍、扣费后预期收益≥1%；任一缺失都不买。",
      "reason": "财报利好没有直接转化为价格强度，账户接近满仓且缺少费用后的收益证据。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 9:15核对券商最新成交、真实持仓、可卖份额和实际费率；未对账前买0手、卖0手。",
    "2. 9:25核对网页/券商是否出现10月28日真实时间戳；若仍为10月27日、0价或失败态，不依据网页下单。",
    "3. 9:30后先看512710的0.598、159241的0.962与159740的0.467；跌破并持续30分钟只进入硬风险复核。",
    "4. 重算161226最新可核验溢价；只有重新>8%或出现其他硬风险，才按全部真实剩余份额合并退出。",
    "5. 159740旧3手、164701旧2手、161226旧2手普通卖单继续暂停，单边费用占比约3.56%、1.63%、1.61%。",
    "6. 所有基金不补仓；161725、005827与股票观察池均为0手，卖出未真实成交前不安排资金来源。",
    "7. 15:00后记录10月28日真实收盘，并在基金净值披露后复核LOF溢价与下一交易日费用闸门。"
  ],
  "tradePlan": [
    {
      "title": "普跌日后先确认承接",
      "basis": "10月27日沪指跌1.33%、创业板指跌3.41%、科创50跌4.81%，组合内高弹性基金同步走弱。",
      "inference": "急跌后的首个反弹不等于趋势反转，盘前不应预设成交。",
      "conclusion": "买0手、卖0手；等待10月28日真实30分钟承接。",
      "invalidCondition": "市场宽度与组合基金同步放量修复并连续确认。"
    },
    {
      "title": "161226旧风险线已失效",
      "basis": "10月27日场内1.553、净值1.4638，同日静态溢价约6.09%。",
      "inference": "溢价已低于8%，旧8.80%不能继续触发硬退出。",
      "conclusion": "当前不卖；只有最新溢价重新>8%才转硬风险。",
      "invalidCondition": "可核验溢价重新>8%、申赎风险恶化或基本面失效。"
    },
    {
      "title": "费用先否决碎片卖单",
      "basis": "159740旧3手、164701旧2手、161226旧2手成交额均不足1000元，单边费用占比均高于0.5%。",
      "inference": "普通调仓的手续费损耗明显，拆单会重复支付最低佣金。",
      "conclusion": "价格触发只复核，不机械下小单。",
      "invalidCondition": "风险升级为基本面失效、LOF溢价失控或其他明确硬退出。"
    },
    {
      "title": "财报利好与价格表现分离",
      "basis": "天齐锂业前三季度业绩大增，但10月27日仍跌1.65%；金智科技Q3转亏并计提减值。",
      "inference": "公告事实要通过价格确认，不能把财报标题直接当成买点。",
      "conclusion": "股票只作板块温度计，基金端也不据单一公告加仓。",
      "invalidCondition": "相关基金完成两次价格确认且通过资金与费用后收益门槛。"
    },
    {
      "title": "运行时基金接口继续显式失败",
      "basis": "005827自有/api/fund仍返回HTTP 501，但公开历史净值10月27日为1.3734。",
      "inference": "可核验的静态净值不能替代运行时盘中行情。",
      "conclusion": "保留失败态、不画假线、不显示假价格。",
      "invalidCondition": "自有代理返回带真实日期和有效值的基金数据。"
    }
  ],
  "noTradeList": [
    "不把10月27日收盘写成10月28日实时行情；盘前买0手、卖0手。",
    "不沿用161226旧8.80%溢价硬退出；最新同日值约6.09%，当前不卖旧2手。",
    "不机械执行159740旧3手、164701旧2手或161226旧2手普通卖单；费用闸门全部否决。",
    "不因天齐锂业业绩高增或央行流动性工具标题追买资源、科技或通信基金。",
    "不买股票观察池；股票只作板块温度计，任何卖出资金先留现金。",
    "不自动下单；所有建议仅供个人复盘参考。"
  ],
  "holdings": [
    {
      "name": "恒生科技ETF大成",
      "code": "159740",
      "symbol": "SZ159740",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "港股科技",
      "support": "0.467 / 跌破后复核",
      "resistance": "0.475 / 0.481",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 0.477,
      "lastClose": 0.468,
      "lastHigh": 0.481,
      "lastLow": 0.467,
      "lastChangePercent": -1.47,
      "lastSource": "自有代理sina真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "action": "持有、不加仓；低于0.467运行30分钟进入硬风险复核；旧3手约140.40元、单边费约3.56%，普通减仓不下单",
      "invalidCondition": "站回0.475且恒生科技同步修复",
      "predictionScore": 3,
      "predictionLabel": "港股科技与ETF同步转弱",
      "expectedDirection": "震荡偏弱",
      "reason": "10月27日跌1.47%收0.468；恒生科技同日跌1.48%。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.537 / 跌破后复核",
      "resistance": "1.540 / 1.545",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 1.54,
      "lastClose": 1.537,
      "lastHigh": 1.545,
      "lastLow": 1.537,
      "lastChangePercent": -0.19,
      "lastSource": "自有代理sina真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "action": "持有、不补仓；低于1.537运行30分钟只做风险复核；旧2手约307.40元、单边费约1.63%，普通减仓不下单",
      "invalidCondition": "站稳1.545且国际金价继续转强",
      "predictionScore": 4,
      "predictionLabel": "金价偏强但场内收低",
      "expectedDirection": "震荡",
      "reason": "10月27日跌0.19%收1.537、接近日低；外盘黄金偏强未形成场内同步。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.598 / 跌破后复核",
      "resistance": "0.624 / 0.628",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 0.624,
      "lastClose": 0.599,
      "lastHigh": 0.628,
      "lastLow": 0.598,
      "lastChangePercent": -4.01,
      "lastSource": "自有代理sina真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "action": "持有、不补仓；低于0.598运行30分钟进入硬风险复核；普通碎片单不足1000元时不下单",
      "invalidCondition": "收复0.624且军工板块同步修复",
      "predictionScore": 2,
      "predictionLabel": "单日急跌收近低位",
      "expectedDirection": "偏弱",
      "reason": "10月27日跌4.01%收0.599，日低0.598。",
      "riskLevel": "高"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.552 / 跌破后复核",
      "resistance": "1.575 / 1.595",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 1.575,
      "lastClose": 1.553,
      "lastHigh": 1.595,
      "lastLow": 1.552,
      "lastChangePercent": -2.02,
      "lastSource": "自有代理sina真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "action": "持有并复核溢价；最新同日静态溢价约6.09%，当前不走硬退出；旧2手约310.60元、单边费约1.61%，普通减仓不下单",
      "invalidCondition": "最新可核验溢价重新>8%或出现基本面/申赎硬风险",
      "predictionScore": 3,
      "predictionLabel": "价格与净值同步回落，溢价未失控",
      "expectedDirection": "高波动偏弱",
      "reason": "10月27日跌2.02%收1.553，净值1.4638、静态溢价约6.09%，暂停申购。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "0.826 / 跌破后复核",
      "resistance": "0.841 / 0.852",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 0.845,
      "lastClose": 0.826,
      "lastHigh": 0.852,
      "lastLow": 0.826,
      "lastChangePercent": -1.78,
      "lastSource": "自有代理eastmoney真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "action": "持有、不加仓；低于0.826运行30分钟只做风险复核；不足1000元不卖碎片单",
      "invalidCondition": "收复0.841且资源板块同步转强",
      "predictionScore": 3,
      "predictionLabel": "资源基金继续走弱",
      "expectedDirection": "震荡偏弱",
      "reason": "10月27日跌1.78%收0.826、收于日低。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "0.962 / 跌破后复核",
      "resistance": "1.009 / 1.016",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 1.011,
      "lastClose": 0.962,
      "lastHigh": 1.016,
      "lastLow": 0.962,
      "lastChangePercent": -4.66,
      "lastSource": "自有代理sina真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "action": "持有、不补仓；低于0.962运行30分钟进入硬风险复核；普通碎片单不足1000元时不下单",
      "invalidCondition": "收复1.009且航空航天板块同步修复",
      "predictionScore": 2,
      "predictionLabel": "急跌并收于日低",
      "expectedDirection": "偏弱",
      "reason": "10月27日跌4.66%收0.962，日高1.016后持续回落。",
      "riskLevel": "高"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.071 / 跌破后复核",
      "resistance": "1.078 / 1.082",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 1.077,
      "lastClose": 1.071,
      "lastHigh": 1.082,
      "lastLow": 1.071,
      "lastChangePercent": -0.65,
      "lastSource": "自有代理sina真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "action": "持有、不加仓；低于1.071运行30分钟只做风险复核；不足1000元不卖碎片单",
      "invalidCondition": "站稳1.082且电力板块相对转强",
      "predictionScore": 5,
      "predictionLabel": "相对抗跌但仍收日低",
      "expectedDirection": "震荡",
      "reason": "10月27日跌0.65%收1.071，跌幅小于科技与军工基金。",
      "riskLevel": "中"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "8.19 / 跌破后复核",
      "resistance": "8.54 / 8.60",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 8.54,
      "lastClose": 8.35,
      "lastHigh": 8.6,
      "lastLow": 8.19,
      "lastChangePercent": -4.79,
      "lastSource": "自有代理sina真实收盘与独立sina日K交叉核对，2026-10-27；mode=closed",
      "action": "仅观察8.19/8.60，不新增股票买卖指令；Q3转亏且计提减值，不补仓",
      "invalidCondition": "跌破8.19或盈利质量继续恶化",
      "predictionScore": 2,
      "predictionLabel": "财报风险叠加急跌",
      "expectedDirection": "偏弱",
      "reason": "10月27日跌4.79%收8.35；Q3净利润亏损971.27万元，应收账款坏账准备增加。",
      "riskLevel": "高"
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
      "status": "急跌收近低位，股票不买",
      "reason": "10月27日跌3.58%收34.71，日低34.66，PCB材料方向承压。",
      "buyTrigger": "本账户不买股票；站回36.66并完成两次确认，只作新材料基金验证，不下单。",
      "avoidReason": "走势弱且账户不买股票；10月28日买0手。",
      "risk": "跌破34.66后继续观察回撤，不抄底。",
      "support": "34.66 / 跌破后观察",
      "resistance": "36.66 / 37.30",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 36.66,
      "lastClose": 34.71,
      "lastHigh": 37.3,
      "lastLow": 34.66,
      "lastChangePercent": -3.58,
      "lastSource": "自有代理eastmoney真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "invalidCondition": "跌破34.66或无法收复36.66",
      "predictionScore": 2,
      "predictionLabel": "急跌收近低位",
      "expectedDirection": "偏弱",
      "riskLevel": "高"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "status": "相对抗跌，股票不买",
      "reason": "10月27日跌0.68%收4.39，弱于前收4.42但跌幅小于科技指数。",
      "buyTrigger": "本账户不买股票；站稳4.44只作通信基金确认，不下单。",
      "avoidReason": "政策工具不是价格确认，账户不买股票。",
      "risk": "跌破4.36后相对强度可能消失。",
      "support": "4.36 / 跌破后观察",
      "resistance": "4.42 / 4.44",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 4.4,
      "lastClose": 4.39,
      "lastHigh": 4.44,
      "lastLow": 4.36,
      "lastChangePercent": -0.68,
      "lastSource": "自有代理sina真实收盘与独立eastmoney日K交叉核对，2026-10-27；mode=closed",
      "invalidCondition": "跌破4.36或继续弱于沪指",
      "predictionScore": 5,
      "predictionLabel": "相对抗跌",
      "expectedDirection": "震荡",
      "riskLevel": "中"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "status": "业绩强、股价弱，股票不买",
      "reason": "前三季度营收同比增147.11%、归母净利润增3013.86%，但10月27日跌1.65%收36.30。",
      "buyTrigger": "本账户不买股票；站回37.55并回踩确认，只作资源基金验证，不下单。",
      "avoidReason": "利好已披露但价格未确认，且组合已有159608资源暴露。",
      "risk": "跌破36.30后业绩利好可能继续被交易层面忽略。",
      "support": "36.30 / 跌破后观察",
      "resistance": "36.91 / 37.55",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 37.47,
      "lastClose": 36.3,
      "lastHigh": 37.55,
      "lastLow": 36.3,
      "lastChangePercent": -1.65,
      "lastSource": "自有代理eastmoney真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "invalidCondition": "跌破36.30或锂价与板块同步转弱",
      "predictionScore": 4,
      "predictionLabel": "业绩利好未转成强势",
      "expectedDirection": "震荡偏弱",
      "riskLevel": "高"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "status": "科创急跌，股票不买",
      "reason": "10月27日跌2.70%收100.00，科创50同日跌4.81%。",
      "buyTrigger": "本账户不买股票；站回103.87并完成两次确认，只作半导体基金验证，不下单。",
      "avoidReason": "科技波动高且账户不买股票；10月28日买0手。",
      "risk": "跌破99.91后可能继续放大波动。",
      "support": "99.91 / 跌破后观察",
      "resistance": "102.77 / 103.87",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 102.77,
      "lastClose": 100,
      "lastHigh": 103.87,
      "lastLow": 99.91,
      "lastChangePercent": -2.7,
      "lastSource": "自有代理eastmoney真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "invalidCondition": "跌破99.91或半导体板块继续转弱",
      "predictionScore": 3,
      "predictionLabel": "科技急跌",
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
      "status": "弱势回落，费用与收益空间不通过",
      "reason": "10月27日跌0.92%收0.539；19手约1024.10元、往返最低佣金约10元，但没有已成交资金来源或可核验预期毛收益。",
      "buyTrigger": "未来先有基金真实卖出资金，再站稳0.545并回踩0.539不破；还须证明预期毛收益至少覆盖往返费用3倍且净收益≥1%。当前买0手。",
      "avoidReason": "没有真实资金来源、收益证据或板块二次确认时都不买。",
      "risk": "跌破0.538后取消任何买入复核。",
      "support": "0.538 / 跌破不买",
      "resistance": "0.544 / 0.545",
      "lastTradeDate": "2026-10-27",
      "lastOpen": 0.541,
      "lastClose": 0.539,
      "lastHigh": 0.545,
      "lastLow": 0.538,
      "lastChangePercent": -0.92,
      "lastSource": "自有代理eastmoney真实收盘与独立tencent日K交叉核对，2026-10-27；mode=closed",
      "invalidCondition": "跌破0.538或继续弱于沪指",
      "predictionScore": 4,
      "predictionLabel": "收于日内低位附近",
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
      "status": "10月27日净值已披露，运行时接口失败",
      "reason": "10月27日单位净值1.3734、单日跌0.86%；开放式基金不提供盘中K线，自有代理仍返回501失败态。",
      "buyTrigger": "运行时真实净值接口恢复，连续两个披露日跑赢基准，并先有基金真实卖出资金后再评估。",
      "avoidReason": "接口未恢复、相对收益未确认或没有真实卖出资金时不买。",
      "risk": "净值披露有时滞，10月28日盘中不能据10月27日净值判断实时方向。",
      "support": "按净值披露，不设盘中支撑",
      "resistance": "按净值披露，不设盘中压力",
      "lastTradeDate": "2026-10-27",
      "lastOpen": null,
      "lastClose": 1.3734,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": -0.86,
      "lastSource": "东方财富基金公开历史净值，2026-10-27；运行时/api/fund为HTTP 501失败态",
      "invalidCondition": "连续两个披露日跑输基准或真实净值接口继续失败",
      "predictionScore": 3,
      "predictionLabel": "净值回落，接口未恢复",
      "expectedDirection": "暂无盘中判断",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "A股宽基全线下跌，科创50跌4.81%",
      "source": "金融界 / 新浪转引市场收盘数据",
      "publishTime": "2026-10-27 15:16:00+08:00",
      "summary": "已确认事实：沪指跌1.33%、深成指跌2.50%、创业板指跌3.41%，沪深300跌1.32%、科创50跌4.81%。基于事实的判断：10月28日先看承接，不把急跌后的反弹预设成反转。",
      "relatedStocks": [
        "159740",
        "512710",
        "159241",
        "159608",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / A股普跌",
      "relation": "risk",
      "url": "https://finance.jrj.com.cn/2026/10/27151658885351.shtml"
    },
    {
      "title": "全球股市等待央行决议，油价仍在高位",
      "source": "AP",
      "publishTime": "2026-10-27 15:10:00+08:00",
      "summary": "已确认事实：亚欧股市表现分化，市场等待主要央行决议与大型科技公司财报；报道时布伦特原油涨0.7%至111.54美元。基于事实的判断：高油价与利率不确定性仍压制高估值资产。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / 油价 / 央行",
      "relation": "risk",
      "url": "https://apnews.com/article/e11a2240fc3283c4507d44b9833f30a2"
    },
    {
      "title": "央行设立债市非银大额赎回互换便利",
      "source": "中国人民银行 / 证券时报",
      "publishTime": "2026-10-27 07:00:00+08:00",
      "summary": "已确认事实：工具用于资管机构面临群体性流动性风险、债市出现系统性压力的特定情景。基于事实的判断：它是流动性尾部风险后盾，不等于股票或基金的直接买入信号。",
      "relatedStocks": [
        "005827"
      ],
      "sector": "过去24小时 / 全市场重大利好 / 金融稳定",
      "relation": "market",
      "url": "https://data.people.com.cn/pd/zqsb/index.html"
    },
    {
      "title": "天齐锂业前三季度业绩高增，股价仍跌1.65%",
      "source": "天齐锂业三季报 / 自有代理",
      "publishTime": "2026-10-27 15:35:00+08:00",
      "summary": "已确认事实：前三季度营收182.79亿元、同比增147.11%，归母净利润56.02亿元、同比增3013.86%；10月27日收36.30、跌1.65%。基于事实的判断：业绩利好尚未得到价格确认，只作资源基金观察。",
      "relatedStocks": [
        "002466",
        "159608"
      ],
      "sector": "过去24小时 / 持仓关联 / 锂矿 / 三季报",
      "relation": "holding",
      "url": "https://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?id=12658935&stockid=002466"
    },
    {
      "title": "金智科技Q3转亏并计提减值",
      "source": "金智科技三季报与减值公告",
      "publishTime": "2026-10-27 08:00:00+08:00",
      "summary": "已确认事实：Q3营业收入同比增10.38%，归母净利润亏损971.27万元；当季计提资产减值1339.98万元，主要受应收账款坏账准备影响。基于事实的判断：基本面风险上升，政策题材不能抵消盈利质量压力。",
      "relatedStocks": [
        "002090",
        "562350"
      ],
      "sector": "过去24小时 / 持仓风险 / 电网设备 / 三季报",
      "relation": "risk",
      "url": "https://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?id=12661125&stockid=002090"
    },
    {
      "title": "恒生科技10月27日跌1.48%",
      "source": "恒生科技指数历史数据",
      "publishTime": "2026-10-27 16:00:00+08:00",
      "summary": "已确认事实：恒生科技收3800.43、跌1.48%；159740同日跌1.47%收0.468。基于事实的判断：ETF与基准同步偏弱，10月28日不追反弹。",
      "relatedStocks": [
        "159740",
        "005827"
      ],
      "sector": "过去24小时 / 持仓关联 / 港股科技",
      "relation": "holding",
      "url": "https://cn.investing.com/indices/hang-seng-tech-historical-data"
    },
    {
      "title": "外盘黄金期货上涨，场内黄金LOF未同步走强",
      "source": "Reuters转载 / 自有代理",
      "publishTime": "2026-10-27 02:23:00+08:00",
      "summary": "已确认事实：美国黄金期货结算涨0.8%至4038.40美元/盎司；164701在10月27日跌0.19%收1.537。基于事实的判断：外盘利好未形成场内价格确认，不补仓。",
      "relatedStocks": [
        "164701",
        "161226"
      ],
      "sector": "过去24小时 / 贵金属 / 价格分化",
      "relation": "market",
      "url": "https://www.devdiscourse.com/article/international/3997633-global-markets-world-stocks-gain-ahead-of-formidable-week-for-risk-oil-prices-fall"
    },
    {
      "title": "161226同日静态溢价约6.09%",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-10-28 00:07:00+08:00",
      "summary": "已确认事实：10月27日单位净值1.4638、场内收1.553，对应静态溢价约6.09%，暂停申购、开放赎回；运行时/api/fund仍返回501。基于事实的判断：旧8%硬退出不再成立，当前只做风险观察。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "持仓 / 白银LOF / 溢价 / 接口失败",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10"
    },
    {
      "title": "13个场内标的真实收盘全部通过日K核对",
      "source": "自有代理 / 独立日K",
      "publishTime": "2026-10-28 00:07:00+08:00",
      "summary": "已确认事实：13/13标的报价日期均为10月27日，非零OHLC与独立日K最后一根逐项一致，状态closed。基于事实的判断：这些数值只作最近真实收盘基线，不能冒充10月28日实时行情。",
      "relatedStocks": [
        "159740",
        "164701",
        "512710",
        "161226",
        "159608",
        "159241",
        "562350"
      ],
      "sector": "数据校验 / 持仓 / 真实行情",
      "relation": "holding",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SZ159740,SZ164701,SH512710,SZ161226,SZ159608,SZ159241,SH562350,SZ002090,SH601208,SH600050,SZ002466,SH688981,SZ161725"
    }
  ],
  "reasoning": [
    {
      "title": "普跌后不预设反弹",
      "basis": "10月27日宽基全线下跌，科技和高弹性基金跌幅更大。",
      "inference": "次日可能反抽，也可能继续释放风险。",
      "conclusion": "盘前0手，等待真实30分钟承接。",
      "invalidCondition": "组合基金与对应指数同步放量修复。"
    },
    {
      "title": "先对账，再谈订单",
      "basis": "网页不能读取用户最新券商成交与实际剩余份额。",
      "inference": "旧2手或3手计划可能已经不符合真实持仓。",
      "conclusion": "9:15先核对持仓与费率。",
      "invalidCondition": "券商对账完成。"
    },
    {
      "title": "161226旧硬风险已解除",
      "basis": "10月27日同日静态溢价约6.09%，低于8%线。",
      "inference": "旧8.80%结论不能继续触发退出。",
      "conclusion": "当前不卖旧2手；重新>8%才转硬风险。",
      "invalidCondition": "最新溢价重新>8%或其他硬风险成立。"
    },
    {
      "title": "费用闸门继续优先",
      "basis": "三笔旧碎片卖单均不足1000元，单边费用占比在1.61%至3.56%。",
      "inference": "普通调仓没有费用效率。",
      "conclusion": "触价只复核，不机械下小单。",
      "invalidCondition": "明确硬风险成立。"
    },
    {
      "title": "公告利好必须经过价格确认",
      "basis": "天齐锂业业绩高增但股价下跌；金智科技Q3转亏。",
      "inference": "财报标题不能直接替代交易收益证据。",
      "conclusion": "股票观察池不买，基金也不据单一公告加仓。",
      "invalidCondition": "基金完成两次确认且通过资金与费用门槛。"
    }
  ],
  "invalidConditions": [
    "最新券商持仓与旧计划不一致：所有旧手数立即失效，按真实份额重算。",
    "161226最新可核验溢价≤8%或无法取得同一时点净值/估值：不得执行硬退出；当前同日值约6.09%。",
    "161226最新溢价重新>8%、基本面失效或申赎风险恶化：普通费用闸门让位于硬退出，并按真实剩余份额合并一笔。",
    "159740/164701/161226只有普通价格触发且订单仍<1000元或单边费率>0.5%：取消下单，只做风险复核。",
    "网页出现0价、10月27日旧时间戳却标实时、失败态或来源校验失败：取消基于网页价格的执行，只看券商真实行情。"
  ],
  "cancelPlan": [
    "9:15先查最新成交与持仓；旧计划标的已卖出或份额变化则不得重复。",
    "竞价或开盘一分钟的瞬时跳空不直接成交；普通价格触发等30分钟确认。",
    "161226只有最新可核验溢价重新>8%或其他硬风险成立时才走风险退出；否则取消旧溢价触发。",
    "卖出没有真实成交前，不把资金写入观察池买入计划；即使成交，也先留现金。",
    "真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "报价与日K必须同日核对",
      "basis": "13个场内标的的10月27日OHLC全部与独立日K末根一致。",
      "inference": "只有通过日期和OHLC校验的数据才能进入报告。",
      "conclusion": "以10月27日收盘作盘前基线。",
      "invalidCondition": "10月28日真实行情到达。"
    },
    {
      "title": "LOF溢价必须用同日数据",
      "basis": "161226场内1.553、同日净值1.4638，溢价约6.09%。",
      "inference": "旧8.80%已经失效。",
      "conclusion": "当前不触发硬退出。",
      "invalidCondition": "最新同日溢价重新>8%。"
    },
    {
      "title": "小额普通调仓先看费用",
      "basis": "旧三笔卖单单边费用占比均明显超过0.5%。",
      "inference": "机械小单会让最低佣金吞噬收益。",
      "conclusion": "不下碎片单。",
      "invalidCondition": "明确硬风险成立。"
    },
    {
      "title": "硬风险与普通破位分开",
      "basis": "费用不能阻止必要退出，但价格波动本身不等于基本面失效。",
      "inference": "先确认风险类型，再决定是否越过金额门槛。",
      "conclusion": "普通破位只复核；硬风险合并退出。",
      "invalidCondition": "无。"
    },
    {
      "title": "财报事实不等于买点",
      "basis": "天齐业绩大增但股价下跌，金智科技收入增长却Q3转亏。",
      "inference": "价格和盈利质量必须共同确认。",
      "conclusion": "观察池不买。",
      "invalidCondition": "基金自身两次确认且通过资金与费用后收益门槛。"
    }
  ],
  "nextWatch": [
    "9:15：核对最新成交、真实持仓、可卖份额与券商实际费率；未对账前0手。",
    "9:25：确认网页/券商出现10月28日真实时间戳；仍为10月27日或失败态则停用网页执行。",
    "10:00：看512710的0.598、159241的0.962、159740的0.467；跌破30分钟只做硬风险复核。",
    "10:00后：重算161226最新可核验溢价；>8%且风险成立才合并实际份额硬退出。",
    "全天：关注科创50、恒生科技与油价/利率方向；不据单一反弹追买。",
    "15:00后：记录10月28日真实收盘与基金净值披露，更新费用闸门和下一交易日计划。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "34.66 / 跌破后观察",
      "resistance": "36.66 / 37.30"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.36 / 跌破后观察",
      "resistance": "4.42 / 4.44"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "36.30 / 跌破后观察",
      "resistance": "36.91 / 37.55"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "99.91 / 跌破后观察",
      "resistance": "102.77 / 103.87"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.538 / 跌破不买",
      "resistance": "0.544 / 0.545"
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
      "name": "本次运行：13个场内标的收盘与日K核验",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SZ159740,SZ164701,SH512710,SZ161226,SZ159608,SZ159241,SH562350,SZ002090,SH601208,SH600050,SZ002466,SH688981,SZ161725",
      "note": "2026-10-28 00:07：13/13返回非零10月27日真实收盘，状态closed；报价与独立日K最后一根的日期、开高低收一致。"
    },
    {
      "name": "自有代理基金端点失败态",
      "url": "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827",
      "note": "2026-10-28运行时仍返回HTTP 501；页面显示失败态，开放式基金不提供盘中K线。"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10",
      "note": "10月27日单位净值1.4638、日跌0.55%、暂停申购；相对同日场内收盘1.553的静态溢价约6.09%。"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10",
      "note": "10月27日单位净值1.3734、单日跌0.86%、限制大额申购；运行时接口仍失败。"
    },
    {
      "name": "金融界与新浪：10月27日A股收盘",
      "url": "https://finance.jrj.com.cn/2026/10/27151658885351.shtml",
      "note": "沪指-1.33%、深成指-2.50%、创业板指-3.41%、科创50-4.81%。"
    },
    {
      "name": "AP：10月27日全球市场与油价",
      "url": "https://apnews.com/article/e11a2240fc3283c4507d44b9833f30a2",
      "note": "全球股市等待央行决议与大型科技财报；报道时布伦特原油涨至111.54美元。"
    },
    {
      "name": "证券时报：央行BNSF工具",
      "url": "https://data.people.com.cn/pd/zqsb/index.html",
      "note": "用于特定系统性压力情景下支持非银资管机构的债市流动性安排。"
    },
    {
      "name": "天齐锂业：2026年三季度报告",
      "url": "https://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?id=12658935&stockid=002466",
      "note": "前三季度营收同比+147.11%，归母净利润同比+3013.86%；10月27日股价仍下跌。"
    },
    {
      "name": "金智科技：2026年三季度报告",
      "url": "https://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?id=12661125&stockid=002090",
      "note": "Q3归母净利润亏损971.27万元，应收账款坏账准备增加拖累利润。"
    },
    {
      "name": "恒生科技指数：10月27日收盘",
      "url": "https://cn.investing.com/indices/hang-seng-tech-historical-data",
      "note": "恒生科技收3800.43、跌1.48%，与159740同日走弱。"
    }
  ]
};
