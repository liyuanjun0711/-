# 每日持仓简报网页

打开 `index.html` 即可查看本地简报页面。页面不依赖外部 CDN、国外脚本或在线字体。

## 文件说明

- `index.html`: 页面结构。
- `styles.css`: 本地样式。
- `app.js`: 本地渲染逻辑。
- `report-data.js`: 每日简报数据。自动化每天更新这个文件即可刷新页面内容。
- `.nojekyll`: GitHub Pages 使用，避免静态文件被 Jekyll 处理。

## 使用方式

1. 本地双击 `index.html` 打开。
2. 部署到 GitHub Pages 后，手机打开固定 Pages 链接。
3. 每天自动化更新 `report-data.js` 并推送后，刷新浏览器即可看到最新简报。
4. 实际交易前仍以东方财富实时价格、可用资金和可卖数量为准。
