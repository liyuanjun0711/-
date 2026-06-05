const sourceData = window.MARKET_BRIEFING_DATA || {};
const chartLib = window.LightweightCharts;

const sectionMap = {
  action: {
    title: "今日操作",
    subtitle: "先处理买卖，再看原因",
    sections: ["trade-decision", "one-sentence", "execution-list", "trade-plan", "do-not-do"]
  },
  quote: {
    title: "持仓行情与走势",
    subtitle: "看价格、K线、关键位和预期方向",
    sections: ["holding-quotes", "intraday-chart", "daily-kline", "expectation", "key-levels", "risk-trigger"]
  },
  news: {
    title: "市场新闻与机会",
    subtitle: "只看影响持仓和观察池的消息",
    sections: ["holding-news", "market-risk", "hot-review", "sector-move", "watchlist"]
  },
  logic: {
    title: "今日交易逻辑",
    subtitle: "解释计划，不写废话",
    sections: ["reasoning", "invalid-conditions", "learning-framework", "cancel-plan", "next-watch"]
  }
};

const appState = {
  quoteMode: sourceData.quoteMode || "mock",
  marketStatus: getMarketStatus(),
  lastUpdated: sourceData.lastUpdated || null,
  refreshInterval: Number(sourceData.refreshInterval || 10000),
  holdings: normalizeHoldings(sourceData.holdings),
  watchlist: normalizeWatchlist(sourceData.watchlist),
  currentView: getInitialView(),
  sections: [],
  expandedSections: new Set(["trade-decision", "holding-quotes", "holding-news", "reasoning"]),
  isRefreshingQuote: false,
  isRefreshingAnalysis: false,
  quoteError: null,
  searchResults: [],
  searchError: "",
  nextRefreshAt: null,
  autoTimer: null,
  countdownTimer: null,
  initialized: false
};

const chartInstances = [];

appState.sections = buildSections();

function normalizeHoldings(items = []) {
  return items.map((item) => {
    const holding = {
      name: item.name || "",
      code: item.code || "",
      market: item.market || inferMarket(item.code),
      price: Number(item.price ?? 0),
      previousClose: Number(item.previousClose ?? item.price ?? 0),
      change: Number(item.change ?? 0),
      changePercent: Number(item.changePercent ?? 0),
      volume: Number(item.volume ?? 0),
      amount: Number(item.amount ?? 0),
      highOpen: Boolean(item.highOpen),
      volumeState: item.volumeState || "normal",
      sectorStrength: Number(item.sectorStrength ?? 0),
      newsStrength: Number(item.newsStrength ?? 0),
      holdingStatus: item.holdingStatus || "holding",
      expectation: item.expectation || "flat",
      strength: clampStrength(item.strength ?? 0),
      support: item.support || "",
      resistance: item.resistance || "",
      action: item.action || "",
      invalidCondition: item.invalidCondition || "",
      quoteMode: item.quoteMode || sourceData.quoteMode || "mock",
      quoteStatus: item.quoteStatus || "",
      kline: { intraday: [], daily: [] }
    };
    holding.advice = buildPersonalAdvice(holding);
    return holding;
  });
}

function normalizeWatchlist(items = []) {
  return items
    .filter((item) => item && item.code)
    .map((item) => ({
      name: item.name || "",
      code: item.code || "",
      market: item.market || inferMarket(item.code),
      sector: item.sector || "未分类",
      status: item.status || "观察，不买",
      reason: item.reason || "",
      buyTrigger: item.buyTrigger || "",
      avoidReason: item.avoidReason || "条件未满足，不买。",
      risk: item.risk || "",
      price: item.price == null ? null : Number(item.price),
      changePercent: item.changePercent == null ? null : Number(item.changePercent)
    }));
}

function buildSections() {
  return [
    section("trade-decision", "action", "Primary", "今天到底买卖什么", "primary", true, renderTradeDecision),
    section("one-sentence", "action", "一句话", "今日一句话", "summary", false, renderOneSentence),
    section("execution-list", "action", "执行顺序", "满仓账户先卖后买", "execution", false, renderExecutionList),
    section("trade-plan", "action", "逐笔计划", "逐笔操作计划", "execution", false, renderTradePlan),
    section("do-not-do", "action", "纪律", "今天不做什么", "risk", false, renderDoNotDo),

    section("holding-quotes", "quote", "Primary", "持仓实时行情", "quote", true, renderHoldingQuotes),
    section("intraday-chart", "quote", "分时", "分时图", "quote", false, renderIntradayCharts),
    section("daily-kline", "quote", "日K", "日K图", "quote", false, renderDailyCharts),
    section("expectation", "quote", "预期", "走势预期", "expectation", false, renderExpectation),
    section("key-levels", "quote", "关键价位", "支撑、压力、触发价", "quote", false, renderKeyLevels),
    section("risk-trigger", "quote", "风险", "风险触发条件", "risk", false, renderRiskTrigger),

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
  disposeCharts();
  root.innerHTML = "";

  root.appendChild(renderSectionHeader(appState.currentView));
  getCurrentSections().forEach((sectionItem, index) => {
    root.appendChild(renderSection(sectionItem, index === 0));
  });

  dedupeRenderedSections();
  updateActiveUI();
  updateStatusText();
  revealCards();
  requestAnimationFrame(renderVisibleCharts);
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
      <span>${getMarketStatusLabel()}</span>
      <small>${getLastUpdatedText()}</small>
    </div>
  `;
  return header;
}

function renderSection(sectionItem, isPrimary) {
  const open = isSectionOpen(sectionItem);
  const card = createEl("section", `module-card reveal-card ${isPrimary ? "primary-card" : "secondary-card"} ${sectionClass(sectionItem)}`);
  card.id = `section-${sectionItem.id}`;
  card.dataset.sectionId = sectionItem.id;
  card.dataset.group = sectionItem.group;
  card.dataset.type = sectionItem.type;

  const head = createEl("div", "section-head");
  head.innerHTML = `
    <div>
      <p class="section-label">${sectionItem.eyebrow}</p>
      <h2>${sectionItem.title}</h2>
    </div>
  `;

  if (!sectionItem.fixedOpen) {
    const toggle = createEl("button", "section-toggle");
    toggle.type = "button";
    toggle.dataset.action = "toggle-section";
    toggle.dataset.targetSection = sectionItem.id;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = `<span>${open ? "收起" : "展开"}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
    head.appendChild(toggle);
  }

  const body = createEl("div", "section-body");
  body.id = `body-${sectionItem.id}`;
  body.classList.toggle("collapsed", !open);
  body.setAttribute("aria-hidden", String(!open));
  sectionItem.render(body);

  card.appendChild(head);
  card.appendChild(body);
  return card;
}

function sectionClass(sectionItem) {
  if (sectionItem.type === "risk") return "risk-zone";
  if (sectionItem.type === "news") return "news-zone";
  if (sectionItem.type === "watch") return "watch-zone";
  if (sectionItem.type === "logic") return "logic-zone";
  if (sectionItem.type === "quote") return "quote-zone";
  return "";
}

function renderTradeDecision(container) {
  const wrap = createEl("div", "decision-grid");
  (sourceData.tradeDecision || []).forEach((item) => {
    const card = createEl("article", `decision-card mini-card ${decisionTone(item.type)}`);
    card.innerHTML = `
      <span class="label">${escapeText(item.type)}</span>
      <strong>${escapeText(item.title)}</strong>
      <p><b>结论：</b>${escapeText(item.conclusion)}</p>
      <p><b>动作：</b>${escapeText(item.action)}</p>
      <p><b>条件：</b>${escapeText(item.trigger)}</p>
      <p><b>风险：</b>${escapeText(item.reason)}</p>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderOneSentence(container) {
  container.innerHTML = `
    <div class="summary-copy">
      <h2>${escapeText(sourceData.oneLine)}</h2>
    </div>
    <div class="quick-actions">
      <button class="secondary-btn" type="button" data-action="open-section" data-target-section="holding-quotes">看行情</button>
      <button class="secondary-btn" type="button" data-action="open-section" data-target-section="risk-trigger">看风险</button>
    </div>
  `;
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

function renderHoldingQuotes(container) {
  container.appendChild(renderQuoteStatusPanel());
  container.appendChild(renderStockSearch());

  const wrap = createEl("div", "holding-list");
  appState.holdings.forEach((item) => {
    const advice = buildPersonalAdvice(item);
    item.advice = advice;
    const card = createEl("article", "holding-card quote-card mini-card");
    card.style.setProperty("--expect-bg", getStrengthColor(item.strength));
    card.innerHTML = `
      <div class="holding-head">
        <div>
          <strong>${escapeText(item.name)}</strong>
          <span>${escapeText(item.code)} / ${escapeText(item.market)}</span>
        </div>
        <div class="quote-box">
          <strong>${formatPrice(item.price)}</strong>
          <span class="${changeClass(item.changePercent)}">${formatPercent(item.changePercent)}</span>
        </div>
      </div>
      <div class="quote-meta-grid">
        <span>成交量 ${formatVolume(item.volume)}</span>
        <span>状态 ${getQuoteModeLabel(item.quoteMode || appState.quoteMode)}</span>
        <span>市场 ${getMarketStatusLabel()}</span>
      </div>
      <div class="advice-panel">
        <strong>${escapeText(advice.action)}</strong>
        <p>${escapeText(advice.reason)}</p>
        <dl>
          <div><dt>触发</dt><dd>${escapeText(advice.trigger)}</dd></div>
          <div><dt>失效</dt><dd>${escapeText(advice.invalid)}</dd></div>
          <div><dt>风险</dt><dd>${escapeText(advice.riskLevel)}；仅供个人复盘参考</dd></div>
        </dl>
      </div>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderQuoteStatusPanel() {
  const panel = createEl("div", `quote-status-panel mode-${appState.quoteMode}`);
  panel.innerHTML = `
    <div>
      <span class="label">行情模式</span>
      <strong>${getQuoteModeLabel(appState.quoteMode)}</strong>
      <p>${getQuoteModeDescription()}</p>
      ${appState.quoteError ? `<p class="quote-error">行情暂不可用：${escapeText(appState.quoteError)}</p>` : ""}
    </div>
    <div class="quote-status-actions">
      <span>${getMarketStatusLabel()}</span>
      <small id="nextRefreshText">${getNextRefreshText()}</small>
      <button class="secondary-btn compact" type="button" data-action="refresh-quotes">重试行情</button>
    </div>
  `;
  return panel;
}

function renderStockSearch() {
  const box = createEl("div", "stock-search-panel");
  box.innerHTML = `
    <form class="stock-search-form" data-role="stock-search">
      <label for="stockSearchInput">股票查询</label>
      <div>
        <input id="stockSearchInput" name="keyword" type="search" placeholder="输入代码或名称，如 601208 / 东材科技" autocomplete="off">
        <button class="primary-btn compact" type="submit">查询</button>
      </div>
    </form>
    <div id="stockSearchState" class="search-state">${escapeText(appState.searchError || "支持代码和名称；无代理时使用本地模拟查询。")}</div>
    <div id="stockSearchResults" class="search-results"></div>
  `;
  const results = box.querySelector("#stockSearchResults");
  renderSearchResults(results);
  return box;
}

function renderSearchResults(container) {
  container.innerHTML = "";
  appState.searchResults.forEach((item) => {
    const row = createEl("article", "search-result mini-card");
    row.innerHTML = `
      <div>
        <strong>${escapeText(item.name)}</strong>
        <span>${escapeText(item.code)} / ${escapeText(item.market || inferMarket(item.code))}</span>
        <small>${item.price == null ? "价格待刷新" : `最新价 ${formatPrice(item.price)} / ${formatPercent(item.changePercent)}`}</small>
      </div>
      <div>
        <button class="secondary-btn compact" type="button" data-action="add-holding" data-code="${escapeText(item.code)}">加入持仓</button>
        <button class="secondary-btn compact" type="button" data-action="add-watch" data-code="${escapeText(item.code)}">加入观察</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function renderIntradayCharts(container) {
  container.appendChild(renderChartGroup("1m"));
}

function renderDailyCharts(container) {
  container.appendChild(renderChartGroup("day"));
}

function renderChartGroup(period) {
  const wrap = createEl("div", "chart-card-list");
  appState.holdings.forEach((item) => {
    wrap.appendChild(renderChartCard(item, period));
  });
  return wrap;
}

function renderChartCard(item, period) {
  const card = createEl("article", "chart-card mini-card");
  const mode = item.quoteMode || appState.quoteMode;
  card.innerHTML = `
    <div class="chart-card-head">
      <div>
        <strong>${escapeText(item.name)}</strong>
        <span>${escapeText(item.code)} / ${period === "day" ? "日K" : "分时"}</span>
      </div>
      <em class="data-mode ${mode}">${getQuoteModeLabel(mode)}</em>
    </div>
    <div class="chart-host" data-chart-code="${escapeText(item.code)}" data-chart-period="${period}"></div>
    <div class="chart-tooltip" data-tooltip-for="${escapeText(item.code)}-${period}" hidden></div>
    <div class="chart-axis-labels">${period === "day" ? renderDateAxisLabels(item) : renderIntradayAxisLabels()}</div>
    <small class="chart-state">${getChartStateText(mode)}</small>
  `;
  return card;
}

function renderExpectation(container) {
  const wrap = createEl("div", "expectation-list");
  appState.holdings.forEach((item) => {
    const card = createEl("article", "expectation-card expect-card mini-card");
    card.style.setProperty("--expect-bg", getStrengthColor(item.strength));
    card.innerHTML = `
      <div class="expect-top">
        <div>
          <strong>${escapeText(item.name)} ${escapeText(item.code)}</strong>
          <span>方向：${directionText(item)} / 强度 ${item.strength}</span>
        </div>
        <span class="expect-pill">${directionText(item)}</span>
      </div>
      <dl>
        <div><dt>动作</dt><dd>${escapeText(item.advice?.action || item.action)}</dd></div>
        <div><dt>条件</dt><dd>${escapeText(item.advice?.trigger || item.resistance)}</dd></div>
        <div><dt>风险</dt><dd>${escapeText(item.advice?.riskLevel || "中")}；仅供个人复盘参考</dd></div>
      </dl>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderKeyLevels(container) {
  const wrap = createEl("div", "level-list");
  appState.holdings.forEach((item) => {
    const card = createEl("article", "level-card mini-card");
    card.innerHTML = `
      <strong>${escapeText(item.name)} ${escapeText(item.code)}</strong>
      <dl>
        <div><dt>支撑</dt><dd>${escapeText(item.support)}</dd></div>
        <div><dt>压力</dt><dd>${escapeText(item.resistance)}</dd></div>
        <div><dt>动作</dt><dd>${escapeText(item.action)}</dd></div>
      </dl>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderRiskTrigger(container) {
  const items = appState.holdings.map((item) => `${item.name} ${item.code}：${item.invalidCondition}`);
  container.appendChild(renderBulletList(items, "invalid-list"));
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
  const wrap = createEl("div", "watch-card-list");
  appState.watchlist.forEach((item) => {
    const card = createEl("article", "watch-card mini-card");
    card.innerHTML = `
      <div class="watch-head">
        <div>
          <strong>${escapeText(item.name)}</strong>
          <span>${escapeText(item.code)} / ${escapeText(item.market)} / ${escapeText(item.sector)}</span>
        </div>
        <em>${escapeText(item.status)}</em>
      </div>
      <p><b>原因：</b>${escapeText(item.reason)}</p>
      <p><b>触发：</b>${escapeText(item.buyTrigger)}</p>
      <p><b>不买：</b>${escapeText(item.avoidReason)}</p>
      <p><b>风险：</b>${escapeText(item.risk)}</p>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
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
  container.appendChild(renderBulletList(sourceData.cancelPlan || sourceData.invalidConditions || [], "invalid-list"));
}

function renderNextWatch(container) {
  const items = sourceData.nextWatch || [
    { title: "贵金属", body: "只看反弹能否到减仓价。" },
    { title: "军工", body: "只看尾盘是否强于大盘。" },
    { title: "恒生科技", body: "只看0.600是否守住。" }
  ];
  container.appendChild(renderShortCards(items));
}

function renderActionRows(items) {
  const wrap = createEl("div", "action-row-list");
  items.forEach((item) => {
    const row = createEl("article", `action-row mini-card ${decisionTone(item.type)}`);
    row.innerHTML = `
      <strong>${escapeText(item.title)}</strong>
      <p>${escapeText(item.action)}</p>
      <small>${escapeText(item.trigger)}</small>
    `;
    wrap.appendChild(row);
  });
  return wrap;
}

function renderNewsCards(items) {
  const wrap = createEl("div", "news-list");
  items.forEach((item) => {
    const card = createEl("article", `news-item mini-card ${item.type || "neutral"}`);
    card.innerHTML = `
      <h3>${escapeText(item.title)}</h3>
      <p>${escapeText(item.summary || item.body || item.conclusion || "")}</p>
      ${item.action ? `<p><b>动作：</b>${escapeText(item.action)}</p>` : ""}
    `;
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

function getCurrentSections() {
  const ids = sectionMap[appState.currentView]?.sections || [];
  const seen = new Set();
  return ids
    .map((id) => appState.sections.find((item) => item.id === id))
    .filter((item) => {
      if (!item) return false;
      if (seen.has(item.id)) {
        console.warn(`重复模块已跳过: ${item.id}`);
        return false;
      }
      seen.add(item.id);
      return true;
    });
}

function validateSectionMap() {
  const seen = new Map();
  Object.entries(sectionMap).forEach(([group, config]) => {
    config.sections.forEach((id) => {
      if (seen.has(id)) console.warn(`模块 ${id} 同时出现在 ${seen.get(id)} 和 ${group}`);
      seen.set(id, group);
    });
  });
}

function dedupeRenderedSections() {
  const seen = new Set();
  document.querySelectorAll(".module-card[data-section-id]").forEach((node) => {
    const id = node.dataset.sectionId;
    if (seen.has(id)) {
      console.warn(`删除重复模块: ${id}`);
      node.remove();
      return;
    }
    seen.add(id);
  });
}

function isSectionOpen(sectionItem) {
  return sectionItem.fixedOpen || appState.expandedSections.has(sectionItem.id);
}

function isCurrentGroupOpen() {
  return getCurrentSections()
    .filter((item) => !item.fixedOpen)
    .every((item) => appState.expandedSections.has(item.id));
}

function toggleCurrentGroup() {
  const sections = getCurrentSections().filter((item) => !item.fixedOpen);
  const shouldOpen = !sections.every((item) => appState.expandedSections.has(item.id));
  sections.forEach((item) => {
    if (shouldOpen) appState.expandedSections.add(item.id);
    else appState.expandedSections.delete(item.id);
  });
  renderApp();
}

function toggleSection(sectionId) {
  if (!sectionId) return;
  if (appState.expandedSections.has(sectionId)) appState.expandedSections.delete(sectionId);
  else appState.expandedSections.add(sectionId);
  renderApp();
  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openSection(sectionId) {
  const targetGroup = Object.entries(sectionMap).find(([, config]) => config.sections.includes(sectionId))?.[0];
  if (targetGroup) appState.currentView = targetGroup;
  appState.expandedSections.add(sectionId);
  renderApp();
  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setView(view) {
  if (!sectionMap[view]) return;
  appState.currentView = view;
  if (location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
  renderApp();
  document.getElementById("moduleRoot")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getInitialView() {
  const hash = location.hash.replace("#", "");
  if (hash === "trend") return "quote";
  return sectionMap[hash] ? hash : "action";
}

function updateActiveUI() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === appState.currentView);
  });
  updateSegmentIndicator(document.querySelector(`.segment [data-view="${appState.currentView}"]`));
}

function updateSegmentIndicator(activeButton) {
  const segment = document.querySelector(".segment");
  const indicator = document.querySelector(".segment-indicator");
  if (!segment || !indicator || !activeButton) return;
  const segmentRect = segment.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  indicator.style.width = `${buttonRect.width}px`;
  indicator.style.transform = `translateX(${buttonRect.left - segmentRect.left}px)`;
}

function updateStatusText() {
  setText("reportDate", sourceData.date);
  setText("reportTime", getLastUpdatedText());
  setText("analysisStatus", appState.isRefreshingAnalysis ? "正在刷新分析..." : "分析结构已更新");
  setText("liveQuoteStatus", `${getQuoteModeLabel(appState.quoteMode)} / ${getMarketStatusLabel()}`);
  const next = document.getElementById("nextRefreshText");
  if (next) next.textContent = getNextRefreshText();
}

function setQuoteRefreshing(isRefreshing) {
  appState.isRefreshingQuote = isRefreshing;
  document.querySelectorAll('[data-action="refresh-quotes"]').forEach((button) => {
    button.classList.toggle("is-refreshing", isRefreshing);
    button.disabled = isRefreshing;
  });
}

function setAnalysisRefreshing(isRefreshing) {
  appState.isRefreshingAnalysis = isRefreshing;
  document.querySelectorAll('[data-action="refresh-analysis"]').forEach((button) => {
    button.classList.toggle("is-refreshing", isRefreshing);
    button.disabled = isRefreshing;
    button.textContent = isRefreshing ? "刷新中" : "刷新分析";
  });
}

async function refreshQuotes({ silent = false } = {}) {
  if (appState.isRefreshingQuote) return;
  setQuoteRefreshing(true);
  appState.quoteError = null;

  try {
    const updated = [];
    for (const item of appState.holdings) {
      const quote = await fetchQuoteData(item.code);
      applyQuote(item, quote);
      const [intraday, daily] = await Promise.all([
        fetchKlineData(item.code, "1m"),
        fetchKlineData(item.code, "day")
      ]);
      item.kline.intraday = intraday.items;
      item.kline.daily = daily.items;
      item.quoteMode = quote.mode || intraday.mode || daily.mode || appState.quoteMode;
      updated.push(item.quoteMode);
    }
    appState.quoteMode = chooseGlobalQuoteMode(updated);
    appState.lastUpdated = getDateTimeText();
    appState.marketStatus = getMarketStatus();
    scheduleAutoRefresh();
  } catch (error) {
    appState.quoteError = error.message || "代理接口未返回行情";
    appState.quoteMode = "mock";
    appState.lastUpdated = getDateTimeText();
    await loadMockMarketData();
  } finally {
    setQuoteRefreshing(false);
    if (!silent) renderApp();
    else updateStatusText();
  }
}

async function refreshAnalysis() {
  if (appState.isRefreshingAnalysis) return;
  setAnalysisRefreshing(true);
  await new Promise((resolve) => setTimeout(resolve, 650));
  appState.holdings.forEach((item) => {
    item.advice = buildPersonalAdvice(item);
  });
  appState.lastUpdated = getDateTimeText();
  setAnalysisRefreshing(false);
  renderApp();
}

async function fetchQuoteData(code) {
  const apiBase = getApiBase();
  if (apiBase) {
    const response = await fetch(`${apiBase}/api/quote?code=${encodeURIComponent(code)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("行情代理请求失败");
    return response.json();
  }
  return getMockQuote(code);
}

async function fetchKlineData(symbol, period = "1m") {
  const apiBase = getApiBase();
  if (apiBase) {
    const response = await fetch(`${apiBase}/api/kline?code=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("K线代理请求失败");
    const payload = await response.json();
    return { mode: payload.mode || appState.quoteMode || "delayed", items: normalizeKlineItems(payload.items || [], period) };
  }
  return { mode: "mock", items: createMockKline(symbol, period) };
}

async function searchStocks(keyword) {
  const value = keyword.trim();
  if (!value) return [];
  const apiBase = getApiBase();
  if (apiBase) {
    const response = await fetch(`${apiBase}/api/search?keyword=${encodeURIComponent(value)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("查询接口不可用");
    const payload = await response.json();
    return normalizeSearchItems(payload.items || []);
  }
  return localSearch(value);
}

function getApiBase() {
  return String(sourceData.apiBase || "").replace(/\/$/, "");
}

function applyQuote(item, quote) {
  item.name = quote.name || item.name;
  item.code = quote.code || item.code;
  item.market = quote.market || item.market || inferMarket(item.code);
  item.price = Number(quote.price ?? item.price ?? 0);
  item.change = Number(quote.change ?? item.change ?? 0);
  item.changePercent = Number(quote.changePercent ?? item.changePercent ?? 0);
  item.volume = Number(quote.volume ?? item.volume ?? 0);
  item.amount = Number(quote.amount ?? item.amount ?? 0);
  item.quoteMode = quote.mode || appState.quoteMode;
  syncExpectationFromQuote(item);
  item.advice = buildPersonalAdvice(item);
}

async function loadMockMarketData() {
  appState.holdings.forEach((item) => {
    const quote = getMockQuote(item.code);
    applyQuote(item, quote);
    item.kline.intraday = createMockKline(item.code, "1m");
    item.kline.daily = createMockKline(item.code, "day");
  });
}

function getMockQuote(code) {
  const item = appState.holdings.find((holding) => holding.code === code) || findInUniverse(code) || { code, name: "模拟股票", price: 10 };
  const drift = (Math.sin((Number(code.slice(-3)) || 1) + Date.now() / 600000) * 0.9);
  const price = Number(Math.max(0.01, Number(item.price || 10) * (1 + drift / 100)).toFixed(3));
  return {
    name: item.name,
    code,
    market: item.market || inferMarket(code),
    price,
    change: Number((price - Number(item.previousClose || item.price || price)).toFixed(3)),
    changePercent: Number(drift.toFixed(2)),
    volume: Math.round((Number(code.slice(-3)) || 100) * 1234),
    amount: Math.round(price * (Number(code.slice(-3)) || 100) * 1234),
    time: getDateTimeText(),
    mode: "mock"
  };
}

function createMockKline(symbol, period) {
  const holding = appState.holdings.find((item) => item.code === symbol) || findInUniverse(symbol);
  const base = Number(holding?.price || 10);
  const seed = Number(symbol.slice(-3)) || 100;
  if (period === "day") return createMockDailyKline(base, seed);
  return createMockIntradayLine(base, seed);
}

function createMockIntradayLine(base, seed) {
  const points = [];
  const times = buildIntradayTimes();
  let volumeBase = seed * 100;
  times.forEach((time, index) => {
    const wave = Math.sin((index + seed) / 7) * base * 0.007;
    const noise = Math.cos((index + seed) / 3) * base * 0.003;
    const value = Math.max(0.01, base + wave + noise);
    volumeBase += Math.round(Math.abs(noise) * 100000 + 3200);
    points.push({
      time: toTimestamp(time),
      label: time,
      value: Number(value.toFixed(3)),
      avg: Number((base + wave * 0.45).toFixed(3)),
      volume: volumeBase,
      changePercent: Number(((value - base) / base * 100).toFixed(2))
    });
  });
  return points;
}

function createMockDailyKline(base, seed) {
  const rows = [];
  const dates = buildRecentTradingDates(36);
  let prev = base * 0.96;
  dates.forEach((date, index) => {
    const wave = Math.sin((index + seed) / 5) * base * 0.015;
    const open = Math.max(0.01, prev);
    const close = Math.max(0.01, open + wave + Math.cos(index + seed) * base * 0.006);
    const high = Math.max(open, close) + base * (0.004 + (index % 3) * 0.002);
    const low = Math.max(0.01, Math.min(open, close) - base * (0.004 + (index % 2) * 0.002));
    rows.push({
      time: date,
      open: Number(open.toFixed(3)),
      high: Number(high.toFixed(3)),
      low: Number(low.toFixed(3)),
      close: Number(close.toFixed(3)),
      volume: Math.round((seed + index * 11) * 1000),
      changePercent: Number(((close - open) / open * 100).toFixed(2))
    });
    prev = close;
  });
  return rows;
}

function buildIntradayTimes() {
  const output = [];
  [["09:30", "11:30"], ["13:00", "15:00"]].forEach(([start, end]) => {
    let current = timeToMinutes(start);
    const stop = timeToMinutes(end);
    while (current <= stop) {
      output.push(minutesToTime(current));
      current += 5;
    }
  });
  return output;
}

function buildRecentTradingDates(count) {
  const dates = [];
  const current = new Date();
  while (dates.length < count) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) dates.unshift(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() - 1);
  }
  return dates;
}

function normalizeKlineItems(items, period) {
  if (period === "day") {
    return items.map((item) => ({
      time: typeof item.time === "number" ? timestampToDate(item.time) : item.time,
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
      volume: Number(item.volume || 0),
      changePercent: Number(item.changePercent || 0)
    }));
  }
  return items.map((item) => ({
    time: typeof item.time === "number" ? item.time : toTimestamp(item.time),
    label: item.label || formatTimeLabel(item.time),
    value: Number(item.value ?? item.close ?? item.price),
    avg: Number(item.avg ?? item.average ?? item.value ?? item.close ?? item.price),
    volume: Number(item.volume || 0),
    changePercent: Number(item.changePercent || 0)
  }));
}

function renderVisibleCharts() {
  document.querySelectorAll(".chart-host").forEach((host) => renderChart(host));
}

function renderChart(host) {
  if (!chartLib || !host.isConnected || host.offsetWidth < 40) {
    host.innerHTML = `<div class="chart-fallback">图表库未加载，当前显示行情文字。</div>`;
    return;
  }
  const code = host.dataset.chartCode;
  const period = host.dataset.chartPeriod;
  const holding = appState.holdings.find((item) => item.code === code);
  if (!holding) return;
  const data = period === "day" ? holding.kline.daily : holding.kline.intraday;
  if (!data?.length) {
    host.innerHTML = `<div class="chart-fallback">行情暂不可用</div>`;
    return;
  }

  const chart = chartLib.createChart(host, {
    width: host.clientWidth,
    height: 190,
    layout: { background: { color: "rgba(255,255,255,0)" }, textColor: "#5f5c55" },
    grid: {
      vertLines: { color: "rgba(31,31,27,0.06)" },
      horzLines: { color: "rgba(31,31,27,0.08)" }
    },
    rightPriceScale: { borderVisible: false },
    timeScale: {
      visible: false,
      borderVisible: false,
      timeVisible: period !== "day",
      secondsVisible: false,
      tickMarkFormatter: (time) => period === "day" ? formatDateAxis(time) : formatTimeAxis(time)
    },
    crosshair: { mode: 0 },
    handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
    handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true }
  });

  let series;
  if (period === "day") {
    series = chart.addSeries(chartLib.CandlestickSeries, {
      upColor: "#cf5d4f",
      downColor: "#5b9a68",
      borderUpColor: "#cf5d4f",
      borderDownColor: "#5b9a68",
      wickUpColor: "#cf5d4f",
      wickDownColor: "#5b9a68"
    });
    series.setData(data.map((item) => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close
    })));
  } else {
    series = chart.addSeries(chartLib.LineSeries, {
      color: holding.changePercent >= 0 ? "#cf5d4f" : "#5b9a68",
      lineWidth: 2,
      priceLineVisible: false
    });
    series.setData(data.map((item) => ({ time: item.time, value: item.value })));
  }
  chart.timeScale().fitContent();
  attachTooltip(chart, series, holding, period, data, host);
  attachDomTooltip(host, holding, period, data);
  chartInstances.push(chart);
}

function attachTooltip(chart, series, holding, period, data, host) {
  const tooltip = host.parentElement.querySelector(".chart-tooltip");
  const byTime = new Map(data.map((item) => [String(item.time), item]));
  chart.subscribeCrosshairMove((param) => {
    if (!param?.time || !param.point || !tooltip) {
      if (tooltip) tooltip.hidden = true;
      return;
    }
    const row = byTime.get(String(param.time));
    if (!row) {
      tooltip.hidden = true;
      return;
    }
    tooltip.hidden = false;
    tooltip.style.left = `${Math.min(Math.max(param.point.x + 12, 8), host.clientWidth - 170)}px`;
    tooltip.style.top = `${Math.max(param.point.y + 8, 8)}px`;
    tooltip.innerHTML = period === "day" ? renderKlineTooltip(holding, row) : renderIntradayTooltip(holding, row);
  });
}

function attachDomTooltip(host, holding, period, data) {
  const tooltip = host.parentElement.querySelector(".chart-tooltip");
  if (!tooltip || !data.length) return;
  const showAt = (clientX, clientY) => {
    const rect = host.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const index = Math.max(0, Math.min(data.length - 1, Math.round(ratio * (data.length - 1))));
    const row = data[index];
    tooltip.hidden = false;
    tooltip.style.left = `${Math.min(Math.max(clientX - rect.left + 12, 8), rect.width - 170)}px`;
    tooltip.style.top = `${Math.min(Math.max(clientY - rect.top + 8, 8), rect.height - 92)}px`;
    tooltip.innerHTML = period === "day" ? renderKlineTooltip(holding, row) : renderIntradayTooltip(holding, row);
  };
  host.addEventListener("pointermove", (event) => showAt(event.clientX, event.clientY));
  host.addEventListener("pointerleave", () => { tooltip.hidden = true; });
  host.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (touch) showAt(touch.clientX, touch.clientY);
  }, { passive: true });
}

function renderKlineTooltip(holding, row) {
  return `
    <strong>${escapeText(holding.name)} ${escapeText(holding.code)}</strong>
    <span>时间 ${formatDateAxis(row.time)}</span>
    <span>开 ${formatPrice(row.open)} 高 ${formatPrice(row.high)}</span>
    <span>低 ${formatPrice(row.low)} 收 ${formatPrice(row.close)}</span>
    <span>量 ${formatVolume(row.volume)} / ${formatPercent(row.changePercent)}</span>
  `;
}

function renderIntradayTooltip(holding, row) {
  return `
    <strong>${escapeText(holding.name)} ${escapeText(holding.code)}</strong>
    <span>时间 ${formatTimeAxis(row.time)}</span>
    <span>现价 ${formatPrice(row.value)} / 均价 ${formatPrice(row.avg)}</span>
    <span>量 ${formatVolume(row.volume)} / ${formatPercent(row.changePercent)}</span>
  `;
}

function disposeCharts() {
  while (chartInstances.length) {
    const chart = chartInstances.pop();
    try { chart.remove(); } catch {}
  }
}

function buildPersonalAdvice(item) {
  const support = parseLevel(item.support);
  const resistance = parseLevel(item.resistance);
  const belowSupport = support && item.price < support;
  const aboveResistance = resistance && item.price > resistance;
  const strongSector = Number(item.sectorStrength) > 0 || item.strength >= 2;
  const badNews = Number(item.newsStrength) < 0;
  const strongNews = Number(item.newsStrength) > 0;
  const highRisk = belowSupport || item.changePercent <= -1.5 || badNews;
  const strongMove = aboveResistance || (item.changePercent >= 1.2 && strongSector);

  if (belowSupport) {
    return {
      action: "减仓或停止加仓",
      reason: "价格跌破支撑，原计划失效。",
      trigger: `跌破 ${item.support} 后不补仓`,
      invalid: `重新站回 ${item.support} 且板块转强`,
      riskLevel: "高"
    };
  }
  if (strongMove) {
    return {
      action: "持有，不追",
      reason: "已接近或突破压力位，满仓账户不追高。",
      trigger: `回踩不破 ${item.resistance} 再看`,
      invalid: `冲高回落跌回 ${item.resistance}`,
      riskLevel: "中"
    };
  }
  if (item.strength > 0 || strongNews) {
    return {
      action: item.holdingStatus === "watch" ? "条件买入" : "持有",
      reason: "方向偏强，但需要价格确认。",
      trigger: `放量突破 ${item.resistance || "压力位"}`,
      invalid: `跌破 ${item.support || "支撑位"}`,
      riskLevel: "中"
    };
  }
  if (highRisk || item.strength < 0) {
    return {
      action: "观察，反弹减",
      reason: "走势偏弱，先控制回撤。",
      trigger: `反弹到 ${item.resistance || "压力位"} 再处理`,
      invalid: `放量站回 ${item.resistance || "压力位"}`,
      riskLevel: highRisk ? "高" : "中"
    };
  }
  return {
    action: "观察，不追",
    reason: "上涨强度不足，未突破关键压力位。",
    trigger: `放量突破 ${item.resistance || "压力位"} 后再考虑`,
    invalid: `跌破 ${item.support || "支撑位"} 则取消观察`,
    riskLevel: "中"
  };
}

function syncExpectationFromQuote(item) {
  if (item.changePercent >= 1.5) {
    item.expectation = "up";
    item.strength = 2;
  } else if (item.changePercent >= 0.4) {
    item.expectation = "up";
    item.strength = 1;
  } else if (item.changePercent <= -1.5) {
    item.expectation = "down";
    item.strength = -2;
  } else if (item.changePercent <= -0.4) {
    item.expectation = "down";
    item.strength = -1;
  } else {
    item.expectation = "flat";
    item.strength = 0;
  }
}

function scheduleAutoRefresh() {
  clearTimeout(appState.autoTimer);
  appState.marketStatus = getMarketStatus();
  if (appState.marketStatus !== "open") {
    appState.nextRefreshAt = null;
    return;
  }
  appState.nextRefreshAt = Date.now() + appState.refreshInterval;
  appState.autoTimer = setTimeout(() => refreshQuotes({ silent: true }), appState.refreshInterval);
}

function startCountdown() {
  clearInterval(appState.countdownTimer);
  appState.countdownTimer = setInterval(() => {
    appState.marketStatus = getMarketStatus();
    updateStatusText();
  }, 1000);
}

function handleInteraction(event) {
  const button = event.target.closest("button");
  if (button) {
    const view = button.dataset.view;
    const action = button.dataset.action;
    if (view) {
      event.preventDefault();
      setView(view);
      return;
    }
    if (action === "refresh-quotes") {
      event.preventDefault();
      refreshQuotes();
      return;
    }
    if (action === "refresh-analysis") {
      event.preventDefault();
      refreshAnalysis();
      return;
    }
    if (action === "top") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (action === "toggle-section") {
      event.preventDefault();
      toggleSection(button.dataset.targetSection);
      return;
    }
    if (action === "toggle-current-group") {
      event.preventDefault();
      toggleCurrentGroup();
      return;
    }
    if (action === "open-section") {
      event.preventDefault();
      openSection(button.dataset.targetSection);
      return;
    }
    if (action === "add-holding") {
      event.preventDefault();
      addSearchItemToHolding(button.dataset.code);
      return;
    }
    if (action === "add-watch") {
      event.preventDefault();
      addSearchItemToWatchlist(button.dataset.code);
    }
  }
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
    appState.searchResults = await searchStocks(input.value);
    if (!appState.searchResults.length) appState.searchError = "没有找到匹配股票。";
  } catch (error) {
    appState.searchResults = [];
    appState.searchError = error.message || "查询失败。";
  }
  if (stateNode) stateNode.textContent = appState.searchError || `找到 ${appState.searchResults.length} 个结果。`;
  if (resultsNode) renderSearchResults(resultsNode);
}

function addSearchItemToHolding(code) {
  const item = appState.searchResults.find((row) => row.code === code) || findInUniverse(code);
  if (!item || appState.holdings.some((holding) => holding.code === code)) return;
  const quote = getMockQuote(code);
  const holding = normalizeHoldings([{
    ...item,
    price: quote.price,
    changePercent: quote.changePercent,
    support: item.support || "待设置",
    resistance: item.resistance || "待设置",
    action: "新加入，先观察",
    invalidCondition: "无关键位时不交易",
    holdingStatus: "holding"
  }])[0];
  holding.kline.intraday = createMockKline(code, "1m");
  holding.kline.daily = createMockKline(code, "day");
  appState.holdings.push(holding);
  appState.currentView = "quote";
  appState.expandedSections.add("holding-quotes");
  renderApp();
}

function addSearchItemToWatchlist(code) {
  const item = appState.searchResults.find((row) => row.code === code) || findInUniverse(code);
  if (!item || appState.watchlist.some((watch) => watch.code === code)) return;
  appState.watchlist.unshift({
    name: item.name,
    code: item.code,
    market: item.market || inferMarket(item.code),
    sector: item.sector || "待分类",
    status: "观察，不买",
    reason: "手动加入观察池。",
    buyTrigger: "放量突破关键压力位后再考虑。",
    avoidReason: "没有触发条件不买。",
    risk: "追高风险"
  });
  appState.currentView = "news";
  appState.expandedSections.add("watchlist");
  renderApp();
}

function localSearch(keyword) {
  const universe = [
    ...appState.holdings,
    ...appState.watchlist,
    ...(sourceData.searchUniverse || [])
  ];
  const normalized = keyword.toLowerCase();
  const seen = new Set();
  return normalizeSearchItems(universe)
    .filter((item) => item.code.includes(keyword) || item.name.toLowerCase().includes(normalized))
    .filter((item) => {
      if (seen.has(item.code)) return false;
      seen.add(item.code);
      return true;
    })
    .slice(0, 8)
    .map((item) => ({ ...item, ...getMockQuote(item.code) }));
}

function normalizeSearchItems(items) {
  return items
    .filter((item) => item && item.code)
    .map((item) => ({
      name: item.name || "",
      code: String(item.code),
      market: item.market || inferMarket(item.code),
      sector: item.sector || "",
      price: item.price == null ? null : Number(item.price),
      changePercent: item.changePercent == null ? null : Number(item.changePercent),
      support: item.support || "",
      resistance: item.resistance || ""
    }));
}

function findInUniverse(code) {
  return normalizeSearchItems([...appState.holdings, ...appState.watchlist, ...(sourceData.searchUniverse || [])])
    .find((item) => item.code === code);
}

function decisionTone(type) {
  if (type.includes("买")) return "buy";
  if (type.includes("禁止")) return "stop";
  if (type.includes("卖")) return "sell";
  return "hold";
}

function getStrengthColor(strength) {
  const colors = {
    "-3": "#94c8a3",
    "-2": "#b8ddb9",
    "-1": "#dff1df",
    "0": "#fffdf8",
    "1": "#ffe5df",
    "2": "#ffc9bd",
    "3": "#f2a08f"
  };
  return colors[String(clampStrength(strength))] || colors["0"];
}

function chooseGlobalQuoteMode(modes) {
  if (modes.includes("realtime")) return "realtime";
  if (modes.includes("delayed")) return "delayed";
  return "mock";
}

function getQuoteModeLabel(mode) {
  return { realtime: "实时行情", delayed: "延迟行情", mock: "模拟数据", failed: "行情获取失败" }[mode] || "模拟数据";
}

function getQuoteModeDescription() {
  if (appState.quoteMode === "realtime") return "当前通过代理接口获取实时或近实时行情，盘中自动刷新。";
  if (appState.quoteMode === "delayed") return "当前为延迟行情，适合复盘，不适合按秒交易。";
  return "当前未连接代理接口，使用本地模拟数据，不代表真实行情。";
}

function getChartStateText(mode) {
  if (mode === "realtime") return "数据状态：实时行情；盘中自动刷新。";
  if (mode === "delayed") return "数据状态：延迟行情；注意时间差。";
  if (mode === "failed") return `数据状态：行情获取失败；最后更新时间 ${getLastUpdatedText()}。`;
  return "数据状态：模拟数据；仅用于页面结构和复盘演示。";
}

function getMarketStatus() {
  const now = getChinaDateParts();
  if (now.day === 0 || now.day === 6) return "closed";
  const minutes = now.hour * 60 + now.minute;
  const open = (minutes >= 570 && minutes <= 690) || (minutes >= 780 && minutes <= 900);
  return open ? "open" : "closed";
}

function getMarketStatusLabel() {
  return appState.marketStatus === "open" ? "盘中" : "非交易时间";
}

function getNextRefreshText() {
  if (appState.marketStatus !== "open") return "非交易时间，不自动频繁刷新";
  if (!appState.nextRefreshAt) return "等待下一次刷新";
  const seconds = Math.max(0, Math.ceil((appState.nextRefreshAt - Date.now()) / 1000));
  return `下次刷新 ${seconds}s`;
}

function getLastUpdatedText() {
  return appState.lastUpdated ? `最后更新 ${appState.lastUpdated}` : sourceData.time || "--";
}

function getDateTimeText() {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date()).replace(/\//g, "-");
}

function getChinaDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: dayMap[weekday] ?? 0,
    hour: Number(parts.find((part) => part.type === "hour")?.value || 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value || 0)
  };
}

function getViewLabel(view) {
  return { action: "Action", quote: "Quote", news: "News", logic: "Logic" }[view] || "";
}

function directionText(item) {
  if (item.strength > 0) return item.strength >= 2 ? "看涨" : "轻度看涨";
  if (item.strength < 0) return item.strength <= -2 ? "看跌" : "轻度看跌";
  return "震荡";
}

function changeClass(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function inferMarket(code = "") {
  if (/^(5|6|9)/.test(String(code))) return "SH";
  if (/^(0|1|2|3)/.test(String(code))) return "SZ";
  if (/^68/.test(String(code))) return "SH";
  return "CN";
}

function parseLevel(value) {
  const match = String(value || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function clampStrength(value) {
  return Math.max(-3, Math.min(3, Number(value) || 0));
}

function timeToMinutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(value) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toTimestamp(value) {
  if (typeof value === "number") return value;
  const date = new Date();
  const [hour, minute] = String(value).split(":").map(Number);
  date.setHours(hour || 0, minute || 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

function timestampToDate(value) {
  return new Date(value * 1000).toISOString().slice(0, 10);
}

function formatTimeAxis(value) {
  if (typeof value === "string" && value.includes(":")) return value.slice(0, 5);
  const date = new Date(Number(value) * 1000);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatTimeLabel(value) {
  return formatTimeAxis(value);
}

function formatDateAxis(value) {
  const text = String(value);
  if (text.includes("-")) return text.slice(5);
  return timestampToDate(Number(value)).slice(5);
}

function renderIntradayAxisLabels() {
  return ["09:30", "10:30", "11:30", "13:00", "14:00", "15:00"].map((item) => `<span>${item}</span>`).join(" ");
}

function renderDateAxisLabels(item) {
  const rows = item.kline.daily?.length ? item.kline.daily : createMockKline(item.code, "day");
  const sample = rows.slice(-5).map((row) => formatDateAxis(row.time));
  return sample.map((date) => `<span>${date}</span>`).join(" ");
}

function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return "--";
  return Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function formatPercent(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "--";
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function formatVolume(value) {
  const number = Number(value || 0);
  if (number >= 100000000) return `${(number / 100000000).toFixed(2)}亿`;
  if (number >= 10000) return `${(number / 10000).toFixed(1)}万`;
  return String(Math.round(number));
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
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse") return;
    const button = event.target.closest("button");
    if (button) {
      button.classList.add("was-tapped");
      setTimeout(() => button.classList.remove("was-tapped"), 140);
    }
  }, { passive: true });
  window.addEventListener("resize", () => {
    updateSegmentIndicator(document.querySelector(`.segment [data-view="${appState.currentView}"]`));
    renderApp();
  });
}

async function init() {
  validateSectionMap();
  await loadMockMarketData();
  renderApp();
  initInteractions();
  scheduleAutoRefresh();
  startCountdown();
}

init();
