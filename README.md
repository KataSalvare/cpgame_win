# 游戏陪玩平台 Windows 客户端

这是一个面向玩家的 Windows 游戏陪玩平台客户端原型项目。项目围绕客户端产品体验开展设计与评审，包含浏览游戏和俱乐部、发现陪玩、下单、账户管理、即时消息及语音房等主要场景。

客户端原型位于 `src/prototypes/game-companion-client/`，使用 1920×1080 CSS 像素固定画布。原型浏览工作台负责打开和切换客户端页面、预览状态及记录评审批注；工作台是承载原型的工具，不是本项目的主要产品对象。

## 客户端范围

- **发现与浏览**：首页游戏及俱乐部筛选、俱乐部详情、大神列表、陪玩资料、公告和全局搜索。
- **下单与账户**：一键匹配、服务结算、我的订单、个人中心、钱包、充值、优惠券和俱乐部尊享卡。
- **沟通与组队**：消息、好友和群聊、语音房、送礼、客服及帮助中心演示。
- **陪玩工作台**：匹配请求、接单订单、服务管理和糖豆钱包，供客户端中的陪玩工作流程原型评审。
- **账号流程**：独立登录入口，以及手机号绑定和实名认证演示。

以上均为客户端原型交互。游戏、俱乐部、用户、服务、订单、余额和消息等内容使用本地 mock 数据；登录、支付、认证、客服、实时消息和服务端业务均未接入。交互细节和明确的待确认事项以客户端 [PRD](src/prototypes/game-companion-client/prd.md) 与 [SPEC](src/prototypes/game-companion-client/spec.md) 为准，不应将演示数据或行为视为正式业务规则。

## 运行预览

需要 Node.js 和 npm：

```bash
npm install
npm run dev
```

打开 `http://localhost:1045`，在工作台侧栏的“前端原型”中选择游戏陪玩平台页面。工作台也可直接预览登录、首页、大神、俱乐部详情、个人中心、订单、消息、语音房和陪玩工作台等页面。

常用入口：

| 页面 | 本地路径 |
| --- | --- |
| 登录 | `/game-companion-login` |
| 首页 | `/game-companion-client` |
| 大神 | `/game-companion-talents` |
| 俱乐部详情 | `/game-companion-club-detail` |
| 陪玩详情 | `/game-companion-companion-detail` |
| 个人中心 | `/game-companion-profile` |
| 我的订单 | `/game-companion-orders` |
| 消息 | `/game-companion-messages` |
| 语音房 | `/game-companion-voice-room` |

其他页面入口及内部状态见 [页面配置](tools/config/pages.ts) 和客户端 SPEC。客户端默认按 PC 画布预览，工作台等比缩放画布以适应可用空间，不改变布局尺寸；支持移动端预览的工作台能力仍保留。

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `src/prototypes/game-companion-client/` | Windows 客户端页面、交互逻辑、组件、样式、mock 数据和素材 |
| `src/prototypes/DEMO-admin-windows-client-components/` | Windows 客户端组件的后台原型示例 |
| `src/components/WindowsClient/` | 可复用的客户端窗口及通用组件 |
| `src/themes/grayscale-prototype/` | 客户端灰阶原型视觉规范 |
| `tools/` | 原型预览工作台、页面路由、主题与文档浏览、批注和评审工具 |
| `src/docs/`、`rules/` | 项目文档和协作开发规范 |
| `worker/`、`wrangler.jsonc` | Cloudflare Worker 与部署配置 |

客户端采用单个原型目录组织，`pages/` 放页面，`components/` 放原型内复用组件，`hooks/` 管理交互状态，`data/` 保存演示数据。页面范围、数据边界及交互以 PRD、SPEC 和补充 `.spec/` 文档为准。

## 开发与检查

```bash
npm run dev       # 启动本地工作台
npm run build     # TypeScript 检查并构建
npm run lint      # ESLint 检查
npm run check:docs # 检查 PRD/SPEC 文档交接
npm run preview   # 预览静态构建
```

客户端视觉以 [`src/themes/grayscale-prototype/DESIGN.md`](src/themes/grayscale-prototype/DESIGN.md) 为准。新增或调整业务页面时，更新客户端 PRD/SPEC，并遵循 [`rules/prototype-development-guide.md`](rules/prototype-development-guide.md) 与 [`rules/requirements-alignment-guide.md`](rules/requirements-alignment-guide.md)。目录归属、部署和完整验收约定见 [AGENTS.md](AGENTS.md) 及 `rules/`。

`npm run preview` 只预览静态构建，不验证 Worker、批注 API 或 KV。批注和 Cloudflare 配置说明见 [`rules/cloudflare-deployment-guide.md`](rules/cloudflare-deployment-guide.md)。

## License

MIT
