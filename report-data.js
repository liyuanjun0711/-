window.MARKET_BRIEFING_DATA = {
  "date": "2026-09-21",
  "portfolioVersion": "portfolio-2026-09-21-premarket-fee-aware-v1",
  "time": "2026-09-19 16:10北京时点核验：13个场内持仓/观察标的均取得9月18日真实收盘；自有代理报价与独立日K最后一根的日期、开高低收逐只一致。161226与005827已取得9月18日公开净值；自有运行时基金接口仍返回501。周末无A股交易，不把9月18日收盘写成实时行情。用户最新成交和持仓仍无法核验，9月21日开盘前必须先对账。",
  "lastUpdated": "2026-09-19 16:10 北京时间（场内为9月18日收盘；基金净值为9月18日披露）",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "logicUpdatedAt": "2026-09-19（行情与费用闸门同步更新；券商实际费率仍待确认）",
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
        "referencePrice": 0.545,
        "hardRiskExit": false
      },
      {
        "code": "164701",
        "label": "旧2手减仓复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.689,
        "hardRiskExit": false
      },
      {
        "code": "161226",
        "label": "旧2手减仓复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.925,
        "hardRiskExit": false
      },
      {
        "code": "161725",
        "label": "19手最低经济金额买入复核",
        "side": "buy",
        "lots": 19,
        "referencePrice": 0.529,
        "hardRiskExit": false
      }
    ]
  },
  "oneLine": "结论：9月21日先核对真实持仓和成交，不买、不做1—3手碎片减仓。9月18日A/H成长反弹，但海外利率与油价压力仍高；161226同日静态溢价约5.98%，低于8%硬风控线。普通破位只进入风险复核；旧3手159740、2手164701、2手161226按保守佣金估算均未通过费用闸门。任何卖出资金先留现金。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "周一不买：先对账，旧碎片单全部暂停",
      "conclusion": "网页仍无法确认9月9日以后是否发生真实成交。9月18日13个场内标的收盘已交叉核对，但这只是周五收盘基线，不是周末或周一实时行情。",
      "action": "9:25先查券商成交、可卖份额和可用现金；未完成对账前买0手、卖0手。旧1—3手计划只保留为费用复核，不直接下单。",
      "trigger": "对账后仍接近满仓：继续不买。没有硬性退出且单笔不足1000元或单边费用超过0.5%：继续持有/观察，不下碎片单。",
      "reason": "成交状态和真实费用先于价格触发；避免重复卖出和最低佣金侵蚀。仅供个人复盘参考。"
    },
    {
      "type": "费用闸门",
      "title": "三个旧减仓方案都不具备普通交易经济性",
      "conclusion": "按9月18日收盘与每笔最低5元估算：159740卖3手成交额163.50元、单边费率约3.06%；164701卖2手337.80元、约1.48%；161226卖2手385.00元、约1.30%。",
      "action": "三笔普通价格减仓均不下单。只有基本面失效、161226溢价失控或明确硬风控，才按风险退出例外处理，并将同一标的剩余可卖份额合并成一笔。",
      "trigger": "普通破位仅进入风险复核；硬风险出现时，手续费不阻止必要退出。未出现硬风险：不卖碎片单。",
      "reason": "三笔单边费用均超过成交额0.5%，且成交额远低于1000元。费率为保守示例，待券商实际费率确认。仅供个人复盘参考。"
    },
    {
      "type": "持仓走势",
      "title": "A/H成长反弹，强项只持有不追",
      "conclusion": "9月18日159740涨2.06%，512710涨1.11%，159241涨1.05%，159608涨1.19%；恒生科技涨2.20%，创业板涨2.25%，科创50涨2.89%。",
      "action": "上述基金维持持有；周一不新增。跌破各自9月18日低点并持续30分钟时只做风险复核，不自动卖1—3手。",
      "trigger": "未跌破周五低点：持有。高开突破周五高点：仍不追。若真实持仓已变化，以券商对账后的标的清单为准。",
      "reason": "单日反弹改善短线预期，但海外加息与高收益率并未消失，且账户缺少已确认的新增资金来源。仅供个人复盘参考。"
    },
    {
      "type": "贵金属与LOF",
      "title": "黄金白银走强；161226溢价降至约5.98%",
      "conclusion": "164701涨1.75%收1.689；161226涨2.67%收1.925，9月18日净值1.8164、涨2.73%，同日静态溢价约5.98%，低于8%硬风控线。",
      "action": "两只均持有、不补仓。164701跌破1.669、161226跌破1.894时先复核风险；161226只有同日溢价重新高于8%或基本面失效才进入硬退出。",
      "trigger": "161226同日溢价不高于8%且价格守住1.894：不卖。降到3%以内并站稳1.929：取消溢价警报。",
      "reason": "贵金属方向与LOF二级市场溢价必须分开判断；跨日价格和净值不能混算。仅供个人复盘参考。"
    },
    {
      "type": "观察池不买",
      "title": "161725即使凑到1000元也缺少可核验收益空间",
      "conclusion": "161725收0.529；19手约1005.10元，往返最低佣金约10元、占成交额约0.995%，费用闸门要求预期毛收益至少约2.985%，且扣费后预期收益率不少于1%。当前没有可核验的收益空间和卖出资金来源。",
      "action": "161725买0手；005827不新增定投；股票观察池全部不买。即使周一站上压力位，也只记录，不下单。",
      "trigger": "未来必须同时有：基金卖出资金真实到账、基金自身完成两次确认、预期毛收益有证据且通过费用闸门。任一缺失都不买。",
      "reason": "最低经济金额只是第一道门槛，不等于具备净收益空间。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 9:25核对券商成交记录、最新持仓、可卖份额和可用现金；未对账前买0手、卖0手。",
    "2. 9:30核对网页是否出现9月21日真实时间戳；若仍是9月18日、0价或失败态，只把网页当静态基线。",
    "3. 周一不买：161725、005827和股票观察池全部0手；没有真实卖出资金，不做切换。",
    "4. 159740/164701/161226跌破周五低点只进入风险复核；旧3手/2手/2手普通减仓均被费用闸门否决。",
    "5. 512710、159608、159241、562350跌破各自周五低点并持续30分钟时，同样先评估风险必要性与合并后金额，不拆小单。",
    "6. 只有基本面失效、161226同日溢价>8%或明确硬风控时，按剩余真实可卖份额一次退出；手续费不阻止必要风控。",
    "7. 所有卖出资金先留现金。任何订单都以券商App真实价格、实际费率和可卖数量为准，不自动下单。"
  ],
  "tradePlan": [
    {
      "title": "A/H成长同步反弹，但只构成持有确认",
      "basis": "9月18日创业板+2.25%、科创50+2.89%、恒生科技+2.20%；159740、512710、159241、159608均上涨。",
      "inference": "风险偏好短线修复，但一天反弹不足以证明趋势反转。",
      "conclusion": "持有强项，不追高，不把周五涨幅外推为周一必涨。",
      "invalidCondition": "周一低开并持续跌破周五低点，且对应指数同步转弱。"
    },
    {
      "title": "海外紧缩仍是全市场第一风险",
      "basis": "AP称美债10年期收益率升至约5%，美联储本周加息；日本央行将政策利率升至1.25%。",
      "inference": "全球无风险利率上升会压缩高估值资产估值，也可能放大周一高开后的回吐。",
      "conclusion": "周一不追科技、港股或贵金属，先看真实开盘承接。",
      "invalidCondition": "美债收益率与油价持续回落，全球风险资产同步上行。"
    },
    {
      "title": "贵金属上涨不等于LOF溢价可忽略",
      "basis": "路透称9月18日现货黄金涨1.2%、白银涨2.3%；161226净值涨2.73%，场内涨2.67%，同日溢价约5.98%。",
      "inference": "基础资产上涨与二级市场溢价变化可能方向不同。",
      "conclusion": "161226继续按同日净值重算；不跨日、不用5.98%冒充周一实时溢价。",
      "invalidCondition": "同日溢价重新高于8%或基本面明确失效。"
    },
    {
      "title": "费用闸门否决普通碎片减仓",
      "basis": "旧3手159740、2手164701、2手161226成交额分别约163.50元、337.80元、385.00元，最低5元佣金对应单边费率约3.06%、1.48%、1.30%。",
      "inference": "普通调仓的摩擦成本远高于0.5%上限，重复拆单会多次支付最低佣金。",
      "conclusion": "价格破位只进入风险复核；非硬风险不下这些碎片单。",
      "invalidCondition": "实际券商费率显著更低且合并订单达到经济金额，或风险升级为硬退出。"
    },
    {
      "title": "失败态继续与静态净值分离",
      "basis": "自有/api/fund对005827和161226仍返回HTTP 501，但东方财富已披露9月18日静态净值。",
      "inference": "已披露净值可以作为日期明确的事实，不能伪装成盘中行情或K线。",
      "conclusion": "开放式基金继续显示接口失败，不画盘中K线，不基于旧净值下单。",
      "invalidCondition": "自有代理返回带真实日期的有效净值数据。"
    }
  ],
  "noTradeList": [
    "不把9月18日收盘快照写成周末或9月21日实时行情；盘中必须等待自有代理或券商App的新时间戳。",
    "不在未核对真实成交与持仓前重复执行9月9日旧计划。",
    "不机械执行1—3手小额卖单；普通破位只进入风险复核，先过费用闸门。",
    "不把161226约5.98%的9月18日静态溢价写成周一实时溢价；周一必须用同日价格与净值重算。",
    "不追A/H科技和贵金属的周五反弹；股票只作板块温度计，任何卖出资金先留现金。",
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
      "support": "0.536 / 0.530",
      "resistance": "0.546 / 0.552",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 0.537,
      "lastClose": 0.545,
      "lastHigh": 0.546,
      "lastLow": 0.536,
      "lastChangePercent": 2.06,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "action": "持有、不加仓；低于0.536运行30分钟进入风险复核；旧3手约163.50元、单边费约3.06%，普通减仓不下单",
      "invalidCondition": "站稳0.546且恒生科技延续修复",
      "predictionScore": 6,
      "predictionLabel": "反弹收近高位",
      "expectedDirection": "震荡偏强",
      "reason": "9月18日涨2.06%、收0.545，接近日高0.546；恒生科技同步涨2.20%。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.669 / 1.660",
      "resistance": "1.690 / 1.700",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 1.676,
      "lastClose": 1.689,
      "lastHigh": 1.69,
      "lastLow": 1.669,
      "lastChangePercent": 1.75,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "action": "持有、不补仓；低于1.669运行30分钟进入风险复核；旧2手约337.80元、单边费约1.48%，普通减仓不下单",
      "invalidCondition": "站稳1.690且国际金价保持强势",
      "predictionScore": 7,
      "predictionLabel": "收在日高附近",
      "expectedDirection": "震荡偏强",
      "reason": "9月18日涨1.75%、收1.689，接近日高1.690；现货黄金当日上涨。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.631 / 0.625",
      "resistance": "0.640 / 0.645",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 0.631,
      "lastClose": 0.637,
      "lastHigh": 0.64,
      "lastLow": 0.631,
      "lastChangePercent": 1.11,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "action": "持有、不追涨；低于0.631运行30分钟只做风险复核；不足1000元不卖碎片单",
      "invalidCondition": "跌破0.625或军工板块相对强度消失",
      "predictionScore": 6,
      "predictionLabel": "反弹但未收日高",
      "expectedDirection": "震荡偏强",
      "reason": "9月18日涨1.11%、收0.637，低于日高0.640，修复有效但不够强。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.894 / 1.875",
      "resistance": "1.929 / 1.950",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 1.919,
      "lastClose": 1.925,
      "lastHigh": 1.929,
      "lastLow": 1.894,
      "lastChangePercent": 2.67,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "action": "持有、不补仓；同日溢价>8%或基本面失效时按硬退出复核；旧2手约385.00元、单边费约1.30%，普通价格减仓不下单",
      "invalidCondition": "同日溢价降到3%以内且场内站稳1.929",
      "predictionScore": 6,
      "predictionLabel": "随净值上涨，溢价回落",
      "expectedDirection": "高波动震荡",
      "reason": "9月18日收1.925、涨2.67%；净值1.8164、涨2.73%，同日静态溢价约5.98%。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "1.005 / 0.995",
      "resistance": "1.018 / 1.025",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 1.015,
      "lastClose": 1.017,
      "lastHigh": 1.018,
      "lastLow": 1.005,
      "lastChangePercent": 1.19,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "action": "持有、不加仓；低于1.005运行30分钟只做风险复核；不足1000元不卖碎片单",
      "invalidCondition": "跌破0.995且稀有金属板块同步转弱",
      "predictionScore": 6,
      "predictionLabel": "反弹收近高位",
      "expectedDirection": "震荡偏强",
      "reason": "9月18日涨1.19%、收1.017，接近日高1.018，但锂矿观察标的仅微涨。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "1.047 / 1.040",
      "resistance": "1.060 / 1.070",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 1.047,
      "lastClose": 1.055,
      "lastHigh": 1.06,
      "lastLow": 1.047,
      "lastChangePercent": 1.05,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "action": "持有、不加仓；低于1.047运行30分钟只做风险复核；不足1000元不卖碎片单",
      "invalidCondition": "跌破1.040且航空航天板块同步转弱",
      "predictionScore": 6,
      "predictionLabel": "温和反弹",
      "expectedDirection": "震荡偏强",
      "reason": "9月18日涨1.05%、收1.055，较日高1.060仍有回落。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.087 / 1.080",
      "resistance": "1.100 / 1.108",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 1.093,
      "lastClose": 1.095,
      "lastHigh": 1.1,
      "lastLow": 1.087,
      "lastChangePercent": 0.46,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "action": "持有、不加仓；低于1.087运行30分钟只做风险复核；不足1000元不卖碎片单",
      "invalidCondition": "跌破1.080且电力板块相对转弱",
      "predictionScore": 5,
      "predictionLabel": "区间内小幅修复",
      "expectedDirection": "震荡",
      "reason": "9月18日涨0.46%、收1.095，位于1.087-1.100区间中上部。",
      "riskLevel": "中"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "9.04 / 9.00",
      "resistance": "9.41 / 9.50",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 9.06,
      "lastClose": 9.17,
      "lastHigh": 9.41,
      "lastLow": 9.04,
      "lastChangePercent": 1.21,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "action": "仅观察9.04/9.41，不新增股票买卖指令，不补仓",
      "invalidCondition": "跌破9.04或电网设备板块相对转弱",
      "predictionScore": 5,
      "predictionLabel": "冲高回落后收红",
      "expectedDirection": "震荡",
      "reason": "9月18日涨1.21%、收9.17，但较日高9.41明显回落。",
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
      "reason": "9月18日高开53.40、最高53.48，收51.30、跌1.91%，未保留早盘强度。",
      "buyTrigger": "本账户不买股票；站稳53.48并有公司订单/业绩事实，只作新材料基金确认，不下单。",
      "avoidReason": "高开回落且账户不买股票；9月21日明确不买。",
      "risk": "跌破50.50可能继续扩大回撤。",
      "support": "50.50 / 50.00",
      "resistance": "53.40 / 53.48",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 53.4,
      "lastClose": 51.3,
      "lastHigh": 53.48,
      "lastLow": 50.5,
      "lastChangePercent": -1.91,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "invalidCondition": "跌破50.50或连续两日站不回53.40",
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
      "status": "冲高回落，股票不买",
      "reason": "9月18日涨0.48%、收4.22，盘中最高4.29未站稳。",
      "buyTrigger": "本账户不买股票；放量站稳4.29并回踩4.22不破，只作通信基金确认，不下单。",
      "avoidReason": "未有效突破且账户不买股票；9月21日明确不买。",
      "risk": "跌破4.19后可能继续走弱。",
      "support": "4.19 / 4.15",
      "resistance": "4.29 / 4.32",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 4.2,
      "lastClose": 4.22,
      "lastHigh": 4.29,
      "lastLow": 4.19,
      "lastChangePercent": 0.48,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "invalidCondition": "跌破4.19或继续弱于沪指",
      "predictionScore": 5,
      "predictionLabel": "冲高回落",
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
      "status": "窄幅震荡，与159608重叠",
      "reason": "9月18日仅涨0.05%、收42.76，组合已有159608资源暴露。",
      "buyTrigger": "本账户不买股票；站稳43.19并回踩42.76不破，只作稀有金属基金确认，不下单。",
      "avoidReason": "已有同类基金敞口且账户不买股票；9月21日明确不买。",
      "risk": "跌破42.37可能继续走弱。",
      "support": "42.37 / 42.00",
      "resistance": "43.19 / 43.50",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 43.08,
      "lastClose": 42.76,
      "lastHigh": 43.19,
      "lastLow": 42.37,
      "lastChangePercent": 0.05,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "invalidCondition": "跌破42.37或锂矿板块转弱",
      "predictionScore": 4,
      "predictionLabel": "窄幅震荡",
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
      "status": "科技反弹，股票不买",
      "reason": "9月18日涨2.85%、收122.00，科创50同步涨2.89%，但收盘低于日高123.43。",
      "buyTrigger": "本账户不买股票；站稳123.43并回踩122.00不破，只作半导体基金确认，不下单。",
      "avoidReason": "账户不买股票，且海外利率上升压制高估值；9月21日明确不买。",
      "risk": "跌破119.93可能回吐周五反弹。",
      "support": "119.93 / 118.62",
      "resistance": "123.43 / 125.00",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 120.78,
      "lastClose": 122,
      "lastHigh": 123.43,
      "lastLow": 119.93,
      "lastChangePercent": 2.85,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "invalidCondition": "跌破119.93或半导体板块同步转弱",
      "predictionScore": 7,
      "predictionLabel": "科技反弹",
      "expectedDirection": "震荡偏强",
      "riskLevel": "高"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "status": "小幅反弹，费用与收益空间不通过",
      "reason": "9月18日涨0.38%、收0.529；19手约1005.10元，往返最低佣金约10元，但缺少可核验预期毛收益和卖出资金来源。",
      "buyTrigger": "未来先有基金真实卖出资金，再站稳0.531并回踩0.529不破；还须证明预期毛收益率至少约2.985%。当前买0手。",
      "avoidReason": "没有真实卖出资金、收益空间证据或板块二次确认时都不买。",
      "risk": "跌破0.525后可能继续测试更低平台。",
      "support": "0.525 / 0.520",
      "resistance": "0.531 / 0.535",
      "lastTradeDate": "2026-09-18",
      "lastOpen": 0.525,
      "lastClose": 0.529,
      "lastHigh": 0.531,
      "lastLow": 0.525,
      "lastChangePercent": 0.38,
      "lastSource": "自有代理真实收盘与独立日K交叉核对，2026-09-18 15:00后",
      "invalidCondition": "跌破0.525或继续弱于沪指",
      "predictionScore": 5,
      "predictionLabel": "小幅反弹",
      "expectedDirection": "震荡",
      "riskLevel": "中"
    },
    {
      "name": "易方达蓝筹精选混合",
      "code": "005827",
      "symbol": "OF005827",
      "market": "OF",
      "type": "open_fund",
      "sector": "开放式基金",
      "status": "9月18日净值已披露，运行时接口失败",
      "reason": "9月18日单位净值1.4865、单日涨0.48%；开放式基金不提供盘中K线，自有代理仍返回501失败态。",
      "buyTrigger": "运行时真实净值接口恢复，连续两个披露日跑赢沪深300和恒生科技，并先有基金真实卖出资金后再评估定投。",
      "avoidReason": "接口未恢复、相对收益未确认或没有真实卖出资金时不买。",
      "risk": "净值披露有时滞，周一盘中无法据此判断实时方向。",
      "support": "按净值披露，不设盘中支撑",
      "resistance": "按净值披露，不设盘中压力",
      "lastTradeDate": "2026-09-18",
      "lastOpen": null,
      "lastClose": 1.4865,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": 0.48,
      "lastSource": "东方财富基金历史净值，2026-09-18；运行时/api/fund为失败态",
      "invalidCondition": "连续两个披露日跑输基准或真实净值接口继续失败",
      "predictionScore": 5,
      "predictionLabel": "净值反弹，接口未恢复",
      "expectedDirection": "暂无盘中判断",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "A股放量普涨，成长风格领涨",
      "source": "证券时报 / 同花顺收盘数据",
      "publishTime": "2026-09-18 21:22:00+08:00",
      "summary": "已确认事实：上证+0.94%、深成指+1.72%、创业板+2.25%、科创50+2.89%，全市场成交约2.09万亿元。基于事实的判断：成长风险偏好短线修复，但周一仍需真实承接确认。",
      "relatedStocks": [
        "159740",
        "512710",
        "159241",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大利好 / A股收盘 / 成长反弹",
      "relation": "market",
      "url": "https://www.stcn.com/article/detail/4191119.html"
    },
    {
      "title": "恒生科技涨2.20%，强于恒指",
      "source": "新华社",
      "publishTime": "2026-09-18 17:16:49+08:00",
      "summary": "已确认事实：恒指涨0.60%，恒生科技涨2.20%至4405.5点。基于事实的判断：159740的周五反弹有指数共振，但一天反弹不足以转为追涨。",
      "relatedStocks": [
        "159740",
        "005827"
      ],
      "sector": "过去24小时 / 全市场重大利好 / 港股科技",
      "relation": "market",
      "url": "https://www1.xinhuanet.com/20260918/9bc6c493885345239a8bc5910fa7de1a/c.html"
    },
    {
      "title": "美债10年期收益率约5%，美股收盘分化",
      "source": "AP",
      "publishTime": "2026-09-19 04:20:00+08:00",
      "summary": "已确认事实：标普500涨0.2%、道指跌0.2%、纳指涨0.4%；美债10年期收益率升至约5%，布伦特结算103.87美元。基于事实的判断：高利率与高油价仍是周一高估值资产的外部压制。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981",
        "164701",
        "161226"
      ],
      "sector": "过去24小时 / 全市场重大风险 / 美债 / 油价 / 美股",
      "relation": "risk",
      "url": "https://apnews.com/article/stock-markets-oil-war-inflation-rates-1ff3311788bcc4555d00e283a57289fe"
    },
    {
      "title": "日本央行加息至1.25%，为31年高位",
      "source": "AP",
      "publishTime": "2026-09-18 18:20:00+08:00",
      "summary": "已确认事实：日本央行将政策利率由1.0%上调至1.25%；美联储本周也已加息。基于事实的判断：全球流动性边际收紧，不支持周一追高。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / 全球利率",
      "relation": "risk",
      "url": "https://apnews.com/article/japan-economy-interest-rates-inflation-67e71246d3af41bcfc61aa788f9959c7"
    },
    {
      "title": "黄金与白银上涨，但高利率仍构成约束",
      "source": "Reuters / MarketScreener转载",
      "publishTime": "2026-09-19 02:29:00+08:00",
      "summary": "已确认事实：现货黄金涨1.2%、白银涨2.3%；美联储本周加息25个基点。基于事实的判断：贵金属短线受益于油价回落与空头回补，但高利率限制单边追涨。",
      "relatedStocks": [
        "164701",
        "161226"
      ],
      "sector": "过去24小时 / 贵金属 / 持仓",
      "relation": "holding",
      "url": "https://www.marketscreener.com/news/gold-climbs-to-one-week-high-heads-for-weekly-gain-on-easing-oil-prices-ce785adadd88ff2d"
    },
    {
      "title": "上交所提示高波动与异常交易风险",
      "source": "上海证券交易所",
      "publishTime": "2026-09-18 19:15:00+08:00",
      "summary": "已确认事实：上交所本周对50起异常交易采取自律监管措施，对波动较大股票重点监控，并提示投资者审慎参与。基于事实的判断：题材高波动不是小本金账户新增风险的理由。",
      "relatedStocks": [],
      "sector": "过去24小时 / 全市场重大风险 / 交易监管",
      "relation": "risk",
      "url": "https://www.sse.com.cn/aboutus/mediacenter/conference/c/10832738/files/b033024c8e474debadbba67eda58b78d.pdf"
    },
    {
      "title": "持仓基金多数反弹，碎片减仓仍不经济",
      "source": "自有代理真实收盘",
      "publishTime": "2026-09-18 16:12:00+08:00",
      "summary": "已确认事实：159740、164701、512710、159608、159241、562350均上涨；旧3手/2手/2手减仓的单边费率仍分别约3.06%、1.48%、1.30%。基于事实的判断：周一只做风险复核，不下普通碎片单。",
      "relatedStocks": [
        "159740",
        "164701",
        "512710",
        "159608",
        "159241",
        "562350"
      ],
      "sector": "过去24小时 / 持仓 / 费用闸门",
      "relation": "holding",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SZ159740,SZ164701,SH512710,SZ159608,SZ159241,SH562350"
    },
    {
      "title": "161226同日静态溢价约5.98%",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-09-19 08:10:00+08:00",
      "summary": "已确认事实：9月18日单位净值1.8164、日涨2.73%，同日场内收1.925，对应静态溢价约5.98%；基金仍暂停申购。基于事实的判断：低于8%硬风控线，但周一仍需同日重算。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "过去24小时 / 持仓 / 白银LOF / 溢价",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10"
    },
    {
      "title": "005827净值反弹，运行时基金接口仍失败",
      "source": "东方财富基金 / 自有代理失败态",
      "publishTime": "2026-09-19 08:10:00+08:00",
      "summary": "已确认事实：9月18日单位净值1.4865、单日涨0.48%，限制大额申购；运行时/api/fund仍返回501。基于事实的判断：只保留日期明确的净值，不画盘中K线，不新增定投。",
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
      "title": "先对账，再谈交易",
      "basis": "网页不能读取9月9日以后的券商成交和最新持仓。",
      "inference": "延续旧计划可能重复卖出或对已不存在的仓位下指令。",
      "conclusion": "9月21日9:25先核对成交、持仓与可卖份额；此前0手。",
      "invalidCondition": "无。"
    },
    {
      "title": "普通破位不等于值得下小单",
      "basis": "旧3手/2手/2手订单的单边费率约3.06%/1.48%/1.30%。",
      "inference": "最低佣金会吞噬普通风险调整的收益。",
      "conclusion": "价格触发只进入风险复核，非硬风险不下碎片单。",
      "invalidCondition": "合并订单达到经济金额或风险升级为硬退出。"
    },
    {
      "title": "161226基础资产和溢价分开看",
      "basis": "9月18日场内涨2.67%，净值涨2.73%，同日静态溢价约5.98%。",
      "inference": "价格上涨并未扩大到8%硬风控线，但暂停申购仍使溢价有尾部风险。",
      "conclusion": "持有、不补仓；周一用同日数据重算。",
      "invalidCondition": "同日溢价>8%或基本面失效。"
    },
    {
      "title": "反弹只提高持有评分，不自动产生买点",
      "basis": "A股成长与恒生科技同步上涨，但海外收益率、油价和加息压力仍高。",
      "inference": "周五强势可能在周一高开后回吐。",
      "conclusion": "强项持有，不追涨。",
      "invalidCondition": "周一放量站稳周五高点且外部风险同步缓和。"
    },
    {
      "title": "开放式基金继续按净值披露",
      "basis": "005827运行时接口501，最新为9月18日净值1.4865。",
      "inference": "静态净值不能伪装成盘中行情。",
      "conclusion": "继续显示失败态且不画盘中K线。",
      "invalidCondition": "自有代理返回带真实日期的有效净值数据。"
    }
  ],
  "invalidConditions": [
    "159740/164701/161226仅出现普通价格破位且订单仍低于1000元或单边费率>0.5%：取消下单，只做风险复核。",
    "161226同日溢价>8%、基本面失效或出现明确硬风控：普通费用闸门让位于风险退出，并按剩余真实份额合并一笔。",
    "161226同日溢价降到3%以内且站稳1.929：取消溢价警报；周五5.98%不得冒充周一实时值。",
    "观察池没有真实卖出资金、基金自身二次确认和可核验预期收益：继续不买。",
    "网页行情出现0价、旧日期、失败态或来源校验失败：取消基于网页价格的执行，只看券商App真实行情。"
  ],
  "cancelPlan": [
    "9:25先查最新成交与持仓；旧计划涉及的标的已卖出则不得重复。",
    "竞价或开盘一分钟的瞬时跌破不直接成交；需要30分钟确认的标的必须等完整时间。",
    "普通价格破位若未通过1000元/0.5%费用闸门，不下单；硬退出必须记录风险理由并合并执行。",
    "卖出没有真实成交前，不把资金写入观察池买入计划；即使成交，9月21日也先留现金。",
    "任何真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "交易费用要先于价格信号",
      "basis": "小额ETF/LOF订单常被每笔最低佣金主导。",
      "inference": "价格信号正确也可能因交易成本变成负期望。",
      "conclusion": "先算成交额、费用占比和扣费后收益，再决定是否下单。",
      "invalidCondition": "硬性风险退出。"
    },
    {
      "title": "同日价格与净值才能算LOF溢价",
      "basis": "161226在9月18日场内1.925、净值1.8164，对应约5.98%。",
      "inference": "跨日期比较会把基础资产涨跌混入溢价。",
      "conclusion": "每天按同一日期重算。",
      "invalidCondition": "无。"
    },
    {
      "title": "指数反弹不等于所有持仓转强",
      "basis": "科创50涨2.89%，但601208跌1.91%，002466仅涨0.05%。",
      "inference": "板块与个股仍明显分化。",
      "conclusion": "执行线以标的自身真实OHLC为准。",
      "invalidCondition": "持仓与指数重新同步。"
    },
    {
      "title": "最低经济金额不是买入理由",
      "basis": "161725买19手可达到约1005元，但仍缺可核验的预期毛收益。",
      "inference": "通过金额门槛后仍要覆盖往返费用3倍并留下至少1%净收益空间。",
      "conclusion": "当前买0手。",
      "invalidCondition": "资金、走势与收益证据同时满足。"
    },
    {
      "title": "先恢复流动性，再谈机会",
      "basis": "组合接近满仓且最新成交状态待核对。",
      "inference": "没有现金缓冲时，新机会不可执行。",
      "conclusion": "卖出资金先留现金，不做当日切换。",
      "invalidCondition": "持仓和现金形成新的、已核验缓冲。"
    }
  ],
  "nextWatch": [
    "9月21日9:25：核对最新成交、持仓、可卖份额与可用现金；未对账前0手。",
    "9:30：核对网页真实时间戳；仍为9月18日、0价或失败时切换券商App。",
    "10:00：看159740的0.536、164701的1.669、161226的1.894；破位只进入风险复核。",
    "10:30：复核512710、159608、159241、562350的周五低点；不拆碎片单。",
    "13:30：观察双创与恒生科技是否延续修复，只作持仓确认，周一不买。",
    "15:00后：记录真实收盘与基金净值披露，重算161226同日溢价和费用闸门。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "50.50 / 50.00",
      "resistance": "53.40 / 53.48"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.19 / 4.15",
      "resistance": "4.29 / 4.32"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "42.37 / 42.00",
      "resistance": "43.19 / 43.50"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "119.93 / 118.62",
      "resistance": "123.43 / 125.00"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.525 / 0.520",
      "resistance": "0.531 / 0.535"
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
      "note": "2026-09-19 16:10：13/13返回非零9月18日真实收盘；报价与独立日K最后一根的日期、开高低收逐只一致。"
    },
    {
      "name": "自有代理基金端点失败态",
      "url": "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827",
      "note": "2026-09-19运行时仍返回HTTP 501；页面显示失败态，开放式基金不提供盘中K线。"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10",
      "note": "9月18日单位净值1.8164、日涨2.73%、暂停申购；相对同日场内收盘1.925的静态溢价约5.98%。"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10",
      "note": "9月18日单位净值1.4865、单日涨0.48%、限制大额申购；运行时接口仍失败。"
    },
    {
      "name": "证券时报：9月18日A股收盘",
      "url": "https://www.stcn.com/article/detail/4191119.html",
      "note": "上证+0.94%、深成指+1.72%、创业板+2.25%；科创50与成交额另经收盘数据核对。"
    },
    {
      "name": "新华社：9月18日港股收盘",
      "url": "https://www1.xinhuanet.com/20260918/9bc6c493885345239a8bc5910fa7de1a/c.html",
      "note": "恒指+0.60%，恒生科技+2.20%。"
    },
    {
      "name": "AP：美股、收益率与油价",
      "url": "https://apnews.com/article/stock-markets-oil-war-inflation-rates-1ff3311788bcc4555d00e283a57289fe",
      "note": "标普+0.2%、道指-0.2%、纳指+0.4%；10年期美债收益率约5%，布伦特结算103.87美元。"
    },
    {
      "name": "AP：日本央行加息",
      "url": "https://apnews.com/article/japan-economy-interest-rates-inflation-67e71246d3af41bcfc61aa788f9959c7",
      "note": "日本央行将政策利率上调至1.25%，为31年高位。"
    },
    {
      "name": "路透：9月18日贵金属",
      "url": "https://www.marketscreener.com/news/gold-climbs-to-one-week-high-heads-for-weekly-gain-on-easing-oil-prices-ce785adadd88ff2d",
      "note": "现货黄金涨1.2%、白银涨2.3%；高利率仍限制估值。"
    },
    {
      "name": "上交所：本周市场运行与交易监管",
      "url": "https://www.sse.com.cn/aboutus/mediacenter/conference/c/10832738/files/b033024c8e474debadbba67eda58b78d.pdf",
      "note": "9月14日至18日对50起异常交易采取自律监管措施，并提示高波动交易风险。"
    }
  ]
};
