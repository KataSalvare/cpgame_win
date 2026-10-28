# 原型开发与验收指南

用于 `src/prototypes/<name>/` 下的前端原型和后台原型实现、局部修改、多页面组织和预览验收。原型浏览工具本身的修改不适用本指南，应参考 `rules/architecture-guide.md`。主题创建、派生和主题页验收优先看 `rules/theme-guide.md`。

开发流程：

```text
读取已确认需求和设计决策 -> 修改原型目录内代码 -> 运行验收脚本 -> 按错误信息修复 -> 重新验收
```

## 实现边界

- 前端原型和后台原型都是被原型浏览工具加载的业务内容；两者都必须放在 `src/prototypes/<name>/`，不能放入 `tools/`。
- 原型浏览工具包括侧边栏、顶部栏、工作区路由、主题/文档浏览、批注、快捷键和 Figma 复制；这些能力放在 `tools/`，不写进具体原型。
- 一个原型目录就是主要隔离边界，页面组件、样式和素材优先留在对应原型目录内。
- 不为单个原型随意修改 `src/common/`、全局主题或共享工具。
- 多步骤或高风险修改先拆成短任务，逐项处理并维护当前状态。
- 一次只处理一个明确问题；遇到构建、运行或验收失败，先定位原因再继续。
- 完成后必须通过预览验收；纯视觉、文案、布局和素材调整不要求测试驱动。

## 默认平台与预览画布

- 未指定平台时，按 Windows 游戏陪玩平台客户端规划业务原型，PC 画布默认为 1920×1080 CSS 像素；客户端面向终端用户时仍注册为 `frontend`，不因桌面布局归为 `admin`。
- 预览工具保持画布布局尺寸不变，根据可用宽高等比缩小、居中显示，最大为 100%；浏览器窗口变小不代表产品进入移动端布局。
- 原型根节点以父容器为基准，优先使用 `w-full h-full min-h-0` 及 Flex/Grid 分区；长内容在对应区域滚动。避免以 `w-screen`、`h-screen`、`100vw`、`100vh` 定义客户端窗口尺寸。
- 画布是 DOM 容器，不是独立 iframe。CSS 媒体查询、Tailwind 的 `sm:` / `lg:` 等断点仍基于浏览器窗口；固定桌面布局不要依赖它们推导画布宽度，需要随容器变化时使用容器查询或父容器布局约束。
- 鼠标悬停、键盘焦点和区域滚动按桌面任务设计；窗口标题栏和窗口控制仅在页面需求要求时模拟，不代表已实现原生 Windows 能力。
- 用户明确指定移动端或 Web 时按指定平台设计；移动端预览仍为 400×852，工具栏允许手动切换。已有原型不因默认值调整批量改写。
- PC 固定画布只用于业务原型，工作台首页、文档和主题浏览仍使用工作区可用尺寸。

## 界面信息与可发现性

- 优先用清晰的视觉层级和自解释的结构表达信息，避免依赖文字说明界面如何理解或操作。
- 默认不添加 slogan 式文案、教学段落，也不在每个区块下重复放置帮助说明。
- 确需补充解释时，优先使用 info 图标配合 tooltip，避免让次要说明长期占据页面空间。
- 精简可见说明时，仍须保留必要的表单标签和可访问名称，确保读屏软件能识别控件；清爽布局不能以牺牲可访问性为代价。
- 删除、支付、提交永久性变更等危险或不可逆操作，必须清晰提示操作后果。
- 移除说明文字后，首次使用者仍应能判断下一步操作入口，以及触发后会发生什么；若无法做到，应调整结构或补充必要提示。

## 原型与真实业务边界

- 原型默认使用 mock 数据和本地状态，不代表已接入真实数据源或后端服务。
- 固定数据、固定延时、假成功、静态弹窗和简化流程必须在对应 SPEC 中标记为“仅用于演示”。
- 原型实现可以模拟 PRD 中的真实流程，但不得用 mock 字段、事件顺序或本地状态推导真实接口、权限或持久化规则。
- 页面数据、状态和交互应能回溯到 SPEC 的 mock 映射及 PRD 的真实需求；发现冲突时先回到需求/设计对齐，不自行选择。
- 原型未实现但 PRD 要求的能力，要在 SPEC 的“未实现项”中列出，不得默认为已完成。

## 文档交接校验

在研发交付前运行：

```bash
npm run check:docs
node scripts/check-doc-handoff.mjs src/prototypes/<name>
```

- 默认校验 `src/prototypes/` 和 `src/docs/` 中的 PRD、SPEC 及补充模型文档。
- `--stage draft` 允许 PRD 暂时保留“待设计”的页面映射；研发交付使用默认的 `handoff` 阶段。
- 校验失败时，先修复文档边界、页面状态、需求编号或追踪关系，再进行原型验收。

## 原型类型判定

开始实现前，先回答“谁使用这个页面”：

| 类型 | 用户 | 放置位置 | 路由分类 | 示例 |
|------|------|----------|----------|------|
| 前端原型 | 终端用户 | `src/prototypes/<name>/` | `frontend` | 登录、首页、个人中心 |
| 后台原型 | 运营、管理员或内部员工 | `src/prototypes/<name>/` | `admin` | 仪表盘、用户管理、订单管理 |

后台原型可以使用表格、图表、侧栏、权限和高密度信息布局，但这些只是业务页面的表现形式，不代表它属于工具层。

必须遵守：

1. 业务页面一律放在 `src/prototypes/<name>/`。
2. 预览器能力一律放在 `tools/`。
3. 后台原型目录建议使用 `demo-admin-<name>`，并在 `tools/config/pages.ts` 的后台页面映射中注册；前端原型在前端页面映射中注册。运行时会分别生成 `category: 'admin'` 和 `category: 'frontend'`。
4. 开发前在任务摘要中写明：`对象类型`、`用户`、`内容目录`、`路由分类`。

## 文件结构与命名

```text
src/prototypes/<name>/
├── index.tsx              # 必需：入口和页面组装
├── <Name>View.tsx         # 推荐：展示 UI
├── use<Name>Logic.ts      # 推荐：交互逻辑
├── components/            # 可选：原型内部展示模块
├── hooks/                 # 可选：多个逻辑模块
├── pages/                 # 可选：多页面原型页面组件
├── docs/                  # 可选：目录 Markdown 文档
└── assets/                # 可选：原型专属素材

src/prototypes/style.css   # 多个原型共用的内容层样式
```

- 原型入口文件必须是 `index.tsx`。
- `index.tsx` 只负责调用逻辑模块并组装展示 UI；复杂状态、校验和事件流程放到 `use<Name>Logic.ts` 或 `hooks/`。
- `*View.tsx` 和 `components/` 内的展示模块只通过 props 接收数据、状态和回调，不直接处理业务流程。
- 原型目录名使用小写字母、数字、连字符，如前端原型 `demo-home`、后台原型 `demo-admin-orders`。
- 当目录名为 `untitled`、`untitled-*` 或显示名为「未命名」时，开始生成实际内容前应更新为有意义的目录名和 `@name`。
- 本项目当前不产出独立 `components` 资源；原型内部组件放在对应原型目录下的 `components/`。
- 原型目录文档放在当前原型的 `docs/` 下，例如 `src/prototypes/order-review/docs/prd-03-status.md`。

每个原型的 `index.tsx` 顶部建议包含面向用户的中文 `@name`，用于预览列表展示名：

```typescript
/**
 * @name 评审工作台
 */
```

## 样式归属

- `src/prototypes/style.css` 只维护两个及以上原型共用的内容层样式、变量和动画，不维护原型浏览工具的样式。
- 公共样式选择器必须使用 `prototype-` 前缀或其他明确命名空间，禁止使用容易冲突的全局 `.card`、`.modal`、`.sidebar` 等选择器。
- 单个原型独有的样式放在 `src/prototypes/<name>/style.css`；如果该文件不断被其他原型复用，应迁移到公共 `style.css`。
- 展示 UI 中只保留语义化 className；不要在交互逻辑模块中写 className、内联视觉样式或 CSS。
- 工具栏、侧边栏、批注层等原型浏览工具样式继续放在工具层，不得写入原型公共样式。

## 内容层滚动条

原型内容 viewport 默认隐藏滚动条，但必须保留滚动能力。预览工具会在内容层滚动容器上统一应用 `prototype-content-scroll`，使用以下方式隐藏视觉上的拖动条：

```css
.prototype-content-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.prototype-content-scroll::-webkit-scrollbar {
  display: none;
}
```

这条规则只隐藏滚动条，不得使用 `overflow: hidden` 替代。内容层仍必须支持触控滑动、鼠标滚轮和键盘滚动；工具层侧边栏、文档面板和批注面板的滚动条不受此规则影响。原型页面自身不要覆盖该行为，也不要为了隐藏滚动条禁用页面滚动。

## 多页面原型

单个原型可以包含多个页面，通过 URL hash 参数 `#page=<pageId>` 在原型内部定位：

```text
/home#page=home
/home#page=detail
```

多页面仍属于同一个原型目录；页面组件放在原型内部的 `pages/`，跨页面共享组件放在原型内部的 `components/`。原型内部页面不需要在 `tools/config/pages.ts` 中分别注册，浏览工具只注册原型入口。

- `pageId` 命名使用小写字母、数字、连字符。
- 不带 `#page=` 时自动使用 `defaultPage`。
- 此路由完全在原型内部，不影响构建。

参考实现：`src/prototypes/demo-home/index.tsx`。

## 弹窗（Modal/Overlay）开发规范

原型页面中的弹窗（含遮罩）必须使用**手写 `div` overlay 方式**，禁止使用 `@/components/ui/dialog` 等基于 Portal 的弹窗组件。原因如下：

- 弹窗作为页面 DOM 的子节点，元素选择器（`.selector` 或 `#id`）才能正确选中弹窗内的元素进行批注
- `data-overlay` 属性让批注层正确识别 overlay，控制弹窗内外元素的标注可见性
- `absolute` 定位相对于页面容器，不会因 Portal 导致层级或定位参考系错乱

统一模板：

```tsx
const [showModal, setShowModal] = useState(false)

return (
  <div className="relative w-full min-h-full ...">
    {/* 页面内容 */}

    {/* 弹窗 */}
    {showModal && (
      <div
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
        data-overlay="<唯一标识>"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false)
        }}
      >
        <div className="w-full max-w-[xxxpx] bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{/* 弹窗标题 */}</h2>
            <button
              onClick={() => setShowModal(false)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
          {/* 弹窗内容 */}
        </div>
      </div>
    )}
  </div>
)
```

关键规则：

1. 页面外层容器必须有 `relative` 类名，确保 `absolute inset-0` 的弹窗遮罩覆盖整个页面。
2. 遮罩 `div` 必须包含 `data-overlay="<唯一标识>"` 属性，值在整个项目内唯一（如 `feature-detail`、`profile-edit`、`notice-detail`、`order-detail`）。
3. 点击遮罩关闭弹窗通过 `onClick` 判断 `e.target === e.currentTarget` 实现。
4. 弹窗卡片容器使用 `rounded-2xl shadow-2xl`、`max-w-[xxxpx]` 统一外观。
5. 顶部关闭按钮使用 `lucide-react` 的 `X` 图标。
6. 多个弹窗（如列表中的多个条目）使用单个 `useState` 跟踪当前打开项，而非为每个条目创建独立的 Dialog 组件。

参考实现：`src/prototypes/demo-login 20-22-24-906/index.tsx`、`src/prototypes/demo-home/index.tsx`、`src/prototypes/demo-admin-orders/index.tsx`。

## 依赖与样式

- React 与 Hooks 直接从 `react` 导入。
- 第三方库按需导入，新增依赖必须同步更新 `package.json`。
- 使用 Tailwind CSS V4 时，入口样式文件需包含：

```css
@import "tailwindcss";
```

- 使用主题 CSS Variables 时，按所选 `DESIGN.md` 和主题规则引入，不复制另一套 token。

## 验收流程

运行原型验收脚本：

```bash
node scripts/check-app-ready.mjs /prototypes/[原型目录]
```

关键返回字段：

- `status`: `READY` / `ERROR` / `TIMEOUT`。
- `targetUrl`: 本次验收目标地址。
- `errors`: 构建、运行时或页面加载错误列表。

错误处理：

- `ERROR`：按 `errors` 修复后重新执行验收脚本，直到通过。
- `TIMEOUT`：优先排查 dev server 启动、端口、长任务和运行时阻塞。
- 修复时先处理构建、启动和运行时报错，再处理交互与视觉问题；一次只修一个明确问题，修完重新验收。

## 最小清单

- [ ] `index.tsx` 完整存在。
- [ ] `index.tsx` 顶部有清晰的 `@name`。
- [ ] 占位原型已更新为有意义的目录名和显示名。
- [ ] 新增依赖已写入 `package.json`。
- [ ] `check-app-ready.mjs` 原型验收通过。
- [ ] 已标记 mock 数据、模拟交互和原型未实现项，未将其当作生产逻辑。
- [ ] `check-doc-handoff.mjs` 文档交接校验通过。
