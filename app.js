const data = window.MARKET_BRIEFING_DATA || {};

const VIEWS = ["action", "trend", "news", "logic"];
const state = {
  currentView: "action",
  expandedSections: new Set(["summary", "decisions"]),
  isRefreshing: false,
  initialized: false
};

const moduleConfig = [
  {
    id: "summary",
    group: "action",
    eyebrow: "今日一句话",
    title: "今日一句话",
    priority: "hero",
    type: "summary",
    fixedOpen: true,
    render: renderSummary
  },
  {
    id: "decisions",
    group: "action",
    eyebrow: "最高优先级",
    title: "今天到底买卖什么",
    priority: "primary",
    type: "decision",
    fixedOpen: true,
    render: renderDecisions
  },
  {
    id: "metrics",
    group: "action",
    eyebrow: "组合快照",
    title: "执行前先看账户约束",
    priority: "secondary",
    type: "metrics",
    render: renderMetrics
  },
  {
    id: "actions",
    group: "action",
    eyebrow: "执行清单",
    title: "逐笔操作计划",
    priority: "secondary",
    type: "actions",
    render: renderActions
  },
  {
    id: "outlooks",
    group: "trend",
    eyebrow: "持仓判断",
    title: "持仓今日走势预期",
    priority: "secondary",
    type: "outlook",
    render: renderOutlook
  },
  {
    id: "risks",
    group: "trend",
    eyebrow: "风险总览",
    title: "组合今天最怕什么",
    priority: "secondary",
    type: "risk",
    render: renderRisk
  },
  {
    id: "scenarios",
    group: "trend",
    eyebrow: "盘中应对",
    title: "三套交易剧本",
    priority: "secondary",
    type: "scenario",
    render: renderScenarios
  },
  {
    id: "marketRadar",
    group: "news",
    eyebrow: "市场雷达",
    title: "全市场重大利好与风险",
    priority: "secondary",
    type: "news",
    render: renderNews
  },
  {
    id: "timeline",
    group: "news",
    eyebrow: "24h",
    title: "过去24小时热点复盘",
    priority: "secondary",
    type: "timeline",
    render: renderTimeline
  },
  {
    id: "watchList",
    group: "news",
    eyebrow: "观察池",
    title: "可关注但暂不一定买",
    priority: "secondary",
    type: "watch",
    render: renderWatchList
  },
  {
    id: "explanations",
    group: "logic",
    eyebrow: "为什么",
    title: "逐项说明",
    priority: "secondary",
    type: "logic",
    render: renderExplain
  },
  {
    id: "riskNotes",
    group: "logic",
    eyebrow: "失效条件",
    title: "哪些情况会推翻计划",
    priority: "secondary",
    type: "risk",
    render: renderRiskNotes
  },
  {
    id: "learning",
    group: "logic",
    eyebrow: "理解框架",
    title: "需要理解的市场逻辑",
    priority: "secondary",
    type: "logic",
    render: renderLearning
  }
];

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value || "--";
}

function escapeText(value) {
  return String(value ?? "");
}

function pctClass(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function createEl(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function isExpanded(section) {
  return section.fixedOpen || state.expandedSections.has(section.id);
}

function dedupeSections() {
  const seen = new Set();
  document.querySelectorAll("[data-section]").forEach((node) => {
    const id = node.dataset.section;
    if (seen.has(id)) {
      console.warn(`removed duplicate section: ${id}`);
      node.remove();
      return;
    }
    seen.add(id);
  });
  const navs = document.querySelectorAll(".bottom-nav");
  navs.forEach((node, index) => {
    if (index > 0) {
      console.warn("removed duplicate bottom nav");
      node.remove();
    }
  });
}

function getUniqueModules() {
  const seen = new Set();
  return moduleConfig.filter((item) => {
    if (seen.has(item.id)) {
      console.warn(`skipped duplicate module config: ${item.id}`);
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function renderApp() {
  const root = document.getElementById("moduleRoot");
  root.innerHTML = "";
  const currentModules = getUniqueModules().filter((item) => item.group === state.currentView);

  const toolbar = createEl("section", "view-toolbar reveal-card");
  toolbar.dataset.section = `${state.currentView}-toolbar`;
  toolbar.innerHTML = `
    <div>
      <p class="section-label">${getViewLabel(state.currentView)}</p>
      <h2>${getViewTitle(state.currentView)}</h2>
    </div>
    <button class="secondary-btn compact" type="button" data-action="toggle-current-group" aria-expanded="${isCurrentGroupFullyExpanded()}">${getExpandAllText()}</button>
  `;
  root.appendChild(toolbar);

  currentModules.forEach((section) => {
    root.appendChild(renderSection(section));
  });

  dedupeSections();
  updateActiveUI();
  revealCards();
}

function renderSection(section) {
  const open = isExpanded(section);
  const card = createEl("section", `module-card reveal-card ${sectionClass(section)}`);
  card.id = `section-${section.id}`;
  card.dataset.section = section.id;
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
    toggle.dataset.sectionId = section.id;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = `<span>${open ? "收起" : "展开"}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
    head.appendChild(toggle);
  }

  const body = createEl("div", "section-body");
  body.id = `body-${section.id}`;
  body.setAttribute("aria-hidden", String(!open));
  body.classList.toggle("collapsed", !open);
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
      <h2 id="oneLine">${escapeText(data.oneLine || "等待数据更新")}</h2>
    </div>
    <button class="secondary-btn" type="button" data-action="open-section" data-section-id="actions">查看执行清单</button>
  `;
}

function renderMetrics(container) {
  const wrap = createEl("div", "hero-metrics");
  (data.metrics || []).forEach((item) => {
    const box = createEl("article", "metric mini-card");
    box.innerHTML = `
      <span>${escapeText(item.label)}</span>
      <strong>${escapeText(item.value)}</strong>
      <small>${escapeText(item.note)}</small>
    `;
    wrap.appendChild(box);
  });
  container.appendChild(wrap);
}

function renderDecisions(container) {
  const wrap = createEl("div", "decision-grid");
  (data.decisions || []).forEach((item) => {
    const box = createEl("article", `decision-card mini-card ${item.tone || "hold"}`);
    box.innerHTML = `
      <span class="label">${escapeText(item.type)}</span>
      <strong>${escapeText(item.title)}</strong>
      <p>${escapeText(item.action)}</p>
      <p><b>触发：</b>${escapeText(item.trigger)}</p>
      <p><b>不触发：</b>${escapeText(item.fallback)}</p>
    `;
    wrap.appendChild(box);
  });
  container.appendChild(wrap);
}

function renderActions(container) {
  container.innerHTML = "";
  const body = createEl("div", "action-list");
  (data.actions || []).forEach((item) => {
    const card = createEl("article", `action-card mini-card ${item.tone || "hold"}`);
    const priceClass = pctClass(item.changePct || 0);
    card.innerHTML = `
      <div class="action-top">
        <div>
          <strong>${escapeText(item.name)}</strong>
          <span>${escapeText(item.code)}</span>
        </div>
        <div class="action-price">
          <strong>${escapeText(item.price)}</strong>
          <span class="${priceClass}">${escapeText(item.changeText)}</span>
        </div>
      </div>
      <div class="action-chip">${escapeText(item.action)}</div>
      <dl>
        <div><dt>触发</dt><dd>${escapeText(item.trigger)}</dd></div>
        <div><dt>手数</dt><dd>${escapeText(item.lots)}</dd></div>
        <div><dt>没到价</dt><dd>${escapeText(item.fallback)}</dd></div>
        <div><dt>把握度</dt><dd>${escapeText(item.confidence || "中")}</dd></div>
        ${item.liveMeta ? `<div><dt>实时</dt><dd>${escapeText(item.liveMeta)}</dd></div>` : ""}
      </dl>
    `;
    body.appendChild(card);
  });
  container.appendChild(body);
}

function renderOutlook(container) {
  const wrap = createEl("div", "outlook-grid");
  (data.outlooks || []).forEach((item) => {
    const box = createEl("article", `outlook-card mini-card ${item.tone || "hold"}`);
    box.innerHTML = `
      <span class="meta">${escapeText(item.bias || "观察")}</span>
      <h3>${escapeText(item.name)}</h3>
      <p><b>预期：</b>${escapeText(item.expectation)}</p>
      <p><b>关键位：</b>${escapeText(item.levels)}</p>
      <p><b>操作：</b>${escapeText(item.plan)}</p>
    `;
    wrap.appendChild(box);
  });
  container.appendChild(wrap);
}

function renderRisk(container) {
  const wrap = createEl("div", "risk-grid");
  (data.positionRisks || []).forEach((item) => {
    const box = createEl("article", "risk-item mini-card");
    box.innerHTML = `
      <span>${escapeText(item.label)}</span>
      <strong>${escapeText(item.value)}</strong>
      <p>${escapeText(item.note)}</p>
    `;
    wrap.appendChild(box);
  });
  container.appendChild(wrap);
}

function renderScenarios(container) {
  const wrap = createEl("div", "scenario-grid");
  (data.scenarios || []).forEach((item) => {
    const box = createEl("article", "scenario-card mini-card");
    box.innerHTML = `
      <span class="meta">${escapeText(item.probability || "情景")}</span>
      <h3>${escapeText(item.title)}</h3>
      <p>${escapeText(item.body)}</p>
      <p><b>动作：</b>${escapeText(item.action)}</p>
    `;
    wrap.appendChild(box);
  });
  container.appendChild(wrap);
}

function renderNews(container) {
  const wrap = createEl("div", "news-list");
  (data.marketRadar || []).forEach((item) => {
    const box = createEl("article", `news-item mini-card ${item.type || "neutral"}`);
    box.innerHTML = `
      <span class="tag">${escapeText(item.impact || "观察")}</span>
      <h3>${escapeText(item.title)}</h3>
      <p>${escapeText(item.summary)}</p>
      <p><b>行动：</b>${escapeText(item.action)}</p>
      ${item.source ? `<small>${escapeText(item.source)}</small>` : ""}
    `;
    wrap.appendChild(box);
  });
  container.appendChild(wrap);
}

function renderTimeline(container) {
  const wrap = createEl("div", "timeline");
  (data.timeline || []).forEach((item) => {
    const box = createEl("article", "timeline-item mini-card");
    box.innerHTML = `<h3>${escapeText(item.title)}</h3><p>${escapeText(item.body)}</p>`;
    wrap.appendChild(box);
  });
  container.appendChild(wrap);
}

function renderWatchList(container) {
  const list = createEl("ul", "watch-list");
  (data.watchList || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  container.appendChild(list);
}

function renderExplain(container) {
  const wrap = createEl("div", "explain-list");
  (data.explanations || []).forEach((item) => {
    wrap.appendChild(renderTextCard(item));
  });
  container.appendChild(wrap);
}

function renderRiskNotes(container) {
  const list = createEl("ul", "risk-notes");
  (data.riskNotes || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  container.appendChild(list);
}

function renderLearning(container) {
  const wrap = createEl("div", "learning-list");
  (data.learning || []).forEach((item) => {
    wrap.appendChild(renderTextCard(item));
  });
  container.appendChild(wrap);
}

function renderTextCard(item) {
  const box = createEl("article", "learning-item mini-card");
  box.innerHTML = `<h3>${escapeText(item.title)}</h3><p>${escapeText(item.body)}</p>`;
  return box;
}

function getViewLabel(view) {
  return {
    action: "Action",
    trend: "Trend",
    news: "News",
    logic: "Logic"
  }[view];
}

function getViewTitle(view) {
  return {
    action: "今日先执行什么",
    trend: "走势与风险判断",
    news: "新闻与观察池",
    logic: "推理、失效条件与学习"
  }[view];
}

function getExpandAllText() {
  return isCurrentGroupFullyExpanded() ? "收起全部" : "展开全部";
}

function isCurrentGroupFullyExpanded() {
  return getUniqueModules()
    .filter((item) => item.group === state.currentView && !item.fixedOpen)
    .every((item) => state.expandedSections.has(item.id));
}

function setView(view) {
  if (!VIEWS.includes(view) || state.currentView === view) {
    updateActiveUI();
    return;
  }
  state.currentView = view;
  renderApp();
  const root = document.getElementById("moduleRoot");
  if (root) root.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleSection(sectionId) {
  const section = moduleConfig.find((item) => item.id === sectionId);
  if (!section || section.fixedOpen) return;
  if (state.expandedSections.has(sectionId)) {
    state.expandedSections.delete(sectionId);
  } else {
    state.expandedSections.add(sectionId);
  }
  renderApp();
  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openSection(sectionId) {
  const section = moduleConfig.find((item) => item.id === sectionId);
  if (!section) return;
  state.currentView = section.group;
  state.expandedSections.add(sectionId);
  renderApp();
  document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleCurrentGroup() {
  const items = getUniqueModules().filter((item) => item.group === state.currentView && !item.fixedOpen);
  const shouldExpand = !items.every((item) => state.expandedSections.has(item.id));
  items.forEach((item) => {
    if (shouldExpand) state.expandedSections.add(item.id);
    else state.expandedSections.delete(item.id);
  });
  renderApp();
}

function updateActiveUI() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.currentView);
  });
  updateSegmentIndicator(document.querySelector(`.segment [data-view="${state.currentView}"]`));
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

function setRefreshing(isRefreshing) {
  state.isRefreshing = isRefreshing;
  document.querySelectorAll('[data-action="refresh"]').forEach((button) => {
    button.classList.toggle("is-refreshing", isRefreshing);
    button.disabled = isRefreshing;
  });
}

function setLiveStatus(message) {
  setText("liveQuoteStatus", message);
}

function inferSecid(code) {
  if (!code) return "";
  return /^[56]/.test(code) ? `1.${code}` : `0.${code}`;
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
  if (state.isRefreshing) return;
  const actions = data.actions || [];
  const secids = [...new Set(actions.map((item) => inferSecid(item.code)).filter(Boolean))];
  if (!secids.length) return;

  setRefreshing(true);
  setLiveStatus("正在刷新行情...");
  const callbackName = `quote_cb_${Date.now()}`;
  const fields = "f12,f14,f2,f3,f4,f15,f16,f17,f18";
  const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?cb=${callbackName}&fltt=2&invt=2&fields=${fields}&secids=${secids.join(",")}`;

  try {
    const payload = await fetchJsonp(url, callbackName);
    const quotes = payload?.data?.diff || [];
    const byCode = new Map(quotes.map((quote) => [quote.f12, quote]));
    actions.forEach((item) => {
      const quote = byCode.get(item.code);
      if (!quote || quote.f2 == null || quote.f2 === "-") return;
      item.price = String(quote.f2);
      item.changePct = Number(quote.f3) || 0;
      item.changeText = `${item.changePct > 0 ? "+" : ""}${item.changePct.toFixed(2)}%`;
      item.liveMeta = `开 ${quote.f17} / 高 ${quote.f15} / 低 ${quote.f16} / 昨 ${quote.f18}`;
    });
    if (state.currentView === "action") {
      const actionBody = document.querySelector('#section-actions .section-body');
      if (actionBody) renderActions(actionBody);
    }
    const now = new Date();
    setLiveStatus(`已更新 ${now.toLocaleTimeString("zh-CN", { hour12: false })}`);
    revealCards();
  } catch {
    setLiveStatus("行情刷新失败，显示晨报报价");
  } finally {
    setRefreshing(false);
  }
}

function handleInteraction(event) {
  const pointer = event.target.closest("button");
  if (!pointer) return;
  const view = pointer.dataset.view;
  const action = pointer.dataset.action;
  if (view) {
    event.preventDefault();
    setView(view);
    return;
  }
  if (action === "refresh") {
    event.preventDefault();
    refreshQuotes();
    return;
  }
  if (action === "top") {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (action === "toggle-section") {
    event.preventDefault();
    toggleSection(pointer.dataset.sectionId);
    return;
  }
  if (action === "open-section") {
    event.preventDefault();
    openSection(pointer.dataset.sectionId);
    return;
  }
  if (action === "toggle-current-group") {
    event.preventDefault();
    toggleCurrentGroup();
  }
}

function revealCards() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".reveal-card, .mini-card").forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 50, 600)}ms`);
      node.classList.add("is-visible");
    });
  });
}

function initInteractions() {
  if (state.initialized) return;
  state.initialized = true;
  document.addEventListener("click", handleInteraction);
  document.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse") return;
    const button = event.target.closest("button");
    if (button) button.classList.add("was-tapped");
    setTimeout(() => button?.classList.remove("was-tapped"), 140);
  }, { passive: true });
  window.addEventListener("resize", () => updateSegmentIndicator(document.querySelector(`.segment [data-view="${state.currentView}"]`)));
}

function init() {
  setText("reportDate", data.date);
  setText("reportTime", data.time);
  renderApp();
  initInteractions();
  refreshQuotes();
}

init();
