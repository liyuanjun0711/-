const sourceData = window.MARKET_BRIEFING_DATA || {};
const chartLib = window.LightweightCharts;

const sectionMap = {
  action: {
    title: "今日",
    subtitle: "只放今天最重要的动作、风险和影响计划的消息",
    sections: ["today-decision", "must-handle", "do-not-do", "high-risk", "plan-news"]
  },
  quote: {
    title: "行情",
    subtitle: "真实价格、历史数据、图表和主观评分分开看",
    sections: ["global-search", "holding-quotes", "quote-watchlist", "risk-trigger", "prediction-overview"]
  },
  news: {
    title: "新闻",
    subtitle: "先看影响持仓，再看观察池和市场消息",
    sections: ["holding-news", "watch-news", "market-news", "read-news"]
  },
  logic: {
    title: "逻辑",
    subtitle: "解释今天为什么这样做，不写废话",
    sections: ["reasoning", "invalid-conditions", "next-watch", "learning-framework"]
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
  news: normalizeNews(sourceData.newsFlow || []),
  sections: [],
  expandedSections: new Set(["today-decision", "global-search", "holding-quotes", "holding-news", "reasoning"]),
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
    const payload = await requestJson(`${apiBase}/api/kline?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}&count=${encodeURIComponent(count)}`);
    if (!payload.ok) throw new Error(payload.message || "真实K线获取失败");
    return normalizeKline(payload);
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
    const payload = await requestJson(`${apiBase}/api/news?keyword=${encodeURIComponent(keyword)}`);
    if (!payload.ok) throw new Error(payload.message || "新闻接口失败");
    return normalizeNews(payload.items || []);
  }
};

let chartInstance = null;

function buildSections() {
  return [
    section("today-decision", "action", "Primary", "今日操作结论", "decision", true, renderTodayDecision),
    section("must-handle", "action", "必须处理", "今日必须处理的持仓", "quote", false, renderMustHandle),
    section("do-not-do", "action", "纪律", "今日禁止操作", "risk", false, renderDoNotDo),
    section("high-risk", "action", "高风险", "高风险提醒", "risk", false, renderHighRisk),
    section("plan-news", "action", "影响计划", "影响今日计划的新闻", "news", false, renderPlanNews),
    section("global-search", "quote", "查询", "股票 / 基金 / 新闻统一搜索", "quote", true, renderGlobalSearch),
    section("holding-quotes", "quote", "持仓", "持仓行情列表", "quote", true, renderHoldingQuotes),
    section("quote-watchlist", "quote", "观察池", "观察池行情列表", "watch", false, renderQuoteWatchlist),
    section("risk-trigger", "quote", "风险", "风险触发提醒", "risk", false, renderRiskTrigger),
    section("prediction-overview", "quote", "评分", "今日评分总览", "expectation", false, renderPredictionOverview),
    section("holding-news", "news", "影响持仓", "影响持仓的新闻", "news", true, renderHoldingNews),
    section("watch-news", "news", "影响观察池", "影响观察池的新闻", "news", false, renderWatchNews),
    section("market-news", "news", "市场", "市场重大消息", "news", false, renderMarketNews),
    section("read-news", "news", "已读", "已读新闻", "news", false, renderReadNews),
    section("reasoning", "logic", "策略", "今日策略原因", "logic", true, renderReasoning),
    section("invalid-conditions", "logic", "失效", "计划失效条件", "risk", false, renderInvalidConditions),
    section("next-watch", "logic", "明日", "明日观察重点", "logic", false, renderNextWatch),
    section("learning-framework", "logic", "学习", "简短学习说明", "logic", false, renderLearningFramework)
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
      <button class="secondary-btn compact" type="button" data-action="refresh-quotes">刷新行情</button>
      <button class="secondary-btn compact" type="button" data-action="refresh-news">刷新新闻</button>
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
        <strong>今日评分：${formatScore(item.prediction.predictionScore)} / 10</strong>
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
  container.appendChild(renderNewsFeed(getNewsByRelation("holding"), { emptyText: "暂无直接影响持仓的新闻。" }));
}

function renderWatchNews(container) {
  container.appendChild(renderNewsFeed(getNewsByRelation("watch"), { emptyText: "暂无直接影响观察池的新闻。" }));
}

function renderMarketNews(container) {
  container.appendChild(renderNewsFeed(getNewsByRelation("market"), { emptyText: "暂无市场重大消息。" }));
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
        <span>${escapeText(getRelationLabel(item))}</span>
        <span>${(item.relatedStocks || []).map((stock) => escapeText(stock)).join("、") || "市场整体"}</span>
      </div>
      <button class="secondary-btn compact" type="button" data-action="show-news-detail" data-news-id="${escapeAttr(item.id)}">查看详情</button>
    `;
    wrap.appendChild(card);
  });
  return wrap;
}

function renderReasoning(container) {
  container.appendChild(renderShortCards(sourceData.reasoning || []));
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
      ${renderDetailChartArea(item)}
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
      <dl>
        <div><dt>方向</dt><dd>${escapeText(p.expectedDirection)}</dd></div>
        <div><dt>建议</dt><dd>${escapeText(p.action)}</dd></div>
        <div><dt>触发</dt><dd>${escapeText(item.resistance || p.trigger || "等待真实行情确认")}</dd></div>
        <div><dt>失效</dt><dd>${escapeText(p.invalidCondition)}</dd></div>
        <div><dt>风险</dt><dd>${escapeText(p.riskLevel)}</dd></div>
      </dl>
      <small>仅供个人复盘参考，不构成投资建议。</small>
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
          <div><dt>相关标的</dt><dd>${(item.relatedStocks || []).map((stock) => escapeText(stock)).join("、") || "市场整体"}</dd></div>
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
  chartInstance?.remove?.();
  chartInstance = null;
  const period = item.type === "open_fund" ? "fund" : appState.selectedChartPeriod;
  if (item.type === "open_fund") {
    host.innerHTML = `<div class="chart-fallback">开放式基金按净值披露；净值曲线需要基金净值接口。</div>`;
    return;
  }
  const data = period === "intraday" ? item.intraday : period === "week" ? item.weeklyKline : item.dailyKline;
  if (!data || !data.length) {
    host.innerHTML = `<div class="chart-fallback">${escapeText(chartStateText(item, period))}</div>`;
    return;
  }
  host.innerHTML = "";
  chartInstance = chartLib.createChart(host, {
    height: 220,
    layout: { background: { color: "rgba(255,255,255,.45)" }, textColor: "#393932" },
    grid: { vertLines: { color: "rgba(30,30,20,.05)" }, horzLines: { color: "rgba(30,30,20,.05)" } },
    crosshair: { mode: 1 },
    rightPriceScale: { borderVisible: false },
    timeScale: {
      borderVisible: false,
      timeVisible: period === "intraday",
      tickMarkFormatter: (time) => period === "intraday" ? formatMinuteFromTime(time) : formatDateAxisFromTime(time)
    }
  });
  const tooltip = document.querySelector(".chart-tooltip");
  if (period === "intraday") {
    const series = chartInstance.addLineSeries({ color: "#d87563", lineWidth: 2 });
    series.setData(data.map((row) => ({ time: toChartTime(row.time), value: row.price, custom: row })));
    chartInstance.subscribeCrosshairMove((param) => showChartTooltip(param, series, tooltip, item, "intraday"));
  } else {
    const series = chartInstance.addCandlestickSeries({ upColor: "#d87563", downColor: "#4f9a66", borderVisible: false, wickUpColor: "#d87563", wickDownColor: "#4f9a66" });
    series.setData(data.map((row) => ({ time: toChartTime(row.time), open: row.open, high: row.high, low: row.low, close: row.close, custom: row })));
    chartInstance.subscribeCrosshairMove((param) => showChartTooltip(param, series, tooltip, item, "kline"));
  }
  chartInstance.timeScale().fitContent();
}

function showChartTooltip(param, series, tooltip, item, type) {
  if (!tooltip || !param || !param.time || !param.seriesData?.size) {
    if (tooltip) tooltip.hidden = true;
    return;
  }
  const point = param.seriesData.get(series);
  const row = point?.custom;
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
  updateStatusText();
  try {
    appState.marketStatus = await dataProvider.getMarketStatus();
    const results = await Promise.all(appState.holdings.map((item) => refreshSecurity(item)));
    const modes = results.map((result) => result.status).filter(Boolean);
    appState.quoteMode = chooseGlobalQuoteMode(modes);
    appState.lastRealUpdated = results.some((result) => result.ok) ? getDateTimeText() : appState.lastRealUpdated;
    if (!results.some((result) => result.ok)) appState.quoteError = "真实行情暂不可用；如有缓存则使用最后一次真实数据。";
  } catch (error) {
    appState.quoteMode = hasAnyCachedData() ? "failed_with_cache" : "failed";
    appState.quoteError = error.message || "真实行情暂不可用";
  } finally {
    appState.isRefreshingQuote = false;
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
      item.intraday = await dataProvider.getIntraday(item.symbol, item.quote.tradeDate);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
    } else if (status === "lunch_break") {
      item.quote = await dataProvider.getQuote(item.symbol).catch(() => item.quote);
      const tradeDate = item.quote?.tradeDate || await dataProvider.getLastTradingDay(item.symbol);
      item.intraday = await dataProvider.getIntraday(item.symbol, tradeDate);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
    } else if (status === "closed") {
      const tradeDate = remoteStatus.tradeDate || await dataProvider.getLastTradingDay(item.symbol);
      item.summary = await dataProvider.getDailySummary(item.symbol, tradeDate);
      item.quote = summaryToQuote(item.summary);
      item.intraday = await dataProvider.getIntraday(item.symbol, tradeDate);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
    } else if (status === "non_trading_day") {
      const tradeDate = await dataProvider.getLastTradingDay(item.symbol);
      item.summary = await dataProvider.getDailySummary(item.symbol, tradeDate);
      item.quote = summaryToQuote(item.summary, "historical");
      item.intraday = await dataProvider.getIntraday(item.symbol, tradeDate);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
    } else if (status === "suspended") {
      item.quote = await dataProvider.getLastValidQuote(item.symbol);
      item.dailyKline = await dataProvider.getDailyKline(item.symbol, 120, "day");
    } else {
      throw new Error("真实行情暂不可用");
    }
    item.weeklyKline = await dataProvider.getDailyKline(item.symbol, 80, "week").catch(() => item.weeklyKline || []);
    item.quoteStatus = status === "trading" ? "realtime" : status === "lunch_break" ? "lunch_break" : status === "suspended" ? "suspended" : "historical";
    item.quoteError = "";
    cacheSecurity(item);
    return { ok: true, status: item.quoteStatus };
  } catch (error) {
    restoreCachedSecurity(item);
    item.quoteStatus = hasAnyRealData(item) ? "interface_failed_cache" : "failed";
    item.quoteError = hasAnyRealData(item) ? "真实行情暂不可用，使用最后一次真实数据" : (error.message || "真实行情暂不可用");
    return { ok: false, status: item.quoteStatus };
  }
}

async function refreshNews() {
  if (appState.isRefreshingNews) return;
  appState.isRefreshingNews = true;
  try {
    appState.news = await dataProvider.getNews(appState.searchKeyword);
    appState.lastUpdated = getDateTimeText();
  } catch (error) {
    appState.searchError = error.message || "新闻接口失败";
  } finally {
    appState.isRefreshingNews = false;
    renderApp();
  }
}

async function refreshAnalysis() {
  if (appState.isRefreshingAnalysis) return;
  appState.isRefreshingAnalysis = true;
  appState.lastUpdated = getDateTimeText();
  appState.isRefreshingAnalysis = false;
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
      appState.selectedChartPeriod = getDefaultChartPeriod(findSecurity(target.dataset.symbol));
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
      if (item) refreshSecurity(item).finally(renderApp);
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
}

function normalizeSecurities(items) {
  return items.map((item) => ({
    name: item.name || "",
    code: String(item.code || ""),
    symbol: item.symbol || toSymbol(item),
    market: item.market || inferMarket(item.code),
    type: item.type || inferType(item.code),
    sector: item.sector || "",
    support: item.support || "",
    resistance: item.resistance || "",
    action: item.action || "",
    invalidCondition: item.invalidCondition || "",
    prediction: normalizePrediction(item),
    quote: null,
    summary: null,
    quoteStatus: "failed",
    quoteError: "真实行情待刷新",
    marketStatus: null,
    intraday: [],
    dailyKline: [],
    weeklyKline: [],
    fundInfo: null
  }));
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
    publishTime: item.publishTime || "",
    summary: item.summary || item.body || "",
    relatedStocks: item.relatedStocks || [],
    impactType: item.impactType || item.type || "neutral",
    impactScore: clampScore(item.impactScore ?? 5),
    url: item.url || "",
    fullContent: item.fullContent || item.summary || item.body || "",
    read: Boolean(item.read),
    relation: item.relation || inferNewsRelationFromStatic(item),
    holdingImpact: item.holdingImpact || "",
    watchImpact: item.watchImpact || "",
    priceCondition: item.priceCondition || "",
    planChange: item.planChange || ""
  }));
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
  return {
    name: payload.name || "",
    code: payload.code || "",
    symbol: payload.symbol || payload.code || "",
    price: numericOrNull(payload.price),
    change: numericOrNull(payload.change),
    changePercent: numericOrNull(payload.changePercent),
    preClose: numericOrNull(payload.preClose),
    open: numericOrNull(payload.open),
    high: numericOrNull(payload.high),
    low: numericOrNull(payload.low),
    volume: numericOrNull(payload.volume),
    amount: numericOrNull(payload.amount),
    time: payload.time || "",
    tradeDate: payload.tradeDate || dateFromTime(payload.time),
    mode: payload.mode || "realtime",
    status: payload.status || payload.mode || "realtime"
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
  if (period === "intraday" && !item.intraday.length) return `${status}；真实分时暂无，不绘制假线。`;
  if (period === "day" && !item.dailyKline.length) return `${status}；真实日K暂无，不绘制假K线。`;
  if (period === "week" && !item.weeklyKline.length) return `${status}；真实周K暂无，不绘制假K线。`;
  return `数据日期：${getDataDateText(item)}；数据状态：${status}；更新时间：${record?.time || getSecurityUpdateText(item)}`;
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
    fundInfo: item.fundInfo || null,
    support: item.support || "",
    resistance: item.resistance || "",
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
    fundInfo: item.fundInfo,
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
  item.fundInfo = item.fundInfo || cached.fundInfo || null;
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
  if (hash === "trend" || hash === "quote") return "quote";
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
  const colors = { 1: "#83bd95", 2: "#a8d2ae", 3: "#cfe9cf", 4: "#e8f5e8", 5: "#fffdf8", 6: "#ffece7", 7: "#ffd6cc", 8: "#f5b9ab", 9: "#e79684", 10: "#d87563" };
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
  return "OF";
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
