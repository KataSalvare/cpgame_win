import { useState } from 'react'
import { Home, MessageSquare } from 'lucide-react'
import { FloatingPanel, NotificationToast, RightDrawer, WindowsClientFrame, WindowsControlButtons, WindowsSidebar, WindowsTitleBar } from '@/components/WindowsClient'
import type { NotificationVariant } from '@/components/WindowsClient'
import { Button, CompanionDialogPanel } from './components'

const items = [{ id: 'home', label: '首页', icon: <Home size={16}/> }, { id: 'messages', label: '消息', icon: <MessageSquare size={16}/>, badge: 8 }]
const variants: { type: NotificationVariant; title: string; text: string }[] = [
  {type:'neutral',title:'通知',text:'有新的消息'}, {type:'success',title:'成功',text:'设置已保存'},
  {type:'warning',title:'注意',text:'请确认服务信息'}, {type:'error',title:'错误',text:'操作失败，请重试'},
]
export default function WindowsSamples() {
  const [active, setActive] = useState('messages')
  const [dialog, setDialog] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [popover, setPopover] = useState(false)
  const [toast, setToast] = useState<NotificationVariant | null>(null)
  return <section className="yb-windows-samples" aria-label="Windows 客户端公共组件">
    <header className="yb-samples__header"><h2>Windows 客户端公共组件</h2><span className="yb-size">实际尺寸</span></header>
    <div className="yb-block yb-windows-block"><h3>窗口框架、标题栏与侧栏</h3>
      <div className="yb-frame-scroll"><div className="yb-frame-stage">
        <WindowsClientFrame titleBar={<WindowsTitleBar title="超速电竞" onClose={() => setDialog(true)} />} sidebar={<WindowsSidebar items={items} activeId={active} onSelect={setActive} />} rightPanel={<RightDrawer mode="inline" title="用户资料" width={360}><p>认真玩玩</p><p>在线 · 游戏陪玩</p></RightDrawer>} overlayLayer={<>
          {dialog && <CompanionDialogPanel overlayId="yb-windows-dialog" title="确认关闭" onClose={() => setDialog(false)} footer={<><Button variant="soft" onClick={() => setDialog(false)}>取消</Button><Button variant="primary" onClick={() => setDialog(false)}>确认</Button></>}>确定关闭当前窗口吗？</CompanionDialogPanel>}
          {drawer && <RightDrawer mode="overlay" overlayId="yb-windows-drawer" title="资料详情" onClose={() => setDrawer(false)}><p>认真玩玩</p><p>在线 · 游戏陪玩</p></RightDrawer>}
          {toast && <NotificationToast variant={toast} message="操作反馈示例" onDismiss={() => setToast(null)} />}
        </>}>
          <div className="yb-frame-content"><strong>{active === 'home' ? '首页' : '消息'}</strong><p>玩家 · 认真玩玩</p><div className="yb-row"><Button onClick={() => setDialog(true)}>打开弹窗</Button><Button onClick={() => setDrawer(true)}>打开抽屉</Button><Button onClick={() => setToast('success')}>显示通知</Button></div>
            <div className="yb-floating-anchor"><Button aria-expanded={popover} onClick={() => setPopover(!popover)}>筛选条件</Button>{popover && <FloatingPanel placement="bottom-start"><strong>筛选条件</strong><p>在线状态</p><Button onClick={() => setPopover(false)}>完成</Button></FloatingPanel>}</div>
          </div>
        </WindowsClientFrame>
      </div></div>
    </div>
    <div className="yb-windows-grid">
      <article className="yb-block"><h3>窗口控制按钮</h3><div className="yb-controls-stage"><WindowsControlButtons onClose={() => setDialog(true)}/></div></article>
      <article className="yb-block"><h3>锚定浮层</h3><div className="yb-popover-stage"><FloatingPanel placement="bottom-start"><strong>筛选条件</strong><p>在线状态</p><Button onClick={() => setPopover(!popover)}>应用筛选</Button></FloatingPanel></div></article>
      <article className="yb-block yb-windows-dialog-sample"><h3>公共弹窗</h3><div className="yb-overlay-stage"><CompanionDialogPanel overlayId="yb-static-dialog" title="确认操作" footer={<><Button variant="soft" onClick={() => setDialog(true)}>取消</Button><Button variant="primary" onClick={() => setDialog(true)}>确认</Button></>}>请确认当前操作。</CompanionDialogPanel></div></article>
      <article className="yb-block"><h3>右侧抽屉</h3><div className="yb-drawer-stage"><RightDrawer mode="inline" title="用户资料" width={360}><p>认真玩玩</p><p>在线 · 游戏陪玩</p></RightDrawer></div></article>
      <article className="yb-block yb-notification-sample"><h3>通知</h3><div className="yb-notification-list">{variants.map(item => <div className="yb-notification-stage" key={item.type}><NotificationToast variant={item.type} title={item.title} message={item.text}/></div>)}</div></article>
    </div>
  </section>
}
