window.MARKET_BRIEFING_DATA = {
  "date": "2026-11-18",
  "portfolioVersion": "portfolio-2026-11-18-premarket-fee-aware-v1",
  "time": "2026-11-17 20:42收盘核验：13个场内持仓/观察标的均为11月17日真实收盘，已与自有代理、至少两家独立日K源及Longbridge收盘报价核对；本报告供11月18日盘前执行。开放式基金运行时接口HTTP 501，保留明确失败态。",
  "lastUpdated": "2026-11-17 20:42 北京时间（场内标的和两只基金最近真实数据日均为11月17日；开放式基金运行时接口HTTP 501）",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "logicUpdatedAt": "2026-11-17收盘更新（券商持仓与当日订单接口再次因OAuth授权范围不足而无法核验）",
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
        "label": "历史2手硬风险退出示例（持仓未授权）",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.401,
        "hardRiskExit": true
      },
      {
        "code": "159740",
        "label": "历史3手普通减仓复核",
        "side": "sell",
        "lots": 3,
        "referencePrice": 0.463,
        "hardRiskExit": false
      },
      {
        "code": "164701",
        "label": "历史2手普通减仓复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.488,
        "hardRiskExit": false
      },
      {
        "code": "161725",
        "label": "18手最低经济金额买入复核",
        "side": "buy",
        "lots": 18,
        "referencePrice": 0.582,
        "hardRiskExit": false
      }
    ]
  },
  "oneLine": "11月18日盘前不买。161226在11月17日收1.401、净值1.2667，同日静态溢价约10.60%，重新超过8%硬风险线：只有券商确认仍持有且开盘后可靠同日溢价仍≥8%，才一次卖出全部实际可卖份额；否则卖0手。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "不买；161226只做条件化硬退出",
      "conclusion": "已确认事实：161226在11月17日场内收1.401、净值1.2667，同日静态溢价约10.60%，重新超过8%硬风险线；但券商持仓接口仍未授权。",
      "action": "11月18日09:20先核对券商实际持仓与可卖份额；若仍持有，且09:30后可靠同日IOPV/净值显示溢价仍≥8%，一次卖出全部实际可卖份额，不拆单。否则卖0手；其余基金买卖均为0手。",
      "trigger": "必须同时满足：实际持仓存在、同日溢价≥8%、真实价格与时间戳有效；任一不满足就不下单。",
      "reason": "历史2手仅作费用示例：成交额约280.20元、单边最低费约5元/占比1.78%；按净值等值测算扣费后仍约有8.63%净溢价空间，属于硬风险例外。仅供个人复盘参考。"
    },
    {
      "type": "费用闸门",
      "title": "普通碎片卖单继续暂停",
      "conclusion": "按11月17日真实收盘：159740历史3手约138.90元/单边费3.60%，164701历史2手约297.60元/1.68%；均低于1000元且费用占比高于0.5%。",
      "action": "普通波动只进入风险复核，不下碎片单、不拆单。",
      "trigger": "只有基本面失效、流动性异常或可靠同日数据确认的LOF溢价失控，才越过最低经济金额。",
      "reason": "费率暂按0.025%、每笔最低5元保守估算，待券商实际费率确认；普通卖出没有可接受的费用后空间。仅供个人复盘参考。"
    },
    {
      "type": "市场风险",
      "title": "指数仍弱，科创反弹未扩散",
      "conclusion": "已确认事实：上证-0.50%、深成指-0.49%、创业板-1.20%，科创50+0.62%；全市场约1326股上涨、4119股下跌。688981涨6.59%，但多数持仓并未同步走强。",
      "action": "不追半导体反弹、不做低位摊薄；股票仍只作基金板块温度计。",
      "trigger": "基金需收复11月17日高点，并同时通过资金、费用与可核验收益门，才进入买入评估；当前新增0手。",
      "reason": "科创强度集中而市场广度偏弱，单一股票反弹不能替代基金端趋势和费用后收益证据。仅供个人复盘参考。"
    },
    {
      "type": "持仓分化",
      "title": "贵金属小幅修复，锂与航天继续弱",
      "conclusion": "已确认事实：164701涨0.47%、512710涨0.17%、562350涨0.18%；159608跌1.03%、159241跌1.20%。",
      "action": "除161226硬风险复核外，其余持有/观察，不因单日修复追买，也不下普通碎片卖单。",
      "trigger": "跌破11月17日低点只触发风险复核；普通卖单仍需金额与费率双门通过。",
      "reason": "同一组合内强弱分化明显，优先处理可量化的LOF溢价风险。仅供个人复盘参考。"
    },
    {
      "type": "新买入",
      "title": "金额过门，资金与收益证据仍缺",
      "conclusion": "161725按18手约1047.60元，往返最低佣金约10元、费用占比约0.95%；预期毛收益至少需约2.85%才能覆盖往返费3倍。",
      "action": "不买。没有已成交卖出资金，也没有可核验证据支持费用后收益空间。",
      "trigger": "需同时有真实资金、预期毛收益≥2.85%、扣费后预期收益≥1%，且真实价格站稳0.583，再评估。",
      "reason": "金额门通过不等于资金门和收益门通过；计划卖出不能作为资金来源。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 11月18日09:20在券商端核对161226是否仍持有、实际可卖份额、挂单与实际费率。",
    "2. 09:30后只用真实时间戳和可靠同日IOPV/净值重算161226溢价；跨日净值不触发。",
    "3. 若实际持仓存在且同日溢价仍≥8%，按硬风险例外一次卖出全部实际可卖份额；不拆单。",
    "4. 若无持仓、溢价<8%、数据失败或报价过期，161226卖0手。",
    "5. 159740历史3手、164701历史2手继续暂停，普通费用门不通过。",
    "6. 其余基金新增买入0手；任何卖出未真实成交前，不把计划卖出写成资金来源。",
    "7. 股票条目只作板块温度计，不生成股票订单；所有建议仅供个人复盘参考。"
  ],
  "tradePlan": [
    {
      "title": "161226重回硬风险复核",
      "basis": "11月17日场内收1.401、净值1.2667，同日静态溢价约10.60%。",
      "inference": "历史2手成交额约280.20元，单边费约1.78%；硬风险退出可越过金额门，扣费后净溢价示例约8.63%。",
      "conclusion": "仅在实际持仓和开盘后同日溢价双确认时，一次卖出全部实际可卖份额；否则0手。",
      "invalidCondition": "无实际持仓、同日溢价<8%或真实数据失败。"
    },
    {
      "title": "半导体反弹不等于基金买点",
      "basis": "688981涨6.59%、科创50涨0.62%，但创业板跌1.20%且4119股下跌。",
      "inference": "强度集中、广度偏弱，缺少基金端趋势扩散。",
      "conclusion": "股票不买，相关基金不追。",
      "invalidCondition": "基金收复11月17日高点且费用、资金、收益证据齐备。"
    },
    {
      "title": "普通碎片单仍不经济",
      "basis": "159740历史3手约138.90元，164701历史2手约297.60元。",
      "inference": "最低佣金占比显著高于0.5%。",
      "conclusion": "触价只复核，不机械卖。",
      "invalidCondition": "出现明确硬风险。"
    },
    {
      "title": "资金来源必须已成交",
      "basis": "券商持仓与订单接口均返回OAuth 403308。",
      "inference": "无法证明历史份额存在，也无法证明有卖出回款。",
      "conclusion": "除条件化风险退出外，其余买卖0手。",
      "invalidCondition": "券商端完成实际持仓、订单、成交和可用资金核对。"
    }
  ],
  "noTradeList": [
    "不把11月17日收盘价写成11月18日实时价。",
    "不在券商未确认持仓时机械卖历史2手；历史手数仅作费用示例。",
    "不执行159740历史3手或164701历史2手普通碎片卖单。",
    "不因688981和科创50反弹追买股票或科技基金。",
    "不把计划卖出当作已到账资金；新增买入0手。",
    "不买股票观察池；股票只作基金板块温度计。",
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
      "support": "0.456 / 当日低点",
      "resistance": "0.467 / 当日高点",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 0.461,
      "lastClose": 0.463,
      "lastHigh": 0.467,
      "lastLow": 0.456,
      "lastChangePercent": -0.86,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 15:34:03，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致",
      "action": "持有、不补；历史3手约138.90元、单边费约3.60%，普通减仓暂停",
      "invalidCondition": "跌破0.456且港股科技继续转弱",
      "predictionScore": 3,
      "predictionLabel": "弱势震荡",
      "expectedDirection": "偏弱",
      "reason": "11月17日跌0.86%，收盘仍低于当日高点。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.469 / 当日低点",
      "resistance": "1.492 / 当日高点",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 1.478,
      "lastClose": 1.488,
      "lastHigh": 1.492,
      "lastLow": 1.469,
      "lastChangePercent": 0.47,
      "lastSource": "11月17日真实收盘；自有代理sina，2026-11-17 15:00:00，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致",
      "action": "持有、不追；历史2手约297.60元、单边费约1.68%，普通减仓暂停",
      "invalidCondition": "跌破1.469且贵金属转弱",
      "predictionScore": 5,
      "predictionLabel": "小幅修复",
      "expectedDirection": "震荡",
      "reason": "11月17日涨0.47%，但未形成足以覆盖费用的新趋势。",
      "riskLevel": "中高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.572 / 当日低点",
      "resistance": "0.584 / 当日高点",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 0.572,
      "lastClose": 0.577,
      "lastHigh": 0.584,
      "lastLow": 0.572,
      "lastChangePercent": 0.17,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 16:11:59，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致",
      "action": "持有、不补；跌破0.572只进入复核，新买0手",
      "invalidCondition": "跌破0.572且军工板块继续转弱",
      "predictionScore": 4,
      "predictionLabel": "低位震荡",
      "expectedDirection": "震荡",
      "reason": "11月17日涨0.17%，仍未收复0.584。",
      "riskLevel": "中高"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.368 / 当日低点",
      "resistance": "1.410 / 当日高点",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 1.383,
      "lastClose": 1.401,
      "lastHigh": 1.41,
      "lastLow": 1.368,
      "lastChangePercent": 0.57,
      "lastSource": "11月17日真实收盘；自有代理sina，2026-11-17 15:00:00，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致",
      "action": "仅作条件化硬退出；历史2手约280.20元、单边费约1.78%、扣费后净溢价示例约8.63%",
      "invalidCondition": "实际仍持有且可靠同日溢价≥8%",
      "predictionScore": 3,
      "predictionLabel": "溢价重新失控",
      "expectedDirection": "高风险",
      "reason": "场内涨0.57%，净值跌3.17%，同日静态溢价约10.60%。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "0.753 / 当日低点",
      "resistance": "0.785 / 当日高点",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 0.77,
      "lastClose": 0.77,
      "lastHigh": 0.785,
      "lastLow": 0.753,
      "lastChangePercent": -1.03,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 15:34:42，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致",
      "action": "持有、不补仓；跌破0.753只进入复核，新买0手",
      "invalidCondition": "跌破0.753且锂资源继续转弱",
      "predictionScore": 3,
      "predictionLabel": "资源仍弱",
      "expectedDirection": "偏弱",
      "reason": "11月17日跌1.03%，盘中低见0.753。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "0.902 / 当日低点",
      "resistance": "0.927 / 当日高点",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 0.912,
      "lastClose": 0.907,
      "lastHigh": 0.927,
      "lastLow": 0.902,
      "lastChangePercent": -1.2,
      "lastSource": "11月17日真实收盘；自有代理sina，2026-11-17 15:35:00，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致",
      "action": "持有、不追；未收复0.927前新买0手",
      "invalidCondition": "跌破0.902且航天链继续转弱",
      "predictionScore": 3,
      "predictionLabel": "冲高回落",
      "expectedDirection": "偏弱",
      "reason": "11月17日跌1.20%，收盘靠近当日低位。",
      "riskLevel": "高"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.085 / 当日低点",
      "resistance": "1.094 / 当日高点",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 1.089,
      "lastClose": 1.093,
      "lastHigh": 1.094,
      "lastLow": 1.085,
      "lastChangePercent": 0.18,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 16:11:53，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致",
      "action": "持有、不加仓；普通碎片单不下",
      "invalidCondition": "跌破1.085且电力板块转弱",
      "predictionScore": 6,
      "predictionLabel": "相对抗跌",
      "expectedDirection": "震荡偏强",
      "reason": "11月17日涨0.18%，收盘接近日高。",
      "riskLevel": "中高"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "8.30 / 股票观察",
      "resistance": "8.54 / 股票观察",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 8.42,
      "lastClose": 8.35,
      "lastHigh": 8.54,
      "lastLow": 8.3,
      "lastChangePercent": -0.95,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 15:34:03，marketStatus=closed；至少两家独立日K与Longbridge收盘报价一致",
      "action": "仅观察，不新增股票买卖指令；用于判断电网设备风险",
      "invalidCondition": "跌破8.30",
      "predictionScore": 3,
      "predictionLabel": "震荡偏弱",
      "expectedDirection": "偏弱",
      "reason": "11月17日跌0.95%，股票仅作基金环境参考。",
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
      "status": "急跌后宽幅震荡，股票不买",
      "reason": "11月17日跌1.04%，日内振幅较大。",
      "buyTrigger": "股票不买；基金端需站稳29.79并通过费用门",
      "avoidReason": "连续下跌后波动仍高，缺少基金端承接证据",
      "risk": "跌破27.76",
      "support": "27.76",
      "resistance": "29.79",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 28,
      "lastClose": 28.43,
      "lastHigh": 29.79,
      "lastLow": 27.76,
      "lastChangePercent": -1.04,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 16:12:01；至少两家独立日K与Longbridge收盘报价一致",
      "invalidCondition": "跌破27.76",
      "predictionScore": 3,
      "predictionLabel": "高波动",
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
      "status": "通信小幅走强，股票不买",
      "reason": "11月17日涨0.68%，收盘接近日高。",
      "buyTrigger": "股票不买；基金端需确认4.43上方承接并通过费用门",
      "avoidReason": "市场广度弱，个股强度尚未扩散",
      "risk": "跌破4.37",
      "support": "4.37",
      "resistance": "4.43",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 4.39,
      "lastClose": 4.42,
      "lastHigh": 4.43,
      "lastLow": 4.37,
      "lastChangePercent": 0.68,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 16:11:35；至少两家独立日K与Longbridge收盘报价一致",
      "invalidCondition": "跌破4.37",
      "predictionScore": 6,
      "predictionLabel": "相对强势",
      "expectedDirection": "震荡偏强",
      "riskLevel": "中高"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "status": "锂股修复，股票不买",
      "reason": "11月17日涨0.92%，但159608仍跌1.03%。",
      "buyTrigger": "股票不买；基金端需站稳34.05并通过费用门",
      "avoidReason": "个股与基金分化，缺少费用后收益证据",
      "risk": "跌破32.96",
      "support": "32.96",
      "resistance": "34.05",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 33.29,
      "lastClose": 33.84,
      "lastHigh": 34.05,
      "lastLow": 32.96,
      "lastChangePercent": 0.92,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 15:34:45；至少两家独立日K与Longbridge收盘报价一致",
      "invalidCondition": "跌破32.96",
      "predictionScore": 5,
      "predictionLabel": "个股修复",
      "expectedDirection": "震荡",
      "riskLevel": "中高"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "status": "半导体强反弹，股票不买",
      "reason": "11月17日涨6.59%，高见115.94；科创50涨0.62%。",
      "buyTrigger": "股票不买；基金端先看相关ETF能否收复自身高点",
      "avoidReason": "4119股下跌，强度尚未广泛扩散",
      "risk": "跌破107.66",
      "support": "107.66",
      "resistance": "115.94",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 108.12,
      "lastClose": 113.45,
      "lastHigh": 115.94,
      "lastLow": 107.66,
      "lastChangePercent": 6.59,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 16:11:52；至少两家独立日K与Longbridge收盘报价一致",
      "invalidCondition": "跌破107.66",
      "predictionScore": 7,
      "predictionLabel": "强反弹",
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
      "status": "白酒横盘，金额过门仍不买",
      "reason": "11月17日收平；18手金额过门但缺资金和收益证据。",
      "buyTrigger": "站稳0.583，且先有成交资金、预期毛收益≥2.85%和扣费后收益证据",
      "avoidReason": "18手约1047.60元、往返最低费约10元；无资金来源和预期毛收益",
      "risk": "跌破0.573",
      "support": "0.573",
      "resistance": "0.583",
      "lastTradeDate": "2026-11-17",
      "lastOpen": 0.582,
      "lastClose": 0.582,
      "lastHigh": 0.583,
      "lastLow": 0.573,
      "lastChangePercent": 0,
      "lastSource": "11月17日真实收盘；自有代理eastmoney，2026-11-17 15:34:15；至少两家独立日K与Longbridge收盘报价一致",
      "invalidCondition": "跌破0.573",
      "predictionScore": 4,
      "predictionLabel": "窄幅震荡",
      "expectedDirection": "震荡",
      "riskLevel": "中高"
    },
    {
      "name": "易方达蓝筹精选混合",
      "code": "005827",
      "symbol": "OF005827",
      "market": "OF",
      "type": "open_fund",
      "sector": "开放式基金",
      "status": "11月17日净值已披露，运行时接口失败",
      "reason": "11月17日净值1.3638、日跌0.42%；只作dated NAV。",
      "buyTrigger": "不买；开放式基金无盘中K线，且缺少资金与收益证据",
      "avoidReason": "运行时基金接口HTTP 501，不能伪装实时",
      "risk": "净值披露滞后或接口失败",
      "support": "按净值披露",
      "resistance": "不设盘中价",
      "lastTradeDate": "2026-11-17",
      "lastOpen": null,
      "lastClose": 1.3638,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": -0.42,
      "lastSource": "东方财富基金11月17日公开净值；运行时基金接口HTTP 501，mode=failed",
      "invalidCondition": "运行时真实基金接口接通并通过校验",
      "predictionScore": 3,
      "predictionLabel": "净值续跌、接口失败",
      "expectedDirection": "震荡偏弱",
      "riskLevel": "中高"
    }
  ],
  "newsItems": [
    {
      "title": "A股冲高回落，超4100股下跌",
      "source": "每日经济新闻 / 多源行情核验",
      "publishTime": "2026-11-17 15:07:00+08:00",
      "summary": "已确认事实：上证-0.50%、深成指-0.49%、创业板-1.20%、科创50+0.62%；1326股上涨、4119股下跌。基于事实的判断：广度仍弱，11月18日不做低位摊薄。",
      "relatedStocks": [
        "159740",
        "512710",
        "159608",
        "159241",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / A股收盘",
      "relation": "market",
      "url": "https://finance.sina.com.cn/jjxw/2026-11-17/doc-iniyznqc1810161.shtml"
    },
    {
      "title": "半导体逆势反弹，中芯国际涨6.59%",
      "source": "自有代理 / Longbridge / 新华财经",
      "publishTime": "2026-11-17 16:15:00+08:00",
      "summary": "已确认事实：688981收113.45元、涨6.59%，科创50涨0.62%；半导体、光刻机早盘活跃。基于事实的判断：强度集中但没有扩散到多数基金持仓，股票不买、科技基金不追。",
      "relatedStocks": [
        "688981",
        "159740",
        "512710"
      ],
      "sector": "过去24小时 / 半导体机会与风险",
      "relation": "market",
      "url": "https://www.cnfin.com/yw-lb/detail/20261117/4496546_1.html"
    },
    {
      "title": "161226同日静态溢价约10.60%，重回硬风险线",
      "source": "东方财富基金 / 自有代理 / 国投瑞银基金",
      "publishTime": "2026-11-17 20:42:00+08:00",
      "summary": "已确认事实：11月17日场内收1.401、净值1.2667，同日静态溢价约10.60%；历史2手成交额约280.20元、单边最低费约5元。基于事实的判断：若实际仍持有且开盘后同日溢价仍≥8%，按硬风险例外一次退出；否则0手。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "过去24小时 / 持仓重大风险 / 白银LOF",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10"
    },
    {
      "title": "美股科技继续下挫，纳指跌2.5%",
      "source": "AP",
      "publishTime": "2026-11-16 16:17:00-05:00",
      "summary": "已确认事实：11月16日S&P 500跌1.9%、纳指跌2.5%、道指跌1.4%；科技股继续承压。基于事实的判断：海外科技风险仍高，A股半导体单日反弹不宜追价。",
      "relatedStocks": [
        "159740",
        "512710",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / 海外收盘",
      "relation": "market",
      "url": "https://apnews.com/article/wall-street-stocks-dow-nasdaq-2e6a9c41b6336e9240c1b01585d20cd4"
    },
    {
      "title": "10月生产偏强，内需与投资仍有压力",
      "source": "国家统计局 / 中国政府网",
      "publishTime": "2026-11-17 08:22:00+08:00",
      "summary": "已确认事实：10月规上工业增加值同比增长4.8%，1—10月社零增长1.0%、固定资产投资下降8.1%；官方同时提示供强需弱仍较突出。基于事实的判断：宏观结构分化，不能直接替代基金买入触发。",
      "relatedStocks": [
        "562350",
        "512710",
        "159241"
      ],
      "sector": "过去24小时 / 官方宏观 / 全市场",
      "relation": "market",
      "url": "https://www.ln.gov.cn/web/ywdt/rdgz/2026111708223233808/index.shtml"
    },
    {
      "title": "13个场内标的11月17日真实收盘全部对账",
      "source": "自有代理 / 新浪 / 腾讯 / 东方财富 / Longbridge",
      "publishTime": "2026-11-17 20:42:00+08:00",
      "summary": "已确认事实：13/13均为11月17日非零OHLC，自有代理收盘数据与至少两家独立日K及Longbridge报价一致。基于事实的判断：11月18日开盘前只显示最近真实收盘，不标成实时行情。",
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
      "publishTime": "2026-11-17 20:42:00+08:00",
      "summary": "已确认事实：11月17日净值1.3638、日跌0.42%；运行时基金接口HTTP 501。基于事实的判断：只保留dated NAV，不提供盘中K线。",
      "relatedStocks": [
        "005827"
      ],
      "sector": "过去24小时 / 持仓 / 开放式基金 / 接口失败",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10"
    },
    {
      "title": "APEC深圳会议进入关键日程",
      "source": "新华社 / 中央网信办",
      "publishTime": "2026-11-17 14:16:00+08:00",
      "summary": "已确认事实：APEC工商领导人峰会于11月17—18日举行，领导人非正式会议将于11月18—19日举行。基于事实的判断：开放、数字经济与绿色合作是事件观察线，不直接生成基金买单。",
      "relatedStocks": [
        "600050",
        "562350",
        "159241"
      ],
      "sector": "过去24小时 / 政策日程 / 观察池",
      "relation": "market",
      "url": "https://www.cac.gov.cn/2026-11/13/c_1796325469766056.htm"
    }
  ],
  "reasoning": [
    {
      "title": "161226溢价是唯一可量化硬风险",
      "basis": "11月17日场内收1.401、净值1.2667，同日静态溢价约10.60%。",
      "inference": "超过8%硬风险线；历史2手单边费约1.78%，但扣费后净溢价示例仍约8.63%。",
      "conclusion": "实际持仓和开盘后同日溢价双确认时，一次退出全部实际可卖份额。",
      "invalidCondition": "无持仓、同日溢价<8%或真实数据失败。"
    },
    {
      "title": "科创反弹与市场广度分离",
      "basis": "科创50涨0.62%、688981涨6.59%，但创业板跌1.20%、4119股下跌。",
      "inference": "半导体强度集中，未形成全市场修复。",
      "conclusion": "股票不买，科技基金不追。",
      "invalidCondition": "基金自身收复高点且费用、资金、收益证据齐备。"
    },
    {
      "title": "普通碎片单仍不经济",
      "basis": "159740历史3手约138.90元，164701历史2手约297.60元。",
      "inference": "最低佣金侵蚀显著高于普通费用门。",
      "conclusion": "触价只复核。",
      "invalidCondition": "出现明确硬风险。"
    },
    {
      "title": "账户证据仍是执行前置条件",
      "basis": "券商持仓与当日订单接口再次返回OAuth 403308。",
      "inference": "无法确认历史份额，也无法确认卖出回款。",
      "conclusion": "除条件化161226风险退出外，其余买卖0手。",
      "invalidCondition": "用户在券商端完成核对。"
    }
  ],
  "invalidConditions": [
    "券商确认161226无实际持仓：历史2手示例立即失效，卖0手。",
    "161226开盘后可靠同日溢价低于8%：不得使用硬风险退出例外。",
    "159740/164701普通订单仍<1000元或单边费率>0.5%：只复核。",
    "任何买入缺少已成交资金、实际费率、可核验毛收益或扣费后≥1%收益空间：保持0手。",
    "网页出现0价、时间戳过期、来源失败或mode=failed：取消基于网页价格的执行。"
  ],
  "cancelPlan": [
    "周三先查券商最新持仓与挂单；不存在的历史份额不得生成订单。",
    "161226只用可靠同日IOPV/净值重算溢价；低于8%时不使用硬退出例外。",
    "开盘瞬时跳价不直接成交，先确认真实价格、时间戳与流动性。",
    "卖出未真实成交前不写入买入资金；成交后也先留现金。",
    "自有代理失败时不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "盘前只用最近真实收盘",
      "basis": "13个场内标的均为11月17日非零OHLC，多源一致。",
      "inference": "11月18日开盘前不存在当日盘中价格。",
      "conclusion": "页面标明11月17日真实收盘。",
      "invalidCondition": "11月18日09:30后取得通过校验的真实盘中报价。"
    },
    {
      "title": "LOF溢价必须同日比较",
      "basis": "11月17日场内收1.401、净值1.2667。",
      "inference": "同日静态溢价约10.60%，超过8%硬线。",
      "conclusion": "只在实际持仓存在且开盘后同日溢价仍达线时执行。",
      "invalidCondition": "无持仓、同日溢价回落或数据失败。"
    },
    {
      "title": "硬退出与普通费用门分开",
      "basis": "历史2手成交额约280.20元、单边费率约1.78%。",
      "inference": "普通调仓不经济，但溢价失控属于费用不阻止的硬风险。",
      "conclusion": "满足条件时一次合并退出，不拆单。",
      "invalidCondition": "溢价低于8%。"
    },
    {
      "title": "资金来源必须已成交",
      "basis": "账户订单接口未授权，无法证明有卖出回款。",
      "inference": "计划卖出不是资金。",
      "conclusion": "新增买入0手。",
      "invalidCondition": "券商端确认成交和可用资金。"
    },
    {
      "title": "宏观与价格信号分开",
      "basis": "10月工业增长4.8%，但1—10月社零增长1.0%、固定投资下降8.1%。",
      "inference": "供给偏强、需求与投资偏弱的结构分化不等于具体基金买点。",
      "conclusion": "等待价格与费用后收益证据。",
      "invalidCondition": "持仓板块趋势和执行条件同步改善。"
    }
  ],
  "nextWatch": [
    "11月18日09:20：核对161226实际持仓、可卖份额、挂单和券商实际费率。",
    "09:25：确认自有代理marketStatus与时间戳；未开盘数据只显示11月17日收盘。",
    "09:30后：只用可靠同日IOPV/净值重算161226溢价；≥8%且实际持有时一次退出，其他情况0手。",
    "10:00前：观察159740的0.456、159608的0.753、159241的0.902能否守住；跌破只复核。",
    "全天：观察688981强势能否扩散到基金端；股票仍不买，基金不追。",
    "全天：运行时接口失败时只显示失败态，不绘制假线或假K线。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "27.76",
      "resistance": "29.79"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.37",
      "resistance": "4.43"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "32.96",
      "resistance": "34.05"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "107.66",
      "resistance": "115.94"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.573",
      "resistance": "0.583"
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
      "name": "本次运行：13个场内标的11月17日真实收盘",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ161226",
      "note": "2026-11-17 20:42：13/13为非零11月17日收盘OHLC；自有代理与至少两家独立日K、Longbridge报价一致。"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10",
      "note": "11月17日单位净值1.2667、日跌3.17%；相对同日场内收盘1.401的静态溢价约10.60%。"
    },
    {
      "name": "国投瑞银：161226溢价风险提示",
      "url": "https://static.cninfo.com.cn/finalpage/2026-11-06/1225659583.PDF",
      "note": "基金管理人提示二级市场价格溢价风险；本页仍要求同日数据和实际持仓双重确认。"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10",
      "note": "11月17日单位净值1.3638、日跌0.42%；仅作dated NAV。"
    },
    {
      "name": "运行时基金接口HTTP 501失败态",
      "url": "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827",
      "note": "SZ161226与OF005827运行时基金接口均返回ok:false/mode:failed；开放式基金不提供盘中K线。"
    },
    {
      "name": "11月17日A股收盘与市场广度",
      "url": "https://finance.sina.com.cn/jjxw/2026-11-17/doc-iniyznqc1810161.shtml",
      "note": "上证-0.50%、深成指-0.49%、创业板-1.20%；1326股上涨、4119股下跌。"
    },
    {
      "name": "国家统计局：10月国民经济运行",
      "url": "https://www.ln.gov.cn/web/ywdt/rdgz/2026111708223233808/index.shtml",
      "note": "10月规上工业增加值同比增长4.8%；1—10月社零增长1.0%、固定资产投资下降8.1%。"
    },
    {
      "name": "AP：11月16日美股收盘",
      "url": "https://apnews.com/article/wall-street-stocks-dow-nasdaq-2e6a9c41b6336e9240c1b01585d20cd4",
      "note": "S&P 500跌1.9%、纳指跌2.5%、道指跌1.4%，科技股继续承压。"
    },
    {
      "name": "新华社：APEC深圳会议日程",
      "url": "https://www.cac.gov.cn/2026-11/13/c_1796325469766056.htm",
      "note": "工商领导人峰会11月17—18日举行，领导人非正式会议11月18—19日举行。"
    }
  ]
};
