import { useState } from 'react'
import { ArrowLeft, Check, Coins, CreditCard, Gift, History, ShieldCheck, Ticket, X } from 'lucide-react'
import type { Club } from '../data/mockData'
import { clubs as allClubs } from '../data/mockData'
import { premiumCards, rechargePackages, type PremiumCard, type PremiumCardTransaction, type RechargeCoupon } from '../data/storeMockData'
import { PageStatePanel } from '../components/PageStatePanel'
import premiumCardCover from '../assets/premium-card-cover.svg'

type PageState = 'normal' | 'loading' | 'empty' | 'error'
type StateProps = { pageState: PageState; onRetry: () => void }

function Heading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <header className="client-page-heading account-page-heading"><div><span className="client-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}</header>
}

function StateView({ pageState, onRetry }: StateProps) {
  if (pageState === 'normal') return null
  return <PageStatePanel state={pageState} title={pageState === 'empty' ? '暂时没有内容' : '页面暂不可用'} description={pageState === 'error' ? '加载遇到问题，请重试。' : '当前没有可展示的内容。'} actionLabel={pageState === 'error' ? '重新加载' : '返回钱包'} onAction={onRetry} />
}

type RechargePageProps = StateProps & {
  diamondBalance: number
  coupons: RechargeCoupon[]
  onBack: () => void
  backLabel: string
  onComplete: (diamonds: number, amount: number, couponId: string | null) => void
  presentation?: 'page' | 'modal'
}

export function RechargePage({ pageState, onRetry, diamondBalance, coupons, onBack, backLabel, onComplete, presentation = 'page' }: RechargePageProps) {
  const [packageId, setPackageId] = useState(rechargePackages[1].id)
  const [couponId, setCouponId] = useState<string | null>(null)
  const [payMethod, setPayMethod] = useState('微信支付')
  const [completed, setCompleted] = useState(false)
  const selectedPackage = rechargePackages.find((item) => item.id === packageId) ?? rechargePackages[1]
  const usableCoupons = coupons.filter((coupon) => coupon.status === '可用' && selectedPackage.price >= coupon.threshold)
  const selectedCoupon = usableCoupons.find((coupon) => coupon.id === couponId) ?? null
  const amount = Math.max(0, selectedPackage.price - (selectedCoupon?.discount ?? 0))

  if (pageState !== 'normal') return <div className={`client-content account-page${presentation === 'modal' ? ' store-page' : ''}`}><StateView pageState={pageState} onRetry={onRetry} /></div>
  if (completed) {
    const successCard = <section className="client-card checkout-success-card"><span className="checkout-success-card__icon"><Check size={30} /></span><span className="client-eyebrow">本地演示反馈</span><h1>充值已完成</h1><p>{selectedPackage.diamonds.toLocaleString()} 钻石已加入钱包，支付方式：{payMethod}</p><div className="checkout-success-card__actions"><button type="button" className="client-button client-button--primary" onClick={onBack}>{backLabel}</button><button type="button" className="client-button client-button--secondary" onClick={() => setCompleted(false)}>继续充值</button></div></section>
    const success = <div className={`client-content account-page store-page${presentation === 'modal' ? ' wallet-recharge-success-content' : ''}`}><div className="wallet-recharge-result">{successCard}</div></div>
    return presentation === 'modal' ? <div className="store-overlay wallet-recharge-overlay" data-overlay="wallet-recharge-modal" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onBack() }}><section className="store-benefit-dialog wallet-recharge-dialog is-completed" role="dialog" aria-modal="true" aria-label="充值结果"><header><div><span className="client-eyebrow">账户资产</span><h2>充值结果</h2></div><button type="button" className="client-icon-button" aria-label="关闭充值弹窗" onClick={onBack}><X size={17} /></button></header>{success}</section></div> : <div className="client-content account-page store-page"><div className="wallet-recharge-result">{successCard}</div></div>
  }

  const content = <div className="client-content account-page store-page">
    {presentation === 'page' && <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={15} />{backLabel}</button>}
    {presentation === 'modal' ? <div className="wallet-recharge-intro"><p>选择充值档位、优惠券和支付方式。充值结果仅用于本地原型演示。</p><span className="store-balance-chip"><Coins size={15} />当前余额 {diamondBalance.toLocaleString()} 钻石</span></div> : <Heading eyebrow="账户资产" title="钻石充值" description="选择充值档位、优惠券和支付方式。充值结果仅用于本地原型演示。"><span className="store-balance-chip"><Coins size={15} />当前余额 {diamondBalance.toLocaleString()} 钻石</span></Heading>}
    <div className="store-checkout-grid">
      <section className="client-card store-main-card">
        <div className="client-section-heading"><div><span className="client-eyebrow">充值档位</span><h2>选择钻石数量</h2></div><span className="client-count">档位与价格为演示数据</span></div>
        <div className="recharge-package-grid">{rechargePackages.map((item) => <button type="button" key={item.id} className={`recharge-package${packageId === item.id ? ' is-active' : ''}`} aria-pressed={packageId === item.id} onClick={() => { setPackageId(item.id); setCouponId(null) }}><span>{item.label}</span><strong>{item.diamonds.toLocaleString()} <small>钻石</small></strong><b>¥{item.price}</b></button>)}</div>
        <div className="store-section-divider" />
        <div className="client-section-heading store-subheading"><div><span className="client-eyebrow">优惠券</span><h2>选择充值优惠</h2></div></div>
        {usableCoupons.length ? <div className="recharge-coupon-list">{usableCoupons.map((coupon) => <label className={`recharge-coupon${couponId === coupon.id ? ' is-active' : ''}`} key={coupon.id}><input type="radio" name="recharge-coupon" checked={couponId === coupon.id} onChange={() => setCouponId(coupon.id)} /><span><strong>{coupon.title}</strong><small>{coupon.description} · 有效期至 {coupon.expiresAt}</small></span><b>-¥{coupon.discount}</b></label>)}</div> : <p className="store-muted-note">当前档位暂无可用优惠券。</p>}
        <div className="store-section-divider" />
        <div className="client-section-heading store-subheading"><div><span className="client-eyebrow">支付方式</span><h2>选择支付渠道</h2></div></div>
        <div className="payment-method-list" role="group" aria-label="支付方式">{['微信支付', '支付宝', '苹果支付'].map((method) => <button type="button" key={method} className={`payment-method${payMethod === method ? ' is-active' : ''}`} aria-pressed={payMethod === method} onClick={() => setPayMethod(method)}><span className="payment-method__mark"><CreditCard size={17} /></span><strong>{method}</strong><span className="payment-method__radio" /></button>)}</div>
      </section>
      <aside className="client-card store-summary-card"><span className="client-eyebrow">充值确认</span><h2>订单摘要</h2><div className="checkout-summary-line"><span>充值钻石</span><strong>{selectedPackage.diamonds.toLocaleString()} 钻石</strong></div><div className="checkout-summary-line"><span>充值金额</span><strong>¥{selectedPackage.price}</strong></div><div className="checkout-summary-line"><span>优惠券</span><strong>{selectedCoupon ? `-¥${selectedCoupon.discount}` : '未使用'}</strong></div><div className="checkout-total"><span>实付金额</span><strong>¥{amount}</strong></div><div className="store-summary-payment"><CreditCard size={16} /><span>{payMethod}</span></div><button type="button" className="client-button client-button--primary store-submit-button" onClick={() => { onComplete(selectedPackage.diamonds, amount, selectedCoupon?.id ?? null); setCompleted(true) }}>确认充值</button><p className="checkout-demo-note">仅展示支付方式选项，不会连接真实支付渠道。</p></aside>
    </div>
  </div>
  return presentation === 'modal' ? <div className="store-overlay wallet-recharge-overlay" data-overlay="wallet-recharge-modal" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onBack() }}><section className="store-benefit-dialog wallet-recharge-dialog" role="dialog" aria-modal="true" aria-label={completed ? '充值结果' : '钻石充值'}><header><div><span className="client-eyebrow">账户资产</span><h2>{completed ? '充值结果' : '钻石充值'}</h2></div><button type="button" className="client-icon-button" aria-label="关闭充值弹窗" onClick={onBack}><X size={17} /></button></header>{content}</section></div> : content
}

export function CouponsPage({ pageState, onRetry, coupons, onBack }: StateProps & { coupons: RechargeCoupon[]; onBack: () => void }) {
  const [tab, setTab] = useState<RechargeCoupon['status']>('可用')
  if (pageState !== 'normal') return <div className="client-content account-page"><StateView pageState={pageState} onRetry={onRetry} /></div>
  const visibleCoupons = coupons.filter((coupon) => coupon.status === tab)
  return <div className="client-content account-page store-page"><button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={15} />返回钱包</button><Heading eyebrow="账户资产" title="我的优惠券" description="查看可用、已过期和已使用的优惠券。" /><section className="client-card coupon-page-card"><div className="store-tabs" role="tablist" aria-label="优惠券状态">{(['可用', '已过期', '已使用'] as const).map((item) => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'is-active' : ''} key={item} onClick={() => setTab(item)}>{item}<span>{coupons.filter((coupon) => coupon.status === item).length}</span></button>)}</div>{visibleCoupons.length ? <div className="wallet-coupon-list">{visibleCoupons.map((coupon) => <CouponTile coupon={coupon} key={coupon.id} />)}</div> : <div className="account-empty-inline"><Ticket size={22} /><strong>暂无{tab}优惠券</strong><span>优惠券列表为空。</span></div>}<p className="store-demo-note">优惠券金额、适用条件和有效期为本地演示数据。</p></section></div>
}

function CouponTile({ coupon }: { coupon: RechargeCoupon }) {
  return <article className={`wallet-coupon wallet-coupon--${coupon.status === '可用' ? 'available' : 'inactive'}`}><div className="wallet-coupon__value"><strong>¥{coupon.discount}</strong><span>充值优惠</span></div><div className="wallet-coupon__detail"><strong>{coupon.title}</strong><span>{coupon.description}</span><small>有效期至 {coupon.expiresAt}</small></div><span className="client-status">{coupon.status}</span></article>
}

type PremiumCardsPageProps = StateProps & {
  clubId: string
  ownedOnly?: boolean
  balance: number
  ownedIds: string[]
  cardBalances: Record<string, number>
  onBack: () => void
  onRecharge: () => void
  onPurchase: (cardId: string) => boolean
  onTopUp: (cardId: string, amount: number) => boolean
  onOpenDetails: (cardId: string) => void
}

export function PremiumCardsPage({ pageState, onRetry, clubId, ownedOnly = false, balance, ownedIds, cardBalances, onBack, onRecharge, onPurchase, onTopUp, onOpenDetails }: PremiumCardsPageProps) {
  const [benefitCard, setBenefitCard] = useState<PremiumCard | null>(null)
  const [feedback, setFeedback] = useState<{ cardId: string; message: string } | null>(null)
  const [purchaseDialog, setPurchaseDialog] = useState<PremiumCard | null>(null)
  const [topUpDialog, setTopUpDialog] = useState<PremiumCard | null>(null)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpInsufficient, setTopUpInsufficient] = useState(false)
  const club = allClubs.find((item) => item.id === clubId) ?? allClubs[0]
  const visibleCards = premiumCards.filter((card) => ownedOnly ? ownedIds.includes(card.id) : card.clubId === club.id)
  const parsedTopUpAmount = Number(topUpAmount) || 0
  const validTopUpAmount = Number.isInteger(parsedTopUpAmount) && Boolean(topUpDialog && parsedTopUpAmount >= topUpDialog.minimumRechargeAmount)
  if (pageState !== 'normal') return <div className="client-content account-page"><StateView pageState={pageState} onRetry={onRetry} /></div>

  return <div className="client-content account-page store-page">
    <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={15} />{ownedOnly ? '返回钱包' : '返回俱乐部详情'}</button>
    <Heading eyebrow={ownedOnly ? '账户资产' : '俱乐部服务'} title={ownedOnly ? '我的尊享卡' : `${club.name} · 尊享卡`} description={ownedOnly ? '查看已购买的不同俱乐部尊享卡。' : '浏览该俱乐部提供的尊享卡，并查看对应权益。'}><span className="store-balance-chip"><Coins size={15} />钻石余额 {balance.toLocaleString()}</span></Heading>
    {visibleCards.length ? <div className="premium-card-grid">{visibleCards.map((card) => { const owned = ownedIds.includes(card.id); const clubForCard: Club | undefined = allClubs.find((item) => item.id === card.clubId); return <article className="client-card premium-card" key={card.id}><img className="premium-card__cover" src={premiumCardCover} alt={`${clubForCard?.name ?? ''}尊享卡封面`} /><div className="premium-card__body"><div className="premium-card__heading"><div><span className="client-eyebrow">{clubForCard?.name ?? club.name}</span><h2>{card.name}</h2></div><span className="client-status">{owned ? '已拥有' : '未购买'}</span></div><div className="premium-card__price"><span>购买价格</span><strong>{card.price.toLocaleString()} <small>钻石</small></strong></div><div className="premium-card__balance"><span>卡内余额</span><strong>{owned ? `${(cardBalances[card.id] ?? 0).toLocaleString()} 钻石` : '购买后可续充'}</strong></div><div className="premium-card__actions"><button type="button" className="client-button client-button--secondary" onClick={() => setBenefitCard(card)}><ShieldCheck size={15} />查看权益</button>{owned ? <><button type="button" className="client-button client-button--secondary" onClick={() => onOpenDetails(card.id)}>查看明细</button><button type="button" className="client-button client-button--primary" onClick={() => { setTopUpDialog(card); setTopUpAmount(String(card.minimumRechargeAmount)); setTopUpInsufficient(false) }}><Coins size={15} />续充</button></> : <button type="button" className="client-button client-button--primary" onClick={() => setPurchaseDialog(card)}>购买尊享卡</button>}</div>{feedback?.cardId === card.id && <p className="account-inline-feedback" role="status">{feedback.message}</p>}</div></article> })}</div> : <div className="client-card account-empty-inline premium-empty"><Gift size={22} /><strong>{ownedOnly ? '还没有已购尊享卡' : '该俱乐部暂无尊享卡'}</strong><span>{ownedOnly ? '购买后可在这里查看各俱乐部尊享卡。' : '当前没有可展示的尊享卡。'}</span></div>}
    <p className="store-demo-note">尊享卡价格、封面、权益与已购状态均为本地演示数据；购买使用钻石钱包余额。</p>
    {benefitCard && <div className="store-overlay" data-overlay="premium-card-benefits" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setBenefitCard(null) }}><section className="store-benefit-dialog" role="dialog" aria-modal="true" aria-labelledby="premium-benefits-title"><header><div><span className="client-eyebrow">尊享卡权益</span><h2 id="premium-benefits-title">{benefitCard.name}</h2></div><button type="button" className="client-icon-button" aria-label="关闭权益" onClick={() => setBenefitCard(null)}><X size={17} /></button></header><ul>{benefitCard.benefits.map((benefit) => <li key={benefit}><ShieldCheck size={16} /><span>{benefit}</span></li>)}</ul><p>权益内容为原型演示示例。</p><footer><button type="button" className="client-button client-button--secondary" onClick={() => setBenefitCard(null)}>关闭</button></footer></section></div>}
    {purchaseDialog && <div className="store-overlay" data-overlay="premium-card-purchase-confirm" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setPurchaseDialog(null) }}><section className="store-benefit-dialog premium-purchase-dialog" role="dialog" aria-modal="true" aria-labelledby="premium-purchase-title"><header><div><span className="client-eyebrow">购买确认</span><h2 id="premium-purchase-title">{balance < purchaseDialog.price ? '钻石余额不足' : '确认购买尊享卡'}</h2></div><button type="button" className="client-icon-button" aria-label="关闭购买确认" onClick={() => setPurchaseDialog(null)}><X size={17} /></button></header>{balance < purchaseDialog.price ? <><p className="premium-purchase-intro">「{purchaseDialog.name}」的购买金额与当前钻石钱包余额如下：</p><dl className="premium-purchase-breakdown"><div><dt>尊享卡价格</dt><dd>{purchaseDialog.price.toLocaleString()} <span>钻石</span></dd></div><div><dt>钱包余额</dt><dd>{balance.toLocaleString()} <span>钻石</span></dd></div><div className="premium-purchase-shortage"><dt>还需充值</dt><dd>{(purchaseDialog.price - balance).toLocaleString()} <span>钻石</span></dd></div></dl><footer><button type="button" className="client-button client-button--secondary" onClick={() => setPurchaseDialog(null)}>稍后再说</button><button type="button" className="client-button client-button--primary" onClick={onRecharge}>去充值</button></footer></> : <><p>将使用钻石钱包支付 <strong>{purchaseDialog.price.toLocaleString()} 钻石</strong>，确认购买「{purchaseDialog.name}」吗？</p><footer><button type="button" className="client-button client-button--secondary" onClick={() => setPurchaseDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" onClick={() => { const card = purchaseDialog; const result = onPurchase(card.id); setPurchaseDialog(null); setFeedback({ cardId: card.id, message: result ? `已购买「${card.name}」，仅更新本地演示数据。` : '钻石余额不足，请重新确认。' }) }}>确认购买</button></footer></>}</section></div>}
    {topUpDialog && <div className="store-overlay" data-overlay="premium-card-top-up" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setTopUpDialog(null) }}><section className="store-benefit-dialog premium-topup-dialog" role="dialog" aria-modal="true" aria-labelledby="premium-topup-title"><header><div><span className="client-eyebrow">尊享卡续充</span><h2 id="premium-topup-title">{topUpInsufficient ? '钻石余额不足' : `续充「${topUpDialog.name}」`}</h2></div><button type="button" className="client-icon-button" aria-label="关闭续充弹窗" onClick={() => setTopUpDialog(null)}><X size={17} /></button></header>{topUpInsufficient ? <><p>本次续充需要 {parsedTopUpAmount.toLocaleString()} 钻石，钱包余额为 {balance.toLocaleString()} 钻石，还差 {(parsedTopUpAmount - balance).toLocaleString()} 钻石。</p><footer><button type="button" className="client-button client-button--secondary" onClick={() => setTopUpDialog(null)}>稍后再说</button><button type="button" className="client-button client-button--primary" onClick={onRecharge}>去充值</button></footer></> : <><div className="premium-topup-summary"><span>卡内余额</span><strong>{(cardBalances[topUpDialog.id] ?? 0).toLocaleString()} 钻石</strong><span>钻石钱包余额</span><strong>{balance.toLocaleString()} 钻石</strong></div><label className="premium-topup-field">续充金额（钻石）<input type="number" min={topUpDialog.minimumRechargeAmount} step="1" value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value)} aria-describedby="premium-topup-minimum" /></label><p id="premium-topup-minimum" className="premium-topup-hint">最低续充 {topUpDialog.minimumRechargeAmount.toLocaleString()} 钻石</p>{parsedTopUpAmount > 0 && parsedTopUpAmount < topUpDialog.minimumRechargeAmount && <p className="premium-topup-error" role="alert">续充金额不能低于最低金额。</p>}{!Number.isInteger(parsedTopUpAmount) && parsedTopUpAmount > 0 && <p className="premium-topup-error" role="alert">请输入整数钻石数量。</p>}<footer><button type="button" className="client-button client-button--secondary" onClick={() => setTopUpDialog(null)}>取消</button><button type="button" className="client-button client-button--primary" disabled={!validTopUpAmount} onClick={() => { if (parsedTopUpAmount > balance) { setTopUpInsufficient(true); return } const card = topUpDialog; const success = onTopUp(card.id, parsedTopUpAmount); if (success) { setTopUpDialog(null); setFeedback({ cardId: card.id, message: `已为「${card.name}」续充 ${parsedTopUpAmount.toLocaleString()} 钻石。` }) } }}>确认续充</button></footer></>}</section></div>}
  </div>
}

export function PremiumCardDetailPage({ card, transactions, onBack }: { card: PremiumCard; transactions: PremiumCardTransaction[]; onBack: () => void }) {
  const [filter, setFilter] = useState<'全部' | '收入' | '支出'>('全部')
  const filteredTransactions = transactions.filter((entry) => filter === '全部' || (filter === '收入' ? entry.amount > 0 : entry.amount < 0))
  return <div className="client-content account-page store-page premium-card-detail-page">
    <button type="button" className="client-back-link" onClick={onBack}><ArrowLeft size={15} />返回列表</button>
    <section className="client-card premium-card-detail-transactions">
      <div className="client-section-heading"><div><span className="client-eyebrow">{card.name}</span><h2>交易明细</h2></div><span className="client-count">{filteredTransactions.length} 条</span></div>
      <div className="transaction-filter-tabs" role="group" aria-label="收支类型筛选">{(['全部', '收入', '支出'] as const).map((item) => <button type="button" key={item} className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      {filteredTransactions.length ? <div className="premium-card-transaction-list">{filteredTransactions.map((entry) => <article className="premium-card-transaction" key={entry.id}><span className="premium-card-transaction__icon"><History size={15} /></span><div><strong>{entry.title}</strong><small>{entry.date}</small></div><strong className={entry.amount > 0 ? 'is-income' : ''}>{entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()} 钻石</strong></article>)}</div> : <div className="account-empty-inline"><History size={20} /><strong>{transactions.length ? `暂无${filter}记录` : '暂无交易明细'}</strong><span>{transactions.length ? '切换其他类型查看明细。' : '购买或续充后会显示对应记录。'}</span></div>}
    </section>
  </div>
}

