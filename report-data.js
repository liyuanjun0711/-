window.MARKET_BRIEFING_DATA = {
  "date": "2026-11-19",
  "portfolioVersion": "portfolio-2026-11-19-midday-longbridge-fee-aware-v1",
  "time": "2026-11-19 12:15午间核验：13个场内持仓/观察标的均为Longbridge 11:28—11:30真实报价；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致性核验。自有代理当前为12个delayed、1个failed，开放式基金运行时接口HTTP 501。",
  "lastUpdated": "2026-11-19 12:15 北京时间（场内标的为11:30午间真实快照；基金为11月18日公开净值；自有代理为延迟/失败态）",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "logicUpdatedAt": "2026-11-19午间补发（券商持仓与当日订单接口仍因OAuth 403308无法核验）",
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
        "code": "161226",
        "label": "历史2手溢价风险复核（持仓未授权）",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.31,
        "hardRiskExit": false
      },
      {
        "code": "159740",
        "label": "历史3手普通减仓复核",
        "side": "sell",
        "lots": 3,
        "referencePrice": 0.45,
        "hardRiskExit": false
      },
      {
        "code": "164701",
        "label": "历史2手普通减仓复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.429,
        "hardRiskExit": false
      },
      {
        "code": "161725",
        "label": "18手最低经济金额买入复核",
        "side": "buy",
        "lots": 18,
        "referencePrice": 0.576,
        "hardRiskExit": false
      }
    ]
  },
  "oneLine": "11月19日午后买0手、卖0手。161226在11月18日收1.353、净值1.2633，同日静态溢价约7.10%，已低于8%硬风险线；11:30价格相对昨净值约3.70%只是跨日复核，且账户持仓未授权。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "不买不卖；161226硬退出失效",
      "conclusion": "已确认事实：161226在11月18日同日静态溢价约7.10%，低于8%硬风险线；11月19日11:30报1.310，相对昨日净值约3.70%仅为跨日口径。",
      "action": "不生成卖单；先在券商端核对实际持仓、可卖份额和挂单。只有可靠同日IOPV/净值重新确认溢价≥8%时，才对全部实际可卖份额做一次硬风险复核。",
      "trigger": "实际持仓存在 + 可靠同日溢价≥8% + 真实价格时间戳有效；缺一项即卖0手。",
      "reason": "账户接口仍为OAuth 403308，不能假定历史2手仍存在；跨日净值比较不得触发硬退出。仅供个人复盘参考。"
    },
    {
      "type": "盘中风险",
      "title": "三大指数午盘下跌，仅科创50走强",
      "conclusion": "已确认事实：午盘上证-0.44%、深成指-0.51%、创业板-0.63%、科创50+0.98%；组合内除688981和161725外均下跌。",
      "action": "不追中芯国际单点强势，不做基金端低位摊薄；弱势基金跌破午盘低点只进入风险复核。",
      "trigger": "午后需先收复11:30价格并站上上午高点，且资金、费用和可核验收益三门同时通过，才进入买入评估。",
      "reason": "科创强度没有扩散到多数基金持仓，市场仍是结构性分化。仅供个人复盘参考。"
    },
    {
      "type": "费用闸门",
      "title": "三笔历史碎片单全部暂停",
      "conclusion": "按11:30真实价：161226历史2手约262.00元/单边费1.91%，159740历史3手约135.00元/3.70%，164701历史2手约285.80元/1.75%；均低于1000元且费用占比超过0.5%。",
      "action": "普通波动只复核，不下碎片单、不拆单。",
      "trigger": "仅基本面失效、流动性异常或可靠同日数据重新确认LOF溢价失控时，才越过最低经济金额。",
      "reason": "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。"
    },
    {
      "type": "新买入",
      "title": "金额门可过，资金与收益门仍失败",
      "conclusion": "161725按18手约1036.80元，往返最低佣金约10元、费用占比约0.96%；预期毛收益至少需约2.88%才能覆盖往返费用3倍。",
      "action": "不买。没有已成交卖出资金，也没有可核验证据支持费用后收益空间。",
      "trigger": "需同时有真实可用资金、预期毛收益≥2.88%、扣费后预期收益≥1%，且价格站稳0.578，再评估。",
      "reason": "达到1000元只通过金额门，不等于通过资金门与收益门。仅供个人复盘参考。"
    },
    {
      "type": "政策观察",
      "title": "虚拟电厂扩容利好电力链，但不追562350",
      "conclusion": "已确认事实：国家能源局称截至6月底全国已投运虚拟电厂592个、最大调节能力2042.8万千瓦；562350午盘仍跌0.27%。",
      "action": "政策利好只进入电力ETF观察逻辑，午后不追买。",
      "trigger": "562350需重新站稳1.108，且有已成交资金与费用后收益证据，才进入买入复核。",
      "reason": "产业政策改善中期背景，但不能替代今日价格确认和费用闸门。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 午后先在券商端核对真实持仓、可卖份额、挂单、成交和实际费率；网页无法读取这些账户数据。",
    "2. 161226的11月18日同日溢价约7.10%，已低于8%；11:30跨日估算约3.70%，不得触发卖出。",
    "3. 若午后无法取得可靠同日IOPV/净值，161226卖0手；只有实际持有且同日溢价重新≥8%时，才一次合并复核。",
    "4. 159740历史3手、164701历史2手继续暂停，普通费用门不通过。",
    "5. 其余基金新增买入0手；任何计划卖出未真实成交前，不写成买入资金来源。",
    "6. 股票条目只作板块温度计，不生成股票订单。",
    "7. 自有代理当前为delayed/failed；网页只按真实接口时间戳展示，失败时不画假线或假K线。"
  ],
  "tradePlan": [
    {
      "title": "161226硬退出条件已失效",
      "basis": "11月18日场内收1.353、净值1.2633，同日静态溢价约7.10%。",
      "inference": "低于8%硬风险线；11:30价1.310相对昨净值是跨日口径。",
      "conclusion": "无可靠同日溢价和真实持仓前卖0手。",
      "invalidCondition": "券商确认实际仍持有，且可靠同日溢价重新≥8%。"
    },
    {
      "title": "科创单点强，不等于基金普涨",
      "basis": "科创50午盘+0.98%、688981涨5.47%，但上证、深成指和创业板均跌。",
      "inference": "强度集中，未扩散到大多数基金持仓。",
      "conclusion": "股票不买，科技基金不追。",
      "invalidCondition": "基金自身收复上午高点且费用、资金、收益证据齐备。"
    },
    {
      "title": "普通碎片单仍不经济",
      "basis": "159740历史3手约135.00元，164701历史2手约285.80元。",
      "inference": "最低佣金占比显著超过0.5%。",
      "conclusion": "触价只复核，不机械卖。",
      "invalidCondition": "出现明确硬风险。"
    },
    {
      "title": "虚拟电厂政策只改善观察逻辑",
      "basis": "国家能源局发布首部国家级虚拟电厂发展报告，规模与调节能力快速增长。",
      "inference": "电力链中期需求逻辑加强，但562350午盘价格仍弱。",
      "conclusion": "持有/观察，不追买。",
      "invalidCondition": "价格站稳上午高点且执行三门齐备。"
    }
  ],
  "noTradeList": [
    "不把Longbridge 11:30快照标成12:15持续实时价；页面只认真实时间戳。",
    "不把161226盘中价与11月18日净值的跨日比较写成同日溢价。",
    "不在券商持仓接口未授权时机械卖历史2手。",
    "不执行159740历史3手或164701历史2手普通碎片卖单。",
    "不因688981单点上涨追买股票或科技基金。",
    "不把计划卖出当作已到账资金；新增买入0手。",
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
      "support": "0.447 / 上午低点",
      "resistance": "0.454 / 上午高点",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 0.453,
      "lastClose": 0.45,
      "lastHigh": 0.454,
      "lastLow": 0.447,
      "lastChangePercent": -1.53,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:30:00+08:00；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致；自有代理当前为delayed/failed",
      "action": "持有、不补；历史3手约135.00元、单边费约3.70%，普通减仓暂停",
      "invalidCondition": "跌破0.447且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 3,
      "predictionLabel": "港股科技偏弱",
      "expectedDirection": "偏弱",
      "reason": "午盘跌1.53%，接近上午低位。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.425 / 上午低点",
      "resistance": "1.448 / 上午高点",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 1.444,
      "lastClose": 1.429,
      "lastHigh": 1.448,
      "lastLow": 1.425,
      "lastChangePercent": -1.79,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:30:00+08:00；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致；自有代理当前为delayed/failed",
      "action": "持有、不追；历史2手约285.80元、单边费约1.75%，普通减仓暂停",
      "invalidCondition": "跌破1.425且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 3,
      "predictionLabel": "贵金属走弱",
      "expectedDirection": "偏弱",
      "reason": "午盘跌1.79%，未守住开盘价。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.548 / 上午低点",
      "resistance": "0.557 / 上午高点",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 0.557,
      "lastClose": 0.553,
      "lastHigh": 0.557,
      "lastLow": 0.548,
      "lastChangePercent": -0.9,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:29:57+08:00；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致；自有代理当前为delayed/failed",
      "action": "持有、不补；跌破0.548只进入复核，新买0手",
      "invalidCondition": "跌破0.548且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 3,
      "predictionLabel": "军工继续承压",
      "expectedDirection": "偏弱",
      "reason": "午盘跌0.90%，靠近上午低位。",
      "riskLevel": "高"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.299 / 上午低点",
      "resistance": "1.338 / 上午高点",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 1.338,
      "lastClose": 1.31,
      "lastHigh": 1.338,
      "lastLow": 1.299,
      "lastChangePercent": -3.18,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:30:00+08:00；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致；自有代理当前为delayed/failed",
      "action": "卖0手；历史2手约262.00元、单边费约1.91%，跨日溢价只复核",
      "invalidCondition": "跌破1.299且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 2,
      "predictionLabel": "溢价回落但价格弱",
      "expectedDirection": "高风险",
      "reason": "午盘跌3.18%；11月18日同日溢价约7.10%，硬退出条件失效。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "0.744 / 上午低点",
      "resistance": "0.755 / 上午高点",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 0.751,
      "lastClose": 0.753,
      "lastHigh": 0.755,
      "lastLow": 0.744,
      "lastChangePercent": -0.79,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:30:00+08:00；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致；自有代理当前为delayed/failed",
      "action": "持有、不补仓；跌破0.744只进入复核，新买0手",
      "invalidCondition": "跌破0.744且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 3,
      "predictionLabel": "稀有金属偏弱",
      "expectedDirection": "偏弱",
      "reason": "午盘跌0.79%，反弹未扩散。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "0.853 / 上午低点",
      "resistance": "0.873 / 上午高点",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 0.873,
      "lastClose": 0.862,
      "lastHigh": 0.873,
      "lastLow": 0.853,
      "lastChangePercent": -0.81,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:30:00+08:00；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致；自有代理当前为delayed/failed",
      "action": "持有、不追；未收复0.873前新买0手",
      "invalidCondition": "跌破0.853且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 3,
      "predictionLabel": "航天冲高回落",
      "expectedDirection": "偏弱",
      "reason": "午盘跌0.81%，开盘即上午高点。",
      "riskLevel": "高"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.094 / 上午低点",
      "resistance": "1.108 / 上午高点",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 1.106,
      "lastClose": 1.098,
      "lastHigh": 1.108,
      "lastLow": 1.094,
      "lastChangePercent": -0.27,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:28:20+08:00；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致；自有代理当前为delayed/failed",
      "action": "持有、不加仓；站稳1.108且三门齐备才复核",
      "invalidCondition": "跌破1.094且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 5,
      "predictionLabel": "政策利好但价格未确认",
      "expectedDirection": "震荡",
      "reason": "国家能源局发布虚拟电厂报告，但ETF午盘跌0.27%。",
      "riskLevel": "中高"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "7.98 / 上午低点",
      "resistance": "8.22 / 上午高点",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 8.21,
      "lastClose": 8.04,
      "lastHigh": 8.22,
      "lastLow": 7.98,
      "lastChangePercent": -2.07,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:30:00+08:00；11月18日收盘OHLC另经新浪、腾讯、东方财富至少两源一致；自有代理当前为delayed/failed",
      "action": "仅观察，不新增股票买卖指令；用于判断电网设备风险",
      "invalidCondition": "跌破7.98且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 2,
      "predictionLabel": "电网设备弱势",
      "expectedDirection": "偏弱",
      "reason": "午盘跌2.07%，股票只作基金环境参考。",
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
      "status": "高波动回落，股票不买",
      "reason": "PCB材料未延续昨日反弹",
      "buyTrigger": "股票不买；基金端需站稳29.29并通过费用门",
      "avoidReason": "下跌且波动仍高",
      "risk": "跌破28.48",
      "support": "28.48",
      "resistance": "29.29",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 29,
      "lastClose": 28.99,
      "lastHigh": 29.29,
      "lastLow": 28.48,
      "lastChangePercent": -1.66,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:29:59+08:00；11月18日收盘另经三源日K核验",
      "invalidCondition": "跌破28.48",
      "predictionScore": 3,
      "predictionLabel": "高波动回落，股票不买",
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
      "status": "通信回落，股票不买",
      "reason": "午盘跌幅超过1%",
      "buyTrigger": "股票不买；基金端需站稳4.55并通过费用门",
      "avoidReason": "市场广度弱，个股强度未扩散",
      "risk": "跌破4.46",
      "support": "4.46",
      "resistance": "4.55",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 4.54,
      "lastClose": 4.48,
      "lastHigh": 4.55,
      "lastLow": 4.46,
      "lastChangePercent": -1.1,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:29:56+08:00；11月18日收盘另经三源日K核验",
      "invalidCondition": "跌破4.46",
      "predictionScore": 4,
      "predictionLabel": "通信回落，股票不买",
      "expectedDirection": "偏弱",
      "riskLevel": "中高"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "status": "锂股偏弱，股票不买",
      "reason": "午盘跌幅超过1%",
      "buyTrigger": "股票不买；基金端需站稳33.53并通过费用门",
      "avoidReason": "板块与基金均缺少费用后收益证据",
      "risk": "跌破32.77",
      "support": "32.77",
      "resistance": "33.53",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 33.33,
      "lastClose": 33.07,
      "lastHigh": 33.53,
      "lastLow": 32.77,
      "lastChangePercent": -1.37,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:30:00+08:00；11月18日收盘另经三源日K核验",
      "invalidCondition": "跌破32.77",
      "predictionScore": 3,
      "predictionLabel": "锂股偏弱，股票不买",
      "expectedDirection": "偏弱",
      "riskLevel": "高"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "status": "半导体强势，股票不买",
      "reason": "午盘涨5.47%，但强度集中",
      "buyTrigger": "股票不买；基金端先看相关ETF能否收复自身高点",
      "avoidReason": "单点强势不等于基金趋势扩散",
      "risk": "跌破116.01",
      "support": "116.01",
      "resistance": "121.72",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 117.2,
      "lastClose": 121.4,
      "lastHigh": 121.72,
      "lastLow": 116.01,
      "lastChangePercent": 5.47,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:29:59+08:00；11月18日收盘另经三源日K核验",
      "invalidCondition": "跌破116.01",
      "predictionScore": 7,
      "predictionLabel": "半导体强势，股票不买",
      "expectedDirection": "偏强",
      "riskLevel": "高"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "status": "白酒窄幅偏强，金额过门仍不买",
      "reason": "午盘涨0.17%；18手金额过门但缺资金和收益证据",
      "buyTrigger": "站稳0.578，且先有成交资金、预期毛收益≥2.88%和扣费后收益证据",
      "avoidReason": "18手约1036.80元、往返最低费约10元；无资金来源",
      "risk": "跌破0.57",
      "support": "0.57",
      "resistance": "0.578",
      "lastTradeDate": "2026-11-19",
      "lastOpen": 0.576,
      "lastClose": 0.576,
      "lastHigh": 0.578,
      "lastLow": 0.57,
      "lastChangePercent": 0.17,
      "lastSource": "Longbridge真实午间报价，2026-11-19T11:30:00+08:00；11月18日收盘另经三源日K核验",
      "invalidCondition": "跌破0.57",
      "predictionScore": 5,
      "predictionLabel": "白酒窄幅偏强，金额过门仍不买",
      "expectedDirection": "偏弱",
      "riskLevel": "中高"
    },
    {
      "name": "易方达蓝筹精选混合",
      "code": "005827",
      "symbol": "OF005827",
      "market": "OF",
      "type": "open_fund",
      "sector": "开放式基金",
      "status": "11月18日净值已披露，运行时接口失败",
      "reason": "11月18日净值1.3578、日跌0.44%；只作dated NAV。",
      "buyTrigger": "不买；开放式基金无盘中K线，且缺少资金与收益证据",
      "avoidReason": "运行时基金接口HTTP 501，不能伪装实时",
      "risk": "净值披露滞后或接口失败",
      "support": "按净值披露",
      "resistance": "不设盘中价",
      "lastTradeDate": "2026-11-18",
      "lastOpen": null,
      "lastClose": 1.3578,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": -0.44,
      "lastSource": "东方财富基金11月18日公开净值；运行时基金接口HTTP 501，mode=failed",
      "invalidCondition": "运行时真实基金接口接通并通过校验",
      "predictionScore": 3,
      "predictionLabel": "净值续跌、接口失败",
      "expectedDirection": "震荡偏弱",
      "riskLevel": "中高"
    }
  ],
  "newsItems": [
    {
      "title": "A股午盘三大指数下跌，科创50逆势上涨",
      "source": "Longbridge / 新浪 / 腾讯 / 东方财富",
      "publishTime": "2026-11-19 12:15:00+08:00",
      "summary": "已确认事实：上证-0.44%、深成指-0.51%、创业板-0.63%、科创50+0.98%。基于事实的判断：结构性强、广度弱，午后不做基金低位摊薄。",
      "relatedStocks": [
        "159740",
        "512710",
        "159608",
        "159241",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / A股午盘",
      "relation": "market",
      "url": "https://finance.caixin.com/2026-11-19/102506453.html"
    },
    {
      "title": "161226同日溢价回落至约7.10%",
      "source": "东方财富基金 / 三源日K / Longbridge",
      "publishTime": "2026-11-19 12:15:00+08:00",
      "summary": "已确认事实：11月18日场内收1.353、净值1.2633，同日静态溢价约7.10%；11:30报1.310。基于事实的判断：硬风险线已失效，跨日比较不触发卖出。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "过去24小时 / 持仓风险 / 白银LOF",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10"
    },
    {
      "title": "11月18日A股缩量收涨，科创50领涨",
      "source": "21财经 / 多源指数核验",
      "publishTime": "2026-11-18 15:20:00+08:00",
      "summary": "已确认事实：上证+0.09%、深成指+0.20%、创业板+0.85%、科创50+2.19%；两市成交约1.37万亿元并创阶段低量。基于事实的判断：价格反弹但量能不足，不能视为全面转强。",
      "relatedStocks": [
        "512710",
        "159740",
        "688981"
      ],
      "sector": "过去24小时 / 上一交易日 / 量能风险",
      "relation": "market",
      "url": "https://finance.eastmoney.com/a/202611183933949553.html"
    },
    {
      "title": "美股继续分化，标普录得五连跌",
      "source": "AP",
      "publishTime": "2026-11-18 16:20:00-05:00",
      "summary": "已确认事实：S&P 500跌0.2%、道指跌1.1%、纳指涨0.4%；S&P 500连续第五日下跌，10年期美债收益率回落至5.06%。基于事实的判断：海外AI和高利率风险仍在，科技基金不追。",
      "relatedStocks": [
        "159740",
        "512710",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / 海外收盘",
      "relation": "market",
      "url": "https://apnews.com/article/stock-markets-ai-earnings-oil-apec-shenzhen-dad5715bc91b4aba23a567a40e22b1fc"
    },
    {
      "title": "国家能源局发布首部虚拟电厂国家级发展报告",
      "source": "国家能源局",
      "publishTime": "2026-11-19 09:00:00+08:00",
      "summary": "已确认事实：截至6月底全国已投运虚拟电厂592个、同比增78.9%，最大调节能力2042.8万千瓦、同比增62.7%。基于事实的判断：电力链中期逻辑增强，但562350午盘下跌，暂不追买。",
      "relatedStocks": [
        "562350",
        "002090",
        "600050"
      ],
      "sector": "过去24小时 / 官方政策利好 / 电力",
      "relation": "market",
      "url": "https://www.nea.gov.cn/20261119/7504b3489a694054920e81f18fc3072f/c.html"
    },
    {
      "title": "APEC深圳领导人会议进入第二日",
      "source": "深圳市政府",
      "publishTime": "2026-11-19 09:00:00+08:00",
      "summary": "已确认事实：APEC第三十三次领导人非正式会议于11月18—19日在深圳举行。基于事实的判断：开放与区域合作是观察线，不直接生成基金订单。",
      "relatedStocks": [
        "159740",
        "600050",
        "562350"
      ],
      "sector": "过去24小时 / 政策日程 / 观察池",
      "relation": "market",
      "url": "https://www.sz.gov.cn/cn/xxgk/zfxxgj/zwdt/content/post_12977425.html"
    },
    {
      "title": "13个场内标的午间真实报价全部通过校验",
      "source": "Longbridge / 新浪 / 腾讯 / 东方财富",
      "publishTime": "2026-11-19 12:15:00+08:00",
      "summary": "已确认事实：13/13均有11月19日11:28—11:30非零OHLC；其11月18日前收与三源日K收盘逐项一致。自有代理当前为12个delayed、1个failed。基于事实的判断：页面只能显示带时间戳的午间快照，代理失败不画假线。",
      "relatedStocks": [
        "159740",
        "164701",
        "512710",
        "161226",
        "159608",
        "159241",
        "562350"
      ],
      "sector": "过去24小时 / 数据校验 / 真实行情",
      "relation": "holding",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226"
    },
    {
      "title": "005827净值续跌，运行时基金接口仍失败",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-11-19 12:15:00+08:00",
      "summary": "已确认事实：11月18日净值1.3578、日跌0.44%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。",
      "relatedStocks": [
        "005827"
      ],
      "sector": "过去24小时 / 持仓 / 开放式基金 / 接口失败",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10"
    }
  ],
  "reasoning": [
    {
      "title": "161226先解决同日口径",
      "basis": "11月18日同日溢价7.10%，11:30跨日估算3.70%。",
      "inference": "跨日估算混入当日银价和净值变化，不能确认实时溢价。",
      "conclusion": "无可靠同日IOPV/净值和真实持仓前卖0手。",
      "invalidCondition": "实际持有且可靠同日溢价重新≥8%。"
    },
    {
      "title": "科创强势与组合广度分离",
      "basis": "科创50+0.98%、688981+5.47%，但多数基金下跌。",
      "inference": "半导体单点强势没有转化为组合普涨。",
      "conclusion": "股票不买，科技基金不追。",
      "invalidCondition": "基金自身收复上午高点且执行三门齐备。"
    },
    {
      "title": "普通碎片单仍不经济",
      "basis": "161226历史2手、159740历史3手、164701历史2手均不足1000元且单边费用占比超过0.5%。",
      "inference": "普通波动不值得重复支付最低佣金。",
      "conclusion": "触价只复核。",
      "invalidCondition": "出现明确硬风险。"
    },
    {
      "title": "账户证据是执行前置条件",
      "basis": "券商持仓与当日订单接口仍返回OAuth 403308。",
      "inference": "无法确认历史份额，也无法确认卖出回款。",
      "conclusion": "买卖均为0手。",
      "invalidCondition": "用户在券商端完成核对。"
    }
  ],
  "invalidConditions": [
    "161226无法确认实际持仓，或可靠同日溢价低于8%：卖0手。",
    "最新券商持仓与历史示例不一致：历史手数立即失效，按真实可卖份额一次合并重算。",
    "161226/159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
    "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
    "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
  ],
  "cancelPlan": [
    "午后先查券商最新持仓与挂单；不存在的历史份额不得生成订单。",
    "161226只用可靠同日IOPV/净值重算溢价；跨日估算不得触发卖出。",
    "午后瞬时跳价不直接成交，先确认真实价格、时间戳与流动性。",
    "卖出未真实成交前不写入买入资金；成交后也先留现金。",
    "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "午间价必须带真实时间戳",
      "basis": "13个场内标的均有Longbridge 11:28—11:30非零OHLC。",
      "inference": "12:15只能称午间快照，不能称持续实时。",
      "conclusion": "页面保留真实时间戳和代理降级状态。",
      "invalidCondition": "午后取得更新且通过校验的真实报价。"
    },
    {
      "title": "LOF溢价必须同日比较",
      "basis": "11月18日同日溢价7.10%，11:30跨日估算3.70%。",
      "inference": "跨日口径不能确认当日真实溢价。",
      "conclusion": "同日证据不足时卖0手。",
      "invalidCondition": "取得可靠同日IOPV/净值。"
    },
    {
      "title": "费用门先于普通调仓",
      "basis": "三笔历史碎片单参考额262.00元、135.00元、285.80元。",
      "inference": "均未达到经济金额，最低佣金侵蚀过大。",
      "conclusion": "普通调仓暂停。",
      "invalidCondition": "明确硬风险出现。"
    },
    {
      "title": "资金来源必须已成交",
      "basis": "账户订单接口未授权，无法证明有卖出回款。",
      "inference": "计划卖出不是资金。",
      "conclusion": "新增买入0手。",
      "invalidCondition": "券商端确认成交和可用资金。"
    },
    {
      "title": "政策利好与价格确认分开",
      "basis": "虚拟电厂建设规模增长，但562350午盘下跌。",
      "inference": "政策方向改善不等于今日基金买点。",
      "conclusion": "观察，不追买。",
      "invalidCondition": "价格与费用后收益证据同步改善。"
    }
  ],
  "nextWatch": [
    "13:00前：在券商端核对真实持仓、可卖份额、挂单和实际费率。",
    "13:00后：只用带真实时间戳的更新报价；自有代理仍延迟/失败时，不按页面自动刷新执行。",
    "13:30：若能取得可靠同日IOPV/净值，再重算161226溢价；否则卖0手。",
    "14:00：观察159740的0.447、512710的0.548、159241的0.853能否守住；跌破只复核。",
    "14:30：观察688981强势能否扩散到基金端；股票仍不买、基金不追。",
    "15:00后：记录真实收盘并等待11月19日基金净值披露，再做同日溢价复盘。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "28.48",
      "resistance": "29.29"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.46",
      "resistance": "4.55"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "32.77",
      "resistance": "33.53"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "116.01",
      "resistance": "121.72"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.57",
      "resistance": "0.578"
    },
    {
      "name": "易方达蓝筹精选混合",
      "code": "005827",
      "symbol": "OF005827",
      "market": "OF",
      "type": "open_fund",
      "sector": "开放式基金",
      "support": "按净值披露",
      "resistance": "不设盘中价"
    }
  ],
  "sources": [
    {
      "name": "Longbridge：13个标的11月19日午间真实报价",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226",
      "note": "2026-11-19 12:15核验：Longbridge 13/13返回11:28—11:30非零OHLC；11月18日前收与三源日K收盘一致。"
    },
    {
      "name": "11月18日三源日K一致性核验",
      "url": "https://daily-briefing-blue.vercel.app/api/kline?symbol=SH512710&period=day",
      "note": "新浪、腾讯、东方财富对13个标的11月18日OHLC形成至少两源一致，13/13通过；自有代理当前为延迟/失败态。"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10",
      "note": "11月18日单位净值1.2633、日跌0.27%；相对同日收盘1.353的静态溢价约7.10%。"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10",
      "note": "11月18日单位净值1.3578、日跌0.44%；仅作dated NAV。"
    },
    {
      "name": "运行时基金接口HTTP 501失败态",
      "url": "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827",
      "note": "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。"
    },
    {
      "name": "财新：11月19日A股开盘与政策消息",
      "url": "https://finance.caixin.com/2026-11-19/102506453.html",
      "note": "三大指数低开，公用事业相对强、资源与科技方向分化；用于午盘背景核对。"
    },
    {
      "name": "21财经：11月18日A股收盘",
      "url": "https://finance.eastmoney.com/a/202611183933949553.html",
      "note": "上证+0.09%、深成指+0.20%、创业板+0.85%、科创50+2.19%，成交约1.37万亿元。"
    },
    {
      "name": "AP：11月18日美股收盘",
      "url": "https://apnews.com/article/stock-markets-ai-earnings-oil-apec-shenzhen-dad5715bc91b4aba23a567a40e22b1fc",
      "note": "S&P 500跌0.2%、道指跌1.1%、纳指涨0.4%；S&P 500连续第五日下跌。"
    },
    {
      "name": "国家能源局：中国虚拟电厂发展报告（2026）解读",
      "url": "https://www.nea.gov.cn/20261119/7504b3489a694054920e81f18fc3072f/c.html",
      "note": "截至6月底已投运592个虚拟电厂，最大调节能力2042.8万千瓦；仅作电力链政策背景。"
    },
    {
      "name": "深圳市政府：APEC深圳会议日程",
      "url": "https://www.sz.gov.cn/cn/xxgk/zfxxgj/zwdt/content/post_12977425.html",
      "note": "APEC第三十三次领导人非正式会议于11月18—19日在深圳举行；不直接生成订单。"
    }
  ]
};
