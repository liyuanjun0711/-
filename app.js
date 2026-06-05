const sourceData = window.MARKET_BRIEFING_DATA || {};
const chartLib = window.LightweightCharts;

const sectionMap = {
  action: {
    title: "今日操作",
    subtitle: "先处理买卖，再确认真实行情",
    sections: ["trade-decision", "one-sentence", "execution-list", "trade-plan", "do-not-do"]
  },
  quote: {
    title: "持仓行情与走势",
    subtitle: "真实行情、主观评分、操作建议分开看",
    sections: ["quote-search", "holding-quotes", "prediction-overview", "risk-trigger", "quote-watchlist"]
  },
  news: {
    title: "市场新闻与机会",
    subtitle: "利好红色，利空绿色，只看影响持仓的消息",
    sections: ["holding-news", "market-risk", "hot-review", "sector-move", "watchlist"]
  },
  logic: {
    title: "今日交易逻辑",
    subtitle: "解释计划，不写废话",
    sections: ["reasoning", "invalid-conditions", "learning-framework", "cancel-plan", "next-watch"]
  }
};

const marketStatus = getMarketStatus();
const appState = {
  quoteMode: "failed",
  marketStatus,
  lastUpdated: sourceData.lastUpdated || null,
  lastRealUpdated: null,
  refreshInterval: Number(sourceData.refreshInterval || 10000),
  holdings: normalizeHoldings(sourceData.holdings || []),
  watchlist: normalizeWatchlist(sourceData.watchlist || []),
  currentView: getInitialView(),
  sections: [],
  expandedSections: new Set(["trade-decision", "quote-search", "holding-quotes", "holding-news", "reasoning"]),
  isRefreshingQuote: false,
  isRefreshingAnalysis: false,
  quoteError: getApiBase() ? "" : "未配置行情代理 apiBase",
  searchResults: [],
  searchError: "",
  selectedSymbol: null,
  selectedChartPeriod: "intraday",
  autoTimer: null,
  countdownTimer: null,
  initialized: false
};

const dataProvider = {
  async search(keyword) {
    const value = keyword.trim();
    if (!value) return [];
    const apiBase = getApiBase();
    if (!apiBase) return localSearch(value);
    const payload = await requestJson(`${apiBase}/api/search?keyword=${encodeURIComponent(value)}`);
    if (!payload.ok) throw new Error(payload.message || "搜索接口返回失败");
    return normalizeSearchItems(payload.items || []);
  },
  async getQuote(symbol) {
    const apiBase = getApiBase();
    if (!apiBase) throw new Error("未配置行情代理，暂无真实数据");
    const payload = await requestJson(`${apiBase}/api/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!payload.ok) throw new Error(payload.message || "真实行情获取失败");
    return normalizeQuote(payload);
  },
  async getIntraday(symbol) {
    const apiBase = getApiBase();
    if (!apiBase) throw new Error("未配置行情代理，暂无真实分时数据");
    const payload = await requestJson(`${apiBase}/api/intraday?symbol=${encodeURIComponent(symbol)}`);
    if (!payload.ok) throw new Error(payload.message || "真实分时获取失败");
    return normalizeIntraday(payload.items || []);
  },
  async getDailyKline(symbol) {
    const apiBase = getApiBase();
    if (!apiBase) throw new Error("未配置行情代理，暂无真实日K数据");
    const payload = await requestJson(`${apiBase}/api/kline?symbol=${encodeURIComponent(symbol)}&period=day`);
    if (!payload.ok) throw new Error(payload.message || "真实日K获取失败");
    return normalizeDailyKline(payload.items || []);
  },
  async getFundInfo(symbol) {
    const apiBase = getApiBase();
    if (!apiBase) throw new Error("未配置基金代理，暂无真实净值数据");
    const payload = await requestJson(`${apiBase}/api/fund?symbol=${encodeURIComponent(symbol)}`);
    if (!payload.ok) throw new Error(payload.message || "基金净值获取失败");
    return payload;
  }
};

let chartInstance = null;
appState.sections = buildSections();

function normalizeHoldings(items) {
  return items.map((item) => ({
    name: item.name || "",
    code: item.code || "",
    symbol: item.symbol || toSymbol(item),
    market: item.market || inferMarket(item.code),
    type: item.type || inferType(item.code),
    support: item.support || "",
    resistance: item.resistance || "",
    action: item.action || "",
    invalidCondition: item.invalidCondition || "",
    prediction: normalizePrediction(item),
    quote: null,
    quoteStatus: "failed",
    quoteError: "暂无真实数据",
    intraday: [],
    dailyKline: [],
    fundInfo: null
  }));
}

function normalizeWatchlist(items) {
  return items
    .filter((item) => item && item.code)
    .map((item) => ({
      name: item.name || "",
      code: item.code || "",
      symbol: item.symbol || toSymbol(item),
      market: item.market || inferMarket(item.code),
      type: item.type || inferType(item.code),
      sector: item.sector || "未分类",
      status: item.status || "观察，不买",
      reason: item.reason || "",
      buyTrigger: item.buyTrigger || "",
      avoidReason: item.avoidReason || "条件未满足，不买。",
      risk: item.risk || ""
    }));
}

function normalizePrediction(item) {
  const score = clampScore(item.predictionScore ?? 5);
  return {
    predictionScore: score,
    predictionLabel: item.predictionLabel || scoreToLabel(score),
    expectedDirection: item.expectedDirection || scoreToDirection(score),
    reason: item.reason || "等待真实行情确认。",
    action: item.action || "观察",
    invalidCondition: item.invalidCondition || "跌破支撑或板块走弱",
    riskLevel: item.riskLevel || "中"
  };
}

function buildSections() {
  return [
    section("trade-decision", "action", "Primary", "今天到底买卖什么", "decision", true, renderTradeDecision),
    section("one-sentence", "action", "一句话", "今日一句话", "summary", false, renderOneSentence),
    section("execution-list", "action", "执行顺序", "满仓账户先卖后买", "execution", false, renderExecutionList),
    section("trade-plan", "action", "逐笔计划", "逐笔操作计划", "execution", false, renderTradePlan),
    section("do-not-do", "action", "纪律", "今天不做什么", "risk", false, renderDoNotDo),
    section("quote-search", "quote", "查询", "股票 / ETF / LOF / 基金查询", "quote", true, renderQuoteSearch),
    section("holding-quotes", "quote", "Primary", "持仓实时行情列表", "quote", true, renderHoldingQuotes),
    section("prediction-overview", "quote", "评分", "今日评分与预期总览", "expectation", false, renderPredictionOverview),
    section("risk-trigger", "quote", "风险", "风险触发提醒", "risk", false, renderRiskTrigger),
    section("quote-watchlist", "quote", "观察", "观察池", "watch", false, renderQuoteWatchlist),
    section("holding-news", "news", "Primary", "与持仓相关的重大消息", "news", true, renderHoldingNews),
    section("market-risk", "news", "市场雷达", "全市场重大利好与风险", "news", false, renderMarketRisk),
    section("hot-review", "news", "24小时", "过去24小时热点", "news", false, renderHotReview),
    section("sector-move", "news", "板块", "板块异动", "news", false, renderSectorMove),
    section("watchlist", "news", "观察池", "观察池", "watch", false, renderWatchlist),
    section("reasoning", "logic", "Primary", "为什么今天这样操作", "logic", true, renderReasoning),
    section("invalid-conditions", "logic", "失效", "推理失效条件", "risk", false, renderInvalidConditions),
    section("learning-framework", "logic", "学习", "学习为什么", "logic", false, renderLearningFramework),
    section("cancel-plan", "logic", "作废", "计划作废条件", "risk", false, renderCancelPlan),
    section("next-watch", "logic", "明日", "明日重点观察", "logic", false, renderNextWatch)
  ];
}

function section(id, group, eyebrow, title, type, fixedOpen, render) {
  return { id, group, eyebrow, title, type, fixedOpen, render };
}

function renderApp() {
  const root = document.getElementById("moduleRoot");
  root.innerHTML = "";
  root.appendChild(renderSectionHeader(appState.currentView));
  getCurrentSections().forEach((item, index) => root.appendChild(renderSection(item, index === 0)));
  renderDetailSheet();
  dedupeRenderedSections();
  updateActiveUI();
  updateStatusText();
  revealCards();
}

function renderSectionHeader(view) {
  const config = sectionMap[view];
  const header = createEl("section", "section-header reveal-card");
  header.dataset.viewHeader = view;
  header.innerHTML = `
    <div>
      <p class="section-label">${getViewLabel(view)}</p>
      <h2>${escapeText(config.title)}</h2>
      <p>${escapeText(config.subtitle)}</p>
    </div>
    <div class="section-header-meta">
      <span>${marketStatus.label}</span>
      <small>${getLastRealText()}</small>
    </div>
  `;
  return header;
}

function renderSection(item, isPrimary) {
  const open = isSectionOpen(item);
  const card = createEl("section", `module-card reveal-card ${isPrimary ? "primary-card" : "secondary-card"} ${sectionClass(item)}`);
  card.id = `section-${item.id}`;
  card.dataset.sectionId = item.id;
  card.dataset.group = item.group;
  card.dataset.type = item.type;
  card.innerHTML = `
    <div class="section-head">
      <div>
        <p class="section-label">${item.eyebrow}</p>
        <h2>${item.title}</h2>
      </div>
      ${item.fixedOpen ? "" : `<button class="section-toggle" type="button" data-action="toggle-section" data-target-section="${item.id}" aria-expanded="${open}"><span>${open ? "收起" : "展开"}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`}
    </div>
  `;
  const body = createEl("div", "section-body");
  body.id = `body-${item.id}`;
  body.classList.toggle("collapsed", !open);
  body.setAttribute("aria-hidden", String(!open));
  item.render(body);
  card.appendChild(body);
  return card;
}

function renderTradeDecision(container) {
  const wrap = createEl("div", "decision-grid");
  (sourceData.tradeDecision || []).forEach((item) => {
    const card = createEl("article", `decision-card mini-card ${decisionTone(item.type)}`);
    card.innerHTML = `<span class="label">${escapeText(item.type)}</span><strong>${escapeText(item.title)}</strong><p><b>结论：</b>${escapeText(item.conclusion)}</p><p><b>动作：</b>${escapeText(item.action)}</p><p><b>条件：</b>${escapeText(item.trigger)}</p><p><b>风险：</b>${escapeText(item.reason)}</p>`;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderOneSentence(container) {
  container.innerHTML = `<div class="summary-copy"><h2>${escapeText(sourceData.oneLine)}</h2></div><div class="quick-actions"><button class="secondary-btn" type="button" data-action="open-section" data-target-section="holding-quotes">看行情</button><button class="secondary-btn" type="button" data-action="open-section" data-target-section="risk-trigger">看风险</button></div>`;
}

function renderExecutionList(container) {
  container.appendChild(renderBulletList(sourceData.executionOrder || []));
}

function renderTradePlan(container) {
  container.appendChild(renderActionRows(sourceData.tradeDecision || []));
}

function renderDoNotDo(container) {
  container.appendChild(renderBulletList(sourceData.noTradeList || [], "no-trade-list"));
}

function renderQuoteSearch(container) {
  container.appendChild(renderQuoteStatusPanel());
  const box = createEl("div", "stock-search-panel");
  box.innerHTML = `
    <form class="stock-search-form" data-role="stock-search">
      <label for="stockSearchInput">统一查询</label>
      <div>
        <input id="stockSearchInput" name="keyword" type="search" placeholder="股票、ETF、LOF、基金代码或名称" autocomplete="off">
        <button class="primary-btn compact" type="submit">查询</button>
      </div>
    </form>
    <div id="stockSearchState" class="search-state">${escapeText(appState.searchError || "未配置代理时仅能查询本地代码索引，不显示价格。")}</div>
    <div id="stockSearchResults" class="search-results"></div>
  `;
  renderSearchResults(box.querySelector("#stockSearchResults"));
  container.appendChild(box);
}

function renderQuoteStatusPanel() {
  const panel = createEl("div", `quote-status-panel mode-${appState.quoteMode}`);
  panel.innerHTML = `
    <div>
      <span class="label">真实行情状态</span>
      <strong>${getQuoteModeLabel(appState.quoteMode)}</strong>
      <p>${appState.quoteError ? escapeText(appState.quoteError) : getQuoteModeDescription()}</p>
    </div>
    <div class="quote-status-actions">
      <span>${marketStatus.label}</span>
      <small id="nextRefreshText">${getNextRefreshText()}</small>
      <button class="secondary-btn compact" type="button" data-action="refresh-quotes">重试真实行情</button>
    </div>
  `;
  return panel;
}

function renderSearchResults(container) {
  container.innerHTML = "";
  appState.searchResults.forEach((item) => {
    const row = createEl("article", "search-result mini-card");
    row.innerHTML = `
      <div>
        <strong>${escapeText(item.name)}</strong>
        <span>${escapeText(item.code)} / ${escapeText(item.market)} / ${getTypeLabel(item.type)}</span>
        <small>${item.quote ? quoteLine(item.quote, item.type) : "暂无真实行情；可查看详情或加入观察"}</small>
      </div>
      <div>
        <button class="secondary-btn compact" type="button" data-action="show-detail" data-symbol="${escapeText(item.symbol)}">查看详情</button>
        <button class="secondary-btn compact" type="button" data-action="add-holding" data-symbol="${escapeText(item.symbol)}">加入持仓</button>
        <button class="secondary-btn compact" type="button" data-action="add-watch" data-symbol="${escapeText(item.symbol)}">加入观察</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderHoldingQuotes(container) {
  const wrap = createEl("div", "holding-list compact-holdings");
  appState.holdings.forEach((item) => {
    const card = createEl("article", "holding-card quote-card mini-card clickable-card");
    card.style.setProperty("--score-bg", getScoreColor(item.prediction.predictionScore));
    card.dataset.action = "show-detail";
    card.dataset.symbol = item.symbol;
    card.innerHTML = `
      <div class="holding-head">
        <div>
          <strong>${escapeText(item.name)}</strong>
          <span>${escapeText(item.code)} / ${getTypeLabel(item.type)}</span>
        </div>
        <div class="quote-box">${renderPriceBox(item)}</div>
      </div>
      <div class="quote-meta-grid">
        <span>${getQuoteModeLabel(item.quoteStatus)}</span>
        <span>${item.quote?.time || "暂无真实更新时间"}</span>
        <span>${marketStatus.label}</span>
      </div>
      <div class="score-strip">
        <strong>今日评分：${formatScore(item.prediction.predictionScore)} / 10</strong>
        <span>${escapeText(item.prediction.predictionLabel)}｜${escapeText(item.prediction.reason)}</span>
        <em>${escapeText(item.prediction.action)}；仅供个人复盘参考</em>
      </div>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderPredictionOverview(container) {
  const wrap = createEl("div", "expectation-list");
  appState.holdings.forEach((item) => {
    const card = createEl("article", "expectation-card expect-card mini-card");
    card.style.setProperty("--expect-bg", getScoreColor(item.prediction.predictionScore));
    card.innerHTML = `
      <div class="expect-top">
        <div><strong>${escapeText(item.name)} ${escapeText(item.code)}</strong><span>评分是主观预期，不是行情数据</span></div>
        <span class="expect-pill">${formatScore(item.prediction.predictionScore)} / 10</span>
      </div>
      <dl>
        <div><dt>预期</dt><dd>${escapeText(item.prediction.predictionLabel)}</dd></div>
        <div><dt>原因</dt><dd>${escapeText(item.prediction.reason)}</dd></div>
        <div><dt>操作</dt><dd>${escapeText(item.prediction.action)}</dd></div>
        <div><dt>失效</dt><dd>${escapeText(item.prediction.invalidCondition)}</dd></div>
      </dl>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderRiskTrigger(container) {
  container.appendChild(renderBulletList(appState.holdings.map((item) => `${item.name} ${item.code}：${item.invalidCondition}`), "invalid-list"));
}

function renderQuoteWatchlist(container) {
  container.appendChild(renderWatchCards(appState.watchlist));
}

function renderHoldingNews(container) {
  container.appendChild(renderNewsCards(sourceData.holdingNews || sourceData.newsReview || []));
}

function renderMarketRisk(container) {
  container.appendChild(renderNewsCards(sourceData.marketRadar || []));
}

function renderHotReview(container) {
  container.appendChild(renderNewsCards(sourceData.newsReview || []));
}

function renderSectorMove(container) {
  container.appendChild(renderNewsCards(sourceData.sectorMove || sourceData.marketRadar || []));
}

function renderWatchlist(container) {
  container.appendChild(renderWatchCards(appState.watchlist));
}

function renderReasoning(container) {
  container.appendChild(renderShortCards(sourceData.reasoning || []));
}

function renderInvalidConditions(container) {
  container.appendChild(renderBulletList(sourceData.invalidConditions || [], "invalid-list"));
}

function renderLearningFramework(container) {
  container.appendChild(renderShortCards(sourceData.learningFramework || []));
}

function renderCancelPlan(container) {
  container.appendChild(renderBulletList(sourceData.cancelPlan || [], "invalid-list"));
}

function renderNextWatch(container) {
  container.appendChild(renderShortCards(sourceData.nextWatch || []));
}

function renderDetailSheet() {
  const existing = document.getElementById("detailSheet");
  if (existing) existing.remove();
  if (!appState.selectedSymbol) return;
  const item = ensureDetailShape(findSecurity(appState.selectedSymbol));
  if (!item) return;
  const sheet = createEl("aside", "detail-sheet");
  sheet.id = "detailSheet";
  sheet.innerHTML = `
    <div class="detail-backdrop" data-action="close-detail"></div>
    <section class="detail-panel">
      <div class="detail-head">
        <div>
          <p class="section-label">${getTypeLabel(item.type)} / ${getQuoteModeLabel(item.quoteStatus)}</p>
          <h2>${escapeText(item.name)}</h2>
          <span>${escapeText(item.symbol)} · ${item.quote?.time || "暂无真实更新时间"}</span>
        </div>
        <button class="icon-btn" type="button" data-action="close-detail" aria-label="关闭">×</button>
      </div>
      ${renderDetailPrice(item)}
      ${renderDetailChartArea(item)}
      ${renderDetailAdvice(item)}
      <div class="detail-actions">
        <button class="secondary-btn" type="button" data-action="add-holding" data-symbol="${escapeText(item.symbol)}">加入持仓</button>
        <button class="secondary-btn" type="button" data-action="add-watch" data-symbol="${escapeText(item.symbol)}">加入观察</button>
        <button class="secondary-btn" type="button" data-action="remove-security" data-symbol="${escapeText(item.symbol)}">移出</button>
        <button class="primary-btn" type="button" data-action="refresh-one" data-symbol="${escapeText(item.symbol)}">刷新真实行情</button>
      </div>
    </section>
  `;
  document.body.appendChild(sheet);
  requestAnimationFrame(() => renderDetailChart(item));
}

function renderDetailPrice(item) {
  const quote = item.quote;
  const isOpenFund = item.type === "open_fund";
  if (isOpenFund) {
    const fund = item.fundInfo || {};
    if (!item.fundInfo) {
      return `<div class="detail-price failed"><strong>暂无真实净值</strong><p>基金净值接口失败；不展示假净值。</p><span>开放式基金按净值披露，不提供盘中K线。</span></div>`;
    }
    return `<div class="detail-price"><strong>${formatPrice(fund.nav)}</strong><p>最新净值 / ${fund.navDate || "净值日期未知"}</p><span>开放式基金按净值披露，不提供盘中K线。</span></div>`;
  }
  if (!quote) {
    return `<div class="detail-price failed"><strong>暂无真实数据</strong><p>真实行情获取失败；不展示假价格。</p></div>`;
  }
  return `
    <div class="detail-price">
      <strong>${formatPrice(getDisplayPrice(item))}</strong>
      <p><span class="${changeClass(quote.changePercent)}">${formatPrice(quote.change)} / ${formatPercent(quote.changePercent)}</span> · ${quote.status || marketStatus.session}</p>
      <div class="price-grid">
        <span>开盘 ${formatPrice(quote.open)}</span>
        <span>最高 ${formatPrice(quote.high)}</span>
        <span>最低 ${formatPrice(quote.low)}</span>
        <span>昨收 ${formatPrice(quote.preClose)}</span>
        <span>成交量 ${formatVolume(quote.volume)}</span>
        <span>成交额 ${formatAmount(quote.amount)}</span>
      </div>
    </div>
  `;
}

function renderDetailChartArea(item) {
  const isOpenFund = item.type === "open_fund";
  const period = isOpenFund ? "fund" : appState.selectedChartPeriod;
  return `
    <div class="detail-chart">
      <div class="chart-tabs">
        ${isOpenFund ? `<button class="chart-tab active" type="button" data-action="switch-detail-chart" data-period="fund">净值曲线</button>` : `
          <button class="chart-tab ${period === "intraday" ? "active" : ""}" type="button" data-action="switch-detail-chart" data-period="intraday">分时</button>
          <button class="chart-tab ${period === "day" ? "active" : ""}" type="button" data-action="switch-detail-chart" data-period="day">日K</button>
        `}
      </div>
      <div class="chart-host detail-chart-host" data-detail-chart="${escapeText(item.symbol)}"></div>
      <div class="chart-tooltip" hidden></div>
      <div class="chart-axis-labels">${period === "day" ? renderDailyAxis(item) : renderIntradayAxisLabels()}</div>
      <small class="chart-state">${chartStateText(item, period)}</small>
    </div>
  `;
}

function renderDetailAdvice(item) {
  const p = item.prediction || normalizePrediction({ predictionScore: 5, action: "观察", reason: "等待真实行情。" });
  return `
    <div class="advice-panel" style="--score-bg:${getScoreColor(p.predictionScore)}">
      <strong>今日评分：${formatScore(p.predictionScore)} / 10 · ${escapeText(p.predictionLabel)}</strong>
      <p>${escapeText(p.reason)}</p>
      <dl>
        <div><dt>建议</dt><dd>${escapeText(p.action)}</dd></div>
        <div><dt>触发</dt><dd>${escapeText(item.resistance || "等待关键位")}</dd></div>
        <div><dt>失效</dt><dd>${escapeText(p.invalidCondition)}</dd></div>
        <div><dt>风险</dt><dd>${escapeText(p.riskLevel)}；仅供个人复盘参考</dd></div>
      </dl>
    </div>
  `;
}

function renderDetailChart(item) {
  const host = document.querySelector(".detail-chart-host");
  if (!host || !chartLib) return;
  chartInstance?.remove?.();
  const period = item.type === "open_fund" ? "fund" : appState.selectedChartPeriod;
  const data = period === "day" ? (item.dailyKline || []) : (item.intraday || []);
  if (item.type === "open_fund") {
    host.innerHTML = `<div class="chart-fallback">开放式基金按净值披露，不提供盘中K线。</div>`;
    return;
  }
  if (!data?.length) {
    host.innerHTML = `<div class="chart-fallback">${period === "day" ? "真实日K暂无；不绘制假K线。" : "真实分时暂无；不绘制假线。"}</div>`;
    return;
  }
  const chart = chartLib.createChart(host, {
    width: host.clientWidth,
    height: 230,
    layout: { background: { color: "rgba(255,255,255,0)" }, textColor: "#5f5c55" },
    grid: { vertLines: { color: "rgba(31,31,27,0.06)" }, horzLines: { color: "rgba(31,31,27,0.08)" } },
    rightPriceScale: { borderVisible: false },
    timeScale: { visible: false },
    crosshair: { mode: 0 },
    handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
    handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
  });
  let series;
  if (period === "day") {
    series = chart.addSeries(chartLib.CandlestickSeries, {
      upColor: "#cf5d4f", downColor: "#5b9a68", borderUpColor: "#cf5d4f", borderDownColor: "#5b9a68", wickUpColor: "#cf5d4f", wickDownColor: "#5b9a68"
    });
    series.setData(data.map((row) => ({ time: row.time, open: row.open, high: row.high, low: row.low, close: row.close })));
  } else {
    series = chart.addSeries(chartLib.LineSeries, { color: "#cf5d4f", lineWidth: 2, priceLineVisible: false });
    series.setData(data.map((row) => ({ time: toTimestamp(row.time), value: row.price })));
  }
  chart.timeScale().fitContent();
  attachDetailTooltip(chart, host, item, period, data);
  chartInstance = chart;
}

function attachDetailTooltip(chart, host, item, period, data) {
  const tooltip = document.querySelector(".detail-chart .chart-tooltip");
  const byTime = new Map(data.map((row) => [String(period === "day" ? row.time : toTimestamp(row.time)), row]));
  const show = (row, x, y) => {
    if (!row || !tooltip) return;
    tooltip.hidden = false;
    tooltip.style.left = `${Math.min(Math.max(x + 12, 8), host.clientWidth - 176)}px`;
    tooltip.style.top = `${Math.max(y + 8, 8)}px`;
    tooltip.innerHTML = period === "day" ? renderKlineTooltip(item, row) : renderIntradayTooltip(item, row);
  };
  chart.subscribeCrosshairMove((param) => {
    const row = byTime.get(String(param?.time));
    if (!row || !param.point) {
      if (tooltip) tooltip.hidden = true;
      return;
    }
    show(row, param.point.x, param.point.y);
  });
  host.addEventListener("pointermove", (event) => {
    const rect = host.getBoundingClientRect();
    const index = Math.max(0, Math.min(data.length - 1, Math.round(((event.clientX - rect.left) / rect.width) * (data.length - 1))));
    show(data[index], event.clientX - rect.left, event.clientY - rect.top);
  });
}

async function refreshQuotes({ silent = false } = {}) {
  if (appState.isRefreshingQuote) return;
  appState.isRefreshingQuote = true;
  appState.quoteError = "";
  try {
    const modes = [];
    for (const item of appState.holdings) {
      await refreshSecurity(item);
      if (item.quoteStatus !== "failed") modes.push(item.quoteStatus);
    }
    appState.quoteMode = chooseGlobalQuoteMode(modes);
    appState.lastRealUpdated = getDateTimeText();
    scheduleAutoRefresh();
  } catch (error) {
    appState.quoteMode = "failed";
    appState.quoteError = error.message || "真实行情获取失败";
  } finally {
    appState.isRefreshingQuote = false;
    if (!silent) renderApp();
    else updateStatusText();
  }
}

async function refreshSecurity(item) {
  try {
    if (item.type === "open_fund") {
      item.fundInfo = await dataProvider.getFundInfo(item.symbol);
      item.quoteStatus = item.fundInfo.mode || "delayed";
      return;
    }
    item.quote = await dataProvider.getQuote(item.symbol);
    item.quoteStatus = item.quote.mode || "delayed";
    const [intraday, daily] = await Promise.all([
      dataProvider.getIntraday(item.symbol),
      dataProvider.getDailyKline(item.symbol)
    ]);
    item.intraday = intraday;
    item.dailyKline = daily;
  } catch (error) {
    item.quoteError = error.message || "真实行情获取失败";
    item.quoteStatus = item.quote ? item.quoteStatus : "failed";
  }
}

async function refreshAnalysis() {
  appState.isRefreshingAnalysis = true;
  appState.holdings.forEach((item) => {
    item.prediction = normalizePrediction({ ...item, ...item.prediction });
  });
  appState.isRefreshingAnalysis = false;
  renderApp();
}

async function requestJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("代理接口请求失败");
  return response.json();
}

function normalizeQuote(payload) {
  return {
    symbol: payload.symbol,
    name: payload.name,
    type: payload.type,
    status: payload.status || "unknown",
    mode: payload.mode || "delayed",
    time: payload.time || "",
    price: numericOrNull(payload.price),
    preClose: numericOrNull(payload.preClose),
    open: numericOrNull(payload.open),
    high: numericOrNull(payload.high),
    low: numericOrNull(payload.low),
    change: numericOrNull(payload.change),
    changePercent: numericOrNull(payload.changePercent),
    volume: numericOrNull(payload.volume),
    amount: numericOrNull(payload.amount)
  };
}

function normalizeIntraday(items) {
  return items.map((row) => ({
    time: row.time,
    price: numericOrNull(row.price),
    avgPrice: numericOrNull(row.avgPrice),
    volume: numericOrNull(row.volume)
  })).filter((row) => row.time && row.price != null);
}

function normalizeDailyKline(items) {
  return items.map((row) => ({
    time: row.time,
    open: numericOrNull(row.open),
    high: numericOrNull(row.high),
    low: numericOrNull(row.low),
    close: numericOrNull(row.close),
    volume: numericOrNull(row.volume),
    amount: numericOrNull(row.amount)
  })).filter((row) => row.time && row.close != null);
}

async function handleSubmit(event) {
  const form = event.target.closest('[data-role="stock-search"]');
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector('[name="keyword"]');
  const stateNode = document.getElementById("stockSearchState");
  const resultsNode = document.getElementById("stockSearchResults");
  appState.searchError = "";
  if (stateNode) stateNode.textContent = "查询中...";
  try {
    appState.searchResults = await dataProvider.search(input.value);
    if (!appState.searchResults.length) appState.searchError = "没有找到匹配标的。";
  } catch (error) {
    appState.searchResults = [];
    appState.searchError = error.message || "查询失败。";
  }
  if (stateNode) stateNode.textContent = appState.searchError || `找到 ${appState.searchResults.length} 个结果。`;
  if (resultsNode) renderSearchResults(resultsNode);
}

function addSecurityToHolding(symbol) {
  const item = findSearchResult(symbol);
  if (!item || appState.holdings.some((row) => row.symbol === symbol)) return;
  appState.holdings.unshift({
    ...item,
    support: item.support || "",
    resistance: item.resistance || "",
    action: "新加入，先观察",
    invalidCondition: "没有真实行情不交易",
    prediction: normalizePrediction({ predictionScore: 5, action: "观察", reason: "新加入，等待真实行情。" }),
    quote: item.quote || null,
    quoteStatus: item.quote?.mode || "failed",
    quoteError: item.quote ? "" : "暂无真实数据",
    intraday: [],
    dailyKline: [],
    fundInfo: null
  });
  appState.currentView = "quote";
  renderApp();
}

function addSecurityToWatch(symbol) {
  const item = findSearchResult(symbol);
  if (!item || appState.watchlist.some((row) => row.symbol === symbol)) return;
  appState.watchlist.unshift({
    ...item,
    sector: item.sector || "待分类",
    status: "观察，不买",
    reason: "手动加入观察池。",
    buyTrigger: "有真实行情且突破关键位后再考虑。",
    avoidReason: "没有触发条件不买。",
    risk: "追高风险"
  });
  appState.currentView = "quote";
  appState.expandedSections.add("quote-watchlist");
  renderApp();
}

function removeSecurity(symbol) {
  appState.holdings = appState.holdings.filter((item) => item.symbol !== symbol);
  appState.watchlist = appState.watchlist.filter((item) => item.symbol !== symbol);
  appState.selectedSymbol = null;
  renderApp();
}

function localSearch(keyword) {
  const text = keyword.toLowerCase();
  const items = normalizeSearchItems([...appState.holdings, ...appState.watchlist, ...(sourceData.searchUniverse || [])]);
  const seen = new Set();
  return items.filter((item) => item.code.includes(keyword) || item.name.toLowerCase().includes(text))
    .filter((item) => {
      if (seen.has(item.symbol)) return false;
      seen.add(item.symbol);
      return true;
    });
}

function normalizeSearchItems(items) {
  return items.filter((item) => item && item.code).map((item) => ({
    name: item.name || "",
    code: String(item.code),
    symbol: item.symbol || toSymbol(item),
    market: item.market || inferMarket(item.code),
    type: item.type || inferType(item.code),
    sector: item.sector || "",
    support: item.support || "",
    resistance: item.resistance || "",
    quote: item.quote || null
  }));
}

function renderNewsCards(items) {
  const wrap = createEl("div", "news-list");
  items.forEach((item) => {
    const tone = newsTone(item);
    const card = createEl("article", `news-item mini-card ${tone}`);
    card.innerHTML = `<h3>${escapeText(item.title)}</h3><p>${escapeText(item.summary || item.body || item.conclusion || "")}</p>${item.action ? `<p><b>动作：</b>${escapeText(item.action)}</p>` : ""}`;
    wrap.appendChild(card);
  });
  return wrap;
}

function renderWatchCards(items) {
  const wrap = createEl("div", "watch-card-list");
  items.forEach((item) => {
    const card = createEl("article", "watch-card mini-card");
    card.innerHTML = `<div class="watch-head"><div><strong>${escapeText(item.name)}</strong><span>${escapeText(item.code)} / ${getTypeLabel(item.type)} / ${escapeText(item.sector)}</span></div><em>${escapeText(item.status)}</em></div><p><b>原因：</b>${escapeText(item.reason)}</p><p><b>触发：</b>${escapeText(item.buyTrigger)}</p><p><b>不买：</b>${escapeText(item.avoidReason)}</p><p><b>风险：</b>${escapeText(item.risk)}</p>`;
    wrap.appendChild(card);
  });
  return wrap;
}

function renderShortCards(items) {
  const wrap = createEl("div", "short-card-list");
  items.forEach((item) => {
    const card = createEl("article", "learning-item mini-card");
    card.innerHTML = `<h3>${escapeText(item.title)}</h3><p>${escapeText(item.body)}</p>`;
    wrap.appendChild(card);
  });
  return wrap;
}

function renderBulletList(items, className = "bullet-list") {
  const list = createEl("ul", className);
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  return list;
}

function renderActionRows(items) {
  const wrap = createEl("div", "action-row-list");
  items.forEach((item) => {
    const row = createEl("article", `action-row mini-card ${decisionTone(item.type)}`);
    row.innerHTML = `<strong>${escapeText(item.title)}</strong><p>${escapeText(item.action)}</p><small>${escapeText(item.trigger)}</small>`;
    wrap.appendChild(row);
  });
  return wrap;
}

function renderPriceBox(item) {
  if (item.type === "open_fund") {
    const nav = item.fundInfo?.nav;
    return `<strong>${nav == null ? "暂无净值" : formatPrice(nav)}</strong><span>${item.fundInfo?.navDate || "净值待取"}</span>`;
  }
  if (!item.quote) return `<strong>暂无真实数据</strong><span>获取失败</span>`;
  const label = marketStatus.session === "closed" ? "收盘/最新" : "最新";
  return `<strong>${formatPrice(getDisplayPrice(item))}</strong><span class="${changeClass(item.quote.changePercent)}">${label} ${formatPercent(item.quote.changePercent)}</span>`;
}

function getDisplayPrice(item) {
  if (!item.quote) return null;
  if (item.quote.status === "halted") return item.quote.preClose;
  return item.quote.price ?? item.quote.preClose;
}

function quoteLine(quote, type) {
  if (type === "open_fund") return `净值 ${formatPrice(quote.nav)} / ${quote.navDate || "日期未知"}`;
  return `真实价 ${formatPrice(quote.price)} / ${formatPercent(quote.changePercent)} / ${quote.time || "时间未知"}`;
}

function renderKlineTooltip(item, row) {
  return `<strong>${escapeText(item.name)} ${escapeText(item.code)}</strong><span>时间 ${formatDateAxis(row.time)}</span><span>开 ${formatPrice(row.open)} 高 ${formatPrice(row.high)}</span><span>低 ${formatPrice(row.low)} 收 ${formatPrice(row.close)}</span><span>量 ${formatVolume(row.volume)} 额 ${formatAmount(row.amount)}</span>`;
}

function renderIntradayTooltip(item, row) {
  return `<strong>${escapeText(item.name)} ${escapeText(item.code)}</strong><span>时间 ${formatMinute(row.time)}</span><span>最新价 ${formatPrice(row.price)} / 均价 ${formatPrice(row.avgPrice)}</span><span>量 ${formatVolume(row.volume)}</span>`;
}

function renderIntradayAxisLabels() {
  return ["09:30", "10:30", "11:30", "13:00", "14:00", "15:00"].map((time) => `<span>${time}</span>`).join(" ");
}

function renderDailyAxis(item) {
  const labels = (item.dailyKline || []).slice(-5).map((row) => formatDateAxis(row.time));
  return labels.length ? labels.map((label) => `<span>${label}</span>`).join(" ") : ["06-01", "06-02", "06-03"].map((label) => `<span>${label}</span>`).join(" ");
}

function chartStateText(item, period) {
  if (item.type === "open_fund") return "开放式基金按净值披露，不提供盘中K线。";
  if (period === "day" && !(item.dailyKline || []).length) return "真实日K暂无；不绘制假K线。";
  if (period === "intraday" && !(item.intraday || []).length) return "真实分时暂无；不绘制假线。";
  return `数据状态：${getQuoteModeLabel(item.quoteStatus)}；更新时间 ${item.quote?.time || "未知"}`;
}

function getMarketStatus() {
  const parts = getChinaDateParts();
  const tradingDay = parts.day >= 1 && parts.day <= 5;
  const minutes = parts.hour * 60 + parts.minute;
  if (!tradingDay) return { isTradingDay: false, session: "closed", label: "休市" };
  if (minutes >= 570 && minutes <= 690) return { isTradingDay: true, session: "trading", label: "盘中" };
  if (minutes > 690 && minutes < 780) return { isTradingDay: true, session: "midday", label: "午间休市" };
  if (minutes >= 780 && minutes <= 900) return { isTradingDay: true, session: "trading", label: "盘中" };
  if (minutes > 900) return { isTradingDay: true, session: "closed", label: "已收盘" };
  return { isTradingDay: true, session: "closed", label: "非交易时段" };
}

function scheduleAutoRefresh() {
  clearTimeout(appState.autoTimer);
  if (marketStatus.session !== "trading") return;
  appState.autoTimer = setTimeout(() => refreshQuotes({ silent: true }), appState.refreshInterval);
}

function startCountdown() {
  clearInterval(appState.countdownTimer);
  appState.countdownTimer = setInterval(updateStatusText, 1000);
}

function handleInteraction(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  event.preventDefault();
  switch (action) {
    case "show-detail":
      appState.selectedSymbol = target.dataset.symbol;
      renderApp();
      return;
    case "close-detail":
      appState.selectedSymbol = null;
      renderApp();
      return;
    case "refresh-quotes":
      refreshQuotes();
      return;
    case "refresh-analysis":
      refreshAnalysis();
      return;
    case "refresh-one": {
      const item = findSecurity(target.dataset.symbol);
      if (item) refreshSecurity(item).finally(renderApp);
      return;
    }
    case "add-holding":
      addSecurityToHolding(target.dataset.symbol);
      return;
    case "add-watch":
      addSecurityToWatch(target.dataset.symbol);
      return;
    case "remove-security":
      removeSecurity(target.dataset.symbol);
      return;
    case "switch-detail-chart":
      appState.selectedChartPeriod = target.dataset.period;
      renderDetailSheet();
      return;
    case "toggle-section":
      toggleSection(target.dataset.targetSection);
      return;
    case "open-section":
      openSection(target.dataset.targetSection);
      return;
    case "set-view":
      setView(target.dataset.targetView);
      return;
    case "top":
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    default:
      return;
  }
}

function handleViewClick(event) {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  event.preventDefault();
  setView(button.dataset.view);
}

function setView(view) {
  if (!sectionMap[view]) return;
  appState.currentView = view;
  if (location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
  renderApp();
  document.getElementById("moduleRoot")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getCurrentSections() {
  const ids = sectionMap[appState.currentView]?.sections || [];
  const seen = new Set();
  return ids.map((id) => appState.sections.find((item) => item.id === id)).filter((item) => item && !seen.has(item.id) && seen.add(item.id));
}

function toggleSection(sectionId) {
  if (appState.expandedSections.has(sectionId)) appState.expandedSections.delete(sectionId);
  else appState.expandedSections.add(sectionId);
  renderApp();
}

function openSection(sectionId) {
  const targetGroup = Object.entries(sectionMap).find(([, config]) => config.sections.includes(sectionId))?.[0];
  if (targetGroup) appState.currentView = targetGroup;
  appState.expandedSections.add(sectionId);
  renderApp();
}

function isSectionOpen(item) {
  return item.fixedOpen || appState.expandedSections.has(item.id);
}

function dedupeRenderedSections() {
  const seen = new Set();
  document.querySelectorAll(".module-card[data-section-id]").forEach((node) => {
    const id = node.dataset.sectionId;
    if (seen.has(id)) node.remove();
    seen.add(id);
  });
}

function updateActiveUI() {
  document.querySelectorAll(".segment [data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === appState.currentView));
  const active = document.querySelector(`.segment [data-view="${appState.currentView}"]`);
  const indicator = document.querySelector(".segment-indicator");
  const segment = document.querySelector(".segment");
  if (active && indicator && segment) {
    const s = segment.getBoundingClientRect();
    const b = active.getBoundingClientRect();
    indicator.style.width = `${b.width}px`;
    indicator.style.transform = `translateX(${b.left - s.left}px)`;
  }
}

function updateStatusText() {
  setText("reportDate", sourceData.date);
  setText("reportTime", getLastRealText());
  setText("analysisStatus", "评分为主观预期");
  setText("liveQuoteStatus", `${getQuoteModeLabel(appState.quoteMode)} / ${marketStatus.label}`);
}

function revealCards() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".reveal-card, .mini-card").forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 45, 540)}ms`);
      node.classList.add("is-visible");
    });
  });
}

function initInteractions() {
  if (appState.initialized) return;
  appState.initialized = true;
  document.addEventListener("click", handleInteraction);
  document.addEventListener("click", handleViewClick);
  document.addEventListener("submit", handleSubmit);
  window.addEventListener("resize", () => renderApp());
}

function init() {
  renderApp();
  initInteractions();
  scheduleAutoRefresh();
  startCountdown();
}

function sectionClass(item) { return item.type === "risk" ? "risk-zone" : item.type === "news" ? "news-zone" : item.type === "watch" ? "watch-zone" : item.type === "logic" ? "logic-zone" : item.type === "quote" ? "quote-zone" : ""; }
function getInitialView() { const hash = location.hash.replace("#", ""); return hash === "trend" ? "quote" : sectionMap[hash] ? hash : "action"; }
function getViewLabel(view) { return { action: "Action", quote: "Quote", news: "News", logic: "Logic" }[view] || ""; }
function getApiBase() { return String(sourceData.apiBase || "").replace(/\/$/, ""); }
function getLastRealText() { return appState.lastRealUpdated ? `最后真实更新 ${appState.lastRealUpdated}` : "暂无真实更新时间"; }
function getNextRefreshText() { return marketStatus.session === "trading" ? `盘中每${Math.round(appState.refreshInterval / 1000)}秒刷新` : "非盘中不自动频繁刷新"; }
function getQuoteModeLabel(mode) { return { realtime: "实时行情", delayed: "延迟行情", failed: "行情获取失败", static: "静态信息" }[mode] || "行情获取失败"; }
function getQuoteModeDescription() { return getApiBase() ? "通过代理接口请求真实行情。" : "未配置后端代理，页面不生成假价格。"; }
function chooseGlobalQuoteMode(modes) { if (modes.includes("realtime")) return "realtime"; if (modes.includes("delayed")) return "delayed"; return "failed"; }
function newsTone(item) { if (item.type === "positive") return "positive"; if (item.type === "risk" || item.type === "negative") return "risk"; return "neutral"; }
function decisionTone(type) { if (type.includes("买")) return "buy"; if (type.includes("禁止")) return "stop"; if (type.includes("卖")) return "sell"; return "hold"; }
function getScoreColor(score) { const colors = { 1: "#83bd95", 2: "#a8d2ae", 3: "#cfe9cf", 4: "#e8f5e8", 5: "#fffdf8", 6: "#ffece7", 7: "#ffd6cc", 8: "#f5b9ab", 9: "#e79684", 10: "#d87563" }; return colors[Math.round(clampScore(score))] || colors[5]; }
function clampScore(value) { return Math.max(1, Math.min(10, Number(value) || 5)); }
function scoreToLabel(score) { if (score >= 8) return "明显看涨"; if (score > 5) return "轻度看涨"; if (score === 5) return "中性"; if (score >= 3) return "轻度看跌"; return "明显看跌"; }
function scoreToDirection(score) { if (score > 5) return "up"; if (score < 5) return "down"; return "flat"; }
function formatScore(score) { return Number(score).toFixed(Number(score) % 1 ? 1 : 0); }
function changeClass(value) { if (value > 0) return "up"; if (value < 0) return "down"; return "flat"; }
function getTypeLabel(type) { return { stock: "股票", exchange_fund: "ETF/LOF", open_fund: "开放式基金" }[type] || "标的"; }
function inferType(code = "") { return /^00[0-9]{4}$|^60|^68|^30/.test(String(code)) ? "stock" : /^[15]/.test(String(code)) ? "exchange_fund" : "open_fund"; }
function inferMarket(code = "") { if (/^(5|6|9)/.test(String(code))) return "SH"; if (/^(0|1|2|3)/.test(String(code))) return "SZ"; return "OF"; }
function toSymbol(item) { const market = item.market || inferMarket(item.code); return `${market}${item.code}`; }
function findSecurity(symbol) { return [...appState.holdings, ...appState.watchlist, ...appState.searchResults].find((item) => item.symbol === symbol); }
function findSearchResult(symbol) { return appState.searchResults.find((item) => item.symbol === symbol) || normalizeSearchItems(sourceData.searchUniverse || []).find((item) => item.symbol === symbol); }
function ensureDetailShape(item) {
  if (!item) return null;
  return {
    ...item,
    prediction: item.prediction || normalizePrediction({ predictionScore: 5, action: "观察", reason: "等待真实行情。" }),
    quote: item.quote || null,
    quoteStatus: item.quoteStatus || (item.quote ? item.quote.mode : "failed"),
    quoteError: item.quoteError || "暂无真实数据",
    intraday: item.intraday || [],
    dailyKline: item.dailyKline || [],
    fundInfo: item.fundInfo || null,
    support: item.support || "",
    resistance: item.resistance || "",
    invalidCondition: item.invalidCondition || "没有真实行情不交易"
  };
}
function numericOrNull(value) { const number = Number(value); return Number.isFinite(number) ? number : null; }
function formatPrice(value) { return value == null ? "--" : Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, ""); }
function formatPercent(value) { return value == null ? "--" : `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}%`; }
function formatVolume(value) { const n = Number(value || 0); if (!n) return "--"; return n >= 100000000 ? `${(n / 100000000).toFixed(2)}亿` : n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(Math.round(n)); }
function formatAmount(value) { const n = Number(value || 0); if (!n) return "--"; return n >= 100000000 ? `${(n / 100000000).toFixed(2)}亿` : n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(Math.round(n)); }
function formatDateAxis(value) { return String(value || "").slice(5) || "--"; }
function formatMinute(value) { return String(value || "").slice(11, 16) || String(value || "").slice(0, 5); }
function toTimestamp(value) { return Math.floor(new Date(String(value).replace(" ", "T")).getTime() / 1000); }
function getChinaDateParts() { const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Shanghai", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()); const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }; return { day: dayMap[parts.find((p) => p.type === "weekday")?.value] ?? 0, hour: Number(parts.find((p) => p.type === "hour")?.value || 0), minute: Number(parts.find((p) => p.type === "minute")?.value || 0) }; }
function getDateTimeText() { return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()).replace(/\//g, "-"); }
function setText(id, value) { const node = document.getElementById(id); if (node) node.textContent = value || "--"; }
function createEl(tag, className) { const node = document.createElement(tag); if (className) node.className = className; return node; }
function escapeText(value) { return String(value ?? ""); }

init();
