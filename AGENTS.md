# 项目协作总纲

本文件是 Codex 参与本项目时的总入口。它只定义项目边界、规则路由、质量门禁和安全底线；具体做法必须读取对应的 `rules/` 文档。

## 1. 项目对象与目录边界

本项目是原型浏览工具，承载原型、主题、文档的预览、切换、批注和评审。

默认设计场景为 **Windows 游戏陪玩平台客户端**，业务原型默认使用 PC 模式和 **1920×1080 CSS 像素**画布。工作台只等比缩小显示画布，不改变原型布局尺寸；用户明确指定移动端或 Web 时按指定平台设计，原有双端预览能力保留。窗口标题栏等客户端元素属于业务原型，是否需要由页面需求决定。

| 对象 | 判定标准 | 代码位置 |
| --- | --- | --- |
| 原型浏览工具 | 预览外壳、路由、侧边栏、批注、快捷键、Figma 复制 | `tools/` |
| 前端原型 | 面向终端用户的业务页面或流程 | `src/prototypes/<name>/` |
| 后台原型 | 面向运营、管理员或内部员工的业务页面或流程 | `src/prototypes/<name>/` |
| 项目文档与内容 | PRD、SPEC、主题、默认数据和项目资料 | `src/docs/`、`src/themes/`、`src/resources/` |
| 部署运行时 | Worker、Static Assets 和 KV 配置 | `worker/`、`wrangler.jsonc` |

后台原型仍然是业务内容，不得因为使用表格、图表或管理端布局而放入 `tools/`。新增功能前先写明：

```text
对象类型：原型浏览工具 / 前端原型 / 后台原型
内容位置：src/prototypes/<name>/（业务原型）或 tools/<directory>/（浏览工具）
路由分类：frontend / admin（仅业务原型需要）
```

工具层中的 `tools/hooks/` 是 React Hook；仓库级 Git Hook 位于 `.githooks/`，两者不可混用。

## 2. 开始任务时的规则路由

按以下顺序读取上下文：

1. 根目录 `AGENTS.md`、`CONTEXT.md` 和 `README.md`。
2. 按修改范围读取对应规则：

   | 修改内容 | 必读规则 |
   | --- | --- |
   | 目录归属、跨层引用、动态导入 | `rules/architecture-guide.md` |
   | 原型页面、状态、路由、组件、主题 | `rules/prototype-development-guide.md`、`skills/prototype-design/SKILL.md`、对应专题规则 |
   | 调试、视觉或交互问题 | `rules/debugging-guide.md`、`rules/design-guide.md` |
   | PRD、SPEC 和文档交接 | `rules/requirements-alignment-guide.md`、`rules/documentation-guide.md` |
   | Worker、KV、Cloudflare 或批注 API | `rules/cloudflare-deployment-guide.md` |
   | 检查命令、提交和推送 | `rules/quality-gates-guide.md`、`rules/git-hooks-guide.md` |

3. 涉及业务内容时，再读取目标原型的 PRD、SPEC、主题和补充模型文档。

规则优先级为：用户明确要求 > 本文件 > 对应 `rules/` > PRD/SPEC/README 中的事实约束 > 现有代码。文档冲突或事实不明确时标记“待确认”，不要从 mock 数据自行推断生产逻辑。

## 3. 变更与验收门禁

详细检查矩阵以 `rules/quality-gates-guide.md` 为准。最低要求如下：

- 代码变更：`npm run lint`、`npm run build`。
- 业务原型和交接文档：额外运行 `npm run check:docs`，并对目标页面做预览验收。
- Worker 或 `wrangler.jsonc`：额外执行 Wrangler dry-run；涉及批注读写时使用本地 KV 验证回退、GET 和 POST。
- 工具层交互：必须验证核心路径、弹层定位、滚动、响应式和 Console；涉及画布时还要检查 1920×1080 布局尺寸、等比缩放、批注标记和选中框定位。浏览器验收不能被 Git Hook 替代。

Hook 只执行确定性的命令，不自动格式化、修改源文件、写入批注、访问远程 KV 或发布生产环境。Git Hook 失败时先修复问题；`--no-verify` 只用于明确记录原因的紧急情况。

## 4. 内容、工具与部署安全边界

- `src/` 只放业务原型、主题、文档、内容配置和通用 UI；`tools/` 只放原型浏览工具。
- 内容层不得反向 import `tools/`；跨层引用使用 `@/` 和 `@tools/` alias。
- 生产批注 API 使用 `ANNOTATIONS_KV` 和 `annotations` Key，具体 Worker、Assets、KV 和本地验证规则见 `rules/cloudflare-deployment-guide.md`。
- 当前批注 API 没有用户身份校验、租户隔离或敏感数据保护。不得在文档或回复中暗示它已经具备这些能力。
- `skills/` 是任务方法和辅助流程，不是项目事实来源；项目规范仍以本文件、`rules/`、PRD/SPEC 为准。

## 5. Git 与交付边界

- 默认不自动 commit、push、创建分支、合并或发布。
- 只有用户明确授权时才执行 commit 或 push；执行前确认当前分支、远端和待提交文件。
- 提交前应确认工作区中已有的用户改动，避免把无关改动带入本次提交。
- 完成任务时说明修改结果、验证命令、未解决风险和是否提交/推送。

## 6. 回复要求

使用用户能理解的中文说明结果；如需用户验收，提供页面路径、预览地址或截图位置。每次回复结尾带上 `🐱喵`。
