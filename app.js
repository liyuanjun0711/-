const sourceData = window.MARKET_BRIEFING_DATA || {};
const chartLib = window.LightweightCharts;

const sectionMap = {
  action: {
    title: "今日操作",
    subtitle: "只放今天最重要的动作、风险和执行条件",
    sections: ["trade-decision", "one-sentence", "execution-list", "trade-plan", "do-not-do"]
  },
  quote: {
    title: "持仓行情与走势",
    subtitle: "真实价格、历史数据、图表和主观评分分开看",
    sections: ["quote-search", "holding-quotes", "prediction-overview", "risk-trigger", "quote-watchlist"]
  },
  news: {
    title: "市场新闻与机会",
    subtitle: "先看影响持仓，再看观察池和市场消息",
    sections: ["holding-news", "market-risk", "hot-review", "sector-move", "watchlist"]
  },
  logic: {
    title: "今日交易逻辑",
    subtitle: "把行情、K线、成交量和新闻信号拆开复盘",
    sections: ["reasoning", "invalid-conditions", "learning-framework", "cancel-plan", "next-watch"]
  }
};

const apiBase = getApiBase();
const appState = {
  currentView: getInitialView(),
  marketStatus: getLocalMarketStatus(),
  quoteMode: "failed",
  quoteError: "真实行情待刷新",
  lastUpdated: sourceData.lastUpdated || null,
  lastRealUpdated: null,
  refreshInterval: Number(sourceData.refreshInterval || 10000),
  holdings: normalizeSecurities(sourceData.holdings || []),
  watchlist: normalizeWatchlist(sourceData.watchlist || []),
  news: loadCachedNewsItems(),
  newsCacheInfo: loadJson("news-cache", null),
  sections: [],
  expandedSections: new Set(["trade-decision", "quote-search", "holding-quotes", "holding-news", "reasoning"]),
  isRefreshingQuote: false,
  isRefreshingNews: false,
  isRefreshingAnalysis: false,
  searchKeyword: "",
  securitySearchResults: [],
  newsSearchResults: [],
  searchError: "",
  selectedSymbol: null,
  selectedNewsId: null,
  selectedChartPeriod: "intraday",
  pinnedSymbols: new Set(loadJson("pinnedSymbols", [])),
  recentSecurities: loadJson("recentSecurities", []),
  recentNews: loadJson("recentNews", []),
  readNews: new Set(loadJson("readNews", [])),
  previousPredictionSnapshot: loadJson("prediction-history", {}),
  predictionHistory: loadJson("prediction-history", {}),
  refreshTasks: [],
  toast: null,
  initialized: false
};

appState.sections = buildSections();
hydrateCachedMarketData();

const dataProvider = {
  async search(keyword) {
    const value = keyword.trim();
    if (!value) return [];
    const payload = await requestJson(`${apiBase}/api/search?keyword=${encodeURIComponent(value)}`);
    if (!payload.ok) throw new Error(payload.message || "搜索接口失败");
    return normalizeSearchItems(payload.items || []);
  },
  async getMarketStatus(symbol) {
    const url = symbol ? `${apiBase}/api/market-status?symbol=${encodeURIComponent(symbol)}` : `${apiBase}/api/market-status`;
    const payload = await requestJson(url);
    if (!payload.ok) throw new Error(payload.message || "市场状态接口失败");
    return normalizeRemoteMarketStatus(payload);
  },
  async getLastTradingDay(symbol) {
    const payload = await requestJson(`${apiBase}/api/last-trading-day?symbol=${encodeURIComponent(symbol)}`);
    if (!payload.ok) throw new Error(payload.message || "最近交易日接口失败");
    return payload.tradeDate;
  },
  async getQuote(symbol) {
    const payload = await requestJson(`${apiBase}/api/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!payload.ok) throw new Error(payload.message || "真实行情暂不可用");
    return normalizeQuote(payload);
  },
  async getIntraday(symbol, tradeDate) {
    const suffix = tradeDate ? `&tradeDate=${encodeURIComponent(tradeDate)}` : "";
    const payload = await requestJson(`${apiBase}/api/intraday?symbol=${encodeURIComponent(symbol)}${suffix}`);
    if (!payload.ok) throw new Error(payload.message || "真实分时获取失败");
    return normalizeIntraday(payload);
  },
  async getDailyKline(symbol, count = 120, period = "day") {
    const endpoint = `${apiBase}/api/kline?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}&count=${encodeURIComponent(count)}`;
    const payload = await requestJson(endpoint);
    if (!payload.ok) throw new Error(payload.message || "真实K线获取失败");
    return normalizeKline(payload);
  },
  async getHistory(symbol, range = "30d") {
    const payload = await requestJson(`${apiBase}/api/history?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}`);
    if (!payload.ok) throw new Error(payload.message || "真实历史行情获取失败");
    return normalizeKline(payload);
  },
  async getTradingDays(symbol) {
    const payload = await requestJson(`${apiBase}/api/trading-days?symbol=${encodeURIComponent(symbol)}`);
    if (!payload.ok) throw new Error(payload.message || "真实交易日获取失败");
    return payload;
  },
  async getDailySummary(symbol, tradeDate) {
    const suffix = tradeDate ? `&tradeDate=${encodeURIComponent(tradeDate)}` : "";
    const payload = await requestJson(`${apiBase}/api/daily-summary?symbol=${encodeURIComponent(symbol)}${suffix}`);
    if (!payload.ok) throw new Error(payload.message || "日行情摘要获取失败");
    return normalizeDailySummary(payload);
  },
  async getLastValidQuote(symbol) {
    const payload = await requestJson(`${apiBase}/api/last-valid-quote?symbol=${encodeURIComponent(symbol)}`);
    if (!payload.ok) throw new Error(payload.message || "最近有效行情获取失败");
    return normalizeQuote(payload);
  },
  async getFundInfo(symbol) {
    const payload = await requestJson(`${apiBase}/api/fund?symbol=${encodeURIComponent(symbol)}`);
    if (!payload.ok) throw new Error(payload.message || "基金净值获取失败");
    return payload;
  },
  async getNews(keyword = "") {
    const symbols = [...appState.holdings, ...appState.watchlist].map((item) => item.symbol).filter(Boolean).join(",");
    const keywords = buildNewsKeywords(keyword).join(",");
    const payload = await requestJson(`${apiBase}/api/news?symbols=${encodeURIComponent(symbols)}&keywords=${encodeURIComponent(keywords)}`);
    if (!payload.ok) throw new Error(payload.message || "新闻接口失败");
    return normalizeNews(payload.items || []);
  }
};

let chartInstance = null;
let chartPointRows = new Map();
let quoteRefreshTimer = null;
let newsRefreshTimer = null;

function buildSections() {
  return [
    section("trade-decision", "action", "Primary", "今日操作结论", "decision", true, renderTodayDecision),
    section("one-sentence", "action", "一句话", "今日一句话", "decision", false, renderOneSentence),
    section("execution-list", "action", "执行", "执行清单", "quote", false, renderExecutionList),
    section("trade-plan", "action", "计划", "交易计划", "decision", false, renderTradePlan),
    section("do-not-do", "action", "纪律", "今日禁止操作", "risk", false, renderDoNotDo),
    section("quote-search", "quote", "查询", "股票 / ETF / LOF / 基金统一查询", "quote", true, renderGlobalSearch),
    section("holding-quotes", "quote", "持仓", "持仓行情列表", "quote", true, renderHoldingQuotes),
    section("prediction-overview", "quote", "评分", "今日评分总览", "expectation", false, renderPredictionOverview),
    section("risk-trigger", "quote", "风险", "风险触发提醒", "risk", false, renderRiskTrigger),
    section("quote-watchlist", "quote", "观察池", "观察池行情列表", "watch", false, renderQuoteWatchlist),
    section("holding-news", "news", "持仓", "持仓相关新闻", "news", true, renderHoldingNews),
    section("market-risk", "news", "风险", "全市场重大风险", "risk", false, renderMarketRisk),
    section("hot-review", "news", "24小时", "过去24小时热点", "news", false, renderHotReview),
    section("sector-move", "news", "板块", "板块机会与异动", "news", false, renderSectorMove),
    section("watchlist", "news", "观察池", "观察池新闻与条件", "watch", false, renderWatchlistNews),
    section("reasoning", "logic", "依据", "今日判断依据", "logic", true, renderReasoning),
    section("invalid-conditions", "logic", "失效", "判断失效条件", "risk", false, renderInvalidConditions),
    section("learning-framework", "logic", "框架", "关键判断框架", "logic", false, renderLearningFramework),
    section("cancel-plan", "logic", "取消", "取消交易计划", "risk", false, renderCancelPlan),
    section("next-watch", "logic", "明日", "明日观察重点", "logic", false, renderNextWatch)
  ];
}

function section(id, group, eyebrow, title, type, fixedOpen, render) {
  return { id, group, eyebrow, title, type, fixedOpen, render };
}

function renderApp() {
  const root = document.getElementById("moduleRoot");
  root.innerHTML = "";
  root.appendChild(renderSectionHeader(appState.currentView));
  const refreshPanel = renderRefreshStatePanel();
  if (refreshPanel) root.appendChild(refreshPanel);
  getCurrentSections().forEach((item, index) => root.appendChild(renderSection(item, index === 0)));
  const toast = renderToast();
  if (toast) root.appendChild(toast);
  renderSecurityDetailSheet();
  renderNewsDetailSheet();
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
      <span>${getMarketStatusLabel(appState.marketStatus.status || appState.marketStatus.session)}</span>
      <small>${getLastRealText()}</small>
    </div>
  `;
  return header;
}

function renderRefreshStatePanel() {
  if (!appState.refreshTasks.length) return null;
  const panel = createEl("section", "refresh-state-panel reveal-card");
  panel.innerHTML = `
    <div class="refresh-pulse" aria-hidden="true"></div>
    <div>
      <strong>${escapeText(appState.refreshTasks[0].label)}</strong>
      <span>${escapeText(appState.refreshTasks.map((task) => task.detail).filter(Boolean).join(" / ") || "请求真实数据源，失败时保留缓存，不生成假数据。")}</span>
    </div>
  `;
  return panel;
}

function renderToast() {
  if (!appState.toast) return null;
  const toast = createEl("div", `toast ${appState.toast.type || "info"}`);
  toast.textContent = appState.toast.message;
  return toast;
}

function startRefreshTask(id, label, detail = "") {
  appState.refreshTasks = appState.refreshTasks.filter((task) => task.id !== id);
  appState.refreshTasks.push({ id, label, detail, startedAt: Date.now() });
  appState.toast = null;
}

function finishRefreshTask(id) {
  appState.refreshTasks = appState.refreshTasks.filter((task) => task.id !== id);
}

function showToast(message, type = "info") {
  appState.toast = { message, type, time: Date.now() };
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    if (appState.toast?.message === message) {
      appState.toast = null;
      renderApp();
    }
  }, 3200);
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
        <p class="section-label">${escapeText(item.eyebrow)}</p>
        <h2>${escapeText(item.title)}</h2>
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

function renderTodayDecision(container) {
  const wrap = createEl("div", "decision-grid");
  (sourceData.tradeDecision || []).slice(0, 4).forEach((item) => {
    const card = createEl("article", `decision-card mini-card ${decisionTone(item.type)}`);
    card.innerHTML = `<span class="label">${escapeText(item.type)}</span><strong>${escapeText(item.title)}</strong><p><b>结论：</b>${escapeText(item.conclusion)}</p><p><b>动作：</b>${escapeText(item.action)}</p><p><b>条件：</b>${escapeText(item.trigger)}</p><p><b>原因：</b>${escapeText(item.reason)}</p><small>仅供个人复盘参考，不构成投资建议。</small>`;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderThesisTracker(container) {
  const items = sortPinned(appState.holdings).slice(0, 6).map((item) => {
    const previous = getPreviousPrediction(item);
    const current = item.prediction || normalizePrediction(item);
    const record = getDisplayRecord(item);
    const delta = previous?.predictionScore ? current.predictionScore - previous.predictionScore : 0;
    const status = !previous ? "新基准" : Math.abs(delta) < 0.5 ? "继续跟踪" : delta > 0 ? "逻辑增强" : "逻辑减弱";
    const evidence = record?.changePercent != null
      ? `真实涨跌幅${formatPercent(record.changePercent)}，最新价/收盘价${formatPrice(record.price ?? record.close)}。`
      : "真实行情不足，只保留上次观点，不做新判断。";
    return {
      title: `${item.name} ${item.code}`,
      basis: previous ? `前次：${formatScore(previous.predictionScore)}分 / ${previous.action || previous.predictionLabel || "未记录动作"}` : "首次纳入观点追踪。",
      inference: `${status}：${current.scoreChangeReason || current.reason}`,
      conclusion: `${evidence}${current.action ? ` 动作：${current.action}` : ""}`,
      invalidCondition: current.invalidCondition || item.invalidCondition || "跌破支撑、放量转弱或相关新闻证伪。"
    };
  });
  container.appendChild(renderShortCards(items));
}

function renderOneSentence(container) {
  const card = createEl("article", "info-card mini-card");
  card.innerHTML = `<strong>${escapeText(sourceData.oneLine || "等真实行情确认，不做临场加仓。")}</strong><p>仅供个人复盘参考，不构成投资建议；页面不生成、不补全任何假行情。</p>`;
  container.appendChild(card);
}

function renderExecutionList(container) {
  container.appendChild(renderBulletList(sourceData.executionOrder || [], "execution-list"));
}

function renderTradePlan(container) {
  const items = sourceData.tradePlan?.length ? sourceData.tradePlan : (sourceData.tradeDecision || []);
  container.appendChild(renderShortCards(items));
}

function renderMustHandle(container) {
  const must = appState.holdings.filter((item) => /卖|减|触发|风险|先/.test(item.action + item.invalidCondition + item.prediction.riskLevel)).slice(0, 4);
  container.appendChild(renderSecurityList(must.length ? must : appState.holdings.slice(0, 3), { compact: true }));
}

function renderDoNotDo(container) {
  container.appendChild(renderBulletList(sourceData.noTradeList || [], "no-trade-list"));
}

function renderHighRisk(container) {
  const risks = [...(sourceData.riskOverview || [])].sort((a, b) => riskRank(b.priority || b.title) - riskRank(a.priority || a.title));
  container.appendChild(renderRiskCards(risks));
}

function renderPlanNews(container) {
  container.appendChild(renderNewsFeed(getNewsByRelation("holding").slice(0, 3), { emptyText: "暂无直接改变今日计划的新闻。" }));
}

function renderGlobalSearch(container) {
  container.appendChild(renderQuoteStatusPanel());
  const panel = createEl("div", "stock-search-panel");
  panel.innerHTML = `
    <form class="stock-search-form" data-role="global-search">
      <label for="globalSearchInput">全局搜索</label>
      <div>
        <input id="globalSearchInput" name="keyword" type="search" placeholder="股票代码、基金代码、名称或新闻关键词" autocomplete="off" value="${escapeAttr(appState.searchKeyword)}">
        <button class="primary-btn compact" type="submit">搜索</button>
      </div>
    </form>
    <div id="stockSearchState" class="search-state">${escapeText(appState.searchError || "可查本地代码索引和新闻关键词；真实价格需要代理接口。")}</div>
    <div id="stockSearchResults" class="search-results"></div>
    ${renderRecentViews()}
  `;
  renderSearchResults(panel.querySelector("#stockSearchResults"));
  container.appendChild(panel);
}

function renderQuoteStatusPanel() {
  const panel = createEl("div", `quote-status-panel mode-${appState.quoteMode}`);
  panel.innerHTML = `
    <div>
      <span class="label">真实行情状态</span>
      <strong>${getQuoteModeLabel(appState.quoteMode)}</strong>
      <p>${escapeText(appState.quoteError || getQuoteModeDescription())}</p>
    </div>
    <div class="quote-status-actions">
      <span>${getMarketStatusLabel(appState.marketStatus.status || appState.marketStatus.session)}</span>
      <small>${getNextRefreshText()}</small>
          <button class="secondary-btn compact ${appState.isRefreshingQuote ? "is-refreshing" : ""}" type="button" data-action="refresh-quotes" ${appState.isRefreshingQuote ? "disabled" : ""}>${appState.isRefreshingQuote ? "正在更新行情" : "刷新行情"}</button>
          <button class="secondary-btn compact ${appState.isRefreshingNews ? "is-refreshing" : ""}" type="button" data-action="refresh-news" ${appState.isRefreshingNews ? "disabled" : ""}>${appState.isRefreshingNews ? "正在获取新闻" : "刷新新闻"}</button>
    </div>
  `;
  return panel;
}

function renderRecentViews() {
  const securityItems = appState.recentSecurities.slice(0, 4).map((symbol) => findSecurity(symbol) || findSearchResult(symbol)).filter(Boolean);
  const newsItems = appState.recentNews.slice(0, 3).map((id) => appState.news.find((item) => item.id === id)).filter(Boolean);
  if (!securityItems.length && !newsItems.length) return "";
  return `<div class="recent-panel"><span class="label">最近查看</span><div class="recent-list">${securityItems.map((item) => `<button type="button" class="chip-btn" data-action="show-detail" data-symbol="${escapeAttr(item.symbol)}">${escapeText(item.name)}</button>`).join("")}${newsItems.map((item) => `<button type="button" class="chip-btn" data-action="show-news-detail" data-news-id="${escapeAttr(item.id)}">${escapeText(item.title)}</button>`).join("")}</div></div>`;
}

function renderSearchResults(container) {
  container.innerHTML = "";
  appState.securitySearchResults.forEach((item) => {
    const row = createEl("article", "search-result mini-card");
    row.innerHTML = `
      <div>
        <strong>${escapeText(item.name)}</strong>
        <span>${escapeText(item.code)} / ${escapeText(item.market)} / ${getTypeLabel(item.type)}</span>
        <small>${item.quote ? quoteLine(item.quote, item.type) : "暂无真实行情；可查看详情或加入观察。"}</small>
      </div>
      <div>
        <button class="secondary-btn compact" type="button" data-action="show-detail" data-symbol="${escapeAttr(item.symbol)}">查看详情</button>
        <button class="secondary-btn compact" type="button" data-action="add-holding" data-symbol="${escapeAttr(item.symbol)}">加入持仓</button>
        <button class="secondary-btn compact" type="button" data-action="add-watch" data-symbol="${escapeAttr(item.symbol)}">加入观察</button>
      </div>
    `;
    container.appendChild(row);
  });
  appState.newsSearchResults.forEach((item) => {
    const row = createEl("article", `search-result mini-card news-search ${impactTone(item)}`);
    row.innerHTML = `<div><strong>${escapeText(item.title)}</strong><span>${escapeText(item.source)} / ${escapeText(item.publishTime)}</span><small>${escapeText(item.summary)}</small></div><div><button class="secondary-btn compact" type="button" data-action="show-news-detail" data-news-id="${escapeAttr(item.id)}">查看新闻</button></div>`;
    container.appendChild(row);
  });
}

function renderHoldingQuotes(container) {
  container.appendChild(renderSecurityList(sortPinned(appState.holdings), { compact: false }));
}

function renderQuoteWatchlist(container) {
  container.appendChild(renderSecurityList(appState.watchlist, { compact: true, watch: true }));
}

function renderSecurityList(items, options = {}) {
  const wrap = createEl("div", options.watch ? "watch-card-list" : "holding-list compact-holdings");
  if (!items.length) {
    wrap.innerHTML = `<div class="empty-card">暂无标的。</div>`;
    return wrap;
  }
  items.forEach((item) => {
    const card = createEl("article", `holding-card quote-card mini-card clickable-card ${appState.pinnedSymbols.has(item.symbol) ? "is-pinned" : ""}`);
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
        <span>${getSecurityStatusLabel(item)}</span>
        <span>${getSecurityUpdateText(item)}</span>
        <span>${item.quoteError && !hasAnyRealData(item) ? escapeText(item.quoteError) : getDataDateText(item)}</span>
      </div>
      <div class="score-strip">
        <strong>规则评分：${formatScore(item.prediction.predictionScore)} / 10</strong>
        <small>${renderScoreChangeText(item.prediction)}</small>
        <span>${escapeText(item.prediction.predictionLabel)}｜${escapeText(item.prediction.reason)}</span>
        <em>${escapeText(item.prediction.action)}；仅供个人复盘参考</em>
      </div>
      <div class="card-actions">
        <button class="secondary-btn compact" type="button" data-action="pin-security" data-symbol="${escapeAttr(item.symbol)}">${appState.pinnedSymbols.has(item.symbol) ? "取消置顶" : "置顶"}</button>
        <button class="primary-btn compact" type="button" data-action="show-detail" data-symbol="${escapeAttr(item.symbol)}">查看详情</button>
      </div>
    `;
    wrap.appendChild(card);
  });
  return wrap;
}

function renderPredictionOverview(container) {
  const wrap = createEl("div", "expectation-list");
  sortPinned(appState.holdings).forEach((item) => {
    const card = createEl("article", "expectation-card expect-card mini-card");
    card.style.setProperty("--expect-bg", getScoreColor(item.prediction.predictionScore));
    card.innerHTML = `
      <div class="expect-top">
        <div><strong>${escapeText(item.name)} ${escapeText(item.code)}</strong><span>主观评分，不是行情数据</span></div>
        <span class="expect-pill">${formatScore(item.prediction.predictionScore)} / 10</span>
      </div>
      <dl>
        <div><dt>方向</dt><dd>${escapeText(item.prediction.predictionLabel)}</dd></div>
        <div><dt>建议</dt><dd>${escapeText(item.prediction.action)}</dd></div>
        <div><dt>触发</dt><dd>${escapeText(item.resistance || item.prediction.trigger || "等真实价格确认")}</dd></div>
        <div><dt>失效</dt><dd>${escapeText(item.prediction.invalidCondition)}</dd></div>
      </dl>
      ${renderScoreBreakdown(item.prediction)}
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderRiskTrigger(container) {
  const items = appState.holdings.map((item) => `${item.name} ${item.code}：${item.invalidCondition || item.prediction.invalidCondition}`);
  container.appendChild(renderBulletList(items, "invalid-list"));
}

function renderHoldingNews(container) {
  container.appendChild(renderNewsFeed(getNewsByRelation("holding"), { emptyText: "暂无真实持仓相关新闻。" }));
}

function renderTopNews(container) {
  const items = [...appState.news].sort((a, b) => b.importance - a.importance).slice(0, 3);
  if (appState.searchError || appState.newsCacheInfo?.cached) {
    const error = createEl("div", "empty-card");
    error.textContent = appState.searchError || `新闻使用缓存数据：${appState.newsCacheInfo.savedAt || "时间未知"}`;
    container.appendChild(error);
  }
  container.appendChild(renderNewsFeed(items, { emptyText: "暂无真实新闻数据；不会生成假新闻。可点刷新新闻重试。" }));
}

function renderMarketNews(container) {
  container.appendChild(renderNewsFeed(getNewsByRelation("market").concat(getNewsByRelation("watch")), { emptyText: "暂无真实市场与行业新闻。" }));
}

function renderMarketRisk(container) {
  const items = appState.news.filter((item) => inferNewsRelation(item) === "market" && ["negative", "risk"].includes(item.impactType));
  container.appendChild(renderNewsFeed(items, { emptyText: "暂无新增重大风险新闻；继续按触发价和仓位纪律执行。" }));
}

function renderHotReview(container) {
  const items = appState.news.filter((item) => inferNewsRelation(item) === "market").sort((a, b) => b.importance - a.importance).slice(0, 5);
  container.appendChild(renderNewsFeed(items, { emptyText: "暂无过去24小时真实热点新闻。" }));
}

function renderSectorMove(container) {
  const items = appState.news.filter((item) => ["holding", "watch", "market"].includes(inferNewsRelation(item))).slice(0, 6);
  container.appendChild(renderNewsFeed(items, { emptyText: "暂无可核对的板块异动新闻。" }));
}

function renderWatchlistNews(container) {
  const items = getNewsByRelation("watch");
  container.appendChild(renderNewsFeed(items, { emptyText: "暂无观察池相关新闻；观察池仍按买入条件执行。" }));
}

function renderReadNews(container) {
  container.appendChild(renderNewsFeed(appState.news.filter((item) => appState.readNews.has(item.id)), { emptyText: "暂无已读新闻。" }));
}

function renderNewsFeed(items, options = {}) {
  const wrap = createEl("div", "news-list");
  if (!items.length) {
    wrap.innerHTML = `<div class="empty-card">${escapeText(options.emptyText || "暂无新闻。")}</div>`;
    return wrap;
  }
  items.forEach((item) => {
    const read = appState.readNews.has(item.id);
    const card = createEl("article", `news-item mini-card ${impactTone(item)} ${read ? "is-read" : ""}`);
    card.innerHTML = `
      <div class="news-card-head">
        <span>${escapeText(item.source)} · ${escapeText(item.publishTime)}</span>
        <em>${getImpactLabel(item)} ${item.impactScore}/10</em>
      </div>
      <h3>${escapeText(item.title)}</h3>
      <p>${escapeText(item.summary)}</p>
      <div class="news-meta-row">
        <span>${escapeText(item.location)} / ${escapeText(getRelationLabel(item))}</span>
        <span>${(item.relatedStocks || []).map((stock) => escapeText(stock)).join("、") || "市场整体"}</span>
      </div>
      <small>${escapeText(item.peopleOrOrg.join("、") || "主体未披露")}：${escapeText(item.event || "事件未披露")}</small>
      <button class="secondary-btn compact" type="button" data-action="show-news-detail" data-news-id="${escapeAttr(item.id)}">查看详情</button>
    `;
    wrap.appendChild(card);
  });
  return wrap;
}

function renderReasoning(container) {
  container.appendChild(renderShortCards([...buildMarketLogicCards(), ...(sourceData.reasoning || [])].slice(0, 8)));
}

function renderInvalidConditions(container) {
  container.appendChild(renderBulletList(sourceData.invalidConditions || [], "invalid-list"));
}

function renderNextWatch(container) {
  container.appendChild(renderShortCards(sourceData.nextWatch || []));
}

function renderLearningFramework(container) {
  container.appendChild(renderShortCards(sourceData.learningFramework || []));
}

function renderCancelPlan(container) {
  container.appendChild(renderBulletList(sourceData.cancelPlan || sourceData.invalidConditions || [], "invalid-list"));
}

function buildMarketLogicCards() {
  return sortPinned(appState.holdings).slice(0, 4).map((item) => {
    const record = getDisplayRecord(item);
    const metrics = item.historyMetrics || calculateHistoryMetrics(item.dailyKline || []);
    const price = numericOrNull(record?.price ?? record?.close);
    const support = parseLevel(item.support, "min");
    const resistance = parseLevel(item.resistance, "max");
    const volumeRatio = record?.volume && metrics.avgVolume20 ? record.volume / metrics.avgVolume20 : null;
    const basis = [
      record?.changePercent != null ? `真实涨跌幅${formatPercent(record.changePercent)}` : "真实涨跌幅不足",
      price != null ? `价格${formatPrice(price)}` : "价格不足",
      metrics.fiveDayChange != null ? `5日${formatPercent(metrics.fiveDayChange)}` : "5日数据不足",
      volumeRatio ? `量能${volumeRatio.toFixed(1)}倍` : "量能对比不足"
    ].join("；");
    const inference = price != null && resistance != null && price > resistance
      ? `突破压力位${formatPrice(resistance)}后，交易逻辑从“等确认”转为“观察回踩是否承接”。`
      : price != null && support != null && price < support
        ? `跌破支撑位${formatPrice(support)}后，原先的持有逻辑被削弱，先看止跌而不是加仓。`
        : `价格仍在支撑与压力之间，说明市场还没给出方向确认，操作要靠触发条件而不是情绪。`;
    return {
      title: `${item.name} ${item.code}：为什么这样操作`,
      basis,
      inference,
      conclusion: item.prediction?.action || item.action || "暂不操作",
      invalidCondition: item.prediction?.invalidCondition || item.invalidCondition || "跌破支撑、放量转弱或相关新闻证伪。"
    };
  });
}

function renderSecurityDetailSheet() {
  document.getElementById("detailSheet")?.remove();
  if (!appState.selectedSymbol) return;
  const item = ensureDetailShape(findSecurity(appState.selectedSymbol));
  if (!item) return;
  addRecent("recentSecurities", appState.recentSecurities, item.symbol);
  const sheet = createEl("aside", "detail-sheet");
  sheet.id = "detailSheet";
  sheet.innerHTML = `
    <div class="detail-backdrop" data-action="close-detail"></div>
    <section class="detail-panel">
      <div class="detail-head">
        <div>
          <p class="section-label">${getTypeLabel(item.type)} / ${getSecurityStatusLabel(item)}</p>
          <h2>${escapeText(item.name)}</h2>
          <span>${escapeText(item.symbol)} · ${getSecurityUpdateText(item)}</span>
        </div>
        <button class="icon-btn" type="button" data-action="close-detail" aria-label="关闭">×</button>
      </div>
      ${renderDetailPrice(item)}
      ${renderDataStatusPanel(item)}
      ${renderDetailChartArea(item)}
      ${renderDetailHistory(item)}
      ${renderDetailAdvice(item)}
      <div class="detail-actions">
        <button class="secondary-btn" type="button" data-action="pin-security" data-symbol="${escapeAttr(item.symbol)}">${appState.pinnedSymbols.has(item.symbol) ? "取消置顶" : "置顶"}</button>
        <button class="secondary-btn" type="button" data-action="add-watch" data-symbol="${escapeAttr(item.symbol)}">加入观察</button>
        <button class="secondary-btn" type="button" data-action="remove-security" data-symbol="${escapeAttr(item.symbol)}">移出</button>
        <button class="primary-btn" type="button" data-action="refresh-one" data-symbol="${escapeAttr(item.symbol)}">刷新真实行情</button>
      </div>
    </section>
  `;
  document.body.appendChild(sheet);
  requestAnimationFrame(() => renderDetailChart(item));
}

function renderDetailPrice(item) {
  if (item.type === "open_fund") {
    if (!item.fundInfo) return `<div class="detail-price failed"><strong>暂无真实净值</strong><p>${escapeText(item.quoteError || "基金净值接口未配置")}</p><span>开放式基金按净值披露，不提供盘中分时。</span></div>`;
    return `<div class="detail-price"><strong>${formatPrice(item.fundInfo.nav)}</strong><p>最新净值 / ${escapeText(item.fundInfo.navDate || "净值日期未知")}</p><span>开放式基金按净值披露，不提供盘中分时。</span></div>`;
  }
  const record = getDisplayRecord(item);
  if (!record) return `<div class="detail-price failed"><strong>暂无真实数据</strong><p>${escapeText(item.quoteError || "真实行情暂不可用")}</p><span>不会显示假价格；可配置代理接口后重试。</span></div>`;
  return `
    <div class="detail-price">
      <strong>${formatPrice(record.price ?? record.close)}</strong>
      <p>${getPrimaryPriceLabel(item)} / ${formatPercent(record.changePercent)}</p>
      <div class="price-grid">
        <span>昨收 ${formatPrice(record.preClose)}</span>
        <span>开盘 ${formatPrice(record.open)}</span>
        <span>最高 ${formatPrice(record.high)}</span>
        <span>最低 ${formatPrice(record.low)}</span>
        <span>成交量 ${formatVolume(record.volume)}</span>
        <span>成交额 ${formatAmount(record.amount)}</span>
      </div>
    </div>
  `;
}

function renderDataStatusPanel(item) {
  const quoteOk = Boolean(item.quote || item.summary || item.fundInfo);
  const historyCount = item.dailyKline?.length || 0;
  const intradayCount = item.intraday?.length || 0;
  const chartReady = item.type === "open_fund" ? Boolean(item.fundInfo) : historyCount > 0;
  const source = item.quote?.source || item.summary?.source || item.fundInfo?.source || "暂无";
  const error = item.quoteError || item.chartError || "";
  return `
    <div class="data-status-panel info-card">
      <div class="panel-title-row">
        <strong>数据状态</strong>
        <span>${escapeText(getSecurityUpdateText(item))}</span>
      </div>
      <dl>
        <div><dt>行情</dt><dd>${quoteOk ? `成功，来源 ${escapeText(source)}` : `失败：${escapeText(error || "暂无真实行情")}`}</dd></div>
        <div><dt>历史K线</dt><dd>${historyCount ? `成功，${historyCount} 条` : `失败：${escapeText(item.historyError || "暂无真实历史K线数据")}`}</dd></div>
        <div><dt>分时</dt><dd>${intradayCount ? `成功，${intradayCount} 条` : "暂无当日分时，已保留日K"}</dd></div>
        <div><dt>图表</dt><dd>${chartReady ? "可渲染" : `失败：${escapeText(item.chartError || "没有可绘制K线")}`}</dd></div>
        <div><dt>缓存</dt><dd>${item.usingCache ? `使用缓存 ${escapeText(item.cacheSavedAt || "")}` : "未使用缓存"}</dd></div>
      </dl>
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
          <button class="chart-tab ${period === "week" ? "active" : ""}" type="button" data-action="switch-detail-chart" data-period="week">周K</button>
        `}
      </div>
      <div class="chart-host detail-chart-host" data-detail-chart="${escapeAttr(item.symbol)}"></div>
      <div class="chart-tooltip" hidden></div>
      <small class="chart-state">${chartStateText(item, period)}</small>
    </div>
  `;
}

function renderDetailAdvice(item) {
  const p = item.prediction;
  return `
    <div class="advice-panel" style="--score-bg:${getScoreColor(p.predictionScore)}">
      <strong>今日评分：${formatScore(p.predictionScore)} / 10 · ${escapeText(p.predictionLabel)}</strong>
      <p class="score-change">${escapeText(renderScoreChangeText(p))}</p>
      <dl>
        <div><dt>方向</dt><dd>${escapeText(p.expectedDirection)}</dd></div>
        <div><dt>建议</dt><dd>${escapeText(p.action)}</dd></div>
        <div><dt>触发</dt><dd>${escapeText(item.resistance || p.trigger || "等待真实行情确认")}</dd></div>
        <div><dt>失效</dt><dd>${escapeText(p.invalidCondition)}</dd></div>
        <div><dt>风险</dt><dd>${escapeText(p.riskLevel)}</dd></div>
      </dl>
      ${renderScoreBreakdown(p)}
      <small>行情数据为真实数据；评分和建议为本地规则生成，仅供个人复盘参考，不构成投资建议。</small>
    </div>
  `;
}

function renderScoreChangeText(prediction) {
  if (!prediction?.previousScore) return prediction?.scoreChangeReason || "首次记录，作为后续观点追踪基准。";
  const delta = Number(prediction.scoreDelta || 0);
  return `前次 ${formatScore(prediction.previousScore)} → 本次 ${formatScore(prediction.predictionScore)}（${formatSigned(delta)}）：${prediction.scoreChangeReason || "变化来自本地规则模型。"}`;
}

function renderScoreBreakdown(prediction) {
  const rows = Array.isArray(prediction?.scoreBreakdown) ? prediction.scoreBreakdown : [];
  if (!rows.length) return "";
  return `
    <div class="score-breakdown">
      ${rows.map((row) => `
        <div class="score-factor">
          <div>
            <strong>${escapeText(row.name)}</strong>
            <span>${escapeText(row.why)}</span>
          </div>
          <em class="${Number(row.delta || 0) > 0 ? "up" : Number(row.delta || 0) < 0 ? "down" : "flat"}">${formatScore(row.score)} / 10 · ${formatSigned(row.delta || 0)}</em>
        </div>
      `).join("")}
    </div>
  `;
}

function renderNewsDetailSheet() {
  document.getElementById("newsDetailSheet")?.remove();
  if (!appState.selectedNewsId) return;
  const item = appState.news.find((news) => news.id === appState.selectedNewsId);
  if (!item) return;
  appState.readNews.add(item.id);
  saveJson("readNews", Array.from(appState.readNews));
  addRecent("recentNews", appState.recentNews, item.id);
  const sheet = createEl("aside", "detail-sheet news-detail-sheet");
  sheet.id = "newsDetailSheet";
  sheet.innerHTML = `
    <div class="detail-backdrop" data-action="close-news-detail"></div>
    <section class="detail-panel">
      <div class="detail-head">
        <div>
          <p class="section-label">${escapeText(item.source)} / ${escapeText(item.publishTime)}</p>
          <h2>${escapeText(item.title)}</h2>
          <span>${getImpactLabel(item)} · ${item.impactScore}/10 · ${escapeText(getRelationLabel(item))}</span>
        </div>
        <button class="icon-btn" type="button" data-action="close-news-detail" aria-label="关闭">×</button>
      </div>
      <div class="news-detail-body ${impactTone(item)}">
        <p>${escapeText(item.fullContent || item.summary)}</p>
        <dl>
          <div><dt>地点/市场</dt><dd>${escapeText(item.location)}</dd></div>
          <div><dt>主体</dt><dd>${escapeText(item.peopleOrOrg.join("、") || "未披露")}</dd></div>
          <div><dt>事件</dt><dd>${escapeText(item.event || "未披露")}</dd></div>
          <div><dt>相关标的</dt><dd>${(item.relatedStocks || []).map((stock) => escapeText(stock)).join("、") || "市场整体"}</dd></div>
          <div><dt>为什么重要</dt><dd>${escapeText(item.whyItMatters || "未配置真实影响判断。")}</dd></div>
          <div><dt>对持仓影响</dt><dd>${escapeText(item.holdingImpact || "暂无直接改变持仓计划。")}</dd></div>
          <div><dt>对观察池影响</dt><dd>${escapeText(item.watchImpact || "暂无直接改变观察池计划。")}</dd></div>
          <div><dt>观察条件</dt><dd>${escapeText(item.priceCondition || "观察价格是否突破关键位、成交量是否放大。")}</dd></div>
          <div><dt>是否改变计划</dt><dd>${escapeText(item.planChange || "不改变，按原触发价执行。")}</dd></div>
        </dl>
        <div class="detail-actions single">
          ${item.url ? `<a class="secondary-btn" href="${escapeAttr(item.url)}" target="_blank" rel="noopener">打开原文</a>` : ""}
          <button class="primary-btn" type="button" data-action="close-news-detail">返回</button>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(sheet);
}

function renderDetailChart(item) {
  const host = document.querySelector(".detail-chart-host");
  if (!host || !chartLib) return;
  try {
    chartInstance?.remove?.();
    chartInstance = null;
    item.chartError = "";
    const period = item.type === "open_fund" ? "fund" : appState.selectedChartPeriod;
    if (item.type === "open_fund") {
      host.innerHTML = `<div class="chart-fallback">开放式基金按净值披露；净值曲线需要基金净值接口。</div>`;
      return;
    }
    const fallbackToDaily = period === "intraday" && (!item.intraday || !item.intraday.length) && item.dailyKline?.length;
    const chartPeriod = fallbackToDaily ? "day" : period;
    const data = chartPeriod === "intraday" ? item.intraday : chartPeriod === "week" ? item.weeklyKline : item.dailyKline;
    if (!data || !data.length) {
      item.chartError = chartStateText(item, period);
      host.innerHTML = `<div class="chart-fallback">${escapeText(item.chartError)}</div>`;
      return;
    }
    host.innerHTML = "";
    chartInstance = chartLib.createChart(host, {
      height: 280,
      layout: { background: { color: "rgba(255,255,255,.45)" }, textColor: "#393932" },
      grid: { vertLines: { color: "rgba(30,30,20,.05)" }, horzLines: { color: "rgba(30,30,20,.05)" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: chartPeriod === "intraday",
        tickMarkFormatter: (time) => chartPeriod === "intraday" ? formatMinuteFromTime(time) : formatDateAxisFromTime(time)
      }
    });
    const tooltip = document.querySelector(".chart-tooltip");
    if (chartPeriod === "intraday") {
      const series = addChartSeries(chartInstance, "line", { color: "#2E6B8F", lineWidth: 2 });
      const points = data.map((row) => ({ time: toChartTime(row.time), value: Number(row.price) })).filter((row) => Number.isFinite(row.value));
      chartPointRows = buildChartPointRows(points, data);
      series.setData(points);
      chartInstance.subscribeCrosshairMove((param) => showChartTooltip(param, series, tooltip, item, "intraday"));
    } else {
      const series = addChartSeries(chartInstance, "candlestick", { upColor: "#D92D20", downColor: "#039855", borderUpColor: "#D92D20", borderDownColor: "#039855", wickUpColor: "#D92D20", wickDownColor: "#039855" });
      const points = data.map((row) => ({ time: toChartTime(row.time), open: Number(row.open), high: Number(row.high), low: Number(row.low), close: Number(row.close) }))
        .filter((row) => [row.open, row.high, row.low, row.close].every(Number.isFinite));
      chartPointRows = buildChartPointRows(points, data);
      series.setData(points);
      chartInstance.subscribeCrosshairMove((param) => showChartTooltip(param, series, tooltip, item, "kline"));
    }
    chartInstance.timeScale().fitContent();
    requestAnimationFrame(() => chartInstance?.resize?.(host.clientWidth, 280));
  } catch (error) {
    console.error("chart render failed", error);
    item.chartError = error.message || "图表渲染失败";
    host.innerHTML = `<div class="chart-fallback">图表渲染失败：${escapeText(item.chartError)}</div>`;
  }
}

function addChartSeries(chart, type, options) {
  if (typeof chart.addSeries === "function") {
    const seriesCtor = type === "candlestick" ? chartLib?.CandlestickSeries : chartLib?.LineSeries;
    if (!seriesCtor) throw new Error(`lightweight-charts ${type} series is unavailable`);
    return chart.addSeries(seriesCtor, options);
  }
  if (type === "candlestick" && typeof chart.addCandlestickSeries === "function") return chart.addCandlestickSeries(options);
  if (type === "line" && typeof chart.addLineSeries === "function") return chart.addLineSeries(options);
  throw new Error(`lightweight-charts cannot create ${type} series`);
}

function buildChartPointRows(points, sourceRows) {
  const rows = new Map();
  points.forEach((point, index) => {
    const key = chartTimeKey(point.time);
    const source = sourceRows.find((row) => chartTimeKey(toChartTime(row.time)) === key) || sourceRows[index];
    rows.set(key, source);
  });
  return rows;
}

function chartTimeKey(time) {
  if (typeof time === "string") return time;
  if (typeof time === "number") return String(time);
  if (time && typeof time === "object") return `${time.year}-${String(time.month).padStart(2, "0")}-${String(time.day).padStart(2, "0")}`;
  return "";
}

function showChartTooltip(param, series, tooltip, item, type) {
  if (!tooltip || !param || !param.time || !param.seriesData?.size) {
    if (tooltip) tooltip.hidden = true;
    return;
  }
  const point = param.seriesData.get(series);
  const row = chartPointRows.get(chartTimeKey(point?.time || param.time));
  if (!row) {
    tooltip.hidden = true;
    return;
  }
  tooltip.hidden = false;
  tooltip.innerHTML = type === "intraday" ? renderIntradayTooltip(item, row) : renderKlineTooltip(item, row);
}

async function refreshQuotes(options = {}) {
  if (appState.isRefreshingQuote) return;
  appState.isRefreshingQuote = true;
  appState.quoteError = "";
  startRefreshTask("quotes", "正在更新行情", "获取真实价格、历史K线和分时");
  if (!options.silent) renderApp();
  updateStatusText();
  try {
    appState.marketStatus = await dataProvider.getMarketStatus();
    const results = await Promise.allSettled([...appState.holdings, ...appState.watchlist].map((item) => refreshSecurity(item)));
    const normalizedResults = results.map((result) => result.status === "fulfilled" ? result.value : { ok: false, status: "failed" });
    const modes = normalizedResults.map((result) => result.status).filter(Boolean);
    appState.quoteMode = chooseGlobalQuoteMode(modes);
    recalculateAllPredictions();
    showToast("行情已更新，评分已按连续性规则重算。", "success");
    appState.lastRealUpdated = normalizedResults.some((result) => result.ok) ? getDateTimeText() : appState.lastRealUpdated;
    if (!normalizedResults.some((result) => result.ok)) appState.quoteError = "真实行情暂不可用；如有缓存则使用最后一次真实数据。";
  } catch (error) {
    console.error("refresh quotes failed", error);
    showToast("行情刷新失败：已显示错误或缓存，不生成假数据。", "warning");
    appState.quoteMode = hasAnyCachedData() ? "failed_with_cache" : "failed";
    appState.quoteError = error.message || "真实行情暂不可用";
  } finally {
    appState.isRefreshingQuote = false;
    finishRefreshTask("quotes");
    if (!options.silent) renderApp();
  }
}

async function refreshSecurity(item) {
  try {
    const remoteStatus = item.type === "open_fund" ? appState.marketStatus : await dataProvider.getMarketStatus(item.symbol);
    item.marketStatus = remoteStatus;
    if (item.type === "open_fund") {
      item.fundInfo = await dataProvider.getFundInfo(item.symbol);
      item.quoteStatus = item.fundInfo.mode || "historical";
      item.quoteError = "";
      cacheSecurity(item);
      return { ok: true, status: item.quoteStatus };
    }
    const status = remoteStatus.status || remoteStatus.session;
    if (status === "trading") {
      item.quote = await dataProvider.getQuote(item.symbol);
      item.intraday = await dataProvider.getIntraday(item.symbol, item.quote.tradeDate).catch(() => []);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
    } else if (status === "lunch_break") {
      item.quote = await dataProvider.getQuote(item.symbol).catch(() => item.quote);
      const tradeDate = item.quote?.tradeDate || await dataProvider.getLastTradingDay(item.symbol);
      item.intraday = await dataProvider.getIntraday(item.symbol, tradeDate).catch(() => []);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
    } else if (status === "closed") {
      const tradeDate = remoteStatus.tradeDate || await dataProvider.getLastTradingDay(item.symbol);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
      item.summary = await dataProvider.getDailySummary(item.symbol, tradeDate).catch(() => klineToSummary(item.dailyKline));
      item.quote = summaryToQuote(item.summary);
      item.intraday = await dataProvider.getIntraday(item.symbol, tradeDate).catch(() => []);
    } else if (status === "non_trading_day") {
      const tradeDate = await dataProvider.getLastTradingDay(item.symbol);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
      item.summary = await dataProvider.getDailySummary(item.symbol, tradeDate).catch(() => klineToSummary(item.dailyKline));
      item.quote = summaryToQuote(item.summary, "historical");
      item.intraday = await dataProvider.getIntraday(item.symbol, tradeDate).catch(() => []);
    } else if (status === "suspended") {
      item.quote = await dataProvider.getLastValidQuote(item.symbol);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
    } else {
      throw new Error("真实行情暂不可用");
    }
    item.weeklyKline = await dataProvider.getDailyKline(item.symbol, 80, "week").catch(() => item.weeklyKline || []);
    item.historyMetrics = calculateHistoryMetrics(item.dailyKline);
    item.prediction = buildRulePrediction(item);
    item.usingCache = false;
    item.quoteStatus = status === "trading" ? "realtime" : status === "lunch_break" ? "lunch_break" : status === "suspended" ? "suspended" : "historical";
    item.quoteError = "";
    cacheSecurity(item);
    return { ok: true, status: item.quoteStatus };
  } catch (error) {
    console.error(`refresh security failed: ${item.symbol}`, error);
    restoreCachedSecurity(item);
    item.prediction = buildRulePrediction(item);
    item.quoteStatus = hasAnyRealData(item) ? "interface_failed_cache" : "failed";
    item.quoteError = hasAnyRealData(item) ? "真实行情暂不可用，使用最后一次真实数据" : (error.message || "真实行情暂不可用");
    return { ok: false, status: item.quoteStatus };
  }
}

async function refreshNews() {
  if (appState.isRefreshingNews) return;
  appState.isRefreshingNews = true;
  appState.searchError = "";
  startRefreshTask("news", "正在获取新闻", "刷新持仓、观察池和市场相关消息");
  renderApp();
  try {
    appState.news = await dataProvider.getNews(appState.searchKeyword);
    appState.newsCacheInfo = { items: appState.news, savedAt: getDateTimeText(), cached: false };
    saveJson("news-cache", appState.newsCacheInfo);
    recalculateAllPredictions();
    showToast("新闻已更新，相关评分已重新计算。", "success");
    appState.lastUpdated = getDateTimeText();
  } catch (error) {
    console.error("refresh news failed", error);
    showToast("新闻刷新失败：已显示缓存或错误原因。", "warning");
    const cached = loadJson("news-cache", null);
    if (cached?.items?.length) {
      appState.news = normalizeNews(cached.items);
      appState.newsCacheInfo = { ...cached, cached: true };
      appState.searchError = `新闻接口失败，显示缓存新闻：${cached.savedAt || "时间未知"}`;
      recalculateAllPredictions();
    } else {
      appState.searchError = error.message || "新闻接口失败";
    }
  } finally {
    appState.isRefreshingNews = false;
    finishRefreshTask("news");
    renderApp();
  }
}

async function refreshAnalysis() {
  if (appState.isRefreshingAnalysis) return;
  appState.isRefreshingAnalysis = true;
  startRefreshTask("analysis", "正在生成分析", "拆解技术面、资金面、消息面和观点变化");
  renderApp();
  appState.lastUpdated = getDateTimeText();
  recalculateAllPredictions();
  showToast("分析已更新：评分拆解和观点追踪已刷新。", "success");
  appState.isRefreshingAnalysis = false;
  finishRefreshTask("analysis");
  renderApp();
}

async function handleSubmit(event) {
  const form = event.target.closest("[data-role='global-search']");
  if (!form) return;
  event.preventDefault();
  const keyword = new FormData(form).get("keyword")?.toString().trim() || "";
  appState.searchKeyword = keyword;
  appState.searchError = "";
  if (!keyword) {
    appState.securitySearchResults = [];
    appState.newsSearchResults = [];
    renderApp();
    return;
  }
  try {
    appState.securitySearchResults = await dataProvider.search(keyword);
  } catch (error) {
    console.error("search failed", error);
    appState.securitySearchResults = [];
    appState.searchError = error.message || "标的查询失败";
  }
  appState.newsSearchResults = appState.news.filter((item) => newsMatches(item, keyword));
  renderApp();
}

function handleInteraction(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  event.preventDefault();
  switch (action) {
    case "show-detail":
      appState.selectedSymbol = target.dataset.symbol;
      {
        const item = ensureMutableSecurity(target.dataset.symbol);
        appState.selectedChartPeriod = getDefaultChartPeriod(item);
        if (item && !hasAnyRealData(item)) refreshSecurity(item).finally(renderApp);
      }
      renderApp();
      return;
    case "close-detail":
      appState.selectedSymbol = null;
      renderApp();
      return;
    case "show-news-detail":
      appState.selectedNewsId = target.dataset.newsId;
      renderApp();
      return;
    case "close-news-detail":
      appState.selectedNewsId = null;
      renderApp();
      return;
    case "refresh-quotes":
      refreshQuotes();
      return;
    case "refresh-news":
      refreshNews();
      return;
    case "refresh-analysis":
      refreshAnalysis();
      return;
    case "refresh-one": {
      const item = findSecurity(target.dataset.symbol);
      if (item) {
        startRefreshTask(`one-${item.symbol}`, "正在刷新单只标的", `${item.name} ${item.code}`);
        renderApp();
        refreshSecurity(item).then(() => {
          item.prediction = buildRulePrediction(item);
          persistPredictionHistory();
          showToast(`${item.name} 已更新。`, "success");
        }).catch((error) => {
          console.error(`refresh one failed: ${item.symbol}`, error);
          showToast(`${item.name} 刷新失败，已保留缓存或错误状态。`, "warning");
        }).finally(() => {
          finishRefreshTask(`one-${item.symbol}`);
          renderApp();
        });
      }
      return;
    }
    case "pin-security":
      togglePinned(target.dataset.symbol);
      return;
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
      renderSecurityDetailSheet();
      return;
    case "toggle-section":
      toggleSection(target.dataset.targetSection);
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
  const button = event.target.closest(".segment [data-view]");
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
  setText("reportDate", sourceData.date || getDateText());
  setText("reportTime", getLastRealText());
  setText("analysisStatus", appState.isRefreshingAnalysis ? "正在刷新分析" : "评分为主观预期");
  setText("liveQuoteStatus", `${getQuoteModeLabel(appState.quoteMode)} / ${getMarketStatusLabel(appState.marketStatus.status || appState.marketStatus.session)}`);
  syncRefreshButton("refreshQuotes", appState.isRefreshingQuote, "正在更新行情", "刷新行情");
  syncRefreshButton("refreshAnalysis", appState.isRefreshingAnalysis, "正在生成分析", "刷新分析");
}

function syncRefreshButton(id, loading, loadingText, idleText) {
  const button = document.getElementById(id);
  if (!button) return;
  button.disabled = Boolean(loading);
  button.classList.toggle("is-refreshing", Boolean(loading));
  button.textContent = loading ? loadingText : idleText;
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
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(quoteRefreshTimer);
      clearInterval(newsRefreshTimer);
      quoteRefreshTimer = null;
      newsRefreshTimer = null;
      return;
    }
    if (getLocalMarketStatus().status === "trading") refreshQuotes({ auto: true, silent: true }).finally(renderApp);
    else renderApp();
    startQuoteAutoRefresh();
    startNewsAutoRefresh();
  });
}

function init() {
  renderApp();
  initInteractions();
  if (getLocalMarketStatus().status === "trading") refreshQuotes({ initial: true });
  refreshNews();
  startQuoteAutoRefresh();
  startNewsAutoRefresh();
}

function buildNewsKeywords(keyword = "") {
  const values = [
    keyword,
    ...appState.holdings.map((item) => item.name),
    ...appState.watchlist.map((item) => item.name),
    ...(sourceData.newsKeywords || []),
    "A股",
    "黄金",
    "白银",
    "恒生科技",
    "军工",
    "稀有金属"
  ];
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))].slice(0, 12);
}

function renderDetailHistory(item) {
  if (item.type === "open_fund") {
    return `<div class="history-panel"><strong>历史信息</strong><p>开放式基金历史净值接口暂未接入；不显示伪历史曲线。</p></div>`;
  }
  const metrics = item.historyMetrics || calculateHistoryMetrics(item.dailyKline || []);
  const rows = [
    ["最近交易日", metrics.lastTradeDate || "历史数据不足"],
    ["昨日收盘", formatMetricPrice(metrics.yesterdayClose)],
    ["近5日", formatMetricPercent(metrics.fiveDayChange)],
    ["近20日", formatMetricPercent(metrics.twentyDayChange)],
    ["近30日最高", formatMetricPrice(metrics.thirtyDayHigh)],
    ["近30日最低", formatMetricPrice(metrics.thirtyDayLow)],
    ["近30日", formatMetricPercent(metrics.thirtyDayChange)],
    ["20日均量", formatMetricVolume(metrics.avgVolume20)]
  ];
  return `
    <div class="history-panel">
      <div class="panel-title-row">
        <strong>昨日与历史行情</strong>
        <span>${item.usingCache ? `缓存数据 ${escapeText(item.cacheSavedAt || "")}` : "真实历史K线计算"}</span>
      </div>
      <dl>
        ${rows.map(([label, value]) => `<div><dt>${escapeText(label)}</dt><dd>${escapeText(value)}</dd></div>`).join("")}
      </dl>
    </div>
  `;
}

function startQuoteAutoRefresh() {
  if (quoteRefreshTimer) clearInterval(quoteRefreshTimer);
  const interval = Math.max(5000, Math.min(Number(appState.refreshInterval || 10000), 15000));
  quoteRefreshTimer = setInterval(() => {
    const status = appState.marketStatus.status || appState.marketStatus.session;
    if (status === "trading" && !appState.isRefreshingQuote) refreshQuotes({ auto: true });
  }, interval);
}

function startNewsAutoRefresh() {
  if (newsRefreshTimer) clearInterval(newsRefreshTimer);
  newsRefreshTimer = setInterval(() => {
    if (!appState.isRefreshingNews) refreshNews();
  }, 15 * 60 * 1000);
}

function normalizeSecurities(items) {
  return items.map((item) => {
    const seededSummary = item.summary || (item.lastClose != null ? {
      close: item.lastClose,
      preClose: item.lastPreClose ?? null,
      open: item.lastOpen ?? null,
      high: item.lastHigh ?? null,
      low: item.lastLow ?? null,
      volume: item.lastVolume ?? null,
      amount: item.lastAmount ?? null,
      changePercent: item.lastChangePercent ?? null,
      tradeDate: item.lastTradeDate || "",
      time: item.lastTradeDate || "",
      mode: "historical",
      status: "historical",
      source: item.lastSource || "static-proxy-kline"
    } : null);
    const seededQuote = item.quote || (seededSummary ? summaryToQuote(seededSummary, "historical") : null);
    return {
      name: item.name || "",
      code: String(item.code || ""),
      symbol: item.symbol || toSymbol(item),
      market: item.market || inferMarket(item.code),
      exchange: item.exchange || exchangeFromMarket(item.market || inferMarket(item.code)),
      type: item.type || inferType(item.code),
      sinaSymbol: item.sinaSymbol || `${(item.market || inferMarket(item.code)).toLowerCase()}${item.code}`,
      tencentSymbol: item.tencentSymbol || `${(item.market || inferMarket(item.code)).toLowerCase()}${item.code}`,
      eastmoneySecid: item.eastmoneySecid || `${(item.market || inferMarket(item.code)) === "SH" ? "1" : "0"}.${item.code}`,
      sector: item.sector || "",
      support: item.support || "",
      resistance: item.resistance || "",
      action: item.action || "",
      invalidCondition: item.invalidCondition || "",
      prediction: normalizePrediction(item),
      quote: seededQuote,
      summary: seededSummary,
      quoteStatus: seededQuote ? "historical" : "failed",
      quoteError: seededQuote ? "" : "真实行情待刷新",
      marketStatus: null,
      intraday: Array.isArray(item.intraday) ? item.intraday : [],
      dailyKline: Array.isArray(item.dailyKline) ? item.dailyKline : [],
      weeklyKline: Array.isArray(item.weeklyKline) ? item.weeklyKline : [],
      fundInfo: item.fundInfo || null
    };
  });
}

function normalizeWatchlist(items) {
  return normalizeSecurities(items).map((item, index) => ({
    ...item,
    sector: item.sector || items[index]?.sector || "未分类",
    status: items[index]?.status || "观察，不买",
    reason: items[index]?.reason || "",
    buyTrigger: items[index]?.buyTrigger || "",
    avoidReason: items[index]?.avoidReason || "条件未满足，不买。",
    risk: items[index]?.risk || ""
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
    trigger: item.trigger || item.resistance || "",
    invalidCondition: item.invalidCondition || "跌破支撑或板块走弱",
    riskLevel: item.riskLevel || "中"
  };
}

function normalizeNews(items) {
  return items.map((item, index) => ({
    id: item.id || `news-${index + 1}`,
    title: item.title || "",
    source: item.source || "未注明来源",
    publishTime: item.publishedAt || item.publishTime || "",
    location: item.location || "未披露",
    peopleOrOrg: Array.isArray(item.peopleOrOrg) ? item.peopleOrOrg : [],
    summary: item.summary || item.body || "",
    relatedStocks: item.relatedSymbols || item.relatedStocks || [],
    sector: item.sector || "",
    event: item.event || "",
    impactType: item.impact || item.impactType || item.type || "neutral",
    impactScore: clampScore(item.impactScore ?? 5),
    importance: Number(item.importance || item.impactScore || 5),
    url: item.url || "",
    fullContent: item.fullContent || item.summary || item.body || "",
    read: Boolean(item.read),
    relation: item.relation || inferNewsRelationFromStatic(item),
    holdingImpact: item.holdingImpact || "",
    watchImpact: item.watchImpact || "",
    whyItMatters: item.whyItMatters || "",
    priceCondition: item.priceCondition || "",
    planChange: item.planChange || ""
  }));
}

function loadCachedNewsItems() {
  const cached = loadJson("news-cache", null);
  if (cached?.items?.length) return normalizeNews(cached.items);
  return normalizeNews(sourceData.newsItems || []);
}

function normalizeSearchItems(items) {
  return items.filter((item) => item && item.code).map((item) => ({
    name: item.name || "",
    code: String(item.code),
    symbol: item.symbol || toSymbol(item),
    market: item.market || inferMarket(item.code),
    exchange: item.exchange || exchangeFromMarket(item.market || inferMarket(item.code)),
    type: item.type || inferType(item.code),
    sinaSymbol: item.sinaSymbol || `${(item.market || inferMarket(item.code)).toLowerCase()}${item.code}`,
    tencentSymbol: item.tencentSymbol || `${(item.market || inferMarket(item.code)).toLowerCase()}${item.code}`,
    eastmoneySecid: item.eastmoneySecid || `${(item.market || inferMarket(item.code)) === "SH" ? "1" : "0"}.${item.code}`,
    sector: item.sector || "",
    support: item.support || "",
    resistance: item.resistance || "",
    prediction: item.prediction || normalizePrediction({ predictionScore: 5, action: "观察", reason: "等待真实行情。" }),
    quote: item.quote || null
  }));
}

function normalizeRemoteMarketStatus(payload) {
  const status = payload.status || payload.session || "error";
  return {
    isTradingDay: payload.isTradingDay ?? !["non_trading_day"].includes(status),
    session: status,
    status,
    label: payload.label || getMarketStatusLabel(status),
    tradeDate: payload.tradeDate || null
  };
}

function normalizeQuote(payload) {
  const quote = payload.quote || payload;
  return {
    name: payload.name || "",
    code: payload.code || "",
    symbol: payload.symbol || payload.code || "",
    price: numericOrNull(quote.price ?? quote.close),
    close: numericOrNull(quote.close ?? quote.price),
    change: numericOrNull(quote.change),
    changePercent: numericOrNull(quote.changePercent),
    preClose: numericOrNull(quote.preClose),
    open: numericOrNull(quote.open),
    high: numericOrNull(quote.high),
    low: numericOrNull(quote.low),
    volume: numericOrNull(quote.volume),
    amount: numericOrNull(quote.amount),
    time: payload.lastUpdated || payload.time || "",
    tradeDate: payload.dataDate || payload.tradeDate || dateFromTime(payload.time),
    mode: payload.mode || "realtime",
    status: payload.status || payload.mode || "realtime",
    source: payload.source || "",
    cached: Boolean(payload.cached)
  };
}

function normalizeIntraday(payload) {
  const items = Array.isArray(payload) ? payload : payload.items || [];
  return items.map((row) => ({
    time: row.time,
    price: numericOrNull(row.price ?? row.close),
    avgPrice: numericOrNull(row.avgPrice ?? row.average),
    volume: numericOrNull(row.volume),
    changePercent: numericOrNull(row.changePercent),
    tradeDate: row.tradeDate || dateFromTime(row.time)
  })).filter((row) => row.time && row.price != null);
}

function normalizeKline(payload) {
  const items = Array.isArray(payload) ? payload : payload.items || [];
  return items.map((row) => ({
    time: row.time,
    open: numericOrNull(row.open),
    high: numericOrNull(row.high),
    low: numericOrNull(row.low),
    close: numericOrNull(row.close),
    volume: numericOrNull(row.volume),
    amount: numericOrNull(row.amount),
    changePercent: numericOrNull(row.changePercent)
  })).filter((row) => row.time && row.open != null && row.high != null && row.low != null && row.close != null);
}

function normalizeDailySummary(payload) {
  return {
    tradeDate: payload.tradeDate || dateFromTime(payload.time),
    close: numericOrNull(payload.close ?? payload.price),
    preClose: numericOrNull(payload.preClose),
    open: numericOrNull(payload.open),
    high: numericOrNull(payload.high),
    low: numericOrNull(payload.low),
    volume: numericOrNull(payload.volume),
    amount: numericOrNull(payload.amount),
    changePercent: numericOrNull(payload.changePercent),
    time: payload.time || payload.tradeDate || "",
    mode: payload.mode || "historical",
    status: payload.status || "historical"
  };
}

function summaryToQuote(summary, status = "historical") {
  return {
    price: summary.close,
    change: summary.close != null && summary.preClose != null ? summary.close - summary.preClose : null,
    changePercent: summary.changePercent,
    preClose: summary.preClose,
    open: summary.open,
    high: summary.high,
    low: summary.low,
    volume: summary.volume,
    amount: summary.amount,
    time: summary.time || summary.tradeDate,
    tradeDate: summary.tradeDate,
    mode: status,
    status
  };
}

function localSecuritySearch(keyword) {
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

function newsMatches(item, keyword) {
  const text = `${item.title} ${item.summary} ${item.fullContent} ${(item.relatedStocks || []).join(" ")}`.toLowerCase();
  return text.includes(keyword.toLowerCase());
}

function getNewsByRelation(relation) {
  return appState.news.filter((item) => {
    const inferred = inferNewsRelation(item);
    if (relation === "holding") return inferred === "holding";
    if (relation === "watch") return inferred === "watch";
    if (relation === "market") return inferred === "market";
    return true;
  }).filter((item) => relation !== "read" || appState.readNews.has(item.id));
}

function inferNewsRelation(item) {
  const related = new Set((item.relatedStocks || []).map((value) => String(value)));
  if (appState.holdings.some((row) => related.has(row.code) || related.has(row.symbol) || related.has(row.name))) return "holding";
  if (appState.watchlist.some((row) => related.has(row.code) || related.has(row.symbol) || related.has(row.name))) return "watch";
  return item.relation || "market";
}

function inferNewsRelationFromStatic(item) {
  const related = new Set((item.relatedStocks || []).map((value) => String(value)));
  const holdings = (sourceData.holdings || []).map((row) => [row.code, row.symbol, row.name]).flat();
  const watchlist = (sourceData.watchlist || []).map((row) => [row.code, row.symbol, row.name]).flat();
  if (holdings.some((value) => related.has(value))) return "holding";
  if (watchlist.some((value) => related.has(value))) return "watch";
  return item.relation || "market";
}

function renderRiskCards(items) {
  const wrap = createEl("div", "risk-card-list");
  items.forEach((item) => {
    const card = createEl("article", "risk-item mini-card");
    card.innerHTML = `<strong>${escapeText(item.title)}</strong><p>${escapeText(item.conclusion)}</p><p><b>触发：</b>${escapeText(item.trigger)}</p><p><b>动作：</b>${escapeText(item.action)}</p>`;
    wrap.appendChild(card);
  });
  return wrap;
}

function renderShortCards(items) {
  const wrap = createEl("div", "short-card-list");
  items.forEach((item) => {
    const card = createEl("article", "learning-item mini-card");
    if (item.basis || item.inference || item.conclusion || item.invalidCondition) {
      card.innerHTML = `
        <h3>${escapeText(item.title)}</h3>
        <p><b>依据：</b>${escapeText(item.basis || "等待真实数据确认")}</p>
        <p><b>推理：</b>${escapeText(item.inference || item.body || "")}</p>
        <p><b>结论：</b>${escapeText(item.conclusion || "暂不主动操作")}</p>
        <p><b>失效：</b>${escapeText(item.invalidCondition || "真实行情或新闻反向变化")}</p>
      `;
    } else {
      card.innerHTML = `<h3>${escapeText(item.title)}</h3><p>${escapeText(item.body)}</p>`;
    }
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

function renderPriceBox(item) {
  if (item.type === "open_fund") {
    const nav = item.fundInfo?.nav;
    return `<strong>${nav == null ? "暂无真实净值" : formatPrice(nav)}</strong><span>${item.fundInfo?.navDate || "净值待取"}</span>`;
  }
  const record = getDisplayRecord(item);
  if (!record) return `<strong>真实行情暂不可用</strong><span>${hasAnyRealData(item) ? "使用最后一次真实数据" : "暂无真实数据"}</span>`;
  const label = ["closed", "non_trading_day", "historical", "suspended"].includes(item.quoteStatus) ? "收盘/最近" : "最新";
  return `<strong>${formatPrice(record.price ?? record.close)}</strong><span class="${changeClass(record.changePercent)}">${label} ${formatPercent(record.changePercent)}</span>`;
}

function getDisplayRecord(item) {
  if (item.summary) return item.summary;
  if (item.quote) return item.quote;
  if (item.dailyKline?.length) {
    const last = item.dailyKline[item.dailyKline.length - 1];
    return { ...last, price: last.close, preClose: item.dailyKline[item.dailyKline.length - 2]?.close ?? null, tradeDate: dateFromTime(last.time), status: "historical" };
  }
  return null;
}

function klineToSummary(rows = []) {
  const items = rows.filter((row) => row?.close != null);
  const last = items[items.length - 1];
  const prev = items[items.length - 2];
  if (!last) throw new Error("真实历史K线不可用");
  const preClose = prev?.close ?? null;
  const changePercent = last.close != null && preClose ? ((last.close - preClose) / preClose) * 100 : last.changePercent;
  return {
    tradeDate: String(last.time).slice(0, 10),
    close: last.close,
    preClose,
    open: last.open,
    high: last.high,
    low: last.low,
    volume: last.volume,
    amount: last.amount,
    changePercent,
    time: String(last.time).slice(0, 10),
    mode: "historical",
    status: "historical"
  };
}

function calculateHistoryMetrics(rows = []) {
  const items = (rows || []).filter((row) => row?.close != null).slice().sort((a, b) => String(a.time).localeCompare(String(b.time)));
  const last = items[items.length - 1];
  const previous = items[items.length - 2];
  const closeChange = (fromIndex) => {
    const base = items[items.length - 1 - fromIndex];
    if (!last || !base?.close) return null;
    return ((last.close - base.close) / base.close) * 100;
  };
  const last30 = items.slice(-30);
  const last20 = items.slice(-20);
  return {
    lastTradeDate: last ? String(last.time).slice(0, 10) : "",
    yesterdayClose: previous?.close ?? null,
    fiveDayChange: items.length >= 6 ? closeChange(5) : null,
    twentyDayChange: items.length >= 21 ? closeChange(20) : null,
    thirtyDayHigh: last30.length ? Math.max(...last30.map((row) => row.high).filter((value) => value != null)) : null,
    thirtyDayLow: last30.length ? Math.min(...last30.map((row) => row.low).filter((value) => value != null)) : null,
    thirtyDayChange: items.length >= 31 ? closeChange(30) : null,
    avgVolume20: last20.length >= 20 ? last20.reduce((sum, row) => sum + Number(row.volume || 0), 0) / last20.length : null
  };
}

function recalculateAllPredictions() {
  [...appState.holdings, ...appState.watchlist, ...appState.securitySearchResults].forEach((item) => {
    if (item) item.prediction = buildRulePrediction(item);
  });
  persistPredictionHistory();
}

function buildRulePrediction(item) {
  const base = item.prediction || normalizePrediction(item);
  const record = getDisplayRecord(item);
  const metrics = item.historyMetrics || calculateHistoryMetrics(item.dailyKline || []);
  const newsSignal = getSecurityNewsSignal(item);
  let score = 5;
  const reasons = [];

  if (record?.changePercent != null) {
    if (record.changePercent >= 5) { score += 1.6; reasons.push("涨幅较大，短线强势但追高风险上升"); }
    else if (record.changePercent >= 2) { score += 1; reasons.push("涨幅为正，资金短线偏强"); }
    else if (record.changePercent <= -5) { score -= 1.6; reasons.push("跌幅较大，短线承压"); }
    else if (record.changePercent <= -2) { score -= 1; reasons.push("跌幅为负，资金短线偏弱"); }
  }

  const price = numericOrNull(record?.price ?? record?.close);
  const support = parseLevel(item.support, "min");
  const resistance = parseLevel(item.resistance, "max");
  if (price != null && resistance != null && price > resistance) { score += 1.2; reasons.push("价格突破压力位"); }
  if (price != null && support != null && price < support) { score -= 1.5; reasons.push("价格跌破支撑位"); }

  if (metrics.fiveDayChange != null) {
    if (metrics.fiveDayChange > 3) { score += 0.5; reasons.push("近5日走势转强"); }
    if (metrics.fiveDayChange < -3) { score -= 0.5; reasons.push("近5日走势转弱"); }
  }
  if (metrics.twentyDayChange != null) {
    if (metrics.twentyDayChange > 6) score += 0.4;
    if (metrics.twentyDayChange < -6) score -= 0.4;
  }
  if (record?.volume && metrics.avgVolume20) {
    const volumeRatio = record.volume / metrics.avgVolume20;
    if (volumeRatio > 1.5 && (record.changePercent || 0) > 0) { score += 0.5; reasons.push("放量上涨"); }
    if (volumeRatio > 1.5 && (record.changePercent || 0) < 0) { score -= 0.5; reasons.push("放量下跌"); }
  }

  score += newsSignal.scoreDelta;
  if (newsSignal.reason) reasons.push(newsSignal.reason);

  const stabilized = stabilizePredictionScore(item, score, record, newsSignal);
  const finalScore = stabilized.score;
  const label = scoreToLabel(finalScore);
  const isHolding = appState.holdings.some((row) => row.symbol === item.symbol);
  const action = chooseRuleAction(finalScore, isHolding, price, support, resistance);
  const trigger = resistance != null ? `放量站上 ${formatPrice(resistance)} 后再考虑加仓或买入。` : (base.trigger || "放量突破压力位后再考虑。");
  const invalid = support != null ? `跌破 ${formatPrice(support)} 或板块转弱，则取消偏多判断。` : (item.invalidCondition || base.invalidCondition || "跌破支撑或板块转弱。");

  return {
    predictionScore: finalScore,
    rawScore: clampScore(score),
    previousScore: stabilized.previousScore,
    scoreDelta: stabilized.scoreDelta,
    scoreChangeReason: stabilized.reason,
    scoreBreakdown: buildScoreBreakdown(item, record, metrics, newsSignal, score, finalScore, stabilized.previousScore),
    predictionLabel: label,
    expectedDirection: scoreToDirection(finalScore),
    reason: reasons.slice(0, 2).join("；") || base.reason || "真实行情未给出明确方向，暂不主动操作。",
    action,
    trigger,
    invalidCondition: invalid,
    riskLevel: finalScore >= 8 || finalScore <= 3 ? "高" : "中"
  };
}

function getSecurityNewsSignal(item) {
  const related = appState.news.filter((news) => {
    const values = new Set((news.relatedStocks || []).map(String));
    return values.has(item.symbol) || values.has(item.code) || values.has(item.name) || String(news.title).includes(item.name);
  }).slice(0, 5);
  if (!related.length) return { scoreDelta: 0, reason: "" };
  const score = related.reduce((sum, news) => sum + (Number(news.impactScore || 5) - 5), 0) / related.length;
  if (score > 0.7) return { scoreDelta: 0.6, reason: "相关新闻偏利好" };
  if (score < -0.7) return { scoreDelta: -0.6, reason: "相关新闻偏利空" };
  return { scoreDelta: 0, reason: "相关新闻整体中性" };
}

function stabilizePredictionScore(item, rawScore, record, newsSignal) {
  const raw = clampScore(rawScore);
  const previous = getPreviousPrediction(item);
  if (!previous?.predictionScore) return { score: raw, previousScore: null, scoreDelta: 0, reason: "首次计算，无历史分数可比较。" };
  const previousScore = clampScore(previous.predictionScore);
  const rawDelta = raw - previousScore;
  const majorMove = Math.abs(Number(record?.changePercent || 0)) >= 5;
  const price = numericOrNull(record?.price ?? record?.close);
  const support = parseLevel(item.support, "min");
  const resistance = parseLevel(item.resistance, "max");
  const levelBreak = (price != null && resistance != null && price > resistance) || (price != null && support != null && price < support);
  const majorNews = Math.abs(Number(newsSignal?.scoreDelta || 0)) >= 0.6;
  const maxMove = majorMove || levelBreak || majorNews ? 2 : 1;
  const limitedDelta = Math.max(-maxMove, Math.min(maxMove, rawDelta));
  const score = clampScore(previousScore + limitedDelta);
  return {
    score,
    previousScore,
    scoreDelta: score - previousScore,
    reason: Math.abs(rawDelta) > maxMove
      ? `原始变化${formatSigned(rawDelta)}分，因未出现足够级别的新证据，稳定器限制为${formatSigned(limitedDelta)}分。`
      : `变化${formatSigned(limitedDelta)}分，来自真实行情、K线和新闻信号。`
  };
}

function buildScoreBreakdown(item, record, metrics, newsSignal, rawScore, finalScore, previousScore) {
  const price = numericOrNull(record?.price ?? record?.close);
  const support = parseLevel(item.support, "min");
  const resistance = parseLevel(item.resistance, "max");
  const change = Number(record?.changePercent || 0);
  const volumeRatio = record?.volume && metrics.avgVolume20 ? record.volume / metrics.avgVolume20 : null;
  return [
    {
      name: "技术面",
      score: price != null && resistance != null && price > resistance ? 7 : price != null && support != null && price < support ? 3 : 5,
      delta: price != null && resistance != null && price > resistance ? 1 : price != null && support != null && price < support ? -1 : 0,
      why: price == null ? "缺少可核对价格，技术位不加分。" : price > (resistance ?? Infinity) ? `价格高于压力位${formatPrice(resistance)}，说明买盘愿意接受更高成本。` : price < (support ?? -Infinity) ? `价格跌破支撑位${formatPrice(support)}，原有承接逻辑需要下修。` : `价格仍在支撑${formatPrice(support)}与压力${formatPrice(resistance)}之间，方向未确认。`
    },
    {
      name: "趋势/资金面",
      score: change >= 2 || (volumeRatio && volumeRatio > 1.5 && change > 0) ? 7 : change <= -2 || (volumeRatio && volumeRatio > 1.5 && change < 0) ? 3 : 5,
      delta: change >= 2 ? 1 : change <= -2 ? -1 : 0,
      why: volumeRatio ? `涨跌幅${formatPercent(change)}，成交量约为20日均量${volumeRatio.toFixed(1)}倍，量价关系决定短线强弱。` : `涨跌幅${formatPercent(change)}，成交量对比不足，先按价格强弱处理。`
    },
    {
      name: "消息面",
      score: clampScore(5 + Number(newsSignal?.scoreDelta || 0) * 2),
      delta: Number(newsSignal?.scoreDelta || 0),
      why: newsSignal?.reason || "暂无足以改变交易计划的持仓相关新闻。"
    },
    {
      name: "风险纪律",
      score: /高|减|卖|不买|不追/.test(`${item.riskLevel || ""}${item.action || ""}${item.invalidCondition || ""}`) ? 4 : 5,
      delta: /高|减|卖|不买|不追/.test(`${item.riskLevel || ""}${item.action || ""}${item.invalidCondition || ""}`) ? -0.5 : 0,
      why: "满仓账户先控制回撤和资金来源，评分不能替代仓位纪律。"
    },
    {
      name: "连续性调整",
      score: finalScore,
      delta: previousScore ? finalScore - previousScore : 0,
      why: previousScore ? `前次${formatScore(previousScore)}分，本次${formatScore(finalScore)}分；除非有突破、跌破或重大消息，否则限制单日大幅跳变。` : "首次记录，作为后续观点演化的基准。"
    }
  ];
}

function getPreviousPrediction(item) {
  return appState.previousPredictionSnapshot?.[item.symbol] || null;
}

function persistPredictionHistory() {
  const next = { ...(appState.predictionHistory || {}) };
  [...appState.holdings, ...appState.watchlist, ...appState.securitySearchResults].forEach((item) => {
    if (!item?.symbol || !item.prediction) return;
    next[item.symbol] = {
      predictionScore: item.prediction.predictionScore,
      predictionLabel: item.prediction.predictionLabel,
      action: item.prediction.action,
      reason: item.prediction.reason,
      updatedAt: getDateTimeText()
    };
  });
  appState.predictionHistory = next;
  saveJson("prediction-history", next);
}

function formatSigned(value) {
  const number = Number(value || 0);
  return `${number >= 0 ? "+" : ""}${number.toFixed(Math.abs(number) >= 1 ? 1 : 2)}`;
}

function chooseRuleAction(score, isHolding, price, support, resistance) {
  if (score >= 8) return isHolding ? "持有，突破确认后再考虑加仓" : "条件买入";
  if (score > 5.5) return isHolding ? "持有观察" : "观察，不追高";
  if (score >= 4.5) return "暂不操作";
  if (score >= 3) return isHolding ? "减仓观察" : "不买，继续观察";
  return isHolding ? "降低风险，等待止跌" : "不买";
}

function parseLevel(value, mode = "first") {
  const levels = String(value || "").match(/\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) || [];
  if (!levels.length) return null;
  if (mode === "min") return Math.min(...levels);
  if (mode === "max") return Math.max(...levels);
  return levels[0];
}

function formatMetricPrice(value) {
  return value == null ? "历史数据不足" : formatPrice(value);
}

function formatMetricPercent(value) {
  return value == null ? "历史数据不足" : formatPercent(value);
}

function formatMetricVolume(value) {
  return value == null ? "历史数据不足" : formatVolume(value);
}

function getPrimaryPriceLabel(item) {
  const status = item.quoteStatus;
  if (status === "realtime") return "最新价";
  if (status === "lunch_break") return "上午最后价";
  if (status === "suspended") return "停牌前收盘价";
  if (status === "historical" || status === "closed") return "收盘价";
  if (status === "interface_failed_cache") return "最后成功数据";
  return "真实行情";
}

function getSecurityStatusLabel(item) {
  return getQuoteModeLabel(item.quoteStatus);
}

function getSecurityUpdateText(item) {
  if (item.usingCache) return `缓存 ${item.cacheSavedAt || "时间未知"}`;
  return item.quote?.time || item.summary?.time || item.summary?.tradeDate || item.fundInfo?.navDate || "暂无真实更新时间";
}

function getDataDateText(item) {
  return item.quote?.tradeDate || item.summary?.tradeDate || item.intraday?.[0]?.tradeDate || dateFromTime(item.dailyKline?.at(-1)?.time) || "暂无数据日期";
}

function quoteLine(quote, type) {
  if (type === "open_fund") return `净值 ${formatPrice(quote.nav)} / ${quote.navDate || "日期未知"}`;
  return `真实价 ${formatPrice(quote.price)} / ${formatPercent(quote.changePercent)} / ${quote.time || "时间未知"}`;
}

function renderKlineTooltip(item, row) {
  return `<strong>${escapeText(item.name)} ${escapeText(item.code)}</strong><span>日期 ${formatDateAxis(row.time)}</span><span>开盘 ${formatPrice(row.open)} 最高 ${formatPrice(row.high)}</span><span>最低 ${formatPrice(row.low)} 收盘 ${formatPrice(row.close)}</span><span>成交量 ${formatVolume(row.volume)} 成交额 ${formatAmount(row.amount)}</span><span>涨跌幅 ${formatPercent(row.changePercent)}</span>`;
}

function renderIntradayTooltip(item, row) {
  return `<strong>${escapeText(item.name)} ${escapeText(item.code)}</strong><span>时间 ${formatMinute(row.time)}</span><span>当前价 ${formatPrice(row.price)} 均价 ${formatPrice(row.avgPrice)}</span><span>成交量 ${formatVolume(row.volume)}</span><span>涨跌幅 ${formatPercent(row.changePercent)}</span>`;
}

function chartStateText(item, period) {
  if (item.type === "open_fund") return "开放式基金按净值披露，不提供盘中分时。";
  const record = getDisplayRecord(item);
  const status = getSecurityStatusLabel(item);
  if (period === "intraday" && !item.intraday.length) return item.dailyKline.length ? `${status}；今日无分时数据，已保留真实日K。` : `${status}；真实分时暂无；不绘制假线。`;
  if (period === "day" && !item.dailyKline.length) return `${status}；真实日K暂无，不绘制假K线。`;
  if (period === "week" && !item.weeklyKline.length) return `${status}；真实周K暂无，不绘制假K线。`;
  return `数据日期：${getDataDateText(item)}；数据状态：${status}${item.usingCache ? " / 缓存行情" : ""}；更新时间：${record?.time || getSecurityUpdateText(item)}`;
}

function getLocalMarketStatus() {
  const parts = getChinaDateParts();
  const tradingDay = parts.day >= 1 && parts.day <= 5;
  const minutes = parts.hour * 60 + parts.minute;
  if (!tradingDay) return { isTradingDay: false, session: "non_trading_day", status: "non_trading_day", label: "非交易日" };
  if (minutes >= 570 && minutes <= 690) return { isTradingDay: true, session: "trading", status: "trading", label: "盘中实时" };
  if (minutes > 690 && minutes < 780) return { isTradingDay: true, session: "lunch_break", status: "lunch_break", label: "午间休市" };
  if (minutes >= 780 && minutes <= 900) return { isTradingDay: true, session: "trading", status: "trading", label: "盘中实时" };
  if (minutes > 900) return { isTradingDay: true, session: "closed", status: "closed", label: "已收盘" };
  return { isTradingDay: true, session: "closed", status: "closed", label: "未开盘" };
}

async function getMarketStatus(symbol) {
  return dataProvider.getMarketStatus(symbol);
}

async function getLastTradingDay(symbol) {
  return dataProvider.getLastTradingDay(symbol);
}

async function getQuote(symbol) {
  return dataProvider.getQuote(symbol);
}

async function getIntraday(symbol, tradeDate) {
  return dataProvider.getIntraday(symbol, tradeDate);
}

async function getDailyKline(symbol, count = 120) {
  return dataProvider.getDailyKline(symbol, count, "day");
}

async function getDailySummary(symbol, tradeDate) {
  return dataProvider.getDailySummary(symbol, tradeDate);
}

function addSecurityToHolding(symbol) {
  const item = findSearchResult(symbol);
  if (!item || appState.holdings.some((row) => row.symbol === symbol)) return;
  appState.holdings.unshift(ensureDetailShape(item));
  appState.currentView = "quote";
  renderApp();
}

function addSecurityToWatch(symbol) {
  const item = findSearchResult(symbol);
  if (!item || appState.watchlist.some((row) => row.symbol === symbol)) return;
  appState.watchlist.unshift({
    ...ensureDetailShape(item),
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

function togglePinned(symbol) {
  if (!symbol) return;
  if (appState.pinnedSymbols.has(symbol)) appState.pinnedSymbols.delete(symbol);
  else appState.pinnedSymbols.add(symbol);
  saveJson("pinnedSymbols", Array.from(appState.pinnedSymbols));
  renderApp();
}

function sortPinned(items) {
  return [...items].sort((a, b) => Number(appState.pinnedSymbols.has(b.symbol)) - Number(appState.pinnedSymbols.has(a.symbol)));
}

function findSecurity(symbol) {
  return [...appState.holdings, ...appState.watchlist, ...appState.securitySearchResults].find((item) => item.symbol === symbol);
}

function findSearchResult(symbol) {
  return appState.securitySearchResults.find((item) => item.symbol === symbol) || normalizeSearchItems(sourceData.searchUniverse || []).find((item) => item.symbol === symbol) || findSecurity(symbol);
}

function ensureMutableSecurity(symbol) {
  let item = findSecurity(symbol);
  if (!item) {
    const result = findSearchResult(symbol);
    if (!result) return null;
    item = ensureDetailShape(result);
    const index = appState.securitySearchResults.findIndex((row) => row.symbol === symbol);
    if (index >= 0) appState.securitySearchResults[index] = item;
    else appState.securitySearchResults.unshift(item);
  } else {
    Object.assign(item, ensureDetailShape(item));
  }
  return item;
}

function ensureDetailShape(item) {
  if (!item) return null;
  return {
    ...item,
    prediction: item.prediction || normalizePrediction({ predictionScore: 5, action: "观察", reason: "等待真实行情。" }),
    quote: item.quote || null,
    summary: item.summary || null,
    quoteStatus: item.quoteStatus || "failed",
    quoteError: item.quoteError || "暂无真实数据",
    intraday: item.intraday || [],
    dailyKline: item.dailyKline || [],
    weeklyKline: item.weeklyKline || [],
    historyMetrics: item.historyMetrics || calculateHistoryMetrics(item.dailyKline || []),
    fundInfo: item.fundInfo || null,
    usingCache: Boolean(item.usingCache),
    cacheSavedAt: item.cacheSavedAt || "",
    support: item.support || "",
    resistance: item.resistance || "",
    exchange: item.exchange || exchangeFromMarket(item.market || inferMarket(item.code)),
    sinaSymbol: item.sinaSymbol || `${(item.market || inferMarket(item.code)).toLowerCase()}${item.code}`,
    tencentSymbol: item.tencentSymbol || `${(item.market || inferMarket(item.code)).toLowerCase()}${item.code}`,
    eastmoneySecid: item.eastmoneySecid || `${(item.market || inferMarket(item.code)) === "SH" ? "1" : "0"}.${item.code}`,
    invalidCondition: item.invalidCondition || "没有真实行情不交易"
  };
}

function cacheSecurity(item) {
  const payload = {
    quote: item.quote,
    summary: item.summary,
    quoteStatus: item.quoteStatus,
    marketStatus: item.marketStatus,
    intraday: item.intraday,
    dailyKline: item.dailyKline,
    weeklyKline: item.weeklyKline,
    historyMetrics: item.historyMetrics || calculateHistoryMetrics(item.dailyKline || []),
    fundInfo: item.fundInfo,
    dataDate: getDataDateText(item),
    savedAt: getDateTimeText()
  };
  localStorage.setItem(`market-cache:${item.symbol}`, JSON.stringify(payload));
}

function restoreCachedSecurity(item) {
  const cached = loadJson(`market-cache:${item.symbol}`, null);
  if (!cached) return false;
  item.quote = item.quote || cached.quote || null;
  item.summary = item.summary || cached.summary || null;
  item.marketStatus = item.marketStatus || cached.marketStatus || null;
  item.intraday = item.intraday?.length ? item.intraday : cached.intraday || [];
  item.dailyKline = item.dailyKline?.length ? item.dailyKline : cached.dailyKline || [];
  item.weeklyKline = item.weeklyKline?.length ? item.weeklyKline : cached.weeklyKline || [];
  item.historyMetrics = item.historyMetrics || cached.historyMetrics || calculateHistoryMetrics(item.dailyKline || []);
  item.fundInfo = item.fundInfo || cached.fundInfo || null;
  item.usingCache = true;
  item.cacheSavedAt = cached.savedAt || "";
  return hasAnyRealData(item);
}

function hydrateCachedMarketData() {
  [...appState.holdings, ...appState.watchlist].forEach((item) => {
    if (restoreCachedSecurity(item)) item.quoteStatus = "historical";
  });
}

function hasAnyRealData(item) {
  return Boolean(item.quote || item.summary || item.intraday?.length || item.dailyKline?.length || item.fundInfo);
}

function hasAnyCachedData() {
  return [...appState.holdings, ...appState.watchlist].some((item) => hasAnyRealData(item));
}

function addRecent(key, list, id) {
  if (!id) return;
  const next = [id, ...list.filter((item) => item !== id)].slice(0, 8);
  list.splice(0, list.length, ...next);
  saveJson(key, next);
}

function sectionClass(item) {
  return item.type === "risk" ? "risk-zone" : item.type === "news" ? "news-zone" : item.type === "watch" ? "watch-zone" : item.type === "logic" ? "logic-zone" : item.type === "quote" ? "quote-zone" : "";
}

function getInitialView() {
  const hash = location.hash.replace("#", "");
  if (hash === "quote") return "quote";
  return sectionMap[hash] ? hash : "action";
}

function getViewLabel(view) {
  return { action: "Today", quote: "Quote", news: "News", logic: "Logic" }[view] || "";
}

function getApiBase() {
  return String(sourceData.apiBase ?? "").replace(/\/$/, "");
}

function getLastRealText() {
  return appState.lastRealUpdated ? `最后真实更新 ${appState.lastRealUpdated}` : "暂无真实更新时间";
}

function getNextRefreshText() {
  const status = appState.marketStatus.status || appState.marketStatus.session;
  if (status === "trading") return "盘中可手动刷新真实行情";
  if (status === "lunch_break") return "午间休市显示上午最后数据";
  if (status === "closed") return "收盘后显示当日收盘数据";
  if (status === "non_trading_day") return "非交易日显示最近交易日数据";
  return "失败时保留最后一次成功数据";
}

function getQuoteModeLabel(mode) {
  return {
    realtime: "盘中实时",
    delayed: "延迟行情",
    lunch_break: "午间休市",
    closed: "已收盘",
    historical: "历史数据",
    suspended: "停牌",
    non_trading_day: "非交易日",
    failed: "接口失败",
    failed_with_cache: "接口失败，使用最后一次真实数据",
    interface_failed_cache: "接口失败，使用最后一次真实数据"
  }[mode] || "接口失败";
}

function getQuoteModeDescription() {
  return apiBase ? "通过 Vercel 代理接口请求真实行情。" : "通过同源 /api 请求 Vercel 真实行情。";
}

function getMarketStatusLabel(status) {
  return {
    trading: "盘中实时",
    lunch_break: "午间休市",
    closed: "已收盘",
    non_trading_day: "非交易日",
    suspended: "停牌",
    error: "接口失败",
    historical: "历史数据"
  }[status] || "接口失败";
}

function chooseGlobalQuoteMode(modes) {
  if (modes.includes("realtime")) return "realtime";
  if (modes.includes("lunch_break")) return "lunch_break";
  if (modes.includes("historical") || modes.includes("closed")) return "historical";
  if (modes.includes("interface_failed_cache")) return "failed_with_cache";
  return "failed";
}

function getImpactLabel(item) {
  if (item.impactScore > 5) return "利好";
  if (item.impactScore < 5) return "利空";
  return "中性";
}

function impactTone(item) {
  if (item.impactType === "positive" || item.impactScore > 5) return "positive";
  if (item.impactType === "negative" || item.impactType === "risk" || item.impactScore < 5) return "risk";
  return "neutral";
}

function getRelationLabel(item) {
  const relation = inferNewsRelation(item);
  return relation === "holding" ? "影响持仓" : relation === "watch" ? "影响观察池" : "市场影响";
}

function riskRank(value) {
  const text = String(value);
  if (/高|最大|主要/.test(text)) return 3;
  if (/中/.test(text)) return 2;
  return 1;
}

function decisionTone(type) {
  if (/买/.test(type)) return "buy";
  if (/禁止/.test(type)) return "stop";
  if (/卖|减/.test(type)) return "sell";
  return "hold";
}

function getScoreColor(score) {
  const colors = { 1: "#D1FADF", 2: "#DDF8E8", 3: "#ECFDF3", 4: "#F4FBF7", 5: "#F7F7F7", 6: "#FFF1F0", 7: "#FEE4E2", 8: "#FDA29B", 9: "#F97066", 10: "#D92D20" };
  return colors[Math.round(clampScore(score))] || colors[5];
}

function clampScore(value) {
  return Math.max(1, Math.min(10, Number(value) || 5));
}

function scoreToLabel(score) {
  if (score >= 8) return "明显看涨";
  if (score > 5) return "轻度看涨";
  if (score === 5) return "中性";
  if (score >= 3) return "轻度看跌";
  return "明显看跌";
}

function scoreToDirection(score) {
  if (score > 5) return "看涨";
  if (score < 5) return "看跌";
  return "震荡";
}

function changeClass(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function getTypeLabel(type) {
  return { stock: "股票", exchange_fund: "ETF/LOF", open_fund: "开放式基金" }[type] || "标的";
}

function inferType(code = "") {
  return /^00[0-9]{4}$|^60|^68|^30/.test(String(code)) ? "stock" : /^[15]/.test(String(code)) ? "exchange_fund" : "open_fund";
}

function inferMarket(code = "") {
  if (/^(5|6|9)/.test(String(code))) return "SH";
  if (/^(0|1|2|3)/.test(String(code))) return "SZ";
  if (/^(4|8)/.test(String(code))) return "BJ";
  return "OF";
}

function exchangeFromMarket(market) {
  if (market === "SH") return "SSE";
  if (market === "SZ") return "SZSE";
  if (market === "BJ") return "BSE";
  return "OTC";
}

function toSymbol(item) {
  const market = item.market || inferMarket(item.code);
  return `${market}${item.code}`;
}

function getDefaultChartPeriod(item) {
  if (!item || item.type === "open_fund") return "fund";
  return "intraday";
}

function toChartTime(value) {
  if (typeof value === "number") return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute] = match.map(Number);
    return Math.floor(Date.UTC(year, month - 1, day, hour, minute) / 1000);
  }
  return Math.floor(new Date(String(value).replace(" ", "T")).getTime() / 1000);
}

function formatDateAxisFromTime(time) {
  return typeof time === "string" ? time.slice(5) : new Date(time * 1000).toISOString().slice(5, 10);
}

function formatMinuteFromTime(time) {
  return typeof time === "string" ? time.slice(11, 16) : new Date(time * 1000).toISOString().slice(11, 16);
}

function numericOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatScore(score) {
  return Number(score).toFixed(Number(score) % 1 ? 1 : 0);
}

function formatPrice(value) {
  return value == null ? "--" : Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function formatPercent(value) {
  return value == null ? "--" : `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}%`;
}

function formatVolume(value) {
  const n = Number(value || 0);
  if (!n) return "--";
  return n >= 100000000 ? `${(n / 100000000).toFixed(2)}亿` : n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(Math.round(n));
}

function formatAmount(value) {
  const n = Number(value || 0);
  if (!n) return "--";
  return n >= 100000000 ? `${(n / 100000000).toFixed(2)}亿` : n >= 10000 ? `${(n / 10000).toFixed(1)}万` : String(Math.round(n));
}

function formatDateAxis(value) {
  return String(value || "").slice(5, 10) || "--";
}

function formatMinute(value) {
  return String(value || "").slice(11, 16) || String(value || "").slice(0, 5);
}

function dateFromTime(value) {
  return String(value || "").slice(0, 10);
}

function getChinaDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Shanghai", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: dayMap[parts.find((p) => p.type === "weekday")?.value] ?? 0, hour: Number(parts.find((p) => p.type === "hour")?.value || 0), minute: Number(parts.find((p) => p.type === "minute")?.value || 0) };
}

function getDateText() {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replace(/\//g, "-");
}

function getDateTimeText() {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()).replace(/\//g, "-");
}

async function requestJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `接口错误 ${response.status}`);
  return payload;
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage can be unavailable in strict privacy modes. */
  }
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value || "--";
}

function createEl(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function escapeText(value) {
  return String(value ?? "");
}

function escapeAttr(value) {
  return String(value ?? "").replace(/"/g, "&quot;");
}

init();
