# 产品原型预览系统

产品原型预览工作台，用于集中预览、切换、批注和展示前端原型与后台原型，同时管理主题和项目文档。

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
3. 打开 `http://localhost:1025` 预览项目。
4. 构建生产版本：`npm run build`。
5. 预览生产构建：`npm run preview`。

`npm run preview` 只检查 Vite 生成的静态页面，不会完整验证 Cloudflare Worker、批注 API 或 KV。修改 Worker 或部署配置时，应使用 Wrangler 做额外验证。

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

### 生产环境 KV 配置

生产环境使用 Cloudflare Worker、Static Assets 和 Workers KV。配置入口是项目根目录的 `wrangler.jsonc`，需要保持以下配置关系：

| 配置项 | 当前值 | 说明 |
| --- | --- | --- |
| Worker 名称 | `product-make` | 生产 Worker 名称 |
| Worker 入口 | `worker/index.ts` | 批注 API 和静态资源转发入口 |
| 静态资源目录 | `dist` | `npm run build` 生成的前端文件 |
| 静态资源绑定 | `ASSETS` | Worker 访问静态资源时使用 |
| KV 绑定名 | `ANNOTATIONS_KV` | Worker 访问批注 KV 时使用 |
| KV namespace | `pm-annotations` | 生产批注数据所在的 namespace |
| KV namespace ID | `66e5f21136474d94b87413df97a81ab5` | namespace 的唯一 ID |
| API 路径 | `/api/annotations` | 批注读取和保存地址 |

修改 KV 配置时，只修改 `wrangler.jsonc` 中的绑定关系，并确保代码使用的绑定名与配置中的绑定名一致。不要只在 Cloudflare Dashboard 中手动添加绑定，否则后续 Wrangler 部署可能覆盖 Dashboard 配置。

首次部署或 KV 为空时，API 会返回 `src/resources/annotations.json` 中的默认批注。第一次保存批注后，完整批注数据会写入 KV 的 `annotations` Key，不需要手动创建 Key。

### 首次配置 Cloudflare

首次接入或更换环境时：

1. 准备有 Workers 和 Workers KV 权限的 Cloudflare 账号。
2. 使用 `npx wrangler login` 登录 Wrangler。
3. 在 Cloudflare 中创建或确认 `pm-annotations` namespace，并取得 namespace ID。
4. 将 namespace ID 写入 `wrangler.jsonc` 的 `ANNOTATIONS_KV` 绑定配置。
5. 执行 `npx wrangler deploy --dry-run`，确认 Worker、Assets 和 KV 绑定均被识别。

staging 和 production 应使用不同的 KV namespace，避免测试数据覆盖生产批注。

`/api/*` 请求必须优先交给 Worker 处理；其他请求继续由 `dist` 中的静态资源提供。修改 Assets 或 API 路由配置后，应重新执行构建并进行本地验证。

### 生产部署

1. 确认 `wrangler.jsonc` 中的 KV namespace ID 正确。
2. 执行 `npm run build` 生成最新的 `dist`。
3. 执行 `npx wrangler deploy` 部署 Worker 和静态资源。
4. 访问生产地址，检查首页和 `/api/annotations` 是否正常。

本地执行 `npx wrangler dev` 时，Wrangler 默认使用本地 KV 状态，不会修改线上 namespace。除非明确需要操作线上数据，否则不要使用远程 KV 开发模式。

当前批注 API 没有额外的用户身份校验。公开部署后，知道接口地址的访问者理论上可以提交 POST 覆盖整份批注数据；不要在其中存储敏感信息。多人或公开使用前，应在 Cloudflare Access、鉴权网关或其他写入保护层中限制 API 访问。

当前数据模型使用单个 `annotations` Key 保存完整批注 JSON，所有使用者共享同一份数据。多人同时保存时以后写入的数据为准，不提供用户、项目或租户级隔离。

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

提交修改前至少执行：

- `npm run lint`
- `npm run build`
- 如果修改了 PRD、SPEC 或其他交接文档，执行 `npm run check:docs`。
- 如果修改了 Worker 或 `wrangler.jsonc`，再执行 `npx wrangler deploy --dry-run`。

确认检查通过、页面预览正常、批注读写正常后，再提交或部署。

## 相关文档

- 项目术语：`CONTEXT.md`
- 页面状态和路由规则：`rules/prototype-state-and-route-guide.md`
- 文档模板：`src/docs/templates/`

## License

MIT
