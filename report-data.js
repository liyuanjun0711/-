window.MARKET_BRIEFING_DATA = {
  "date": "2026-08-07",
  "portfolioVersion": "portfolio-2026-08-07-premarket-v1",
  "time": "2026-08-07盘前完成执行版。13个场内标的为8月6日真实收盘，新浪、腾讯报价与腾讯日K逐只核对；161226和005827已更新到8月6日披露净值。盘中只接受自有代理或券商App的新真实时间戳。",
  "lastUpdated": "2026-08-07 08:55 北京时间",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "oneLine": "结论：8月7日不买。先处理161226约18.3%的静态溢价，再处理159740、562350和002090的相对弱势；164701和159608只持有、不追涨。8月6日上证涨0.57%，但深成指、创业板分别跌0.24%、0.55%，恒生科技跌2.28%；隔夜美股小幅回落、油价与美债收益率上行，风险偏好没有形成共振。所有卖出资金先留现金。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "高溢价第一顺位",
      "title": "国投白银LOF 161226：约18.3%静态溢价仍先降风险",
      "conclusion": "8月6日场内收2.035；8月6日单位净值1.7204，静态溢价约18.3%，申购仍暂停。",
      "action": "10:00复核最新可验证净值：静态溢价仍高于10%先卖2手；低于2.000运行15分钟再卖2手；反抽2.085-2.108站不稳再卖2手。不补仓。",
      "trigger": "卖出触发：溢价>10%、2.000下方连续15分钟或2.085-2.108反抽失败。没触发：持有但不加。失效：最新净值对应溢价降到5%以内并站稳2.108。",
      "reason": "白银方向和LOF溢价是两套风险；基础资产上涨也可能被溢价压缩抵消。仅供个人复盘参考。"
    },
    {
      "type": "弱势持仓减法",
      "title": "159740 / 562350 / 002090：破位或反抽失败才减",
      "conclusion": "8月6日159740跌2.28%、562350跌0.53%、002090跌1.15%；上证上涨时三者仍偏弱。",
      "action": "159740低于0.600运行30分钟卖5手；562350低于1.105运行30分钟卖2手；002090到10:00仍站不回9.52卖1手，跌破9.26再卖1手。",
      "trigger": "没触发：继续持有、不补。取消减仓：分别放量站稳0.616、1.132、9.56并恢复板块相对强度。",
      "reason": "弱势已连续两日，不再只看市场故事；卖出资金全部留现金。仅供个人复盘参考。"
    },
    {
      "type": "贵金属与资源持有",
      "title": "164701 / 159608：涨幅已出现，只守回撤线",
      "conclusion": "8月6日黄金LOF涨2.03%、稀有金属ETF涨0.91%，但两者均出现盘中冲高回落。",
      "action": "164701低于1.654运行30分钟卖2手，跌破1.627再卖2手；159608低于1.092运行30分钟卖2手。未触发持有，均不追涨。",
      "trigger": "取消减仓：164701重新站稳1.699；159608站稳1.121。失效：分别跌破1.627、1.049。",
      "reason": "资源和贵金属仍有强度，但组合接近满仓，先管理回撤，不扩大同类敞口。仅供个人复盘参考。"
    },
    {
      "type": "军工持有不追",
      "title": "512710 / 159241：一个横盘、一个续强，守低点",
      "conclusion": "8月6日512710跌0.16%、159241涨0.29%；航空航天相对更强，但都在近五日高位区。",
      "action": "512710低于0.612运行30分钟卖2手；159241低于1.017运行30分钟卖1手。未触发持有，不加仓。",
      "trigger": "站稳0.624或1.039只取消减仓，不转为买入；跌破0.601或1.010提高防守。",
      "reason": "持仓仍有承接，但满仓账户不在短线高位加速段追单。仅供个人复盘参考。"
    },
    {
      "type": "观察池全部不买",
      "title": "东材三日急涨，半导体与白酒转弱：8月7日都不买",
      "conclusion": "601208近三日由32.50升至41.76；688981跌1.04%，161725跌0.71%，板块轮动和个股波动都偏快。",
      "action": "8月7日观察池全部不买。即使先有卖出资金，也先作为现金缓冲；个股仅作板块温度计，不下单。",
      "trigger": "未来基金买入评估必须同时满足：先有真实卖出资金、基金自身完成回踩并重新站稳压力位、市场和板块相对强度未恶化。任一条件缺失都不买。",
      "reason": "接近满仓时，追三日急涨或抄连续走弱都不是可执行的风险预算。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 8月7日9:25只记录真实竞价：161226是否接近2.000、159740是否低于0.600、562350是否低于1.105。",
    "2. 9:30-10:00不买；网页必须出现8月7日新时间戳且状态为实时/延迟，静态8月6日收盘不能当盘中报价。",
    "3. 10:00先复核161226最新披露净值与静态溢价；仍高于10%卖2手，低于2.000运行15分钟再卖2手。",
    "4. 同时检查159740的0.600、562350的1.105、002090的9.52/9.26；只按计划手数减，不临时放大。",
    "5. 10:30再看164701的1.654、159608的1.092、512710的0.612、159241的1.017；未触发就持有。",
    "6. 所有卖出资金先留现金。8月7日观察池不买，股票只作板块温度计。",
    "7. 行情接口返回0价、旧日期、失败态或无真实时间戳时，以券商App真实报价为准；网页不据此执行。"
  ],
  "tradePlan": [
    {
      "title": "指数收红不等于成长继续走强",
      "basis": "8月6日上证涨0.57%，但深成指跌0.24%、创业板跌0.55%，科创50涨0.45%；沪深成交约2.53万亿元。",
      "inference": "大盘与成长分化，成交活跃但风险偏好没有全面扩散。",
      "conclusion": "不把上证上涨外推成所有持仓转强；弱势品种继续按自身价格处理。",
      "invalidCondition": "深成指与创业板放量收复8月6日高点。"
    },
    {
      "title": "港股科技继续弱于A股",
      "basis": "8月6日恒生指数跌1.49%、恒生科技跌2.28%，159740同步跌2.28%。",
      "inference": "港股风险偏好仍弱，不能用科创50上涨替代159740自身确认。",
      "conclusion": "159740以0.600为第一风控线，站回0.616只取消减仓。",
      "invalidCondition": "恒生科技与159740同步放量站回8月6日高点。"
    },
    {
      "title": "贵金属强度与LOF溢价分开处理",
      "basis": "164701涨2.03%；161226场内收2.035，对8月6日净值1.7204仍有约18.3%静态溢价。",
      "inference": "黄金/白银基础资产走强，不代表高溢价LOF的风险下降。",
      "conclusion": "164701只守回撤线；161226仍按溢价优先减风险。",
      "invalidCondition": "161226最新披露净值对应溢价降到5%以内。"
    },
    {
      "title": "隔夜外部环境转为轻度风险压制",
      "basis": "8月6日标普500跌0.2%、纳指跌0.1%、道指跌0.9%；AP称油价与美债收益率上行。",
      "inference": "油价和利率同时上行，对成长估值和风险偏好都不是增量利好。",
      "conclusion": "不追科技高开；资源与贵金属只按自身价格确认。",
      "invalidCondition": "油价、长端收益率同步回落且美股重新站上纪录高位。"
    },
    {
      "title": "连续相对弱势优先恢复流动性",
      "basis": "562350连续两日下跌，002090连续三日回落；8月6日低点分别为1.105、9.26。",
      "inference": "强弱差持续时，先削减弱项比等待故事兑现更符合满仓约束。",
      "conclusion": "用1.105、9.52/9.26作为8月7日执行线。",
      "invalidCondition": "分别放量站稳1.132、9.56并恢复板块相对强度。"
    }
  ],
  "noTradeList": [
    "不把8月6日收盘快照写成8月7日实时行情；盘中必须等待自有代理或券商App的新时间戳。",
    "不补161226。按8月6日场内2.035与净值1.7204计算，静态溢价约18.3%，申购仍暂停。",
    "不追三日急涨的东材科技；股票观察池只作板块温度计，不下单。",
    "不抄159740、562350、002090、161725的弱势回落；先等自身价格确认。",
    "不把计划卖出当成可用资金，不自动下单。"
  ],
  "holdings": [
    {
      "name": "恒生科技ETF大成",
      "code": "159740",
      "symbol": "SZ159740",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "港股科技",
      "support": "0.600 / 0.594",
      "resistance": "0.609 / 0.616",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 0.609,
      "lastClose": 0.601,
      "lastHigh": 0.61,
      "lastLow": 0.6,
      "lastChangePercent": -2.28,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "action": "低于0.600运行30分钟卖5手；10:00前反抽仍站不回0.609卖3手；不加仓",
      "invalidCondition": "放量站稳0.616并保持到10:30，同时恒生科技转强",
      "predictionScore": 3,
      "predictionLabel": "港股科技再走弱",
      "expectedDirection": "震荡偏弱",
      "reason": "8月6日跌2.28%，与恒生科技跌幅一致，并收在日内低位附近。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.654 / 1.627",
      "resistance": "1.699 / 1.790",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 1.699,
      "lastClose": 1.66,
      "lastHigh": 1.699,
      "lastLow": 1.654,
      "lastChangePercent": 2.03,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "action": "低于1.654运行30分钟卖2手；跌破1.627再卖2手；不追涨",
      "invalidCondition": "跌破1.627且外部油价、美元或实际利率继续压制贵金属",
      "predictionScore": 6,
      "predictionLabel": "高开回落仍偏强",
      "expectedDirection": "高波动震荡",
      "reason": "8月6日涨2.03%，但由1.699高点回落至1.660，先看1.654承接。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.612 / 0.601",
      "resistance": "0.623 / 0.624",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 0.618,
      "lastClose": 0.62,
      "lastHigh": 0.623,
      "lastLow": 0.612,
      "lastChangePercent": -0.16,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "action": "低于0.612运行30分钟卖2手；守住0.612持有；不加仓",
      "invalidCondition": "跌破0.601或军工板块相对强度消失",
      "predictionScore": 5,
      "predictionLabel": "高位横盘",
      "expectedDirection": "震荡",
      "reason": "8月6日小跌0.16%，仍守住0.612，但0.623-0.624压力未过。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "2.000 / 1.910",
      "resistance": "2.085 / 2.108",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 2.085,
      "lastClose": 2.035,
      "lastHigh": 2.108,
      "lastLow": 2,
      "lastChangePercent": -0.34,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "action": "静态溢价仍>10%先卖2手；低于2.000运行15分钟再卖2手；2.085-2.108反抽失败再卖2手",
      "invalidCondition": "最新披露净值对应溢价降到5%以内，且场内站稳2.108",
      "predictionScore": 3,
      "predictionLabel": "高溢价优先减",
      "expectedDirection": "高波动偏弱",
      "reason": "8月6日场内收2.035，对当日净值1.7204静态溢价约18.3%，申购仍暂停。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "1.092 / 1.049",
      "resistance": "1.121 / 1.150",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 1.119,
      "lastClose": 1.105,
      "lastHigh": 1.121,
      "lastLow": 1.092,
      "lastChangePercent": 0.91,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "action": "低于1.092运行30分钟卖2手；守住1.092持有；不追涨",
      "invalidCondition": "跌破1.049且稀有金属板块同步转弱",
      "predictionScore": 7,
      "predictionLabel": "强势但冲高回落",
      "expectedDirection": "震荡偏强",
      "reason": "连续三日上涨，8月6日涨0.91%，但从1.121回落，追高性价比下降。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "1.017 / 1.010",
      "resistance": "1.039 / 1.050",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 1.028,
      "lastClose": 1.035,
      "lastHigh": 1.039,
      "lastLow": 1.017,
      "lastChangePercent": 0.29,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "action": "低于1.017运行30分钟卖1手；守住1.017持有；不加仓",
      "invalidCondition": "跌破1.010且航空航天板块同步转弱",
      "predictionScore": 6,
      "predictionLabel": "连续抬高",
      "expectedDirection": "震荡偏强",
      "reason": "连续四日上涨并收于1.035，但1.039附近仍需确认承接。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.105 / 1.100",
      "resistance": "1.123 / 1.132",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 1.123,
      "lastClose": 1.117,
      "lastHigh": 1.123,
      "lastLow": 1.105,
      "lastChangePercent": -0.53,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "action": "低于1.105运行30分钟卖2手；10:00仍站不回1.123卖1手；不加仓",
      "invalidCondition": "放量站稳1.132且电力板块恢复相对强度",
      "predictionScore": 3,
      "predictionLabel": "连续走弱",
      "expectedDirection": "震荡偏弱",
      "reason": "连续两日下跌，8月6日收1.117并逼近五日低点1.100。",
      "riskLevel": "高"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电网设备",
      "support": "9.26 / 9.10",
      "resistance": "9.52 / 9.56",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 9.52,
      "lastClose": 9.43,
      "lastHigh": 9.56,
      "lastLow": 9.26,
      "lastChangePercent": -1.15,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "action": "10:00仍站不回9.52卖1手；跌破9.26再卖1手；不补仓",
      "invalidCondition": "放量站稳9.56且电网设备板块同步转强",
      "predictionScore": 2,
      "predictionLabel": "连续破位",
      "expectedDirection": "偏弱",
      "reason": "连续三日回落，8月6日跌1.15%并创近五日低点9.26。",
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
      "status": "三日急涨，股票不买",
      "reason": "8月4日至6日收盘由35.75、39.33升至41.76，8月6日再涨6.18%，短线波动和回撤风险都高。",
      "buyTrigger": "本账户不买股票；站稳43.10且回踩39.33不破，只作为新材料基金的板块确认，不下单。",
      "avoidReason": "三日急涨后追单路径风险高；8月7日明确不买。",
      "risk": "跌破39.33可能回测35.70；冲高未过43.10也可能形成兑现。",
      "support": "39.33 / 35.70",
      "resistance": "43.10 / 43.26",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 39.33,
      "lastClose": 41.76,
      "lastHigh": 43.1,
      "lastLow": 39.33,
      "lastChangePercent": 6.18,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "invalidCondition": "跌破39.33或连续两日站不稳41.76",
      "predictionScore": 5,
      "predictionLabel": "急涨后高波动",
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
      "status": "连续回落，股票不买",
      "reason": "8月6日收4.38、跌0.23%，连续三日回落，仍弱于上证。",
      "buyTrigger": "本账户不买股票；放量站稳4.47并回踩4.43不破，只作为通信基金的板块确认，不下单。",
      "avoidReason": "板块相对弱、尚未收复4.47；8月7日明确不买。",
      "risk": "跌破4.35后可能继续测试更低平台。",
      "support": "4.35 / 4.30",
      "resistance": "4.43 / 4.47",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 4.38,
      "lastClose": 4.38,
      "lastHigh": 4.43,
      "lastLow": 4.35,
      "lastChangePercent": -0.23,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "invalidCondition": "跌破4.35或继续弱于沪指",
      "predictionScore": 3,
      "predictionLabel": "相对走弱",
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
      "status": "冲高回落，与159608重叠",
      "reason": "8月6日跌1.24%、收47.18，盘中47.90未站稳；组合已有159608资源暴露。",
      "buyTrigger": "本账户不买股票；站稳47.90并回踩46.50不破，只作为稀有金属基金的板块确认，不下单。",
      "avoidReason": "已有同类基金敞口且个股转弱；8月7日明确不买。",
      "risk": "跌破46.50后可能回测45.30。",
      "support": "46.50 / 45.30",
      "resistance": "47.90 / 48.00",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 47.49,
      "lastClose": 47.18,
      "lastHigh": 47.9,
      "lastLow": 46.5,
      "lastChangePercent": -1.24,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "invalidCondition": "跌破46.50或锂矿板块相对强度消失",
      "predictionScore": 4,
      "predictionLabel": "冲高回落",
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
      "status": "反弹后回落，股票不买",
      "reason": "8月6日跌1.04%、收124.15，未站稳126.99；近五日仍是高波动修复。",
      "buyTrigger": "本账户不买股票；站稳127.55并回踩121.88不破，只作为半导体基金的板块确认，不下单。",
      "avoidReason": "反弹未突破近五日压力且波动高；8月7日明确不买。",
      "risk": "跌破121.88后可能回测120.36和115.21。",
      "support": "121.88 / 120.36",
      "resistance": "126.99 / 127.55",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 122,
      "lastClose": 124.15,
      "lastHigh": 126.99,
      "lastLow": 121.88,
      "lastChangePercent": -1.04,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "invalidCondition": "跌破120.36或半导体板块反弹失败",
      "predictionScore": 4,
      "predictionLabel": "修复遇阻",
      "expectedDirection": "高波动震荡",
      "riskLevel": "高"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "status": "连续走弱，基金暂不买",
      "reason": "8月6日跌0.71%、收0.560，连续四日回落并靠近0.557低点。",
      "buyTrigger": "先有161226真实卖出资金；重新站稳0.575并回踩0.565不破、午后强于沪指时最多评估1手。8月7日不买。",
      "avoidReason": "低于0.565、没有真实卖出资金或相对沪指继续走弱时都不买。",
      "risk": "跌破0.557后可能继续回吐7月31日启动涨幅。",
      "support": "0.557 / 0.550",
      "resistance": "0.565 / 0.575",
      "lastTradeDate": "2026-08-06",
      "lastOpen": 0.564,
      "lastClose": 0.56,
      "lastHigh": 0.565,
      "lastLow": 0.557,
      "lastChangePercent": -0.71,
      "lastSource": "新浪与腾讯真实收盘、腾讯日K交叉核对，2026-08-06 15:00后",
      "invalidCondition": "跌破0.557或连续两日弱于沪指",
      "predictionScore": 2,
      "predictionLabel": "连续回吐",
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
      "status": "8月6日净值已披露，运行时接口失败",
      "reason": "8月6日单位净值1.5268、单日跌0.27%；开放式基金不提供盘中K线，网页代理当前返回失败态。",
      "buyTrigger": "运行时真实净值接口恢复，且连续两个披露日跑赢沪深300和恒生科技，并先有161226真实卖出资金后再评估定投。",
      "avoidReason": "接口未恢复、相对收益未确认或没有真实卖出资金时不买。",
      "risk": "净值披露有时滞，港股科技与消费风格仍可能继续分化。",
      "support": "按净值披露，不设盘中支撑",
      "resistance": "按净值披露，不设盘中压力",
      "lastTradeDate": "2026-08-06",
      "lastOpen": null,
      "lastClose": 1.5268,
      "lastHigh": null,
      "lastLow": null,
      "lastChangePercent": -0.27,
      "lastSource": "东方财富基金历史净值，2026-08-06；运行时/api/fund为失败态",
      "invalidCondition": "连续两个披露日跑输基准或真实净值接口继续失败",
      "predictionScore": 4,
      "predictionLabel": "等待净值验证",
      "expectedDirection": "暂无盘中判断",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "A股指数分化，沪深成交约2.53万亿元",
      "source": "新浪 / 腾讯真实指数行情",
      "publishTime": "2026-08-06 16:14:00+08:00",
      "summary": "已确认事实：上证涨0.57%，深成指跌0.24%，创业板跌0.55%，科创50涨0.45%。基于事实的判断：成交活跃但风险偏好未全面扩散，8月7日不追高。",
      "relatedStocks": [
        "512710",
        "159241",
        "159740",
        "159608"
      ],
      "sector": "过去24小时 / 全市场",
      "relation": "market",
      "url": "https://qt.gtimg.cn/q=sh000001,sz399001,sz399006,sh000688"
    },
    {
      "title": "恒生科技跌2.28%，港股风险偏好继续走弱",
      "source": "腾讯真实指数行情",
      "publishTime": "2026-08-06 16:08:56+08:00",
      "summary": "已确认事实：恒生指数跌1.49%、恒生科技跌2.28%，159740同步跌2.28%。基于事实的判断：港股科技需要自身止跌确认，不能照搬A股科创50强度。",
      "relatedStocks": [
        "159740",
        "005827",
        "688981"
      ],
      "sector": "过去24小时 / 港股科技",
      "relation": "risk",
      "url": "https://qt.gtimg.cn/q=hkHSI,hkHSTECH"
    },
    {
      "title": "161226对8月6日净值静态溢价约18.3%",
      "source": "东方财富基金 / 新浪与腾讯行情",
      "publishTime": "2026-08-06",
      "summary": "已确认事实：8月6日场内收2.035、单位净值1.7204，申购暂停。基于事实的判断：静态溢价仍是持仓第一风险，不因白银或场内价格上涨而消失。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "白银 / 持仓风险",
      "relation": "holding",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=5"
    },
    {
      "title": "美股小幅回落，油价与美债收益率上行",
      "source": "AP",
      "publishTime": "2026-08-07 05:08:37+08:00",
      "summary": "已确认事实：8月6日标普500跌0.2%、纳指跌0.1%、道指跌0.9%；AP称油价上涨、美国国债收益率上行。基于事实的判断：外部环境对成长估值形成轻度压制，不支持A股科技高开追涨。",
      "relatedStocks": [
        "159740",
        "164701",
        "161226",
        "688981"
      ],
      "sector": "过去24小时 / 全球市场 / 油价 / 利率",
      "relation": "risk",
      "url": "https://apnews.com/article/2f4f2638cb8430bb7c8e5d59a7b50731"
    },
    {
      "title": "贵金属与资源持仓偏强，弱势品种继续回落",
      "source": "新浪 / 腾讯真实收盘",
      "publishTime": "2026-08-06 16:28:00+08:00",
      "summary": "已确认事实：164701涨2.03%、159608涨0.91%，同时562350跌0.53%、002090跌1.15%。基于事实的判断：持仓内部强弱差扩大，8月7日只做弱项减法，不追强项。",
      "relatedStocks": [
        "164701",
        "159608",
        "562350",
        "002090"
      ],
      "sector": "持仓 / 贵金属 / 资源 / 电力",
      "relation": "watch",
      "url": "https://qt.gtimg.cn/q=sz164701,sz159608,sh562350,sz002090"
    },
    {
      "title": "东材科技三日急涨，中芯与锂业回落",
      "source": "新浪 / 腾讯真实收盘",
      "publishTime": "2026-08-06 16:28:00+08:00",
      "summary": "已确认事实：601208涨6.18%，近三日收盘由32.50升至41.76；688981跌1.04%、002466跌1.24%。基于事实的判断：个股只作板块温度计，8月7日不买股票。",
      "relatedStocks": [
        "601208",
        "688981",
        "002466"
      ],
      "sector": "观察池 / 新材料 / 半导体 / 锂矿",
      "relation": "watch",
      "url": "https://qt.gtimg.cn/q=sh601208,sh688981,sz002466"
    },
    {
      "title": "005827净值小跌，运行时基金接口仍失败",
      "source": "东方财富基金 / 自有代理",
      "publishTime": "2026-08-06",
      "summary": "已确认事实：005827于8月6日单位净值1.5268、单日跌0.27%；运行时开放式基金接口仍返回失败态。基于事实的判断：只展示已披露净值，不提供盘中方向或假K线。",
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
      "title": "溢价风险优先于白银方向",
      "basis": "161226场内收2.035、8月6日净值1.7204，静态溢价约18.3%。",
      "inference": "接近满仓时，高溢价是可单独压缩的风险，优先级高于对白银方向的判断。",
      "conclusion": "溢价仍高于10%先卖2手；2.000作为价格风控线。",
      "invalidCondition": "最新披露净值对应溢价降到5%以内并站稳2.108。"
    },
    {
      "title": "指数分化时只看持仓自身价格",
      "basis": "上证涨0.57%，但深成指、创业板分别跌0.24%、0.55%。",
      "inference": "指数表面收红不能覆盖成长和港股科技走弱。",
      "conclusion": "159740、562350、002090按自身支撑与反抽位执行。",
      "invalidCondition": "成长指数与对应持仓同步放量收复8月6日高点。"
    },
    {
      "title": "强势品种不追，弱势品种不抄",
      "basis": "164701、159608偏强；159740、562350、002090偏弱。",
      "inference": "满仓状态追强或抄弱都会放大路径风险。",
      "conclusion": "强项只守回撤线，弱项只按触发减仓，8月7日无买入。",
      "invalidCondition": "仓位已通过真实卖出形成现金缓冲且基金完成二次确认。"
    },
    {
      "title": "A股与港股科技分开看",
      "basis": "科创50涨0.45%，恒生科技跌2.28%，159740同步下跌。",
      "inference": "跨市场驱动不同，不能用A股科技表现替代港股确认。",
      "conclusion": "159740守0.600；站稳0.616只取消减仓。",
      "invalidCondition": "恒生科技与159740同步放量转强。"
    },
    {
      "title": "失败态优先于预测",
      "basis": "盘前代理曾收到东方财富0价包；005827运行时接口仍返回501。",
      "inference": "零价、旧日期或失败包都不能包装成实时。",
      "conclusion": "零价包必须拒绝并回退；开放式基金继续显示失败态且不画盘中K线。",
      "invalidCondition": "自有代理返回非零真实价格、正确日期并通过日K校验。"
    }
  ],
  "invalidConditions": [
    "161226最新披露净值对应溢价降到5%以内且站稳2.108：重新评估溢价减仓优先级。",
    "159740站稳0.616、562350站稳1.132、002090站稳9.56且对应板块转强：取消对应减仓计划。",
    "深成指、创业板与恒生科技同步放量收复8月6日高点：下调成长防守等级，但仍不追涨。",
    "161725低于0.565、没有161226真实卖出资金或相对沪指继续走弱：取消任何消费基金买入评估。",
    "网页行情出现0价、旧日期、失败态或来源校验失败：取消基于网页价格的执行，只看券商App真实行情。"
  ],
  "cancelPlan": [
    "竞价或开盘一分钟的瞬时跌破不直接成交；需要15/30分钟确认的标的必须等确认。",
    "上证高开不直接追；先看深成指、创业板与恒生科技是否同步修复。",
    "卖出没有真实成交前，不把资金写入观察池买入计划；即使成交，8月7日也先留现金。",
    "任何真实行情接口出现0价、旧日期或失败时，不画假线、不显示假价、不把缓存写成实时。"
  ],
  "learningFramework": [
    {
      "title": "指数红盘也要看内部结构",
      "basis": "上证涨0.57%，深成指和创业板下跌，恒生科技跌2.28%。",
      "inference": "大盘红盘不代表成长、港股和持仓同步转强。",
      "conclusion": "先看跨指数与持仓自身确认，不用单一指数替代全市场。",
      "invalidCondition": "主要指数连续两日同步放量上行。"
    },
    {
      "title": "LOF看净值与场内价两条线",
      "basis": "161226场内2.035，8月6日净值1.7204。",
      "inference": "基础资产方向正确，也可能因溢价回落而亏损。",
      "conclusion": "白银方向不替代溢价风控。",
      "invalidCondition": "溢价长期回到5%以内。"
    },
    {
      "title": "急涨不等于可买",
      "basis": "601208近三日从32.50升至41.76，8月6日高点43.10。",
      "inference": "连续急涨后的追单路径风险高，且本账户买入只考虑基金。",
      "conclusion": "股票只作板块温度计，8月7日不买。",
      "invalidCondition": "无；账户规则不买个股。"
    },
    {
      "title": "事实与判断分栏",
      "basis": "收盘、基金净值和新闻是事实；8月7日评分与方向是判断。",
      "inference": "把两者混写会让主观评分看起来像实时行情。",
      "conclusion": "评分只表达预期，不替代真实价格。",
      "invalidCondition": "无。"
    },
    {
      "title": "先恢复流动性，再谈机会",
      "basis": "接近满仓且多个标的处于高波动。",
      "inference": "没有现金缓冲时，任何新机会都可能不可执行。",
      "conclusion": "卖出资金先留现金，观察池延后。",
      "invalidCondition": "仓位与风险预算已重新留出安全余量。"
    }
  ],
  "nextWatch": [
    "8月7日9:25：记录竞价，不把竞价当成交指令。",
    "9:30：核对网页真实时间戳；0价、旧日期或失败时切换券商App。",
    "10:00：先执行161226溢价与2.000检查，再看159740、562350、002090。",
    "10:30：复核164701、159608、512710、159241是否守住回撤线。",
    "13:30：观察东材、中芯、白酒的承接，只作板块确认，8月7日仍不买。",
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
      "support": "39.33 / 35.70",
      "resistance": "43.10 / 43.26"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.35 / 4.30",
      "resistance": "4.43 / 4.47"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "46.50 / 45.30",
      "resistance": "47.90 / 48.00"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "121.88 / 120.36",
      "resistance": "126.99 / 127.55"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.557 / 0.550",
      "resistance": "0.565 / 0.575"
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
      "name": "自有行情代理：运行时状态核验",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbols=SZ159740,SZ164701,SH512710,SZ161226,SZ159608,SZ159241,SH562350,SZ002090,SH601208,SH600050,SZ002466,SH688981,SZ161725",
      "note": "2026-08-07 08:48批量请求超时；盘前部分东方财富单标的返回0价包，本次已增加零价拒绝与真实来源回退；OF005827运行时仍返回501"
    },
    {
      "name": "新浪与腾讯：13个场内标的收盘交叉核对",
      "url": "https://qt.gtimg.cn/q=sz159740,sz164701,sh512710,sz161226,sz159608,sz159241,sh562350,sz002090,sh601208,sh600050,sz002466,sh688981,sz161725",
      "note": "两套报价均为2026-08-06真实OHLC；腾讯日K最后一根日期和收盘价逐只一致"
    },
    {
      "name": "腾讯：主要指数与港股指数收盘",
      "url": "https://qt.gtimg.cn/q=sh000001,sz399001,sz399006,sh000688,hkHSI,hkHSTECH",
      "note": "2026-08-06上证+0.57%、深成指-0.24%、创业板-0.55%、科创50+0.45%、恒生-1.49%、恒生科技-2.28%"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=5",
      "note": "2026-08-06单位净值1.7204、日涨3.40%，申购暂停；相对场内收盘静态溢价约18.3%"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=5",
      "note": "2026-08-06单位净值1.5268、单日跌0.27%；运行时开放式基金接口仍失败"
    },
    {
      "name": "AP：2026-08-06美股、油价与美债",
      "url": "https://apnews.com/article/2f4f2638cb8430bb7c8e5d59a7b50731",
      "note": "收盘稿于2026-08-07 05:08北京时间发布；标普-0.2%、纳指-0.1%、道指-0.9%，油价与美债收益率上行"
    }
  ]
};
