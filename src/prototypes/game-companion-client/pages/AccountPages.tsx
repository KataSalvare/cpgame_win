import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Coins, CreditCard, History, LockKeyhole, LogOut, Settings2, ShieldCheck, UserRound, WalletCards } from 'lucide-react'
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
  diamondTransactions: typeof import('../data/accountMockData').walletEntries.diamonds
  beanTransactions: typeof import('../data/accountMockData').walletEntries.beans
}

export function WalletPage({ pageState, onRetry, diamondBalance, beanBalance, diamondTransactions, beanTransactions }: WalletPageProps) {
  const [expanded, setExpanded] = useState<'diamonds' | 'beans' | null>(null)
  const [feedback, setFeedback] = useState('')
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>
  const transactionRows = expanded === 'diamonds' ? diamondTransactions : expanded === 'beans' ? beanTransactions : []

  return <div className="client-content account-page">
    <PageHeading eyebrow="账户资产" title="我的钱包" description="查看钻石与糖豆余额及收支明细。" />
    <div className="wallet-card-grid">
      <WalletBalanceCard
        title="钻石钱包"
        description="用于支付陪玩服务订单"
        amount={diamondBalance}
        icon={<Coins size={20} />}
        prominent
        expanded={expanded === 'diamonds'}
        onToggle={() => setExpanded(expanded === 'diamonds' ? null : 'diamonds')}
        onRecharge={() => setFeedback('充值页面暂未纳入本次原型。')}
      />
      <WalletBalanceCard
        title="糖豆钱包"
        description="查看糖豆余额与收支记录"
        amount={beanBalance}
        icon={<WalletCards size={20} />}
        expanded={expanded === 'beans'}
        onToggle={() => setExpanded(expanded === 'beans' ? null : 'beans')}
      />
    </div>
    {expanded && <section className="client-card wallet-ledger-card">
      <div className="client-section-heading"><div><span className="client-eyebrow">账户记录</span><h2>{expanded === 'diamonds' ? '钻石明细' : '糖豆明细'}</h2></div><span className="client-count">最近记录</span></div>
      <TransactionList entries={transactionRows} />
    </section>}
    {feedback && <div className="account-inline-feedback" role="status">{feedback}<button type="button" onClick={() => setFeedback('')}>知道了</button></div>}
  </div>
}

function WalletBalanceCard({ title, description, amount, icon, prominent = false, expanded, onToggle, onRecharge }: {
  title: string; description: string; amount: number; icon: React.ReactNode; prominent?: boolean; expanded: boolean; onToggle: () => void; onRecharge?: () => void
}) {
  return <section className={`client-card wallet-balance-card${prominent ? ' wallet-balance-card--prominent' : ''}`}>
    <div className="wallet-balance-card__heading"><span className="wallet-balance-card__icon">{icon}</span><div><h2>{title}</h2><p>{description}</p></div></div>
    <span className="client-eyebrow">当前余额</span><strong className="wallet-balance-card__amount">{amount.toLocaleString()} <small>{title === '钻石钱包' ? '钻石' : '糖豆'}</small></strong>
    <div className="wallet-balance-card__actions">{onRecharge && <button type="button" className="client-button client-button--primary" onClick={onRecharge}><CreditCard size={15} />充值</button>}<button type="button" className="client-button client-button--secondary" aria-expanded={expanded} onClick={onToggle}><History size={15} />{expanded ? '收起明细' : '收支明细'}</button></div>
  </section>
}

type OrdersPageProps = StateProps & { orders: ClientOrder[] }
const orderStatuses: OrderStatus[] = ['待接单', '待服务', '服务中', '已完成', '退款']

export function OrdersPage({ pageState, onRetry, orders }: OrdersPageProps) {
  const [filter, setFilter] = useState<'全部' | OrderStatus>('全部')
  const filteredOrders = useMemo(() => filter === '全部' ? orders : orders.filter((order) => order.status === filter), [filter, orders])
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>

  return <div className="client-content account-page">
    <PageHeading eyebrow="服务记录" title="我的订单" description="订单按时间展示，可筛选查看不同服务状态。" />
    <section className="client-card orders-list-card">
      <div className="orders-list-card__toolbar"><div><span className="client-eyebrow">订单记录</span><h2>全部服务</h2></div><label className="client-filter-select"><span>按状态筛选</span><select value={filter} onChange={(event) => setFilter(event.target.value as '全部' | OrderStatus)}><option value="全部">全部状态</option>{orderStatuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label></div>
      {filteredOrders.length === 0 ? <div className="account-empty-inline"><History size={22} /><strong>没有符合条件的订单</strong><span>换一个状态筛选条件试试。</span><button type="button" className="client-button client-button--secondary" onClick={() => setFilter('全部')}>查看全部订单</button></div> : <div className="orders-list">{filteredOrders.map((order) => <OrderCard order={order} key={order.id} />)}</div>}
    </section>
  </div>
}

type CheckoutPageProps = StateProps & {
  orderService: { companion: Companion; service: Service; gameName: string } | null
  diamondBalance: number
  onBack: () => void
  onOpenWallet: () => void
  onComplete: (durationHours: number, amount: number) => string | null
  onOpenOrders: () => void
}

export function CheckoutPage({ pageState, onRetry, orderService, diamondBalance, onBack, onOpenWallet, onComplete, onOpenOrders }: CheckoutPageProps) {
  const [durationHours, setDurationHours] = useState(1)
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>
  if (!orderService) return <div className="client-content account-page"><PageStatePanel state="error" title="找不到这项服务" description="请返回陪玩详情重新选择服务。" actionLabel="返回陪玩详情" onAction={onBack} /></div>

  const { companion, service, gameName } = orderService
  const amount = service.price * durationHours
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
        <div className="checkout-service-facts"><span>服务类型</span><strong>{service.levelName}</strong><span>服务单价</span><strong>{service.price} 钻石 / 小时</strong></div>
        <fieldset className="checkout-duration"><legend>选择服务时长</legend><div>{[1, 2, 3, 4].map((hours) => <button type="button" key={hours} className={`client-choice-button${durationHours === hours ? ' is-active' : ''}`} aria-pressed={durationHours === hours} onClick={() => setDurationHours(hours)}>{hours} 小时</button>)}</div></fieldset>
      </section>
      <aside className="client-card checkout-summary-card">
        <span className="client-eyebrow">订单摘要</span><h2>支付信息</h2>
        <div className="checkout-summary-line"><span>服务时长</span><strong>{durationHours} 小时</strong></div>
        <div className="checkout-summary-line"><span>服务金额</span><strong>{amount.toLocaleString()} 钻石</strong></div>
        <div className="checkout-summary-line checkout-summary-line--balance"><span>钻石余额</span><strong>{diamondBalance.toLocaleString()} 钻石</strong></div>
        <div className="checkout-total"><span>应付金额</span><strong>{amount.toLocaleString()} <small>钻石</small></strong></div>
        {diamondBalance < amount ? <div className="checkout-insufficient" role="alert"><strong>钻石余额不足</strong><span>还差 {(amount - diamondBalance).toLocaleString()} 钻石，请前往钻石钱包处理。</span><button type="button" className="client-button client-button--secondary" onClick={onOpenWallet}>前往钻石钱包 <ArrowRight size={15} /></button></div> : <button type="button" className="client-button client-button--primary checkout-pay-button" onClick={() => setCompletedOrderId(onComplete(durationHours, amount))}><Coins size={16} />确认并支付</button>}
        <p className="checkout-demo-note">支付结果仅用于原型演示，不会产生真实扣款。</p>
      </aside>
    </div>
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

function OrderCard({ order }: { order: ClientOrder }) {
  return <article className="order-item">
    <div className="order-item__heading"><span>订单编号：{order.id}</span><span className="client-status">{order.status}</span></div>
    <div className="order-item__main"><AvatarMark initials={order.companionInitials} size="md" /><div className="order-item__details"><strong>{order.serviceName} <span>· {order.gameName}</span></strong><span>陪玩：{order.companionName}</span><small>{order.durationHours} 小时 · {order.createdAt}</small></div><div className="order-item__amount"><strong>{order.amount.toLocaleString()} 钻石</strong><span>订单金额</span></div></div>
  </article>
}
