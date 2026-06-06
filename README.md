# 每日持仓晨报工作台

这是一个移动端优先的个人股票/基金行情与决策工作台。前端保持静态页面体验，真实行情和新闻通过 Vercel Serverless Functions 提供，不使用 Cloudflare。

## 文件结构

- `index.html`：页面结构。
- `styles.css`：移动端金融工作台样式。
- `app.js`：前端渲染、交互、行情刷新、新闻刷新和图表逻辑。
- `report-data.js`：持仓、观察池、策略和页面基础数据。
- `vendor/lightweight-charts.standalone.production.js`：本地图表库。
- `api/*.js`：Vercel Serverless API Routes。
- `dataProviders/*.js`：新浪、腾讯、东方财富、新闻源和统一 fallback 适配器。
- `config/newsSources.json`：真实新闻源配置，当前接入东方财富搜索和 Google News RSS 备用源。
- `vercel.json`：Vercel 免费部署配置，当前指定 `iad1`，因为线上测试中亚洲区域访问东方财富历史 K 线超时。
- `.nojekyll`：GitHub Pages 兼容文件。

## 部署方式

推荐直接部署到 Vercel，这样前端和 `/api` 同源：

```bash
npx vercel --prod
```

当前继续使用 Vercel 免费方案；线上测试发现亚洲区域访问东方财富历史 K 线容易超时，所以当前函数区域先放在 `iad1`，优先保证真实 K 线能返回。如果大陆访问仍然不稳定，可以迁移到腾讯云 EdgeOne Pages：前端文件可直接迁移，`api/*.js` 需要改成 EdgeOne Functions/Pages Functions 的请求处理格式，`dataProviders/*.js` 可以复用。

如果继续使用 GitHub Pages 托管前端，需要先把本项目部署到 Vercel，然后在 `report-data.js` 中设置：

```js
apiBase: "https://你的-vercel-项目域名"
```

如果前端也在 Vercel，保持：

```js
apiBase: ""
```

## API

前端只请求本项目接口，不直接裸调第三方行情或新闻源：

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

Vercel Hobby 会把 `api/**/*.js` 都算作 Serverless Function，所以 provider 不放在 `api/providers`，而是放在 `dataProviders/`，避免超出免费额度函数数量限制。

## 数据规则

真实行情字段必须来自上游接口：最新价、昨收、开盘、最高、最低、涨跌额、涨跌幅、成交量、成交额、更新时间、分时和日 K。

真实新闻通过 `/api/news` 获取。接口读取 `config/newsSources.json` 中配置的公开新闻源。没有真实新闻时返回空列表或明确错误，不生成假新闻。

如果所有真实接口失败，API 返回 `ok:false`。前端显示真实行情暂不可用；如果浏览器里有最后一次成功获取的真实数据，则显示缓存数据和缓存时间。页面不会生成假价格、假涨跌幅或假 K 线。

## 数据源优先级

- 股票搜索：东方财富搜索优先，本地持仓表兜底。
- 实时行情：东方财富 -> 新浪 -> 腾讯。
- 分时数据：东方财富 -> 新浪 -> 腾讯。
- K 线数据：东方财富 -> 新浪 -> 腾讯。
- 新闻数据：东方财富财经搜索 -> Google News RSS。

普通开放式基金不显示伪实时分时或伪 K 线；未接入真实净值接口时显示失败状态。

## 使用提醒

页面中的预测评分和操作建议只用于个人复盘参考，不能替代券商 App 的真实成交价格、可用资金、可卖数量和交易确认。

## 免费方案限制

- Vercel 免费额度适合个人低频使用，不适合全市场扫描。
- 服务端缓存是 Serverless 实例内存缓存，冷启动后可能失效；前端会再使用浏览器 localStorage 缓存最后一次真实数据。
- 免费公开数据源可能延迟、限频或临时不可用；接口失败时只显示缓存或错误，不生成假数据。
- 普通开放式基金暂不伪造盘中行情，只能接入真实净值接口后展示。
