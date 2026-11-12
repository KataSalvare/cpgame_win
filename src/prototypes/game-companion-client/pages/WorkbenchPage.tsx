import { useEffect, useState } from 'react'
import { X, LayoutDashboard, ClipboardList, SlidersHorizontal, WalletCards, Zap, Swords } from 'lucide-react'
import type { WorkbenchLogic, WorkOrder } from '../hooks/useWorkbenchLogic'
import { AvatarMark } from '../components/AvatarMark'
import { UserNameWithLevel } from '../components/UserNameWithLevel'
import { PageStatePanel } from '../components/PageStatePanel'
import { WorkbenchMatchesPanel } from '../components/WorkbenchMatchesPanel'
import { WorkbenchOrderActions } from '../components/WorkbenchOrderDetailPanel'
import { WorkbenchOrdersPanel } from '../components/WorkbenchOrdersPanel'
import { WorkbenchServicesPanel } from '../components/WorkbenchServicesPanel'
import { BeanWithdrawPanel, WalletLedgerPanel } from './AccountPages'
import type { WalletTransaction } from '../data/accountMockData'
import { ConfirmationDialog } from '@/themes/grayscale-prototype/components/ConfirmationDialog'

type Props = { logic: WorkbenchLogic; pageState: 'normal' | 'loading' | 'empty' | 'error'; onRetry: () => void; balance: number; availableBeanBalance: number; pendingBeanSettlementBalance: number; entries: readonly WalletTransaction[]; onWithdraw: (amount: number) => boolean; onOpenExchange: () => void; onContactMatch: (request: WorkbenchLogic['requests'][number]) => void; initialTab?: '总览' | '匹配请求' | '订单' | '服务管理' | '糖豆钱包'; initialApplicationOpen?: boolean; onTabChange?: (tab: '总览' | '匹配请求' | '订单' | '服务管理' | '糖豆钱包') => void; onApplicationClose?: () => void }
const openReceivingOrderRoute = (orderId: string) => { window.location.hash = `page=orders&detail=receiving&order=${encodeURIComponent(orderId)}` }
export function WorkbenchPage({ logic: w, pageState, onRetry, balance, availableBeanBalance, pendingBeanSettlementBalance, entries, onWithdraw, onOpenExchange, onContactMatch, initialTab = '总览', initialApplicationOpen = false, onTabChange, onApplicationClose }: Props) {
  const [tab, setTab] = useState(initialTab)
  const [matchFilter, setMatchFilter] = useState('全部')
  const [filter, setFilter] = useState('全部')
  const [orderSearch, setOrderSearch] = useState('')
  const [withdraw, setWithdraw] = useState(false)
  const [confirm, setConfirm] = useState<{ id: string; status: string } | null>(null)
  const setSelected = (order: WorkOrder | null) => { w.setSelectedOrderId(order?.id ?? null); if (order) openReceivingOrderRoute(order.id) }
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setConfirm(null); setWithdraw(false) } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  const confirmingAutomatic = confirm?.status === '开启自动抢单' || confirm?.status === '关闭自动抢单'
  const serviceOrderCount = w.orders.filter(o => ['服务中', '待玩家确认'].includes(o.status)).length
  const renderOrder = (o: WorkOrder) => <div className="workbench-order" key={o.id}>
    <button type="button" className="workbench-order__identity" onClick={() => setSelected(o)}>
      <AvatarMark initials={o.playerInitials} size="sm" />
      <span className="workbench-order__identity-copy"><strong><UserNameWithLevel name={o.player} identityId={o.player} /></strong><small>{o.id}</small></span>
    </button>
    <div className="workbench-order__service">{w.serviceLabel(o.serviceId)}</div>
    <div className="workbench-order__quantity"><strong>{o.duration} {o.durationUnit}</strong></div>
    <div className="workbench-order__amount"><strong>{o.amount.toLocaleString()} 金豆</strong></div>
    <span className="workbench-order__status">{o.earlyEndRequested ? '待陪玩确认' : o.status}</span>
    <WorkbenchOrderActions logic={w} orderId={o.id} />
  </div>
  return <div className="client-content account-page personal-center-page workbench-page">
    <div className="workbench-tab-row">
      <nav className="personal-center-tabs" role="tablist" aria-label="工作台模块">{[{ label: '总览', icon: LayoutDashboard }, { label: '匹配请求', icon: Swords }, { label: '订单', icon: ClipboardList }, { label: '服务管理', icon: SlidersHorizontal }, { label: '糖豆钱包', icon: WalletCards }].map(({ label, icon: Icon }) => <button type="button" role="tab" key={label} className={`personal-center-tab${tab === label ? ' is-active' : ''}`} aria-selected={tab === label} onClick={() => { setTab(label as typeof tab); setSelected(null); onTabChange?.(label as typeof tab) }}><Icon size={16} /><span>{label}</span></button>)}</nav>
      <button type="button" className={`client-button workbench-auto-grab ${w.automatic ? 'client-button--primary' : 'client-button--secondary'}`} aria-pressed={w.automatic} onClick={() => setConfirm({ id: 'auto-grab', status: w.automatic ? '关闭自动抢单' : '开启自动抢单' })}><Zap size={18} />{w.automatic ? '关闭自动抢单' : '开启自动抢单'}</button>
    </div>
    {w.feedback && <div className="workbench-feedback" role="status">{w.feedback}<button aria-label="关闭反馈" onClick={() => w.setFeedback('')}><X size={16} /></button></div>}
    {pageState !== 'normal' ? <PageStatePanel state={pageState} title={pageState === 'empty' ? '暂无工作台数据' : '工作台暂不可用'} description={pageState === 'empty' ? '收到匹配请求或订单后会在这里展示。' : '请稍后重试。'} actionLabel="重新加载" onAction={onRetry} /> : <>
      {tab === '总览' && <><div className="client-card workbench-stats">{[['待响应匹配', w.requests.filter(r => r.status === '待响应').length], ['待接单', w.orders.filter(o => o.status === '待接单').length], ['服务中', serviceOrderCount], ['糖豆余额', balance.toLocaleString()]].map(([label, value]) => <section className="account-balance-mini" key={label}><span>{label}</span><strong>{value}</strong></section>)}</div><section className="client-card workbench-section"><h2>匹配请求</h2>{w.requests.map(r => <div className="workbench-request" key={r.id}>
        <div className="workbench-request__user"><AvatarMark initials={r.playerInitials} size="sm" /><div className="workbench-request__user-copy"><strong><UserNameWithLevel name={r.player} identityId={r.player} /></strong><small>{r.id}</small></div></div>
        <strong className="workbench-request__service">{w.serviceLabel(r.serviceId)}</strong>
        <div className="workbench-request__price"><strong>{(r.matchPrice * r.quantity).toLocaleString()} 金豆</strong><small>{r.quantity} {r.quantityUnit}</small><small aria-label={`加价 ${r.tipAmount} 金豆`}>+{r.tipAmount} 金豆</small></div>
        <span className="workbench-request__status">{r.status}</span>{r.status === '待响应' ? <div className="workbench-actions"><button className="client-button client-button--secondary" onClick={() => w.respond(r.id, false)}>拒绝</button><button className="client-button client-button--primary" disabled={Boolean(w.activeMatch) || !w.enabled.includes(r.serviceId)} title={w.activeMatch ? '请先取消当前匹配' : undefined} onClick={() => w.respond(r.id, true)}>抢单</button></div> : r.status === '已加入候选名单' ? <div className="workbench-actions"><button type="button" className="client-button client-button--secondary" onClick={() => onContactMatch(r)}>联系老板</button><button type="button" className="client-button client-button--secondary" onClick={() => setConfirm({ id: r.id, status: '取消匹配' })}>取消抢单</button></div> : <span aria-hidden="true">—</span>}
        <div className="workbench-request__note"><strong>备注</strong><span>{r.note || '无'}</span></div>
      </div>)}</section><section className="client-card workbench-section"><h2>待处理订单</h2>{w.orders.filter(o => ['待接单', '待服务', '服务中', '暂停中'].includes(o.status)).map(renderOrder)}</section></>}
      {tab === '匹配请求' && <WorkbenchMatchesPanel logic={w} filter={matchFilter} onFilterChange={setMatchFilter} onCancel={id => setConfirm({ id, status: '取消匹配' })} onContactMatch={onContactMatch} />}
      {tab === '订单' && <WorkbenchOrdersPanel logic={w} filter={filter} onFilterChange={value => { setFilter(value); setSelected(null) }} query={orderSearch} onQueryChange={setOrderSearch} />}
      {tab === '服务管理' && <WorkbenchServicesPanel logic={w} initialApplicationOpen={initialApplicationOpen} onApplicationClose={onApplicationClose} />}
      {tab === '糖豆钱包' && <><section className="client-card workbench-wallet"><div><h2>糖豆钱包</h2><strong>{balance.toLocaleString()} <small>糖豆</small></strong><div className="workbench-wallet__breakdown"><span>可提现 <strong>{availableBeanBalance.toLocaleString()}</strong></span><span>待结算 <strong>{pendingBeanSettlementBalance.toLocaleString()}</strong></span></div></div><div className="workbench-wallet__actions"><button type="button" className="client-button client-button--secondary" onClick={onOpenExchange}>兑换金豆</button><button type="button" className="client-button client-button--primary" onClick={() => setWithdraw(true)}>提现</button></div></section><section className="client-card workbench-section"><h2>收支明细</h2><WalletLedgerPanel entries={entries} /></section></>}
    </>}
    {withdraw && <BeanWithdrawPanel balance={availableBeanBalance} onWithdraw={onWithdraw} onClose={() => setWithdraw(false)} />}
    {confirm?.status === '取消匹配' && <ConfirmationDialog overlayId="companion-workbench-cancel-match-confirm" title="取消抢单" message="需要和老板确认后再取消，否则老板可能会投诉你哦~" confirmLabel="确认取消抢单" onCancel={() => setConfirm(null)} onConfirm={() => { w.cancelMatch(confirm.id); setConfirm(null) }} />}
    {confirmingAutomatic && confirm && <ConfirmationDialog overlayId="companion-workbench-auto-grab-confirm" title={`${confirm.status}？`} message={confirm.status === '开启自动抢单' ? '开启后将自动接受已开启服务的匹配请求，同时只接受一个匹配。正式订单仍需手动接受。' : '关闭后将由你手动接受匹配请求，当前已接受的匹配会保留。'} confirmLabel={`确认${confirm.status}`} onCancel={() => setConfirm(null)} onConfirm={() => { w.toggleAutomatic(confirm.status === '开启自动抢单'); setConfirm(null) }} />}
    {confirm && confirm.status !== '取消匹配' && !confirmingAutomatic && <div className="workbench-overlay" data-overlay="companion-workbench-confirm" onClick={e => { if (e.target === e.currentTarget) { setConfirm(null); setSelected(null) } }}><section className="client-card workbench-dialog" role="dialog" aria-modal="true" aria-label="订单操作确认"><button className="workbench-dialog-close" aria-label="关闭" onClick={() => { setConfirm(null); setSelected(null) }}><X size={20} /></button><h2>{confirm.status === '已取消' ? '拒绝订单？' : '完成服务？'}</h2><p>{confirm.status === '已取消' ? '订单将自动取消并退款，同时通知玩家。' : '将通知玩家确认；24 小时未确认，订单自动完成。'}</p><div className="workbench-confirm-actions"><button type="button" className="client-button client-button--secondary" onClick={() => setConfirm(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { w.updateOrder(confirm.id, confirm.status); setConfirm(null) }}>确认</button></div></section></div>}
  </div>
}
