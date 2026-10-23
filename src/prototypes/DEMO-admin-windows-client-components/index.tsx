import { useState } from 'react'
import { Bell, Blocks, ChevronDown, LayoutDashboard, Settings, SlidersHorizontal } from 'lucide-react'
import {
  DialogPanel,
  FloatingPanel,
  NotificationToast,
  RightDrawer,
  WindowsClientFrame,
  WindowsSidebar,
  WindowsTitleBar,
} from '@/components/WindowsClient'
import type { NotificationVariant } from '@/components/WindowsClient'
import './style.css'

const navigation = [
  { id: 'overview', label: '概览', icon: <LayoutDashboard size={15} />, group: '工作台' },
  { id: 'components', label: '公共组件', icon: <Blocks size={15} />, group: '工作台' },
  { id: 'settings', label: '设置', icon: <Settings size={15} />, group: '系统' },
]

const variants: NotificationVariant[] = ['neutral', 'success', 'warning', 'error']
const conversationItems = [
  { id: 'design', title: '设计评审', summary: '组件结构与信息层级评审' },
  { id: 'prototype', title: '原型协作', summary: '列表栏与内容区交互讨论' },
  { id: 'delivery', title: '版本同步', summary: '整理本周交付与变更记录' },
  { id: 'support', title: '用户反馈', summary: '查看近期问题与处理状态' },
]

export default function DemoAdminWindowsClientComponents() {
  const [activeNav, setActiveNav] = useState('components')
  const [columnMode, setColumnMode] = useState<'two' | 'three' | 'four' | 'three-with-list'>('two')
  const [activeConversationId, setActiveConversationId] = useState('design')
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [drawerMode, setDrawerMode] = useState<'overlay' | 'inline'>('inline')
  const [toastVariant, setToastVariant] = useState<NotificationVariant | null>(null)

  const closeDrawer = () => setDrawerOpen(false)
  const hasRightPanel = columnMode === 'three' || columnMode === 'four'
  const hasNavigationPanel = columnMode === 'four' || columnMode === 'three-with-list'
  const inlineDrawer = hasRightPanel && drawerOpen && drawerMode === 'inline'
  const activeConversation = conversationItems.find((item) => item.id === activeConversationId) ?? conversationItems[0]
  const collapseRightPanel = () => setColumnMode((current) => current === 'four' ? 'three-with-list' : current === 'three' ? 'two' : current)
  const restoreRightPanel = () => setColumnMode((current) => current === 'three-with-list' ? 'four' : current === 'two' ? 'three' : current)

  return <WindowsClientFrame
    className="windows-client-gallery"
    titleBar={<WindowsTitleBar title="原型工作台" leading={<span className="gallery-app-mark">W</span>} />}
    sidebar={<WindowsSidebar items={navigation} activeId={activeNav} onSelect={setActiveNav} heading="工作台" footer={<span>组件版本 1.0</span>} />}
    navigationPanel={hasNavigationPanel ? <GalleryListPanel activeId={activeConversationId} onSelect={setActiveConversationId} /> : undefined}
    contentMaxWidth={columnMode === 'two' ? 1200 : undefined}
    rightPanel={hasRightPanel
      ? inlineDrawer
        ? <RightDrawer mode="inline" title={activeConversation.title} description="固定在主内容右侧的详情栏" onClose={collapseRightPanel}><DrawerContent summary={activeConversation.summary} /></RightDrawer>
        : <GalleryContextPanel conversation={activeConversation} onCollapse={collapseRightPanel} />
      : undefined}
    overlayLayer={<>
      {drawerOpen && drawerMode === 'overlay' && <RightDrawer mode="overlay" overlayId="gallery-drawer" title="抽屉示例" description="覆盖在当前页面上的右侧面板" onClose={closeDrawer}><DrawerContent summary={activeConversation.summary} /></RightDrawer>}
      {dialogOpen && <DialogPanel overlayId="gallery-dialog" title="标准弹窗" description="弹窗由调用页面控制显隐与关闭逻辑" onClose={() => setDialogOpen(false)} footer={<><button type="button" className="gallery-button" onClick={() => setDialogOpen(false)}>取消</button><button type="button" className="gallery-button gallery-button--primary" onClick={() => setDialogOpen(false)}>确认</button></>}>
        <p className="gallery-body-copy">这里放置弹窗的正文内容。组件提供固定尺寸、灰阶遮罩与标题区域。</p>
        <label className="gallery-field-label" htmlFor="dialog-note">备注</label><input id="dialog-note" className="gallery-input" defaultValue="可用键盘聚焦和编辑" />
      </DialogPanel>}
      {toastVariant && <NotificationToast variant={toastVariant} title={`${variantLabel(toastVariant)}通知`} message="通知卡片提供灰阶状态样式，不会自动消失。" onDismiss={() => setToastVariant(null)} />}
    </>}
  >
    <div className="gallery-page">
      <header className="gallery-page__header">
        <div><div className="gallery-eyebrow">组件库 / Windows 客户端</div><h1>公共组件</h1><p>可直接组合到 1920 × 1080 客户端原型中的框架与浮层组件。</p></div>
        <div className="gallery-page__actions">
          {(columnMode === 'two' || columnMode === 'three-with-list') && <button type="button" className="gallery-button" onClick={restoreRightPanel}>展开最右栏</button>}
          <button type="button" className="gallery-button" onClick={() => setToastVariant('neutral')}><Bell size={15} />通知示例</button>
        </div>
      </header>

      <section className="gallery-section">
        <div className="gallery-section__heading"><div><h2>窗口框架</h2><p>切换栏位，比较聚焦内容与列表详情的组织方式。</p></div><span className="gallery-tag">WindowsClientFrame</span></div>
        <div className="gallery-layout-controls"><div className="gallery-segment" role="group" aria-label="框架栏位"><button type="button" aria-pressed={columnMode === 'two'} onClick={() => setColumnMode('two')}>两栏</button><button type="button" aria-pressed={columnMode === 'three' || columnMode === 'three-with-list'} onClick={() => setColumnMode('three')}>三栏</button><button type="button" aria-pressed={columnMode === 'four'} onClick={() => setColumnMode('four')}>四栏</button></div><span>{columnMode === 'two' ? '导航 240 · 内容最大宽度 1200（居中）' : columnMode === 'three' ? '导航 240 · 主内容 · 详情 360' : columnMode === 'three-with-list' ? '导航 240 · 列表 240 · 主内容（详情栏已收起）' : '导航 240 · 列表 240 · 主内容 · 详情 360'}</span></div>
        <div className="gallery-card gallery-frame-summary">
          <div className="gallery-summary-item"><span>标题栏</span><strong>40 px</strong></div><div className="gallery-summary-item"><span>左侧导航</span><strong>240 px</strong></div><div className="gallery-summary-item"><span>可选列表栏</span><strong>240 px</strong></div><div className="gallery-summary-item"><span>右侧详情栏</span><strong>360 px</strong></div><div className="gallery-summary-item"><span>内容留白</span><strong>24 px</strong></div><div className="gallery-summary-item"><span>卡片间距</span><strong>16 px</strong></div>
        </div>
      </section>

      <section className="gallery-section">
        <div className="gallery-section__heading"><div><h2>浮层与抽屉</h2><p>状态由展示页控制；锚定浮层宽 320px，抽屉宽 360px。</p></div><span className="gallery-tag">Popover · Drawer</span></div>
        <div className="gallery-grid gallery-grid--2">
          <article className="gallery-card gallery-demo-card"><div className="gallery-demo-card__heading"><div><h3>锚定浮层</h3><p>默认宽度 320px，可选择四个锚定方向。</p></div></div>
            <div className="gallery-popover-anchor"><button type="button" className="gallery-button" aria-expanded={popoverOpen} onClick={() => setPopoverOpen(!popoverOpen)}><SlidersHorizontal size={15} />筛选条件<ChevronDown size={14} /></button>
              {popoverOpen && <FloatingPanel placement="bottom-start"><strong className="gallery-panel-title">筛选条件</strong><label className="gallery-check"><input type="checkbox" defaultChecked />显示已启用项目</label><label className="gallery-check"><input type="checkbox" />只看最近更新</label><button type="button" className="gallery-button gallery-button--primary gallery-panel-action" onClick={() => setPopoverOpen(false)}>应用筛选</button></FloatingPanel>}
            </div>
          </article>
          <article className="gallery-card gallery-demo-card"><div className="gallery-demo-card__heading"><div><h3>右侧抽屉</h3><p>可覆盖页面，或替换右侧详情栏。</p></div></div>
            <div className="gallery-drawer-controls"><div className="gallery-segment" role="group" aria-label="抽屉模式"><button type="button" aria-pressed={drawerMode === 'overlay'} onClick={() => { setDrawerMode('overlay'); setDrawerOpen(false) }}>Overlay</button><button type="button" aria-pressed={drawerMode === 'inline'} onClick={() => { setDrawerMode('inline'); setDrawerOpen(false) }}>Inline</button></div><button type="button" className="gallery-button gallery-button--primary" onClick={() => setDrawerOpen(!drawerOpen)}>{drawerOpen ? '关闭抽屉' : '打开抽屉'}</button></div>
          </article>
        </div>
      </section>

      <section className="gallery-section">
        <div className="gallery-section__heading"><div><h2>弹窗与消息通知</h2><p>标准弹窗宽 560px，通知卡片宽 360px，状态统一使用灰阶。</p></div><span className="gallery-tag">Dialog · Toast</span></div>
        <div className="gallery-grid gallery-grid--2">
          <article className="gallery-card gallery-demo-card"><div className="gallery-demo-card__heading"><div><h3>标准弹窗</h3><p>在 DOM 内渲染，支持 data-overlay 标记。</p></div></div><button type="button" className="gallery-button gallery-button--primary" onClick={() => setDialogOpen(true)}>打开弹窗</button></article>
          <article className="gallery-card gallery-demo-card"><div className="gallery-demo-card__heading"><div><h3>通知状态</h3><p>选择状态查看右上角通知卡片。</p></div></div><div className="gallery-variant-buttons">{variants.map((variant) => <button type="button" className="gallery-button" key={variant} onClick={() => setToastVariant(variant)}>{variantLabel(variant)}</button>)}</div></article>
        </div>
        <div className="gallery-toast-list">{variants.map((variant) => <NotificationToast key={variant} variant={variant} message={`${variantLabel(variant)}状态的中性灰阶表达`} />)}</div>
      </section>
      <footer className="gallery-footer">组件由调用方控制显隐、导航选中、遮罩关闭和通知生命周期。</footer>
    </div>
  </WindowsClientFrame>
}

function GalleryListPanel({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return <nav className="gallery-list-panel" aria-label="会话列表"><div className="gallery-list-panel__heading"><span>会话</span><button type="button" aria-label="会话列表选项">•••</button></div><label className="gallery-list-search"><span>搜索</span><input aria-label="搜索会话" placeholder="搜索会话" /></label><div className="gallery-list-panel__items">{conversationItems.map((item) => <button type="button" key={item.id} className={`gallery-list-item${activeId === item.id ? ' is-active' : ''}`} aria-pressed={activeId === item.id} onClick={() => onSelect(item.id)}><span className="gallery-list-item__avatar">{item.title.slice(0, 1)}</span><span className="gallery-list-item__copy"><strong>{item.title}</strong><small>{item.summary}</small></span></button>)}</div></nav>
}

function GalleryContextPanel({ conversation, onCollapse }: { conversation: (typeof conversationItems)[number]; onCollapse: () => void }) {
  return <aside className="gallery-context-panel"><header><span>详情</span><button type="button" aria-label="收起最右栏" title="收起最右栏" onClick={onCollapse}>×</button></header><div className="gallery-context-panel__content"><div className="gallery-context-panel__avatar">{conversation.title.slice(0, 1)}</div><strong>{conversation.title}</strong><span className="gallery-context-panel__meta">当前列表选中项</span><p>{conversation.summary}</p><div className="gallery-context-panel__divider" /><dl><div><dt>类型</dt><dd>讨论组</dd></div><div><dt>成员</dt><dd>8 人</dd></div><div><dt>更新</dt><dd>刚刚</dd></div></dl></div></aside>
}

function DrawerContent({ summary }: { summary: string }) {
  return <div className="gallery-drawer-content"><div className="gallery-drawer-placeholder">图</div><h3>面板内容区域</h3><p>{summary}。内容独立滚动，顶部标题栏和关闭按钮保持可见。</p><div className="gallery-drawer-content__details">{Array.from({ length: 16 }, (_, index) => <div key={index}><span>资料字段 {String(index + 1).padStart(2, '0')}</span><strong>滚动示例内容</strong></div>)}</div><button type="button" className="gallery-button">次要操作</button></div>
}

function variantLabel(variant: NotificationVariant) {
  return { neutral: '中性', success: '成功', warning: '警告', error: '错误' }[variant]
}
