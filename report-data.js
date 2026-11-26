window.MARKET_BRIEFING_DATA = {
  "date": "2026-11-27",
  "portfolioVersion": "portfolio-2026-11-27-premarket-from-20261126-close-fee-aware-v1",
  "time": "2026-11-26 18:25收盘更新：13个场内持仓/观察标的均为11月26日真实收盘；自有代理、三源日K与Longbridge逐项核对。执行计划面向11月27日开盘。",
  "lastUpdated": "2026-11-26 18:25 北京时间（场内标的为11月26日真实收盘；基金为11月25日公开净值；开放式基金运行时接口仍失败）",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "logicUpdatedAt": "2026-11-26收盘 / 11月27日盘前（券商持仓、订单、成交接口均为OAuth 403308）",
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
        "label": "历史2手高溢价风险复核（实际持仓未授权）",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.225,
        "hardRiskExit": false
      },
      {
        "code": "159740",
        "label": "历史3手普通减仓复核",
        "side": "sell",
        "lots": 3,
        "referencePrice": 0.424,
        "hardRiskExit": false
      },
      {
        "code": "164701",
        "label": "历史2手普通减仓复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.36,
        "hardRiskExit": false
      },
      {
        "code": "161725",
        "label": "18手最低经济金额买入复核",
        "side": "buy",
        "lots": 18,
        "referencePrice": 0.563,
        "hardRiskExit": false
      }
    ]
  },
  "oneLine": "11月27日盘前买0手、卖0手。161226在11月25日收1.209、净值1.0917，同日静态溢价约10.74%，高于8%风险线；11月26日收1.225相对旧净值约12.21%仅是跨日复核，须先核仓并取得更新净值。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "盘前买0手、卖0手；先核161226与弱势基金",
      "conclusion": "已确认事实：161226在11月25日同日静态溢价约10.74%，越过8%风险线；11月26日收1.225，相对11月25日净值约12.21%仍是跨日口径。",
      "action": "11月27日先核对实际持仓、可卖份额和161226更新净值/IOPV；512710与159241只做弱势复核，不下普通碎片单。",
      "trigger": "实际持仓存在 + 可靠同日溢价≥8% + 真实开盘报价有效，161226才进入一次合并硬风险退出复核；缺一项即卖0手。",
      "reason": "历史同日溢价风险仍高，但账户证据与最新同日净值不能省。仅供个人复盘参考。"
    },
    {
      "type": "市场结构",
      "title": "指数近乎平收，科创与军工明显偏弱",
      "conclusion": "已确认事实：11月26日上证+0.01%、深成指-0.02%、创业板+0.29%、科创50-1.36%；512710跌1.90%、159241跌1.60%、688981跌4.51%。",
      "action": "不追开盘反抽；军工、航天、半导体先看能否收复11月26日高点，股票仍只作板块温度计。",
      "trigger": "基金自身站稳11月26日高点、真实资金到账、预期毛收益覆盖往返费用3倍且扣费后≥1%，才进入买入评估。",
      "reason": "主板平稳掩盖了成长方向的收盘压力。仅供个人复盘参考。"
    },
    {
      "type": "费用闸门",
      "title": "三笔历史碎片单仍全部暂停",
      "conclusion": "按11月26日收盘：161226历史2手约245.00元/单边费2.04%，159740历史3手约127.20元/3.93%，164701历史2手约272.00元/1.84%；普通订单均不经济。",
      "action": "159740与164701不下碎片单；161226只有实际持仓与最新同日硬风险同时确认后才可越过金额门，并一次完成。",
      "trigger": "普通波动保持0手；基本面失效、流动性异常或可靠同日溢价≥8%才进入硬风险复核。",
      "reason": "暂按0.025%、每笔最低5元保守估算，待券商实际费率确认。仅供个人复盘参考。"
    },
    {
      "type": "新买入",
      "title": "金额门可过，资金与收益门失败",
      "conclusion": "161725按18手约1013.40元，往返最低佣金约10元、费用占比约0.99%；可核验毛收益至少需2.97%，且扣费后不少于1%。",
      "action": "不买。没有已成交卖出资金，也没有可靠收益空间证据。",
      "trigger": "站稳0.570，同时真实资金已到账、预期毛收益≥2.97%、扣费后≥1%，才重新评估。",
      "reason": "价格触发不能替代资金门和收益门。仅供个人复盘参考。"
    },
    {
      "type": "相对强弱",
      "title": "港股科技与贵金属修复，成长硬件仍弱",
      "conclusion": "已确认事实：159740涨1.68%、164701涨1.34%、161226涨1.32%；688981跌4.51%。",
      "action": "现有基金只持有观察、不追；161226上涨不能抵消溢价风险，688981仍只作半导体风险温度计。",
      "trigger": "基金自身突破11月26日高点且资金、费用、收益三门齐备，才进入基金端评估。",
      "reason": "修复与风险并存，个股强弱不直接生成股票订单。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 11月27日开盘前在券商端核对真实持仓、可卖份额、挂单、成交和实际费率；网页仍无法读取账户数据。",
    "2. 161226的11月25日同日静态溢价约10.74%，但11月26日净值尚未取得；先重算最新同日溢价。",
    "3. 若实际不再持有161226，或可靠最新同日溢价低于8%，卖0手；若两项均确认，按全部实际可卖份额一次合并复核，避免拆单。",
    "4. 512710与159241收盘偏弱，只做风险复核；历史普通小单不得机械执行。",
    "5. 159740历史3手与164701历史2手继续暂停：普通费用门不通过。",
    "6. 其余基金新增买入0手；未成交卖出不得写成资金来源，真实卖出后也先留现金。",
    "7. 股票条目只作板块温度计；接口失败时不画假线或假K线。"
  ],
  "tradePlan": [
    {
      "title": "161226历史同日溢价仍在硬风险区",
      "basis": "11月25日场内收1.209、净值1.0917，同日静态溢价约10.74%。",
      "inference": "历史风险线已触发；11月26日收盘与旧净值的比较不能代替最新同日证据。",
      "conclusion": "当前卖0手；先核仓并重算，确认后才合并退出。",
      "invalidCondition": "实际无持仓，或可靠最新同日溢价回落至8%以下。"
    },
    {
      "title": "科创与军工收盘偏弱",
      "basis": "科创50-1.36%、512710-1.90%、159241-1.60%。",
      "inference": "成长分支承压，开盘反抽不能直接视为趋势反转。",
      "conclusion": "基金不追、股票不买。",
      "invalidCondition": "目标基金站稳11月26日高点且三门齐备。"
    },
    {
      "title": "普通碎片单仍不经济",
      "basis": "159740历史3手约127.20元，164701历史2手约272.00元。",
      "inference": "最低佣金占比显著超过0.5%。",
      "conclusion": "触价只复核，不机械卖。",
      "invalidCondition": "出现明确硬风险。"
    },
    {
      "title": "资金来源仍未成立",
      "basis": "券商持仓、订单、成交接口均返回OAuth 403308。",
      "inference": "无法证明历史份额，也无法证明有卖出回款。",
      "conclusion": "新增买入0手。",
      "invalidCondition": "券商端确认成交和可用资金。"
    }
  ],
  "noTradeList": [
    "不把11月26日收盘写成11月27日实时价；页面保留真实交易日和更新时间。",
    "不把161226的11月26日收盘与11月25日净值写成同日溢价。",
    "不在券商持仓接口未授权时机械卖历史2手。",
    "不执行159740历史3手或164701历史2手普通碎片卖单。",
    "不因港股科技或贵金属单日上涨追买ETF、LOF。",
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
      "support": "0.421 / 11月26日低点",
      "resistance": "0.432 / 11月26日高点",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 0.425,
      "lastClose": 0.424,
      "lastHigh": 0.432,
      "lastLow": 0.421,
      "lastChangePercent": 1.68,
      "lastSource": "自有代理2026-11-26 15:34:30真实收盘（eastmoney）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "action": "持有、不追；历史3手普通减仓仍被费用门阻断",
      "invalidCondition": "跌破0.421且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 6,
      "predictionLabel": "港股科技修复",
      "expectedDirection": "偏强",
      "reason": "涨1.68%，但仍未突破11月26日高点。",
      "riskLevel": "中高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.355 / 11月26日低点",
      "resistance": "1.375 / 11月26日高点",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 1.361,
      "lastClose": 1.36,
      "lastHigh": 1.375,
      "lastLow": 1.355,
      "lastChangePercent": 1.34,
      "lastSource": "自有代理2026-11-26 15:00:00真实收盘（sina）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "action": "持有、不追；历史2手普通减仓仍被费用门阻断",
      "invalidCondition": "跌破1.355且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 6,
      "predictionLabel": "黄金修复",
      "expectedDirection": "偏强",
      "reason": "涨1.34%，贵金属波动仍高。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.512 / 11月26日低点",
      "resistance": "0.537 / 11月26日高点",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 0.532,
      "lastClose": 0.516,
      "lastHigh": 0.537,
      "lastLow": 0.512,
      "lastChangePercent": -1.9,
      "lastSource": "自有代理2026-11-26 16:11:43真实收盘（eastmoney）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "action": "持有、先复核0.512；普通小单不执行，新买0手",
      "invalidCondition": "跌破0.512且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 2,
      "predictionLabel": "军工转弱",
      "expectedDirection": "偏弱",
      "reason": "跌1.90%，收盘靠近日低。",
      "riskLevel": "高"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.212 / 11月26日低点",
      "resistance": "1.236 / 11月26日高点",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 1.226,
      "lastClose": 1.225,
      "lastHigh": 1.236,
      "lastLow": 1.212,
      "lastChangePercent": 1.32,
      "lastSource": "自有代理2026-11-26 15:34:51真实收盘（eastmoney）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "action": "卖0手；仅在实际持仓与可靠同日溢价≥8%同时确认后一次合并复核",
      "invalidCondition": "跌破1.212且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 3,
      "predictionLabel": "上涨但溢价风险高",
      "expectedDirection": "震荡偏弱",
      "reason": "涨1.32%；11月25日同日静态溢价约10.74%，先核仓和更新净值。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "0.701 / 11月26日低点",
      "resistance": "0.727 / 11月26日高点",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 0.715,
      "lastClose": 0.71,
      "lastHigh": 0.727,
      "lastLow": 0.701,
      "lastChangePercent": 0.28,
      "lastSource": "自有代理2026-11-26 15:35:00真实收盘（sina）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "action": "持有、不补；跌破0.701只进入复核",
      "invalidCondition": "跌破0.701且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 5,
      "predictionLabel": "稀有金属震荡",
      "expectedDirection": "震荡",
      "reason": "涨0.28%，盘中振幅较大。",
      "riskLevel": "中高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "0.792 / 11月26日低点",
      "resistance": "0.836 / 11月26日高点",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 0.824,
      "lastClose": 0.8,
      "lastHigh": 0.836,
      "lastLow": 0.792,
      "lastChangePercent": -1.6,
      "lastSource": "自有代理2026-11-26 15:34:33真实收盘（eastmoney）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "action": "持有、先复核0.792；普通小单不执行，新买0手",
      "invalidCondition": "跌破0.792且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 2,
      "predictionLabel": "航天转弱",
      "expectedDirection": "偏弱",
      "reason": "跌1.60%，收盘低于开盘。",
      "riskLevel": "高"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.066 / 11月26日低点",
      "resistance": "1.073 / 11月26日高点",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 1.069,
      "lastClose": 1.069,
      "lastHigh": 1.073,
      "lastLow": 1.066,
      "lastChangePercent": 0.09,
      "lastSource": "自有代理2026-11-26 15:00:01真实收盘（sina）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "action": "持有、不加仓；站稳1.073且三门齐备才复核",
      "invalidCondition": "跌破1.066且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 5,
      "predictionLabel": "电力横盘",
      "expectedDirection": "震荡",
      "reason": "涨0.09%，日内波动较窄。",
      "riskLevel": "中高"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "7.47 / 11月26日低点",
      "resistance": "7.72 / 11月26日高点",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 7.58,
      "lastClose": 7.59,
      "lastHigh": 7.72,
      "lastLow": 7.47,
      "lastChangePercent": 0.4,
      "lastSource": "自有代理2026-11-26 15:36:00真实收盘（sina）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "action": "仅观察，不新增股票买卖指令；用于判断电网设备风险",
      "invalidCondition": "跌破7.47且板块继续转弱；普通订单仍须通过费用闸门",
      "predictionScore": 5,
      "predictionLabel": "电网设备震荡",
      "expectedDirection": "震荡",
      "reason": "涨0.40%，股票只作基金环境参考。",
      "riskLevel": "中高"
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
      "status": "宽幅震荡，股票不买",
      "reason": "涨1.10%，但日内振幅大",
      "buyTrigger": "股票不买；基金端需站稳26.65并通过费用门",
      "avoidReason": "宽幅波动，追价性价比不足",
      "risk": "跌破25.11",
      "support": "25.11",
      "resistance": "26.65",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 25.89,
      "lastClose": 25.75,
      "lastHigh": 26.65,
      "lastLow": 25.11,
      "lastChangePercent": 1.1,
      "lastSource": "自有代理2026-11-26 16:11:47真实收盘（eastmoney）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "invalidCondition": "跌破25.11",
      "predictionScore": 5,
      "predictionLabel": "宽幅震荡，股票不买",
      "expectedDirection": "震荡",
      "riskLevel": "高"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "status": "通信偏弱，股票不买",
      "reason": "跌0.45%",
      "buyTrigger": "股票不买；基金端需站稳4.52并通过费用门",
      "avoidReason": "强度未扩散，费用后收益证据不足",
      "risk": "跌破4.44",
      "support": "4.44",
      "resistance": "4.52",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 4.49,
      "lastClose": 4.47,
      "lastHigh": 4.52,
      "lastLow": 4.44,
      "lastChangePercent": -0.45,
      "lastSource": "自有代理2026-11-26 16:11:50真实收盘（eastmoney）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "invalidCondition": "跌破4.44",
      "predictionScore": 4,
      "predictionLabel": "通信偏弱，股票不买",
      "expectedDirection": "震荡",
      "riskLevel": "中高"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "status": "锂股震荡，股票不买",
      "reason": "涨0.52%，高开后回落",
      "buyTrigger": "股票不买；基金端需站稳31.47并通过费用门",
      "avoidReason": "冲高回落且资源波动高",
      "risk": "跌破30.28",
      "support": "30.28",
      "resistance": "31.47",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 31.01,
      "lastClose": 30.68,
      "lastHigh": 31.47,
      "lastLow": 30.28,
      "lastChangePercent": 0.52,
      "lastSource": "自有代理2026-11-26 16:14:30真实收盘（tencent）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "invalidCondition": "跌破30.28",
      "predictionScore": 5,
      "predictionLabel": "锂股震荡，股票不买",
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
      "status": "半导体大跌，股票不买",
      "reason": "跌4.51%，接近日低收盘",
      "buyTrigger": "股票不买；基金端先看相关ETF能否收复自身高点",
      "avoidReason": "单点大跌显示成长硬件风险",
      "risk": "跌破115.76",
      "support": "115.76",
      "resistance": "123.02",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 123,
      "lastClose": 116.5,
      "lastHigh": 123.02,
      "lastLow": 115.76,
      "lastChangePercent": -4.51,
      "lastSource": "自有代理2026-11-26 15:34:59真实收盘（sina）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "invalidCondition": "跌破115.76",
      "predictionScore": 1,
      "predictionLabel": "半导体大跌，股票不买",
      "expectedDirection": "偏弱",
      "riskLevel": "高"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "status": "白酒偏弱，金额过门仍不买",
      "reason": "跌1.05%；18手金额过门但缺资金和收益证据",
      "buyTrigger": "站稳0.570，且先有成交资金、预期毛收益≥2.97%和扣费后≥1%",
      "avoidReason": "18手约1013.40元、往返最低费约10元；无资金来源",
      "risk": "跌破0.562",
      "support": "0.562",
      "resistance": "0.57",
      "lastTradeDate": "2026-11-26",
      "lastOpen": 0.568,
      "lastClose": 0.563,
      "lastHigh": 0.57,
      "lastLow": 0.562,
      "lastChangePercent": -1.05,
      "lastSource": "自有代理2026-11-26 15:00:00真实收盘（sina）；11月26日OHLC经三源日K一致并与Longbridge日K核对",
      "invalidCondition": "跌破0.562",
      "predictionScore": 3,
      "predictionLabel": "白酒偏弱，金额过门仍不买",
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
      "status": "11月25日净值已披露，运行时接口失败",
      "reason": "11月25日净值1.3289、日跌0.51%；只作dated NAV。",
      "buyTrigger": "不买；开放式基金无盘中K线，且缺少资金与收益证据",
      "avoidReason": "运行时基金接口HTTP 501，不能伪装实时",
      "risk": "净值披露滞后或接口失败",
      "support": "按净值披露",
      "resistance": "不设盘中价",
      "lastTradeDate": "2026-11-25",
      "lastOpen": null,
      "lastClose": 1.3289,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": -0.51,
      "lastSource": "东方财富基金11月25日公开净值；运行时基金接口HTTP 501，mode=failed",
      "invalidCondition": "运行时真实基金接口接通并通过校验",
      "predictionScore": 3,
      "predictionLabel": "净值回落、接口失败",
      "expectedDirection": "偏弱",
      "riskLevel": "中高"
    }
  ],
  "newsItems": [
    {
      "title": "A股冲高回落，科创50收跌1.36%",
      "source": "新浪 / 腾讯 / 东方财富",
      "publishTime": "2026-11-26 16:15:00+08:00",
      "summary": "已确认事实：上证+0.01%、深成指-0.02%、创业板+0.29%、科创50-1.36%；四项指数均由至少两源一致。基于事实的判断：主板平稳，但成长硬件压力仍在。",
      "relatedStocks": [
        "512710",
        "159241",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大利好与风险 / A股收盘",
      "relation": "market",
      "url": "https://finance.eastmoney.com/a/202611263940475023.html"
    },
    {
      "title": "161226最近可比同日静态溢价约10.74%",
      "source": "东方财富基金 / 三源日K",
      "publishTime": "2026-11-26 18:25:00+08:00",
      "summary": "已确认事实：11月25日场内收1.209、公开净值1.0917，同日静态溢价约10.74%；11月26日净值尚未取得。基于事实的判断：风险仍处硬线之上，但执行必须核仓并重算最新同日口径。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "过去24小时 / 持仓重大风险 / 白银LOF",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10"
    },
    {
      "title": "美股从盘中大跌中修复，科技股仍收低",
      "source": "AP",
      "publishTime": "2026-11-25 16:20:00-05:00",
      "summary": "已确认事实：标普500跌约0.3%、纳指跌0.6%、道指涨0.3%，10年期美债收益率降至4.87%；盘中跌幅一度明显更大。基于事实的判断：风险偏好脆弱，不能把反抽当成科技趋势确认。",
      "relatedStocks": [
        "159740",
        "512710",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大利好与风险 / 海外收盘",
      "relation": "market",
      "url": "https://apnews.com/article/10044b4fb55d3ff20fde9ba9e9acaab1"
    },
    {
      "title": "感恩节美股休市，周五缩短交易",
      "source": "AP",
      "publishTime": "2026-11-26 08:00:00-05:00",
      "summary": "已确认事实：美国市场11月26日感恩节休市，11月27日股票交易提前结束。基于事实的判断：海外价格发现变少，周五薄量波动可能放大，不作为A股追价依据。",
      "relatedStocks": [
        "159740",
        "164701",
        "161226"
      ],
      "sector": "过去24小时 / 交易日历 / 海外风险",
      "relation": "market",
      "url": "https://apnews.com/article/320cd8c9c286a7773797bf2f478ef314"
    },
    {
      "title": "13个场内标的收盘行情全部有效",
      "source": "自有代理 / 三源日K / Longbridge",
      "publishTime": "2026-11-26 18:25:00+08:00",
      "summary": "已确认事实：13/13均有11月26日非零真实收盘，自有代理与至少两家日K源OHLC一致，Longbridge报价与日K再核对。基于事实的判断：页面使用收盘快照，不把它写成11月27日实时行情。",
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
      "title": "贵金属场内基金反弹，但白银溢价风险未消",
      "source": "自有代理 / 三源日K",
      "publishTime": "2026-11-26 16:15:00+08:00",
      "summary": "已确认事实：164701涨1.34%、161226涨1.32%。基于事实的判断：价格修复不能抵消161226的溢价与停申购风险。",
      "relatedStocks": [
        "164701",
        "161226"
      ],
      "sector": "过去24小时 / 热点复盘 / 贵金属",
      "relation": "holding",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ164701"
    },
    {
      "title": "005827净值回落，运行时基金接口仍失败",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-11-26 18:25:00+08:00",
      "summary": "已确认事实：11月25日净值1.3289、日跌0.51%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。",
      "relatedStocks": [
        "005827"
      ],
      "sector": "过去24小时 / 持仓 / 开放式基金 / 接口失败",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10"
    },
    {
      "title": "半导体与军工基金收盘承压",
      "source": "自有代理 / 三源日K",
      "publishTime": "2026-11-26 16:15:00+08:00",
      "summary": "已确认事实：688981跌4.51%、512710跌1.90%、159241跌1.60%。基于事实的判断：11月27日先看能否收复前高，不抢开盘反弹。",
      "relatedStocks": [
        "688981",
        "512710",
        "159241"
      ],
      "sector": "过去24小时 / 热点复盘 / 成长分化",
      "relation": "market",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH688981"
    },
    {
      "title": "融资保证金比例将降至80%",
      "source": "上海证券交易所",
      "publishTime": "2026-11-22 18:00:00+08:00",
      "summary": "已确认事实：融资买入证券最低保证金比例自11月30日起由100%调低至80%。基于事实的判断：有助于流动性预期，但不是现有基金立即买入依据。",
      "relatedStocks": [
        "512710",
        "159241",
        "688981"
      ],
      "sector": "政策雷达 / 市场流动性 / 已确认事实",
      "relation": "market",
      "url": "https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/margin/c/c_20261122_10838633.shtml"
    },
    {
      "title": "创业板拟引入做市交易机制",
      "source": "深圳证券交易所",
      "publishTime": "2026-11-22 18:10:00+08:00",
      "summary": "已确认事实：深交所就创业板做市交易业务细则公开征求意见。基于事实的判断：中期改善定价和流动性，不直接生成基金订单。",
      "relatedStocks": [
        "688981",
        "512710"
      ],
      "sector": "政策雷达 / 交易机制 / 中性偏利好",
      "relation": "market",
      "url": "https://www.szse.cn/www/aboutus/trends/news/t20261122_623984.html"
    },
    {
      "title": "交易所推出新一批降费措施",
      "source": "深圳证券交易所",
      "publishTime": "2026-11-22 18:20:00+08:00",
      "summary": "已确认事实：深交所公布新一批市场费用减免。基于事实的判断：这是市场层面降费，不等同于用户券商佣金已经变更，费用闸门仍按待确认费率运行。",
      "relatedStocks": [
        "159740",
        "164701",
        "161226"
      ],
      "sector": "政策雷达 / 市场费用 / 利好但需区分口径",
      "relation": "market",
      "url": "https://www.szse.cn/aboutus/trends/news/t20261122_623988.html"
    },
    {
      "title": "券商账户接口仍缺少持仓与交易权限",
      "source": "Longbridge",
      "publishTime": "2026-11-26 18:22:00+08:00",
      "summary": "已确认事实：持仓、当日订单、当日成交均返回OAuth 403308。基于事实的判断：不能假定历史手数仍存在，所有当前可执行数量保持0手。",
      "relatedStocks": [
        "161226",
        "159740",
        "164701",
        "161725"
      ],
      "sector": "执行风险 / 账户核验 / 权限失败",
      "relation": "risk",
      "url": "https://open.longbridge.com/docs"
    }
  ],
  "reasoning": [
    {
      "title": "161226先解决实际份额与最新同日口径",
      "basis": "11月25日同日溢价10.74%，11月26日收盘相对旧净值约12.21%。",
      "inference": "历史同日风险已确认，但跨日估算不能替代最新净值，账户也未授权。",
      "conclusion": "当前卖0手；核仓且最新同日溢价≥8%后一次合并复核。",
      "invalidCondition": "实际无持仓，或可靠最新同日溢价低于8%。"
    },
    {
      "title": "主板平稳与成长走弱分离",
      "basis": "上证+0.01%，科创50-1.36%，688981-4.51%。",
      "inference": "指数平稳不等于成长风险解除。",
      "conclusion": "科技与军工基金不追，股票不买。",
      "invalidCondition": "目标基金站稳11月26日高点且三门齐备。"
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
      "basis": "券商持仓、当日订单、成交接口仍返回OAuth 403308。",
      "inference": "无法确认历史份额，也无法确认卖出回款。",
      "conclusion": "买卖均为0手。",
      "invalidCondition": "用户在券商端完成核对。"
    }
  ],
  "invalidConditions": [
    "161226无法确认实际持仓，或可靠最新同日溢价低于8%：卖0手。",
    "最新券商持仓与历史示例不一致：历史手数立即失效，按真实可卖份额一次合并重算。",
    "161226/159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
    "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
    "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
  ],
  "cancelPlan": [
    "先查券商最新持仓与挂单；不存在的历史份额不得生成订单。",
    "161226只用可靠最新同日IOPV/净值重算溢价；跨日估算不得触发卖出。",
    "开盘瞬时跳价不直接成交，先确认真实价格、时间戳与流动性。",
    "卖出未真实成交前不写入买入资金；成交后也先留现金。",
    "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "收盘价必须带真实交易日",
      "basis": "13个场内标的均有11月26日非零真实收盘。",
      "inference": "11月27日开盘前只能称已校验收盘，不能称实时。",
      "conclusion": "页面保留真实日期、时间和来源。",
      "invalidCondition": "取得11月27日更新且通过校验的真实报价。"
    },
    {
      "title": "LOF溢价必须同日比较",
      "basis": "11月25日同日溢价10.74%，11月26日收盘相对旧净值约12.21%。",
      "inference": "跨日口径混入当日银价和净值变化。",
      "conclusion": "最新同日证据不足时卖0手。",
      "invalidCondition": "取得可靠最新同日IOPV/净值。"
    },
    {
      "title": "费用门先于普通调仓",
      "basis": "三笔历史碎片单参考额245.00元、127.20元、272.00元。",
      "inference": "均未达到经济金额，最低佣金侵蚀过大。",
      "conclusion": "普通调仓暂停。",
      "invalidCondition": "明确硬风险出现。"
    },
    {
      "title": "资金来源必须已成交",
      "basis": "账户订单与成交接口未授权，无法证明有卖出回款。",
      "inference": "计划卖出不是资金。",
      "conclusion": "新增买入0手。",
      "invalidCondition": "券商端确认成交和可用资金。"
    },
    {
      "title": "海外休市不等于国内风险消失",
      "basis": "美股感恩节休市，周五缩短交易。",
      "inference": "外部价格发现减少，薄量波动可能放大。",
      "conclusion": "不以海外静默作为追价理由。",
      "invalidCondition": "A股基金自身形成可核验趋势且执行三门齐备。"
    }
  ],
  "nextWatch": [
    "开盘前：在券商端核对真实持仓、可卖份额、挂单和实际费率。",
    "开盘前：若11月26日基金净值已披露，重算161226同日溢价；否则卖0手。",
    "09:35：观察512710的0.512、159241的0.792能否守住；跌破只复核。",
    "10:30：观察159740能否站稳0.432、164701能否站稳1.375；未站稳不追。",
    "15:00后：记录真实收盘并等待11月27日基金净值披露，再做同日溢价复盘。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "25.11",
      "resistance": "26.65"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.44",
      "resistance": "4.52"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "30.28",
      "resistance": "31.47"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "115.76",
      "resistance": "123.02"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.562",
      "resistance": "0.57"
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
      "name": "自有代理：13个标的11月26日真实收盘",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226",
      "note": "2026-11-26 18:25核验：13/13返回非零closed行情；页面保留真实交易日和时间戳。"
    },
    {
      "name": "11月26日三源日K一致性核验",
      "url": "https://daily-briefing-blue.vercel.app/api/kline?symbol=SH512710&period=day",
      "note": "新浪、腾讯、东方财富对13个标的11月26日OHLC形成至少两源一致，13/13通过。"
    },
    {
      "name": "Longbridge收盘行情、日K与账户接口",
      "url": "https://open.longbridge.com/docs",
      "note": "13/13报价时间为11月26日15:00，均与Longbridge当日日K一致；持仓、订单、成交均返回OAuth 403308。"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10",
      "note": "11月25日单位净值1.0917、日跌5.71%；相对同日收盘1.209的静态溢价约10.74%。"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10",
      "note": "11月25日单位净值1.3289、日跌0.51%；仅作dated NAV。"
    },
    {
      "name": "运行时基金接口HTTP 501失败态",
      "url": "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827",
      "note": "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。"
    },
    {
      "name": "21财经：11月26日A股午评",
      "url": "https://finance.eastmoney.com/a/202611263940475023.html",
      "note": "早盘指数冲高回落；正式收盘指数由三源行情更新并核对。"
    },
    {
      "name": "AP：11月25日美股修复多数跌幅",
      "url": "https://apnews.com/article/10044b4fb55d3ff20fde9ba9e9acaab1",
      "note": "标普500约-0.3%、纳指-0.6%、道指+0.3%，10年期美债收益率4.87%。"
    },
    {
      "name": "AP：感恩节全球市场与美股休市",
      "url": "https://apnews.com/article/320cd8c9c286a7773797bf2f478ef314",
      "note": "11月26日美股休市，11月27日缩短交易；只作海外流动性风险背景。"
    },
    {
      "name": "上交所：调整融资保证金比例",
      "url": "https://www.sse.com.cn/lawandrules/sselawsrules2025/trade/specific/margin/c/c_20261122_10838633.shtml",
      "note": "最低融资保证金比例自11月30日起降至80%；不直接生成买入指令。"
    },
    {
      "name": "深交所：创业板做市规则征求意见",
      "url": "https://www.szse.cn/www/aboutus/trends/news/t20261122_623984.html",
      "note": "中期流动性和定价机制背景；不直接生成订单。"
    },
    {
      "name": "深交所：新一批降费措施",
      "url": "https://www.szse.cn/aboutus/trends/news/t20261122_623988.html",
      "note": "交易所费用减免不等于券商佣金已经变更。"
    }
  ]
};
