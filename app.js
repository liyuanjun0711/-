(() => {
  "use strict";

  const sourceData = window.MARKET_BRIEFING_DATA || {};
  const chartLib = window.LightweightCharts;
  const apiBase = String(sourceData.apiBase || "").replace(/\/$/, "");

  const SCORE_VERSION = "market-observation-v4.0.0";
  const SCORE_RULES = Object.freeze({
    momentumWeight: 18,
    openTrendWeight: 8,
    rangeWeight: 6,
    levelWeight: 12,
    maxVolatilityPenalty: 10,
    riskPenalty: Object.freeze({ high: 5, medium: 2, low: 0 })
  });

  const CACHE_KEYS = {
    snapshot: "portfolio-dashboard:snapshot:v4",
    news: "portfolio-dashboard:news:v4",
    details: "portfolio-dashboard:details:v4"
  };

  const state = {
    view: initialView(),
    holdings: normalizeAssets(sourceData.holdings || [], "holding"),
    watchlist: normalizeAssets(sourceData.watchlist || [], "watch"),
    marketStatus: localMarketStatus(),
    snapshotOrigin: "seed",
    snapshotId: "",
    snapshotGeneratedAt: "",
    snapshotValidUntil: "",
    snapshotError: "",
    lastSuccessAt: "",
    lastAttemptAt: "",
    scoreVersion: SCORE_VERSION,
    portfolioVersion: String(sourceData.portfolioVersion || sourceData.lastUpdated || sourceData.date || "canonical-v1"),
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
    sessionWatchSymbols: new Set()
  };

  let quoteTimer = null;
  let detailChart = null;
  let detailResizeHandler = null;

  hydrateCanonicalPortfolio();
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
    document.addEventListener("gesturestart", preventZoomGesture, { passive: false });
    document.addEventListener("gesturechange", preventZoomGesture, { passive: false });
    document.addEventListener("gestureend", preventZoomGesture, { passive: false });
    document.addEventListener("touchmove", preventMultiTouchZoom, { passive: false });
    window.addEventListener("wheel", preventCtrlWheelZoom, { passive: false });
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

  function preventZoomGesture(event) {
    event.preventDefault();
  }

  function preventMultiTouchZoom(event) {
    if (event.touches && event.touches.length > 1) event.preventDefault();
  }

  function preventCtrlWheelZoom(event) {
    if (event.ctrlKey) event.preventDefault();
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
    const snapshotStatus = document.getElementById("snapshotStatus");
    const scoreStatus = document.getElementById("scoreStatus");
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
    setText(snapshotStatus, state.snapshotId ? `快照 ${shortSnapshotId(state.snapshotId)}` : "快照尚未统一");
    setText(scoreStatus, `评分 ${state.scoreVersion}`);
    setText(baselineStatus, `组合 ${state.portfolioVersion}`);
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
    const scored = holdings.map(scoreAsset).filter((item) => item.available);
    const averageScore = scored.length ? Math.round(scored.reduce((sum, item) => sum + item.total, 0) / scored.length) : null;
    const confidenceAorB = scored.filter((item) => ["A", "B"].includes(item.confidence.grade)).length;
    const latest = latestQuoteTime(holdings);

    return `
      <section class="focus-card">
        <div class="focus-top">
          <span class="focus-label">UNIFIED SNAPSHOT</span>
          <span class="mode-tag">${escapeHtml(marketStatusLabel(state.marketStatus.status))}</span>
        </div>
        <h2>${escapeHtml(focus.title)}</h2>
        <p>${escapeHtml(focus.description)}</p>
        <div class="focus-meta">
          <span>${state.snapshotId ? `快照 ${escapeHtml(shortSnapshotId(state.snapshotId))}` : "快照待生成"}</span>
          <span>${available}/${holdings.length} 只持仓有可验证行情</span>
          <span>${latest ? `数据时间 ${formatCompactTime(latest)}` : "尚无真实更新时间"}</span>
          <span>模型 ${escapeHtml(SCORE_VERSION)}</span>
        </div>
      </section>

      <section class="metric-grid" aria-label="组合摘要">
        <article class="metric-card">
          <span>统一快照</span>
          <strong>${state.snapshotId ? "已统一" : "待校验"}</strong>
          <small>不同设备使用相同快照编号时数据应一致</small>
        </article>
        <article class="metric-card">
          <span>平均观察分</span>
          <strong>${averageScore == null ? "--" : averageScore}</strong>
          <small>只反映当前快照，不代表收益预测</small>
        </article>
        <article class="metric-card">
          <span>高可信数据</span>
          <strong>${confidenceAorB}/${scored.length || 0}</strong>
          <small>A/B 级数据才适合比较评分</small>
        </article>
        <article class="metric-card">
          <span>数据完整度</span>
          <strong>${dataQuality}%</strong>
          <small>${state.snapshotOrigin === "live" ? "本次已由统一接口校验" : "当前含缓存或待更新项"}</small>
        </article>
      </section>

      <section class="overview-grid">
        <div class="main-column">
          <section class="card">
            ${cardHeader("持仓快照", "价格、涨跌、评分和可信度均绑定到同一快照。", `<button class="text-button" type="button" data-view="market">查看全部</button>`)}
            ${renderAssetList(holdings)}
          </section>
        </div>
        <aside class="side-column">
          <section class="card">
            ${cardHeader("风险提醒", "风险排序与观察分分开计算，不用风险分冒充看涨分。")}
            ${renderRiskList(riskItems.slice(0, 5))}
          </section>
          <section class="card">
            ${cardHeader("评分边界", "评分由固定公式生成，新闻和文案不会直接改分。")}
            ${renderDisciplineList([
              "同一快照编号、同一评分版本和同一组合配置，评分必须完全一致。",
              "评分只使用价格、昨收、开盘、最高、最低、支撑压力与静态风险级别。",
              "数据可信度低于B级时，评分只作展示，不用于横向比较。",
              "策略基线、旧新闻和浏览器缓存不会被标记为实时数据。"
            ])}
          </section>
        </aside>
      </section>
    `;
  }

  function renderMarketView() {
    return `
      <section class="toolbar">
        <div class="toolbar-copy">
          <h2>行情与统一评分</h2>
          <p>所有持仓价格和评分绑定到同一服务端快照；分时和K线仅在打开详情后请求。</p>
        </div>
        <button class="secondary-button" type="button" data-action="refresh-snapshot" ${state.refreshingSnapshot ? "disabled" : ""}>
          ${state.refreshingSnapshot ? "正在更新" : "仅刷新行情"}
        </button>
      </section>

      <section class="card">
        ${cardHeader("当前持仓", "持仓来自统一配置；每条行情显示来源、时间、评分和可信度。")}
        ${renderAssetList(state.holdings)}
      </section>

      <section class="card">
        ${cardHeader("统一观察池", "观察池来自 report-data.js；本机临时项会明确标记且不持久化。")}
        ${renderAssetList(state.watchlist, { emptyTitle: "观察池为空", emptyText: "通过下方搜索添加需要跟踪的标的。" })}
      </section>

      <section class="card">
        ${cardHeader("临时查询标的", "支持股票、ETF、LOF和基金；搜索不会改写跨设备持仓配置。")}
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
          <h2>数据与评分方法</h2>
          <p>这里解释数据为什么可能不同、评分如何计算，以及哪些内容只是人工基线。</p>
        </div>
      </section>

      <section class="note-grid">
        <article class="note-card">
          <h3>跨设备一致性</h3>
          <p>V4 以服务端统一快照为主，不再让每台设备用自己的随机请求、持仓增删记录和缓存重新生成结果。</p>
          <dl>
            <div><dt>快照编号</dt><dd>${escapeHtml(state.snapshotId ? shortSnapshotId(state.snapshotId) : "尚未生成")}</dd></div>
            <div><dt>生成时间</dt><dd>${escapeHtml(formatDateTime(state.snapshotGeneratedAt || state.lastSuccessAt))}</dd></div>
            <div><dt>组合版本</dt><dd>${escapeHtml(state.portfolioVersion)}</dd></div>
            <div><dt>一致条件</dt><dd>快照编号、组合版本和评分版本相同，价格与评分必须相同。</dd></div>
          </dl>
        </article>
        <article class="note-card">
          <h3>评分定义</h3>
          <p>观察分是 0—100 的规则化市场状态分，不是未来收益预测，也不是自动买卖建议。</p>
          <dl>
            <div><dt>基础分</dt><dd>50分</dd></div>
            <div><dt>加减项</dt><dd>当日动量、相对开盘、日内位置、支撑压力、波动扣分、静态风险扣分。</dd></div>
            <div><dt>模型版本</dt><dd>${escapeHtml(SCORE_VERSION)}</dd></div>
            <div><dt>明确排除</dt><dd>新闻情绪、随机数、设备缓存时间和自动生成文案不会直接改分。</dd></div>
          </dl>
        </article>
      </section>

      <section class="note-grid">
        <article class="note-card">
          <h3>数据可信度等级</h3>
          <dl>
            <div><dt>A级</dt><dd>统一接口实时数据，时间与关键字段完整。</dd></div>
            <div><dt>B级</dt><dd>统一接口延迟数据或最近有效收盘，可用于同快照比较。</dd></div>
            <div><dt>C级</dt><dd>本机保存的最近一次真实缓存，只用于故障降级。</dd></div>
            <div><dt>D级</dt><dd>缺少时间、来源或关键字段，不应依赖评分。</dd></div>
          </dl>
        </article>
        <article class="note-card">
          <h3>人工策略基线</h3>
          <p>report-data.js 中的操作计划、支撑压力和历史新闻是人工维护内容，必须显示基线日期，不能伪装成当前实时结论。</p>
          <dl>
            <div><dt>策略时间</dt><dd>${escapeHtml(baseline)}</dd></div>
            <div><dt>行情来源</dt><dd>东方财富优先，新浪与腾讯作为后备；上游失败时才使用明确标注的缓存。</dd></div>
            <div><dt>组合来源</dt><dd>统一由 report-data.js 管理，本机搜索只允许临时观察。</dd></div>
          </dl>
        </article>
      </section>

      <section class="note-grid">
        ${reasoning.slice(0, 6).map(renderReasoningCard).join("") || renderEmpty("暂无复盘记录", "可在 report-data.js 中维护策略依据。")}
      </section>

      <section class="card">
        ${cardHeader("失效条件与禁止事项", "条件失效时先取消计划，不临场修改评分解释。")}
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
    const score = scoreAsset(asset);
    const change = quote?.changePercent;
    const changeClass = change > 0.0001 ? "up" : change < -0.0001 ? "down" : "flat";
    const priceText = quote ? formatPrice(quote.price ?? quote.close) : "--";
    const changeText = Number.isFinite(change) ? formatPercent(change) : "待更新";
    const sourceText = quote
      ? `${modeLabel(asset.quoteMeta?.mode)} · ${asset.quoteMeta?.source || "未知来源"} · ${formatCompactTime(asset.quoteMeta?.lastUpdated || asset.quoteMeta?.dataDate)}`
      : asset.baseline?.close != null
        ? `人工基线 ${formatPrice(asset.baseline.close)} · ${asset.baseline.date || "历史数据"}`
        : "尚无可验证行情";

    return `
      <article class="asset-row" data-action="open-detail" data-symbol="${escapeAttr(asset.symbol)}" tabindex="0" role="button" aria-label="查看${escapeAttr(asset.name)}详情">
        <div class="asset-main">
          <div class="asset-name"><strong>${escapeHtml(asset.name || asset.code)}</strong><span>${escapeHtml(asset.code)}</span></div>
          <small>${escapeHtml(asset.sector || asset.market || "未分类")} · ${escapeHtml(sourceText)}</small>
        </div>
        <div class="asset-price"><strong>${priceText}</strong><small>${quote ? modeLabel(asset.quoteMeta?.mode) : "等待校验"}</small></div>
        <div class="asset-change ${changeClass}">${changeText}</div>
        <div class="asset-signal">${renderScoreChip(score)}</div>
        <div class="asset-arrow" aria-hidden="true">›</div>
      </article>
    `;
  }

  function renderScoreChip(score) {
    if (!score.available) {
      return `<div class="score-chip weak"><span class="score-value">--</span><div class="score-copy"><strong>不可评分</strong><small>可信度 D</small></div></div>`;
    }
    return `<div class="score-chip ${escapeAttr(score.tone)}"><span class="score-value">${score.total}</span><div class="score-copy"><strong>${escapeHtml(score.label)}</strong><small>可信度 ${escapeHtml(score.confidence.grade)}</small></div></div>`;
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
    if (!state.searchKeyword) return `<div class="empty-state"><strong>搜索并临时查看标的</strong><p>统一持仓由 report-data.js 管理；搜索结果不会擅自改写跨设备组合。</p></div>`;
    if (state.searching) return `<div class="empty-state"><strong>正在搜索</strong><p>正在查询真实证券代码和名称。</p></div>`;
    if (!state.searchResults.length) return renderEmpty("没有找到匹配标的", "请检查名称或六位代码。");

    return `<div class="search-results">${state.searchResults.map((item) => {
      const inPortfolio = Boolean(portfolioAsset(item.symbol));
      return `
        <div class="search-result">
          <div><strong>${escapeHtml(item.name || item.code)}</strong><small>${escapeHtml(item.code)} · ${escapeHtml(item.sector || item.market || "未分类")}</small></div>
          <div class="search-result-actions">
            ${inPortfolio
              ? `<button type="button" data-action="open-detail" data-symbol="${escapeAttr(item.symbol)}">查看详情</button>`
              : `<button type="button" data-action="add-watch" data-symbol="${escapeAttr(item.symbol)}">本次会话临时观察</button>`}
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
      state.snapshotId = result.snapshotId || result.snapshot?.id || state.snapshotId;
      state.snapshotGeneratedAt = result.generatedAt || result.requestedAt || new Date().toISOString();
      state.snapshotValidUntil = result.validUntil || "";
      state.scoreVersion = result.scoreVersion || SCORE_VERSION;
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
      state.lastSuccessAt = state.snapshotGeneratedAt || new Date().toISOString();
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
    const symbols = assets.map((asset) => asset.symbol).filter(Boolean).sort();
    if (!symbols.length) return { items: [], failed: [] };
    const bucketMs = state.marketStatus.status === "trading" ? 30000 : 300000;
    const bucket = Math.floor(Date.now() / bucketMs);
    const url = `${apiBase}/api/quote?symbols=${encodeURIComponent(symbols.join(","))}&bucket=${bucket}`;

    try {
      const payload = await requestJson(url, 10500, { cache: "default" });
      if (Array.isArray(payload.items)) return { ...payload, failed: payload.failed || [] };
      throw new Error("批量行情接口尚未生效");
    } catch (batchError) {
      const rows = await mapPool(assets, 4, async (asset) => {
        try {
          const payload = await requestJson(`${apiBase}/api/quote?symbol=${encodeURIComponent(asset.symbol)}&bucket=${bucket}`, 7000, { cache: "default" });
          return { ok: true, payload };
        } catch (error) {
          return { ok: false, payload: { ok: false, symbol: asset.symbol, message: error?.message || "行情获取失败" } };
        }
      });
      const items = rows.filter((row) => row.ok).map((row) => row.payload);
      const failed = rows.filter((row) => !row.ok).map((row) => row.payload);
      if (!items.length) throw batchError;
      const generatedAt = new Date(bucket * bucketMs).toISOString();
      return {
        items,
        failed,
        snapshotId: createClientSnapshotId(bucket, items),
        generatedAt,
        validUntil: new Date((bucket + 1) * bucketMs).toISOString(),
        scoreVersion: SCORE_VERSION,
        fallback: true
      };
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
    const item = state.searchResults.find((row) => row.symbol === symbol);
    if (!item) return;
    showToast("跨设备持仓由 report-data.js 统一管理；搜索结果不会只写入当前设备。", "warning");
  }

  function addToWatchlist(symbol) {
    if (portfolioAsset(symbol)) return;
    const result = state.searchResults.find((item) => item.symbol === symbol);
    if (!result) return;
    const item = {
      ...result,
      group: "watch",
      action: "临时观察",
      invalidCondition: "本次会话结束后自动移除；跨设备关注请更新统一组合配置。",
      localOnly: true
    };
    state.watchlist.unshift(item);
    state.sessionWatchSymbols.add(symbol);
    showToast(`${item.name || item.code} 已加入本次会话临时观察，不会造成跨设备组合差异。`, "success");
    render();
    refreshSnapshot({ background: true });
  }

  function removeFromHoldings() {
    showToast("统一持仓不能在单台设备上删除，请修改 report-data.js 后重新部署。", "warning");
  }

  function removeFromWatchlist(symbol) {
    const asset = state.watchlist.find((item) => item.symbol === symbol);
    if (!asset) return;
    if (!asset.localOnly) {
      showToast("统一观察池不能在单台设备上删除，请修改 report-data.js 后重新部署。", "warning");
      return;
    }
    state.watchlist = state.watchlist.filter((item) => item.symbol !== symbol);
    state.sessionWatchSymbols.delete(symbol);
    closeDetail();
    showToast("已移除本次会话临时观察。", "success");
    render();
  }

  function persistPortfolioOverrides() {
    // V4 intentionally does not persist portfolio composition in localStorage.
    // Canonical holdings/watchlist must come from report-data.js so all devices agree.
  }

  function hydrateCanonicalPortfolio() {
    const seen = new Set();
    state.holdings = state.holdings.filter((item) => item.symbol && !seen.has(item.symbol) && seen.add(item.symbol));
    const holdingSymbols = new Set(state.holdings.map((item) => item.symbol));
    state.watchlist = state.watchlist.filter((item) => item.symbol && !holdingSymbols.has(item.symbol) && !seen.has(item.symbol) && seen.add(item.symbol));

    const knownSymbol = "SZ002090";
    if (!state.holdings.some((item) => item.symbol === knownSymbol)) {
      const known = normalizeAssets([{
        name: "金智科技",
        code: "002090",
        symbol: knownSymbol,
        market: "SZ",
        type: "stock",
        sector: "电力信息化",
        action: "持有观察，以统一快照和基本面复盘为准",
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
    state.detailPeriod = "day";
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
      const detailBucket = Math.floor(Date.now() / (state.marketStatus.status === "trading" ? 30000 : 300000));
      const quotePromise = requestJson(`${apiBase}/api/quote?symbol=${encodeURIComponent(asset.symbol)}&bucket=${detailBucket}`, 7000, { cache: "default" });
      const dayPromise = asset.type === "open_fund"
        ? Promise.reject(new Error("开放式基金暂不提供K线"))
        : requestJson(`${apiBase}/api/kline?symbol=${encodeURIComponent(asset.symbol)}&period=day&count=120`, 6000);
      const intradayPromise = asset.type === "open_fund"
        ? Promise.reject(new Error("开放式基金暂不提供分时"))
        : requestJson(`${apiBase}/api/intraday?symbol=${encodeURIComponent(asset.symbol)}`, 3500);
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
    const score = scoreAsset(asset);
    const chartRows = state.detailPeriod === "day" ? asset.detail?.daily || [] : asset.detail?.intraday || [];
    const chartMessage = state.detailLoading && !chartRows.length
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
            ${detailMetric("观察分", score.available ? String(score.total) : "--")}
          </section>

          ${renderScorePanel(score)}

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
            ${isWatch && asset.localOnly
              ? `<button class="secondary-button" type="button" data-action="remove-watch" data-symbol="${escapeAttr(asset.symbol)}">移除本次会话临时观察</button>`
              : `<div class="asset-source">统一持仓与观察池由 report-data.js 管理，避免不同设备各自修改。</div>`}
          </section>
        </div>
      </aside>
    `;

    if (!chartMessage) requestAnimationFrame(() => renderDetailChart(asset));
  }

  function renderScorePanel(score) {
    if (!score.available) {
      return `<section class="score-panel"><div class="score-panel-head"><div><h3>观察评分不可用</h3><p>${escapeHtml(score.confidence.reason)}</p></div><span class="confidence-tag d">可信度 D</span></div></section>`;
    }
    return `
      <section class="score-panel">
        <div class="score-panel-head">
          <div>
            <h3>固定规则观察评分</h3>
            <p>快照 ${escapeHtml(shortSnapshotId(score.snapshotId || state.snapshotId))} · 模型 ${escapeHtml(score.scoreVersion)}</p>
          </div>
          <div class="score-hero"><strong>${score.total}</strong><span>${escapeHtml(score.label)}<br>可信度 ${escapeHtml(score.confidence.grade)}</span></div>
        </div>
        <dl class="score-breakdown">
          ${score.components.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${item.value > 0 ? "+" : ""}${escapeHtml(String(item.value))}　${escapeHtml(item.explanation)}</dd></div>`).join("")}
          <div><dt>可信度</dt><dd><span class="confidence-tag ${escapeAttr(score.confidence.grade.toLowerCase())}">${escapeHtml(score.confidence.grade)} · ${escapeHtml(score.confidence.label)}</span>　${escapeHtml(score.confidence.reason)}</dd></div>
        </dl>
      </section>
    `;
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

  function scoreAsset(asset) {
    if (!asset?.quote) {
      return {
        available: false,
        total: null,
        label: "不可评分",
        tone: "weak",
        confidence: { grade: "D", label: "无可验证行情", reason: asset?.quoteError || "缺少真实价格" },
        components: []
      };
    }

    const quote = asset.quote;
    const price = numberOrNull(quote.price ?? quote.close);
    const preClose = numberOrNull(quote.preClose);
    const open = numberOrNull(quote.open);
    const high = numberOrNull(quote.high);
    const low = numberOrNull(quote.low);
    const changePercent = Number.isFinite(quote.changePercent)
      ? Number(quote.changePercent)
      : Number.isFinite(price) && Number.isFinite(preClose) && preClose > 0
        ? ((price - preClose) / preClose) * 100
        : 0;

    const momentum = clampNumber(changePercent * 3.6, -SCORE_RULES.momentumWeight, SCORE_RULES.momentumWeight);
    const openTrendPct = Number.isFinite(price) && Number.isFinite(open) && open > 0 ? ((price - open) / open) * 100 : 0;
    const openTrend = clampNumber(openTrendPct * 2.2, -SCORE_RULES.openTrendWeight, SCORE_RULES.openTrendWeight);

    let rangePosition = 0;
    if (Number.isFinite(price) && Number.isFinite(high) && Number.isFinite(low) && high > low) {
      const location = clampNumber((price - low) / (high - low), 0, 1);
      rangePosition = (location - 0.5) * SCORE_RULES.rangeWeight * 2;
    }

    const support = firstLevel(asset.support);
    const resistance = firstLevel(asset.resistance);
    let levelPosition = 0;
    if (Number.isFinite(price) && Number.isFinite(support) && Number.isFinite(resistance) && resistance > support) {
      if (price < support) levelPosition = -SCORE_RULES.levelWeight;
      else if (price > resistance) levelPosition = SCORE_RULES.levelWeight * 0.67;
      else levelPosition = (((price - support) / (resistance - support)) - 0.5) * 8;
    } else if (Number.isFinite(price) && Number.isFinite(support)) {
      const distance = (price - support) / support;
      levelPosition = distance < 0 ? -10 : distance <= 0.01 ? -6 : 0;
    } else if (Number.isFinite(price) && Number.isFinite(resistance)) {
      const distance = (resistance - price) / resistance;
      levelPosition = distance < 0 ? 6 : distance <= 0.01 ? 3 : 0;
    }

    const absChange = Math.abs(changePercent);
    const volatilityPenalty = absChange >= 8 ? 10 : absChange >= 5 ? 6 : absChange >= 3 ? 2 : 0;
    const riskKey = normalizeRiskLevel(asset.riskLevel);
    const riskPenalty = SCORE_RULES.riskPenalty[riskKey];

    const raw = 50 + momentum + openTrend + rangePosition + levelPosition - volatilityPenalty - riskPenalty;
    const total = Math.round(clampNumber(raw, 0, 100));
    const classification = scoreClassification(total);
    const confidence = scoreConfidence(asset);

    return {
      available: true,
      total,
      label: classification.label,
      tone: classification.tone,
      confidence,
      snapshotId: state.snapshotId,
      scoreVersion: SCORE_VERSION,
      components: [
        { key: "momentum", label: "当日动量", value: roundOne(momentum), explanation: `${formatPercent(changePercent)} × 固定权重，最高±18分` },
        { key: "openTrend", label: "相对开盘", value: roundOne(openTrend), explanation: Number.isFinite(open) ? `较开盘 ${formatPercent(openTrendPct)}` : "缺少开盘价，记0分" },
        { key: "range", label: "日内位置", value: roundOne(rangePosition), explanation: Number.isFinite(high) && Number.isFinite(low) && high > low ? "按价格在当日高低区间的位置计算" : "缺少高低价，记0分" },
        { key: "level", label: "关键价位", value: roundOne(levelPosition), explanation: Number.isFinite(support) || Number.isFinite(resistance) ? `支撑 ${Number.isFinite(support) ? formatPrice(support) : "未设"} / 压力 ${Number.isFinite(resistance) ? formatPrice(resistance) : "未设"}` : "未设置支撑压力，记0分" },
        { key: "volatility", label: "波动扣分", value: -volatilityPenalty, explanation: `绝对涨跌幅 ${absChange.toFixed(2)}%` },
        { key: "risk", label: "静态风险扣分", value: -riskPenalty, explanation: `风险级别 ${riskKey === "high" ? "高" : riskKey === "low" ? "低" : "中"}` }
      ]
    };
  }

  function scoreClassification(total) {
    if (total >= 75) return { label: "强势但防追高", tone: "strong" };
    if (total >= 60) return { label: "偏强观察", tone: "positive" };
    if (total >= 45) return { label: "中性", tone: "neutral" };
    if (total >= 30) return { label: "偏弱观察", tone: "weak" };
    return { label: "高风险", tone: "risk" };
  }

  function scoreConfidence(asset) {
    const meta = asset.quoteMeta || {};
    const mode = String(meta.mode || "").toLowerCase();
    const origin = String(meta.origin || "").toLowerCase();
    const time = meta.lastUpdated || meta.dataDate || "";
    const age = time ? Math.max(0, Date.now() - parseTime(time)) : Number.POSITIVE_INFINITY;
    const fields = [asset.quote?.price, asset.quote?.preClose, asset.quote?.open, asset.quote?.high, asset.quote?.low]
      .filter(Number.isFinite).length;

    if (origin === "live" && mode.includes("real") && age <= 2 * 60 * 1000 && fields >= 4) {
      return { grade: "A", label: "实时完整", reason: "统一接口实时数据，时间和字段完整" };
    }
    const delayedFresh = mode.includes("delay") && age <= 30 * 60 * 1000;
    const historicalFresh = (mode.includes("histor") || mode.includes("closed")) && age <= 7 * 24 * 60 * 60 * 1000;
    if (origin === "live" && (delayedFresh || historicalFresh || age <= 30 * 60 * 1000) && fields >= 3) {
      return { grade: "B", label: "可比较", reason: "统一接口的延迟数据或最近有效收盘" };
    }
    if (origin === "cache" && age <= 48 * 60 * 60 * 1000 && fields >= 3) {
      return { grade: "C", label: "本机缓存", reason: "价格曾由真实接口返回，但当前未完成统一校验" };
    }
    return { grade: "D", label: "低可信", reason: "时间、来源或关键字段不足" };
  }

  function normalizeRiskLevel(value) {
    const text = String(value || "").toLowerCase();
    if (text.includes("高") || text.includes("high")) return "high";
    if (text.includes("低") || text.includes("low")) return "low";
    return "medium";
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.min(max, Math.max(min, number));
  }

  function roundOne(value) {
    return Math.round(Number(value || 0) * 10) / 10;
  }

  function createClientSnapshotId(bucket, items) {
    const text = items.map((item) => {
      const quote = item.quote || item;
      return [item.symbol || "", quote.price ?? quote.close ?? "", quote.preClose ?? "", item.lastUpdated || item.dataDate || "", item.source || ""].join("|");
    }).sort().join(";");
    return `cf_${stableHash(`${bucket}|${text}`)}`;
  }

  function stableHash(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function shortSnapshotId(value) {
    const text = String(value || "");
    return text.length <= 12 ? text : `${text.slice(0, 8)}…${text.slice(-4)}`;
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
      state.snapshotId = cached.snapshotId || "";
      state.snapshotGeneratedAt = cached.generatedAt || cached.savedAt || "";
      state.snapshotValidUntil = cached.validUntil || "";
      state.scoreVersion = cached.scoreVersion || SCORE_VERSION;
      state.lastSuccessAt = cached.savedAt || cached.generatedAt || "";
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
    writeJson(CACHE_KEYS.snapshot, {
      savedAt: state.lastSuccessAt,
      snapshotId: state.snapshotId,
      generatedAt: state.snapshotGeneratedAt,
      validUntil: state.snapshotValidUntil,
      scoreVersion: state.scoreVersion,
      portfolioVersion: state.portfolioVersion,
      marketStatus: state.marketStatus,
      items
    });
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

  async function requestJson(url, timeoutMs = 8000, options = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { cache: options.cache || "no-store", headers: { accept: "application/json" }, signal: controller.signal });
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

  window.__PORTFOLIO_DASHBOARD__ = Object.freeze({
    scoreVersion: SCORE_VERSION,
    scoreAsset,
    createClientSnapshotId,
    getState: () => ({
      snapshotId: state.snapshotId,
      portfolioVersion: state.portfolioVersion,
      scoreVersion: state.scoreVersion
    })
  });
})();
