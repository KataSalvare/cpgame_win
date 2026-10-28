import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Clock3, Coins, CreditCard, Gift, History, LockKeyhole, LogOut, MessageCircle, Settings2, ShieldCheck, Ticket, UserRound, WalletCards, X, Plus, Pencil, Landmark, BadgeCheck } from 'lucide-react'
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
  onWithdrawBeans: () => void
  onOpenCoupons: () => void
  onOpenPremiumCards: () => void
}

export function WalletPage({ pageState, onRetry, diamondBalance, beanBalance, availableCouponCount, ownedPremiumCardCount, onOpenRecharge, onOpenDiamondDetails, onOpenBeanDetails, onWithdrawBeans, onOpenCoupons, onOpenPremiumCards }: WalletPageProps) {
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>

  return <div className="client-content account-page wallet-page">
    <PageHeading eyebrow="账户资产" title="我的钱包" />
    <div className="wallet-card-grid">
      <WalletBalanceCard
        title="钻石钱包"
        amount={diamondBalance}
        unit="钻石"
        icon={<Coins size={20} />}
        onToggle={onOpenDiamondDetails}
        onRecharge={onOpenRecharge}
        actionLabel="查看明细"
      />
      <WalletBalanceCard
        title="糖豆钱包"
        amount={beanBalance}
        unit="糖豆"
        icon={<WalletCards size={20} />}
        onToggle={onOpenBeanDetails}
        onWithdraw={onWithdrawBeans}
        actionLabel="查看明细"
      />
      <WalletBalanceCard title="优惠券" amount={availableCouponCount} unit="张可用" icon={<Ticket size={20} />} onToggle={onOpenCoupons} actionLabel="查看优惠券" />
      <WalletBalanceCard title="我的尊享卡" amount={ownedPremiumCardCount} unit="张已拥有" icon={<Gift size={20} />} onToggle={onOpenPremiumCards} actionLabel="查看尊享卡" />
    </div>
  </div>
}

function WalletBalanceCard({ title, description, amount, unit, icon, onToggle, onRecharge, onWithdraw, actionLabel = '收支明细' }: {
  title: string; description?: string; amount: number; unit: string; icon: React.ReactNode; expanded?: boolean; onToggle: () => void; onRecharge?: () => void; onWithdraw?: () => void; actionLabel?: string
}) {
  return <section className="client-card wallet-balance-card">
    <div className="wallet-balance-card__heading"><span className="wallet-balance-card__icon">{icon}</span><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>
    <span className="client-eyebrow">{title === '优惠券' || title === '我的尊享卡' ? '当前数量' : '当前余额'}</span><strong className="wallet-balance-card__amount">{amount.toLocaleString()} <small>{unit}</small></strong>
    <div className="wallet-balance-card__actions">{onRecharge && <button type="button" className="client-button client-button--primary" onClick={onRecharge}><CreditCard size={15} />充值</button>}{onWithdraw && <button type="button" className="client-button client-button--primary" onClick={onWithdraw}>提现</button>}<button type="button" className={`client-button ${onRecharge || onWithdraw ? 'client-button--secondary' : 'client-button--primary'}`} onClick={onToggle}>{(onRecharge || onWithdraw) && <History size={15} />}{actionLabel}</button></div>
  </section>
}

type PayoutAccount = { id: string; type: '支付宝' | '银行卡'; holder: string; account: string; bankName?: string }
const initialPayoutAccounts: PayoutAccount[] = [
  { id: 'alipay-001', type: '支付宝', holder: '林晚', account: 'wanfeng***@alipay.com' },
  { id: 'bank-001', type: '银行卡', holder: '林晚', account: '**** **** **** 3628', bankName: '招商银行' },
]

export function BeanWithdrawPanel({ balance, onWithdraw, onClose }: { balance: number; onWithdraw: (amount: number) => boolean; onClose: () => void }) {
  const [accounts, setAccounts] = useState(initialPayoutAccounts)
  const [selectedId, setSelectedId] = useState(initialPayoutAccounts[0].id)
  const [amount, setAmount] = useState('')
  const [manageAccounts, setManageAccounts] = useState(false)
  const [view, setView] = useState<'withdraw' | 'accounts' | 'account-form' | 'result'>('withdraw')
  const [editingAccount, setEditingAccount] = useState<PayoutAccount | null>(null)
  const [formType, setFormType] = useState<PayoutAccount['type']>('支付宝')
  const [holder, setHolder] = useState('')
  const [accountValue, setAccountValue] = useState('')
  const [bankName, setBankName] = useState('')
  const [feedback, setFeedback] = useState('')
  const [result, setResult] = useState<{ amount: number; account: PayoutAccount; applicationNo: string } | null>(null)
  const parsedAmount = Number(amount)
  const selectedAccount = accounts.find((account) => account.id === selectedId)

  const openAccountForm = (account?: PayoutAccount) => {
    setEditingAccount(account ?? null)
    setFormType(account?.type ?? '支付宝')
    setHolder(account?.holder ?? '')
    setAccountValue('')
    setBankName(account?.bankName ?? '')
    setView('account-form')
  }
  const saveAccount = () => {
    if (!holder.trim() || !accountValue.trim() || (formType === '银行卡' && !bankName.trim())) return
    const saved: PayoutAccount = { id: editingAccount?.id ?? `${formType}-${Date.now()}`, type: formType, holder: holder.trim(), account: accountValue.trim(), ...(formType === '银行卡' ? { bankName: bankName.trim() } : {}) }
    setAccounts((current) => editingAccount ? current.map((item) => item.id === editingAccount.id ? saved : item) : [...current, saved])
    if (!editingAccount) setSelectedId(saved.id)
    setEditingAccount(null)
    setView('accounts')
    setFeedback(editingAccount ? '账户信息已更新。' : '新账户已绑定。')
  }

  const activeView = view === 'withdraw' && manageAccounts ? 'accounts' : view
  const closeForm = () => { setEditingAccount(null); setView('accounts') }

  return <div className="store-overlay bean-withdraw-overlay" data-overlay="bean-withdraw-modal" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="store-benefit-dialog bean-withdraw-dialog" role="dialog" aria-modal="true" aria-labelledby="bean-withdraw-title">
    <header><div><span className="client-eyebrow">糖豆钱包</span><h2 id="bean-withdraw-title">{activeView === 'withdraw' ? '提现糖豆' : activeView === 'accounts' ? '提现账户管理' : activeView === 'account-form' ? (editingAccount ? '换绑提现账户' : '绑定提现账户') : '提现结果'}</h2></div><button type="button" className="client-icon-button" aria-label="关闭提现弹窗" onClick={onClose}><X size={17} /></button></header>
    {activeView === 'accounts' ? <>
      <div className="client-section-heading bean-withdraw-panel__subheading"><div><span className="client-eyebrow">收款方式</span><h2>已绑定账户</h2></div><button type="button" className="client-button client-button--secondary" onClick={() => openAccountForm()}><Plus size={15} />绑定账户</button></div>
      <div className="bean-payout-list">{accounts.map((account) => <article className="client-card bean-payout-card" key={account.id}><span className="bean-payout-card__icon">{account.type === '银行卡' ? <Landmark size={18} /> : <BadgeCheck size={18} />}</span><div className="bean-payout-card__details"><strong>{account.type}{account.bankName ? ` · ${account.bankName}` : ''}</strong><span>{account.holder} · {account.account}</span></div><button type="button" className="client-button client-button--secondary" onClick={() => openAccountForm(account)}><Pencil size={14} />换绑</button></article>)}</div>
      <footer><button type="button" className="client-button client-button--secondary" onClick={() => { setManageAccounts(false); setView('withdraw') }}>返回提现</button></footer>
    </> : activeView === 'account-form' ? <>
      <div className="bean-account-type" role="group" aria-label="提现账户类型">{(['支付宝', '银行卡'] as const).map((type) => <button type="button" className={`orders-filter-chip${formType === type ? ' is-active' : ''}`} aria-pressed={formType === type} key={type} onClick={() => setFormType(type)}>{type}</button>)}</div><label className="bean-account-field"><span>账户姓名</span><input value={holder} onChange={(event) => setHolder(event.target.value)} placeholder="请输入实名姓名" /></label>{formType === '银行卡' && <label className="bean-account-field"><span>开户银行</span><input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="请输入银行名称" /></label>}<label className="bean-account-field"><span>{formType === '支付宝' ? '支付宝账号' : '银行卡号'}</span><input value={accountValue} onChange={(event) => setAccountValue(event.target.value)} placeholder={formType === '支付宝' ? `请输入${editingAccount ? '新的' : ''}手机号或支付宝账号` : `请输入${editingAccount ? '新的' : ''}银行卡号`} /></label><footer><button type="button" className="client-button client-button--secondary" onClick={closeForm}>取消</button><button type="button" className="client-button client-button--primary" disabled={!holder.trim() || !accountValue.trim() || (formType === '银行卡' && !bankName.trim())} onClick={saveAccount}>保存账户</button></footer>
    </> : activeView === 'result' && result ? <>
      <div className="bean-withdraw-result"><span className="checkout-success-card__icon"><CheckCircle2 size={30} /></span><span className="client-eyebrow">本地演示结果</span><h3>提现申请已提交</h3><strong className="bean-withdraw-result__amount">{result.amount.toLocaleString()} <small>糖豆</small></strong><dl><div><dt>收款方式</dt><dd>{result.account.type}{result.account.bankName ? ` · ${result.account.bankName}` : ''}</dd></div><div><dt>收款账户</dt><dd>{result.account.account}</dd></div><div><dt>申请编号</dt><dd>{result.applicationNo}</dd></div></dl><p>申请结果仅用于原型演示，不代表真实提现状态。</p></div><footer><button type="button" className="client-button client-button--primary" onClick={onClose}>完成</button></footer>
    </> : <>
      <section className="client-card bean-withdraw-balance"><span className="client-eyebrow">可用糖豆</span><strong>{balance.toLocaleString()} <small>糖豆</small></strong></section>
      <section className="client-card bean-withdraw-form">
        <div className="client-section-heading"><div><span className="client-eyebrow">提现信息</span><h2>收款账户</h2></div><button type="button" className="client-text-button" onClick={() => { setManageAccounts(true); setView('accounts'); setFeedback('') }}>管理账户 <ChevronRight size={15} /></button></div>
        {accounts.length ? <div className="bean-payout-choices" role="group" aria-label="选择收款账户">{accounts.map((account) => <button type="button" key={account.id} className={`bean-payout-choice${selectedId === account.id ? ' is-active' : ''}`} aria-pressed={selectedId === account.id} onClick={() => setSelectedId(account.id)}><span className="bean-payout-choice__radio" /><span><strong>{account.type}{account.bankName ? ` · ${account.bankName}` : ''}</strong><small>{account.account}</small></span></button>)}</div> : <div className="account-empty-inline"><strong>还没有提现账户</strong><span>请先绑定支付宝或银行卡。</span></div>}
        <label className="bean-withdraw-amount"><span>提现糖豆数</span><div><input aria-label="提现糖豆数" inputMode="numeric" type="number" min="1" max={balance} step="1" value={amount} onChange={(event) => { setAmount(event.target.value); setFeedback('') }} placeholder="请输入糖豆数" /></div><button type="button" className="client-text-button" onClick={() => setAmount(String(balance))}>全部提现</button></label>
        <button type="button" className="client-button client-button--primary bean-withdraw-submit" disabled={!selectedAccount || !Number.isInteger(parsedAmount) || parsedAmount <= 0 || parsedAmount > balance} onClick={() => { if (selectedAccount && onWithdraw(parsedAmount)) { setResult({ amount: parsedAmount, account: selectedAccount, applicationNo: `WD${Date.now().toString().slice(-10)}` }); setAmount(''); setView('result') } else setFeedback('请检查提现糖豆数后重试。') }}>提交提现申请</button>
      </section>
    </>}
    {feedback && <p className="account-inline-feedback" role="status">{feedback}</p>}
  </section></div>
}

export function WalletLedgerPanel({ entries }: { entries: readonly { id: string; title: string; date: string; amount: number }[] }) {
  const [filter, setFilter] = useState<'全部' | '收入' | '支出'>('全部')
  const filteredEntries = entries.filter((entry) => filter === '全部' || (filter === '收入' ? entry.amount > 0 : entry.amount < 0))
  return <div className="client-content account-page wallet-ledger-panel">
    <div className="transaction-filter-heading">
    <div className="transaction-filter-tabs" role="group" aria-label="收支类型筛选">{(['全部', '收入', '支出'] as const).map((item) => <button type="button" key={item} className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
    </div>
    {filteredEntries.length ? <TransactionList entries={filteredEntries} /> : <div className="account-empty-inline"><History size={22} /><strong>{entries.length ? `暂无${filter}记录` : '暂无收支记录'}</strong></div>}
  </div>
}

type OrdersPageProps = StateProps & {
  orders: ClientOrder[]
  selectedOrderId: string | null
  onSelectOrder: (orderId: string | null) => void
  onReorder: (order: ClientOrder) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}
const orderStatuses: OrderStatus[] = ['待接单', '待服务', '服务中', '已完成', '已取消', '退款']

export function OrdersPage({ pageState, onRetry, orders, selectedOrderId, onSelectOrder, onReorder, onUpdateStatus }: OrdersPageProps) {
  const [filter, setFilter] = useState<'全部' | OrderStatus>('全部')
  const filteredOrders = useMemo(() => filter === '全部' ? orders : orders.filter((order) => order.status === filter), [filter, orders])
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>

  return <div className="client-content account-page">
    <PageHeading title="我的订单" />
    <section className="client-card orders-list-card">
      <div className="orders-list-card__toolbar"><span className="client-count">{filteredOrders.length} 笔订单</span></div>
      <div className="orders-filter-bar" role="group" aria-label="按订单状态筛选">
        {(['全部', ...orderStatuses] as Array<'全部' | OrderStatus>).map((status) => <button type="button" key={status} className={`orders-filter-chip${filter === status ? ' is-active' : ''}`} aria-pressed={filter === status} onClick={() => { setFilter(status); onSelectOrder(null) }}>{status}</button>)}
      </div>
      {filteredOrders.length === 0 ? <div className="account-empty-inline"><History size={22} /><strong>没有符合条件的订单</strong><button type="button" className="client-button client-button--secondary" onClick={() => { setFilter('全部'); onSelectOrder(null) }}>查看全部订单</button></div> : <div className="orders-list" role="group" aria-label="订单列表">
        <div className="order-list-header"><span>订单号</span><span>陪玩信息</span><span>服务信息</span><span>时长</span><span>价格</span><span>状态 / 快捷操作</span></div>
        {filteredOrders.map((order) => <OrderCard order={order} key={order.id} selected={selectedOrderId === order.id} onSelect={() => onSelectOrder(order.id)} onReorder={() => onReorder(order)} onUpdateStatus={onUpdateStatus} />)}
      </div>}
    </section>
  </div>
}

type CheckoutPageProps = StateProps & {
  orderService: { companion: Companion; service: Service; gameName: string } | null
  selectedCompanions: Companion[]
  availableServices: Service[]
  diamondBalance: number
  onBack: () => void
  onOpenWallet: () => void
  hideRechargePrompt: boolean
  onResetRechargePrompt: () => void
  onSelectService: (serviceId: string) => void
  onComplete: (quantity: number, amount: number, remark: string, selectedCompanions: Companion[]) => string | null
  onOpenOrders: () => void
}

export function CheckoutPage({ pageState, onRetry, orderService, selectedCompanions, availableServices, diamondBalance, onBack, onOpenWallet, hideRechargePrompt, onResetRechargePrompt, onSelectService, onComplete, onOpenOrders }: CheckoutPageProps) {
  const [quantity, setQuantity] = useState(1)
  const [remark, setRemark] = useState('')
  const [servicePickerOpen, setServicePickerOpen] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const [checkoutDialog, setCheckoutDialog] = useState<'payment' | 'recharge' | null>(null)
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>
  if (!orderService) return <div className="client-content account-page"><PageStatePanel state="error" title="找不到这项服务" description="请返回陪玩详情重新选择服务。" actionLabel="返回陪玩详情" onAction={onBack} /></div>

  const { companion, service, gameName } = orderService
  const checkoutCompanions = selectedCompanions.length ? selectedCompanions : [companion]
  const amount = service.price * quantity * checkoutCompanions.length
  if (completedOrderId) return <div className="client-content account-page">
    <section className="client-card checkout-success-card"><span className="checkout-success-card__icon"><CheckCircle2 size={30} /></span><h1>订单已提交</h1><p>订单编号：{completedOrderId}</p><div className="checkout-success-card__actions"><button type="button" className="client-button client-button--primary" onClick={onOpenOrders}>查看我的订单</button><button type="button" className="client-button client-button--secondary" onClick={onBack}>返回陪玩详情</button></div></section>
  </div>

  return <div className="client-content account-page">
    <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={15} />返回陪玩详情</button>
    <PageHeading title="下单结算" />
    <div className="checkout-grid">
      <section className="client-card checkout-service-card">
        <div className="client-section-heading"><div><h2>服务信息</h2></div><span className="client-badge">{checkoutCompanions.length === 2 ? '双陪服务' : '单陪服务'}</span></div>
        <div className="checkout-companion"><div className="checkout-companion__avatars">{checkoutCompanions.map((item) => <AvatarMark key={item.id} initials={item.initials} size="md" />)}</div><div><strong>{checkoutCompanions.map((item) => item.name).join('、')}</strong><span>{gameName} · {service.playName}</span></div></div>
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
        <h2>支付信息</h2>
        <div className="checkout-summary-line"><span>服务时长</span><strong>{quantity} {service.unit}</strong></div>
        <div className="checkout-summary-line"><span>陪玩人数</span><strong>{checkoutCompanions.length} 位</strong></div>
        <div className="checkout-summary-line"><span>服务金额</span><strong>{service.price.toLocaleString()} × {checkoutCompanions.length} × {quantity} = {amount.toLocaleString()} 钻石</strong></div>
        <div className="checkout-summary-line checkout-summary-line--balance"><span>钻石余额</span><strong>{diamondBalance.toLocaleString()} 钻石</strong></div>
        <div className="checkout-total"><span>应付金额</span><strong>{amount.toLocaleString()} <small>钻石</small></strong></div>
        {!service.canAcceptOrders ? <div className="checkout-insufficient" role="status"><strong>暂不可接单</strong><button type="button" className="client-button client-button--secondary" onClick={() => setServicePickerOpen(true)}>选择其他服务</button></div> : <button type="button" className="client-button client-button--primary checkout-pay-button" onClick={() => { onResetRechargePrompt(); setCheckoutDialog(diamondBalance >= amount ? 'payment' : 'recharge') }}><Coins size={16} />确认支付</button>}
      </aside>
    </div>
    {checkoutDialog && !(checkoutDialog === 'recharge' && hideRechargePrompt) && <div className="order-action-overlay checkout-confirm-overlay" data-overlay={checkoutDialog === 'payment' ? 'checkout-payment-confirmation' : 'checkout-recharge-confirmation'} role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setCheckoutDialog(null) }}>
      <section className="order-action-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-confirm-title">
        <header><h2 id="checkout-confirm-title">{checkoutDialog === 'payment' ? '确认支付' : '钻石余额不足'}</h2><button type="button" className="order-action-dialog__close" aria-label="关闭确认弹窗" onClick={() => setCheckoutDialog(null)}><X size={17} /></button></header>
        {checkoutDialog === 'payment' ? <p>将使用钻石钱包支付 <strong>{amount.toLocaleString()} 钻石</strong>，确认提交这笔服务订单吗？</p> : <p>当前钻石余额为 {diamondBalance.toLocaleString()} 钻石，本次应付 {amount.toLocaleString()} 钻石，还差 <strong>{(amount - diamondBalance).toLocaleString()} 钻石</strong>。打开充值弹窗补充余额吗？</p>}
        <footer><button type="button" className="client-button client-button--secondary" onClick={() => setCheckoutDialog(null)}>{checkoutDialog === 'payment' ? '再想想' : '稍后再说'}</button><button type="button" className="client-button client-button--primary" onClick={() => {
          if (checkoutDialog === 'recharge') { setCheckoutDialog(null); onOpenWallet(); return }
          setCompletedOrderId(onComplete(quantity, amount, remark, checkoutCompanions))
          setCheckoutDialog(null)
        }}>{checkoutDialog === 'payment' ? '确认支付' : '去充值'}</button></footer>
      </section>
    </div>}
  </div>
}

function PageHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <header className="client-page-heading account-page-heading"><div>{eyebrow && <span className="client-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div></header>
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

function OrderCard({ order, selected, onSelect, onReorder, onUpdateStatus }: { order: ClientOrder; selected: boolean; onSelect: () => void; onReorder: () => void; onUpdateStatus: (orderId: string, status: OrderStatus) => void }) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const quickActions = order.status === '待接单' || order.status === '待服务' ? ['取消订单']
    : order.status === '服务中' ? ['确认完成']
    : order.status === '已完成' ? ['再次下单', '评价']
    : []
  return <article className={`order-item${selected ? ' is-selected' : ''}`}>
    <button type="button" className="order-item__main" aria-pressed={selected} aria-label={`查看订单 ${order.id}，${order.companionName}，${order.gameName} ${order.serviceName}，${order.duration} ${order.durationUnit}，${order.amount.toLocaleString()} 钻石，${order.status}`} onClick={onSelect}>
      <span className="order-item__info"><strong>{order.id}</strong><small>{order.createdAt}</small></span>
      <span className="order-item__companion"><AvatarMark initials={order.companionInitials} size="sm" /><strong>{order.companionName}</strong></span>
      <span className="order-item__service"><strong>{order.gameName} · {order.serviceName}</strong><small>{order.levelName} · {order.durationUnit}服务</small></span>
      <span className="order-item__duration">{order.duration} {order.durationUnit}</span>
      <span className="order-item__price"><strong>{order.unitPrice.toLocaleString()} 钻石 / {order.durationUnit}</strong><small>合计 {order.amount.toLocaleString()} 钻石</small></span>
      <span className={`order-item__status order-item__status--${order.status === '退款' ? 'refund' : order.status === '已取消' ? 'cancelled' : order.status === '已完成' ? 'completed' : 'active'}`}>{order.status}</span>
    </button>
    <div className="order-item__actions" role="group" aria-label={`订单 ${order.id} 快捷操作`}>{quickActions.map((action) => <button type="button" key={action} className={`client-button ${action === '再次下单' ? 'client-button--secondary' : 'client-button--primary'}`} onClick={() => action === '再次下单' ? onReorder() : setActiveAction(action)}>{action}</button>)}</div>
    {activeAction && <OrderActionDialog order={order} action={activeAction} onClose={() => setActiveAction(null)} onUpdateStatus={onUpdateStatus} />}
  </article>
}

const orderActions: Record<OrderStatus, string[]> = {
  '待接单': ['取消订单'],
  '待服务': ['取消订单'],
  '服务中': ['确认完成', '提前结束'],
  '已完成': ['发起售后', '再次下单', '评价'],
  '已取消': [],
  '退款': [],
}

function orderActionMessage(action: string) {
  if (action === '取消订单') return '确认取消这笔订单吗？确认后订单状态将变更为已取消。'
  if (action === '确认完成') return '确认本笔订单已完成吗？确认后订单状态将变更为已完成。'
  return ''
}

function OrderActionDialog({ order, action, onClose, onUpdateStatus }: { order: ClientOrder; action: string; onClose: () => void; onUpdateStatus: (orderId: string, status: OrderStatus) => void }) {
  const needsConfirmation = action === '取消订单' || action === '确认完成'
  return <div className="order-action-overlay" data-overlay="order-action-confirmation" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="order-action-dialog" role="dialog" aria-modal="true" aria-labelledby="order-action-title">
      <header><h2 id="order-action-title">{action}</h2><button type="button" className="order-action-dialog__close" aria-label="关闭提示" onClick={onClose}><X size={17} /></button></header>
      {needsConfirmation && <p>{orderActionMessage(action)}</p>}
      <footer>{needsConfirmation ? <><button type="button" className="client-button client-button--secondary" onClick={onClose}>返回</button><button type="button" className="client-button client-button--primary" onClick={() => { onUpdateStatus(order.id, action === '取消订单' ? '已取消' : '已完成'); onClose() }}>{action === '取消订单' ? '确认取消' : '确认完成'}</button></> : <button type="button" className="client-button client-button--primary" onClick={onClose}>知道了</button>}</footer>
    </section>
  </div>
}

export function OrderDetailPanel({ order, companion, onContact, onReorder, onUpdateStatus }: { order: ClientOrder; companion: Companion | undefined; onContact: () => void; onReorder: () => void; onUpdateStatus: (orderId: string, status: OrderStatus) => void }) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  return <div className="order-detail-panel">
    <section className="order-detail-status-card">
      <strong className="order-detail-status-card__status">{order.status}</strong>
      <span className="order-detail-status-card__id">{order.id}</span>
      <span className="order-detail-status-card__created">创建时间 {order.createdAt}</span>
    </section>

    <section className="order-detail-section">
      <div className="order-detail-section__heading"><span className="client-eyebrow">陪玩信息</span><button type="button" className="client-button client-button--secondary" onClick={onContact}>联系陪玩</button></div>
      <div className="order-detail-companion"><AvatarMark initials={order.companionInitials} size="md" /><div><strong>{order.companionName}</strong><span>{companion ? `${companion.gender} · ${companion.age} 岁 · ${companion.region}` : '陪玩资料'}</span></div></div>
      {companion && <div className="order-detail-facts"><span>陪玩 ID</span><strong>{companion.id}</strong></div>}
    </section>

    <section className="order-detail-section">
      <div className="order-detail-section__heading"><span className="client-eyebrow">订单信息</span><History size={15} aria-hidden="true" /></div>
      <div className="order-detail-facts"><span>服务信息</span><strong>{order.gameName} · {order.serviceName} · {order.levelName} · {order.durationUnit}服务</strong><span>服务时长</span><strong>{order.duration} {order.durationUnit}</strong><span>服务单价</span><strong>{order.unitPrice.toLocaleString()} 钻石 / {order.durationUnit}</strong><span>订单金额</span><strong>{order.amount.toLocaleString()} 钻石</strong><span>订单备注</span><strong>{order.remark || '无'}</strong></div>
    </section>

    <OrderTimeSection title="服务记录" icon={<Clock3 size={15} />} emptyLabel="暂无服务记录" segments={order.serviceSegments} kind="service" />
    <OrderTimeSection title="售后记录" icon={<MessageCircle size={15} />} emptyLabel="暂无售后记录" segments={order.afterSalesSegments} kind="after-sales" />

    <div className="order-detail-actions" aria-label="订单操作">
      {orderActions[order.status].map((action) => <button type="button" key={action} className={`client-button ${action === '再次下单' ? 'client-button--secondary' : 'client-button--primary'}`} onClick={() => action === '再次下单' ? onReorder() : setActiveAction(action)}>{action}</button>)}
    </div>

    {activeAction && <OrderActionDialog order={order} action={activeAction} onClose={() => setActiveAction(null)} onUpdateStatus={onUpdateStatus} />}
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
