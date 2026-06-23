window.MARKET_BRIEFING_DATA = {
  "date": "2026-06-24",
  "portfolioVersion": "portfolio-2026-06-23-v1",
  "time": "6月24日盘前版本，基于2026-06-23收盘日K和6月23日晚间新闻",
  "lastUpdated": "2026-06-23 21:35 北京时间",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "oneLine": "昨天风险资产同步杀估值，今天不急着买回；贵金属、稀土、军工先按跌破位防守，金智科技只看9.30能否守住。仅供个人复盘参考。",
  "tradeDecision": [
    {
      "type": "先防守",
      "title": "全账户买入计划暂停一档",
      "conclusion": "6月23日A股、港股科技、有色和贵金属一起回撤，6月24日先不抢反弹。",
      "action": "开盘前把所有新增买入降为观察；只有先卖出释放资金，且目标站回压力位，才允许买1手计划内标的。",
      "trigger": "沪指守4100、创业板不再放量下跌、恒生科技止跌，三项至少满足两项才恢复买入评估。",
      "reason": "6月23日上证跌1.37%、创业板跌3.84%，持仓里的161226、159608、512710和159740均转弱，先保留纠错空间。仅供个人复盘参考。"
    },
    {
      "type": "反抽卖",
      "title": "国投白银LOF 161226",
      "conclusion": "原2.020减仓触发已失效，改成反抽止损；低开跌穿1.878不追卖。",
      "action": "真实价格反抽到1.910-1.920且5分钟不能站稳1.920，卖1手；若直接低于1.878，等下一次反抽，不在急跌低点砍。",
      "trigger": "卖出触发1.910-1.920；跌破1.850且外盘白银继续走弱，取消日内反抽计划，改为盘后复盘。",
      "reason": "6月23日收1.889、跌5.03%，已跌破上一版1.980防守线，重点从卖高点改为控制继续下行风险。仅供个人复盘参考。"
    },
    {
      "type": "反抽卖",
      "title": "黄金LOF 164701",
      "conclusion": "跌到1.601后不再用1.690卖出计划；只等1.625-1.635弱反抽减1手。",
      "action": "真实价格回到1.625-1.635但贵金属没有同步转强，卖1手；若低开低于1.600，不追卖。",
      "trigger": "卖出触发1.625-1.635；强势站回1.650才暂停卖出；跌破1.580当天不补仓。",
      "reason": "6月23日收1.601、跌2.20%，黄金避险交易退潮，仓位处理优先于判断反弹高度。仅供个人复盘参考。"
    },
    {
      "type": "守线",
      "title": "稀有金属ETF 159608",
      "conclusion": "从强势持有改为守1.315；跌破就降风险，不做资源线加仓。",
      "action": "真实价格守住1.315只持有；跌破1.315且10分钟收不回，卖1手；反抽到1.357但放量不足，不追买。",
      "trigger": "防守线1.315；反抽压力1.357；重新转强要收回1.380。",
      "reason": "6月23日收1.325、跌6.95%，有色和稀土从强主线变成高波动风险点。仅供个人复盘参考。"
    },
    {
      "type": "持有",
      "title": "金智科技 002090",
      "conclusion": "逆势上涨是组合里少数强项，但不追高加仓。",
      "action": "真实价格守住9.30继续持有；跌破9.30且电力自动化板块转弱，卖1手或降低风险；站上10.00再看是否保留强势仓。",
      "trigger": "支撑9.30 / 9.20；压力9.78 / 10.00；低于9.20计划转防守。",
      "reason": "6月23日收9.71、涨4.41%，强于大盘，但账户资金紧，不因单日强势新增买入。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 开盘先看页面状态：只有显示实时行情或延迟行情且时间有效，才参考价格；失败态必须回到券商App核对。",
    "2. 6月24日默认不新增买入；先确认沪指4100、创业板和恒生科技是否止跌。",
    "3. 161226反抽到1.910-1.920且站不稳，卖1手；低于1.878不追卖。",
    "4. 164701反抽到1.625-1.635且贵金属未转强，卖1手；低于1.600不补仓。",
    "5. 159608守1.315继续拿；跌破1.315且10分钟收不回，卖1手。",
    "6. 002090守9.30继续持有；跌破9.30且板块转弱，卖1手或降低风险。",
    "7. 512710、159740、159241、562350只看支撑，不主动加仓；任何接口失败时取消价格触发。"
  ],
  "tradePlan": [
    {
      "title": "风险资产同步回撤，先把买入权限关小",
      "basis": "6月23日沪指收4106.25、跌1.37%；深成指跌3.17%；创业板指跌3.84%；港股科技同步走弱。",
      "inference": "上一版“科技强、稀土强、贵金属反抽”的环境已经变化，6月24日不能按强势行情继续扩仓。",
      "conclusion": "新增买入暂停；只有先卖出释放资金，并且目标重新站回关键压力位，才允许买1手。",
      "invalidCondition": "6月24日指数和持仓同步放量收复6月23日阴线。"
    },
    {
      "title": "贵金属从反抽减仓变成反抽止损",
      "basis": "161226在2026-06-23收1.889、跌5.03%；164701收1.601、跌2.20%。",
      "inference": "价格已经跌破上一版防守线，低位追卖容易卖在急跌尾段，但继续无条件持有也会放大波动。",
      "conclusion": "白银1.910-1.920卖1手，黄金1.625-1.635卖1手；都低开破位则不追，等反抽。",
      "invalidCondition": "贵金属放量站回白银1.920、黄金1.650并保持半小时。"
    },
    {
      "title": "稀土和军工不再追强，只做守线",
      "basis": "159608收1.325、跌6.95%；512710收0.666、跌3.34%，均从高位回落。",
      "inference": "强主线退潮后的第一天，胜率来自少亏而不是抢第一根反弹。",
      "conclusion": "159608守1.315，512710站不回0.684不买；没有卖出资金也不买。",
      "invalidCondition": "159608重新站上1.380且512710站稳0.690。"
    },
    {
      "title": "逆势强票只保留，不扩大",
      "basis": "002090收9.71、涨4.41%，强于大盘和多数持仓。",
      "inference": "强势持仓可以留，但在组合回撤日加仓会牺牲贵金属和资源线的纠错空间。",
      "conclusion": "金智科技守9.30继续持有，站上10.00再提高评分；跌破9.30降低风险。",
      "invalidCondition": "电力自动化板块放量转弱或002090跌破9.20。"
    }
  ],
  "noTradeList": [
    "不在真实行情失败时按网页价格交易。",
    "不因为6月23日大跌就抢第一根反弹。",
    "不在没有卖出资金来源时买512710、159608或观察池股票。",
    "不把主观评分当成实时行情。",
    "不把6月22日的强势行情延续到6月24日计划里。",
    "不自动下单，所有动作仅供个人复盘参考。"
  ],
  "holdings": [
    {
      "name": "恒生科技ETF大成",
      "code": "159740",
      "symbol": "SZ159740",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "港股科技",
      "support": "0.549 / 0.540",
      "resistance": "0.571 / 0.580",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 0.57,
      "lastClose": 0.551,
      "lastHigh": 0.571,
      "lastLow": 0.549,
      "lastChangePercent": -4.01,
      "lastSource": "eastmoney direct daily kline",
      "action": "弱势持有，不补仓",
      "invalidCondition": "跌破0.540且恒生科技继续下行",
      "predictionScore": 3,
      "predictionLabel": "港股科技转弱",
      "expectedDirection": "弱震荡",
      "reason": "6月23日收0.551、跌4.01%，跌破0.568后只能看修复，不补仓。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.600 / 1.580",
      "resistance": "1.625 / 1.635",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 1.628,
      "lastClose": 1.601,
      "lastHigh": 1.631,
      "lastLow": 1.6,
      "lastChangePercent": -2.2,
      "lastSource": "eastmoney direct daily kline",
      "action": "反抽1.625-1.635卖1手，低开不追卖",
      "invalidCondition": "跌破1.580后不补仓，改盘后复盘",
      "predictionScore": 3,
      "predictionLabel": "弱反抽减仓",
      "expectedDirection": "震荡偏弱",
      "reason": "黄金LOF跌到1.600附近，原1.690卖出计划失效，改为弱反抽降风险。",
      "riskLevel": "高"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.662 / 0.655",
      "resistance": "0.684 / 0.690",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 0.684,
      "lastClose": 0.666,
      "lastHigh": 0.684,
      "lastLow": 0.662,
      "lastChangePercent": -3.34,
      "lastSource": "eastmoney direct daily kline",
      "action": "不买，站回0.684后才重新评估",
      "invalidCondition": "跌破0.655或军工主线继续转弱",
      "predictionScore": 3,
      "predictionLabel": "突破失败",
      "expectedDirection": "弱震荡",
      "reason": "6月23日收0.666、跌3.34%，0.690突破确认失败。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.878 / 1.850",
      "resistance": "1.910 / 1.920",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 1.918,
      "lastClose": 1.889,
      "lastHigh": 1.92,
      "lastLow": 1.878,
      "lastChangePercent": -5.03,
      "lastSource": "eastmoney direct daily kline",
      "action": "反抽1.910-1.920卖1手，低开不追卖",
      "invalidCondition": "跌破1.850且白银外盘继续走弱",
      "predictionScore": 2,
      "predictionLabel": "破位防守",
      "expectedDirection": "弱反抽",
      "reason": "6月23日收1.889、跌5.03%，已经跌破上一版防守线。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "1.315 / 1.300",
      "resistance": "1.357 / 1.380",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 1.448,
      "lastClose": 1.325,
      "lastHigh": 1.448,
      "lastLow": 1.316,
      "lastChangePercent": -6.95,
      "lastSource": "eastmoney direct daily kline",
      "action": "守1.315持有，跌破卖1手",
      "invalidCondition": "跌破1.315且稀土永磁退潮",
      "predictionScore": 4,
      "predictionLabel": "守线观察",
      "expectedDirection": "高波动震荡",
      "reason": "6月23日高开低走，收盘接近1.315防守线，不能追强。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "1.128 / 1.115",
      "resistance": "1.167 / 1.180",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 1.156,
      "lastClose": 1.131,
      "lastHigh": 1.167,
      "lastLow": 1.128,
      "lastChangePercent": -2.75,
      "lastSource": "eastmoney direct daily kline",
      "action": "小仓持有，不加仓",
      "invalidCondition": "跌破1.128且军工主线继续走弱",
      "predictionScore": 3,
      "predictionLabel": "弱防守",
      "expectedDirection": "弱震荡",
      "reason": "航空航天ETF跟随军工回撤，先看1.128支撑。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.134 / 1.120",
      "resistance": "1.160 / 1.170",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 1.154,
      "lastClose": 1.137,
      "lastHigh": 1.16,
      "lastLow": 1.134,
      "lastChangePercent": -1.3,
      "lastSource": "eastmoney direct daily kline",
      "action": "防守持有，不加仓",
      "invalidCondition": "跌破1.120且防守板块继续走弱",
      "predictionScore": 4,
      "predictionLabel": "弱防守",
      "expectedDirection": "低位震荡",
      "reason": "电力ETF继续走弱，但跌幅小于成长线，先守1.134。",
      "riskLevel": "中"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电力自动化/虚拟电厂",
      "status": "正式持仓，真实行情已接入",
      "support": "9.30 / 9.20",
      "resistance": "9.78 / 10.00",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 9.29,
      "lastClose": 9.71,
      "lastHigh": 9.78,
      "lastLow": 9.21,
      "lastChangePercent": 4.41,
      "lastSource": "eastmoney direct daily kline",
      "action": "持有，不追高；跌破9.30降低风险",
      "invalidCondition": "跌破9.30且电力自动化板块转弱",
      "predictionScore": 6,
      "predictionLabel": "逆势强",
      "expectedDirection": "偏强震荡",
      "reason": "6月23日收9.71、涨4.41%，逆势但接近9.78压力位。",
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
      "sector": "新材料",
      "status": "观察，不买",
      "reason": "6月23日收71.85、跌10.00%，从高位跌停，风险已经兑现但不能接急跌。",
      "buyTrigger": "重新站上74.00并回踩不破，且先有卖出资金，才考虑1手。",
      "avoidReason": "跌停后第一天不接飞刀，等换手和止跌。",
      "risk": "高位筹码松动、题材兑现和继续跌停。",
      "support": "71.85 / 70.00",
      "resistance": "74.00 / 78.30",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 78,
      "lastClose": 71.85,
      "lastHigh": 78.3,
      "lastLow": 71.85,
      "lastChangePercent": -10,
      "lastSource": "eastmoney direct daily kline",
      "invalidCondition": "跌破71.85或新材料板块继续退潮",
      "predictionScore": 2,
      "predictionLabel": "跌停观察",
      "expectedDirection": "高波动",
      "riskLevel": "高"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信/6G",
      "status": "观察，不买",
      "reason": "6月23日收4.28、跌0.93%，通信线没有明显强度。",
      "buyTrigger": "放量站上4.37并强于通信板块，且账户先释放资金后才考虑1手。",
      "avoidReason": "弱势横盘，资金效率不如逆势强票。",
      "risk": "低位继续磨底，买早占用资金。",
      "support": "4.27 / 4.20",
      "resistance": "4.37 / 4.43",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 4.31,
      "lastClose": 4.28,
      "lastHigh": 4.37,
      "lastLow": 4.27,
      "lastChangePercent": -0.93,
      "lastSource": "eastmoney direct daily kline",
      "invalidCondition": "跌破4.27且通信板块缩量",
      "predictionScore": 4,
      "predictionLabel": "弱修复",
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
      "status": "观察，不买",
      "reason": "6月23日收61.32、跌5.62%，锂矿跟随有色大幅回撤。",
      "buyTrigger": "重新站上64.00并连续两天强于有色板块，且先减掉贵金属后才考虑。",
      "avoidReason": "弱板块急跌后不能用紧资金抄底。",
      "risk": "有色退潮、锂价预期反复和高波动。",
      "support": "61.00 / 60.00",
      "resistance": "64.00 / 65.25",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 64.53,
      "lastClose": 61.32,
      "lastHigh": 65.25,
      "lastLow": 61.03,
      "lastChangePercent": -5.62,
      "lastSource": "eastmoney direct daily kline",
      "invalidCondition": "跌破61.00或锂矿板块继续转弱",
      "predictionScore": 2,
      "predictionLabel": "暂不介入",
      "expectedDirection": "弱震荡",
      "riskLevel": "高"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "status": "观察，不追",
      "reason": "6月23日收141.70、跌2.67%，盘中冲到148.30后回落，半导体拥挤交易松动。",
      "buyTrigger": "回踩139.60不破后再站回148.30，且先有卖出资金，才考虑1手。",
      "avoidReason": "高位震荡加大，不追AI硬件回撤后的第一天。",
      "risk": "科技主线拥挤交易和盘中回撤。",
      "support": "139.60 / 136.00",
      "resistance": "148.30 / 150.00",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 143.58,
      "lastClose": 141.7,
      "lastHigh": 148.3,
      "lastLow": 139.6,
      "lastChangePercent": -2.67,
      "lastSource": "eastmoney direct daily kline",
      "invalidCondition": "跌破139.60或半导体冲高回落",
      "predictionScore": 4,
      "predictionLabel": "高位观察",
      "expectedDirection": "宽幅震荡",
      "riskLevel": "高"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费",
      "status": "观察，不买",
      "reason": "6月23日收0.518、跌1.71%，消费线仍无资金优势。",
      "buyTrigger": "站回0.534并连续两天强于大盘，才重新评估。",
      "avoidReason": "弱势反抽效率低，不适合紧资金账户。",
      "risk": "消费修复慢、资金继续偏向医药和低位防守。",
      "support": "0.516 / 0.510",
      "resistance": "0.534 / 0.540",
      "lastTradeDate": "2026-06-23",
      "lastOpen": 0.524,
      "lastClose": 0.518,
      "lastHigh": 0.534,
      "lastLow": 0.516,
      "lastChangePercent": -1.71,
      "lastSource": "eastmoney direct daily kline",
      "invalidCondition": "跌破0.516",
      "predictionScore": 3,
      "predictionLabel": "不买",
      "expectedDirection": "弱震荡",
      "riskLevel": "中"
    },
    {
      "name": "易方达蓝筹精选混合",
      "code": "005827",
      "symbol": "OF005827",
      "market": "OF",
      "type": "open_fund",
      "sector": "开放式基金",
      "status": "净值型观察，不买",
      "reason": "开放式基金按净值披露，不提供盘中K线；当前组合更需要流动性和日内纠错空间。",
      "buyTrigger": "连续两个净值披露日跑赢沪深300和恒生科技，再重新评估定投。",
      "avoidReason": "没有盘中价格触发，不适合用作日内切换工具。",
      "risk": "净值滞后、重仓风格和当前防守需求不匹配。",
      "support": "",
      "resistance": "",
      "invalidCondition": "基金净值更新失败或持仓风格继续弱于市场主线",
      "predictionScore": 3,
      "predictionLabel": "净值观察",
      "expectedDirection": "等待净值",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "6月23日A股、港股主要股指大幅回调，有色和AI硬件承压",
      "source": "证券时报网",
      "publishTime": "2026-06-23 17:17",
      "summary": "已确认事实：沪指跌1.37%报4106.25点，深成指跌3.17%，创业板指跌3.84%，科创综指跌1.31%，恒生科技指数跌超3%；有色、PCB、CPO等方向回撤。基于事实的判断：6月24日先按风险日处理，持仓不急着补。",
      "relatedStocks": [
        "159608",
        "512710",
        "159740",
        "688981"
      ],
      "sector": "市场风险",
      "relation": "risk",
      "url": "https://www.stcn.com/article/detail/3974944.html"
    },
    {
      "title": "6月23日成交仍在3.4万亿元以上，但较前一日缩量",
      "source": "证券时报网",
      "publishTime": "2026-06-23 17:41",
      "summary": "已确认事实：沪深两市合计成交34407.22亿元，较上一交易日减少2964.76亿元；上证指数、深成指、创业板指和科创50均下跌。基于事实的判断：不是无量恐慌，但高位主题开始换手，先看能否缩量止跌。",
      "relatedStocks": [
        "A股",
        "512710",
        "159608"
      ],
      "sector": "成交结构",
      "relation": "market",
      "url": "https://www.stcn.com/article/detail/3974992.html"
    },
    {
      "title": "创新药、银行逆市走强，非持仓方向有防守切换",
      "source": "上海证券报",
      "publishTime": "2026-06-23 16:53",
      "summary": "已确认事实：6月23日医药股逆势爆发，银行、证券、地产等方向相对抗跌。基于事实的判断：资金在从高位成长和有色切向防守/低位方向，但账户不应临时追新方向。",
      "relatedStocks": [
        "医药",
        "银行",
        "观察池"
      ],
      "sector": "非持仓机会",
      "relation": "positive",
      "url": "https://finance.sina.com.cn/roll/2026-06-23/doc-iniekvas1999488.shtml"
    },
    {
      "title": "财联社收评：创业板跌近4%，有色和AI硬件集体调整",
      "source": "财联社",
      "publishTime": "2026-06-23 15:58",
      "summary": "已确认事实：创业板指、深成指低开低走，有色金属、PCB、CPO等方向走弱，创新药、人形机器人、磷化工等局部活跃。基于事实的判断：主线轮动太快，6月24日不适合把每条热点都买一遍。",
      "relatedStocks": [
        "159608",
        "688981",
        "601208"
      ],
      "sector": "热点轮动",
      "relation": "market",
      "url": "https://finance.sina.com.cn/jjxw/2026-06-23/doc-iniekvar6447898.shtml"
    },
    {
      "title": "美伊谈判进展压低油价，贵金属避险溢价同步降温",
      "source": "中国证券报/21财经",
      "publishTime": "2026-06-23 10:34",
      "summary": "已确认事实：报道显示美伊谈判出现进展，国际油价在北京时间6月23日早间明显下跌；亚欧时段黄金、原油同步走弱。基于事实的判断：161226和164701不能再按避险冲高逻辑补仓，只等反抽处理风险。",
      "relatedStocks": [
        "161226",
        "164701"
      ],
      "sector": "贵金属",
      "relation": "risk",
      "url": "https://www.21jingji.com/article/20260623/herald/339ef9613b384b1ddbe3c0c22eb8a1c5.html"
    },
    {
      "title": "港股科技继续回撤，恒生科技相关仓位先看0.549低点",
      "source": "证券时报网/行情核对",
      "publishTime": "2026-06-23 17:17",
      "summary": "已确认事实：6月23日港股主要股指回调，恒生科技指数跌超3%；159740收0.551、跌4.01%。基于事实的判断：159740跌破上一版0.568支撑后不补仓，先看0.549能否守住。",
      "relatedStocks": [
        "159740"
      ],
      "sector": "港股科技",
      "relation": "risk",
      "url": "https://www.stcn.com/article/detail/3974944.html"
    },
    {
      "title": "过去24小时热点：高位主题退潮，医药银行防守，贵金属避险降温",
      "source": "综合核对",
      "publishTime": "2026-06-23 21:35",
      "summary": "已确认事实：6月23日收盘数据和主流财经媒体均显示高位成长、有色、贵金属回撤，医药银行相对抗跌。基于事实的判断：6月24日重点不是找新买点，而是守支撑、等反抽、降低错误交易。",
      "relatedStocks": [
        "161226",
        "164701",
        "159608",
        "512710",
        "002090"
      ],
      "sector": "24小时热点",
      "relation": "market",
      "url": ""
    }
  ],
  "reasoning": [
    {
      "title": "行情信号",
      "basis": "本轮用本地Eastmoney适配器核对到2026-06-23真实日K；页面实时行情仍必须通过自有代理，不裸调行情源。",
      "inference": "静态基线显示多数持仓已经转弱，6月24日不能把6月22日强势行情延续使用。",
      "conclusion": "失败态只显示失败，不画假线；价格触发必须看代理实时/延迟行情或券商App。",
      "invalidCondition": "页面显示行情获取失败、暂无真实更新时间或价格时间戳不对。"
    },
    {
      "title": "仓位信号",
      "basis": "账户接近满仓，且贵金属、稀土、港股科技、军工均在回撤中。",
      "inference": "当前最贵的是买错后的纠错空间，不是错过第一根反弹。",
      "conclusion": "先卖后买；任何买入必须有卖出资金来源。",
      "invalidCondition": "已有卖出成交并降低原持仓风险后再重新评估。"
    },
    {
      "title": "新闻信号",
      "basis": "6月23日新闻主线是风险资产回调、医药银行逆势、贵金属避险交易降温。",
      "inference": "利好在非持仓防守方向，风险在持仓里的有色、贵金属和港股科技。",
      "conclusion": "不临时追医药银行；先处理161226、164701、159608的风险位。",
      "invalidCondition": "高位主题放量修复并重新强于防守方向。"
    },
    {
      "title": "K线信号",
      "basis": "161226收1.889，164701收1.601，159608收1.325，512710收0.666，002090收9.71。",
      "inference": "组合内只有002090相对强，其余多为破位或接近破位。",
      "conclusion": "贵金属等反抽减风险，159608守1.315，002090守9.30，512710站不回0.684不买。",
      "invalidCondition": "6月24日主要持仓同步收复6月23日跌幅一半以上。"
    }
  ],
  "invalidConditions": [
    "真实行情接口失败或页面没有有效更新时间。",
    "券商App价格与网页价格明显不一致。",
    "161226跌破1.850且外盘白银继续走弱。",
    "164701跌破1.580后不再补仓。",
    "159608跌破1.315且稀土永磁退潮。",
    "512710低于0.655或站不回0.684。",
    "159740跌破0.540且恒生科技继续下行。",
    "002090跌破9.30且电力自动化板块转弱。",
    "任何买入没有明确卖出资金来源。"
  ],
  "cancelPlan": [
    "如果开盘真实行情不可用，全部价格触发取消，只保留券商App手动核对。",
    "如果贵金属直接低开跌破支撑，不追卖，等下一次反抽。",
    "如果159608跌破1.315且不能收回，资源线加仓计划取消。",
    "如果512710没有站回0.684，买入计划取消。",
    "如果159740继续跌破0.540，不补仓，降低港股科技预期评分。",
    "如果大盘继续放量下跌且创业板弱于沪指，当天不做新增买入。"
  ],
  "learningFramework": [
    {
      "title": "真实行情优先",
      "basis": "页面只通过自有代理请求行情；静态文件只放收盘基线和计划。",
      "inference": "没有时间戳和来源的价格不能作为交易依据。",
      "conclusion": "失败态下只看券商App，不看页面价格。",
      "invalidCondition": "代理恢复并显示有效更新时间。"
    },
    {
      "title": "急跌不补",
      "basis": "6月23日多个持仓从强势位快速回撤。",
      "inference": "第一根大阴线后的补仓容易把可控亏损变成被动摊低。",
      "conclusion": "6月24日只守线和等反抽，不主动加仓。",
      "invalidCondition": "标的收复关键压力位并强于大盘半小时以上。"
    },
    {
      "title": "反抽止损",
      "basis": "贵金属已经跌破上一版减仓价格和防守线。",
      "inference": "此时目标不是卖在高点，而是用反抽降低继续下行的风险。",
      "conclusion": "白银1.910-1.920、黄金1.625-1.635按计划减1手。",
      "invalidCondition": "放量突破并连续站稳压力位。"
    },
    {
      "title": "先卖后买",
      "basis": "资金紧时，买入新方向必须牺牲旧风险。",
      "inference": "没有卖出成交，买入计划就是不可执行计划。",
      "conclusion": "512710和观察池只允许用减仓资金买1手。",
      "invalidCondition": "已有卖出成交或持仓结构已经降低集中度。"
    }
  ],
  "nextWatch": [
    "6月24日9:30-10:00：先看沪指4100、创业板和恒生科技是否继续下探；没止跌不买。",
    "6月24日10:00前：161226若反抽1.910-1.920且站不稳，卖1手；若低于1.878，不低位追卖。",
    "6月24日10:30前：164701若反抽1.625-1.635且贵金属未转强，卖1手。",
    "6月24日午盘前：159608是否守住1.315；跌破且收不回，卖1手。",
    "6月24日全天：002090守9.30继续持有，跌破9.30且板块转弱降低风险。",
    "盘后复盘：记录真实行情接口是否恢复，失败则保留失败态，不写实时结论。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料",
      "support": "71.85 / 70.00",
      "resistance": "74.00 / 78.30"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "61.00 / 60.00",
      "resistance": "64.00 / 65.25"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信/6G",
      "support": "4.27 / 4.20",
      "resistance": "4.37 / 4.43"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "139.60 / 136.00",
      "resistance": "148.30 / 150.00"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费",
      "support": "0.516 / 0.510",
      "resistance": "0.534 / 0.540"
    },
    {
      "name": "易方达蓝筹精选混合",
      "code": "005827",
      "symbol": "OF005827",
      "market": "OF",
      "type": "open_fund",
      "sector": "开放式基金",
      "support": "",
      "resistance": ""
    }
  ],
  "sources": [
    {
      "name": "证券时报网：A股、港股主要股指大幅回调",
      "url": "https://www.stcn.com/article/detail/3974944.html"
    },
    {
      "name": "证券时报网：6月23日数据复盘",
      "url": "https://www.stcn.com/article/detail/3974992.html"
    },
    {
      "name": "财联社：创业板跌近4%，有色、AI硬件调整",
      "url": "https://finance.sina.com.cn/jjxw/2026-06-23/doc-iniekvar6447898.shtml"
    },
    {
      "name": "上海证券报：深成指、创业板指跌逾3%，医药股逆势爆发",
      "url": "https://finance.sina.com.cn/roll/2026-06-23/doc-iniekvas1999488.shtml"
    },
    {
      "name": "21财经/中国证券报：美伊谈判新进展，国际油价大跌",
      "url": "https://www.21jingji.com/article/20260623/herald/339ef9613b384b1ddbe3c0c22eb8a1c5.html"
    },
    {
      "name": "Eastmoney direct daily kline：2026-06-23持仓与观察池收盘基线",
      "url": "https://push2his.eastmoney.com/"
    }
  ]
};
