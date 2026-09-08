window.MARKET_BRIEFING_DATA = {
  "date": "2026-09-09",
  "portfolioVersion": "portfolio-2026-09-09-premarket-v1",
  "time": "2026-09-08 18:00北京时点核验：13个场内持仓/观察标的均取得9月8日真实收盘，并逐只与真实日K最后一根核对一致。批量报价曾返回504，但分组/逐只请求全部成功；161226与005827运行时基金接口仍返回501，仅保留9月7日已披露净值。持仓清单沿用网页上次确认版本。",
  "lastUpdated": "2026-09-08 18:00 北京时间（场内为9月8日收盘；基金净值为9月7日披露）",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "oneLine": "结论：9月9日不买。159740跌破0.552运行30分钟卖3手；164701跌破1.700运行30分钟卖2手；161226仅在同日溢价重新高于8%或跌破1.937运行15分钟卖2手。512710与159241强势只上移保护线；所有卖出资金先留现金。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "9月9日不买：先防守港股科技与贵金属",
      "conclusion": "9月8日159740跌1.42%，恒生科技跌1.61%；164701收1.703、日内低点1.701。科技与贵金属都没有给出可追信号。",
      "action": "159740低于0.552运行30分钟卖3手；164701低于1.700运行30分钟卖2手；未触发继续持有、不补仓。",
      "trigger": "没触发：不操作。卖出资金全部留现金。失效：159740站稳0.560且恒生科技转强，164701站稳1.715且金价同步修复。",
      "reason": "组合接近满仓，先按真实价格处理弱项，不把外部新闻或主观评分当成交依据。仅供个人复盘参考。"
    },
    {
      "type": "溢价风控",
      "title": "161226：9月7日同日静态溢价约7.2%",
      "conclusion": "9月7日场内收1.941、单位净值1.8110，同日静态溢价约7.2%；9月8日场内收1.946，但9月8日净值尚未披露，不能跨日冒充同日溢价。",
      "action": "9月9日只有最新同日溢价重新高于8%卖2手，或低于1.937运行15分钟卖2手；未触发持有但不补。",
      "trigger": "取消减仓：同日溢价降到3%以内且场内站稳1.963。风险升级：申购继续暂停、溢价再扩张或跌破1.937。",
      "reason": "白银方向、基金净值和场内溢价分开判断；净值接口501时只承认已披露日期。仅供个人复盘参考。"
    },
    {
      "type": "强势持仓管理",
      "title": "512710 / 159241：收盘分别涨2.06%和1.70%",
      "conclusion": "512710收0.645并触及日高，159241收1.075、接近日高1.077；两只均强于当日双创指数。",
      "action": "512710低于0.629运行30分钟卖2手；159241低于1.051运行30分钟卖1手。未触发持有，不追涨。",
      "trigger": "站稳0.645或1.077只上移保护线，不转为买入；跌破0.629或1.051提高防守等级。",
      "reason": "强势可以持有，但满仓状态下连续上涨后追加风险不可执行。仅供个人复盘参考。"
    },
    {
      "type": "震荡持仓管理",
      "title": "159608 / 562350：小幅修复，仍只看支撑",
      "conclusion": "159608涨0.48%、收1.048；562350涨0.64%、收1.097。修复幅度有限，尚未形成新增买点。",
      "action": "159608低于1.042运行30分钟卖2手；562350低于1.088运行30分钟卖2手。未触发持有，不加仓。",
      "trigger": "取消减仓：分别站稳1.057、1.098并保持板块相对强度。失效：分别跌破1.042、1.088。",
      "reason": "用9月8日真实日内低点做风控，不用8月旧价格继续指挥。仅供个人复盘参考。"
    },
    {
      "type": "观察池不买",
      "title": "股票只作温度计；161725和005827也不买",
      "conclusion": "601208跌3.60%、688981跌2.09%，科技温度转弱；161725跌0.36%。005827最新仅有9月7日净值1.5155，运行时基金接口仍失败。",
      "action": "9月9日观察池全部不买。即使先有基金卖出成交，资金也先留现金，不当天切换。",
      "trigger": "未来只评估基金：先有真实卖出资金、基金站稳触发位、板块与宽基同步确认。任一条件缺失都不买。",
      "reason": "弱项未确认止跌，强项又不适合追；接口失败更不能用静态净值伪装盘中行情。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 9月9日9:25只记录真实竞价：159740是否接近0.552、164701是否接近1.700、161226是否接近1.937。",
    "2. 9:30-10:00不买；网页必须出现9月9日新时间戳且状态为实时/延迟，9月8日静态收盘不能当盘中价。",
    "3. 10:00先复核161226最新已披露净值与同日溢价；只有溢价>8%或1.937下方运行15分钟才卖2手。",
    "4. 同时检查159740的0.552与164701的1.700；触发后只按计划手数减，不临时扩大。",
    "5. 10:30检查159608的1.042、562350的1.088、512710的0.629、159241的1.051；未触发继续持有。",
    "6. 002090只观察9.25/9.37，不新增股票买卖指令；观察池股票同样不下单。",
    "7. 所有卖出资金先留现金。行情出现0价、旧日期、失败态或无真实时间戳时，以券商App真实报价为准。"
  ],
  "tradePlan": [
    {
      "title": "A股指数分化，科技成长承压",
      "basis": "9月8日上证+0.20%、深成指-0.52%、创业板-1.15%、科创50-1.52%；沪深两市成交约1.96万亿元。",
      "inference": "周期与小盘相对占优，科技风险偏好回落；宽基红盘不能替代持仓自身确认。",
      "conclusion": "159740与半导体观察标的偏防守，512710和159241只持有不追。",
      "invalidCondition": "双创指数与港股科技同步放量修复。"
    },
    {
      "title": "港股科技继续弱于大市",
      "basis": "恒生指数收跌0.38%，恒生科技跌1.61%；159740同步跌1.42%、收0.554。",
      "inference": "港股科技尚未止跌，单日低点0.552是下一交易日第一风控线。",
      "conclusion": "159740低于0.552运行30分钟卖3手，未触发持有但不补。",
      "invalidCondition": "159740站稳0.560且恒生科技转强。"
    },
    {
      "title": "贵金属短线震荡，基金仍看自身低点",
      "basis": "中国银行9月8日金市观察称，上一交易日国际现货黄金跌0.58%、上金所现货黄金跌1.69%；164701当日收1.703。",
      "inference": "贵金属中长期逻辑不等于短线已经止跌，场内基金仍要按真实低点防守。",
      "conclusion": "164701看1.700；161226同时看1.937与最新同日溢价，不抄底。",
      "invalidCondition": "金价与两只场内基金同步站回9月8日高点。"
    },
    {
      "title": "油价与地缘冲突压制风险偏好",
      "basis": "AP 9月8日报道，中东冲突升温推动布伦特原油早盘涨1.4%至98.40美元，亚洲股市与美股期指走弱。",
      "inference": "能源通胀与地缘风险同时抬升，成长估值面临额外压力。",
      "conclusion": "9月9日不追科技，不把油气上涨扩展成全市场买入信号。",
      "invalidCondition": "油价快速回落且全球风险资产同步修复。"
    },
    {
      "title": "先留现金，不做当日切换",
      "basis": "组合接近满仓，且持仓强弱分化明显。",
      "inference": "卖出后立即切换会继续占用风险预算，无法恢复流动性。",
      "conclusion": "9月9日任何卖出资金都先留现金，观察池当天不买。",
      "invalidCondition": "仓位已形成独立现金缓冲且基金完成二次确认。"
    }
  ],
  "noTradeList": [
    "不把9月8日收盘快照写成9月9日实时行情；盘中必须等待自有代理或券商App的新时间戳。",
    "不把161226的9月8日场内价与9月7日净值跨日计算成同日溢价；只保留9月7日约7.2%的同日静态值。",
    "不抄底159740、164701或161226；只在真实触发后按计划减仓。",
    "不追512710、159241、601208、688981；股票只作板块温度计。",
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
      "support": "0.552 / 0.550",
      "resistance": "0.560 / 0.562",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 0.559,
      "lastClose": 0.554,
      "lastHigh": 0.56,
      "lastLow": 0.552,
      "lastChangePercent": -1.42,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "action": "低于0.552运行30分钟卖3手；守住0.552持有；不加仓",
      "invalidCondition": "站稳0.560且恒生科技转强",
      "predictionScore": 3,
      "predictionLabel": "连续走弱待止跌",
      "expectedDirection": "震荡偏弱",
      "reason": "9月8日跌1.42%、收0.554，恒生科技同步跌1.61%，收盘接近日内低点。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.700 / 1.695",
      "resistance": "1.715 / 1.722",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 1.715,
      "lastClose": 1.703,
      "lastHigh": 1.715,
      "lastLow": 1.701,
      "lastChangePercent": 0.06,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "action": "低于1.700运行30分钟卖2手；10:00仍站不回1.715再卖2手；不补仓",
      "invalidCondition": "站稳1.715且国际金价同步修复",
      "predictionScore": 4,
      "predictionLabel": "低位震荡待确认",
      "expectedDirection": "震荡偏弱",
      "reason": "9月8日收1.703、仅涨0.06%，开盘与高点均为1.715，收盘靠近日低1.701。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.629 / 0.625",
      "resistance": "0.645 / 0.650",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 0.63,
      "lastClose": 0.645,
      "lastHigh": 0.645,
      "lastLow": 0.629,
      "lastChangePercent": 2.06,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "action": "低于0.629运行30分钟卖2手；守住0.629持有；不追涨",
      "invalidCondition": "跌破0.625或军工板块相对强度消失",
      "predictionScore": 7,
      "predictionLabel": "强势收在日高",
      "expectedDirection": "震荡偏强",
      "reason": "9月8日涨2.06%，收盘0.645等于日内高点，明显强于双创指数。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.937 / 1.920",
      "resistance": "1.963 / 1.980",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 1.961,
      "lastClose": 1.946,
      "lastHigh": 1.963,
      "lastLow": 1.937,
      "lastChangePercent": 0.26,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "action": "最新同日溢价>8%卖2手；低于1.937运行15分钟卖2手；未触发持有但不补仓",
      "invalidCondition": "同日溢价降到3%以内且场内站稳1.963",
      "predictionScore": 4,
      "predictionLabel": "溢价边缘高波动",
      "expectedDirection": "高波动震荡",
      "reason": "9月7日场内1.941与净值1.8110对应同日静态溢价约7.2%；9月8日净值尚未披露。",
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
      "resistance": "1.057 / 1.065",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 1.045,
      "lastClose": 1.048,
      "lastHigh": 1.057,
      "lastLow": 1.042,
      "lastChangePercent": 0.48,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "action": "低于1.042运行30分钟卖2手；守住1.042持有；不追涨",
      "invalidCondition": "跌破1.035且有色板块同步转弱",
      "predictionScore": 5,
      "predictionLabel": "弱修复未突破",
      "expectedDirection": "震荡",
      "reason": "9月8日涨0.48%，但收盘1.048仍低于日内高点1.057，修复尚未突破。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "1.051 / 1.045",
      "resistance": "1.077 / 1.085",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 1.051,
      "lastClose": 1.075,
      "lastHigh": 1.077,
      "lastLow": 1.051,
      "lastChangePercent": 1.7,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "action": "低于1.051运行30分钟卖1手；守住1.051持有；不加仓",
      "invalidCondition": "跌破1.045且航空航天板块同步转弱",
      "predictionScore": 7,
      "predictionLabel": "强势接近日高",
      "expectedDirection": "震荡偏强",
      "reason": "9月8日涨1.70%，收1.075并接近日内高点1.077，明显强于双创指数。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.088 / 1.080",
      "resistance": "1.098 / 1.105",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 1.09,
      "lastClose": 1.097,
      "lastHigh": 1.098,
      "lastLow": 1.088,
      "lastChangePercent": 0.64,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "action": "低于1.088运行30分钟卖2手；守住1.088持有；不加仓",
      "invalidCondition": "放量站稳1.105且电力板块恢复相对强度",
      "predictionScore": 5,
      "predictionLabel": "小幅修复",
      "expectedDirection": "震荡",
      "reason": "9月8日涨0.64%、收1.097，接近日高1.098，但尚未形成持续突破。",
      "riskLevel": "中"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "9.25 / 9.20",
      "resistance": "9.37 / 9.45",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 9.32,
      "lastClose": 9.33,
      "lastHigh": 9.37,
      "lastLow": 9.25,
      "lastChangePercent": 0.32,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "action": "仅观察9.25/9.37，不新增股票买卖指令，不补仓",
      "invalidCondition": "跌破9.25或电网设备板块相对转弱",
      "predictionScore": 5,
      "predictionLabel": "窄幅震荡",
      "expectedDirection": "震荡",
      "reason": "9月8日涨0.32%、收9.33，仍在9.25-9.37窄区间内。",
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
      "status": "大幅回落，股票不买",
      "reason": "9月8日跌3.60%、收47.41，从50.00开盘回落至接近日低47.26。",
      "buyTrigger": "本账户不买股票；重新站稳50.00并回踩49.18不破，只作为新材料基金的板块确认，不下单。",
      "avoidReason": "大幅回落且账户不买股票；9月9日明确不买。",
      "risk": "跌破47.26可能继续测试更低平台。",
      "support": "47.26 / 46.50",
      "resistance": "49.18 / 50.00",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 50,
      "lastClose": 47.41,
      "lastHigh": 50,
      "lastLow": 47.26,
      "lastChangePercent": -3.6,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "invalidCondition": "跌破47.26或连续两日站不回49.18",
      "predictionScore": 3,
      "predictionLabel": "高位回落",
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
      "status": "窄幅横盘，股票不买",
      "reason": "9月8日涨0.47%、收4.24，全天位于4.22-4.26窄区间。",
      "buyTrigger": "本账户不买股票；放量站稳4.26并回踩4.24不破，只作为通信基金的板块确认，不下单。",
      "avoidReason": "尚未有效突破且账户不买股票；9月9日明确不买。",
      "risk": "跌破4.22后可能继续走弱。",
      "support": "4.22 / 4.18",
      "resistance": "4.26 / 4.30",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 4.23,
      "lastClose": 4.24,
      "lastHigh": 4.26,
      "lastLow": 4.22,
      "lastChangePercent": 0.47,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "invalidCondition": "跌破4.22或继续弱于沪指",
      "predictionScore": 5,
      "predictionLabel": "窄幅震荡",
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
      "status": "小幅反弹，与159608重叠",
      "reason": "9月8日涨0.73%、收45.59，盘中45.95未站稳；组合已有159608资源暴露。",
      "buyTrigger": "本账户不买股票；站稳45.95并回踩45.28不破，只作为稀有金属基金的板块确认，不下单。",
      "avoidReason": "已有同类基金敞口且账户不买股票；9月9日明确不买。",
      "risk": "跌破45.28可能回测更低平台。",
      "support": "45.28 / 44.50",
      "resistance": "45.95 / 46.50",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 45.5,
      "lastClose": 45.59,
      "lastHigh": 45.95,
      "lastLow": 45.28,
      "lastChangePercent": 0.73,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "invalidCondition": "跌破45.28或锂矿板块转弱",
      "predictionScore": 5,
      "predictionLabel": "弱反弹",
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
      "status": "科技回落，股票不买",
      "reason": "9月8日跌2.09%、收121.52，接近日低121.50；科创50同步跌1.52%。",
      "buyTrigger": "本账户不买股票；重新站稳124.44并回踩124.12不破，只作为半导体基金的板块确认，不下单。",
      "avoidReason": "科技板块当日承压且账户不买股票；9月9日明确不买。",
      "risk": "跌破121.50可能继续扩大回撤。",
      "support": "121.50 / 120.00",
      "resistance": "124.12 / 124.44",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 124.25,
      "lastClose": 121.52,
      "lastHigh": 124.44,
      "lastLow": 121.5,
      "lastChangePercent": -2.09,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "invalidCondition": "跌破121.50或半导体板块继续走弱",
      "predictionScore": 3,
      "predictionLabel": "科技回落",
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
      "status": "冲高回落，基金暂不买",
      "reason": "9月8日跌0.36%、收0.561，盘中高点0.565未站稳。",
      "buyTrigger": "先有基金真实卖出资金；重新站稳0.565并回踩0.561不破、午后强于沪指时最多评估1手。9月9日不买。",
      "avoidReason": "低于0.565、没有真实卖出资金或相对沪指继续走弱时都不买。",
      "risk": "跌破0.558后可能继续测试更低平台。",
      "support": "0.558 / 0.552",
      "resistance": "0.565 / 0.570",
      "lastTradeDate": "2026-09-08",
      "lastOpen": 0.563,
      "lastClose": 0.561,
      "lastHigh": 0.565,
      "lastLow": 0.558,
      "lastChangePercent": -0.36,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-09-08 15:00后",
      "invalidCondition": "跌破0.558或连续两日弱于沪指",
      "predictionScore": 4,
      "predictionLabel": "冲高回落",
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
      "status": "9月7日净值已披露，运行时接口失败",
      "reason": "9月7日单位净值1.5155、单日涨1.20%；开放式基金不提供盘中K线，自有代理当前返回501失败态。",
      "buyTrigger": "运行时真实净值接口恢复，且连续两个披露日跑赢沪深300和恒生科技，并先有基金真实卖出资金后再评估定投。",
      "avoidReason": "接口未恢复、相对收益未确认或没有真实卖出资金时不买。",
      "risk": "净值披露有时滞，且港股科技当日继续下跌。",
      "support": "按净值披露，不设盘中支撑",
      "resistance": "按净值披露，不设盘中压力",
      "lastTradeDate": "2026-09-07",
      "lastOpen": null,
      "lastClose": 1.5155,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": 1.2,
      "lastSource": "东方财富基金历史净值，2026-09-07；运行时/api/fund为失败态",
      "invalidCondition": "连续两个披露日跑输基准或真实净值接口继续失败",
      "predictionScore": 4,
      "predictionLabel": "等待净值接口恢复",
      "expectedDirection": "暂无盘中判断",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "A股指数分化，农业与油气强、科技承压",
      "source": "中国经济网 / 上海证券报",
      "publishTime": "2026-09-08 16:30:00+08:00",
      "summary": "已确认事实：上证+0.20%、深成指-0.52%、创业板-1.15%、科创50-1.52%，沪深两市成交约1.96万亿元；农业、油气居前，半导体等科技方向靠后。基于事实的判断：风格切换不支持9月9日追科技。",
      "relatedStocks": [
        "159740",
        "512710",
        "159241",
        "688981"
      ],
      "sector": "过去24小时 / 全市场 / 风格切换",
      "relation": "market",
      "url": "https://finance.ce.cn/stock/gsgdbd/202609/t20260908_3200835.shtml"
    },
    {
      "title": "恒生科技收跌1.61%，159740同步走弱",
      "source": "每日经济新闻 / 自有代理",
      "publishTime": "2026-09-08 16:11:17+08:00",
      "summary": "已确认事实：恒生指数跌0.38%、恒生科技跌1.61%，159740跌1.42%、收0.554。基于事实的判断：港股科技仍未止跌，0.552是下一交易日第一风控线。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981"
      ],
      "sector": "过去24小时 / 港股科技 / 持仓风险",
      "relation": "risk",
      "url": "https://www.nbd.com.cn/articles/2026-09-08/4575769.html"
    },
    {
      "title": "军工与航空航天强于双创指数",
      "source": "自有代理真实收盘",
      "publishTime": "2026-09-08 15:36:00+08:00",
      "summary": "已确认事实：512710涨2.06%、收于日高0.645；159241涨1.70%、收1.075，均明显强于创业板与科创50。基于事实的判断：强项只上移保护线，不在满仓状态追涨。",
      "relatedStocks": [
        "512710",
        "159241"
      ],
      "sector": "过去24小时 / 持仓 / 军工 / 航空航天",
      "relation": "holding",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SH512710,SZ159241"
    },
    {
      "title": "中东冲突推升油价，亚洲股市与美股期指承压",
      "source": "AP",
      "publishTime": "2026-09-08 13:49:45+08:00",
      "summary": "已确认事实：AP称中东冲突升温，布伦特原油早盘涨1.4%至98.40美元，亚洲股市和美股期指走弱。基于事实的判断：能源通胀与地缘风险不支持9月9日追高估值资产。",
      "relatedStocks": [
        "159740",
        "688981",
        "164701",
        "161226"
      ],
      "sector": "过去24小时 / 全球市场 / 油价 / 地缘",
      "relation": "risk",
      "url": "https://apnews.com/article/d3d6157a534584985987f828a940cffa"
    },
    {
      "title": "贵金属短线震荡，164701仍贴近日低",
      "source": "中国银行 / 自有代理",
      "publishTime": "2026-09-08 15:40:00+08:00",
      "summary": "已确认事实：中国银行9月8日金市观察称，上一交易日国际现货黄金跌0.58%、上金所现货黄金跌1.69%；164701当日收1.703、日低1.701。基于事实的判断：贵金属中长期叙事不能替代1.700风控线。",
      "relatedStocks": [
        "164701",
        "161226"
      ],
      "sector": "过去24小时 / 贵金属 / 持仓风险",
      "relation": "risk",
      "url": "https://www.boc.cn/fimarkets/fm7/202609/t20260908_25691098.html"
    },
    {
      "title": "161226最新可比同日静态溢价约7.2%",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-09-08 18:00:00+08:00",
      "summary": "已确认事实：9月7日场内收1.941、单位净值1.8110，净值跌1.77%，申购暂停，同日静态溢价约7.2%；9月8日净值尚未披露。基于事实的判断：不跨日计算同日溢价，最新同日值超过8%才执行溢价减仓。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "白银 / 持仓风险",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10"
    },
    {
      "title": "005827净值反弹，运行时基金接口仍失败",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-09-08 18:00:00+08:00",
      "summary": "已确认事实：005827于9月7日单位净值1.5155、单日涨1.20%；自有代理/api/fund仍返回501。基于事实的判断：只展示已披露净值，不提供盘中方向或K线。",
      "relatedStocks": [
        "005827"
      ],
      "sector": "开放式基金",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10"
    }
  ],
  "reasoning": [
    {
      "title": "同日价格与净值才构成LOF溢价",
      "basis": "161226在9月7日场内收1.941、净值1.8110，同日静态溢价约7.2%。",
      "inference": "9月8日净值尚未披露，跨日计算会把基础资产变化混进溢价。",
      "conclusion": "9月9日只在最新同日溢价高于8%或价格跌破1.937后减仓。",
      "invalidCondition": "同日溢价降到3%以内且站稳1.963。"
    },
    {
      "title": "上证红盘不等于科技转强",
      "basis": "上证涨0.20%，但创业板跌1.15%、科创50跌1.52%、恒生科技跌1.61%。",
      "inference": "指数结构明显分化，科技风险偏好仍弱。",
      "conclusion": "159740偏防守，688981只作温度计。",
      "invalidCondition": "双创与恒生科技同步放量修复。"
    },
    {
      "title": "强势持仓只上移保护线",
      "basis": "512710与159241分别涨2.06%和1.70%，均接近日内高点。",
      "inference": "满仓时追强会抬高组合回撤敏感度。",
      "conclusion": "持有但不加；用0.629和1.051做移动保护。",
      "invalidCondition": "仓位已形成现金缓冲且板块完成回踩确认。"
    },
    {
      "title": "外部风险看油价与地缘",
      "basis": "AP报道布伦特油价上涨、亚洲股市与美股期指走弱。",
      "inference": "能源通胀与地缘压力会压制高估值资产。",
      "conclusion": "9月9日不追科技，不把油气上涨外推为全市场利好。",
      "invalidCondition": "油价回落且全球风险资产同步修复。"
    },
    {
      "title": "失败态优先于主观评分",
      "basis": "005827运行时接口返回501，但9月7日静态净值已披露。",
      "inference": "静态净值只能作为日期明确的历史事实，不能伪装成盘中行情。",
      "conclusion": "开放式基金继续显示失败态且不画盘中K线。",
      "invalidCondition": "自有代理返回带真实日期的有效净值数据。"
    }
  ],
  "invalidConditions": [
    "161226最新同日静态溢价降到3%以内且站稳1.963：取消溢价减仓；重新高于8%则恢复减仓优先级。",
    "159740站稳0.560、164701站稳1.715且对应指数/金价转强：取消对应减仓计划。",
    "512710跌破0.625或159241跌破1.045：强势持有逻辑失效，提高防守等级。",
    "161725低于0.565、没有基金真实卖出资金或相对沪指继续走弱：取消任何基金买入评估。",
    "网页行情出现0价、旧日期、失败态或来源校验失败：取消基于网页价格的执行，只看券商App真实行情。"
  ],
  "cancelPlan": [
    "竞价或开盘一分钟的瞬时跌破不直接成交；需要15/30分钟确认的标的必须等确认。",
    "指数高开不直接追；先看持仓自身是否站稳9月8日高点。",
    "卖出没有真实成交前，不把资金写入观察池买入计划；即使成交，9月9日也先留现金。",
    "任何真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "同日价格与净值才能算LOF溢价",
      "basis": "161226场内1.941与9月7日净值1.8110对应约7.2%静态溢价。",
      "inference": "跨日期比较会把基础资产涨跌混入溢价，得到错误结论。",
      "conclusion": "每天用同一日期重新计算。",
      "invalidCondition": "无。"
    },
    {
      "title": "指数分化时看持仓自身",
      "basis": "上证上涨，双创与恒生科技下跌。",
      "inference": "宽基、成长与具体资产可以同时背离。",
      "conclusion": "执行线以持仓自身真实OHLC为准。",
      "invalidCondition": "主要指数与持仓重新同步。"
    },
    {
      "title": "强势不等于可追",
      "basis": "512710和159241强势，601208与688981却明显回落。",
      "inference": "同一主题内部也会分化，且账户新增买入只考虑基金。",
      "conclusion": "强势基金只持有不追，股票只作温度计。",
      "invalidCondition": "仓位和风险预算已重新留出安全余量。"
    },
    {
      "title": "事实与判断分栏",
      "basis": "收盘、基金净值和新闻是事实；9月9日评分与方向是判断。",
      "inference": "混写会让主观评分看起来像实时行情。",
      "conclusion": "评分不替代真实价格和真实时间戳。",
      "invalidCondition": "无。"
    },
    {
      "title": "先恢复流动性，再谈机会",
      "basis": "组合接近满仓且板块分化扩大。",
      "inference": "没有现金缓冲时，新机会可能不可执行。",
      "conclusion": "卖出资金先留现金，不做当日切换。",
      "invalidCondition": "仓位与风险预算已形成独立缓冲。"
    }
  ],
  "nextWatch": [
    "9月9日9:25：记录竞价，不把竞价当成交指令。",
    "9:30：核对网页真实时间戳；0价、旧日期或失败时切换券商App。",
    "10:00：复核161226最新同日净值与溢价，再看159740的0.552、164701的1.700。",
    "10:30：复核159608、562350、512710、159241的移动保护线。",
    "13:30：观察科技修复与贵金属反馈，只作持仓确认，9月9日仍不买。",
    "15:00后：记录真实收盘与基金净值披露，复盘触发是否有效。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "47.26 / 46.50",
      "resistance": "49.18 / 50.00"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.22 / 4.18",
      "resistance": "4.26 / 4.30"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "45.28 / 44.50",
      "resistance": "45.95 / 46.50"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "121.50 / 120.00",
      "resistance": "124.12 / 124.44"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.558 / 0.552",
      "resistance": "0.565 / 0.570"
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
      "name": "本次运行：自有代理13个场内标的",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SZ159740,SZ164701,SH512710,SZ161226,SZ159608,SZ159241,SH562350,SZ002090,SH601208,SH600050,SZ002466,SH688981,SZ161725",
      "note": "2026-09-08 18:00复核：批量请求曾504，分组/逐只请求13/13返回非零9月8日真实收盘；逐只日K日期与收盘一致。"
    },
    {
      "name": "自有代理基金端点失败态",
      "url": "https://daily-briefing-blue.vercel.app/api/fund?symbol=OF005827",
      "note": "2026-09-08运行时仍返回HTTP 501；页面必须显示失败态，开放式基金不提供盘中K线。"
    },
    {
      "name": "中国经济网：9月8日A股收盘",
      "url": "https://finance.ce.cn/stock/gsgdbd/202609/t20260908_3200835.shtml",
      "note": "上证+0.20%、深成指-0.52%、创业板-1.15%；农业与油气较强，半导体等科技方向承压。"
    },
    {
      "name": "每日经济新闻：9月8日港股收盘",
      "url": "https://www.nbd.com.cn/articles/2026-09-08/4575769.html",
      "note": "恒生指数-0.38%，恒生科技-1.61%。"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=10",
      "note": "9月7日单位净值1.8110、日跌1.77%、暂停申购；相对同日场内收盘1.941的静态溢价约7.2%。"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=10",
      "note": "9月7日单位净值1.5155、单日涨1.20%；运行时开放式基金接口仍失败。"
    },
    {
      "name": "中国银行：9月8日金市观察",
      "url": "https://www.boc.cn/fimarkets/fm7/202609/t20260908_25691098.html",
      "note": "上一交易日国际现货黄金跌0.58%至4404.3美元/盎司，上金所现货黄金跌1.69%至949.6元/克。"
    },
    {
      "name": "AP：9月8日油价与全球风险",
      "url": "https://apnews.com/article/d3d6157a534584985987f828a940cffa",
      "note": "中东冲突升温，布伦特原油早盘涨1.4%至98.40美元，亚洲股市与美股期指走弱。"
    }
  ]
};
