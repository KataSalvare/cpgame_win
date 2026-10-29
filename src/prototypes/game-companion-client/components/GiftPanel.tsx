import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Check, Minus, Plus, Search, X } from 'lucide-react'
import { currentSocialUser } from '../data/socialMockData'
import { gifts, type Gift } from '../data/mockData'

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
}

export function GiftPanel({ open, recipients, fixedRecipient, anchor, balance, onClose, onPay, onRecharge }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const [giftId, setGiftId] = useState(gifts[0]?.id ?? '')
  const [quantity, setQuantity] = useState(1)
  const [recipientId, setRecipientId] = useState(fixedRecipient?.id ?? recipients[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [paid, setPaid] = useState(false)
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
    if (onPay(gift, quantity, recipient, amount)) setPaid(true)
    else setFeedback('钻石余额已变化，请重新确认。')
  }

  return <div ref={overlayRef} className={`gift-overlay${confirming ? ' gift-overlay--confirming' : ''}`} data-overlay="gift-panel" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && confirming) closeConfirmation() }}>
    <section ref={panelRef} className={`gift-panel${confirming ? ' gift-panel--confirming' : ''}`} style={!confirming && position ? { left: `${position.left}px`, top: `${position.top}px`, transform: 'translateX(-50%)' } : undefined} role="dialog" aria-modal={confirming} aria-label={confirming ? '确认赠送' : '送礼面板'}>
      <header className="gift-panel__header"><button type="button" className="client-icon-button" aria-label="关闭送礼面板" onClick={onClose}><X size={17} /></button></header>
      {!confirming ? <>
        {!fixedRecipient && <section className="gift-panel__section"><div className="gift-panel__section-heading"><h3>选择用户</h3><span>{recipient ? `已选 ${recipient.name}` : '选择一位用户'}</span></div><label className="gift-recipient-search"><Search size={15} /><input aria-label="搜索用户" placeholder="搜索昵称或用户 ID" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="gift-recipient-list" role="radiogroup" aria-label="选择收礼用户">{filteredRecipients.length ? filteredRecipients.map((item) => <button type="button" role="radio" aria-checked={recipientId === item.id} className={`gift-recipient${recipientId === item.id ? ' is-selected' : ''}`} key={item.id} onClick={() => setRecipientId(item.id)}><span>{item.name}</span>{recipientId === item.id && <Check size={15} />}</button>) : <p className="gift-panel__empty">没有匹配的用户</p>}</div></section>}
        {fixedRecipient && <div className="gift-fixed-recipient"><span>赠送给 <strong>{fixedRecipient.name}</strong></span></div>}
        <section className="gift-panel__section"><div className="gift-panel__section-heading"><h3>选择礼物</h3></div><div className="gift-choice-grid">{gifts.map((item) => <button type="button" key={item.id} aria-pressed={item.id === giftId} className={`gift-choice${item.id === giftId ? ' is-selected' : ''}`} onClick={() => setGiftId(item.id)}><span className="gift-choice__mark">{item.initials}</span><strong>{item.name}</strong><small>{item.price.toLocaleString()} 钻石</small></button>)}</div></section>
        <footer className="gift-panel__footer"><div className="gift-quantity"><span>数量</span><button type="button" aria-label="减少数量" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><input aria-label="礼物数量" type="number" min="1" max="99" value={quantity} onChange={(event) => setQuantity(Math.min(99, Math.max(1, Number(event.target.value) || 1)))} /><button type="button" aria-label="增加数量" disabled={quantity >= 99} onClick={() => setQuantity((value) => Math.min(99, value + 1))}><Plus size={14} /></button></div><div className="gift-panel__summary"><span>钻石余额 <strong>{balance.toLocaleString()}</strong></span><strong>{amount.toLocaleString()} 钻石</strong></div><button type="button" className="client-button client-button--primary" disabled={!recipient} onClick={() => setConfirming(true)}>确认赠送</button></footer>
      </> : <div className="gift-confirmation"><div className="gift-confirmation__title"><span className="gift-choice__mark">{gift.initials}</span><div><h3>{paid ? '赠送成功' : '确认赠送'}</h3><p>{gift.name} × {quantity}</p></div></div><dl><div><dt>赠送人</dt><dd>{currentSocialUser.name}</dd></div><div><dt>收礼人</dt><dd>{recipient?.name ?? '请选择用户'}</dd></div><div><dt>礼物</dt><dd>{gift.name} × {quantity}</dd></div><div><dt>钻石</dt><dd className="gift-confirmation__amount">{amount.toLocaleString()} 钻石</dd></div><div><dt>钱包余额</dt><dd>{balance.toLocaleString()} 钻石</dd></div></dl>{feedback && <p className="gift-panel__feedback" role="alert">{feedback}</p>}{paid ? <footer><button type="button" className="client-button client-button--primary" onClick={onClose}>完成</button></footer> : enoughBalance ? <footer><button type="button" className="client-button client-button--secondary" onClick={closeConfirmation}>返回修改</button><button type="button" className="client-button client-button--primary" onClick={pay}>确认支付</button></footer> : <footer><button type="button" className="client-button client-button--secondary" onClick={closeConfirmation}>返回修改</button><button type="button" className="client-button client-button--primary" onClick={onRecharge}>去充值</button></footer>}</div>}
    </section>
  </div>
}
