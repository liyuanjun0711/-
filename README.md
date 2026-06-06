# 每日持仓晨报工作台

这是一个移动端优先的个人股票/基金行情与决策工作台。前端保持静态页面体验，真实行情通过 Vercel Serverless Functions 提供，不使用 Cloudflare。

## 文件结构

- `index.html`：页面结构。
- `styles.css`：移动端金融工作台样式。
- `app.js`：前端渲染、交互、行情刷新和图表逻辑。
- `report-data.js`：持仓、观察池、策略和页面基础数据。
- `vendor/lightweight-charts.standalone.production.js`：本地图表库。
- `api/*.js`：Vercel Serverless API。
- `lib/providers/*.js`：新浪、腾讯、东方财富行情源适配器。
- `.nojekyll`：GitHub Pages 兼容文件。

## 部署方式

推荐直接部署到 Vercel，这样前端和 `/api` 同源：

```bash
npx vercel --prod
```

如果继续使用 GitHub Pages 托管前端，需要先把本项目部署到 Vercel，然后在 `report-data.js` 中设置：

```js
apiBase: "https://你的-vercel-项目域名"
```

如果前端也在 Vercel，保持：

```js
apiBase: ""
```

## 行情 API

前端只请求自己的接口，不直接裸调第三方行情源：

- `/api/search`
- `/api/quote`
- `/api/intraday`
- `/api/kline`
- `/api/history`
- `/api/trading-days`
- `/api/market-status`
- `/api/last-trading-day`
- `/api/daily-summary`
- `/api/last-valid-quote`
- `/api/fund`
- `/api/news`

真实行情字段必须来自上游接口：最新价、昨收、开盘、最高、最低、涨跌额、涨跌幅、成交量、成交额、更新时间、分时、日K。

如果所有真实接口失败，API 返回 `ok:false`，前端显示“真实行情暂不可用”。如果本机浏览器有最后一次成功获取的真实数据，则显示“使用最后一次真实数据”。页面不会生成假价格、假涨跌幅或假K线。

## 数据源优先级

- 实时行情：新浪 → 腾讯 → 东方财富。
- 分时数据：东方财富 → 新浪 → 腾讯。
- K线数据：东方财富 → 新浪 → 腾讯。

普通开放式基金不显示伪实时分时或伪K线；未接入真实净值接口时显示失败状态。

## 使用提醒

页面中的预测评分和操作建议只用于个人复盘参考，不能替代券商 App 的实时成交价格、可用资金、可卖数量和真实交易确认。
