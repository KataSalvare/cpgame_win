import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Clock3, Coins, CreditCard, Gift, History, ImagePlus, Mars, MessageCircle, Search, Star, Ticket, Venus, WalletCards, X, Plus, Landmark, BadgeCheck, Trash2 } from 'lucide-react'
import { AvatarMark } from '../components/AvatarMark'
import { UserNameWithLevel } from '../components/UserNameWithLevel'
import { OrderNumberCopy } from '../components/OrderNumberCopy'
import { OrderAfterSalesRecords } from '../components/OrderAfterSalesRecords'
import { PageStatePanel } from '../components/PageStatePanel'
import { DialogPanel } from '@/components/WindowsClient'
import { WorkbenchOrdersPanel } from '../components/WorkbenchOrdersPanel'
import { ExamOrderPayButton, ExamSubmissionDialog } from '../components/ExamOrderDetailPanel'
import { mockBeanWithdrawalRecords, type ClientOrder, type OrderStatus, type PendingBeanSettlementEntry, type WalletTransaction } from '../data/accountMockData'
import type { ExamOrder, ExamOrderStatus, ExamSubmission } from '../data/examOrderMockData'
import type { WorkbenchLogic } from '../hooks/useWorkbenchLogic'
import { clubs, companions, games, type Companion, type Service } from '../data/mockData'

export { PersonalCenterPage } from './PersonalCenterPage'

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

type WalletPageProps = StateProps & {
  diamondBalance: number
  beanBalance: number
  availableBeanBalance: number
  pendingBeanSettlementBalance: number
  availableCouponCount: number
  ownedPremiumCardCount: number
  onOpenRecharge: () => void
  onOpenDiamondDetails: () => void
  onOpenBeanDetails: () => void
  onWithdrawBeans: () => void
  onExchangeBeans: () => void
  onOpenCoupons: () => void
  onOpenPremiumCards: () => void
}

export function WalletPage({ pageState, onRetry, diamondBalance, beanBalance, availableBeanBalance, pendingBeanSettlementBalance, availableCouponCount, ownedPremiumCardCount, onOpenRecharge, onOpenDiamondDetails, onOpenBeanDetails, onWithdrawBeans, onExchangeBeans, onOpenCoupons, onOpenPremiumCards }: WalletPageProps) {
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>

  return <div className="client-content account-page wallet-page">
    <PageHeading eyebrow="账户资产" title="我的钱包" />
    <div className="wallet-card-grid">
      <WalletBalanceCard
        title="金豆钱包"
        amount={diamondBalance}
        unit="金豆"
        icon={<Coins size={20} />}
        onToggle={onOpenDiamondDetails}
        onRecharge={onOpenRecharge}
        actionLabel="查看明细"
      />
      <WalletBalanceCard
        title="糖豆钱包"
        amount={beanBalance}
        unit="糖豆"
        balanceBreakdown={{ available: availableBeanBalance, pending: pendingBeanSettlementBalance }}
        icon={<WalletCards size={20} />}
        onToggle={onOpenBeanDetails}
        onWithdraw={onWithdrawBeans}
        onExchange={onExchangeBeans}
        actionLabel="查看明细"
      />
      <WalletBalanceCard title="优惠券" amount={availableCouponCount} unit="张可用" icon={<Ticket size={20} />} onToggle={onOpenCoupons} actionLabel="查看优惠券" />
      <WalletBalanceCard title="我的尊享卡" amount={ownedPremiumCardCount} unit="张已拥有" icon={<Gift size={20} />} onToggle={onOpenPremiumCards} actionLabel="查看尊享卡" />
    </div>
  </div>
}

function WalletBalanceCard({ title, description, amount, unit, icon, onToggle, onRecharge, onWithdraw, onExchange, actionLabel = '收支明细', balanceBreakdown }: {
  title: string; description?: string; amount: number; unit: string; icon: React.ReactNode; expanded?: boolean; onToggle: () => void; onRecharge?: () => void; onWithdraw?: () => void; onExchange?: () => void; actionLabel?: string; balanceBreakdown?: { available: number; pending: number }
}) {
  return <section className="client-card wallet-balance-card">
    <div className="wallet-balance-card__heading"><span className="wallet-balance-card__icon">{icon}</span><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>
    <span className="client-eyebrow">{title === '优惠券' || title === '我的尊享卡' ? '当前数量' : '当前余额'}</span><strong className="wallet-balance-card__amount">{amount.toLocaleString()} <small>{unit}</small></strong>
    {balanceBreakdown && <div className="wallet-balance-card__breakdown"><span>可提现 <strong>{balanceBreakdown.available.toLocaleString()}</strong></span><span>待结算 <strong>{balanceBreakdown.pending.toLocaleString()}</strong></span></div>}
    <div className="wallet-balance-card__actions">{onRecharge && <button type="button" className="client-button client-button--primary" onClick={onRecharge}><CreditCard size={15} />充值</button>}{onWithdraw && <button type="button" className="client-button client-button--primary" onClick={onWithdraw}>提现</button>}{onExchange && <button type="button" className="client-button client-button--secondary" onClick={onExchange}>兑换金豆</button>}<button type="button" className={`client-button ${onRecharge || onWithdraw || onExchange ? 'client-button--secondary' : 'client-button--primary'}`} onClick={onToggle}>{(onRecharge || onWithdraw || onExchange) && <History size={15} />}{actionLabel}</button></div>
  </section>
}

type PayoutAccount = { id: string; type: '支付宝' | '银行卡'; holder: string; account: string; bankName?: string }
const mockVerifiedName = '林晚风'
const initialPayoutAccounts: PayoutAccount[] = [
  { id: 'alipay-001', type: '支付宝', holder: mockVerifiedName, account: 'wanfeng***@alipay.com' },
  { id: 'bank-001', type: '银行卡', holder: mockVerifiedName, account: '**** **** **** 3628', bankName: '招商银行' },
]

export function BeanWithdrawPanel({ balance, onWithdraw, onClose }: { balance: number; onWithdraw: (amount: number) => boolean; onClose: () => void }) {
  const [accounts, setAccounts] = useState(initialPayoutAccounts)
  const [selectedId, setSelectedId] = useState(initialPayoutAccounts[0].id)
  const [amount, setAmount] = useState('')
  const [amountMode, setAmountMode] = useState<'beans' | 'rmb'>('beans')
  const [manageAccounts, setManageAccounts] = useState(false)
  const [view, setView] = useState<'withdraw' | 'accounts' | 'account-form' | 'result'>('withdraw')
  const [editingAccount, setEditingAccount] = useState<PayoutAccount | null>(null)
  const [formType, setFormType] = useState<PayoutAccount['type']>('支付宝')
  const [holder, setHolder] = useState(mockVerifiedName)
  const [accountValue, setAccountValue] = useState('')
  const [bankName, setBankName] = useState('')
  const [feedback, setFeedback] = useState('')
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [result, setResult] = useState<{ amount: number; account: PayoutAccount; applicationNo: string } | null>(null)
  const parsedAmount = Number(amount)
  const withdrawBeans = amountMode === 'beans' ? parsedAmount : Math.round(parsedAmount * 10)
  const convertedRmb = amountMode === 'beans' ? parsedAmount / 10 : parsedAmount
  const maskedAccount = (account: PayoutAccount) => account.type === '支付宝' ? `${account.account.slice(0, 3)}****` : account.account
  const selectedAccount = accounts.find((account) => account.id === selectedId)

  const openAccountForm = (account?: PayoutAccount) => {
    if (!account && accounts.length >= 5) {
      setFeedback('最多只能绑定 5 个账户。')
      return
    }
    setEditingAccount(account ?? null)
    setFormType(account?.type ?? '支付宝')
    setHolder(mockVerifiedName)
    setAccountValue('')
    setBankName(account?.bankName ?? '')
    setView('account-form')
  }
  const saveAccount = () => {
    if (!holder.trim() || !accountValue.trim() || (formType === '银行卡' && !bankName.trim())) return
    if (!editingAccount && accounts.length >= 5) {
      setFeedback('最多只能绑定 5 个账户。')
      setView('accounts')
      return
    }
    const saved: PayoutAccount = { id: editingAccount?.id ?? `${formType}-${Date.now()}`, type: formType, holder: holder.trim(), account: accountValue.trim(), ...(formType === '银行卡' ? { bankName: bankName.trim() } : {}) }
    setAccounts((current) => editingAccount ? current.map((item) => item.id === editingAccount.id ? saved : item) : [...current, saved])
    if (!editingAccount) setSelectedId(saved.id)
    setEditingAccount(null)
    setView('accounts')
    setFeedback(editingAccount ? '账户信息已更新。' : '新账户已绑定。')
  }
  const deleteAccount = (account: PayoutAccount) => {
    const remaining = accounts.filter((item) => item.id !== account.id)
    setAccounts(remaining)
    if (selectedId === account.id) setSelectedId(remaining[0]?.id ?? '')
    setFeedback('账户已删除。')
  }

  const activeView = view === 'withdraw' && manageAccounts ? 'accounts' : view
  const closeForm = () => { setEditingAccount(null); setView('accounts') }

  return <div className="store-overlay bean-withdraw-overlay" data-overlay="bean-withdraw-modal" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="store-benefit-dialog bean-withdraw-dialog" role="dialog" aria-modal="true" aria-labelledby="bean-withdraw-title">
    <header><div><span className="client-eyebrow">糖豆钱包</span><h2 id="bean-withdraw-title">{activeView === 'withdraw' ? '提现糖豆' : activeView === 'accounts' ? '提现账户管理' : activeView === 'account-form' ? (editingAccount ? '换绑提现账户' : '绑定提现账户') : '提现结果'}</h2></div><button type="button" className="client-icon-button" aria-label="关闭提现弹窗" onClick={onClose}><X size={17} /></button></header>
    {activeView === 'accounts' ? <>
      <div className="client-section-heading bean-withdraw-panel__subheading"><div><span className="client-eyebrow">收款方式</span><h2>已绑定账户</h2></div><button type="button" className="client-button client-button--secondary" disabled={accounts.length >= 5} title={accounts.length >= 5 ? '最多只能绑定 5 个账户' : undefined} onClick={() => openAccountForm()}><Plus size={15} />绑定账户</button></div>
      <div className="bean-payout-list">{accounts.map((account) => <article className="client-card bean-payout-card" key={account.id}><span className="bean-payout-card__icon">{account.type === '银行卡' ? <Landmark size={18} /> : <BadgeCheck size={18} />}</span><button type="button" className="bean-payout-card__select" aria-label={`选择${account.type} ${maskedAccount(account)}`} onClick={() => { setSelectedId(account.id); setManageAccounts(false); setView('withdraw'); setFeedback('') }}><span className="bean-payout-card__details"><strong>{account.type}{account.bankName ? ` · ${account.bankName}` : ''}</strong><span>{maskedAccount(account)}</span></span>{selectedId === account.id && <span className="bean-payout-card__selected">已选</span>}</button><button type="button" className="client-button client-button--secondary" onClick={() => deleteAccount(account)}><Trash2 size={14} />删除</button></article>)}</div>
      <footer><button type="button" className="client-button client-button--secondary" onClick={() => { setManageAccounts(false); setView('withdraw') }}>返回提现</button></footer>
    </> : activeView === 'account-form' ? <>
      <div className="bean-account-type" role="group" aria-label="提现账户类型">{(['支付宝', '银行卡'] as const).map((type) => <button type="button" className={`orders-filter-chip${formType === type ? ' is-active' : ''}`} aria-pressed={formType === type} key={type} onClick={() => setFormType(type)}>{type}</button>)}</div><div className="bean-account-name-row"><label className="bean-account-field"><span>账户姓名</span><input value={holder} disabled aria-label={`账户姓名，实名：${mockVerifiedName}`} /></label><span className="bean-realname-status"><BadgeCheck size={14} />已实名</span></div>{formType === '银行卡' && <label className="bean-account-field"><span>开户银行</span><input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="请输入银行名称" /></label>}<label className="bean-account-field"><span>{formType === '支付宝' ? '支付宝账号' : '银行卡号'}</span><input value={accountValue} onChange={(event) => setAccountValue(event.target.value)} placeholder={formType === '支付宝' ? `请输入${editingAccount ? '新的' : ''}手机号或支付宝账号` : `请输入${editingAccount ? '新的' : ''}银行卡号`} /></label><footer><button type="button" className="client-button client-button--secondary" onClick={closeForm}>取消</button><button type="button" className="client-button client-button--primary" disabled={!accountValue.trim() || (formType === '银行卡' && !bankName.trim())} onClick={saveAccount}>保存账户</button></footer>
    </> : activeView === 'result' && result ? <>
      <div className="bean-withdraw-result"><span className="checkout-success-card__icon"><CheckCircle2 size={30} /></span><span className="client-eyebrow">本地演示结果</span><h3>提现申请已提交</h3><strong className="bean-withdraw-result__amount">{result.amount.toLocaleString()} <small>糖豆</small></strong><dl><div><dt>收款方式</dt><dd>{result.account.type}{result.account.bankName ? ` · ${result.account.bankName}` : ''}</dd></div><div><dt>收款账户</dt><dd>{maskedAccount(result.account)}</dd></div><div><dt>申请编号</dt><dd>{result.applicationNo}</dd></div></dl><p>申请结果仅用于原型演示，不代表真实提现状态。</p></div><footer><button type="button" className="client-button client-button--primary" onClick={onClose}>完成</button></footer>
    </> : <>
      <section className="client-card bean-withdraw-balance"><span className="client-eyebrow">可提现糖豆</span><strong>{balance.toLocaleString()} <small>糖豆</small><em>= ¥ {(balance / 10).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</em></strong></section>
      <section className="client-card bean-withdraw-form">
        <div className="client-section-heading"><h2>收款账户</h2></div>
        <div className="bean-payout-choice is-active"><span className="bean-payout-card__icon">{selectedAccount?.type === '银行卡' ? <Landmark size={18} /> : <BadgeCheck size={18} />}</span><span className="bean-payout-choice__details">{selectedAccount ? <><strong>{selectedAccount.type}{selectedAccount.bankName ? ` · ${selectedAccount.bankName}` : ''}</strong><small>{maskedAccount(selectedAccount)}</small></> : <><strong>还没有提现账户</strong><small>请先绑定支付宝或银行卡。</small></>}</span><button type="button" className="client-text-button" onClick={() => { setManageAccounts(true); setView('accounts'); setFeedback('') }}>{selectedAccount ? '更换' : '绑定'} <ChevronRight size={15} /></button></div>
        <div className="bean-withdraw-amount"><div className="bean-withdraw-amount__heading"><label htmlFor="bean-withdraw-amount">提现{amountMode === 'beans' ? '糖豆数' : '金额（元）'}</label><div role="group" aria-label="提现金额单位"><button type="button" className={amountMode === 'beans' ? 'is-active' : ''} onClick={() => { setAmount(amount ? String(Math.round(Number(amountMode === 'rmb' ? Number(amount) * 10 : Number(amount)))) : ''); setAmountMode('beans') }}>糖豆</button><button type="button" className={amountMode === 'rmb' ? 'is-active' : ''} onClick={() => { setAmount(amount ? (amountMode === 'beans' ? (Number(amount) / 10).toFixed(1) : amount) : ''); setAmountMode('rmb') }}>人民币</button></div></div><div><input id="bean-withdraw-amount" inputMode="decimal" type="number" min="0.1" step={amountMode === 'beans' ? '1' : '0.1'} value={amount} onChange={(event) => { setAmount(event.target.value); setFeedback('') }} placeholder={amountMode === 'beans' ? '请输入糖豆数' : '请输入人民币金额'} /><button type="button" className="client-text-button" onClick={() => setAmount(amountMode === 'beans' ? String(balance) : (balance / 10).toFixed(1))}>全部提现</button></div><p>换算金额：{amount ? `¥ ${convertedRmb.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${withdrawBeans.toLocaleString()} 糖豆` : '1 元 = 10 糖豆'}</p></div>
        <div className="bean-withdraw-notes" aria-label="提现说明">{['提现说明：', 'xxxx', 'xxxx', 'xxxx'].map((line, index) => <p key={index}>{line}</p>)}</div>
        <label className="transaction-agreement"><input type="checkbox" checked={agreementAccepted} onChange={(event) => setAgreementAccepted(event.target.checked)} /><span>我已阅读并同意《提现协议》</span></label>
        <button type="button" className="client-button client-button--primary bean-withdraw-submit" disabled={!agreementAccepted || !selectedAccount || !Number.isInteger(withdrawBeans) || withdrawBeans <= 0 || withdrawBeans > balance} onClick={() => { if (agreementAccepted && selectedAccount && onWithdraw(withdrawBeans)) { setResult({ amount: withdrawBeans, account: selectedAccount, applicationNo: `WD${Date.now().toString().slice(-10)}` }); setAmount(''); setView('result') } else setFeedback('请检查提现金额后重试。') }}>提交提现申请</button>
      </section>
    </>}
    {feedback && <p className="account-inline-feedback" role="status">{feedback}</p>}
  </section></div>
}

export function BeanExchangePanel({ beanBalance, onExchange, onClose }: { beanBalance: number; onExchange: (amount: number) => boolean; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [exchangedAmount, setExchangedAmount] = useState<number | null>(null)
  const parsedAmount = Number(amount)
  const validAmount = Number.isInteger(parsedAmount) && parsedAmount > 0 && parsedAmount <= beanBalance

  return <div className="store-overlay bean-exchange-overlay" data-overlay="bean-exchange-modal" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="store-benefit-dialog bean-exchange-dialog" role="dialog" aria-modal="true" aria-labelledby="bean-exchange-title">
    <header><div><span className="client-eyebrow">糖豆钱包</span><h2 id="bean-exchange-title">{exchangedAmount === null ? '兑换金豆' : '兑换完成'}</h2></div><button type="button" className="client-icon-button" aria-label="关闭兑换弹窗" onClick={onClose}><X size={17} /></button></header>
    {exchangedAmount === null ? <>
      <section className="client-card bean-exchange-balance"><span className="client-eyebrow">可用糖豆</span><strong>{beanBalance.toLocaleString()} <small>糖豆</small></strong></section>
      <label className="bean-withdraw-amount bean-exchange-amount"><span>兑换糖豆数</span><div><input aria-label="兑换糖豆数" inputMode="numeric" type="number" min="1" max={beanBalance} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="请输入糖豆数" /><span>糖豆</span></div></label>
      <div className="bean-exchange-preview" aria-live="polite"><span>{validAmount ? parsedAmount.toLocaleString() : '—'} 糖豆</span><strong>1 : 1</strong><span>{validAmount ? parsedAmount.toLocaleString() : '—'} 金豆</span></div>
      <footer><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" disabled={!validAmount} onClick={() => { if (onExchange(parsedAmount)) setExchangedAmount(parsedAmount) }}>确认兑换</button></footer>
    </> : <>
      <div className="bean-exchange-result"><span className="checkout-success-card__icon"><CheckCircle2 size={30} /></span><strong>{exchangedAmount.toLocaleString()} <small>糖豆</small></strong><span>已兑换为 {exchangedAmount.toLocaleString()} 金豆</span></div>
      <footer><button type="button" className="client-button client-button--primary" onClick={onClose}>完成</button></footer>
    </>}
  </section></div>
}

export function WalletLedgerPanel({ entries, pendingEntries }: { entries: readonly WalletTransaction[]; pendingEntries?: readonly PendingBeanSettlementEntry[] }) {
  const [filter, setFilter] = useState<'全部' | '收入' | '支出'>('全部')
  const [activeTab, setActiveTab] = useState<'available' | 'pending' | 'withdrawals'>('available')
  const filteredEntries = entries.filter((entry) => filter === '全部' || (filter === '收入' ? entry.amount > 0 : entry.amount < 0))
  const hasPendingTab = pendingEntries !== undefined
  return <div className="client-content account-page wallet-ledger-panel">
    {hasPendingTab && <div className="wallet-ledger-type-tabs" role="tablist" aria-label="糖豆明细类型"><button type="button" role="tab" aria-selected={activeTab === 'available'} className={activeTab === 'available' ? 'is-active' : ''} onClick={() => setActiveTab('available')}>可提现糖豆</button><button type="button" role="tab" aria-selected={activeTab === 'pending'} className={activeTab === 'pending' ? 'is-active' : ''} onClick={() => setActiveTab('pending')}>待结算糖豆</button><button type="button" role="tab" aria-selected={activeTab === 'withdrawals'} className={activeTab === 'withdrawals' ? 'is-active' : ''} onClick={() => setActiveTab('withdrawals')}>提现记录</button></div>}
    {activeTab === 'available' ? <><div className="transaction-filter-heading"><div className="transaction-filter-tabs" role="group" aria-label="收支类型筛选">{(['全部', '收入', '支出'] as const).map((item) => <button type="button" key={item} className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div></div>{filteredEntries.length ? <TransactionList entries={filteredEntries} /> : <div className="account-empty-inline"><History size={22} /><strong>{entries.length ? `暂无${filter}记录` : '暂无收支记录'}</strong></div>}</> : activeTab === 'pending' ? <PendingBeanSettlementList entries={pendingEntries ?? []} /> : <BeanWithdrawalList />}
  </div>
}

function BeanWithdrawalList() {
  return mockBeanWithdrawalRecords.length ? <div className="wallet-transaction-list">{mockBeanWithdrawalRecords.map((record) => <article className="wallet-transaction" key={record.applicationNo}>
    <header><span>{record.status}</span><strong>¥ {(record.amount / 10).toFixed(2)}</strong></header>
    <dl><div><dt>提现金额</dt><dd>{record.amount.toLocaleString()} 糖豆（¥ {(record.amount / 10).toFixed(2)}）</dd></div><div><dt>申请编号</dt><dd>{record.applicationNo}</dd></div><div><dt>提现时间</dt><dd>{record.time}</dd></div><div><dt>状态</dt><dd>{record.status}</dd></div><div><dt>提现账户</dt><dd>{record.account}</dd></div>{record.status === '驳回' && <div><dt>驳回原因</dt><dd>{record.rejectionReason ?? '—'}</dd></div>}</dl>
  </article>)}</div> : <div className="account-empty-inline"><History size={22} /><strong>暂无提现记录</strong></div>
}

function PendingBeanSettlementList({ entries }: { entries: readonly PendingBeanSettlementEntry[] }) {
  return entries.length ? <div className="wallet-transaction-list pending-bean-settlement-list">{entries.map((entry) => <article className="wallet-transaction" key={entry.id}>
    <header><span>{entry.type}</span></header>
    <dl><div><dt>订单号</dt><dd>{entry.orderId}</dd></div><div><dt>待结算金额</dt><dd>{entry.amount.toLocaleString()} 糖豆</dd></div><div><dt>创建时间</dt><dd>{entry.createdAt}</dd></div><div><dt>预期分账时间</dt><dd>{entry.expectedSettlementAt}</dd></div></dl>
  </article>)}</div> : <div className="account-empty-inline"><History size={22} /><strong>暂无待结算记录</strong></div>
}

type OrdersPageProps = StateProps & {
  initialTab?: '我的下单' | '我的接单' | '考生订单' | '考官订单'
  orders: ClientOrder[]
  selectedOrderId: string | null
  diamondBalance: number
  onSelectOrder: (orderId: string | null) => void
  onReorder: (order: ClientOrder) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onPayPendingOrder: (orderId: string) => boolean
  onRequestEarlyEnd: (orderId: string) => void
  onRenewOrder: (orderId: string, quantity: number) => boolean
  onOpenRecharge: () => void
  workbench: WorkbenchLogic
  examCandidateOrders: ExamOrder[]
  examProctorOrders: ExamOrder[]
  selectedExamOrderId: string | null
  onSelectExamOrder: (order: ExamOrder | null, role: '考生订单' | '考官订单' | null) => void
  onCancelExamOrder: (orderId: string) => void
  onSubmitExamMaterials: (orderId: string, submission: ExamSubmission) => void
  onPayExamOrder: (order: ExamOrder) => void
}
const orderStatuses: OrderStatus[] = ['待接单', '待服务', '服务中', '暂停中', '待用户确认', '已完成', '已取消']

export function OrdersPage({ pageState, onRetry, initialTab = '我的下单', orders, selectedOrderId, diamondBalance, onSelectOrder, onReorder, onUpdateStatus, onPayPendingOrder, onRequestEarlyEnd, onRenewOrder, onOpenRecharge, workbench, examCandidateOrders, examProctorOrders, selectedExamOrderId, onSelectExamOrder, onCancelExamOrder, onSubmitExamMaterials, onPayExamOrder }: OrdersPageProps) {
  const [tab, setTab] = useState<'我的下单' | '我的接单' | '考生订单' | '考官订单'>(initialTab)
  const [filter, setFilter] = useState<'全部' | OrderStatus>('全部')
  const [workbenchFilter, setWorkbenchFilter] = useState('全部')
  const [examFilters, setExamFilters] = useState<Record<'考生订单' | '考官订单', '全部' | ExamOrderStatus>>({ 考生订单: '全部', 考官订单: '全部' })
  const [examCancelOrder, setExamCancelOrder] = useState<ExamOrder | null>(null)
  const [examSubmissionOrder, setExamSubmissionOrder] = useState<ExamOrder | null>(null)
  const [examCandidateInfoOrder, setExamCandidateInfoOrder] = useState<ExamOrder | null>(null)
  const filteredOrders = useMemo(() => filter === '全部' ? orders : orders.filter((order) => order.status === filter), [filter, orders])
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>

  const examOrders = tab === '考生订单' ? examCandidateOrders : examProctorOrders
  const examStatuses: ExamOrderStatus[] = tab === '考生订单' ? ['待支付', '待考核', '审核中', '已通过', '未通过', '已取消'] : ['待考核', '审核中', '已通过', '未通过']
  const currentExamFilter = tab === '考生订单' || tab === '考官订单' ? examFilters[tab] : '全部'
  const filteredExamOrders = currentExamFilter === '全部' ? examOrders : examOrders.filter(order => order.status === currentExamFilter)
  const renderExamOrders = (items: ExamOrder[]) => items.length ? <div className="orders-list exam-orders-list" role="group" aria-label={`${tab}列表`}>
    <div className="order-list-header"><span>订单号</span><span>{tab === '考生订单' ? '考官' : '考生'}信息</span><span>考试信息</span><span>价格</span><span>状态</span><span>操作</span></div>
    {items.map(order => <ExamOrderRow key={order.id} order={order} role={tab as '考生订单' | '考官订单'} selected={selectedExamOrderId === order.id} onSelect={() => onSelectExamOrder(order, tab as '考生订单' | '考官订单')} onPay={() => onPayExamOrder(order)} onCancel={() => setExamCancelOrder(order)} onSubmit={() => setExamSubmissionOrder(order)} onViewCandidate={() => setExamCandidateInfoOrder(order)} />)}
  </div> : <div className="account-empty-inline"><History size={22} /><strong>没有符合条件的订单</strong></div>

  return <>
  <div className="client-content account-page">
    <PageHeading title="我的订单" />
    <nav className="personal-center-tabs orders-role-tabs" role="tablist" aria-label="订单类型">
      {(['我的下单', '我的接单', '考生订单', '考官订单'] as const).map(item => <button type="button" role="tab" key={item} className={`personal-center-tab${tab === item ? ' is-active' : ''}`} aria-selected={tab === item} onClick={() => { setTab(item); onSelectOrder(null); workbench.setSelectedOrderId(null); onSelectExamOrder(null, null) }}>{item}</button>)}
    </nav>
    {tab === '我的接单' ? <WorkbenchOrdersPanel logic={workbench} filter={workbenchFilter} onFilterChange={value => { setWorkbenchFilter(value); workbench.setSelectedOrderId(null) }} label="接单" /> : tab === '考生订单' || tab === '考官订单' ? <section className="client-card orders-list-card exam-orders-card">
      <div className="orders-list-card__toolbar"><span className="client-count">{filteredExamOrders.length} 笔订单</span></div>
      <div className="orders-filter-bar" role="group" aria-label={`按${tab}状态筛选`}>{(['全部', ...examStatuses] as Array<'全部' | ExamOrderStatus>).map(status => <button type="button" key={status} className={`orders-filter-chip${currentExamFilter === status ? ' is-active' : ''}`} aria-pressed={currentExamFilter === status} onClick={() => setExamFilters(current => ({ ...current, [tab]: status }))}>{status}</button>)}</div>
      {renderExamOrders(filteredExamOrders)}
    </section> : <section className="client-card orders-list-card">
      <div className="orders-list-card__toolbar"><span className="client-count">{filteredOrders.length} 笔订单</span></div>
      <div className="orders-filter-bar" role="group" aria-label="按订单状态筛选">
        {(['全部', ...orderStatuses] as Array<'全部' | OrderStatus>).map((status) => <button type="button" key={status} className={`orders-filter-chip${filter === status ? ' is-active' : ''}`} aria-pressed={filter === status} onClick={() => { setFilter(status); onSelectOrder(null) }}>{status === '待用户确认' ? '待确认' : status}</button>)}
      </div>
      {filteredOrders.length === 0 ? <div className="account-empty-inline"><History size={22} /><strong>没有符合条件的订单</strong><button type="button" className="client-button client-button--secondary" onClick={() => { setFilter('全部'); onSelectOrder(null) }}>查看全部订单</button></div> : <div className="orders-list" role="group" aria-label="订单列表">
        <div className="order-list-header"><span>订单号</span><span>陪玩信息</span><span>服务信息</span><span>时长</span><span>价格</span><span>状态 / 快捷操作</span></div>
        {filteredOrders.map((order) => <OrderCard order={order} key={order.id} selected={selectedOrderId === order.id} diamondBalance={diamondBalance} onSelect={() => onSelectOrder(order.id)} onReorder={() => onReorder(order)} onUpdateStatus={onUpdateStatus} onPayPendingOrder={onPayPendingOrder} onRequestEarlyEnd={onRequestEarlyEnd} onRenewOrder={onRenewOrder} onOpenRecharge={onOpenRecharge} />)}
      </div>}
    </section>
    }
  </div>
  {examCancelOrder && <DialogPanel overlayId="exam-order-list-cancel-confirm" title="取消考核订单" onClose={() => setExamCancelOrder(null)} width={440} footer={<><button type="button" className="client-button client-button--secondary" onClick={() => setExamCancelOrder(null)}>返回</button><button type="button" className="client-button client-button--primary" onClick={() => { onCancelExamOrder(examCancelOrder.id); setExamCancelOrder(null) }}>确认取消</button></>}><p>确认取消这笔考核订单吗？取消后订单将关闭。</p></DialogPanel>}
  {examSubmissionOrder && <ExamSubmissionDialog order={examSubmissionOrder} onClose={() => setExamSubmissionOrder(null)} onSubmit={submission => { onSubmitExamMaterials(examSubmissionOrder.id, submission); setExamSubmissionOrder(null) }} />}
  {examCandidateInfoOrder && <DialogPanel overlayId="exam-order-candidate-info" title="考生资料" onClose={() => setExamCandidateInfoOrder(null)} width={520} footer={<button type="button" className="client-button client-button--primary" onClick={() => setExamCandidateInfoOrder(null)}>完成</button>}>
    <div className="exam-candidate-info">
      <div className="exam-candidate-info__person"><AvatarMark initials={examCandidateInfoOrder.initials} size="lg" /><div><strong><UserNameWithLevel name={examCandidateInfoOrder.person} identityId={examCandidateInfoOrder.personId} /></strong><span>{examCandidateInfoOrder.clubName}</span></div></div>
      <dl className="exam-candidate-info__facts"><dt>订单号</dt><dd>{examCandidateInfoOrder.id}</dd><dt>下单时间</dt><dd>{examCandidateInfoOrder.createdAt}</dd><dt>游戏</dt><dd>{examCandidateInfoOrder.game}</dd><dt>玩法</dt><dd>{examCandidateInfoOrder.play}</dd><dt>等级</dt><dd>{examCandidateInfoOrder.level}</dd><dt>服务</dt><dd>{examCandidateInfoOrder.service}</dd></dl>
    </div>
  </DialogPanel>}
  </>
}

function ExamOrderRow({ order, role, selected, onSelect, onPay, onCancel, onSubmit, onViewCandidate }: { order: ExamOrder; role: '考生订单' | '考官订单'; selected: boolean; onSelect: () => void; onPay: () => void; onCancel: () => void; onSubmit: () => void; onViewCandidate: () => void }) {
  const statusClass = order.status === '已通过' ? 'completed' : order.status === '未通过' || order.status === '已取消' ? 'cancelled' : 'active'
  return <article className={`order-item exam-order-row${selected ? ' is-selected' : ''}`}>
    <button type="button" className="exam-order-row__main" aria-label={`查看考核订单 ${order.id}，${order.person}，${order.status}`} onClick={onSelect}>
      <span className="order-item__info"><strong>{order.id}</strong><small>{order.createdAt}</small></span>
      <span className="order-item__companion"><AvatarMark initials={order.initials} size="sm" /><span className="order-item__companion-copy"><strong><UserNameWithLevel name={order.person} identityId={order.personId} /></strong>{role === '考生订单' && <small>{order.clubName}</small>}</span></span>
      <span className="order-item__service"><strong>{order.game} · {order.play}</strong><small>{order.level} · {order.service}</small></span>
      <span className="order-item__price"><strong>500 金豆</strong></span>
      <span className="workbench-order-table-row__status"><span className={`order-item__status order-item__status--${statusClass}`}>{order.status}</span></span>
    </button>
    <div className="exam-order-row__actions" aria-label={`订单 ${order.id} 操作`}>
      {role === '考生订单' && order.status === '待支付' && <><ExamOrderPayButton onPay={onPay} /><button type="button" className="client-button client-button--secondary" onClick={onCancel}>取消订单</button></>}
      {role === '考官订单' && order.status === '待考核' && <button type="button" className="client-button client-button--primary" onClick={onSubmit}>提交资料</button>}
      {role === '考官订单' && <button type="button" className="client-button client-button--secondary" onClick={onViewCandidate}>查看资料</button>}
    </div>
  </article>
}

type CheckoutPageProps = StateProps & {
  orderService: { companion: Companion; service: Service; gameName: string } | null
  orderSelectionMode: 'locked' | 'service' | 'cascade'
  selectedCompanions: Companion[]
  availableServices: Service[]
  diamondBalance: number
  paymentCards: { id: string; name: string; balance: number; serviceDiscountRate: number }[]
  onBack: () => void
  onOpenWallet: () => void
  hideRechargePrompt: boolean
  onResetRechargePrompt: () => void
  onSelectService: (serviceId: string) => void
  onCommunicate: (companionId: string) => void
  onComplete: (quantity: number, amount: number, remark: string, selectedCompanions: Companion[], tipAmount: number, paymentSource: 'wallet' | 'premium-card', premiumCardId?: string) => string | null
  onOpenOrders: () => void
}

export function CheckoutPage({ pageState, onRetry, orderService, orderSelectionMode, selectedCompanions, availableServices, diamondBalance, paymentCards, onBack, onOpenWallet, hideRechargePrompt, onResetRechargePrompt, onSelectService, onCommunicate, onComplete, onOpenOrders }: CheckoutPageProps) {
  const [quantity, setQuantity] = useState(1)
  const [remark, setRemark] = useState('')
  const [tipInput, setTipInput] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [servicePickerOpen, setServicePickerOpen] = useState(false)
  const [serviceSearchQuery, setServiceSearchQuery] = useState('')
  const [selectedGameId, setSelectedGameId] = useState('')
  const [selectedPlayName, setSelectedPlayName] = useState('')
  const [selectedLevelName, setSelectedLevelName] = useState('')
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const [checkoutDialog, setCheckoutDialog] = useState<'notice' | 'payment' | 'recharge' | null>(null)
  const [noticeTab, setNoticeTab] = useState<'club' | 'service'>('club')
  const [skipNoticeForSession, setSkipNoticeForSession] = useState(false)
  const [noticeSkipped, setNoticeSkipped] = useState(() => sessionStorage.getItem('checkout-order-notice-skipped') === 'true')
  if (pageState !== 'normal') return <div className="client-content account-page"><PageState pageState={pageState} onRetry={onRetry} /></div>
  if (!orderService) return <div className="client-content account-page"><PageStatePanel state="error" title="找不到这项服务" description="请返回陪玩详情重新选择服务。" actionLabel="返回陪玩详情" onAction={onBack} /></div>

  const { companion, service } = orderService
  const checkoutCompanions = selectedCompanions.length ? selectedCompanions : [companion]
  const parsedTipAmount = tipInput === '' ? 0 : Number(tipInput)
  const tipPerCompanion = Number.isFinite(parsedTipAmount) && parsedTipAmount >= 0 ? parsedTipAmount : 0
  const tipAmount = tipPerCompanion * checkoutCompanions.length
  const serviceAmount = service.price * quantity * checkoutCompanions.length
  const selectedPaymentCard = paymentCards.find((card) => card.id === paymentMethod)
  const discountRate = selectedPaymentCard?.serviceDiscountRate ?? 1
  const discountedServiceAmount = Math.round(serviceAmount * discountRate)
  const amount = discountedServiceAmount + tipAmount
  const selectedPaymentBalance = selectedPaymentCard?.balance ?? diamondBalance
  const validTip = tipInput === '' || (Number.isInteger(parsedTipAmount) && parsedTipAmount >= 10 && parsedTipAmount <= 1_000_000)
  const beginPayment = () => {
    onResetRechargePrompt()
    if (selectedPaymentBalance < amount) {
      setCheckoutDialog('recharge')
      return
    }
    setCheckoutDialog(noticeSkipped ? 'payment' : 'notice')
  }
  const orderableServices = availableServices.filter((item) => item.canAcceptOrders)
  const serviceTree = [...new Set(orderableServices.map((item) => item.gameId))].map((gameId) => {
    const gameServices = orderableServices.filter((item) => item.gameId === gameId)
    return {
      gameId,
      gameName: games.find((game) => game.id === gameId)?.name ?? gameId,
      plays: [...new Set(gameServices.map((item) => item.playName))].map((playName) => {
        const playServices = gameServices.filter((item) => item.playName === playName)
        return {
          playName,
          levels: [...new Set(playServices.map((item) => item.levelName))].map((levelName) => ({
            levelName,
            services: playServices.filter((item) => item.levelName === levelName),
          })),
        }
      }),
    }
  })
  const servicePaths = serviceTree.flatMap((gameNode) => gameNode.plays.flatMap((playNode) => playNode.levels.flatMap((levelNode) => levelNode.services.map((serviceItem) => ({
    gameNode,
    playNode,
    levelNode,
    serviceItem,
    label: `${gameNode.gameName} · ${playNode.playName} · ${levelNode.levelName} · ${serviceItem.price} 金豆 / ${serviceItem.unit}`,
  })))))
  const normalizedServiceQuery = serviceSearchQuery.trim().toLocaleLowerCase()
  const filteredServicePaths = normalizedServiceQuery ? servicePaths.filter((path) => path.label.toLocaleLowerCase().includes(normalizedServiceQuery)) : []
  const serviceOnlyOptions = orderableServices.filter((item) => item.gameId === service.gameId && item.playName === service.playName && item.levelName === service.levelName)
  const filteredServiceOptions = serviceOnlyOptions.filter((item) => `${item.unit}服务 ${item.price} 金豆 / ${item.unit}`.toLocaleLowerCase().includes(normalizedServiceQuery))
  const openServicePicker = () => {
    if (orderSelectionMode === 'locked') return
    setServiceSearchQuery('')
    setSelectedGameId('')
    setSelectedPlayName('')
    setSelectedLevelName('')
    setServicePickerOpen(true)
  }
  const selectService = (serviceId: string) => {
    setQuantity(1)
    setServicePickerOpen(false)
    onSelectService(serviceId)
  }
  const selectedGame = serviceTree.find((node) => node.gameId === selectedGameId)
  const selectedPlay = selectedGame?.plays.find((node) => node.playName === selectedPlayName)
  const selectedLevel = selectedPlay?.levels.find((node) => node.levelName === selectedLevelName)
  if (completedOrderId) return <div className="client-content account-page">
    <section className="client-card checkout-success-card"><span className="checkout-success-card__icon"><CheckCircle2 size={30} /></span><h1>订单已提交</h1><p>订单编号：{completedOrderId}</p><div className="checkout-success-card__actions"><button type="button" className="client-button client-button--primary" onClick={onOpenOrders}>查看我的订单</button><button type="button" className="client-button client-button--secondary" onClick={onBack}>返回陪玩详情</button></div></section>
  </div>

  return <div className="client-content account-page">
    <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={15} />返回陪玩详情</button>
    <PageHeading title="确认订单" />
    <div className="checkout-grid">
      <section className="client-card checkout-service-card">
        <div className="client-section-heading"><div><h2>服务信息</h2></div><span className="client-badge">{checkoutCompanions.length === 1 ? '单陪服务' : `${checkoutCompanions.length} 人服务`}</span></div>
        <div className="checkout-companion-list">{checkoutCompanions.map((item) => <div className="checkout-companion" key={item.id}><div className="checkout-companion__avatars"><AvatarMark initials={item.initials} size="md" /></div><div className="checkout-companion__details"><div className="checkout-companion__person"><UserNameWithLevel name={item.name} identityId={item.id} /><span className="checkout-companion__demographics" aria-label={`性别${item.gender}，${item.age}岁`}>{item.gender === '女' ? <Venus size={13} aria-hidden="true" /> : <Mars size={13} aria-hidden="true" />}{item.age}</span></div><small className="checkout-companion__club">{clubs.find((club) => club.id === item.clubId)?.name}</small></div><button type="button" className="client-button client-button--primary client-button--small checkout-companion__communicate" onClick={() => onCommunicate(item.id)}><MessageCircle size={14} />马上沟通</button></div>)}</div>
        <div className="checkout-service-facts"><span>选择服务</span><div className="checkout-service-picker">
          <button type="button" className="checkout-service-picker__trigger" disabled={orderSelectionMode === 'locked'} aria-expanded={servicePickerOpen} onClick={() => servicePickerOpen ? setServicePickerOpen(false) : openServicePicker()}><span><strong>{games.find((game) => game.id === service.gameId)?.name} · {service.playName} · {service.levelName}{orderSelectionMode === 'locked' ? ` · ${service.unit}服务` : ''}</strong></span>{orderSelectionMode === 'locked' ? <span className="checkout-service-picker__locked">已锁定</span> : <ChevronDown size={16} />}</button>
          {servicePickerOpen && <div className="checkout-service-picker__panel" role="dialog" aria-label="选择服务">
            {orderSelectionMode === 'service' ? <>
              <label className="checkout-cascader-search"><Search size={14} /><input type="search" value={serviceSearchQuery} onChange={(event) => setServiceSearchQuery(event.target.value)} placeholder="搜索服务" aria-label="搜索具体服务" />{serviceSearchQuery && <button type="button" aria-label="清除搜索" onClick={() => setServiceSearchQuery('')}><X size={14} /></button>}</label>
              <div className="checkout-cascader-results" role="listbox" aria-label="可选的具体服务">
                {(normalizedServiceQuery ? filteredServiceOptions : serviceOnlyOptions).map((item) => <button type="button" role="option" aria-selected={item.id === service.id} key={item.id} className="checkout-cascader-result" onClick={() => selectService(item.id)}><span>{item.unit}服务 · {item.price.toLocaleString()} 金豆 / {item.unit}</span></button>)}
                {serviceOnlyOptions.length === 0 && <p className="checkout-cascader-empty">没有其他可选服务</p>}
                {normalizedServiceQuery && filteredServiceOptions.length === 0 && serviceOnlyOptions.length > 0 && <p className="checkout-cascader-empty">没有匹配的服务</p>}
              </div>
            </> : <>
            <label className="checkout-cascader-search"><Search size={14} /><input type="search" value={serviceSearchQuery} onChange={(event) => setServiceSearchQuery(event.target.value)} placeholder="搜索游戏、玩法、等级或服务" aria-label="搜索游戏、玩法、等级或服务" />{serviceSearchQuery && <button type="button" aria-label="清除搜索" onClick={() => setServiceSearchQuery('')}><X size={14} /></button>}</label>
            {normalizedServiceQuery ? <div className="checkout-cascader-results" role="listbox" aria-label="匹配的服务路径">
              {filteredServicePaths.map((path) => <button type="button" role="option" key={path.serviceItem.id} className="checkout-cascader-result" onClick={() => selectService(path.serviceItem.id)}><span>{path.label}</span></button>)}
              {!filteredServicePaths.length && <p className="checkout-cascader-empty">没有匹配的服务</p>}
            </div> : <div className="checkout-cascader" aria-label="按游戏、玩法、等级和服务选择">
              <div className="checkout-cascader__column" role="listbox" aria-label="游戏">{serviceTree.map((gameNode) => <button type="button" role="option" aria-selected={selectedGameId === gameNode.gameId} key={gameNode.gameId} className={`checkout-cascader__option${selectedGameId === gameNode.gameId ? ' is-selected' : ''}`} onClick={() => { setSelectedGameId(gameNode.gameId); setSelectedPlayName(''); setSelectedLevelName('') }}><span>{gameNode.gameName}</span><ChevronRight size={14} /></button>)}</div>
              <div className="checkout-cascader__column" role="listbox" aria-label="玩法">{selectedGame?.plays.map((playNode) => <button type="button" role="option" aria-selected={selectedPlayName === playNode.playName} key={playNode.playName} className={`checkout-cascader__option${selectedPlayName === playNode.playName ? ' is-selected' : ''}`} onClick={() => { setSelectedPlayName(playNode.playName); setSelectedLevelName('') }}><span>{playNode.playName}</span><ChevronRight size={14} /></button>)}</div>
              <div className="checkout-cascader__column" role="listbox" aria-label="等级">{selectedPlay?.levels.map((levelNode) => <button type="button" role="option" aria-selected={selectedLevelName === levelNode.levelName} key={levelNode.levelName} className={`checkout-cascader__option${selectedLevelName === levelNode.levelName ? ' is-selected' : ''}`} onClick={() => setSelectedLevelName(levelNode.levelName)}><span>{levelNode.levelName}</span><ChevronRight size={14} /></button>)}</div>
              <div className="checkout-cascader__column" role="listbox" aria-label="服务">{selectedLevel?.services.map((item) => <button type="button" role="option" key={item.id} className="checkout-cascader__option checkout-cascader__option--service" onClick={() => selectService(item.id)}><span>服务 · {item.price} 金豆 / {item.unit}</span></button>)}</div>
            </div>}
            </>}
          </div>}
        </div></div>
        <div className="checkout-service-unit-price"><span>服务单价</span><strong>{service.price} 金豆 / {service.unit}</strong></div>
        <div className="checkout-order-parameters"><fieldset className="checkout-duration"><legend>服务时长</legend><div className="checkout-duration__controls"><button type="button" className="checkout-duration__stepper" aria-label="减少服务时长" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><span aria-hidden="true">−</span></button><label><input type="number" min="1" step="1" value={quantity} aria-label={`服务时长，${service.unit}`} onChange={(event) => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 1) setQuantity(value) }} /><span>{service.unit}</span></label><button type="button" className="checkout-duration__stepper" aria-label="增加服务时长" onClick={() => setQuantity((value) => value + 1)}><span aria-hidden="true">+</span></button></div>{service.unit === '小时' && <div className="checkout-duration__shortcuts">{[3, 6, 12].map((value) => <button type="button" key={value} className={`client-choice-button${quantity === value ? ' is-active' : ''}`} aria-pressed={quantity === value} onClick={() => setQuantity(value)}>{value} 小时</button>)}</div>}</fieldset>
          <label className="checkout-tip"><span>加价 <small>选填</small></span><div><input aria-label="加价金额，金豆" type="number" min="10" max="1000000" step="1" inputMode="numeric" value={tipInput} onChange={(event) => setTipInput(event.target.value)} placeholder="加价范围10～100万" /><span>金豆 / 人</span></div></label>
        </div>
        {!validTip && <p className="checkout-tip-error" role="alert">加价需为 10～1,000,000 的整数金豆。</p>}
        <label className="checkout-remark"><span>订单备注 <small>选填</small></span><textarea value={remark} maxLength={100} onChange={(event) => setRemark(event.target.value)} placeholder="告诉陪玩你的需求，最多100字" rows={3} /><small className="checkout-remark__count">{remark.length}/100</small></label>
      </section>
      <aside className="client-card checkout-summary-card">
        <h2>支付信息</h2>
        <fieldset className="checkout-payment-options"><legend>支付方式</legend>
          <label className={`checkout-payment-option${paymentMethod === 'wallet' ? ' is-active' : ''}`}><input type="radio" name="checkout-payment-source" aria-label="金豆钱包" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} /><span><strong>金豆钱包</strong><small>{diamondBalance.toLocaleString()} 金豆</small></span></label>
          {paymentCards.map((card) => { const enough = card.balance >= Math.round(serviceAmount * card.serviceDiscountRate) + tipAmount; return <label className={`checkout-payment-option${paymentMethod === card.id ? ' is-active' : ''}${enough ? '' : ' is-disabled'}`} key={card.id}><input type="radio" name="checkout-payment-source" aria-label={`尊享卡 ${card.name}，服务 ${Math.round(card.serviceDiscountRate * 100)} 折，余额 ${card.balance} 金豆${enough ? '' : '，余额不足'}`} checked={paymentMethod === card.id} disabled={!enough} onChange={() => setPaymentMethod(card.id)} /><span><strong>{card.name} · 服务 {Math.round(card.serviceDiscountRate * 100)} 折</strong><small>{card.balance.toLocaleString()} 金豆{enough ? '' : ' · 余额不足'}</small></span></label> })}
        </fieldset>
        <div className="checkout-summary-line"><span>服务小计</span><strong>{serviceAmount.toLocaleString()} 金豆</strong></div>
        {selectedPaymentCard && discountRate < 1 && <div className="checkout-summary-line"><span>尊享卡优惠（{Math.round(discountRate * 100)} 折）</span><strong>−{(serviceAmount - discountedServiceAmount).toLocaleString()} 金豆</strong></div>}
        <div className="checkout-summary-line"><span>加价</span><strong>{tipAmount.toLocaleString()} 金豆</strong></div>
        <div className="checkout-summary-line checkout-summary-line--balance"><span>{selectedPaymentCard ? '尊享卡余额' : '金豆余额'}</span><strong>{selectedPaymentBalance.toLocaleString()} 金豆</strong></div>
        <div className="checkout-total"><span>应付金额</span><strong>{amount.toLocaleString()} <small>金豆</small></strong></div>
        {!service.canAcceptOrders ? <div className="checkout-insufficient" role="status"><strong>暂不可接单</strong><button type="button" className="client-button client-button--secondary" onClick={openServicePicker}>选择其他服务</button></div> : <button type="button" className="client-button client-button--primary checkout-pay-button" disabled={!validTip || (selectedPaymentCard !== undefined && selectedPaymentBalance < amount)} onClick={beginPayment}><Coins size={16} />确认支付</button>}
      </aside>
    </div>
    {checkoutDialog && !(checkoutDialog === 'recharge' && hideRechargePrompt) && <div className="order-action-overlay checkout-confirm-overlay" data-overlay={checkoutDialog === 'notice' ? 'checkout-order-notice' : checkoutDialog === 'payment' ? 'checkout-payment-confirmation' : 'checkout-recharge-confirmation'} role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setCheckoutDialog(null) }}>
      <section className={`order-action-dialog${checkoutDialog === 'notice' ? ' checkout-order-notice-dialog' : ''}`} role="dialog" aria-modal="true" aria-labelledby="checkout-confirm-title">
        <header><h2 id="checkout-confirm-title">{checkoutDialog === 'notice' ? '点单须知' : checkoutDialog === 'payment' ? '确认支付' : '金豆余额不足'}</h2><button type="button" className="order-action-dialog__close" aria-label="关闭确认弹窗" onClick={() => setCheckoutDialog(null)}><X size={17} /></button></header>
        {checkoutDialog === 'notice' ? <div className="checkout-notice">
          <div className="checkout-notice__tabs" role="tablist" aria-label="点单须知分类">
            <button type="button" role="tab" aria-selected={noticeTab === 'club'} className={noticeTab === 'club' ? 'is-active' : ''} onClick={() => setNoticeTab('club')}>俱乐部介绍</button>
            <button type="button" role="tab" aria-selected={noticeTab === 'service'} className={noticeTab === 'service' ? 'is-active' : ''} onClick={() => setNoticeTab('service')}>服务说明</button>
          </div>
          <div className="checkout-notice__content" role="tabpanel">
            <p>{noticeTab === 'club' ? '俱乐部介绍内容待补充。' : '服务项目与实际价格请以陪玩资料为准。'}</p>
            <div className="checkout-notice__placeholder" role="img" aria-label="内容图片占位"><span /><i /><b /></div>
          </div>
          <footer><label className="checkout-notice__skip"><input type="checkbox" checked={skipNoticeForSession} onChange={(event) => setSkipNoticeForSession(event.target.checked)} />不再提醒</label><button type="button" className="client-button client-button--primary" onClick={() => { if (skipNoticeForSession) { sessionStorage.setItem('checkout-order-notice-skipped', 'true'); setNoticeSkipped(true) } setCheckoutDialog('payment') }}>同意并继续</button></footer>
        </div> : <>
        {checkoutDialog === 'payment' ? <p>应付金额：<strong>{amount.toLocaleString()} 金豆</strong></p> : <p>当前金豆余额为 {diamondBalance.toLocaleString()} 金豆，本次应付 {amount.toLocaleString()} 金豆，还差 <strong>{(amount - diamondBalance).toLocaleString()} 金豆</strong>。打开充值弹窗补充余额吗？</p>}
        <footer><button type="button" className="client-button client-button--secondary" onClick={() => setCheckoutDialog(null)}>{checkoutDialog === 'payment' ? '再想想' : '稍后再说'}</button><button type="button" className="client-button client-button--primary" onClick={() => {
          if (checkoutDialog === 'recharge') { setCheckoutDialog(null); onOpenWallet(); return }
          setCompletedOrderId(onComplete(quantity, amount, remark, checkoutCompanions, tipAmount, selectedPaymentCard ? 'premium-card' : 'wallet', selectedPaymentCard?.id))
          setCheckoutDialog(null)
        }}>{checkoutDialog === 'payment' ? '确认支付' : '去充值'}</button></footer></>}
      </section>
    </div>}
  </div>
}

function PageHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <header className="client-page-heading account-page-heading"><div>{eyebrow && <span className="client-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div></header>
}

function TransactionList({ entries }: { entries: readonly WalletTransaction[] }) {
  return <div className="wallet-transaction-list">{entries.map((entry) => <article className="wallet-transaction" key={entry.id}>
    <header><span>{entry.type}</span><strong className={entry.amount > 0 ? 'is-income' : ''}>{entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}</strong></header>
    <dl><div><dt>流水号</dt><dd>{entry.id}</dd></div><div><dt>关联订单号</dt><dd>{entry.relatedOrderId ?? '—'}</dd></div><div><dt>时间</dt><dd>{entry.date}</dd></div></dl>
  </article>)}</div>
}

function OrderCard({ order, selected, diamondBalance, onSelect, onReorder, onUpdateStatus, onPayPendingOrder, onRequestEarlyEnd, onRenewOrder, onOpenRecharge }: { order: ClientOrder; selected: boolean; diamondBalance: number; onSelect: () => void; onReorder: () => void; onUpdateStatus: (orderId: string, status: OrderStatus) => void; onPayPendingOrder: (orderId: string) => boolean; onRequestEarlyEnd: (orderId: string) => void; onRenewOrder: (orderId: string, quantity: number) => boolean; onOpenRecharge: () => void }) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const displayedStatus = order.earlyEndPending ? '待陪玩确认' : order.status === '待用户确认' ? '待确认' : order.status
  const quickActions = order.earlyEndPending ? []
    : order.status === '待支付' ? ['支付', '取消订单']
    : order.status === '待用户确认' ? ['完成订单']
    : order.status === '待接单' || order.status === '待服务' || order.status === '暂停中' ? ['提前结束']
    : order.status === '服务中' && !order.earlyEndPending ? ['确认完成', '续单', '提前结束']
    : order.status === '已完成' ? ['再次下单', '评价']
    : []
  return <article className={`order-item${selected ? ' is-selected' : ''}`}>
    <button type="button" className="order-item__main" aria-pressed={selected} aria-label={`查看订单 ${order.id}，${order.companionName}，所属俱乐部 ${getOrderClubName(order)}，${order.gameName} ${order.serviceName}，${order.duration} ${order.durationUnit}，${order.amount.toLocaleString()} 金豆，${displayedStatus}`} onClick={onSelect}>
      <span className="order-item__info"><strong>{order.id}</strong><small>{order.createdAt}</small></span>
      <span className="order-item__companion"><AvatarMark initials={order.companionInitials} size="sm" /><span className="order-item__companion-copy"><strong><UserNameWithLevel name={order.companionName} identityId={order.companionId} /></strong><small>{getOrderClubName(order)}</small></span></span>
      <span className="order-item__service"><strong>{order.gameName} · {order.serviceName}</strong><small>{order.levelName} · {order.durationUnit}服务</small></span>
      <span className="order-item__duration">{order.duration} {order.durationUnit}</span>
      <span className="order-item__price"><strong>{order.unitPrice.toLocaleString()} 金豆 / {order.durationUnit}</strong><small>合计 {order.amount.toLocaleString()} 金豆{order.tipAmount ? `（含加价 ${order.tipAmount}）` : ''}</small></span>
      <span className={`order-item__status order-item__status--${order.status === '已取消' ? 'cancelled' : order.status === '已完成' ? 'completed' : 'active'}`}>{displayedStatus}</span>
    </button>
    <div className={`order-item__actions${order.status === '服务中' ? ' order-item__actions--service' : ''}`} role="group" aria-label={`订单 ${order.id} 快捷操作`}>{quickActions.map((action) => <button type="button" key={action} className={`client-button ${action === '确认完成' || action === '支付' ? 'client-button--primary' : 'client-button--secondary'}`} onClick={() => action === '再次下单' ? onReorder() : setActiveAction(action)}>{action}</button>)}</div>
    {activeAction && <OrderActionDialog order={order} action={activeAction} clubName={getOrderClubName(order)} diamondBalance={diamondBalance} onClose={() => setActiveAction(null)} onOpenRecharge={() => { setActiveAction(null); onOpenRecharge() }} onUpdateStatus={onUpdateStatus} onPayPendingOrder={onPayPendingOrder} onRequestEarlyEnd={onRequestEarlyEnd} onRenewOrder={onRenewOrder} />}
  </article>
}

const orderActions: Record<OrderStatus, string[]> = {
  '待支付': ['支付', '取消订单'],
  '待接单': ['提前结束'],
  '待服务': ['提前结束'],
  '服务中': ['确认完成', '提前结束', '续单'],
  '暂停中': ['提前结束'],
  '待用户确认': ['完成订单'],
  '已完成': ['联系客服', '再次下单', '评价'],
  '已取消': [],
}

function getOrderClubName(order: ClientOrder) {
  const companion = companions.find((item) => item.id === order.companionId)
  return clubs.find((club) => club.id === companion?.clubId)?.name ?? '所属俱乐部'
}

function orderActionMessage(action: string) {
  if (action === '取消订单') return '确认取消这笔订单吗？未开始服务的订单将为您全额退款。'
  if (action === '确认完成' || action === '完成订单') return '请确认陪玩服务是否完成？'
  if (action === '暂停') return '确认暂停本次服务吗？确认后会记录本次服务的时长。暂停后您可以联系陪玩继续开启服务。'
  if (action === '提前结束') return '提前结束功能尚未接入；当前仅展示已服务时长，不会更改订单状态或结算金额。'
  if (action === '联系客服') return '在线客服功能尚未接入，本次仅展示操作提示。'
  return '该操作仅作原型演示，不会更改订单状态。'
}

function useOrderDialogFocus(onClose: () => void) {
  const dialogRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousActionGroup = previousFocus?.closest<HTMLElement>('.order-item, .order-detail-actions')
    const getFocusableElements = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
    ) ?? []).filter((element) => element.getClientRects().length > 0)
    getFocusableElements()[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      const dialog = dialogRef.current
      if (event.key !== 'Tab' || !dialog) return

      const focusableElements = getFocusableElements()
      const first = focusableElements[0]
      const last = focusableElements.at(-1)
      if (!first || !last) {
        event.preventDefault()
        dialog.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const focusTarget = previousFocus?.isConnected
        ? previousFocus
        : previousActionGroup?.querySelector<HTMLElement>('.order-item__main, button:not(:disabled)')
      focusTarget?.focus()
    }
  }, [])

  return dialogRef
}

function OrderActionDialog({ order, action, clubName, diamondBalance, onClose, onOpenRecharge, onUpdateStatus, onPayPendingOrder, onRequestEarlyEnd, onRenewOrder }: { order: ClientOrder; action: string; clubName: string; diamondBalance: number; onClose: () => void; onOpenRecharge: () => void; onUpdateStatus: (orderId: string, status: OrderStatus) => void; onPayPendingOrder: (orderId: string) => boolean; onRequestEarlyEnd: (orderId: string) => void; onRenewOrder: (orderId: string, quantity: number) => boolean }) {
  if (action === '评价') return <OrderReviewDialog order={order} clubName={clubName} onClose={onClose} />
  if (action === '续单') return <OrderRenewDialog order={order} diamondBalance={diamondBalance} onClose={onClose} onOpenRecharge={onOpenRecharge} onRenewOrder={onRenewOrder} />
  return <OrderActionConfirmationDialog order={order} action={action} onClose={onClose} onUpdateStatus={onUpdateStatus} onPayPendingOrder={onPayPendingOrder} onRequestEarlyEnd={onRequestEarlyEnd} />
}

function OrderActionConfirmationDialog({ order, action, onClose, onUpdateStatus, onPayPendingOrder, onRequestEarlyEnd }: { order: ClientOrder; action: string; onClose: () => void; onUpdateStatus: (orderId: string, status: OrderStatus) => void; onPayPendingOrder: (orderId: string) => boolean; onRequestEarlyEnd: (orderId: string) => void }) {
  const dialogRef = useOrderDialogFocus(onClose)
  const needsConfirmation = action === '支付' || action === '取消订单' || action === '确认完成' || action === '完成订单' || action === '提前结束'
  return <div className="order-action-overlay" data-overlay="order-action-confirmation" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={dialogRef} className={`order-action-dialog${action === '提前结束' ? ' order-action-dialog--early-end' : ''}`} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-action-title">
      <header><h2 id="order-action-title">{action}</h2><button type="button" className="order-action-dialog__close" aria-label="关闭提示" onClick={onClose}><X size={17} /></button></header>
      <p>{action === '支付' ? `确认支付${order.amount.toLocaleString()}金豆嘛？` : action === '提前结束' ? '确认提前结束吗？陪玩同意后，系统将按实际服务时长自动结算。' : orderActionMessage(action)}</p>
      {action === '提前结束' && <div className="order-early-end-summary"><span>已服务时长</span><strong>{formatServedClock(order.servedDurationMinutes)}</strong><p>当前订单已服务时长，将退还 <b>{order.earlyEndRefundAmount ?? 50}</b> 金豆</p></div>}
      <footer>{needsConfirmation ? <><button type="button" className="client-button client-button--secondary" onClick={onClose}>{action === '提前结束' ? '取消' : '返回'}</button><button type="button" className="client-button client-button--primary" onClick={() => { if (action === '支付') { if (!onPayPendingOrder(order.id)) return } else if (action === '提前结束') onRequestEarlyEnd(order.id); else onUpdateStatus(order.id, action === '取消订单' ? '已取消' : '已完成'); onClose() }}>{action === '支付' ? '确认支付' : action === '取消订单' ? '确认取消' : action === '提前结束' ? '确认' : '确认完成'}</button></> : <button type="button" className="client-button client-button--primary" onClick={onClose}>知道了</button>}</footer>
    </section>
  </div>
}

function OrderRenewDialog({ order, diamondBalance, onClose, onOpenRecharge, onRenewOrder }: { order: ClientOrder; diamondBalance: number; onClose: () => void; onOpenRecharge: () => void; onRenewOrder: (orderId: string, quantity: number) => boolean }) {
  const dialogRef = useOrderDialogFocus(onClose)
  const [quantity, setQuantity] = useState(1)
  const [result, setResult] = useState<'form' | 'insufficient' | 'success'>('form')
  const [successSummary, setSuccessSummary] = useState<{ duration: number; amount: number } | null>(null)
  const amount = order.unitPrice * quantity
  const updatedDuration = order.duration + quantity
  const updatedAmount = order.amount + amount

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus()
  }, [dialogRef, result])

  if (result === 'insufficient') return <div className="order-action-overlay" data-overlay="order-renew-recharge-confirmation" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setResult('form') }}>
    <section ref={dialogRef} className="order-action-dialog" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-renew-recharge-title">
      <header><h2 id="order-renew-recharge-title">金豆余额不足</h2><button type="button" className="order-action-dialog__close" aria-label="关闭充值提示" onClick={() => setResult('form')}><X size={17} /></button></header>
      <p>当前金豆余额 {diamondBalance.toLocaleString()}，续单需要 {amount.toLocaleString()}，还差 <strong>{Math.max(0, amount - diamondBalance).toLocaleString()} 金豆</strong>。打开充值弹窗补充余额吗？</p>
      <footer><button type="button" className="client-button client-button--secondary" onClick={() => setResult('form')}>稍后再说</button><button type="button" className="client-button client-button--primary" onClick={onOpenRecharge}>去充值</button></footer>
    </section>
  </div>

  if (result === 'success') return <div className="order-action-overlay" data-overlay="order-renew-success" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={dialogRef} className="order-action-dialog" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-renew-success-title">
      <header><h2 id="order-renew-success-title">续单成功</h2><button type="button" className="order-action-dialog__close" aria-label="关闭续单结果" onClick={onClose}><X size={17} /></button></header>
      <p>已续 {quantity} {order.durationUnit}，支付 {amount.toLocaleString()} 金豆。订单总时长更新为 {successSummary?.duration ?? updatedDuration} {order.durationUnit}，订单总价为 {(successSummary?.amount ?? updatedAmount).toLocaleString()} 金豆。</p>
      <footer><button type="button" className="client-button client-button--primary" onClick={onClose}>完成</button></footer>
    </section>
  </div>

  return <div className="order-action-overlay" data-overlay="order-renew" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={dialogRef} className="order-action-dialog order-renew-dialog" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-renew-title">
      <header><h2 id="order-renew-title">续单</h2><button type="button" className="order-action-dialog__close" aria-label="关闭续单" onClick={onClose}><X size={17} /></button></header>
      <p className="order-renew-order-id">订单 {order.id}</p>
      <label className="order-renew-quantity"><span>续单数量</span><div className="order-renew-quantity__control"><button type="button" className="client-button client-button--secondary" aria-label="减少续单数量" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><input type="number" min="1" step="1" value={quantity} aria-label={`续单数量，单位${order.durationUnit}`} onChange={(event) => setQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))} /><span>{order.durationUnit}</span><button type="button" className="client-button client-button--secondary" aria-label="增加续单数量" onClick={() => setQuantity((value) => value + 1)}>＋</button></div></label>
      <div className="order-renew-summary"><div><span>服务单价</span><strong>{order.unitPrice.toLocaleString()} 金豆 / {order.durationUnit}</strong></div><div><span>续单金额</span><strong>{amount.toLocaleString()} 金豆</strong></div><div><span>当前余额</span><strong>{diamondBalance.toLocaleString()} 金豆</strong></div></div>
      <footer><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => {
        if (onRenewOrder(order.id, quantity)) {
          setSuccessSummary({ duration: updatedDuration, amount: updatedAmount })
          setResult('success')
        } else {
          setResult('insufficient')
        }
      }}>支付并续单</button></footer>
    </section>
  </div>
}

type ReviewTarget = 'companion' | 'club'
type ReviewImage = { id: string; url: string }
type ReviewDraft = { rating: number; content: string; images: ReviewImage[]; submitted: boolean }
const emptyReviewDraft = (): ReviewDraft => ({ rating: 0, content: '', images: [], submitted: false })

function formatServedClock(minutes = 0) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return [hours, remainingMinutes, 0].map((value) => String(value).padStart(2, '0')).join(':')
}

function OrderReviewDialog({ order, clubName, onClose }: { order: ClientOrder; clubName: string; onClose: () => void }) {
  const dialogRef = useOrderDialogFocus(onClose)
  const [target, setTarget] = useState<ReviewTarget>('companion')
  const [drafts, setDrafts] = useState<Record<ReviewTarget, ReviewDraft>>({ companion: emptyReviewDraft(), club: emptyReviewDraft() })
  const previewUrls = useRef<string[]>([])
  const draft = drafts[target]
  const subject = target === 'companion' ? order.companionName : clubName

  useEffect(() => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)), [])
  useEffect(() => {
    if (draft.submitted) dialogRef.current?.querySelector<HTMLElement>('footer button:not(:disabled)')?.focus()
  }, [dialogRef, draft.submitted])

  const updateDraft = (update: Partial<ReviewDraft>) => setDrafts((current) => ({
    ...current,
    [target]: { ...current[target], ...update },
  }))

  return <div className="order-action-overlay" data-overlay="order-review" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={dialogRef} className="order-action-dialog order-review-dialog" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-review-title">
      <header><h2 id="order-review-title">评价</h2><button type="button" className="order-action-dialog__close" aria-label="关闭评价" onClick={onClose}><X size={17} /></button></header>
      <div className="order-review-order-id">订单 {order.id}</div>
      <div className="order-review-tabs" role="tablist" aria-label="选择评价对象">
        <button type="button" role="tab" aria-selected={target === 'companion'} className={target === 'companion' ? 'is-active' : ''} onClick={() => setTarget('companion')}>陪玩评价{drafts.companion.submitted && <span>已提交</span>}</button>
        <button type="button" role="tab" aria-selected={target === 'club'} className={target === 'club' ? 'is-active' : ''} onClick={() => setTarget('club')}>俱乐部评价{drafts.club.submitted && <span>已提交</span>}</button>
      </div>
      {draft.submitted ? <div className="order-review-submitted" role="status"><CheckCircle2 size={22} /><strong>{target === 'companion' ? '陪玩' : '俱乐部'}评价已提交</strong><span>本次仅作原型演示，评价内容和图片未保存。</span></div> : <div className="order-review-form">
        <strong className="order-review-subject">{subject}</strong>
        <fieldset className="order-review-rating" aria-required="true"><legend>评分</legend><div>{[1, 2, 3, 4, 5].map((score) => <button type="button" key={score} aria-label={`${score} 分`} aria-pressed={draft.rating === score} className={draft.rating >= score ? 'is-selected' : ''} onClick={() => updateDraft({ rating: score })}><Star size={22} fill={draft.rating >= score ? 'currentColor' : 'none'} /></button>)}</div><span>{draft.rating ? `${draft.rating} 分` : '请选择分数'}</span></fieldset>
        <label className="order-review-content"><span>评价内容</span><textarea required aria-required="true" value={draft.content} onChange={(event) => updateDraft({ content: event.target.value })} placeholder={`分享你对${target === 'companion' ? '陪玩' : '俱乐部'}服务的感受`} rows={4} /></label>
        <div className="order-review-images"><span>评价图片</span><div className="order-review-image-list">{draft.images.map((image, index) => <div className="order-review-image" key={image.id}><img src={image.url} alt={`待提交图片 ${index + 1}`} /><button type="button" aria-label={`移除图片 ${index + 1}`} onClick={() => { URL.revokeObjectURL(image.url); previewUrls.current = previewUrls.current.filter((url) => url !== image.url); updateDraft({ images: draft.images.filter((item) => item.id !== image.id) }) }}><X size={14} /></button></div>)}<label className="order-review-upload"><input type="file" accept="image/*" multiple aria-label="选择评价图片" disabled={draft.submitted} onChange={(event) => { const selectedFiles = Array.from(event.currentTarget.files ?? []).filter((file) => file.type.startsWith('image/')); const addedImages = selectedFiles.map((file, index) => { const url = URL.createObjectURL(file); previewUrls.current.push(url); return { id: `${Date.now()}-${index}-${file.name}`, url } }); if (addedImages.length) updateDraft({ images: [...draft.images, ...addedImages] }); event.currentTarget.value = '' }} /><ImagePlus size={20} /><span>添加图片</span></label></div><small>图片仅在本地预览，不会上传。</small></div>
      </div>}
      <footer>{draft.submitted ? <button type="button" className="client-button client-button--primary" onClick={onClose}>完成</button> : <><button type="button" className="client-button client-button--secondary" onClick={onClose}>取消</button><button type="button" className="client-button client-button--primary" disabled={!draft.rating || !draft.content.trim()} onClick={() => updateDraft({ submitted: true })}>提交{target === 'companion' ? '陪玩' : '俱乐部'}评价</button></>}</footer>
    </section>
  </div>
}

export function OrderDetailPanel({ order, companion, diamondBalance, onContact, onReorder, onOpenRecharge, onUpdateStatus, onPayPendingOrder, onRequestEarlyEnd, onRenewOrder }: { order: ClientOrder; companion: Companion | undefined; diamondBalance: number; onContact: () => void; onReorder: () => void; onOpenRecharge: () => void; onUpdateStatus: (orderId: string, status: OrderStatus) => void; onPayPendingOrder: (orderId: string) => boolean; onRequestEarlyEnd: (orderId: string) => void; onRenewOrder: (orderId: string, quantity: number) => boolean }) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const countdownDuration = order.status === '待支付' ? 5 * 60 : order.status === '待用户确认' ? 24 * 60 * 60 : null
  const [remainingSeconds, setRemainingSeconds] = useState(countdownDuration ?? 0)

  useEffect(() => {
    if (countdownDuration === null) return
    const timer = window.setInterval(() => setRemainingSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [countdownDuration])

  return <div className="order-detail-panel">
    <div className="order-detail-scroll">
      <section className="order-detail-status-card">
        <strong className="order-detail-status-card__status">{order.earlyEndPending ? '待陪玩确认' : order.status === '待用户确认' ? '待确认' : order.status}</strong>
        <OrderNumberCopy orderId={order.id} />
        <span className="order-detail-status-card__created">创建时间 {order.createdAt}</span>
        {countdownDuration !== null && <span className="order-detail-countdown" role="timer" aria-label={`${order.status === '待支付' ? '支付' : '确认'}倒计时 ${formatOrderCountdown(remainingSeconds, order.status === '待用户确认')}`}><Clock3 size={13} />{order.status === '待支付' ? '支付倒计时' : '确认倒计时'}<strong>{formatOrderCountdown(remainingSeconds, order.status === '待用户确认')}</strong></span>}
      </section>

      <section className="order-detail-section">
        <div className="order-detail-section__heading"><span className="client-eyebrow">陪玩信息</span>{!order.earlyEndPending && <button type="button" className="client-button client-button--secondary" onClick={onContact}><MessageCircle size={15} />聊一聊</button>}</div>
        <div className="order-detail-companion"><AvatarMark initials={order.companionInitials} size="md" /><div><strong><UserNameWithLevel name={order.companionName} identityId={order.companionId} /></strong>{companion ? <span className="order-detail-companion__demographics" aria-label={`性别${companion.gender}，${companion.age}岁`}>{companion.gender === '女' ? <Venus size={13} aria-hidden="true" /> : <Mars size={13} aria-hidden="true" />}{companion.age}</span> : <span>陪玩资料</span>}<span>ID · {companion?.id ?? order.companionId}</span><span>所属俱乐部 · {getOrderClubName(order)}</span></div></div>
      </section>

      <section className="order-detail-section">
        <div className="order-detail-section__heading"><span className="client-eyebrow">订单信息</span><History size={15} aria-hidden="true" /></div>
        <div className="order-detail-facts"><span>服务信息</span><strong>{order.gameName} · {order.serviceName} · {order.levelName} · {order.durationUnit}服务</strong><span>服务时长</span><strong>{order.duration} {order.durationUnit}</strong><span>服务单价</span><strong>{order.unitPrice.toLocaleString()} 金豆 / {order.durationUnit}</strong><span>加价</span><strong>{(order.tipAmount ?? 0).toLocaleString()} 金豆</strong><span>优惠金额</span><strong>{(order.discountAmount ?? 0).toLocaleString()} 金豆</strong><span>订单金额</span><strong>{order.amount.toLocaleString()} 金豆</strong><span>支付方式</span><strong>{order.paymentSource === 'premium-card' ? '尊享卡' : '金豆钱包'}</strong><span>订单备注</span><strong>{order.remark || '无'}</strong></div>
      </section>

      <OrderTimeSection title="服务记录" icon={<Clock3 size={15} />} emptyLabel="暂无服务记录" segments={order.serviceSegments} />
      <OrderAfterSalesRecords records={order.afterSalesSegments.flatMap(segment => {
        const time = segment.endAt ?? segment.startAt
        return time ? [{ id: segment.id, time, category: segment.category ?? '售后' as const, amount: segment.amount ?? null }] : []
      })} />
    </div>

    <div className="order-detail-actions" aria-label="订单操作">
      {!order.earlyEndPending && orderActions[order.status].map((action) => <button type="button" key={action} className={`client-button ${action === '再次下单' || action === '取消订单' || action === '提前结束' ? 'client-button--secondary' : 'client-button--primary'}`} onClick={() => action === '再次下单' ? onReorder() : setActiveAction(action)}>{action}</button>)}
    </div>

    {activeAction && <OrderActionDialog order={order} action={activeAction} clubName={getOrderClubName(order)} diamondBalance={diamondBalance} onClose={() => setActiveAction(null)} onOpenRecharge={() => { setActiveAction(null); onOpenRecharge() }} onUpdateStatus={onUpdateStatus} onPayPendingOrder={onPayPendingOrder} onRequestEarlyEnd={onRequestEarlyEnd} onRenewOrder={onRenewOrder} />}
  </div>
}

function formatOrderCountdown(seconds: number, showHours: boolean) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return showHours
    ? [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, '0')).join(':')
    : [minutes, remainingSeconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function OrderTimeSection({ title, icon, emptyLabel, segments }: {
  title: string
  icon: React.ReactNode
  emptyLabel: string
  segments: ClientOrder['serviceSegments']
}) {
  return <section className="order-detail-section order-detail-time-section">
    <div className="order-detail-section__heading"><span className="client-eyebrow">{title}</span>{icon}</div>
    {segments.length === 0 ? <p className="order-detail-empty-record">{emptyLabel}</p> : <div className="order-time-list">{segments.map((segment, index) => <article className="order-time-item" key={segment.id}>
      <strong>第 {index + 1} 段服务</strong>
      <div><span>开始时间</span><time>{segment.startAt ?? '待开始'}</time></div>
      <div><span>结束时间</span><time>{segment.endAt ?? '待结束'}</time></div>
    </article>)}</div>}
  </section>
}
