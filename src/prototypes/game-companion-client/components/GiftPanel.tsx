import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BatteryCharging, Check, HandHeart, Orbit, Search, Sparkles, Star, UsersRound, X } from 'lucide-react'
import { gifts, type Gift } from '../data/mockData'
import { UserNameWithLevel } from './UserNameWithLevel'

const categories = ['推荐', '豪华', '星座', '财富'] as const
const categoryGiftIds: Record<(typeof categories)[number], string[]> = { 推荐: ['gift-01', 'gift-02', 'gift-03', 'gift-04', 'gift-05', 'gift-06'], 豪华: ['gift-05', 'gift-06'], 星座: ['gift-01', 'gift-06'], 财富: ['gift-03', 'gift-04', 'gift-05'] }
const giftIcons = [Star, HandHeart, BatteryCharging, UsersRound, Sparkles, Orbit]

export type GiftRecipient = { id: string; name: string; initials: string; profileId?: string }

type Props = {
  open: boolean
  recipients: GiftRecipient[]
  fixedRecipient?: GiftRecipient
  anchor: HTMLButtonElement | null
  balance: number
  onClose: () => void
  onPay: (gift: Gift, quantity: number, recipient: GiftRecipient, amount: number) => boolean
  onRecharge: () => void
  onSuccess: () => void
}

export function GiftPanel({ open, recipients, fixedRecipient, anchor, balance, onClose, onPay, onRecharge, onSuccess }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const [category, setCategory] = useState<(typeof categories)[number]>('推荐')
  const [giftId, setGiftId] = useState(gifts[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [recipientId, setRecipientId] = useState(fixedRecipient?.id ?? recipients[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [feedback, setFeedback] = useState('')
  const gift = gifts.find((item) => item.id === giftId) ?? gifts[0]
  const recipient = fixedRecipient ?? recipients.find((item) => item.id === recipientId)
  const amount = gift.price * quantity
  const filteredRecipients = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return recipients.filter((item) => !normalized || item.name.toLocaleLowerCase().includes(normalized) || item.id.toLocaleLowerCase().includes(normalized) || item.profileId?.toLocaleLowerCase().includes(normalized))
  }, [query, recipients])
  useLayoutEffect(() => {
    if (!open || confirming || !anchor || !overlayRef.current || !panelRef.current) return
    const placePanel = () => {
      if (!overlayRef.current || !panelRef.current || !anchor.isConnected) return
      const bounds = overlayRef.current.getBoundingClientRect()
      const trigger = anchor.getBoundingClientRect()
      const edge = 10
      const scaleX = overlayRef.current.offsetWidth / bounds.width
      const scaleY = overlayRef.current.offsetHeight / bounds.height
      const halfWidth = panelRef.current.offsetWidth / 2
      const panelHeight = panelRef.current.offsetHeight
      const triggerCenter = (trigger.left - bounds.left + trigger.width / 2) * scaleX
      const left = Math.min(overlayRef.current.offsetWidth - halfWidth - edge, Math.max(halfWidth + edge, triggerCenter))
      const above = (trigger.top - bounds.top) * scaleY - panelHeight - 10
      const top = above >= edge ? above : Math.min(overlayRef.current.offsetHeight - panelHeight - edge, (trigger.bottom - bounds.top) * scaleY + 10)
      setPosition({ left, top: Math.max(edge, top) })
    }
    placePanel()
    window.addEventListener('resize', placePanel)
    return () => window.removeEventListener('resize', placePanel)
  }, [open, confirming, anchor, recipients.length, fixedRecipient])
  if (!open || !gift) return null
  const enoughBalance = balance >= amount
  const closeConfirmation = () => { setConfirming(false); setFeedback('') }
  const pay = () => {
    if (!recipient || !enoughBalance) return
    if (onPay(gift, quantity, recipient, amount)) { onClose(); onSuccess() }
    else setFeedback('金豆余额已变化，请重新确认。')
  }

  return <div ref={overlayRef} className={`gift-overlay${confirming ? ' gift-overlay--confirming' : ''}`} data-overlay="gift-panel" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && confirming) closeConfirmation() }}>
    <section ref={panelRef} className={`gift-panel${confirming ? ' gift-panel--confirming' : ''}`} style={!confirming && position ? { left: `${position.left}px`, top: `${position.top}px`, transform: 'translateX(-50%)' } : undefined} role="dialog" aria-modal={confirming} aria-label={confirming ? '金豆余额不足' : '送礼面板'}>
      {!confirming && <header className="gift-panel__header"><nav className="gift-tabs" aria-label="礼物分类">{categories.map((item) => <button type="button" key={item} className={category === item ? 'is-active' : ''} aria-pressed={category === item} onClick={() => { setCategory(item); setGiftId(categoryGiftIds[item][0]) }}>{item}</button>)}</nav><button type="button" className="client-icon-button" aria-label="关闭送礼面板" onClick={onClose}><X size={17} /></button></header>}
      {!confirming ? <>
        {!fixedRecipient && <section className="gift-panel__section"><div className="gift-panel__section-heading"><h3>选择用户</h3><span>{recipient ? <>已选 <UserNameWithLevel name={recipient.name} identityId={recipient.profileId ?? recipient.id} /></> : '选择一位用户'}</span></div><label className="gift-recipient-search"><Search size={15} /><input aria-label="搜索用户" placeholder="搜索昵称或用户 ID" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="gift-recipient-list" role="radiogroup" aria-label="选择收礼用户">{filteredRecipients.length ? filteredRecipients.map((item) => <button type="button" role="radio" aria-checked={recipientId === item.id} className={`gift-recipient${recipientId === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setRecipientId(item.id)}><span><UserNameWithLevel name={item.name} identityId={item.profileId ?? item.id} /></span>{recipientId === item.id && <Check size={15} />}</button>) : <p className="gift-panel__empty">没有匹配的用户</p>}</div></section>}
        <section className="gift-panel__section gift-panel__gifts"><div className="gift-choice-grid">{gifts.filter((item) => categoryGiftIds[category].includes(item.id)).map((item) => { const GiftIcon = giftIcons[gifts.indexOf(item) % giftIcons.length]; return <button type="button" key={item.id} aria-pressed={item.id === giftId} className={`gift-choice${item.id === giftId ? ' is-selected' : ''}`} onClick={() => setGiftId(item.id)}><span className="gift-choice__art"><GiftIcon size={38} strokeWidth={1.5} /></span><strong>{item.name}</strong><small>{item.price.toLocaleString()} 金豆</small></button> })}</div></section>
        {feedback && <p className="gift-panel__feedback" role="alert">{feedback}</p>}<footer className="gift-panel__footer"><span className="gift-balance">金豆 {balance.toLocaleString()}</span><div className="gift-quantity"><input aria-label="礼物数量" type="number" min="1" max="99" value={quantity} onChange={(event) => setQuantity(Math.min(99, Math.max(1, Number(event.target.value) || 1)))} /></div><button type="button" className="client-button client-button--primary" disabled={!recipient} onClick={() => { if (!enoughBalance) setConfirming(true); else pay() }}>赠送</button></footer>
      </> : <div className="gift-shortage"><header><h2>金豆余额不足</h2><button type="button" className="client-icon-button" aria-label="关闭" onClick={closeConfirmation}><X size={17} /></button></header><p>当前金豆余额为 {balance.toLocaleString()} 金豆，本次应付 {amount.toLocaleString()} 金豆，还差 {(amount - balance).toLocaleString()} 金豆。打开购买弹窗补充余额吗？</p><footer><button type="button" className="client-button client-button--secondary" onClick={closeConfirmation}>稍后再说</button><button type="button" className="client-button client-button--primary" onClick={onRecharge}>去购买</button></footer></div>}
    </section>
  </div>
}
