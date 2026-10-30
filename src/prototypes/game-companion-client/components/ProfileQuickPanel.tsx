import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Check, Coins, Copy, WalletCards } from 'lucide-react'
import type { PlayerProfile } from '../data/accountMockData'
import { AvatarMark } from './AvatarMark'
import { UserNameWithLevel } from './UserNameWithLevel'

type QuickAction = 'profile' | 'recharge' | 'withdraw' | 'exchange'

export function ProfileQuickPanel({ profile, diamondBalance, beanBalance, onNavigate, children }: {
  profile: PlayerProfile
  diamondBalance: number
  beanBalance: number
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
      {children}<span className="client-sidebar-account__details"><strong><UserNameWithLevel name={profile.nickname} identityId={profile.userId} /></strong><span>{profile.userId}</span></span>
    </button>
    {open && <section className="client-profile-popover" aria-label="个人资料快捷面板">
      <div className="client-profile-popover__identity">
        <button type="button" className="client-profile-popover__avatar-button" aria-label="进入个人中心" title="进入个人中心" onClick={() => navigate('profile')}>
          {profile.avatarDataUrl ? <img className="client-profile-popover__avatar" src={profile.avatarDataUrl} alt="" /> : <AvatarMark initials={profile.initials} size="md" />}
        </button>
        <div><strong><UserNameWithLevel name={profile.nickname} identityId={profile.userId} /></strong><span className="client-profile-popover__meta"><button type="button" className="client-profile-popover__user-id" onClick={() => void copyUserId()} aria-label={`复制用户 ID ${profile.userId}`} title="点击复制 ID">{profile.userId}<Copy size={12} /></button>{copyFeedback && <span className="client-profile-popover__copy-feedback" role="status">{copyFeedback === '复制成功' && <Check size={12} />}{copyFeedback}</span>}</span></div>
      </div>
      <div className="client-profile-popover__stats"><Metric label="朋友" value={profile.friends} /><Metric label="关注" value={profile.following} /><Metric label="粉丝" value={profile.followers} /></div>
      <div className="client-profile-popover__balances">
        <div className="client-profile-popover__asset"><span><Coins size={14} />钻石</span><strong>{diamondBalance.toLocaleString()}</strong><div><button type="button" onClick={() => navigate('recharge')}>充值</button></div></div>
        <div className="client-profile-popover__asset"><span><WalletCards size={14} />糖豆</span><strong>{beanBalance.toLocaleString()}</strong><div><button type="button" onClick={() => navigate('withdraw')}>提现</button><button type="button" onClick={() => navigate('exchange')}>兑换</button></div></div>
      </div>
    </section>}
  </div>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <span><strong>{value}</strong><small>{label}</small></span>
}

