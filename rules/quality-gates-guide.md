# 质量门禁指南

本文件把项目质量要求映射为可执行检查。Git Hook 负责本地提交边界，浏览器和视觉验收仍由任务流程完成。

## 1. 修改范围与检查矩阵

| 修改范围 | 必做检查 | 额外验收 |
| --- | --- | --- |
| `tools/` | `npm run lint`、`npm run build` | 打开目标路径，走通核心交互，检查 Console 和弹层定位 |
| `src/prototypes/` | `npm run lint`、`npm run build`、`npm run check:docs` | 运行目标原型验收脚本，检查主要 viewport 和状态 |
| `src/docs/`、PRD、SPEC | `npm run check:docs` | 检查需求、状态、mock 边界和验收编号 |
| `worker/`、`wrangler.jsonc` | `npm run lint`、`npm run build`、`npx wrangler deploy --dry-run` | 使用本地 Wrangler KV 验证默认回退、GET、合法 POST 和非法请求 |
| `rules/`、`AGENTS.md`、脚本 | 运行受影响的 npm 检查 | 检查命令、路径、规则引用与当前目录结构一致 |

如果一次修改跨越多个范围，取所有范围的检查并集。检查失败时先处理构建、启动和运行时错误，再处理交互和视觉问题。

## 2. 命令职责

- `npm run lint`：检查 TypeScript、React Hook 和代码规范，不自动修改文件。
- `npm run build`：执行 TypeScript 构建检查和 Vite 生产构建。
- `npm run check:docs`：校验 PRD、SPEC 和补充模型的交接完整性。
- `node scripts/check-app-ready.mjs <path>`：启动或连接开发服务并做页面可达性检查，仅用于任务验收，不用于 Git Hook。
- `npx wrangler deploy --dry-run`：只验证 Worker、Assets 和绑定配置，不发布生产环境。

## 3. 运行时验收边界

浏览器验收至少覆盖：

1. 目标页面可以打开，首屏和需要滚动的内容都可访问。
2. 目标交互可以完成，包含加载、空状态、错误状态和关闭/返回路径。
3. 批注、弹窗、抽屉和浮层不被 viewport、侧栏或右侧抽屉遮挡。
4. Console 没有新增错误，Network 没有异常 API 响应。
5. 动效在普通模式和 reduced-motion 模式下都可用。

`check-app-ready.mjs` 会自行启动 Vite；项目固定使用 1025 端口时，不要在已有开发服务运行的情况下重复启动它。

## 4. 通过标准

只有必做命令全部成功、目标交互完成且没有新增 Console 错误，才能报告“已验证”。构建输出中的体积 warning 需要记录，但不会在没有明确阈值时被误报为功能失败。
