# Cloudflare 部署与批注 API 指南

本文件是 Worker、Static Assets、Workers KV、`/api/annotations` 和 `/api/menu-tree` 的部署约束来源。README 只保留快速开始，不重复维护绑定细节。

## 1. 当前配置关系

| 配置项 | 当前值 | 约束 |
| --- | --- | --- |
| Worker 名称 | `product-make` | 以 `wrangler.jsonc` 为准 |
| Worker 入口 | `worker/index.ts` | `/api/*` 先由 Worker 处理 |
| Static Assets | `dist` / `ASSETS` | 其他请求继续交给静态资源，并保留 SPA fallback |
| KV 绑定 | `ANNOTATIONS_KV` | 代码和 Wrangler 绑定名必须一致 |
| 生产 namespace | `pm-annotations` | 不得擅自更换 namespace ID |
| 批注 Key | `annotations` | 保存整份批注 JSON |
| API | `/api/annotations` | 支持 GET 和合法 JSON POST |
| 菜单排序 Key | `tool-menu-tree` | 保存前端和后台导航的树结构 |
| 菜单 API | `/api/menu-tree` | 支持 GET 和合法 JSON POST；空 KV 回退到 `tools/config/menu-tree.json` |
| 原型 SPEC Key | `spec:<原型目录名>` | 保存通过文档面板编辑的 Markdown 内容 |
| 版本检查 | `/version.json` | 每次构建写入版本号和部署标识 |

除非用户明确授权，不得把测试数据写入线上 KV，不得把生产 namespace 用作本地开发存储。

## 2. 数据行为

- KV 没有 `annotations` Key 时，GET 回退到 `src/resources/annotations.json`。
- 第一次合法 POST 后，完整数据写入 KV 的 `annotations` Key。
- `/api/menu-tree` 的 GET 在 KV 没有 `tool-menu-tree` 时返回构建时打包的 `tools/config/menu-tree.json`；合法 POST 将菜单树写入该 Key。
- 菜单树校验节点路径、嵌套深度和同分类重复 ID；无效请求返回 400，未知 API 方法返回 405。
- 非法 JSON 或缺少 `annotations`、`categories` 数组时返回 400。
- 不支持的方法返回 405；KV 读写异常返回 500。
- 当前 API 没有用户身份校验、用户隔离、租户隔离或敏感数据保护。
- `/api/spec/<原型目录名>` 读取和保存对应 SPEC；KV 中没有保存版本时，前端使用构建时打包的 `spec.md` 原文。
- 文档面板的密码验证在浏览器会话内记忆；它用于进入编辑界面的提示门槛，不构成 Worker API 的身份认证或写入权限控制。

## 3. 本地验证

修改 `worker/` 或 `wrangler.jsonc` 后按以下顺序验证：

1. `npm run lint`
2. `npm run build`
3. `npx wrangler deploy --dry-run`
4. 使用 `npx wrangler dev` 的本地 KV 验证空 KV 回退、GET、合法 POST、非法 POST 和 405。

本地 Wrangler 默认使用本地状态。不要使用远程 KV 开发模式，除非用户明确授权并说明目标 namespace。

## 4. 部署流程

1. 确认 `wrangler.jsonc` 的入口、Assets 目录和 KV 绑定没有被改错。
2. 执行 `npm run build`。
3. 执行 `npx wrangler deploy --dry-run`。
4. 用户明确授权后，才执行 `npx wrangler deploy`。
5. 部署后检查首页、SPA 路由和 `/api/annotations` 的 GET/POST 行为。

### 页面更新提示

- `npm run build` 会在 `dist/version.json` 写入发布信息；版本号由根目录 `release-version.txt` 管理，初始为 `v1.0.0`，同时记录 Git commit 短 SHA（无 Git 元数据时用构建 ID）、工作台公共代码标识和各原型内容标识。
- 前端在生产环境每 60 秒检查 `/version.json`。仅当前原型内容标识发生变化时显示刷新按钮；公共工作台代码变化会提示所有原型。当前按原型目录判定更新，目录下的多个路由共享同一更新范围。刷新由开发者主动触发。
- 新建正式版本时，将 `release-version.txt` 更新为新版本号（例如 `v1.0.1`）；每次代码部署即使版本号未变，构建标识仍能发现部署更新。
- `public/_headers` 对 `/version.json` 设置 `Cache-Control: no-store`，确保检查不会读到旧版本信息。
- 本地开发不显示更新提示；构建产物的 `dist/version.json` 是生成文件，不提交到仓库。

Cloudflare Dashboard 中的临时配置不作为项目事实来源；后续部署应以仓库中的 `wrangler.jsonc` 和 Worker 代码为准。
