# 原型浏览工具：页面状态、用户状态与路由配置规则

本文说明如何为前端原型和后台原型增加页面状态、用户状态，以及如何注册原型路由。

## 1. 先区分三类配置

| 配置 | 作用 | 当前归属 | 是否会进入 Figma 复制 |
|---|---|---|---|
| 页面状态 | 控制页面级正常、加载、空数据、异常等展示 | 工具层配置 + 内容层渲染 | 不会 |
| 用户状态 | 控制访客、已登录、管理员、会员等业务上下文 | 内容层业务状态；需要工具切换时再扩展工具层 | 不会 |
| 原型路由 | 决定页面 URL、侧边栏名称和前后台分类 | `tools/config/pages.ts` | 不适用 |

边界规则：

- 页面主体只能渲染业务内容，不放状态切换按钮、DEMO 标签或工具栏。
- 页面状态的选项由工具层提供，具体画面由 `src/prototypes/<name>/index.tsx` 渲染。
- 用户状态属于业务语义，不能直接把“已登录”“管理员”当成页面状态使用。
- 状态面板位于 `tools/`，在 `#preview-container` 外，因此复制到 Figma 时不会带入工具层代码。

## 2. 文件职责速查

| 文件 | 职责 |
|---|---|
| `tools/config/pages.ts` | 注册原型路由、页面名称、前后台分类和页面状态选项 |
| `tools/App.tsx` | 按路由保存当前页面状态，并把状态通过 props 传给原型 |
| `tools/shell/Topbar.tsx` | 顶部工具区，挂载状态入口 |
| `tools/shell/PreviewStateBar.tsx` | 页面状态浮层面板，不属于原型主体 |
| `src/prototypes/previewState.ts` | 原型接收和消费工具层页面状态的通用 Hook/类型 |
| `src/prototypes/<name>/index.tsx` | 根据状态渲染业务页面内容 |

## 3. 增加页面状态

### 3.1 在路由配置中声明状态选项

公共状态可以复用 `demoPageStates`。如果某个页面需要不同的状态集合，则在对应页面配置里单独声明 `states`。

```ts
// tools/config/pages.ts
const demoPageStates: readonly PageStateOption[] = [
  { id: 'normal', label: '正常' },
  { id: 'loading', label: '加载中' },
  { id: 'empty', label: '空数据' },
  { id: 'error', label: '异常' },
]

const frontendPageConfig = {
  'DEMO-blockchain-wallet': {
    path: '/demo/blockchain-wallet',
    label: 'DEMO 区块链钱包',
    states: demoPageStates,
  },
}
```

状态 `id` 是代码值，建议使用稳定的小写英文标识；`label` 只是顶部面板显示文案。

### 3.2 在原型入口消费状态

原型入口通过 `usePrototypeState` 同时兼容工具层控制和原型内部默认状态：

```tsx
import { usePrototypeState } from '../previewState'
import type { PrototypePreviewProps } from '../previewState'

type WalletPageState = 'normal' | 'loading' | 'empty' | 'error'

export default function BlockchainWallet({
  previewState,
  onPreviewStateChange,
}: PrototypePreviewProps<WalletPageState>) {
  const [pageState, setPageState] = usePrototypeState<WalletPageState>('normal', {
    previewState,
    onPreviewStateChange,
  })

  if (pageState === 'loading') return <LoadingView />
  if (pageState === 'empty') return <EmptyView />
  if (pageState === 'error') return <ErrorView onRetry={() => setPageState('normal')} />

  return <WalletView />
}
```

注意：

1. `states` 中的 `id` 必须和原型里的判断值一致。
2. 页面状态分支可以返回页面级 loading、empty、error 画面，但不能在内容层渲染状态切换控件。
3. 新状态需要同时补充对应 SPEC 的页面状态章节和验收说明。
4. 如果状态只影响页面内部某个模块，也可以在页面内部继续向下传递 `pageState`，不必把它提升成新的工具状态。

### 3.3 页面状态的路由级隔离

工具层在 `tools/App.tsx` 中按页面路径保存状态：

```ts
const [previewStateByPath, setPreviewStateByPath] = useState<Record<string, string>>({})
```

因此从钱包页切换到数据看板时，两页的页面状态不会互相覆盖；返回原页面时会恢复该页面本次预览选择。

## 4. 增加用户状态

用户状态描述业务上下文，例如：

- `guest`：未登录访客
- `member`：普通登录用户
- `admin`：管理员
- `vip`：会员用户

### 4.1 当前推荐方式：在内容层管理

如果用户状态只是为了演示页面内容，可以在原型自己的逻辑 Hook 或入口中管理，不放进页面状态列表：

```tsx
type UserState = 'guest' | 'member' | 'admin'

const [userState, setUserState] = useState<UserState>('member')

return userState === 'guest'
  ? <LoginPrompt />
  : <Dashboard userState={userState} />
```

这种方式适合只在页面内部演示的用户上下文。用户状态的字段、权限和业务含义应记录在对应原型的 PRD/SPEC 中，不能从原型 mock 反推生产权限。

### 4.2 如果需要在工具层切换用户状态

当前顶部浮层只注册了页面状态。若后续要让用户状态也能从工具层切换，应新增第二个状态维度，不要把用户状态混入 `states`：

1. 在 `tools/config/pages.ts` 的 `PageItem` 和页面配置中增加 `userStates`。
2. 在 `tools/App.tsx` 增加按路径保存的 `previewUserStateByPath`，并通过独立 props 传给原型。
3. 在 `src/prototypes/previewState.ts` 增加 `previewUserState` 与 `onPreviewUserStateChange` 类型。
4. 在 `tools/shell/PreviewStateBar.tsx` 中增加“页面状态 / 用户状态”的分组或标签切换。
5. 在原型入口中分别消费 `pageState` 和 `userState`，不要用一个字符串同时表示两种维度。

建议的接口形态：

```ts
interface PrototypePreviewProps<TPageState extends string = string, TUserState extends string = string> {
  previewState?: TPageState
  onPreviewStateChange?: (state: TPageState) => void
  previewUserState?: TUserState
  onPreviewUserStateChange?: (state: TUserState) => void
}
```

在这个扩展真正实现前，不要直接在 `tools/config/pages.ts` 中写入 `userStates`，因为当前工具层还不会读取该字段。

## 5. 增加前端或后台原型路由

### 5.1 创建入口文件

前端和后台原型都放在内容层：

```text
src/prototypes/DEMO-product-home/index.tsx
src/prototypes/DEMO-admin-orders/index.tsx
```

入口必须默认导出 React 组件：

```tsx
export default function ProductHome() {
  return <div>...</div>
}
```

### 5.2 在 `tools/config/pages.ts` 注册路由

前端页面加入 `frontendPageConfig`，后台页面加入 `adminPageConfig`：

```ts
const frontendPageConfig = {
  'DEMO-product-home': {
    path: '/demo/product-home',
    label: 'DEMO 产品首页',
    states: demoPageStates,
  },
}

const adminPageConfig = {
  'DEMO-admin-orders': {
    path: '/demo/admin/orders',
    label: 'DEMO 订单管理',
    states: demoPageStates,
  },
}
```

这份配置同时决定：

- BrowserRouter 使用的 URL；
- 侧边栏显示名称；
- 顶部“前端 / 后台”分类标签；
- 页面可使用的状态面板选项。

普通新增原型不需要修改 `tools/App.tsx` 的 `<Routes>`。`tools/config/pages.ts` 会通过以下 glob 自动发现入口文件，再根据两个配置表生成页面：

```ts
const allModules = import.meta.glob('../../src/prototypes/*/index.tsx', { eager: true })
```

### 5.3 原型内部多页面

同一个原型目录下的多个业务页面使用 URL hash，例如：

```text
/demo/product-home#page=home
/demo/product-home#page=detail
```

这种内部页面不需要在 `tools/config/pages.ts` 中分别注册；只有需要出现在工具侧边栏、拥有独立入口的原型，才注册为新的工具路由。

## 6. 新增页面的完整检查清单

- [ ] 已在 `src/prototypes/<name>/index.tsx` 创建默认导出的入口组件。
- [ ] 已在 `frontendPageConfig` 或 `adminPageConfig` 注册路径、名称、分类和 `states`。
- [ ] 页面状态 `id` 与原型代码判断值一致。
- [ ] 页面状态分支已补充 SPEC，mock 行为已标记为仅用于演示。
- [ ] 用户状态没有混入页面状态；如果要接入工具层，先扩展独立的 `userStates` 维度。
- [ ] 内容层没有渲染工具栏、状态面板或 DEMO 标签。
- [ ] 状态面板仍位于 `#preview-container` 外，Figma 复制只复制页面主体。
- [ ] 已通过对应原型页面和后台/前端分类的预览验收。

