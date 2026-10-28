import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronRight, ClipboardList, Coins, UserRound, WalletCards } from 'lucide-react'
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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 3000)
  }

  const keepOpen = () => {
    cancelClose()
    setOpen(true)
  }

  const navigate = (action: QuickAction) => {
    cancelClose()
    setOpen(false)
    onNavigate(action)
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleClose()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      cancelClose()
      setOpen(false)
    }
  }

  useEffect(() => () => cancelClose(), [])

  return <div className="client-profile-quick" onMouseEnter={keepOpen} onMouseLeave={scheduleClose} onFocusCapture={keepOpen} onBlurCapture={handleBlur} onKeyDown={handleKeyDown}>
    <button type="button" className="client-titlebar-account" onClick={() => navigate('profile')} aria-label="打开个人中心" aria-haspopup="true" aria-expanded={open} title="个人中心">
      {children}
    </button>
    {open && <section className="client-profile-popover" aria-label="个人资料快捷面板">
      <div className="client-profile-popover__identity">
        {profile.avatarDataUrl ? <img className="client-profile-popover__avatar" src={profile.avatarDataUrl} alt="" /> : <AvatarMark initials={profile.initials} size="md" />}
        <div><strong>{profile.nickname}</strong><span>{profile.gender} · 玩家 ID：{profile.userId}</span></div>
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
