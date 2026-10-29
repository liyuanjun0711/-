window.MARKET_BRIEFING_DATA = {
  "date": "2026-10-30",
  "portfolioVersion": "portfolio-2026-10-30-premarket-fee-aware-v1",
  "time": "2026-10-29 17:49北京时点核验：13个场内持仓/观察标的均为10月29日真实收盘，且与独立日K末根的日期、开高低收逐只一致。161226与005827公开净值只披露到10月28日；自有运行时基金接口仍返回501。10月30日盘前不把10月29日收盘写成实时行情。",
  "lastUpdated": "2026-10-29 17:49 北京时间（场内为10月29日真实收盘；基金为10月28日公开净值）",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "logicUpdatedAt": "2026-10-30盘前（最新券商持仓与实际费率仍待核对）",
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
        "referencePrice": 0.461,
        "hardRiskExit": false
      },
      {
        "code": "164701",
        "label": "旧2手减仓复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.549,
        "hardRiskExit": false
      },
      {
        "code": "161226",
        "label": "旧2手溢价风险复核",
        "side": "sell",
        "lots": 2,
        "referencePrice": 1.532,
        "hardRiskExit": false
      },
      {
        "code": "161725",
        "label": "19手最低经济金额买入复核",
        "side": "buy",
        "lots": 19,
        "referencePrice": 0.533,
        "hardRiskExit": false
      }
    ]
  },
  "oneLine": "结论：10月30日盘前买0手、卖0手。10月29日上证指数跌0.82%，深成指跌2.92%、创业板指跌4.45%、科创50跌4.27%，成长风险仍高；军工/航天和电力相对强，但不追单日反弹。161226的最新同日可比溢价只能算到10月28日，约5.96%，10月29日净值未披露，不能用错日数据触发退出。旧159740三手、164701两手、161226两手分别约138.30元、309.80元、306.40元，普通调仓均被费用闸门否决；新买入仍无已成交资金来源和费用后收益证据。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "成长再度重挫：盘前0手，先核持仓",
      "conclusion": "10月29日沪指跌0.82%，深成指跌2.92%、创业板指跌4.45%、科创50跌4.27%；13个场内标的真实收盘已逐只核对。",
      "action": "10月30日盘前买0手、卖0手。9:15先核对券商最新持仓、可卖份额、成交记录和实际费率；未完成对账前不生成订单。",
      "trigger": "只有券商/网页出现10月30日真实时间戳，且持仓对账完成，才进入盘中风险复核；未触发继续持有/观察。",
      "reason": "指数分化说明风险偏好仍不稳，且网页无法知道真实剩余份额。仅供个人复盘参考。"
    },
    {
      "type": "市场结构",
      "title": "军工航天、电力相对强，但不追单日反弹",
      "conclusion": "512710涨1.16%、159241涨0.20%、562350涨0.74%，明显跑赢创业板与科创50；商业航天和电力市场政策形成局部支撑。",
      "action": "已有份额继续观察，不追加。只有真实价格站上10月29日高点并回踩不破，才进入基金端复核；股票观察池仍不买。",
      "trigger": "512710站稳0.616、159241站稳0.991、562350站稳1.088并完成两次确认；否则不追。",
      "reason": "相对强不等于费用后收益证据，接近满仓时追涨会增加切换成本。仅供个人复盘参考。"
    },
    {
      "type": "持仓风险",
      "title": "资源与港股科技继续弱，破低只复核",
      "conclusion": "159608跌2.87%收0.812、159740跌2.33%收0.461；东材科技和天齐锂业分别跌7.95%、3.62%，风险偏好没有修复。",
      "action": "不补仓、不抄底。基金若低于10月29日低点持续30分钟，只核查是否升级为基本面失效或明确硬风险；不足1000元的普通碎片卖单不下。",
      "trigger": "出现公告确认的基本面失效、流动性异常或LOF溢价失控，才按真实剩余份额合并退出。",
      "reason": "价格下跌提高风险，但不能把普通波动自动升级为硬退出。仅供个人复盘参考。"
    },
    {
      "type": "LOF溢价",
      "title": "161226同日溢价只到10月28日约5.96%",
      "conclusion": "10月28日场内收1.565、单位净值1.4770，同日静态溢价约5.96%；10月29日场内收1.532，但当日净值尚未披露。",
      "action": "不使用10月28日净值与10月29日收盘硬算最新溢价；当前不卖旧2手。只有最新同日净值/估值确认溢价>8%或出现其他硬风险，才合并真实剩余份额退出。",
      "trigger": "最新同日可核验溢价>8%：转硬风险；≤8%或日期不一致：继续观察。",
      "reason": "旧2手约306.40元、单边费约5元/1.63%；非硬风险时属于费用不经济的小单。费率待券商实际确认。仅供个人复盘参考。"
    },
    {
      "type": "费用闸门",
      "title": "三笔旧碎片卖单继续暂停，新买入仍不成立",
      "conclusion": "159740旧3手约138.30元/单边费约3.62%；164701旧2手约309.80元/1.61%；161226旧2手约306.40元/1.63%。",
      "action": "三笔普通调仓不下单；161725买0手，19手约1012.70元、往返最低佣金约10元，但缺少已成交资金来源和可核验预期毛收益。",
      "trigger": "非硬风险且成交额<1000元或单边费用>0.5%：暂停；新买基金还须毛收益覆盖往返费用3倍且扣费后预期收益≥1%。",
      "reason": "当前没有一笔新交易同时通过金额、费用、资金来源和预期收益四道门槛。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 9:15核对券商最新成交、真实持仓、可卖份额和实际费率；未对账前买0手、卖0手。",
    "2. 9:25确认网页/券商是否出现10月30日真实时间戳；仍为10月29日、0价或失败态，不依据网页下单。",
    "3. 9:30后先看159608的0.812、159740的0.461与161226的1.530；跌破并持续30分钟只进入硬风险复核。",
    "4. 512710、159241、562350只有站稳10月29日高点并回踩不破才复核，不追开盘冲高，买入仍为0手。",
    "5. 等待161226的10月29日净值或10月30日同日可核验估值；只有同日溢价>8%或其他硬风险才合并真实份额退出。",
    "6. 159740旧3手、164701旧2手、161226旧2手继续暂停，单边费用占比分别约3.62%、1.61%、1.63%。",
    "7. 所有新买入为0手；任何卖出资金即使真实成交，也先留现金。15:00后记录真实收盘与基金净值披露。"
  ],
  "tradePlan": [
    {
      "title": "成长风险仍是主线",
      "basis": "深成指、创业板、科创50分别跌2.92%、4.45%、4.27%，显著弱于沪指。",
      "inference": "高弹性资产仍在去风险，单日局部强势不代表全面反转。",
      "conclusion": "盘前0手，等待真实30分钟承接。",
      "invalidCondition": "成长指数与组合基金同步放量收复10月29日高点。"
    },
    {
      "title": "军工航天、电力只看相对强度",
      "basis": "512710、159241、562350逆势收涨，南方区域电力市场转入正式运行。",
      "inference": "政策与资金形成局部支撑，但追涨会放大切换成本。",
      "conclusion": "已有仓观察，不新增。",
      "invalidCondition": "真实价格站稳10月29日高点并完成两次确认，且新买入通过资金与费用后收益门槛。"
    },
    {
      "title": "161226不得跨日算溢价",
      "basis": "10月28日场内1.565、净值1.4770，同日溢价约5.96%；10月29日净值未披露。",
      "inference": "用10月28日净值除10月29日价格会制造伪精度。",
      "conclusion": "当前不卖旧2手，等待同日数据。",
      "invalidCondition": "最新同日可核验溢价>8%或其他硬风险成立。"
    },
    {
      "title": "费用先否决碎片单",
      "basis": "三笔旧卖单成交额均不足1000元，单边费用占比均高于0.5%。",
      "inference": "普通调仓会被最低佣金吞噬。",
      "conclusion": "触价只复核，不机械下单。",
      "invalidCondition": "基本面失效、LOF溢价失控或明确硬风控。"
    },
    {
      "title": "外部利率与AI估值压力并存",
      "basis": "美联储维持3.75%-4.00%利率区间，通胀仍高；Alphabet财报低于预期后美股科技情绪承压。",
      "inference": "利率高位和AI盈利验证都不利于高估值科技扩张。",
      "conclusion": "港股科技与半导体不追反弹。",
      "invalidCondition": "利率预期明显下修且科技指数完成价格修复。"
    }
  ],
  "noTradeList": [
    "不把10月29日收盘写成10月30日实时行情；盘前买0手、卖0手。",
    "不使用10月28日净值与10月29日场内价跨日计算161226最新溢价；日期不一致就不触发。",
    "不机械执行159740旧3手、164701旧2手或161226旧2手普通卖单；费用闸门全部否决。",
    "不追512710、159241、562350的单日相对强势；未通过资金和费用后收益门槛就不买。",
    "不买股票观察池；东材科技与天齐锂业下跌只作基金板块风险信号。",
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
      "support": "0.461 / 跌破后复核",
      "resistance": "0.469 / 0.477",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 0.469,
      "lastClose": 0.461,
      "lastHigh": 0.469,
      "lastLow": 0.461,
      "lastChangePercent": -2.33,
      "lastSource": "自有代理eastmoney真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "action": "持有、不加仓；低于0.461运行30分钟进入硬风险复核；旧3手约138.30元、单边费约3.62%，普通减仓不下单",
      "invalidCondition": "站回0.469且恒生科技同步修复",
      "predictionScore": 2,
      "predictionLabel": "连续弱于A股防御方向",
      "expectedDirection": "偏弱",
      "reason": "10月29日跌2.33%收0.461、收于日低。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.544 / 跌破后复核",
      "resistance": "1.559 / 1.565",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 1.555,
      "lastClose": 1.549,
      "lastHigh": 1.559,
      "lastLow": 1.544,
      "lastChangePercent": -0.06,
      "lastSource": "自有代理sina真实收盘与独立tencent日K交叉核对，2026-10-29；mode=closed",
      "action": "持有、不补仓；低于1.544运行30分钟只做风险复核；旧2手约309.80元、单边费约1.61%，普通减仓不下单",
      "invalidCondition": "站稳1.559且外盘黄金确认走强",
      "predictionScore": 5,
      "predictionLabel": "场内窄幅震荡",
      "expectedDirection": "震荡",
      "reason": "10月29日跌0.06%收1.549，明显抗跌但未突破日高。",
      "riskLevel": "中"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.596 / 跌破后复核",
      "resistance": "0.616 / 0.628",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 0.6,
      "lastClose": 0.608,
      "lastHigh": 0.616,
      "lastLow": 0.596,
      "lastChangePercent": 1.16,
      "lastSource": "自有代理eastmoney真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "action": "持有、不追涨；站稳0.616并回踩不破只进入基金买入复核；普通碎片单不足1000元不下单",
      "invalidCondition": "跌破0.596或军工航天相对强度消失",
      "predictionScore": 6,
      "predictionLabel": "逆势反弹但成长环境偏弱",
      "expectedDirection": "震荡偏强",
      "reason": "10月29日涨1.16%收0.608，明显跑赢创业板与科创50。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.530 / 跌破后复核",
      "resistance": "1.574 / 1.585",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 1.565,
      "lastClose": 1.532,
      "lastHigh": 1.574,
      "lastLow": 1.53,
      "lastChangePercent": -2.11,
      "lastSource": "自有代理eastmoney真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "action": "持有并等待同日净值；10月28日同日静态溢价约5.96%，10月29日净值未披露；旧2手约306.40元、单边费约1.63%，普通减仓不下单",
      "invalidCondition": "最新同日可核验溢价>8%或出现基本面/申赎硬风险",
      "predictionScore": 3,
      "predictionLabel": "场内续跌且净值日期滞后",
      "expectedDirection": "高波动偏弱",
      "reason": "10月29日跌2.11%收1.532；当日净值尚未披露，不能跨日算溢价。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "0.812 / 跌破后复核",
      "resistance": "0.835 / 0.845",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 0.832,
      "lastClose": 0.812,
      "lastHigh": 0.835,
      "lastLow": 0.812,
      "lastChangePercent": -2.87,
      "lastSource": "自有代理sina真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "action": "持有、不加仓；低于0.812运行30分钟进入硬风险复核；不足1000元不卖碎片单",
      "invalidCondition": "站稳0.835且资源板块同步转强",
      "predictionScore": 2,
      "predictionLabel": "资源基金再收日低",
      "expectedDirection": "偏弱",
      "reason": "10月29日跌2.87%收0.812、收于日低。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "0.956 / 跌破后复核",
      "resistance": "0.991 / 1.016",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 0.968,
      "lastClose": 0.979,
      "lastHigh": 0.991,
      "lastLow": 0.956,
      "lastChangePercent": 0.2,
      "lastSource": "自有代理eastmoney真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "action": "持有、不追涨；站稳0.991并回踩不破只进入基金买入复核；普通碎片单不足1000元不下单",
      "invalidCondition": "跌破0.956或商业航天相对强度消失",
      "predictionScore": 6,
      "predictionLabel": "逆势小涨、波动仍大",
      "expectedDirection": "震荡偏强",
      "reason": "10月29日涨0.20%收0.979，盘中低至0.956后修复。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.074 / 跌破后复核",
      "resistance": "1.088 / 1.095",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 1.078,
      "lastClose": 1.085,
      "lastHigh": 1.088,
      "lastLow": 1.074,
      "lastChangePercent": 0.74,
      "lastSource": "自有代理eastmoney真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "action": "持有、不追涨；站稳1.088并回踩不破只进入基金复核；不足1000元不卖碎片单",
      "invalidCondition": "跌破1.074或电力板块相对强度消失",
      "predictionScore": 6,
      "predictionLabel": "政策支撑下相对强",
      "expectedDirection": "震荡偏强",
      "reason": "10月29日涨0.74%收1.085，南方区域电力市场转正式运行形成政策背景。",
      "riskLevel": "中"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "8.01 / 跌破后复核",
      "resistance": "8.34 / 8.60",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 8.34,
      "lastClose": 8.01,
      "lastHigh": 8.34,
      "lastLow": 8.01,
      "lastChangePercent": -3.84,
      "lastSource": "自有代理eastmoney真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "action": "仅观察8.01/8.34，不新增股票买卖指令；连续弱势且Q3盈利质量承压，不补仓",
      "invalidCondition": "跌破8.01或盈利质量继续恶化",
      "predictionScore": 2,
      "predictionLabel": "续跌并收日低",
      "expectedDirection": "偏弱",
      "reason": "10月29日跌3.84%收8.01、收于日低。",
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
      "status": "放量急跌收低，股票不买",
      "reason": "10月29日跌7.95%收34.60、收于日低，PCB材料风险显著。",
      "buyTrigger": "本账户不买股票；站回37.40并完成两次确认，只作新材料基金验证，不下单。",
      "avoidReason": "单日大跌且账户不买股票；10月30日买0手。",
      "risk": "跌破34.60后继续观察，不抄底。",
      "support": "34.60 / 跌破后观察",
      "resistance": "37.40 / 37.50",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 36.27,
      "lastClose": 34.6,
      "lastHigh": 37.4,
      "lastLow": 34.6,
      "lastChangePercent": -7.95,
      "lastSource": "自有代理eastmoney真实收盘与独立tencent日K交叉核对，2026-10-29；mode=closed",
      "invalidCondition": "跌破34.60或无法收复37.40",
      "predictionScore": 1,
      "predictionLabel": "急跌收于日低",
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
      "reason": "10月29日涨0.92%收4.40，显著跑赢通信设备板块与成长指数。",
      "buyTrigger": "本账户不买股票；站稳4.43只作通信基金确认，不下单。",
      "avoidReason": "个股相对强不等于基金费用后收益证据。",
      "risk": "跌破4.34后相对强度可能消失。",
      "support": "4.34 / 跌破后观察",
      "resistance": "4.43 / 4.45",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 4.4,
      "lastClose": 4.4,
      "lastHigh": 4.43,
      "lastLow": 4.34,
      "lastChangePercent": 0.92,
      "lastSource": "自有代理eastmoney真实收盘与独立tencent日K交叉核对，2026-10-29；mode=closed",
      "invalidCondition": "跌破4.34或相对强度消失",
      "predictionScore": 6,
      "predictionLabel": "逆势抗跌",
      "expectedDirection": "震荡偏强",
      "riskLevel": "中"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "status": "业绩背景未能止跌，股票不买",
      "reason": "10月29日跌3.62%收34.91，盘中低34.88；此前三季报高增仍未转成价格强度。",
      "buyTrigger": "本账户不买股票；站回35.95并回踩确认，只作资源基金验证，不下单。",
      "avoidReason": "价格未确认，且组合已有159608资源暴露。",
      "risk": "跌破34.88后继续观察，不抄底。",
      "support": "34.88 / 跌破后观察",
      "resistance": "35.95 / 36.30",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 35.8,
      "lastClose": 34.91,
      "lastHigh": 35.95,
      "lastLow": 34.88,
      "lastChangePercent": -3.62,
      "lastSource": "自有代理sina真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "invalidCondition": "跌破34.88或锂价与板块同步转弱",
      "predictionScore": 2,
      "predictionLabel": "业绩背景未转成强势",
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
      "status": "跑赢科创50，股票不买",
      "reason": "10月29日跌0.98%收101.00，明显跑赢科创50的-4.27%，但仍未突破日高102.00。",
      "buyTrigger": "本账户不买股票；站稳102.00并完成两次确认，只作半导体基金验证，不下单。",
      "avoidReason": "高估值科技外部压力仍在，账户不买股票。",
      "risk": "跌破99.50后相对强度可能消失。",
      "support": "99.50 / 跌破后观察",
      "resistance": "102.00 / 103.00",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 102,
      "lastClose": 101,
      "lastHigh": 102,
      "lastLow": 99.5,
      "lastChangePercent": -0.98,
      "lastSource": "自有代理eastmoney真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "invalidCondition": "跌破99.50或半导体相对强度消失",
      "predictionScore": 5,
      "predictionLabel": "相对抗跌但板块承压",
      "expectedDirection": "震荡",
      "riskLevel": "中"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "status": "逆势小涨，费用与收益空间仍不通过",
      "reason": "10月29日涨0.95%收0.533；19手约1012.70元、往返最低佣金约10元，但没有已成交资金来源或可核验预期毛收益。",
      "buyTrigger": "未来先有基金真实卖出资金，再站稳0.536并回踩0.533不破；还须证明预期毛收益至少覆盖往返费用3倍且净收益≥1%。当前买0手。",
      "avoidReason": "没有真实资金来源、收益证据或板块二次确认时都不买。",
      "risk": "跌破0.525后取消任何买入复核。",
      "support": "0.525 / 跌破不买",
      "resistance": "0.536 / 0.540",
      "lastTradeDate": "2026-10-29",
      "lastOpen": 0.525,
      "lastClose": 0.533,
      "lastHigh": 0.536,
      "lastLow": 0.525,
      "lastChangePercent": 0.95,
      "lastSource": "自有代理sina真实收盘与独立eastmoney日K交叉核对，2026-10-29；mode=closed",
      "invalidCondition": "跌破0.525或无法站稳0.536",
      "predictionScore": 5,
      "predictionLabel": "小涨但收益证据不足",
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
      "status": "10月28日净值已披露，运行时接口失败",
      "reason": "10月28日单位净值1.3806、单日涨0.52%；开放式基金不提供盘中K线，自有代理仍返回501失败态。",
      "buyTrigger": "运行时真实净值接口恢复，连续两个披露日跑赢基准，并先有基金真实卖出资金后再评估。",
      "avoidReason": "接口未恢复、相对收益未确认或没有真实卖出资金时不买。",
      "risk": "净值披露有时滞，10月30日盘中不能据10月28日净值判断实时方向。",
      "support": "按净值披露，不设盘中支撑",
      "resistance": "按净值披露，不设盘中压力",
      "lastTradeDate": "2026-10-28",
      "lastOpen": null,
      "lastClose": 1.3806,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": 0.52,
      "lastSource": "东方财富基金公开历史净值，2026-10-28；运行时/api/fund为HTTP 501失败态",
      "invalidCondition": "连续两个披露日跑输基准或真实净值接口继续失败",
      "predictionScore": 5,
      "predictionLabel": "净值小涨，接口未恢复",
      "expectedDirection": "暂无盘中判断",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "A股成长指数再度重挫，沪指相对抗跌",
      "source": "自有代理 / Sina / Tencent / Eastmoney",
      "publishTime": "2026-10-29 17:47:00+08:00",
      "summary": "已确认事实：沪指跌0.82%、深成指跌2.92%、创业板指跌4.45%、科创50跌4.27%。基于事实的判断：风险偏好仍集中收缩，10月30日先看承接，不预设反转。",
      "relatedStocks": [
        "159740",
        "512710",
        "159241",
        "159608",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / A股成长",
      "relation": "risk",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ399006"
    },
    {
      "title": "美联储维持3.75%-4.00%利率区间",
      "source": "Federal Reserve",
      "publishTime": "2026-10-29 02:00:00+08:00",
      "summary": "已确认事实：FOMC以10票赞成、2票反对维持利率，声明称经济活动强劲、通胀仍高，两名反对者主张加息25个基点。基于事实的判断：高利率与通胀约束继续压制高估值科技和无息贵金属。",
      "relatedStocks": [
        "159740",
        "164701",
        "161226",
        "005827",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / 利率",
      "relation": "risk",
      "url": "https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm"
    },
    {
      "title": "Alphabet财报不及预期，全球科技情绪分化",
      "source": "AP",
      "publishTime": "2026-10-29 13:03:55+08:00",
      "summary": "已确认事实：Alphabet三季度收入低于市场预期，盘后股价一度跌逾10%；AP报道时布伦特原油跌0.8%至110.77美元。基于事实的判断：AI盈利验证压力仍在，油价小跌暂未解除高利率与地缘风险。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981"
      ],
      "sector": "过去24小时 / 全市场重大风险 / AI / 油价",
      "relation": "risk",
      "url": "https://apnews.com/article/1b5c71d31b4ce1e46b0db47b33141f6b"
    },
    {
      "title": "南方区域电力市场转入正式运行",
      "source": "国家发展改革委 / 国家能源局",
      "publishTime": "2026-10-28 18:00:00+08:00",
      "summary": "已确认事实：官方同意南方区域电力市场转入正式运行，要求扩大交易范围和规模、完善新能源适配机制。基于事实的判断：这是电力市场化的中期利好背景，但562350单日上涨0.74%不足以形成追买信号。",
      "relatedStocks": [
        "562350"
      ],
      "sector": "过去24小时 / 全市场重大利好 / 电力市场",
      "relation": "market",
      "url": "https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20670"
    },
    {
      "title": "商业航天逆势活跃，军工与航天基金相对强",
      "source": "东方财富市场收盘 / 自有代理",
      "publishTime": "2026-10-29 15:30:00+08:00",
      "summary": "已确认事实：航天装备板块逆势居前；512710涨1.16%、159241涨0.20%。基于事实的判断：局部资金抱团成立，但成长指数大跌，10月30日不追高。",
      "relatedStocks": [
        "512710",
        "159241"
      ],
      "sector": "过去24小时 / 持仓关联 / 军工航天",
      "relation": "holding",
      "url": "https://fund.eastmoney.com/a/202610293913948829.html"
    },
    {
      "title": "东材科技跌7.95%，新材料风险升温",
      "source": "自有代理 / 独立日K",
      "publishTime": "2026-10-29 16:12:00+08:00",
      "summary": "已确认事实：601208收34.60、跌7.95%，日高37.40、日低34.60。基于事实的判断：股票只作板块风险信号，不买股票，也不据急跌机械抄底基金。",
      "relatedStocks": [
        "601208",
        "159608"
      ],
      "sector": "过去24小时 / 观察池风险 / 新材料",
      "relation": "risk",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH601208"
    },
    {
      "title": "161226最新同日可比溢价约5.96%",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-10-29 17:49:00+08:00",
      "summary": "已确认事实：10月28日净值1.4770、同日场内收1.565，静态溢价约5.96%；10月29日场内收1.532但当日净值未披露。基于事实的判断：不得跨日计算最新溢价，当前不触发硬退出。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "持仓 / 白银LOF / 溢价 / 日期错位",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10"
    },
    {
      "title": "005827净值小涨，运行时接口仍为501",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-10-29 17:49:00+08:00",
      "summary": "已确认事实：10月28日净值1.3806、日涨0.52%；自有/api/fund仍返回501。基于事实的判断：只保留 dated NAV，不提供盘中K线，不新增。",
      "relatedStocks": [
        "005827"
      ],
      "sector": "持仓 / 开放式基金 / 接口失败",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10"
    },
    {
      "title": "13个场内标的真实收盘全部通过日K核对",
      "source": "自有代理 / 独立日K",
      "publishTime": "2026-10-29 17:49:00+08:00",
      "summary": "已确认事实：13/13报价日期均为10月29日，非零OHLC与独立日K末根一致；512710首次日K精度不足后又经Sina、Tencent报价与Eastmoney日K精确复核。基于事实的判断：这些值只作最近真实收盘基线，不能冒充10月30日实时行情。",
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
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710"
    }
  ],
  "reasoning": [
    {
      "title": "成长风险未解除",
      "basis": "创业板和科创50分别跌4.45%、4.27%，明显弱于沪指。",
      "inference": "指数分化说明资金偏防御，不宜追高弹性基金。",
      "conclusion": "盘前0手，等待真实承接。",
      "invalidCondition": "成长指数与持仓基金同步收复10月29日高点。"
    },
    {
      "title": "相对强势也要过费用门",
      "basis": "军工航天和电力基金逆势上涨，但账户接近满仓。",
      "inference": "没有已成交资金来源和可核验预期收益，追涨不可执行。",
      "conclusion": "已有仓观察，新买0手。",
      "invalidCondition": "先有真实卖出资金，再完成两次价格确认并通过费用后收益门槛。"
    },
    {
      "title": "LOF溢价必须同日",
      "basis": "10月28日同日静态溢价约5.96%，10月29日净值未披露。",
      "inference": "跨日计算会制造错误触发。",
      "conclusion": "当前不卖旧2手。",
      "invalidCondition": "最新同日溢价>8%或其他硬风险成立。"
    },
    {
      "title": "费用闸门继续优先",
      "basis": "三笔旧碎片卖单均不足1000元，单边费用占比超过0.5%。",
      "inference": "普通调仓没有费用效率。",
      "conclusion": "触价只复核，不机械下单。",
      "invalidCondition": "明确硬风险成立。"
    },
    {
      "title": "外部高利率压制估值",
      "basis": "美联储按兵不动但通胀仍高，反对票要求加息；AI龙头财报低于预期。",
      "inference": "高估值科技需要更强盈利兑现才能对冲利率压力。",
      "conclusion": "港股科技和半导体不追反弹。",
      "invalidCondition": "利率预期下修且科技指数完成价格确认。"
    }
  ],
  "invalidConditions": [
    "最新券商持仓与旧计划不一致：所有旧手数立即失效，按真实份额重算。",
    "161226净值与场内价格日期不一致：不得计算或执行溢价触发；当前最新同日可比值为10月28日约5.96%。",
    "161226最新同日溢价>8%、基本面失效或申赎风险恶化：普通费用闸门让位于硬退出，并按真实剩余份额合并一笔。",
    "159740/164701/161226只有普通价格触发且订单仍<1000元或单边费率>0.5%：取消下单，只做风险复核。",
    "网页出现0价、10月29日旧时间戳却标实时、失败态或来源校验失败：取消基于网页价格的执行，只看券商真实行情。"
  ],
  "cancelPlan": [
    "9:15先查最新成交与持仓；旧计划标的已卖出或份额变化则不得重复。",
    "竞价或开盘一分钟的瞬时跳空不直接成交；普通价格触发等30分钟确认。",
    "161226只有最新同日可核验溢价>8%或其他硬风险成立时才走风险退出；净值日期滞后就取消触发。",
    "卖出没有真实成交前，不把资金写入观察池买入计划；即使成交，也先留现金。",
    "真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "报价与日K必须同日核对",
      "basis": "13个场内标的10月29日OHLC全部与独立日K末根一致。",
      "inference": "只有日期和OHLC校验通过的数据才能进入报告。",
      "conclusion": "以10月29日收盘作10月30日盘前基线。",
      "invalidCondition": "10月30日真实行情到达。"
    },
    {
      "title": "基金溢价必须同日",
      "basis": "161226的最新同日组合是10月28日场内1.565和净值1.4770。",
      "inference": "不能把10月29日价格与10月28日净值拼接。",
      "conclusion": "日期不一致时不触发。",
      "invalidCondition": "取得最新同日净值或可靠估值。"
    },
    {
      "title": "小额普通调仓先看费用",
      "basis": "旧三笔卖单单边费用占比均明显超过0.5%。",
      "inference": "机械小单会让最低佣金吞噬收益。",
      "conclusion": "不下碎片单。",
      "invalidCondition": "明确硬风险成立。"
    },
    {
      "title": "相对强不等于可买",
      "basis": "军工航天和电力基金上涨，但成长指数大跌且资金来源缺失。",
      "inference": "需要价格确认、资金来源和费用后收益同时成立。",
      "conclusion": "新买0手。",
      "invalidCondition": "三项条件同时满足。"
    },
    {
      "title": "股票只作板块温度计",
      "basis": "东材科技急跌、中国联通相对强、天齐锂业续弱，结构差异大。",
      "inference": "个股信号用于验证基金方向，不产生股票订单。",
      "conclusion": "观察池股票不买。",
      "invalidCondition": "无。"
    }
  ],
  "nextWatch": [
    "9:15：核对最新成交、真实持仓、可卖份额与券商实际费率；未对账前0手。",
    "9:25：确认网页/券商出现10月30日真实时间戳；仍为10月29日或失败态则停用网页执行。",
    "10:00：看159608的0.812、159740的0.461、161226的1.530；跌破30分钟只做硬风险复核。",
    "10:00后：看512710的0.616、159241的0.991、562350的1.088；未站稳并回踩确认就不追。",
    "全天：等待161226同日净值/估值，日期不一致不算溢价；关注美债利率、油价与AI科技情绪。",
    "15:00后：记录10月30日真实收盘与基金净值披露，更新费用闸门和下一交易日计划。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "34.60 / 跌破后观察",
      "resistance": "37.40 / 37.50"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.34 / 跌破后观察",
      "resistance": "4.43 / 4.45"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "34.88 / 跌破后观察",
      "resistance": "35.95 / 36.30"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "99.50 / 跌破后观察",
      "resistance": "102.00 / 103.00"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.525 / 跌破不买",
      "resistance": "0.536 / 0.540"
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
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SH512710",
      "note": "2026-10-29 17:49：13/13返回非零10月29日真实收盘，状态closed；报价与独立日K末根的日期、开高低收一致。"
    },
    {
      "name": "自有代理基金端点失败态",
      "url": "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827",
      "note": "2026-10-29运行时SZ161226与OF005827均返回HTTP 501；页面显示失败态，开放式基金不提供盘中K线。"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10",
      "note": "10月28日单位净值1.4770、日涨0.90%、暂停申购；相对同日场内收盘1.565的静态溢价约5.96%。"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10",
      "note": "10月28日单位净值1.3806、日涨0.52%、限制大额申购；运行时接口仍失败。"
    },
    {
      "name": "三源交叉核验：10月29日A股指数",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ399006",
      "note": "Sina、Tencent、Eastmoney核对：沪指-0.82%、深成指-2.92%、创业板指-4.45%、科创50-4.27%。"
    },
    {
      "name": "Federal Reserve：10月28日FOMC声明",
      "url": "https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm",
      "note": "维持联邦基金利率目标区间3.75%-4.00%；10票赞成、2票反对，反对者主张加息25bp。"
    },
    {
      "name": "AP：全球市场、Alphabet与油价",
      "url": "https://apnews.com/article/1b5c71d31b4ce1e46b0db47b33141f6b",
      "note": "Alphabet财报低于预期后科技情绪承压；报道时布伦特原油跌0.8%至110.77美元。"
    },
    {
      "name": "国家发展改革委：南方区域电力市场",
      "url": "https://zfxxgk.ndrc.gov.cn/web/iteminfo.jsp?id=20670",
      "note": "同意南方区域电力市场转入正式运行，扩大交易范围并完善新能源适配机制。"
    },
    {
      "name": "东方财富：10月29日A股收盘结构",
      "url": "https://fund.eastmoney.com/a/202610293913948829.html",
      "note": "行业多数下跌，航天装备、电力相关方向相对活跃，元件、半导体、通信设备等跌幅居前。"
    }
  ]
};
