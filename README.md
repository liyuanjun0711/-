# 每日持仓简报网页

打开 `index.html` 即可查看本地简报页面。页面不依赖外部 CDN、国外脚本或在线字体。

## 文件说明

- `index.html`: 页面结构。
- `styles.css`: 本地样式。
- `app.js`: 本地渲染逻辑。
- `report-data.js`: 每日简报数据。自动化每天更新这个文件即可刷新页面内容。
- `vendor/lightweight-charts.standalone.production.js`: 本地行情图表库，避免页面运行时依赖外部 CDN。
- `api-proxy/cloudflare-worker.js`: Cloudflare Worker 行情代理，可部署后给前端提供 `/api/search`、`/api/quote`、`/api/intraday`、`/api/kline`、`/api/news`。
- `.nojekyll`: GitHub Pages 使用，避免静态文件被 Jekyll 处理。

## 使用方式

1. 本地双击 `index.html` 打开。
2. 部署到 GitHub Pages 后，手机打开固定 Pages 链接。
3. 每天自动化更新 `report-data.js` 并推送后，刷新浏览器即可看到最新简报。
4. 未配置代理时，页面明确显示“暂无真实数据 / 行情获取失败”，不会生成假价格。
5. 部署代理后，在 `report-data.js` 设置 `apiBase: "https://你的-worker域名"`，页面会请求自己的 API，再由代理请求真实行情源。
6. 实际交易前仍以券商 App 实时价格、可用资金和可卖数量为准。

## 行情代理接口

前端只请求自己的代理接口，不直接请求第三方行情源。代理应提供：

- `/api/search`
- `/api/market-status`
- `/api/last-trading-day`
- `/api/quote`
- `/api/intraday`
- `/api/kline`
- `/api/daily-summary`
- `/api/last-valid-quote`
- `/api/fund`
- `/api/news`

Worker 内部按顺序尝试东方财富、 新浪财经、腾讯财经。所有价格、涨跌幅、昨收、开盘、最高、最低、成交量、成交额、分时和K线都必须来自真实接口。

如果代理或上游行情源不可用，接口会返回 `ok:false` 和错误信息；前端会显示“真实行情暂不可用”，如本机浏览器里有最后一次成功缓存，则显示“使用最后一次真实数据”，不会生成价格或K线。

部署后把 `report-data.js` 里的 `apiBase` 改成 Worker 地址，例如：

```js
apiBase: "https://morning-post-market-api.your-subdomain.workers.dev"
```
