import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Clock3, Coins, CreditCard, Gift, History, LockKeyhole, LogOut, MessageCircle, Settings2, ShieldCheck, Ticket, UserRound, WalletCards, X } from 'lucide-react'
import { AvatarMark } from '../components/AvatarMark'
import { PageStatePanel } from '../components/PageStatePanel'
import { playerProfile, type ClientOrder, type OrderStatus } from '../data/accountMockData'
import type { Companion, Service } from '../data/mockData'

type PageState = 'normal' | 'loading' | 'empty' | 'error'
type StateProps = { pageState: PageState; onRetry: () => void }

function PageState({ pageState, onRetry }: StateProps) {
  if (pageState === 'normal') return null
  return <PageStatePanel
    state={pageState}
    title={pageState === 'empty' ? '暂时没有内容' : '页面暂不可用'}
    description={pageState === 'error' ? '加载遇到问题，请重试。' : '当前没有可展示的内容。'}
    actionLabel={pageState === 'error' ? '重新加载' : '返回个人中心'}
    onAction={onRetry}
  />
}

type PersonalCenterProps = StateProps & {
  diamondBalance: number
  beanBalance: number
  onOpenWallet: () => void
  onOpenOrders: () => void
}

export function PersonalCenterPage({ pageState, onRetry, diamondBalance, beanBalance, onOpenWallet, onOpenOrders }: PersonalCenterProps) {
  const [feedback, setFeedback] = useState('')
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>

  const settings = [
    { id: 'security', label: '账号安全', icon: <LockKeyhole size={17} /> },
    { id: 'notifications', label: '通知设置', icon: <Settings2 size={17} /> },
    { id: 'privacy', label: '隐私设置', icon: <ShieldCheck size={17} /> },
    { id: 'logout', label: '退出登录', icon: <LogOut size={17} /> },
  ]

  return <div className="client-content account-page">
    <PageHeading eyebrow="玩家中心" title="个人中心" description="查看个人资料、账户资产和常用功能。" />
    <section className="client-card account-profile-card">
      <AvatarMark initials={playerProfile.initials} size="lg" />
      <div className="account-profile-card__identity"><h2>{playerProfile.nickname}</h2><span>{playerProfile.gender} · 玩家 ID：P-102860</span></div>
      <div className="account-social-stats">
        <Metric label="朋友" value={playerProfile.friends} />
        <Metric label="关注" value={playerProfile.following} />
        <Metric label="粉丝" value={playerProfile.followers} />
      </div>
    </section>

    <div className="account-overview-grid">
      <section className="client-card account-overview-card">
        <div className="client-section-heading"><div><span className="client-eyebrow">账户资产</span><h2>我的钱包</h2></div><button type="button" className="client-text-button" onClick={onOpenWallet}>钱包总览 <ChevronRight size={15} /></button></div>
        <div className="account-balance-pair"><BalanceMini icon={<Coins size={17} />} label="钻石" value={diamondBalance} /><BalanceMini icon={<WalletCards size={17} />} label="糖豆" value={beanBalance} /></div>
      </section>
      <button type="button" className="client-card account-order-entry" onClick={onOpenOrders}>
        <span className="account-order-entry__icon"><History size={20} /></span><span><strong>我的订单</strong><small>查看服务订单与状态</small></span><ChevronRight size={18} />
      </button>
    </div>

    <section className="client-card account-settings-card">
      <div className="client-section-heading"><div><span className="client-eyebrow">账户偏好</span><h2>常用设置</h2></div><UserRound size={18} className="client-muted" /></div>
      <div className="account-settings-list">{settings.map((item) => <button type="button" key={item.id} onClick={() => setFeedback(item.id === 'logout' ? '退出登录仅作界面演示，当前不会更改登录状态。' : `${item.label}页面暂未纳入本次原型。`)}>{item.icon}<span>{item.label}</span><ChevronRight size={16} /></button>)}</div>
      {feedback && <p className="account-inline-feedback" role="status">{feedback}</p>}
    </section>
  </div>
}

type WalletPageProps = StateProps & {
  diamondBalance: number
  beanBalance: number
  availableCouponCount: number
  ownedPremiumCardCount: number
  onOpenRecharge: () => void
  onOpenDiamondDetails: () => void
  onOpenBeanDetails: () => void
  onOpenCoupons: () => void
  onOpenPremiumCards: () => void
}

export function WalletPage({ pageState, onRetry, diamondBalance, beanBalance, availableCouponCount, ownedPremiumCardCount, onOpenRecharge, onOpenDiamondDetails, onOpenBeanDetails, onOpenCoupons, onOpenPremiumCards }: WalletPageProps) {
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>

  return <div className="client-content account-page">
    <PageHeading eyebrow="账户资产" title="我的钱包" description="查看钻石与糖豆余额及收支明细。" />
    <div className="wallet-card-grid">
      <WalletBalanceCard
        title="钻石钱包"
        description="用于支付陪玩服务订单"
        amount={diamondBalance}
        unit="钻石"
        icon={<Coins size={20} />}
        onToggle={onOpenDiamondDetails}
        onRecharge={onOpenRecharge}
        actionLabel="查看明细"
      />
      <WalletBalanceCard
        title="糖豆钱包"
        description="查看糖豆余额与收支记录"
        amount={beanBalance}
        unit="糖豆"
        icon={<WalletCards size={20} />}
        onToggle={onOpenBeanDetails}
        actionLabel="查看明细"
      />
      <WalletBalanceCard title="优惠券" description="查看可用与历史优惠券" amount={availableCouponCount} unit="张可用" icon={<Ticket size={20} />} onToggle={onOpenCoupons} actionLabel="查看优惠券" />
      <WalletBalanceCard title="我的尊享卡" description="查看已购买的俱乐部尊享卡" amount={ownedPremiumCardCount} unit="张已拥有" icon={<Gift size={20} />} onToggle={onOpenPremiumCards} actionLabel="查看尊享卡" />
    </div>
  </div>
}

function WalletBalanceCard({ title, description, amount, unit, icon, onToggle, onRecharge, actionLabel = '收支明细' }: {
  title: string; description: string; amount: number; unit: string; icon: React.ReactNode; expanded?: boolean; onToggle: () => void; onRecharge?: () => void; actionLabel?: string
}) {
  return <section className="client-card wallet-balance-card">
    <div className="wallet-balance-card__heading"><span className="wallet-balance-card__icon">{icon}</span><div><h2>{title}</h2><p>{description}</p></div></div>
    <span className="client-eyebrow">{title === '优惠券' || title === '我的尊享卡' ? '当前数量' : '当前余额'}</span><strong className="wallet-balance-card__amount">{amount.toLocaleString()} <small>{unit}</small></strong>
    <div className="wallet-balance-card__actions">{onRecharge && <button type="button" className="client-button client-button--primary" onClick={onRecharge}><CreditCard size={15} />充值</button>}<button type="button" className={`client-button ${onRecharge ? 'client-button--secondary' : 'client-button--primary'}`} onClick={onToggle}>{onRecharge && <History size={15} />}{actionLabel}</button></div>
  </section>
}

export function WalletLedgerPanel({ entries }: { entries: readonly { id: string; title: string; date: string; amount: number }[] }) {
  return <div className="client-content account-page wallet-ledger-panel">
    <div className="client-section-heading"><div><span className="client-eyebrow">账户记录</span><h2>{entries.length ? '收支明细' : '暂无明细'}</h2></div><span className="client-count">最近记录</span></div>
    {entries.length ? <TransactionList entries={entries} /> : <div className="account-empty-inline"><History size={22} /><strong>暂无收支记录</strong><span>有新的收支记录时会显示在这里。</span></div>}
  </div>
}

type OrdersPageProps = StateProps & {
  orders: ClientOrder[]
  selectedOrderId: string | null
  onSelectOrder: (orderId: string | null) => void
}
const orderStatuses: OrderStatus[] = ['待接单', '待服务', '服务中', '已完成', '已取消', '退款']

export function OrdersPage({ pageState, onRetry, orders, selectedOrderId, onSelectOrder }: OrdersPageProps) {
  const [filter, setFilter] = useState<'全部' | OrderStatus>('全部')
  const filteredOrders = useMemo(() => filter === '全部' ? orders : orders.filter((order) => order.status === filter), [filter, orders])
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>

  return <div className="client-content account-page">
    <PageHeading eyebrow="服务记录" title="我的订单" description="订单按时间展示，可筛选查看不同服务状态。" />
    <section className="client-card orders-list-card">
      <div className="orders-list-card__toolbar"><div><span className="client-eyebrow">订单记录</span><h2>全部服务</h2></div><label className="client-filter-select"><span>按状态筛选</span><select value={filter} onChange={(event) => { setFilter(event.target.value as '全部' | OrderStatus); onSelectOrder(null) }}><option value="全部">全部状态</option>{orderStatuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label></div>
      {filteredOrders.length === 0 ? <div className="account-empty-inline"><History size={22} /><strong>没有符合条件的订单</strong><span>换一个状态筛选条件试试。</span><button type="button" className="client-button client-button--secondary" onClick={() => setFilter('全部')}>查看全部订单</button></div> : <div className="orders-list">{filteredOrders.map((order) => <OrderCard order={order} key={order.id} selected={selectedOrderId === order.id} onSelect={() => onSelectOrder(order.id)} />)}</div>}
    </section>
  </div>
}

type CheckoutPageProps = StateProps & {
  orderService: { companion: Companion; service: Service; gameName: string } | null
  availableServices: Service[]
  diamondBalance: number
  onBack: () => void
  onOpenWallet: () => void
  onSelectService: (serviceId: string) => void
  onComplete: (quantity: number, amount: number, remark: string) => string | null
  onOpenOrders: () => void
}

export function CheckoutPage({ pageState, onRetry, orderService, availableServices, diamondBalance, onBack, onOpenWallet, onSelectService, onComplete, onOpenOrders }: CheckoutPageProps) {
  const [quantity, setQuantity] = useState(1)
  const [remark, setRemark] = useState('')
  const [servicePickerOpen, setServicePickerOpen] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const [checkoutDialog, setCheckoutDialog] = useState<'payment' | 'recharge' | null>(null)
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>
  if (!orderService) return <div className="client-content account-page"><PageStatePanel state="error" title="找不到这项服务" description="请返回陪玩详情重新选择服务。" actionLabel="返回陪玩详情" onAction={onBack} /></div>

  const { companion, service, gameName } = orderService
  const amount = service.price * quantity
  if (completedOrderId) return <div className="client-content account-page">
    <section className="client-card checkout-success-card"><span className="checkout-success-card__icon"><CheckCircle2 size={30} /></span><span className="client-eyebrow">本地演示反馈</span><h1>订单已提交</h1><p>订单编号：{completedOrderId}</p><div className="checkout-success-card__actions"><button type="button" className="client-button client-button--primary" onClick={onOpenOrders}>查看我的订单</button><button type="button" className="client-button client-button--secondary" onClick={onBack}>返回陪玩详情</button></div></section>
  </div>

  return <div className="client-content account-page">
    <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={15} />返回陪玩详情</button>
    <PageHeading eyebrow="确认服务订单" title="下单结算" description="核对服务内容与时长后，使用钻石钱包支付。" />
    <div className="checkout-grid">
      <section className="client-card checkout-service-card">
        <div className="client-section-heading"><div><span className="client-eyebrow">服务内容</span><h2>已选服务</h2></div><span className="client-badge">单项服务</span></div>
        <div className="checkout-companion"><AvatarMark initials={companion.initials} size="md" /><div><strong>{companion.name}</strong><span>{gameName} · {service.playName}</span></div></div>
        <div className="checkout-service-facts"><span>选择服务</span><div className="checkout-service-picker">
          <button type="button" className="checkout-service-picker__trigger" aria-expanded={servicePickerOpen} onClick={() => setServicePickerOpen((open) => !open)}><span><strong>{service.playName}</strong><small>{service.price} 钻石 / {service.unit}</small></span><ChevronDown size={16} /></button>
          {servicePickerOpen && <div className="checkout-service-picker__panel" role="dialog" aria-label="选择服务">
            <div className="checkout-service-picker__heading"><strong>选择服务</strong><button type="button" className="windows-icon-button" aria-label="关闭服务选择" onClick={() => setServicePickerOpen(false)}><X size={16} /></button></div>
            <div className="checkout-service-picker__list">{availableServices.map((item) => <button type="button" key={item.id} className={`checkout-service-option${item.id === service.id ? ' is-active' : ''}`} aria-pressed={item.id === service.id} disabled={!item.canAcceptOrders} onClick={() => { setQuantity(1); setServicePickerOpen(false); onSelectService(item.id) }}>
              <span className="checkout-service-option__main"><strong>{item.playName}</strong></span><span className="checkout-service-option__price">{item.price} 钻石 / {item.unit}</span>
            </button>)}</div>
          </div>}
        </div></div>
        <fieldset className="checkout-duration"><legend>选择服务时长</legend><div>{[1, 2, 3, 4].map((value) => <button type="button" key={value} className={`client-choice-button${quantity === value ? ' is-active' : ''}`} aria-pressed={quantity === value} onClick={() => setQuantity(value)}>{value} {service.unit}</button>)}</div></fieldset>
        <label className="checkout-remark"><span>订单备注 <small>选填</small></span><textarea value={remark} maxLength={50} onChange={(event) => setRemark(event.target.value)} placeholder="告诉陪玩你的需求，最多50字" rows={3} /><small className="checkout-remark__count">{remark.length}/50</small></label>
      </section>
      <aside className="client-card checkout-summary-card">
        <span className="client-eyebrow">订单摘要</span><h2>支付信息</h2>
        <div className="checkout-summary-line"><span>服务时长</span><strong>{quantity} {service.unit}</strong></div>
        <div className="checkout-summary-line"><span>服务金额</span><strong>{amount.toLocaleString()} 钻石</strong></div>
        <div className="checkout-summary-line checkout-summary-line--balance"><span>钻石余额</span><strong>{diamondBalance.toLocaleString()} 钻石</strong></div>
        <div className="checkout-total"><span>应付金额</span><strong>{amount.toLocaleString()} <small>钻石</small></strong></div>
        {!service.canAcceptOrders ? <div className="checkout-insufficient" role="status"><strong>当前服务暂不可接单</strong><span>请选择其他可接单服务后继续下单。</span><button type="button" className="client-button client-button--secondary" onClick={() => setServicePickerOpen(true)}>选择其他服务</button></div> : <button type="button" className="client-button client-button--primary checkout-pay-button" onClick={() => setCheckoutDialog(diamondBalance >= amount ? 'payment' : 'recharge')}><Coins size={16} />确认</button>}
        <p className="checkout-demo-note">支付结果仅用于原型演示，不会产生真实扣款。</p>
      </aside>
    </div>
    {checkoutDialog && <div className="order-action-overlay checkout-confirm-overlay" data-overlay={checkoutDialog === 'payment' ? 'checkout-payment-confirmation' : 'checkout-recharge-confirmation'} role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setCheckoutDialog(null) }}>
      <section className="order-action-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-confirm-title">
        <header><h2 id="checkout-confirm-title">{checkoutDialog === 'payment' ? '确认支付' : '钻石余额不足'}</h2><button type="button" className="order-action-dialog__close" aria-label="关闭确认弹窗" onClick={() => setCheckoutDialog(null)}><X size={17} /></button></header>
        {checkoutDialog === 'payment' ? <p>将使用钻石钱包支付 <strong>{amount.toLocaleString()} 钻石</strong>，确认提交这笔服务订单吗？</p> : <p>当前钻石余额为 {diamondBalance.toLocaleString()} 钻石，本次应付 {amount.toLocaleString()} 钻石，还差 <strong>{(amount - diamondBalance).toLocaleString()} 钻石</strong>。前往充值页面补充余额吗？</p>}
        <footer><button type="button" className="client-button client-button--secondary" onClick={() => setCheckoutDialog(null)}>{checkoutDialog === 'payment' ? '再想想' : '稍后再说'}</button><button type="button" className="client-button client-button--primary" onClick={() => {
          if (checkoutDialog === 'recharge') { onOpenWallet(); return }
          setCompletedOrderId(onComplete(quantity, amount, remark))
          setCheckoutDialog(null)
        }}>{checkoutDialog === 'payment' ? '确认支付' : '去充值'}</button></footer>
      </section>
    </div>}
  </div>
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="client-page-heading account-page-heading"><div><span className="client-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></header>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="account-metric"><strong>{value}</strong><span>{label}</span></div>
}

function BalanceMini({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="account-balance-mini"><span>{icon}{label}</span><strong>{value.toLocaleString()}</strong></div>
}

function TransactionList({ entries }: { entries: readonly { id: string; title: string; date: string; amount: number }[] }) {
  return <div className="wallet-transaction-list">{entries.map((entry) => <div className="wallet-transaction" key={entry.id}><span className="wallet-transaction__icon"><History size={16} /></span><div><strong>{entry.title}</strong><small>{entry.date}</small></div><strong className={entry.amount > 0 ? 'is-income' : ''}>{entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}</strong></div>)}</div>
}

function OrderCard({ order, selected, onSelect }: { order: ClientOrder; selected: boolean; onSelect: () => void }) {
  return <button type="button" className={`order-item${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={onSelect}>
    <div className="order-item__heading"><span>订单编号：{order.id}</span><span className="client-status">{order.status}</span></div>
    <div className="order-item__main"><AvatarMark initials={order.companionInitials} size="md" /><div className="order-item__details"><strong>{order.serviceName} <span>· {order.gameName}</span></strong><span>陪玩：{order.companionName}</span><small>{order.duration} {order.durationUnit} · {order.createdAt}</small></div><div className="order-item__amount"><strong>{order.amount.toLocaleString()} 钻石</strong><span>订单金额</span></div></div>
  </button>
}

const orderActions: Record<OrderStatus, string[]> = {
  '待接单': ['联系陪玩', '取消订单'],
  '待服务': ['联系陪玩', '取消订单'],
  '服务中': ['联系陪玩', '确认完成', '提前结束'],
  '已完成': ['联系陪玩', '发起售后', '再次下单', '评价'],
  '已取消': ['联系陪玩'],
  '退款': ['联系陪玩'],
}

function orderActionMessage(action: string) {
  if (action === '联系陪玩') return ''
  if (action === '取消订单') return '确认取消这笔订单吗？确认后订单状态将变更为已取消。'
  if (action === '确认完成') return '确认本笔订单已完成吗？确认后订单状态将变更为已完成。'
  if (action === '提前结束') return '提前结束服务仅作原型演示，当前不会修改订单或服务记录。'
  if (action === '发起售后') return '发起售后仅作原型演示，当前不会创建售后记录。'
  if (action === '再次下单') return '再次下单仅作原型演示，当前不会创建新订单。'
  return '评价入口仅作原型演示，当前不会提交评价。'
}

export function OrderDetailPanel({ order, companion, onContact, onReorder, onUpdateStatus }: { order: ClientOrder; companion: Companion | undefined; onContact: () => void; onReorder: () => void; onUpdateStatus: (orderId: string, status: OrderStatus) => void }) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const actionMessage = activeAction ? orderActionMessage(activeAction) : ''
  const needsConfirmation = activeAction === '取消订单' || activeAction === '确认完成'
  return <div className="order-detail-panel">
    <section className="order-detail-status-card">
      <span className="client-eyebrow">订单状态</span>
      <strong className="order-detail-status-card__status">{order.status}</strong>
      <span className="order-detail-status-card__id">{order.id}</span>
      <span className="order-detail-status-card__created">创建时间 {order.createdAt}</span>
    </section>

    <section className="order-detail-section">
      <div className="order-detail-section__heading"><span className="client-eyebrow">服务人员</span><span className="client-status">接单陪玩</span></div>
      <div className="order-detail-companion"><AvatarMark initials={order.companionInitials} size="md" /><div><strong>{order.companionName}</strong><span>{companion ? `${companion.gender} · ${companion.age} 岁 · ${companion.region}` : '陪玩资料'}</span></div></div>
      {companion && <>
        <div className="order-detail-facts"><span>陪玩 ID</span><strong>{companion.id}</strong><span>评分</span><strong>{companion.rating.toFixed(2)}</strong><span>接单状态</span><strong>{companion.status}</strong></div>
        <div className="order-detail-tags">{companion.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </>}
    </section>

    <section className="order-detail-section">
      <div className="order-detail-section__heading"><span className="client-eyebrow">订单信息</span><History size={15} /></div>
      <div className="order-detail-facts"><span>服务项目</span><strong>{order.serviceName}</strong><span>游戏</span><strong>{order.gameName}</strong><span>服务时长</span><strong>{order.duration} {order.durationUnit}</strong><span>订单金额</span><strong>{order.amount.toLocaleString()} 钻石</strong><span>订单备注</span><strong>{order.remark || '无'}</strong><span>创建时间</span><strong>{order.createdAt}</strong></div>
    </section>

    <OrderTimeSection title="服务记录" icon={<Clock3 size={15} />} emptyLabel="暂无服务记录" segments={order.serviceSegments} kind="service" />
    <OrderTimeSection title="售后记录" icon={<MessageCircle size={15} />} emptyLabel="暂无售后记录" segments={order.afterSalesSegments} kind="after-sales" />

    <div className="order-detail-actions" aria-label="订单操作">
      {orderActions[order.status].map((action) => <button type="button" key={action} className={`client-button ${action === '联系陪玩' ? 'client-button--secondary' : 'client-button--primary'}`} onClick={() => action === '联系陪玩' ? onContact() : action === '再次下单' ? onReorder() : setActiveAction(action)}>{action}</button>)}
    </div>

    {activeAction && <div className="order-action-overlay" data-overlay="order-action-confirmation" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setActiveAction(null) }}>
      <section className="order-action-dialog" role="dialog" aria-modal="true" aria-labelledby="order-action-title">
        <header><h2 id="order-action-title">{activeAction}</h2><button type="button" className="order-action-dialog__close" aria-label="关闭提示" onClick={() => setActiveAction(null)}><X size={17} /></button></header>
        <p>{actionMessage}</p>
        <footer>{needsConfirmation ? <><button type="button" className="client-button client-button--secondary" onClick={() => setActiveAction(null)}>返回</button><button type="button" className="client-button client-button--primary" onClick={() => { onUpdateStatus(order.id, activeAction === '取消订单' ? '已取消' : '已完成'); setActiveAction(null) }}>{activeAction === '取消订单' ? '确认取消' : '确认完成'}</button></> : <button type="button" className="client-button client-button--primary" onClick={() => setActiveAction(null)}>知道了</button>}</footer>
      </section>
    </div>}
  </div>
}

function OrderTimeSection({ title, icon, emptyLabel, segments, kind }: {
  title: string
  icon: React.ReactNode
  emptyLabel: string
  segments: ClientOrder['serviceSegments']
  kind: 'service' | 'after-sales'
}) {
  return <section className="order-detail-section order-detail-time-section">
    <div className="order-detail-section__heading"><span className="client-eyebrow">{title}</span>{icon}</div>
    {segments.length === 0 ? <p className="order-detail-empty-record">{emptyLabel}</p> : <div className="order-time-list">{segments.map((segment, index) => <article className="order-time-item" key={segment.id}>
      <strong>{kind === 'service' ? `第 ${index + 1} 段服务` : `第 ${index + 1} 段售后`}</strong>
      <div><span>开始时间</span><time>{segment.startAt ?? '待开始'}</time></div>
      <div><span>结束时间</span><time>{segment.endAt ?? '待结束'}</time></div>
    </article>)}</div>}
  </section>
}
