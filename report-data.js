window.MARKET_BRIEFING_DATA = {
  "date": "2026-07-22",
  "portfolioVersion": "portfolio-2026-07-22-close-v1",
  "time": "2026-07-22收盘后更新，静态快照来自新浪行情/东方财富公开接口；页面运行时仍只通过自有代理请求真实行情，代理超时则显示失败态。",
  "lastUpdated": "2026-07-22 22:31 北京时间",
  "apiBase": "https://daily-briefing-blue.vercel.app",
  "refreshInterval": 10000,
  "oneLine": "结论：7月23日先控风险，不追AI硬件反抽。161226白银LOF开盘停牌至10:30且溢价风险未消，复牌后只做减仓判断；159740、002090、601208、688981都被科技尾盘跳水拖弱，满仓状态先卖弱项换资金缓冲，再看电力/贵金属能不能延续。",
  "tradeDecision": [
    {
      "type": "先减高风险",
      "title": "国投白银LOF 161226：复牌后优先降溢价风险",
      "conclusion": "7月22日收1.902，较前收盘仅涨0.05%；基金公告显示7月23日开市起停牌、10:30复牌。7月21日场内价1.901对7月20日净值1.5476仍有高溢价线索，不能当普通白银多头处理。",
      "action": "7月23日10:30复牌后，若低于1.900或冲到1.930上方回落，卖2手；若直接跌破1.860，先卖3手。不补仓。卖出资金留作缓冲。",
      "trigger": "卖出触发：复牌后30分钟低于1.900、或1.930上方回落、或跌破1.860。暂缓：复牌后持续站上1.950且白银外盘仍强。失效：基金公司取消溢价风险提示且折溢价明显回落。",
      "reason": "这不是简单看银价方向，是场内溢价+停牌规则风险。满仓账户先把不可控波动降下来。仅供个人复盘参考。"
    },
    {
      "type": "减科技弱项",
      "title": "恒生科技ETF 159740：跌破5日强势线，不加仓",
      "conclusion": "7月22日收0.583，跌3.00%，低点0.581；7月17日以来的反弹被重新打回，和AI硬件尾盘跳水共振。",
      "action": "7月23日若开盘30分钟仍低于0.590，卖5手；若反抽0.596-0.601站不稳，卖3手。只有站回0.601并保持到10:30，才取消减仓。",
      "trigger": "卖出触发：0.590下方运行30分钟，或0.596-0.601反抽失败。暂缓：重新站上0.601。买入触发：没有，仓位已重。",
      "reason": "这只本来是组合主仓，强时拿，弱时不能继续占用资金弹性。仅供个人复盘参考。"
    },
    {
      "type": "卖个股弱势",
      "title": "金智科技 002090：跌破8.50后先处理",
      "conclusion": "7月22日收8.38，跌2.44%，盘中低点8.32；电力ETF走强但金智没有跟，说明个股不是板块强项。",
      "action": "7月23日若低于8.50运行30分钟，卖1手；若反抽8.50-8.57失败，也卖1手。卖出后资金留作缓冲，不换到AI硬件。",
      "trigger": "卖出触发：8.50下方运行30分钟，或反抽8.57失败。暂缓：放量站回8.60。失效：电力信息化板块明显补涨且002090收回8.70。",
      "reason": "板块强、个股弱，是资金效率问题。满仓时先处理跟不上板块的个股。仅供个人复盘参考。"
    },
    {
      "type": "持有强项",
      "title": "电力ETF 562350 / 黄金LOF 164701：强项持有，不追买",
      "conclusion": "562350收1.148，涨1.59%；164701收1.601，涨0.69%。它们是当天组合里相对抗跌的方向，但不是加仓理由。",
      "action": "562350站上1.130继续持有，跌破1.130卖1手；164701站上1.590继续持有，跌破1.590卖2手。没有卖出资金前不加。",
      "trigger": "持有触发：562350不破1.130、164701不破1.590。减仓触发：跌破对应价位。加仓触发：暂不设置。",
      "reason": "强项先让利润跑，不在满仓状态下把防守仓也做成重仓。仅供个人复盘参考。"
    },
    {
      "type": "观察不买",
      "title": "东材科技 601208 / 中芯国际 688981：AI硬件跳水后只观察",
      "conclusion": "601208收41.39跌3.74%，688981收155.59跌2.76%；AI硬件、PCB、光通信尾盘转弱，反抽不能马上当买点。",
      "action": "不买。若已卖出161226或159740形成可用资金，仍只在601208站回43.00并回踩不破、688981站回160.00后，各自再评估1手；没卖出资金就不评估买入。",
      "trigger": "买入前置条件：先有卖出成交资金。价格条件：601208站回43.00，688981站回160.00。没触发：继续看，不动。",
      "reason": "科技线仍是高波动主线，但满仓账户不能用下跌后的幻想补仓。仅供个人复盘参考。"
    }
  ],
  "executionOrder": [
    "1. 7月23日9:25先看集合竞价：159740是否低于0.590，002090是否低于8.50，562350是否守住1.130。",
    "2. 161226开盘停牌，10:30复牌前不挂单、不补仓，只记录白银外盘和场内溢价风险。",
    "3. 9:30-10:00只处理159740和002090：159740低于0.590卖5手；002090低于8.50卖1手。",
    "4. 10:30后看161226：低于1.900或冲高回落卖2手；跌破1.860卖3手。",
    "5. 562350不破1.130、164701不破1.590就持有；跌破才减，不主动加。",
    "6. 卖出资金先留作缓冲。午后指数没有放量修复前，不切到601208、688981或其他AI硬件。",
    "7. 行情接口失败时，以券商App真实报价为准；网页只看策略，不按失败态价格下单。"
  ],
  "tradePlan": [
    {
      "title": "指数分化，先防创业板和科创拖累",
      "basis": "7月22日上证收3867.03涨0.07%，深成指跌1.42%，创业板指跌3.23%，科创50跌2.26%；两市成交额约2.65万亿元。",
      "inference": "沪指横盘不代表组合安全，成长线已经明显回撤。持仓里的159740、002090更受成长风险影响。",
      "conclusion": "7月23日先把科技弱项降下来，再看是否有真实修复。",
      "invalidCondition": "创业板指和科创50同步放量站回7月22日开盘位，且159740站回0.601。"
    },
    {
      "title": "白银LOF不是普通趋势票",
      "basis": "161226公告7月23日开市停牌至10:30；此前公告提示二级市场交易价格明显高于基金份额净值。",
      "inference": "场内价格可能同时受白银、溢价压缩和停牌情绪影响，波动不是线性的。",
      "conclusion": "复牌后优先卖出降风险，不参与补仓。",
      "invalidCondition": "折溢价回落到可接受区间且场内成交稳定后再重新评估。"
    },
    {
      "title": "电力强，但个股分化",
      "basis": "562350涨1.59%，002090跌2.44%。同一主题下ETF强、个股弱。",
      "inference": "资金更愿意买板块防守，不愿意承担小盘个股波动。",
      "conclusion": "持有562350，减弱的002090。",
      "invalidCondition": "002090放量站回8.70并强于562350。"
    },
    {
      "title": "贵金属只保留确定性，不赌溢价",
      "basis": "中国银行金市观察显示上一交易日国际现货黄金上涨；财联社显示COMEX金银期货上涨，但161226同时存在溢价停牌风险。",
      "inference": "黄金LOF风险低于白银LOF溢价交易，不能把金银统一处理。",
      "conclusion": "164701守1.590持有，161226按溢价风险减仓。",
      "invalidCondition": "164701跌破1.590，说明黄金防守也失效。"
    },
    {
      "title": "AI硬件仍是主线，但不是今天的买点",
      "basis": "东方财富收评称AI硬件、光通信、PCB等板块尾盘跳水，601208和688981均收跌。",
      "inference": "主线下跌后第二天常有反抽，但满仓账户没有先卖资金，就无法执行低吸。",
      "conclusion": "观察池全部设为不买，先卖后看。",
      "invalidCondition": "601208站回43.00、688981站回160.00，且先有卖出资金。"
    }
  ],
  "noTradeList": [
    "不在161226复牌前挂买单。停牌和溢价风险优先级高于白银方向判断。",
    "不追159740反抽。0.601收不回前，反抽只是减仓窗口。",
    "不把601208、688981的下跌当成天然便宜。先卖出释放资金，再看站回关键价。",
    "不加562350和164701。强项持有即可，不把防守仓做成新的集中风险。",
    "不在行情代理失败时按网页价格交易；失败态只代表暂无真实数据。"
  ],
  "holdings": [
    {
      "name": "恒生科技ETF大成",
      "code": "159740",
      "symbol": "SZ159740",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "港股科技",
      "support": "0.581 / 0.572",
      "resistance": "0.596 / 0.601",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 0.595,
      "lastClose": 0.583,
      "lastHigh": 0.596,
      "lastLow": 0.581,
      "lastChangePercent": -3,
      "lastSource": "新浪行情 2026-07-22 15:35，东方财富K线交叉核对",
      "action": "低于0.590卖5手；反抽0.596-0.601失败卖3手",
      "invalidCondition": "站回0.601并保持到10:30",
      "predictionScore": 3,
      "predictionLabel": "弱修复",
      "expectedDirection": "低位震荡偏弱",
      "reason": "从0.601跌回0.583，短线强势破坏。",
      "riskLevel": "高"
    },
    {
      "name": "黄金LOF",
      "code": "164701",
      "symbol": "SZ164701",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "黄金",
      "support": "1.590 / 1.578",
      "resistance": "1.624 / 1.635",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 1.609,
      "lastClose": 1.601,
      "lastHigh": 1.624,
      "lastLow": 1.591,
      "lastChangePercent": 0.69,
      "lastSource": "新浪行情 2026-07-22 15:00",
      "action": "守1.590持有；跌破1.590卖2手",
      "invalidCondition": "跌破1.590且外盘黄金转弱",
      "predictionScore": 6,
      "predictionLabel": "防守持有",
      "expectedDirection": "震荡偏强",
      "reason": "金价背景偏强，但不适合继续提高贵金属集中度。",
      "riskLevel": "中"
    },
    {
      "name": "军工龙头ETF富国",
      "code": "512710",
      "symbol": "SH512710",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "军工",
      "support": "0.592 / 0.585",
      "resistance": "0.605 / 0.612",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 0.597,
      "lastClose": 0.597,
      "lastHigh": 0.605,
      "lastLow": 0.592,
      "lastChangePercent": -0.33,
      "lastSource": "新浪行情 2026-07-22 15:34",
      "action": "0.592不破先持有；跌破0.592卖2手",
      "invalidCondition": "跌破0.592或军工线继续弱于沪指",
      "predictionScore": 4,
      "predictionLabel": "弱震荡",
      "expectedDirection": "窄幅震荡",
      "reason": "跌幅不大，但没有主动强度。",
      "riskLevel": "中"
    },
    {
      "name": "国投白银LOF",
      "code": "161226",
      "symbol": "SZ161226",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "白银",
      "support": "1.900 / 1.860",
      "resistance": "1.930 / 1.950",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 1.97,
      "lastClose": 1.902,
      "lastHigh": 1.987,
      "lastLow": 1.901,
      "lastChangePercent": 0.05,
      "lastSource": "新浪行情 2026-07-22 15:00；财联社/基金公告提示7月23日停复牌",
      "action": "10:30复牌后低于1.900卖2手；跌破1.860卖3手",
      "invalidCondition": "持续站上1.950且溢价风险提示缓和",
      "predictionScore": 2,
      "predictionLabel": "高风险减仓",
      "expectedDirection": "高波动",
      "reason": "场内溢价和停牌风险大于日内方向判断。",
      "riskLevel": "高"
    },
    {
      "name": "稀有金属ETF广发",
      "code": "159608",
      "symbol": "SZ159608",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "稀有金属",
      "support": "1.000 / 0.985",
      "resistance": "1.031 / 1.050",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 1,
      "lastClose": 1.015,
      "lastHigh": 1.031,
      "lastLow": 1,
      "lastChangePercent": 0.89,
      "lastSource": "新浪行情 2026-07-22 15:35",
      "action": "站不回1.031只持有观察；跌破1.000卖2手",
      "invalidCondition": "跌破1.000或资源线重新转弱",
      "predictionScore": 5,
      "predictionLabel": "反抽观察",
      "expectedDirection": "震荡",
      "reason": "从低点拉回，但没有突破1.031。",
      "riskLevel": "中"
    },
    {
      "name": "航空航天ETF天弘",
      "code": "159241",
      "symbol": "SZ159241",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "航空航天",
      "support": "0.959 / 0.950",
      "resistance": "0.982 / 1.000",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 0.964,
      "lastClose": 0.967,
      "lastHigh": 0.982,
      "lastLow": 0.959,
      "lastChangePercent": -0.31,
      "lastSource": "新浪行情 2026-07-22 15:35",
      "action": "0.959不破持有；跌破0.959卖1手",
      "invalidCondition": "跌破0.959",
      "predictionScore": 4,
      "predictionLabel": "弱震荡",
      "expectedDirection": "震荡偏弱",
      "reason": "低位拉回但仍没有趋势确认。",
      "riskLevel": "中"
    },
    {
      "name": "电力ETF银华",
      "code": "562350",
      "symbol": "SH562350",
      "market": "SH",
      "type": "exchange_fund",
      "sector": "电力",
      "support": "1.130 / 1.110",
      "resistance": "1.149 / 1.160",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 1.117,
      "lastClose": 1.148,
      "lastHigh": 1.149,
      "lastLow": 1.11,
      "lastChangePercent": 1.59,
      "lastSource": "新浪行情 2026-07-22 15:34",
      "action": "守1.130持有；跌破1.130卖1手",
      "invalidCondition": "跌破1.130",
      "predictionScore": 7,
      "predictionLabel": "相对强",
      "expectedDirection": "震荡偏强",
      "reason": "电力板块在成长回撤时有防守强度。",
      "riskLevel": "中"
    },
    {
      "name": "金智科技",
      "code": "002090",
      "symbol": "SZ002090",
      "market": "SZ",
      "type": "stock",
      "sector": "电力自动化 / 虚拟电厂",
      "support": "8.32 / 8.20",
      "resistance": "8.57 / 8.70",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 8.51,
      "lastClose": 8.38,
      "lastHigh": 8.57,
      "lastLow": 8.32,
      "lastChangePercent": -2.44,
      "lastSource": "新浪行情 2026-07-22 15:35",
      "action": "低于8.50卖1手；反抽8.57失败卖1手",
      "invalidCondition": "放量站回8.70",
      "predictionScore": 2,
      "predictionLabel": "弱项",
      "expectedDirection": "弱反抽",
      "reason": "电力ETF强而个股弱，资金效率差。",
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
      "status": "AI硬件跳水后观察，不买",
      "reason": "7月22日收41.39，跌3.74%，盘中低点40.85；PCB链受尾盘跳水拖累。",
      "buyTrigger": "先卖出161226或159740形成资金来源后，放量站回43.00并回踩不破，再评估1手。",
      "avoidReason": "未站回43.00前只是弱反抽；没有卖出资金时不买。",
      "risk": "跌破40.85后可能继续释放高位筹码。",
      "support": "40.85 / 39.80",
      "resistance": "43.00 / 43.90",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 42.99,
      "lastClose": 41.39,
      "lastHigh": 43.9,
      "lastLow": 40.85,
      "lastChangePercent": -3.74,
      "lastSource": "新浪行情 2026-07-22 15:34",
      "invalidCondition": "跌破40.85",
      "predictionScore": 3,
      "predictionLabel": "不买",
      "expectedDirection": "高波动偏弱",
      "riskLevel": "高"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "status": "低波动观察，不买",
      "reason": "7月22日收4.40，涨0.23%，强于科技硬件但弹性一般。",
      "buyTrigger": "卖出资金到账后，放量站上4.41并强于通信板块，再评估1手。",
      "avoidReason": "低弹性标的，当前优先级低于减风险。",
      "risk": "跌破4.33后回到弱震荡。",
      "support": "4.33 / 4.25",
      "resistance": "4.41 / 4.50",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 4.38,
      "lastClose": 4.4,
      "lastHigh": 4.41,
      "lastLow": 4.33,
      "lastChangePercent": 0.23,
      "lastSource": "新浪行情 2026-07-22 15:34",
      "invalidCondition": "跌破4.33",
      "predictionScore": 5,
      "predictionLabel": "观察",
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
      "status": "资源反抽观察，不买",
      "reason": "7月22日收43.92，涨0.53%，但没有脱离42.60-44.78震荡区间。",
      "buyTrigger": "先卖出弱项形成可用资金后，站回44.80并连续强于稀有金属ETF，再评估1手。",
      "avoidReason": "资源线反抽尚未转趋势，当前不抢。",
      "risk": "跌破42.60后锂矿线重新转弱。",
      "support": "42.60 / 41.50",
      "resistance": "44.80 / 46.00",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 42.83,
      "lastClose": 43.92,
      "lastHigh": 44.78,
      "lastLow": 42.6,
      "lastChangePercent": 0.53,
      "lastSource": "新浪行情 2026-07-22 15:36",
      "invalidCondition": "跌破42.60",
      "predictionScore": 4,
      "predictionLabel": "不买",
      "expectedDirection": "震荡",
      "riskLevel": "中"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "status": "主线回撤观察，不追",
      "reason": "7月22日收155.59，跌2.76%，盘中冲160.40后回落；科创50同步下跌。",
      "buyTrigger": "先卖出形成可用资金后，站回160.00并回踩不破，再评估1手。",
      "avoidReason": "半导体仍是高波动主线，未站回160前不接。",
      "risk": "跌破153.38后可能继续压制科创线。",
      "support": "153.38 / 150.00",
      "resistance": "160.00 / 166.00",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 156,
      "lastClose": 155.59,
      "lastHigh": 160.4,
      "lastLow": 153.38,
      "lastChangePercent": -2.76,
      "lastSource": "新浪行情 2026-07-22 15:34",
      "invalidCondition": "跌破153.38",
      "predictionScore": 4,
      "predictionLabel": "观察",
      "expectedDirection": "弱反抽",
      "riskLevel": "高"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "status": "防守反抽观察，不买",
      "reason": "7月22日收0.556，涨1.46%，强于成长线，但消费不是当前主线。",
      "buyTrigger": "连续两天站上0.556并强于沪指，且先卖出形成可用资金后，再评估。",
      "avoidReason": "反抽一天不等于趋势，当前资金优先留作缓冲。",
      "risk": "跌破0.536后反抽失败。",
      "support": "0.536 / 0.528",
      "resistance": "0.556 / 0.565",
      "lastTradeDate": "2026-07-22",
      "lastOpen": 0.542,
      "lastClose": 0.556,
      "lastHigh": 0.556,
      "lastLow": 0.536,
      "lastChangePercent": 1.46,
      "lastSource": "新浪行情 2026-07-22 15:00",
      "invalidCondition": "跌破0.536",
      "predictionScore": 5,
      "predictionLabel": "观察",
      "expectedDirection": "震荡偏强",
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
      "reason": "开放式基金按净值披露，不提供盘中K线；东方财富基金接口显示2026-07-22单位净值1.5184，日变动-1.05%。",
      "buyTrigger": "连续两个净值披露日跑赢沪深300和恒生科技，且先卖出形成可用资金后，再评估定投。",
      "avoidReason": "没有盘中价格触发，不适合作为日内切换工具。",
      "risk": "港股科技与白酒风格继续分化，净值滞后。",
      "support": "",
      "resistance": "",
      "invalidCondition": "净值继续弱于组合主线",
      "predictionScore": 3,
      "predictionLabel": "不买",
      "expectedDirection": "等待净值确认",
      "riskLevel": "中"
    }
  ],
  "newsItems": [
    {
      "title": "7月22日A股分化：沪指微涨，创业板和科创线回撤",
      "source": "东方财富收评 / 新浪行情指数快照",
      "publishTime": "2026-07-22 15:30",
      "summary": "已确认事实：上证涨0.07%，深成指跌1.42%，创业板指跌3.23%，科创50跌2.26%，成交额约2.65万亿元。基于事实的判断：组合不能按沪指微涨处理，成长仓要先降风险。",
      "relatedStocks": [
        "159740",
        "002090",
        "688981",
        "601208"
      ],
      "sector": "市场风险",
      "relation": "risk",
      "url": "https://stock.eastmoney.com/shichang.html"
    },
    {
      "title": "AI硬件、光通信、PCB尾盘跳水",
      "source": "东方财富",
      "publishTime": "2026-07-22 16:29",
      "summary": "已确认事实：东方财富报道AI硬件、光通信、PCB等板块跌幅居前，科技股尾盘跳水。基于事实的判断：601208和688981只观察，不把下跌当买入理由。",
      "relatedStocks": [
        "601208",
        "688981",
        "159740"
      ],
      "sector": "AI硬件",
      "relation": "risk",
      "url": "https://finance.eastmoney.com/a/202607223817299595.html"
    },
    {
      "title": "国投白银LOF 7月23日开盘停牌至10:30",
      "source": "财联社 / 新浪财经转载",
      "publishTime": "2026-07-22 18:33",
      "summary": "已确认事实：161226将于7月23日开市起停牌，10:30复牌，停牌期间赎回业务照常办理。基于事实的判断：次日复牌后优先减溢价风险，不补仓。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "贵金属",
      "relation": "risk",
      "url": "https://www.cls.cn/detail/2434133"
    },
    {
      "title": "前一日公告已提示白银LOF明显溢价",
      "source": "第一财经 / 新浪财经转载",
      "publishTime": "2026-07-21 17:47",
      "summary": "已确认事实：公告提到7月21日场内收盘价1.901元，7月20日基金份额净值1.5476元，提示二级市场交易价格明显高于净值。基于事实的判断：白银LOF交易要按溢价压缩风险处理。",
      "relatedStocks": [
        "161226"
      ],
      "sector": "贵金属",
      "relation": "risk",
      "url": "https://finance.sina.com.cn/jjxw/2026-07-21/doc-iniiqkny9202824.shtml"
    },
    {
      "title": "贵金属价格隔夜反弹，但场内白银风险更复杂",
      "source": "中国银行 / 财联社",
      "publishTime": "2026-07-22 05:00",
      "summary": "已确认事实：中国银行金市观察称上一交易日国际现货黄金上涨；财联社称COMEX金银期货上涨。基于事实的判断：黄金LOF可持有，白银LOF不能只看银价上涨。",
      "relatedStocks": [
        "164701",
        "161226"
      ],
      "sector": "贵金属",
      "relation": "market",
      "url": "https://www.bank-of-china.com/fimarkets/fm7/202607/t20260722_25680556.html"
    },
    {
      "title": "A股回购增持潮继续",
      "source": "中国基金报 / 东方财富",
      "publishTime": "2026-07-22 20:41",
      "summary": "已确认事实：报道显示7月22日晚已有超30家上市公司发布增持、回购公告。基于事实的判断：这是市场情绪托底信号，但对持仓日内买卖优先级低于价格触发。",
      "relatedStocks": [],
      "sector": "市场机会",
      "relation": "positive",
      "url": "https://finance.eastmoney.com/a/202607223817565494.html"
    },
    {
      "title": "主力资金从成长高波动方向撤出",
      "source": "东方财富主力复盘",
      "publishTime": "2026-07-22 15:31",
      "summary": "已确认事实：东方财富主力复盘显示当日大盘主力资金净流出，工业金属、贵金属、电力等相对靠前。基于事实的判断：电力和黄金可作为持有项，科技弱项先减。",
      "relatedStocks": [
        "562350",
        "164701",
        "159740",
        "688981"
      ],
      "sector": "资金流",
      "relation": "market",
      "url": "https://stock.eastmoney.com/shichang.html"
    }
  ],
  "reasoning": [
    {
      "title": "为什么7月23日先卖再看",
      "basis": "组合里159740跌3.00%、002090跌2.44%、161226存在停牌溢价风险；上证微涨掩盖了成长线下跌。",
      "inference": "满仓状态下，先卖出才能恢复资金弹性；没有资金来源的买入建议不可执行。",
      "conclusion": "先处理161226、159740、002090，再观察601208和688981。",
      "invalidCondition": "创业板、科创50同步放量修复，且持仓弱项站回关键价。"
    },
    {
      "title": "为什么白银LOF优先级最高",
      "basis": "它既有白银价格波动，又有基金溢价和停牌复牌机制。",
      "inference": "价格上涨不等于风险下降，溢价压缩可能抵消甚至放大标的波动。",
      "conclusion": "10:30复牌后只做减仓判断，不补仓。",
      "invalidCondition": "折溢价明显回落并连续成交稳定。"
    },
    {
      "title": "为什么不追AI硬件",
      "basis": "601208、688981与AI硬件/PCB/半导体尾盘跳水同向回撤。",
      "inference": "反抽可能很快，但没有站回关键价之前，买入只能算猜反弹。",
      "conclusion": "有卖出资金后，也只在站回关键价时评估1手。",
      "invalidCondition": "601208站回43.00，688981站回160.00。"
    },
    {
      "title": "为什么电力ETF留、金智科技减",
      "basis": "562350涨1.59%，002090跌2.44%。",
      "inference": "同主题不同载体强弱分化，ETF代表板块防守，个股代表资金不愿承担波动。",
      "conclusion": "留562350，减002090。",
      "invalidCondition": "002090放量站回8.70并强于电力ETF。"
    },
    {
      "title": "为什么强项也不加仓",
      "basis": "黄金LOF和电力ETF相对强，但账户接近满仓。",
      "inference": "强项加仓会提高集中度，弱项不处理就没有容错空间。",
      "conclusion": "强项守位持有，跌破再减，不主动买。",
      "invalidCondition": "先完成弱项卖出且市场午后放量转强。"
    }
  ],
  "invalidConditions": [
    "若159740站回0.601并保持到10:30，取消当日恒生科技减仓计划。",
    "若161226复牌后持续站上1.950且白银外盘仍强，白银减仓从3手降为观察或2手。",
    "若002090放量站回8.70并强于电力ETF，取消个股减仓。",
    "若562350跌破1.130或164701跌破1.590，强项持有逻辑失效。",
    "若行情代理失败或网页报价与券商App不一致，以券商App真实行情为准。"
  ],
  "cancelPlan": [
    "真实行情接口失败时，页面只能显示暂无真实数据/行情获取失败，不按网页价格交易。",
    "161226停牌期间不下单，不用白银外盘价格推算场内价。",
    "若开盘出现极端低开，不在第一分钟砍，等待第一波反抽确认。",
    "若卖出未成交，不假设已有可用资金去买观察池标的。"
  ],
  "learningFramework": [
    {
      "title": "真实行情和主观评分分开",
      "basis": "静态文件记录7月22日真实收盘快照；实时价格必须由自有代理返回。",
      "inference": "预测分数只表达明天主观预期，不替代真实行情。",
      "conclusion": "评分低的先盯触发价，失败态不交易。",
      "invalidCondition": "代理恢复并给出新时间戳后，再用实时状态修正判断。"
    },
    {
      "title": "停牌规则优先于技术形态",
      "basis": "161226 7月23日10:30前停牌。",
      "inference": "无法连续交易的标的，不能按普通K线做盘中计划。",
      "conclusion": "复牌后再看，停牌前不预判成交价。",
      "invalidCondition": "基金公告更新或交易所临时规则变化。"
    },
    {
      "title": "强指数不等于强持仓",
      "basis": "沪指涨0.07%，但创业板和科创50跌幅明显。",
      "inference": "组合里科技和成长风险比沪指更重要。",
      "conclusion": "看持仓本身，不看指数表面。",
      "invalidCondition": "成长指数修复并带动持仓站回关键价。"
    },
    {
      "title": "先卖后买",
      "basis": "账户接近满仓。",
      "inference": "没有卖出成交，所有观察池买点都不可执行。",
      "conclusion": "601208、688981、002466全部先看资金来源。",
      "invalidCondition": "卖出成交且市场放量转强。"
    },
    {
      "title": "A股颜色按本地习惯",
      "basis": "上涨/利好用红，回撤/风险用绿。",
      "inference": "新闻关系和行情涨跌要保持一致。",
      "conclusion": "利好只标机会，不自动变成买入。",
      "invalidCondition": "个股价格确认失败。"
    }
  ],
  "nextWatch": [
    "7月23日9:25：159740是否低于0.590，002090是否低于8.50。",
    "7月23日10:30：161226复牌后是否低于1.900，是否出现溢价压缩。",
    "10:30后：562350是否守1.130，164701是否守1.590。",
    "午后：创业板和科创50是否放量修复；没有修复就不买科技观察池。",
    "收盘复盘：确认卖出是否成交；没成交就保留原风险，不写成已释放资金。"
  ],
  "quoteWatchlist": [
    {
      "name": "东材科技",
      "code": "601208",
      "symbol": "SH601208",
      "market": "SH",
      "type": "stock",
      "sector": "新材料 / PCB材料",
      "support": "40.85 / 39.80",
      "resistance": "43.00 / 43.90"
    },
    {
      "name": "天齐锂业",
      "code": "002466",
      "symbol": "SZ002466",
      "market": "SZ",
      "type": "stock",
      "sector": "锂矿",
      "support": "42.60 / 41.50",
      "resistance": "44.80 / 46.00"
    },
    {
      "name": "中国联通",
      "code": "600050",
      "symbol": "SH600050",
      "market": "SH",
      "type": "stock",
      "sector": "通信 / 算力",
      "support": "4.33 / 4.25",
      "resistance": "4.41 / 4.50"
    },
    {
      "name": "中芯国际",
      "code": "688981",
      "symbol": "SH688981",
      "market": "SH",
      "type": "stock",
      "sector": "半导体",
      "support": "153.38 / 150.00",
      "resistance": "160.00 / 166.00"
    },
    {
      "name": "白酒基金LOF",
      "code": "161725",
      "symbol": "SZ161725",
      "market": "SZ",
      "type": "exchange_fund",
      "sector": "消费 / 白酒",
      "support": "0.536 / 0.528",
      "resistance": "0.556 / 0.565"
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
      "name": "新浪行情：持仓与观察池2026-07-22收盘快照",
      "url": "https://hq.sinajs.cn/list=sz159740,sz164701,sh512710,sz161226,sz159608,sz159241,sh562350,sz002090,sh601208,sz002466,sh600050,sh688981,sz161725",
      "note": "收盘价、开高低、成交量和更新时间"
    },
    {
      "name": "东方财富：7月22日市场与板块收评",
      "url": "https://stock.eastmoney.com/shichang.html",
      "note": "指数分化、成交额、板块强弱和主力复盘"
    },
    {
      "name": "东方财富：AI硬件尾盘跳水",
      "url": "https://finance.eastmoney.com/a/202607223817299595.html",
      "note": "AI硬件、光通信、PCB风险"
    },
    {
      "name": "财联社：国投白银LOF 7月23日停复牌",
      "url": "https://www.cls.cn/detail/2434133",
      "note": "161226次日停牌至10:30"
    },
    {
      "name": "新浪财经：国投白银LOF溢价风险提示",
      "url": "https://finance.sina.com.cn/jjxw/2026-07-21/doc-iniiqkny9202824.shtml",
      "note": "场内价明显高于基金份额净值"
    },
    {
      "name": "中国银行：金市观察2026-07-22",
      "url": "https://www.bank-of-china.com/fimarkets/fm7/202607/t20260722_25680556.html",
      "note": "国际现货黄金与上海黄金交易所价格背景"
    },
    {
      "name": "东方财富基金：005827历史净值",
      "url": "https://api.fund.eastmoney.com/f10/lsjz?fundCode=005827&pageIndex=1&pageSize=5",
      "note": "2026-07-22单位净值1.5184"
    }
  ]
};
