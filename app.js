(() => {
  "use strict";

  const sourceData = window.MARKET_BRIEFING_DATA || {};
  const chartLib = window.LightweightCharts;
  const apiBase = String(sourceData.apiBase || "").replace(/\/$/, "");

  const CACHE_KEYS = {
    snapshot: "portfolio-dashboard:snapshot:v3",
    news: "portfolio-dashboard:news:v3",
    details: "portfolio-dashboard:details:v3",
    customWatchlist: "portfolio-dashboard:custom-watchlist:v3",
    customHoldings: "portfolio-dashboard:custom-holdings:v3",
    removedSymbols: "portfolio-dashboard:removed-symbols:v3"
  };

  const state = {
    view: initialView(),
    holdings: normalizeAssets(sourceData.holdings || [], "holding"),
    watchlist: normalizeAssets(sourceData.watchlist || [], "watch"),
    marketStatus: localMarketStatus(),
    snapshotOrigin: "seed",
    snapshotError: "",
    lastSuccessAt: "",
    lastAttemptAt: "",
    refreshingSnapshot: false,
    refreshingNews: false,
    refreshingAll: false,
    news: normalizeNews(sourceData.newsItems || [], "seed"),
    newsOrigin: "seed",
    newsSavedAt: "",
    newsError: "",
    newsFilter: "all",
    selectedSymbol: "",
    detailPeriod: "intraday",
    detailLoading: false,
    detailError: "",
    detailRequestId: 0,
    searchKeyword: "",
    searchResults: [],
    searchError: "",
    searching: false,
    toastTimer: null,
    removedSymbols: new Set()
  };

  let quoteTimer = null;
  let detailChart = null;
  let detailResizeHandler = null;

  hydratePortfolioOverrides();
  hydrateSnapshot();
  hydrateNews();
  hydrateDetailCache();
  bindEvents();
  render();

  Promise.resolve().then(async () => {
    await refreshSnapshot({ initial: true });
    refreshNews({ initial: true });
  });

  function bindEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.selectedSymbol) closeDetail();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoRefresh();
        return;
      }
      startAutoRefresh();
      if (Date.now() - parseTime(state.lastAttemptAt) > 2 * 60 * 1000) refreshSnapshot({ background: true });
    });
    window.addEventListener("hashchange", () => {
      state.view = initialView();
      render();
    });
  }

  function handleClick(event) {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      event.preventDefault();
      setView(viewButton.dataset.view);
      return;
    }

    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "refresh-all") {
      refreshAll();
      return;
    }
    if (action === "refresh-snapshot") {
      refreshSnapshot({ manual: true });
      return;
    }
    if (action === "open-detail") {
      openDetail(target.dataset.symbol);
      return;
    }
    if (action === "close-detail") {
      closeDetail();
      return;
    }
    if (action === "detail-period") {
      state.detailPeriod = target.dataset.period || "intraday";
      renderDetail();
      return;
    }
    if (action === "refresh-one") {
      const asset = findAsset(target.dataset.symbol);
      if (asset) loadDetail(asset, true);
      return;
    }
    if (action === "news-filter") {
      state.newsFilter = target.dataset.filter || "all";
      render();
      return;
    }
    if (action === "add-holding") {
      addToHoldings(target.dataset.symbol);
      return;
    }
    if (action === "add-watch") {
      addToWatchlist(target.dataset.symbol);
      return;
    }
    if (action === "remove-holding") {
      removeFromHoldings(target.dataset.symbol);
      return;
    }
    if (action === "remove-watch") {
      removeFromWatchlist(target.dataset.symbol);
      return;
    }
    if (action === "dismiss-error") {
      state.snapshotError = "";
      state.newsError = "";
      render();
    }
  }

  function handleSubmit(event) {
    const form = event.target.closest("[data-role='asset-search']");
    if (!form) return;
    event.preventDefault();
    const keyword = new FormData(form).get("keyword")?.toString().trim() || "";
    searchAssets(keyword);
  }

  function setView(view) {
    if (!["overview", "market", "news", "notes"].includes(view)) return;
    state.view = view;
    history.replaceState(null, "", `#${view}`);
    render();
    document.querySelector(".tabbar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function render() {
    renderStatusBar();
    renderTabs();
    const root = document.getElementById("appRoot");
    if (!root) return;

    const errorNotice = renderErrorNotice();
    const viewHtml = state.view === "market"
      ? renderMarketView()
      : state.view === "news"
        ? renderNewsView()
        : state.view === "notes"
          ? renderNotesView()
          : renderOverviewView();

    root.innerHTML = `<div class="view-stack">${errorNotice}${viewHtml}</div>`;
    renderDetail();
  }

  function renderStatusBar() {
    const refreshButton = document.getElementById("refreshAll");
    const statusDot = document.getElementById("statusDot");
    const dataStatus = document.getElementById("dataStatus");
    const dataTimestamp = document.getElementById("dataTimestamp");
    const marketStatus = document.getElementById("marketStatus");
    const baselineStatus = document.getElementById("baselineStatus");

    if (refreshButton) {
      refreshButton.disabled = state.refreshingAll;
      refreshButton.classList.toggle("is-loading", state.refreshingAll);
      const label = refreshButton.querySelector(".refresh-label");
      if (label) label.textContent = state.refreshingAll ? "正在刷新" : "刷新数据";
    }

    const assets = allQuoteAssets();
    const available = assets.filter((asset) => hasQuote(asset));
    const failed = assets.filter((asset) => !hasQuote(asset));
    const isLoading = state.refreshingSnapshot || state.refreshingAll;

    if (statusDot) statusDot.className = "status-dot";
    if (isLoading) {
      statusDot?.classList.add("loading");
      setText(dataStatus, available.length ? "正在后台校验最新行情" : "正在获取真实行情");
      setText(dataTimestamp, available.length ? `当前先显示${state.snapshotOrigin === "cache" ? "缓存" : "已验证"}数据` : "完成后自动更新页面");
    } else if (available.length && !failed.length && state.snapshotOrigin === "live") {
      statusDot?.classList.add("live");
      setText(dataStatus, "行情数据已校验");
      setText(dataTimestamp, `最近成功更新：${formatDateTime(state.lastSuccessAt)}`);
    } else if (available.length) {
      statusDot?.classList.add("cache");
      setText(dataStatus, failed.length ? `部分行情可用，${failed.length}只待更新` : "正在显示最近一次缓存");
      setText(dataTimestamp, state.lastSuccessAt ? `缓存时间：${formatDateTime(state.lastSuccessAt)}` : "数据来源和时间已在每只标的下方标注");
    } else {
      statusDot?.classList.add(state.snapshotError ? "error" : "cache");
      setText(dataStatus, state.snapshotError ? "真实行情暂不可用" : "尚未取得可验证行情");
      setText(dataTimestamp, "不会把策略基准价格伪装成实时行情");
    }

    setText(marketStatus, marketStatusLabel(state.marketStatus.status));
    const baseline = sourceData.lastUpdated || sourceData.time || sourceData.date || "未设置";
    setText(baselineStatus, `策略基线：${baseline}`);
  }

  function renderTabs() {
    document.querySelectorAll(".tabbar [data-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === state.view);
    });
  }

  function renderErrorNotice() {
    const message = state.snapshotError || state.newsError;
    if (!message) return "";
    return `
      <section class="notice">
        <div>
          <strong>部分数据没有更新成功</strong>
          <p>${escapeHtml(message)}。页面保留最后一次成功数据，并标明来源与时间。</p>
        </div>
        <button type="button" data-action="dismiss-error">关闭</button>
      </section>
    `;
  }

  function renderOverviewView() {
    const holdings = state.holdings;
    const riskItems = rankedRiskItems(holdings);
    const focus = buildFocus(holdings, riskItems);
    const available = holdings.filter(hasQuote).length;
    const dataQuality = holdings.length ? Math.round((available / holdings.length) * 100) : 0;
    const latest = latestQuoteTime(holdings);

    return `
      <section class="focus-card">
        <div class="focus-top">
          <span class="focus-label">当前重点</span>
          <span class="mode-tag">${escapeHtml(marketStatusLabel(state.marketStatus.status))}</span>
        </div>
        <h2>${escapeHtml(focus.title)}</h2>
        <p>${escapeHtml(focus.description)}</p>
        <div class="focus-meta">
          <span>${available}/${holdings.length} 只持仓有可用行情</span>
          <span>${riskItems.length} 条风险提醒</span>
          <span>${latest ? `行情时间 ${formatCompactTime(latest)}` : "尚无真实更新时间"}</span>
        </div>
      </section>

      <section class="metric-grid" aria-label="组合摘要">
        <article class="metric-card">
          <span>数据完整度</span>
          <strong>${dataQuality}%</strong>
          <small>${state.snapshotOrigin === "live" ? "本次已向真实数据源校验" : "缓存或待更新"}</small>
        </article>
        <article class="metric-card">
          <span>持仓数量</span>
          <strong>${holdings.length}</strong>
          <small>点击任一标的查看分时与日K</small>
        </article>
        <article class="metric-card">
          <span>重点提醒</span>
          <strong>${riskItems.length}</strong>
          <small>由波动、支撑压力和数据异常生成</small>
        </article>
      </section>

      <section class="overview-grid">
        <div class="main-column">
          <section class="card">
            ${cardHeader("持仓快照", "先看价格、涨跌和数据时间；详细图表按需加载。", `<button class="text-button" type="button" data-view="market">查看全部</button>`)}
            ${renderAssetList(holdings)}
          </section>
        </div>
        <aside class="side-column">
          <section class="card">
            ${cardHeader("风险提醒", "只展示需要注意的异常和关键位。")}
            ${renderRiskList(riskItems.slice(0, 5))}
          </section>
          <section class="card">
            ${cardHeader("交易纪律", "策略基线，不随页面刷新自动改变。")}
            ${renderDisciplineList((sourceData.invalidConditions || sourceData.noTradeList || []).slice(0, 5))}
          </section>
        </aside>
      </section>
    `;
  }

  function renderMarketView() {
    return `
      <section class="toolbar">
        <div class="toolbar-copy">
          <h2>行情与标的管理</h2>
          <p>首屏只拉取批量价格；分时和K线在打开标的后再请求。</p>
        </div>
        <button class="secondary-button" type="button" data-action="refresh-snapshot" ${state.refreshingSnapshot ? "disabled" : ""}>
          ${state.refreshingSnapshot ? "正在更新" : "仅刷新行情"}
        </button>
      </section>

      <section class="card">
        ${cardHeader("当前持仓", "每条行情均显示数据模式、来源和更新时间。")}
        ${renderAssetList(state.holdings)}
      </section>

      <section class="card">
        ${cardHeader("观察池", "观察池不等于买入清单；仅在条件满足后复盘。")}
        ${renderAssetList(state.watchlist, { emptyTitle: "观察池为空", emptyText: "通过下方搜索添加需要跟踪的标的。" })}
      </section>

      <section class="card">
        ${cardHeader("添加观察标的", "支持股票、ETF、LOF和基金代码或名称。")}
        <form class="search-form" data-role="asset-search">
          <input name="keyword" value="${escapeAttr(state.searchKeyword)}" placeholder="例如 002090、金智科技" autocomplete="off" aria-label="搜索标的">
          <button type="submit" ${state.searching ? "disabled" : ""}>${state.searching ? "搜索中" : "搜索"}</button>
        </form>
        ${renderSearchResults()}
      </section>
    `;
  }

  function renderNewsView() {
    const visibleNews = filteredNews();
    const liveLabel = state.newsOrigin === "live"
      ? `新闻已更新：${formatDateTime(state.newsSavedAt)}`
      : state.newsOrigin === "cache"
        ? `当前显示新闻缓存：${formatDateTime(state.newsSavedAt)}`
        : "当前仅显示策略基线资料，不视为最新消息";

    return `
      <section class="toolbar">
        <div class="toolbar-copy">
          <h2>市场消息</h2>
          <p>${escapeHtml(liveLabel)}</p>
        </div>
        <div class="filter-group" aria-label="新闻筛选">
          ${newsFilterButton("all", "全部")}
          ${newsFilterButton("holding", "持仓相关")}
          ${newsFilterButton("market", "市场")}
        </div>
      </section>
      ${visibleNews.length ? `<section class="news-grid">${visibleNews.map(renderNewsCard).join("")}</section>` : renderEmpty("暂无可确认的相关消息", "新闻接口失败或没有匹配内容时，页面不会自动编造新闻。")}
    `;
  }

  function renderNotesView() {
    const reasoning = sourceData.reasoning || sourceData.tradePlan || [];
    const baseline = sourceData.lastUpdated || sourceData.time || sourceData.date || "未设置";
    return `
      <section class="toolbar">
        <div class="toolbar-copy">
          <h2>策略基线与复盘</h2>
          <p>此处内容是人工策略记录，和实时行情严格分开。</p>
        </div>
      </section>

      <section class="note-grid">
        <article class="note-card">
          <h3>数据边界</h3>
          <p>行情刷新只更新价格、涨跌、成交信息与图表，不会擅自改写交易计划。</p>
          <dl>
            <div><dt>策略时间</dt><dd>${escapeHtml(baseline)}</dd></div>
            <div><dt>行情来源</dt><dd>东方财富优先，新浪与腾讯作为后备；失败时使用浏览器最近一次成功缓存。</dd></div>
            <div><dt>展示规则</dt><dd>历史基准、缓存、收盘数据和实时数据分别标注，不混为一谈。</dd></div>
          </dl>
        </article>
        <article class="note-card">
          <h3>当前一句话</h3>
          <p>${escapeHtml(sourceData.oneLine || "没有真实行情和明确触发条件时，不临场增加风险。")}</p>
        </article>
      </section>

      <section class="note-grid">
        ${reasoning.slice(0, 8).map(renderReasoningCard).join("") || renderEmpty("暂无复盘记录", "可在 report-data.js 中维护策略依据。")}
      </section>

      <section class="card">
        ${cardHeader("失效条件与禁止事项", "条件失效时先取消计划，而不是临场修改解释。")}
        ${renderDisciplineList([...(sourceData.invalidConditions || []), ...(sourceData.noTradeList || [])].slice(0, 10))}
      </section>
    `;
  }

  function cardHeader(title, subtitle, action = "") {
    return `
      <div class="card-header">
        <div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div>
        ${action ? `<div class="header-action">${action}</div>` : ""}
      </div>
    `;
  }

  function renderAssetList(assets, options = {}) {
    if (!assets.length) return renderEmpty(options.emptyTitle || "暂无标的", options.emptyText || "当前列表为空。")
    return `<div class="asset-list">${assets.map(renderAssetRow).join("")}</div>`;
  }

  function renderAssetRow(asset) {
    const quote = asset.quote;
    const signal = deriveSignal(asset);
    const change = quote?.changePercent;
    const changeClass = change > 0.0001 ? "up" : change < -0.0001 ? "down" : "flat";
    const priceText = quote ? formatPrice(quote.price ?? quote.close) : "--";
    const changeText = Number.isFinite(change) ? formatPercent(change) : "待更新";
    const sourceText = quote
      ? `${modeLabel(asset.quoteMeta?.mode)} · ${asset.quoteMeta?.source || "未知来源"} · ${formatCompactTime(asset.quoteMeta?.lastUpdated || asset.quoteMeta?.dataDate)}`
      : asset.baseline?.close != null
        ? `基准收盘 ${formatPrice(asset.baseline.close)} · ${asset.baseline.date || "历史数据"}`
        : "尚无真实行情";

    return `
      <article class="asset-row" data-action="open-detail" data-symbol="${escapeAttr(asset.symbol)}" tabindex="0" role="button" aria-label="查看${escapeAttr(asset.name)}详情">
        <div class="asset-main">
          <div class="asset-name"><strong>${escapeHtml(asset.name || asset.code)}</strong><span>${escapeHtml(asset.code)}</span></div>
          <small>${escapeHtml(asset.sector || asset.market || "未分类")} · ${escapeHtml(sourceText)}</small>
        </div>
        <div class="asset-price"><strong>${priceText}</strong><small>${quote ? modeLabel(asset.quoteMeta?.mode) : "等待校验"}</small></div>
        <div class="asset-change ${changeClass}">${changeText}</div>
        <div class="asset-signal"><span class="signal-tag ${signal.tone}">${escapeHtml(signal.label)}</span></div>
        <div class="asset-arrow" aria-hidden="true">›</div>
      </article>
    `;
  }

  function renderRiskList(items) {
    if (!items.length) return renderEmpty("暂无明显风险提醒", "数据完整且未触发预设关键位。")
    return `<div class="compact-list">${items.map((item) => `
      <article class="compact-item">
        <div class="compact-item-head">
          <strong>${escapeHtml(item.asset.name)} ${escapeHtml(item.asset.code)}</strong>
          <span class="risk-tag ${item.level}">${escapeHtml(item.levelLabel)}</span>
        </div>
        <p>${escapeHtml(item.message)}</p>
      </article>
    `).join("")}</div>`;
  }

  function renderDisciplineList(items) {
    const values = items.filter(Boolean);
    if (!values.length) return renderEmpty("暂无规则", "可在策略数据中补充失效条件。")
    return `<ul class="discipline-list">${values.map((item) => `<li>${escapeHtml(typeof item === "string" ? item : item.conclusion || item.title || "")}</li>`).join("")}</ul>`;
  }

  function renderSearchResults() {
    if (state.searchError) return `<div class="empty-state"><strong>搜索失败</strong><p>${escapeHtml(state.searchError)}</p></div>`;
    if (!state.searchKeyword) return `<div class="empty-state"><strong>搜索并加入观察池</strong><p>添加后会跟随持仓一起批量刷新价格。</p></div>`;
    if (state.searching) return `<div class="empty-state"><strong>正在搜索</strong><p>正在查询真实证券代码和名称。</p></div>`;
    if (!state.searchResults.length) return renderEmpty("没有找到匹配标的", "请检查名称或六位代码。")

    return `<div class="search-results">${state.searchResults.map((item) => {
      const inHolding = state.holdings.some((asset) => asset.symbol === item.symbol);
      const inWatch = state.watchlist.some((asset) => asset.symbol === item.symbol);
      return `
        <div class="search-result">
          <div><strong>${escapeHtml(item.name || item.code)}</strong><small>${escapeHtml(item.code)} · ${escapeHtml(item.sector || item.market || "未分类")}</small></div>
          <div class="search-result-actions">
            <button type="button" data-action="add-holding" data-symbol="${escapeAttr(item.symbol)}" ${inHolding ? "disabled" : ""}>${inHolding ? "已在持仓" : "加入持仓"}</button>
            <button type="button" data-action="add-watch" data-symbol="${escapeAttr(item.symbol)}" ${inHolding || inWatch ? "disabled" : ""}>${inWatch ? "已在观察" : "加入观察"}</button>
          </div>
        </div>
      `;
    }).join("")}</div>`;
  }

  function newsFilterButton(value, label) {
    return `<button class="filter-button ${state.newsFilter === value ? "active" : ""}" type="button" data-action="news-filter" data-filter="${value}">${label}</button>`;
  }

  function renderNewsCard(item) {
    const related = (item.relatedStocks || []).slice(0, 4);
    return `
      <article class="news-card">
        <div class="news-meta"><span>${escapeHtml(item.source || "未注明来源")}</span><span>${escapeHtml(formatNewsTime(item.publishTime))}</span></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || item.event || "暂无摘要")}</p>
        ${related.length ? `<div class="news-tags">${related.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
        ${safeUrl(item.url) ? `<a class="news-link" href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer">查看原文 →</a>` : ""}
      </article>
    `;
  }

  function renderReasoningCard(item) {
    const title = item.title || "策略记录";
    const basis = item.basis || item.reason || item.body || "";
    const conclusion = item.conclusion || item.action || "";
    const invalid = item.invalidCondition || "";
    return `
      <article class="note-card">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(basis)}</p>
        <dl>
          ${conclusion ? `<div><dt>结论</dt><dd>${escapeHtml(conclusion)}</dd></div>` : ""}
          ${invalid ? `<div><dt>失效条件</dt><dd>${escapeHtml(invalid)}</dd></div>` : ""}
        </dl>
      </article>
    `;
  }

  function renderEmpty(title, text) {
    return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></div>`;
  }

  async function refreshAll() {
    if (state.refreshingAll) return;
    state.refreshingAll = true;
    renderStatusBar();
    const results = await Promise.allSettled([
      refreshSnapshot({ manual: true }),
      refreshNews({ manual: true })
    ]);
    state.refreshingAll = false;
    render();
    const success = results.some((result) => result.status === "fulfilled");
    showToast(success ? "数据刷新完成，失败项已保留缓存。" : "刷新失败，已保留最近一次成功数据。", success ? "success" : "warning");
  }

  async function refreshSnapshot(options = {}) {
    if (state.refreshingSnapshot) return;
    state.refreshingSnapshot = true;
    state.lastAttemptAt = new Date().toISOString();
    state.snapshotError = "";
    renderStatusBar();
    if (!options.background) render();

    try {
      const assets = allQuoteAssets();
      const [marketResult, quoteResult] = await Promise.allSettled([
        fetchMarketStatus(),
        fetchBatchQuotes(assets)
      ]);

      if (marketResult.status === "fulfilled") state.marketStatus = marketResult.value;
      else state.marketStatus = localMarketStatus();

      if (quoteResult.status === "rejected") throw quoteResult.reason;
      const result = quoteResult.value;
      let updated = 0;
      const failures = [];

      result.items.forEach((payload) => {
        const asset = findAsset(payload.symbol || symbolFromPayload(payload));
        if (!asset) return;
        const validation = applyQuotePayload(asset, payload, "live");
        if (validation.ok) updated += 1;
        else failures.push(`${asset.code}: ${validation.message}`);
      });

      (result.failed || []).forEach((failure) => {
        const asset = findAsset(failure.symbol || symbolFromPayload(failure));
        if (asset) asset.quoteError = failure.message || "行情获取失败";
        failures.push(`${failure.symbol || "未知标的"}: ${failure.message || "行情获取失败"}`);
      });

      if (!updated) throw new Error("所有行情源均未返回可验证数据");
      state.snapshotOrigin = "live";
      state.lastSuccessAt = new Date().toISOString();
      state.snapshotError = failures.length ? `${failures.length}只标的未更新` : "";
      saveSnapshot();
      startAutoRefresh();
      if (options.manual && !state.refreshingAll) showToast(`已更新 ${updated} 只标的${failures.length ? `，${failures.length}只保留缓存` : ""}。`, "success");
    } catch (error) {
      console.error("snapshot refresh failed", error);
      state.snapshotError = error?.message || "真实行情暂不可用";
      state.snapshotOrigin = allQuoteAssets().some(hasQuote) ? "cache" : "seed";
      if (options.manual && !state.refreshingAll) showToast("行情更新失败，已保留最近一次成功数据。", "warning");
    } finally {
      state.refreshingSnapshot = false;
      render();
    }
  }

  async function refreshNews(options = {}) {
    if (state.refreshingNews) return;
    state.refreshingNews = true;
    state.newsError = "";
    if (!options.initial) renderStatusBar();

    try {
      const symbols = allAssets().map((asset) => asset.symbol).filter(Boolean).join(",");
      const keywords = [...new Set([
        ...state.holdings.map((asset) => asset.name),
        ...state.watchlist.map((asset) => asset.name),
        ...(sourceData.newsKeywords || [])
      ].filter(Boolean))].slice(0, 12).join(",");
      const payload = await requestJson(`${apiBase}/api/news?symbols=${encodeURIComponent(symbols)}&keywords=${encodeURIComponent(keywords)}`, 10000);
      const items = normalizeNews(payload.items || [], "live");
      if (!items.length) throw new Error("新闻源没有返回可验证内容");
      state.news = items;
      state.newsOrigin = "live";
      state.newsSavedAt = new Date().toISOString();
      writeJson(CACHE_KEYS.news, { savedAt: state.newsSavedAt, items });
      if (options.manual && !state.refreshingAll) showToast("新闻已更新。", "success");
    } catch (error) {
      console.error("news refresh failed", error);
      state.newsError = error?.message || "新闻接口暂不可用";
      if (state.newsOrigin === "seed") {
        const cached = readJson(CACHE_KEYS.news, null);
        if (cached?.items?.length) {
          state.news = normalizeNews(cached.items, "cache");
          state.newsOrigin = "cache";
          state.newsSavedAt = cached.savedAt || "";
        }
      }
      if (options.manual && !state.refreshingAll) showToast("新闻更新失败，已保留缓存。", "warning");
    } finally {
      state.refreshingNews = false;
      render();
    }
  }

  async function fetchMarketStatus() {
    try {
      const payload = await requestJson(`${apiBase}/api/market-status`, 5000);
      return {
        status: payload.status || payload.marketStatus || payload.session || localMarketStatus().status,
        tradeDate: payload.tradeDate || payload.dataDate || ""
      };
    } catch {
      return localMarketStatus();
    }
  }

  async function fetchBatchQuotes(assets) {
    const symbols = assets.map((asset) => asset.symbol).filter(Boolean);
    if (!symbols.length) return { items: [], failed: [] };
    const url = `${apiBase}/api/quote?symbols=${encodeURIComponent(symbols.join(","))}&_=${Date.now()}`;

    try {
      const payload = await requestJson(url, 10500);
      if (Array.isArray(payload.items)) return { items: payload.items, failed: payload.failed || [] };
      throw new Error("批量行情接口尚未生效");
    } catch (batchError) {
      const rows = await mapPool(assets, 4, async (asset) => {
        try {
          const payload = await requestJson(`${apiBase}/api/quote?symbol=${encodeURIComponent(asset.symbol)}&_=${Date.now()}`, 7000);
          return { ok: true, payload };
        } catch (error) {
          return { ok: false, payload: { ok: false, symbol: asset.symbol, message: error?.message || "行情获取失败" } };
        }
      });
      const items = rows.filter((row) => row.ok).map((row) => row.payload);
      const failed = rows.filter((row) => !row.ok).map((row) => row.payload);
      if (!items.length) throw batchError;
      return { items, failed };
    }
  }

  async function mapPool(items, limit, worker) {
    const results = new Array(items.length);
    let cursor = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index], index);
      }
    });
    await Promise.all(runners);
    return results;
  }

  async function searchAssets(keyword) {
    state.searchKeyword = keyword;
    state.searchError = "";
    state.searchResults = [];
    if (!keyword) {
      render();
      return;
    }
    state.searching = true;
    render();
    try {
      const payload = await requestJson(`${apiBase}/api/search?keyword=${encodeURIComponent(keyword)}`, 8000);
      state.searchResults = normalizeAssets(payload.items || [], "search");
      if (!state.searchResults.length) {
        state.searchResults = normalizeAssets((sourceData.searchUniverse || []).filter((item) => `${item.name}${item.code}`.toLowerCase().includes(keyword.toLowerCase())), "search");
      }
    } catch (error) {
      state.searchError = error?.message || "标的搜索暂不可用";
      state.searchResults = normalizeAssets((sourceData.searchUniverse || []).filter((item) => `${item.name}${item.code}`.toLowerCase().includes(keyword.toLowerCase())), "search");
      if (state.searchResults.length) state.searchError = "";
    } finally {
      state.searching = false;
      render();
    }
  }

  function addToHoldings(symbol) {
    if (state.holdings.some((asset) => asset.symbol === symbol)) return;
    const result = state.searchResults.find((item) => item.symbol === symbol) || state.watchlist.find((item) => item.symbol === symbol);
    if (!result) return;
    state.watchlist = state.watchlist.filter((item) => item.symbol !== symbol);
    const item = { ...result, group: "holding", action: result.action || "持有观察", invalidCondition: result.invalidCondition || "没有真实行情时不执行价格计划" };
    state.holdings.unshift(item);
    state.removedSymbols.delete(symbol);
    persistPortfolioOverrides();
    showToast(`${item.name || item.code} 已加入持仓列表。`, "success");
    render();
    refreshSnapshot({ background: true });
  }

  function addToWatchlist(symbol) {
    if (portfolioAsset(symbol)) return;
    const result = state.searchResults.find((item) => item.symbol === symbol);
    if (!result) return;
    const item = { ...result, group: "watch", action: "观察", invalidCondition: "没有明确触发条件时不买入" };
    state.watchlist.unshift(item);
    state.removedSymbols.delete(symbol);
    persistPortfolioOverrides();
    showToast(`${item.name || item.code} 已加入观察池。`, "success");
    render();
    refreshSnapshot({ background: true });
  }

  function removeFromHoldings(symbol) {
    const before = state.holdings.length;
    state.holdings = state.holdings.filter((item) => item.symbol !== symbol);
    if (state.holdings.length === before) return;
    state.removedSymbols.add(symbol);
    persistPortfolioOverrides();
    closeDetail();
    showToast("已从持仓列表移除。", "success");
    render();
  }

  function removeFromWatchlist(symbol) {
    const before = state.watchlist.length;
    state.watchlist = state.watchlist.filter((item) => item.symbol !== symbol);
    if (state.watchlist.length === before) return;
    state.removedSymbols.add(symbol);
    persistPortfolioOverrides();
    closeDetail();
    showToast("已从观察池移除。", "success");
    render();
  }

  function persistPortfolioOverrides() {
    const sourceHoldingSymbols = new Set((sourceData.holdings || []).map((item) => item.symbol || toSymbol(item)));
    const sourceWatchSymbols = new Set((sourceData.watchlist || []).map((item) => item.symbol || toSymbol(item)));
    const customHoldings = state.holdings.filter((item) => !sourceHoldingSymbols.has(item.symbol)).map(assetForStorage);
    const customWatchlist = state.watchlist.filter((item) => !sourceWatchSymbols.has(item.symbol)).map(assetForStorage);
    writeJson(CACHE_KEYS.customHoldings, customHoldings);
    writeJson(CACHE_KEYS.customWatchlist, customWatchlist);
    writeJson(CACHE_KEYS.removedSymbols, Array.from(state.removedSymbols));
  }

  function hydratePortfolioOverrides() {
    state.removedSymbols = new Set(readJson(CACHE_KEYS.removedSymbols, []));
    state.holdings = state.holdings.filter((item) => !state.removedSymbols.has(item.symbol));
    state.watchlist = state.watchlist.filter((item) => !state.removedSymbols.has(item.symbol));

    const customHoldings = normalizeAssets(readJson(CACHE_KEYS.customHoldings, []), "holding");
    const customWatchlist = normalizeAssets(readJson(CACHE_KEYS.customWatchlist, []), "watch");
    const holdingSymbols = new Set(state.holdings.map((item) => item.symbol));
    const watchSymbols = new Set(state.watchlist.map((item) => item.symbol));
    customHoldings.forEach((item) => { if (!holdingSymbols.has(item.symbol) && !state.removedSymbols.has(item.symbol)) state.holdings.push(item); });
    const allHoldingSymbols = new Set(state.holdings.map((item) => item.symbol));
    state.watchlist = state.watchlist.filter((item) => !allHoldingSymbols.has(item.symbol));
    customWatchlist.forEach((item) => { if (!allHoldingSymbols.has(item.symbol) && !watchSymbols.has(item.symbol) && !state.removedSymbols.has(item.symbol)) state.watchlist.push(item); });

    const knownSymbol = "SZ002090";
    if (!state.removedSymbols.has(knownSymbol) && !state.holdings.some((item) => item.symbol === knownSymbol)) {
      const known = normalizeAssets([{
        name: "金智科技",
        code: "002090",
        symbol: knownSymbol,
        market: "SZ",
        type: "stock",
        sector: "电力信息化",
        action: "持有观察，以真实行情和基本面复盘为准",
        invalidCondition: "行情数据异常或个人交易逻辑失效时重新评估",
        riskLevel: "高"
      }], "holding")[0];
      state.holdings.unshift(known);
    }
  }

  function openDetail(symbol) {
    const asset = findAsset(symbol);
    if (!asset) return;
    state.selectedSymbol = symbol;
    state.detailPeriod = "intraday";
    state.detailError = "";
    document.body.style.overflow = "hidden";
    renderDetail();
    loadDetail(asset, false);
  }

  function closeDetail() {
    state.selectedSymbol = "";
    state.detailLoading = false;
    state.detailError = "";
    document.body.style.overflow = "";
    destroyDetailChart();
    const root = document.getElementById("detailRoot");
    if (root) root.innerHTML = "";
  }

  async function loadDetail(asset, force = false) {
    if (!asset || state.detailLoading) return;
    const detailAge = Date.now() - parseTime(asset.detail?.savedAt);
    if (!force && asset.detail && detailAge < 15 * 60 * 1000 && (asset.detail.daily?.length || asset.detail.intraday?.length)) {
      renderDetail();
      return;
    }

    state.detailLoading = true;
    state.detailError = "";
    const requestId = ++state.detailRequestId;
    renderDetail();

    try {
      const quotePromise = requestJson(`${apiBase}/api/quote?symbol=${encodeURIComponent(asset.symbol)}&_=${Date.now()}`, 7000);
      const dayPromise = asset.type === "open_fund"
        ? Promise.reject(new Error("开放式基金暂不提供K线"))
        : requestJson(`${apiBase}/api/kline?symbol=${encodeURIComponent(asset.symbol)}&period=day&count=120`, 10000);
      const intradayPromise = asset.type === "open_fund"
        ? Promise.reject(new Error("开放式基金暂不提供分时"))
        : requestJson(`${apiBase}/api/intraday?symbol=${encodeURIComponent(asset.symbol)}`, 10000);
      const [quoteResult, dayResult, intradayResult] = await Promise.allSettled([quotePromise, dayPromise, intradayPromise]);
      if (requestId !== state.detailRequestId) return;

      if (quoteResult.status === "fulfilled") applyQuotePayload(asset, quoteResult.value, "live");
      asset.detail = {
        savedAt: new Date().toISOString(),
        daily: dayResult.status === "fulfilled" ? normalizeKline(dayResult.value.items || dayResult.value) : asset.detail?.daily || [],
        intraday: intradayResult.status === "fulfilled" ? normalizeIntraday(intradayResult.value.items || intradayResult.value) : asset.detail?.intraday || []
      };
      saveDetails();
      if (!asset.detail.daily.length && !asset.detail.intraday.length) throw new Error("图表数据暂不可用");
      if (force) showToast(`${asset.name || asset.code} 已更新。`, "success");
    } catch (error) {
      console.error("detail refresh failed", error);
      state.detailError = error?.message || "详情数据暂不可用";
      if (force) showToast("单只标的刷新失败，已保留缓存。", "warning");
    } finally {
      if (requestId === state.detailRequestId) {
        state.detailLoading = false;
        render();
      }
    }
  }

  function renderDetail() {
    const root = document.getElementById("detailRoot");
    if (!root) return;
    if (!state.selectedSymbol) {
      root.innerHTML = "";
      destroyDetailChart();
      return;
    }

    const asset = findAsset(state.selectedSymbol);
    if (!asset) {
      closeDetail();
      return;
    }

    const quote = asset.quote;
    const isWatch = asset.group === "watch";
    const chartRows = state.detailPeriod === "day" ? asset.detail?.daily || [] : asset.detail?.intraday || [];
    const chartMessage = state.detailLoading
      ? "正在加载图表数据…"
      : state.detailError && !chartRows.length
        ? state.detailError
        : !chartRows.length
          ? "暂无可验证的图表数据"
          : "";

    root.innerHTML = `
      <div class="detail-backdrop" data-action="close-detail"></div>
      <aside class="detail-drawer" role="dialog" aria-modal="true" aria-label="${escapeAttr(asset.name)}详情">
        <header class="detail-head">
          <div>
            <p>${escapeHtml(asset.code)} · ${escapeHtml(asset.sector || asset.market || "未分类")}</p>
            <h2>${escapeHtml(asset.name || asset.code)}</h2>
          </div>
          <button class="close-button" type="button" data-action="close-detail" aria-label="关闭">×</button>
        </header>
        <div class="detail-content">
          <section class="detail-quote">
            ${detailMetric("最新/收盘", quote ? formatPrice(quote.price ?? quote.close) : "--")}
            ${detailMetric("涨跌幅", quote && Number.isFinite(quote.changePercent) ? formatPercent(quote.changePercent) : "--", quote?.changePercent)}
            ${detailMetric("最高", quote ? formatPrice(quote.high) : "--")}
            ${detailMetric("最低", quote ? formatPrice(quote.low) : "--")}
          </section>

          <section class="chart-card">
            <div class="chart-toolbar">
              <div>
                <strong>价格走势</strong>
                <div class="asset-source">${escapeHtml(quoteSourceText(asset))}</div>
              </div>
              <div class="chart-tabs">
                <button type="button" data-action="detail-period" data-period="intraday" class="${state.detailPeriod === "intraday" ? "active" : ""}">分时</button>
                <button type="button" data-action="detail-period" data-period="day" class="${state.detailPeriod === "day" ? "active" : ""}">日K</button>
              </div>
            </div>
            <div class="chart-host" id="detailChartHost">${chartMessage ? `<div class="chart-message">${escapeHtml(chartMessage)}</div>` : ""}</div>
          </section>

          <section class="detail-plan">
            <div class="compact-item-head">
              <strong>策略记录</strong>
              <button class="text-button" type="button" data-action="refresh-one" data-symbol="${escapeAttr(asset.symbol)}" ${state.detailLoading ? "disabled" : ""}>${state.detailLoading ? "更新中" : "刷新本标的"}</button>
            </div>
            <dl>
              <div><dt>当前动作</dt><dd>${escapeHtml(asset.action || asset.status || "观察")}</dd></div>
              <div><dt>支撑参考</dt><dd>${escapeHtml(asset.support || "未设置")}</dd></div>
              <div><dt>压力参考</dt><dd>${escapeHtml(asset.resistance || "未设置")}</dd></div>
              <div><dt>失效条件</dt><dd>${escapeHtml(asset.invalidCondition || asset.avoidReason || "没有真实行情时不执行价格计划")}</dd></div>
              <div><dt>数据状态</dt><dd>${escapeHtml(quoteSourceText(asset))}</dd></div>
            </dl>
            ${isWatch
              ? `<button class="secondary-button" type="button" data-action="remove-watch" data-symbol="${escapeAttr(asset.symbol)}">从观察池移除</button>`
              : `<button class="secondary-button" type="button" data-action="remove-holding" data-symbol="${escapeAttr(asset.symbol)}">从持仓列表移除</button>`}
          </section>
        </div>
      </aside>
    `;

    if (!chartMessage) requestAnimationFrame(() => renderDetailChart(asset));
  }

  function detailMetric(label, value, signedValue = null) {
    const cls = signedValue > 0.0001 ? "asset-change up" : signedValue < -0.0001 ? "asset-change down" : "";
    return `<div class="detail-metric"><span>${escapeHtml(label)}</span><strong class="${cls}">${escapeHtml(value)}</strong></div>`;
  }

  function renderDetailChart(asset) {
    const host = document.getElementById("detailChartHost");
    if (!host || !chartLib) return;
    const rows = state.detailPeriod === "day" ? asset.detail?.daily || [] : asset.detail?.intraday || [];
    if (!rows.length) return;

    destroyDetailChart();
    host.innerHTML = "";
    try {
      detailChart = chartLib.createChart(host, {
        width: host.clientWidth,
        height: window.innerWidth <= 640 ? 260 : 300,
        layout: { background: { color: "#ffffff" }, textColor: "#667085" },
        grid: { vertLines: { color: "#f0f2f5" }, horzLines: { color: "#f0f2f5" } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, timeVisible: state.detailPeriod === "intraday", secondsVisible: false },
        crosshair: { mode: 1 }
      });

      if (state.detailPeriod === "day") {
        const series = addSeries(detailChart, "candlestick", {
          upColor: "#d92d20",
          downColor: "#07883f",
          borderUpColor: "#d92d20",
          borderDownColor: "#07883f",
          wickUpColor: "#d92d20",
          wickDownColor: "#07883f"
        });
        series.setData(rows.map((row) => ({
          time: String(row.time).slice(0, 10),
          open: Number(row.open),
          high: Number(row.high),
          low: Number(row.low),
          close: Number(row.close)
        })).filter((row) => [row.open, row.high, row.low, row.close].every(Number.isFinite)));
      } else {
        const series = addSeries(detailChart, "line", { color: "#2563eb", lineWidth: 2 });
        series.setData(rows.map((row) => ({ time: intradayChartTime(row.time), value: Number(row.price) })).filter((row) => Number.isFinite(row.time) && Number.isFinite(row.value)));
      }
      detailChart.timeScale().fitContent();
      detailResizeHandler = () => detailChart?.resize?.(host.clientWidth, window.innerWidth <= 640 ? 260 : 300);
      window.addEventListener("resize", detailResizeHandler);
    } catch (error) {
      console.error("chart render failed", error);
      destroyDetailChart();
      host.innerHTML = `<div class="chart-message">图表渲染失败，但价格数据仍保留。</div>`;
    }
  }

  function addSeries(chart, type, options) {
    if (typeof chart.addSeries === "function") {
      const ctor = type === "candlestick" ? chartLib.CandlestickSeries : chartLib.LineSeries;
      return chart.addSeries(ctor, options);
    }
    return type === "candlestick" ? chart.addCandlestickSeries(options) : chart.addLineSeries(options);
  }

  function destroyDetailChart() {
    if (detailResizeHandler) window.removeEventListener("resize", detailResizeHandler);
    detailResizeHandler = null;
    detailChart?.remove?.();
    detailChart = null;
  }

  function intradayChartTime(value) {
    const text = String(value || "").trim();
    if (!text) return NaN;
    const normalized = text.includes("T") ? text : text.replace(" ", "T");
    const hasZone = /Z$|[+-]\d{2}:?\d{2}$/.test(normalized);
    const timestamp = Date.parse(hasZone ? normalized : `${normalized}+08:00`);
    return Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : NaN;
  }

  function applyQuotePayload(asset, payload, origin) {
    if (!payload || payload.ok === false) return { ok: false, message: payload?.message || "行情为空" };
    const row = payload.quote || payload;
    const price = numberOrNull(row.price ?? row.close);
    const preClose = numberOrNull(row.preClose);
    if (!Number.isFinite(price) || price <= 0) return { ok: false, message: "价格字段异常" };

    if (asset.baseline?.close > 0) {
      const ratio = price / asset.baseline.close;
      if (ratio > 20 || ratio < 0.05) {
        asset.quoteError = "价格量级异常，已拒绝覆盖缓存";
        return { ok: false, message: asset.quoteError };
      }
    }

    let changePercent = numberOrNull(row.changePercent);
    if (Number.isFinite(preClose) && preClose > 0) {
      const computed = ((price - preClose) / preClose) * 100;
      if (!Number.isFinite(changePercent) || Math.abs(changePercent - computed) > 1) changePercent = computed;
    }
    if (Number.isFinite(changePercent) && Math.abs(changePercent) > 45) {
      asset.quoteError = "涨跌幅异常，已拒绝覆盖缓存";
      return { ok: false, message: asset.quoteError };
    }

    asset.quote = {
      price,
      close: numberOrNull(row.close) ?? price,
      preClose,
      open: numberOrNull(row.open),
      high: numberOrNull(row.high),
      low: numberOrNull(row.low),
      change: numberOrNull(row.change) ?? (Number.isFinite(preClose) ? price - preClose : null),
      changePercent,
      volume: numberOrNull(row.volume),
      amount: numberOrNull(row.amount)
    };
    asset.quoteMeta = {
      origin,
      mode: payload.mode || (state.marketStatus.status === "trading" ? "realtime" : "historical"),
      source: payload.source || "api",
      lastUpdated: payload.lastUpdated || payload.time || payload.dataDate || "",
      dataDate: payload.dataDate || "",
      cached: Boolean(payload.cached)
    };
    asset.quoteError = "";
    return { ok: true };
  }

  function normalizeAssets(items, group) {
    return items.map((item) => {
      const code = String(item.code || "").trim();
      const market = item.market || inferMarket(code);
      const symbol = item.symbol || `${market}${code}`;
      return {
        ...item,
        name: item.name || code,
        code,
        symbol,
        market,
        type: item.type || inferType(code),
        group,
        sector: item.sector || "",
        action: item.action || item.status || "观察",
        invalidCondition: item.invalidCondition || item.avoidReason || "",
        riskLevel: item.riskLevel || item.risk || "中",
        baseline: item.lastClose != null ? {
          close: numberOrNull(item.lastClose),
          open: numberOrNull(item.lastOpen),
          high: numberOrNull(item.lastHigh),
          low: numberOrNull(item.lastLow),
          changePercent: numberOrNull(item.lastChangePercent),
          date: item.lastTradeDate || sourceData.date || "",
          source: item.lastSource || "strategy-seed"
        } : null,
        quote: null,
        quoteMeta: null,
        quoteError: "",
        detail: item.detail || null
      };
    }).filter((item) => item.code && item.symbol);
  }

  function normalizeNews(items, origin) {
    return items.map((item, index) => ({
      id: item.id || `news-${index}`,
      title: String(item.title || "").trim(),
      source: item.source || "未注明来源",
      publishTime: item.publishedAt || item.publishTime || "",
      summary: item.summary || item.body || item.event || "",
      event: item.event || "",
      relatedStocks: item.relatedSymbols || item.relatedStocks || [],
      relation: item.relation || "market",
      sector: item.sector || "",
      url: item.url || "",
      origin
    })).filter((item) => item.title);
  }

  function normalizeKline(items) {
    if (!Array.isArray(items)) return [];
    return items.map((row) => ({
      time: row.time || row.date,
      open: numberOrNull(row.open),
      high: numberOrNull(row.high),
      low: numberOrNull(row.low),
      close: numberOrNull(row.close),
      volume: numberOrNull(row.volume),
      amount: numberOrNull(row.amount)
    })).filter((row) => row.time && [row.open, row.high, row.low, row.close].every(Number.isFinite));
  }

  function normalizeIntraday(items) {
    if (!Array.isArray(items)) return [];
    return items.map((row) => ({
      time: row.time,
      price: numberOrNull(row.price ?? row.close),
      avgPrice: numberOrNull(row.avgPrice),
      volume: numberOrNull(row.volume),
      amount: numberOrNull(row.amount)
    })).filter((row) => row.time && Number.isFinite(row.price));
  }

  function deriveSignal(asset) {
    if (!asset.quote) return { label: asset.quoteError ? "数据异常" : "等待数据", tone: "warning" };
    const price = asset.quote.price ?? asset.quote.close;
    const change = asset.quote.changePercent;
    const support = firstLevel(asset.support);
    const resistance = firstLevel(asset.resistance);

    if (Number.isFinite(change) && change <= -5) return { label: "高波动回撤", tone: "danger" };
    if (Number.isFinite(change) && change >= 5) return { label: "高波动上涨", tone: "warning" };
    if (Number.isFinite(support) && price <= support * 1.01) return { label: "接近支撑", tone: "danger" };
    if (Number.isFinite(resistance) && price >= resistance) return { label: "触及压力", tone: "warning" };
    if (Number.isFinite(change) && change >= 2.5) return { label: "相对强势", tone: "positive" };
    if (Number.isFinite(change) && change <= -2.5) return { label: "回撤扩大", tone: "warning" };
    return { label: truncate(asset.action || "正常观察", 10), tone: "" };
  }

  function rankedRiskItems(assets) {
    return assets.map((asset) => {
      if (!asset.quote) return { asset, score: 80, level: "medium", levelLabel: "数据", message: asset.quoteError || "尚未取得可验证行情，价格计划应暂停。" };
      const price = asset.quote.price ?? asset.quote.close;
      const change = asset.quote.changePercent;
      const support = firstLevel(asset.support);
      const resistance = firstLevel(asset.resistance);
      if (Number.isFinite(change) && Math.abs(change) >= 5) {
        return { asset, score: 100 + Math.abs(change), level: "high", levelLabel: "高", message: `当日波动 ${formatPercent(change)}，先核对量价和消息，不把单日波动当趋势。` };
      }
      if (Number.isFinite(support) && price <= support * 1.01) {
        return { asset, score: 90, level: "high", levelLabel: "高", message: `价格 ${formatPrice(price)} 接近支撑 ${formatPrice(support)}，关注是否有效跌破。` };
      }
      if (Number.isFinite(resistance) && price >= resistance) {
        return { asset, score: 70, level: "medium", levelLabel: "中", message: `价格 ${formatPrice(price)} 已到压力参考 ${formatPrice(resistance)}，关注冲高回落。` };
      }
      if (String(asset.riskLevel).includes("高")) {
        return { asset, score: 45, level: "medium", levelLabel: "中", message: asset.invalidCondition || "标的波动较高，按预设失效条件跟踪。" };
      }
      return null;
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }

  function buildFocus(holdings, riskItems) {
    const missing = holdings.filter((asset) => !asset.quote).length;
    if (state.refreshingSnapshot && !holdings.some(hasQuote)) {
      return { title: "正在校验真实行情", description: "页面先建立可靠数据状态，不展示未经验证的当前价格。" };
    }
    if (missing) {
      return { title: "先处理数据缺口", description: `${missing}只持仓尚无可验证行情。涉及这些标的的价格触发计划暂不执行。` };
    }
    const high = riskItems.filter((item) => item.level === "high");
    if (high.length) {
      return { title: `优先查看 ${high[0].asset.name}`, description: `${high.length}只标的触发高优先级提醒。先核对真实价格、量能和失效条件，再考虑操作。` };
    }
    if (state.marketStatus.status === "trading") {
      return { title: "盘中数据正常，按条件观察", description: "首屏价格已批量更新；只有打开标的详情时才加载分时和K线，避免无效等待。" };
    }
    return { title: "收盘数据已校验，聚焦关键位", description: "非交易时段显示最近有效收盘数据，不把历史价格标记为实时行情。" };
  }

  function filteredNews() {
    const items = [...state.news].sort((a, b) => parseTime(b.publishTime) - parseTime(a.publishTime));
    if (state.newsFilter === "holding") {
      const codes = new Set(state.holdings.flatMap((asset) => [asset.code, asset.symbol]));
      return items.filter((item) => item.relation === "holding" || (item.relatedStocks || []).some((code) => codes.has(code)));
    }
    if (state.newsFilter === "market") return items.filter((item) => item.relation !== "holding");
    return items;
  }

  function hydrateSnapshot() {
    const cached = readJson(CACHE_KEYS.snapshot, null);
    if (!cached?.items || !Array.isArray(cached.items)) return;
    let applied = 0;
    cached.items.forEach((row) => {
      const asset = findAsset(row.symbol);
      if (!asset) return;
      if (applyQuotePayload(asset, row, "cache").ok) applied += 1;
    });
    if (applied) {
      state.snapshotOrigin = "cache";
      state.lastSuccessAt = cached.savedAt || "";
      state.marketStatus = cached.marketStatus || state.marketStatus;
    }
  }

  function saveSnapshot() {
    const items = allAssets().filter(hasQuote).map((asset) => ({
      ok: true,
      symbol: asset.symbol,
      source: asset.quoteMeta?.source,
      mode: asset.quoteMeta?.mode,
      lastUpdated: asset.quoteMeta?.lastUpdated,
      dataDate: asset.quoteMeta?.dataDate,
      quote: asset.quote
    }));
    writeJson(CACHE_KEYS.snapshot, { savedAt: state.lastSuccessAt, marketStatus: state.marketStatus, items });
  }

  function hydrateNews() {
    const cached = readJson(CACHE_KEYS.news, null);
    if (!cached?.items?.length) return;
    state.news = normalizeNews(cached.items, "cache");
    state.newsOrigin = "cache";
    state.newsSavedAt = cached.savedAt || "";
  }

  function hydrateDetailCache() {
    const cached = readJson(CACHE_KEYS.details, {});
    if (!cached || typeof cached !== "object") return;
    allAssets().forEach((asset) => {
      if (cached[asset.symbol]) asset.detail = cached[asset.symbol];
    });
  }

  function saveDetails() {
    const entries = allAssets().filter((asset) => asset.detail).sort((a, b) => parseTime(b.detail.savedAt) - parseTime(a.detail.savedAt)).slice(0, 8);
    const payload = Object.fromEntries(entries.map((asset) => [asset.symbol, asset.detail]));
    writeJson(CACHE_KEYS.details, payload);
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    if (document.hidden || state.marketStatus.status !== "trading") return;
    const interval = Math.max(15000, Math.min(Number(sourceData.refreshInterval || 20000), 60000));
    quoteTimer = window.setInterval(() => {
      if (!state.refreshingSnapshot && !state.refreshingAll) refreshSnapshot({ background: true });
    }, interval);
  }

  function stopAutoRefresh() {
    if (quoteTimer) window.clearInterval(quoteTimer);
    quoteTimer = null;
  }

  async function requestJson(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { cache: "no-store", headers: { accept: "application/json" }, signal: controller.signal });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok === false) throw new Error(payload.message || `请求失败 ${response.status}`);
      return payload;
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("数据源响应超时");
      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function allAssets() {
    const seen = new Set();
    return [...state.holdings, ...state.watchlist].filter((asset) => asset.symbol && !seen.has(asset.symbol) && seen.add(asset.symbol));
  }

  function allQuoteAssets() {
    return allAssets().filter((asset) => asset.type !== "open_fund");
  }

  function findAsset(symbol) {
    return allAssets().find((asset) => asset.symbol === symbol);
  }

  function portfolioAsset(symbol) {
    return allAssets().find((asset) => asset.symbol === symbol);
  }

  function hasQuote(asset) {
    return Boolean(asset?.quote && Number.isFinite(asset.quote.price ?? asset.quote.close));
  }

  function assetForStorage(asset) {
    return {
      name: asset.name,
      code: asset.code,
      symbol: asset.symbol,
      market: asset.market,
      type: asset.type,
      sector: asset.sector,
      support: asset.support,
      resistance: asset.resistance,
      action: asset.action,
      invalidCondition: asset.invalidCondition,
      riskLevel: asset.riskLevel
    };
  }

  function latestQuoteTime(assets) {
    return assets.map((asset) => asset.quoteMeta?.lastUpdated || asset.quoteMeta?.dataDate || "").filter(Boolean).sort().at(-1) || "";
  }

  function quoteSourceText(asset) {
    if (!asset.quote) return asset.quoteError || "尚无真实行情";
    return `${modeLabel(asset.quoteMeta?.mode)} · ${asset.quoteMeta?.source || "未知来源"} · ${formatDateTime(asset.quoteMeta?.lastUpdated || asset.quoteMeta?.dataDate)}`;
  }

  function modeLabel(mode) {
    const value = String(mode || "").toLowerCase();
    if (value.includes("real")) return "实时";
    if (value.includes("delay")) return "延迟";
    if (value.includes("histor" ) || value.includes("closed")) return "最近收盘";
    if (value.includes("cache")) return "缓存";
    return state.marketStatus.status === "trading" ? "行情" : "最近有效";
  }

  function localMarketStatus() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Shanghai",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());
    const day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.find((part) => part.type === "weekday")?.value] ?? 0;
    const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
    const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
    const total = hour * 60 + minute;
    if (day === 0 || day === 6) return { status: "non_trading_day" };
    if ((total >= 570 && total <= 690) || (total >= 780 && total <= 900)) return { status: "trading" };
    if (total > 690 && total < 780) return { status: "lunch_break" };
    return { status: "closed" };
  }

  function marketStatusLabel(status) {
    return {
      trading: "A股交易中",
      lunch_break: "A股午间休市",
      closed: "A股已收盘",
      non_trading_day: "非交易日",
      suspended: "标的停牌",
      unknown: "市场状态待确认"
    }[status] || "市场状态待确认";
  }

  function initialView() {
    const raw = location.hash.replace("#", "");
    const mapping = { action: "overview", quote: "market", logic: "notes" };
    const value = mapping[raw] || raw;
    return ["overview", "market", "news", "notes"].includes(value) ? value : "overview";
  }

  function inferMarket(code) {
    if (/^[6895]/.test(code)) return "SH";
    if (/^[0123]/.test(code)) return "SZ";
    if (/^[48]/.test(code)) return "BJ";
    return "OF";
  }

  function inferType(code) {
    if (/^(00|30|60|68|8|4)/.test(code)) return "stock";
    if (/^[15]/.test(code)) return "exchange_fund";
    return "open_fund";
  }

  function toSymbol(item) {
    const code = String(item.code || "");
    return `${item.market || inferMarket(code)}${code}`;
  }

  function symbolFromPayload(payload) {
    const code = String(payload?.code || "");
    return code ? `${payload.market || inferMarket(code)}${code}` : "";
  }

  function firstLevel(value) {
    const match = String(value || "").match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function formatPrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "--";
    if (Math.abs(number) >= 100) return number.toFixed(2);
    if (Math.abs(number) >= 10) return number.toFixed(2);
    return number.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  }

  function formatPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "--";
    return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
  }

  function formatDateTime(value) {
    if (!value) return "时间未知";
    const timestamp = parseTime(value);
    if (!timestamp) return String(value);
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date(timestamp)).replaceAll("/", "-");
  }

  function formatCompactTime(value) {
    if (!value) return "未知";
    const timestamp = parseTime(value);
    if (!timestamp) return String(value).slice(0, 16);
    return new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date(timestamp));
  }

  function formatNewsTime(value) {
    if (!value) return "时间未披露";
    const timestamp = parseTime(value);
    if (!timestamp) return String(value);
    return formatDateTime(timestamp);
  }

  function parseTime(value) {
    if (!value) return 0;
    if (typeof value === "number") return value;
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return Date.parse(`${text}T15:00:00+08:00`) || 0;
    const normalized = text.replace("北京时间", "").trim().replace(" ", "T");
    const hasZone = /Z$|[+-]\d{2}:?\d{2}$/.test(normalized);
    return Date.parse(hasZone ? normalized : `${normalized}+08:00`) || Date.parse(text) || 0;
  }

  function numberOrNull(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function truncate(value, length) {
    const text = String(value || "");
    return text.length > length ? `${text.slice(0, length)}…` : text;
  }

  function safeUrl(url) {
    try {
      const parsed = new URL(url, location.href);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function setText(node, value) {
    if (node) node.textContent = value;
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("local storage unavailable", error);
    }
  }

  function showToast(message, type = "") {
    const root = document.getElementById("toastRoot");
    if (!root) return;
    window.clearTimeout(state.toastTimer);
    root.innerHTML = `<div class="toast ${escapeAttr(type)}">${escapeHtml(message)}</div>`;
    state.toastTimer = window.setTimeout(() => { root.innerHTML = ""; }, 3200);
  }
})();
