# Windows 游戏陪玩平台项目说明清单

> 用途：作为项目文档总入口，帮助快速了解原型与维护记录。

## 项目简介

- 项目定位：产品原型预览工作台，当前包含 Windows 游戏陪玩平台客户端原型。
- 目标用户：原型评审者与 Windows 客户端玩家。
- 当前阶段：首页、俱乐部详情、陪玩详情的 mock 原型与交互演示。

## 阅读顺序

1. 本文件：项目范围与资料索引。
2. `src/prototypes/game-companion-client/spec.md`：陪玩平台原型说明（若文件存在）。
3. `src/docs/troubleshooting/tool-route-component-remount.md`：工具栏路由切换故障记录。
4. `rules/prototype-development-guide.md` 与相关主题规范：原型实现约束。

## 文档索引

| 文档 | 用途 |
| --- | --- |
| `src/docs/troubleshooting/tool-route-component-remount.md` | 记录页面路由已切换但原型内容未切换的原因与修复方式 |
| `src/docs/memory-log.md` | 主动维护记忆的简短追加日志 |
| `rules/prototype-state-and-route-guide.md` | 原型页面状态与路由规则 |

## 原型索引

- `src/prototypes/game-companion-client/`：玩家端陪玩平台，工具栏提供首页、俱乐部详情、陪玩详情三个入口。
- 默认工具栏入口为固定 mock 俱乐部和陪玩数据；详情之间也可在原型内逐层进入。

## 当前待补事项

- 后续若路由组件生命周期或原型入口方式变化，更新导航故障记录中的代码位置与验收步骤。
