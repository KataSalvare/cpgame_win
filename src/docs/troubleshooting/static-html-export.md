# 客户端内容层单文件 HTML 导出

## 适用范围

导出 `src/prototypes/game-companion-client/` 中的客户端内容层供独立预览。不要以 `src/main.tsx` 或 `tools/App.tsx` 为入口，否则会带入工作台、导航、批注和工具层样式。用临时入口直接挂载 `GameCompanionClient`，通过 `MemoryRouter` 提供路由上下文，并传入 `entryView="home"`。

临时入口只引入 React、客户端原型、灰阶主题调色板和必要的样式。Tailwind 扫描范围限定为客户端原型、`previewState.ts`、`WindowsClient` 公共 UI 和 `src/lib`。构建临时文件应在导出后清理，不能留在项目源码或纳入提交。

## 构建和内嵌

使用隔离的 Vite 配置，仅启用 React 和 Tailwind 插件，保留 `@` 指向 `src/` 的别名。设置相对资源基址、`assetsInlineLimit`（当前用 20 MB）、`cssCodeSplit: false` 和 IIFE 输出。Tailwind CSS、客户端样式、主题、字体、图片、音频和动画素材需要随最终 HTML 内嵌；产物最终只保留 HTML 文件，不能引用 `assets/` 下的旁置文件。

构建后将 CSS 放入 `<style>`，将 JS 放入普通 `<script>`，并把脚本放在 `<div id="root"></div>` 之后。内嵌普通脚本的 `defer` 属性不会延后执行：放在 `<head>` 会在根节点创建前运行 `createRoot`，产生白屏。最终 HTML 不应有 `type="module"` 或外部 JS/CSS 资源标签。

## 已知白屏根因

客户端礼物动画素材 `src/prototypes/game-companion-client/components/GiftAnimation.tsx` 使用 `new URL('../assets/gift-sports-car.svga', import.meta.url)`。IIFE 构建会把 `import.meta` 清空；当首页触发该代码时，浏览器报 `TypeError: Invalid base URL`，React 未能渲染。隔离 Vite 配置需定义：

```ts
define: { 'import.meta.url': 'window.location.href' }
```

不能只看构建成功或 HTML 标题判断导出成功。页面应在浏览器中实际渲染，并确认控制台没有该基址错误。

## 验证与交付

1. 检查最终 HTML 中根节点位于脚本之前，JS/CSS/字体和内容素材都已内嵌，且没有外部资源路径。
2. 从 HTML 提取内嵌 JS 后运行 `node --check`。
3. 用本地 HTTP 服务打开最终文件，确认首页、俱乐部卡片和辅助导航有实际内容；检查运行时错误。
4. 如果自动化浏览器不允许 `file://`，HTTP 预览只能证明页面运行，不代表已直接验证双击打开。此时同时确认最终 HTML 没有外部模块或文件引用；交付时说明此环境限制。

过去的 `/output/win_html/` 在本机环境中不存在或不可写。不能声称已写入该路径；应将文件交付在确实可写的位置，并明确告知实际路径。
