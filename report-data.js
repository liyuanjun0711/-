window.MARKET_BRIEFING_DATA = {
  "date": "2026-09-01",
  "portfolioVersion": "portfolio-2026-09-01-premarket-v1",
  "time": "2026-09-01盘前准备版。13个场内标的均为8月31日真实收盘，自有代理报价与日K逐只核对一致；161226和005827净值均更新到8月31日。持仓名单沿用网页上次确认清单，盘中只接受自有代理或券商App的新真实时间戳。",
  "lastUpdated": "2026-08-31 22:28 北京时间",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "oneLine": "结论：9月1日不买。8月31日A股普涨但贵金属显著回撤，先看164701能否守住1.708、562350能否守住1.081；161226静态溢价已压缩到约5.4%，改为监控溢价再扩张或1.940破位。512710和159241偏强只持有、不追涨；所有卖出资金先留现金。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "第一屏结论",
      "title": "9月1日不买：贵金属与电力先做防守",
      "conclusion": "8月31日164701跌3.26%、161226跌3.36%、562350跌0.55%；A股指数上涨不等于这三项风险已经修复。",
      "action": "164701低于1.708运行30分钟卖2手；562350低于1.081运行30分钟卖2手。161226只有静态溢价重新高于8%或低于1.940运行15分钟才卖2手。",
      "trigger": "没触发：继续持有、不补。卖出资金全部留现金。失效：分别站稳1.766、1.100，或161226溢价降到3%以内并站稳2.000。",
      "reason": "组合接近满仓，先处理已经出现的价格风险，不用指数红盘替代持仓确认。仅供个人复盘参考。"
    },
    {
      "type": "溢价结论更新",
      "title": "161226：静态溢价约5.4%，旧的10%以上结论已失效",
      "conclusion": "8月31日场内收1.984、单位净值1.8828，静态溢价约5.4%；净值跌1.06%，场内跌3.36%，溢价已明显压缩，申购仍暂停。",
      "action": "不按旧的高溢价方案机械卖出。溢价重新高于8%卖2手；低于1.940运行15分钟卖2手；未触发持有但不补仓。",
      "trigger": "取消减仓：溢价降到3%以内且场内站稳2.000。风险升级：溢价再扩张、净值继续下跌或场内跌破1.940。",
      "reason": "白银方向、基金净值和场内溢价是三条线，必须使用同一日期重新计算。仅供个人复盘参考。"
    },
    {
      "type": "强势持仓管理",
      "title": "512710 / 159241：连续走强，只做移动止损",
      "conclusion": "512710涨0.80%、连续三日上行；159241涨1.06%、连续四日抬高，均收在日内高位附近。",
      "action": "512710低于0.617运行30分钟卖2手；159241低于1.025运行30分钟卖1手。未触发持有，不加仓。",
      "trigger": "站稳0.629或1.047只上移保护线，不转为买入；跌破0.609或1.017提高防守等级。",
      "reason": "强势可以持有，但满仓状态不在连续上涨后追加风险。仅供个人复盘参考。"
    },
    {
      "type": "震荡持仓管理",
      "title": "159740 / 159608：一个横盘，一个高波动",
      "conclusion": "159740收0.574、涨0.17%，恒生科技涨0.32%；159608收1.111、跌0.63%，仍在近一周1.062-1.138高波动区间。",
      "action": "159740低于0.564运行30分钟卖3手；159608低于1.085运行30分钟卖2手。未触发持有，不补仓。",
      "trigger": "取消减仓：分别站稳0.580、1.125并保持板块相对强度。失效：分别跌破0.564、1.074。",
      "reason": "港股科技尚未形成突破，资源基金也没有重新站上区间上沿。仅供个人复盘参考。"
    },
    {
      "type": "观察池不买",
      "title": "股票只作温度计；161725和005827也未触发买入",
      "conclusion": "601208与688981继续走强，但本账户不买股票；161725跌0.91%，005827净值仅涨0.13%且运行时基金接口仍失败。",
      "action": "9月1日观察池全部不买。即使先有基金卖出成交，资金也先留现金，不当天切换。",
      "trigger": "未来只评估基金：先有真实卖出资金、基金自身站稳触发位、板块与宽基同步确认。任一条件缺失都不买。",
      "reason": "价格强不等于风险预算允许买入；接口失败也不能用静态净值伪装盘中行情。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 9月1日9:25只记录真实竞价：164701是否接近1.708、562350是否接近1.081、161226是否接近1.940。",
    "2. 9:30-10:00不买；网页必须出现9月1日新时间戳且状态为实时/延迟，8月31日静态收盘不能当盘中价。",
    "3. 10:00先复核161226最新净值与同日溢价；只有溢价>8%或1.940下方运行15分钟才卖2手。",
    "4. 同时检查164701的1.708、562350的1.081；触发后只按计划手数减，不临时扩大。",
    "5. 10:30检查159740的0.564、159608的1.085、512710的0.617、159241的1.025；未触发继续持有。",
    "6. 002090只观察9.33/9.50，不新增股票买卖指令；观察池股票同样不下单。",
    "7. 所有卖出资金先留现金。行情出现0价、旧日期、失败态或无真实时间戳时，以券商App真实报价为准。"
  ],
  "tradePlan": [
    {
      "title": "指数普涨，但结构偏科技而非贵金属",
      "basis": "8月31日上证涨0.86%、深成指涨0.44%、创业板涨0.42%、科创50涨1.34%；沪深京三市成交约2.13万亿元。",
      "inference": "广度与成交改善，但领涨集中在科技成长，不能外推为贵金属和电力同步转强。",
      "conclusion": "512710、159241偏强持有；164701、161226、562350仍按自身价格防守。",
      "invalidCondition": "贵金属与电力基金放量收复8月31日高点。"
    },
    {
      "title": "贵金属出现真实风险释放",
      "basis": "164701跌3.26%；161226场内跌3.36%、净值跌1.06%；A股贵金属板块位居跌幅前列。",
      "inference": "场内基金下跌既包含基础资产压力，也包含LOF溢价压缩。",
      "conclusion": "164701看1.708，161226同时看1.940与同日溢价，不抄底。",
      "invalidCondition": "贵金属价格与两只基金同步站回8月31日高点。"
    },
    {
      "title": "A股与港股科技继续分开看",
      "basis": "科创50涨1.34%，恒生科技仅涨0.32%；159740涨0.17%，尚未站上近一周0.580压力。",
      "inference": "A股科技更强，港股科技仍是区间修复。",
      "conclusion": "159740只持有，不因为A股科技强势追买。",
      "invalidCondition": "恒生科技与159740同步放量突破区间上沿。"
    },
    {
      "title": "外部油价与利率风险压制估值",
      "basis": "AP 8月31日报道，美军打击伊朗火箭发射设施后WTI上涨约3.6%至86.40美元，美股期指小幅下跌；美国两年期国债收益率升至4.35%。",
      "inference": "油价与利率同时上行，对成长估值和风险偏好都形成外部压力。",
      "conclusion": "9月1日不追科技高开，盘中只按真实价格处理已有持仓。",
      "invalidCondition": "油价与短端收益率同步回落，且美股风险资产重新走强。"
    },
    {
      "title": "先留现金，不做当日切换",
      "basis": "组合接近满仓，且基金强弱分化扩大。",
      "inference": "卖出后立即买入会把风险从一个板块转移到另一个板块，无法恢复流动性。",
      "conclusion": "9月1日任何卖出资金都先留现金，观察池当天不买。",
      "invalidCondition": "仓位已形成独立现金缓冲且基金完成二次确认。"
    }
  ],
  "noTradeList": [
    "不把8月31日收盘快照写成9月1日实时行情；盘中必须等待自有代理或券商App的新时间戳。",
    "不沿用161226旧的18.3%溢价结论；8月31日同日静态溢价约5.4%，必须重新计算。",
    "不抄底164701、161226或562350；只在真实触发后按计划减仓。",
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
      "support": "0.564 / 0.570",
      "resistance": "0.576 / 0.580",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 0.569,
      "lastClose": 0.574,
      "lastHigh": 0.576,
      "lastLow": 0.564,
      "lastChangePercent": 0.17,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "action": "低于0.564运行30分钟卖3手；守住0.564持有；不加仓",
      "invalidCondition": "放量站稳0.580并保持到10:30，同时恒生科技转强",
      "predictionScore": 5,
      "predictionLabel": "区间内小幅修复",
      "expectedDirection": "震荡",
      "reason": "8月31日涨0.17%，与恒生科技+0.32%方向一致，但近一周仍未突破0.580。",
      "riskLevel": "中"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.708 / 1.700",
      "resistance": "1.732 / 1.766",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 1.728,
      "lastClose": 1.722,
      "lastHigh": 1.732,
      "lastLow": 1.708,
      "lastChangePercent": -3.26,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "action": "低于1.708运行30分钟卖2手；10:00仍站不回1.732再卖2手；不补仓",
      "invalidCondition": "站稳1.766且贵金属价格同步修复",
      "predictionScore": 3,
      "predictionLabel": "跳空回落待确认",
      "expectedDirection": "震荡偏弱",
      "reason": "8月31日跌3.26%，从前一收盘1.780跳空至1.728开盘，收盘未收复开盘价。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.617 / 0.609",
      "resistance": "0.629 / 0.635",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 0.619,
      "lastClose": 0.627,
      "lastHigh": 0.629,
      "lastLow": 0.617,
      "lastChangePercent": 0.8,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "action": "低于0.617运行30分钟卖2手；守住0.617持有；不追涨",
      "invalidCondition": "跌破0.609或军工板块相对强度消失",
      "predictionScore": 7,
      "predictionLabel": "连续抬高",
      "expectedDirection": "震荡偏强",
      "reason": "连续三日上涨，8月31日收0.627并接近日内高点0.629。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.940 / 1.900",
      "resistance": "1.993 / 2.000",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 1.94,
      "lastClose": 1.984,
      "lastHigh": 1.993,
      "lastLow": 1.94,
      "lastChangePercent": -3.36,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "action": "静态溢价重新>8%卖2手；低于1.940运行15分钟卖2手；未触发持有但不补仓",
      "invalidCondition": "同日溢价降到3%以内且场内站稳2.000",
      "predictionScore": 4,
      "predictionLabel": "溢价已压缩仍高波动",
      "expectedDirection": "高波动震荡",
      "reason": "8月31日场内收1.984、净值1.8828，静态溢价约5.4%；申购仍暂停。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "1.085 / 1.074",
      "resistance": "1.112 / 1.125",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 1.097,
      "lastClose": 1.111,
      "lastHigh": 1.112,
      "lastLow": 1.085,
      "lastChangePercent": -0.63,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "action": "低于1.085运行30分钟卖2手；守住1.085持有；不追涨",
      "invalidCondition": "跌破1.074且稀有金属板块同步转弱",
      "predictionScore": 5,
      "predictionLabel": "区间高波动",
      "expectedDirection": "高波动震荡",
      "reason": "8月31日从1.085回升到1.111，但近一周仍在1.062-1.138区间内。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "1.025 / 1.017",
      "resistance": "1.047 / 1.050",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 1.029,
      "lastClose": 1.044,
      "lastHigh": 1.047,
      "lastLow": 1.025,
      "lastChangePercent": 1.06,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "action": "低于1.025运行30分钟卖1手；守住1.025持有；不加仓",
      "invalidCondition": "跌破1.017且航空航天板块同步转弱",
      "predictionScore": 7,
      "predictionLabel": "连续走强",
      "expectedDirection": "震荡偏强",
      "reason": "连续四日上涨，8月31日收1.044并接近日内高点1.047。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.081 / 1.076",
      "resistance": "1.092 / 1.100",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 1.092,
      "lastClose": 1.089,
      "lastHigh": 1.092,
      "lastLow": 1.081,
      "lastChangePercent": -0.55,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "action": "低于1.081运行30分钟卖2手；10:00仍站不回1.092卖1手；不加仓",
      "invalidCondition": "放量站稳1.100且电力板块恢复相对强度",
      "predictionScore": 3,
      "predictionLabel": "连续回落",
      "expectedDirection": "震荡偏弱",
      "reason": "连续三日回落，8月31日收1.089并靠近近一周低位1.076-1.081。",
      "riskLevel": "高"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "9.33 / 9.11",
      "resistance": "9.50 / 9.60",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 9.4,
      "lastClose": 9.46,
      "lastHigh": 9.5,
      "lastLow": 9.33,
      "lastChangePercent": 0.53,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "action": "仅观察9.33/9.50，不新增股票买卖指令，不补仓",
      "invalidCondition": "跌破9.33或电网设备板块相对转弱",
      "predictionScore": 5,
      "predictionLabel": "窄幅修复",
      "expectedDirection": "震荡",
      "reason": "8月31日涨0.53%，但仍未收复8月27日9.57收盘与9.60高点。",
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
      "status": "连续走强，股票不买",
      "reason": "8月27日至31日收盘由49.10升至52.19，8月31日再涨1.77%，短线仍处高波动区。",
      "buyTrigger": "本账户不买股票；站稳52.89并回踩50.09不破，只作为新材料基金的板块确认，不下单。",
      "avoidReason": "连续上涨后追单路径风险高；9月1日明确不买。",
      "risk": "跌破50.09可能回测49.10或45.15。",
      "support": "50.09 / 49.10",
      "resistance": "52.89 / 55.00",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 50.1,
      "lastClose": 52.19,
      "lastHigh": 52.89,
      "lastLow": 50.09,
      "lastChangePercent": 1.77,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "invalidCondition": "跌破50.09或连续两日站不稳52.19",
      "predictionScore": 6,
      "predictionLabel": "强势高波动",
      "expectedDirection": "高波动震荡",
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
      "reason": "8月31日涨0.47%、收4.30，近一周仍在4.21-4.34窄区间。",
      "buyTrigger": "本账户不买股票；放量站稳4.34并回踩4.30不破，只作为通信基金的板块确认，不下单。",
      "avoidReason": "尚未突破区间且账户不买股票；9月1日明确不买。",
      "risk": "跌破4.23后可能回测4.21。",
      "support": "4.23 / 4.21",
      "resistance": "4.30 / 4.34",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 4.28,
      "lastClose": 4.3,
      "lastHigh": 4.3,
      "lastLow": 4.23,
      "lastChangePercent": 0.47,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "invalidCondition": "跌破4.23或继续弱于沪指",
      "predictionScore": 5,
      "predictionLabel": "区间震荡",
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
      "status": "高波动，与159608重叠",
      "reason": "8月31日跌0.40%、收49.90，盘中50.73未站稳；组合已有159608资源暴露。",
      "buyTrigger": "本账户不买股票；站稳50.98并回踩49.10不破，只作为稀有金属基金的板块确认，不下单。",
      "avoidReason": "已有同类基金敞口且个股波动高；9月1日明确不买。",
      "risk": "跌破48.81后可能回测47.55或46.37。",
      "support": "48.81 / 47.55",
      "resistance": "50.73 / 50.98",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 50.2,
      "lastClose": 49.9,
      "lastHigh": 50.73,
      "lastLow": 48.81,
      "lastChangePercent": -0.4,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "invalidCondition": "跌破48.81或锂矿板块转弱",
      "predictionScore": 5,
      "predictionLabel": "高位震荡",
      "expectedDirection": "高波动震荡",
      "riskLevel": "高"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "status": "科技强势，股票不买",
      "reason": "8月31日涨2.24%、收128.70，科创50涨1.34%，个股重新接近129.89高点。",
      "buyTrigger": "本账户不买股票；站稳129.89并回踩125.88不破，只作为半导体基金的板块确认，不下单。",
      "avoidReason": "接近区间高点且账户不买股票；9月1日明确不买。",
      "risk": "跌破122.75可能回测120.00。",
      "support": "125.88 / 122.75",
      "resistance": "129.89 / 130.00",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 123,
      "lastClose": 128.7,
      "lastHigh": 129.89,
      "lastLow": 122.75,
      "lastChangePercent": 2.24,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "invalidCondition": "跌破122.75或半导体板块反弹失败",
      "predictionScore": 7,
      "predictionLabel": "科技强势修复",
      "expectedDirection": "高波动偏强",
      "riskLevel": "高"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "status": "区间偏弱，基金暂不买",
      "reason": "8月31日跌0.91%、收0.544，仍未站上近一周0.552高点。",
      "buyTrigger": "先有基金真实卖出资金；重新站稳0.552并回踩0.548不破、午后强于沪指时最多评估1手。9月1日不买。",
      "avoidReason": "低于0.548、没有真实卖出资金或相对沪指继续走弱时都不买。",
      "risk": "跌破0.540后可能继续测试更低平台。",
      "support": "0.543 / 0.540",
      "resistance": "0.548 / 0.552",
      "lastTradeDate": "2026-08-31",
      "lastOpen": 0.548,
      "lastClose": 0.544,
      "lastHigh": 0.552,
      "lastLow": 0.543,
      "lastChangePercent": -0.91,
      "lastSource": "自有代理真实收盘与日K交叉核对，2026-08-31 15:00后",
      "invalidCondition": "跌破0.540或连续两日弱于沪指",
      "predictionScore": 3,
      "predictionLabel": "区间偏弱",
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
      "status": "8月31日净值已披露，运行时接口失败",
      "reason": "8月31日单位净值1.5191、单日涨0.13%；开放式基金不提供盘中K线，自有代理当前返回501失败态。",
      "buyTrigger": "运行时真实净值接口恢复，且连续两个披露日跑赢沪深300和恒生科技，并先有基金真实卖出资金后再评估定投。",
      "avoidReason": "接口未恢复、相对收益未确认或没有真实卖出资金时不买。",
      "risk": "净值披露有时滞，且港股科技与消费风格仍可能继续分化。",
      "support": "按净值披露，不设盘中支撑",
      "resistance": "按净值披露，不设盘中压力",
      "lastTradeDate": "2026-08-31",
      "lastOpen": null,
      "lastClose": 1.5191,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": 0.13,
      "lastSource": "东方财富基金历史净值，2026-08-31；运行时/api/fund为失败态",
      "invalidCondition": "连续两个披露日跑输基准或真实净值接口继续失败",
      "predictionScore": 4,
      "predictionLabel": "等待净值接口恢复",
      "expectedDirection": "暂无盘中判断",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "A股四大主要指数收涨，科技成长领先",
      "source": "自有代理 / 每日经济新闻",
      "publishTime": "2026-08-31 15:40:07+08:00",
      "summary": "已确认事实：上证+0.86%、深成指+0.44%、创业板+0.42%、科创50+1.34%，沪深京三市成交约2.13万亿元；科技成长方向较强。基于事实的判断：指数环境改善，但不能覆盖贵金属与电力持仓的单独风险。",
      "relatedStocks": [
        "512710",
        "159241",
        "688981",
        "601208"
      ],
      "sector": "过去24小时 / 全市场 / 科技",
      "relation": "market",
      "url": "https://www.nbd.com.cn/articles/2026-08-31/4567303.html"
    },
    {
      "title": "恒生科技涨0.32%，159740仍在区间内",
      "source": "新华社 / 自有代理",
      "publishTime": "2026-08-31 18:24:45+08:00",
      "summary": "已确认事实：恒生指数跌0.07%、恒生科技涨0.32%，159740涨0.17%、收0.574。基于事实的判断：港股科技是小幅修复，不足以触发追买。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981"
      ],
      "sector": "过去24小时 / 港股科技",
      "relation": "market",
      "url": "https://www.news.cn/gangao/20260831/c761605281774db0bd61126ee6c9caf1/c.html"
    },
    {
      "title": "161226静态溢价压缩到约5.4%",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-08-31 22:00:00+08:00",
      "summary": "已确认事实：8月31日场内收1.984、单位净值1.8828，净值跌1.06%，申购暂停，静态溢价约5.4%。基于事实的判断：旧的18.3%结论已失效，转为监控溢价再扩张与1.940破位。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "白银 / 持仓风险",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=5"
    },
    {
      "title": "贵金属板块下挫，164701与161226同步承压",
      "source": "每日经济新闻 / 自有代理",
      "publishTime": "2026-08-31 15:40:07+08:00",
      "summary": "已确认事实：A股贵金属方向位居跌幅前列，164701跌3.26%、161226跌3.36%。基于事实的判断：9月1日不抄底，分别看1.708和1.940真实支撑。",
      "relatedStocks": [
        "164701",
        "161226",
        "159608"
      ],
      "sector": "过去24小时 / 贵金属 / 持仓风险",
      "relation": "risk",
      "url": "https://www.nbd.com.cn/articles/2026-08-31/4567303.html"
    },
    {
      "title": "油价跳涨、美国短端收益率上行，美股期指偏弱",
      "source": "AP",
      "publishTime": "2026-08-31 20:28:00+08:00",
      "summary": "已确认事实：AP称美军打击伊朗火箭发射设施后WTI上涨约3.6%至86.40美元，标普和道指期货跌0.2%、纳指期货跌0.1%，美国两年期收益率升至4.35%。基于事实的判断：外部风险不支持9月1日追科技高开。",
      "relatedStocks": [
        "159740",
        "164701",
        "161226",
        "688981"
      ],
      "sector": "过去24小时 / 全球市场 / 油价 / 利率",
      "relation": "risk",
      "url": "https://apnews.com/article/00f872327d65e5330598054a234dc25a"
    },
    {
      "title": "军工与航空航天基金延续强势，电力基金继续回落",
      "source": "自有代理真实收盘",
      "publishTime": "2026-08-31 16:12:00+08:00",
      "summary": "已确认事实：512710涨0.80%、159241涨1.06%，562350跌0.55%并连续三日回落。基于事实的判断：强项只做移动止损，弱项以1.081为第一风控线。",
      "relatedStocks": [
        "512710",
        "159241",
        "562350"
      ],
      "sector": "持仓 / 军工 / 航空航天 / 电力",
      "relation": "holding",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SH512710,SZ159241,SH562350"
    },
    {
      "title": "005827净值微涨，运行时开放式基金接口仍失败",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-08-31 22:00:00+08:00",
      "summary": "已确认事实：005827于8月31日单位净值1.5191、单日涨0.13%；自有代理/api/fund仍返回501。基于事实的判断：只展示已披露净值，不提供盘中方向或K线。",
      "relatedStocks": [
        "005827"
      ],
      "sector": "开放式基金",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=5"
    }
  ],
  "reasoning": [
    {
      "title": "旧结论必须随同日净值重算",
      "basis": "161226场内1.984、8月31日净值1.8828，静态溢价约5.4%。",
      "inference": "相对8月6日约18.3%的旧溢价已经大幅压缩，继续照搬会造成错误动作。",
      "conclusion": "只在溢价重新高于8%或价格跌破1.940后减仓。",
      "invalidCondition": "同日溢价降到3%以内并站稳2.000。"
    },
    {
      "title": "指数强不替代板块强",
      "basis": "主要指数收涨，但贵金属板块下跌，164701与161226跌幅均超过3%。",
      "inference": "宽基风险偏好与具体资产方向可以同时背离。",
      "conclusion": "贵金属按自身价格防守，不因沪指上涨取消风控。",
      "invalidCondition": "贵金属价格与基金同步收复8月31日高点。"
    },
    {
      "title": "强势持仓只上移保护线",
      "basis": "512710、159241连续走强并接近日内高点。",
      "inference": "满仓时追强会抬高组合回撤敏感度。",
      "conclusion": "持有但不加；用0.617和1.025做移动保护。",
      "invalidCondition": "仓位已形成现金缓冲且板块完成回踩确认。"
    },
    {
      "title": "外部风险看油价和短端利率",
      "basis": "AP报道油价上涨、美股期指偏弱、两年期美债收益率升至4.35%。",
      "inference": "通胀与利率压力会压制高估值资产，盘初追科技风险收益比下降。",
      "conclusion": "9月1日不追科技高开。",
      "invalidCondition": "油价与短端收益率同步回落。"
    },
    {
      "title": "失败态优先于主观评分",
      "basis": "005827运行时接口返回501，但8月31日静态净值已披露。",
      "inference": "静态净值只能作为日期明确的历史事实，不能伪装成盘中行情。",
      "conclusion": "开放式基金继续显示失败态且不画盘中K线。",
      "invalidCondition": "自有代理返回带真实日期的有效净值数据。"
    }
  ],
  "invalidConditions": [
    "161226同日静态溢价降到3%以内且站稳2.000：取消溢价减仓；重新高于8%则恢复减仓优先级。",
    "164701站稳1.766、562350站稳1.100、159740站稳0.580且对应板块转强：取消对应减仓计划。",
    "512710跌破0.609或159241跌破1.017：强势持有逻辑失效，提高防守等级。",
    "161725低于0.548、没有基金真实卖出资金或相对沪指继续走弱：取消任何基金买入评估。",
    "网页行情出现0价、旧日期、失败态或来源校验失败：取消基于网页价格的执行，只看券商App真实行情。"
  ],
  "cancelPlan": [
    "竞价或开盘一分钟的瞬时跌破不直接成交；需要15/30分钟确认的标的必须等确认。",
    "指数高开不直接追；先看持仓自身是否站稳8月31日高点。",
    "卖出没有真实成交前，不把资金写入观察池买入计划；即使成交，9月1日也先留现金。",
    "任何真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "同日价格与净值才能算LOF溢价",
      "basis": "161226场内1.984与8月31日净值1.8828对应约5.4%静态溢价。",
      "inference": "跨日期比较会把基础资产涨跌混入溢价，得到错误结论。",
      "conclusion": "每天用同一日期重新计算。",
      "invalidCondition": "无。"
    },
    {
      "title": "宽基上涨也可能有持仓风险",
      "basis": "A股主要指数收涨，贵金属基金却跌逾3%。",
      "inference": "指数暴露与资产类别暴露不同。",
      "conclusion": "执行线以持仓自身OHLC为准。",
      "invalidCondition": "持仓与宽基重新同步。"
    },
    {
      "title": "强势不等于可追",
      "basis": "512710和159241连续上涨，601208和688981也处于高位。",
      "inference": "连续上涨后的路径风险上升，且账户新增买入只考虑基金。",
      "conclusion": "基金只持有不追，股票只作温度计。",
      "invalidCondition": "仓位和风险预算已重新留出安全余量。"
    },
    {
      "title": "事实与判断分栏",
      "basis": "收盘、基金净值和新闻是事实；9月1日评分与方向是判断。",
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
    "9月1日9:25：记录竞价，不把竞价当成交指令。",
    "9:30：核对网页真实时间戳；0价、旧日期或失败时切换券商App。",
    "10:00：复核161226同日净值与溢价，再看164701的1.708、562350的1.081。",
    "10:30：复核159740、159608、512710、159241的移动保护线。",
    "13:30：观察科技强度和贵金属修复，只作持仓确认，9月1日仍不买。",
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
      "support": "50.09 / 49.10",
      "resistance": "52.89 / 55.00"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.23 / 4.21",
      "resistance": "4.30 / 4.34"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "48.81 / 47.55",
      "resistance": "50.73 / 50.98"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "125.88 / 122.75",
      "resistance": "129.89 / 130.00"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.543 / 0.540",
      "resistance": "0.548 / 0.552"
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
      "name": "自有行情代理：13个场内标的批量收盘",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SZ159740,SZ164701,SH512710,SZ161226,SZ159608,SZ159241,SH562350,SZ002090,SH601208,SH600050,SZ002466,SH688981,SZ161725",
      "note": "2026-08-31 22:10复核，13/13返回非零8月31日真实收盘；逐只日K日期与收盘一致；OF005827运行时仍返回501"
    },
    {
      "name": "腾讯：主要指数与港股指数收盘",
      "url": "https://qt.gtimg.cn/q=sh000001,sz399001,sz399006,sh000688,hkHSI,hkHSTECH",
      "note": "2026-08-31上证+0.86%、深成指+0.44%、创业板+0.42%、科创50+1.34%、恒生-0.07%、恒生科技+0.32%"
    },
    {
      "name": "每日经济新闻：8月31日A股收盘结构",
      "url": "https://www.nbd.com.cn/articles/2026-08-31/4567303.html",
      "note": "主要指数收涨，沪深京三市成交超过2.1万亿元；科技成长较强、贵金属承压"
    },
    {
      "name": "新华社：8月31日港股收盘",
      "url": "https://www.news.cn/gangao/20260831/c761605281774db0bd61126ee6c9caf1/c.html",
      "note": "恒生指数-0.07%，恒生科技+0.32%，主板成交3148.19亿港元"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=5",
      "note": "2026-08-31单位净值1.8828、日跌1.06%、暂停申购；相对场内1.984静态溢价约5.4%"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=5",
      "note": "2026-08-31单位净值1.5191、单日涨0.13%；运行时开放式基金接口仍失败"
    },
    {
      "name": "AP：8月31日油价、地缘与美股期指",
      "url": "https://apnews.com/article/00f872327d65e5330598054a234dc25a",
      "note": "美军打击伊朗火箭发射设施后WTI约+3.6%至86.40美元；美股期指小跌，两年期美债收益率升至4.35%"
    }
  ]
};
