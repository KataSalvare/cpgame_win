# WindowsClient 公共组件

## 用途

为 Windows 桌面原型提供默认灰阶、可继承 `--prototype-*` 调色 token 的框架、导航、窗口控制按钮和常见浮层外观。组件不连接真实操作系统能力；页面负责状态、导航和业务事件。

## 导入

```tsx
import {
  DialogPanel,
  FloatingPanel,
  NotificationToast,
  RightDrawer,
  WindowsClientFrame,
  WindowsControlButtons,
  WindowsSidebar,
  WindowsTitleBar,
} from '@/components/WindowsClient'
```

## 组件 API

| 组件 | 主要属性 | 默认尺寸 / 行为 |
| --- | --- | --- |
| `WindowsClientFrame` | `titleBar`、`sidebar`、`navigationPanel`、`navigationPanelWidth`、`children`、`contentMaxWidth`、`rightPanel`、`rightPanelWidth`、`overlayLayer`、`className` | 填满父容器；标题栏 40px，左导航 240px；可选列表栏默认 240px、右侧详情栏默认 360px；内容区独立滚动并留白 24px，可设置内容最大宽度并居中 |
| `WindowsTitleBar` | `title`、`leading`、`actions`、`showWindowControls` | 高 40px；默认显示控制按钮 |
| `WindowsSidebar` | `items`、`activeId`、`onSelect`、`heading`、`footer` | 选中项由调用方控制；项目可提供 `id`、`label`、`icon`、`group` |
| `WindowsControlButtons` | `className` | 只绘制最小化、最大化和关闭图标，不绑定系统窗口操作 |
| `FloatingPanel` | `children`、`placement`、`width`、`className`、`style` | 默认宽 320px；绝对定位在调用方提供的相对定位锚点内；显示状态由调用方控制，可由按钮 hover / focus 或点击触发 |
| `DialogPanel` | `overlayId`、`children`、`title`、`description`、`footer`、`onClose`、`width` | 默认宽 560px；overlayId 必填；调用方条件渲染以控制显隐 |
| `RightDrawer` | `mode`、`overlayId`、`children`、`title`、`description`、`onClose`、`width` | 默认宽 360px；overlay 模式必须提供 overlayId；inline 模式作为内容区第三栏；标题和关闭操作固定，内容区独立滚动 |
| `NotificationToast` | `variant`、`title`、`message`、`onDismiss` | 默认宽 360px、应用画布右上角；状态为 neutral/success/warning/error；不自动消失 |

`DialogPanel` 和 overlay 模式的 `RightDrawer` 需要调用方传入唯一 `overlayId`，分别输出到 `data-overlay` 属性，供页面批注定位。所有弹层保留在当前 React DOM 树中，不使用 Portal。抽屉遮罩只负责视觉呈现，不自行关闭。

## 调用示例

```tsx
import { useState } from 'react'

function Example() {
  const [activeId, setActiveId] = useState('home')
  const [dialogOpen, setDialogOpen] = useState(false)
  return <WindowsClientFrame
    titleBar={<WindowsTitleBar title="应用名称" />}
    sidebar={<WindowsSidebar items={[{ id: 'home', label: '首页' }]} activeId={activeId} onSelect={setActiveId} />}
    overlayLayer={dialogOpen ? <DialogPanel overlayId="example-dialog" title="确认" onClose={() => setDialogOpen(false)}>弹窗内容</DialogPanel> : null}
  >
    <button type="button" onClick={() => setDialogOpen(true)}>打开弹窗</button>
  </WindowsClientFrame>
}
```

## 视觉与布局

- 画布 `#F3F4F6`，表面 `#FFFFFF`，边框 `#E5E7EB`，主文字 `#1F2937`，次级文字 `#6B7280`，主按钮 `#374151`。
- 字体使用 `"Segoe UI", Arial, sans-serif`；控件圆角 6px、卡片圆角 8px。
- 卡片阴影为 `0 1px 3px rgba(17, 24, 39, 0.06)`；弹层阴影略强但保持克制。
- 框架尺寸跟随传入的画布容器；项目原型画布保持 1920×1080 CSS 像素，由工作台等比缩放。
- `WindowsClientFrame.rightPanel` 放置 inline 抽屉；overlay 抽屉、弹窗和 toast 放入 `overlayLayer`。
- `RightDrawer` 的标题栏与关闭按钮始终固定在抽屉顶部；长内容只在抽屉内容区滚动，保证用户随时可以关闭。
- 锚定浮层可在触发按钮 hover 或键盘 focus 时打开；指针从按钮移动到浮层时保持打开，指针和键盘焦点都离开按钮与面板组成的交互区域后关闭。点击可作为触屏或显式操作的打开方式。
- 三栏组合为左导航、主内容、右侧面板；提供 `navigationPanel` 后，在左导航和主内容之间增加一栏，形成四栏。宽度分别由 `navigationPanelWidth` 和 `rightPanelWidth` 控制。
- 两栏组合为左导航和主内容；设置 `contentMaxWidth` 后，内容在主滚动区域内居中并保留两侧留白，适用于 Telegram 式聚焦内容布局。未设置时，内容保持原有自然宽度行为。
- `rightPanel` 的关闭 / 折叠由调用方控制：在右侧内容提供关闭操作，回调中移除 `rightPanel`；四栏会自然退为保留列表栏的三栏，三栏会退为两栏。调用方可在主内容中提供恢复操作，重新挂载右侧插槽。
- 组件提供键盘焦点可见样式。关闭回调只转发用户操作，不处理遮罩点击、焦点陷阱、自动关闭或 OS 窗口控制。

## 不包含

不包含路由、导航数据源、真实窗口控制、弹层业务状态、遮罩点击关闭、通知计时器、Portal、焦点陷阱和拖拽窗口。
