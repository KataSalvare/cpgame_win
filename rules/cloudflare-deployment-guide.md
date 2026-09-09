# Cloudflare 部署与批注 API 指南

本文件是 Worker、Static Assets、Workers KV 和 `/api/annotations` 的部署约束来源。README 只保留快速开始，不重复维护绑定细节。

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

除非用户明确授权，不得把测试数据写入线上 KV，不得把生产 namespace 用作本地开发存储。

## 2. 数据行为

- KV 没有 `annotations` Key 时，GET 回退到 `src/resources/annotations.json`。
- 第一次合法 POST 后，完整数据写入 KV 的 `annotations` Key。
- 非法 JSON 或缺少 `annotations`、`categories` 数组时返回 400。
- 不支持的方法返回 405；KV 读写异常返回 500。
- 当前 API 没有用户身份校验、用户隔离、租户隔离或敏感数据保护。

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

Cloudflare Dashboard 中的临时配置不作为项目事实来源；后续部署应以仓库中的 `wrangler.jsonc` 和 Worker 代码为准。
