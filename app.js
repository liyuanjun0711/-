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
    const row = document.createElement("tr");
    const priceClass = pctClass(item.changePct || 0);
    row.innerHTML = `
      <td><strong>${item.name}</strong><br><span class="flat">${item.code}</span></td>
      <td class="price">${item.price}<br><span class="${priceClass}">${item.changeText}</span></td>
      <td><strong>${item.action}</strong></td>
      <td>${item.trigger}</td>
      <td>${item.lots}</td>
      <td>${item.fallback}</td>
    `;
    body.appendChild(row);
  });
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
  (data.explanations || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = "explain-item";
    box.innerHTML = `<h3>${item.title}</h3><p>${item.body}</p>`;
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

setText("reportDate", data.date);
setText("reportTime", data.time);
setText("oneLine", data.oneLine);
renderMetrics();
renderNews();
renderActions();
renderRisk();
renderList("watchList", data.watchList);
renderExplain();
renderList("riskNotes", data.riskNotes);
renderSources();
