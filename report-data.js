window.MARKET_BRIEFING_DATA = {
  "date": "2026-07-27",
  "portfolioVersion": "portfolio-2026-07-27-premarket-v1",
  "time": "2026-07-26晚完成7月27日盘前版。场内价格均为7月24日真实收盘，不是周末实时行情；报价与日K已由自有代理的东方财富、腾讯、新浪真实数据交叉核对。",
  "lastUpdated": "2026-07-26 22:31 北京时间",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "oneLine": "结论：7月27日先卖弱项、暂不买。7月24日A股普跌且成交缩到1.93万亿元，159608、161226、562350跌幅居前，159740继续弱；周末没有足以覆盖这轮风险释放的新增催化。先按触发价减仓并保留现金，未卖出就不评估新仓。",
  "tradeDecision": [
    {
      "type": "优先减仓",
      "title": "稀有金属ETF广发 159608：弱项第一顺位",
      "conclusion": "7月24日收1.005，跌4.19%，收盘贴近日低1.004；资源线从反抽转为集中兑现，原1.000支撑只剩一步。",
      "action": "7月27日若开盘30分钟仍低于1.010，卖3手；若反抽1.020-1.037站不稳，卖2手。卖出资金留作现金缓冲，不当天换仓。",
      "trigger": "卖出触发：1.010下方运行30分钟，或1.020-1.037反抽失败。暂缓：放量站回1.037并保持到10:30。失效：资源板块同步修复且159608站上1.050。",
      "reason": "满仓状态先处理跌幅大、收在低位的基金弱项。仅供个人复盘参考。"
    },
    {
      "type": "降溢价风险",
      "title": "国投白银LOF 161226：外盘上涨也不补",
      "conclusion": "7月24日场内收1.824，跌3.80%；同日基金净值1.5971，按收盘静态计算仍约溢价14.2%。COMEX白银周五上涨不能消除场内溢价压缩风险。",
      "action": "若低于1.820运行30分钟，卖2手；若反抽1.840附近站不稳，也卖2手；跌破1.780再卖3手。不补仓。",
      "trigger": "卖出触发：1.820下方运行30分钟、1.840反抽失败或跌破1.780。暂缓：站回1.896且最新净值显示溢价明显收窄。失效：基金公司风险提示解除且折溢价回到低位。",
      "reason": "这笔交易的主要风险是LOF溢价，不是单纯判断银价方向。仅供个人复盘参考。"
    },
    {
      "type": "修复失败减仓",
      "title": "电力ETF银华 562350：防守强项已破位",
      "conclusion": "7月24日收1.109，跌3.73%，低点1.106；7月22日的强势已基本回吐，不能继续按防守仓处理。",
      "action": "若低于1.110运行30分钟，卖2手；若反抽1.125-1.145失败，卖1手。卖出资金不追电力个股。",
      "trigger": "卖出触发：1.110下方运行30分钟，或1.125-1.145反抽失败。暂缓：重新站上1.148。失效：电力板块放量反包7月24日跌幅。",
      "reason": "防守仓也要看价格确认，跌回启动位后优先恢复现金。仅供个人复盘参考。"
    },
    {
      "type": "继续控仓",
      "title": "恒生科技ETF大成 159740：跌势未止",
      "conclusion": "7月24日收0.575，跌2.04%，收在日低；恒生科技指数同日跌1.47%，周五美股半导体继续下挫，周一缺少外盘修复确认。",
      "action": "若低于0.580运行30分钟，卖5手；若反抽0.587-0.590失败，卖3手。不加仓。",
      "trigger": "卖出触发：0.580下方运行30分钟，或0.587-0.590反抽失败。暂缓：放量站回0.590并保持到10:30。失效：恒生科技指数同步转强且159740站回0.600。",
      "reason": "仓位本来就重，弱势阶段先降集中度，不赌科技反抽。仅供个人复盘参考。"
    },
    {
      "type": "守位持有",
      "title": "黄金LOF 164701 / 军工龙头ETF 512710 / 航空航天ETF 159241",
      "conclusion": "三只基金7月24日分别跌1.87%、1.97%、1.92%。周五国际金价小涨给黄金一点支撑，但A股整体风险仍高，军工和航天没有独立强度。",
      "action": "164701守1.565持有，跌破卖2手；512710守0.595持有，跌破卖2手；159241守0.970持有，跌破卖1手。三只都不加。",
      "trigger": "减仓触发：分别跌破1.565、0.595、0.970。暂缓：开盘后重新站回1.581、0.605、0.983。买入触发：没有，先卖后看。",
      "reason": "弱市里只保留尚未明显失守的基金仓位，不用新增资金验证猜想。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 7月27日9:25只记录真实竞价：159608是否低于1.010、161226是否低于1.820、562350是否低于1.110、159740是否低于0.580。",
    "2. 9:30-10:00不买，只确认弱项是否连续30分钟站不回触发价。",
    "3. 159608低于1.010卖3手；161226低于1.820卖2手；562350低于1.110卖2手；159740低于0.580卖5手。",
    "4. 若低开后快速反抽，等1.020-1.037、1.840、1.125-1.145、0.587-0.590各自反抽失败再卖，不在第一分钟追砍。",
    "5. 164701、512710、159241只守1.565、0.595、0.970；不破就持有，跌破才减。",
    "6. 所有卖出资金先留现金。没有卖出成交，不评估观察池；有资金也等午后成交额和指数止跌确认。",
    "7. 网页行情失败或日期不是7月27日时，以券商App真实报价为准；静态报告只提供触发框架。"
  ],
  "tradePlan": [
    {
      "title": "普跌加缩量，先看风险释放",
      "basis": "7月24日上证跌1.61%、深成指跌2.47%、创业板指跌2.65%，两市成交额约1.93万亿元，超4900只个股下跌。",
      "inference": "缩量普跌说明承接不足，周一早盘反抽也可能只是减仓窗口。",
      "conclusion": "先按基金触发价卖弱项，不主动抄底。",
      "invalidCondition": "上证守住3808一带并放量收回3835，同时成长指数转红。"
    },
    {
      "title": "贵金属外盘反弹，场内风险分开处理",
      "basis": "7月24日现货黄金、COMEX金银小幅上涨，但161226场内收盘相对同日净值仍有约14.2%溢价。",
      "inference": "黄金LOF可以守位观察，白银LOF不能用外盘上涨掩盖溢价风险。",
      "conclusion": "164701守1.565持有；161226按1.820/1.780分档减仓。",
      "invalidCondition": "161226最新折溢价明显收窄并站回1.896。"
    },
    {
      "title": "海外科技继续降温",
      "basis": "7月24日纳指跌约0.6%，费城半导体指数跌约4.25%，芯片股普跌；恒生科技指数收跌1.47%。",
      "inference": "A股半导体和港股科技周一缺少外盘情绪支撑。",
      "conclusion": "159740不加；601208、688981只作板块观察，不设个股买入。",
      "invalidCondition": "港股科技与A股科创方向开盘后同步放量转强。"
    },
    {
      "title": "周一数据与新规只做验证，不预判",
      "basis": "7月27日将发布1—6月规模以上工业企业利润数据；内幕交易司法解释修订自当日起施行。",
      "inference": "法治建设是中长期背景，工业利润数据才可能改变当天板块强弱，盘前不能把未公布结果当利好。",
      "conclusion": "等数据落地和价格确认，不提前加仓。",
      "invalidCondition": "官方数据显著超预期并带动相关基金放量站回压力位。"
    },
    {
      "title": "接近满仓，资金来源优先",
      "basis": "当前没有可忽略的空闲仓位，弱项仍占用资金。",
      "inference": "未卖出就给买入方案，会把策略写成不可执行愿望。",
      "conclusion": "卖出成交前全部观察池不买；卖出后资金也先留作缓冲。",
      "invalidCondition": "已确认卖出成交且午后市场放量止跌。"
    }
  ],
  "noTradeList": [
    "不把7月24日收盘价写成周末实时行情；周一必须等自有代理或券商App给出新时间戳。",
    "不补161226。COMEX白银上涨不能消除约14.2%的场内溢价。",
    "不抄159608、562350、159740的低点，先等站回压力位。",
    "不买观察池股票。股票只用于确认板块强弱，调仓只考虑基金/ETF/LOF。",
    "不把尚未成交的卖出计划当成可用资金。"
  ],
  "holdings": [
    {
      "name": "恒生科技ETF大成",
      "code": "159740",
      "symbol": "SZ159740",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "港股科技",
      "support": "0.575 / 0.565",
      "resistance": "0.582 / 0.590",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 0.578,
      "lastClose": 0.575,
      "lastHigh": 0.582,
      "lastLow": 0.575,
      "lastChangePercent": -2.04,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "action": "低于0.580运行30分钟卖5手；反抽0.587-0.590失败卖3手",
      "invalidCondition": "放量站回0.590并保持到10:30",
      "predictionScore": 2,
      "predictionLabel": "弱势减仓",
      "expectedDirection": "震荡偏弱",
      "reason": "连续转弱并收在日低，海外科技也未修复。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.565 / 1.550",
      "resistance": "1.581 / 1.604",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 1.58,
      "lastClose": 1.574,
      "lastHigh": 1.581,
      "lastLow": 1.567,
      "lastChangePercent": -1.87,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "action": "守1.565持有；跌破1.565卖2手；不加仓",
      "invalidCondition": "跌破1.565且外盘黄金转弱",
      "predictionScore": 5,
      "predictionLabel": "守位持有",
      "expectedDirection": "震荡",
      "reason": "外盘金价小涨提供支撑，但A股风险仍高。",
      "riskLevel": "中"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.595 / 0.585",
      "resistance": "0.605 / 0.613",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 0.604,
      "lastClose": 0.596,
      "lastHigh": 0.613,
      "lastLow": 0.596,
      "lastChangePercent": -1.97,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "action": "守0.595持有；跌破0.595卖2手；不加仓",
      "invalidCondition": "跌破0.595",
      "predictionScore": 4,
      "predictionLabel": "弱震荡",
      "expectedDirection": "震荡偏弱",
      "reason": "收盘接近日低，尚无独立强度。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.812 / 1.780",
      "resistance": "1.840 / 1.896",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 1.816,
      "lastClose": 1.824,
      "lastHigh": 1.84,
      "lastLow": 1.812,
      "lastChangePercent": -3.8,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "action": "低于1.820卖2手；1.840反抽失败卖2手；跌破1.780卖3手",
      "invalidCondition": "站回1.896且最新溢价明显收窄",
      "predictionScore": 2,
      "predictionLabel": "高风险减仓",
      "expectedDirection": "高波动偏弱",
      "reason": "同日静态溢价约14.2%，外盘上涨不能消除压缩风险。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "1.004 / 0.985",
      "resistance": "1.020 / 1.037",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 1.027,
      "lastClose": 1.005,
      "lastHigh": 1.037,
      "lastLow": 1.004,
      "lastChangePercent": -4.19,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "action": "低于1.010运行30分钟卖3手；反抽1.020-1.037失败卖2手",
      "invalidCondition": "放量站回1.037并保持到10:30",
      "predictionScore": 1,
      "predictionLabel": "最弱先减",
      "expectedDirection": "弱反抽",
      "reason": "跌幅居前且收盘贴近日低，整数位支撑承压。",
      "riskLevel": "高"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "0.970 / 0.955",
      "resistance": "0.983 / 1.000",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 0.983,
      "lastClose": 0.972,
      "lastHigh": 1,
      "lastLow": 0.971,
      "lastChangePercent": -1.92,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "action": "守0.970持有；跌破0.970卖1手；不加仓",
      "invalidCondition": "跌破0.970",
      "predictionScore": 4,
      "predictionLabel": "弱震荡",
      "expectedDirection": "震荡偏弱",
      "reason": "冲高回落并收在低位，等待板块修复。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.106 / 1.090",
      "resistance": "1.125 / 1.148",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 1.139,
      "lastClose": 1.109,
      "lastHigh": 1.148,
      "lastLow": 1.106,
      "lastChangePercent": -3.73,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "action": "低于1.110运行30分钟卖2手；反抽1.125-1.145失败卖1手",
      "invalidCondition": "放量站回1.148",
      "predictionScore": 2,
      "predictionLabel": "破位减仓",
      "expectedDirection": "弱反抽",
      "reason": "前期防守强度已被大幅回吐。",
      "riskLevel": "高"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电力自动化 / 虚拟电厂",
      "support": "8.40 / 8.20",
      "resistance": "8.55 / 8.77",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 8.71,
      "lastClose": 8.42,
      "lastHigh": 8.77,
      "lastLow": 8.42,
      "lastChangePercent": -3.88,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "action": "不加；券商App确认跌破8.40时按既有风控处理",
      "invalidCondition": "放量站回8.77",
      "predictionScore": 2,
      "predictionLabel": "弱项观察",
      "expectedDirection": "弱反抽",
      "reason": "电力板块回撤时个股同步收在日低。",
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
      "status": "逆势高波动观察，不买股票",
      "reason": "7月24日收41.72，涨0.58%，但盘中区间40.30-43.17，波动很大。",
      "buyTrigger": "不设置个股买入；若站回43.20并回踩不破，只作为PCB材料板块转强确认。",
      "avoidReason": "调仓只考虑基金；单日逆势不等于趋势完成。",
      "risk": "跌破40.30后可能继续释放高位筹码。",
      "support": "40.30 / 39.80",
      "resistance": "43.20 / 44.00",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 41.48,
      "lastClose": 41.72,
      "lastHigh": 43.17,
      "lastLow": 40.3,
      "lastChangePercent": 0.58,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "invalidCondition": "跌破40.30",
      "predictionScore": 5,
      "predictionLabel": "观察不买",
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
      "status": "低波动观察，不买股票",
      "reason": "7月24日收4.42，涨跌0%，强于大盘但没有突破。",
      "buyTrigger": "不设置个股买入；若放量站上4.45，仅作为通信板块防守确认。",
      "avoidReason": "调仓只考虑基金，且当前优先降低组合风险。",
      "risk": "跌破4.39后回到弱震荡。",
      "support": "4.39 / 4.33",
      "resistance": "4.45 / 4.50",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 4.43,
      "lastClose": 4.42,
      "lastHigh": 4.45,
      "lastLow": 4.39,
      "lastChangePercent": 0,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "invalidCondition": "跌破4.39",
      "predictionScore": 5,
      "predictionLabel": "观察不买",
      "expectedDirection": "窄幅震荡",
      "riskLevel": "中"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "status": "锂矿急跌观察，不买股票",
      "reason": "7月24日收43.88，跌5.39%，收在日低，资源反抽明显退潮。",
      "buyTrigger": "不设置个股买入；只有站回45.90，才作为锂矿板块修复确认。",
      "avoidReason": "跌幅大且收在低位，调仓只考虑基金。",
      "risk": "跌破43.88后可能继续测试42.60。",
      "support": "43.88 / 42.60",
      "resistance": "45.00 / 45.90",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 45.01,
      "lastClose": 43.88,
      "lastHigh": 45.9,
      "lastLow": 43.88,
      "lastChangePercent": -5.39,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "invalidCondition": "跌破43.88",
      "predictionScore": 1,
      "predictionLabel": "不买",
      "expectedDirection": "弱反抽",
      "riskLevel": "高"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "status": "半导体回撤观察，不买股票",
      "reason": "7月24日收143.73，跌0.94%，低点142.56；海外芯片股周五继续下挫。",
      "buyTrigger": "不设置个股买入；站回148.60只作为半导体板块修复确认。",
      "avoidReason": "调仓只考虑基金，海外科技风险仍未释放完。",
      "risk": "跌破142.56后可能继续测试140。",
      "support": "142.56 / 140.00",
      "resistance": "148.60 / 153.00",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 145.31,
      "lastClose": 143.73,
      "lastHigh": 148.6,
      "lastLow": 142.56,
      "lastChangePercent": -0.94,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "invalidCondition": "跌破142.56",
      "predictionScore": 3,
      "predictionLabel": "观察不买",
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
      "status": "消费基金弱势观察，不买",
      "reason": "7月24日收0.538，跌1.82%，日内低点0.536，前一轮防守反抽未延续。",
      "buyTrigger": "先有基金卖出资金，且连续站上0.551并强于沪指，再评估1手。",
      "avoidReason": "没有卖出资金或未站上0.551时明确不买。",
      "risk": "跌破0.536后继续转弱。",
      "support": "0.536 / 0.528",
      "resistance": "0.551 / 0.560",
      "lastTradeDate": "2026-07-24",
      "lastOpen": 0.547,
      "lastClose": 0.538,
      "lastHigh": 0.551,
      "lastLow": 0.536,
      "lastChangePercent": -1.82,
      "lastSource": "自有代理：东方财富真实收盘；腾讯/新浪日K交叉核对，2026-07-24",
      "invalidCondition": "跌破0.536",
      "predictionScore": 3,
      "predictionLabel": "不买",
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
      "status": "净值型观察，暂无运行时真实净值",
      "reason": "公开净值接口显示7月24日单位净值1.4931、日变动-1.30%；自有开放式基金代理当前明确返回ok:false。",
      "buyTrigger": "连续两个净值披露日跑赢沪深300和恒生科技，且先有基金卖出资金后，再评估定投。",
      "avoidReason": "无盘中K线，运行时真实净值代理未接通；当前不买。",
      "risk": "港股科技与白酒风格继续分化，净值披露存在时滞。",
      "support": "",
      "resistance": "",
      "invalidCondition": "净值继续弱于组合主线",
      "predictionScore": 2,
      "predictionLabel": "不买",
      "expectedDirection": "等待净值确认",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "7月24日A股普跌，成交额降至约1.93万亿元",
      "source": "央广网 / 公开指数行情",
      "publishTime": "2026-07-24 15:40",
      "summary": "已确认事实：上证跌1.61%、深成指跌2.47%、创业板指跌2.65%，两市成交额约1.93万亿元，超4900只个股下跌。基于事实的判断：周一先看风险释放，反抽优先用于减弱项。",
      "relatedStocks": [
        "159608",
        "562350",
        "159740",
        "161226"
      ],
      "sector": "市场风险",
      "relation": "risk",
      "url": "https://finance.cnr.cn/ycbd/20260724/t20260724_527727429.shtml"
    },
    {
      "title": "恒生科技指数7月24日收跌1.47%",
      "source": "公开指数历史行情 / 自有代理",
      "publishTime": "2026-07-24 16:10",
      "summary": "已确认事实：恒生科技指数收4629.51点，跌1.47%；159740收0.575跌2.04%。基于事实的判断：恒科仓位继续控仓，站不回0.590不加。",
      "relatedStocks": [
        "159740"
      ],
      "sector": "港股科技",
      "relation": "risk",
      "url": "https://finance.sina.com.cn/jjxw/2026-07-24/doc-iniiwzsi1620656.shtml"
    },
    {
      "title": "美股科技周五继续承压",
      "source": "新浪财经 / 公开美股收盘数据",
      "publishTime": "2026-07-25 04:08",
      "summary": "已确认事实：纳指收跌约0.6%，芯片股普跌；周末复盘资料显示费城半导体指数跌约4.25%。基于事实的判断：A股半导体与港股科技周一缺少外盘修复确认。",
      "relatedStocks": [
        "159740",
        "688981",
        "601208"
      ],
      "sector": "海外科技",
      "relation": "risk",
      "url": "https://finance.sina.com.cn/stock/usstock/c/2026-07-25/doc-iniiyccv1387946.shtml"
    },
    {
      "title": "国际金银周五小幅上涨，原油显著回落",
      "source": "21世纪经济报道 / 每日经济新闻",
      "publishTime": "2026-07-25 09:35",
      "summary": "已确认事实：现货黄金涨0.09%，COMEX白银涨0.75%，WTI原油跌3.12%。基于事实的判断：黄金LOF可守位，白银LOF仍按溢价风控；油价回落暂不直接转化为持仓买点。",
      "relatedStocks": [
        "164701",
        "161226"
      ],
      "sector": "贵金属 / 原油",
      "relation": "market",
      "url": "https://finance.sina.com.cn/roll/2026-07-25/doc-iniiyptp4533346.shtml"
    },
    {
      "title": "161226同日净值确认溢价仍高",
      "source": "东方财富基金净值 / 自有代理真实收盘",
      "publishTime": "2026-07-25 00:00",
      "summary": "已确认事实：161226在7月24日场内收1.824，同日单位净值1.5971，静态溢价约14.2%，且基金页面显示暂停申购。基于事实的判断：周一仍以减溢价风险为先，不补仓。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "贵金属",
      "relation": "risk",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=5"
    },
    {
      "title": "资本市场内幕交易司法解释7月27日起施行",
      "source": "最高人民法院",
      "publishTime": "2026-07-24 15:03",
      "summary": "已确认事实：两高发布内幕交易、泄露内幕信息刑事案件司法解释修改决定，7月27日起施行。基于事实的判断：有利于资本市场法治与投资者保护，但不是短线买入触发。",
      "relatedStocks": [],
      "sector": "资本市场制度",
      "relation": "positive",
      "url": "https://www.court.gov.cn/zixun/xiangqing/506981.html"
    },
    {
      "title": "过去24小时焦点转向工业利润与海外超级周",
      "source": "中国证券报 / 财联社",
      "publishTime": "2026-07-26 10:47",
      "summary": "已确认事实：7月27日将发布1—6月规模以上工业企业利润数据，本周还有美联储决议和多家海外科技巨头财报。基于事实的判断：科技和资源波动可能放大，未公布结果不能提前当利好。",
      "relatedStocks": [
        "159608",
        "159740",
        "688981",
        "601208"
      ],
      "sector": "下周事件",
      "relation": "market",
      "url": "https://finance.eastmoney.com/a/202607263821197890.html"
    }
  ],
  "reasoning": [
    {
      "title": "为什么周一不设买入",
      "basis": "7月24日普跌、缩量，核心基金弱项收在日低附近；海外科技也未修复。",
      "inference": "这种环境下的早盘反抽更适合验证卖点，不适合新增风险。",
      "conclusion": "所有买入先取消，卖出成交后资金仍先留现金。",
      "invalidCondition": "指数与持仓基金同步放量站回关键压力位。"
    },
    {
      "title": "为什么159608排第一",
      "basis": "159608跌4.19%，收1.005，距离1.000整数位很近。",
      "inference": "跌幅大且收盘缺少回拉，说明资源反抽交易已经转弱。",
      "conclusion": "1.010下方30分钟卖3手，反抽1.020-1.037失败卖2手。",
      "invalidCondition": "放量站回1.037并保持到10:30。"
    },
    {
      "title": "为什么白银不能看外盘下单",
      "basis": "161226场内价相对同日净值仍约溢价14.2%。",
      "inference": "即使白银期货上涨，场内溢价压缩也可能让LOF继续下跌。",
      "conclusion": "按场内价和最新净值处理，不补仓。",
      "invalidCondition": "溢价明显收窄且场内价站回1.896。"
    },
    {
      "title": "为什么电力也要减",
      "basis": "562350在7月22日走强后，7月24日跌3.73%并收1.109。",
      "inference": "防守属性不是永久标签，价格破位后继续持有会占用现金弹性。",
      "conclusion": "1.110下方30分钟卖2手。",
      "invalidCondition": "放量站回1.148。"
    },
    {
      "title": "为什么股票观察池不买",
      "basis": "601208虽逆势涨0.58%，但002466跌5.39%、688981跌0.94%，板块分化很大。",
      "inference": "单只股票强弱不能替代基金调仓规则，且账户接近满仓。",
      "conclusion": "股票只确认板块，不列入买入执行清单。",
      "invalidCondition": "用户另行明确授权股票交易并提供可用资金边界。"
    }
  ],
  "invalidConditions": [
    "若159608放量站回1.037并保持到10:30，取消当日稀有金属ETF减仓。",
    "若161226最新溢价明显收窄且站回1.896，白银减仓降级为观察。",
    "若562350放量站回1.148、159740站回0.590并保持到10:30，对应减仓计划暂缓。",
    "若164701、512710、159241分别跌破1.565、0.595、0.970，守位持有逻辑失效。",
    "若行情代理失败、时间戳仍停在7月24日或网页与券商App不一致，以券商App真实行情为准。"
  ],
  "cancelPlan": [
    "真实行情接口失败时，页面只能显示暂无真实数据/行情获取失败，不按网页价格交易。",
    "若开盘极端低开，不在第一分钟追砍，等待第一波反抽和30分钟确认。",
    "若卖出未成交，不假设已有可用资金，不启动任何买入计划。",
    "若工业利润数据尚未发布或来源未确认，不把市场传闻写成政策/数据利好。"
  ],
  "learningFramework": [
    {
      "title": "静态收盘和周一实时分开",
      "basis": "本版价格全部截止7月24日收盘，报告在7月26日晚生成。",
      "inference": "周末没有A股实时价格，周一触发必须依赖新时间戳。",
      "conclusion": "静态数据只设边界，网页失败态不交易。",
      "invalidCondition": "自有代理在7月27日返回新的真实行情时间戳。"
    },
    {
      "title": "报价和日K分别验真",
      "basis": "13个场内标的报价日期、收盘价与日K最后一根均匹配2026-07-24。",
      "inference": "只有日期和收盘同时匹配，K线才可作为真实历史走势。",
      "conclusion": "任何一项不匹配都应显示K线未更新。",
      "invalidCondition": "新报价出现但日K仍停在7月24日。"
    },
    {
      "title": "LOF先看折溢价",
      "basis": "161226场内1.824，同日净值1.5971。",
      "inference": "期货方向和LOF回报可能因溢价压缩而背离。",
      "conclusion": "白银外盘只做背景，不代替场内风险线。",
      "invalidCondition": "折溢价回落到低位。"
    },
    {
      "title": "先卖后买",
      "basis": "账户接近满仓。",
      "inference": "没有卖出成交，任何新仓都没有明确资金来源。",
      "conclusion": "卖出资金先留现金，股票观察池不买。",
      "invalidCondition": "卖出成交且市场午后放量止跌。"
    },
    {
      "title": "事实和判断分开",
      "basis": "收盘数据、基金净值、司法解释和发布日程属于已确认事实。",
      "inference": "周一涨跌方向仍是主观判断，不能包装成实时行情。",
      "conclusion": "每条新闻先写事实，再写对持仓的判断。",
      "invalidCondition": "官方信息发生更新。"
    }
  ],
  "nextWatch": [
    "7月27日9:25：159608是否低于1.010，161226是否低于1.820，562350是否低于1.110，159740是否低于0.580。",
    "9:30后：自有代理时间戳是否更新到7月27日；未更新就只看券商App。",
    "10:00：弱项是否连续30分钟站不回触发价，避免第一分钟追砍。",
    "午间：工业利润官方数据是否落地；只记录事实，不用传闻改策略。",
    "收盘复盘：逐笔确认卖出是否成交；未成交就保留原风险，不写成已释放资金。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "40.30 / 39.80",
      "resistance": "43.20 / 44.00"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "43.88 / 42.60",
      "resistance": "45.00 / 45.90"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.39 / 4.33",
      "resistance": "4.45 / 4.50"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "142.56 / 140.00",
      "resistance": "148.60 / 153.00"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.536 / 0.528",
      "resistance": "0.551 / 0.560"
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
      "name": "自有行情代理：2026-07-24场内收盘",
      "url": "https://daily-briefing-blue.vercel.app/api/quote?symbol=SZ159740",
      "note": "13个场内标的逐只获取；东方财富报价与腾讯/新浪日K日期、收盘一致"
    },
    {
      "name": "央广网：7月24日A股收评",
      "url": "https://finance.cnr.cn/ycbd/20260724/t20260724_527727429.shtml",
      "note": "指数跌幅、成交额与普跌范围"
    },
    {
      "name": "新浪财经：7月24日港股收盘",
      "url": "https://finance.sina.com.cn/jjxw/2026-07-24/doc-iniiwzsi1620656.shtml",
      "note": "2026-07-24收4629.51点，跌1.47%"
    },
    {
      "name": "新浪财经：7月24日美股收盘",
      "url": "https://finance.sina.com.cn/stock/usstock/c/2026-07-25/doc-iniiyccv1387946.shtml",
      "note": "纳指与芯片股周五表现"
    },
    {
      "name": "东方财富基金：161226历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=161226&pageIndex=1&pageSize=5",
      "note": "2026-07-24单位净值1.5971与申购状态"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=5",
      "note": "2026-07-24单位净值1.4931；页面运行时开放式基金代理仍返回失败态"
    },
    {
      "name": "最高人民法院：内幕交易司法解释修改决定",
      "url": "https://www.court.gov.cn/zixun/xiangqing/506981.html",
      "note": "2026-07-27起施行"
    },
    {
      "name": "中国证券报：下周财经大事",
      "url": "https://finance.eastmoney.com/a/202607263821197890.html",
      "note": "过去24小时事件前瞻与工业利润发布时间"
    }
  ]
};
