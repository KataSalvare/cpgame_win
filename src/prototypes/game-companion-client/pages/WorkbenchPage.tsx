import { useEffect, useState } from 'react'
import { X, LayoutDashboard, ClipboardList, SlidersHorizontal, WalletCards, Zap, Swords } from 'lucide-react'
import type { WorkbenchLogic, WorkOrder } from '../hooks/useWorkbenchLogic'
import { games } from '../data/mockData'
import { AvatarMark } from '../components/AvatarMark'
import { PageStatePanel } from '../components/PageStatePanel'
import { WorkbenchMatchesPanel } from '../components/WorkbenchMatchesPanel'
import { WorkbenchOrderActions } from '../components/WorkbenchOrderDetailPanel'
import { WorkbenchServicesPanel } from '../components/WorkbenchServicesPanel'
import { BeanWithdrawPanel, WalletLedgerPanel } from './AccountPages'

type Props = { logic: WorkbenchLogic; pageState: 'normal' | 'loading' | 'empty' | 'error'; onRetry: () => void; balance: number; entries: readonly { id: string; title: string; date: string; amount: number }[]; onWithdraw: (amount: number) => boolean; onOpenExchange: () => void }
export function WorkbenchPage({ logic: w, pageState, onRetry, balance, entries, onWithdraw, onOpenExchange }: Props) {
  const [tab, setTab] = useState('总览')
  const [matchFilter, setMatchFilter] = useState('全部')
  const [filter, setFilter] = useState('全部')
  const [withdraw, setWithdraw] = useState(false)
  const [confirm, setConfirm] = useState<{ id: string; status: string } | null>(null)
  const selected = w.selectedOrder
  const setSelected = (order: WorkOrder | null) => w.setSelectedOrderId(order?.id ?? null)
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setConfirm(null); setWithdraw(false) } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  const confirmingAutomatic = confirm?.status === '开启自动抢单' || confirm?.status === '关闭自动抢单'
  const renderOrder = (o: WorkOrder) => <div className="workbench-order" key={o.id}><button className="workbench-order__identity" onClick={() => setSelected(o)}><strong>{o.player}</strong><span>{o.id}</span></button><div>{w.serviceLabel(o.serviceId)}<small>{o.duration} {o.durationUnit} · {o.amount} 钻石</small></div><span>{o.status}</span><div className="workbench-actions">{o.status === '待接单' && <><button className="client-button client-button--secondary" onClick={() => w.setOrderAction({ id: o.id, action: '取消' })}>取消</button><button className="client-button client-button--primary" onClick={() => w.setOrderAction({ id: o.id, action: '接收' })}>接收</button></>}{o.status === '待服务' && <button className="client-button client-button--primary" onClick={() => w.setOrderAction({ id: o.id, action: '开始服务' })}>开始服务</button>}{o.status === '服务中' && <><button className="client-button client-button--primary" onClick={() => w.setOrderAction({ id: o.id, action: '完成服务' })}>完成服务</button><button className="client-button client-button--secondary" onClick={() => w.setOrderAction({ id: o.id, action: '免单' })}>免单</button></>}{o.status === '待玩家确认' && <small>自动完成：{new Date(o.deadline ?? 0).toLocaleString('zh-CN')}</small>}</div></div>
  return <div className="client-content account-page personal-center-page workbench-page">
    <header className="client-page-heading account-page-heading"><h1>陪玩工作台</h1></header>
    <nav className="personal-center-tabs" role="tablist" aria-label="工作台模块">{[{ label: '总览', icon: LayoutDashboard }, { label: '匹配请求', icon: Swords }, { label: '订单', icon: ClipboardList }, { label: '服务管理', icon: SlidersHorizontal }, { label: '糖豆钱包', icon: WalletCards }].map(({ label, icon: Icon }) => <button type="button" role="tab" key={label} className={`personal-center-tab${tab === label ? ' is-active' : ''}`} aria-selected={tab === label} onClick={() => { setTab(label); setSelected(null) }}><Icon size={16} /><span>{label}</span></button>)}</nav>
    <header className="personal-module-heading"><h2>{tab}</h2><button type="button" className={`client-button workbench-auto-grab ${w.automatic ? 'client-button--primary' : 'client-button--secondary'}`} aria-pressed={w.automatic} onClick={() => setConfirm({ id: 'auto-grab', status: w.automatic ? '关闭自动抢单' : '开启自动抢单' })}><Zap size={18} />{w.automatic ? '关闭自动抢单' : '开启自动抢单'}</button></header>
    {w.feedback && <div className="workbench-feedback" role="status">{w.feedback}<button aria-label="关闭反馈" onClick={() => w.setFeedback('')}><X size={16} /></button></div>}
    {pageState !== 'normal' ? <PageStatePanel state={pageState} title={pageState === 'empty' ? '暂无工作台数据' : '工作台暂不可用'} description={pageState === 'empty' ? '收到匹配请求或订单后会在这里展示。' : '请稍后重试。'} actionLabel="重新加载" onAction={onRetry} /> : <>
      {tab === '总览' && <><div className="client-card workbench-stats">{[['待响应匹配', w.requests.filter(r => r.status === '待响应').length], ['待接单', w.orders.filter(o => o.status === '待接单').length], ['服务中', w.orders.filter(o => o.status === '服务中').length], ['糖豆余额', balance.toLocaleString()]].map(([label, value]) => <section className="account-balance-mini" key={label}><span>{label}</span><strong>{value}</strong></section>)}</div><section className="client-card workbench-section"><h2>匹配请求</h2>{w.requests.map(r => <div className="workbench-request" key={r.id}><div><strong>{r.player}</strong><span>{w.serviceLabel(r.serviceId)}</span></div><span>{r.status}</span>{r.status === '待响应' && <div className="workbench-actions"><button className="client-button client-button--secondary" onClick={() => w.respond(r.id, false)}>忽略</button><button className="client-button client-button--primary" disabled={Boolean(w.activeMatch) || !w.enabled.includes(r.serviceId)} title={w.activeMatch ? '请先取消当前匹配' : undefined} onClick={() => w.respond(r.id, true)}>接受匹配</button></div>}{r.status === '已加入候选名单' && <div className="workbench-actions"><button type="button" className="client-button client-button--secondary" onClick={() => setConfirm({ id: r.id, status: '取消匹配' })}>取消匹配</button></div>}</div>)}</section><section className="client-card workbench-section"><h2>待处理订单</h2>{w.orders.filter(o => ['待接单', '待服务', '服务中'].includes(o.status)).map(renderOrder)}</section></>}
      {tab === '匹配请求' && <WorkbenchMatchesPanel logic={w} filter={matchFilter} onFilterChange={setMatchFilter} onCancel={id => setConfirm({ id, status: '取消匹配' })} />}
      {tab === '订单' && <section className="client-card orders-list-card workbench-orders-table">
        <div className="orders-list-card__toolbar"><span className="client-count">{w.orders.filter(o => filter === '全部' || o.status === filter).length} 笔订单</span></div>
        <div className="orders-filter-bar" role="group" aria-label="按工作台订单状态筛选">{['全部', '待接单', '待服务', '服务中', '待玩家确认', '已完成', '已取消', '退款'].map(status => <button type="button" key={status} className={`orders-filter-chip${filter === status ? ' is-active' : ''}`} aria-pressed={filter === status} onClick={() => { setFilter(status); setSelected(null) }}>{status}</button>)}</div>
        {w.orders.some(o => filter === '全部' || o.status === filter) ? <div className="orders-list" role="group" aria-label="工作台订单列表">
          <div className="order-list-header"><span>订单号</span><span>玩家信息</span><span>服务信息</span><span>时长</span><span>价格</span><span>状态</span><span>操作</span></div>
          {w.orders.filter(o => filter === '全部' || o.status === filter).map(o => {
            const service = w.services.find(s => s.id === o.serviceId)
            const game = games.find(g => g.id === service?.gameId)
            return <article className={`order-item workbench-order-table-row${selected?.id === o.id ? ' is-selected' : ''}`} key={o.id}><button type="button" className="order-item__main" aria-label={`查看订单 ${o.id}，${o.player}，${o.status}`} onClick={() => setSelected(o)}>
              <span className="order-item__info"><strong>{o.id}</strong><small>{o.createdAt}</small></span>
              <span className="order-item__companion"><AvatarMark initials={o.playerInitials} size="sm" /><strong>{o.player}</strong></span>
              <span className="order-item__service"><strong>{game?.name} · {service?.playName}</strong><small>{service?.levelName} · {service?.name}</small></span>
              <span className="order-item__duration">{o.duration} {o.durationUnit}</span>
              <span className="order-item__price"><strong>{o.unitPrice} 钻石 / {o.durationUnit}</strong><small>合计 {o.amount} 钻石</small></span>
              <span className={`order-item__status order-item__status--${o.status === '已取消' ? 'cancelled' : o.status === '退款' ? 'refund' : o.status === '已完成' ? 'completed' : 'active'}`}>{o.status}</span>
            </button><WorkbenchOrderActions logic={w} orderId={o.id} /></article>
          })}
        </div> : <div className="account-empty-inline"><strong>没有符合条件的订单</strong></div>}
      </section>}
      {tab === '服务管理' && <WorkbenchServicesPanel logic={w} />}
      {tab === '糖豆钱包' && <><section className="client-card workbench-wallet"><div><h2>糖豆钱包</h2><strong>{balance.toLocaleString()} <small>糖豆</small></strong></div><div className="workbench-wallet__actions"><button type="button" className="client-button client-button--secondary" onClick={onOpenExchange}>兑换钻石</button><button type="button" className="client-button client-button--primary" onClick={() => setWithdraw(true)}>提现</button></div></section><section className="client-card workbench-section"><h2>收支明细</h2><WalletLedgerPanel entries={entries} /></section></>}
    </>}
    {withdraw && <BeanWithdrawPanel balance={balance} onWithdraw={onWithdraw} onClose={() => setWithdraw(false)} />}
    {confirm && <div className="workbench-overlay" data-overlay="companion-workbench-confirm" onClick={e => { if (e.target === e.currentTarget) { setConfirm(null); setSelected(null) } }}><section className="client-card workbench-dialog" role="dialog" aria-modal="true" aria-label={confirmingAutomatic ? '自动抢单确认' : confirm?.status === '取消匹配' ? '取消匹配确认' : confirm ? '订单操作确认' : '订单详情'}><button className="workbench-dialog-close" aria-label="关闭" onClick={() => { setConfirm(null); setSelected(null) }}><X size={20} /></button>{confirm ? <><h2>{confirmingAutomatic ? `${confirm.status}？` : confirm.status === '取消匹配' ? '取消匹配？' : confirm.status === '已取消' ? '拒绝订单？' : '完成服务？'}</h2><p>{confirmingAutomatic ? (confirm.status === '开启自动抢单' ? '开启后将自动接受已开启服务的匹配请求，同时只接受一个匹配。正式订单仍需手动接受。' : '关闭后将由你手动接受匹配请求，当前已接受的匹配会保留。') : confirm.status === '取消匹配' ? '取消后将退出该玩家的候选名单，可以接受其他匹配请求。' : confirm.status === '已取消' ? '订单将自动取消并退款，同时通知玩家。' : '将通知玩家确认；24 小时未确认，订单自动完成。'}</p><div className="workbench-confirm-actions"><button type="button" className="client-button client-button--secondary" onClick={() => setConfirm(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { if (confirmingAutomatic) w.toggleAutomatic(confirm.status === '开启自动抢单'); else if (confirm.status === '取消匹配') w.cancelMatch(confirm.id); else w.updateOrder(confirm.id, confirm.status); setConfirm(null) }}>{confirmingAutomatic ? '确认' + confirm.status : '确认'}</button></div></> : selected && <><h2>订单详情</h2><p>{selected.id}</p><p>玩家：{selected.player}</p><p>{w.serviceLabel(selected.serviceId)}</p><p>时长：{selected.duration} {selected.durationUnit}</p><p>金额：{selected.amount} 钻石</p><p>状态：{w.orders.find(o => o.id === selected.id)?.status}</p></>}</section></div>}
  </div>
}
