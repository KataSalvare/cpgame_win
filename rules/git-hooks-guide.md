# Git Hooks 指南

仓库使用零依赖、版本化的 `.githooks/`。Hook 只做快速、确定性的质量门禁，不代替浏览器验收、视觉检查或生产部署审批。

## 1. Hook 触发策略

```text
pre-commit
  └─ npm run lint

pre-push
  └─ npm run verify:push
       ├─ npm run lint
       ├─ npm run build
       ├─ npm run check:docs
       └─ 如果推送内容涉及 worker/ 或 wrangler.jsonc
            └─ npx wrangler deploy --dry-run
```

`pre-commit` 保持快速，避免阻塞普通文档或小范围代码提交。`pre-push` 是本地完整门禁；检查失败必须阻止推送并输出失败命令。

## 2. 安装与生命周期

`npm install` 通过 `prepare` 调用 `scripts/install-git-hooks.mjs`，幂等设置当前仓库的 `core.hooksPath` 为 `.githooks`。脚本在没有 Git 仓库的环境中正常退出，不能影响 CI、Cloudflare 构建或其他依赖安装。

Hook 文件必须提交到仓库并保持可执行。脚本不可依赖某个开发者的绝对路径、私有环境变量或本地服务状态。

## 3. 安全与绕过

- Hook 不自动格式化、不写回源码、不修改 `src/resources/annotations.json`。
- 不使用远程 KV，不执行 `wrangler deploy`，不发送生产 API 写请求。
- 不把 `check-app-ready.mjs` 放入 Hook，避免启动 Vite 与现有 1025 端口冲突。
- `git commit --no-verify` 和 `git push --no-verify` 只能用于紧急情况；完成后应补跑失败检查并说明原因。
- Hook 是开发者体验层的门禁，未来如需团队强制执行，应在 CI 重复运行核心检查。

## 4. 故障处理

看到 Hook 失败时，直接复制输出中的 npm 命令在项目根目录重跑。先修复失败原因，再重新提交或推送；不要通过删除 `.githooks` 或修改 `core.hooksPath` 来规避检查。
