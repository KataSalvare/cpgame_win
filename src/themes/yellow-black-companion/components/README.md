# 黄黑陪玩平台组件

业务页面从 `@/themes/yellow-black-companion/components` 导入组件；在使用范围外层放置 `CompanionTheme`。组件样式随模块引入，仅作用于 `yb-` 命名空间。原有 `WindowsClient` 的窗口框架、抽屉与标题栏可继续复用；此组件集不改变灰阶主题或全局调色。

```tsx
import { useState } from 'react'
import { Button, CompanionTheme, Dialog, TextField } from '@/themes/yellow-black-companion/components'

function Example() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  return <CompanionTheme className="example-stage">
    <TextField label="昵称" value={name} onChange={event => setName(event.target.value)} />
    <Button variant="primary" shape="pill" onClick={() => setOpen(true)}>保存</Button>
    <Dialog open={open} overlayId="example-confirm" title="确认保存" onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>关闭</Button>}>
      保存当前修改？
    </Dialog>
  </CompanionTheme>
}
```

`example-stage` 须提供 `position: relative` 与明确尺寸，弹窗遮罩覆盖最近的定位祖先。`overlayId` 必须在页面内唯一；弹窗不使用 Portal，支持 Esc、焦点循环、关闭后恢复焦点及点击遮罩关闭。调用方负责实际保存、删除和提交等业务行为；危险操作应说明后果。

常规操作按钮（主、次要、浅灰、危险及禁用）统一使用液态玻璃风格，默认 48px 高；表格行内操作使用 88×30px 紧凑变体，详见主题 DESIGN.md 的数据表格规范；筛选、导航和菜单项按各自组件规范保持紧凑尺寸。标准公共弹窗采用 375px 宽，标题与正文、正文与按钮间隔均为 20px；双操作等宽横排、间距 11px（取消在左、确认在右），单操作占满操作区；`Dialog` 及 `CompanionDialogPanel` 均采用该规范。`CompanionDialogPanel` 基于 WindowsClient 的 `DialogPanel`，其显示与键盘行为仍由调用方管理。

`NoticeDialog` 复用标准弹窗，`children` 接收须知内容，`onConfirm` / `onClose` 由页面处理；可通过 `reminder` 传入 `label`、`checked` 和 `onChange`。组件不自行持久化“不再提醒”。

组件：`NoticeDialog`、`CompanionDialogPanel`、`Button`（primary / secondary / danger / soft，统一液态玻璃及胶囊圆角；保留 shape 参数兼容现有调用）、`TextField`（label、error、原生输入属性）、`SegmentedControl`（受控 value/onChange）、`Switch`（受控 checked/onChange）、`Badge`、`Tag`、`Avatar`、`Card`、`Message`、`Navigation`、`Conversation`、`Menu`（受控回调）、`Dialog`（受控 open/onClose）。组合表格可使用主题的 `yb-table` / `yb-table-wrap` 类，特殊分享卡使用 `yb-share`；页面数据与操作由调用方提供。`Menu` 支持触发、选中、点击外部和 Esc 关闭；本版未提供方向键菜单导航。

`GlassButton` 提供 `primary`、`secondary` 两种液态玻璃样式，接受原生 button 属性；高保真原型可直接使用，灰阶模式回退到原有按钮样式。
