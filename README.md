# 每日持仓简报网页

打开 `index.html` 即可查看本地简报页面。页面不依赖外部 CDN、国外脚本或在线字体。

## 文件说明

- `index.html`: 页面结构。
- `styles.css`: 本地样式。
- `app.js`: 本地渲染逻辑。
- `report-data.js`: 每日简报数据。自动化每天更新这个文件即可刷新页面内容。
- `vendor/lightweight-charts.standalone.production.js`: 本地行情图表库，避免页面运行时依赖外部 CDN。
- `api-proxy/cloudflare-worker.js`: 免费后端代理示例，可部署到 Cloudflare Worker 后给前端提供 `/api/search`、`/api/quote`、`/api/kline`、`/api/news`。
- `.nojekyll`: GitHub Pages 使用，避免静态文件被 Jekyll 处理。

## 使用方式

1. 本地双击 `index.html` 打开。
2. 部署到 GitHub Pages 后，手机打开固定 Pages 链接。
3. 每天自动化更新 `report-data.js` 并推送后，刷新浏览器即可看到最新简报。
4. 未配置代理时，页面明确显示“暂无真实数据 / 行情获取失败”，不会生成假价格。
5. 部署代理后，在 `report-data.js` 设置 `apiBase: "https://你的-worker域名"`，页面会请求自己的 API，再由代理请求真实行情源。
6. 实际交易前仍以券商 App 实时价格、可用资金和可卖数量为准。
