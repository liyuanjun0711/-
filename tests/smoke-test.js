const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const checks = [
  {
    name: "index has app mount points",
    pass: () => {
      const html = read("index.html");
      return html.includes('id="appRoot"') && html.includes('id="detailRoot"') && html.includes('id="refreshAll"');
    }
  },
  {
    name: "app uses batch quote refresh and lazy details",
    pass: () => {
      const js = read("app.js");
      return js.includes("/api/quote?symbols=") && js.includes("/api/intraday") && js.includes("/api/kline");
    }
  },
  {
    name: "quote api supports batch symbols",
    pass: () => {
      const api = read("api/quote.js");
      return api.includes("req.query?.symbols") && api.includes("MAX_BATCH_SIZE") && api.includes("failed");
    }
  },
  {
    name: "no fake market data generators",
    pass: () => {
      const haystack = [read("app.js"), read("api/quote.js")].join("\n");
      return !/Math\.random|mockQuote|mockKline|mockNews|price\s*[+\-]=|fake quote|fake kline/i.test(haystack);
    }
  },
  {
    name: "A-share color direction is present",
    pass: () => {
      const css = read("styles.css");
      return css.includes("--up:") && css.includes("--down:") && css.includes(".asset-change.up") && css.includes(".asset-change.down");
    }
  }
];

let failed = 0;
for (const check of checks) {
  const ok = Boolean(check.pass());
  console.log(`${ok ? "PASS" : "FAIL"} ${check.name}`);
  if (!ok) failed += 1;
}

if (failed) process.exit(1);
