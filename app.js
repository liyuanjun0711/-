const data = window.MARKET_BRIEFING_DATA || {};

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value || "--";
}

function pctClass(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function escapeText(value) {
  return String(value ?? "");
}

function renderMetrics() {
  const wrap = document.getElementById("heroMetrics");
  wrap.innerHTML = "";
  (data.metrics || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = "metric mini-card";
    box.innerHTML = `
      <span>${escapeText(item.label)}</span>
      <strong>${escapeText(item.value)}</strong>
      <small>${escapeText(item.note)}</small>
    `;
    wrap.appendChild(box);
  });
}

function renderDecisions() {
  const wrap = document.getElementById("decisionGrid");
  wrap.innerHTML = "";
  (data.decisions || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = `decision-card mini-card ${item.tone || "hold"}`;
    box.innerHTML = `
      <span class="label">${escapeText(item.type)}</span>
      <strong>${escapeText(item.title)}</strong>
      <p>${escapeText(item.action)}</p>
      <p><b>触发：</b>${escapeText(item.trigger)}</p>
      <p><b>不触发：</b>${escapeText(item.fallback)}</p>
    `;
    wrap.appendChild(box);
  });
}

function renderActions() {
  const body = document.getElementById("actionRows");
  body.innerHTML = "";
  (data.actions || []).forEach((item) => {
    const card = document.createElement("article");
    const priceClass = pctClass(item.changePct || 0);
    card.className = `action-card mini-card ${item.tone || "hold"}`;
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
}

function inferSecid(code) {
  if (!code) return "";
  return /^[56]/.test(code) ? `1.${code}` : `0.${code}`;
}

function setLiveStatus(message) {
  setText("liveQuoteStatus", message);
}

function setRefreshing(isRefreshing) {
  document.querySelectorAll("#refreshQuotes, #heroRefresh").forEach((button) => {
    button.classList.toggle("is-refreshing", isRefreshing);
    button.disabled = isRefreshing;
  });
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
    renderActions();
    revealCards();
    const now = new Date();
    setLiveStatus(`已更新 ${now.toLocaleTimeString("zh-CN", { hour12: false })}`);
  } catch {
    setLiveStatus("行情刷新失败，显示晨报报价");
  } finally {
    setRefreshing(false);
  }
}

function renderRisk() {
  const wrap = document.getElementById("riskGrid");
  wrap.innerHTML = "";
  (data.positionRisks || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = "risk-item mini-card";
    box.innerHTML = `
      <span>${escapeText(item.label)}</span>
      <strong>${escapeText(item.value)}</strong>
      <p>${escapeText(item.note)}</p>
    `;
    wrap.appendChild(box);
  });
}

function renderOutlook() {
  const wrap = document.getElementById("outlookGrid");
  wrap.innerHTML = "";
  (data.outlooks || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = `outlook-card mini-card ${item.tone || "hold"}`;
    box.innerHTML = `
      <span class="meta">${escapeText(item.bias || "观察")}</span>
      <h3>${escapeText(item.name)}</h3>
      <p><b>预期：</b>${escapeText(item.expectation)}</p>
      <p><b>关键位：</b>${escapeText(item.levels)}</p>
      <p><b>操作：</b>${escapeText(item.plan)}</p>
    `;
    wrap.appendChild(box);
  });
}

function renderScenarios() {
  const wrap = document.getElementById("scenarioGrid");
  wrap.innerHTML = "";
  (data.scenarios || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = "scenario-card mini-card";
    box.innerHTML = `
      <span class="meta">${escapeText(item.probability || "情景")}</span>
      <h3>${escapeText(item.title)}</h3>
      <p>${escapeText(item.body)}</p>
      <p><b>动作：</b>${escapeText(item.action)}</p>
    `;
    wrap.appendChild(box);
  });
}

function renderNews() {
  const wrap = document.getElementById("newsList");
  wrap.innerHTML = "";
  (data.marketRadar || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = `news-item mini-card ${item.type || "neutral"}`;
    box.innerHTML = `
      <span class="tag">${escapeText(item.impact || "观察")}</span>
      <h3>${escapeText(item.title)}</h3>
      <p>${escapeText(item.summary)}</p>
      <p><b>行动：</b>${escapeText(item.action)}</p>
      ${item.source ? `<small>${escapeText(item.source)}</small>` : ""}
    `;
    wrap.appendChild(box);
  });
}

function renderList(id, items) {
  const wrap = document.getElementById(id);
  wrap.innerHTML = "";
  (items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    wrap.appendChild(li);
  });
}

function renderExplain() {
  const wrap = document.getElementById("explainList");
  wrap.innerHTML = "";
  (data.explanations || []).forEach((item, index) => {
    const box = document.createElement("details");
    box.className = "explain-item mini-card";
    if (index < 3) box.open = true;
    box.innerHTML = `<summary>${escapeText(item.title)}</summary><p>${escapeText(item.body)}</p>`;
    wrap.appendChild(box);
  });
}

function renderRichList(id, items, className) {
  const wrap = document.getElementById(id);
  wrap.innerHTML = "";
  (items || []).forEach((item, index) => {
    const box = className === "learning-item" ? document.createElement("details") : document.createElement("article");
    box.className = `${className} mini-card`;
    if (box.tagName === "DETAILS") {
      if (index < 2) box.open = true;
      box.innerHTML = `<summary>${escapeText(item.title)}</summary><p>${escapeText(item.body)}</p>`;
    } else {
      box.innerHTML = `<h3>${escapeText(item.title)}</h3><p>${escapeText(item.body)}</p>`;
    }
    wrap.appendChild(box);
  });
}

function scrollToTarget(targetId) {
  const target = document.getElementById(targetId);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
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

function setActiveTarget(targetId) {
  document.querySelectorAll(".segment button").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === targetId);
    if (button.dataset.target === targetId) updateSegmentIndicator(button);
  });
  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === targetId);
  });
}

function setupNavigation() {
  document.querySelectorAll("[data-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      setActiveTarget(targetId);
      scrollToTarget(targetId);
    });
  });
  document.querySelectorAll("[data-scroll-top]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTarget("topSection");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  updateSegmentIndicator(document.querySelector(".segment button.active"));
  window.addEventListener("resize", () => updateSegmentIndicator(document.querySelector(".segment button.active")));
}

function setupExpandButton() {
  const button = document.getElementById("expandActions");
  if (!button) return;
  button.addEventListener("click", () => {
    const details = [...document.querySelectorAll("details")];
    const shouldOpen = details.some((node) => !node.open);
    details.forEach((node) => {
      node.open = shouldOpen;
    });
    button.textContent = shouldOpen ? "收起全部" : "展开全部";
  });
}

function setupQuoteRefresh() {
  document.querySelectorAll("#refreshQuotes, #heroRefresh").forEach((button) => {
    button.addEventListener("click", refreshQuotes);
  });
  refreshQuotes();
}

function revealCards() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".reveal-card, .mini-card").forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 60, 720)}ms`);
      node.classList.add("is-visible");
    });
  });
}

function setupScrollSpy() {
  const sections = ["topSection", "decisionSection", "outlookSection", "newsSection", "logicSection", "riskSection", "settingsSection"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    if (["decisionSection", "outlookSection", "newsSection", "logicSection"].includes(id)) {
      setActiveTarget(id);
    } else if (id === "riskSection") {
      document.querySelectorAll(".bottom-nav button").forEach((button) => {
        button.classList.toggle("active", button.dataset.target === "riskSection");
      });
    } else if (id === "topSection") {
      document.querySelectorAll(".bottom-nav button").forEach((button) => {
        button.classList.toggle("active", button.dataset.target === "topSection");
      });
    }
  }, { rootMargin: "-18% 0px -68% 0px", threshold: [0.1, 0.35, 0.6] });
  sections.forEach((section) => observer.observe(section));
}

setText("reportDate", data.date);
setText("reportTime", data.time);
setText("oneLine", data.oneLine);
renderMetrics();
renderDecisions();
renderActions();
renderOutlook();
renderRisk();
renderScenarios();
renderNews();
renderRichList("timelineList", data.timeline, "timeline-item");
renderList("watchList", data.watchList);
renderExplain();
renderList("riskNotes", data.riskNotes);
renderRichList("learningList", data.learning, "learning-item");
setupNavigation();
setupExpandButton();
setupQuoteRefresh();
setupScrollSpy();
revealCards();
