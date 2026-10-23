# 产品原型预览系统

产品原型预览工作台，用于集中预览、切换、批注和展示前端原型与后台原型，同时管理主题和项目文档。

当前默认设计场景是 **Windows 游戏陪玩平台客户端**。业务原型默认打开 PC 预览，使用 **1920×1080 CSS 像素**布局容器；工作台按可用空间等比缩小、居中显示，最大为 100%。缩放只影响显示比例，不改变原型的布局尺寸；收起侧边栏、打开文档面板和调整窗口大小时会自动重新适配。

顶部工具栏保留移动端 / PC 切换，移动端预览仍为 400×852；手动选择的模式在本次浏览期间保留，刷新后默认回到 PC。移动端和 Web 需求仍按明确指定的平台设计。项目首页、文档和主题浏览继续使用工作区可用尺寸。

原型画布是 DOM 容器，浏览器媒体查询及 `vw` / `vh` 仍以浏览器窗口为准。编写固定画布页面时，应使用父容器尺寸布局，详见 `rules/prototype-development-guide.md`。

## 适用范围

项目包含三类内容：

| 内容类型 | 用途 | 修改位置 |
| --- | --- | --- |
| 原型浏览工具 | 预览外壳、侧边栏、顶部栏、批注、快捷键和 Figma 复制 | `tools/` |
| 前端原型 | 面向终端用户的业务页面 | `src/prototypes/` |
| 后台原型 | 面向运营、管理员或内部员工的业务页面 | `src/prototypes/` |

后台原型仍属于业务内容，不能放入 `tools/`。只有服务于原型预览工作台本身的功能才放入 `tools/`。

## 快速开始

需要 Node.js 和 npm。

1. 在项目根目录安装依赖：`npm install`。
2. 启动本地开发服务：`npm run dev`。
3. 打开 `http://localhost:1045` 预览项目。
4. 构建生产版本：`npm run build`。
5. 预览生产构建：`npm run preview`。

`npm run preview` 只检查 Vite 生成的静态页面，不会完整验证 Cloudflare Worker、批注 API 或 KV。修改 Worker 或部署配置时，应使用 Wrangler 做额外验证。

## Git Hooks

执行 `npm install` 后，项目会自动启用版本化的 `.githooks/`：

- `pre-commit`：运行 `npm run lint`。
- `pre-push`：运行 `npm run verify:push`，检查 lint、build 和文档交接；如果本次推送涉及 Worker 或 `wrangler.jsonc`，还会运行 Wrangler dry-run。

Hook 的详细行为、安全边界和故障处理见 [`rules/git-hooks-guide.md`](rules/git-hooks-guide.md)。Hook 不会自动修改源码、写入批注、访问远程 KV 或发布生产环境。

## 如何修改原型

### 新增原型

1. 在 `src/prototypes/` 下创建原型目录。
2. 在该目录中创建入口文件 `index.tsx`。
3. 在 `tools/config/pages.ts` 中登记原型目录、访问路径、显示名称和分类。
4. 如果原型需要产品说明，在同一目录增加 `spec.md`。
5. 启动开发服务，确认页面可以通过登记的路径访问。

前端原型和后台原型都按照真实产品页面维护。页面主体放在 `src/prototypes/`，预览控制、批注和调试能力放在 `tools/`。

### 修改已有原型

直接修改对应的 `src/prototypes/<name>/` 目录。页面入口负责组装页面，展示内容和交互逻辑应尽量分开维护。

原型专属素材放在原型目录的 `assets/` 中。多个原型共用的内容层样式放在 `src/prototypes/` 下的公共样式文件中，样式选择器使用 `prototype-` 命名空间。

### 修改原型路由

原型路由统一在 `tools/config/pages.ts` 配置。修改路由时同步检查目录名、访问路径、中文名称和分类是否一致。

## 如何修改主题

主题位于 `src/themes/<theme-key>/`。修改主题时，按以下入口处理：

- `theme.json`：主题名称、标识和基础配置。
- `DESIGN.md`：设计规范和主题说明。
- `style.css`、`tw.css`：主题样式。
- `assets/`：主题预览图和其他素材。

主题列表会根据 `src/themes/` 中的内容自动读取。新增主题后，确认目录中包含必要的主题配置和预览入口。

## 如何修改项目文档

项目文档放在 `src/docs/`，使用 Markdown 编写。新增或修改文档后，刷新文档页面即可检查结果。

可复用的文档模板位于 `src/docs/templates/`。文档内容应记录产品目标、页面说明、业务规则或交互约束，不要把临时调试信息写入正式文档。

## 批注配置与使用

批注属于原型浏览工具能力，相关代码位于 `tools/`，默认批注数据位于 `src/resources/annotations.json`。

在页面中新增、修改或删除批注后，内容会先保存在浏览器草稿中；点击工具栏的保存操作后，才会写入持久化数据。

### 本地开发

运行 `npm run dev` 时，Vite 会通过 `/api/annotations` 读取和写入 `src/resources/annotations.json`。本地修改默认会影响该文件，请在提交前确认数据内容。

### Cloudflare 部署

生产环境使用 Cloudflare Worker、Static Assets 和 Workers KV。Worker 入口、Assets 路由、`ANNOTATIONS_KV` 绑定、`/api/annotations` 数据行为、本地 KV 验证和生产部署流程统一维护在 [`rules/cloudflare-deployment-guide.md`](rules/cloudflare-deployment-guide.md)。

部署前至少执行 `npm run build` 和 `npx wrangler deploy --dry-run`；只有用户明确授权后才执行正式部署。

## 修改边界

修改前先根据内容类型选择目录：

| 需要修改的内容 | 修改位置 |
| --- | --- |
| 页面、业务内容和原型素材 | `src/` |
| 预览外壳、批注、快捷键和工具栏 | `tools/` |
| 原型访问路径和分类 | `tools/config/pages.ts` |
| 默认批注数据 | `src/resources/annotations.json` |
| Worker、KV 和 Static Assets 部署配置 | `worker/`、`wrangler.jsonc` |
| 项目说明和维护文档 | `README.md`、`src/docs/` |

不要把业务页面放入 `tools/`，也不要把预览工具逻辑直接放入业务原型目录。

## 提交前检查

本地安装依赖后，提交和推送会自动执行版本化 Git Hook。手动检查时执行：

- `npm run lint`
- `npm run build`
- `npm run check:docs`
- 如果修改了 Worker 或 `wrangler.jsonc`，执行 `npx wrangler deploy --dry-run`。

不同修改范围的完整检查矩阵见 [`rules/quality-gates-guide.md`](rules/quality-gates-guide.md)。确认检查通过、页面预览正常、批注读写正常后，再提交或部署。

## 相关文档

- 项目术语：`CONTEXT.md`
- 页面状态和路由规则：`rules/prototype-state-and-route-guide.md`
- 文档模板：`src/docs/templates/`

## License

MIT
