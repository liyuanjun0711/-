const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const remoteUrl = process.argv[2] || "";
const localPort = 42000 + (process.pid % 1000);
const baseUrl = remoteUrl || `http://127.0.0.1:${localPort}/`;
const projectRoot = process.cwd();
const profileDir = path.join(os.tmpdir(), `daily-briefing-edge-qa-${process.pid}`);
const debugPort = 44000 + (process.pid % 1000);
fs.mkdirSync(profileDir, { recursive: true });

const edge = spawn(edgePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${debugPort}`,
  "--disable-features=msEdgeFirstRunExperience",
  `--user-data-dir=${profileDir}`,
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });
let edgeStderr = "";
let edgeExit = null;
edge.stderr.on("data", (chunk) => { edgeStderr += chunk.toString(); });
edge.on("exit", (code, signal) => { edgeExit = { code, signal }; });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let qaStage = "startup";
const watchdog = setTimeout(() => {
  console.error(`browser QA watchdog timeout at stage: ${qaStage}`);
  edge.kill();
  server?.close();
  process.exit(2);
}, 150_000);

const server = remoteUrl ? null : http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, baseUrl).pathname);
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(projectRoot, requested);
  if (!filePath.startsWith(projectRoot)) {
    response.writeHead(403);
    response.end("forbidden");
    return;
  }
  fs.readFile(filePath, (error, body) => {
    if (error) {
      response.writeHead(404);
      response.end("not found");
      return;
    }
    const contentType = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8"
    }[path.extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    response.end(body);
  });
});

async function waitFor(predicate, timeoutMs, label) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const value = await predicate();
      if (value) return value;
    } catch (_) {}
    await sleep(100);
  }
  throw new Error(`timeout waiting for ${label}`);
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.socket = new WebSocket(url);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      } else if (message.method) {
        this.events.push(message);
      }
    });
  }

  async ready() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(client, expression, awaitPromise = true) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
    userGesture: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "evaluation failed");
  return result.result.value;
}

async function inspectViewport(client, width, height, label) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 640
  });
  await client.send("Page.reload", { ignoreCache: true });
  await waitFor(async () => evaluate(client, "document.readyState === 'complete' && Boolean(window.MARKET_BRIEFING_DATA)"), 10000, `${label} load`);
  await sleep(1200);

  const summary = await evaluate(client, `(() => {
    const tabs = [...document.querySelectorAll('.segment [data-view], .tabbar [data-view]')];
    const tabResults = tabs.map((button) => {
      button.click();
      return {
        view: button.dataset.view,
        active: button.classList.contains('active'),
        title: document.querySelector('main h1, main h2, [data-current-view-title]')?.textContent?.trim() || ''
      };
    });
    document.querySelector('[data-view="action"]')?.click();
    const feeCardCount = document.querySelectorAll('#transaction-costs .compact-item').length;
    document.querySelector('[data-view="quote"]')?.click();
    return {
      label: ${JSON.stringify(label)},
      version: window.MARKET_BRIEFING_DATA.portfolioVersion,
      date: window.MARKET_BRIEFING_DATA.date,
      viewport: [innerWidth, innerHeight],
      scrollWidth: document.documentElement.scrollWidth,
      overflowX: document.documentElement.scrollWidth > innerWidth,
      tabCount: tabs.length,
      stickyNavCount: document.querySelectorAll('.tabbar, .segment').length,
      bottomNavCount: document.querySelectorAll('.bottom-nav, .bottomNav, #bottomNav, #footerTabs, #mobileTabs').length,
      tabResults,
      feeCardCount,
      firstScreen: window.MARKET_BRIEFING_DATA.oneLine.includes('仅供个人复盘参考') && window.MARKET_BRIEFING_DATA.tradeDecision[0].title.includes('0买0卖'),
      replacementChar: document.body.innerText.includes('\uFFFD')
    };
  })()`);

  const exchangeDetail = await evaluate(client, `(async () => {
    const row = document.querySelector('.asset-row[data-symbol="SZ159740"]');
    if (!row) return { opened: false, reason: 'exchange row missing' };
    row.click();
    for (let attempt = 0; attempt < 70; attempt += 1) {
      const canvases = document.querySelectorAll('#detailChartHost canvas').length;
      const message = document.querySelector('#detailChartHost .chart-message')?.textContent?.trim() || '';
      if (canvases > 0 || (message && !message.includes('正在加载'))) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const drawer = document.querySelector('.detail-drawer');
    const dailyCanvasCount = document.querySelectorAll('#detailChartHost canvas').length;
    document.querySelector('[data-action="detail-period"][data-period="intraday"]')?.click();
    for (let attempt = 0; attempt < 70; attempt += 1) {
      const labels = document.querySelectorAll('.intraday-axis-guide span').length;
      const message = document.querySelector('#detailChartHost .chart-message')?.textContent?.trim();
      if (labels === 6 || message) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return {
      opened: Boolean(drawer),
      periodButtons: document.querySelectorAll('[data-action="detail-period"]').length,
      dailyCanvasCount,
      canvasCount: document.querySelectorAll('#detailChartHost canvas').length,
      intradayLabels: [...document.querySelectorAll('.intraday-axis-guide span')].map((item) => item.textContent.trim()),
      message: document.querySelector('#detailChartHost .chart-message')?.textContent?.trim() || ''
    };
  })()`);
  await evaluate(client, "document.querySelector('[data-action=\"close-detail\"]')?.click()");

  const openFundDetail = await evaluate(client, `(async () => {
    document.querySelector('[data-view="quote"]')?.click();
    const row = document.querySelector('.asset-row[data-symbol="OF005827"], [data-action="open-detail"][data-symbol="OF005827"]');
    if (!row) return { opened: false, reason: 'open-fund row missing' };
    row.click();
    for (let attempt = 0; attempt < 70; attempt += 1) {
      const text = document.querySelector('.detail-drawer')?.innerText || '';
      if (text.includes('开放式基金按净值披露，不提供盘中K线') || text.includes('行情获取失败')) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return {
      opened: Boolean(document.querySelector('.detail-drawer')),
      periodButtons: document.querySelectorAll('[data-action="detail-period"]').length,
      canvasCount: document.querySelectorAll('#detailChartHost canvas').length,
      text: document.querySelector('.detail-drawer')?.innerText || ''
    };
  })()`);
  await evaluate(client, "document.querySelector('[data-action=\"close-detail\"]')?.click()");

  return { ...summary, exchangeDetail, openFundDetail };
}

(async () => {
  let client;
  try {
    if (server) {
      qaStage = "local-server";
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(localPort, "127.0.0.1", resolve);
      });
    }
    qaStage = "edge-target";
    const targets = await waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      const rows = await response.json();
      return rows.some((row) => row.type === "page") ? rows : null;
    }, 10000, "page target");
    const target = targets.find((row) => row.type === "page");
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.ready();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Log.enable");
    await client.send("Page.navigate", { url: baseUrl });
    await waitFor(async () => evaluate(client, "location.protocol === 'http:' || location.protocol === 'https:'"), 10000, "page navigation");

    qaStage = "desktop";
    const desktop = await inspectViewport(client, 1440, 1000, "desktop");
    console.error("browser QA desktop complete");
    qaStage = "mobile";
    const mobile = await inspectViewport(client, 390, 844, "mobile");
    const runtimeErrors = client.events.filter((event) =>
      event.method === "Runtime.exceptionThrown" ||
      (event.method === "Runtime.consoleAPICalled" && event.params?.type === "error")
    );
    const networkErrors = client.events.filter((event) => event.method === "Log.entryAdded" && event.params?.entry?.level === "error");
    console.log(JSON.stringify({
      desktop,
      mobile,
      pageErrors: runtimeErrors.length,
      expectedNetworkFailures: networkErrors.map((event) => event.params.entry.text)
    }, null, 2));

    const expectedAxis = ["09:30", "10:30", "11:30", "13:00", "14:00", "15:00"];
    for (const result of [desktop, mobile]) {
      if (result.version !== "portfolio-2026-11-09-midday-fee-aware-v1") throw new Error(`${result.label} version mismatch`);
      if (result.tabCount !== 4 || result.bottomNavCount !== 0 || result.overflowX) throw new Error(`${result.label} navigation or overflow regression`);
      if (!result.tabResults.every((item) => item.active)) throw new Error(`${result.label} tab click regression`);
      if (!result.firstScreen || result.replacementChar) throw new Error(`${result.label} first-screen or encoding regression`);
      if (!result.exchangeDetail.opened) throw new Error(`${result.label} exchange detail did not open`);
      if (result.exchangeDetail.dailyCanvasCount === 0 && result.exchangeDetail.canvasCount === 0 && !result.exchangeDetail.message) throw new Error(`${result.label} exchange chart has neither real chart nor explicit failure`);
      if (result.exchangeDetail.canvasCount > 0 && JSON.stringify(result.exchangeDetail.intradayLabels) !== JSON.stringify(expectedAxis)) throw new Error(`${result.label} intraday labels mismatch`);
      if (result.exchangeDetail.canvasCount === 0 && /正在加载/.test(result.exchangeDetail.message)) throw new Error(`${result.label} exchange chart did not settle within 7 seconds`);
      if (!result.openFundDetail.opened || result.openFundDetail.periodButtons !== 0 || result.openFundDetail.canvasCount !== 0) throw new Error(`${result.label} open-fund chart controls must be absent`);
      if (!result.openFundDetail.text.includes("开放式基金按净值披露，不提供盘中K线")) throw new Error(`${result.label} open-fund disclosure missing`);
    }
    if (runtimeErrors.length) throw new Error(`page errors: ${JSON.stringify(runtimeErrors)}`);

  } finally {
    clearTimeout(watchdog);
    client?.close();
    edge.kill();
    server?.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  console.error(JSON.stringify({ edgeExit, edgeStderr }, null, 2));
  process.exitCode = 1;
});
