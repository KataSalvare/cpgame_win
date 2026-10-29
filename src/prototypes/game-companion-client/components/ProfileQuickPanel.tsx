import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Check, ChevronRight, ClipboardList, Coins, Copy, UserRound, WalletCards } from 'lucide-react'
import type { PlayerProfile } from '../data/accountMockData'
import { AvatarMark } from './AvatarMark'

type QuickAction = 'profile' | 'wallet' | 'orders'

export function ProfileQuickPanel({ profile, diamondBalance, beanBalance, orderCount, onNavigate, children }: {
  profile: PlayerProfile
  diamondBalance: number
  beanBalance: number
  orderCount: number
  onNavigate: (action: QuickAction) => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const navigate = (action: QuickAction) => {
    setOpen(false)
    onNavigate(action)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const copyUserId = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(profile.userId)
      setCopyFeedback('复制成功')
    } catch {
      setCopyFeedback('复制失败，请重试')
    }
  }

  useEffect(() => {
    if (!copyFeedback) return
    const timer = window.setTimeout(() => setCopyFeedback(''), 1800)
    return () => window.clearTimeout(timer)
  }, [copyFeedback])

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])

  return <div ref={rootRef} className="client-profile-quick client-profile-quick--sidebar" onKeyDown={handleKeyDown}>
    <button type="button" className="client-sidebar-account" onClick={() => setOpen((isOpen) => !isOpen)} aria-label={open ? '关闭个人快捷面板' : '打开个人快捷面板'} aria-haspopup="true" aria-expanded={open}>
      {children}<span className="client-sidebar-account__details"><strong>{profile.nickname}</strong><span>{profile.userId}</span><small>{profile.gender}</small></span>
    </button>
    {open && <section className="client-profile-popover" aria-label="个人资料快捷面板">
      <div className="client-profile-popover__identity">
        {profile.avatarDataUrl ? <img className="client-profile-popover__avatar" src={profile.avatarDataUrl} alt="" /> : <AvatarMark initials={profile.initials} size="md" />}
        <div><strong>{profile.nickname}</strong><span className="client-profile-popover__meta"><span>{profile.gender}</span><button type="button" className="client-profile-popover__user-id" onClick={() => void copyUserId()} aria-label={`复制用户 ID ${profile.userId}`} title="点击复制 ID">{profile.userId}<Copy size={12} /></button>{copyFeedback && <span className="client-profile-popover__copy-feedback" role="status">{copyFeedback === '复制成功' && <Check size={12} />}{copyFeedback}</span>}</span></div>
      </div>
      <div className="client-profile-popover__stats"><Metric label="朋友" value={profile.friends} /><Metric label="关注" value={profile.following} /><Metric label="粉丝" value={profile.followers} /></div>
      <div className="client-profile-popover__balances"><span><Coins size={14} />钻石 <strong>{diamondBalance.toLocaleString()}</strong></span><span><WalletCards size={14} />糖豆 <strong>{beanBalance.toLocaleString()}</strong></span></div>
      <div className="client-profile-popover__actions">
        <QuickActionButton icon={<UserRound size={15} />} label="个人资料" detail="编辑资料" onClick={() => navigate('profile')} />
        <QuickActionButton icon={<WalletCards size={15} />} label="我的钱包" detail="资产与明细" onClick={() => navigate('wallet')} />
        <QuickActionButton icon={<ClipboardList size={15} />} label="我的订单" detail={`${orderCount} 笔订单`} onClick={() => navigate('orders')} />
      </div>
    </section>}
  </div>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <span><strong>{value}</strong><small>{label}</small></span>
}

function QuickActionButton({ icon, label, detail, onClick }: { icon: ReactNode; label: string; detail: string; onClick: () => void }) {
  return <button type="button" onClick={onClick}>{icon}<span><strong>{label}</strong><small>{detail}</small></span><ChevronRight size={14} /></button>
}
