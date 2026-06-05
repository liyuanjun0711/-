const data = window.MARKET_BRIEFING_DATA || {};

const text = (value, fallback = "--") => value ?? fallback;

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = text(value);
}

function pctClass(value) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

function renderMetrics() {
  const wrap = document.getElementById("heroMetrics");
  wrap.innerHTML = "";
  (data.metrics || []).forEach((item) => {
    const box = document.createElement("div");
    box.className = "metric";
    box.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    wrap.appendChild(box);
  });
}

function renderDecisions() {
  const wrap = document.getElementById("decisionGrid");
  if (!wrap) return;
  wrap.innerHTML = "";
  (data.decisions || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = `decision-card ${item.tone || ""}`;
    box.innerHTML = `
      <span class="label">${item.type}</span>
      <strong>${item.title}</strong>
      <p>${item.action}</p>
      <p><strong>触发：</strong>${item.trigger}</p>
      <p><strong>不触发：</strong>${item.fallback}</p>
    `;
    wrap.appendChild(box);
  });
}

function renderNews() {
  const wrap = document.getElementById("newsList");
  wrap.innerHTML = "";
  (data.marketRadar || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = `news-item ${item.type || "neutral"}`;
    box.innerHTML = `
      <span class="tag">${item.impact || "观察"}</span>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <p><strong>行动：</strong>${item.action}</p>
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
    card.className = "action-card";
    card.innerHTML = `
      <div class="action-top">
        <div>
          <strong>${item.name}</strong>
          <span>${item.code}</span>
        </div>
        <div class="action-price">
          <strong>${item.price}</strong>
          <span class="${priceClass}">${item.changeText}</span>
        </div>
      </div>
      <div class="action-chip">${item.action}</div>
      <dl>
        <div><dt>触发</dt><dd>${item.trigger}</dd></div>
        <div><dt>手数</dt><dd>${item.lots}</dd></div>
        <div><dt>不触发</dt><dd>${item.fallback}</dd></div>
        ${item.liveMeta ? `<div><dt>实时</dt><dd>${item.liveMeta}</dd></div>` : ""}
      </dl>
    `;
    body.appendChild(card);
  });
}

function inferSecid(code) {
  return code && /^[56]/.test(code) ? `1.${code}` : `0.${code}`;
}

function setLiveStatus(message) {
  const node = document.getElementById("liveQuoteStatus");
  if (node) node.textContent = message;
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
      item.liveMeta = `开${quote.f17} 高${quote.f15} 低${quote.f16} 昨${quote.f18}`;
    });
    renderActions();
    const now = new Date();
    setLiveStatus(`实时行情 ${now.toLocaleTimeString("zh-CN", { hour12: false })}`);
  } catch {
    setLiveStatus("行情刷新失败，显示晨报价格");
  }
}

function renderRisk() {
  const wrap = document.getElementById("riskGrid");
  wrap.innerHTML = "";
  (data.positionRisks || []).forEach((item) => {
    const box = document.createElement("div");
    box.className = "risk-item";
    box.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong><p>${item.note || ""}</p>`;
    wrap.appendChild(box);
  });
}

function renderOutlook() {
  const wrap = document.getElementById("outlookGrid");
  if (!wrap) return;
  wrap.innerHTML = "";
  (data.outlooks || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = "outlook-card";
    box.innerHTML = `
      <span class="meta">${item.bias || "观察"}</span>
      <h3>${item.name}</h3>
      <p><strong>预期：</strong>${item.expectation}</p>
      <p><strong>关键位：</strong>${item.levels}</p>
      <p><strong>操作：</strong>${item.plan}</p>
    `;
    wrap.appendChild(box);
  });
}

function renderScenarios() {
  const wrap = document.getElementById("scenarioGrid");
  if (!wrap) return;
  wrap.innerHTML = "";
  (data.scenarios || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = "scenario-card";
    box.innerHTML = `
      <span class="meta">${item.probability || "情景"}</span>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
      <p><strong>动作：</strong>${item.action}</p>
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
    box.className = "explain-item";
    if (index < 3) box.open = true;
    box.innerHTML = `<summary>${item.title}</summary><p>${item.body}</p>`;
    wrap.appendChild(box);
  });
}

function renderRichList(id, items, className) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  wrap.innerHTML = "";
  (items || []).forEach((item, index) => {
    const box = className === "learning-item" ? document.createElement("details") : document.createElement("article");
    box.className = className;
    if (box.tagName === "DETAILS") {
      if (index < 2) box.open = true;
      box.innerHTML = `<summary>${item.title}</summary><p>${item.body}</p>`;
    } else {
      box.innerHTML = `<h3>${item.title}</h3><p>${item.body}</p>`;
    }
    wrap.appendChild(box);
  });
}

function renderSources() {
  const wrap = document.getElementById("sources");
  wrap.innerHTML = "";
  (data.sources || []).forEach((item) => {
    const div = document.createElement("div");
    if (item.href) {
      div.innerHTML = `<a href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a><span> - ${item.note || ""}</span>`;
    } else {
      div.textContent = `${item.label} - ${item.note || ""}`;
    }
    wrap.appendChild(div);
  });
}

function setupSegments() {
  document.querySelectorAll(".segment button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segment button").forEach((node) => node.classList.remove("active"));
      button.classList.add("active");
      const target = document.getElementById(button.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function setupQuoteRefresh() {
  const button = document.getElementById("refreshQuotes");
  if (button) button.addEventListener("click", refreshQuotes);
  refreshQuotes();
}

setText("reportDate", data.date);
setText("reportTime", data.time);
setText("oneLine", data.oneLine);
renderMetrics();
renderDecisions();
renderActions();
renderOutlook();
renderRisk();
renderList("watchList", data.watchList);
renderScenarios();
renderNews();
renderRichList("timelineList", data.timeline, "timeline-item");
renderExplain();
renderList("riskNotes", data.riskNotes);
renderRichList("learningList", data.learning, "learning-item");
setupSegments();
setupQuoteRefresh();
