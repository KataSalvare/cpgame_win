# 产品原型预览系统

基于 React + TypeScript + Vite 构建的产品原型预览工作台，用于产品经理和 UI 设计师快速预览、批注和展示页面原型，同时管理设计系统主题与项目文档。

当前版本：**v2.1**

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **路由**: React Router 7
- **样式**: Tailwind CSS 4
- **图标**: Lucide React
- **组件**: Ant Design、Radix UI、shadcn/ui 基础组件

## 功能特性

## 三类对象

项目中有三类对象，必须先区分再开始实现：

| 对象 | 定义 | 代码位置 |
|------|------|----------|
| 原型浏览工具 | 承载和评审原型的工作台，包括侧边栏、顶部栏、路由、批注、快捷键和 Figma 复制 | `tools/` |
| 前端原型 | 面向终端用户的业务页面 | `src/prototypes/<name>/` |
| 后台原型 | 面向运营、管理员或内部员工的业务页面 | `src/prototypes/<name>/` |

后台原型仍然属于业务内容，不是工具层。只有实现原型浏览工作台本身的代码才放在 `tools/`。

完整术语定义见根目录 [`CONTEXT.md`](./CONTEXT.md)。

原型内部默认拆分展示和逻辑：

```text
src/prototypes/<name>/
├── index.tsx              # 入口和页面组装
├── <Name>View.tsx         # 展示 UI
├── use<Name>Logic.ts      # 交互逻辑、状态和事件
├── components/            # 原型内部展示模块
├── pages/                 # 可选：内部多页面
└── assets/                # 原型专属素材

src/prototypes/style.css   # 多个原型共用的内容层样式
```

`index.tsx` 不应集中承载复杂状态和全部事件处理；展示模块通过 props 接收数据与回调，逻辑模块不返回 JSX、不写 CSS。原型公共样式必须使用 `prototype-` 命名空间，页面独有样式才放入对应原型目录。

### 全局功能

- **主题切换**: 支持白天/黑夜模式切换，默认黑夜模式，设置自动保存到 localStorage
- **自定义项目名称**: 点击左上角项目名称即可编辑，支持 Enter 确认、Escape 取消
- **设备预览切换**: 支持移动端/PC端预览模式切换
- **页面状态切换**: 通过工具层状态面板切换正常、加载、空数据、异常等页面状态
- **快捷键配置**: 可自定义快捷键，支持复制到 Figma、查看文档、批注选择元素等操作
- **复制到 Figma**: 一键将当前页面复制到 Figma（HTML to Design）
- **主题管理**: 动态读取 `src/themes` 中的设计系统主题，支持预览主题组件和查看设计规范
- **文档管理**: 动态读取 `src/docs/*.md` 中的根目录 Markdown 文档
- **侧边栏折叠**: 顶部操作栏可一键折叠/展开左侧菜单栏，折叠后完全隐藏

页面状态面板位于顶部工具栏的「状态」入口中。它只负责预览控制，不属于原型页面主体，也不会被复制到 Figma；页面状态、用户状态和路由的详细工具规则见 [`rules/prototype-state-and-route-guide.md`](./rules/prototype-state-and-route-guide.md)。

### 页面批注

- **批注编辑模式**: 点击顶部「批注」按钮进入编辑模式，可对当前页面添加、编辑、删除批注
- **元素选择**: 进入编辑模式后点击「选择元素」，再点击页面元素即可添加批注；支持快捷键触发
- **分类管理**: 默认分类为「交互说明」、「业务逻辑」、「状态说明」，支持新增自定义分类（默认分类不可删除）
- **批注展示**: 支持显示/隐藏页面上的批注标记，可点击标记或右侧文档面板查看详情
- **草稿机制**: 新建、编辑、删除批注后先保存到本地草稿，点击「保存」后才会写入本地文件
- **多分类批注**: 同一元素可添加多个分类的批注，批注弹窗以标签页形式切换查看

### 快捷键

| 功能 | 默认快捷键 (Mac) | 默认快捷键 (Windows) |
|------|-----------------|---------------------|
| 复制到 Figma | Ctrl+Cmd+C | Ctrl+Alt+C |
| 查看文档 | Ctrl+Cmd+E | Ctrl+Alt+E |
| 批注选择元素 | Ctrl+Cmd+S | Ctrl+Alt+S |

## 原型路由

前端原型和后台原型的入口统一放在 `src/prototypes/<name>/index.tsx`。原型浏览工具通过 Vite `import.meta.glob` 自动发现这些入口，再由 `tools/config/pages.ts` 为每个目录配置 URL、名称和分类。

当前已注册的 DEMO 原型路由：

| 分类 | 页面 | 路径 | 目录 |
|------|------|------|------|
| 前端 | DEMO 电商详情页 | `/demo/ecommerce-detail` | `DEMO-ecommerce-detail` |
| 前端 | DEMO 运动健康首页 | `/demo/sports-health` | `DEMO-sports-health-home` |
| 前端 | DEMO 区块链钱包 | `/demo/blockchain-wallet` | `DEMO-blockchain-wallet` |
| 后台 | DEMO SaaS 平台首页 | `/demo/admin/saas-home` | `DEMO-admin-saas-home` |
| 后台 | DEMO 用户管理 | `/demo/admin/user-management` | `DEMO-admin-user-management` |
| 后台 | DEMO 运营数据看板 | `/demo/admin/analytics` | `DEMO-admin-analytics` |

新增原型时，需要同时完成以下事项：

1. 创建 `src/prototypes/<name>/index.tsx`，并导出默认组件。
2. 在 `tools/config/pages.ts` 中增加目录名、路径、中文名称和分类映射。
3. 如果页面需要 PRD，在同一目录增加 `spec.md`。

页面状态、用户状态和路由的详细工具规则见 [`rules/prototype-state-and-route-guide.md`](./rules/prototype-state-and-route-guide.md)。

只有实际存在 `index.tsx` 的目录才会被注册为路由；空目录或已删除目录不会出现在侧边栏。

## 项目结构

```
src/                        # 内容层：只放业务/原型相关内容
├── main.tsx                # 应用入口
├── index.css               # 全局样式
├── prototypes/             # 前端原型和后台原型，以及公共 style.css
├── themes/                 # 主题设计系统
├── docs/                   # 项目文档（Markdown）
├── workspace/              # 首页、主题和文档工作区页面
│   ├── HomePage.tsx        # 默认首页/引导页
│   ├── ThemeDetailPage.tsx # 主题详情
│   ├── ThemesListPage.tsx  # 主题列表
│   ├── DocDetailPage.tsx   # 文档详情
│   └── DocsListPage.tsx    # 文档列表
├── content/                # 项目内容配置
│   └── annotations/        # 批注默认分类与示例数据
│       ├── categories.ts
│       └── defaults.ts
├── common/                 # 内容层共享组件（如 DesignMdBatchShowcase、DEMO 组件）
└── lib/                    # 通用工具函数
    └── utils.ts            # cn 等 UI 工具函数

tools/                      # 原型浏览工具实现
├── App.tsx                 # 主应用组件，负责路由、全局状态和布局编排
├── shell/                  # 界面外壳
│   ├── Sidebar.tsx         # 左侧边栏（4 个 Tab 导航）
│   ├── Topbar.tsx          # 顶部工具栏
│   └── TooltipButton.tsx   # 工具提示按钮
├── tools/                  # 工具功能实现
│   ├── AnnotationController.tsx   # 批注状态、渲染与交互
│   └── ShortcutsDialog.tsx        # 快捷键设置弹窗
├── components/             # 工具组件
│   ├── DocDrawer.tsx
│   ├── AnnotationLayer.tsx
│   ├── AnnotationModal.tsx
│   └── AnnotationPanel.tsx
├── hooks/                  # 工具层 Hooks
│   └── useAnnotations.ts
├── config/                 # 工具层配置与动态导入
│   ├── pages.ts
│   ├── themes.ts
│   └── docs.ts
└── lib/                    # 工具函数
    ├── shortcuts.ts        # 主题、快捷键、项目名称 localStorage 读写
    └── annotations.ts      # 批注类型与工具函数
```

> **架构说明**：
> - `src/` 只放**内容层**（原型、主题、文档、页面、内容配置、通用 UI）
> - `tools/` 只放**工具层**（预览外壳、批注、快捷键、复制到 Figma、配置读取等）
> - 两层通过 alias 隔离：`@/...` 指向 `src/`，`@tools/...` 指向 `tools/`
> - 迭代功能时，一看 import 路径就知道改动发生在内容层还是工具层

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

批注保存接口由 Vite 开发服务器提供：开发时通过 `/api/annotations` 读写 `src/resources/annotations.json`；生产部署需要提供等价的后端接口，静态文件预览本身不会提供写入能力。

## 配置说明

### 本地存储键名

- `prototype-theme`: 主题设置（light/dark）
- `prototype-project-name`: 自定义项目名称
- `prototype-shortcuts`: 快捷键配置
- `prototype-sidebar-collapsed`: 侧边栏折叠状态
- `prototype-annotations-draft`: 尚未保存到文件的批注草稿

## License

MIT
