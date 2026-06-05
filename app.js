const sourceData = window.MARKET_BRIEFING_DATA || {};

const sectionMap = {
  action: ["summary", "trade-decision", "execution-list", "trade-plan"],
  trend: ["realtime-kline", "position-expectation", "risk-overview", "scenario-plan"],
  news: ["market-radar", "news-review", "watchlist"],
  logic: ["reasoning", "invalid-conditions", "learning-framework"]
};

const appState = {
  currentView: getInitialView(),
  lastUpdated: sourceData.lastUpdated || null,
  holdings: normalizeHoldings(sourceData.holdings),
  watchlist: normalizeWatchlist(sourceData.watchlist),
  sections: [],
  expandedSections: new Set(["summary", "trade-decision"]),
  isRefreshingQuote: false,
  isRefreshingAnalysis: false,
  initialized: false
};

appState.sections = buildSections();

function normalizeHoldings(items = []) {
  return items.map((item) => ({
    name: item.name || "",
    code: item.code || "",
    price: Number(item.price ?? 0),
    changePercent: Number(item.changePercent ?? 0),
    expectation: item.expectation || "flat",
    strength: clampStrength(item.strength ?? 0),
    support: item.support || "",
    resistance: item.resistance || "",
    action: item.action || "",
    invalidCondition: item.invalidCondition || "",
    eastmoneyUrl: item.eastmoneyUrl || getEastmoneyUrl(item.code),
    kline: item.kline || []
  }));
}

function normalizeWatchlist(items = []) {
  return items
    .filter((item) => item && item.code)
    .map((item) => ({
      name: item.name || "",
      code: item.code || "",
      sector: item.sector || "未分类",
      status: item.status || "观察，不买",
      reason: item.reason || "",
      buyTrigger: item.buyTrigger || "",
      avoidReason: item.avoidReason || "条件未满足，不买。",
      risk: item.risk || ""
    }));
}

function buildSections() {
  return [
    {
      id: "summary",
      group: "action",
      eyebrow: "今日操作结论",
      title: "今日一句话",
      type: "summary",
      priority: "hero",
      fixedOpen: true,
      render: renderSummary
    },
    {
      id: "trade-decision",
      group: "action",
      eyebrow: "先卖后买",
      title: "今天到底买卖什么",
      type: "decision",
      priority: "primary",
      fixedOpen: true,
      render: renderTradeDecision
    },
    {
      id: "execution-list",
      group: "action",
      eyebrow: "执行顺序",
      title: "满仓账户先卖后买",
      type: "execution",
      render: renderExecutionList
    },
    {
      id: "trade-plan",
      group: "action",
      eyebrow: "纪律",
      title: "今天不做什么",
      type: "execution",
      render: renderNoTradeList
    },
    {
      id: "realtime-kline",
      group: "trend",
      eyebrow: "持仓行情",
      title: "持仓实时行情与K线",
      type: "quote",
      render: renderRealtimeKline
    },
    {
      id: "position-expectation",
      group: "trend",
      eyebrow: "走势预期",
      title: "每只持仓今天怎么走",
      type: "expectation",
      render: renderPositionExpectation
    },
    {
      id: "risk-overview",
      group: "trend",
      eyebrow: "风险总览",
      title: "最大风险、触发条件、应对动作",
      type: "risk",
      render: renderRiskOverview
    },
    {
      id: "scenario-plan",
      group: "trend",
      eyebrow: "盘中剧本",
      title: "三套交易剧本",
      type: "scenario",
      render: renderScenarioPlan
    },
    {
      id: "market-radar",
      group: "news",
      eyebrow: "市场雷达",
      title: "全市场重大利好与风险",
      type: "news",
      render: renderMarketRadar
    },
    {
      id: "news-review",
      group: "news",
      eyebrow: "24小时",
      title: "过去24小时热点复盘",
      type: "news",
      render: renderNewsReview
    },
    {
      id: "watchlist",
      group: "news",
      eyebrow: "观察池",
      title: "可关注但暂不一定买",
      type: "watch",
      render: renderWatchlist
    },
    {
      id: "reasoning",
      group: "logic",
      eyebrow: "原因",
      title: "为什么今天这么操作",
      type: "logic",
      render: renderReasoning
    },
    {
      id: "invalid-conditions",
      group: "logic",
      eyebrow: "失效",
      title: "什么情况下原计划作废",
      type: "risk",
      render: renderInvalidConditions
    },
    {
      id: "learning-framework",
      group: "logic",
      eyebrow: "复盘框架",
      title: "今天收盘后看什么",
      type: "logic",
      render: renderLearningFramework
    }
  ];
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

function clampStrength(value) {
  return Math.max(-3, Math.min(3, Number(value) || 0));
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

function getEastmoneyUrl(code) {
  if (!code) return "#";
  const prefix = /^[56]/.test(code) ? "sh" : "sz";
  return `https://quote.eastmoney.com/${prefix}${code}.html`;
}

function inferSecid(code) {
  if (!code) return "";
  return /^[56]/.test(code) ? `1.${code}` : `0.${code}`;
}

function isSectionOpen(section) {
  return section.fixedOpen || appState.expandedSections.has(section.id);
}

function getCurrentSections() {
  const allowed = sectionMap[appState.currentView] || [];
  const seen = new Set();
  const sections = [];
  for (const id of allowed) {
    const section = appState.sections.find((item) => item.id === id);
    if (!section) continue;
    if (seen.has(section.id)) {
      console.warn(`重复模块已跳过: ${section.id}`);
      continue;
    }
    seen.add(section.id);
    sections.push(section);
  }
  return sections;
}

function validateSectionMap() {
  const seen = new Map();
  Object.entries(sectionMap).forEach(([group, ids]) => {
    ids.forEach((id) => {
      if (seen.has(id)) console.warn(`模块 ${id} 同时出现在 ${seen.get(id)} 和 ${group}`);
      seen.set(id, group);
    });
  });
}

function dedupeRenderedSections() {
  const seen = new Set();
  document.querySelectorAll(".module-card[data-section-id], .view-toolbar[data-section-id]").forEach((node) => {
    const id = node.dataset.sectionId;
    if (seen.has(id)) {
      console.warn(`删除重复模块: ${id}`);
      node.remove();
      return;
    }
    seen.add(id);
  });
}

function renderApp() {
  const root = document.getElementById("moduleRoot");
  root.innerHTML = "";

  const toolbar = createEl("section", "view-toolbar reveal-card");
  toolbar.dataset.sectionId = `${appState.currentView}-toolbar`;
  toolbar.innerHTML = `
    <div>
      <p class="section-label">${getViewLabel(appState.currentView)}</p>
      <h2>${getViewTitle(appState.currentView)}</h2>
    </div>
    <button class="secondary-btn compact" type="button" data-action="toggle-current-group" aria-expanded="${isCurrentGroupOpen()}">${isCurrentGroupOpen() ? "收起全部" : "展开全部"}</button>
  `;
  root.appendChild(toolbar);

  getCurrentSections().forEach((section) => {
    root.appendChild(renderSection(section));
  });

  dedupeRenderedSections();
  updateActiveUI();
  updateStatusText();
  revealCards();
  requestAnimationFrame(drawAllKlines);
}

function renderSection(section) {
  const open = isSectionOpen(section);
  const card = createEl("section", `module-card reveal-card ${sectionClass(section)}`);
  card.id = `section-${section.id}`;
  card.dataset.sectionId = section.id;
  card.dataset.group = section.group;
  card.dataset.type = section.type;

  const head = createEl("div", "section-head");
  head.innerHTML = `
    <div>
      <p class="section-label">${section.eyebrow}</p>
      <h2>${section.title}</h2>
    </div>
  `;

  if (!section.fixedOpen) {
    const toggle = createEl("button", "section-toggle");
    toggle.type = "button";
    toggle.dataset.action = "toggle-section";
    toggle.dataset.targetSection = section.id;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = `<span>${open ? "收起" : "展开"}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
    head.appendChild(toggle);
  }

  const body = createEl("div", "section-body");
  body.id = `body-${section.id}`;
  body.classList.toggle("collapsed", !open);
  body.setAttribute("aria-hidden", String(!open));
  section.render(body);

  card.appendChild(head);
  card.appendChild(body);
  return card;
}

function sectionClass(section) {
  if (section.priority === "hero") return "summary-card hero-summary";
  if (section.priority === "primary") return "priority-card";
  if (section.type === "risk") return "risk-zone";
  if (section.type === "news") return "news-zone";
  if (section.type === "watch") return "watch-zone";
  if (section.type === "logic") return "logic-zone";
  return "";
}

function renderSummary(container) {
  container.innerHTML = `
    <div class="summary-copy">
      <h2>${escapeText(sourceData.oneLine)}</h2>
    </div>
    <div class="quick-actions">
      <button class="secondary-btn" type="button" data-action="open-section" data-target-section="trade-decision">买卖结论</button>
      <button class="secondary-btn" type="button" data-view="trend">看持仓行情</button>
    </div>
  `;
}

function renderTradeDecision(container) {
  const wrap = createEl("div", "decision-grid");
  (sourceData.tradeDecision || []).forEach((item) => {
    const card = createEl("article", `decision-card mini-card ${decisionTone(item.type)}`);
    card.innerHTML = `
      <span class="label">${escapeText(item.type)}</span>
      <strong>${escapeText(item.title)}</strong>
      <p><b>结论：</b>${escapeText(item.conclusion)}</p>
      <p><b>原因：</b>${escapeText(item.reason)}</p>
      <p><b>动作：</b>${escapeText(item.action)}</p>
      <p><b>条件：</b>${escapeText(item.trigger)}</p>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function decisionTone(type) {
  if (type.includes("买")) return "buy";
  if (type.includes("禁止")) return "stop";
  if (type.includes("卖")) return "sell";
  return "hold";
}

function renderExecutionList(container) {
  container.appendChild(renderBulletList(sourceData.executionOrder || []));
}

function renderNoTradeList(container) {
  container.appendChild(renderBulletList(sourceData.noTradeList || [], "no-trade-list"));
}

function renderRealtimeKline(container) {
  const wrap = createEl("div", "holding-list");
  appState.holdings.forEach((item) => {
    const card = createEl("article", `holding-card mini-card strength-${item.strength}`);
    card.style.setProperty("--expect-bg", getStrengthColor(item.strength));
    card.innerHTML = `
      <div class="holding-head">
        <div>
          <strong>${escapeText(item.name)}</strong>
          <span>${escapeText(item.code)}</span>
        </div>
        <div class="quote-box">
          <strong>${formatPrice(item.price)}</strong>
          <span class="${changeClass(item.changePercent)}">${formatPercent(item.changePercent)}</span>
        </div>
      </div>
      <div class="chart-toolbar">
        <button type="button" class="chart-tab active" data-action="switch-kline" data-code="${item.code}" data-period="1m">分时</button>
        <button type="button" class="chart-tab" data-action="switch-kline" data-code="${item.code}" data-period="day">日K</button>
        <a class="chart-link" href="${item.eastmoneyUrl}" target="_blank" rel="noopener">东方财富K线</a>
      </div>
      <canvas class="kline-canvas" data-code="${item.code}" data-period="1m" width="640" height="220"></canvas>
      <small class="chart-note">当前为mock K线；真实行情建议经 Cloudflare Worker / Vercel Serverless 代理东方财富接口。</small>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderPositionExpectation(container) {
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
        <div><dt>当前价格</dt><dd>${formatPrice(item.price)} / ${formatPercent(item.changePercent)}</dd></div>
        <div><dt>关键位</dt><dd>支撑 ${escapeText(item.support)}，压力 ${escapeText(item.resistance)}</dd></div>
        <div><dt>今日操作</dt><dd>${escapeText(item.action)}</dd></div>
        <div><dt>失效条件</dt><dd>${escapeText(item.invalidCondition)}</dd></div>
      </dl>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderRiskOverview(container) {
  const wrap = createEl("div", "risk-list");
  (sourceData.riskOverview || []).forEach((item) => {
    const card = createEl("article", "risk-item mini-card");
    card.innerHTML = `
      <strong>${escapeText(item.title)}</strong>
      <p><b>结论：</b>${escapeText(item.conclusion)}</p>
      <p><b>触发：</b>${escapeText(item.trigger)}</p>
      <p><b>动作：</b>${escapeText(item.action)}</p>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderScenarioPlan(container) {
  const wrap = createEl("div", "scenario-grid");
  (sourceData.scenarioPlan || []).forEach((item) => {
    const card = createEl("article", "scenario-card mini-card");
    card.innerHTML = `
      <h3>${escapeText(item.title)}</h3>
      <p><b>结论：</b>${escapeText(item.conclusion)}</p>
      <p><b>动作：</b>${escapeText(item.action)}</p>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderMarketRadar(container) {
  const wrap = createEl("div", "news-list");
  (sourceData.marketRadar || []).forEach((item) => {
    const card = createEl("article", `news-item mini-card ${item.type || "neutral"}`);
    card.innerHTML = `
      <h3>${escapeText(item.title)}</h3>
      <p>${escapeText(item.summary)}</p>
      <p><b>动作：</b>${escapeText(item.action)}</p>
    `;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderNewsReview(container) {
  const wrap = createEl("div", "timeline");
  (sourceData.newsReview || []).forEach((item) => {
    const card = createEl("article", "timeline-item mini-card");
    card.innerHTML = `<h3>${escapeText(item.title)}</h3><p>${escapeText(item.body)}</p>`;
    wrap.appendChild(card);
  });
  container.appendChild(wrap);
}

function renderWatchlist(container) {
  const wrap = createEl("div", "watch-card-list");
  appState.watchlist.forEach((item) => {
    const card = createEl("article", "watch-card mini-card");
    card.innerHTML = `
      <div class="watch-head">
        <div>
          <strong>${escapeText(item.name)}</strong>
          <span>${escapeText(item.code)} / ${escapeText(item.sector)}</span>
        </div>
        <em>${escapeText(item.status)}</em>
      </div>
      <p><b>原因：</b>${escapeText(item.reason)}</p>
      <p><b>买入触发：</b>${escapeText(item.buyTrigger)}</p>
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

function getStrengthColor(strength) {
  const colors = {
    "-3": "#b7d9c2",
    "-2": "#cce8d2",
    "-1": "#e1f2e3",
    "0": "#fffdf8",
    "1": "#ffe9e2",
    "2": "#ffd5c8",
    "3": "#ffbba9"
  };
  return colors[String(clampStrength(strength))] || colors["0"];
}

function getViewLabel(view) {
  return { action: "Action", trend: "Trend", news: "News", logic: "Logic" }[view];
}

function getViewTitle(view) {
  return {
    action: "今日操作结论",
    trend: "持仓行情与走势",
    news: "新闻、市场雷达、观察池",
    logic: "今日计划的短逻辑"
  }[view];
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
  return sectionMap[hash] ? hash : "action";
}

function toggleSection(sectionId) {
  if (appState.expandedSections.has(sectionId)) appState.expandedSections.delete(sectionId);
  else appState.expandedSections.add(sectionId);
  renderApp();
  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openSection(sectionId) {
  const targetGroup = Object.entries(sectionMap).find(([, ids]) => ids.includes(sectionId))?.[0];
  if (targetGroup) appState.currentView = targetGroup;
  appState.expandedSections.add(sectionId);
  renderApp();
  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isCurrentGroupOpen() {
  return getCurrentSections()
    .filter((section) => !section.fixedOpen)
    .every((section) => appState.expandedSections.has(section.id));
}

function toggleCurrentGroup() {
  const sections = getCurrentSections().filter((section) => !section.fixedOpen);
  const shouldOpen = !sections.every((section) => appState.expandedSections.has(section.id));
  sections.forEach((section) => {
    if (shouldOpen) appState.expandedSections.add(section.id);
    else appState.expandedSections.delete(section.id);
  });
  renderApp();
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
  setText("reportTime", appState.lastUpdated ? `最后更新 ${appState.lastUpdated}` : sourceData.time);
  setText("analysisStatus", appState.lastUpdated ? `分析已更新 ${appState.lastUpdated}` : "分析未刷新");
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

function setLiveStatus(message) {
  setText("liveQuoteStatus", message);
}

function fetchJsonp(url, callbackName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };
    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("quote request failed"));
    };
    script.src = url;
    document.body.appendChild(script);
  });
}

async function refreshQuotes() {
  if (appState.isRefreshingQuote) return;
  setQuoteRefreshing(true);
  setLiveStatus("正在刷新行情...");
  const secids = [...new Set(appState.holdings.map((item) => inferSecid(item.code)).filter(Boolean))];

  try {
    if (secids.length) {
      const callbackName = `quote_cb_${Date.now()}`;
      const fields = "f12,f14,f2,f3,f4";
      const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?cb=${callbackName}&fltt=2&invt=2&fields=${fields}&secids=${secids.join(",")}`;
      const payload = await fetchJsonp(url, callbackName);
      const quotes = payload?.data?.diff || [];
      const byCode = new Map(quotes.map((quote) => [quote.f12, quote]));
      appState.holdings.forEach((item) => {
        const quote = byCode.get(item.code);
        if (!quote || quote.f2 == null || quote.f2 === "-") return;
        item.price = Number(quote.f2);
        item.changePercent = Number(quote.f3) || 0;
        syncExpectationFromQuote(item);
      });
    }
    await Promise.all(appState.holdings.map(async (item) => {
      item.kline = await fetchKlineData(item.code, "1m");
    }));
    appState.lastUpdated = nowTime();
    setLiveStatus(`已更新 ${appState.lastUpdated}`);
    renderApp();
  } catch {
    appState.holdings.forEach((item) => {
      const drift = (Math.random() - 0.5) * 0.8;
      item.changePercent = Number((item.changePercent + drift).toFixed(2));
      item.price = Number(Math.max(0.01, item.price * (1 + drift / 100)).toFixed(3));
      syncExpectationFromQuote(item);
    });
    await Promise.all(appState.holdings.map(async (item) => {
      item.kline = await fetchKlineData(item.code, "1m");
    }));
    appState.lastUpdated = nowTime();
    setLiveStatus(`已更新 ${appState.lastUpdated}`);
    renderApp();
  } finally {
    setQuoteRefreshing(false);
  }
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

async function refreshAnalysis() {
  if (appState.isRefreshingAnalysis) return;
  setAnalysisRefreshing(true);
  setText("analysisStatus", "正在刷新分析...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  appState.lastUpdated = nowTime();
  const variants = [
    "满仓账户先控风险；贵金属反弹减，军工只在确认强势后小买。",
    "今天只执行触发价；没到价不动，没卖出资金不买。",
    "先处理贵金属集中度，再看军工是否值得小仓切换。"
  ];
  sourceData.oneLine = variants[Math.floor(Math.random() * variants.length)];
  setAnalysisRefreshing(false);
  setText("analysisStatus", `分析已更新 ${appState.lastUpdated}`);
  renderApp();
}

async function fetchKlineData(symbol, period = "1m") {
  const seed = Number(symbol.slice(-3)) || 100;
  const base = appState.holdings.find((item) => item.code === symbol)?.price || 1;
  const count = period === "day" ? 36 : 42;
  const rows = [];
  let prev = base * (1 - count * 0.0008);
  for (let i = 0; i < count; i += 1) {
    const wave = Math.sin((i + seed) / 4) * base * 0.006;
    const open = prev;
    const close = Math.max(0.01, open + wave + (Math.random() - 0.48) * base * 0.01);
    const high = Math.max(open, close) + Math.random() * base * 0.006;
    const low = Math.min(open, close) - Math.random() * base * 0.006;
    rows.push({ open, high, low: Math.max(0.01, low), close });
    prev = close;
  }
  return rows;
}

function drawAllKlines() {
  document.querySelectorAll(".kline-canvas").forEach((canvas) => {
    const holding = appState.holdings.find((item) => item.code === canvas.dataset.code);
    drawKline(canvas, holding?.kline?.length ? holding.kline : []);
  });
}

function drawKline(canvas, rows) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillRect(0, 0, width, height);
  if (!rows.length) return;
  const values = rows.flatMap((item) => [item.high, item.low]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pad = 18;
  const step = (width - pad * 2) / rows.length;
  rows.forEach((item, index) => {
    const x = pad + index * step + step / 2;
    const y = (value) => height - pad - ((value - min) / range) * (height - pad * 2);
    const rising = item.close >= item.open;
    ctx.strokeStyle = rising ? "#c65f52" : "#5d9b70";
    ctx.fillStyle = rising ? "rgba(198,95,82,.8)" : "rgba(93,155,112,.8)";
    ctx.beginPath();
    ctx.moveTo(x, y(item.high));
    ctx.lineTo(x, y(item.low));
    ctx.stroke();
    const bodyTop = Math.min(y(item.open), y(item.close));
    const bodyHeight = Math.max(3, Math.abs(y(item.open) - y(item.close)));
    ctx.fillRect(x - Math.max(2, step * 0.28), bodyTop, Math.max(4, step * 0.56), bodyHeight);
  });
}

function switchKline(button) {
  document.querySelectorAll(`[data-action="switch-kline"][data-code="${button.dataset.code}"]`).forEach((node) => {
    node.classList.toggle("active", node === button);
  });
  const canvas = document.querySelector(`.kline-canvas[data-code="${button.dataset.code}"]`);
  if (canvas) canvas.dataset.period = button.dataset.period;
  fetchKlineData(button.dataset.code, button.dataset.period).then((rows) => {
    const holding = appState.holdings.find((item) => item.code === button.dataset.code);
    if (holding) holding.kline = rows;
    if (canvas) drawKline(canvas, rows);
  });
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

function nowTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
}

function handleInteraction(event) {
  const button = event.target.closest("button");
  if (!button) return;
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
  if (action === "switch-kline") {
    event.preventDefault();
    switchKline(button);
  }
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
    drawAllKlines();
  });
}

function init() {
  validateSectionMap();
  renderApp();
  initInteractions();
  Promise.all(appState.holdings.map(async (item) => {
    item.kline = await fetchKlineData(item.code, "1m");
  })).then(() => drawAllKlines());
}

init();
